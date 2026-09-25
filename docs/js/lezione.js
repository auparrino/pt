/*
 * Lezione giocabile: la teoria di ogni settimana diventa una sequenza di
 * schermate brevi, e dopo ogni blocco con esempi o tabella arriva una
 * domanda lampo costruita con il materiale del blocco stesso.  Leggere e
 * subito recuperare (retrieval practice) fissa più che rileggere.
 */
(function (root) {
  "use strict";

  function strip(s) {
    return String(s == null ? "" : s).replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").trim();
  }

  function shuffle(a, rnd) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function uniq(list) {
    var seen = {};
    return list.filter(function (x) { var k = x.toLowerCase(); if (!x || seen[k]) return false; seen[k] = 1; return true; });
  }

  function usable(s) { return s && s.length <= 60 && s.indexOf(" / ") < 0 && !/^[-—–…]*$/.test(s); }
  // An example is a real pair only if the right side translates the left one:
  // «il jazz, il weekend = préstamos: se escriben…» is a comment, not a
  // translation, and makes a meaningless question.
  function translation(p) {
    // «la crisi → le crisi = en -i» is a table row with a comment, not a
    // sentence with its translation: no arrows, no lists, no suffix notes.
    if (/[→;=]|\s\/\s/.test(p[0]) || /[:«»→;=]|\s\/\s|(^|\s)-[a-zà-ù]/i.test(p[1])) return false;
    // «3. Artículo con el posesivo»: a numbered note or grammar talk, not a translation
    if (/^\d+\./.test(p[1].trim()) ||
        /\b(artículo|posesivo|plural|singular|verbo|adjetivo|pronombre|sustantivo|preposici|conjuga|regla|tiempo verbal|auxiliar|participio)/i.test(p[1])) return false;
    var esWords = p[1].trim().split(/\s+/).length, itWords = p[0].trim().split(/\s+/).length;
    if (esWords < 2 && itWords > 1) return false;
    return usable(p[0]) && usable(p[1]) && !/,\s*\S+,/.test(p[0]) &&
      p[1].length <= p[0].length * 2 + 6;        // «rosa = s sonora, como una z inglesa»: no
  }

  // All examples of the lesson, as distractor material.
  function allEx(lesson) {
    var out = [];
    lesson.blocks.forEach(function (b) { (b.ex || []).forEach(function (p) { out.push([strip(p[0]), strip(p[1])]); }); });
    return out.filter(translation);
  }

  /* Trap versions of a right sentence: the errors a Spanish speaker makes
     (auxiliary, agreement, article, contraction, double consonants). */
  var AUX = { "sono": "ho", "sei": "hai", "è": "ha", "siamo": "abbiamo", "siete": "avete", "ero": "avevo", "era": "aveva",
              "ho": "sono", "hai": "sei", "ha": "è", "abbiamo": "siamo", "avete": "siete", "hanno": "sono" };
  var ART = { "il": "lo", "lo": "il", "la": "le", "le": "la", "gli": "i", "i": "gli", "un": "uno", "uno": "un" };
  var SPLIT = { "al": "a il", "del": "di il", "nel": "in il", "dal": "da il", "sul": "su il", "alla": "a la",
                "della": "di la", "nella": "in la", "ai": "a i", "dei": "di i", "nei": "in i", "alle": "a le", "delle": "di le" };
  var ENDS = [["ata", "ato"], ["ato", "ata"], ["ati", "ate"], ["ate", "ati"], ["uto", "uta"], ["ito", "ita"],
              ["ano", "a"], ["iamo", "ano"], ["ete", "ono"], ["ebbe", "ebbero"], ["essi", "esse"],
              ["oso", "osa"], ["osi", "ose"], ["ivo", "iva"], ["ico", "ica"], ["ale", "ali"], ["ente", "enti"]];
  /* week: the traps test only what has been taught by then (articles from
     week 3, the auxiliary from week 11, articulated prepositions from 3). */
  // Another articulated preposition of the same family (del → della, dello).
  var PREP_FAM = [["al", "allo", "alla", "all'", "ai", "agli", "alle"], ["del", "dello", "della", "dell'", "dei", "degli", "delle"],
                  ["nel", "nello", "nella", "nell'", "nei", "negli", "nelle"], ["dal", "dallo", "dalla", "dall'", "dai", "dagli", "dalle"],
                  ["sul", "sullo", "sulla", "sull'", "sui", "sugli", "sulle"]];
  var SWAP_END = { o: "a", a: "o", e: "i", i: "e" };
  // The simple preposition a Spanish speaker puts instead (en → in, a Roma).
  var PREP_SWAP = { a: ["in", "da"], "in": ["a"], da: ["a", "di"], di: ["da", "de"], su: ["in"], per: ["a", "da"], con: ["di"], fra: ["in", "a"], tra: ["in", "a"] };
  var PRON_SWAP = { io: ["tu", "me"], tu: ["te", "io"], me: ["mi", "io"], te: ["ti", "tu"], noi: ["ci", "voi"], voi: ["vi", "noi"] };
  // Spanish inside the Italian (me chiamo, de dove, que lavoro): always wrong.
  var SPAN = { mi: "me", ti: "te", di: "de", che: "que", come: "como", non: "no", e: "y", bene: "bien",
               grazie: "gracie", ciao: "chao", molto: "muy", sono: "son", anche: "tambien", per: "para",
               questo: "esto", questa: "esta", dove: "donde", quando: "cuando", sempre: "siempre", tutto: "todo",
               buona: "buena", buono: "bueno", scusa: "disculpa", scusi: "disculpe", ho: "he", sto: "estoy" };
  var DEACC = { "à": "a", "è": "e", "é": "e", "ì": "i", "ò": "o", "ù": "u" };
  /* safe: only the changes that are always an error (article, preposition,
     è/e, accents, double consonants).  Another ending, person or auxiliary
     can be good Italian too (mi piaci, sono stanca, chiudono). */
  function traps(sentence, rnd, week, isItalian, safe) {
    week = week || 52;
    var toks = sentence.split(" ");
    var rule = [], loose = [];
    toks.forEach(function (t, i) {
      var m = t.match(/^([«"(]*)([A-Za-zÀ-ÿ']+)([.,;:!?»")]*)$/);
      if (!m) return;
      var w = m[2], low = w.toLowerCase();
      if (i > 0 && w[0] !== low[0]) return;          // a name (Roma, Marco) stays as it is
      var put = function (nw, bag) {
        if (w[0] !== low[0]) nw = nw.charAt(0).toUpperCase() + nw.slice(1);
        var c = toks.slice(); c[i] = m[1] + nw + m[3]; (bag || rule).push(c.join(" "));
      };
      var next = (toks[i + 1] || "").toLowerCase();
      if (!safe && week >= 11 && AUX[low] && /(at|ut|it|ss|tt|rt|st|nt|ls|lt)[oaie]\b/.test(next)) put(AUX[low]);
      if (week >= 3 && ART[low] && toks[i + 1]) put(ART[low]);
      if (week >= 3 && SPLIT[low]) put(SPLIT[low]);
      if (PREP_SWAP[low] && toks[i + 1] && !(safe && low === "per")) put(PREP_SWAP[low][Math.floor(rnd() * PREP_SWAP[low].length)]);
      if (!safe && PRON_SWAP[low]) put(PRON_SWAP[low][Math.floor(rnd() * PRON_SWAP[low].length)]);
      if (week >= 3) PREP_FAM.forEach(function (fam) {
        if (fam.indexOf(low) < 0) return;
        var vow = /^[aeiouàèéìòùh]/.test(next);
        var alt = fam.filter(function (x) { return x !== low && !/'$/.test(x) && (!vow || !/^(al|del|nel|dal|sul|allo|dello|nello|dallo|sullo|alla|della|nella|dalla|sulla)$/.test(x)); });
        if (alt.length) put(alt[Math.floor(rnd() * alt.length)]);
      });
      if (safe && SPAN[low]) put(SPAN[low]);
      // che → ce, chi → ci: the h that keeps the c hard, forgotten
      if (safe && /ch[ei]/.test(low) && low.length > 2) put(low.replace(/ch([ei])/, "c$1"));
      // spelled the Spanish way: spagnolo → spañolo, vediamo → bediamo, questo → cuesto
      if (safe && /gn/.test(low)) put(low.replace("gn", "ñ"));
      if (safe && /^v[aeiou]/.test(low) && low.length > 3) put("b" + low.slice(1));
      if (safe && /qu[aeio]/.test(low)) put(low.replace("qu", "cu"));
      if (low === "è") put("e");
      if (/[àèéìòù]$/.test(low) && low.length > 2) put(low.slice(0, -1) + DEACC[low.slice(-1)]);
      if (/([bcdfglmnprstvz])\1/.test(low) && low.length > 4) put(low.replace(/([bcdfglmnprstvz])\1/, "$1"));
      var done = false;
      if (!safe && low.length > 4) for (var k = 0; k < ENDS.length; k++) {
        if (low.slice(-ENDS[k][0].length) === ENDS[k][0]) { put(low.slice(0, -ENDS[k][0].length) + ENDS[k][1]); done = true; break; }
      }
      // The same word with the other ending (pane → pana, simpatiche →
      // simpatichi): wrong in the same way a learner is wrong, never
      // another sentence.
      // «Marco …»: maybe a name, no spelling games (unless the dictionary knows it)
      var capStart = w[0] !== low[0] && !(isItalian && isItalian(low));
      if (!safe && !done && !capStart && low.length > 3 && SWAP_END[low.slice(-1)] && !/^(sono|come|dove|anche|molto|questo|questa|quando|perché|nostro|nostra)$/.test(low))
        put(low.slice(0, -1) + SWAP_END[low.slice(-1)], loose);
      if (!capStart && /^[^aeiou]*[aeiou][lmnrt][aeiou]/.test(low) && low.length > 3 && low.length < 8)
        put(low.replace(/^([^aeiou]*[aeiou])([lmnrt])/, "$1$2$2"), loose);
    });
    var clean = function (l) { return uniq(shuffle(l, rnd)).filter(function (c) { return c !== sentence; }); };
    var r = clean(rule);
    return r.concat(clean(loose).filter(function (c) { return r.indexOf(c) < 0; }));
  }

  // «¿Cómo se dice…?» from one of the block's examples.
  // Minimal pairs, «nono / nonno = noveno / abuelo»: which one means…?
  function pairQuestion(b, rnd) {
    var pairs = (b.ex || []).map(function (p) { return [strip(p[0]).split(" / "), strip(p[1]).split(" / ")]; })
      .filter(function (p) { return p[0].length === 2 && p[1].length === 2 && p[0][0] !== p[0][1] &&
                                   p[1][0] !== p[1][1] && !/[:«»]/.test(p[1].join("")) &&
                                   // «pena / penna = pena / lapicera»: asking «pena» gives it away
                                   p[1].every(function (es) { return p[0].indexOf(es.replace(/\s*\(.*\)/, "")) < 0; }); });
    if (!pairs.length) return null;
    var pk = pairs[Math.floor(rnd() * pairs.length)], k = rnd() < 0.5 ? 0 : 1;
    // Two options are a coin toss: a form from another pair of the block
    // makes it a real question (nono / nonno / penna).
    var opts = pk[0].slice();
    var others = shuffle(pairs.filter(function (p) { return p !== pk; }), rnd);
    if (others.length) opts.push(others[0][0][Math.floor(rnd() * 2)]);
    return { kind: "pair", prompt: "¿Cuál significa «" + pk[1][k] + "»?", stem: "", answer: pk[0][k],
             options: shuffle(opts, rnd) };
  }

  function exQuestion(lesson, b, rnd, week, isItalian) {
    var pool = allEx(lesson);
    var mine = (b.ex || []).map(function (p) { return [strip(p[0]), strip(p[1])]; })
      .filter(translation);
    if (!mine.length) return pairQuestion(b, rnd);
    var pick = mine[Math.floor(rnd() * mine.length)];
    var known = {}; pool.forEach(function (p) { known[p[0].toLowerCase()] = 1; });
    var tr = traps(pick[0], rnd, week, isItalian).filter(function (t) { return !known[t.toLowerCase()]; }).slice(0, 2);
    // Only one mistake possible: the second option carries two.
    if (tr.length === 1) {
      var t2 = traps(tr[0], rnd, week, isItalian).filter(function (t) {
        return t !== pick[0] && t.toLowerCase() !== tr[0].toLowerCase() && !known[t.toLowerCase()];
      })[0];
      if (t2) tr.push(t2);
    }
    // Always the same sentence with a mistake in it: other sentences of the
    // block give the answer away by their meaning, not by the rule.
    if (tr.length === 2) {
      return { kind: "trap", prompt: "¿Cuál está bien? «" + pick[1] + "»", stem: "", answer: pick[0],
               options: shuffle([pick[0]].concat(tr), rnd) };
    }
    // The most similar sentences are the useful distractors: same words,
    // another form (capiamo / capisco), not something obviously unrelated.
    var words = function (x) { return x.toLowerCase().replace(/[^a-zàèéìòù' ]/g, "").split(/\s+/); };
    var mw = words(pick[0]);
    var sim = function (x) {
      var w = words(x), n = 0;
      w.forEach(function (t) { if (mw.indexOf(t) >= 0) n += 2; else if (mw.some(function (m) { return m.slice(0, 4) === t.slice(0, 4) && t.length > 3; })) n += 1; });
      return n - Math.abs(w.length - mw.length) * 0.3 + rnd() * 0.5;
    };
    var others = uniq(shuffle(pool, rnd).map(function (p) { return p[0]; })
      .filter(function (x) { return x.toLowerCase() !== pick[0].toLowerCase(); })
      .sort(function (a, b) { return sim(b) - sim(a); })).slice(0, 2);
    // Another sentence of the block is a distractor only if it shares most of
    // the words: otherwise the meaning gives the answer away, not the rule.
    others = others.filter(function (x) { return sim(x) >= mw.length; });
    if (others.length < 2) return null;
    return { kind: "ex", prompt: "¿Cómo se dice en italiano?", stem: pick[1], answer: pick[0],
             options: shuffle([pick[0]].concat(others), rnd) };
  }

  // A block with only text: blank one Italian form of its rule and offer
  // forms from the rest of the lesson («Completá la regla»).
  function ruleQuestion(lesson, b, rnd, isItalian) {
    if (!isItalian) return null;
    // Only clean Italian forms (every word known to the glossary), never a
    // Spanish word that happened to sit between two asterisks.
    var clean = function (f) {
      f = f.trim();
      return f.length >= 3 && /^[a-zà-ù' ]+$/i.test(f) && f.indexOf("/") < 0 && !/^\s|\s$/.test(f) &&
        f.split(/\s+/).every(function (w) { return isItalian(w.replace(/^[a-zà-ù]+'/, "")) || isItalian(w); }) ? f : null;
    };
    var text = [b.r].concat(b.p || [], [b.warn, b.tip]).filter(Boolean).join(" ");
    var forms = (text.match(/\*([^*]{3,24})\*/g) || []).map(function (x) { return clean(x.replace(/\*/g, "")); })
      .filter(Boolean);
    forms = uniq(forms);
    if (!forms.length) return null;
    var pick = forms[Math.floor(rnd() * forms.length)];
    var all = [];
    lesson.blocks.forEach(function (bb) {
      var t = [bb.r].concat(bb.p || [], bb.ex ? bb.ex.map(function (e) { return e[0]; }) : [], [bb.warn, bb.tip]).filter(Boolean).join(" ");
      (t.match(/\*([^*]{3,24})\*/g) || []).forEach(function (x) { all.push(x.replace(/\*/g, "")); });
    });
    // Distractors of the same kind as the gap: same number of words and
    // either the same class (essere / avere, a / in / da) or a near shape
    // (parlo / parla); «avere | migliore / parleremo» gives itself away.
    var others = uniq(shuffle(all, rnd).map(clean).filter(function (f) {
      return f && f.toLowerCase() !== pick.toLowerCase() && forms.indexOf(f) < 0 &&
        f.split(/\s+/).length === pick.split(/\s+/).length && akin(f.toLowerCase(), pick.toLowerCase());
    })).slice(0, 2);
    if (others.length < 2) return null;
    var src = [b.r].concat(b.p || []).filter(function (t) { return t && t.indexOf("*" + pick + "*") >= 0; })[0] || b.r || "";
    var stem = strip(src.replace("*" + pick + "*", "___"));
    // A hole glued to letters or a stray asterisk: the markup was uneven.
    if (/[a-zà-ù]___|___[a-zà-ù]/i.test(stem) || stem.indexOf("*") >= 0) return null;
    if (stem.length > 160) stem = stem.slice(0, 157) + "…";
    return { kind: "rule", prompt: "Completá la regla", stem: stem, answer: pick,
             options: shuffle([pick].concat(others), rnd) };
  }

  var CLASSES = [["essere", "avere", "stare", "fare"], ["il", "lo", "la", "l'", "i", "gli", "le", "un", "uno", "una", "un'"],
                 ["a", "di", "da", "in", "su", "con", "per", "tra", "fra"], ["io", "tu", "lui", "lei", "noi", "voi", "loro", "Lei"],
                 ["mi", "ti", "si", "ci", "vi", "lo", "la", "li", "le", "gli", "ne"], ["che", "cui", "chi", "quale", "il quale"],
                 ["presente", "imperfetto", "futuro", "condizionale", "congiuntivo", "passato prossimo", "passato remoto", "trapassato"]];
  function lev(a, b) {
    var m = [], i, j;
    for (i = 0; i <= a.length; i++) m[i] = [i];
    for (j = 0; j <= b.length; j++) m[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return m[a.length][b.length];
  }
  // Two forms are of a kind: same closed class, or at most half the letters apart.
  function akin(a, b) {
    if (CLASSES.some(function (c) { return c.indexOf(a) >= 0 && c.indexOf(b) >= 0; })) return true;
    return lev(a, b) <= Math.max(2, Math.floor(Math.max(a.length, b.length) / 2));
  }
  function overlap(a, b) {
    var wa = a.toLowerCase().split(/[^a-zà-ù']+/).filter(function (w) { return w.length > 2; });
    var wb = b.toLowerCase().split(/[^a-zà-ù']+/);
    return wa.filter(function (w) { return wb.indexOf(w) >= 0; }).length;
  }

  // «Completá la tabla» from one cell of the block's table.
  function tableQuestion(b, rnd) {
    var t = b.table;
    if (!t || !t.rows || t.rows.length < 3 || t.rows[0].length < 2) return null;
    var tries = [];
    t.rows.forEach(function (r, ri) {
      for (var c = 1; c < r.length; c++) {
        var cell = strip(r[c]);
        if (!usable(cell) || cell.length > 32) continue;
        var col = uniq(t.rows.map(function (x) { return strip(x[c]); }).filter(function (x) {
          return usable(x) && x.length <= 32 && x.toLowerCase() !== cell.toLowerCase();
        }));
        if (col.length >= 2 && strip(r[0])) tries.push({ ri: ri, c: c, cell: cell, col: col });
      }
    });
    // A cell that repeats words of its own row label («come se è → come se
    // fosse») is found by matching, not by knowing: only if the other
    // options repeat them too.  The options closest in shape go first.
    tries = shuffle(tries, rnd);
    for (var k = 0; k < tries.length; k++) {
      var p = tries[k], rowLabel = strip(t.rows[p.ri][0]);
      var own = overlap(p.cell, rowLabel);
      var col = p.col.filter(function (x) { return overlap(x, rowLabel) >= Math.min(own, 1); });
      if (col.length < 2) continue;
      col = shuffle(col, rnd).sort(function (a, b) {
        return Math.abs(a.length - p.cell.length) - Math.abs(b.length - p.cell.length) ||
               lev(a.toLowerCase(), p.cell.toLowerCase()) - lev(b.toLowerCase(), p.cell.toLowerCase());
      });
      var head = t.head || [];
      var colLabel = strip(head[p.c] || "");
      return { kind: "table", prompt: "Completá la tabla",
               stem: (strip(head[0]) ? strip(head[0]) + ": " : "") + rowLabel + (colLabel ? " → " + colLabel : ""),
               answer: p.cell, options: shuffle([p.cell].concat(col.slice(0, 2)), rnd) };
    }
    return null;
  }

  // A check written by hand in tools/lessons («q»), for the blocks whose
  // text gives the generators nothing to work with (advice, a rule without
  // Italian forms, a table of labels).
  function handQuestion(b, rnd) {
    var qs = b.q || [];
    if (!qs.length) return null;
    var q = qs[Math.floor(rnd() * qs.length)];
    return { kind: "hand", prompt: q.prompt, stem: q.stem || "", answer: q.answer,
             options: shuffle(q.options.slice(), rnd) };
  }

  // A table that fits beside the rule: at most three rows of three columns.
  function smallTable(t) {
    return !!t && (t.rows || []).length <= 3 && (t.head || (t.rows[0] || [])).length <= 3;
  }
  /* The forms the block teaches, to be marked in its examples (signaling:
     d = 0,38): the italic forms of the rule and the short cells of its table. */
  function forms(b) {
    var out = [];
    var add = function (x) {
      strip(x).split(/\s*(?:\/|,|;|→|\+|=)\s*/).forEach(function (f) {
        f = f.replace(/[.!?¿¡«»()]/g, "").trim();
        if (f && f.length >= 2 && f.split(/\s+/).length <= 3 && /[a-zà-ù]/i.test(f)) out.push(f.toLowerCase());
      });
    };
    [b.r, b.warn, b.tip].concat(b.p || []).forEach(function (t) {
      (String(t || "").match(/\*([^*]+)\*/g) || []).forEach(function (m) { add(m.replace(/\*/g, "")); });
    });
    if (b.table) (b.table.rows || []).forEach(function (r) { r.slice(1).forEach(function (c) { if (strip(c).length <= 30) add(c); }); });
    return uniq(out).sort(function (a, b2) { return b2.length - a.length; });
  }

  // The playable sequence: intro, then each block followed by its check.
  function steps(lesson, rnd, week, isItalian, only) {
    rnd = rnd || Math.random;
    // only: the block indices of one part of the lesson (a week studied in
    // several short sessions); the intro opens the first part only.
    var out = (!only || only.indexOf(0) >= 0) ? [{ kind: "intro" }] : [];
    lesson.blocks.forEach(function (b, i) {
      if (only && only.indexOf(i) < 0) return;
      // One idea per screen (segmenting: Mayer 2017), the examples first
      // (PACE: the form in context, then the rule), the big tables as cards,
      // the trap on its own.
      if (b.ex && b.ex.length) out.push({ kind: "look", i: i });
      out.push({ kind: "rule", i: i });
      // A long table in screens of three or four rows, one under the other,
      // with a quick check on each group before the next one.
      if (b.table && !smallTable(b.table)) {
        var rows = b.table.rows || [], n = Math.ceil(rows.length / 4), size = Math.ceil(rows.length / n);
        for (var c = 0; c < n; c++) {
          var from = c * size, to = Math.min(rows.length, from + size);
          out.push({ kind: "table", i: i, from: from, to: to, chunk: c, chunks: n });
          if (n > 1 && c < n - 1) {
            var cq = tableQuestion({ table: { head: b.table.head, rows: rows.slice(from, to) } }, rnd);
            if (cq) { cq.block = i; out.push({ kind: "quiz", q: cq }); }
          }
        }
      }
      if (b.warn || b.tip || (b.more && b.more.length)) out.push({ kind: "trap", i: i });
      var q = (b.table && tableQuestion(b, rnd)) || (b.ex && exQuestion(lesson, b, rnd, week, isItalian)) ||
              (!b.table && ruleQuestion(lesson, b, rnd, isItalian)) ||
              handQuestion(b, rnd);
      if (q) { q.block = i; out.push({ kind: "quiz", q: q }); }
      // «qq»: checks written by hand, all of them asked, in order.
      (b.qq || []).forEach(function (h) {
        out.push({ kind: "quiz", q: { kind: "hand", prompt: h.prompt, stem: h.stem || "", answer: h.answer,
                                      options: shuffle(h.options.slice(), rnd), block: i } });
      });
    });
    return out;
  }

  var api = { steps: steps, traps: traps, strip: strip, exQuestion: exQuestion, tableQuestion: tableQuestion, forms: forms, smallTable: smallTable };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Lezione = api;
})(this);
