/*
 * La banca: migliaia di esercizi generati da data/bank.json (parole, frasi,
 * errori tipici).  Ogni esercizio porta con sé la regola che mette alla
 * prova, così la diagnosi può spiegare l'errore invece di mostrare solo la
 * risposta giusta.
 *
 * Tipi: parole (in entrambe le direzioni, con l'articolo), articoli,
 * plurali, preposizioni articolate, accordo dell'aggettivo, traduzione,
 * verbo nel contesto, trova l'errore, e la clinica degli errori personali.
 */
(function (root) {
  "use strict";

  var Diagnosi = root.Diagnosi ||
    (typeof require === "function" ? require("./diagnosi.js") : null);
  var Conj = root.Conj ||
    (typeof require === "function" ? require("./conjugator.js") : null);

  var B = null;          // la banca caricata
  var IDX = {};          // indici derivati

  var LEVELS = ["A1", "A2", "B1", "B2", "C1"];

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function load(bank) {
    B = bank;
    if (Diagnosi) Diagnosi.init(bank);
    IDX = { noun: {}, sent: {}, err: {}, adj: {}, word: {}, verb: {} };
    B.nouns.forEach(function (n) { IDX.noun[n[0]] = n; });
    B.adjectives.forEach(function (a) { IDX.adj[a[0]] = a; });
    B.words.forEach(function (w) { IDX.word[w[0]] = w; });
    B.verbs.forEach(function (v) { IDX.verb[v[0]] = v; });
    return api;
  }

  function loaded() { return !!B; }

  /* Il livello del percorso decide cosa è alla portata. */
  function levelOf(state) {
    var w = (state && state.unlocked) || 1;
    return w <= 8 ? "A1" : w <= 18 ? "A2" : w <= 30 ? "B1" : w <= 42 ? "B2" : "C1";
  }
  /* E la settimana del corso decide la grammatica: build_bank.py segna in
     «w» (tradurre) e «wg» (completare) da quale settimana una frase usa
     solo tempi già spiegati. */
  function weekOf(state) { return (state && state.unlocked) || 1; }
  function taught(x, state, key) { return (x[key || "w"] || 1) <= weekOf(state); }
  function within(lvl, max) { return LEVELS.indexOf(lvl) <= LEVELS.indexOf(max); }
  function nearLevel(lvl, max) {
    var a = LEVELS.indexOf(lvl), b = LEVELS.indexOf(max);
    return a <= b && a >= b - 1;
  }

  /* --------------------------------------------------------- articoli */

  function soundOf(w) {
    if (/^(s[bcdfghklmnpqrstvz]|z|gn|ps|pn|x|y)/.test(w)) return "sz";
    if (/^[aeiouàèéìòù]/.test(w) || /^h[aeiou]/.test(w)) return "v";
    return "c";
  }

  function defArt(word, g, plural) {
    var s = soundOf(word);
    if (word === "dei" && plural) return "gli";
    if (!plural) {
      if (g === "m") return s === "sz" ? "lo" : s === "v" ? "l'" : "il";
      return s === "v" ? "l'" : "la";
    }
    if (g === "m") return s === "c" ? "i" : "gli";
    return "le";
  }

  function indefArt(word, g) {
    var s = soundOf(word);
    if (g === "m") return s === "sz" ? "uno" : "un";
    return s === "v" ? "un'" : "una";
  }

  // Irregular plurals change gender (il braccio → le braccia).
  function pluralGender(n) {
    return n[1] === "m" && /a$/.test(n[2]) && !/a$/.test(n[0]) ? "f" : n[1];
  }

  function withArt(art, word) { return /'$/.test(art) ? art + word : art + " " + word; }

  function nounWithArt(n) { return withArt(defArt(n[0], n[1], false), n[0]); }

  /* ----------------------------------------------------------- parole */

  function vocabChoice(n, kind) {
    // Italian → Spanish, recognising the word (new words start here).
    var pool, stem, ans, id;
    if (kind === "n") {
      stem = nounWithArt(n); ans = n[3]; id = "b:voc:" + n[0];
      pool = B.nouns.filter(function (x) { return x[4] === n[4] && x[3] !== ans; });
      if (pool.length < 3) pool = B.nouns;
    } else if (kind === "v") {
      stem = n[0]; ans = n[1]; id = "b:voc:" + n[0];
      pool = B.verbs.filter(function (x) { return x[1] !== ans; });
    } else if (kind === "a") {
      stem = n[0]; ans = n[4]; id = "b:voc:" + n[0];
      pool = B.adjectives.filter(function (x) { return x[4] !== ans; }).map(function (x) { return [x[0], x[0], x[0], x[4]]; });
    } else {
      stem = n[0]; ans = n[1]; id = "b:voc:" + n[0];
      pool = B.words.filter(function (x) { return x[1] !== ans; });
    }
    var opts = [ans], used = {};
    used[ans] = true;
    shuffle(pool).forEach(function (x) {
      var o = kind === "n" ? x[3] : kind === "a" ? x[3] : x[1];
      if (opts.length < 4 && !used[o]) { used[o] = true; opts.push(o); }
    });
    return { id: id, src: "banca", bank: "voc", type: "choice",
             prompt: "¿Qué significa?", stem: stem, options: shuffle(opts),
             answer: ans, accept: [ans], note: kindNote(n, kind), say: stem };
  }

  function kindNote(n, kind) {
    if (kind === "n") {
      var extra = n[2] !== n[0] ? "Plural: " + withArt(defArt(n[2], pluralGender(n), true), n[2]) + "." : "Invariable en plural.";
      return (n[6] ? n[6] + " " : "") + extra;
    }
    if (kind === "v") return (n[6] || "") + (n[2] === "essere" ? " Pasado con essere." : "");
    if (kind === "a") return n[6] || (n[0] + " · " + n[1] + " · " + n[2] + " · " + n[3]);
    return n[4] || "";
  }

  function vocabWrite(n, kind) {
    // Spanish → Italian, producing it (nouns with their article: that is
    // where gender errors show up).
    var ans, prompt, stem;
    if (kind === "n") {
      ans = nounWithArt(n);
      prompt = "Escribilo en italiano, con el artículo determinado (il, lo, la, l'…)";
      stem = n[3];
    } else if (kind === "v") { ans = n[0]; prompt = "Escribí el infinitivo en italiano"; stem = n[1]; }
    else if (kind === "a") { ans = n[0]; prompt = "Escribí el adjetivo (masculino singular)"; stem = n[4]; }
    else { ans = n[0]; prompt = "¿Cómo se dice en italiano?"; stem = n[1]; }
    return { id: "b:voc:" + (kind === "a" ? n[0] : n[0]), src: "banca", bank: "voc", type: "typed",
             prompt: prompt, stem: stem, answer: ans, accept: [ans],
             note: kindNote(n, kind), diag: true, say: ans };
  }

  // The frequency layer (docs/js/frequenza.js), when the app loaded it.
  function Freq() { return root.Freq && root.Freq.loaded() ? root.Freq : null; }

  function vocabSession(state, size) {
    var lvl = levelOf(state), cards = state.cards || {};
    var pool = [];
    B.nouns.forEach(function (n) { if (within(n[5], lvl)) pool.push([n, "n"]); });
    B.verbs.forEach(function (v) { if (within(v[5], lvl)) pool.push([v, "v"]); });
    B.adjectives.forEach(function (a) { if (within(a[5], lvl)) pool.push([a, "a"]); });
    B.words.forEach(function (w) { if (within(w[3], lvl)) pool.push([w, "w"]); });
    var fresh = shuffle(pool.filter(function (x) { return !cards["b:voc:" + x[0][0]]; }));
    // The most frequent unknown words first (Nation 2006): a shuffle within
    // the same band keeps the sessions varied.
    var F = Freq();
    if (F) fresh.sort(function (a, b) { return Math.round(F.zipf(b[0][0]) * 2) - Math.round(F.zipf(a[0][0]) * 2); });
    var seen = shuffle(pool.filter(function (x) { return cards["b:voc:" + x[0][0]]; }));
    var out = [];
    // New words: recognise first; known words: produce (desirable difficulty).
    fresh.slice(0, 6).forEach(function (x) { out.push(vocabChoice(x[0], x[1])); });
    seen.slice(0, (size || 12) - out.length).forEach(function (x) { out.push(vocabWrite(x[0], x[1])); });
    if (out.length < (size || 12)) {
      fresh.slice(6, 6 + (size || 12) - out.length).forEach(function (x) { out.push(vocabWrite(x[0], x[1])); });
    }
    return shuffle(out);
  }

  /* A session on given lemmas (the frequent words the learner lacks, from
     the coverage meter): the bank entries that match, recognised first. */
  function vocabSessionFor(state, lemmas, size) {
    var cards = state.cards || {}, out = [];
    (lemmas || []).forEach(function (l) {
      var n = IDX.noun[l] ? [IDX.noun[l], "n"] : IDX.verb[l] ? [IDX.verb[l], "v"] : IDX.adj[l] ? [IDX.adj[l], "a"] : IDX.word[l] ? [IDX.word[l], "w"] : null;
      if (!n || out.length >= (size || 12)) return;
      out.push(cards["b:voc:" + n[0][0]] ? vocabWrite(n[0], n[1]) : vocabChoice(n[0], n[1]));
    });
    return out;
  }
  // Is a lemma in the bank at all (so the coverage meter can offer it)?
  function hasWord(l) { return !!(IDX.noun[l] || IDX.verb[l] || IDX.adj[l] || IDX.word[l]); }

  /* ------------------------------------------------------------ forme */

  function articleItem(n, plural) {
    var word = plural ? n[2] : n[0];
    var g = plural ? pluralGender(n) : n[1];
    var ans = defArt(word, g, plural);
    var set = plural ? ["i", "gli", "le"] : ["il", "lo", "l'", "la"];
    if (!plural && ans !== "la") set = ["il", "lo", "l'", "la"];
    return { id: "b:art:" + n[0] + (plural ? ":p" : ":s"), src: "banca", bank: "forme",
             type: "choice", prompt: "Elegí el artículo" + (plural ? " (plural)" : ""),
             stem: "___ " + word + "  (" + n[3] + ")", options: set, answer: ans, accept: [ans],
             choiceDiag: { before: "", after: " " + word },
             note: artNote(word, g, plural, n), say: withArt(ans, word) };
  }

  function artNote(word, g, plural, n) {
    var s = soundOf(word);
    var why = s === "sz" ? "Empieza con s + consonante, z, gn o ps: lo / gli."
            : s === "v" ? "Empieza con vocal: l' (y gli en plural masculino)."
            : g === "m" ? "Masculino con consonante normal: il / i." : "Femenino: la / le.";
    return why + (n[6] ? " " + n[6] : "");
  }

  // Nouns that live in the singular (la fame, il sangue, i mesi): their
  // plural is grammar trivia, not something to drill.
  var MONTHS = /^(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)$/;
  function countable(n) {
    return !/singular/i.test(n[6] || "") && !MONTHS.test(n[0]) &&
      !/^(fame|sete|sangue|salute|latte|frutta|pepe|sale|miele|ossigeno|pazienza|coraggio|fortuna|gente|roba|mezzanotte|mezzogiorno)$/.test(n[0]);
  }

  function pluralItem(n) {
    var g = pluralGender(n);
    var artP = defArt(n[2], g, true);
    return { id: "b:pl:" + n[0], src: "banca", bank: "forme", type: "typed",
             prompt: "Escribí el plural", stem: nounWithArt(n) + " → " + artP + " ___",
             answer: n[2], accept: [n[2]], note: n[6] || "", diag: true,
             say: withArt(artP, n[2]) };
  }

  var PREPS = ["a", "di", "da", "in", "su"];
  var CONTR = {
    a: { il: "al", lo: "allo", "l'": "all'", la: "alla", i: "ai", gli: "agli", le: "alle" },
    di: { il: "del", lo: "dello", "l'": "dell'", la: "della", i: "dei", gli: "degli", le: "delle" },
    da: { il: "dal", lo: "dallo", "l'": "dall'", la: "dalla", i: "dai", gli: "dagli", le: "dalle" },
    in: { il: "nel", lo: "nello", "l'": "nell'", la: "nella", i: "nei", gli: "negli", le: "nelle" },
    su: { il: "sul", lo: "sullo", "l'": "sull'", la: "sulla", i: "sui", gli: "sugli", le: "sulle" }
  };

  function prepItem(n, prep, plural) {
    var word = plural ? n[2] : n[0], g = plural ? pluralGender(n) : n[1];
    var art = defArt(word, g, plural), ans = CONTR[prep][art];
    return { id: "b:prep:" + prep + ":" + n[0] + (plural ? ":p" : ""), src: "banca", bank: "forme",
             type: "typed", prompt: "Uní la preposición con el artículo",
             stem: "(" + prep + " + " + art + ") " + word + " → ___ " + word,
             answer: ans, accept: [ans], diag: true,
             note: "*" + prep + " + " + art + "* = *" + ans + "*.", say: withArt(ans, word) };
  }

  var GENERIC_ADJ = ["nuovo", "vecchio", "bello", "grande", "piccolo", "bianco", "rosso", "nero",
                     "giallo", "verde", "azzurro", "caro", "economico", "moderno", "antico",
                     "pulito", "sporco", "famoso", "italiano", "lungo", "corto", "pesante",
                     "leggero", "comodo", "elegante", "semplice", "strano", "perfetto", "pieno", "vuoto"];
  var CONCRETE = { casa: 1, città: 1, vestiti: 1, cibo: 1, viaggio: 1, negozi: 1, tecnologia: 1, scuola: 1 };

  function agreeItem(n, adjKey, plural) {
    var a = IDX.adj[adjKey];
    if (!a) return null;
    var g = plural ? pluralGender(n) : n[1];
    var word = plural ? n[2] : n[0];
    var form = plural ? (g === "m" ? a[2] : a[3]) : (g === "m" ? a[0] : a[1]);
    var art = plural ? defArt(word, g, true) : indefArt(word, g);
    return { id: "b:agr:" + n[0] + ":" + adjKey + (plural ? ":p" : ""), src: "banca", bank: "forme",
             type: "typed", prompt: "Concordá el adjetivo «" + a[0] + "» (" + a[4] + ")",
             stem: withArt(art, word) + " ___", answer: form, accept: [form], diag: true,
             note: word + " es " + (g === "m" ? "masculino" : "femenino") + (plural ? " plural" : " singular") +
               ": " + a[0] + " → " + form + "." + (n[6] ? " " + n[6] : ""),
             say: withArt(art, word) + " " + form };
  }

  function formsSession(state, size, focus) {
    if ((state.unlocked || 1) < FORME_WEEK) return [];
    var lvl = levelOf(state);
    var nouns = B.nouns.filter(function (n) { return within(n[5], lvl); });
    var special = nouns.filter(function (n) { return soundOf(n[0]) !== "c" || n[6]; });
    var out = [];
    var kinds = focus ? [focus] : ["art", "art", "pl", "prep", "agr"];
    for (var i = 0; i < (size || 12) * 3 && out.length < (size || 12); i++) {
      var k = pick(kinds), n = pick(Math.random() < 0.6 && special.length ? special : nouns);
      var x = k === "art" ? articleItem(n, Math.random() < 0.4)
            : k === "pl" ? (countable(n) && (n[2] !== n[0] || Math.random() < 0.3) ? pluralItem(n) : null)
            : k === "prep" ? prepItem(n, pick(PREPS), Math.random() < 0.3)
            : CONCRETE[n[4]] ? agreeItem(n, pick(GENERIC_ADJ), Math.random() < 0.4) : null;
      if (x && !out.some(function (y) { return y.id === x.id; })) out.push(x);
    }
    return out;
  }

  /* ------------------------------------------------------------ frasi */

  function variants(s) {
    var out = s.it.slice();
    s.it.forEach(function (v) {
      var m = v.match(/^(Io|Tu|Lui|Lei|Noi|Voi|Loro) (.+)$/);
      if (m) out.push(m[2].charAt(0).toUpperCase() + m[2].slice(1));
    });
    return out;
  }

  function translateItem(i) {
    var s = B.sentences[i];
    return { id: "b:tr:" + i, src: "banca", bank: "tr", type: "translate",
             prompt: "Traducí al italiano", stem: s.es, answer: s.it[0], accept: variants(s),
             note: s.note, tags: s.tags, lvl: s.lvl, diag: true, say: s.it[0] };
  }

  // Alternative answers for a gap, read off the other accepted sentences.
  // Where the gap form stands as a whole word (not inside another word:
  // «è» inside «caffè»).
  function wordAt(text, form) {
    var re = new RegExp("(^|[^A-Za-zÀ-ÿ])" + form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?![A-Za-zÀ-ÿ])");
    var m = re.exec(text);
    return m ? m.index + m[1].length : -1;
  }

  function gapAccept(s) {
    var main = s.it[0], form = s.gap[0], at = wordAt(main, form), out = [form];
    var pre = main.slice(0, at), post = main.slice(at + form.length);
    var preL = pre.toLowerCase(), postL = post.toLowerCase();
    s.it.slice(1).forEach(function (v) {
      var vl = v.toLowerCase();
      if (post.length && v.length > pre.length + post.length &&
          vl.indexOf(preL) === 0 && vl.slice(-post.length) === postL) {
        var mid = v.slice(pre.length, v.length - post.length).trim();
        if (mid && out.indexOf(mid) < 0 && mid.split(" ").length <= 4) out.push(mid);
      }
    });
    return out;
  }

  function gapItem(i) {
    var s = B.sentences[i];
    if (!s.gap) return null;
    var main = s.it[0], at = wordAt(main, s.gap[0]);
    if (at < 0) return null;
    var stem = main.slice(0, at) + "___ (" + s.gap[1] + ")" + main.slice(at + s.gap[0].length);
    return { id: "b:gap:" + i, src: "banca", bank: "gap", type: "typed",
             prompt: "Completá: «" + s.es + "»", stem: stem, answer: s.gap[0], accept: gapAccept(s),
             note: s.note, tags: s.tags, lvl: s.lvl, diag: true, context: main, say: main };
  }

  function errorItem(i) {
    var e = B.errors[i];
    return { id: "b:err:" + i, src: "banca", bank: "err", type: "fixerr",
             prompt: "Trova l'errore: tocá la palabra que está mal", stem: e.wrong,
             answer: e.right, accept: [e.right], bad: e.bad, good: e.good, goodAlt: e.alt || [],
             cat: e.cat, note: e.why, lvl: e.lvl, say: e.right };
  }

  function sentencePool(state, pred, key) {
    var lvl = levelOf(state), out = [];
    B.sentences.forEach(function (s, i) {
      if (within(s.lvl, lvl) && taught(s, state, key) && (!pred || pred(s))) out.push(i);
    });
    return out;
  }

  function prefer(state, ids, prefix) {
    // Due items first, then unseen, then the rest.
    var cards = state.cards || {}, now = Date.now();
    var due = ids.filter(function (i) { var c = cards[prefix + i]; return c && c.due <= now; });
    var fresh = ids.filter(function (i) { return !cards[prefix + i]; });
    var rest = ids.filter(function (i) { var c = cards[prefix + i]; return c && c.due > now; });
    return shuffle(due).concat(shuffle(fresh), shuffle(rest));
  }

  /* Translating needs articles and a verb behind you; the forms drill needs
     the articles.  Before that the bank is a wall of possessives and plurals
     nobody explained (audit, 1.3). */
  var TR_WEEK = 5, GAP_WEEK = 5, FORME_WEEK = 3;

  function translateSession(state, size, tagFilter) {
    if ((state.unlocked || 1) < TR_WEEK) return [];
    var ids = sentencePool(state, tagFilter && function (s) {
      return s.tags.some(function (t) { return tagFilter.indexOf(t) >= 0; });
    });
    return prefer(state, ids, "b:tr:").slice(0, size || 8).map(translateItem);
  }

  function gapSession(state, size, tagFilter) {
    if ((state.unlocked || 1) < GAP_WEEK) return [];
    var ids = sentencePool(state, function (s) {
      return s.gap && (!tagFilter || s.tags.some(function (t) { return tagFilter.indexOf(t) >= 0; }));
    }, "wg");
    return prefer(state, ids, "b:gap:").slice(0, size || 10).map(gapItem).filter(Boolean);
  }

  /* Spotting a mistake needs a sentence you can already read: before week 5
     (presente regular behind you) there is nothing to compare it with. */
  var ERR_WEEK = 5;

  function errorSession(state, size, cats) {
    if ((state.unlocked || 1) < ERR_WEEK) return [];
    var lvl = levelOf(state), ids = [];
    B.errors.forEach(function (e, i) {
      if (within(e.lvl, lvl) && taught(e, state) && (!cats || cats.indexOf(e.cat) >= 0)) ids.push(i);
    });
    if (!ids.length) B.errors.forEach(function (e, i) {
      if (taught(e, state) && (!cats || cats.indexOf(e.cat) >= 0)) ids.push(i);
    });
    return prefer(state, ids, "b:err:").slice(0, size || 8).map(errorItem);
  }

  /* ---------------------------------------------------------- clinica */

  // Which exercises cure which error.
  var CURE = {
    ausiliare: { tags: ["passato_prossimo", "ausiliare_essere"], err: ["ausiliare", "participio_accordo"] },
    participio_accordo: { tags: ["participio_accordo", "ausiliare_essere"], err: ["participio_accordo", "ausiliare"] },
    a_personale: { tags: ["a_personale"], err: ["a_personale"] },
    preposizione: { tags: ["preposizioni", "preposizioni_articolate", "da_tempo"], err: ["preposizione", "preposizione_articolata"], forms: "prep" },
    preposizione_articolata: { tags: ["preposizioni_articolate"], err: ["preposizione_articolata", "preposizione"], forms: "prep" },
    articolo: { tags: ["articoli"], err: ["articolo", "articolo_possessivo"], forms: "art" },
    articolo_possessivo: { tags: ["possessivi"], err: ["articolo_possessivo"] },
    genere: { tags: ["articoli", "accordo"], err: ["genere", "accordo"], forms: "art" },
    accordo: { tags: ["accordo", "plurali"], err: ["accordo", "genere", "plurale"], forms: "agr" },
    plurale: { tags: ["plurali"], err: ["plurale"], forms: "pl" },
    persona_verbale: { tags: ["presente"], err: ["persona_verbale"] },
    tempo_verbale: { tags: ["imperfetto_vs_pp", "futuro", "imperfetto"], err: ["tempo_verbale"] },
    irregolare: { tags: ["presente", "passato_prossimo"], err: ["irregolare"] },
    congiuntivo: { tags: ["congiuntivo_presente", "congiuntivo_imperfetto"], err: ["congiuntivo"] },
    condizionale: { tags: ["condizionale"], err: ["condizionale"] },
    periodo_ipotetico: { tags: ["periodo_ipotetico"], err: ["periodo_ipotetico", "condizionale"] },
    pronome: { tags: ["pronomi_diretti", "pronomi_indiretti", "pronomi_combinati"], err: ["pronome", "posizione_pronome"] },
    posizione_pronome: { tags: ["pronomi_diretti", "pronomi_combinati"], err: ["posizione_pronome", "pronome"] },
    ci_ne: { tags: ["ci", "ne"], err: ["ci_ne"] },
    parola_spagnola: { tags: ["lessico"], err: ["parola_spagnola", "falso_amico"], vocab: true },
    falso_amico: { tags: ["falsi_amici"], err: ["falso_amico"], vocab: true },
    lessico: { tags: ["lessico"], err: ["lessico"], vocab: true },
    doppie: { err: ["doppie", "ortografia"], vocab: true },
    accento: { err: ["accento"], vocab: true },
    ortografia: { err: ["ortografia", "doppie"], vocab: true },
    comparativo: { tags: ["comparativi", "superlativi"], err: ["comparativo"] },
    piacere: { tags: ["piacere"], err: ["piacere"] },
    ordine: { tags: ["pronomi_diretti", "connettivi"], err: ["ordine", "posizione_pronome"] },
    parola_mancante: { tags: ["articoli", "preposizioni", "ci", "ne"], err: ["articolo", "preposizione", "ci_ne"] },
    parola_in_piu: { tags: ["a_personale", "articoli", "possessivi"], err: ["a_personale", "articolo_possessivo"] }
  };

  // The learner's weakest areas, recent errors weighing more.
  function weakest(state, n) {
    var errs = (state && state.errs) || {}, now = Date.now();
    return Object.keys(errs).map(function (k) {
      var e = errs[k], age = (now - (e.last || 0)) / 86400000;
      return { cat: k, score: (e.n - (e.fixed || 0) * 0.5) * Math.pow(0.9, age) };
    // A pattern, not a one-off: at least a couple of recent errors.
    }).filter(function (x) { return x.score >= 1.8 && CURE[x.cat]; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, n || 3);
  }

  function clinicaSession(state, size) {
    var weak = weakest(state, 3), out = [];
    size = size || 12;
    if (!weak.length) return [];
    weak.forEach(function (w, k) {
      var c = CURE[w.cat], share = Math.max(2, Math.round(size * (k === 0 ? 0.5 : 0.25)));
      var parts = [];
      if (c.err) parts = parts.concat(errorSession(state, Math.ceil(share / 2), c.err));
      if (c.tags) parts = parts.concat(gapSession(state, 2, c.tags), translateSession(state, 2, c.tags));
      if (c.forms) parts = parts.concat(formsSession(state, 3, c.forms));
      if (c.vocab) parts = parts.concat(vocabSession(state, 3).filter(function (x) { return x.type === "typed"; }));
      shuffle(parts).slice(0, share).forEach(function (x) {
        x.clinic = w.cat;
        out.push(x);
      });
    });
    return shuffle(out).slice(0, size);
  }

  /* ------------------------------------------------------ ripasso */

  function item(id) {
    if (!B) return null;
    var p = id.split(":");
    if (p[0] !== "b") return null;
    if (p[1] === "voc") {
      var key = p.slice(2).join(":");
      if (IDX.noun[key]) return vocabWrite(IDX.noun[key], "n");
      if (IDX.verb[key]) return vocabWrite(IDX.verb[key], "v");
      if (IDX.adj[key]) return vocabWrite(IDX.adj[key], "a");
      if (IDX.word[key]) return vocabWrite(IDX.word[key], "w");
      return null;
    }
    if (p[1] === "art" && IDX.noun[p[2]]) return articleItem(IDX.noun[p[2]], p[3] === "p");
    if (p[1] === "pl" && IDX.noun[p[2]]) return pluralItem(IDX.noun[p[2]]);
    if (p[1] === "prep" && IDX.noun[p[3]]) return prepItem(IDX.noun[p[3]], p[2], p[4] === "p");
    if (p[1] === "agr" && IDX.noun[p[2]]) return agreeItem(IDX.noun[p[2]], p[3], p[4] === "p");
    if (p[1] === "tr" && B.sentences[+p[2]]) return translateItem(+p[2]);
    if (p[1] === "gap" && B.sentences[+p[2]]) return gapItem(+p[2]);
    if (p[1] === "err" && B.errors[+p[2]]) return errorItem(+p[2]);
    return null;
  }

  // One item for the coffee break: a sentence at the learner's level.
  function pausaItem(state) {
    var r = Math.random();
    if (r < 0.4) return translateSession(state, 1)[0];
    if (r < 0.7 && (state.unlocked || 1) >= ERR_WEEK) return errorSession(state, 1)[0];
    return gapSession(state, 1)[0];
  }

  function stats() {
    if (!B) return null;
    return { nouns: B.nouns.length, verbs: B.verbs.length, adjectives: B.adjectives.length,
             words: B.words.length, sentences: B.sentences.length, errors: B.errors.length };
  }

  var api = {
    load: load,
    loaded: loaded,
    levelOf: levelOf,
    defArt: defArt,
    indefArt: indefArt,
    CONTR: CONTR,
    vocabChoice: vocabChoice,
    vocabWrite: vocabWrite,
    vocabSession: vocabSession,
    vocabSessionFor: vocabSessionFor,
    hasWord: hasWord,
    articleItem: articleItem,
    pluralItem: pluralItem,
    prepItem: prepItem,
    agreeItem: agreeItem,
    formsSession: formsSession,
    translateItem: translateItem,
    translateSession: translateSession,
    gapItem: gapItem,
    gapSession: gapSession,
    errorItem: errorItem,
    errorSession: errorSession,
    ERR_WEEK: ERR_WEEK,
    TR_WEEK: TR_WEEK, GAP_WEEK: GAP_WEEK, FORME_WEEK: FORME_WEEK,
    weakest: weakest,
    clinicaSession: clinicaSession,
    CURE: CURE,
    item: item,
    pausaItem: pausaItem,
    stats: stats,
    bank: function () { return B; }
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Banca = api;
})(typeof window !== "undefined" ? window : globalThis);
