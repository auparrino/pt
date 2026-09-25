/*
 * La capa de frecuencia del vocabulario portugués (Brasil): cuán frecuente
 * es cada palabra en el habla (subtítulos de OpenSubtitles 2018, pt_br) y
 * a qué banda de nivel MCER pertenece (no hay lista KELLY para portugués:
 * el nivel es el rango de frecuencia del lema, A1 los 800 primeros, A2
 * hasta 2.000, B1 hasta 4.000…; ver tools/build_frequenza.py).  Con eso se
 * mide la cobertura (Nation 2006: los 2.000 lemas más frecuentes cubren
 * cerca del 90 % de lo que se dice en una conversación), se prioriza lo
 * frecuente que falta, se arman distractores de la misma banda y se
 * verifica en el teléfono que un texto generado use solo palabras
 * conocidas (Dugan et al. 2026).  Datos: docs/data/frequenza.json.
 */
(function (root) {
  "use strict";

  var D = null;                 // { lemmi: {lemma: [zipfEscrito, zipfOral, nivel, pos]}, forme: {forma: lemma} }
  var LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
  var L = "a-záàâãéêíóôõúüç";   // letras del portugués
  var RE_EDGE = new RegExp("^[^" + L + "']+|[^" + L + "']+$", "g");
  var RE_SPLIT = new RegExp("[^" + L + "'-]+");
  // Function words a learner meets from day one: they never count as unknown.
  var STOP = ("o a os as um uma uns umas de em por para pra pro com sem sobre até e ou mas nem que se " +
    "não sim é são ser sou somos está estão estou estamos tá tô tem têm tenho temos há " +
    "do da dos das no na nos nas num numa ao aos à às pelo pela pelos pelas dele dela deles delas " +
    "nele nela neste nesse deste desse disso isso isto aquilo este esta esse essa aquele aquela " +
    "eu tu você vocês ele ela eles elas nós gente me te lhe mim comigo conosco meu minha meus minhas " +
    "seu sua seus suas nosso nossa teu tua como onde quando quem qual quais quanto porque por que " +
    "aqui aí ali lá cá mais menos muito pouco tão tanto também já ainda sempre nunca agora depois " +
    "antes hoje ontem amanhã bem mal então só tudo nada coisa né").split(/\s+/);
  var STOPSET = {};
  STOP.forEach(function (w) { STOPSET[w] = 1; });

  function load(data) { D = data && data.lemmi ? data : null; PLAIN = null; }
  function loaded() { return !!D; }

  function clean(w) {
    return String(w || "").toLowerCase().replace(/[’‘`´]/g, "'").replace(RE_EDGE, "");
  }
  // Tokens of a Portuguese text: hyphenated clitics split (chamo-me → chamo,
  // me; dá-lo → dá, lo), compounds too (guarda-chuva → guarda, chuva).
  function tokens(text) {
    return String(text || "").toLowerCase().replace(/[’‘`´]/g, "'")
      .split(RE_SPLIT).join(" ").replace(/-/g, " ").split(/\s+/).map(clean).filter(Boolean);
  }
  // Infinitive before an enclitic: fazê-lo → fazer, comprá-la → comprar,
  // pô-lo → pôr, parti-lo → partir.
  function unclitic(v) {
    var m = /^(.*?)([áâêéíô])$/.exec(v);
    if (!m) return null;
    var r = { "á": "ar", "â": "ar", "ê": "er", "é": "er", "í": "ir", "ô": "or" }[m[2]];
    return m[2] === "ô" ? m[1] + "ôr" : m[1] + r;
  }
  function lemma(w) {
    w = clean(w);
    if (!D) return w;
    if (D.lemmi[w]) return w;
    var l = D.forme[w];
    if (l) return l;
    var k = w.indexOf("-");
    if (k > 0 && /-(me|te|se|lhe|lhes|nos|vos|o|a|os|as|lo|la|los|las|no|na|nas)(-|$)/.test(w)) {
      // the verb of a verb + clitic: chamo-me, fazê-lo, parti-lo
      var head = w.slice(0, k), inf = unclitic(head);
      if (inf && D.lemmi[inf]) return inf;
      if (/-(lo|la|los|las)(-|$)/.test(w) && D.lemmi[head + "r"]) return head + "r";
      return lemma(head);
    }
    if (k > 0) return w;                                           // a compound: guarda-chuva
    k = w.indexOf("'");
    if (k >= 0 && k < w.length - 1) return lemma(w.slice(k + 1));     // d'água
    // rare superlatives and diminutives: lindíssimo → lindo, gatinhos → gato
    var m = /^(.{3,}?)(?:íssim|zinh|inh)([oa])s?$/.exec(w);
    if (m) {
      var c = [m[1] + m[2], m[1] + "o", m[1] + "e", m[1]];
      for (var i = 0; i < c.length; i++) if (D.lemmi[c[i]] || D.forme[c[i]]) return D.forme[c[i]] || c[i];
    }
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
    STOP.forEach(function (w) { out[w] = true; out[lemma(w)] = true; });
    return out;
  }

  /* Coverage per level: how many of the lemmas of each band the learner
     knows, and the share of the fundamental vocabulary (A1 + A2, the
     2.000 most frequent lemmas). */
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
        if (i > 0 && /^[A-ZÀ-Ý]/.test(tok.replace(/^[«"“(¿¡]+/, ""))) return;     // a name
        tokens(tok).forEach(function (w) {
          if (!w || STOPSET[w] || /^\d+$/.test(w)) return;
          n++;
          var l = lemma(w);
          if (!knownSet[l] && !knownSet[w]) miss.push(w);
        });
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

  /* ------------------------------------------------------ pseudopalabras
     For the recognition-fluency game («Palavra ou não?»: real word or not,
     in under a second).  A pseudo-word is a real word with one letter of
     its stem swapped for another of its kind, keeping Portuguese
     phonotactics:
     - the ending stays (-ção, -ções, -mente, -inho, -dade, -agem, -eiro,
       -oso, -ar, -er, -ir…), so it still looks like a noun, adverb or verb;
     - digraphs are never broken (lh, nh, ch, rr, ss, qu, gu), ç only
       before a, o, u, no doubled letters but rr and ss, no three
       consonants in a row, no syllable without a vowel;
     - it is never a word: not a lemma or a form of the lists, and not a
       real word once the accents are taken away (voce ≠ você) or the
       plural -s is dropped.                                               */
  var VOW = "aeiou", CONS = "bcdfgjlmnprstvz";
  var ENDINGS = /(ções|ção|mente|zinho|zinha|inho|inha|dades|dade|agens|agem|eiro|eira|oso|osa|ista|ável|ível|ar|er|ir|ão|ões|ns|s)$/;
  var DIGRAPH = /^(lh|nh|ch|rr|ss|qu|gu)$/;
  var PLAIN = null;
  function plain(w) { return w.normalize ? w.normalize("NFD").replace(/[̀-ͯ]/g, "") : w; }
  function isWord(p) {
    if (!D) return false;
    if (D.lemmi[p] || D.forme[p]) return true;
    if (!PLAIN) {
      PLAIN = {};
      Object.keys(D.lemmi).forEach(function (x) { PLAIN[plain(x)] = 1; });
      Object.keys(D.forme).forEach(function (x) { PLAIN[plain(x)] = 1; });
    }
    var q = plain(p);
    return !!(PLAIN[q] || (/s$/.test(q) && PLAIN[q.slice(0, -1)]));
  }
  function phonotactic(p) {
    if (/(.)\1/.test(p.replace(/rr|ss/g, ""))) return false;       // doubled letters (but rr, ss)
    if (/ç(?![aouãõáóú])/.test(p) || /q(?!u)/.test(p)) return false;
    // consonant pairs: an onset (br, cl, tr, pl…) or a coda + onset (s, r, l, m, n, x before a consonant)
    var q = p.replace(/lh|nh|ch|rr|ss|qu|gu/g, "C");
    var pairs = q.match(/[bcdfgjlmnprstvxz](?=[bcdfgjlmnprstvxz])/g) ? q.match(/[bcdfgjlmnprstvxz][bcdfgjlmnprstvxz]/g) : [];
    for (var i = 0; i < pairs.length; i++) {
      var pr = pairs[i], at = q.indexOf(pr);
      var onset = /^[bcdfgptv][rl]$/.test(pr) && pr !== "dl" && pr !== "vl";
      if (!onset && (at === 0 || !/^[srlmnx]/.test(pr))) return false;
    }
    if (/[^aeiouáàâãéêíóôõú]{3}/.test(p.replace(/lh|nh|ch|rr|ss|qu|gu/g, "C"))) return false;
    if (/^(rr|ss|lh|nh)/.test(p)) return false;
    if (/[bcdfgjkptvq]$/.test(p)) return false;                   // Portuguese words end in a vowel, r, s, l, z, m
    if (/[^aeiouáàâãéêíóôõú]{2}$/.test(p) && !/(ns|rs|ls)$/.test(p)) return false;
    return /[aeiouáàâãéêíóôõú]/.test(p);
  }
  function pseudo(w, rnd) {
    rnd = rnd || Math.random;
    w = clean(w);
    if (w.length < 4 || /[^a-záàâãéêíóôõúç]/.test(w)) return null;
    var m = ENDINGS.exec(w), stemEnd = m && m.index >= 2 ? m.index : w.length - 1;
    for (var tries = 0; tries < 40; tries++) {
      var k = 1 + Math.floor(rnd() * Math.max(1, stemEnd - 1)), c = w[k];
      if (k >= stemEnd) continue;
      if (DIGRAPH.test(w.slice(k - 1, k + 1)) || DIGRAPH.test(w.slice(k, k + 2))) continue;
      var set = VOW.indexOf(c) >= 0 ? VOW : CONS.indexOf(c) >= 0 ? CONS : null;
      if (!set) continue;                                        // accented vowels, ç: kept
      var r = set[Math.floor(rnd() * set.length)];
      if (r === c) continue;
      var p = w.slice(0, k) + r + w.slice(k + 1);
      // c and g before e / i change their sound: keep the word's sound class
      if (/[cg]/.test(r) && /[ei]/.test(w[k + 1] || "")) continue;
      if (phonotactic(p) && !isWord(p) && !info(p)) return p;
    }
    return null;
  }

  var api = { load: load, loaded: loaded, LEVELS: LEVELS, tokens: tokens, lemma: lemma, info: info, zipf: zipf, level: level,
              pos: pos, known: known, knownLemmas: knownLemmas, coverage: coverage, nextWords: nextWords, missRate: missRate,
              sameBand: sameBand, pseudo: pseudo, STOP: STOP };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Freq = api;
})(typeof window !== "undefined" ? window : globalThis);
