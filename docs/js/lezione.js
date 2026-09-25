/*
 * Rumo C1 — la lección jugable: la teoría de cada semana se vuelve una
 * secuencia de pantallas cortas (mirá → la regla → la tabla → la trampa), y
 * después de cada bloque llega un chequeo rápido armado con el material del
 * mismo bloque.  Leer y recuperar enseguida (práctica de recuperación) fija
 * más que releer.  Las trampas son los errores del hispanohablante en
 * portugués (contracciones, castellano metido, tildes, plurales, género).
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
  // «o jeans, o show = préstamos: se escriben…» is a comment, not a
  // translation, and makes a meaningless question.
  function translation(p) {
    // «o leite → os leites = masculino» is a table row with a comment, not a
    // sentence with its translation: no arrows, no lists, no suffix notes.
    if (/[→;=]|\s\/\s/.test(p[0]) || /[:«»→;=]|\s\/\s|(^|\s)-[a-zà-ÿ]/i.test(p[1])) return false;
    // «3. Artículo con el posesivo»: a numbered note or grammar talk, not a translation
    if (/^\d+\./.test(p[1].trim()) ||
        /\b(artículo|posesivo|plural|singular|verbo|adjetivo|pronombre|sustantivo|preposici|contracci|conjuga|regla|tiempo verbal|auxiliar|participio|infinitivo|subjuntivo)/i.test(p[1])) return false;
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
     in Portuguese (the «pontos críticos» of the literature on Português
     para Falantes de Espanhol: Almeida Filho, Grannier, Akerberg, Durão):
     contractions written apart (em o), the Spanish word or spelling inside
     the Portuguese (muy, más, ñ, ll, -ción, -ble, -n for -m), accents and
     tildes, plurals in -ões / -ais / -ns, gostar without de, ser / estar,
     gender of the article (o leite, a viagem) and endings.
     week: the traps test only what has been taught by then (contractions
     and gender from week 3, ser / estar from 1, crase from 36). */
  // em + o = no, de + a = da…: written apart, always an error.
  var SPLIT = { no: "em o", na: "em a", nas: "em as", "do": "de o", da: "de a", dos: "de os", das: "de as",
                ao: "a o", aos: "a os", pelo: "por o", pela: "por a", pelos: "por os", pelas: "por as",
                num: "em um", numa: "em uma", dele: "de ele", dela: "de ela", deles: "de eles", delas: "de elas",
                neste: "em este", nesta: "em esta", nesse: "em esse", nessa: "em essa", naquele: "em aquele",
                naquela: "em aquela", deste: "de este", desta: "de esta", desse: "de esse", dessa: "de essa",
                daquele: "de aquele", daquela: "de aquela", disso: "de isso", nisso: "em isso", disto: "de isto",
                daqui: "de aqui", dali: "de ali" };
  // The other gender (a leite, o viagem): the heterogeneric nouns.
  var GENDER = { o: "a", a: "o", os: "as", as: "os", um: "uma", uma: "um", uns: "umas", umas: "uns",
                 no: "na", na: "no", "do": "da", da: "do", dos: "das", das: "dos", pelo: "pela", pela: "pelo",
                 num: "numa", numa: "num", este: "esta", esta: "este", esse: "essa", essa: "esse",
                 aquele: "aquela", aquela: "aquele", meu: "minha", minha: "meu", teu: "tua", tua: "teu",
                 seu: "sua", sua: "seu", nosso: "nossa", nossa: "nosso" };
  // Articles and contractions whose gender swap is always wrong before a noun.
  var ART_ALWAYS = { um: 1, uma: 1, uns: 1, umas: 1, no: 1, na: 1, "do": 1, da: 1, dos: 1, das: 1, pelo: 1, pela: 1, num: 1, numa: 1 };
  var PREP = { de: 1, em: 1, para: 1, com: 1, por: 1, sem: 1, "até": 1, entre: 1, sobre: 1 };
  var SER_ESTAR = { sou: "estou", estou: "sou", "é": "está", "está": "é", somos: "estamos", estamos: "somos",
                    "são": "estão", "estão": "são", era: "estava", estava: "era", foi: "esteve", esteve: "foi",
                    fui: "estive", estive: "fui", ser: "estar", estar: "ser" };
  var ENDS = [["ado", "ada"], ["ada", "ado"], ["ados", "adas"], ["adas", "ados"], ["ido", "ida"], ["ida", "ido"],
              ["amos", "am"], ["emos", "em"], ["imos", "em"], ["ava", "avam"], ["avam", "ava"], ["iam", "ia"],
              ["ou", "ei"], ["ei", "ou"], ["aram", "ou"], ["eram", "eu"], ["oso", "osa"], ["osa", "oso"],
              ["ivo", "iva"], ["ico", "ica"], ["ente", "entes"], ["ção", "ções"], ["ções", "ção"]];
  var SWAP_END = { o: "a", a: "o" };
  // The simple preposition a Spanish speaker puts instead (vou em, moro a).
  // («a» is left out: it is also the article and the pronoun.)
  var PREP_SWAP = { em: ["a", "de"], de: ["em", "a"], com: ["de"], para: ["por"], por: ["para"], "até": ["a"] };
  var PRON_SWAP = { eu: ["mim", "me"], mim: ["eu", "me"], me: ["mim", "eu"], "nós": ["nos"] };
  // Spanish inside the Portuguese (muy, más, yo, tengo): always wrong.
  var SPAN = { muito: "muy", muita: "mucha", muitos: "muchos", muitas: "muchas", mais: "más", "também": "también",
               "não": "no", eu: "yo", "é": "es", com: "con", em: "en", e: "y", bem: "bien", obrigado: "gracias",
               obrigada: "gracias", sim: "sí", quando: "cuando", onde: "donde", hoje: "hoy", mas: "pero",
               tenho: "tengo", estou: "estoy", sou: "soy", "você": "usted", "vocês": "ustedes", ele: "él",
               ela: "ella", "nós": "nosotros", eles: "ellos", elas: "ellas", isso: "eso", isto: "esto",
               bom: "bueno", boa: "buena", novo: "nuevo", nova: "nueva", porta: "puerta", depois: "después",
               agora: "ahora", aqui: "aquí", ainda: "todavía", sempre: "siempre", "então": "entonces",
               "olá": "hola", tchau: "chau", desculpa: "disculpa", desculpe: "disculpe", noite: "noche",
               dia: "día", cidade: "ciudad", trabalho: "trabajo", pouco: "poco", coisa: "cosa",
               "até": "hasta", tudo: "todo", "mãe": "madre", pai: "padre", filho: "hijo",
               "irmão": "hermano", "amanhã": "mañana", ontem: "ayer", tem: "tiene" };
  var POSS = { minha: 1, sua: 1, nossa: 1, tua: 1, minhas: 1, suas: 1, nossas: 1, tuas: 1 };
  var ACC = /[áâãàéêíóôõú]/;
  function unaccent(w) { return w.normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC"); }
  /* safe: only the changes that are always an error (contraction written
     apart, Spanish word or spelling, accent, -m → -n, plural).  Another
     ending, person, gender or ser / estar can be good Portuguese too (a
     estudante, estou cansado / sou cansado…). */
  function traps(sentence, rnd, week, isWord, safe) {
    week = week || 52;
    var toks = sentence.split(" ");
    var rule = [], loose = [];
    toks.forEach(function (t, i) {
      var m = t.match(/^([«"(¿¡]*)([A-Za-zÀ-ÿ]+(?:-[A-Za-zÀ-ÿ]+)*)([.,;:!?»")…]*)$/);
      if (!m) return;
      var w = m[2], low = w.toLowerCase();
      if (i > 0 && w[0] !== low[0]) return;          // a name (Rio, João) stays as it is
      var put = function (nw, bag) {
        if (w[0] !== low[0]) nw = nw.charAt(0).toUpperCase() + nw.slice(1);
        var c = toks.slice(); c[i] = m[1] + nw + m[3]; (bag || rule).push(c.join(" "));
      };
      var next = (toks[i + 1] || "").toLowerCase().replace(/[^a-zà-ÿ-]/g, "");
      var prev = (toks[i - 1] || "").toLowerCase().replace(/[^a-zà-ÿ]/g, "");
      var nounNext = !!next && /^[a-zà-ÿ]/.test(toks[i + 1] || "");
      if (/-/.test(low)) {                            // chama-se, diga-me: the hyphen dropped
        if (safe || week >= 12) put(low.replace(/-/g, " "));
        return;
      }
      // em o, de a, por o: the contraction written apart
      if (week >= 3 && SPLIT[low] && toks[i + 1]) put(SPLIT[low]);
      // the other gender of the article (a leite, o viagem, uma problema)
      if (week >= 3 && GENDER[low] && nounNext && !PREP[next] &&
          (!safe || ART_ALWAYS[low] || ((low === "o" || low === "a" || low === "os" || low === "as") && (i === 0 || PREP[prev]))))
        put(GENDER[low]);
      if (!safe && SER_ESTAR[low]) put(SER_ESTAR[low]);
      if (!safe && PREP_SWAP[low] && nounNext) put(PREP_SWAP[low][Math.floor(rnd() * PREP_SWAP[low].length)]);
      if (!safe && week >= 16 && PRON_SWAP[low]) put(PRON_SWAP[low][Math.floor(rnd() * PRON_SWAP[low].length)]);
      if (SPAN[low]) put(SPAN[low]);
      // the Spanish written accent: entendi → entendí, aqui → aquí, que → qué
      if (/[^aeiouáéíóúâêôãõ]i$/.test(low) && low.length > 3) put(low.slice(0, -1) + "í");
      if (i === 0 && (low === "que" || low === "como" || low === "quando" || low === "onde"))
        put({ que: "qué", como: "cómo", quando: "cuándo", onde: "dónde" }[low]);
      // gosto de café → gosto café: gostar keeps its de
      if (/^gost(o|a|as|amos|am|ei|ou|ava|avam|aria|ariam)$/.test(low) && /^(de|do|da|dos|das)$/.test(next)) {
        var g = toks.slice(), nx = next === "de" ? null : next.slice(1);
        if (nx) g[i + 1] = nx; else g.splice(i + 1, 1);
        rule.push(g.join(" "));
      }
      // tenho feito → he hecho: the Spanish auxiliary
      if (week >= 21 && low === "tenho" && /(ado|ido|to|so|sto)$/.test(next)) put("he");
      // à → a (week of the crase), not before a possessive (both are right)
      if (week >= 36 && (low === "à" || low === "às") && !POSS[next]) put(low === "à" ? "a" : "as");
      // the Spanish spelling: ñ, ll, -ción, -dad, -ble, z for ç, b for v, s for ss
      if (/nh/.test(low)) put(low.replace("nh", "ñ"));
      if (/lh/.test(low)) put(low.replace("lh", "ll"));
      if (/ção$/.test(low)) put(low.replace(/ção$/, "ción"));
      if (/ções$/.test(low)) put(low.replace(/ções$/, "ciones"));
      if (/dade$/.test(low) && low.length > 5) put(low.replace(/dade$/, "dad"));
      if (/vel$/.test(low) && low.length > 4) put(low.replace(/vel$/, "ble"));
      if (/veis$/.test(low) && low.length > 5) put(low.replace(/veis$/, "bles"));
      if (/ç/.test(low) && !/ção|ções/.test(low)) put(low.replace("ç", "z"));
      if (/^v[aeiouáéíóú]/.test(low) && low.length > 3) put("b" + low.slice(1));
      if (/[aeiouáéíóúâêô]ss[aeiou]/.test(low)) put(low.replace(/ss/, "s"));
      // -m → -n at the end (bem → ben, falam → falan, um → un)
      if (/[aeiouáéíóúâêô]m$/.test(low) && low.length >= 2) put(low.replace(/m$/, "n"));
      // the plural: limões → limãos, animais → animals, homens → homems
      if (week >= 2 && /ões$/.test(low)) put(low.replace(/ões$/, rnd() < 0.5 ? "ãos" : "ães"));
      if (week >= 2 && /(ãos|ães)$/.test(low) && low.length > 4) put(low.replace(/(ãos|ães)$/, "ões"));
      if (week >= 2 && /[aeo]is$/.test(low) && low.length > 4) put(low.replace(/is$/, "ls"));
      if (week >= 2 && /éis$/.test(low)) put(low.replace(/éis$/, "els"));
      if (week >= 2 && /ns$/.test(low) && low.length > 3) put(low.replace(/ns$/, "ms"));
      // accents and tildes: one taken away (você → voce, não → nao), or the
      // open / closed swapped (avó → avô, três → trés)
      if (ACC.test(low) && low !== "à" && low !== "às") {
        var k = low.search(ACC), ch = low[k];
        put(low.slice(0, k) + unaccent(ch) + low.slice(k + 1));
        var SW = { "é": "ê", "ê": "é", "ó": "ô", "ô": "ó" };
        if (SW[ch]) put(low.slice(0, k) + SW[ch] + low.slice(k + 1));
      }
      var done = false;
      if (!safe && low.length > 4) for (var e = 0; e < ENDS.length; e++) {
        if (low.slice(-ENDS[e][0].length) === ENDS[e][0]) { put(low.slice(0, -ENDS[e][0].length) + ENDS[e][1]); done = true; break; }
      }
      // «Rio …»: maybe a name, no spelling games (unless the dictionary knows it)
      var capStart = w[0] !== low[0] && !(isWord && isWord(low));
      // The same word with the other gender ending (bonito → bonita): wrong
      // in the same way a learner is wrong, never another sentence.
      if (!safe && !done && !capStart && low.length > 3 && SWAP_END[low.slice(-1)] &&
          !/^(para|como|onde|agora|ainda|nada|coisa|isso|isto|muito|pouco|obrigado|obrigada|casa|hora|semana|todo|tudo|cedo|tarde|nunca|sempre)$/.test(low))
        put(low.slice(0, -1) + SWAP_END[low.slice(-1)], loose);
      // the Spanish diphthong (porta → puerta, tempo → tiempo, novo → nuevo)
      if (!capStart && low.length >= 4 && low.length <= 7 && low[0] !== "h") {
        if (/^[^aeiouáéíóú]+o[^aeiouáéíóú]/.test(low)) put(low.replace(/^([^aeiouáéíóú]+)o/, "$1ue"), loose);
        else if (/^[^aeiouáéíóú]+e[^aeiouáéíóú]/.test(low)) put(low.replace(/^([^aeiouáéíóú]+)e/, "$1ie"), loose);
      }
    });
    var clean = function (l) { return uniq(shuffle(l, rnd)).filter(function (c) { return c !== sentence; }); };
    var r = clean(rule);
    return r.concat(clean(loose).filter(function (c) { return r.indexOf(c) < 0; }));
  }

  // «¿Cómo se dice…?» from one of the block's examples.
  // Minimal pairs, «avó / avô = abuela / abuelo»: which one means…?
  function pairQuestion(b, rnd) {
    var pairs = (b.ex || []).map(function (p) { return [strip(p[0]).split(" / "), strip(p[1]).split(" / ")]; })
      .filter(function (p) { return p[0].length === 2 && p[1].length === 2 && p[0][0] !== p[0][1] &&
                                   p[1][0] !== p[1][1] && !/[:«»]/.test(p[1].join("")) &&
                                   // «pelo / pêlo = por el / pelo»: asking «pelo» gives it away
                                   p[1].every(function (es) { return p[0].indexOf(es.replace(/\s*\(.*\)/, "")) < 0; }); });
    if (!pairs.length) return null;
    var pk = pairs[Math.floor(rnd() * pairs.length)], k = rnd() < 0.5 ? 0 : 1;
    // Two options are a coin toss: a form from another pair of the block
    // makes it a real question (avó / avô / avós).
    var opts = pk[0].slice();
    var others = shuffle(pairs.filter(function (p) { return p !== pk; }), rnd);
    if (others.length) opts.push(others[0][0][Math.floor(rnd() * 2)]);
    return { kind: "pair", prompt: "¿Cuál significa «" + pk[1][k] + "»?", stem: "", answer: pk[0][k],
             options: shuffle(opts, rnd) };
  }

  function exQuestion(lesson, b, rnd, week, isWord) {
    var pool = allEx(lesson);
    var mine = (b.ex || []).map(function (p) { return [strip(p[0]), strip(p[1])]; })
      .filter(translation);
    if (!mine.length) return pairQuestion(b, rnd);
    var pick = mine[Math.floor(rnd() * mine.length)];
    var known = {}; pool.forEach(function (p) { known[p[0].toLowerCase()] = 1; });
    var tr = traps(pick[0], rnd, week, isWord).filter(function (t) { return !known[t.toLowerCase()]; }).slice(0, 2);
    // Only one mistake possible: the second option carries two.
    if (tr.length === 1) {
      var t2 = traps(tr[0], rnd, week, isWord).filter(function (t) {
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
    // another form (falamos / falo), not something obviously unrelated.
    var words = function (x) { return x.toLowerCase().replace(/[^a-zà-ÿ' -]/g, "").split(/\s+/); };
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
    return { kind: "ex", prompt: "¿Cómo se dice en portugués?", stem: pick[1], answer: pick[0],
             options: shuffle([pick[0]].concat(others), rnd) };
  }

  // A block with only text: blank one Portuguese form of its rule and offer
  // forms from the rest of the lesson («Completá la regla»).
  // isWord: the glossary as a dictionary of Portuguese words.
  function ruleQuestion(lesson, b, rnd, isWord) {
    if (!isWord) return null;
    // Only clean Portuguese forms (every word known to the glossary), never
    // a Spanish word that happened to sit between two asterisks.
    var clean = function (f) {
      f = f.trim();
      return f.length >= 3 && /^[a-zà-ÿ' -]+$/i.test(f) && f.indexOf("/") < 0 && !/^\s|\s$/.test(f) &&
        f.split(/[\s-]+/).every(function (w) { return isWord(w); }) ? f : null;
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
    // either the same class (ser / estar, em / de / a, no / na) or a near
    // shape (falo / fala); «ter | melhor / falaremos» gives itself away.
    var others = uniq(shuffle(all, rnd).map(clean).filter(function (f) {
      return f && f.toLowerCase() !== pick.toLowerCase() && forms.indexOf(f) < 0 &&
        f.split(/\s+/).length === pick.split(/\s+/).length && akin(f.toLowerCase(), pick.toLowerCase());
    })).slice(0, 2);
    if (others.length < 2) return null;
    var src = [b.r].concat(b.p || []).filter(function (t) { return t && t.indexOf("*" + pick + "*") >= 0; })[0] || b.r || "";
    var stem = strip(src.replace("*" + pick + "*", "___"));
    // A hole glued to letters or a stray asterisk: the markup was uneven.
    if (/[a-zà-ÿ]___|___[a-zà-ÿ]/i.test(stem) || stem.indexOf("*") >= 0) return null;
    if (stem.length > 160) stem = stem.slice(0, 157) + "…";
    return { kind: "rule", prompt: "Completá la regla", stem: stem, answer: pick,
             options: shuffle([pick].concat(others), rnd) };
  }

  var CLASSES = [["ser", "estar", "ter", "haver", "ficar", "ir", "fazer"],
                 ["o", "a", "os", "as", "um", "uma", "uns", "umas"],
                 ["a", "de", "em", "por", "para", "com", "sem", "até", "entre", "sobre"],
                 ["no", "na", "nos", "nas", "do", "da", "dos", "das", "ao", "à", "aos", "às", "pelo", "pela", "pelos", "pelas", "num", "numa"],
                 ["eu", "tu", "ele", "ela", "nós", "eles", "elas", "você", "vocês", "a gente"],
                 ["me", "te", "se", "nos", "o", "a", "os", "as", "lhe", "lhes", "mim", "ti", "si"],
                 ["que", "quem", "cujo", "cuja", "onde", "o qual", "a qual"],
                 ["meu", "minha", "teu", "tua", "seu", "sua", "nosso", "nossa", "dele", "dela"],
                 ["muito", "mais", "menos", "tanto", "pouco", "bem", "mal"],
                 ["presente", "pretérito perfeito", "pretérito imperfeito", "futuro", "futuro do pretérito", "subjuntivo",
                  "infinitivo pessoal", "mais-que-perfeito", "perfeito composto", "gerúndio", "particípio"]];
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
    var wa = a.toLowerCase().split(/[^a-zà-ÿ']+/).filter(function (w) { return w.length > 2; });
    var wb = b.toLowerCase().split(/[^a-zà-ÿ']+/);
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
    // A cell that repeats words of its own row label («se eu for → se eu
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
  // Portuguese forms, a table of labels).
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
        if (f && f.length >= 2 && f.split(/\s+/).length <= 3 && /[a-zà-ÿ]/i.test(f)) out.push(f.toLowerCase());
      });
    };
    [b.r, b.warn, b.tip].concat(b.p || []).forEach(function (t) {
      (String(t || "").match(/\*([^*]+)\*/g) || []).forEach(function (m) { add(m.replace(/\*/g, "")); });
    });
    if (b.table) (b.table.rows || []).forEach(function (r) { r.slice(1).forEach(function (c) { if (strip(c).length <= 30) add(c); }); });
    return uniq(out).sort(function (a, b2) { return b2.length - a.length; });
  }

  // The playable sequence: intro, then each block followed by its check.
  function steps(lesson, rnd, week, isWord, only) {
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
      var q = (b.table && tableQuestion(b, rnd)) || (b.ex && exQuestion(lesson, b, rnd, week, isWord)) ||
              (!b.table && ruleQuestion(lesson, b, rnd, isWord)) ||
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
