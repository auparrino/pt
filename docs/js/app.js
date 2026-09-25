/*
 * Rumo C1 — la interfaz del juego (portugués de Brasil hasta C1 en un año,
 * para hispanohablantes rioplatenses).  Pantallas: Hoje, Treino, Ler,
 * Trilha, Eu, la semana (briefing), la teoría, la lección jugada, la ronda,
 * el Relâmpago, el resultado, Escreva, Fale, el dictogloss y el Exame C1.
 * Los nombres internos de pantallas y rondas («oggi», «gioco», «lampo»,
 * «pausa»…) son los de la app hermana (La Via C1): el esquema de datos y la
 * API entre módulos se mantienen; lo que se ve está en portugués y en
 * castellano rioplatense.
 */
(function () {
  "use strict";

  var course = null;
  var state = Engine.load();

  /* Tema: "" sigue al teléfono; "light" u "dark" lo fuerzan.  Se aplica antes
     de dibujar nada, así no hay parpadeo. */
  function themeNow() {
    return state.theme || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  function applyTheme() {
    document.documentElement.dataset.theme = state.theme || "";
    var dark = themeNow() === "dark";
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (m) {
      if (!m.dataset.auto) m.dataset.auto = m.content;
      m.content = state.theme ? (dark ? "#071a26" : "#9fdcea") : m.dataset.auto;
    });
  }
  applyTheme();
  var view = { screen: "oggi", week: 1, tab: "oggi" };
  var round = null;
  var lampo = null;
  var itemMap = {};
  var installPrompt = null;

  var $ = function (sel) { return document.querySelector(sel); };
  var app = function () { return $("#app"); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function toast(msg, ms) {
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, ms || 2200);
  }

  var saveWarned = false;
  function persist() {
    if (!Engine.save(state) && !saveWarned) {
      saveWarned = true;
      toast("⚠️ No puedo guardar tu progreso: el teléfono no tiene espacio o bloquea el almacenamiento. " +
            "Liberá espacio o guardá una copia en Eu.", 6000);
    }
  }

  /* --------------------------------------------------- sonidos y vibración */

  var audioCtx = null;
  function tone(freqs, dur, type) {
    if (state.silent) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = audioCtx || new AC();
      var t0 = audioCtx.currentTime;
      freqs.forEach(function (f, i) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = type || "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + i * dur);
        g.gain.exponentialRampToValueAtTime(0.12, t0 + i * dur + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + (i + 1) * dur);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t0 + i * dur); o.stop(t0 + (i + 1) * dur + 0.02);
      });
    } catch (e) { /* sin audio */ }
  }

  function buzz(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { /* */ }
  }

  var fx = {
    right: function () { tone([660, 880], 0.07); buzz(18); },
    close: function () { tone([520], 0.1); buzz(18); },
    wrong: function () { tone([200, 160], 0.1, "triangle"); buzz([50, 40, 50]); },
    goal: function () { tone([523, 659, 784, 1046], 0.11); buzz([30, 30, 30, 30, 80]); },
    tap: function () { buzz(8); }
  };

  /* Confeti de la playa: papelitos con los colores de la paleta (el mar de
     Ipanema, el atardecer del Arpoador, el sol, la Mata Atlântica, la arena)
     y alguna palmera, coco o bandera. */
  function confetti() {
    var cs = getComputedStyle(document.documentElement);
    var col = ["--mar", "--coral", "--sol", "--mata", "--ceu", "--coral-claro", "--mar-claro"].map(function (v) {
      return (cs.getPropertyValue(v) || "").trim() || "#f2643d";
    }).concat(["#ffffff"]);
    var bits = ["🌴", "☀️", "🥥", "🇧🇷", "🌊"];
    var box = document.createElement("div");
    box.className = "confetti";
    for (var i = 0; i < 30; i++) {
      var s = document.createElement("span");
      if (i % 6 === 5) {
        s.textContent = bits[(i / 6 | 0) % bits.length];
        s.style.fontSize = 16 + Math.random() * 14 + "px";
      } else {
        s.className = "bit" + (i % 3 === 0 ? " round" : "");
        s.style.background = col[i % col.length];
        s.style.width = 6 + Math.random() * 6 + "px";
        s.style.height = 10 + Math.random() * 8 + "px";
      }
      s.style.left = Math.random() * 100 + "%";
      s.style.animationDelay = Math.random() * 0.5 + "s";
      s.style.animationDuration = 1.8 + Math.random() * 0.9 + "s";
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 2900);
  }

  /* -------------------------------------------------------- xp y meta */

  // «+10» rises from the answer towards the daily ring.
  function xpFly(n) {
    var ring = document.querySelector(".ring");
    var fb = $("#fb");
    var y = fb && fb.getBoundingClientRect().top ? Math.min(window.innerHeight * 0.55, fb.getBoundingClientRect().top) : window.innerHeight * 0.4;
    var el = document.createElement("div");
    el.className = "xpfloat";
    el.textContent = "+" + n;
    el.style.left = (window.innerWidth / 2 - 20) + "px";
    el.style.top = y + "px";
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); if (ring) ring.classList.add("bump"); }, 900);
  }

  function dias(n) { return n + (n === 1 ? " día" : " días"); }

  function gain(n) {
    if (!n) return;
    var lvBefore = Engine.levelFor(state.xp).level;
    var hit = Engine.addXp(state, n);
    var lvAfter = Engine.levelFor(state.xp).level;
    if (lvAfter > lvBefore) {
      var rkB = Engine.rankFor(lvBefore), rkA = Engine.rankFor(lvAfter);
      setTimeout(function () {
        fx.goal();
        toast(rkA !== rkB ? "🎖️ ¡Nuevo rango: " + rkA + "! (nivel " + lvAfter + ")"
                          : "⬆️ ¡Nivel " + lvAfter + "!", 2600);
      }, hit ? 3400 : 300);
    }
    Engine.touchStreak(state);
    if (hit) {
      setTimeout(function () {
        fx.goal();
        confetti();
        toast("🎯 ¡Meta del día cumplida! Abrí tu cofre en Hoje.", 3200);
      }, 350);
    }
  }

  /* ------------------------------------------------------------- pronunciación */

  var voice = null, voices = [];
  // force: the learner tapped 🔊 explicitly, so play even in office mode
  // (they may have earphones on).  opts: { pitch, vi (which Portuguese voice),
  // onboundary, onend, onstart, keep (do not cancel what is playing) }.
  function speak(text, force, rate, opts) {
    if (!window.speechSynthesis) return null;
    if (state.silent && !force) return null;
    opts = opts || {};
    var u = new SpeechSynthesisUtterance(String(text).replace(/_+/g, " "));
    u.lang = "pt-BR";
    var v = opts.vi != null && voices.length ? voices[opts.vi % voices.length] : voice;
    if (v) u.voice = v;
    u.rate = rate || 0.95;
    if (opts.pitch) u.pitch = opts.pitch;
    if (opts.onboundary) u.onboundary = opts.onboundary;
    if (opts.onend) u.onend = opts.onend;
    if (opts.onstart) u.onstart = opts.onstart;
    if (!opts.keep) window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return u;
  }
  var realAudio = null;
  // An item of the listening module carries its own voice (variability).
  function speakItem(it, force, rate) {
    var v = it.voice || {};
    var tts = function () { return speak(it.say || it.stem, force, rate || v.rate, { pitch: v.pitch, vi: v.vi }); };
    // A sentence of Common Voice: the recording itself; the phone's voice
    // only when it cannot play (offline the first time, an old browser).
    if (it.audio && typeof Audio === "function") {
      if (state.silent && !force) return null;
      if (window.speechSynthesis) speechSynthesis.cancel();
      try {
        if (realAudio) realAudio.pause();
        var a = realAudio = new Audio(it.audio), fell = false;
        var fall = function () { if (!fell) { fell = true; tts(); } };
        if (rate && rate < 0.9) a.playbackRate = 0.75;
        a.onerror = fall;
        var pr = a.play();
        if (pr && pr.catch) pr.catch(fall);
        var c = $("#vcredit"); if (c) c.textContent = "🎙️ Voz real · " + (window.VociCV ? VociCV.LICENSE : "Common Voice");
      } catch (e) { tts(); }
      return null;
    }
    // A pair of Sons: a real speaker of Lingua Libre when there is one (the
    // Portuguese spelling writes the accents, so avó / avô can be told apart
    // by the file name; Voci.usable decides).
    if (window.Voci && it.type === "coppia" && Voci.usable(it.say)) {
      if (state.silent && !force) return null;
      if (window.speechSynthesis) speechSynthesis.cancel();
      Voci.play(it.say, { rate: rate && rate < 0.9 ? 0.75 : 1, onplay: function (who) {
        var c = $("#vcredit"); if (c) c.textContent = "🎙️ Voz real: " + who;
      } }, tts);
      return null;
    }
    return tts();
  }
  /* What is read aloud after an answer.  Only Portuguese: a Spanish gloss
     or option (¡Ojalá!, botas de montaña) is never read with the Brazilian
     voice.  Spanish: ñ, ¿, ¡, ll, -ción, or more Spanish-only words (function
     words, or glosses of the glossary that are not Portuguese forms) than
     Portuguese-only ones; words of both (a, de, casa, para) do not count.
     Portuguese: ã, õ, ç, ê, ô, â, nh, lh, -ção.  An unknown word with y,
     a final d or z, or -ción is Spanish. */
  var ES_WORDS = { el: 1, los: 1, las: 1, y: 1, es: 1, muy: 1, pero: 1, yo: 1, hay: 1, cuando: 1, donde: 1,
                   en: 1, usted: 1, ustedes: 1, bien: 1, "también": 1, tambien: 1, ella: 1, ellos: 1, ellas: 1,
                   nosotros: 1, ni: 1, con: 1, un: 1, una: 1, del: 1, al: 1, lo: 1, hoy: 1, "mañana": 1, tengo: 1,
                   estoy: 1, soy: 1, hacer: 1, hace: 1, puede: 1, quiero: 1, gracias: 1, hola: 1, "sí": 1, "qué": 1,
                   "cómo": 1, "dónde": 1, "está": 0, mi: 1, su: 1, sus: 1, mucho: 1, mucha: 1, nuevo: 1, bueno: 1,
                   buena: 1, noche: 1, "día": 1, "después": 1, ahora: 1, "aquí": 1, entonces: 1, siempre: 1,
                   "todavía": 1, porque: 0, "él": 1, eso: 1, esto: 1, "más": 1, tiene: 1, tienen: 1 };
  var PT_WORDS = {};
  ("eu você vocês ele ela nós eles elas não é são está estão sou estou tem têm tenho um uma uns umas o os " +
   "do da dos das no na nas ao à aos às pelo pela pelos pelas num numa com em e mas muito muita muitos muitas " +
   "mais também já aqui isso isto hoje bem obrigado obrigada sim onde então agora depois ainda sempre tudo " +
   "dele dela meu minha seu sua nosso nossa você cadê pra tá né gente coisa").split(" ").forEach(function (w) { PT_WORDS[w] = 1; });
  var BOTH = {};         // a, de, casa, para: say nothing about the language
  ("a de se me te que por para como nada algo todo casa hora vida gente mesa foto tu la la o sin " +
   "porque quando nunca mas este esta estas estes esse essa isso idea ideia").split(" ").forEach(function (w) { BOTH[w] = 1; });
  var esGloss = null;
  function spanishText(text) {
    text = String(text || "");
    if (/[ñ¿¡]|ción\b|\bll/i.test(text)) return true;
    if (/[ãõçêôâ]|ção|ções|nh|lh/i.test(text)) return false;
    if (!esGloss && glossario) {
      esGloss = {};
      Object.keys(glossario).forEach(function (k) {
        String(glossario[k][1] || "").toLowerCase().split(/[^a-zñáéíóúü]+/).forEach(function (w) { if (w) esGloss[w] = 1; });
      });
    }
    var es = 0, pt = 0;
    (text.toLowerCase().match(/[a-zà-ÿ]+/g) || []).forEach(function (w) {
      if (BOTH[w]) return;
      var isPt = PT_WORDS[w] || (glossario && glossario[w]), isEs = ES_WORDS[w] || (esGloss && esGloss[w]);
      if (ES_WORDS[w] || (isEs && !isPt)) es++;
      else if (isPt && !isEs) pt++;
      else if (!isPt && !isEs && /y|[dz]$/.test(w)) es++;      // ciudad, feliz, muy: not Portuguese spelling
    });
    return es > pt;
  }
  // «¿Qué significa?», «¿Qué es «um cafezinho»?»: the options are Spanish.
  function asksMeaning(it) {
    return /¿\s*qu[ée] (significa|es|son|expresa|quiere decir)\b/i.test(it.prompt || "") &&
      !/(en|al) portugu[ée]s/i.test(it.prompt || "");
  }
  /* A gap exercise, answered: the whole sentence with the gaps filled
     («Eu gosto de estudar», not just «gosto»); in «A → ___» only what is
     after the arrow.  The Spanish hints in brackets are left out. */
  function filledStem(it) {
    var stem = String(it.stem || "");
    if (!/_{3,}/.test(stem)) return null;
    if (stem.indexOf("→") >= 0) stem = stem.slice(stem.lastIndexOf("→") + 1);
    var answers = String(it.answer || "").split(/\s*\|\s*/).map(function (a) {
      return /^\(.*\)$/.test(a.trim()) ? "" : a.trim();          // «(sin artículo)»: nothing goes there
    });
    var k = 0;
    // a hyphen answer (-se, -lo) joins the word before it: chama-se
    var out = stem.replace(/\([^)]*\)/g, " ").replace(/_{3,}/g, function () {
      var a = answers[k++] || "";
      return /^-/.test(a) ? "\u0000" + a : a;
    });
    return out.replace(/\s*\u0000/g, "").replace(/\s+([,.;:!?])/g, "$1").replace(/\s+/g, " ").trim();
  }
  /* The Brazilian voices first (pt-BR), then any other Portuguese one
     (pt-PT, pt): a European voice is better than a Spanish one. */
  function pickVoice() {
    if (!window.speechSynthesis) return;
    var vs = window.speechSynthesis.getVoices();
    var br = function (v) { return /^pt[-_]br/i.test(v.lang) ? 0 : 1; };
    voices = vs.filter(function (v) { return /^pt/i.test(v.lang); })
      .sort(function (a, b) { return br(a) - br(b) || (b.localService ? 1 : 0) - (a.localService ? 1 : 0); });
    voice = voices[0] || null;
  }
  if (window.speechSynthesis) {
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
  }

  function drillOpts() {
    return { silent: state.silent, map: itemMap };
  }

  /* --------------------------------------------------------------- header */

  function renderHeader() {
    var lv = Engine.levelFor(state.xp);
    var todayXp = Engine.todayXp(state);
    var goal = Engine.goalFor(state);
    var pct = Math.min(100, Math.round(todayXp / goal * 100));
    $("#hdr").innerHTML =
      '<div class="bar">' +
        // El logo es una placa de calle de Río (azul esmaltada, letras
        // blancas): «Rumo» es el rumbo.
        '<button class="brand placa" id="home" title="' + esc(Engine.rankFor(lv.level)) +
          '"><span class="p-sup">nível ' + lv.level + '</span><span class="p-rua">Rumo C1</span></button>' +
        '<div class="stats">' +
          '<div class="stat' + (state.streak > 0 ? " hot" : "") + '"><b>' + state.streak + "<i>🔥</i></b><span>racha</span></div>" +
          '<div class="stat"><b>' + (state.shields || 0) + '🛡️</b><span>escudos</span></div>' +
          '<div class="ring" style="--p:' + pct + '" title="meta diaria">' +
            '<b>' + (pct >= 100 ? "✓" : todayXp) + '</b></div>' +
          (state.streak >= 7 ? '<div class="stat boost" title="racha de 7: xp ×1,2"><b>×1,2</b><span>xp</span></div>' : "") +
          (state.boost > 0 ? '<div class="stat boost" title="doble xp en la próxima ronda"><b>🎟️' + state.boost + '</b><span>doble</span></div>' : "") +
          '<button class="mode" id="mode" title="modo oficina">' +
            (state.silent ? "🤫" : "🔊") + '</button>' +
          '<button class="mode" id="theme" title="tema claro u oscuro">' +
            (themeNow() === "dark" ? "🌙" : "☀️") + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="xpbar"><i style="width:' +
        Math.round(lv.into / lv.need * 100) + '%"></i></div>';
    $("#home").onclick = function () { go("oggi"); };
    $("#theme").onclick = function () {
      state.theme = themeNow() === "dark" ? "light" : "dark";
      persist();
      applyTheme();
      renderHeader();
      if (view.screen === "io") render();
    };
    $("#mode").onclick = function () {
      state.silent = !state.silent;
      persist();
      renderHeader();
      toast(state.silent
        ? "🤫 Modo oficina: nada suena solo. Todo con el pulgar."
        : "🔊 Modo normal: las frases se leen en voz alta.", 2800);
      if (view.screen !== "gioco") render();
    };
  }

  /* Un aliento en portugués cuando falta poco: se muestra junto al contador. */
  function dai(i, n) {
    var t = n < 3 ? "" : i === n - 1 ? "Última!" : i >= Math.ceil(n * 0.75) ? "Quase lá!"
          : n >= 6 && i === Math.floor(n / 2) ? "Metade!" : "";
    return t ? '<span class="dai">' + t + "</span>" : "";
  }

  function stopLampo() {
    if (lampo && !lampo.done) { lampo.done = true; clearInterval(lampo.timer); }
  }

  function go(tab) {
    stopLampo();
    if (karaoke) { stopKaraoke(); document.body.classList.remove("kar-partial", "kar-audio"); }
    view.tab = view.screen = tab;
    render();
    window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------------ hoje */

  function renderOggi() {
    var goal = Engine.goalFor(state);
    var todayXp = Engine.todayXp(state);
    var reached = todayXp >= goal;
    var chestOpen = state.chest === Engine.dayKey();
    var due = Drills.dueCount(course, state, itemMap);
    var dueToday = Math.min(due, 20);
    var weekend = Engine.goalFor(state) < (state.goal || 200);
    var strands = Engine.strandsLast(state, 7);
    var dailyDone = state.dailyDone === Engine.dayKey();
    var w = course.weeks[Math.min(state.unlocked, 52) - 1];
    var f = Frasi.ofTheDay(new Date(), Math.min(state.unlocked || 1, 52));
    var known = Frasi.ALL.filter(function (x) { return state.cards[x.id]; }).length;
    var hour = new Date().getHours();
    var hello = hour < 12 ? "Bom dia! ☀️" : hour < 18 ? "Boa tarde! 🌴" : "Boa noite! 🌙";

    var plan = weekPlan(w), doneN = plan.filter(function (x) { return x.done; }).length;
    var nm = nextMission(w);
    // Words: the course brings 9-15 a week; the bank (Palavras) adds 12 a session.
    var nWords = Object.keys(state.cards).filter(function (id) {
      return id.indexOf("v:") === 0 || id.indexOf("b:voc:") === 0;
    }).length;
    var wordGoal = state.unlocked <= 13 ? 800 : state.unlocked <= 26 ? 1800 : state.unlocked <= 39 ? 2800 : 3800;
    var html = '<h1 class="hello">' + hello + '</h1>' +
      '<p class="lead">' + (weekend
        ? "Fin de semana: meta a la mitad (" + goal + " xp). Algo liviano alcanza: una lectura, una pausa." +
          (state.streak > 1 ? " Llevás <b>" + dias(state.streak) + "</b>." : "")
        : state.streak > 1
        ? "Llevás <b>" + dias(state.streak) + "</b> seguidos" + (state.streak >= 7 ? " y tu xp vale ×1,2" : "") + ". No cortes la racha."
        : !lessonRead(1) ? "Empezás de cero. Tu camino es la trilha: un paso por vez."
        : "Tu próximo paso está marcado. Si tenés tres minutos, un cafezinho.") + "</p>";

    var pend = loadPending();
    if (pend) {
      html += '<div class="card weekcard first"><span class="muted">⏸️ Dejaste algo a medias</span>' +
        "<b>" + esc(pendingTitle(pend)) + "</b>" +
        '<span class="row" style="margin-top:10px"><button class="btn" id="resume">Seguir donde estaba</button>' +
        '<button class="tab" id="discard">Descartar</button></span></div>';
    }

    html += oggiHabitCards();

    // La trilha antes que nada: la semana en curso y la próxima misión.
    html += '<div class="card weekcard first hero">' +
      '<span class="muted">🗺️ A trilha · semana ' + w.week + " · " + esc(w.level) + " · " + doneN + " / " + plan.length + " misiones</span>" +
      "<b>" + esc(w.title) + "</b>" +
      '<span class="prog"><i style="width:' + Math.round(doneN / Math.max(1, plan.length) * 100) + '%"></i></span>' +
      (nm
        ? '<span class="muted">Siguiente: <b>' + nm.ico + " " + nm.title + "</b></span>" +
          '<span class="row" style="margin-top:10px"><button class="btn" id="heronext">▶︎ ' + esc(nm.title) + "</button>" +
          '<button class="tab" data-week="' + w.week + '">Ver la semana</button></span>'
        : '<span class="muted">Semana completa. ' + (state.unlocked > w.week ? "Seguí con la siguiente." : "Repasá o entrená para abrir la siguiente.") + "</span>" +
          '<span class="row" style="margin-top:10px"><button class="btn" data-week="' + w.week + '">Ver la semana</button>' +
          '<button class="tab" id="topercorso">A trilha</button></span>') +
      "</div>";

    // Meta del día + cofre
    html += '<div class="card goal">' +
      '<div class="goalrow"><div><b>Meta de hoy</b>' +
        '<span class="muted"> ' + (reached ? "✓ " + todayXp + " xp hoy" : todayXp + " / " + goal + " xp") +
        "</span></div>" +
        (reached && !chestOpen
          ? '<button class="btn gold pulse" id="chest">🎁 Abrir cofre</button>'
          : chestOpen ? '<span class="muted">🎁 cofre abierto · volvé mañana</span>'
          : '<span class="muted">🎁 al llegar a la meta</span>') +
      "</div>" +
      '<div class="goalbar"><i style="width:' +
        Math.min(100, Math.round(todayXp / goal * 100)) + '%"></i></div>' +
      "</div>";

    // Atajos: el cafezinho (mezcla la semana en curso), la revisão, el relâmpago.
    html += '<div class="big">' +
      '<button class="bigbtn pausa" id="pausa"><span class="e">☕</span>' +
        "<b>Cafezinho</b><small>pausa de 3 minutos con lo de tu semana</small></button>" +
      '<button class="bigbtn giorno" id="giorno"' + (dailyDone ? " disabled" : "") + '>' +
        '<span class="e">🎯</span><b>Desafio do dia</b><small>' +
        (dailyDone ? "✓ hecha · mañana hay otra" : "6 preguntas · doble xp") + "</small></button>" +
      '<button class="bigbtn ripasso" id="rev"' + (due ? "" : " disabled") + '>' +
        '<span class="e">🔁</span><b>Revisão</b><small>' +
        (due ? "hoy: " + dueToday + (due > 20 ? " (quedan " + due + ")" : " para repasar") : "nada pendiente") + "</small></button>" +
      (state.unlocked >= 2 && Banca.loaded() ? '<button class="bigbtn parole" data-bank="b-voc"><span class="e">📚</span><b>Palavras</b><small>' +
        nWords.toLocaleString("es-AR") + " / " + wordGoal.toLocaleString("es-AR") + " palabras" +
        (window.Freq && Freq.loaded() ? " · " + Freq.coverage(knownWords()).fundamental[0] + " de las 2.000 frecuentes" : "") + "</small></button>" : "") +
      (matureWords().length >= 30 ? '<button class="bigbtn lampo" id="lampoparole"><span class="e">🧠</span>' +
        "<b>Palavra ou não?</b><small>reconocer en un segundo · récord: " + ((state.best || {}).lampoParole || 0) + "</small></button>" : "") +
      (known >= 12 ? '<button class="bigbtn lampo" id="lampo"><span class="e">⚡</span>' +
        "<b>Relâmpago 60″</b><small>récord: " + ((state.best || {}).lampo || 0) + "</small></button>" : "") +
      "</div>" +
      (known < 12 ? '<p class="muted" style="margin:-6px 0 12px">⚡ El Relâmpago 60″ se abre con 12 frases vistas (llevás ' + known + ").</p>" : "");

    // Las cuatro cuerdas de la semana (Nation; las cuatro del cavaquinho): dónde falta, un consejo.
    var tot = strands.input + strands.output + strands.forma + strands.fluidez;
    if (tot > 0) {
      var NAMES = { input: "Input", output: "Output", forma: "Forma", fluidez: "Fluidez" };
      var TIP = { input: "leé un episodio o escuchá una escena", output: "escribí frases de memoria o traducí",
                  forma: "una ronda de la semana", fluidez: "un Relâmpago o repasá una escena" };
      var low = Engine.STRANDS.slice().sort(function (a, b) { return strands[a] - strands[b]; })[0];
      html += '<div class="card"><b>🎻 Tus cuatro cuerdas · últimos 7 días</b>' +
        '<div class="strands">' + Engine.STRANDS.map(function (k) {
          return '<i class="s-' + k + '" style="width:' + Math.round(strands[k] / tot * 100) + '%" title="' + NAMES[k] + '"></i>';
        }).join("") + "</div>" +
        '<p class="muted">' + Engine.STRANDS.map(function (k) { return NAMES[k] + " " + Math.round(strands[k] / tot * 100) + " %"; }).join(" · ") +
        ". Te falta <b>" + NAMES[low].toLowerCase() + "</b>: " + TIP[low] + ".</p></div>";
    }

    // La clínica: los errores que se repiten
    var weakO = Banca.loaded() ? Banca.weakest(state, 2) : [];
    if (weakO.length) {
      html += '<button class="card weekcard clin" data-bank="clinica">' +
        '<span class="muted">🩺 Clínica de tus errores</span>' +
        "<b>Practicá " + weakO.map(function (w) { return esc((Diagnosi.LABEL[w.cat] || w.cat).toLowerCase()); }).join(" y ") + "</b>" +
        '<span class="muted">12 ejercicios armados con lo que más te cuesta.</span></button>';
    }

    // Frase do dia
    html += '<div class="card fdg"><span class="muted">Frase do dia</span>' +
      '<div class="fit">' + esc(f.pt || f.it) + "</div>" +
      '<div class="fes">' + esc(f.es) + "</div>" +
      (f.note ? '<div class="note">' + mk(f.note) + "</div>" : "") +
      '<button class="tab" id="sayfdg">🔊 escuchar</button></div>';

    // Calendario de los últimos 28 días
    var days = Engine.lastDays(state, 28);
    html += '<div class="card"><h3 style="margin-top:0">Tus últimas 4 semanas</h3>' +
      '<div class="heat">' + days.map(function (d) {
        var lvl = d.xp <= 0 ? 0 : d.xp < goal / 2 ? 1 : d.xp < goal ? 2 : 3;
        return '<i class="h' + lvl + '" title="' + d.key + ": " + d.xp + ' xp"></i>';
      }).join("") + "</div>" +
      '<p class="muted" style="margin:8px 0 0">Cada cuadrado es un día. Verde mata = meta cumplida. ' +
      "Cada 7 días de racha ganás un 🛡️ escudo que la salva si un día no podés.</p></div>";

    // Instalación
    if (!isStandalone()) {
      html += '<div class="card install"><b>📲 Instalala en tu celu</b>' +
        '<p class="muted">Funciona sin internet y tu progreso queda guardado en el teléfono.</p>' +
        (installPrompt
          ? '<button class="btn" id="install">Instalar app</button>'
          : '<p class="muted">iPhone: <b>Compartir → Agregar a inicio</b>. ' +
            "Android: menú ⋮ → <b>Instalar app</b>.</p>") +
        "</div>";
    }
    return html + versionLine();
  }

  /* ------------------------------------------------ hábito y metas */

  var WHY = [["viaje", "🧳 Viajar"], ["vivir", "🏠 Vivir en Brasil"], ["trabajo", "💼 Trabajo"],
             ["musica", "🎶 Samba, bossa nova, MPB"], ["pareja", "❤️ Pareja, amigos, familia"], ["estudio", "🎓 Estudiar allá"],
             ["celpe", "📜 El Celpe-Bras"]];
  var CHANGES = [["escucha", "más escucha"], ["escritura", "más escritura"], ["repaso", "más repaso"], ["cortas", "sesiones más cortas"], ["frases", "más frases"]];
  var WHENS = [["manana", "a la mañana"], ["mediodia", "al mediodía"], ["noche", "a la noche"]];

  /* The cards of habit and motivation on Hoje: the return after a pause
     (no debt, a five-minute restart: Lally 2010; Mazza 2016), the plan
     (implementation intention, Gollwitzer & Sheeran 2006, d = 0,65), the
     ideal self (Dörnyei), the weekly sub-goal (Bandura & Schunk 1981) and
     the weekly reflective close. */
  function oggiHabitCards() {
    var html = "", away = Engine.daysAway(state), fresh = Engine.freshStart();
    var sg = Engine.subGoals(state), ses = Engine.sessionsToday(state);
    var ideal = state.ideal && state.ideal.text ? state.ideal.text : "";
    if (away >= 3 && state.totals.attempts > 0) {
      html += '<div class="card weekcard first ritorno"><span class="muted">👋 Volviste después de ' + away + " días</span>" +
        "<b>Lo que aprendiste no se borró: re-aprender lleva una fracción del tiempo.</b>" +
        '<span class="muted">' + (fresh === "semana" ? "Y es lunes: buen día para retomar. " : fresh === "mes" ? "Y empieza el mes: buen momento para volver. " : "") +
          "Cinco minutos con lo que más se enfrió y seguimos" + (ideal ? " hacia lo tuyo: «" + esc(ideal) + "»" : "") + ".</span>" +
        '<span class="row" style="margin-top:10px"><button class="btn" id="ritorno">▶︎ 5 minutos para retomar</button></span>' +
        (state.pauseAsk !== Engine.dayKey() ? '<span class="muted small">¿Qué pasó? <button class="tab" data-why="tiempo">sin tiempo</button> ' +
          '<button class="tab" data-why="dificil">se puso difícil</button> <button class="tab" data-why="aburrido">me aburrí</button> ' +
          '<button class="tab" data-why="olvide">me olvidé</button></span>' : "") + "</div>";
    }
    if (!state.ideal && state.totals.attempts >= 10) {
      html += '<div class="card weekcard"><span class="muted">🎯 ¿Para qué querés portugués?</span>' +
        '<span class="chips">' + WHY.map(function (w) { return '<button class="tab" data-why2="' + w[0] + '">' + w[1] + "</button>"; }).join("") + "</span>" +
        '<span class="muted small">Tener la meta a la vista sostiene el esfuerzo (Dörnyei: el yo ideal). Después la escribís con tus palabras en Eu.</span></div>';
    }
    if (state.unlocked >= 2) {
      var left = Math.max(0, sg.wordsPerWeek - sg.wordsThisWeek);
      html += '<div class="card goalweek"><b>🪜 Esta semana</b> <span class="muted">· hacia el ' + esc(sg.level) + " en la semana " + sg.boss + "</span>" +
        '<div class="goalbar" style="margin:8px 0 4px"><i style="width:' + Math.min(100, Math.round(sg.wordsThisWeek / Math.max(1, sg.wordsPerWeek) * 100)) + '%"></i></div>' +
        '<p class="muted" style="margin:0">' + sg.wordsThisWeek + " / " + sg.wordsPerWeek + " palabras nuevas" +
          (left ? " · faltan " + left : " ✓") + " · " + sg.nWords.toLocaleString("es-AR") + " / " + sg.wordGoal.toLocaleString("es-AR") + " para el Chefão" +
          (sg.weeksLeft > 1 ? " en " + sg.weeksLeft + " semanas" : "") + ". La cuota se recalcula sola si te atrasás.</p></div>";
    }
    // weekly close: on the first visit of a new week, about the week before
    var wk = Engine.weekKey(), prevWk = Engine.weekKey(new Date(Date.now() - 7 * 86400000));
    if (state.totals.attempts >= 50 && !(state.reflect || {})[prevWk] && (state.reflect || {}).skip !== wk && Engine.weekStreak(state) + Engine.daysAway(state) > 0 && new Date().getDay() <= 2) {
      var errs = state.errs || {}, cats = Object.keys(errs).sort(function (a, b) { return errs[b].n - errs[a].n; }).slice(0, 3);
      html += '<div class="card weekcard reflect"><span class="muted">📓 Cierre de la semana pasada · tres toques</span>' +
        '<span class="muted small">¿Qué te costó más?</span><span class="chips">' +
          cats.map(function (c) { return '<button class="tab" data-rf="hard" data-v="' + esc(c) + '">' + esc(Diagnosi.LABEL[c] || c) + "</button>"; }).join("") +
          '<button class="tab" data-rf="hard" data-v="nada">nada en especial</button></span>' +
        '<span class="muted small">¿Qué cambiás esta semana?</span><span class="chips">' +
          CHANGES.map(function (c) { return '<button class="tab" data-rf="change" data-v="' + c[0] + '">' + c[1] + "</button>"; }).join("") + "</span>" +
        '<span class="muted small">¿Cuándo estudiás?</span><span class="chips">' +
          WHENS.map(function (c) { return '<button class="tab" data-rf="when" data-v="' + c[0] + '">' + c[1] + "</button>"; }).join("") + "</span>" +
        '<span class="row"><button class="btn" id="rfsave">Guardar</button><button class="tab" id="rfskip">Ahora no</button></span></div>';
    } else if ((state.reflect || {})[prevWk] && (state.reflect || {})[prevWk].change) {
      var rf = state.reflect[prevWk], ch = CHANGES.filter(function (c) { return c[0] === rf.change; })[0];
      var sw = Engine.strandsLast(state, 7);
      var done = rf.change === "escucha" ? sw.input : rf.change === "escritura" ? sw.output : rf.change === "frases" ? sw.fluidez : null;
      html += '<p class="muted small planline">📓 Dijiste: <b>' + esc(ch ? ch[1] : rf.change) + "</b>" +
        (done != null ? " · llevás " + done + " xp de eso esta semana" : "") + ".</p>";
    }
    return html;
  }

  /* A five-minute restart after a pause: the ten cards with the lowest
     chance of recall, no backlog shown, the rest redistributes itself. */
  function ritornoItems() {
    var items = Drills.buildReview(course, state, 10, drillOpts());
    if (items.length < 6) items = items.concat(Drills.buildRound(course, course.weeks[Math.min(state.unlocked, 52) - 1], { map: itemMap, state: state, silent: state.silent, size: 8 - items.length }));
    return items;
  }

  /* The shareable card: a PNG drawn on a canvas (week, xp, streak, words),
     handed to the share sheet (Web Share) or downloaded. */
  function shareCard() {
    var c = document.createElement("canvas"), W = 720, H = 400;
    c.width = W; c.height = H;
    var g = c.getContext("2d");
    // the sky over Ipanema, then the sea
    var grad = g.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, "#9fdcea"); grad.addColorStop(0.62, "#fdf1dc"); grad.addColorStop(1, "#f7c59f");
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    // the waves of the calçadão along the bottom
    g.fillStyle = "#13262f";
    for (var x = -40; x < W + 40; x += 80) {
      g.beginPath(); g.moveTo(x, H);
      g.bezierCurveTo(x + 20, H - 34, x + 40, H - 34, x + 40, H - 18);
      g.bezierCurveTo(x + 40, H - 2, x + 60, H - 2, x + 80, H - 30);
      g.lineTo(x + 80, H); g.closePath(); g.fill();
    }
    g.fillStyle = "#fffdf8"; g.fillRect(40, 36, W - 80, H - 110);
    g.strokeStyle = "#0b4f7a"; g.lineWidth = 6; g.strokeRect(40, 36, W - 80, H - 110);
    g.fillStyle = "#0b4f7a"; g.fillRect(40, 36, W - 80, 44);
    g.fillStyle = "#ffffff"; g.textAlign = "center";
    g.font = "bold 22px Georgia, serif"; g.fillText("RUMO C1 · SEMANA " + Math.min(state.unlocked, 52), W / 2, 66);
    g.fillStyle = "#13262f";
    g.font = "bold 56px Georgia, serif"; g.fillText(Engine.rankFor(Engine.levelFor(state.xp).level).toUpperCase(), W / 2, 150);
    var sg = Engine.subGoals(state), cov = window.Freq && Freq.loaded() ? Freq.coverage(knownWords()).fundamental[0] : null;
    g.font = "26px system-ui, sans-serif";
    g.fillText("🔥 " + state.streak + " días · " + Engine.weekStreak(state) + " semanas · nivel " + Engine.levelFor(state.xp).level, W / 2, 200);
    g.fillText(sg.nWords.toLocaleString("es-AR") + " palabras" + (cov != null ? " · " + cov + " de las 2.000 frecuentes" : ""), W / 2, 240);
    g.font = "20px system-ui, sans-serif"; g.fillStyle = "#5f6b6d";
    g.fillText("Esta semana: " + sg.wordsThisWeek + " palabras nuevas · " + Engine.strandsLast(state, 7).output + " xp de output", W / 2, 276);
    c.toBlob(function (blob) {
      var name = "rumo-c1-" + stamp() + ".png";
      try {
        var file = new File([blob], name, { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: "Mi semana de portugués" }).catch(function () { download(blob, name); }); return; }
      } catch (e) { /* sin share */ }
      download(blob, name);
    }, "image/png");
  }

  function wireHabit() {
    on("#ritorno", function () { state.pauseAsk = Engine.dayKey(); persist(); startRound("ritorno"); });
    document.querySelectorAll("[data-why]").forEach(function (b) {
      b.onclick = function () {
        if (!state.pauses) state.pauses = [];
        state.pauses.push({ days: Engine.daysAway(state), why: b.dataset.why, at: Date.now() });
        state.pauses = state.pauses.slice(-30);
        state.pauseAsk = Engine.dayKey();
        if (b.dataset.why === "dificil" && state.retention > 0.85) { state.retention = 0.85; toast("Anotado. Bajé la retención a 85 %: menos repasos por día.", 3500); }
        else if (b.dataset.why === "tiempo") toast("Anotado. Con tres sesiones de dos minutos ya cuenta: el atajo «Revisão 2 min» está en el ícono de la app.", 4000);
        else toast("Anotado. Gracias.");
        persist();
        render();
      };
    });
    document.querySelectorAll("[data-why2]").forEach(function (b) {
      b.onclick = function () {
        var w = WHY.filter(function (x) { return x[0] === b.dataset.why2; })[0];
        state.ideal = { why: b.dataset.why2, text: "", at: Date.now() };
        persist();
        toast("🎯 " + (w ? w[1] : "") + ". En Eu podés escribir tu meta con tus palabras.", 3500);
        render();
      };
    });
    var rf = {};
    document.querySelectorAll("[data-rf]").forEach(function (b) {
      b.onclick = function () {
        rf[b.dataset.rf] = b.dataset.v;
        document.querySelectorAll('[data-rf="' + b.dataset.rf + '"]').forEach(function (x) { x.classList.toggle("on", x === b); });
      };
    });
    on("#rfsave", function () {
      if (!state.reflect) state.reflect = {};
      state.reflect[Engine.weekKey(new Date(Date.now() - 7 * 86400000))] = { hard: rf.hard || "", change: rf.change || "", when: rf.when || "", at: Date.now() };
      persist();
      toast("📓 Guardado. La semana que viene te lo recuerdo.");
      render();
    });
    on("#rfskip", function () { if (!state.reflect) state.reflect = {}; state.reflect.skip = Engine.weekKey(); persist(); render(); });
  }

  /* The version, so a glance says whether the phone already loaded the
     latest one (it must match VERSION = "rumoc1-vN" in sw.js: test_game
     and the CI check it). */
  var APP_VERSION = "v1";
  function versionLine() {
    return '<p class="muted small version">Rumo C1 · versión ' + APP_VERSION + "</p>";
  }

  function isStandalone() {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true;
  }

  /* ----------------------------------------------------------------- treino */

  function bankBtn(id, emoji, name, desc, week) {
    var locked = (state.unlocked || 1) < week;
    return '<button class="lab" data-bank="' + id + '"' + (locked ? " disabled" : "") + '><span class="e">' + emoji + "</span><b>" + name + "</b>" +
      '<span class="muted">' + (locked ? "Se abre en la semana " + week + ", con la gramática que usa." : desc) + "</span></button>";
  }

  function renderFrasi() {
    var html = "<h1>Treino</h1>" +
      '<p class="lead">Bloques listos para hablar ya, sin armar gramática en la cabeza. ' +
      "Cada escena te presenta frases nuevas, te las hace armar con fichas y después " +
      "<b>escribirlas de memoria</b>. Cuanto más rápido te salen escritas, más rápido " +
      "te salen habladas.</p>";

    var pp = Lab.progress("ponte:", state.cards), pf = Lab.progress("falso:", state.cards),
        pc = Lab.progress("capire:", state.cards);
    html += "<h2>Laboratorio</h2>" +
      '<div class="labs">' +
        '<button class="lab" data-lab="ponte"><span class="e">🌉</span><b>Ponte</b>' +
          '<span class="muted">Del español al portugués con reglas: -ción → -ção, -dad → -dade, -ble → -vel…</span>' +
          '<span class="meta">' + pp.seen + "/" + pp.total + " palabras</span></button>" +
        '<button class="lab" data-lab="falsi"><span class="e">🪤</span><b>Falsos amigos</b>' +
          '<span class="muted">Las palabras que parecen y no son.</span>' +
          '<span class="meta">' + pf.seen + "/" + pf.total + "</span></button>" +
        '<button class="lab" data-lab="capire"><span class="e">🎯</span><b>Entender</b>' +
          '<span class="muted">Leer la gramática: quién, cuándo, cuántos, seguro o no.</span>' +
          '<span class="meta">' + pc.seen + "/" + pc.total + "</span></button>" +
        (window.Suoni && Suoni.data() ? '<button class="lab" data-lab="suoni"><span class="e">🎧</span><b>Sons</b>' +
          '<span class="muted">Vocales abiertas y cerradas, nasales, lh y nh, la r: ¿cuál escuchaste? Habla conectada, entonación y dictado.</span>' +
          '<span class="meta">' + Suoni.progress(state.unlocked, state.cards).seen + "/" + Suoni.progress(state.unlocked, state.cards).total + " pares</span></button>" : "") +
      "</div>" +
      '<p class="muted science">🔬 Ponte usa la transferencia desde tu lengua (Ringbom); ' +
      "Entender es input estructurado: primero interpretar la forma, después producirla (VanPatten).</p>";

    if (window.Duelli) {
      var wkD = Math.min(state.unlocked || 1, 52);
      html += "<h2>⚔️ Duelos</h2>" +
        '<p class="muted">Dos formas que se confunden, mezcladas: elegís una y después tocás la pista que te lo dijo.</p>' +
        '<div class="labs">' + Duelli.DUELLI.slice().sort(function (a, b) { return a.week - b.week; }).map(function (d) {
          var best = (state.duelli || {})[d.id];
          return '<button class="lab" data-duel="' + d.id + '"' + (d.week > wkD ? " disabled" : "") + '><span class="e">⚔️</span><b>' + esc(d.title) + "</b>" +
            '<span class="muted">' + esc(d.week > wkD ? "Se abre en la semana " + d.week + "." : d.sub) + "</span>" +
            (best ? '<span class="meta">mejor: ' + best.pct + " %</span>" : "") + "</button>";
        }).join("") + "</div>" +
        '<p class="muted science">🔬 Intercalar formas que se parecen (Brunmair y Richter 2019) y explicar por qué (Bisra et al. 2018).</p>';
    }

    if (Banca.loaded()) {
      var st = Banca.stats(), weak = Banca.weakest(state, 2);
      html += "<h2>Banco</h2>" +
        '<p class="muted">' + st.nouns + " sustantivos, " + st.verbs + " verbos, " + st.adjectives +
        " adjetivos, " + st.sentences + " oraciones y " + st.errors + " errores típicos. " +
        "Cuando te equivocás, la app te dice qué tipo de error es y te deja corregirlo.</p>" +
        '<div class="labs">' +
          (weak.length ? '<button class="lab clin" data-bank="clinica"><span class="e">🩺</span><b>Clínica de tus errores</b>' +
            '<span class="muted">Práctica armada con lo que más te cuesta: ' +
            weak.map(function (w) { return esc(Diagnosi.LABEL[w.cat] || w.cat); }).join(", ") + ".</span></button>" : "") +
          '<button class="lab" data-bank="b-voc"><span class="e">📚</span><b>Palavras</b>' +
            '<span class="muted">Vocabulario de tu nivel: primero reconocer, después escribir con el artículo.</span></button>' +
          bankBtn("b-tr", "✍️", "Traduza", "Oraciones del español al portugués, con corrección que te explica el error.", Banca.TR_WEEK) +
          bankBtn("b-gap", "🔧", "Conjugue no contexto", "El verbo justo dentro de una oración real.", Banca.GAP_WEEK) +
          '<button class="lab" data-bank="b-err"' + (state.unlocked < Banca.ERR_WEEK ? " disabled" : "") +
            '><span class="e">🔍</span><b>Ache o erro</b>' +
            '<span class="muted">' + (state.unlocked < Banca.ERR_WEEK
              ? "Se abre en la semana " + Banca.ERR_WEEK + ": primero tenés que poder leer la oración."
              : "Encontrá y corregí el error típico de un hispanohablante.") + "</span></button>" +
          bankBtn("b-forme", "🧩", "Formas", "Artículos, plurales, contracciones (no, na, do, pelo) y concordancia.", Banca.FORME_WEEK) +
        "</div>";
    }
    html += "<h2>Frases</h2>";
    html += '<div class="scenes">';
    Frasi.SCENES.forEach(function (s) {
      var p = Frasi.progress(s.id, state.cards);
      var pct = Math.round(p.seen / p.total * 100);
      html += '<button class="scene' + (p.seen === p.total ? " done" : "") +
        '" data-scene="' + s.id + '">' +
        '<span class="e">' + s.emoji + "</span>" +
        "<b>" + esc(s.name) + "</b>" +
        '<span class="muted">' + esc(s.blurb) + "</span>" +
        '<span class="meta">' + p.seen + "/" + p.total + " vistas · " +
          p.strong + " firmes</span>" +
        '<span class="prog"><i style="width:' + pct + '%"></i></span>' +
        "</button>";
    });
    return html + "</div>";
  }

  /* ----------------------------------------------------------------- ler */

  function renderLeggi() {
    var done = state.letture || {};
    var html = "<h1>Ler</h1>" +
      '<p class="lead">Leer mucho, entendiendo casi todo, es de lo que más hace crecer una lengua. ' +
      "Tocá las palabras subrayadas para ver qué significan.</p>";
    Letture.SERIES.forEach(function (sr) {
      html += "<h2>" + sr.emoji + " " + esc(sr.name) + "</h2>" +
        '<p class="muted">' + esc(sr.blurb) + '</p><div class="eps">';
      Letture.ofSeries(sr.id).forEach(function (ep) {
        var d = done[ep.id], open = Letture.isOpen(ep, done, state.unlocked);
        var wait = !open && ep.week > state.unlocked;
        html += '<button class="ep' + (d ? " done" : "") + '" data-ep="' + ep.id + '"' +
          (open ? "" : " disabled") + ">" +
          '<span class="e">' + (open ? ep.emoji : "🔒") + "</span>" +
          "<span><b>" + esc(ep.title) + "</b>" +
          '<span class="muted">' + (ep.area ? esc(ep.area) + " · " : ep.series === "settimana" ? "semana " + ep.week + " · " : "episodio " + ep.n + " · ") +
            esc(ep.level) + " · " + (wait ? "se abre en la semana " + ep.week : esc(ep.grammar)) +
            "</span></span>" +
          (d ? '<span class="score">' + d.pct + "%</span>" : "") +
          "</button>";
      });
      html += "</div>";
    });
    if ((state.storie || []).length) {
      html += "<h2>✨ Histórias da semana</h2><p class=\"muted\">Cuentos generados con las palabras de tu repaso.</p><div class=\"eps\">" +
        state.storie.map(function (x) {
          var d = done[x.id];
          return '<button class="ep' + (d ? " done" : "") + '" data-ep="' + esc(x.id) + '"><span class="e">✨</span><span><b>' + esc(x.title) +
            "</b><span class=\"muted\">semana " + x.week + " · " + esc(x.targets.join(", ")) + "</span></span>" + (d ? '<span class="score">' + d.pct + "%</span>" : "") + "</button>";
        }).join("") + "</div>";
    }
    var doneN = Object.keys(done).filter(function (id) { return Letture.byId(id); }).length;
    if (doneN) {
      html += '<div class="card"><b>🎧 Escuta tranquila</b><p class="muted">Re-escuchá las ' + doneN + " lecturas que ya hiciste, solo audio, una tras otra: " +
        "material conocido a velocidad normal es lo que hace crecer la fluidez del oído (Chang & Millett 2014). Esta semana: " + listeningWeek() + " min.</p>" +
        '<button class="btn" id="playlib">▶ Escuchar todas</button></div>';
    }
    html += '<p class="muted science">🔬 Input comprensible (Krashen) con glosario para cubrir ' +
      "el ~98% del vocabulario (Hu y Nation); después, la caza de formas te hace notar la " +
      "gramática dentro de un texto que ya entendiste (Schmidt).</p>";
    return html;
  }

  var glossIndex = [];

  // Text of an episode as tappable words.  mode "read": glossed words open
  // their meaning; mode "hunt": every word can be selected.
  function renderText(ep, mode, enh) {
    var k = 0;
    glossIndex = [];
    var forms = enh && ep.flood ? ep.flood.forms : null;
    var isForm = function (t) { return forms && (forms.indexOf(Letture.bare(t)) >= 0 || forms.indexOf(Letture.core(t)) >= 0); };
    // Multiple-choice glosses: these words are asked, not told, until answered.
    var mcDone = (state.mcGloss || {})[ep.id] || {}, mc = {};
    if (mode !== "hunt" && Letture.mcTargets) Letture.mcTargets(ep).forEach(function (i) { mc[i] = 1; });
    var toks0 = Letture.allTokens(ep);
    Object.keys(mc).forEach(function (i) { if (mcDone[Letture.core(toks0[i])]) delete mc[i]; });
    return '<div class="text' + (mode === "hunt" ? " hunt" : "") + (enh ? " enh" : "") + '">' +
      Letture.paragraphs(ep).map(function (par) {
        return "<p>" + Letture.tokens(par).map(function (t) {
          var i = k++;
          if (mode === "hunt") {
            return '<span class="w" data-tok="' + i + '">' + esc(t) + "</span>";
          }
          var g = Letture.glossFor(ep, t);
          if (g && mc[i]) {
            glossIndex[i] = Letture.bare(t) + " — " + g;
            return '<span class="w mcg' + (isForm(t) ? " form" : "") + '" data-k="' + i + '" data-mc="' + i + '">' + esc(t) + "</span>";
          }
          if (g) {
            glossIndex[i] = Letture.bare(t) + " — " + g;
            return '<span class="w gl' + (isForm(t) ? " form" : "") + '" data-k="' + i + '" data-gl="' + i + '">' + esc(t) + "</span>";
          }
          return '<span class="w' + (isForm(t) ? " form" : "") + '" data-k="' + i + '">' + esc(t) + "</span>";
        }).join(" ") + "</p>";
      }).join("") + "</div>";
  }

  function renderLettura(ep) {
    stopKaraoke();
    var rate = view.karRate || 1, enh = !!view.enh && !!ep.flood;
    return '<button class="btn ghost" id="lback">' + (view.epFrom === "briefing" ? "← a la semana" : "← a Ler") + "</button>" +
      "<h1>" + ep.emoji + " " + esc(ep.title) + "</h1>" +
      '<p class="lead">' + (ep.area ? esc(ep.area) + " · " : ep.series === "flood" ? "Enchente · " + esc(ep.grammar) + " · " :
        ep.series === "settimana" ? "A semana · " + esc(ep.grammar) + " · " : "Martín no Rio · episodio " + ep.n + " · ") +
        esc(ep.level) + "</p>" +
      (enh ? '<div class="note flood">🌊 Segunda lectura: <b>' + esc(ep.flood.es) + "</b> Mirá cada forma resaltada y preguntate por qué está así. " +
        '<button class="tab" id="enhoff">sin marcas</button></div>' : "") +
      '<div class="card">' + renderText(ep, "read", enh) +
        '<p class="muted small">Las palabras <span class="w mcg">así</span> te las pregunto: tocalas y elegí qué significan por el contexto. Las <span class="w gl">subrayadas</span> te las digo.</p>' +
        '<div class="karbar">' +
          '<button class="btn" id="karplay">🎧 Leia e ouça</button>' +
          '<span class="seg">' + [[0.8, "0,8×"], [1, "1×"], [1.15, "1,15×"]].map(function (r) {
            return '<button class="tab' + (rate === r[0] ? " on" : "") + '" data-rate="' + r[0] + '">' + r[1] + "</button>";
          }).join("") + "</span>" +
          '<span class="seg"><button class="tab on" data-karmode="full">texto</button>' +
            '<button class="tab" data-karmode="partial">solo claves</button>' +
            '<button class="tab" data-karmode="audio">solo audio</button></span>' +
        "</div>" +
        '<p class="muted small">Primera pasada con el texto a 0,8×, segunda a 1× solo con las palabras clave, tercera solo audio: la escucha ' +
        "cuenta como input y suma xp. Esta semana llevás " + listeningWeek() + " min de escucha.</p></div>" +
      (ep.flood && !enh ? '<button class="btn wide ghost" id="enh">🌊 Segunda lectura con la estructura resaltada</button>' : "") +
      '<button class="btn wide" id="lquiz">Lo leí → preguntas y caza de formas</button>';
  }

  /* Toque en la palabra: cualquier palabra portuguesa de un ejercicio muestra
     qué significa (data/glossario.json, armado por build_course.py).  Las que
     todavía no viste en el curso van subrayadas.  No en los ejercicios que
     preguntan justamente el significado, ni en los enunciados en castellano. */
  var glossario = null;
  var stemGloss = [];

  function glossable(it) {
    if (!glossario || !it || it.type === "translate" || it.type === "listen" ||
        it.type === "dictation" || it.src === "frasi") return false;
    return !/signific|traduc|qué quiere decir|qué expresa|cómo suena|se pronuncia/i.test(it.prompt || "");
  }

  function glossify(it, raw) {
    raw = String(raw || "");
    if (!glossable(it)) return esc(raw);
    var week = Math.min(state.unlocked || 1, 52);
    return raw.split(/([A-Za-zÀ-ÿ]+)/).map(function (t, k) {
      if (k % 2 === 0) return esc(t);
      var g = glossario[t.toLowerCase()];
      if (!g) return esc(t);
      stemGloss.push(g[0] + " — " + g[1]);
      return '<span class="w gl' + (g[2] > week ? " new" : "") + '" data-sg="' +
        (stemGloss.length - 1) + '">' + esc(t) + "</span>";
    }).join("");
  }

  // Portuguese text that is not a stem (the solution in the feedback): every
  // word tappable, the ones not yet seen underlined.
  function glossifyAny(raw) {
    raw = String(raw || "");
    if (!glossario) return esc(raw);
    var week = Math.min(state.unlocked || 1, 52);
    return raw.split(/([A-Za-zÀ-ÿ]+)/).map(function (t, k) {
      if (k % 2 === 0) return esc(t);
      var g = glossario[t.toLowerCase()];
      if (!g) return esc(t);
      stemGloss.push(g[0] + " — " + g[1]);
      return '<span class="w gl' + (g[2] > week ? " new" : "") + '" data-sg="' +
        (stemGloss.length - 1) + '">' + esc(t) + "</span>";
    }).join("");
  }

  /* A multiple-choice gloss: three meanings, the one that fits the context.
     The word then becomes an ordinary gloss, and goes to the review when the
     bank knows it (Yanagisawa, Webb & Uchihara 2020). */
  function askGloss(span) {
    var ep = Letture.byId(view.ep);
    if (!ep) return;
    var i = +span.dataset.mc, tok = Letture.allTokens(ep)[i];
    var o = Letture.mcOptions(ep, tok);
    var box = $("#mcbox");
    if (!box) { box = document.createElement("div"); box.id = "mcbox"; box.className = "mcbox"; document.body.appendChild(box); }
    box.innerHTML = '<p class="muted small">Por el contexto, ¿qué significa?</p><p class="it"><b>' + esc(Letture.bare(tok)) + "</b></p>" +
      '<div class="options">' + o.options.map(function (x, k) { return '<button class="opt" data-mco="' + k + '">' + esc(x) + "</button>"; }).join("") + "</div>" +
      '<button class="tab" id="mcclose">cerrar</button>';
    box.classList.add("on");
    on("#mcclose", function () { box.classList.remove("on"); });
    box.querySelectorAll("[data-mco]").forEach(function (b) {
      b.onclick = function () {
        var ok = o.options[+b.dataset.mco] === o.answer;
        box.querySelectorAll("[data-mco]").forEach(function (x) {
          x.disabled = true;
          if (o.options[+x.dataset.mco] === o.answer) x.classList.add("right"); else if (x === b) x.classList.add("wrong");
        });
        if (ok) fx.right(); else fx.wrong();
        if (!state.mcGloss) state.mcGloss = {};
        (state.mcGloss[ep.id] || (state.mcGloss[ep.id] = {}))[o.word] = ok ? 2 : 1;
        var g = glossario && glossario[o.word], lemma = g ? g[0] : o.word;
        if (window.Banca && Banca.loaded() && Banca.hasWord(lemma)) {
          var id = "b:voc:" + lemma;
          state.cards[id] = Engine.schedule(state.cards[id], ok ? 2 : 0, { id: id, state: state, kind: ok ? null : "vocab" });
        }
        gain(ok ? 3 : 1);
        persist();
        span.classList.remove("mcg"); span.classList.add("gl");
        span.removeAttribute("data-mc"); span.dataset.gl = i;
        span.onclick = function () { showGloss(glossIndex[i]); speak(Letture.bare(span.textContent), false); };
        setTimeout(function () { box.classList.remove("on"); }, ok ? 900 : 1800);
      };
    });
  }

  function showGloss(txt) {
    var box = $("#glossbox");
    if (!box) {
      box = document.createElement("div");
      box.id = "glossbox";
      box.className = "glossbox";
      document.body.appendChild(box);
    }
    box.textContent = txt;
    box.classList.add("on");
    clearTimeout(showGloss.t);
    showGloss.t = setTimeout(function () { box.classList.remove("on"); }, 3200);
  }

  /* -------------------------------------------------------------- trilha */

  function weekStat(n) {
    return state.weekStats[n] || { attempts: 0, right: 0, bossPassed: false };
  }

  function renderPercorso() {
    var total = 0, got = 0;
    course.weeks.forEach(function (w) { total += 3; got += weekStars(w); });
    var html = '<h1>A trilha</h1>' +
      '<p class="lead">De cero a C1 en 52 semanas, de la arena del Arpoador a la cima del Pão de Açúcar. Cada semana tiene <b>3 estrellas</b>: ' +
      'jugar la lección, superar la semana y dominarla. Los <b>chefões</b> ⚔️ cierran cada tramo.</p>' +
      '<div class="card pathsum"><b>' + got + ' / ' + total + ' ★</b>' +
      '<span class="goalbar"><i style="width:' + Math.round(got / total * 100) + '%"></i></span></div>';

    course.seasons.forEach(function (s) {
      html += '<div class="season"><div class="banner s' + s.n + '"><span class="lvl">' + esc(s.level) + "</span>" +
        "<h2>" + esc(s.name) + "</h2><p>" + esc(s.blurb) + '</p></div><div class="path">';
      course.weeks.filter(function (w) { return w.season === s.n; }).forEach(function (w, k) {
        // Una semana ya jugada sigue abierta aunque, si el programa se
        // reordena, quede después de la desbloqueada.
        var open = w.week <= state.unlocked || !!state.weekStats[w.week] || lessonRead(w.week);
        var stars = weekStars(w);
        var current = w.week === Math.min(state.unlocked, 52) && stars < 3;
        var x = Math.round(Math.sin(k * 0.9) * 32);
        html += '<div class="node' + (w.boss ? " boss" : "") + (open ? "" : " locked") +
            (current ? " current" : "") + (stars === 3 ? " full" : "") + '" style="--x:' + x + '%">' +
          (current ? '<span class="bubble">' + (weekStat(w.week).attempts || lessonRead(w.week) ? "SEGUÍ" : "EMPEZÁ") + "</span>" : "") +
          '<button class="dot" data-week="' + w.week + '"' + (open ? "" : " disabled") + ">" +
            (w.boss ? "⚔️" : open ? w.week : "🔒") + "</button>" +
          '<span class="nt">' + esc(w.title) + "</span>" + starsHtml(stars) +
          (open && !w.boss ? (function () { var pl = weekPlan(w); return '<span class="nm">' +
            pl.filter(function (x) { return x.done; }).length + "/" + pl.length + " misiones</span>"; })() : "") +
          "</div>";
      });
      html += "</div></div>";
    });
    return html;
  }

  /* ---------------------------------------------------------------- teoria */

  /* *palavra* marca una forma portuguesa, **texto** una regla clave. */
  function mk(text) {
    return esc(text)
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/\*([^*]+)\*/g, '<i class="it">$1</i>');
  }

  function lessonRead(n) { return !!(state.read || {})[n]; }
  /* A lesson in parts (week.parts): each part is read on its own and the
     training only asks what the parts already read cover. */
  function partsOf(w) { return w && w.parts && w.parts.length ? w.parts : null; }
  function partRead(week, k) { return !!((state.readParts || {})[week] || {})[k]; }
  function partsRead(w) {
    var ps = partsOf(w); if (!ps) return null;
    return ps.map(function (p, k) { return partRead(w.week, k) || lessonRead(w.week); });
  }
  // Item ids the learner may be asked, given the parts read (none read: the
  // first part, so that training before reading is not a wall).
  function partItems(w) {
    var ps = partsOf(w); if (!ps) return null;
    var read = partsRead(w), ids = {}, any = false;
    ps.forEach(function (p, k) { if (read[k]) { any = true; p.items.forEach(function (id) { ids[id] = 1; }); } });
    if (!any) ps[0].items.forEach(function (id) { ids[id] = 1; });
    return ids;
  }

  /* Sessions: every lesson (or part of it) cut into short runs of whole
     blocks, about a dozen steps each, so no sitting is long.  A part counts
     as read when all its sessions are; what was read before stays read. */
  var SESS_MAX = 12, sessCache = {};
  function sessionsOf(w) {
    if (!w || !w.lesson) return [];
    if (sessCache[w.week]) return sessCache[w.week];
    var ps = partsOf(w), groups = ps ? ps.map(function (p, k) { return { part: k, blocks: p.blocks }; })
                                     : [{ part: null, blocks: w.lesson.blocks.map(function (_, i) { return i; }) }];
    var cost = function (i) {
      return Lezione.steps(w.lesson, function () { return 0.5; }, w.week, null, [i]).filter(function (x) { return x.kind !== "intro"; }).length;
    };
    var out = [];
    groups.forEach(function (g) {
      var cur = [], n = 0, mine = [];
      g.blocks.forEach(function (i) {
        var c = cost(i);
        if (cur.length && n + c > SESS_MAX) { mine.push(cur); cur = []; n = 0; }
        cur.push(i); n += c;
      });
      if (cur.length) mine.push(cur);
      mine.forEach(function (bl, k) {
        out.push({ part: g.part, blocks: bl, k: k, of: mine.length, h: (w.lesson.blocks[bl[0]] || {}).h || "" });
      });
    });
    return (sessCache[w.week] = out);
  }
  function sessRead(w, s) {
    var ss = sessionsOf(w)[s];
    if (!ss) return false;
    return !!((state.readSess || {})[w.week] || {})[s] || lessonRead(w.week) || (ss.part != null && partRead(w.week, ss.part));
  }
  function nextSession(w) {
    var ss = sessionsOf(w);
    for (var k = 0; k < ss.length; k++) if (!sessRead(w, k)) return k;
    return null;
  }

  /* Tres estrellas por semana: la lección jugada, la semana superada (20
     correctas), el dominio (85 % en al menos 30).  El jefe: vencido = 3. */
  function weekStars(w) {
    var st = weekStat(w.week);
    if (w.boss) return st.bossPassed ? 3 : 0;
    return (lessonRead(w.week) || !w.lesson ? 1 : 0) + (st.right >= 20 ? 1 : 0) +
      (Drills.dominated(st, w, state) ? 1 : 0);
  }
  function starsHtml(n, of) {
    var h = ""; for (var i = 0; i < (of || 3); i++) h += '<i class="' + (i < n ? "on" : "") + '">★</i>';
    return '<span class="stars">' + h + "</span>";
  }

  var sayIndex = {};

  /* part: undefined = el bloque entero (teoría completa); "a" = título,
     regla y tabla; "b" = ejemplos, trampa, atajo y detalle (lección jugada). */
  function renderBlock(b, i, part) {
    var A = part !== "b", B = part !== "a";
    var html = '<section class="blk">';
    if (b.h) html += "<h2>" + mk(b.h) + (part === "b" ? ' <span class="muted">· ejemplos</span>' : "") + "</h2>";
    // La regla corta primero; el detalle, plegado.
    if (b.r && A) html += '<p class="rule">' + mk(b.r) + "</p>";
    if (A) (b.p || []).forEach(function (par) { html += "<p>" + mk(par) + "</p>"; });

    if (b.table && A) {
      html += '<div class="tw"><table class="gram">';
      if (b.table.head && b.table.head.join("")) {
        html += "<thead><tr>" + b.table.head.map(function (c) {
          return "<th>" + mk(c) + "</th>";
        }).join("") + "</tr></thead>";
      }
      var exCol = -1;
      (b.table.head || []).forEach(function (h, k) { if (exCol < 0 && /ejemplo/i.test(h)) exCol = k; });
      html += "<tbody>" + (b.table.rows || []).map(function (r, ri) {
        return "<tr>" + r.map(function (c, k) {
          var say = "";
          if (k === exCol && c) {
            sayIndex["t" + i + "-" + ri] = Lezione.strip(c);
            say = ' <button class="say" data-say="t' + i + "-" + ri + '" aria-label="escuchar">🔊</button>';
          }
          return "<td" + (k === 0 ? ' class="k"' : "") + ">" + mk(c) + say + "</td>";
        }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>";
    }

    if (b.ex && B) {
      html += '<ul class="exs">' + b.ex.map(function (pair, k) {
        sayIndex[i + "-" + k] = Lezione.strip(pair[0]);
        return '<li><span class="it">' + exHtml(pair[0]) + "</span>" +
          '<span class="es">' + esc(pair[1]) + "</span>" +
          '<button class="say" data-say="' + i + "-" + k + '" ' +
          'aria-label="escuchar">🔊</button></li>';
      }).join("") + "</ul>";
    }

    if (!B) return html + "</section>";
    if (b.warn) html += '<div class="call warn"><b>La trampa</b>' +
      "<p>" + mk(b.warn) + "</p></div>";
    if (b.tip) html += '<div class="call tip"><b>El atajo</b>' +
      "<p>" + mk(b.tip) + "</p></div>";
    if (b.more && b.more.length) {
      html += '<details class="more"><summary>¿Por qué? Más detalle</summary>' +
        b.more.map(function (par) { return "<p>" + mk(par) + "</p>"; }).join("") + "</details>";
    }
    return html + "</section>";
  }

  /* ------------------------------------------ la lección, una idea por pantalla */

  // The block's forms marked inside an example (signaling).
  var HL_STOP = { o: 1, a: 1, os: 1, as: 1, um: 1, uma: 1, e: 1, de: 1, em: 1, no: 1, na: 1, "do": 1, da: 1, ao: 1,
                  que: 1, "não": 1, por: 1, para: 1, com: 1, se: 1, me: 1, te: 1, eu: 1, "é": 1 };
  function markForms(text, fs) {
    var t = String(text), low = t.toLowerCase(), marks = [];
    // «-ção»: an ending the rule teaches, marked on every word that has it
    var ends = (fs || []).filter(function (f) { return /^-[a-zà-ÿ]+$/.test(f); }).map(function (f) { return f.slice(1); });
    // the words of the table's forms (tenho, sou, estamos…), grammar words aside
    var words = [];
    (fs || []).forEach(function (f) { if (/\s/.test(f)) f.split(/\s+/).forEach(function (w) { if (w.length >= 2 && !HL_STOP[w] && words.indexOf(w) < 0) words.push(w); }); });
    fs = (fs || []).filter(function (f) { return f[0] !== "-"; }).concat(words);
    low.replace(/[a-zà-ÿ'-]+/g, function (w, at) {
      if (ends.some(function (e) { return w.length > e.length + 1 && w.slice(-e.length) === e; })) marks.push({ s: at, e: at + w.length });
      return w;
    });
    (fs || []).forEach(function (f) {
      var from = 0, at;
      while ((at = low.indexOf(f, from)) >= 0) {
        var before = at === 0 ? "" : low[at - 1], after = low[at + f.length] || "";
        var edge = function (ch) { return !ch || !/[a-zà-ÿ'-]/i.test(ch); };
        if (edge(before) && edge(after) && !marks.some(function (m) { return at < m.e && at + f.length > m.s; }))
          marks.push({ s: at, e: at + f.length });
        from = at + f.length;
      }
    });
    marks.sort(function (a, b) { return a.s - b.s; });
    var out = "", pos = 0;
    marks.forEach(function (m) { out += esc(t.slice(pos, m.s)) + '<mark class="hl">' + esc(t.slice(m.s, m.e)) + "</mark>"; pos = m.e; });
    return out + esc(t.slice(pos));
  }
  // An example with its key form marked by hand («Espero que você *venha*»).
  function exHtml(text) {
    return String(text).split(/\*([^*]+)\*/).map(function (x, k) {
      return k % 2 ? '<mark class="hl">' + esc(x) + "</mark>" : esc(x);
    }).join("");
  }
  function stepBadge(ico, txt) { return '<div class="stepbadge">' + ico + " " + txt + "</div>"; }
  // 👀 The examples first, the forms marked: the rule comes on the next screen.
  /* The forms of the tenses a week teaches (conjugator): the subjuntivo
     week marks seja, tenha, venha… in its examples.  Only weeks about a
     tense, and minus the forms the present shares (falamos, somos). */
  var tenseForms = {};
  function weekTenseForms(w) {
    if (!w || tenseForms[w.week]) return (w && tenseForms[w.week]) || [];
    var ts = (w.tenses || []).filter(function (t) { return (t !== "presente" || w.week === 5 || w.week === 6) && Conj.TENSE_LABELS[t]; });
    var out = {}, pres = {};
    if (ts.length && ts[0] !== "presente") Object.keys(Conj.VERBS).forEach(function (v) {
      try { Conj.conjugate(v, "presente").forEach(function (f) { pres[f.toLowerCase()] = 1; }); } catch (e) { /* */ }
    });
    ts.forEach(function (t) {
      Object.keys(Conj.VERBS).forEach(function (v) {
        try {
          Conj.conjugate(v, t).forEach(function (f, pi) {
            if (pi === 4) return;          // vós: never marked
            String(f).toLowerCase().split(/\s+/).forEach(function (x) { if (x.length >= 2 && !pres[x] && !HL_STOP[x]) out[x] = 1; });
          });
        } catch (e) { /* un verbo sin ese tiempo */ }
      });
    });
    return (tenseForms[w.week] = Object.keys(out));
  }
  function renderLook(b, i) {
    var fs = Lezione.forms(b).concat(les && les.w ? weekTenseForms(les.w) : []);
    return '<section class="blk">' + stepBadge("👀", "Mirá") + (b.h ? "<h2>" + mk(b.h) + "</h2>" : "") +
      '<ul class="exs look">' + b.ex.map(function (pair, k) {
        sayIndex[i + "-" + k] = Lezione.strip(pair[0]);
        // marked by hand when the lesson says which form matters; else, guessed
        var itHtml = /\*[^*]+\*/.test(pair[0]) ? exHtml(pair[0]) : markForms(pair[0], fs);
        return '<li><span class="it">' + itHtml + '</span><span class="es">' + esc(pair[1]) + "</span>" +
          '<button class="say" data-say="' + i + "-" + k + '" aria-label="escuchar">🔊</button></li>';
      }).join("") + "</ul>" +
      '<p class="muted small">Fijate en lo marcado. La regla, en la pantalla siguiente.</p></section>';
  }
  // 📐 The rule, alone (with its table when it is small).
  function renderRule(b, i) {
    var html = '<section class="blk">' + stepBadge("📐", "La regla") + (b.h ? "<h2>" + mk(b.h) + "</h2>" : "") +
      (b.r ? '<p class="rule solo">' + mk(b.r) + "</p>" : "");
    (b.p || []).forEach(function (par) { html += "<p>" + mk(par) + "</p>"; });
    if (b.table && Lezione.smallTable(b.table)) html += renderBlock({ table: b.table }, i, "a").replace(/^<section class="blk">|<\/section>$/g, "");
    return html + "</section>";
  }
  // 🗂️ A big table as cards, one row each, to swipe.
  // 🗂️ A long table, three or four rows per screen, one under the other.
  function renderTableCards(b, i, st) {
    var t = b.table, head = t.head || [], rows = t.rows || [];
    var from = st && st.from != null ? st.from : 0, to = st && st.to != null ? st.to : rows.length;
    var chunks = (st && st.chunks) || 1, chunk = (st && st.chunk) || 0;
    var cards = rows.slice(from, to).map(function (r, k) {
      var ri = from + k;
      var lines = r.slice(1).map(function (c, j) {
        var label = strip(head[j + 1] || ""), isEx = /ejemplo/i.test(label);
        if (isEx && c) sayIndex["t" + i + "-" + ri] = Lezione.strip(c);
        return '<div class="rc-line">' + (label ? '<span class="rc-k">' + mk(head[j + 1]) + "</span>" : "") +
          '<span class="rc-v' + (isEx ? " it" : "") + '">' + mk(c) + "</span>" +
          (isEx && c ? ' <button class="say" data-say="t' + i + "-" + ri + '" aria-label="escuchar">🔊</button>' : "") + "</div>";
      }).join("");
      return '<div class="rowcard">' + (strip(head[0] || "") ? '<span class="rc-k">' + mk(head[0]) + "</span>" : "") +
        '<div class="rc-h">' + mk(r[0]) + "</div>" + lines + "</div>";
    }).join("");
    return '<section class="blk">' + stepBadge("🗂️", chunks > 1 ? "La tabla · " + (chunk + 1) + " de " + chunks : "La tabla") +
      (b.h ? "<h2>" + mk(b.h) + "</h2>" : "") +
      '<div class="rowcards">' + cards + "</div>" +
      (chunk === chunks - 1 ? '<details class="more"><summary>Ver la tabla entera</summary>' +
        renderBlock({ table: b.table }, i, "a").replace(/^<section class="blk">|<\/section>$/g, "") + "</details>" : "") +
      "</section>";
  }
  function strip(x) { return Lezione.strip(x); }
  // ⚠️ The trap and the shortcut, on their own screen.
  function renderTrap(b, i) {
    return renderBlock({ h: b.h, warn: b.warn, tip: b.tip, more: b.more }, i).replace('<section class="blk">',
      '<section class="blk">' + stepBadge("⚠️", b.warn ? "Ojo" : "El atajo"));
  }

  function renderTeoria(w) {
    var L = w.lesson;
    sayIndex = {};
    if (!L) return '<button class="btn ghost" id="back">← a la trilha</button>' +
      '<p class="lead">Esta semana todavía no tiene teoría.</p>';

    var html = '<button class="btn ghost" id="tback">← a la semana</button>' +
      '<h1>Teoria · semana ' + w.week + '</h1>' +
      '<p class="lead">' + esc(w.title) + '</p>' +
      '<div class="lesson"><p class="intro">' + mk(L.intro) + '</p>';

    L.blocks.forEach(function (b, i) { html += renderBlock(b, i); });

    html += "</div>" +
      '<div class="card"><div class="row">' +
      (lessonRead(w.week)
        ? '<button class="btn" id="tplay">▶︎ A jugar</button>'
        : '<button class="btn" id="tdone">✓ Leído (+' + Engine.XP.lesson +
          " xp)</button>") +
      '<button class="btn ghost" id="tback2">Volver</button>' +
      "</div></div>";
    return html;
  }

  /* ------------------------------------------------------- lección jugada */

  var les = null;

  function startLezione(sess) {
    var w = course.weeks[view.week - 1];
    var isWord = function (word) { return !!(glossario && glossario[String(word).toLowerCase()]); };
    var ss = sessionsOf(w);
    // the first session not yet read (or the first one again)
    if (sess == null || isNaN(sess) || !ss[sess]) { sess = nextSession(w); if (sess == null) sess = 0; }
    var cur = ss[sess];
    les = { w: w, sess: sess, part: cur ? cur.part : null,
            steps: Lezione.steps(w.lesson, Math.random, w.week, isWord, cur ? cur.blocks : null),
            i: 0, right: 0, asked: 0, answered: false };
    view.screen = "lezione";
    render();
    savePending();
    window.scrollTo(0, 0);
  }

  function renderLezione() {
    var st = les.steps[les.i], w = les.w;
    var n = les.steps.length;
    var hudH = '<div class="hud"><span class="progressline"><i style="width:' +
      Math.round(Math.max(0, les.i - 1) / n * 100) + '%" data-to="' + Math.round(les.i / n * 100) + '"></i></span>' +
      '<span class="muted">' + (les.i + 1) + " de " + n + "</span>" + dai(les.i, n) +
      '<button class="btn ghost" id="lesquit">✕</button></div>';
    if (!st) {
      var pct = les.asked ? Math.round(les.right / les.asked * 100) : 100;
      var psd = partsOf(w), ssd = sessionsOf(w), nextS = nextSession(w);
      // training when the part (or the lesson) is complete; else, the next session
      var partDone = les.part != null ? partRead(w.week, les.part) : lessonRead(w.week);
      return '<div class="card lesdone center"><div class="bigstar">★</div>' +
        "<h1>" + (nextS == null ? "¡Lección completa!" : "¡Lección " + (les.sess + 1) + " de " + ssd.length + " lista!") + "</h1>" +
        '<p class="lead">Semana ' + w.week + " · " + esc(ssd[les.sess] ? ssd[les.sess].h : w.title) + "</p>" +
        '<div class="scorebig"><b>' + les.right + "/" + les.asked + '</b><span>+' + les.xp + " xp</span></div>" +
        (les.extras || []).map(function (x) { return '<p class="note selfrepair">' + esc(x) + "</p>"; }).join("") +
        '<p class="muted">' + (pct === 100 ? "Perfecta: ni un error en los chequeos." :
          pct >= 70 ? "Bien. Lo que fallaste vuelve en el entrenamiento." : "Repasala cuando quieras: se puede jugar de nuevo.") + "</p>" +
        '<div class="row centerrow" style="margin-top:14px">' +
        (nextS != null && !partDone ? '<button class="btn" id="lesnextpart" data-part="' + nextS + '">📘 Lección ' + (nextS + 1) + " →</button>" :
          '<button class="btn" id="lesplay">🎯 A entrenar' + (psd ? " esta parte" : "") + "</button>" +
          (nextS != null ? '<button class="btn ghost" id="lesnextpart" data-part="' + nextS + '">📘 Lección ' + (nextS + 1) + " →</button>" : "")) +
        '<button class="btn ghost" id="lesback">Volver a la semana</button></div></div>';
    }
    var partLabel = les.sess != null && sessionsOf(w).length > 1 ? " · lección " + (les.sess + 1) + " de " + sessionsOf(w).length
                  : les.part != null ? " · parte " + (les.part + 1) + " de " + partsOf(w).length : "";
    if (st.kind === "intro") {
      return hudH + '<div class="card lescard"><div class="badge-new">📘 Lección · semana ' + w.week + partLabel + "</div>" +
        "<h1>" + esc(w.title) + "</h1><p class=\"intro\">" + mk(w.lesson.intro) + "</p>" +
        '<button class="btn wide" id="lesnext">Empezar →</button></div>';
    }
    if (st.kind === "look" || st.kind === "rule" || st.kind === "table" || st.kind === "trap") {
      var bk = w.lesson.blocks[st.i];
      var body = st.kind === "look" ? renderLook(bk, st.i) : st.kind === "rule" ? renderRule(bk, st.i)
               : st.kind === "table" ? renderTableCards(bk, st.i, st) : renderTrap(bk, st.i);
      return hudH + (partLabel && les.i === 0 ? '<div class="badge-new">📘 Lección · semana ' + w.week + partLabel + "</div>" : "") +
        '<div class="card lescard lesson step-' + st.kind + '">' + body +
        '<button class="btn wide" id="lesnext">Seguir →</button></div>';
    }
    if (st.kind === "block") {
      return hudH + (partLabel && les.i === 0 ? '<div class="badge-new">📘 Lección · semana ' + w.week + partLabel + "</div>" : "") +
        '<div class="card lescard lesson">' + renderBlock(w.lesson.blocks[st.i], st.i, st.part) +
        '<button class="btn wide" id="lesnext">Seguir →</button></div>';
    }
    var q = st.q;
    return hudH + '<div class="card lescard quiz"><div class="badge-new">⚡ Chequeo rápido</div>' +
      '<div class="prompt">' + esc(q.prompt) + "</div>" +
      (q.stem ? '<div class="stem">' + esc(q.stem) + "</div>" : "") +
      '<div class="options">' + q.options.map(function (o, k) {
        return '<button class="opt" data-lq="' + k + '">' + esc(o) + "</button>";
      }).join("") + '</div><div id="lesfb"></div></div>';
  }

  function lesAnswer(btn) {
    if (les.answered) return;
    les.answered = true;
    var q = les.steps[les.i].q;
    var ok = btn.textContent === q.answer;
    les.asked++;
    if (ok) { les.right++; fx.right(); } else fx.wrong();
    document.querySelectorAll("[data-lq]").forEach(function (b) {
      b.disabled = true;
      if (b.textContent === q.answer) b.classList.add("right");
      else if (b === btn) b.classList.add("wrong");
    });
    $("#lesfb").innerHTML = '<div class="feedback ' + (ok ? "giusto" : "sbagliato") + '">' +
      '<div class="verdict">' + (ok ? pick(["Isso!", "Muito bem!", "Perfeito!"]) : "Era assim:") + "</div>" +
      '<div class="sol">' + esc(q.answer) + "</div>" +
      (ok ? "" : lesRule(q)) +
      '<div class="row" style="margin-top:10px"><button class="btn" id="lesnext2">Próxima →</button></div></div>';
    on("#lesnext2", lesNext);
  }

  // A wrong check shows the rule it tested, not just the answer.
  function lesRule(q) {
    var b = les.w.lesson.blocks[q.block];
    if (!b) return "";
    var r = b.r || b.warn || b.tip;
    return r ? '<div class="note">📐 ' + mk(r) + "</div>" : "";
  }

  function lesNext() {
    les.i++;
    les.answered = false;
    savePending();
    if (les.i >= les.steps.length) {
      clearPending();
      var w = les.w;
      var first = !lessonRead(w.week);
      if (!state.read) state.read = {};
      if (!state.lessonScore) state.lessonScore = {};
      var pct = les.asked ? Math.round(les.right / les.asked * 100) : 100;
      var planBefore = doneCount(w);
      var ss = sessionsOf(w), mine = ss[les.sess];
      if (!state.readSess) state.readSess = {};
      var rs = state.readSess[w.week] || (state.readSess[w.week] = {});
      if (les.sess != null) { first = !sessRead(w, les.sess); rs[les.sess] = Date.now(); }
      else ss.forEach(function (x, k) { if (x.part === les.part) rs[k] = rs[k] || Date.now(); });   // an old saved lesson: its whole part
      if (les.part != null) {
        if (!state.readParts) state.readParts = {};
        var rp = state.readParts[w.week] || (state.readParts[w.week] = {});
        // the part is read when every session of it is
        if (ss.every(function (x, k) { return x.part !== les.part || !!rs[k] || !!rp[les.part]; })) rp[les.part] = rp[les.part] || Date.now();
        var all = partsOf(w).every(function (p, k) { return !!rp[k]; });
        if (all && !state.read[w.week]) state.read[w.week] = Date.now();
      } else if (ss.every(function (x, k) { return !!rs[k]; }) && !state.read[w.week]) state.read[w.week] = Date.now();
      // the lesson's xp shared among its sessions
      var share = mine ? mine.blocks.length / Math.max(1, w.lesson.blocks.length) : 1;
      les.xp = (first ? Math.max(5, Math.round(Engine.XP.lesson * share)) : 5) + les.right * 2;
      les.extras = missionCheck(w.week, planBefore);
      state.lessonScore[w.week] = Math.max(pct, state.lessonScore[w.week] || 0);
      gain(les.xp);
      Engine.checkBadges(state);
      persist();
      renderHeader();
      fx.goal();
      confetti();
    }
    render();
    window.scrollTo(0, 0);
  }

  /* -------------------------------------------------------------- briefing */

  /* La trilha manda: todo lo que trae una semana (lección, palabras,
     entrenamiento, frases, lectura, laboratorio) es una misión de la semana,
     en orden.  Las pestañas Treino y Ler quedan como atajos libres, pero el
     camino ordenado es este. */
  // The week of each rule of Ponte: the rule's own «week» (lab.js) or, if it
  // has none, this table (likely ids), or its place in the list from week 2.
  var PONTE_WEEK = { cao: 2, cion: 2, "ção": 2, dade: 3, dad: 3, vel: 4, ble: 4, nh: 5, lh: 5, "nh-lh": 5,
                     ue: 6, ditongos: 6, ie: 7, f: 8, h: 8, agem: 9, aje: 9, pl: 10, cl: 10 };
  function ponteWeek(r, k) { return +r.week || PONTE_WEEK[r.id] || Math.min(10, 2 + k); }
  function falsiWeek() { return (window.Lab && +Lab.FALSI_WEEK) || 11; }

  // Martín's episodes open in order: an episode never lands before the one
  // that precedes it in the story.
  function readingWeek(ep) {
    if (ep.series !== "martin") return ep.week;
    var wk = 1;
    Letture.ofSeries("martin").forEach(function (e) { if (e.n <= ep.n) wk = Math.max(wk, e.week); });
    return wk;
  }

  function weekPlan(w) {
    var st = weekStat(w.week), out = [];
    var pct = st.attempts ? Math.round(st.right / st.attempts * 100) : 0;
    var m = function (o) { out.push(o); };
    if (w.boss) {
      // Before the boss: the season again, one theme at a time, and a round
      // with what you got wrong.  Optional: the boss is the gate.
      var psb = partsOf(w);
      if (w.lesson && psb) sessionsOf(w).forEach(function (x, k) {
        var p = psb[x.part];
        m({ kind: "lez", arg: String(k), done: sessRead(w, k), ico: "📘", opt: true,
            title: p.h + (x.of > 1 ? " (" + (x.k + 1) + "/" + x.of + ")" : ""),
            sub: (sessRead(w, k) ? "Hecho · " : "Opcional · ") + "la regla en pasos cortos" +
              (x.k === x.of - 1 ? " y " + p.items.length + " ejercicios del tema" : "") });
      });
      var weak = Drills.weakItems(course, w, state, itemMap).length;
      m({ kind: "debil", done: !!(state.weakDone || {})[w.week], ico: "🩹", opt: true, title: "Tus puntos débiles",
          sub: weak ? "Opcional · " + weak + " ejercicios de la estación que fallaste o casi no viste" : "Opcional · no fallaste nada todavía: repaso al azar" });
      if (w.week === 52 && window.EsameData) m({ kind: "play", done: st.bossPassed, ico: "🎓", title: "Exame C1",
          sub: "Cinco pruebas al estilo del Celpe-Bras (Avançado Superior): compreensão oral, leitura, estruturas, léxico y produção escrita. Mínimo 55 % en cada una.", cls: "boss" });
      else m({ kind: "play", done: st.bossPassed, ico: "⚔️", title: "Vencé al Chefão",
          sub: "85% de aciertos. Pregunta más de lo que más te costó. Superarlo te da las 3 estrellas.", cls: "boss" });
      return out;
    }
    // One mission per session: short lessons in order (a part's training
    // comes with its last session).
    var psw = partsOf(w), ssw = sessionsOf(w);
    if (w.lesson) ssw.forEach(function (x, k) {
      var last = x.k === x.of - 1, p = psw ? psw[x.part] : null;
      m({ kind: "lez", arg: String(k), done: sessRead(w, k), ico: "📘",
          title: (ssw.length > 1 ? "Lección " + (k + 1) + "/" + ssw.length + ": " : "Lección: ") + x.h,
          sub: (sessRead(w, k) ? "Hecha · " : "") +
            (p && last ? p.items.length + " ejercicios de esta parte entran al entrenamiento" :
             !p && last && k === ssw.length - 1 ? "después, a entrenar la semana" : "teoría en pasos cortos, con chequeos") });
    });
    if (w.vocab && w.vocab.length) {
      var seenV = w.vocab.filter(function (v) { return state.cards["v:" + v[0]]; }).length;
      m({ kind: "vocab", done: seenV >= w.vocab.length, ico: "📚", title: "Palabras de la semana",
          sub: seenV + " / " + w.vocab.length + " practicadas · primero reconocer, después escribir" });
    }
    m({ kind: "play", done: st.right >= 20, ico: "🎯", title: "Superá la semana",
        sub: Math.min(st.right, 20) + " / 20 respuestas correctas con los ejercicios de la semana" });
    if (window.Scrivi && Scrivi.TASKS[w.week]) {
      var sd = (state.scritti || {})[w.week], task = Scrivi.TASKS[w.week];
      m({ kind: "scrivi", done: !!sd, ico: "✍️", title: "Escreva: tu texto de la semana",
          sub: sd ? "Entregado · " + sd.n + " palabras" + (sd.errs ? " · " + sd.errs + " cosas para revisar" : " · sin errores marcados")
                  : task.min + " palabras o más · " + task.use.map(function (u) { return u[2]; }).join(" · ") });
    }
    if (window.Drills && window.Frasi) Drills.scenesOfWeek(w.week).forEach(function (sc) {
      var p = Frasi.progress(sc.id, state.cards);
      m({ kind: "scene", arg: sc.id, done: p.seen >= p.total, ico: sc.emoji, title: "Frases: " + sc.name,
          sub: p.seen + " / " + p.total + " frases · " + sc.blurb });
    });
    if (window.Letture) Letture.SERIES.forEach(function (sr) {
      Letture.ofSeries(sr.id).forEach(function (ep) {
        if (readingWeek(ep) !== w.week) return;
        var d = (state.letture || {})[ep.id];
        m({ kind: "ep", arg: ep.id, done: !!d, ico: ep.emoji,
            title: (ep.series === "settimana" ? "Lectura y comprensión: " : ep.series === "martin" ? "Lectura: " : "Cultura: ") + ep.title,
            sub: d ? "Leída · " + d.pct + "%" : esc(ep.level) + " · " + esc(ep.area || ep.grammar || "") +
                 (ep.series === "martin" || ep.series === "settimana" ? "" : " · opcional") });
      });
    });
    if (window.Lab) {
      Lab.RULES.forEach(function (r, k) {
        if (ponteWeek(r, k) !== w.week) return;
        var p = Lab.progress("ponte:" + r.id + ":", state.cards);
        m({ kind: "ponte", arg: r.id, done: p.seen >= p.total, ico: "🌉", title: "Ponte: " + r.h,
            sub: p.seen + " / " + p.total + " palabras que ya sabés del español" });
      });
      if (w.week === falsiWeek()) {
        var pf = Lab.progress("falso:", state.cards);
        m({ kind: "falsi", done: pf.seen >= pf.total, ico: "🪤", title: "Falsos amigos",
            sub: pf.seen + " / " + pf.total + " palabras que parecen y no son" });
      }
      Lab.CAPIRE.forEach(function (c) {
        if (c.week !== w.week) return;
        var pc = Lab.progress("capire:" + c.id + ":", state.cards);
        m({ kind: "capire", arg: c.id, done: pc.seen >= pc.total, ico: "🎯", title: "Entender: " + c.h,
            sub: pc.seen + " / " + pc.total + " · leer la gramática antes de producirla" });
      });
    }
    if (window.Banca && Banca.loaded()) {
      var bankDone = function (rx) { return Object.keys(state.cards).filter(function (k) { return rx.test(k); }).length >= 8; };
      if (w.week === Banca.FORME_WEEK) m({ kind: "b-forme", done: bankDone(/^b:(art|pl|prep|agg|acc)/), ico: "🧩", title: "Banco: Formas",
        sub: "Artículos, plurales y contracciones (no, na, do, pelo), generados del banco." });
      if (w.week === Banca.TR_WEEK) m({ kind: "b-tr", done: bankDone(/^b:tr:/), ico: "✍️", title: "Banco: Traduza",
        sub: "Oraciones del español al portugués, con corrección que explica el error." });
      if (w.week === Banca.GAP_WEEK) m({ kind: "b-gap", done: bankDone(/^b:gap:/), ico: "🔧", title: "Banco: Conjugue no contexto",
        sub: "El verbo justo dentro de una oración real." });
    }
    if (window.Suoni && Suoni.data() && w.week <= 40) {
      var sp = Suoni.progress(w.week, state.cards), sdone = !!(state.suoniDone || {})[w.week];
      m({ kind: "suoni", done: sdone, ico: "🎧", title: "Sons: el oído",
          sub: (sdone ? "Hecha · " : "") + "pares mínimos, habla conectada, entonación y un dictado · " + sp.seen + " / " + sp.total + " pares oídos" });
    }
    if (window.Suoni && Suoni.dgFor(w.week)) {
      var dgt = Suoni.dgFor(w.week), dgd = (state.dictogloss || {})[w.week];
      m({ kind: "dictogloss", done: !!dgd, ico: "📝", title: "Dictogloss: " + dgt.title,
          sub: dgd ? "Hecho · " + dgd.found + " / " + dgd.n + " bloques recuperados" : "Escuchalo dos veces, anotá y reconstruilo: seis bloques a recuperar" });
    }
    if (aiKey() && w.week >= 3) {
      var pl = (state.parlaLog || {})[w.week];
      m({ kind: "parla", done: !!pl, ico: "🗣️", title: "Fale: role-play con la IA", opt: true,
          sub: pl ? "Hecho · " + pl.obj + " / 3 objetivos en " + pl.turns + " turnos" : "Opcional · un personaje, tres objetivos, tu portugués escrito; la IA te corrige al final" });
      // (The AI story of the week gave way to a text written by hand for
      // every week: «A semana», in Ler and as the week's reading.)
    }
    // The duel that opens this week (both forms taught by now): optional.
    if (window.Duelli) Duelli.DUELLI.filter(function (d) { return d.week === w.week; }).forEach(function (d) {
      var best = (state.duelli || {})[d.id];
      m({ kind: "duello", arg: d.id, done: !!best && best.pct >= 80, ico: "⚔️", title: "Duelo: " + d.title, opt: true,
          sub: best ? "Tu mejor: " + best.pct + " % · con 80 % queda hecho" : "Opcional · " + d.sub + ": las dos formas mezcladas y «¿qué te lo dijo?»" });
    });
    var domDone = Drills.dominated(st, w, state);
    m({ kind: "play2", done: domDone, ico: "🏆", title: "Dominala",
        sub: domDone ? "Dominada" + (st.domPct ? " · " + st.domPct + " %" : "")
          : "Una sola sesión de " + Drills.DOMINA_SIZE + " preguntas de toda la semana, sin vidas: con 85 % la ganás" +
            (st.domBest ? " · tu mejor intento: " + st.domBest + " %" : "") });
    return out;
  }

  function nextMission(w) {
    return weekPlan(w).filter(function (x) { return !x.done; })[0] || null;
  }

  /* The next week opens when every mission of this one is done, «Dominala»
     aside (that is the third star): the lesson, the words, the twenty right
     answers, the phrases, the reading, the lab and the bank of the week. */
  function pendingToAdvance(w) {
    if (w.boss) return weekStat(w.week).bossPassed ? [] : ["Vencé al Chefão"];
    return weekPlan(w).filter(function (x) { return !x.done && x.kind !== "play2" && !x.opt; }).map(function (x) { return x.title; });
  }
  function tryAdvance(week) {
    var w = course.weeks[week - 1];
    if (!w || w.boss || week < state.unlocked || week >= 52) return false;
    if (pendingToAdvance(w).length) return false;
    state.unlocked = Math.min(52, week + 1);
    return true;
  }

  function goMission(kind, arg) {
    var w = course.weeks[view.week - 1];
    if (kind === "lez") startLezione(arg != null ? +arg : undefined);
    else if (kind === "vocab") startRound("vocab");
    else if (kind === "play") {
      if (w.week === 52 && window.EsameData) { view.screen = "esame"; render(); window.scrollTo(0, 0); }
      else startRound(w.boss ? "boss" : "round");
    }
    else if (kind === "play2") startRound("domina");
    else if (kind === "debil") startRound("debil");
    else if (kind === "scrivi") { view.screen = "scrivi"; render(); window.scrollTo(0, 0); }
    else if (kind === "scene" || kind === "ponte" || kind === "falsi" || kind === "capire" ||
             kind === "b-forme" || kind === "b-tr" || kind === "b-gap") startRound(kind, arg);
    else if (kind === "ep") { view.ep = arg; view.epFrom = "briefing"; view.screen = "lettura"; render(); window.scrollTo(0, 0); }
    else if (kind === "suoni") startRound("suoni", w.week);
    else if (kind === "duello") startRound("duello", arg);
    else if (kind === "dictogloss") { dg = null; view.screen = "dictogloss"; render(); window.scrollTo(0, 0); }
    else if (kind === "parla") { view.screen = "parla"; render(); window.scrollTo(0, 0); }
    else if (kind === "storia") { view.screen = "storia"; render(); window.scrollTo(0, 0); }
  }

  function missions(w, st, nChal) {
    var plan = weekPlan(w), doneN = plan.filter(function (x) { return x.done; }).length;
    var left = pendingToAdvance(w);
    var html = '<div class="card"><h2>Misiones ' + starsHtml(weekStars(w)) +
      ' <small class="muted">' + doneN + " / " + plan.length + "</small></h2>" +
      (w.boss ? (w.week < 52 ? '<p class="muted">⚔️ El Chefão abre la semana ' + (w.week + 1) + ". Los repasos por tema y tus puntos débiles son opcionales: sirven para llegar preparado.</p>" : "")
        : w.week < 52 && state.unlocked <= w.week
        ? '<p class="muted">🔒 La semana ' + (w.week + 1) + " se abre al completar " + (left.length === 1 ? "esta misión" : "estas " + left.length + " misiones") +
          " (todas menos Dominala).</p>"
        : '<p class="muted">🔓 Semana ' + (w.week + 1) + " abierta.</p>") +
      "<div class=\"missions\">";
    plan.forEach(function (x, k) {
      html += '<button class="mission' + (x.done ? " done" : "") + (x.cls ? " " + x.cls : "") +
        '" data-m="' + x.kind + '"' + (x.arg ? ' data-arg="' + esc(x.arg) + '"' : "") + ">" +
        '<span class="mi">' + (x.done ? "★" : x.ico) + "</span><span><b>" + (k + 1) + ". " + x.title + "</b><small>" + x.sub + "</small></span>" +
        '<span class="go">›</span></button>';
    });
    html += "</div>";
    html += '<div class="row" style="margin-top:12px">' +
      (w.lesson ? '<button class="tab" id="teo">📄 Ver la teoría entera</button>' : "") +
      (w.boss ? "" : '<button class="tab" id="gym">🏋️ Gimnasio de verbos</button>') +
      (nChal ? '<button class="tab" id="chal">📖 Desafios (' + nChal + ")</button>" : "") +
      "</div></div>";
    return html;
  }

  /* The week's words: listen to them, then a round that goes from
     recognising the meaning to writing the word. */
  function vocabCard(w) {
    if (!w.vocab || !w.vocab.length) return "";
    var seen = w.vocab.filter(function (v) { return state.cards["v:" + v[0]]; }).length;
    return '<div class="card"><h2>📚 Palabras de la semana <small class="muted">' + seen + " / " + w.vocab.length + "</small></h2>" +
      '<ul class="vocab">' + w.vocab.map(function (v) {
        return '<li><button class="say" data-say="' + esc(v[0]) + '" aria-label="Escuchar">🔊</button> <b>' + esc(v[0]) +
          "</b> <span>" + esc(v[1]) + "</span>" + (v[2] ? '<small><i>' + esc(v[2]) + "</i></small>" : "") + "</li>";
      }).join("") + "</ul>" +
      '<div class="row" style="margin-top:10px"><button class="btn" id="vocab">Practicar las palabras</button></div></div>';
  }

  function renderBriefing(w) {
    var st = weekStat(w.week);
    // Reference reading, when the course brings any (build_course.py:
    // week.refs, { manual: [chapters] } or a list of strings).
    var refs = [], R = w.refs || {};
    if (Array.isArray(R)) refs = R.map(function (x) { return esc(x); });
    else Object.keys(R).forEach(function (k) {
      var v = R[k];
      if (!v || (Array.isArray(v) && !v.length)) return;
      refs.push("<b>" + esc(k) + "</b>" + (Array.isArray(v) ? ", cap. " + v.map(esc).join(", ") : " · " + esc(v)));
    });

    var nChal = (w.challenges || []).length;

    return '<button class="btn ghost" id="back">← a la trilha</button>' +
      '<h1 class="placa big"><span class="p-sup">Semana ' + w.week + " · " + esc(w.level) +
        '</span><span class="p-rua">' + esc(w.title) + "</span></h1>" +
      '<p class="lead">' + esc(w.focus) + '</p>' +
      (w.fare ? '<p class="fare">🎯 Al final de la semana: <b>' + esc(w.fare) + '</b>' +
        (w.tema ? ' <span class="muted">· ' + esc(w.tema) + '</span>' : '') + '</p>' : '') +
      missions(w, st, nChal) +
      vocabCard(w) +
      '<div class="card"><h2>Lo que se juega esta semana</h2>' +
        '<ul class="keys">' +
          w.keys.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") +
        '</ul>' +
        (refs.length ? '<h3>Lectura de apoyo</h3><p class="refs">' + refs.join(" · ") + "</p>" : "") +
      '</div>';
  }

  /* ------------------------------------------------------------ entrenamiento */

  /* Lives are a gauge, not a wall: each error empties a heart so you see
     where the round went wrong, but you always play to the end (a round cut
     in half teaches nothing).  Phrase sessions have none: they are for flow. */
  var WITH_LIVES = { round: 1, boss: 1, gym: 1 };
  // Only these rounds count towards unlocking the next grammar week.
  var WEEK_KINDS = { round: 1, gym: 1, pausa: 1, vocab: 1, giorno: 1, debil: 1, domina: 1 };
  // Rounds whose answers count as the week's progress (review mixes weeks).
  var COUNT_KINDS = { round: 1, gym: 1, pausa: 1, boss: 1, vocab: 1, giorno: 1, debil: 1, domina: 1 };

  /* Las cuatro cuerdas de Nation (la guía): input, output, forma, fluidez. */
  function strandOf(it, kind) {
    if (kind === "lettura" || kind === "capire" || kind === "suoni" || it.type === "listen" || it.type === "dictation" || SAY_TYPES[it.type]) return "input";
    if (it.type === "write" || it.type === "translate" || it.type === "typed" || it.type === "fixerr" || it.type === "combina" || kind === "b-tr") return "output";
    if (kind === "scene" || it.type === "flash") return "fluidez";
    return "forma";
  }
  function doneCount(w) { return weekPlan(w).filter(function (x) { return x.done; }).length; }

  function startRound(kind, arg) {
    var w = course.weeks[view.week - 1];
    var items;
    if (kind === "giorno") {
      w = course.weeks[Math.min(state.unlocked, 52) - 1];
      view.week = w.week;
      items = Drills.buildRound(course, w, { map: itemMap, state: state, silent: state.silent, size: 6, only: partItems(w) });
    }
    else if (kind === "boss") items = Drills.buildBoss(course, w, state, { map: itemMap });
    else if (kind === "debil") items = Drills.buildWeak(course, w, state, { map: itemMap, size: 15 });
    else if (kind === "domina") items = Drills.buildDomina(course, w, state, { map: itemMap, silent: state.silent });
    else if (kind === "review") items = Drills.buildReview(course, state, 20, drillOpts());
    else if (kind === "scene") items = Frasi.sceneSession(arg, state.cards, drillOpts());
    else if (kind === "pausa") {
      w = course.weeks[Math.min(state.unlocked, 52) - 1];
      view.week = w.week;
      // Grammar only from lessons already read: before lesson 1 the
      // cafezinho is phrases and words, never «conjugá ser».
      var taught = null;
      for (var tw = Math.min(state.unlocked, 52); tw >= 1; tw--) {
        if (lessonRead(tw)) { taught = course.weeks[tw - 1]; break; }
      }
      items = Drills.buildPausa(course, state, taught, drillOpts());
      if (Banca.loaded() && taught && taught.week >= 2) {
        var bi = Banca.pausaItem(state);
        if (bi) items.splice(Math.min(5, items.length), 0, bi);
      }
      // one listening item (a pair, a bit of connected speech), never in the office
      if (!state.silent && window.Suoni && Suoni.data()) {
        var si = Suoni.randomItem(state, taught ? taught.week : 1);
        if (si) items.splice(Math.min(3, items.length), 0, si);
      }
    } else if (kind === "gym") {
      items = [];
      for (var i = 0; i < 15; i++) {
        var v = w.verbs[Math.floor(Math.random() * w.verbs.length)];
        var t = w.tenses[Math.floor(Math.random() * w.tenses.length)];
        try {
          items.push(i % 3 === 0 ? Drills.conjugationDrill(v, t, w.known, w.persons)
                                 : Drills.conjugationTyped(v, t, w.persons));
        } catch (e) { /* salta */ }
      }
      items = Drills.firstRecognize(items, state, w.week);
    } else if (kind === "vocab") items = Drills.withWordIntros(Drills.vocabSession(course, w, state, 14), state);
    else if (kind === "ponte") items = Lab.ponteSession(state.cards, arg);
    else if (kind === "falsi") items = Lab.falsiSession(state.cards);
    else if (kind === "capire") items = Lab.capireSession(state.cards, arg, state.unlocked);
    else if (kind === "lettura") {
      var epL = Letture.byId(arg);
      items = Letture.session(epL);
      if (epL && epL.series === "ai") items = items.slice(0, -1).concat(storyCloze(epL), items.slice(-1));
    }
    // From the week's mission: that week's pairs (the ones its counter
    // counts); from Treino: everything up to where the learner got.
    else if (kind === "suoni") items = Suoni.session(state, arg || Math.min(state.unlocked, 52), { silent: state.silent });
    else if (kind === "ritorno") items = ritornoItems();
    else if (kind === "esame") {
      var pool = course.items.filter(function (it) { return it.topic === "esame" && it.prova === arg; });
      items = Drills.shuffle(pool).slice(0, arg === "strutture" ? 20 : 12);
    }
    else if (kind === "micro") items = Drills.buildReview(course, state, 5, drillOpts());
    else if (kind === "duello") items = window.Duelli ? Duelli.session(arg, state.cards) : [];
    else if (kind === "b-voc") items = Banca.vocabSession(state, 12);
    else if (kind === "b-freq") items = Banca.vocabSessionFor(state, freqGaps(24), 12);
    else if (kind === "b-forme") items = Banca.formsSession(state, 12);
    else if (kind === "b-tr") items = Banca.translateSession(state, 8);
    else if (kind === "b-gap") items = Banca.gapSession(state, 10);
    else if (kind === "b-err") items = Banca.errorSession(state, 8);
    else if (kind === "clinica") items = Banca.clinicaSession(state, 12);
    else if (kind === "sfida") {
      var ch = course.challenges.filter(function (c) { return c.id === arg; })[0];
      items = ch && ch.play ? ch.play.map(function (id) { return itemMap[id]; }).filter(Boolean) : [];
      items = Drills.firstRecognize(items, state, w.week);
    }
    else {
      // «A entrenar esta parte»: only the exercises of that part.
      var pk = /^part:\d+$/.test(arg || "") ? +arg.slice(5) : null, pps = partsOf(w);
      var only = pk != null && pps && pps[pk] ? pps[pk].items.reduce(function (o, id) { o[id] = 1; return o; }, {}) : partItems(w);
      items = Drills.buildRound(course, w, { map: itemMap, state: state, silent: state.silent, only: only, focus: pk != null });
    }

    if (!items.length) { toast("No hay preguntas para este modo todavía."); return; }
    // the real voices of the pairs, looked up while the round starts
    if (window.Voci) Voci.prefetch(items.filter(function (x) { return x.type === "coppia"; })
      .map(function (x) { return x.say; }));

    round = {
      kind: kind,
      arg: arg,
      // A round that starts from the week (its briefing, its challenges, its
      // lesson's «A entrenar», a reading opened from it) goes back to the week.
      from: view.screen === "briefing" || view.screen === "sfide" || view.screen === "lezione" ||
            (view.screen === "lettura" && view.epFrom === "briefing") ? "briefing" : null,
      items: items,
      i: 0,
      right: 0,
      close: 0,
      wrong: 0,
      combo: 0,
      bestCombo: 0,
      lives: kind === "boss" ? 3 : WITH_LIVES[kind] ? 5 : Infinity,
      maxLives: kind === "boss" ? 3 : 5,
      xp: 0,
      answered: false,
      picked: [],
      again: {},
      tried: false,
      log: [],
      fixed: 0,
      week: view.week,
      planDone: doneCount(course.weeks[view.week - 1]),
      // A chest ticket or the daily challenge: double xp for this round.
      boost: kind === "giorno" || (state.boost > 0 && kind !== "review" && kind !== "pausa")
    };
    if (round.boost && kind !== "giorno") { state.boost--; persist(); renderHeader(); }
    view.screen = "gioco";
    render();
    savePending();
  }

  function currentItem() { return round.items[round.i]; }

  function hud() {
    var hearts = "";
    if (round.lives !== Infinity) {
      for (var i = 0; i < round.maxLives; i++) hearts += i < round.lives ? "❤️" : "🤍";
      // Past zero you keep playing; the hearts just stay empty.
    }
    return '<div class="hud">' +
        (hearts ? '<span class="hearts">' + hearts + "</span>" : "") +
        // Drawn at the previous step and grown after paint, so it visibly advances.
        '<span class="progressline"><i style="width:' +
          Math.round(Math.max(0, round.i - 1) / round.items.length * 100) + '%" data-to="' +
          Math.round(round.i / round.items.length * 100) + '"></i></span>' +
        '<span class="muted">' + (round.i + 1) + " de " + round.items.length + "</span>" +
        dai(round.i, round.items.length) +
        (round.combo > 1 ? '<span class="combo pop">🔥×' + round.combo + "</span>" : "") +
        '<button class="btn ghost" id="quit">✕</button>' +
      "</div>";
  }

  // Items of the listening module: the audio is the question.
  var SAY_TYPES = { coppia: 1, conta: 1, scegli: 1, intonazione: 1, accento: 1, forma: 1 };
  /* Fatigue: when the accuracy of the last eight answers drops twenty
     points under the session's, the round offers to stop (no new items
     are learnt tired: intra-session dropout models, Riiid 2020). */
  function fatigued() {
    var l = round.log.filter(function (x) { return !x.retry; });
    if (l.length < 12 || round.fatigueShown) return false;
    var acc = function (arr) { return arr.filter(function (x) { return x.verdict === "giusto"; }).length / arr.length; };
    return acc(l.slice(-8)) <= acc(l) - 0.2;
  }

  function renderGioco() {
    var it = currentItem();
    if (!it) return "";
    stemGloss = [];
    var fatigue = "";
    if (fatigued()) {
      round.fatigueShown = true;
      fatigue = '<div class="note fatigue">😮‍💨 Bajó la precisión en las últimas ocho. Ya cumpliste el mínimo: ' +
        '¿seguís o cerramos acá? <button class="tab" id="stophere">Cerrar acá</button></div>';
    }
    // Several blanks: numbered, answered in order («a / b»).
    var gaps = (String(it.stem || "").match(/_{3,}/g) || []).length;
    var multi = gaps > 1 && /\|/.test(it.answer || "");
    var gi = 0;
    var body = "", stem = /^\s*_+\s*$/.test(it.stem || "") ? ""
      : glossify(it, it.stem).replace(/_{3,}/g, function () {
        return multi ? '<span class="gap n">' + (++gi) + "</span>" : '<span class="gap">&nbsp;</span>';
      });
    var prompt = (it.retry ? '<div class="badge-new">🔁 Segunda vez, más fácil</div>' : "") +
      '<div class="prompt">' + esc(it.prompt || "") + "</div>" +
      (it.retry && it.note && !it.recog ? '<div class="note">📐 ' + mk(it.note) + "</div>" : "");

    if (it.type === "intro") {
      return hud() + '<div class="card intro">' +
        '<div class="badge-new">✨ ' + esc(it.prompt) + "</div>" +
        '<div class="fit big">' + esc(it.frase.it) + "</div>" +
        '<div class="fes">' + esc(it.frase.es) + "</div>" +
        (it.note ? '<div class="call tip"><b>Ojo</b><p>' + mk(it.note) + "</p></div>" : "") +
        '<div class="row" style="margin-top:14px">' +
          '<button class="btn ghost" id="sayit">🔊 Escuchar</button>' +
          '<button class="btn ghost" id="slow">🐢 Lento</button>' +
        "</div>" +
        '<p class="muted">Leela dos veces y tratá de imaginarte diciéndola: ' +
          "en un rato te la voy a pedir de memoria.</p>" +
        '<button class="btn wide" id="next">La tengo →</button>' +
        "</div>";
    }

    if (it.type === "word") {
      var wv = it.word;
      return hud() + '<div class="card intro">' +
        '<div class="badge-new">📚 Palabra nueva</div>' +
        '<div class="fit big">' + esc(wv[0]) + "</div>" +
        '<div class="fes">' + esc(wv[1]) + "</div>" +
        (wv[3] ? '<div class="call tip"><b>Cómo se usa</b><p>' + mk(wv[3]) + "</p></div>" : "") +
        (wv[2] ? '<div class="note">' + esc(wv[2]) + "</div>" : "") +
        '<div class="row" style="margin-top:14px"><button class="btn ghost" id="sayit">🔊 Escuchar</button></div>' +
        '<p class="muted">Decila en voz alta: en un rato te pregunto qué significa.</p>' +
        keywordBox(wv[0]) +
        '<button class="btn wide" id="next">La tengo →</button>' +
        "</div>";
    }

    if (it.type === "card") {
      return hud() + '<div class="card intro">' +
        '<div class="badge-new">📐 ' + esc(it.prompt) + "</div>" +
        "<h2>" + mk(it.h) + "</h2><p>" + mk(it.body) + "</p>" +
        (it.ex && it.ex.length ? '<ul class="exs">' + it.ex.map(function (e) {
          return '<li><span class="es">' + esc(e[0]) + '</span><span class="it">→ ' +
            esc(e[1]) + "</span></li>";
        }).join("") + "</ul>" : "") +
        '<button class="btn wide" id="next">Entendido →</button></div>';
    }

    if (it.type === "fixerr") {
      return hud() + '<div class="card">' +
        '<div class="prompt">' + esc(it.prompt) + "</div>" +
        '<div class="text hunt fixerr">' + it.stem.split(/\s+/).map(function (t, k) {
          return '<span class="w" data-ft="' + k + '">' + esc(t) + "</span>";
        }).join(" ") + "</div>" +
        '<div id="fixbox"></div><div id="fb"></div></div>';
    }

    if (it.type === "hunt") {
      var ep = Letture.byId(it.ep);
      return hud() + '<div class="card">' +
        '<div class="prompt">' + esc(it.prompt) + "</div>" +
        '<div class="stem">' + esc(it.stem) + "</div>" +
        renderText(ep, "hunt") +
        '<div class="row"><button class="btn" id="hcheck">Conferir</button>' +
        '<span class="muted" id="hcount" style="align-self:center">0 marcadas</span></div>' +
        '<div id="fb"></div></div>';
    }

    var lead = "";
    if (it.type === "garden" && it.lead) {
      lead = '<div class="lead-ex"><span class="muted small">Seguí el patrón:</span><ul class="exs">' + it.lead.map(function (e) {
        return '<li><span class="es">' + esc(e[0]) + '</span><span class="it">→ ' + esc(e[1]) + "</span></li>";
      }).join("") + "</ul></div>";
    }
    if (it.type === "scopri" && it.data) {
      lead = '<div class="lead-ex data"><ol class="exs">' + it.data.map(function (d) { return "<li>" + glossifyAny(d) + "</li>"; }).join("") + "</ol></div>";
    }
    if (it.type === "scopri" || it.type === "guess" || (it.type === "choice" && it.options)) {
      body = '<div class="options' + (it.type === "scopri" ? " rules" : "") + '">' + it.options.map(function (o, k) {
        return '<button class="opt" data-opt="' + k + '">' + esc(o) + "</button>";
      }).join("") + "</div>";
      if (it.withText) {
        body = '<button class="tab" id="showtext">📄 ver el texto</button>' +
          '<div id="qtext" hidden>' + renderText(Letture.byId(it.ep), "read") + "</div>" + body;
      }
    } else if (it.type === "dictation") {
      body = '<div class="center"><button class="bigplay" id="play1">🔊</button>' +
        '<div><button class="tab" id="slow">🐢 más lento</button></div>' +
        (it.audio ? '<p class="muted small" id="vcredit"></p>' : "") + "</div>" +
        '<div class="typed">' +
        '<textarea id="wans" class="grow" rows="1" autocomplete="off" autocapitalize="sentences" ' +
        'autocorrect="off" spellcheck="false" enterkeyhint="send" placeholder="lo que escuchás…"></textarea>' +
        '<button class="btn" id="wsend">Conferir</button></div>';
      stem = "";
    } else if (it.type === "tiles") {
      body = '<div class="tiles-answer" id="tans"></div>' +
        '<div class="tiles-bank" id="tbank"></div>' +
        '<div class="row" style="margin-top:12px">' +
          '<button class="btn" id="tcheck">Conferir</button>' +
          '<button class="btn ghost" id="tclear">Borrar</button></div>';
    } else if (SAY_TYPES[it.type]) {
      body = '<div class="center"><button class="bigplay" id="play1">🔊</button>' +
        '<div><button class="tab" id="slow">🐢 más lento</button>' +
        (it.type === "coppia" ? '<button class="tab" id="both">👂 las dos</button>' : "") + "</div>" +
        (it.type === "coppia" || it.audio ? '<p class="muted small" id="vcredit"></p>' : "") + "</div>" +
        // «¿Qué forma escuchaste?»: the sentence with the form blanked out
        (it.type === "forma" ? '<div class="stem">' + esc(it.stem).replace("___", "<b>___</b>") + "</div>" : "") +
        '<div class="options' + (it.type === "coppia" ? " pair" : "") + '">' + it.options.map(function (o, k) {
          return '<button class="opt" data-opt="' + k + '">' + esc(o) + "</button>";
        }).join("") + "</div>";
      stem = "";
    } else if (it.type === "listen") {
      body = '<div class="center"><button class="bigplay" id="play1">🔊</button>' +
        '<div><button class="tab" id="slow">🐢 más lento</button>' +
        // listening to tell sounds apart: the text would give it away
        (it.nopeek ? "</div>" : '<button class="tab" id="peek">👀 ver texto</button></div>' +
        '<div class="peek" id="peektxt" hidden>' + esc(it.stem) + "</div>") + "</div>" +
        '<div class="options">' + it.options.map(function (o, k) {
          return '<button class="opt" data-opt="' + k + '">' + esc(o) + "</button>";
        }).join("") + "</div>";
      stem = "";
    } else if (it.type === "write") {
      body = '<div class="typed">' +
        '<textarea id="wans" class="grow" rows="1" autocomplete="off" autocapitalize="sentences" ' +
        'autocorrect="off" spellcheck="false" enterkeyhint="send" placeholder="em português…"></textarea>' +
        '<button class="btn" id="wsend">Conferir</button></div>' +
        '<div class="row" style="margin-top:8px">' +
          '<button class="tab" id="hint">💡 pista</button>' +
          '<button class="tab" id="easier">🧩 dame fichas</button></div>' +
        '<div class="peek" id="hinttxt" hidden></div>';
    } else if (it.type === "flash") {
      body = '<div id="flash"><button class="btn wide" id="reveal">Mostrar respuesta</button></div>';
    } else if (it.type === "choice" || it.type === "guess") {
      /* handled above */
    } else {
      body = '<div class="typed">' +
        '<textarea id="ans" class="grow" rows="1" autocomplete="off" autocapitalize="off" ' +
        'autocorrect="off" spellcheck="false" enterkeyhint="send" placeholder="' +
          (multi ? "las " + gaps + " respuestas en orden: 1 / 2" + (gaps > 2 ? " / 3" : "")
                 : it.type === "translate" ? "em português…" : "tu respuesta…") + '"></textarea>' +
        // the letters a Spanish keyboard does not have at hand (ã, õ, ç, ê,
        // ô, â, à) and the acute ones, for the phones without long press
        '<div class="accents">' +
          ["ã", "õ", "ç", "á", "é", "í", "ó", "ú", "â", "ê", "ô", "à", "-"].map(function (c) {
            return '<button data-ins="' + c + '">' + c + "</button>";
          }).join("") +
        "</div>" +
        '<button class="btn" id="send">Conferir</button></div>';
    }

    var sayBtn = it.src === "frasi" || it.src === "lettura" || it.src === "lab" || it.src === "ascolto" || it.type === "scopri" ? "" :
      ' <button class="tab" id="say" title="escuchar">🔊</button>';

    return hud() + fatigue +
      '<div class="card">' +
        prompt.replace("</div>", sayBtn + "</div>") +
        lead +
        (stem ? '<div class="stem">' + stem + "</div>" : "") +
        body +
        '<div id="fb"></div>' +
      "</div>";
  }

  /* Fichas: toques para armar la frase. */
  function drawTiles() {
    var it = currentItem();
    var ans = $("#tans"), bank = $("#tbank");
    if (!ans || !bank) return;
    ans.innerHTML = round.picked.length
      ? round.picked.map(function (k, pos) {
          return '<button class="tile on" data-pos="' + pos + '">' + esc(it.tiles[k]) + "</button>";
        }).join("")
      : '<span class="muted">Tocá las palabras en orden…</span>';
    bank.innerHTML = it.tiles.map(function (t, k) {
      var used = round.picked.indexOf(k) >= 0;
      return '<button class="tile' + (used ? " used" : "") + '" data-tile="' + k + '"' +
        (used || round.answered ? " disabled" : "") + ">" + esc(t) + "</button>";
    }).join("");
    bank.querySelectorAll("[data-tile]").forEach(function (b) {
      b.onclick = function () {
        if (round.answered) return;
        fx.tap();
        round.picked.push(+b.dataset.tile);
        drawTiles();
      };
    });
    ans.querySelectorAll("[data-pos]").forEach(function (b) {
      b.onclick = function () {
        if (round.answered) return;
        round.picked.splice(+b.dataset.pos, 1);
        drawTiles();
      };
    });
  }

  function gradeTiles(it) {
    var built = round.picked.map(function (k) { return it.tiles[k]; }).join(" ");
    var ok = Frasi.words(built).join(" ") === Frasi.words(it.answer).join(" ");
    return { given: built, verdict: ok ? Engine.VERDICT.RIGHT : Engine.VERDICT.WRONG };
  }

  // Category groups come from the diagnosis of the language (its ids).
  var GROUPS = (window.Diagnosi && Diagnosi.GROUPS) || {};
  var GENERIC = GROUPS.generic || { lexico: 1, faltante: 1, sobrante: 1, tipeo: 1, vuoto: 1 };
  var LEXICAL = GROUPS.lexical || { lexico: 1, espanol: 1, falso_amigo: 1, vuoto: 1 };
  var SLIPS = GROUPS.slips || { tilde: 1, tipeo: 1 };
  var UNRECORDED = GROUPS.unrecorded || { tipeo: 1, vuoto: 1 };

  // Multiple choice: say why *that* option is wrong (Shute 2008).
  function answer(given) {
    if (round.answered) return;
    var it = currentItem();
    var verdict = Engine.grade(given, it);
    if (it.type === "coppia") { settle(verdict, given, pairHtml(it)); return; }
    if (SAY_TYPES[it.type]) { settle(verdict, given, it.es ? '<div class="note">' + esc(it.es) + "</div>" : ""); return; }
    if (verdict === Engine.VERDICT.RIGHT || !window.Diagnosi) { settle(verdict, given); return; }
    var cd = it.choiceDiag || { before: "", after: "" };
    var d = Diagnosi.explainChoice(cd.before + given + cd.after, cd.before + it.answer + cd.after,
                                   it.choiceDiag ? {} : { stem: it.stem, nominal: it.type === "plural" || /plural/i.test(it.prompt || "") });
    // Only when the options are Portuguese: diagnosing a Spanish gloss as if
    // it were Portuguese would be nonsense.
    // Spanish glosses (the week's words, the bank) are never diagnosed as
    // Portuguese, and picking another whole sentence is not a word-level error.
    var ptOptions = (it.choiceDiag || it.src === "coniugatore" ||
      (it.src !== "banca" && it.src !== "lab" && it.src !== "lettura" && it.src !== "frasi" && it.src !== "vocab" && it.src !== "ascolto" && it.type !== "scopri") ||
      (it.src === "frasi" && it.type === "choice")) && !(it.recog && it.orig === "translate");
    var useful = ptOptions && d && d.cat && !GENERIC[d.cat];
    if (useful) recordError(d, given);
    settle(verdict, given, useful ? diagHtml(d, false) : "");
  }

  // The pair after the answer: both words and their meanings.
  function pairHtml(it) {
    var p = it.pair, shown = p.written || [p.a, p.b];
    var row = function (k) {
      return '<div class="pairrow"><b>' + esc(shown[k]) + "</b> <span class=\"muted\">" + esc((p.es || [])[k] || "") + "</span></div>";
    };
    return '<div class="pairbox">' + row(0) + row(1) + "</div>";
  }

  /* -------------------------------------------- producción y corrección */

  /* Written answers get a diagnosis.  A rule error on the first attempt
     earns a prompt, not the answer: the learner corrects it (Lyster & Ranta
     1997; Lyster & Saito 2010).  Slips (accents, typos) are just flagged. */
  function produce(given) {
    if (round.answered) return;
    var it = currentItem();
    // Several blanks typed as «a / b» (or a | b): same as a b.
    if (/\|/.test(it.answer || "")) given = String(given).replace(/\s*[\/|]\s*/g, " ");
    if (!String(given || "").trim()) return;
    var accept = (it.accept && it.accept.length ? it.accept : [it.answer]).map(function (x) {
      return String(x).replace(/\s*\|\s*/g, " ");   // two blanks: typed one after the other
    });
    if (it.dir === "it-es") {
      // the learner writes Spanish: no Portuguese diagnosis, just the match
      var ves = Engine.grade(given, it);
      settle(ves, given, ves === "giusto" ? "" : '<div class="note">Otras formas de decirlo: ' + esc((it.accept || [it.answer]).join(" · ")) + "</div>");
      return;
    }
    var diagCtx = { stem: it.stem, prompt: it.prompt, nominal: it.type === "plural" || /plural/i.test(it.prompt || "") };
    var d = window.Diagnosi ? Diagnosi.diagnose(given, accept, diagCtx) : { verdict: "sbagliato" };
    // Garden path (Tomasello & Herron 1988): the learner was led into the
    // transfer error on purpose; the correction is the lesson.
    if (it.type === "garden" && it.trap && Engine.normalise(given) === Engine.normalise(it.trap)) {
      round.lastDiag = d;
      settle("sbagliato", given, '<div class="diag"><span class="tag">🪤 La trampa</span><p>' + mk(it.note || "") + "</p></div>", { label: "Caíste, y eso era la idea. Era así:" });
      return;
    }
    round.lastDiag = d;
    // The whole answer in Spanish: a hint about one word is useless.
    var esText = it.frase ? it.frase.es : it.type === "translate" ? it.stem : "";
    if (d.hint && esText) {
      var esW = Engine.normalise(esText).split(/\s+/), gW = Engine.normalise(given).split(/\s+/);
      var inEs = gW.filter(function (w) { return w.length > 1 && esW.indexOf(w) >= 0; }).length;
      if (gW.length >= 2 && inEs * 2 >= gW.length) {
        d.hint = "Eso está en español. Escribila en portugués; si todavía no la sabés, pedí las fichas 🧩.";
      }
    }
    // The old graders forgive a letter or two; the diagnosis knows whether
    // those letters were a typo or grammar (em o / no, a / à).
    // A rule error always wins over typo tolerance.
    var v1 = it.frase && (it.type === "write" || it.type === "dictation")
      ? Frasi.gradeWritten(given, it.answer).verdict : Engine.grade(given, it);
    var verdict = v1 === "giusto" || d.verdict === "giusto" ? "giusto"
                : d.verdict === "sbagliato" && d.cat ? "sbagliato"
                : v1 === "quasi" || d.verdict === "quasi" ? "quasi" : "sbagliato";
    // Phrase drills stay lenient on accents only.
    if (it.frase && verdict === "sbagliato" && d.all && d.all.every(function (c) { return SLIPS[c]; })) {
      verdict = "quasi";
    }
    if (verdict === "giusto") {
      if (round.tried) {
        markFixed(round.firstCat);
        settle("quasi", given, '<div class="note selfrepair">🎯 ¡Lo corregiste vos! Autocorregirse es lo que más fija.</div>',
               { label: "¡Eso es!", fixed: true });
      } else {
        if (it.frase && it.type === "write") state.written = (state.written || 0) + 1;
        settle("giusto", given);
      }
      return;
    }
    // The same text again within a moment is a double tap, not a second
    // attempt; sent again later, it is a deliberate "I think I'm right".
    if (round.tried && String(given).trim() === round.lastGiven && Date.now() - round.promptAt < 1500) {
      var inp0 = $("#ans") || $("#wans");
      if (inp0) { inp0.classList.remove("shake"); void inp0.offsetWidth; inp0.classList.add("shake"); inp0.focus(); }
      return;
    }
    if (verdict === "sbagliato" && !round.tried && round.kind !== "boss" && round.kind !== "esame" && d.hint && d.cat !== "vuoto") {
      round.tried = true;
      round.lastGiven = String(given).trim();
      round.promptAt = Date.now();
      round.firstCat = d.cat;
      recordError(d, given);
      showPrompt(d);
      return;
    }
    if (!round.tried && d.cat) recordError(d, given);
    settle(verdict, given, d.cat ? diagHtml(d, true) : "");
  }

  function tokHtml(list, cls) {
    return list.map(function (t) {
      return t[cls] ? '<b class="' + cls + '">' + esc(t.w) + "</b>" : esc(t.w);
    }).join(" ");
  }

  function diagHtml(d, withDiff) {
    var diff = withDiff && d.given && d.given.length <= 24
      ? '<div class="diff"><span class="k">vos</span> ' + tokHtml(d.given, "bad") +
        '<br><span class="k">bien</span> ' + tokHtml(d.fixed, "fix") + "</div>" : "";
    return '<div class="diag"><span class="tag">' + esc(d.label || "") + "</span>" + diff +
      "<p>" + mk(d.explain || "") + "</p>" +
      (d.all && d.all.length > 1 ? (function () {
        var seen = {}, rest = d.all.slice(1).filter(function (c) { if (seen[c] || c === d.cat) return false; seen[c] = 1; return true; });
        return rest.length ? '<div class="muted">También: ' + rest.map(function (c) { return esc(Diagnosi.LABEL[c] || c); }).join(", ") + "</div>" : "";
      })() : "") +
      "</div>";
  }

  function showPrompt(d) {
    fx.close();
    // The word(s) to fix, with the first letter showing: c_mo.
    var masked = (d.fixed || []).filter(function (t) { return t.fix; }).map(function (t) {
      return t.w.charAt(0) + t.w.slice(1).replace(/[^' ]/g, "_");
    }).join(" ");
    $("#fb").innerHTML = '<div class="feedback prompt">' +
      '<div class="verdict">🔎 Casi. Revisalo:</div>' +
      (d.given && d.given.length <= 24 ? '<div class="diff">' + tokHtml(d.given, "bad") + "</div>" : "") +
      "<p>" + mk(d.hint) + "</p>" +
      '<div class="row">' + (masked ? '<button class="tab" id="morehint">💡 más pista</button>' : "") +
      '<button class="tab" id="giveup">Ver la respuesta</button></div></div>';
    on("#giveup", function () { settle("sbagliato", "", diagHtml(d, true)); });
    on("#morehint", function () {
      var b = $("#morehint");
      if (b) b.outerHTML = '<span class="muted" style="align-self:center">' + esc(masked) + "</span>";
      var inp = $("#ans") || $("#wans");
      if (inp) inp.focus();
    });
    var input = $("#ans") || $("#wans");
    if (input) { input.focus(); input.select && input.select(); }
  }

  function recordError(d, given) {
    if (!d || !d.cat || UNRECORDED[d.cat]) return;
    if (!state.errs) state.errs = {};
    if (!state.errLog) state.errLog = [];
    var e = state.errs[d.cat] || (state.errs[d.cat] = { n: 0, fixed: 0, last: 0 });
    e.n++;
    e.last = Date.now();
    state.errLog.unshift({ cat: d.cat, g: String(given).slice(0, 80), e: String(d.target || "").slice(0, 80), at: Date.now() });
    state.errLog = state.errLog.slice(0, 60);
    persist();
  }

  function markFixed(cat) {
    if (!cat || !state.errs || !state.errs[cat]) return;
    state.errs[cat].fixed = (state.errs[cat].fixed || 0) + 1;
  }

  // Record a verdict: SRS, stats, xp, feedback panel.
  function settle(verdict, given, extra, opts) {
    if (round.answered) return;
    opts = opts || {};
    var it = currentItem();
    round.answered = true;
    if (opts.fixed) round.fixed = (round.fixed || 0) + 1;

    var q = verdict === Engine.VERDICT.RIGHT ? 2
          : verdict === Engine.VERDICT.CLOSE ? 1 : 0;

    // A guess before learning is never an error: it only primes the memory.
    if (it.type === "guess") return settleGuess(it, q, given);

    if (q === 2) {
      round.right++; round.combo++;
      round.bestCombo = Math.max(round.bestCombo, round.combo);
      fx.right();
    } else if (q === 1) { round.close++; round.combo = 0; fx.close(); }
    else {
      round.wrong++; round.combo = 0; fx.wrong();
      if (round.lives !== Infinity) round.lives--;
    }

    var gained = Engine.xpFor(verdict, round.combo);
    if (it.retry) gained = Math.ceil(gained / 2);     // the easier second pass pays half
    if (state.streak >= 7) gained = Math.round(gained * 1.2);   // a week of streak pays more
    if (round.boost) gained *= 2;
    round.xp += gained;
    Engine.addStrand(state, strandOf(it, round.kind), gained);
    round.log.push({ id: it.id, verdict: verdict, given: given, answer: it.answer, retry: !!it.retry,
                     novel: !!it.novel, fixed: !!opts.fixed,
                     es: it.frase ? it.frase.es : "", stem: it.stem || "", prompt: it.prompt || "" });

    // SRS only tracks the fixed bank and the phrases; generated conjugation
    // drills are endless by design, so they are not scheduled as cards.
    // Right at first sight in the training: a light card (back in two
    // weeks), so the review queue holds errors, phrases and words, not
    // every exercise ever seen.
    if (it.src !== "coniugatore" && it.src !== "lettura" && !it.nocard) {
      var light = !it.frase && it.src !== "vocab" && it.src !== "lab" && it.src !== "banca" && !it.retry &&
                  (round.kind === "round" || round.kind === "sfida" || round.kind === "giorno" || round.kind === "boss" || round.kind === "domina");
      // The diagnosis says what kind of mistake it was (a slip, a word, a rule).
      var dg = round.lastDiag; round.lastDiag = null;
      var ekind = q === 1 && (!dg || dg.slip) ? "slip"
        : q === 0 && dg && LEXICAL[dg.cat] ? "vocab" : q === 0 ? "rule" : null;
      state.cards[it.id] = Engine.schedule(state.cards[it.id], q, {
        light: light, kind: ekind, id: it.id, state: state, retry: !!it.retry, hint: !!round.tried || !!opts.fixed,
        notte: state.notte !== false });
      Engine.maybeFit(state);
    }
    // Productive practice of the week's own rule, day by day (a rule is a
    // card of its own: three days of writing it right consolidate it).
    if (q === 2 && !it.recog && !it.options && !it.frase && it.src !== "coniugatore" && it.src !== "vocab" &&
        it.src !== "lab" && it.src !== "lettura" && it.src !== "banca" && COUNT_KINDS[round.kind]) {
      Engine.noteProduction(state, view.week);
    }

    /* Successive relearning (Rawson & Dunlosky 2011): what you miss comes
       back later in the same session, until you get it (at most twice). */
    var relearn = "";
    if (q < 2 && round.kind !== "boss" && round.kind !== "esame" && it.src !== "lettura" && !it.retry && !(round.again[it.id])) {
      round.again[it.id] = 1;
      var at = Math.min(round.items.length, round.i + 3);
      round.items.splice(at, 0, retryVersion(it));
      relearn = '<div class="note">🔁 Te la vuelvo a preguntar en un rato, más fácil.</div>';
    }

    state.totals.attempts++;
    if (q === 2) state.totals.right++;
    else if (q === 1) state.totals.close++;
    else state.totals.wrong++;

    // Only the week's own exercises count towards its stars: not the gym,
    // not the words (that is how a week got «mastered» after seeing 7 items).
    if (!it.frase && it.src !== "lab" && it.src !== "lettura" && it.src !== "banca" &&
        it.src !== "coniugatore" && it.src !== "vocab" && COUNT_KINDS[round.kind]) {
      var ws = state.weekStats[view.week] ||
        (state.weekStats[view.week] = { attempts: 0, right: 0, bossPassed: false });
      ws.attempts++;
      if (q === 2) ws.right++;
      // What you fixed yourself counts as learnt here too (Metcalfe 2017).
      ws.last = (ws.last || []).concat([q === 2 || opts.fixed ? 1 : 0]).slice(-30);
    }

    gain(gained);
    persist();
    renderHeader();
    if (gained) xpFly(gained);

    var label = opts.label || { giusto: pick(["Isso!", "Muito bem!", "Perfeito!", "Mandou bem!", "Ótimo!", "É isso aí!"]),
                  quasi: "Quase! Falta pouco.",
                  sbagliato: pick(["Não faz mal. Era assim:", "Acontece. Era assim:", "Calma, era assim:"]) }[verdict];
    var sol = it.type === "listen" && it.frase ? it.frase.it + " — " + it.answer
            : it.frase ? it.frase.it : it.answer;
    var fb = '<div class="feedback ' + verdict + '">' +
      '<div class="verdict">' + label +
        (gained ? ' <span class="xpgain">+' + gained + " xp</span>" : "") + "</div>" +
      (extra || "") +
      (it.type === "hunt" ? "" : '<div class="sol">' + (it.frase || it.src === "lettura" || it.dir === "it-es" || it.type === "scopri" ? esc(sol) : glossifyAny(sol)) + "</div>") +
      (it.frase && it.type !== "listen" ? '<div class="note">' + esc(it.frase.es) + "</div>" : "") +
      (it.note && !(it.type === "garden" && extra && extra.indexOf("La trampa") >= 0) ? '<div class="note">' + mk(it.note) + "</div>" : "") +
      (q === 2 && it.recogNote ? '<div class="note">' + esc(it.recogNote) + "</div>" : "") +
      (it.hint && it.src === "dummies"
        ? '<div class="note">Consigna original: ' + esc(it.hint) + "</div>" : "") +
      (function () {
        var vw = vocabWordOf(it), kw = vw && (state.keywords || {})[vw];
        return kw ? '<div class="note">🧷 Tu imagen: ' + esc(kw) + "</div>" : q < 2 && vw ? keywordBox(vw) : "";
      })() +
      relearn +
      '<div class="row" style="margin-top:10px">' +
        '<button class="btn" id="next">Próxima →</button>' +
        '<button class="tab" id="say2">🔊 escuchar</button>' +
        (q < 2 && aiKey() && window.Scrivi && it.type !== "hunt" ? '<button class="tab" id="aiexp">🤖 Explicame</button>' : "") +
      '</div><div id="aiexpout"></div></div>';

    $("#fb").innerHTML = fb;
    wireKeyword();
    $("#fb").querySelectorAll("[data-sg]").forEach(function (b) {
      b.onclick = function (e) { e.stopPropagation(); showGloss(stemGloss[+b.dataset.sg]); };
    });
    // Reading: after a miss, the text opens so the answer can be found in it.
    var qt = $("#qtext");
    if (qt && q < 2) qt.hidden = false;

    // Mark the chosen option so the learner sees what they picked.
    var opts = document.querySelectorAll(".opt");
    for (var i = 0; i < opts.length; i++) {
      opts[i].disabled = true;
      if (Engine.normalise(opts[i].textContent) === Engine.normalise(it.answer)) {
        opts[i].classList.add("right");
      } else if (Engine.normalise(opts[i].textContent) === Engine.normalise(given)) {
        opts[i].classList.add("wrong");
      }
    }
    var input = $("#ans");
    if (input) input.disabled = true;
    ["#tcheck", "#tclear", "#wsend", "#wans", "#easier", "#reveal", "#hcheck", "#send", "#fxsend", "#fxdel", "#fxin"].forEach(function (s) {
      var b = $(s); if (b) b.disabled = true;
    });
    if (it.type === "tiles") drawTiles();

    var spoken = it.frase ? it.frase.it : it.src === "lettura" ? "" : it.dir === "it-es" || it.type === "scopri" ? it.stem
      : filledStem(it) || it.answer;
    if (SAY_TYPES[it.type] || it.dettato) spoken = it.say;
    // False friends and structured input: read the Portuguese prompt aloud.
    if (it.lab === "falsi" || it.lab === "capire") spoken = it.stem;
    // A Spanish answer (¿Qué significa «saudade»? → nostalgia) is not
    // read: the Portuguese sentence of the question is, when there is one.
    if (spanishText(spoken) || (spoken === it.answer && asksMeaning(it))) spoken = it.stem && !/_{3,}/.test(it.stem) && !spanishText(it.stem) ? it.stem : "";
    $("#next").onclick = nextItem;
    on("#aiexp", function () {
      var b = $("#aiexp"), outE = $("#aiexpout");
      if (b) b.disabled = true;
      if (outE) outE.innerHTML = '<p class="muted small">⏳ Preguntándole a la IA…</p>';
      var fbText = ($("#fb") || {}).innerText || "";
      var x = { prompt: it.prompt, stem: it.stem, options: it.options, given: given, answer: sol,
                accept: it.accept, feedback: fbText.split("Próxima →")[0].replace(/\s+/g, " ").slice(0, 600) };
      // Graded hints (dynamic assessment): implicit → the rule as a
      // question → the explanation.  The level reached is kept as a
      // signal of how much mediation the learner needed.
      Scrivi.hints(x, aiKeys(), function (err, data, meta) {
        var o = $("#aiexpout");
        if (!o) return;
        if (err) { o.innerHTML = '<p class="muted small">No pude usar la IA (' + esc(String(err.message || err)) + ").</p>"; if (b) b.disabled = false; return; }
        var dispute = data && (data.tambien_correcta || data.app_equivocada);
        if (dispute) {
          // Kept for review: the learner does not have to explain it to anyone.
          if (!state.aiNotes) state.aiNotes = [];
          state.aiNotes.unshift({ id: it.id, prompt: it.prompt, stem: it.stem, given: given, answer: sol,
                                  ai: String(data.explicacion || "").slice(0, 600), at: Date.now() });
          state.aiNotes = state.aiNotes.slice(0, 80);
          persist();
        }
        var lvl = 1;
        var show = function () {
          o.innerHTML = '<div class="aiout">' +
            '<p>🤖 <b>Pista 1:</b> ' + esc(String(data.pista1 || "")) + "</p>" +
            (lvl >= 2 ? '<p><b>Pista 2:</b> ' + esc(String(data.pista2 || "")) + "</p>" : "") +
            (lvl >= 3 ? "<p>" + mk(esc(String(data.explicacion || ""))) + "</p>" +
              (dispute ? '<p class="muted small">La IA cree que ' + (data.tambien_correcta ? "tu respuesta también vale" : "la corrección de la app no es buena") +
                 ". Quedó anotado en Eu → «Correcciones para revisar».</p>" : "") + modelLine(meta) : "") +
            (lvl < 3 ? '<div class="row"><button class="tab" id="morehint2">' + (lvl === 1 ? "💡 Más pista" : "📐 La explicación") + "</button></div>" : "") +
            "</div>";
          on("#morehint2", function () {
            lvl++;
            if (!state.hintLevels) state.hintLevels = { 1: 0, 2: 0, 3: 0 };
            show();
          });
          if (lvl === 3 && state.hintLevels) state.hintLevels[3] = (state.hintLevels[3] || 0) + 1;
        };
        show();
      });
    });
    $("#say2").onclick = function () { if (it.audio) speakItem(it, true); else speak(spoken, true); };
    if (!spoken && !it.audio) $("#say2").hidden = true;
    else if (q === 2 || it.frase) { if (it.audio) speakItem(it); else speak(spoken); }
    $("#fb").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* The second time comes in another shape: two options with the rule in
     sight, or a recognition version of what had to be typed, or the phrase
     with tiles.  Never the same screen again (audit 2.1). */
  /* Keyword mnemonic (Atkinson & Raugh 1975): only for the opaque words,
     and written by the learner, which works better than one handed over.
     Shown again on the first encounter and whenever the word fails. */
  function keywordBox(word) {
    if (!word) return "";
    var kw = (state.keywords || {})[word] || "";
    return '<div class="keyword"><label class="muted small">🧷 Tu imagen para recordarla <small>(opcional: «polvo» → un pulpo revolcándose en el polvo)</small></label>' +
      '<div class="typed"><input id="kwin" data-kw="' + esc(word) + '" maxlength="80" placeholder="una imagen, una rima…" value="' + esc(kw) + '">' +
      '<button class="tab" id="kwsave">Guardar</button></div></div>';
  }
  function wireKeyword() {
    var inp = $("#kwin");
    if (!inp) return;
    var save = function () {
      if (!state.keywords) state.keywords = {};
      var v = inp.value.trim();
      if (v) state.keywords[inp.dataset.kw] = v.slice(0, 80); else delete state.keywords[inp.dataset.kw];
      persist();
      toast(v ? "🧷 Guardada." : "Borrada.");
    };
    on("#kwsave", save);
    inp.onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); save(); } };
  }
  function vocabWordOf(it) {
    if (!it) return null;
    if (it.id.indexOf("v:") === 0) return it.id.slice(2);
    if (it.id.indexOf("b:voc:") === 0) return it.id.slice(6);
    return null;
  }

  function retryVersion(it) {
    var copy;
    if (it.frase) copy = Frasi.pickItem(it.frase, { silent: state.silent, fresh: true });
    else if (it.options && it.options.length > 2) {
      var wrong = Drills.shuffle(it.options.filter(function (o) {
        return Engine.normalise(o) !== Engine.normalise(it.answer);
      }));
      copy = Object.assign({}, it, { options: Drills.shuffle([it.answer, wrong[0]]) });
    } else if (!it.options) {
      copy = Drills.recognitionOf(it, round.items, view.week) || Object.assign({}, it);
    } else copy = Object.assign({}, it, { options: Drills.shuffle(it.options) });
    copy.retry = true;
    return copy;
  }

  function settleGuess(it, q, given) {
    var gained = q === 2 ? 5 : 2;
    round.xp += gained;
    gain(gained);
    persist();
    renderHeader();
    if (q === 2) fx.right(); else fx.tap();
    $("#fb").innerHTML = '<div class="feedback ' + (q === 2 ? "giusto" : "quasi") + '">' +
      '<div class="verdict">' + (q === 2 ? "¡Buen olfato!" : "Era esta. Ahora ya la conocés.") +
        ' <span class="xpgain">+' + gained + " xp</span></div>" +
      '<div class="sol">' + esc(it.answer) + "</div>" +
      (it.note ? '<div class="note">' + mk(it.note) + "</div>" : "") +
      '<div class="note">🔬 Intentar adivinar antes de aprender ayuda a recordar, ' +
        "aunque te equivoques (efecto de la prueba previa).</div>" +
      '<div class="row" style="margin-top:10px"><button class="btn" id="next">Próxima →</button></div></div>';
    document.querySelectorAll(".opt").forEach(function (o) {
      o.disabled = true;
      if (o.textContent === it.answer) o.classList.add("right");
      else if (o.textContent === given) o.classList.add("wrong");
    });
    $("#next").onclick = nextItem;
  }

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* A distracted learner closes the app mid-round: the round is kept in
     localStorage and Hoje offers to pick it up where it was. */
  var PENDING_KEY = "rumoc1.pending.v1";
  function savePending() {
    try {
      var p = null;
      if (view.screen === "gioco" && round && round.i < round.items.length) {
        p = { type: "round", week: view.week, tab: view.tab, at: Date.now(),
              round: { kind: round.kind, arg: round.arg, from: round.from, items: round.items, i: round.i,
                       right: round.right, close: round.close, wrong: round.wrong, fixed: round.fixed || 0,
                       combo: round.combo, bestCombo: round.bestCombo,
                       lives: round.lives === Infinity ? null : round.lives, maxLives: round.maxLives,
                       xp: round.xp, again: round.again, log: round.log } };
      } else if (view.screen === "lezione" && les && les.i < les.steps.length) {
        p = { type: "lezione", week: les.w.week, part: les.part, at: Date.now(), steps: les.steps, i: les.i, right: les.right, asked: les.asked };
      }
      if (p) localStorage.setItem(PENDING_KEY, JSON.stringify(p));
      else localStorage.removeItem(PENDING_KEY);
    } catch (e) { /* nada */ }
  }
  function clearPending() { try { localStorage.removeItem(PENDING_KEY); } catch (e) { /* */ } }
  function loadPending() {
    try {
      var p = JSON.parse(localStorage.getItem(PENDING_KEY) || "null");
      if (!p || !p.at || Date.now() - p.at > 2 * 86400000) return null;
      if (p.type === "round" && !(p.round && p.round.items && p.round.items.length)) return null;
      if (p.type === "lezione" && !(p.steps && course.weeks[p.week - 1] && course.weeks[p.week - 1].lesson)) return null;
      return p;
    } catch (e) { return null; }
  }
  var KIND_NAME = { debil: "Puntos débiles", domina: "Dominala", round: "Entrenamiento", giorno: "Desafio do dia", boss: "Chefão", gym: "Gimnasio de verbos", pausa: "Pausa pro cafezinho", review: "Revisão",
                    scene: "Frases", vocab: "Palabras de la semana", lettura: "Lectura", sfida: "Desafio", ponte: "Ponte",
                    falsi: "Falsos amigos", capire: "Entender", "b-voc": "Palavras", "b-tr": "Traduza", "b-gap": "Conjugue no contexto",
                    "b-forme": "Formas", "b-err": "Ache o erro", clinica: "Clínica", suoni: "Sons", "b-freq": "Palavras frecuentes",
                    ritorno: "Cinco minutos para retomar", micro: "Revisão 2 min", esame: "Exame C1", duello: "Duelo" };
  function pendingTitle(p) {
    if (p.type === "lezione") return "Lección · semana " + p.week + " · " + (p.i + 1) + "/" + p.steps.length;
    return (KIND_NAME[p.round.kind] || "Ronda") + " · " + (p.round.i + 1) + "/" + p.round.items.length;
  }
  function resumePending() {
    var p = loadPending();
    if (!p) return;
    if (p.type === "round") {
      round = Object.assign({ answered: false, picked: [], tried: false, lastGiven: null, firstCat: null }, p.round);
      if (round.lives === null) round.lives = Infinity;
      view.week = p.week; view.tab = p.tab || "oggi"; view.screen = "gioco";
    } else {
      les = { w: course.weeks[p.week - 1], part: p.part == null ? null : p.part, steps: p.steps, i: p.i, right: p.right, asked: p.asked, answered: false };
      view.week = p.week; view.tab = "percorso"; view.screen = "lezione";
    }
    render();
    window.scrollTo(0, 0);
  }

  function nextItem() {
    round.i++;
    round.answered = false;
    round.tried = false;
    round.lastGiven = null;
    round.firstCat = null;
    round.picked = [];
    if (round.i >= round.items.length) {
      finishRound();
      return;
    }
    render();
    savePending();
    window.scrollTo(0, 0);
  }

  function finishRound() {
    var total = round.right + round.close + round.wrong;
    // What you fixed yourself counts as learnt (Metcalfe 2017).
    var pct = total ? Math.round((round.right + (round.fixed || 0)) / total * 100) : 0;
    var w = course.weeks[view.week - 1];

    clearPending();
    Engine.touchStreak(state);
    Engine.noteSession(state);
    if (!state.best) state.best = {};
    state.best.combo = Math.max(state.best.combo || 0, round.bestCombo);
    var records = [];
    if (total >= 8 && Engine.noteRecord(state, "sessione", pct)) records.push("🏅 Récord personal: tu mejor sesión, " + pct + " %");
    if (Engine.noteRecord(state, "settimane", Engine.weekStreak(state))) records.push("🏅 Récord personal: " + Engine.weekStreak(state) + " semanas seguidas con tres días");
    if (Engine.noteRecord(state, "parole", Engine.newWordsThisWeek(state))) records.push("🏅 Récord personal: " + Engine.newWordsThisWeek(state) + " palabras nuevas en una semana");
    if (Engine.noteRecord(state, "corrette", round.fixed || 0)) records.push("🏅 Récord personal: " + round.fixed + " errores corregidos por vos en una ronda");

    if (round.kind === "esame") {
      var firsts0 = round.log.filter(function (x) { return !x.retry; });
      var okE = firsts0.filter(function (x) { return x.verdict === Engine.VERDICT.RIGHT; }).length;
      esameSet(round.arg, okE, firsts0.length);
      persist();
      renderHeader();
      view.screen = "esame";
      render();
      toast("Prova de " + proveName(round.arg) + ": " + Math.round(okE / Math.max(1, firsts0.length) * 100) + " %", 3000);
      return;
    }
    var passed = false, transfer = null;
    if (round.kind === "boss") {
      // The new sentences (never practised) measure whether the rule
      // generalises: reported apart, they do not count for passing.
      var okL = function (l) { return l.filter(function (x) { return x.verdict === Engine.VERDICT.RIGHT || x.fixed; }).length; };
      var coreL = round.log.filter(function (x) { return !x.novel; }), novL = round.log.filter(function (x) { return x.novel; });
      if (novL.length) {
        pct = coreL.length ? Math.round(okL(coreL) / coreL.length * 100) : pct;
        transfer = { pct: Math.round(okL(novL) / novL.length * 100), n: novL.length };
      }
      passed = pct >= 85;
      var ws = state.weekStats[view.week] ||
        (state.weekStats[view.week] = { attempts: 0, right: 0, bossPassed: false });
      if (passed) {
        ws.bossPassed = true;
        if (round.wrong === 0) ws.perfect = true;
        gain(Engine.XP.boss);
        if (view.week >= state.unlocked) state.unlocked = Math.min(52, view.week + 1);
      }
    }
    // (the next week opens from missionCheck, once every mission is done)

    if (round.kind === "debil") { if (!state.weakDone) state.weakDone = {}; state.weakDone[view.week] = true; }
    if (round.kind === "suoni" && total >= 6) { if (!state.suoniDone) state.suoniDone = {}; state.suoniDone[round.arg || Math.min(state.unlocked, 52)] = Date.now(); }

    // Dominala: the first answer to each question counts (the second, easier
    // pass after a miss is for learning, not for the score).
    var domExtra = null;
    if (round.kind === "domina") {
      var firsts = round.log.filter(function (x) { return !x.retry; });
      var okN = firsts.filter(function (x) { return x.verdict === Engine.VERDICT.RIGHT || x.verdict === Engine.VERDICT.CLOSE; }).length;
      var dp = firsts.length ? Math.round(okN / firsts.length * 100) : 0;
      var dws = state.weekStats[view.week] || (state.weekStats[view.week] = { attempts: 0, right: 0, bossPassed: false });
      dws.domBest = Math.max(dws.domBest || 0, dp);
      if (dp >= 85 && firsts.length >= Math.min(20, round.items.length)) {
        if (!dws.dominated) gain(60);
        dws.dominated = true; dws.domPct = Math.max(dws.domPct || 0, dp);
        domExtra = "🏆 ¡Semana dominada! " + dp + " % en " + firsts.length + " preguntas";
      } else domExtra = "🏆 Dominala: " + dp + " % (hace falta 85 %). Tu mejor intento: " + dws.domBest + " %.";
    }

    if (round.kind === "duello") {
      var dF = round.log.filter(function (x) { return !x.retry && !/:cue$/.test(x.id); });
      var dC = round.log.filter(function (x) { return !x.retry && /:cue$/.test(x.id); });
      var okD = function (l) { return l.filter(function (x) { return x.verdict === Engine.VERDICT.RIGHT; }).length; };
      var dpct = dF.length ? Math.round(okD(dF) / dF.length * 100) : 0;
      if (!state.duelli) state.duelli = {};
      var prevD = state.duelli[round.arg];
      state.duelli[round.arg] = { pct: Math.max(dpct, prevD ? prevD.pct : 0), last: dpct, at: Date.now() };
      var duelExtra = "⚔️ Forma elegida bien: " + dpct + " %" + (dC.length ? " · pista encontrada: " + Math.round(okD(dC) / dC.length * 100) + " %" : "");
    }

    if (round.kind === "sfida") {
      var prevS = state.challengeLog[round.arg];
      state.challengeLog[round.arg] = { q: pct >= 80 ? 2 : pct >= 50 ? 1 : 0,
        pct: Math.max(pct, prevS && prevS.pct || 0), at: Date.now() };
      if (!prevS) gain(Engine.XP.challenge);
    }

    if (round.kind === "lettura") {
      if (!state.letture) state.letture = {};
      var prev = state.letture[round.arg];
      state.letture[round.arg] = { pct: Math.max(pct, prev ? prev.pct : 0), at: Date.now() };
      if (!prev) gain(20);
    }

    var extras = [];
    if (round.kind === "giorno") {
      state.dailyDone = Engine.dayKey();
      if (pct >= 80) { state.dailyWon = (state.dailyWon || 0) + 1; extras.push("🎯 Desafio do dia ganado · " + state.dailyWon + " en total"); }
    }
    if (total >= 5 && state.firstRound !== Engine.dayKey()) {
      state.firstRound = Engine.dayKey();
      gain(25);
      extras.push("☀️ Primera ronda del día: +25 xp");
    }
    if (domExtra) extras.push(domExtra);
    if (duelExtra) extras.push(duelExtra);
    extras = extras.concat(records);
    extras = extras.concat(missionCheck(round.week, round.planDone));

    var won = Engine.checkBadges(state);
    persist();
    renderHeader();

    view.screen = "risultato";
    view.result = { pct: pct, passed: passed, won: won, extras: extras, transfer: transfer };
    if (pct >= 80 && total >= 5) setTimeout(confetti, 150);
    render();
  }

  /* A mission just closed, or the whole week: say so, loudly. */
  function missionCheck(week, before) {
    var w = course.weeks[week - 1];
    if (!w) return [];
    var plan = weekPlan(w), now = plan.filter(function (x) { return x.done; }).length, out = [];
    if (now > (before || 0)) {
      fx.goal();
      out.push("★ Misión completada · " + now + " / " + plan.length + " de la semana " + w.week);
    }
    var before2 = state.unlocked;
    if (tryAdvance(w.week) && state.unlocked > before2) {
      out.push("🔓 ¡Semana " + state.unlocked + " abierta!");
    } else if (w.week === state.unlocked && !w.boss) {
      var left = pendingToAdvance(w);
      if (left.length && now > (before || 0)) out.push("Para abrir la semana " + (w.week + 1) + ": " + left.join(", ") + ".");
    }
    if (now === plan.length && plan.length && !(state.perfectWeeks || {})[w.week]) {
      state.perfectWeeks = state.perfectWeeks || {};
      state.perfectWeeks[w.week] = Date.now();
      gain(100);
      setTimeout(confetti, 400);
      out.push("🏁 ¡Semana perfeita! Todas las misiones de la semana " + w.week + ": +100 xp");
    }
    return out;
  }

  function renderRisultato() {
    var r = view.result;
    var title = round.kind === "boss"
      ? (r.passed ? "⚔️ Chefão vencido" : "Chefão no vencido")
      : r.pct >= 90 ? "🏆 ¡Sensacional!" : r.pct >= 70 ? "👏 ¡Muito bem!" : "💪 Sesión terminada";
    var goal = Engine.goalFor(state), tx = Engine.todayXp(state);

    var html = '<h1>' + title + "</h1>" +
      '<div class="card">' +
      '<div class="scorebig"><b>' + r.pct + '%</b><span>+' + round.xp + ' xp</span>' +
        (round.bestCombo > 2 ? '<span>🔥 combo ×' + round.bestCombo + "</span>" : "") + "</div>" +
      '<div class="goalbar" style="margin:12px 0 4px"><i style="width:' +
        Math.min(100, Math.round(tx / goal * 100)) + '%"></i></div>' +
      '<p class="muted" style="margin:0 0 10px">Meta de hoy: ' + (tx >= goal ? tx + " xp" : tx + " / " + goal + " xp") +
        (tx >= goal ? " ✓ cumplida" : " — te faltan " + (goal - tx)) + "</p>" +
      '<table class="res">' +
        "<tr><td>Correctas</td><td>" + round.right + "</td></tr>" +
        (round.fixed ? "<tr><td>Corregidas por vos</td><td>" + round.fixed + "</td></tr>" : "") +
        "<tr><td>Casi</td><td>" + (round.close - (round.fixed || 0)) + "</td></tr>" +
        "<tr><td>Incorrectas</td><td>" + round.wrong + "</td></tr>" +
        "<tr><td>Racha</td><td>" + dias(state.streak) + " 🔥</td></tr>" +
      "</table>";

    (r.extras || []).forEach(function (x) { html += '<p class="note selfrepair">' + esc(x) + "</p>"; });
    if (round.boost) html += '<p class="muted">🎟️ Ronda con doble xp.</p>';

    if (round.kind === "boss" && r.transfer) {
      html += '<h3>¿La regla generaliza?</h3><table class="res">' +
        "<tr><td>Con lo que practicaste</td><td>" + r.pct + " %</td></tr>" +
        "<tr><td>Con " + r.transfer.n + " frases nuevas</td><td>" + r.transfer.pct + " %</td></tr></table>" +
        '<p class="muted">Las frases nuevas no las viste nunca: no cuentan para aprobar, pero dicen si sabés la regla o te ' +
        (r.transfer.pct + 15 < r.pct ? "acordás de las frases. <b>Acá hay distancia</b>: la Clínica y los duelos ayudan a generalizar.</p>" : "acordás de las frases. Van parejas: la regla está.</p>");
    }
    if (round.kind === "boss") {
      // Like the certifications (Celpe-Bras): one mark per ability, each one has to pass.
      var AB = { ascolto: "Compreensão oral", lettura: "Leitura", strutture: "Estruturas", produzione: "Produção" };
      var ab = {};
      round.log.forEach(function (l) {
        if (l.novel) return;              // the new sentences are reported apart
        var it = round.items.filter(function (x) { return x.id === l.id; })[0] || {};
        var k = it.type === "listen" || it.type === "dictation" ? "ascolto"
              : it.type === "translate" || it.type === "write" || it.type === "typed" || it.type === "combina" ? "produzione"
              : it.type === "choice" && !it.recog ? "lettura" : "strutture";
        var a = ab[k] || (ab[k] = { n: 0, ok: 0 });
        a.n++; if (l.verdict === Engine.VERDICT.RIGHT) a.ok++;
      });
      html += '<h3>Por habilidad</h3><table class="res">' + Object.keys(ab).map(function (k) {
        var a = ab[k], p = Math.round(a.ok / a.n * 100);
        return "<tr><td>" + AB[k] + "</td><td>" + a.ok + " / " + a.n + " · " + (p >= 55 ? "✓" : "✗ (mínimo 55 %)") + "</td></tr>";
      }).join("") + "</table>";
    }
    if (round.kind === "boss") {
      html += r.passed
        ? '<p style="margin-top:14px">Semana ' + Math.min(52, view.week + 1) +
          " desbloqueada. +" + Engine.XP.boss + " xp</p>"
        : '<p style="margin-top:14px">Hace falta <b>85%</b> de aciertos. ' +
          "Repasá el briefing y volvé a intentarlo.</p>";
    }

    if (r.won && r.won.length) {
      html += "<h3>Medallas nuevas</h3>" + r.won.map(function (b) {
        return "<p>🏅 <b>" + esc(b.name) + "</b> — " + esc(b.desc) + "</p>";
      }).join("");
    }

    // One line per item, the question on the left, the answer on the right.
    var seenW = {};
    var wrong = round.log.filter(function (l) {
      if (l.verdict === Engine.VERDICT.RIGHT || seenW[l.id]) return false;
      seenW[l.id] = 1;
      return true;
    });
    if (wrong.length) {
      html += "<h3>Lo que aprendiste hoy (vuelve en la Revisão)</h3><table class=\"res\">" +
        wrong.slice(0, 10).map(function (l) {
          var q = l.es || (l.stem && !/^\s*_+\s*$/.test(l.stem) ? l.stem : "") || l.prompt || "—";
          return "<tr><td>" + esc(String(q).replace(/_{3,}/g, "…")) + "</td><td>" +
            esc(l.answer) + "</td></tr>";
        }).join("") + "</table>" +
        (wrong.length > 10 ? '<p class="muted">y ' + (wrong.length - 10) + " más en la Revisão.</p>" : "");
    }

    html += '<div class="row" style="margin-top:16px">' +
      (round.from === "briefing" ? '<button class="btn" id="backweek">← Seguir la trilha</button>' : "") +
      '<button class="btn' + (round.from === "briefing" ? " ghost" : "") + '" id="again">Otra ronda</button>' +
      '<button class="btn ghost" id="toggi">Inicio</button>' +
      "</div></div>";
    return html;
  }

  /* ----------------------------------------------------------------- relâmpago */

  var LAMPO_MS = 60000;

  /* The words the learner holds (two successes or more): the material of
     the recognition-fluency game (Nation 2007: fluency is built on known
     material, under time pressure). */
  function matureWords() {
    var out = [];
    Object.keys(state.cards).forEach(function (id) {
      var w = id.indexOf("v:") === 0 ? id.slice(2) : id.indexOf("b:voc:") === 0 ? id.slice(6) : null;
      if (w && w.length >= 4 && w.indexOf(" ") < 0 && (state.cards[id].ok || 0) >= 2) out.push(w);
    });
    return out;
  }
  // Real word or pseudo-word, in under a second (Segalowitz 2010; Elgort 2011).
  function parolaItem() {
    var pool = matureWords();
    var w = pool[Math.floor(Math.random() * pool.length)] || "casa";
    var fake = window.Freq && Freq.loaded() && Math.random() < 0.5 ? Freq.pseudo(w) : null;
    return { kind: "parole", stem: fake || w, real: !fake, options: ["✓ Palavra", "✗ Não é palavra"],
             answer: fake ? "✗ Não é palavra" : "✓ Palavra" };
  }
  function lampoNext() { return lampo.mode === "parole" ? parolaItem() : Drills.lampoItem(state); }

  function startLampo(mode) {
    lampo = { end: Date.now() + LAMPO_MS, right: 0, wrong: 0, mode: mode === "parole" ? "parole" : "frasi",
              lock: false, timer: null, done: false };
    lampo.item = lampoNext();
    view.screen = "lampo";
    render();
    lampo.timer = setInterval(tickLampo, 100);
  }

  function tickLampo() {
    if (!lampo || lampo.done) return;
    var left = lampo.end - Date.now();
    var bar = $("#lbar"), sec = $("#lsec");
    if (bar) bar.style.width = Math.max(0, left / LAMPO_MS * 100) + "%";
    if (sec) sec.textContent = Math.max(0, Math.ceil(left / 1000)) + "″";
    if (left <= 0) finishLampo();
  }

  function renderLampo() {
    var it = lampo.item;
    return '<div class="hud"><span class="lsec" id="lsec">60″</span>' +
      '<span class="progressline lampobar"><i id="lbar" style="width:100%"></i></span>' +
      '<span class="combo">✓ ' + lampo.right + "</span>" +
      '<button class="btn ghost" id="lquit">✕</button></div>' +
      '<div class="card lampocard">' +
        '<div class="prompt">' + (lampo.mode === "parole" ? "🧠 ¿Es una palabra portuguesa?" : "⚡ ¿Cómo se dice?") + "</div>" +
        '<div class="stem' + (lampo.mode === "parole" ? " big" : "") + '">' + esc(it.stem) + "</div>" +
        '<div class="options">' + it.options.map(function (o, k) {
          return '<button class="opt" data-lopt="' + k + '">' + esc(o) + "</button>";
        }).join("") + "</div>" +
      "</div>" +
      '<p class="muted center">Error = −3 segundos. Récord: ' + ((state.best || {})[lampo.mode === "parole" ? "lampoParole" : "lampo"] || 0) + "</p>";
  }

  function lampoAnswer(btn) {
    if (lampo.lock || lampo.done) return;
    lampo.lock = true;
    var it = lampo.item;
    var ok = btn.textContent === it.answer;
    btn.classList.add(ok ? "right" : "wrong");
    if (ok) { lampo.right++; fx.right(); }
    else {
      lampo.wrong++; fx.wrong();
      lampo.end -= 3000;
      document.querySelectorAll("[data-lopt]").forEach(function (b) {
        if (b.textContent === it.answer) b.classList.add("right");
      });
    }
    setTimeout(function () {
      if (lampo.done) return;
      lampo.item = lampoNext();
      lampo.lock = false;
      render();
      tickLampo();
    }, ok ? 220 : 900);
  }

  function finishLampo() {
    if (!lampo || lampo.done) return;
    lampo.done = true;
    clearInterval(lampo.timer);
    if (!state.best) state.best = {};
    var key = lampo.mode === "parole" ? "lampoParole" : "lampo";
    var record = lampo.right > (state.best[key] || 0);
    if (record) state.best[key] = lampo.right;
    var xp = lampo.right * (lampo.mode === "parole" ? 2 : 3);
    gain(xp);
    Engine.addStrand(state, "fluidez", xp);
    var won = Engine.checkBadges(state);
    persist();
    renderHeader();
    view.screen = "lampofine";
    view.result = { record: record, xp: xp, won: won };
    if (record && lampo.right > 0) { fx.goal(); confetti(); }
    render();
  }

  function renderLampoFine() {
    var r = view.result;
    return "<h1>" + (r.record ? "⚡ ¡Nuevo récord!" : "⚡ Tiempo") + "</h1>" +
      '<div class="card center"><div class="scorebig"><b>' + lampo.right +
      "</b><span>aciertos</span><span>+" + r.xp + " xp</span></div>" +
      '<p class="muted">Errores: ' + lampo.wrong + " · récord: " + state.best[lampo.mode === "parole" ? "lampoParole" : "lampo"] + "</p>" +
      ((r.won || []).map(function (b) {
        return "<p>🏅 <b>" + esc(b.name) + "</b> — " + esc(b.desc) + "</p>";
      }).join("")) +
      '<div class="row centerrow"><button class="btn" id="lagain">Otra vez</button>' +
      '<button class="btn ghost" id="toggi">Inicio</button></div></div>';
  }

  /* ------------------------------------------------------------ desafíos */

  function renderSfide(w) {
    var ids = {};
    (w.challenges || []).forEach(function (id) { ids[id] = true; });
    var list = course.challenges.filter(function (c) { return ids[c.id]; });
    var playable = list.filter(function (c) { return c.play && c.play.length; });
    var doneN = playable.filter(function (c) { return (state.challengeLog[c.id] || {}).q === 2; }).length;

    var html = '<button class="btn ghost" id="back2">← a la semana</button>' +
      "<h1>Desafios</h1>" +
      '<p class="lead">Desafíos extra de la semana: cada uno es una ronda corta, con corrección. ' +
      "Con 80% o más lo ganás ★.</p>" +
      (playable.length ? '<div class="card pathsum"><b>' + doneN + " / " + playable.length + ' ★</b>' +
        '<span class="goalbar"><i style="width:' + Math.round(doneN / playable.length * 100) + '%"></i></span></div>' : "") +
      '<div class="missions">';

    list.forEach(function (c) {
      var done = state.challengeLog[c.id];
      var title = esc(c.consigna || c.instruction);
      if (c.play && c.play.length) {
        html += '<button class="mission' + (done && done.q === 2 ? " done" : "") + '" data-sfida="' + c.id + '">' +
          '<span class="mi">' + (done && done.q === 2 ? "★" : "📖") + "</span>" +
          "<span><b>" + title + "</b><small>" + c.play.length + " preguntas" + (c.chapter ? " · cap. " + esc(c.chapter) : "") +
          (done && done.pct != null ? " · mejor: " + done.pct + "%" : "") + "</small></span>" +
          '<span class="go">›</span></button>';
      } else {
        html += '<div class="card chal"><div class="inst">' + title + "</div><ol>" +
          c.items.map(function (i) { return "<li>" + esc(i.text) + "</li>"; }).join("") + "</ol>" +
          '<p class="muted">Ejercicio libre: resolvelo por escrito y puntuate.</p>' +
          '<div class="selfscore">' +
            '<button class="btn ghost" data-self="' + c.id + '" data-q="2">Lo tuve bien</button>' +
            '<button class="btn ghost" data-self="' + c.id + '" data-q="1">A medias</button>' +
            '<button class="btn ghost" data-self="' + c.id + '" data-q="0">No me salió</button>' +
            (done ? '<span class="muted" style="align-self:center">✓ ' + ["no salió", "a medias", "bien"][done.q] + "</span>" : "") +
          "</div></div>";
      }
    });
    return html + "</div>";
  }


  /* ------------------------------------------------------------------- eu */

  function renderIo() {
    var lv = Engine.levelFor(state.xp);
    var phrasesKnown = Object.keys(state.cards).filter(function (k) {
      return k.indexOf("frase:") === 0;
    }).length;
    var nextRank = null;
    Engine.RANKS.forEach(function (r) { if (!nextRank && r[0] > lv.level) nextRank = r; });

    return "<h1>Eu</h1>" +
      '<div class="card rank"><div class="rk">' + esc(Engine.rankFor(lv.level)) + "</div>" +
        '<div class="muted">nivel ' + lv.level + " · " + state.xp + " xp totales" +
        (nextRank ? " · próximo rango: <b>" + esc(nextRank[1]) + "</b> en el nivel " +
          nextRank[0] : "") + "</div></div>" +

      '<div class="card"><h2>Ajustes</h2>' +
        '<label class="set"><span>Meta diaria</span><select id="goal">' +
          [[100, "Relajada · 100 xp (2 o 3 pausas; 50 el finde)"], [200, "Normal · 200 xp (4 o 5 pausas; 100 el finde)"],
           [350, "Seria · 350 xp"], [500, "Intensa · 500 xp"]].map(function (g) {
            return '<option value="' + g[0] + '"' + (state.goal === g[0] ? " selected" : "") +
              ">" + g[1] + "</option>";
          }).join("") + "</select></label>" +
        '<label class="set"><span>Tema<small>el ☀️/🌙 de arriba también lo cambia</small></span><select id="theme-set">' +
          [["", "Como el teléfono"], ["light", "Claro ☀️"], ["dark", "Oscuro 🌙"]].map(function (t) {
            return '<option value="' + t[0] + '"' + ((state.theme || "") === t[0] ? " selected" : "") + ">" + t[1] + "</option>";
          }).join("") + "</select></label>" +
        '<label class="set"><span>Modo oficina 🤫<small>nada suena solo; el 🔊 sigue andando si lo tocás</small></span>' +
          '<input type="checkbox" id="silent"' + (state.silent ? " checked" : "") + "></label>" +
        '<label class="set"><span>Recordatorio diario<small>se agrega a tu calendario</small></span>' +
          '<span class="row"><input type="time" id="remtime" value="' +
            esc(state.remind || "13:30") + '"><button class="btn ghost" id="remind">📅 Agregar</button></span></label>' +
      "</div>" +

      planCard() +
      memoriaCard() +
      lessicoCard() +
      '<div class="card"><h2>Tu copia</h2>' +
        '<p class="muted">Todo tu progreso vive <b>solo en este teléfono</b>, sin cuentas ni servidores. ' +
        "Si borrás los datos del navegador se pierde: guardá una copia de vez en cuando.</p>" +
        '<div class="row"><button class="btn" id="export">💾 Guardar copia</button>' +
        '<button class="btn ghost" id="import">📂 Restaurar copia</button>' +
        '<input type="file" id="importfile" accept="application/json,.json" hidden></div>' +
        '<p class="muted" id="persistmsg" style="margin-top:10px"></p>' +
      "</div>" +

      errorsCard() +
      aiCard() +
      (window.Voci && Voci.count() ? (function () {
        var cr = Voci.credits();
        return '<div class="card"><h2>🎙️ Voces reales</h2><p class="muted small">Sons usa grabaciones de hablantes reales para ' + Voci.count() +
          " palabras. Voces de Lingua Libre (Wikimedia Commons), licencia CC BY-SA 4.0: " + Object.keys(cr).map(esc).join(", ") + ".</p></div>";
      })() : "") +
      (window.VociCV && (VociCV.ALL || []).length ? '<div class="card"><h2>🗣️ Oraciones grabadas</h2><p class="muted small">El dictado de Sons y «¿Qué forma escuchaste?» usan ' +
        VociCV.ALL.length + " oraciones leídas por voluntarios de Common Voice (Mozilla), de dominio público (CC0).</p></div>" : "") +
      '<div class="card"><h2>Medallas</h2><div class="badges">' +
        Engine.BADGES.map(function (b) {
          var won = state.badges.indexOf(b.id) >= 0;
          return '<div class="badge' + (won ? " won" : "") + '">' +
            '<div class="ico">' + (won ? "🏅" : "🔒") + "</div>" +
            "<b>" + esc(b.name) + "</b><span>" + esc(b.desc) + "</span></div>";
        }).join("") +
      "</div></div>" +

      '<div class="card"><h2>Estadísticas</h2><table class="res">' +
        "<tr><td>Frases de conversación vistas</td><td>" + phrasesKnown + " / " +
          Frasi.ALL.length + "</td></tr>" +
        "<tr><td>Frases escritas de memoria</td><td>" + (state.written || 0) + "</td></tr>" +
        "<tr><td>Récord Relâmpago</td><td>" + ((state.best || {}).lampo || 0) + "</td></tr>" +
        "<tr><td>Mejor combo</td><td>" + ((state.best || {}).combo || 0) + "</td></tr>" +
        "<tr><td>Respuestas totales</td><td>" + state.totals.attempts + "</td></tr>" +
        "<tr><td>Correctas</td><td>" + state.totals.right + "</td></tr>" +
        "<tr><td>Fichas en repaso</td><td>" + Object.keys(state.cards).length + "</td></tr>" +
        "<tr><td>Semana desbloqueada</td><td>" + state.unlocked + "/52</td></tr>" +
      "</table>" +
      '<div class="row" style="margin-top:14px">' +
        '<button class="btn ghost" id="reset">Borrar mi progreso</button>' +
      "</div></div>" + versionLine();
  }

  /* Meta y récords: el «yo ideal» con las palabras del alumno, los récords
     personales y la tarjeta para compartir. */
  function planCard() {
    var id = state.ideal || {}, rec = state.records || {};
    var why = WHY.filter(function (w) { return w[0] === id.why; })[0];
    return '<div class="card" id="plancard"><h2>🎯 Tu meta</h2>' +
      '<span class="chips">' + WHY.map(function (w) { return '<button class="tab' + (id.why === w[0] ? " on" : "") + '" data-why3="' + w[0] + '">' + w[1] + "</button>"; }).join("") + "</span>" +
      '<label class="set"><span>Con tus palabras<small>«En seis meses pido un açaí en Ipanema sin pensar»</small></span></label>' +
      '<div class="typed"><input id="idealtext" maxlength="120" value="' + esc(id.text || "") + '" placeholder="En seis meses…"><button class="tab" id="idealsave">Guardar</button></div>' +
      (why || id.text ? '<p class="muted small">Tu meta: ' + (why ? esc(why[1]) : "") + (id.text ? " · «" + esc(id.text) + "»" : "") + "</p>" : "") +
      '<h3>🏅 Récords personales</h3><table class="res">' +
        "<tr><td>Mejor sesión</td><td>" + (rec.sessione || 0) + " %</td></tr>" +
        "<tr><td>Semanas seguidas con tres días</td><td>" + (rec.settimane || Engine.weekStreak(state)) + "</td></tr>" +
        "<tr><td>Palabras nuevas en una semana</td><td>" + (rec.parole || 0) + "</td></tr>" +
        "<tr><td>Errores corregidos por vos en una ronda</td><td>" + (rec.corrette || 0) + "</td></tr>" +
        "<tr><td>Relâmpago · Palavra ou não?</td><td>" + ((state.best || {}).lampo || 0) + " · " + ((state.best || {}).lampoParole || 0) + "</td></tr>" +
      "</table>" +
      '<div class="row" style="margin-top:10px"><button class="btn ghost" id="share">📤 Compartir mi semana</button></div>' +
      "</div>";
  }

  /* El léxico por frecuencia (Nation 2006; data/frequenza.json): cuánto del
     vocabulario de cada nivel conocés, y las palabras frecuentes que faltan,
     listas para practicar. */
  function knownWords() {
    return Freq.knownLemmas(state, {
      phrase: function (id) { var f = Frasi.BY_ID[id]; return f ? f.it : ""; },
      texts: Object.keys(state.letture || {}).map(function (id) { var ep = Letture.byId(id); return ep ? ep.text : ""; })
    });
  }
  // The frequent words up to the learner's level that the bank can teach.
  function freqGaps(n) {
    if (!window.Freq || !Freq.loaded() || !Banca.loaded()) return [];
    var lvl = state.unlocked <= 13 ? "A1" : state.unlocked <= 26 ? "A2" : state.unlocked <= 39 ? "B1" : "B2";
    return Freq.nextWords(knownWords(), lvl, 400).filter(Banca.hasWord).slice(0, n || 10);
  }
  function lessicoCard() {
    if (!window.Freq || !Freq.loaded()) return "";
    var known = knownWords(), cov = Freq.coverage(known), gaps = freqGaps(8);
    var bars = ["A1", "A2", "B1", "B2", "C1"].map(function (l) {
      var c = cov.levels[l], p = c[1] ? Math.round(c[0] / c[1] * 100) : 0;
      return '<div class="eb"><span>' + l + "</span><i style=\"width:" + p + '%"></i><b>' + c[0] + " / " + c[1] + "</b></div>";
    }).join("");
    return '<div class="card"><h2>📚 Tu vocabulario</h2>' +
      '<p class="muted">Palabras por frecuencia (listas de frecuencia del portugués de Brasil): las 2.000 más frecuentes cubren más del 80 % de lo que se dice. ' +
      "Conocés <b>" + cov.fundamental[0] + " / " + cov.fundamental[1] + "</b> de las fundamentales (A1 y A2).</p>" +
      '<div class="errbars">' + bars + "</div>" +
      (gaps.length ? '<p class="muted small" style="margin-top:10px">Frecuentes que te faltan: <i>' + gaps.map(esc).join(", ") + "</i>.</p>" +
        '<div class="row"><button class="btn" data-bank="b-freq">Practicar estas</button></div>' : "") +
      "</div>";
  }

  /* La memoria: cuántas fichas aprendiendo, en repaso y en mantenimiento,
     la probabilidad media de recordarlas hoy, la velocidad de olvido
     estimada con tus propios repasos, y los ajustes (retención,
     noche/mañana). */
  function memoriaCard() {
    var m = Engine.memoryStats(state), sp = state.speed || {};
    var speedLine = function (k, name) {
      var x = sp[k];
      if (!x || !x.n || x.n < 100) return name + ": todavía pocos repasos (" + ((x && x.n) || 0) + " de 100) para medir tu curva.";
      return name + ": " + (x.k === 1 ? "como el promedio" : x.k > 1 ? "olvidás " + Math.round((x.k - 1) * 100) + " % más lento que el promedio"
        : "olvidás " + Math.round((1 - x.k) * 100) + " % más rápido que el promedio") + " (" + x.n + " repasos).";
    };
    return '<div class="card"><h2>🧠 Tu memoria</h2>' +
      '<table class="res">' +
        "<tr><td>Fichas aprendiendo</td><td>" + m.learn + "</td></tr>" +
        "<tr><td>En repaso</td><td>" + m.rev + "</td></tr>" +
        "<tr><td>En mantenimiento (meses)</td><td>" + m.maint + "</td></tr>" +
        "<tr><td>Probabilidad media de recordarlas hoy</td><td>" + m.recall + " %</td></tr>" +
      "</table>" +
      '<p class="muted small">' + speedLine("v", "Vocabulario") + " " + speedLine("g", "Gramática") + "</p>" +
      '<label class="set"><span>Qué tan seguro querés recordar<small>menos = menos repasos por día</small></span><select id="retention">' +
        [[0.85, "Relajado · 85 %"], [0.9, "Normal · 90 %"], [0.95, "Examen · 95 %"]].map(function (r) {
          return '<option value="' + r[0] + '"' + ((state.retention || 0.9) === r[0] ? " selected" : "") + ">" + r[1] + "</option>";
        }).join("") + "</select></label>" +
      '<label class="set"><span>Noche y mañana 🌙☀️<small>lo nuevo después de las 20 h vuelve al desayuno, con el sueño en el medio</small></span>' +
        '<input type="checkbox" id="notte"' + (state.notte !== false ? " checked" : "") + "></label>" +
      "</div>";
  }

  /* El cuaderno del portuñol (la guía; los «pontos críticos» de Grannier y
     Almeida Filho): las interferencias que se fosilizan, con el estado de
     cada una.  Las claves son categorías del diagnóstico (diagnosi.js); si
     el diagnóstico trae su propia lista (Diagnosi.PORTUNOL), manda esa. */
  var PORTUNOL = [["contraccion", "contracciones: no, na, do, pelo (nunca «em o»)"],
                  ["genero", "género distinto: o leite, a viagem, o nariz"],
                  ["espanol", "castellano metido: muy, más, pero, yo"],
                  ["regencia", "regencia: gostar de, pensar em, sonhar com"],
                  ["tilde", "tildes: avó / avô, é / e, você"],
                  ["crase", "crase: vou à praia, às duas"],
                  ["articulo", "artículo con posesivo y nombre: a minha casa, o João"],
                  ["pronome", "pronombres: me dá, para mim, conosco"],
                  ["plural", "plurales: limões, animais, homens"],
                  ["perfeito_composto", "«he comido» es comi (tenho comido = vengo comiendo)"],
                  ["futuro_subj", "futuro do subjuntivo: quando eu for, se você quiser"],
                  ["falso_amigo", "falsos amigos: esquisito, polvo, borracha, apelido"]];
  /* The AI corrector: the key, and the corrections it disputed (so the
     learner can pass them on in one go instead of explaining each). */
  function aiCard() {
    var notes = state.aiNotes || [];
    return '<div class="card" id="aicard"><h2>🤖 Corrector con IA</h2>' +
      '<p class="muted small">Con una clave gratuita, Escreva corrige tu texto entero y en cualquier ejercicio aparece «🤖 Explicame».</p>' +
      aiKeyFields() +
      (notes.length ? "<h3>Correcciones para revisar (" + notes.length + ")</h3>" +
        '<p class="muted small">La IA cree que en estos casos tu respuesta también valía o la corrección de la app no era buena. Copialas y pegámelas todas juntas.</p>' +
        '<ul class="ainotes">' + notes.slice(0, 8).map(function (n) {
          return "<li><b>" + esc(n.given || "—") + "</b> ≠ " + esc(n.answer || "") + ' <small class="muted">' + esc((n.stem || "").slice(0, 60)) + "</small></li>";
        }).join("") + "</ul>" +
        '<div class="row"><button class="tab" id="aicopy">📋 Copiar todas</button><button class="tab" id="aiclear">Borrar</button></div>' : "") +
      "</div>";
  }

  function itanolCard() {
    var errs = state.errs || {}, now = Date.now();
    var list = (window.Diagnosi && Diagnosi.PORTUNOL) || PORTUNOL;
    return '<div class="card"><h2>📓 Cuaderno de portuñol</h2>' +
      '<p class="muted">Las interferencias del español que se fosilizan. Verde: catorce días sin ese error.</p>' +
      '<ul class="itanol">' + list.map(function (x) {
        var e = errs[x[0]], quiet = !e || now - (e.last || 0) > 14 * 86400000;
        return "<li><span>" + (quiet ? "🟢" : "🔴") + "</span><span>" + esc(x[1]) +
          (e ? ' <small class="muted">· ' + e.n + (e.fixed ? " · " + e.fixed + " corregidos" : "") + "</small>" : "") + "</span></li>";
      }).join("") + "</ul></div>";
  }

  function errorsCard() {
    var errs = state.errs || {};
    var cats = Object.keys(errs).sort(function (a, b) { return errs[b].n - errs[a].n; });
    if (!cats.length) return itanolCard();
    var max = errs[cats[0]].n;
    return '<div class="card"><h2>Tus errores</h2>' +
      '<p class="muted">Se registran solos cuando te equivocás. Los que corregís vos mismo cuentan como avance.</p>' +
      '<div class="errbars">' + cats.slice(0, 8).map(function (c) {
        var e = errs[c];
        return '<div class="eb"><span>' + esc(Diagnosi.LABEL[c] || c) + "</span>" +
          '<i style="width:' + Math.round(e.n / max * 100) + '%"></i>' +
          "<b>" + e.n + (e.fixed ? ' <small>· ' + e.fixed + (e.fixed === 1 ? " corregido" : " corregidos") + "</small>" : "") + "</b></div>";
      }).join("") + "</div>" +
      ((state.errLog || []).length ? '<h3>Últimos</h3><table class="res">' + state.errLog.slice(0, 6).map(function (l) {
        return "<tr><td>" + esc(l.g) + "</td><td>" + esc(l.e) + "</td></tr>";
      }).join("") + "</table>" : "") +
      (Banca.loaded() && Banca.weakest(state, 1).length
        ? '<div class="row" style="margin-top:12px"><button class="btn" data-bank="clinica">🩺 Ir a la clínica</button></div>' : "") +
      "</div>" + itanolCard();
  }

  function stamp() {
    var d = new Date();
    function p(n) { return (n < 10 ? "0" : "") + n; }
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  function exportSave() {
    var name = "rumo-c1-copia-" + stamp() + ".json";
    var blob = new Blob([JSON.stringify(state)], { type: "application/json" });
    // On phones, the share sheet lets you drop the file in Drive, mail or chat.
    try {
      var file = new File([blob], name, { type: "application/json" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: "Copia de Rumo C1" })
          .catch(function () { download(blob, name); });
        return;
      }
    } catch (e) { /* sin share */ }
    download(blob, name);
  }

  function download(blob, name) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function importSave(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var s = JSON.parse(reader.result);
        if (typeof s.xp !== "number" || !s.cards) throw new Error("formato");
        if (!confirm("Esto reemplaza tu progreso actual por la copia (" + s.xp +
                     " xp). ¿Seguir?")) return;
        state = Engine.sanitize(Engine.migrateSyllabus(s));
        persist();
        renderHeader();
        render();
        toast("✓ Copia restaurada.");
      } catch (e) {
        toast("Ese archivo no es una copia válida.");
      }
    };
    reader.readAsText(file);
  }

  /* Un evento que se repite (.ics): el teléfono lo agrega al calendario y
     avisa todos los días, sin servidor ni notificaciones push. */
  function reminderIcs(hhmm) {
    var p = hhmm.split(":");
    var d = new Date();
    d.setHours(+p[0], +p[1], 0, 0);
    function two(n) { return (n < 10 ? "0" : "") + n; }
    var local = d.getFullYear() + two(d.getMonth() + 1) + two(d.getDate()) + "T" +
      two(d.getHours()) + two(d.getMinutes()) + "00";
    var end = new Date(d.getTime() + 5 * 60000);
    var localEnd = end.getFullYear() + two(end.getMonth() + 1) + two(end.getDate()) + "T" +
      two(end.getHours()) + two(end.getMinutes()) + "00";
    var url = location.href.split("#")[0];
    return [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Rumo C1//PT",
      "BEGIN:VEVENT",
      "UID:rumoc1-daily@" + location.host,
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
      "DTSTART:" + local,
      "DTEND:" + localEnd,
      "RRULE:FREQ=DAILY",
      "SUMMARY:☕ Cafezinho: 3 minutos de portugués",
      "DESCRIPTION:Racha en juego. Abrí Rumo C1: " + url,
      "URL:" + url,
      "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY",
      "DESCRIPTION:Bora! 3 minutos de portugués", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
  }

  /* ---------------------------------------------------------------- router */

  var TABS = [["oggi", "☀️", "Hoje"], ["frasi", "🏄", "Treino"], ["leggi", "📖", "Ler"],
              ["percorso", "🧭", "Trilha"], ["io", "👤", "Eu"]];

  function renderNav() {
    var nav = $("#nav");
    if (!nav) return;
    var inGame = ["gioco", "lampo", "lezione"].indexOf(view.screen) >= 0;
    nav.hidden = inGame;
    nav.innerHTML = TABS.map(function (t) {
      return '<button class="' + (view.tab === t[0] ? "on" : "") + '" data-tab="' + t[0] + '">' +
        '<span>' + t[1] + "</span>" + t[2] + "</button>";
    }).join("");
    nav.querySelectorAll("[data-tab]").forEach(function (b) {
      b.onclick = function () { go(b.dataset.tab); };
    });
  }

  function render() {
    var html = "";
    var s = view.screen;
    if (s === "oggi") html = renderOggi();
    else if (s === "frasi") html = renderFrasi();
    else if (s === "percorso") html = renderPercorso();
    else if (s === "io") html = renderIo();
    else if (s === "briefing") html = renderBriefing(course.weeks[view.week - 1]);
    else if (s === "teoria") html = renderTeoria(course.weeks[view.week - 1]);
    else if (s === "sfide") html = renderSfide(course.weeks[view.week - 1]);
    else if (s === "gioco") html = renderGioco();
    else if (s === "risultato") html = renderRisultato();
    else if (s === "lampo") html = renderLampo();
    else if (s === "lampofine") html = renderLampoFine();
    else if (s === "leggi") html = renderLeggi();
    else if (s === "lettura") html = renderLettura(Letture.byId(view.ep));
    else if (s === "lezione") html = renderLezione();
    else if (s === "scrivi") html = renderScrivi(course.weeks[view.week - 1]);
    else if (s === "dictogloss") html = renderDictogloss(course.weeks[view.week - 1]);
    else if (s === "parla") html = renderParla(course.weeks[view.week - 1]);
    else if (s === "esame") html = renderEsame();
    else if (s === "esame-asc") html = renderEsameAscolto();
    else if (s === "esame-let") html = renderEsameLettura();
    else if (s === "esame-scr") html = renderEsameScrittura();
    else if (s === "storia") html = renderStoria(course.weeks[view.week - 1]);

    var gb = $("#glossbox");
    if (gb) gb.classList.remove("on");
    guardUntil = Date.now() + 300;
    guardAt = lastTap;
    // Inside a game or a text, the phone's back button returns to the tab
    // instead of closing the app.
    if (TABS.every(function (t) { return t[0] !== s; }) && !subEntry && window.history && history.pushState) {
      try { history.pushState({ sub: 1 }, ""); subEntry = true; } catch (e) { /* */ }
    }
    app().innerHTML = html;
    document.body.classList.toggle("ingame", s === "gioco" || s === "lampo" || s === "lezione");
    var pl = document.querySelector(".progressline i[data-to]");
    if (pl) requestAnimationFrame(function () { requestAnimationFrame(function () { pl.style.width = pl.dataset.to + "%"; }); });
    renderNav();
    wire();
    growBoxes();
  }

  var subEntry = false;
  window.addEventListener("popstate", function () {
    subEntry = false;
    if (!course || TABS.some(function (t) { return t[0] === view.screen; })) return;
    if (view.screen === "gioco") toast("Ronda interrumpida. Lo que respondiste ya quedó guardado.");
    go(view.tab || "oggi");
  });

  /* Another tab (or the installed app next to the browser) saved: take its
     progress instead of overwriting it with ours on the next save. */
  window.addEventListener("storage", function (e) {
    if (e.key !== Engine.STORAGE_KEY || !e.newValue) return;
    state = Engine.load();
    if (!course) return;
    renderHeader();
    if (["gioco", "lampo", "lettura"].indexOf(view.screen) < 0) render();
  });

  /* Answer boxes are textareas: long answers wrap and stay visible.  Enter
     sends (as before); Shift+Enter is a new line; the box grows with the text. */
  function growBoxes() {
    document.querySelectorAll("textarea.grow").forEach(function (t) {
      var fit = function () { t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight + 2, 220) + "px"; };
      t.addEventListener("input", fit);
      fit();
    });
  }

  function on(sel, fn) { var b = $(sel); if (b) b.onclick = fn; }

  /* A double tap on «Próxima» must not answer the next question: taps
     right after a screen change are swallowed. */
  /* Only a tap in the same spot as the one that changed the screen is a
     double tap; a quick tap somewhere else is the learner answering fast. */
  var guardUntil = 0, lastTap = null, guardAt = null;
  document.addEventListener("pointerdown", function (e) { lastTap = { x: e.clientX, y: e.clientY }; }, true);
  document.addEventListener("click", function (e) {
    var near = !guardAt || e.clientX == null ||
      (Math.abs(e.clientX - guardAt.x) < 48 && Math.abs(e.clientY - guardAt.y) < 48);
    if (Date.now() < guardUntil && near && !(window.__test && window.__test.fast) && app().contains(e.target)) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);

  function wire() {
    document.querySelectorAll("[data-week]").forEach(function (b) {
      b.onclick = function () {
        view.week = +b.dataset.week;
        view.screen = "briefing";
        view.tab = "percorso";
        render();
        window.scrollTo(0, 0);
      };
    });
    document.querySelectorAll("[data-scene]").forEach(function (b) {
      b.onclick = function () { startRound("scene", b.dataset.scene); };
    });

    on("#back", function () { go("percorso"); });
    on("#toggi", function () { go("oggi"); });

    // hoje
    on("#pausa", function () { startRound("pausa"); });
    on("#giorno", function () { startRound("giorno"); });
    on("#lampo", function () { startLampo("frasi"); });
    on("#scena", function () { startRound("scene", Drills.nextScene(state).id); });
    on("#rev", function () { startRound("review"); });
    on("#sayfdg", function () { var fd = Frasi.ofTheDay(new Date(), Math.min(state.unlocked || 1, 52)); speak(fd.pt || fd.it, true); });
    on("#firstles", function () { view.week = 1; startLezione(); });
    on("#install", function () {
      if (!installPrompt) return;
      installPrompt.prompt();
      installPrompt = null;
    });
    on("#chest", function () {
      var prize = Engine.openChest(state);
      if (!prize) return;
      persist();
      renderHeader();
      fx.goal();
      confetti();
      toast(prize.label, 3000);
      render();
    });

    // teoria e briefing
    on("#teo", function () { view.screen = "teoria"; render(); window.scrollTo(0, 0); });
    ["#tback", "#tback2"].forEach(function (sel) {
      on(sel, function () { view.screen = "briefing"; render(); });
    });
    on("#tdone", function () {
      var w = course.weeks[view.week - 1];
      if (!state.read) state.read = {};
      if (!state.read[w.week]) {
        state.read[w.week] = Date.now();
        gain(Engine.XP.lesson);
        var won = Engine.checkBadges(state);
        persist();
        renderHeader();
        toast(won.length ? "🏅 " + won[0].name : "+" + Engine.XP.lesson + " xp");
      }
      view.screen = "briefing";
      render();
    });
    on("#tplay", function () {
      startRound(course.weeks[view.week - 1].boss ? "boss" : "round");
    });
    document.querySelectorAll("[data-say]").forEach(function (b) {
      b.onclick = function () { speak(sayIndex[b.dataset.say] || (/^\d+-\d+$/.test(b.dataset.say) ? "" : b.dataset.say), true); };
    });
    on("#play", function () {
      startRound(course.weeks[view.week - 1].boss ? "boss" : "round");
    });
    on("#gym", function () { startRound("gym"); });
    on("#vocab", function () { startRound("vocab"); });
    on("#lez", function () { startLezione(); });
    on("#lesnextpart", function () { var b = $("#lesnextpart"); startLezione(+b.dataset.part); });
    on("#play2", function () { startRound("round"); });
    document.querySelectorAll("[data-m]").forEach(function (b) {
      b.onclick = function () { goMission(b.dataset.m, b.dataset.arg); };
    });
    on("#heronext", function () {
      var w = course.weeks[Math.min(state.unlocked, 52) - 1];
      var nm = nextMission(w);
      if (!nm) return;
      view.week = w.week; view.tab = "percorso";
      goMission(nm.kind, nm.arg);
    });
    on("#topercorso", function () { go("percorso"); });
    on("#backweek", function () { view.tab = "percorso"; view.screen = "briefing"; render(); window.scrollTo(0, 0); });
    on("#lesnext", lesNext);
    on("#lesquit", function () { clearPending(); view.screen = "briefing"; render(); });
    on("#resume", resumePending);
    on("#discard", function () { clearPending(); render(); });
    wireHabit();
    on("#lesback", function () { view.screen = "briefing"; render(); });
    on("#lesplay", function () {
      var lw = course.weeks[view.week - 1];
      startRound(lw.boss ? "boss" : "round", !lw.boss && les && les.part != null ? "part:" + les.part : undefined);
    });
    document.querySelectorAll("[data-lq]").forEach(function (b) { b.onclick = function () { lesAnswer(b); }; });
    on("#chal", function () { view.screen = "sfide"; render(); window.scrollTo(0, 0); });
    on("#back2", function () { view.screen = "briefing"; render(); });
    document.querySelectorAll("[data-sfida]").forEach(function (b) {
      b.onclick = function () { startRound("sfida", b.dataset.sfida); };
    });
    on("#again", function () { startRound(round.kind, round.arg); });
    on("#quit", function () {
      clearPending();
      if (round.from === "briefing") { view.tab = "percorso"; view.screen = "briefing"; render(); window.scrollTo(0, 0); }
      else if (round.kind === "lettura") go("leggi");
      else if (["ponte", "falsi", "capire", "scene", "b-voc", "b-forme", "b-tr", "b-gap", "b-err", "b-freq", "clinica", "suoni", "duello"].indexOf(round.kind) >= 0) go("frasi");
      else if (round.kind === "pausa" || round.kind === "review" || round.kind === "giorno" || round.kind === "ritorno" || round.kind === "micro") go("oggi");
      else if (round.kind === "sfida") { view.screen = "sfide"; render(); }
      else if (round.kind === "esame") { view.screen = "esame"; render(); }
      else { view.screen = "briefing"; render(); }
    });

    // ler y laboratorio
    document.querySelectorAll("[data-bank]").forEach(function (b) {
      b.onclick = function () { startRound(b.dataset.bank); };
    });
    document.querySelectorAll("[data-lab]").forEach(function (b) {
      b.onclick = function () { startRound(b.dataset.lab); };
    });
    document.querySelectorAll("[data-duel]").forEach(function (b) {
      b.onclick = function () { startRound("duello", b.dataset.duel); };
    });
    document.querySelectorAll("[data-ep]").forEach(function (b) {
      b.onclick = function () {
        view.ep = b.dataset.ep;
        view.epFrom = null;
        view.tab = "leggi";
        view.screen = "lettura";
        render();
        window.scrollTo(0, 0);
      };
    });
    on("#lback", function () {
      if (view.epFrom === "briefing") { view.epFrom = null; view.tab = "percorso"; view.screen = "briefing"; render(); window.scrollTo(0, 0); }
      else go("leggi");
    });
    on("#lquiz", function () { startRound("lettura", view.ep); });
    on("#playlib", function () {
      var ids = Object.keys(state.letture || {}).filter(function (id) { return Letture.byId(id); });
      if (!ids.length) return toast("Todavía no terminaste ninguna lectura.");
      playLibrary(Drills.shuffle(ids));
    });
    document.querySelectorAll("[data-sg]").forEach(function (b) {
      b.onclick = function () { showGloss(stemGloss[+b.dataset.sg]); };
    });
    document.querySelectorAll("[data-mc]").forEach(function (b) {
      b.onclick = function () { askGloss(b); };
    });
    document.querySelectorAll("[data-gl]").forEach(function (b) {
      b.onclick = function () {
        showGloss(glossIndex[+b.dataset.gl]);
        speak(Letture.bare(b.textContent), false);
      };
    });

    // relâmpago
    document.querySelectorAll("[data-lopt]").forEach(function (b) {
      b.onclick = function () { lampoAnswer(b); };
    });
    on("#lquit", function () { go("oggi"); });
    on("#lagain", function () { startLampo(lampo.mode); });
    on("#lampoparole", function () { startLampo("parole"); });

    var mcb = $("#mcbox");
    if (mcb && view.screen !== "lettura") mcb.classList.remove("on");
    wireGioco();
    wireIo();
    wireScrivi();
    wireDictogloss();
    wireLettura();
    wireParla();
    wireStoria();
    wireEsame();

    document.querySelectorAll("[data-self]").forEach(function (b) {
      b.onclick = function () {
        var id = b.dataset.self, q = +b.dataset.q;
        state.challengeLog[id] = { q: q, at: Date.now() };
        gain(q === 2 ? Engine.XP.challenge : q === 1 ? 3 : 1);
        Engine.checkBadges(state);
        persist();
        renderHeader();
        render();
        toast("Anotado.");
      };
    });
  }

  /* ------------------------------------------------------------ dictogloss */

  /* Dictogloss (Wajnryb 1990; Swain & Lapkin): hear the text twice, note
     key words the second time, reconstruct it in writing.  Scored by the
     six chunks recovered (Yu, Boers & Tremblay 2025), then the local
     checker marks the rest. */
  var dg = null;
  function renderDictogloss(w) {
    var t = Suoni.dgFor(w.week);
    if (!t) return '<button class="btn ghost" id="dgback">← a la semana</button><p>Esta semana no tiene dictogloss.</p>';
    if (!dg || dg.week !== w.week) dg = { week: w.week, step: 0, plays: 0 };
    var done = (state.dictogloss || {})[w.week];
    var head = '<button class="btn ghost" id="dgback">← a la semana</button>' +
      '<h1 class="placa"><span class="p-sup">Dictogloss · Semana ' + w.week + '</span><span class="p-rua">' + esc(t.title) + "</span></h1>";
    if (dg.step === 0) {
      var second = dg.plays >= 1;
      return head + '<div class="card"><p>' + esc(t.es) + "</p>" +
        '<p class="muted">Vas a escuchar el texto <b>dos veces</b>. La primera, solo escuchá. En la segunda, anotá acá abajo ' +
        "las palabras que puedas. Después lo reconstruís en la app, con tus notas a la vista: no hace falta que sea igual, " +
        "sino que diga lo mismo con las expresiones del texto. Se puntúan <b>seis bloques</b>.</p>" +
        (done ? '<p class="note">Ya lo hiciste: ' + done.found + " / " + done.n + " bloques. Podés repetirlo.</p>" : "") +
        '<div class="center"><button class="bigplay" id="dgplay">🔊</button><p class="muted" id="dgstate">' +
          (dg.plays >= 2 ? "Listo: ahora reconstruilo" : second ? "Escucha 2 de 2: anotá mientras escuchás" : "Escucha 1 de 2") + "</p></div>" +
        '<div id="dgkeys">' + (second ? dgKeysHtml(t) : "") + "</div>" +
        '<label class="dgnotes"' + (second ? "" : " hidden") + '><span class="muted small">📝 Tus notas (palabras sueltas, como salgan)</span>' +
          '<textarea id="dgnotes" class="grow" rows="3" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="sábado… amigos… ainda bem…">' +
          esc(dg.notes || "") + "</textarea></label>" +
        '<button class="btn wide" id="dgwrite"' + (dg.plays >= 2 ? "" : " disabled") + '>Ya escuché las dos → reconstruir</button></div>';
    }
    if (dg.step === 1) {
      return head + '<div class="card">' +
        (dg.notes && dg.notes.trim() ? '<p class="muted small">📝 Tus notas</p><p class="dgnotesview it">' + esc(dg.notes) + "</p>" : "") +
        dgKeysHtml(t) +
        '<p class="muted small">Escribí acá el texto en portugués: lo que recordás y tus notas, con tus palabras donde haga falta. ' +
        "Bloques a recuperar: " + t.chunks.length + ".</p>" +
        '<textarea id="dgtext" class="grow scrivi" rows="7" spellcheck="false" autocapitalize="sentences" placeholder="Reconstrua o texto…">' + esc(dg.given || "") + "</textarea>" +
        '<div class="row" style="margin-top:10px"><button class="btn" id="dgcheck">Conferir</button>' +
        '<button class="tab" id="dgagain">🔊 escuchar otra vez (cuenta como ayuda)</button></div>' +
        '<div id="dgout"></div></div>';
    }
    var r = dg.result;
    return head + '<div class="card"><div class="scorebig"><b>' + r.found.length + " / " + r.n + '</b><span>bloques recuperados</span><span>+' + dg.xp + " xp</span></div>" +
      '<h3>El texto</h3><p class="muted small"><mark class="dgok">verde</mark>: lo recuperaste · <mark class="dgmiss">rojo</mark>: faltó</p>' +
      '<p class="model it">' + dgMarked(t.text, r) + "</p>" +
      (r.missed.length ? '<h3>Faltaron</h3><p>' + r.missed.map(esc).join(" · ") + "</p>" : "") +
      '<h3>Tu versión</h3><p class="dgnotesview it">' + esc(dg.given || "") + "</p>" +
      (dg.findings && dg.findings.length ? "<h3>Para revisar en tu versión</h3><ol class=\"findings\">" + dg.findings.map(function (f) { return "<li>" + mk(f.msg) + "</li>"; }).join("") + "</ol>" : "") +
      '<div class="row" style="margin-top:14px"><button class="btn" id="dgback2">← Seguir la trilha</button>' +
      '<button class="btn ghost" id="dgredo">Otra vez</button></div></div>';
  }
  function dgKeysHtml(t) {
    return '<p class="muted small">Palabras clave: <i>' + t.keywords.map(esc).join(" · ") + "</i></p>";
  }
  // The original text with each chunk marked: recovered in green, missed in red.
  function dgMarked(text, r) {
    var marks = [];
    [[r.found, "dgok"], [r.missed, "dgmiss"]].forEach(function (g) {
      g[0].forEach(function (c) {
        var at = text.toLowerCase().indexOf(String(c).toLowerCase());
        if (at >= 0 && !marks.some(function (m) { return at < m.end && at + c.length > m.at; })) marks.push({ at: at, end: at + c.length, cls: g[1] });
      });
    });
    marks.sort(function (a, b) { return a.at - b.at; });
    var out = "", pos = 0;
    marks.forEach(function (m) {
      out += esc(text.slice(pos, m.at)) + '<mark class="' + m.cls + '">' + esc(text.slice(m.at, m.end)) + "</mark>";
      pos = m.end;
    });
    return out + esc(text.slice(pos));
  }
  function wireDictogloss() {
    if (view.screen !== "dictogloss") return;
    var w = course.weeks[view.week - 1], t = Suoni.dgFor(w.week);
    var back = function () { dg = null; window.speechSynthesis && speechSynthesis.cancel(); view.tab = "percorso"; view.screen = "briefing"; render(); window.scrollTo(0, 0); };
    on("#dgback", back); on("#dgback2", back);
    if (!t) return;
    on("#dgplay", function () {
      var b = $("#dgplay"), st = $("#dgstate");
      if (!b || b.disabled) return;
      b.disabled = true;
      var second = dg.plays >= 1;
      if (second) {
        var k = $("#dgkeys"); if (k) k.innerHTML = dgKeysHtml(t);
        var nl = document.querySelector(".dgnotes"); if (nl) nl.hidden = false;
        var nt = $("#dgnotes"); if (nt) nt.focus();
      }
      if (st) st.textContent = second ? "Escucha 2 de 2: anotá mientras escuchás…" : "Escucha 1 de 2…";
      speak(t.text, true, 0.95, { onend: function () {
        dg.plays++;
        b.disabled = false;
        if (st) st.textContent = dg.plays >= 2 ? "Listo: ahora reconstruilo" : "Escucha 2 de 2: tocá 🔊 y anotá mientras escuchás";
        var wbtn = $("#dgwrite");
        if (wbtn && dg.plays >= 2) wbtn.disabled = false;
        noteListening(t.text.split(/\s+/).length * 0.45);
      } });
    });
    var notes = $("#dgnotes");
    if (notes) notes.oninput = function () { dg.notes = notes.value; };
    var draft = $("#dgtext");
    if (draft) draft.oninput = function () { dg.given = draft.value; };
    on("#dgwrite", function () { var n = $("#dgnotes"); if (n) dg.notes = n.value; dg.step = 1; render(); window.scrollTo(0, 0); });
    on("#dgagain", function () { dg.help = (dg.help || 0) + 1; speak(t.text, true, 0.95); });
    on("#dgcheck", function () {
      var box = $("#dgtext"), given = box ? box.value : "";
      if (!given.trim()) return;
      dg.given = given;
      var r = Suoni.dgScore(t, given);
      scriviLexicon();
      var chk = Scrivi.check(given, w.week);
      dg.findings = (chk.findings || []).filter(function (f) { return !f.soft; }).slice(0, 8);
      var first = !(state.dictogloss || {})[w.week];
      var xp = r.found.length * 8 + (r.found.length >= 5 ? 20 : 0) - Math.min(20, (dg.help || 0) * 5);
      xp = Math.max(5, first ? xp : Math.round(xp / 3));
      if (!state.dictogloss) state.dictogloss = {};
      var prev = state.dictogloss[w.week];
      state.dictogloss[w.week] = { found: Math.max(r.found.length, prev ? prev.found : 0), n: r.n, at: Date.now() };
      var before = doneCount(w);
      gain(xp);
      Engine.addStrand(state, "input", Math.round(xp / 2));
      Engine.addStrand(state, "output", Math.round(xp / 2));
      Engine.touchStreak(state);
      dg.findings.forEach(function (f) { recordError({ cat: f.cat, target: f.msg.replace(/\*/g, "").slice(0, 80) }, ""); });
      dg.extras = missionCheck(w.week, before);
      Engine.checkBadges(state);
      persist();
      renderHeader();
      dg.result = r; dg.xp = xp; dg.step = 2;
      render();
      if (r.found.length >= 5) setTimeout(confetti, 200);
      window.scrollTo(0, 0);
    });
    on("#dgredo", function () { dg = { week: w.week, step: 0, plays: 0 }; render(); });
  }

  /* --------------------------------------------------- leia e ouça */

  /* Listening time counts as input (Nation's first strand): one xp per
     ten seconds, thirty a day at most. */
  function noteListening(seconds) {
    if (!seconds) return;
    var k = Engine.dayKey();
    if (!state.ascolto) state.ascolto = {};
    var d = state.ascolto[k] || (state.ascolto[k] = { sec: 0, xp: 0 });
    d.sec += Math.round(seconds);
    var xp = Math.min(30 - d.xp, Math.floor(seconds / 10));
    if (xp > 0) { d.xp += xp; gain(xp); Engine.addStrand(state, "input", xp); }
    Object.keys(state.ascolto).forEach(function (kk) { if (Engine.daysBetween(kk, k) > 30) delete state.ascolto[kk]; });
    persist();
  }
  function listeningWeek() {
    var k = Engine.dayKey(), sec = 0;
    Object.keys(state.ascolto || {}).forEach(function (kk) { if (Engine.daysBetween(kk, k) < 7) sec += state.ascolto[kk].sec || 0; });
    return Math.round(sec / 60);
  }

  var karaoke = null;   // { ep, rate, mode: "full" | "partial" | "audio", par, u }
  function stopKaraoke() {
    if (karaoke && window.speechSynthesis) speechSynthesis.cancel();
    karaoke = null;
    document.querySelectorAll(".text .w.now").forEach(function (e) { e.classList.remove("now"); });
  }
  /* Reading while listening (Webb & Chang 2015): the word being said lights
     up (SpeechSynthesisUtterance.onboundary); a speed ladder 0.8 → 1 →
     1.15 (Zhao 1997: the learner controls the pace, then goes faster);
     partial captions (Mirzaei et al. 2017): only the glossed words stay. */
  function startKaraoke(ep, rate, mode) {
    stopKaraoke();
    karaoke = { ep: ep, rate: rate || 1, mode: mode || "full", par: 0, started: Date.now() };
    var pars = Letture.paragraphs(ep);
    var offsets = [], k = 0;
    pars.forEach(function (p) { var toks = Letture.tokens(p), o = [], pos = 0; toks.forEach(function (t) { var at = p.indexOf(t, pos); o.push([at, k++]); pos = at + t.length; }); offsets.push(o); });
    document.body.classList.toggle("kar-partial", karaoke.mode === "partial");
    document.body.classList.toggle("kar-audio", karaoke.mode === "audio");
    function next() {
      if (!karaoke || karaoke.par >= pars.length) {
        if (karaoke) noteListening((Date.now() - karaoke.started) / 1000);
        stopKaraoke();
        document.body.classList.remove("kar-partial", "kar-audio");
        var b = $("#karplay"); if (b) b.textContent = "🎧 Leia e ouça";
        return;
      }
      var i = karaoke.par, off = offsets[i];
      speak(pars[i], true, karaoke.rate, { keep: true,
        onboundary: function (e) {
          if (!karaoke || e.name !== "word") return;
          var idx = -1;
          for (var j = 0; j < off.length; j++) if (off[j][0] <= e.charIndex) idx = off[j][1];
          document.querySelectorAll(".text .w.now").forEach(function (x) { x.classList.remove("now"); });
          var el = document.querySelector('.text .w[data-k="' + idx + '"]');
          if (el) { el.classList.add("now"); }
        },
        onend: function () { if (karaoke) { karaoke.par++; next(); } } });
    }
    next();
    mediaSession(ep.title, function () { stopKaraoke(); });
  }
  // The lock screen shows what plays and can pause it (Media Session API).
  function mediaSession(title, onStop) {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: title, artist: "Rumo C1", album: "Leia e ouça" });
      navigator.mediaSession.setActionHandler("pause", function () { speechSynthesis.pause(); });
      navigator.mediaSession.setActionHandler("play", function () { speechSynthesis.resume(); });
      navigator.mediaSession.setActionHandler("stop", function () { onStop && onStop(); });
    } catch (e) { /* nada */ }
  }
  // Extensive listening: every reading already done, one after the other,
  // audio only (familiar material: Nation's fluency condition).
  function playLibrary(ids) {
    var list = ids.slice(), started = Date.now();
    (function next() {
      var id = list.shift();
      if (!id) { noteListening((Date.now() - started) / 1000); toast("🎧 Fin de la biblioteca de audio."); return; }
      var ep = Letture.byId(id);
      if (!ep) return next();
      toast("🎧 " + ep.title, 2500);
      mediaSession(ep.title, function () { list = []; speechSynthesis.cancel(); });
      speak(ep.text, true, 1, { onend: next });
    })();
  }
  function wireLettura() {
    if (view.screen !== "lettura") return;
    var ep = Letture.byId(view.ep);
    if (!ep) return;
    var rate = view.karRate || 1;
    on("#karplay", function () {
      var b = $("#karplay");
      if (karaoke) { stopKaraoke(); document.body.classList.remove("kar-partial", "kar-audio"); if (b) b.textContent = "🎧 Leia e ouça"; return; }
      var mode = (document.querySelector("[data-karmode].on") || {}).dataset ? document.querySelector("[data-karmode].on").dataset.karmode : "full";
      if (b) b.textContent = "⏹ Parar";
      startKaraoke(ep, rate, mode);
    });
    document.querySelectorAll("[data-rate]").forEach(function (b) {
      b.onclick = function () {
        view.karRate = +b.dataset.rate;
        document.querySelectorAll("[data-rate]").forEach(function (x) { x.classList.toggle("on", x === b); });
        if (karaoke) startKaraoke(ep, view.karRate, karaoke.mode);
      };
    });
    document.querySelectorAll("[data-karmode]").forEach(function (b) {
      b.onclick = function () {
        document.querySelectorAll("[data-karmode]").forEach(function (x) { x.classList.toggle("on", x === b); });
        document.body.classList.toggle("kar-partial", b.dataset.karmode === "partial" && !!karaoke);
        document.body.classList.toggle("kar-audio", b.dataset.karmode === "audio" && !!karaoke);
        if (karaoke) karaoke.mode = b.dataset.karmode;
      };
    });
    on("#enh", function () { view.enh = true; render(); window.scrollTo(0, 0); });
    on("#enhoff", function () { view.enh = false; render(); });
  }

  /* ------------------------------------------------------------------ fale */

  // The level, tenses and vocabulary the AI must stay inside this week.
  function aiContext(w) {
    var level = w.week <= 8 ? "A1" : w.week <= 18 ? "A2" : w.week <= 30 ? "B1" : w.week <= 42 ? "B2" : "C1";
    var tenses = (w.known || ["presente"]).map(function (t) { return Conj.TENSE_LABELS[t] || t; }).join(", ");
    var known = window.Freq && Freq.loaded() ? knownWords() : {};
    // the words to hand the model: the learner's most frequent known words plus the week's
    var list = Object.keys(known).filter(function (l) { return Freq.STOP.indexOf(l) < 0 && l.length > 2; });
    if (window.Freq && Freq.loaded()) list.sort(function (a, b) { return Freq.zipf(b) - Freq.zipf(a); });
    (w.vocab || []).forEach(function (v) { if (list.indexOf(v[0]) < 0) list.unshift(v[0]); });
    return { level: level, week: w.week, fare: w.fare || w.title, tema: w.tema || "", tenses: tenses,
             maxWords: w.week <= 8 ? 10 : w.week <= 18 ? 14 : w.week <= 30 ? 18 : 25,
             words: list.slice(0, 220), known: known };
  }
  // Token miss rate against what the learner knows: above 15 % the reply
  // is sent back to be rewritten (Dugan et al. 2026).
  function tooHard(text) {
    if (!window.Freq || !Freq.loaded()) return null;
    var mr = Freq.missRate(text, knownWords());
    return mr.n >= 4 && mr.rate > 0.15 ? mr : null;
  }

  // What the local checker marks in a text the AI wrote: the AI's Portuguese
  // is checked before the learner reads it («uma problema», «em o Rio»).
  function ptErrors(text, week) {
    if (!window.Scrivi) return [];
    scriviLexicon();
    var r = Scrivi.check(String(text || ""), week || 52);
    return ((r && r.findings) || []).filter(function (f) { return !f.soft; });
  }
  // A capital at the start of every sentence.
  function sentenceCase(text) {
    return String(text || "").replace(/(^|[.!?]\s+|\n\s*)([a-zà-ÿ])/g, function (m, a, b) { return a + b.toUpperCase(); });
  }

  var parla = null;   // { week, scen, history, done, recasts, notes, obj, turns, busy }
  function renderParla(w) {
    var head = '<button class="btn ghost" id="pback">← a la semana</button>' +
      '<h1 class="placa"><span class="p-sup">Fale · Semana ' + w.week + '</span><span class="p-rua">' + esc(parla && parla.scen ? parla.scen.titolo : "Role-play") + "</span></h1>";
    if (!aiKey()) return head + '<div class="card"><p>Para hablar con la IA hace falta una clave gratuita. <a href="#" id="aigo2">Cargala en Eu →</a></p></div>';
    if (!parla || parla.week !== w.week) {
      return head + '<div class="card"><p>Un personaje te espera con una situación de la semana (<b>' + esc(w.fare || w.title) + "</b>). " +
        "Tenés que conseguir <b>tres objetivos</b> escribiendo en portugués. La IA no te corrige mientras hablan: al final ves tus frases " +
        "junto a la versión corregida, con una observación por turno.</p>" +
        '<p class="muted small">🔬 Vacío de información con reglas duras (Wang et al. 2025, g = 0,48). La app controla que el personaje use ' +
        "palabras que ya conocés; si se pasa, le pide que lo reescriba.</p>" +
        '<button class="btn wide" id="pstart">🎭 Empezar</button><div id="pout"></div></div>';
    }
    var sc = parla.scen;
    var objs = '<ul class="reqs">' + sc.obiettivi.map(function (o, i) {
      var ok = parla.obj.indexOf(i + 1) >= 0;
      return '<li class="' + (ok ? "ok" : "") + '">' + (ok ? "✓" : "○") + " " + esc(o) + "</li>";
    }).join("") + "</ul>";
    var chat = '<div class="chat">' + parla.history.map(function (h) {
      return '<div class="bubble ' + (h[0] === "ia" ? "ia" : "me") + '">' + esc(h[1]) + "</div>";
    }).join("") + (parla.busy ? '<div class="bubble ia muted">…</div>' : "") + "</div>";
    if (parla.done) {
      var rec = parla.reviewing ? '<p class="muted">⏳ Revisando tus frases…</p>' : parla.recasts.length ? '<h3>Tus frases, corregidas</h3><table class="res">' + parla.recasts.map(function (r) {
        return "<tr><td>" + esc(r[0]) + "</td><td><b>" + esc(r[1]) + "</b>" + (r[2] ? '<br><small class="muted">' + esc(r[2]) + "</small>" : "") + "</td></tr>";
      }).join("") + "</table>" : "<p>✨ Ninguna frase necesitó corrección.</p>";
      return head + '<div class="card"><div class="scorebig"><b>' + parla.obj.length + " / 3</b><span>objetivos</span><span>+" + parla.xp + " xp</span></div>" +
        objs + rec + chat +
        '<div class="row" style="margin-top:12px"><button class="btn" id="pback2">← Seguir la trilha</button><button class="btn ghost" id="pagain">Otro role-play</button></div></div>';
    }
    return head + '<div class="card"><p class="muted">' + esc(sc.situazione_es) + "</p>" + objs +
      '<p class="muted small">Palabras útiles: <i>' + (sc.parole_utili || []).map(esc).join(" · ") + "</i></p>" + chat +
      '<div class="typed"><textarea id="ptext" class="grow" rows="1" autocomplete="off" autocapitalize="sentences" autocorrect="off" spellcheck="false" enterkeyhint="send" placeholder="Escreva em português…"' + (parla.busy ? " disabled" : "") + "></textarea>" +
      '<button class="btn" id="psend"' + (parla.busy ? " disabled" : "") + ">Enviar</button></div>" +
      '<div class="row" style="margin-top:8px"><button class="tab" id="pend">Terminar acá</button></div></div>';
  }
  function wireParla() {
    if (view.screen !== "parla") return;
    var w = course.weeks[view.week - 1];
    var back = function () { view.tab = "percorso"; view.screen = "briefing"; render(); window.scrollTo(0, 0); };
    on("#pback", back); on("#pback2", back);
    on("#aigo2", function (e) { e.preventDefault(); go("io"); });
    on("#pstart", function () {
      var ctx = aiContext(w), out = $("#pout"), b = $("#pstart");
      if (b) b.disabled = true;
      if (out) out.innerHTML = '<p class="muted small">⏳ La IA arma la escena…</p>';
      Scrivi.parlaStart(ctx, aiKeys(), function (err, data) {
        if (view.screen !== "parla") return;
        if (err || !data || !data.obiettivi) { if (out) out.innerHTML = '<p class="muted small">No pude usar la IA (' + esc(String(err && err.message || "respuesta rara")) + ").</p>"; if (b) b.disabled = false; return; }
        data.obiettivi = data.obiettivi.slice(0, 3);
        parla = { week: w.week, scen: data, history: [["ia", String(data.apertura || "Oi! Tudo bem?")]], done: false, recasts: [], obj: [], turns: 0, busy: false, ctx: ctx };
        render();
        speak(data.apertura);
      });
    });
    var send = function () {
      var box = $("#ptext"), text = box ? box.value.trim() : "";
      if (!text || parla.busy) return;
      parla.history.push(["me", text]);
      parla.turns++;
      parla.busy = true;
      render();
      // the conversation before this turn (the turn itself goes apart), and
      // the goals already reached, so the character leads to the others
      Scrivi.parlaTurn(parla.scen, parla.history.slice(-9, -1), text, parla.ctx, aiKeys(), function (err, data) {
        if (view.screen !== "parla" || !parla) return;
        var finish = function (reply) {
          parla.busy = false;
          parla.history.push(["ia", reply]);
          if (data.recast && Engine.normalise(data.recast) !== Engine.normalise(text)) parla.recasts.push([text, String(data.recast), String(data.nota_es || "")]);
          (data.obiettivi_raggiunti || []).forEach(function (n) { n = +n; if (n >= 1 && n <= 3 && parla.obj.indexOf(n) < 0) parla.obj.push(n); });
          render();
          speak(reply);
          if (data.fine || parla.obj.length >= 3 || parla.turns >= 12) endParla(w);
          else { var bx = $("#ptext"); if (bx) bx.focus(); }
        };
        if (err || !data) { parla.busy = false; parla.history.push(["ia", "(La IA no respondió: " + esc(String(err && err.message || "")) + ". Probá de nuevo.)"]); render(); return; }
        var reply = sentenceCase(String(data.risposta || "").trim() || "Entendi.");
        var hard = tooHard(reply);
        if (hard) {
          // too many unknown words: those words, by simpler synonyms; the
          // rewrite is taken only if its Portuguese is not worse
          var miss = hard.miss.filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(0, 8);
          Scrivi.parlaRewrite(reply, miss, aiKeys(), function (e2, d2) {
            var alt = !e2 && d2 && d2.risposta ? sentenceCase(String(d2.risposta)) : "";
            finish(alt && ptErrors(alt, w.week).length <= ptErrors(reply, w.week).length ? alt : reply);
          });
        } else finish(reply);
      }, parla.obj.slice());
    };
    on("#psend", send);
    var box = $("#ptext");
    if (box) { box.onkeydown = function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }; if (!parla.busy) box.focus(); }
    on("#pend", function () { endParla(w); });
    on("#pagain", function () { parla = null; render(); });
  }
  function endParla(w) {
    if (!parla || parla.done) return;
    parla.done = true;
    var first = !(state.parlaLog || {})[w.week];
    var xp = parla.obj.length * 10 + Math.min(30, parla.turns * 5);
    if (!first) xp = Math.round(xp / 3);
    parla.xp = xp;
    if (!state.parlaLog) state.parlaLog = {};
    var before = doneCount(w);
    state.parlaLog[w.week] = { obj: parla.obj.length, turns: parla.turns, at: Date.now() };
    gain(xp);
    Engine.addStrand(state, "output", xp);
    Engine.touchStreak(state);
    missionCheck(w.week, before);
    Engine.checkBadges(state);
    persist();
    renderHeader();
    // A second request reviews all the learner's sentences together (the
    // on-the-fly recasts miss what changes the meaning: avó / avô, polvo).
    var mine = parla.history.filter(function (h) { return h[0] === "me"; });
    if (mine.length) {
      parla.reviewing = true;
      var p0 = parla;
      Scrivi.parlaReview(parla.scen, parla.history, aiKeys(), function (err, data) {
        if (parla !== p0) return;
        parla.reviewing = false;
        var rows = (!err && data && data.frasi) || null;
        if (rows) {
          var rec = [];
          rows.forEach(function (r) {
            var h = parla.history[+r.i];
            if (!h || h[0] !== "me" || r.ok === true || !r.corretta) return;
            if (Engine.normalise(r.corretta) === Engine.normalise(h[1])) return;
            rec.push([h[1], String(r.corretta), String(r.nota || "")]);
          });
          parla.recasts = rec;
        }
        if (view.screen === "parla") render();
      });
    }
    render();
    if (parla.obj.length >= 3) setTimeout(confetti, 200);
  }

  /* ------------------------------------------------------------------ história */

  var storia = null;   // { week, busy, err }
  function storyEp(st) {
    var gloss = {};
    (st.gloss || []).forEach(function (g) { if (g && g[0]) gloss[String(g[0]).toLowerCase()] = String(g[1] || ""); });
    return { id: st.id, week: st.week, n: 0, level: st.level, emoji: "✨", title: st.title, series: "ai", grammar: "las palabras de tu repaso",
             text: st.text, gloss: gloss, questions: st.questions || [], area: "História da semana",
             hunt: { label: "Tocá las palabras que te tocaba repasar: " + st.targets.join(", "), targets: st.targets } };
  }
  // The generated stories stay readable offline: registered again on boot.
  function registerStories() {
    (state.storie || []).forEach(function (st) { if (!Letture.byId(st.id)) Letture.EPISODI.push(storyEp(st)); });
  }
  function renderStoria(w) {
    var head = '<button class="btn ghost" id="sback2">← a la semana</button>' +
      '<h1 class="placa"><span class="p-sup">História · Semana ' + w.week + '</span><span class="p-rua">da semana</span></h1>';
    if (!aiKey()) return head + '<div class="card"><p>Para generar la historia hace falta una clave gratuita. <a href="#" id="aigo3">Cargala en Eu →</a></p></div>';
    var mine = (state.storie || []).filter(function (x) { return x.week === w.week; });
    var due = Drills.buildReview(course, state, 40, drillOpts()).map(function (it) { return vocabWordOf(it); }).filter(Boolean);
    var targets = due.slice(0, 8);
    return head + '<div class="card"><p>Un cuento corto con <b>las palabras que te tocaba repasar</b> y solo vocabulario que ya conocés: ' +
      "leerlas dentro de una historia las fija mejor que la ficha sola.</p>" +
      (targets.length ? '<p class="muted small">Palabras de hoy: <i>' + targets.map(esc).join(", ") + "</i></p>" : '<p class="muted small">Hoy no hay palabras vencidas: la historia usa las de la semana.</p>') +
      '<p class="muted small">🔬 SRS-Stories (Kamzela, Lango & Dušek 2025): la app mide cuántas palabras del cuento no conocés y, si son más del 15 %, pide que lo reescriba.</p>' +
      '<button class="btn wide" id="sgen"' + (storia && storia.busy ? " disabled" : "") + ">✨ " + (storia && storia.busy ? "Escribiendo…" : "Generar la historia") + "</button>" +
      (storia && storia.err ? '<p class="muted small">⚠️ ' + esc(storia.err) + "</p>" : "") +
      (mine.length ? "<h3>Tus historias de esta semana</h3><div class=\"eps\">" + mine.map(function (x) {
        return '<button class="ep" data-ep="' + esc(x.id) + '"><span class="e">✨</span><span><b>' + esc(x.title) + "</b><span class=\"muted\">" + esc(x.targets.join(", ")) + "</span></span></button>";
      }).join("") + "</div>" : "") + "</div>";
  }
  function wireStoria() {
    if (view.screen !== "storia") return;
    var w = course.weeks[view.week - 1];
    on("#sback2", function () { view.tab = "percorso"; view.screen = "briefing"; render(); window.scrollTo(0, 0); });
    on("#aigo3", function (e) { e.preventDefault(); go("io"); });
    on("#sgen", function () {
      var ctx = aiContext(w);
      var due = Drills.buildReview(course, state, 40, drillOpts()).map(function (it) { return vocabWordOf(it); }).filter(Boolean);
      var targets = due.slice(0, 8);
      if (targets.length < 4) (w.vocab || []).forEach(function (v) { if (targets.length < 8 && targets.indexOf(v[0]) < 0) targets.push(v[0]); });
      storia = { week: w.week, busy: true, err: null };
      render();
      var req = { level: ctx.level, week: w.week, tema: ctx.tema || ctx.fare, tenses: ctx.tenses, targets: targets,
                  known: ctx.words.slice(0, 200), words: w.week <= 13 ? 120 : w.week <= 26 ? 160 : 220, maxNew: 6 };
      Scrivi.storia(req, aiKeys(), function (err, data) {
        if (err || !data || !data.testo) { storia = { week: w.week, busy: false, err: String(err && err.message || "respuesta rara") }; if (view.screen === "storia") render(); return; }
        var accept = function (text) {
          var st = { id: "ai-" + Date.now().toString(36), week: w.week, level: ctx.level, title: String(data.titolo || "História"), text: String(text),
                     gloss: (data.glossario || []).slice(0, 20), questions: (data.domande || []).filter(function (q) { return q && q[1] && q[1].indexOf(q[2]) >= 0; }).slice(0, 3),
                     targets: targets, at: Date.now() };
          if (!state.storie) state.storie = [];
          state.storie.unshift(st);
          state.storie = state.storie.slice(0, 6);
          Letture.EPISODI.push(storyEp(st));
          storia = { week: w.week, busy: false, err: null };
          persist();
          view.ep = st.id; view.epFrom = "briefing"; view.tab = "leggi"; view.screen = "lettura";
          render(); window.scrollTo(0, 0);
        };
        // Last step: the local checker reads the story; what it marks goes
        // back once to be fixed, and the fix is taken only if it is better.
        var polish = function (text) {
          text = sentenceCase(text);
          var errs = ptErrors(text, w.week);
          if (!errs.length) return accept(text);
          Scrivi.correggi(text, errs.slice(0, 10).map(function (f) { return String(f.msg || "").replace(/\*/g, ""); }), aiKeys(), function (e3, d3) {
            var fixed = !e3 && d3 && d3.testo ? sentenceCase(String(d3.testo)) : "";
            accept(fixed && ptErrors(fixed, w.week).length < errs.length ? fixed : text);
          });
        };
        var orig = String(data.testo);
        var hard = tooHard(orig);
        if (hard && hard.miss.length > 3) {
          var missS = hard.miss.filter(function (x, i, a) { return a.indexOf(x) === i; }).slice(0, 12);
          Scrivi.storiaRewrite(orig, missS, aiKeys(), function (e2, d2) {
            var alt = !e2 && d2 && d2.testo ? String(d2.testo) : "";
            polish(alt && ptErrors(alt, w.week).length <= ptErrors(orig, w.week).length ? alt : orig);
          });
        } else polish(orig);
      });
    });
  }
  /* Cloze on the story with distractors of the same class and frequency
     band (the client builds the options: model-made distractors are too
     rare and give themselves away). */
  function storyCloze(ep) {
    var out = [];
    if (!window.Freq || !Freq.loaded()) return out;
    var sents = ep.text.split(/(?<=[.!?])\s+/);
    (ep.hunt.targets || []).slice(0, 3).forEach(function (t, k) {
      var sent = sents.filter(function (x) { return new RegExp("(^|[^a-zà-ÿ])" + t + "(?![a-zà-ÿ])", "i").test(x); })[0];
      if (!sent) return;
      var opts = [t].concat(Freq.sameBand(t, 3));
      if (opts.length < 3) return;
      out.push({ id: "storia:" + ep.id + ":" + k, src: "lettura", ep: ep.id, type: "choice", prompt: "Completá con la palabra del cuento",
                 stem: sent.replace(new RegExp("(^|[^a-zà-ÿ])" + t + "(?![a-zà-ÿ])", "i"), "$1___"), options: Drills.shuffle(opts), answer: t, accept: [t] });
    });
    return out;
  }

  /* ------------------------------------------------------------------ exame */

  /* The C1 exam, shaped after the Celpe-Bras (Avançado Superior) without
     its oral interview: a long listening with two voices, a long text with
     paragraph-title matching and true/false, structures (rational cloze
     and transformations), lexicon (word formation, register) and two
     written texts graded with a four-criterion rubric (contexto,
     discursiva, linguística, léxico).  Each prova needs 55 %, and the exam
     passes with an average of 60 %.  The ids of the provas (ascolto,
     lettura, strutture, lessico, scrittura) are the data keys of
     esame_data.js and course.json (item.prova). */
  var PROVE = [["ascolto", "Compreensão oral", "🎧"], ["lettura", "Leitura", "📖"], ["strutture", "Estruturas", "🧩"],
               ["lessico", "Léxico", "📚"], ["scrittura", "Produção escrita", "✍️"]];
  function proveName(id) { var p = PROVE.filter(function (x) { return x[0] === id; })[0]; return p ? p[1] : id; }
  // The rubric of the written texts (esame_data.js, the AI's «punteggi»).
  var RUBRIC = [["contexto", "Adequação ao contexto"], ["discursiva", "Adequação discursiva"], ["linguistica", "Adequação linguística"], ["lexico", "Léxico"]];
  function kindName(k) { return k === "argomentativo" ? "Texto argumentativo" : "Carta formal"; }
  var es = null;   // transient state of the prova on screen
  function esameSet(prova, ok, n) {
    if (!state.esame) state.esame = {};
    var pct = n ? Math.round(ok / n * 100) : 0, prev = state.esame[prova];
    if (!prev || pct >= prev.pct) state.esame[prova] = { ok: ok, n: n, pct: pct, at: Date.now() };
  }
  function esameResult() {
    var r = state.esame || {}, all = PROVE.every(function (p) { return r[p[0]]; });
    if (!all) return null;
    var sum = 0, minOk = true;
    PROVE.forEach(function (p) { sum += r[p[0]].pct; if (r[p[0]].pct < 55) minOk = false; });
    return { avg: Math.round(sum / PROVE.length), minOk: minOk, passed: minOk && sum / PROVE.length >= 60 };
  }
  function renderEsame() {
    var r = state.esame || {}, res = esameResult(), st = weekStat(52);
    var html = '<button class="btn ghost" id="eback">← a la semana</button>' +
      '<h1 class="placa big"><span class="p-sup">Exame final</span><span class="p-rua">Nível C1</span></h1>' +
      '<p class="lead">Cinco pruebas al estilo del Celpe-Bras (Avançado Superior): cada una necesita el <b>55 %</b> y el promedio, el 60 %. Podés hacerlas en el orden que quieras y repetir una.</p>' +
      '<div class="missions">' + PROVE.map(function (p, k) {
        var x = r[p[0]];
        return '<button class="mission' + (x && x.pct >= 55 ? " done" : "") + '" data-prova="' + p[0] + '"><span class="mi">' + (x && x.pct >= 55 ? "★" : p[2]) + "</span>" +
          "<span><b>" + (k + 1) + ". " + p[1] + "</b><small>" + (x ? x.pct + " % · " + x.ok + " / " + x.n + (x.pct < 55 ? " · por debajo del mínimo" : "") : {
            ascolto: "una entrevista larga con dos voces · 8 preguntas y 4 huecos",
            lettura: "un texto largo · títulos por párrafo y verdadeiro/falso",
            strutture: "20 huecos y transformaciones: preposiciones, subjuntivo, infinitivo pessoal, relativos, pasiva…",
            lessico: "12 de formación de palabras y registro",
            scrittura: "un argumentativo de 200 palabras y una carta formal de 120" }[p[0]]) + "</small></span><span class=\"go\">›</span></button>";
      }).join("") + "</div>" +
      (res ? '<div class="card"><div class="scorebig"><b>' + res.avg + " %</b><span>promedio</span></div>" +
        (res.passed ? "<p>🎓 <b>Exame aprovado.</b> " + (st.bossPassed ? "Ya figura en tu trilha." : "") + "</p>" +
          (!st.bossPassed ? '<button class="btn wide" id="econsegna">Registrar el resultado</button>' : "")
          : "<p>" + (res.minOk ? "Falta llegar al 60 % de promedio." : "Alguna prueba está por debajo del 55 %: repetila.") + "</p>") + "</div>" : "") +
      '<div class="row" style="margin-top:12px"><button class="tab" id="eboss">⚔️ Ronda clásica de Chefão (práctica)</button></div>';
    return html;
  }
  function wireEsame() {
    var sc = view.screen;
    if (sc === "esame") {
      on("#eback", function () { view.tab = "percorso"; view.screen = "briefing"; render(); window.scrollTo(0, 0); });
      on("#eboss", function () { startRound("boss"); });
      document.querySelectorAll("[data-prova]").forEach(function (b) {
        b.onclick = function () {
          var p = b.dataset.prova;
          es = { prova: p, plays: 0, answers: {} };
          if (p === "strutture" || p === "lessico") startRound("esame", p);
          else { view.screen = p === "ascolto" ? "esame-asc" : p === "lettura" ? "esame-let" : "esame-scr"; render(); window.scrollTo(0, 0); }
        };
      });
      on("#econsegna", function () {
        var ws = state.weekStats[52] || (state.weekStats[52] = { attempts: 0, right: 0, bossPassed: false });
        ws.bossPassed = true;
        gain(Engine.XP.boss);
        var won = Engine.checkBadges(state);
        persist(); renderHeader(); confetti();
        toast("🎓 C1 registrado" + (won.length ? " · 🏅 " + won[0].name : ""), 4000);
        render();
      });
      return;
    }
    if (sc === "esame-asc") wireEsameAscolto();
    if (sc === "esame-let") wireEsameLettura();
    if (sc === "esame-scr") wireEsameScrittura();
  }
  function esBack() { view.screen = "esame"; render(); window.scrollTo(0, 0); }

  /* Compreensão oral: the interview is read turn by turn, two voices; two listenings. */
  function renderEsameAscolto() {
    var a = EsameData.ascolto[es.k != null ? es.k : (es.k = Math.floor(Math.random() * EsameData.ascolto.length))];
    var head = '<button class="btn ghost" id="eback2">← al examen</button><h1>🎧 ' + esc(a.title) + "</h1>";
    if (!es.done) {
      return head + '<div class="card"><p class="muted">Vas a escuchar la grabación <b>dos veces</b>. Las preguntas se muestran ahora: leelas antes.</p>' +
        '<div class="center"><button class="bigplay" id="eplay">🔊</button><p class="muted" id="estate">Escucha ' + Math.min(2, es.plays + 1) + " de 2</p></div>" +
        esameQuestionsHtml(a) +
        '<button class="btn wide" id="econsegna2">Entregar</button></div>';
    }
    return head + esameProvaResult(a);
  }
  function esameQuestionsHtml(a) {
    return '<ol class="equestions">' + a.questions.map(function (q, i) {
      return "<li><b>" + esc(q[0]) + "</b>" + Drills.shuffle(q[1]).map(function (o) {
        return '<label class="eopt"><input type="radio" name="q' + i + '" value="' + esc(o) + '"> ' + esc(o) + "</label>";
      }).join("") + "</li>";
    }).join("") + "</ol><h3>Completá con una palabra del audio</h3><ol class=\"equestions\">" + a.completa.map(function (c, i) {
      return "<li>" + esc(c[0]) + ' <input class="egap" data-gap="' + i + '" autocapitalize="off" autocorrect="off" spellcheck="false"></li>';
    }).join("") + "</ol>";
  }
  function esameProvaResult(a) {
    var r = es.result;
    return '<div class="card"><div class="scorebig"><b>' + r.pct + " %</b><span>" + r.ok + " / " + r.n + "</span></div>" +
      (r.detail ? '<table class="res">' + r.detail.map(function (d) { return "<tr><td>" + esc(d[0]) + "</td><td>" + (d[1] ? "✓" : "✗ " + esc(d[2] || "")) + "</td></tr>"; }).join("") + "</table>" : "") +
      (a.turns ? '<h3>A transcrição</h3><p class="model it">' + a.turns.map(function (t) { return "<b>" + esc(a.speakers[t[0] === "A" ? 0 : 1]) + ":</b> " + esc(t[1]); }).join("<br>") + "</p>" : "") +
      '<div class="row" style="margin-top:12px"><button class="btn" id="eback3">← Volver al examen</button></div></div>';
  }
  function wireEsameAscolto() {
    on("#eback2", esBack); on("#eback3", esBack);
    var a = EsameData.ascolto[es.k];
    on("#eplay", function () {
      var b = $("#eplay");
      if (!b || b.disabled || es.plays >= 2) return;
      b.disabled = true;
      var i = 0;
      (function next() {
        if (i >= a.turns.length) { es.plays++; b.disabled = es.plays >= 2; var st = $("#estate"); if (st) st.textContent = es.plays >= 2 ? "Dos escuchas hechas" : "Escucha 2 de 2"; noteListening(a.turns.length * 12); return; }
        var t = a.turns[i++];
        speak(t[1], true, 1, { keep: true, pitch: t[0] === "A" ? 0.9 : 1.1, vi: t[0] === "A" ? 0 : 1, onend: next });
      })();
    });
    on("#econsegna2", function () {
      var ok = 0, detail = [];
      a.questions.forEach(function (q, i) {
        var sel = document.querySelector('input[name="q' + i + '"]:checked');
        var right = !!sel && sel.value === q[2];
        if (right) ok++;
        detail.push([q[0], right, q[2]]);
      });
      a.completa.forEach(function (c, i) {
        var inp = document.querySelector('[data-gap="' + i + '"]');
        var right = !!inp && Engine.grade(inp.value, { answer: c[1], accept: [c[1]] }) !== Engine.VERDICT.WRONG;
        if (right) ok++;
        detail.push([c[0], right, c[1]]);
      });
      var n = a.questions.length + a.completa.length;
      es.done = true; es.result = { ok: ok, n: n, pct: Math.round(ok / n * 100), detail: detail };
      esameSet("ascolto", ok, n);
      Engine.addStrand(state, "input", ok * 3); gain(ok * 3);
      persist(); renderHeader(); render(); window.scrollTo(0, 0);
    });
  }

  /* Leitura: a title for every paragraph (two titles too many), then true/false. */
  function renderEsameLettura() {
    var l = EsameData.lettura[es.k != null ? es.k : (es.k = Math.floor(Math.random() * EsameData.lettura.length))];
    var head = '<button class="btn ghost" id="eback2">← al examen</button><h1>📖 ' + esc(l.title) + "</h1>";
    if (es.done) return head + esameProvaResult(l);
    return head + '<div class="card"><p class="muted">Elegí el título de cada párrafo (sobran dos) y después decidí si cada afirmación es verdadera o falsa.</p>' +
      '<div class="text">' + l.paragraphs.map(function (p, i) {
        return '<p><select class="etitle" data-par="' + i + '"><option value="">— título del párrafo ' + (i + 1) + " —</option>" +
          l.titles.map(function (t, k) { return '<option value="' + k + '">' + esc(t) + "</option>"; }).join("") + "</select><br>" + esc(p) + "</p>";
      }).join("") + "</div>" +
      '<h3>Verdadeiro ou falso</h3><ol class="equestions">' + l.vf.map(function (v, i) {
        return "<li>" + esc(v[0]) + '<label class="eopt"><input type="radio" name="vf' + i + '" value="v"> verdadeiro</label><label class="eopt"><input type="radio" name="vf' + i + '" value="f"> falso</label></li>';
      }).join("") + "</ol>" +
      '<button class="btn wide" id="econsegna3">Entregar</button></div>';
  }
  function wireEsameLettura() {
    on("#eback2", esBack); on("#eback3", esBack);
    var l = EsameData.lettura[es.k];
    on("#econsegna3", function () {
      var ok = 0, detail = [];
      l.match.forEach(function (want, i) {
        var sel = document.querySelector('[data-par="' + i + '"]');
        var right = !!sel && +sel.value === want && sel.value !== "";
        if (right) ok++;
        detail.push(["Párrafo " + (i + 1), right, l.titles[want]]);
      });
      l.vf.forEach(function (v, i) {
        var sel = document.querySelector('input[name="vf' + i + '"]:checked');
        var right = !!sel && (sel.value === "v") === v[1];
        if (right) ok++;
        detail.push([v[0], right, (v[1] ? "verdadeiro" : "falso") + (v[2] ? " · " + v[2] : "")]);
      });
      var n = l.match.length + l.vf.length;
      es.done = true; es.result = { ok: ok, n: n, pct: Math.round(ok / n * 100), detail: detail };
      esameSet("lettura", ok, n);
      Engine.addStrand(state, "input", ok * 3); gain(ok * 3);
      persist(); renderHeader(); render(); window.scrollTo(0, 0);
    });
  }

  /* Produção escrita: two texts; with a key the AI grades them with the
     rubric, otherwise the local checker counts words and hard errors. */
  function renderEsameScrittura() {
    var head = '<button class="btn ghost" id="eback2">← al examen</button><h1>✍️ Produção escrita</h1>';
    if (es.done) return head + '<div class="card"><div class="scorebig"><b>' + es.result.pct + ' %</b><span>' + es.result.ok + " / " + es.result.n + " puntos</span></div>" +
      es.result.parts.map(function (p) {
        return "<h3>" + esc(p.title) + "</h3><p>" + (p.rubric ? RUBRIC.filter(function (r) { return p.rubric[r[0]] != null; }).map(function (r) { return esc(r[1]) + " " + p.rubric[r[0]] + "/5"; }).join(" · ") : p.local) + "</p>" +
          (p.comment ? "<p>🤖 " + esc(p.comment) + "</p>" : "") +
          (p.errors && p.errors.length ? '<table class="res">' + p.errors.map(function (e) { return "<tr><td>" + esc(e[0]) + "</td><td>" + esc(e[1]) + "</td></tr>"; }).join("") + "</table>" : "");
      }).join("") +
      '<div class="row" style="margin-top:12px"><button class="btn" id="eback3">← Volver al examen</button></div></div>';
    return head + '<div class="card"><p class="muted">Dos textos. ' + (aiKey() ? "La IA los califica con la rúbrica de la certificación." : "Sin clave de IA, el corrector propio cuenta palabras y errores marcados.") + "</p>" +
      EsameData.scrittura.map(function (t, i) {
        var d = (state.esameDraft || {})[t.id] || "";
        return "<h3>" + (i + 1) + ". " + esc(kindName(t.kind)) + " · " + t.words + " palabras</h3><p>" + esc(t.t) + "</p>" +
          '<textarea class="grow scrivi edraft" data-id="' + t.id + '" rows="8" spellcheck="false" autocapitalize="sentences">' + esc(d) + "</textarea>" +
          '<p class="muted small ewords" data-for="' + t.id + '">' + d.split(/\s+/).filter(Boolean).length + " palabras</p>";
      }).join("") +
      '<button class="btn wide" id="econsegna4"' + (es.busy ? " disabled" : "") + ">" + (es.busy ? "⏳ Corrigiendo…" : "Entregar") + "</button></div>";
  }
  function wireEsameScrittura() {
    on("#eback2", esBack); on("#eback3", esBack);
    document.querySelectorAll(".edraft").forEach(function (t) {
      t.addEventListener("input", function () {
        if (!state.esameDraft) state.esameDraft = {};
        state.esameDraft[t.dataset.id] = t.value.slice(0, 6000);
        var c = document.querySelector('.ewords[data-for="' + t.dataset.id + '"]');
        if (c) c.textContent = t.value.split(/\s+/).filter(Boolean).length + " palabras";
        persist();
      });
    });
    on("#econsegna4", function () {
      var texts = EsameData.scrittura.map(function (t) { return [t, ((state.esameDraft || {})[t.id] || "").trim()]; });
      if (texts.some(function (x) { return x[1].split(/\s+/).filter(Boolean).length < x[0].words * 0.5; })) return toast("Cada texto necesita al menos la mitad de las palabras pedidas.", 3500);
      es.busy = true; render();
      scriviLexicon();
      var parts = [], pending = texts.length, sum = 0, max = 0;
      var finish = function () {
        es.busy = false; es.done = true;
        es.result = { ok: Math.round(sum), n: max, pct: Math.round(sum / max * 100), parts: parts };
        esameSet("scrittura", Math.round(sum), max);
        Engine.addStrand(state, "output", Math.round(sum * 2)); gain(Math.round(sum * 2));
        persist(); renderHeader(); render(); window.scrollTo(0, 0);
      };
      texts.forEach(function (x) {
        var task = x[0], text = x[1], title = kindName(task.kind);
        var local = function () {
          var chk = Scrivi.check(text, 52), hard = chk.findings.filter(function (f) { return !f.soft; }).length;
          var words = text.split(/\s+/).filter(Boolean).length, wordsOk = Math.min(1, words / task.words);
          var score = Math.round((wordsOk * 8 + Math.max(0, 12 - hard * 1.5)) * 10) / 10;
          parts.push({ title: title, local: words + " palabras · " + hard + " errores marcados por el corrector propio → " + score + " / 20", errors: [] });
          sum += score; max += 20;
          if (--pending === 0) finish();
        };
        if (!aiKey()) return local();
        Scrivi.esame(task, text, aiKeys(), function (err, data) {
          if (err || !data || !data.punteggi) return local();
          var pz = data.punteggi, sc = 0;
          RUBRIC.forEach(function (r) { var k = r[0]; pz[k] = Math.max(0, Math.min(5, +pz[k] || 0)); sc += pz[k]; });
          parts.push({ title: title, rubric: pz, comment: String(data.commento || ""), errors: (data.errori || []).slice(0, 8) });
          sum += sc; max += 20;
          if (--pending === 0) finish();
        });
      });
    });
  }

  /* ---------------------------------------------------------------- escreva */

  // Everything Portuguese the course shows, as the checker's dictionary.
  function scriviLexicon() {
    if (!window.Scrivi) return;
    Scrivi.learnCourse({ items: course.items, bank: Banca.loaded() ? Banca.bank() : null,
      phrases: window.Frasi ? Frasi.ALL : [], readings: window.Letture ? Letture.EPISODI : [], glossario: glossario || {} });
  }

  function reqsHtml(r) {
    return r.reqs.map(function (q) {
      return '<li class="' + (q.ok ? "ok" : "") + '">' + (q.ok ? "✓" : "○") + " " + esc(q.label) +
        ' <small class="muted">' + Math.min(q.n, 999) + " / " + q.need + "</small></li>";
    }).join("");
  }

  function renderScrivi(w) {
    var task = Scrivi.TASKS[w.week];
    if (!task) return '<button class="btn ghost" id="sback">← a la semana</button><p>Esta semana no tiene texto.</p>';
    scriviLexicon();
    var draft = ((state.scrittiDraft || {})[w.week]) || ((state.scritti || {})[w.week] || {}).t || "";
    var r = Scrivi.check(draft, w.week);
    return '<button class="btn ghost" id="sback">← a la semana</button>' +
      '<h1 class="placa"><span class="p-sup">Escreva · Semana ' + w.week + "</span>" +
      '<span class="p-rua">' + esc(w.fare || w.title) + "</span></h1>" +
      '<div class="card"><p>' + mk(task.t) + '</p><ul class="reqs" id="sreqs">' + reqsHtml(r) + "</ul>" +
      '<p class="muted small">Escribí sin traductor: lo que te equivoques es lo que más vas a aprender. Podés dejarlo a medias y volver.</p></div>' +
      '<textarea id="stext" class="grow scrivi" rows="7" spellcheck="false" autocapitalize="sentences" placeholder="Escreva aqui, em português…">' + esc(draft) + "</textarea>" +
      '<div class="row" style="margin-top:10px"><button class="btn" id="scheck">🔎 Revisar</button>' +
      '<button class="tab" id="smodel">👀 Ver un modelo</button></div>' +
      '<label class="muted small ltopt"><input type="checkbox" id="slt"' + (state.ltOff ? "" : " checked") + "> " +
        "Si la IA no está, pedir la corrección de LanguageTool (gratis; el texto se envía a su servidor)</label>" +
      '<p class="muted small ailine">🤖 ' + (aiKey()
        ? "Corrector con IA activado (" + [aiKeys().groq ? "Groq" : "", aiKeys().gemini ? (aiKeys().groq ? "Gemini de respaldo" : "Gemini") : ""].filter(Boolean).join(" + ") + "). "
        : "Para que una IA marque todo y lo explique, cargá una clave gratuita. ") +
        '<a href="#" id="aigo">Claves en Eu →</a></p>' +
      '<div id="sout"></div>';
  }

  var scriviTimer = null;
  /* The AI keys: Groq first, Gemini as fallback.  Only in this phone's
     storage, never in the backup. */
  var AI_KEY = "rumoc1.groq.key", GEM_KEY = "rumoc1.gemini.key";
  function readKey(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function aiKeys() { return { groq: readKey(AI_KEY), gemini: readKey(GEM_KEY) }; }
  function aiKey() { var k = aiKeys(); return k.groq || k.gemini; }
  // Which AI answered: «Groq · moonshotai/kimi-k2-instruct».
  function modelLine(m, m2) {
    var one = function (x) { return x ? esc(x.provider + " · " + x.model) : ""; };
    if (!m) return "";
    return '<p class="muted small modelline">' + (m2 ? "Corrigió " + one(m) + " · revisó " + one(m2) : "IA: " + one(m)) + "</p>";
  }
  function aiKeyFields() {
    var k = aiKeys();
    return '<p class="muted small"><b>Groq</b> (principal): <a href="https://console.groq.com/keys" target="_blank" rel="noopener">console.groq.com/keys</a> → «Create API Key».</p>' +
      '<input id="aikey" type="password" autocomplete="off" placeholder="Clave de Groq (gsk_…)" value="' + esc(k.groq) + '">' +
      '<p class="muted small"><b>Gemini</b> (respaldo, si Groq falla): <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> → «Create API key».</p>' +
      '<input id="gemkey" type="password" autocomplete="off" placeholder="Clave de Gemini (AIza…)" value="' + esc(k.gemini) + '">' +
      '<div class="row"><button class="tab" id="aisave">Guardar</button></div>' +
      '<p class="muted small">Quedan solo en este teléfono; el texto se envía a Groq o a Google.</p>';
  }
  function saveKeys() {
    var g = (($("#aikey") || {}).value || "").trim(), m = (($("#gemkey") || {}).value || "").trim();
    try {
      if (g) localStorage.setItem(AI_KEY, g); else localStorage.removeItem(AI_KEY);
      if (m) localStorage.setItem(GEM_KEY, m); else localStorage.removeItem(GEM_KEY);
    } catch (e) { /* */ }
    return (g ? "Groq" : "") + (g && m ? " y " : "") + (m ? "Gemini" : "");
  }
  function wireScrivi() {
    if (view.screen !== "scrivi") return;
    var w = course.weeks[view.week - 1], box = $("#stext");
    on("#sback", function () { view.screen = "briefing"; render(); window.scrollTo(0, 0); });
    if (!box) return;
    box.addEventListener("input", function () {
      clearTimeout(scriviTimer);
      scriviTimer = setTimeout(function () {
        var r = Scrivi.check(box.value, w.week), ul = $("#sreqs");
        if (ul) ul.innerHTML = reqsHtml(r);
        if (!state.scrittiDraft) state.scrittiDraft = {};
        state.scrittiDraft[w.week] = box.value.slice(0, 4000);
        persist();
      }, 400);
    });
    on("#smodel", function () {
      var out = $("#sout");
      if (out) out.innerHTML = '<div class="card"><h3>Un modelo</h3><p class="model it">' + esc(Scrivi.TASKS[w.week].model) +
        '</p><p class="muted small">No es la única forma: compará las estructuras, no las palabras.</p></div>';
    });
    var lt = $("#slt");
    if (lt) lt.onchange = function () { state.ltOff = !lt.checked; persist(); };
    on("#aigo", function (e) {
      if (e && e.preventDefault) e.preventDefault();
      if (!state.scrittiDraft) state.scrittiDraft = {};
      state.scrittiDraft[w.week] = box.value.slice(0, 4000);
      persist();
      go("io");
      var card = $("#aicard");
      if (card) card.scrollIntoView({ block: "start" });
    });
    on("#scheck", function () {
      var text = box.value, r = Scrivi.check(text, w.week), out = $("#sout");
      // With a key, the AI is the corrector; the local rules and
      // LanguageTool only step in when it cannot answer.
      r.local = r.findings;
      if (aiKey() && text.trim()) { r.findings = []; r.hard = 0; runAI(); }
      else fallback();
      function runAI() {
        r.ai = "…"; r.aiStage = null; r.findings = []; r.hard = 0;
        showScrivi(w, text, r, null);
        // The evidence for the reviewer: the rule checker now, LanguageTool
        // when it answers (at most twelve seconds; without it, the review
        // goes ahead with the local findings only).
        var ltMsgs = null, waiting = [];
        if (!state.ltOff) Scrivi.ltCheck(text, function (e2, matches) {
          ltMsgs = e2 ? [] : Scrivi.fromLT(text, matches, []).map(function (f) { return f.msg.replace(/\*/g, ""); });
          waiting.splice(0).forEach(function (fn) { fn(); });
        }); else ltMsgs = [];
        var evidence = function (go) {
          var pack = function () { return { local: r.local.filter(function (f) { return !f.soft; }).map(function (f) { return f.msg.replace(/\*/g, ""); }), lt: ltMsgs || [] }; };
          if (ltMsgs) return go(pack());
          var t = setTimeout(function () { if (waiting.length) { waiting.length = 0; go(pack()); } }, 6000);
          waiting.push(function () { clearTimeout(t); go(pack()); });
        };
        Scrivi.aiCheck(text, w.week, aiKeys(), function (err, data, meta) {
          if (view.screen !== "scrivi" || $("#stext") !== box || box.value !== text) return;
          if (err) { r.ai = "error"; r.aiErr = String(err.message || err); fallback(); return; }
          r.ai = "ok"; r.aiData = data; r.aiMeta = meta;
          r.findings = Scrivi.fromAI(text, data, []);
          r.hard = r.findings.filter(function (f) { return !f.soft; }).length;
          showScrivi(w, text, r, null);
          on("#sretry", runAI);
        }, function (stage) {
          if (view.screen !== "scrivi" || $("#stext") !== box || box.value !== text) return;
          r.aiStage = stage;
          showScrivi(w, text, r, null);
        }, { evidence: evidence });
      }
      function fallback() {
        r.findings = r.local;
        r.hard = r.findings.filter(function (f) { return !f.soft; }).length;
        showScrivi(w, text, r, state.ltOff || !text.trim() ? null : "…");
        on("#sretry", runAI);
        if (state.ltOff || !text.trim()) return;
        Scrivi.ltCheck(text, function (err, matches) {
          if (view.screen !== "scrivi" || $("#stext") !== box || box.value !== text || r.ai === "…" || r.ai === "ok") return;
          if (err) { r.lt = "error"; showScrivi(w, text, r, "error"); on("#sretry", runAI); return; }
          r.findings = r.findings.concat(Scrivi.fromLT(text, matches, r.findings)).sort(function (a, b) { return a.i - b.i; });
          r.hard = r.findings.filter(function (f) { return !f.soft; }).length;
          r.lt = "ok";
          showScrivi(w, text, r, "ok");
          on("#sretry", runAI);
        });
      }
    });
  }

  function showScrivi(w, text, r, ltState) {
      var out = $("#sout");
      if (!out) return;
      var hard = r.findings.filter(function (f) { return !f.soft; });
      var list = r.findings.map(function (f, k) {
        return '<li class="' + (f.soft ? "soft" : "bad") + '"><b>' + (k + 1) + ".</b> " + mk(f.msg) + "</li>";
      }).join("");
      var missing = r.reqs.filter(function (q) { return !q.ok; });
      var busy = r.ai === "…";
      out.innerHTML = '<div class="card">' +
        (busy ? (r.aiStage === "review" ? '<p>⏳ Un segundo profesor está revisando la corrección…</p>' : '<p>⏳ La IA está corrigiendo tu texto…</p>') +
                '<p class="muted small">Corrige y después revisa: suele tardar menos de 30 segundos.</p>'
          : r.findings.length ? '<p class="scrivi-marked it">' + Scrivi.markup(text, r.findings, esc) + "</p><ol class=\"findings\">" + list + "</ol>"
          : r.ai === "ok" ? "<p>✨ La IA no encontró errores.</p>"
          : '<p>✨ No encontré errores' + (ltState === "ok" ? ", y LanguageTool tampoco." : " de los que sé buscar.") + "</p>") +
        (r.ai === "ok" && r.aiData ? '<div class="aiout">' +
              (r.aiData.consigna ? '<p class="muted small">📋 ' + esc(r.aiData.consigna) + "</p>" : "") +
              (r.aiData.comentario ? "<p>🤖 " + esc(r.aiData.comentario) + "</p>" : "") +
              (r.aiData.corregido ? '<p class="muted small">Versión corregida:</p><p class="model it">' + esc(r.aiData.corregido) + "</p>" : "") +
              (r.aiMeta ? modelLine(r.aiMeta.first, r.aiMeta.review) : "") +
            "</div>" : "") +
        (r.ai === "error" ? '<p class="muted small">⚠️ No pude usar la IA (' + esc(r.aiErr || "") + "). " +
              (/clave|401|403/.test(r.aiErr || "") ? "Revisá las claves en Eu. " : "") +
              "Mientras, te muestro la revisión automática, que es mucho más limitada.</p>" +
              '<button class="tab" id="sretry">🤖 Probar la IA de nuevo</button>' : "") +
        (!r.ai && !aiKey() ? '<p class="muted small">Esta es la revisión automática, que se le escapan muchas cosas. Para una corrección completa, cargá una clave en Eu.</p>' : "") +
        (!busy && r.ai !== "ok" ? (ltState === "…" ? '<p class="muted small">⏳ Consultando LanguageTool…</p>'
          : ltState === "error" ? '<p class="muted small">No pude consultar LanguageTool (sin conexión o límite de uso).</p>'
          : ltState === "ok" ? '<p class="muted small">✓ Revisado también por LanguageTool.</p>' : "") : "") +
        (busy ? "" : missing.length ? '<p class="muted">Todavía falta: ' + missing.map(function (q) { return esc(q.label) + " (" + q.n + " / " + q.need + ")"; }).join(" · ") + ".</p>"
                        : '<p>Cumple la consigna.' + (hard.length ? " Corregí lo marcado si querés, o entregalo así: los errores quedan anotados para la clínica." : "") + "</p>" +
                          '<button class="btn" id="sdone">✓ Entregar el texto</button>') +
        "</div>";
      on("#sdone", function () { deliverScrivi(w, text, r); });
      if (ltState !== "ok" && ltState !== "error") out.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function deliverScrivi(w, text, r) {
    var before = doneCount(w), first = !(state.scritti || {})[w.week];
    var hard = r.findings.filter(function (f) { return !f.soft; });
    if (!state.scritti) state.scritti = {};
    state.scritti[w.week] = { t: text.slice(0, 4000), at: Date.now(), n: r.words, errs: hard.length };
    if (state.scrittiDraft) delete state.scrittiDraft[w.week];
    // The mistakes go to the error profile, like any other answer.
    var toks = Scrivi.toks(text);
    hard.forEach(function (f) {
      var tk = toks[f.i] || {};
      recordError({ cat: f.cat, target: f.msg.replace(/\*/g, "").slice(0, 80) }, tk.o || "");
    });
    var xp = first ? 40 + Math.min(40, Math.floor(r.words / 5)) + (hard.length ? 0 : 20) : 10;
    gain(xp);
    Engine.addStrand(state, "output", xp);
    if (first) state.written = (state.written || 0) + 1;
    Engine.touchStreak(state);
    var extras = missionCheck(w.week, before);
    Engine.checkBadges(state);
    persist();
    renderHeader();
    view.screen = "briefing";
    render();
    window.scrollTo(0, 0);
    var news = extras.filter(function (x) { return /abierta|perfeita/.test(x); })[0] || extras[0];
    toast("✍️ Texto entregado · +" + xp + " xp" + (news ? " · " + news : ""), 3500);
  }

  function wireGioco() {
    if (view.screen !== "gioco" || !round) return;
    var it = currentItem();
    on("#stophere", function () {
      round.items = round.items.slice(0, round.i);
      finishRound();
    });

    document.querySelectorAll("[data-opt]").forEach(function (b) {
      b.onclick = function () { answer(b.textContent); };
    });

    var send = $("#send"), input = $("#ans");
    // A beginner often copies the whole sentence into the blank: say what
    // the blank is instead of grading «Vocês professores?» as a vocabulary error.
    function wholeSentence(v) {
      if (!/_{3,}/.test(it.stem || "")) return false;
      var words = function (x) { return String(x).toLowerCase().match(/[a-zà-ÿ'-]+/g) || []; };
      var stemW = words(String(it.stem).replace(/\([^)]*\)/g, " ").replace(/_{3,}/g, " "));
      var ans = String(it.answer).toLowerCase();
      return words(v).filter(function (w) { return stemW.indexOf(w) >= 0 && ans.indexOf(w) < 0; }).length >= 2;
    }
    function send1() {
      if (!round.answered && wholeSentence(input.value)) {
        $("#fb").innerHTML = '<div class="feedback prompt"><div class="verdict">Solo el hueco</div>' +
          "<p>Escribí únicamente lo que va en la raya ___, no la frase entera.</p></div>";
        input.focus();
        return;
      }
      produce(input.value);
    }
    if (send && input) {
      send.onclick = send1;
      input.onkeydown = function (e) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send1(); }
      };
      input.focus();
      document.querySelectorAll("[data-ins]").forEach(function (b) {
        b.onclick = function () {
          // Insert at the cursor, not at the end.
          var st = input.selectionStart == null ? input.value.length : input.selectionStart;
          var en = input.selectionEnd == null ? st : input.selectionEnd;
          input.value = input.value.slice(0, st) + b.dataset.ins + input.value.slice(en);
          input.focus();
          try { input.setSelectionRange(st + 1, st + 1); } catch (e) { /* */ }
        };
      });
    }

    on("#say", function () { speak(it.stem.replace(/___/g, "…"), true); });

    if (it.type === "card") on("#next", nextItem);
    if (it.type === "word") {
      on("#next", nextItem);
      on("#sayit", function () { speak(it.stem, true); });
      wireKeyword();
      speak(it.stem);
    }

    if (it.type === "fixerr") wireFixerr(it);

    on("#showtext", function () { $("#qtext").hidden = !$("#qtext").hidden; });

    if (it.type === "hunt") {
      var sel = [];
      document.querySelectorAll("[data-tok]").forEach(function (w) {
        w.onclick = function () {
          if (round.answered) return;
          var k = +w.dataset.tok, at = sel.indexOf(k);
          if (at >= 0) sel.splice(at, 1); else sel.push(k);
          w.classList.toggle("on", at < 0);
          fx.tap();
          $("#hcount").textContent = sel.length + " marcadas";
        };
      });
      on("#hcheck", function () {
        var ep = Letture.byId(it.ep);
        var r = Letture.gradeHunt(ep, sel);
        document.querySelectorAll("[data-tok]").forEach(function (w) {
          var k = +w.dataset.tok, want = r.targets.indexOf(k) >= 0, got = sel.indexOf(k) >= 0;
          w.classList.remove("on");
          if (want && got) w.classList.add("hit");
          else if (want) w.classList.add("missed");
          else if (got) w.classList.add("bad");
        });
        settle(r.verdict, sel.join(","),
          '<div class="note">Encontraste ' + r.hit + " de " + r.total +
          (r.wrong ? " · " + r.wrong + " de más" : "") +
          ". En verde las que marcaste bien; subrayadas en naranja, las que faltaban.</div>");
      });
    }

    if (it.type === "dictation") {
      on("#play1", function () { it.voice ? speakItem(it, true) : speak(it.answer, true); });
      on("#slow", function () { it.voice ? speakItem(it, true, 0.6) : speak(it.answer, true, 0.6); });
      setTimeout(function () { it.voice ? speakItem(it) : speak(it.answer); }, 250);
    }

    if (it.type === "intro") {
      on("#next", nextItem);
      on("#sayit", function () { speak(it.frase.it, true); });
      on("#slow", function () { speak(it.frase.it, true, 0.6); });
      speak(it.frase.it);
    }

    if (it.type === "tiles") {
      drawTiles();
      on("#tcheck", function () {
        if (!round.picked.length) return;
        var r = gradeTiles(it);
        var extra = "";
        if (r.verdict !== Engine.VERDICT.RIGHT && window.Diagnosi) {
          var d = Diagnosi.diagnose(r.given, [it.answer], { stem: it.stem });
          // Tiles are all Portuguese words handed over: a wrong pick is order,
          // a tile too many or too few, or the wrong form; never a «false
          // friend» or a «Spanish word».
          var TILE_SKIP = LEXICAL;
          if (d.cat && !GENERIC[d.cat] && !TILE_SKIP[d.cat]) { recordError(d, r.given); extra = diagHtml(d, true); }
        }
        settle(r.verdict, r.given, extra);
      });
      on("#tclear", function () { round.picked = []; drawTiles(); });
    }

    if (it.type === "listen") {
      on("#play1", function () { speak(it.stem, true); });
      on("#slow", function () { speak(it.stem, true, 0.6); });
      on("#peek", function () { $("#peektxt").hidden = false; });
      setTimeout(function () { speak(it.stem); }, 250);
    }
    if (SAY_TYPES[it.type]) {
      on("#play1", function () { speakItem(it, true); });
      on("#slow", function () { speakItem(it, true, 0.6); });
      on("#both", function () {
        // both words of the pair, one after the other, same voice
        var v = it.voice || {};
        speak(it.pair.a, true, v.rate, { pitch: v.pitch, vi: v.vi, onend: function () {
          speak(it.pair.b, true, v.rate, { pitch: v.pitch, vi: v.vi, keep: true });
        } });
      });
      setTimeout(function () { speakItem(it); }, 250);
    }

    if (it.type === "flash") {
      on("#reveal", function () {
        $("#flash").innerHTML =
          '<div class="fit big">' + esc(it.answer) + "</div>" +
          '<p class="muted">¿Te salió?</p>' +
          '<div class="selfgrade">' +
            '<button class="btn ghost" data-fq="0">😬 No</button>' +
            '<button class="btn ghost" data-fq="1">🤏 Casi</button>' +
            '<button class="btn" data-fq="2">😎 ¡Sí!</button></div>';
        if (!spanishText(it.answer) && !asksMeaning(it)) speak(it.answer);
        document.querySelectorAll("[data-fq]").forEach(function (b) {
          b.onclick = function () {
            var q = +b.dataset.fq;
            $("#flash").querySelectorAll("button").forEach(function (x) { x.disabled = true; });
            settle(["sbagliato", "quasi", "giusto"][q], "");
          };
        });
      });
    }

    if (it.type === "write" || it.type === "dictation") {
      var w = $("#wans");
      var check = function () { produce(w.value); };
      on("#wsend", check);
      w.onkeydown = function (e) {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); check(); }
      };
      w.focus();
      on("#hint", function () {
        var t = $("#hinttxt");
        var ws = Frasi.tiles(it.answer);
        t.textContent = ws.slice(0, Math.max(1, Math.ceil(ws.length / 3))).join(" ") + " …";
        t.hidden = false;
        w.focus();
      });
      // Too hard right now: fall back to tiles for this phrase.
      on("#easier", function () {
        round.items[round.i] = Frasi.tilesItem(it.frase);
        render();
      });
    }
  }

  /* Ache o erro: primero encontrar (notar), después corregir (producir). */
  function wireFixerr(it) {
    var toks = it.stem.split(/\s+/);
    var core = function (t) { return t.toLowerCase().replace(/^[^a-zà-ÿ'-]+|[^a-zà-ÿ'-]+$/g, ""); };
    var badT = it.bad.split(/\s+/).map(core), start = -1;
    for (var i = 0; i <= toks.length - badT.length && start < 0; i++) {
      var ok = true;
      for (var j = 0; j < badT.length; j++) if (core(toks[i + j]) !== badT[j]) ok = false;
      if (ok) start = i;
    }
    var misses = 0, found = false;
    var label = (window.Diagnosi && Diagnosi.LABEL[it.cat]) || it.cat;
    function markBad(cls) {
      for (var k = start; k < start + badT.length; k++) {
        var el = document.querySelector('[data-ft="' + k + '"]');
        if (el) el.classList.add(cls);
      }
    }
    function reveal() {
      markBad("missed");
      recordError({ cat: it.cat, target: it.answer }, it.stem);
      settle("sbagliato", "", '<div class="diag"><span class="tag">' + esc(label) + "</span>" +
        '<div class="diff"><span class="k">mal</span> ' + esc(it.bad) + ' <span class="k">→</span> ' +
        (it.good ? "<b class=\"fix\">" + esc(it.good) + "</b>" : "<i>(se borra)</i>") + "</div></div>");
    }
    function askFix() {
      $("#fixbox").innerHTML = '<p class="muted">¡Bien visto! Ahora corregila: escribí lo que va en su lugar' +
        ' o, si sobra, borrala.</p>' +
        '<div class="typed"><textarea id="fxin" class="grow" rows="1" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="send">' +
        esc(it.bad) + '</textarea><button class="btn" id="fxsend">Conferir</button></div>' +
        '<div class="row" style="margin-top:8px"><button class="tab" id="fxdel">🗑️ sobra: borrarla</button></div>';
      var inp = $("#fxin");
      growBoxes();
      inp.focus(); inp.select();
      var tries = 0;
      function judge(val) {
        if (round.answered) return;
        val = String(val).trim();
        // Other corrections that are just as right (para/pra, agora/já…).
        var goods = [it.good].concat(it.goodAlt || []).filter(Boolean);
        var right = it.good === "" ? val === "" : window.Diagnosi &&
          Diagnosi.diagnose(val, goods).verdict === Engine.VERDICT.RIGHT;
        if (right) {
          if (tries) markFixed(it.cat);
          settle(tries ? "quasi" : "giusto", val, '<div class="diag"><span class="tag">' + esc(label) + "</span></div>",
                 tries ? { label: "¡Eso es!" } : {});
          return;
        }
        tries++;
        if (tries === 1) {
          recordError({ cat: it.cat, target: it.answer }, it.stem);
          var d = it.good && window.Diagnosi ? Diagnosi.diagnose(val || "—", [it.good]) : null;
          $("#fb").innerHTML = '<div class="feedback prompt"><div class="verdict">🔎 Casi.</div><p>' +
            (it.good === "" ? "Esa palabra no hay que cambiarla por otra: sobra." :
             d && d.hint && !GENERIC[d.cat] ? mk(d.hint) : "Pista: es un error de <b>" + esc(label) + "</b>.") +
            "</p></div>";
          inp.focus();
          return;
        }
        settle("sbagliato", val, '<div class="diag"><span class="tag">' + esc(label) + "</span>" +
          '<div class="diff"><span class="k">mal</span> ' + esc(it.bad) + ' <span class="k">→</span> ' +
          (it.good ? "<b class=\"fix\">" + esc(it.good) + "</b>" : "<i>(se borra)</i>") + "</div></div>");
      }
      on("#fxsend", function () { judge(inp.value); });
      inp.onkeydown = function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); judge(inp.value); } };
      on("#fxdel", function () { judge(""); });
    }
    document.querySelectorAll("[data-ft]").forEach(function (el) {
      el.onclick = function () {
        if (round.answered || found) return;
        var k = +el.dataset.ft;
        fx.tap();
        if (k >= start && k < start + badT.length) {
          found = true;
          markBad("on");
          askFix();
          return;
        }
        misses++;
        el.classList.add("bad");
        if (misses === 1) {
          $("#fb").innerHTML = '<div class="feedback prompt"><div class="verdict">🔎 Esa está bien.</div>' +
            "<p>Pista: el error es de <b>" + esc(label) + "</b>.</p></div>";
        } else reveal();
      };
    });
  }

  function wireIo() {
    if (view.screen !== "io") return;
    on("#aisave", function () {
      var k = saveKeys();
      toast(k ? "Guardado: " + k + "." : "Claves borradas.");
      render();
    });
    on("#aicopy", function () {
      var txt = (state.aiNotes || []).map(function (n) {
        return "[" + n.id + "] " + (n.prompt || "") + " | " + (n.stem || "") + " | yo: " + (n.given || "") + " | app: " + (n.answer || "") + " | IA: " + (n.ai || "");
      }).join("\n");
      var done = function () { toast("Copiadas " + (state.aiNotes || []).length + " correcciones."); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { prompt("Copiá:", txt); });
      else prompt("Copiá:", txt);
    });
    on("#aiclear", function () { state.aiNotes = []; persist(); render(); });
    var goal = $("#goal");
    if (goal) goal.onchange = function () {
      state.goal = +goal.value;
      persist();
      renderHeader();
      toast("Meta: " + state.goal + " xp por día");
    };
    var themeSel = $("#theme-set");
    if (themeSel) themeSel.onchange = function () {
      state.theme = themeSel.value;
      persist();
      applyTheme();
      renderHeader();
    };
    var silent = $("#silent");
    if (silent) silent.onchange = function () {
      state.silent = silent.checked;
      persist();
      renderHeader();
    };
    document.querySelectorAll("[data-why3]").forEach(function (b) {
      b.onclick = function () { state.ideal = Object.assign({}, state.ideal || {}, { why: b.dataset.why3, at: Date.now() }); persist(); render(); };
    });
    on("#idealsave", function () {
      state.ideal = Object.assign({}, state.ideal || {}, { text: ($("#idealtext").value || "").trim().slice(0, 120), at: Date.now() });
      persist(); toast("🎯 Guardado."); render();
    });
    on("#share", shareCard);
    var ret = $("#retention");
    if (ret) ret.onchange = function () { state.retention = +ret.value; persist(); toast("Retención: " + Math.round(state.retention * 100) + " %"); };
    var notte = $("#notte");
    if (notte) notte.onchange = function () { state.notte = notte.checked; persist(); };
    on("#remind", function () {
      var t = $("#remtime").value || "13:30";
      state.remind = t;
      persist();
      download(new Blob([reminderIcs(t)], { type: "text/calendar" }), "portugues-diario.ics");
      toast("Abrí el archivo para agregarlo a tu calendario.", 3000);
    });
    on("#export", exportSave);
    on("#import", function () { $("#importfile").click(); });
    var file = $("#importfile");
    if (file) file.onchange = function () { if (file.files[0]) importSave(file.files[0]); };

    var pm = $("#persistmsg");
    if (pm && navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(function (p) {
        pm.textContent = p
          ? "🔒 El navegador marcó tus datos como persistentes: no los borra solo."
          : "Instalá la app en la pantalla de inicio para que el teléfono no borre tus datos.";
      });
    }

    on("#reset", function () {
      if (!confirm("Esto borra tu progreso completo. ¿Seguro?")) return;
      state = Engine.blankSave();
      persist();
      go("oggi");
      renderHeader();
      toast("Progreso borrado.");
    });
  }

  /* ------------------------------------------------------------------ arranque */

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    installPrompt = e;
    if (view.screen === "oggi" && course) render();
  });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        reg.update().catch(function () { /* offline */ });
      }).catch(function () { /* offline no */ });
      // A new version took over: reload once so the screen runs it too
      // (outside a round, so no answer is lost).
      var hadController = !!navigator.serviceWorker.controller, reloading = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (!hadController || reloading) return;
        var go = function () {
          if (["gioco", "lampo", "lezione", "lettura"].indexOf(view.screen) >= 0) { setTimeout(go, 5000); return; }
          reloading = true;
          location.reload();
        };
        go();
      });
    });
  }
  // Ask the browser not to evict the save under storage pressure.
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(function () { /* */ });
  }

  // Coming back to the app after a while: refresh the header (new day, streak).
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && course) {
      renderHeader();
      if (view.screen === "oggi") render();
    }
    if (document.hidden && course) updateBadge();
  });
  // The app icon shows how many cards are due (Badging API; a passive
  // reminder that needs no server and no permission on Android).
  function updateBadge() {
    if (!navigator.setAppBadge || !course) return;
    try {
      var n = Drills.dueCount(course, state, itemMap);
      if (n) navigator.setAppBadge(Math.min(n, 20)).catch(function () { /* */ });
      else navigator.clearAppBadge().catch(function () { /* */ });
    } catch (e) { /* */ }
  }

  // Test hook (only with ?test in the URL): lets the automated playthrough
  // read the current question so it can answer right or wrong on purpose.
  if (/[?&]test\b/.test(location.search)) {
    window.__test = {
      item: function () { return round && view.screen === "gioco" ? round.items[round.i] : null; },
      state: function () { return state; },
      round: function () { return round; }
    };
  }

  // The glossary is optional too: without it words are just not tappable.
  fetch("data/glossario.json")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (g) { glossario = g; })
    .catch(function () { /* sin glosario */ });

  // The frequency layer is optional too: without it, no coverage meter.
  fetch("data/frequenza.json")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (f) { if (f && window.Freq) { Freq.load(f); if (view.screen === "io" || view.screen === "oggi") render(); } })
    .catch(function () { /* sin frecuencias */ });

  // The bank is optional: without it the app still works, just smaller.
  var bankP = fetch("data/bank.json")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (b) { if (b) Banca.load(b); })
    .catch(function () { /* sin banco */ });

  fetch("data/course.json")
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) { return bankP.then(function () { return data; }); })
    .then(function (data) {
      course = data;
      itemMap = Drills.itemsById(course);
      registerStories();
      view.week = Math.min(state.unlocked, 52);
      if (location.hash === "#pausa") { renderHeader(); startRound("pausa"); return; }
      if (location.hash === "#micro") { renderHeader(); startRound("micro"); return; }
      updateBadge();
      renderHeader();
      render();
    })
    .catch(function (e) {
      app().innerHTML = '<div class="card"><h2>No se pudo cargar el curso</h2>' +
        "<p>La primera vez la app necesita internet para descargarse; después funciona sin conexión. " +
        "Revisá la conexión y probá de nuevo.</p>" +
        '<button class="btn" id="retry">Reintentar</button>' +
        (location.protocol === "file:" ? '<p class="muted">Abierta como archivo: serví la carpeta ' +
          "<code>docs/</code> con un servidor web (python3 -m http.server).</p>" : "") +
        '<p class="muted">' + esc(e.message) + "</p></div>";
      var rb = document.getElementById("retry");
      if (rb) rb.onclick = function () { location.reload(); };
    });
})();
