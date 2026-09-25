/*
 * La capa de frecuencia del vocabulario: cuán frecuente es cada palabra
 * (escrita, itWaC; hablada, OpenSubtitles) y a qué nivel MCER pertenece
 * (KELLY).  Con eso se mide la cobertura (Nation 2006; De Mauro 2016:
 * 2.000 lemas fundamentales cubren el 86 % de lo que se dice), se
 * prioriza lo frecuente que falta, se arman distractores de la misma banda
 * y se verifica en el teléfono que un texto generado use solo palabras
 * conocidas (Dugan et al. 2026).  Datos: docs/data/frequenza.json.
 */
(function (root) {
  "use strict";

  var D = null;                 // { lemmi: {lemma: [zipfEscrito, zipfOral, nivel, pos]}, forme: {forma: lemma} }
  var LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
  // Function words a learner meets from day one: they never count as unknown.
  var STOP = ("il lo la i gli le l un uno una un' di a da in con su per tra fra e o ma che chi cui non si mi ti ci vi ne " +
    "io tu lui lei noi voi loro me te se sé è sono sei siamo siete ho hai ha abbiamo avete hanno del dello della dei degli " +
    "delle dell al allo alla ai agli alle all dal dallo dalla dai dagli dalle dall nel nello nella nei negli nelle nell sul " +
    "sullo sulla sui sugli sulle sull come dove quando perché quanto quale quali questo questa questi queste quello quella " +
    "quelli quelle qui qua lì là più meno molto poco tanto troppo anche già ancora sempre mai ora adesso poi oggi ieri domani " +
    "sì no c cosa cose bene male").split(/\s+/);
  var STOPSET = {};
  STOP.forEach(function (w) { STOPSET[w] = 1; });

  function load(data) { D = data && data.lemmi ? data : null; }
  function loaded() { return !!D; }

  function clean(w) {
    return String(w || "").toLowerCase().replace(/[’‘`´]/g, "'").replace(/^[^a-zàèéìíòóùú']+|[^a-zàèéìíòóùú']+$/g, "");
  }
  // Tokens of an Italian text (elided articles split: l'amico → l', amico).
  function tokens(text) {
    return String(text || "").toLowerCase().replace(/[’‘`´]/g, "'")
      .replace(/([a-zàèéìíòóùú])'([a-zàèéìíòóùú])/g, "$1' $2")
      .split(/[^a-zàèéìíòóùú']+/).map(clean).filter(Boolean);
  }
  function lemma(w) {
    w = clean(w);
    if (!D) return w;
    if (D.lemmi[w]) return w;
    var l = D.forme[w];
    if (l) return l;
    var k = w.indexOf("'");
    if (k >= 0 && k < w.length - 1) return lemma(w.slice(k + 1));
    return w;
  }
  function info(w) { return D ? D.lemmi[lemma(w)] || null : null; }
  function zipf(w) { var i = info(w); return i ? Math.max(i[0], i[1]) : 0; }
  function level(w) { var i = info(w); return i && i[2] ? i[2] : ""; }
  function pos(w) { var i = info(w); return i ? i[3] : ""; }
  function known(w) { var i = info(w); return !!i && (i[0] >= 3.2 || i[1] >= 3.5 || !!i[2]); }

  /* The lemmas of the words a learner has met and holds: the words of the
     week and of the bank whose cards are past the first success (a verb
     needs three), the phrases learnt (every word in them), the readings
     done.  Returns { lemma: true }. */
  function knownLemmas(state, extra) {
    var out = {}, cards = (state && state.cards) || {};
    var add = function (text) { tokens(text).forEach(function (t) { out[lemma(t)] = true; }); };
    Object.keys(cards).forEach(function (id) {
      var c = cards[id], w = null;
      if (id.indexOf("v:") === 0) w = id.slice(2);
      else if (id.indexOf("b:voc:") === 0) w = id.slice(6);
      else if (id.indexOf("ponte:") === 0) return;
      if (w) {
        var ok = c.ok || 0, need = pos(w) === "v" ? 3 : 1;
        if (ok >= need || c.state === "maint") out[lemma(w)] = true;
        return;
      }
      if (id.indexOf("frase:") === 0 && extra && extra.phrase) { var f = extra.phrase(id); if (f && (c.ok || 0) >= 1) add(f); }
    });
    (extra && extra.texts || []).forEach(add);
    STOP.forEach(function (w) { out[w] = true; });
    return out;
  }

  /* Coverage per level: how many of the lemmas of each KELLY level the
     learner knows, and the share of the fundamental vocabulary (A1 + A2). */
  function coverage(knownSet) {
    var out = { levels: {}, fundamental: [0, 0] };
    LEVELS.forEach(function (l) { out.levels[l] = [0, 0]; });
    if (!D) return out;
    Object.keys(D.lemmi).forEach(function (l) {
      var lvl = D.lemmi[l][2];
      if (!lvl) return;
      out.levels[lvl][1]++;
      if (knownSet[l]) out.levels[lvl][0]++;
      if (lvl === "A1" || lvl === "A2") { out.fundamental[1]++; if (knownSet[l]) out.fundamental[0]++; }
    });
    return out;
  }

  // The most frequent lemmas up to a level the learner does not know yet.
  function nextWords(knownSet, maxLevel, n, posFilter) {
    if (!D) return [];
    var maxI = LEVELS.indexOf(maxLevel || "B1");
    return Object.keys(D.lemmi).filter(function (l) {
      var r = D.lemmi[l];
      return r[2] && LEVELS.indexOf(r[2]) <= maxI && !knownSet[l] && l.length > 2 && l.indexOf("'") < 0 &&
        (!posFilter || r[3] === posFilter);
    }).sort(function (a, b) { return Math.max(D.lemmi[b][0], D.lemmi[b][1]) - Math.max(D.lemmi[a][0], D.lemmi[a][1]); })
      .slice(0, n || 10);
  }

  /* Token miss rate of a text against what the learner knows (Dugan et
     al. 2026): the share of content words outside the known set.  Names
     (capitalised inside the sentence) are not counted. */
  function missRate(text, knownSet) {
    var raw = String(text || ""), miss = [], n = 0;
    raw.split(/(?<=[.!?])\s+/).forEach(function (sent) {
      sent.split(/\s+/).forEach(function (tok, i) {
        var w = clean(tok);
        if (!w || STOPSET[w] || /^\d+$/.test(w)) return;
        if (i > 0 && /^[A-ZÀ-Ý]/.test(tok)) return;     // a name
        n++;
        var l = lemma(w);
        if (!knownSet[l] && !knownSet[w]) miss.push(w);
      });
    });
    return { n: n, miss: miss, rate: n ? miss.length / n : 0 };
  }

  /* Distractors of the same class and frequency band (LLM distractors are
     too rare: they give themselves away). */
  function sameBand(w, n, rnd) {
    if (!D) return [];
    var i = info(w);
    if (!i) return [];
    var z = Math.max(i[0], i[1]), l = lemma(w), out = [];
    var cand = Object.keys(D.lemmi).filter(function (x) {
      var r = D.lemmi[x];
      return x !== l && r[3] === i[3] && Math.abs(Math.max(r[0], r[1]) - z) <= 0.5 && x.length > 2 && x.indexOf("'") < 0 &&
        Math.abs(x.length - l.length) <= 3;
    });
    rnd = rnd || Math.random;
    while (cand.length && out.length < (n || 3)) out.push(cand.splice(Math.floor(rnd() * cand.length), 1)[0]);
    return out;
  }

  /* A pseudo-word from a real one: one letter swapped for one of its kind,
     keeping Italian phonotactics, and never a word of the lists.  For the
     recognition-fluency game (real word or not, in under a second). */
  var VOW = "aeiou", CONS = "bcdfglmnprstvz";
  function pseudo(w, rnd) {
    rnd = rnd || Math.random;
    w = clean(w);
    if (w.length < 4) return null;
    for (var tries = 0; tries < 20; tries++) {
      var k = 1 + Math.floor(rnd() * (w.length - 2)), c = w[k], set = VOW.indexOf(c) >= 0 ? VOW : CONS.indexOf(c) >= 0 ? CONS : null;
      if (!set) continue;
      var r = set[Math.floor(rnd() * set.length)];
      if (r === c) continue;
      var p = w.slice(0, k) + r + w.slice(k + 1);
      if (!/(.)\1\1|[^aeiou]{4}/.test(p) && !D.lemmi[p] && !D.forme[p]) return p;
    }
    return null;
  }

  var api = { load: load, loaded: loaded, LEVELS: LEVELS, tokens: tokens, lemma: lemma, info: info, zipf: zipf, level: level,
              pos: pos, known: known, knownLemmas: knownLemmas, coverage: coverage, nextWords: nextWords, missRate: missRate,
              sameBand: sameBand, pseudo: pseudo, STOP: STOP };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Freq = api;
})(typeof window !== "undefined" ? window : globalThis);
