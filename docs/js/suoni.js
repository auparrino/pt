/*
 * Suoni: el oído.  Pares mínimos con alta variabilidad (HVPT: Uchihara,
 * Karas & Thomson 2025, g = 0,92 en percepción), habla conectada (Siegel
 * & Siegel 2015), entonación y acento tónico, dictado por fragmentos
 * (Yu, Boers & Tremblay 2025) y dictogloss (Wajnryb 1990).  Los datos
 * están en ascolto_data.js y dictogloss_data.js; el audio lo pone el TTS
 * del teléfono, con voces, velocidades y tonos distintos para simular la
 * variabilidad de hablantes.  El dictado y «¿Qué forma escuchaste?» usan
 * además oraciones grabadas por personas reales (Common Voice,
 * voci_cv_data.js).
 */
(function (root) {
  "use strict";

  function req(name) { try { return typeof require === "function" ? require(name) : null; } catch (e) { return null; } }
  var Data = root.AscoltoData || req("./ascolto_data.js");
  var Dg = root.DictoglossData || req("./dictogloss_data.js");
  var Engine = root.Engine || (typeof require === "function" ? require("./engine.js") : null);
  var Banca = root.Banca || (typeof require === "function" ? require("./banca.js") : null);
  var Frasi = root.Frasi || (typeof require === "function" ? require("./frasi.js") : null);
  var CV = root.VociCV || req("./voci_cv_data.js");

  function shuffle(a, rnd) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor((rnd || Math.random)() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  // Variability: rate × pitch (and the voice, chosen by the app among the
  // Italian voices of the phone).  Never the same combination twice in a row.
  var RATES = [0.85, 1, 1.15], PITCHES = [0.9, 1, 1.1];
  function voiceOf(k) {
    return { rate: RATES[k % 3], pitch: PITCHES[Math.floor(k / 3) % 3], vi: k % 2 };
  }

  var CAT_ES = { geminate: "dobles consonantes", vocali: "vocales abiertas y cerradas", affricate: "z: [ts] y [dz]",
                 palatali: "gli, gn, sc", sonore: "s sonora, v", vibranti: "r simple y rr", altro: "c, g, qu" };

  function pairItem(p, k) {
    var sayB = Math.random() < 0.5, said = sayB ? p.b : p.a;
    var shown = p.written ? [p.written[0], p.written[1]] : [p.a, p.b];
    var answer = p.written ? (sayB ? p.written[1] : p.written[0]) : said;
    return { id: "suoni:" + p.id, src: "ascolto", type: "coppia", cat: p.cat, pair: p, voice: voiceOf(k),
             prompt: "¿Cuál escuchaste? · " + (CAT_ES[p.cat] || p.cat), say: said, stem: "",
             options: shown.slice(), answer: answer, accept: [answer],
             note: p.note || "", es: p.es };
  }
  function connItem(c, k) {
    return { id: "suoni:" + c.id, src: "ascolto", type: c.kind, voice: voiceOf(k),
             prompt: c.kind === "conta" ? "¿Cuántas palabras escuchaste?" : "¿Qué escuchaste? Elegí la transcripción",
             say: c.say, stem: "", options: c.options.slice(), answer: c.answer, accept: [c.answer], note: c.note, es: c.es };
  }
  function intoItem(x, k) {
    return { id: "suoni:" + x.id, src: "ascolto", type: "intonazione", voice: voiceOf(k),
             prompt: "¿Pregunta o afirmación? Escuchá la melodía", say: x.say, stem: "",
             options: ["pregunta", "afirmación"], answer: x.answer, accept: [x.answer], es: x.es,
             note: "En italiano la pregunta sí/no se marca solo con la entonación, que sube al final: no hay «¿» ni cambio de orden." };
  }
  function accItem(x, k) {
    return { id: "suoni:" + x.id, src: "ascolto", type: "accento", voice: voiceOf(k),
             prompt: "¿Qué palabra escuchaste? Fijate dónde cae el acento", say: x.say, stem: "",
             options: x.options.slice(), answer: x.answer, accept: [x.answer], note: x.note, es: x.es };
  }

  /* Dictation by fragments: five to eight words of a sentence of the bank
     (its grammar already taught) or of a phrase the learner knows. */
  function fragments(week, state) {
    var out = [];
    // Real voices first: a sentence of Common Voice for this week, when
    // there is one, two times out of three.
    var real = realFragments(week);
    if (real.length && Math.random() < 2 / 3) return real;
    var B = Banca && Banca.loaded() ? Banca.bank() : null;
    if (B) B.sentences.forEach(function (s, i) {
      if ((s.w || 1) > week) return;
      (s.it || []).slice(0, 1).forEach(function (it) {
        var n = it.split(/\s+/).length;
        if (n >= 4 && n <= 9) out.push({ text: it, id: "suoni:d:b" + i });
      });
    });
    if (Frasi) Frasi.ALL.forEach(function (f) {
      var n = f.it.split(/\s+/).length;
      if (state && state.cards[f.id] && n >= 4 && n <= 9) out.push({ text: f.it, id: "suoni:d:" + f.id });
    });
    return out;
  }
  function realFragments(week) {
    return CV ? CV.ALL.filter(function (x) { return x.w <= week; }).map(function (x) {
      return { text: x.it, id: "suoni:cv:" + x.f, audio: CV.url(x) };
    }) : [];
  }
  function dictItem(fr, k) {
    var it = { id: fr.id, src: "ascolto", type: "dictation", voice: voiceOf(k),
             prompt: "Dictado: escuchá y escribí exactamente lo que oís (dobles y tildes incluidas)",
             say: fr.text, stem: fr.text, answer: fr.text, accept: [fr.text], dettato: true,
             note: "Las dobles se oyen más largas; una sola letra cambia la palabra (nono / nonno)." };
    if (fr.audio) it.audio = fr.audio;
    return it;
  }

  /* «¿Qué forma escuchaste?»: a real sentence, the form it uses blanked
     out, and the form that competes with it (andassi / andavo, esca /
     esce).  Like the duels, but by ear: only the audio decides. */
  function formPool(week) {
    return CV ? CV.ALL.filter(function (x) { return x.a && x.fw <= week; }) : [];
  }
  function formItem(x, k) {
    var shown = x.it.replace(x.a, "___");
    return { id: "suoni:cvf:" + x.f, src: "ascolto", type: "forma", voice: voiceOf(k), audio: CV.url(x),
             prompt: "¿Qué forma escuchaste?", say: x.it, stem: shown,
             options: shuffle([x.a, x.b]), answer: x.a, accept: [x.a],
             es: "«" + x.it + "» · " + x.why };
  }

  function dueFirst(list, cards) {
    var now = Date.now();
    // due first (a review is worth more than a new item), then unseen
    var rank = function (x) {
      var c = cards["suoni:" + x.id];
      if (!c) return 1 + Math.random();
      if (c.due <= now) return 0 + Math.random();
      return 2 + Math.random() + (c.due - now) / 3.15e10;
    };
    return list.map(function (x) { return { x: x, r: rank(x) }; }).sort(function (a, b) { return a.r - b.r; }).map(function (o) { return o.x; });
  }

  /* A session: six pairs (the categories that hurt most first: geminate
     and affricate), two of connected speech, two of intonation, one of
     stress, one dictation.  Unseen and due first. */
  function session(state, week, opts) {
    opts = opts || {};
    var cards = (state && state.cards) || {}, wk = week || 1, k = Math.floor(Math.random() * 9), out = [];
    if (!Data) return out;
    var pairs = dueFirst(Data.PAIRS.filter(function (p) { return p.week <= wk; }), cards);
    // spread the categories: at most three of the same in a session
    var byCat = {}, chosen = [];
    pairs.forEach(function (p) {
      if (chosen.length >= (opts.pairs || 6)) return;
      byCat[p.cat] = (byCat[p.cat] || 0) + 1;
      if (byCat[p.cat] <= 3) chosen.push(p);
    });
    chosen.forEach(function (p) { out.push(pairItem(p, k++)); });
    dueFirst(Data.CONNESSO.filter(function (c) { return c.week <= wk; }), cards).slice(0, 2).forEach(function (c) { out.push(connItem(c, k++)); });
    dueFirst(Data.INTONAZIONE.filter(function (x) { return x.week <= wk; }), cards).slice(0, 2).forEach(function (x) { out.push(intoItem(x, k++)); });
    dueFirst(Data.ACCENTO.filter(function (x) { return x.week <= wk; }), cards).slice(0, 1).forEach(function (x) { out.push(accItem(x, k++)); });
    if (!opts.silent) {
      var fr = fragments(wk, state);
      if (fr.length) out.push(dictItem(pick(fr), k++));
      dueFirst(formPool(wk).map(function (x) { return { id: "cvf:" + x.f, x: x }; }), cards).slice(0, 1)
        .forEach(function (o) { out.push(formItem(o.x, k++)); });
    }
    return shuffle(out);
  }

  // One item for the coffee break: a pair or a bit of connected speech.
  function randomItem(state, week) {
    if (!Data) return null;
    var wk = week || 1, cards = (state && state.cards) || {};
    var pool = Data.PAIRS.filter(function (p) { return p.week <= wk; });
    if (!pool.length) return null;
    var p = dueFirst(pool, cards)[0];
    return Math.random() < 0.7 ? pairItem(p, Math.floor(Math.random() * 9))
      : (function () { var c = Data.CONNESSO.filter(function (x) { return x.week <= wk; }); return c.length ? connItem(pick(c), 1) : pairItem(p, 2); })();
  }

  function progress(week, cards) {
    if (!Data) return { seen: 0, total: 0 };
    var all = Data.PAIRS.filter(function (p) { return p.week <= (week || 1); });
    return { total: all.length, seen: all.filter(function (p) { return cards["suoni:" + p.id]; }).length };
  }

  /* ------------------------------------------------------- dictogloss */

  function norm(s) {
    return String(s || "").toLowerCase().replace(/[’‘`´]/g, "'").normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ").trim();
  }
  function dgFor(week) {
    if (!Dg) return null;
    for (var i = 0; i < Dg.TESTI.length; i++) if (Dg.TESTI[i].week === week) return Dg.TESTI[i];
    return null;
  }
  /* A chunk counts as recovered when it appears (accents and apostrophes
     aside, one typo per long word forgiven) or when all its words appear
     in order within a short window: what is retrieved, not copied, is
     what stays (Yu, Boers & Tremblay 2025). */
  function chunkFound(chunk, given) {
    var g = norm(given), c = norm(chunk);
    if (!c) return false;
    if (g.indexOf(c) >= 0) return true;
    var gw = g.split(" "), cw = c.split(" ");
    var close = function (a, b) { return a === b || (a.length >= 6 && Engine && Engine.editDistance(a, b) <= 1); };
    for (var i = 0; i < gw.length; i++) {
      var j = i, ok = true;
      for (var x = 0; x < cw.length; x++) {
        var found = -1;
        for (var y = j; y < Math.min(gw.length, j + 3); y++) if (close(gw[y], cw[x])) { found = y; break; }
        if (found < 0) { ok = false; break; }
        j = found + 1;
      }
      if (ok) return true;
    }
    return false;
  }
  function dgScore(text, given) {
    var found = [], missed = [];
    (text.chunks || []).forEach(function (c) { (chunkFound(c, given) ? found : missed).push(c); });
    var words = norm(given).split(" ").filter(Boolean).length;
    return { found: found, missed: missed, n: text.chunks.length, words: words,
             pct: text.chunks.length ? Math.round(found.length / text.chunks.length * 100) : 0 };
  }

  var api = { session: session, randomItem: randomItem, progress: progress, pairItem: pairItem, formItem: formItem, formPool: formPool, realFragments: realFragments, voiceOf: voiceOf,
              fragments: fragments, dictItem: dictItem, CAT_ES: CAT_ES,
              dgFor: dgFor, dgScore: dgScore, chunkFound: chunkFound, norm: norm,
              data: function () { return Data; }, dictogloss: function () { return Dg; } };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Suoni = api;
})(typeof window !== "undefined" ? window : globalThis);
