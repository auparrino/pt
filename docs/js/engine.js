/*
 * Rumo C1 — el motor del juego: corrección de las respuestas, repetición
 * espaciada (FSRS), xp, meta diaria, racha y escudos, cofre, medallas y
 * guardado.  Sin dependencias externas.
 *
 * Todo lo que se guarda en el teléfono lleva el prefijo «rumoc1.»: la app de
 * italiano (La Via C1) vive en el mismo origen de GitHub Pages
 * (auparrino.github.io/It y /pt) y sus claves no se tocan.
 */
(function (root) {
  "use strict";

  /* ------------------------------------------------------------ corrección */

  // En portugués las tildes cuentan (avó ≠ avô, é ≠ e, está ≠ esta) y la
  // cedilla también (caça ≠ caca): se conservan.  Lo que es solo costumbre
  // de tipeo (mayúsculas, puntuación, espacios, comillas, el espacio
  // alrededor del guion de «chama-se») se normaliza.
  function normalise(s) {
    return String(s == null ? "" : s)
      .normalize("NFC")
      .toLowerCase()
      .replace(/[’‘`´]/g, "'")
      .replace(/[“”«»]/g, '"')
      .replace(/([a-zà-ÿ])\s*[-‐‑]\s*([a-zà-ÿ])/g, "$1-$2")
      .replace(/\s+/g, " ")
      .replace(/^[\s.,;:!?]+|[\s.,;:!?]+$/g, "")
      .trim();
  }

  function deaccent(s) {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  // The diacritics of a string, each as «letter position + mark» (the
  // hyphen counts as a space, so «chama se» lines up with «chama-se»).
  function marks(s) {
    var out = [], d = String(s).replace(/-/g, " ").normalize("NFD"), k = 0;
    for (var i = 0; i < d.length; i++) {
      if (/[\u0300-\u036f]/.test(d[i])) out.push((k - 1) + d[i]); else k++;
    }
    return out;
  }

  // Distance capped at 2 — enough to forgive a slip, not enough to accept a
  // different verb form.
  function editDistance(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 99;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur[0] = i;
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
      prev = cur.slice();
    }
    return prev[b.length];
  }

  /* Los veredictos son fichas internas que comparten todos los módulos
     (diagnosi.js, frasi.js, letture.js, las clases CSS .feedback.giusto…):
     se dejaron con los nombres de la app hermana para no romper ese
     protocolo.  RIGHT = correcto, CLOSE = casi, WRONG = incorrecto. */
  var VERDICT = { RIGHT: "giusto", CLOSE: "quasi", WRONG: "sbagliato" };

  function grade(given, item) {
    var g = normalise(given);
    if (!g) return VERDICT.WRONG;

    var accepted = (item.accept && item.accept.length ? item.accept : [item.answer])
      .map(normalise)
      .filter(Boolean);

    // Some answers are a list of equally valid words ("grandes, bons").
    var expanded = accepted.slice();
    accepted.forEach(function (a) {
      // Only a list of single words is a list of alternatives; a sentence
      // with commas is one answer and its pieces are not right on their own.
      if (a.indexOf(",") >= 0 && a.split(",").every(function (p) { return p.trim().split(/\s+/).length <= 2; })) {
        a.split(",").forEach(function (p) {
          p = normalise(p);
          if (p) expanded.push(p);
        });
      }
      if (a.indexOf("|") >= 0) {
        // Multi-gap items: the learner may type the gaps separated by | or space.
        expanded.push(a.replace(/\s*\|\s*/g, " "));
      }
    });

    if (expanded.indexOf(g) >= 0) return VERDICT.RIGHT;

    // Right word, missing accent or cedilla (voce for você, cabeca for
    // cabeça): worth partial credit and an explicit correction, never a
    // silent pass.  The hyphen of the enclitic (chama se for chama-se) too.
    // Only a missing mark earns it: an accent in the wrong place or of the
    // wrong kind is another word (avô for avó, é for ê), and the crase is
    // grammar, not spelling: «a» for «à» (or «as» for «às», «aquele» for
    // «àquele») is a rule error, never partial credit.
    var flat = function (x) { return deaccent(x).replace(/-/g, " "); };
    var other = false;
    for (var k = 0; k < expanded.length; k++) {
      if (deaccent(g) === deaccent(expanded[k]) || flat(g) === flat(expanded[k])) {
        var mg = marks(g), mw = marks(expanded[k]);
        if (mg.every(function (m) { return mw.indexOf(m) >= 0; }) &&
            mw.every(function (m) { return m.slice(-1) !== "\u0300" || mg.indexOf(m) >= 0; })) return VERDICT.CLOSE;
        other = true;
      }
    }
    if (other) return VERDICT.WRONG;

    // Typo tolerance scales with length.  On a single word a one-letter
    // difference is usually the grammatical ending the drill is testing
    // (fala vs falo), so short answers must match exactly.
    for (var i = 0; i < expanded.length; i++) {
      var want = expanded[i];
      var budget = want.length > 20 ? 2 : want.length > 8 ? 1 : 0;
      if (budget && editDistance(g, want) <= budget) return VERDICT.CLOSE;
    }
    return VERDICT.WRONG;
  }

  /* ------------------------------------------------- repetición espaciada */

  /* FSRS (Free Spaced Repetition Scheduler, Jarrett Ye / open-spaced-
     repetition, versión 5) con los parámetros por defecto, que en el
     benchmark público (519 M de repasos) predice mejor que SM-2 y que el HLR
     de Duolingo.  Cada ficha guarda: s (estabilidad en días: cuánto tarda la
     probabilidad de recordarla en bajar al 90 %), d (dificultad 1-10), due,
     last, reps (aciertos seguidos), lapses, ok, state.
     Nada se «retira»: después de unos aciertos la ficha pasa a
     «mantenimiento» (Rawson & Dunlosky 2022; Bahrick 1993) y vuelve a
     intervalos de meses, con un tope diario (drills.dueList). */
  var DAY = 86400000;
  var W = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192,
           1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621];
  var DECAY = -0.5, FACTOR = 19 / 81;
  var MAINT_S = 60;          // estabilidad (días) desde la que la ficha está en mantenimiento
  var RETENTIONS = [0.85, 0.9, 0.95];

  // Probability of recall after t days for a card of stability s.
  function retrievability(t, s) {
    if (!(s > 0)) return 0;
    return Math.pow(1 + FACTOR * Math.max(0, t) / s, DECAY);
  }
  // Days until recall drops to the desired retention r.
  function intervalFor(s, r) {
    return Math.max(1, Math.round(s / FACTOR * (Math.pow(r, 1 / DECAY) - 1)));
  }
  function clampD(d) { return Math.min(10, Math.max(1, d)); }
  function initS(g) { return W[g - 1]; }
  function initD(g) { return clampD(W[4] - Math.exp(W[5] * (g - 1)) + 1); }
  function nextD(d, g) {
    var d1 = d + (-W[6] * (g - 3)) * (10 - d) / 9;
    return clampD(W[7] * initD(4) + (1 - W[7]) * d1);
  }
  function recallS(d, s, r, g) {
    var hard = g === 2 ? W[15] : 1, easy = g === 4 ? W[16] : 1;
    return s * (Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hard * easy + 1);
  }
  function forgetS(d, s, r) {
    return Math.min(s, W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r)));
  }
  function shortS(s, g) { return s * Math.exp(W[17] * (g - 3 + W[18])); }

  /* The rating (1 Again, 2 Hard, 3 Good, 4 Easy) from what the app knows:
     the verdict, whether a hint was needed, the second easier pass, the
     learner's confidence (Butterfield & Metcalfe: «Seguro» and wrong is the
     error that gets corrected best; «Adivino» and right is not knowledge:
     Memory 2019).  A slip (an accent, a typo) is knowledge with a finger
     error: it keeps moving forward. */
  function ratingFor(q, o) {
    o = o || {};
    if (q === 0) return 1;
    if (q === 1) return o.kind === "slip" ? 3 : 2;
    if (o.retry || o.hint || o.conf === "adivino") return 2;
    if (o.light || (o.conf === "seguro" && o.fast)) return 4;
    return 3;
  }

  // Vocabulary forgets at another pace than grammar: two speeds are fitted.
  function cardKind(id) {
    id = String(id || "");
    return id.indexOf("v:") === 0 || id.indexOf("b:voc:") === 0 || id.indexOf("frase:") === 0 || id.indexOf("ponte:") === 0 ? "v" : "g";
  }

  /* A card from the SM-2 days (ease, interval) gets a stability and a
     difficulty so nothing is lost on the way. */
  function upgradeCard(card) {
    if (!card) return null;
    if (card.s != null && card.d != null) return card;
    var ivl = +card.interval || 0, ease = +card.ease || 2.5;
    card.s = Math.max(0.5, ivl || (card.reps ? 1 : 0.5));
    card.d = clampD(5 + (2.5 - ease) * 4);
    card.lapses = card.lapses || 0;
    card.state = ivl >= 45 || ((card.ok || 0) >= 3 && ease >= 2.5) ? "maint" : card.reps ? "rev" : "learn";
    return card;
  }

  // 7 am of the next morning (or of today, before 7).
  function nextMorning(now) {
    var d = new Date(now);
    if (d.getHours() >= 7) d.setDate(d.getDate() + 1);
    d.setHours(7, 0, 0, 0);
    return d.getTime();
  }

  /* schedule(card, quality, opts): quality 0 incorrecto, 1 casi, 2 correcto.
     opts: kind (slip/vocab/rule), light (right at first sight in the
     training), retry, hint, conf ("seguro"/"creo"/"adivino"), fast,
     rating (1-4, overrides), now, id, state (for the review log, the
     retention target and the fitted speeds), notte (false to switch off
     the night → morning schedule). */
  function schedule(card, quality, opts) {
    opts = opts || {};
    var now = opts.now || Date.now();
    var st = opts.state || null;
    var r = opts.rating || ratingFor(quality, opts);
    var kind = cardKind(opts.id);
    var speed = (st && st.speed && st.speed[kind] && st.speed[kind].k) || 1;
    var retention = opts.retention || (st && st.retention) || 0.9;
    var isNew = !card;
    card = upgradeCard(card);
    var elapsed = card && card.last ? Math.max(0, (now - card.last) / DAY) : 0;
    var sameDay = !!(card && card.last && daysBetween(dayKey(new Date(card.last)), dayKey(new Date(now))) === 0);
    var sBefore = card ? card.s : 0;
    if (!card) {
      card = { s: initS(r), d: initD(r), reps: 0, lapses: 0, seen: 0, ok: 0, state: "learn" };
    } else if (sameDay) {
      card.s = shortS(card.s, r);
      card.d = nextD(card.d, r);
    } else {
      var R = retrievability(elapsed, card.s * speed);
      card.s = r === 1 ? forgetS(card.d, card.s, R) : recallS(card.d, card.s, R, r);
      card.d = nextD(card.d, r);
    }
    if (r === 1) {
      card.reps = 0; card.ok = 0; card.lapses = (card.lapses || 0) + 1;
      card.state = "learn";
    } else {
      card.reps = (card.reps || 0) + 1;
      if (r >= 3) card.ok = (card.ok || 0) + 1;
      if (card.state === "learn" && card.s >= 3) card.state = "rev";
    }
    if (card.s * speed >= MAINT_S) card.state = "maint";
    var ivl = intervalFor(card.s * speed, retention);
    if (r === 1) ivl = 1;                        // an error comes back tomorrow
    card.interval = ivl;
    card.due = now + ivl * DAY;
    delete card.night; delete card.hyper;
    var hour = new Date(now).getHours();
    var hyper = r === 1 && opts.conf === "seguro";
    // Learn at night, review in the morning, with sleep in between (Mazza
    // et al. 2016): what is new after 8 pm is asked again at breakfast.
    if (opts.notte !== false && hour >= 20 && (isNew || hyper)) {
      card.due = nextMorning(now); card.night = dayKey(new Date(card.due));
    } else if (hyper) {
      // Hypercorrection: the confident error is retested the next morning.
      card.due = Math.min(card.due, nextMorning(now)); card.hyper = 1;
    }
    delete card.light; delete card.ease;
    card.last = now;
    card.seen = (card.seen || 0) + 1;
    if (st && opts.id) logReview(st, opts.id, now, r, elapsed, sBefore, kind);
    return card;
  }

  function isDue(card, now) {
    return !card || !card.due || card.due <= (now || Date.now());
  }
  // In maintenance: known.  It still comes back, months apart, capped a day.
  function retired(card) {
    return !!card && (card.state === "maint" || (card.s == null && ((card.interval || 0) >= 45 || ((card.ok || 0) >= 3 && (card.ease || 0) >= 2.5))));
  }

  /* ------------------------------------------------ registro de repasos */

  /* Every review is logged (id, minute, rating, days elapsed, stability
     before, kind): with it the app fits, on the phone, how fast this
     learner forgets vocabulary and grammar (a «speed» that scales the
     default stabilities), and shows the calibration. */
  var LOG_MAX = 2500;
  function logReview(state, id, now, r, elapsed, sBefore, kind) {
    if (!state.log) state.log = [];
    state.log.push([String(id), Math.round(now / 60000), r, Math.round(elapsed * 10) / 10, Math.round(sBefore * 10) / 10, kind]);
    if (state.log.length > LOG_MAX) state.log = state.log.slice(-LOG_MAX);
  }

  // Log-loss of the predicted recall against what happened, for one speed.
  function logLoss(rows, k) {
    var loss = 0;
    rows.forEach(function (x) {
      var p = Math.min(0.9999, Math.max(0.0001, retrievability(x[3], x[4] * k)));
      loss += x[2] > 1 ? -Math.log(p) : -Math.log(1 - p);
    });
    return loss / rows.length;
  }
  /* fitSpeed: grid search of the speed factor per kind over the log.
     Under 100 reviews of a kind the default (1) stays: Anki found that
     fitting on too little makes things worse. */
  function fitSpeed(state) {
    var out = {};
    ["v", "g"].forEach(function (kind) {
      var rows = (state.log || []).filter(function (x) { return x[5] === kind && x[3] >= 0.5 && x[4] > 0; });
      if (rows.length < 100) { out[kind] = { k: 1, n: rows.length }; return; }
      var best = 1, bestLoss = Infinity;
      for (var k = 0.5; k <= 2.001; k += 0.1) {
        var l = logLoss(rows, k);
        if (l < bestLoss - 1e-9) { bestLoss = l; best = Math.round(k * 10) / 10; }
      }
      out[kind] = { k: best, n: rows.length, loss: Math.round(bestLoss * 1000) / 1000 };
    });
    out.at = Date.now();
    state.speed = out;
    return out;
  }
  // Refit every 200 reviews.
  function maybeFit(state) {
    var n = (state.log || []).length;
    if (n < 100 || (state.speed && state.speed.n && n - state.speed.n < 200)) return null;
    var f = fitSpeed(state);
    f.n = n;
    return f;
  }

  /* What the memory looks like today: how many cards learning, in review,
     in maintenance, and the average chance of recalling them right now. */
  function memoryStats(state, now) {
    now = now || Date.now();
    var out = { learn: 0, rev: 0, maint: 0, n: 0, recall: 0 };
    var sum = 0;
    Object.keys(state.cards || {}).forEach(function (id) {
      var c = upgradeCard(state.cards[id]);
      if (!c) return;
      out.n++;
      out[c.state || "learn"] = (out[c.state || "learn"] || 0) + 1;
      sum += retrievability(Math.max(0, (now - (c.last || now)) / DAY), c.s);
    });
    out.recall = out.n ? Math.round(sum / out.n * 100) : 0;
    return out;
  }

  /* ----------------------------------------------------- calibración */

  // conf: "seguro" | "creo" | "adivino"; right: boolean.
  function noteConfidence(state, conf, right, now) {
    if (!conf) return;
    var k = dayKey(now);
    if (!state.conf) state.conf = {};
    var d = state.conf[k] || (state.conf[k] = {});
    var c = d[conf] || (d[conf] = [0, 0]);
    c[0]++;
    if (!right) c[1]++;
    Object.keys(state.conf).forEach(function (kk) { if (daysBetween(kk, k) > 28) delete state.conf[kk]; });
  }
  // Over-confidence: the share of «Seguro» answers that were wrong, this
  // week and the one before.
  function calibration(state, now) {
    var k = dayKey(now), cur = { n: 0, wrong: 0, guessRight: 0, guesses: 0 }, prev = { n: 0, wrong: 0 };
    Object.keys(state.conf || {}).forEach(function (kk) {
      var age = daysBetween(kk, k), d = state.conf[kk];
      var s = d.seguro || [0, 0], a = d.adivino || [0, 0];
      if (age < 7) { cur.n += s[0]; cur.wrong += s[1]; cur.guesses += a[0]; cur.guessRight += a[0] - a[1]; }
      else if (age < 14) { prev.n += s[0]; prev.wrong += s[1]; }
    });
    return { n: cur.n, over: cur.n ? Math.round(cur.wrong / cur.n * 100) : null,
             overPrev: prev.n ? Math.round(prev.wrong / prev.n * 100) : null,
             guesses: cur.guesses, guessRight: cur.guessRight };
  }

  /* ------------------------------------------------- hábito y metas */

  /* Sessions a day (frequency predicts gains better than minutes: Sudina &
     Plonsky 2024) and the weekly streak: weeks in a row with at least
     three active days, sturdier and less anxious than the daily one. */
  function noteSession(state, now) {
    var k = dayKey(now);
    if (!state.sessions) state.sessions = {};
    state.sessions[k] = (state.sessions[k] || 0) + 1;
    Object.keys(state.sessions).forEach(function (kk) { if (daysBetween(kk, k) > 70) delete state.sessions[kk]; });
    return state.sessions[k];
  }
  function sessionsToday(state, now) { return (state.sessions || {})[dayKey(now)] || 0; }
  // Monday of the week that holds d.
  function weekStart(d) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
    var wd = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - wd);
    return x;
  }
  function weekKey(d) { return dayKey(weekStart(d || new Date())); }
  function activeDaysIn(state, start) {
    var n = 0;
    for (var i = 0; i < 7; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i, 12);
      if ((state.days || {})[dayKey(d)] > 0) n++;
    }
    return n;
  }
  function weekStreak(state, now) {
    var d = weekStart(now || new Date()), streak = 0;
    // the current week counts once it has three days; otherwise start from last week
    if (activeDaysIn(state, d) >= 3) streak++;
    for (var w = 1; w < 60; w++) {
      var prev = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7 * w, 12);
      if (activeDaysIn(state, prev) >= 3) streak++; else break;
    }
    return streak;
  }
  // Days since the last session; a pause is three days or more.
  function daysAway(state, now) {
    if (!state.lastPlayed) return 0;
    return Math.max(0, daysBetween(state.lastPlayed, dayKey(now)));
  }
  // New words (first review of a vocabulary card) in the last 7 days, from the log.
  function newWordsThisWeek(state, now) {
    var t = Math.round((now || Date.now()) / 60000) - 7 * 1440, n = 0;
    (state.log || []).forEach(function (x) { if (x[5] === "v" && x[4] === 0 && x[1] >= t) n++; });
    return n;
  }
  /* Sub-goals (Bandura & Schunk 1981): the distal goal is the next boss;
     the weekly share of words and course weeks follows from what is left,
     and shrinks by itself when the learner falls behind. */
  function subGoals(state, now) {
    var wk = state.unlocked || 1;
    var boss = wk <= 13 ? 13 : wk <= 26 ? 26 : wk <= 39 ? 39 : 52;
    var wordGoal = boss === 13 ? 800 : boss === 26 ? 1800 : boss === 39 ? 2800 : 3800;
    var nWords = Object.keys(state.cards || {}).filter(function (id) { return id.indexOf("v:") === 0 || id.indexOf("b:voc:") === 0; }).length;
    var weeksLeft = Math.max(1, boss - wk + 1);
    var perWeek = Math.max(10, Math.ceil(Math.max(0, wordGoal - nWords) / weeksLeft));
    return { boss: boss, level: boss === 13 ? "A2" : boss === 26 ? "B1" : boss === 39 ? "B2" : "C1", wordGoal: wordGoal, nWords: nWords,
             weeksLeft: weeksLeft, wordsPerWeek: perWeek, wordsThisWeek: newWordsThisWeek(state, now) };
  }
  /* Personal records (beat yourself, not a leaderboard: Hanus & Fox 2015). */
  function noteRecord(state, key, value) {
    if (!state.records) state.records = {};
    var prev = state.records[key] || 0;
    if (value > prev) { state.records[key] = value; return prev > 0; }
    return false;
  }
  // The fresh-start moments (Dai, Milkman & Riis 2014): a Monday, the 1st.
  function freshStart(now) {
    var d = now || new Date();
    if (d.getDate() === 1) return "mes";
    if (d.getDay() === 1) return "semana";
    return null;
  }

  /* --------------------------------------------- la regla como ficha */

  /* A grammar rule is consolidated after productive practice on three
     different days (Serfaty & Serrano 2024; Suzuki 2019): each week keeps
     the days on which its own exercises were written right. */
  function noteProduction(state, week, now) {
    if (!week) return;
    var ws = state.weekStats[week] || (state.weekStats[week] = { attempts: 0, right: 0, bossPassed: false });
    var k = dayKey(now);
    if (!ws.prodDays) ws.prodDays = [];
    if (ws.prodDays.indexOf(k) < 0) { ws.prodDays.push(k); ws.prodDays = ws.prodDays.slice(-6); }
  }
  function consolidated(ws) { return !!(ws && ws.prodDays && ws.prodDays.length >= 3); }

  /* Fin de semana liviano (la guía): la meta baja a la mitad el sábado y el
     domingo, para no cortar la racha ni pedir las tres horas. */
  function goalFor(state, now) {
    var d = now || new Date(), goal = state.goal || 200;
    var wd = d.getDay();
    return wd === 0 || wd === 6 ? Math.max(50, Math.round(goal / 2 / 50) * 50) : goal;
  }

  /* Las cuatro destrezas de Nation: input, output, forma y fluidez, xp por
     día, para mostrar el equilibrio de la semana. */
  var STRANDS = ["input", "output", "forma", "fluidez"];
  function addStrand(state, strand, n, now) {
    if (!n || STRANDS.indexOf(strand) < 0) return;
    var k = dayKey(now);
    if (!state.strands) state.strands = {};
    var d = state.strands[k] || (state.strands[k] = {});
    d[strand] = (d[strand] || 0) + n;
    // Only the last 14 days are kept.
    Object.keys(state.strands).forEach(function (kk) { if (daysBetween(kk, k) > 14) delete state.strands[kk]; });
    if (STRANDS.every(function (x) { return d[x] > 0; })) state.balancedDay = true;
  }
  function strandsLast(state, days, now) {
    var out = { input: 0, output: 0, forma: 0, fluidez: 0 }, k = dayKey(now);
    Object.keys(state.strands || {}).forEach(function (kk) {
      if (daysBetween(kk, k) < (days || 7)) STRANDS.forEach(function (x) { out[x] += (state.strands[kk][x] || 0); });
    });
    return out;
  }

  /* --------------------------------------------------------------- progreso */

  // Level curve: each level costs a bit more than the last.
  function levelFor(xp) {
    var lvl = 1, need = 100, total = 0;
    while (xp >= total + need) {
      total += need;
      lvl += 1;
      need = Math.round(need * 1.15);
    }
    return { level: lvl, into: xp - total, need: need };
  }

  var XP = { right: 10, close: 4, bonusCombo: 2, boss: 150, challenge: 6,
           lesson: 15 };

  function xpFor(verdict, combo) {
    if (verdict === VERDICT.RIGHT) {
      return XP.right + Math.min(combo, 10) * XP.bonusCombo;
    }
    if (verdict === VERDICT.CLOSE) return XP.close;
    return 0;
  }

  /* --------------------------------------------------------------- guardado */

  var KEY = "rumoc1.save.v1";

  function blankSave() {
    return {
      xp: 0,
      coins: 0,
      week: 1,
      unlocked: 1,
      streak: 0,
      lastPlayed: null,
      cards: {},          // itemId -> ficha SRS
      read: {},           // semana -> momento en que se leyó la lección
      lessonScore: {},    // semana -> mejor % en los chequeos de la lección jugada
      weekStats: {},      // semana -> { attempts, right, bossPassed }
      challengeLog: {},   // challengeId -> autoevaluación
      badges: [],
      totals: { attempts: 0, right: 0, close: 0, wrong: 0 },
      days: {},           // "aaaa-m-d" -> xp ganada ese día
      goal: 200,          // meta de xp por día (~4 cafezinhos)
      syllabusV: 1,       // versión del orden de las semanas (ver migrateSyllabus)
      shields: 1,         // escudos que salvan la racha si faltás un día
      chest: null,        // día en que abriste el cofre
      best: {},           // récords: relâmpago, combo
      silent: false,      // modo oficina: nada suena solo
      theme: "",          // "" como el teléfono, "light" u "dark"
      written: 0,         // frases escritas de memoria sin errores
      letture: {},        // lectura -> { pct, at } de las lecturas hechas
      errs: {},           // categoría de error -> { n, fixed, last }
      errLog: [],         // últimos errores: { cat, g, e, at }
      srsV: 2,            // versión del programador (2 = FSRS)
      retention: 0.9,     // retención deseada (0.85 / 0.9 / 0.95)
      notte: true,        // lo nuevo de noche se repasa a la mañana
      log: [],            // registro de repasos: [id, minuto, nota, días, s, tipo]
      speed: {},          // velocidades de olvido estimadas: { v: {k, n}, g: {k, n} }
      conf: {},           // "aaaa-m-d" -> { seguro: [n, errores], creo: [..], adivino: [..] }
      sessions: {},       // "aaaa-m-d" -> sesiones jugadas ese día
      plan: null,         // intención de implementación: { when, where, at }
      ideal: null,        // el «yo ideal»: { why, text, at }
      goals: null,        // submetas semanales: { words, rules, weeks, start }
      reflect: {},        // cierre semanal: "aaaa-m-d" (lunes) -> { hard, change, when }
      records: {},        // récords personales por métrica
      pauses: [],         // pausas de 3+ días: { from, to, why }
      keywords: {}        // palabra -> imagen mnemónica escrita por el alumno
    };
  }

  /* A save can come back damaged (an old version, a half-written copy, a
     hand-edited backup).  Every field is checked against the blank save:
     wrong types go back to their default, numbers are clamped, broken
     entries dropped.  What is valid is kept. */
  function isObj(v) { return !!v && typeof v === "object" && !Array.isArray(v); }
  function num(v, def, min, max) {
    v = +v;
    if (!isFinite(v)) return def;
    if (min !== undefined && v < min) v = min;
    if (max !== undefined && v > max) v = max;
    return v;
  }

  function sanitize(s) {
    var base = blankSave();
    if (!isObj(s)) return base;
    Object.keys(base).forEach(function (k) {
      var b = base[k], v = s[k];
      if (v === undefined) { s[k] = b; return; }
      if (typeof b === "number") s[k] = num(v, b);
      else if (typeof b === "boolean") s[k] = !!v;
      else if (Array.isArray(b)) { if (!Array.isArray(v)) s[k] = b; }
      else if (isObj(b) || (b && typeof b === "object")) { if (!isObj(v)) s[k] = b; }
      else if (b === null) { if (v !== null && typeof v !== "string") s[k] = null; }
    });
    s.xp = num(s.xp, 0, 0);
    s.coins = num(s.coins, 0, 0);
    s.unlocked = Math.round(num(s.unlocked, 1, 1, 52));
    s.week = Math.round(num(s.week, 1, 1, 52));
    s.streak = Math.round(num(s.streak, 0, 0));
    s.shields = Math.round(num(s.shields, 1, 0, 3));
    s.spoken = num(s.spoken, 0, 0);
    s.written = num(s.written, 0, 0);
    if ([100, 200, 350, 500].indexOf(s.goal) < 0) s.goal = 200;
    ["attempts", "right", "close", "wrong"].forEach(function (k) {
      s.totals[k] = num(s.totals[k], 0, 0);
    });
    s.badges = s.badges.filter(function (b) { return typeof b === "string"; });
    Object.keys(s.cards).forEach(function (id) {
      var c = s.cards[id];
      if (!isObj(c)) { delete s.cards[id]; return; }
      if (c.ease != null) c.ease = num(c.ease, 2.5, 1.3, 2.8);
      c.interval = num(c.interval, 0, 0);
      c.reps = num(c.reps, 0, 0);
      c.due = num(c.due, 0, 0);
      if (c.s != null) { c.s = num(c.s, 1, 0.1, 36500); c.d = num(c.d, 5, 1, 10); }
      if (c.state && ["learn", "rev", "maint"].indexOf(c.state) < 0) delete c.state;
    });
    if (RETENTIONS.indexOf(s.retention) < 0) s.retention = 0.9;
    s.log = s.log.filter(Array.isArray).slice(-LOG_MAX);
    Object.keys(s.conf).forEach(function (k) { if (!isObj(s.conf[k])) delete s.conf[k]; });
    Object.keys(s.sessions).forEach(function (k) { s.sessions[k] = num(s.sessions[k], 0, 0); });
    Object.keys(s.keywords).forEach(function (k) { if (typeof s.keywords[k] !== "string") delete s.keywords[k]; });
    s.pauses = s.pauses.filter(isObj).slice(-30);
    Object.keys(s.days).forEach(function (k) {
      if (!isFinite(+s.days[k])) delete s.days[k]; else s.days[k] = +s.days[k];
    });
    Object.keys(s.errs).forEach(function (k) {
      var e = s.errs[k];
      if (!isObj(e) || !isFinite(+e.n)) { delete s.errs[k]; return; }
      e.n = num(e.n, 0, 0); e.fixed = num(e.fixed, 0, 0); e.last = num(e.last, 0, 0);
    });
    s.errLog = s.errLog.filter(isObj).slice(0, 60);
    Object.keys(s.weekStats).forEach(function (k) {
      var w = s.weekStats[k];
      if (!isObj(w)) { delete s.weekStats[k]; return; }
      w.attempts = num(w.attempts, 0, 0); w.right = num(w.right, 0, 0);
    });
    Object.keys(s.letture).forEach(function (k) {
      if (!isObj(s.letture[k])) delete s.letture[k];
      else s.letture[k].pct = num(s.letture[k].pct, 0, 0, 100);
    });
    return s;
  }

  /* El temario de Rumo C1 nace en su versión 1 (tools/curriculo.py).  Si
     algún día se reordenan las semanas, la migración de las partidas viejas
     va acá, como en la app hermana: renumerar read, lessonScore y weekStats
     y abrir la primera semana del orden nuevo que no se hizo.  Por ahora
     solo marca la versión. */
  function migrateSyllabus(s) {
    if (isObj(s) && !s.syllabusV) s.syllabusV = 1;
    return s;
  }

  function load() {
    var raw = null;
    try {
      raw = root.localStorage && root.localStorage.getItem(KEY);
      if (!raw) return blankSave();
      var s = sanitize(migrateSyllabus(JSON.parse(raw)));
      // The SM-2 cards get a stability and a difficulty (nothing is lost).
      if (s.srsV !== 2) {
        Object.keys(s.cards).forEach(function (id) { upgradeCard(s.cards[id]); });
        s.srsV = 2;
      }
      return s;
    } catch (e) {
      // Unreadable: keep a copy aside before a new save overwrites it.
      try { if (raw) root.localStorage.setItem(KEY + ".damaged", raw); } catch (e2) { /* */ }
      return blankSave();
    }
  }

  function save(state) {
    try {
      root.localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }

  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function today() { return dayKey(); }

  // Whole calendar days between two day keys (b - a).
  function daysBetween(a, b) {
    function parse(k) {
      var p = k.split("-");
      return Date.UTC(+p[0], +p[1] - 1, +p[2]);
    }
    return Math.round((parse(b) - parse(a)) / DAY);
  }

  /* The streak counts consecutive calendar days, not sessions.  A shield
     covers each missed day, so one bad day at work doesn't wipe a month. */
  function touchStreak(state, now) {
    var t = dayKey(now);
    if (state.lastPlayed === t) return state.streak;
    var gap = state.lastPlayed ? daysBetween(state.lastPlayed, t) : 99;
    // The phone's clock went back (manual change, travel): keep the streak.
    if (gap < 0) return state.streak;
    var missed = gap - 1;
    if (gap === 1) state.streak += 1;
    else if (missed > 0 && missed <= (state.shields || 0) && state.streak > 0) {
      state.shields -= missed;
      state.shieldUsed = t;
      state.streak += 1;
    } else state.streak = 1;
    // Every 7 days of streak earns a shield (max 3 in the pocket).
    if (state.streak % 7 === 0) state.shields = Math.min(3, (state.shields || 0) + 1);
    state.lastPlayed = t;
    return state.streak;
  }

  // XP earned today, and whether today's goal has just been reached.
  function addXp(state, n, now) {
    var k = dayKey(now);
    if (!state.days) state.days = {};
    var before = state.days[k] || 0;
    state.days[k] = before + n;
    state.xp += n;
    var goal = goalFor(state, now);
    return before < goal && state.days[k] >= goal;
  }

  function todayXp(state, now) {
    return (state.days || {})[dayKey(now)] || 0;
  }

  // The last n days as [{key, xp}] from oldest to today.
  function lastDays(state, n, now) {
    var out = [], base = now || new Date();
    for (var i = n - 1; i >= 0; i--) {
      // Calendar arithmetic, not 24 h steps: DST days have 23 or 25 hours.
      var k = dayKey(new Date(base.getFullYear(), base.getMonth(), base.getDate() - i, 12));
      out.push({ key: k, xp: (state.days || {})[k] || 0 });
    }
    return out;
  }

  /* El cofre: una vez por día, cumplida la meta, un premio sorpresa.  La
     variedad es lo que hace volver. */
  function openChest(state, rnd, now) {
    var k = dayKey(now);
    if (state.chest === k) return null;
    if (todayXp(state, now) < goalFor(state, now)) return null;
    state.chest = k;
    var r = (rnd || Math.random)();
    var prize;
    if (r < 0.15 && (state.shields || 0) < 3) {
      state.shields = (state.shields || 0) + 1;
      prize = { kind: "shield", label: "🛡️ ¡Un escudo de racha!" };
    } else if (r < 0.35) {
      prize = { kind: "xp", xp: 50, label: "💎 ¡Premio gordo: +50 xp!" };
    } else if (r < 0.6) {
      state.boost = (state.boost || 0) + 1;
      prize = { kind: "boost", label: "🎟️ ¡Doble xp en tu próxima ronda!" };
    } else {
      var n = 10 + Math.floor((rnd || Math.random)() * 4) * 5;
      prize = { kind: "xp", xp: n, label: "✨ +" + n + " xp" };
    }
    if (prize.xp) state.xp += prize.xp;
    state.coins = (state.coins || 0) + 1;
    return prize;
  }

  /* Los rangos: un título por etapa, del turista que baja en el Galeão al
     carioca da gema (el nacido y criado en Río).  Calibrados sobre una
     carrera entera: quien juega todo el curso llega al nivel 40
     (tools/sim_carriera.js); Carioca da gema es el final del curso. */
  var RANKS = [
    [1, "Turista"], [3, "Gringo"], [6, "Visitante"],
    [10, "Morador"], [14, "Local"], [18, "Bom de papo"],
    [23, "Sambista"], [28, "Poeta"], [34, "Carioca"], [40, "Carioca da gema"]
  ];
  function rankFor(level) {
    var r = RANKS[0][1];
    RANKS.forEach(function (x) { if (level >= x[0]) r = x[1]; });
    return r;
  }

  /* ----------------------------------------------------------------- badge */

  // The last episode of «Martín no Rio» (letture.js), ep13 if it is not loaded.
  function lastMartin() {
    var L = root.Letture, eps = L && L.ofSeries ? L.ofSeries("martin") : [];
    return eps.length ? eps[eps.length - 1].id : "ep13";
  }

  /* Las medallas: nombres en portugués, descripción en castellano.  Los id
     son los de la app hermana (quedan en las partidas guardadas). */
  var BADGES = [
    { id: "primo-passo", name: "Primeiro passo", desc: "Contestá tu primera pregunta.",
      test: function (s) { return s.totals.attempts >= 1; } },
    { id: "centurione", name: "Cem na mosca", desc: "100 respuestas correctas.",
      test: function (s) { return s.totals.right >= 100; } },
    { id: "mille", name: "Mil e uma", desc: "1000 respuestas correctas.",
      test: function (s) { return s.totals.right >= 1000; } },
    { id: "settimana", name: "Sete dias", desc: "Racha de 7 días.",
      test: function (s) { return s.streak >= 7; } },
    { id: "mese", name: "Trinta dias", desc: "Racha de 30 días.",
      test: function (s) { return s.streak >= 30; } },
    { id: "a2", name: "Nível A2", desc: "Vencé al jefe de la semana 13.",
      test: function (s) { return !!(s.weekStats[13] || {}).bossPassed; } },
    { id: "b1", name: "Nível B1", desc: "Vencé al jefe de la semana 26.",
      test: function (s) { return !!(s.weekStats[26] || {}).bossPassed; } },
    { id: "b2", name: "Nível B2", desc: "Vencé al jefe de la semana 39.",
      test: function (s) { return !!(s.weekStats[39] || {}).bossPassed; } },
    { id: "c1", name: "Nível C1", desc: "Superá el examen final.",
      test: function (s) { return !!(s.weekStats[52] || {}).bossPassed; } },
    { id: "congiuntivo", name: "Mestre do subjuntivo",
      desc: "Vencé al jefe de la semana 39 sin perder vidas.",
      test: function (s) { return (s.weekStats[39] || {}).perfect === true; } },
    { id: "sfidante", name: "Desafiante", desc: "50 desafíos resueltos.",
      test: function (s) { return Object.keys(s.challengeLog).length >= 50; } },
    { id: "studioso", name: "Estudioso", desc: "Leé la teoría de 10 semanas.",
      test: function (s) { return Object.keys(s.read || {}).length >= 10; } },
    { id: "erudito", name: "Erudito", desc: "Leé la teoría de las 52 semanas.",
      test: function (s) { return Object.keys(s.read || {}).length >= 52; } },
    { id: "penna", name: "Primeira frase", desc: "Escribí de memoria tu primera frase.",
      test: function (s) { return (s.written || 0) >= 1; } },
    { id: "scrittore", name: "Escritor", desc: "100 frases escritas de memoria.",
      test: function (s) { return (s.written || 0) >= 100; } },
    { id: "fulmine", name: "Raio", desc: "20 aciertos en un Relâmpago de 60 segundos.",
      test: function (s) { return ((s.best || {}).lampo || 0) >= 20; } },
    { id: "frasario", name: "Conversador", desc: "100 frases de conversación aprendidas.",
      test: function (s) {
        return Object.keys(s.cards).filter(function (k) {
          return k.indexOf("frase:") === 0;
        }).length >= 100;
      } },
    { id: "lettore", name: "Leitor", desc: "Terminá 5 lecturas.",
      test: function (s) { return Object.keys(s.letture || {}).length >= 5; } },
    { id: "bologna", name: "Aplauso no Arpoador", desc: "Terminá la historia de Martín no Rio.",
      test: function (s) { return !!(s.letture || {})[lastMartin()]; } },
    { id: "umanista", name: "Humanista", desc: "Leé las 10 lecturas de cultura.",
      test: function (s) {
        return Object.keys(s.letture || {}).filter(function (k) {
          return k.indexOf("c-") === 0;
        }).length >= 10;
      } },
    { id: "ponte", name: "Ponte Rio–Niterói", desc: "50 cognados pasados al portugués.",
      test: function (s) {
        return Object.keys(s.cards).filter(function (k) {
          return k.indexOf("ponte:") === 0;
        }).length >= 50;
      } },
    { id: "perfetta", name: "Semana perfeita", desc: "Completá todas las misiones de una semana.",
      test: function (s) { return Object.keys(s.perfectWeeks || {}).length >= 1; } },
    { id: "dieci-perfette", name: "Dez perfeitas", desc: "Diez semanas con todas las misiones.",
      test: function (s) { return Object.keys(s.perfectWeeks || {}).length >= 10; } },
    { id: "equilibrio", name: "Quatro cordas", desc: "Un día con las cuatro destrezas (como las cuatro cuerdas del cavaquinho): input, output, forma y fluidez.",
      test: function (s) { return !!s.balancedDay; } },
    { id: "cinquecento", name: "Quinhentas palavras", desc: "500 palabras practicadas.",
      test: function (s) {
        return Object.keys(s.cards).filter(function (k) { return k.indexOf("v:") === 0 || k.indexOf("b:voc:") === 0; }).length >= 500;
      } },
    { id: "giornaliera", name: "Desafiante do dia", desc: "Diez desafíos del día ganados.",
      test: function (s) { return (s.dailyWon || 0) >= 10; } },
    { id: "costante", name: "Constante", desc: "Cumplí la meta diaria 5 días.",
      test: function (s) {
        var g = s.goal || 200;
        return Object.keys(s.days || {}).filter(function (k) {
          return s.days[k] >= g;
        }).length >= 5;
      } }
  ];

  function checkBadges(state) {
    var won = [];
    BADGES.forEach(function (b) {
      if (state.badges.indexOf(b.id) < 0 && b.test(state)) {
        state.badges.push(b.id);
        won.push(b);
      }
    });
    return won;
  }

  var api = {
    VERDICT: VERDICT,
    XP: XP,
    BADGES: BADGES,
    normalise: normalise,
    deaccent: deaccent,
    editDistance: editDistance,
    grade: grade,
    schedule: schedule,
    isDue: isDue,
    retired: retired,
    ratingFor: ratingFor,
    cardKind: cardKind,
    upgradeCard: upgradeCard,
    retrievability: retrievability,
    intervalFor: intervalFor,
    nextMorning: nextMorning,
    fitSpeed: fitSpeed,
    maybeFit: maybeFit,
    memoryStats: memoryStats,
    noteConfidence: noteConfidence,
    calibration: calibration,
    noteProduction: noteProduction,
    consolidated: consolidated,
    noteSession: noteSession,
    sessionsToday: sessionsToday,
    weekKey: weekKey,
    weekStreak: weekStreak,
    daysAway: daysAway,
    newWordsThisWeek: newWordsThisWeek,
    subGoals: subGoals,
    noteRecord: noteRecord,
    freshStart: freshStart,
    RETENTIONS: RETENTIONS,
    MAINT_S: MAINT_S,
    goalFor: goalFor,
    STRANDS: STRANDS,
    addStrand: addStrand,
    strandsLast: strandsLast,
    levelFor: levelFor,
    xpFor: xpFor,
    blankSave: blankSave,
    load: load,
    sanitize: sanitize,
    migrateSyllabus: migrateSyllabus,
    save: save,
    touchStreak: touchStreak,
    dayKey: dayKey,
    daysBetween: daysBetween,
    addXp: addXp,
    todayXp: todayXp,
    lastDays: lastDays,
    openChest: openChest,
    rankFor: rankFor,
    RANKS: RANKS,
    checkBadges: checkBadges,
    STORAGE_KEY: KEY
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Engine = api;
})(typeof window !== "undefined" ? window : globalThis);
