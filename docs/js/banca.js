/*
 * El banco: miles de ejercicios generados a partir de data/bank.json
 * (palabras, oraciones, errores típicos del hispanohablante).  Cada ejercicio
 * lleva la regla que pone a prueba, así el diagnóstico puede explicar el
 * error en lugar de mostrar solo la respuesta correcta.
 *
 * Tipos: palabras (en las dos direcciones, con el artículo), artículos,
 * plurales, contracciones (em + o = no, de + a = da, a + o = ao, por + o =
 * pelo, em + um = num), concordancia del adjetivo, traducción, verbo en
 * contexto, encontrá el error y la clínica de los errores personales.
 *
 * Esquema de bank.json: el mismo del curso de italiano (las claves «it» de
 * las oraciones y «esIt» de las interferencias conservan el nombre).
 */
(function (root) {
  "use strict";

  var Diagnosi = root.Diagnosi ||
    (typeof require === "function" ? require("./diagnosi.js") : null);
  var Conj = root.Conj ||
    (typeof require === "function" ? require("./conjugator.js") : null);

  var B = null;          // el banco cargado
  var IDX = {};          // índices derivados

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

  /* El nivel del recorrido decide qué está al alcance (tools/curriculo.py:
     A1 semanas 1-8, A2 9-16, B1 17-27, B2 28-40, C1 41-52). */
  function levelOf(state) {
    var w = (state && state.unlocked) || 1;
    return w <= 8 ? "A1" : w <= 16 ? "A2" : w <= 27 ? "B1" : w <= 40 ? "B2" : "C1";
  }
  /* Y la semana del curso decide la gramática: cada oración y cada error
     traen en «w» (traducir, encontrar el error) y «wg» (completar) la
     primera semana en la que todo lo que usan ya se explicó. */
  function weekOf(state) { return (state && state.unlocked) || 1; }
  function taught(x, state, key) { return (x[key || "w"] || 1) <= weekOf(state); }
  function within(lvl, max) { return LEVELS.indexOf(lvl) <= LEVELS.indexOf(max); }
  function nearLevel(lvl, max) {
    var a = LEVELS.indexOf(lvl), b = LEVELS.indexOf(max);
    return a <= b && a >= b - 1;
  }

  /* -------------------------------------------------------- artículos */

  // En portugués el artículo no depende del sonido inicial: o / a / os / as.
  function defArt(word, g, plural) {
    return g === "m" ? (plural ? "os" : "o") : (plural ? "as" : "a");
  }

  function indefArt(word, g, plural) {
    return g === "m" ? (plural ? "uns" : "um") : (plural ? "umas" : "uma");
  }

  // El género no cambia en plural (o ovo → os ovos).
  function pluralGender(n) { return n[1]; }

  function withArt(art, word) { return art + " " + word; }

  function nounWithArt(n) { return withArt(defArt(n[0], n[1], false), n[0]); }

  /* ---------------------------------------------------------- palabras */

  function vocabChoice(n, kind) {
    // Portugués → español, reconocer la palabra (las nuevas empiezan acá).
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
      var extra = n[2] !== n[0] ? "Plural: " + withArt(defArt(n[2], pluralGender(n), true), n[2]) + "." : "No cambia en plural.";
      return (n[6] ? n[6] + " " : "") + extra;
    }
    if (kind === "v") return (n[6] || "") + (n[4] && !/irregular/i.test(n[6] || "") ? " Irregular." : "");
    if (kind === "a") return n[6] || (n[0] + " · " + n[1] + " · " + n[2] + " · " + n[3]);
    return n[4] || "";
  }

  function vocabWrite(n, kind) {
    // Español → portugués, producirla (los sustantivos con su artículo: ahí
    // aparecen los errores de género, o leite, a árvore).
    var ans, prompt, stem;
    if (kind === "n") {
      ans = nounWithArt(n);
      prompt = "Escribilo en portugués, con el artículo (o, a)";
      stem = n[3];
    } else if (kind === "v") { ans = n[0]; prompt = "Escribí el infinitivo en portugués"; stem = n[1]; }
    else if (kind === "a") { ans = n[0]; prompt = "Escribí el adjetivo (masculino singular)"; stem = n[4]; }
    else { ans = n[0]; prompt = "¿Cómo se dice en portugués?"; stem = n[1]; }
    return { id: "b:voc:" + n[0], src: "banca", bank: "voc", type: "typed",
             prompt: prompt, stem: stem, answer: ans, accept: [ans],
             note: kindNote(n, kind), diag: true, say: ans };
  }

  // La capa de frecuencia (docs/js/frequenza.js), si la app la cargó.
  function Freq() { return root.Freq && root.Freq.loaded() ? root.Freq : null; }

  function vocabSession(state, size) {
    var lvl = levelOf(state), cards = state.cards || {};
    var pool = [];
    B.nouns.forEach(function (n) { if (within(n[5], lvl)) pool.push([n, "n"]); });
    B.verbs.forEach(function (v) { if (within(v[5], lvl)) pool.push([v, "v"]); });
    B.adjectives.forEach(function (a) { if (within(a[5], lvl)) pool.push([a, "a"]); });
    B.words.forEach(function (w) { if (within(w[3], lvl)) pool.push([w, "w"]); });
    var fresh = shuffle(pool.filter(function (x) { return !cards["b:voc:" + x[0][0]]; }));
    // Primero las palabras desconocidas más frecuentes (Nation 2006); el
    // orden al azar dentro de la misma franja mantiene las sesiones variadas.
    var F = Freq();
    if (F) fresh.sort(function (a, b) { return Math.round(F.zipf(b[0][0]) * 2) - Math.round(F.zipf(a[0][0]) * 2); });
    var seen = shuffle(pool.filter(function (x) { return cards["b:voc:" + x[0][0]]; }));
    var out = [];
    // Palabras nuevas: reconocer; conocidas: producir (dificultad deseable).
    fresh.slice(0, 6).forEach(function (x) { out.push(vocabChoice(x[0], x[1])); });
    seen.slice(0, (size || 12) - out.length).forEach(function (x) { out.push(vocabWrite(x[0], x[1])); });
    if (out.length < (size || 12)) {
      fresh.slice(6, 6 + (size || 12) - out.length).forEach(function (x) { out.push(vocabWrite(x[0], x[1])); });
    }
    return shuffle(out);
  }

  /* Una sesión sobre lemas dados (las palabras frecuentes que le faltan al
     alumno, del medidor de cobertura): las entradas del banco, primero para
     reconocer. */
  function vocabSessionFor(state, lemmas, size) {
    var cards = state.cards || {}, out = [];
    (lemmas || []).forEach(function (l) {
      var n = IDX.noun[l] ? [IDX.noun[l], "n"] : IDX.verb[l] ? [IDX.verb[l], "v"] : IDX.adj[l] ? [IDX.adj[l], "a"] : IDX.word[l] ? [IDX.word[l], "w"] : null;
      if (!n || out.length >= (size || 12)) return;
      out.push(cards["b:voc:" + n[0][0]] ? vocabWrite(n[0], n[1]) : vocabChoice(n[0], n[1]));
    });
    return out;
  }
  // ¿Está el lema en el banco (para que el medidor de cobertura lo ofrezca)?
  function hasWord(l) { return !!(IDX.noun[l] || IDX.verb[l] || IDX.adj[l] || IDX.word[l]); }

  /* ------------------------------------------------------------ formas */

  var ART_SET = ["o", "a", "os", "as"];

  function articleItem(n, plural) {
    var word = plural ? n[2] : n[0];
    var g = plural ? pluralGender(n) : n[1];
    var ans = defArt(word, g, plural);
    return { id: "b:art:" + n[0] + (plural ? ":p" : ":s"), src: "banca", bank: "forme",
             type: "choice", prompt: "Elegí el artículo" + (plural ? " (plural)" : ""),
             stem: "___ " + word + "  (" + n[3] + ")", options: ART_SET.slice(), answer: ans, accept: [ans],
             choiceDiag: { before: "", after: " " + word },
             note: artNote(word, g, plural, n), say: withArt(ans, word) };
  }

  function artNote(word, g, plural, n) {
    var why = g === "m" ? "Masculino: o, os." : "Femenino: a, as.";
    if (/agem$/.test(n[0])) why = "Las palabras en -agem son femeninas: a viagem, a mensagem.";
    else if (/ção$|são$|dade$|tude$/.test(n[0])) why = "Las terminadas en -ção, -são, -dade y -tude son femeninas.";
    else if (/ma$/.test(n[0]) && g === "m") why = "Muchas en -ma son masculinas, como en español: o problema, o sistema.";
    return why + (n[6] ? " " + n[6] : "");
  }

  // Sustantivos que viven en singular (a fome, o sangue, os meses): su plural
  // es un dato de gramática, no algo para ejercitar.
  var MONTHS = /^(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)$/;
  function countable(n) {
    return !/(solo|sólo|siempre|se usa) (en |en el )?singular|no tiene plural|sin plural/i.test(n[6] || "") && !MONTHS.test(n[0]) &&
      !/^(fome|sede|sangue|saúde|leite|pimenta|sal|mel|oxigênio|paciência|coragem|sorte|gente|meio-dia|meia-noite|saudade|lixo|dinheiro|grana|arroz|feijão|açúcar|café da manhã|calor|frio|trânsito|poeira|pó)$/.test(n[0]);
  }

  function pluralItem(n) {
    var g = pluralGender(n);
    var artP = defArt(n[2], g, true);
    return { id: "b:pl:" + n[0], src: "banca", bank: "forme", type: "typed",
             prompt: "Escribí el plural", stem: nounWithArt(n) + " → " + artP + " ___",
             answer: n[2], accept: [n[2]], note: pluralNote(n), diag: true,
             say: withArt(artP, n[2]) };
  }

  function pluralNote(n) {
    var s = n[0], p = n[2], why = "";
    if (/ão$/.test(s)) why = /ões$/.test(p) ? "-ão → -ões (la mayoría): limão, limões." :
      /ães$/.test(p) ? "-ão → -ães en algunas: pão, pães; cão, cães; alemão, alemães." :
      /ãos$/.test(p) ? "-ão → -ãos en algunas: mão, mãos; irmão, irmãos; cidadão, cidadãos." : "";
    else if (/[aeou]l$/.test(s)) why = "-l → -is: animal, animais; papel, papéis; espanhol, espanhóis.";
    else if (/il$/.test(s)) why = /is$/.test(p) && !/eis$/.test(p) ? "-il tónico → -is: barril, barris." : "-il átono → -eis: fóssil, fósseis.";
    else if (/m$/.test(s)) why = "-m → -ns: homem, homens; jardim, jardins.";
    else if (/[rz]$/.test(s)) why = "-r y -z → -es: mar, mares; luz, luzes.";
    else if (s === p) why = "No cambia en plural (como o ônibus, o lápis).";
    return why + (n[6] ? (why ? " " : "") + n[6] : "");
  }

  /* Contracciones de preposición y artículo: obligatorias en portugués.
     «a + a = à» es la crase: se ejercita desde que se ven las preposiciones
     de movimiento (CRASE_WEEK); la regla completa de la crase es de la
     semana 36. */
  var PREPS = ["em", "de", "a", "por"];
  var CONTR = {
    em: { o: "no", a: "na", os: "nos", as: "nas", um: "num", uma: "numa", uns: "nuns", umas: "numas" },
    de: { o: "do", a: "da", os: "dos", as: "das" },
    a: { o: "ao", a: "à", os: "aos", as: "às" },
    por: { o: "pelo", a: "pela", os: "pelos", as: "pelas" }
  };
  var CRASE_WEEK = 9;

  function prepItem(n, prep, plural, indef) {
    var word = plural ? n[2] : n[0], g = plural ? pluralGender(n) : n[1];
    if (!CONTR[prep]) return null;
    var art = indef && prep === "em" ? indefArt(word, g, plural) : defArt(word, g, plural), ans = CONTR[prep][art];
    if (!ans) return null;
    var note = "*" + prep + " + " + art + "* = *" + ans + "*" +
      (ans === "à" || ans === "às" ? " (con acento grave: es la crase)." :
       prep === "em" && indef ? " (también se escribe *em " + art + "*)." : ".") +
      (prep === "em" && indef ? "" : " En portugués la contracción es obligatoria.");
    return { id: "b:prep:" + prep + ":" + n[0] + (plural ? ":p" : indef ? ":u" : ""), src: "banca", bank: "forme",
             type: "typed", prompt: "Uní la preposición con el artículo",
             stem: "(" + prep + " + " + art + ") " + word + " → ___ " + word,
             answer: ans, accept: prep === "em" && indef ? [ans, "em " + art] : [ans], diag: true,
             note: note, say: withArt(ans, word) };
  }

  var GENERIC_ADJ = ["novo", "velho", "bonito", "grande", "pequeno", "branco", "vermelho", "preto",
                     "amarelo", "verde", "azul", "caro", "barato", "moderno", "antigo",
                     "limpo", "sujo", "famoso", "brasileiro", "comprido", "curto", "pesado",
                     "leve", "confortável", "simples", "estranho", "perfeito", "cheio", "vazio",
                     "lindo", "quente", "frio"];
  // Temas del banco de sustantivos con cosas concretas (los nombres de tema
  // pueden venir del banco italiano o traducidos).
  var CONCRETE = { casa: 1, "città": 1, cidade: 1, vestiti: 1, roupa: 1, roupas: 1, cibo: 1, comida: 1,
                   viaggio: 1, viagem: 1, negozi: 1, lojas: 1, compras: 1, tecnologia: 1, scuola: 1, escola: 1 };

  function agreeItem(n, adjKey, plural) {
    var a = IDX.adj[adjKey];
    if (!a) return null;
    var g = plural ? pluralGender(n) : n[1];
    var word = plural ? n[2] : n[0];
    var form = plural ? (g === "m" ? a[2] : a[3]) : (g === "m" ? a[0] : a[1]);
    var art = plural ? defArt(word, g, true) : indefArt(word, g, false);
    return { id: "b:agr:" + n[0] + ":" + adjKey + (plural ? ":p" : ""), src: "banca", bank: "forme",
             type: "typed", prompt: "Concordá el adjetivo «" + a[0] + "» (" + a[4] + ")",
             stem: withArt(art, word) + " ___", answer: form, accept: [form], diag: true,
             note: word + " es " + (g === "m" ? "masculino" : "femenino") + (plural ? " plural" : " singular") +
               ": " + a[0] + " → " + form + "." + (n[6] ? " " + n[6] : ""),
             say: withArt(art, word) + " " + form };
  }

  function formsSession(state, size, focus) {
    if ((state.unlocked || 1) < FORME_WEEK) return [];
    var lvl = levelOf(state), wk = state.unlocked || 1;
    var nouns = B.nouns.filter(function (n) { return within(n[5], lvl); });
    if (!nouns.length) return [];
    // Los que más enseñan: plurales irregulares, heterogenéricos (con nota).
    var special = nouns.filter(function (n) { return n[6] || /(ão|l|m)$/.test(n[0]) || n[2] === n[0]; });
    var out = [];
    var kinds = focus ? [focus] : ["art", "art", "pl", "prep", "prep", "agr"];
    for (var i = 0; i < (size || 12) * 3 && out.length < (size || 12); i++) {
      var k = pick(kinds), n = pick(Math.random() < 0.6 && special.length ? special : nouns);
      var x = null;
      if (k === "art") x = articleItem(n, Math.random() < 0.4);
      else if (k === "pl") x = countable(n) && (n[2] !== n[0] || Math.random() < 0.3) ? pluralItem(n) : null;
      else if (k === "prep") {
        var pl = Math.random() < 0.3, prep = pick(PREPS);
        var g = pl ? pluralGender(n) : n[1];
        if (prep === "a" && g === "f" && wk < CRASE_WEEK) prep = pick(["em", "de", "por"]);
        x = prepItem(n, prep, pl, prep === "em" && !pl && Math.random() < 0.25);
      }
      else x = CONCRETE[n[4]] ? agreeItem(n, pick(GENERIC_ADJ), Math.random() < 0.4) : null;
      if (x && !out.some(function (y) { return y.id === x.id; })) out.push(x);
    }
    return out;
  }

  /* ---------------------------------------------------------- oraciones */

  // Con o sin pronombre sujeto: el portugués de Brasil lo dice más que el
  // español, pero omitirlo no es error (salvo con você y a gente, que
  // cambiarían el sentido).
  function variants(s) {
    var out = s.it.slice();
    s.it.forEach(function (v) {
      var m = v.match(/^(Eu|Tu|Nós|Ele|Ela|Eles|Elas) (.+)$/);
      if (m && !/^(e|é|me|se|te|nos|o|a)\b/i.test(m[2])) out.push(m[2].charAt(0).toUpperCase() + m[2].slice(1));
    });
    return out.filter(function (x, i) { return out.indexOf(x) === i; });
  }

  function translateItem(i) {
    var s = B.sentences[i];
    return { id: "b:tr:" + i, src: "banca", bank: "tr", type: "translate",
             prompt: "Traducí al portugués", stem: s.es, answer: s.it[0], accept: variants(s),
             note: s.note, tags: s.tags, lvl: s.lvl, diag: true, say: s.it[0] };
  }

  // Otras respuestas para el hueco, leídas de las demás variantes aceptadas.
  // Dónde está la forma como palabra entera (no dentro de otra: «é» dentro
  // de «café»).
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
             prompt: "Encontrá el error: tocá la palabra que está mal", stem: e.wrong,
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
    // Primero las vencidas, después las nuevas, después el resto.
    var cards = state.cards || {}, now = Date.now();
    var due = ids.filter(function (i) { var c = cards[prefix + i]; return c && c.due <= now; });
    var fresh = ids.filter(function (i) { return !cards[prefix + i]; });
    var rest = ids.filter(function (i) { var c = cards[prefix + i]; return c && c.due > now; });
    return shuffle(due).concat(shuffle(fresh), shuffle(rest));
  }

  /* Traducir necesita artículos y un verbo detrás; las formas, los
     artículos y las contracciones (semana 3). */
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

  /* Encontrar un error necesita una oración que ya se pueda leer: antes de
     la semana 5 (presente regular) no hay con qué compararla. */
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

  /* ------------------------------------------------------------ clínica */

  // Qué ejercicios curan qué error (las claves son las categorías de
  // errori_banca.py y de Diagnosi.LABEL; tags, las etiquetas de las
  // oraciones; forms, el ejercicio de formas que corresponde).
  var CURE = {
    contraccion: { tags: ["contracciones", "preposiciones"], err: ["contraccion", "preposicion"], forms: "prep" },
    articulo: { tags: ["articulos", "contracciones"], err: ["articulo", "contraccion"], forms: "art" },
    genero: { tags: ["genero", "concordancia"], err: ["genero", "concordancia"], forms: "art" },
    plural: { tags: ["plurales"], err: ["plural"], forms: "pl" },
    concordancia: { tags: ["concordancia", "plurales", "genero"], err: ["concordancia", "genero", "plural"], forms: "agr" },
    preposicion: { tags: ["preposiciones", "contracciones"], err: ["preposicion", "contraccion", "regencia"], forms: "prep" },
    regencia: { tags: ["regencia", "gostar"], err: ["regencia", "preposicion", "gostar"] },
    muito: { tags: ["muito", "comparativos", "indefinidos"], err: ["muito"] },
    gostar: { tags: ["gostar"], err: ["gostar", "regencia"] },
    a_personal: { tags: ["a_personal"], err: ["a_personal"] },
    perfeito_composto: { tags: ["perfeito_composto", "perfeito"], err: ["perfeito_composto", "tempo"] },
    subjuntivo: { tags: ["subjuntivo", "conjunciones", "subj_imperfeito"], err: ["subjuntivo"] },
    futuro_subj: { tags: ["futuro_subj"], err: ["futuro_subj", "subjuntivo"] },
    inf_pessoal: { tags: ["inf_pessoal"], err: ["inf_pessoal"] },
    pronome: { tags: ["pronombres", "colocacao"], err: ["pronome", "colocacao"] },
    colocacao: { tags: ["colocacao", "pronombres"], err: ["colocacao", "pronome"] },
    crase: { tags: ["crase", "horas"], err: ["crase", "contraccion"], forms: "prep" },
    ortografia: { err: ["ortografia"], vocab: true },
    tilde: { err: ["ortografia"], vocab: true },
    nasal: { tags: ["plurales"], err: ["ortografia", "plural"], vocab: true },
    espanol: { tags: ["lexico", "muito"], err: ["espanol", "falso_amigo", "muito"], vocab: true },
    falso_amigo: { tags: ["falsos_amigos"], err: ["falso_amigo", "espanol"], vocab: true },
    lexico: { tags: ["lexico", "falsos_amigos"], err: ["falso_amigo", "espanol"], vocab: true },
    tempo: { tags: ["perf_imperf", "imperfeito", "perfeito", "futuro", "condicional"], err: ["tempo", "perfeito_composto"] },
    persona: { tags: ["presente", "irregulares"], err: ["persona"] },
    participio: { tags: ["participio", "pasiva"], err: ["participio", "concordancia"] },
    verbo_irregular: { tags: ["irregulares", "perfeito"], err: ["verbo_irregular", "participio"] },
    regularizacion: { tags: ["irregulares", "perfeito"], err: ["verbo_irregular", "participio"] },
    orden: { tags: ["colocacao", "pronombres", "conectores"], err: ["colocacao", "pronome"] },
    faltante: { tags: ["articulos", "contracciones", "regencia"], err: ["articulo", "contraccion", "regencia"] },
    sobrante: { tags: ["a_personal", "ir_inf", "gostar"], err: ["a_personal", "preposicion", "gostar"] }
  };

  // Las áreas más flojas del alumno; los errores recientes pesan más.
  function weakest(state, n) {
    var errs = (state && state.errs) || {}, now = Date.now();
    return Object.keys(errs).map(function (k) {
      var e = errs[k], age = (now - (e.last || 0)) / 86400000;
      return { cat: k, score: (e.n - (e.fixed || 0) * 0.5) * Math.pow(0.9, age) };
    // Un patrón, no un error suelto: al menos un par de errores recientes.
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

  /* ------------------------------------------------------------ repaso */

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
    if (p[1] === "prep" && IDX.noun[p[3]]) return prepItem(IDX.noun[p[3]], p[2], p[4] === "p", p[4] === "u");
    if (p[1] === "agr" && IDX.noun[p[2]]) return agreeItem(IDX.noun[p[2]], p[3], p[4] === "p");
    if (p[1] === "tr" && B.sentences[+p[2]]) return translateItem(+p[2]);
    if (p[1] === "gap" && B.sentences[+p[2]]) return gapItem(+p[2]);
    if (p[1] === "err" && B.errors[+p[2]]) return errorItem(+p[2]);
    return null;
  }

  // Un ítem para la pausa del café: una oración al nivel del alumno.
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
    TR_WEEK: TR_WEEK, GAP_WEEK: GAP_WEEK, FORME_WEEK: FORME_WEEK, CRASE_WEEK: CRASE_WEEK,
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
