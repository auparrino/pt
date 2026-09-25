/*
 * La diagnosi: capire *che tipo* di errore è, non solo che è sbagliato.
 *
 * La ricerca sul feedback correttivo indica cosa fare:
 *  - i "prompt" (indizi metalinguistici che spingono a correggersi da soli)
 *    funzionano meglio del dare subito la forma giusta (Lyster & Ranta 1997;
 *    meta-analisi di Lyster & Saito 2010);
 *  - il feedback specifico sulla risposta data ("perché questa è sbagliata")
 *    è più utile della semplice verifica (Shute 2008);
 *  - gli errori di regola (ausiliare, accordo, articolo, tempo) si curano
 *    con la regola; quelli lessicali con il significato e un esempio
 *    (Ferris 1999, errori "trattabili" e "non trattabili");
 *  - un refuso o un accento sono sviste, non errori di sistema: si segnalano
 *    senza insistere (Corder 1967);
 *  - sbagliare e poi ricevere una correzione che analizza l'errore fa
 *    imparare, soprattutto quando si era sicuri (Metcalfe 2017).
 *
 * diagnose(dato, attese, ctx) → { verdict, cat, slip, hint, explain,
 *                                  given, fixed, others }
 *   hint     indizio da mostrare al primo tentativo (non rivela la risposta)
 *   explain  spiegazione completa dopo la soluzione
 *   given    token della risposta data, con quello sbagliato marcato
 *   fixed    token della risposta attesa, con quello corretto marcato
 *
 * I dati sul trasferimento dallo spagnolo (parole, falsi amici, grafie) e il
 * lessico arrivano da data/bank.json tramite init(); senza, la diagnosi usa
 * solo regole e il coniugatore.
 */
(function (root) {
  "use strict";

  var Conj = root.Conj ||
    (typeof require === "function" ? require("./conjugator.js") : null);

  // Maps keyed by what the learner types must not inherit from Object:
  // "constructor" or "__proto__" are words someone can type.
  function dict(o) {
    var d = Object.create(null);
    if (o) Object.keys(o).forEach(function (k) { d[k] = o[k]; });
    return d;
  }

  var DATA = { esIt: dict(), falsi: dict(), spelling: [], lex: dict(), adj: dict(), nouns: dict(), nounsByPlural: dict() };

  /* --------------------------------------------------------- strumenti */

  function deaccent(s) {
    return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Tokens for comparison: lower case, punctuation out, elisions split
  // after the apostrophe (l'amico → l' + amico).
  function tokens(s) {
    return String(s == null ? "" : s)
      .toLowerCase()
      .replace(/[’‘`´]/g, "'")
      .replace(/[\u200b-\u200d\u2060\ufeff]/g, "")
      .replace(/\p{Extended_Pictographic}|[\ufe0f\u{1f3fb}-\u{1f3ff}]/gu, " ")
      .replace(/[«»"“”.,;:!?¿¡()…—–-]+/g, " ")
      .replace(/'/g, "' ")
      .split(/\s+/)
      .filter(Boolean);
  }

  function degeminate(s) { return s.replace(/([bcdfglmnpqrstvz])\1/g, "$1"); }

  // Damerau distance: two swapped letters (vicion/vicino) are one slip.
  function editDistance(a, b) {
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 0; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        var c = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[a.length][b.length];
  }

  function similarity(a, b) {
    var d = editDistance(deaccent(a), deaccent(b));
    return 1 - d / Math.max(a.length, b.length, 1);
  }

  /* Allinea due sequenze di token: equal / sub / miss (manca nella risposta)
     / extra (in più nella risposta).  La sostituzione costa meno quando le
     parole si somigliano, così "ho"≠"sono" si accoppiano come sostituzione
     e "nono"/"nonno" pure. */
  function align(g, e) {
    var n = g.length, m = e.length, D = [], i, j;
    for (i = 0; i <= n; i++) { D[i] = []; for (j = 0; j <= m; j++) D[i][j] = 0; }
    for (i = 1; i <= n; i++) D[i][0] = i;
    for (j = 1; j <= m; j++) D[0][j] = j;
    for (i = 1; i <= n; i++) {
      for (j = 1; j <= m; j++) {
        var same = g[i - 1] === e[j - 1];
        var sub = same ? 0 : 1.4 - 0.6 * similarity(g[i - 1], e[j - 1]);
        D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + sub);
      }
    }
    var ops = [];
    i = n; j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0) {
        var same2 = g[i - 1] === e[j - 1];
        var sub2 = same2 ? 0 : 1.4 - 0.6 * similarity(g[i - 1], e[j - 1]);
        if (Math.abs(D[i][j] - (D[i - 1][j - 1] + sub2)) < 1e-9) {
          ops.unshift({ op: same2 ? "eq" : "sub", g: g[i - 1], e: e[j - 1], gi: i - 1, ei: j - 1 });
          i--; j--; continue;
        }
      }
      if (i > 0 && Math.abs(D[i][j] - (D[i - 1][j] + 1)) < 1e-9) {
        ops.unshift({ op: "extra", g: g[i - 1], gi: i - 1, ei: j });
        i--; continue;
      }
      ops.unshift({ op: "miss", e: e[j - 1], ei: j - 1, gi: i });
      j--;
    }
    return ops;
  }

  function lcsLen(a, b) {
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = 0;
    for (i = 1; i <= a.length; i++) {
      cur = [0];
      for (j = 1; j <= b.length; j++) {
        cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
      }
      prev = cur;
    }
    return prev[b.length];
  }

  function it(w) { return "*" + w + "*"; }

  /* ----------------------------------------------------- inventari */

  var ARTICLES = dict({
    "il": ["m", "s", "det"], "lo": ["m", "s", "det"], "l'": ["?", "s", "det"],
    "la": ["f", "s", "det"], "i": ["m", "p", "det"], "gli": ["m", "p", "det"],
    "le": ["f", "p", "det"], "un": ["m", "s", "ind"], "uno": ["m", "s", "ind"],
    "una": ["f", "s", "ind"], "un'": ["f", "s", "ind"]
  });

  var PREP_BASE = dict({ di: "di", a: "a", da: "da", in: "in", su: "su", con: "con",
                    per: "per", tra: "tra", fra: "fra" });
  var ART_PREP = dict();
  (function () {
    var bases = { a: "a", di: "de", da: "da", in: "ne", su: "su" };
    var arts = { il: "l", lo: "llo", "l'": "ll'", la: "lla", i: "i", gli: "gli", le: "lle" };
    Object.keys(bases).forEach(function (b) {
      Object.keys(arts).forEach(function (a) {
        var form = bases[b] + arts[a];
        if (b === "a" && a === "i") form = "ai";
        if (b === "di" && a === "i") form = "dei";
        if (b === "da" && a === "i") form = "dai";
        if (b === "in" && a === "i") form = "nei";
        if (b === "su" && a === "i") form = "sui";
        if (b === "a" && a === "il") form = "al";
        if (b === "di" && a === "il") form = "del";
        if (b === "da" && a === "il") form = "dal";
        if (b === "in" && a === "il") form = "nel";
        if (b === "su" && a === "il") form = "sul";
        ART_PREP[form] = [b, a];
      });
    });
    ART_PREP.col = ["con", "il"];
    ART_PREP.coi = ["con", "i"];
  })();

  function prepInfo(w) {
    if (PREP_BASE[w]) return { base: PREP_BASE[w], art: null };
    if (ART_PREP[w]) return { base: ART_PREP[w][0], art: ART_PREP[w][1] };
    return null;
  }

  function contract(prep, art) {
    for (var k in ART_PREP) {
      if (ART_PREP[k][0] === prep && ART_PREP[k][1] === art) return k;
    }
    return null;
  }

  var CLITICS = ["mi", "ti", "si", "ci", "vi", "lo", "la", "li", "le", "gli", "ne",
                 "me", "te", "se", "ce", "ve", "glie", "m'", "t'", "s'", "c'", "l'"];
  var SUBJECTS = ["io", "tu", "lui", "lei", "noi", "voi", "loro", "egli", "ella"];
  var FAMILY = ["madre", "padre", "fratello", "sorella", "moglie", "marito", "figlio",
                "figlia", "nonno", "nonna", "zio", "zia", "cugino", "cugina",
                "nipote", "suocero", "suocera", "cognato", "cognata", "mamma", "papà"];
  var POSSESSIVE = ["mio", "mia", "tuo", "tua", "suo", "sua", "nostro", "nostra",
                    "vostro", "vostra", "miei", "mie", "tuoi", "tue", "suoi", "sue",
                    "nostri", "nostre", "vostri", "vostre", "loro"];
  var OPINION = ["penso", "pensi", "pensa", "pensiamo", "credo", "credi", "crede",
                 "spero", "speri", "spera", "voglio", "vuoi", "vuole", "sembra",
                 "immagino", "dubito", "importante", "necessario", "bisogna",
                 "prima", "benché", "sebbene", "affinché", "purché", "senza",
                 "peccato", "meglio", "possibile", "probabile", "temo", "ho paura"];

  /* ---------------------------------------------------- indice verbi */

  var VIDX = null;   // forma → [{lemma, tense, p}]
  var PIDX = null;   // participio → lemma
  var LIDX = null;   // infinito → true

  function buildVerbIndex() {
    VIDX = dict(); PIDX = dict(); LIDX = dict();
    if (!Conj) return;
    Conj.list().forEach(function (v) {
      LIDX[v] = true;
      Conj.SIMPLE_TENSES.forEach(function (t) {
        var forms;
        try { forms = Conj.conjugate(v, t); } catch (e) { return; }
        forms.forEach(function (f, p) {
          var w = f.split(" ").pop();     // reflexives: "mi alzo" → alzo
          (VIDX[w] = VIDX[w] || []).push({ lemma: v, tense: t, p: p });
        });
      });
      try {
        var pp = Conj.participle(v);
        [pp, pp.replace(/o$/, "a"), pp.replace(/o$/, "i"), pp.replace(/o$/, "e")]
          .forEach(function (x) { PIDX[x] = v; });
      } catch (e) { /* */ }
    });
  }

  function verbForms(w) {
    if (!VIDX) buildVerbIndex();
    return VIDX[w] || [];
  }

  function participleOf(w) {
    if (!PIDX) buildVerbIndex();
    return PIDX[w] || null;
  }

  // A verb the conjugator knows, or a bank word glossed as a Spanish infinitive.
  function isInfinitive(w) {
    if (!LIDX) buildVerbIndex();
    if (!/(are|ere|ire|rre)$/.test(w)) return false;
    if (LIDX[w]) return true;
    var gl = DATA.lex[w] ? String(DATA.lex[w]).split(/[,;/(]/)[0].trim() : "";
    return /(ar|er|ir)(se)?$/.test(gl);
  }

  var AVERE = ["ho", "hai", "ha", "abbiamo", "avete", "hanno", "avevo", "avevi", "aveva",
               "avevamo", "avevate", "avevano", "avrò", "avrai", "avrà", "avremo", "avrete",
               "avranno", "avrei", "avresti", "avrebbe", "avremmo", "avreste", "avrebbero",
               "abbia", "abbiano", "avessi", "avesse", "avessimo", "aveste", "avessero", "ebbi"];
  var ESSERE = ["sono", "sei", "è", "siamo", "siete", "ero", "eri", "era", "eravamo",
                "eravate", "erano", "sarò", "sarai", "sarà", "saremo", "sarete", "saranno",
                "sarei", "saresti", "sarebbe", "saremmo", "sareste", "sarebbero", "sia",
                "siano", "fossi", "fosse", "fossimo", "foste", "fossero", "fui"];

  var TENSE_ES = {
    presente: "presente", imperfetto: "imperfetto", futuro: "futuro",
    passatoRemoto: "passato remoto", condizionale: "condizionale",
    congiuntivo: "congiuntivo presente", congImperfetto: "congiuntivo imperfetto"
  };
  var PERS_ES = ["io", "tu", "lui/lei", "noi", "voi", "loro"];

  /* Palabras funcionales del castellano que no existen en italiano: el
     artículo, «que», «es», «muy»…  Cuando aparecen, lo que hay es español
     dentro del italiano, no un tipeo ni un problema de vocabulario. */
  var ES_FUNC = dict({
    el: "il / lo / l'", los: "i / gli", las: "le", unos: "dei / degli / alcuni", unas: "delle / alcune",
    de: "di / da", en: "in / a", por: "per", para: "per", y: "e", que: "che",
    es: "è", son: "sono", soy: "sono", eres: "sei", somos: "siamo", esta: "questa / è",
    tengo: "ho", tiene: "ha", tienes: "hai", tenemos: "abbiamo", tienen: "hanno",
    muy: "molto", tambien: "anche", siempre: "sempre", nunca: "mai", pero: "ma / però",
    porque: "perché", cuando: "quando", donde: "dove", hay: "c'è / ci sono",
    este: "questo", ese: "quello", esa: "quella", mas: "più", menos: "meno",
    bien: "bene", mal: "male", hola: "ciao", gracias: "grazie", adios: "arrivederci",
    yo: "io", ella: "lei", nosotros: "noi", ellos: "loro", ellas: "loro", usted: "Lei",
    mucho: "molto", mucha: "molta", muchos: "molti", muchas: "molte", todo: "tutto", todos: "tutti",
    algo: "qualcosa", aqui: "qui", ahi: "lì", alli: "là", hoy: "oggi", ayer: "ieri",
    manana: "domani", "mañana": "domani", ahora: "adesso / ora", despues: "dopo", antes: "prima",
    entonces: "allora", sobre: "su / sopra", sin: "senza", hasta: "fino a", desde: "da",
    tus: "i tuoi", sus: "i suoi", mis: "i miei", nuestro: "nostro", nuestra: "nostra",
    tarde: "tardi / pomeriggio / sera", noche: "notte / sera", hora: "ora", horas: "ore", cuarto: "quarto",
    minutos: "minuti", mediodia: "mezzogiorno", medianoche: "mezzanotte", semana: "settimana",
    dia: "giorno", dias: "giorni", mes: "mese", meses: "mesi", anos: "anni", "años": "anni",
    tener: "avere", ser: "essere", estar: "stare / essere", hacer: "fare", ir: "andare",
    querer: "volere", poder: "potere", decir: "dire", comer: "mangiare", vivir: "vivere / abitare"
  });
  function spanishWord(w) {
    var k = deaccent(String(w).toLowerCase());
    if (isItalian(w) || isItalian(k)) return null;
    return ES_FUNC[k] || ES_FUNC[w] || (DATA.esIt[k] ? DATA.esIt[k][0] : null) || (DATA.esIt[w] ? DATA.esIt[w][0] : null);
  }

  /* Una palabra que no está en ningún diccionario pero tiene pinta de
     castellano: ñ, tilde aguda, -s final (los, tienes, somos), -ción, -dad,
     un infinitivo en -ar / -ir.  El italiano no termina en -s (salvo bus,
     gas y préstamos) ni usa á í ó ú. */
  var IT_LOAN_S = /^(bus|gas|tris|bis|lapis|plus|virus|autobus|stress|jeans|mouse|business|fitness|bonus|campus|corpus|iris|ananas|atlas|iris|caos|ibis)$/;
  function looksSpanish(w) {
    var x = String(w).toLowerCase();
    if (!/^[a-zà-ÿñ']+$/.test(x) || isItalian(x) || isItalian(deaccent(x))) return false;
    if (/[áíóúñ]/.test(x) || /é./.test(x)) return true;
    if (x.length >= 3 && /[aeiouáéíóú]s$/.test(x) && !IT_LOAN_S.test(x)) return true;
    if (/(ción|sión|dad|tad)$/.test(x)) return true;
    if (x.length >= 4 && /[^aeiou][aeiou][ri]r$/.test(x) && !/er$/.test(x)) return true;
    if (x.length >= 4 && x.length <= 6 && /[^aeiou]er$/.test(x)) return true;
    if (x.length >= 5 && /[ae]n$/.test(x)) return true;   // tienen, esperen, hablan
    return false;
  }
  function spanishish(w) { return !!spanishWord(w) || looksSpanish(w); }

  /* Un ejercicio de hueco («___ casa», «Sto bene, ___. E tu?»): la respuesta
     se juzga dentro de su oración, así las reglas ven el sustantivo después
     del artículo, el sujeto antes del verbo, la hora después de «sono». */
  function expandGap(stem, given, targets) {
    if (!stem || !/_{3,}/.test(stem)) return null;
    var clean = String(stem).replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
    var pieces = clean.split(/_{3,}/);
    var nGaps = pieces.length - 1;
    for (var i = 0; i < nGaps; i++) {
      var before = pieces[i].slice(-1), after = pieces[i + 1].charAt(0);
      if ((before && /[a-zà-ù']/i.test(before)) || (after && /[a-zà-ù']/i.test(after))) return null;
    }
    var fill = function (parts) {
      if (!parts || parts.length !== nGaps) return null;
      var out = pieces[0];
      for (var k = 0; k < nGaps; k++) out += parts[k] + pieces[k + 1];
      return out.replace(/\s+/g, " ").trim();
    };
    var targetParts = targets.map(function (t) { return String(t).split(/\s*\|\s*/); });
    var gParts;
    if (nGaps === 1) gParts = [String(given).trim()];
    else {
      var gw = String(given).trim().split(/\s+/), tp = targetParts[0];
      if (gw.length === nGaps) gParts = gw;
      else if (tp && gw.length === tp.join(" ").trim().split(/\s+/).length) {
        gParts = []; var at = 0;
        tp.forEach(function (pp) { var n = pp.trim().split(/\s+/).length; gParts.push(gw.slice(at, at + n).join(" ")); at += n; });
      } else return null;
    }
    var g2 = fill(gParts);
    var t2 = targetParts.map(fill).filter(Boolean);
    if (!g2 || !t2.length) return null;
    return { given: g2, targets: t2 };
  }

  // The singular an exercise names («fantasma → ___», «___ (parco)»).
  function singularFromStem(stem) {
    var m = /([a-zà-ù']+)\s*→\s*_{3,}/i.exec(stem || "") || /\(([a-zà-ù']+)\)/i.exec(stem || "");
    return m ? m[1].toLowerCase() : null;
  }

  // Why this plural: the ending rule, in one line.
  function pluralExplain(s, e) {
    if (!s) return "Plural: " + it(e) + ".";
    var rule;
    if (s === e) rule = "no cambia en plural (" + (/[àèéìòù]$/.test(s) ? "termina en vocal acentuada" : /[^aeiou]$/.test(s) ? "termina en consonante" : "es invariable") + ")";
    else if (/[cg]a$/.test(s) && /(che|ghe)$/.test(e)) rule = "-ca / -ga hacen -che / -ghe para conservar el sonido duro";
    else if (/[cg]o$/.test(s) && /(chi|ghi)$/.test(e)) rule = "-co / -go hacen -chi / -ghi, con el sonido duro";
    else if (/[cg]o$/.test(s) && /(ci|gi)$/.test(e)) rule = "-co / -go suelen hacer -ci / -gi en las palabras esdrújulas (medico → medici, psicologo → psicologi); amico, nemico, greco y porco son excepciones llanas";
    else if (/[cg]ia$/.test(s) && /(ce|ge)$/.test(e)) rule = "-cia / -gia con i átona pierden la i después de consonante: -ce / -ge (arancia → arance, spiaggia → spiagge); después de vocal la conservan (camicia → camicie, valigia → valigie)";
    else if (/io$/.test(s) && e === s.slice(0, -2) + "i") rule = "-io con i átona hace una sola -i";
    else if (/a$/.test(s) && /e$/.test(e)) rule = "los sustantivos en -a hacen -e";
    else if (/a$/.test(s) && /i$/.test(e)) rule = "los masculinos en -a (problema, poeta, turista) hacen -i";
    else if (/o$/.test(s) && /i$/.test(e)) rule = "los sustantivos en -o hacen -i";
    else if (/e$/.test(s) && /i$/.test(e)) rule = "los sustantivos en -e hacen -i, masculinos y femeninos";
    else if (/o$/.test(s) && /a$/.test(e)) rule = "plural irregular en -a, femenino (uovo → uova, paio → paia, dito → dita)";
    else rule = "plural irregular, de memoria";
    return "Plural: " + it(s) + " → " + it(e) + ": " + rule + ".";
  }

  /* ------------------------------------------------ diagnosi di coppia */

  // Each rule returns null or {cat, slip, hint, explain}.  Order matters:
  // grammar that a form reveals beats "that looks Spanish" or "a typo".
  function pairRules(g, e, ctx) {
    var r, gs = deaccent(g), es = deaccent(e);

    // 1. Accento (anche e' per è: la tastiera senza tilde)
    if (/[aeiou]'$/.test(g) && /[àèéìòù]$/.test(e) && deaccent(g.slice(0, -1)) === es) return { cat: "accento", slip: true,
      hint: "La tilde no se reemplaza con apóstrofo.",
      explain: "Se escribe " + it(e) + ", con la tilde sobre la vocal (no " + it(g) + "). Tenés los botones à è é ì ò ù abajo del cuadro." };
    if (gs === es) {
      if (e === "è" && g === "e") return { cat: "accento", slip: false,
        hint: "Mirá la palabra marcada: ¿es el verbo o la conjunción?",
        explain: "*è* con tilde es el verbo (es/está); *e* sin tilde es «y»." };
      if (e === "e" && g === "è") return { cat: "accento", slip: false,
        hint: "Mirá la palabra marcada: ¿es el verbo o la conjunción?",
        explain: "Acá va *e* sin tilde: es la conjunción «y». *È* es el verbo." };
      if (/é$/.test(e) && /è$/.test(g)) return { cat: "accento", slip: true,
        hint: "Revisá hacia dónde va la tilde.",
        explain: "Tilde aguda: " + it(e) + ". *Perché, poiché, affinché, né, sé* llevan é cerrada." };
      if (/[àèéìòù]/.test(e) && !/[àèéìòù]/.test(g)) return { cat: "accento", slip: true,
        hint: "Te falta una tilde.",
        explain: "Falta la tilde: " + it(e) + ". En italiano la tilde marca la vocal final tónica (città, perché, parlerò, più)." };
      return { cat: "accento", slip: true, hint: "Revisá las tildes.",
        explain: "La tilde va así: " + it(e) + "." };
    }

    // 2. H di avere (o → ho, anno → hanno)
    if (AVERE.indexOf(e) >= 0 && /^h/.test(e) && g === e.slice(1)) return { cat: "ortografia", slip: false,
      hint: "Esa forma de *avere* se escribe distinto.",
      explain: "*ho, hai, ha, hanno* llevan h (que no suena). Sin h son otras palabras: *o* = o, *ai* = a los, *a* = a, *anno* = año." };

    // 3. Apostrofo («un'» / «un» ante vocal es el género, no la ortografía)
    if (/^un'?$/.test(g) && /^un'?$/.test(e) && g !== e && ctx.e[ctx.ei + 1]) {
      var nn = ctx.e[ctx.ei + 1];
      return { cat: "genere", slip: false,
        hint: "¿" + it(nn) + " es masculino o femenino? El apóstrofo lo dice.",
        explain: e === "un'" ? "*un'* con apóstrofo es el femenino ante vocal: *un'" + nn + "* (un'amica, un'ora). *Un* sin apóstrofo es masculino: un amico."
                             : "*un* sin apóstrofo es el masculino, también ante vocal: *un " + nn + "* (un amico, un uomo). *Un'* con apóstrofo es femenino: un'amica." };
    }
    if (g.replace(/'/g, "") === e.replace(/'/g, "")) return { cat: "ortografia", slip: true,
      hint: "Revisá el apóstrofo.",
      explain: e.indexOf("'") >= 0 ? "Acá va apóstrofo: " + it(e) + "."
        : "Sin apóstrofo: " + it(e) + ". *Qual è* y *un amico* no llevan: son truncamientos (*qual* y *un* existen también ante consonante: *qual buon vento*, *un libro*)." };

    // 4. Doppie
    if (degeminate(gs) === degeminate(es)) {
      var more = e.length > g.length;
      return { cat: "doppie", slip: false,
        hint: more ? "A la palabra marcada le falta una consonante doble."
                   : "La palabra marcada tiene una doble de más.",
        explain: (more ? "Consonante doble: " : "Una sola consonante: ") + it(e) +
          ". En italiano la doble se pronuncia más larga y cambia el significado (nono = noveno, nonno = abuelo)." };
    }

    // 5. Grafia spagnola (ñ, ll, que, j…)
    var graw = g.replace(/ñ/g, "\u0000");
    var spellings = DATA.spelling.concat([
      ["lli", "gli", "El sonido de la ll tradicional (no la rioplatense) se escribe gli: famiglia, figlio."],
      ["aqu", "acqu", "*Acqua*, sus derivados y algunas palabras más se escriben con cq: acqua, acquario, acquisto."],
      ["ge", "ghe", "Para el sonido /ge/ se escribe *ghe* (spaghetti, laghetto); *ge* suena /dʒe/."],
      ["gi", "ghi", "Para el sonido /gi/ se escribe *ghi* (laghi, ghiaccio); *gi* suena /dʒi/."],
      ["cie", "zie", "El sonido /ts/ se escribe con z: grazie, zio, piazza."],
      ["ci", "zi", "El sonido /ts/ se escribe con z: stazione, grazie."]]);
    // A plural written wrong (arancie → arance) is the plural rule, not spelling.
    var npE = DATA.nounsByPlural[e];
    if (npE && npE.s !== e) spellings = [];
    for (var k = 0; k < spellings.length; k++) {
      var sp = spellings[k];
      var src = sp[0] === "ñ" ? graw.replace(/\u0000/g, "ñ") : gs;
      var pat = sp[0] === "ñ" ? "ñ" : deaccent(sp[0]);
      if (src.indexOf(pat) >= 0) {
        var conv = deaccent(src.split(pat).join(deaccent(sp[1])));
        if (conv === es || degeminate(conv) === degeminate(es)) {
          return { cat: "ortografia", slip: false,
            hint: "La palabra marcada está escrita «a la española».",
            explain: it(e) + ": " + sp[2] };
        }
      }
    }

    // 6a. Un pronombre donde va un artículo (li arance → le arance)
    var HOURS = /^(una|due|tre|quattro|cinque|sei|sette|otto|nove|dieci|undici|dodici)$/;
    // 6b. Un artículo por otro delante de la hora (la sei → le sei)
    if (ARTICLES[g] && ARTICLES[e] && HOURS.test(ctx.e[ctx.ei + 1] || "")) return { cat: "articolo", slip: false,
      hint: "Con las horas el artículo va en plural, salvo la una.",
      explain: "Las horas llevan *le*: *le sei*, *le tre e mezza*, *alle otto*. Solo *l'una* va en singular." };
    if (ARTICLES[e] && !ARTICLES[g] && CLITICS.indexOf(g) >= 0) {
      var na = nounAfter(ctx);
      if (na && !ARTICLES[na] && !prepInfo(na) && CLITICS.indexOf(na) < 0 && !verbForms(na).length) return { cat: "articolo", slip: false,
        hint: it(g) + " es un pronombre; acá va un artículo.",
        explain: it(g) + " es un pronombre (li vedo = los veo). El artículo de " + it(na) + " es " + it(e) + ": " +
          it(e + (e.slice(-1) === "'" ? "" : " ") + na) + "." };
    }

    // 6. Pronomi (prima degli articoli: lo/la/le/gli sono anche pronomi)
    r = pronounRule(g, e, ctx);
    if (r) return r;

    // 7. Articoli
    if (ARTICLES[g] && ARTICLES[e]) return articleRule(g, e, ctx);
    if (ARTICLES[g] && prepInfo(e)) return { cat: "preposizione", slip: false,
      hint: "Acá hace falta una preposición, no un artículo.",
      explain: "Acá va la preposición " + it(e) + (prepInfo(e).art ? " (con el artículo incorporado)" : "") + "." };
    if (g === "che" && e === "cui") return { cat: "pronome", slip: false,
      hint: "Es un relativo que va después de una preposición.",
      explain: "Después de preposición el relativo es *cui*, no *che*: la ragazza di cui ti parlavo, il motivo per cui sono qui." };

    // 8. «a» personale nascosta in una preposizione articolata (ai bambini → i bambini)
    var pgA = prepInfo(g);
    if (pgA && pgA.base === "a" && pgA.art && ARTICLES[e] && pgA.art === e) return { cat: "a_personale", slip: false,
      hint: "Hay una preposición que en español va pero en italiano no.",
      explain: "El objeto directo de persona no lleva «a»: accompagno " + it(e) + " bambini, chiamo mia madre, conosco Giulia." };

    // 9. Preposizioni
    var pg = prepInfo(g), pe = prepInfo(e);
    if (pg && pe) return prepRule(g, e, pg, pe, ctx);

    // 10. Comparativi
    if ((g === "che" && e === "di") || (g === "di" && e === "che") || (g === "come" && e === "quanto")) {
      return { cat: "comparativo", slip: false,
        hint: "Es una comparación: ¿*di* o *che*?",
        explain: e === "di"
          ? "Más/menos … que + sustantivo o pronombre → *di*: più alto di Marco, meno caro di prima."
          : e === "che" ? "Si se comparan dos adjetivos, verbos, infinitivos o complementos con preposición → *che*: più bello che utile, meglio tardi che mai."
          : "Tan … como → *(così) … come* o *(tanto) … quanto*." };
    }

    // 11. Ausiliare
    if ((AVERE.indexOf(g) >= 0 && ESSERE.indexOf(e) >= 0) ||
        (ESSERE.indexOf(g) >= 0 && AVERE.indexOf(e) >= 0)) {
      var next = ctx.e[ctx.ei + 1];
      var lemma = next && participleOf(next);
      if (lemma || ctx.e.some(function (w) { return participleOf(w); })) {
        return auxRule(g, e, lemma || findParticipleLemma(ctx.e));
      }
    }

    // 12. bello / quello: cambiano come l'articolo
    if (BELLO[g] && BELLO[e] && BELLO[g] === BELLO[e]) return { cat: "accordo", slip: false,
      hint: "*" + BELLO[e] + "* delante del sustantivo cambia como el artículo.",
      explain: "*" + BELLO[e] + "* antes del sustantivo toma la forma del artículo: " +
        (BELLO[e] === "quello" ? "quel ragazzo (il), quello studente (lo), quell'amico (l'), quei libri (i), quegli amici (gli)."
                               : "bel ragazzo (il), bello zaino (lo), bell'uomo (l'), bei libri (i), begli occhi (gli).") +
        " Acá: " + it(e) + "." };

    // 12b. Un infinitivo reflexivo con el pronombre de otra persona
    //      (prepararsi → prepararci): el pronombre, no un tipeo.
    var rfG = /^(.+r)(mi|ti|si|ci|vi)$/.exec(g), rfE = /^(.+r)(mi|ti|si|ci|vi)$/.exec(e);
    if (rfG && rfE && rfG[1] === rfE[1] && g !== e) return { cat: "pronome", slip: false,
      hint: "El pronombre pegado al infinitivo tiene que ser el de la persona de la frase.",
      explain: "Con un verbo reflexivo el pronombre concuerda con el sujeto también en infinitivo: " + it(e) +
        " (devo prepararmi, dobbiamo prepararci, dovete prepararvi)." };

    // 12c. L'infinito al posto della forma coniugata (avere → abbiamo,
    // ritornare → ritornate): tipico di chi comincia, non è un refuso né
    // un falso amico.  L'infinito può venire dalla consegna «(ritornare)».
    var stemInf = /\(([a-zà-ù]+)\)/i.exec(ctx.stem || "");
    var infG = g !== e && !isInfinitive(e) && /(are|ere|ire|rre)$/.test(g) &&
      (isInfinitive(g) || (stemInf && stemInf[1].toLowerCase() === g));
    if (infG && (verbForms(e).some(function (x) { return x.lemma === g; }) ||
        (g.length - 3 >= 3 && e.slice(0, g.length - 3) === g.slice(0, -3) && !DATA.nouns[e] &&
         !DATA.nounsByPlural[e] && !DATA.adj[e] && !participleOf(e)))) {
      return { cat: "persona_verbale", slip: false,
        hint: "Escribiste el infinitivo: hay que conjugarlo para la persona de la frase.",
        explain: it(g) + " es el infinitivo; conjugado para esta persona queda " + it(e) + "." };
    }

    // 12d. Dos palabras italianas que se confunden (volta / tempo, largo / lungo)
    var lc = lexConfusion(g, e);
    if (lc) return { cat: "lessico", slip: false,
      hint: it(g) + " existe, pero acá va otra palabra parecida en el uso.",
      explain: lc + " Acá: " + it(e) + "." };

    // 13. Falsi amici
    var fa = DATA.falsi[g];
    if (fa && g !== e) return { cat: "falso_amico", slip: false,
      hint: it(g) + " existe en italiano, pero no significa lo que creés.",
      explain: it(g) + " en italiano significa «" + fa[0] + "». Acá va " + it(e) + "." +
        (fa[2] ? " " + fa[2] : "") };

    // 14. Parola spagnola che il dizionario fa corrispondere proprio a quella
    // attesa (tengo → ho, gusta → piace, quiero → voglio).
    var bigram = ctx.g && ctx.gi > 0 ? DATA.esIt[deaccent(ctx.g[ctx.gi - 1] + " " + g)] : null;
    var fwd = ctx.g && ctx.g[ctx.gi + 1] ? DATA.esIt[deaccent(g + " " + ctx.g[ctx.gi + 1])] : null;
    var direct = DATA.esIt[gs];
    var tr = [bigram, fwd, direct].filter(function (x) {
      return x && x[0].split(/\s*\/\s*/).some(function (w) {
        return w === e || w.split(" ").indexOf(e) >= 0;
      });
    })[0];
    if (tr && g !== e) return { cat: "parola_spagnola", slip: false,
      hint: it(g) + " suena a español. ¿Cómo se dice en italiano?",
      explain: it(g) + " viene del español; en italiano va " + it(e) + "." + (tr[1] ? " " + tr[1] : "") };

    // 14b. Un ejercicio de plural: la vocal final es el plural, no una
    //      persona del verbo ni un congiuntivo (paio → paia).
    if (ctx.nominal) {
      var sg = singularFromStem(ctx.stem) || (DATA.nounsByPlural[e] || {}).s;
      if (sg || /[aeio]$/.test(e)) return { cat: "plurale", slip: false,
        hint: "Revisá el plural de la palabra marcada.",
        explain: pluralExplain(sg, e) };
    }

    // 14c. Una palabra funcional del castellano (el, los, que, es, muy…):
    //      español dentro del italiano, no un tipeo.
    var spf = ES_FUNC[gs];
    if (spf && !isItalian(g) && !isItalian(gs)) return { cat: "parola_spagnola", slip: false,
      hint: it(g) + " es español. ¿Cómo se dice en italiano?",
      explain: it(g) + " es español; en italiano: " + it(spf) +
        (spf.split(" / ").indexOf(e) < 0 ? " (acá: " + it(e) + ")" : "") + "." };

    // 15. Verbi (persona, tempo, irregolari, piacere, verbo sbagliato)
    r = verbRule(g, e, ctx);
    if (r) return r;

    // 16. Plurale (parole straniere invariabili, plurali irregolari)
    if (g === e + "s" && /[^aeiouàèéìòù]$/.test(e)) return { cat: "plurale", slip: false,
      hint: "Las palabras extranjeras no cambian en plural.",
      explain: "Las palabras que terminan en consonante (casi siempre extranjeras) son invariables: i " + it(e) + ", i bar, i computer." };
    var inv = DATA.nouns[e];
    if (inv && inv.pl === inv.s && g !== e && g.slice(0, 3) === e.slice(0, 3) && !verbForms(g).length) {
      return { cat: "plurale", slip: false,
        hint: "Esa palabra no cambia en plural.",
        explain: it(e) + " es invariable: igual en singular y en plural (le foto, i cinema, le città, i bar)." +
          (inv.note ? " " + inv.note : "") };
    }
    var auxBefore = AVERE.concat(ESSERE).indexOf(ctx.e[ctx.ei - 1]) >= 0;
    var nounP = DATA.nounsByPlural[e];
    // Only a plural mistake if it looks like one: the singular left as it is,
    // or a regular plural where the real one is irregular.  A typo in *venti*
    // is not "the plural of vento".
    var looksPlural = nounP && (g === nounP.s || g === regularPlural(nounP.s, nounP.g) ||
      g === nounP.s.replace(/[oae]$/, "i") || g === nounP.s.replace(/[oae]$/, "e"));
    if (nounP && looksPlural && nounP.pl === e && nounP.s !== e && g !== e &&
        !(participleOf(e) && auxBefore)) {
      return { cat: "plurale", slip: false,
        hint: "Revisá el plural de la palabra marcada.",
        explain: "Plural: " + it(nounP.s) + " → " + it(e) + "." + (nounP.note ? " " + nounP.note : "") };
    }

    // 17. Refuso
    var dist = editDistance(gs, es);
    var endingOnly = g.slice(0, -1) === e.slice(0, -1) && /[oaie]$/.test(g) && /[oaie]$/.test(e);
    if (dist === 1 && es.length >= 4 && !endingOnly && !DATA.lex[g] && !verbForms(g).length &&
        !participleOf(g)) {
      return { cat: "refuso", slip: true,
        hint: "Hay un error de tipeo en la palabra marcada.",
        explain: "Error de tipeo: " + it(e) + "." };
    }

    // 18. Parola spagnola qualsiasi
    var sp2 = DATA.esIt[gs];
    if (sp2 && !isItalian(g)) return { cat: "parola_spagnola", slip: false,
      hint: it(g) + " es español. ¿Cómo se dice en italiano?",
      explain: it(g) + " es español; en italiano: " + it(sp2[0].split(" / ")[0]) +
        (e !== sp2[0] && sp2[0].split(" / ").indexOf(e) < 0 ? " (acá: " + it(e) + ")" : "") +
        "." + (sp2[1] ? " " + sp2[1] : "") };

    // 18a. Un nombre propio, un título o un lugar dicho en castellano
    //      (Isabel → Elisabetta, Londres → Londra).
    if (ctx.names && ctx.names.indexOf(e) >= 0 && !isItalian(g) && g !== e) return { cat: "lessico", slip: false,
      hint: "Ese nombre también se dice distinto en italiano.",
      explain: "En italiano: " + it(e.charAt(0).toUpperCase() + e.slice(1)) + ". Muchos nombres propios, títulos y lugares se traducen (Isabel → Elisabetta, Juan → Giovanni, Londres → Londra)." };

    // 18b. Una palabra que no está en ningún diccionario pero suena a
    // castellano (entiendo, tienes, señor).
    if (!isItalian(g) && looksSpanish(g)) return { cat: "parola_spagnola", slip: false,
      hint: it(g) + " parece español. ¿Cómo se dice en italiano?",
      explain: it(g) + " no es italiano. Acá va " + it(e) + (DATA.lex[e] ? " («" + DATA.lex[e] + "»)" : "") + "." };

    // 18c. Due parole diverse (nonna / nonno, casa / cassa): è lessico, non
    // concordanza, anche se cambia solo una lettera.
    if (DATA.nouns && DATA.nouns[g] && DATA.nouns[e] && g !== e && DATA.lex[g] && DATA.lex[e]) {
      return { cat: "lessico", slip: false,
        hint: it(g) + " es otra palabra. ¿Qué significa?",
        explain: it(g) + " significa «" + DATA.lex[g] + "»; " + it(e) + ", «" + DATA.lex[e] + "»." };
    }

    // 19. Accordo di genere e numero (cambia solo la vocale finale)
    if (endingOnly) {
      var pl = /[ie]$/.test(e) && /[oa]$/.test(g) ? "plural" :
               /[oa]$/.test(e) && /[ie]$/.test(g) ? "singular" : null;
      if (participleOf(e)) {
        var before = ctx.e.slice(Math.max(0, ctx.ei - 3), ctx.ei);
        if (ESSERE.indexOf(ctx.e[ctx.ei - 1]) >= 0) {
          return { cat: "participio_accordo", slip: false,
            hint: "Con *essere*, el participio concuerda con el sujeto. Revisá la terminación.",
            explain: "Con *essere* el participio concuerda en género y número con el sujeto: " +
              it(e) + " (Maria è andat*a*, i ragazzi sono andat*i*)." };
        }
        if (before.some(function (w) { return ["lo", "la", "li", "le", "l'", "ne"].indexOf(w) >= 0; })) {
          return { cat: "participio_accordo", slip: false,
            hint: "Mirá el pronombre que está antes del verbo: el participio concuerda con él.",
            explain: "Con *lo, la, li, le* (y *ne*) antes del auxiliar *avere*, el participio concuerda con el pronombre: le ho viste, l'ho scritta, ne ho mangiati due. Acá: " + it(e) + "." };
        }
      }
      var itG = isItalian(g);
      // An article with a wrong vowel (gle → gli, e → i): the article of the
      // noun, not "agreement".  The hint names the noun only if the learner
      // wrote the same one.
      if (ARTICLES[e] && !ARTICLES[g]) {
        var an = nounAfter(ctx);
        var anOk = an && /^[a-zà-ù']/.test(an) && !ARTICLES[an] && !prepInfo(an) && !verbForms(an).length;
        var same = anOk && ctx.g && ctx.g[ctx.gi + 1] === an;
        return { cat: "articolo", slip: false,
          hint: same ? "Revisá el artículo antes de " + it(an) + "." : "Revisá el artículo.",
          explain: (itG ? it(g) + " es otra palabra" + (DATA.lex[g] ? " («" + DATA.lex[g] + "»)" : "") + ". "
                        : it(g) + " no es una palabra italiana. ") +
            (anOk ? "El artículo de " + it(an) + " es " + it(e) + ": " + it(e + (e.slice(-1) === "'" ? "" : " ") + an) + "."
                  : "Acá va " + it(e) + ".") };
      }
      // A verb form with a wrong ending (mangie → mangia): the conjugation.
      var vfe = verbForms(e);
      if (!itG && vfe.length && !participleOf(e)) {
        var vf = vfe[0];
        return { cat: "persona_verbale", slip: false,
          hint: "Revisá la terminación del verbo.",
          explain: it(g) + " no existe; la forma es " + it(e) + " (" + it(vf.lemma) + ", " + PERS_ES[vf.p] + ", " + TENSE_ES[vf.tense] + ")." };
      }
      // The plural where the singular goes (reazioni → reazione) and a noun
      // that exists in no form (genti → gente): number or spelling, not agreement.
      var npG = DATA.nounsByPlural[g], nE = DATA.nouns[e] || DATA.nounsByPlural[e];
      if (npG && npG.s === e) return { cat: "plurale", slip: false,
        hint: "Acá va el singular.",
        explain: it(g) + " es el plural; acá va el singular " + it(e) + "." };
      if (!itG && nE) return { cat: "ortografia", slip: false,
        hint: "La palabra marcada no existe así.",
        explain: it(g) + " no existe; la palabra es " + it(e) + " («" + nE.es + "», " + (nE.g === "m" ? "masculino" : "femenino") +
          (DATA.nounsByPlural[e] && nE.s !== e ? " plural" : "") + ")." };
      var head = nounNear(ctx);
      var gn = head && (DATA.nouns[head] || DATA.nounsByPlural[head]);
      var desc = gn ? (gn.g === "m" ? "masculino" : "femenino") +
        (DATA.nounsByPlural[head] && gn.pl === head && gn.s !== head ? " plural" : " singular") : "";
      if (!head) { var ag2 = agreeGuess(ctx); if (ag2) { head = ag2.head; desc = ag2.desc; } }
      // A word that exists in no form (casu, stanchu) is spelling, not agreement.
      if (!itG && !head && !/[oaie]$/.test(g)) return { cat: "ortografia", slip: false,
        hint: "La palabra marcada no existe así.",
        explain: "Se escribe " + it(e) + "." };
      return { cat: "accordo", slip: false,
        hint: head ? "Revisá la concordancia de la palabra marcada: ¿con qué palabra concuerda?"
                   : "Revisá la terminación de la palabra marcada: la vocal final marca género y número.",
        explain: (head ? "Concordancia: " + it(e) + ", porque concuerda con " + it(head) + (desc ? " (" + desc + ")" : "") +
                         ". Artículos, posesivos, adjetivos y participios toman el género y el número del sustantivo."
                       : "La forma es " + it(e) + (pl ? ", en " + pl : "") + ": la vocal final marca el género y el número (-o / -a en singular, -i / -e en plural).") +
          (gn && gn.note ? " " + gn.note : "") };
    }

    // 20. Lessico: parola italiana vera ma sbagliata
    var lx = DATA.lex[g];
    var functionWord = ARTICLES[g] || prepInfo(g) || CLITICS.indexOf(g) >= 0 || SUBJECTS.indexOf(g) >= 0;
    if (lx && g !== e && !functionWord) return { cat: "lessico", slip: false,
      hint: it(g) + " es una palabra italiana, pero no es la que va acá.",
      explain: it(g) + " significa «" + lx + "». Acá va " + it(e) +
        (DATA.lex[e] ? " («" + DATA.lex[e] + "»)" : "") + "." };

    // 21. Refuso più largo
    if (dist <= (es.length > 7 ? 2 : 1)) return { cat: "refuso", slip: true,
      hint: "Hay un error de tipeo en la palabra marcada.",
      explain: "Error de tipeo: " + it(e) + "." };

    if (!isItalian(g)) return { cat: "lessico", slip: false,
      hint: "La palabra marcada no existe en italiano. ¿Cómo se dice?",
      explain: it(g) + " no es una palabra italiana. Acá va " + it(e) + (DATA.lex[e] ? " («" + DATA.lex[e] + "»)" : "") + "." };
    return { cat: "lessico", slip: false,
      hint: "La palabra marcada no es la que va.",
      explain: "Acá va " + it(e) + (DATA.lex[e] ? " («" + DATA.lex[e] + "»)" : "") + "." };
  }

  var BELLO = dict();
  ["bel", "bello", "bell'", "bella", "bei", "begli", "belle"].forEach(function (w) { BELLO[w] = "bello"; });
  ["quel", "quello", "quell'", "quella", "quei", "quegli", "quelle"].forEach(function (w) { BELLO[w] = "quello"; });

  var TONIC = ["me", "te", "lui", "lei", "noi", "voi", "loro", "sé", "io", "tu"];
  var ATONE = ["mi", "ti", "ci", "vi", "si", "lo", "la", "li", "le", "gli", "ne"];
  var COMBINED = ["me", "te", "ce", "ve", "se", "glielo", "gliela", "glieli", "gliele", "gliene"];
  var PREPS_ALL = ["a", "di", "da", "in", "con", "su", "per", "tra", "fra", "senza", "dopo", "prima", "secondo", "come", "tranne", "verso", "sopra", "sotto", "dietro"];

  function pronounRule(g, e, ctx) {
    var prev = ctx.e[ctx.ei - 1] || "", next = ctx.e[ctx.ei + 1] || "";
    var isP = function (w) { return TONIC.indexOf(w) >= 0 || ATONE.indexOf(w) >= 0 || COMBINED.indexOf(w) >= 0; };
    if (!isP(g) || !isP(e)) return null;
    // Articles vs pronouns: only a pronoun if a verb follows or no noun does
    if (ARTICLES[g] && ARTICLES[e]) {
      if (DATA.nouns[next] || DATA.nounsByPlural[next]) return null;
      if (/^[a-zà-ù']/.test(next) && !verbForms(next).length &&
          !AVERE.concat(ESSERE).some(function (x) { return x === next; })) return null;
      if (!/^[a-zà-ù']/.test(next) && /art[íi]culo|articolo/i.test(ctx.prompt || "") &&
          !/pronombre|pronome/i.test(ctx.prompt || "")) return null;
    }
    if (/^glie/.test(e)) return { cat: "pronome", slip: false,
      hint: "Son dos pronombres juntos: ¿cómo se combinan *gli/le* con *lo, la, ne*?",
      explain: "*gli* o *le* + *lo/la/li/le/ne* se funden en una palabra: " + it(e) +
        " (glielo dico = se lo digo). El «se» español no se traduce *se*." };
    if (["me", "te", "ce", "ve", "se"].indexOf(e) >= 0 && ["mi", "ti", "ci", "vi", "si"].indexOf(g) >= 0 &&
        ["lo", "la", "li", "le", "ne"].indexOf(next) >= 0) return { cat: "pronome", slip: false,
      hint: "Delante de *lo, la, li, le, ne* el primer pronombre cambia de vocal.",
      explain: "*mi, ti, ci, vi, si* se vuelven *me, te, ce, ve, se* delante de *lo, la, li, le, ne*: " +
        it(e + " " + next) + " (te lo spiego, me ne vado)." };
    if (TONIC.indexOf(e) >= 0 && PREPS_ALL.indexOf(prev) >= 0) return { cat: "pronome", slip: false,
      hint: "Después de una preposición va otra forma del pronombre.",
      explain: "Después de preposición van los pronombres tónicos: " + it(prev + " " + e) +
        " (per te, con me, senza di lui). *Mi, ti* (átonos) solo van junto al verbo." };
    if ((g === "le" && e === "gli") || (g === "gli" && e === "le")) return { cat: "pronome", slip: false,
      hint: "¿El pronombre se refiere a un hombre o a una mujer?",
      explain: "Objeto indirecto: *gli* = a él (y, en el uso corriente, también a ellos); *le* = a ella. Acá: " + it(e) + "." };
    if (ATONE.indexOf(e) >= 0 && ATONE.indexOf(g) >= 0) {
      var dir = ["lo", "la", "li", "le"], ind = ["gli", "le"];
      return { cat: "pronome", slip: false,
        hint: "Revisá el pronombre: ¿directo o indirecto, masculino o femenino, singular o plural?",
        explain: "Acá va " + it(e) + ". Directos: lo, la, li, le (lo vedo). Indirectos: gli (a él), le (a ella). " +
          "Verbos como *telefonare, rispondere, chiedere, dire* llevan indirecto: gli telefono." };
    }
    return { cat: "pronome", slip: false,
      hint: "Revisá el pronombre marcado.",
      explain: "Acá va " + it(e) + "." };
  }

  /* Two Italian words a Spanish speaker mixes up (not false friends: both
     exist and both are «right» somewhere).  Each entry: the forms of each
     word, separated by «|», and the difference in one line.  It only fires
     when the learner wrote one word and the other was expected. */
  var LEX_CONFUSIONS = [
    ["volta volte|tempo tempi|ora ore", "«Vez» es *volta* (la prima volta, tre volte); *tempo* es el tiempo (que pasa o que hace); *ora*, la hora."],
    ["lungo lunga lunghi lunghe|largo larga larghi larghe", "*largo* en italiano es ancho; «largo» es *lungo*."],
    ["ancora|già|sempre", "«Todavía» es *ancora* (y también «otra vez»); «ya» es *già*; *sempre* es siempre."],
    ["presto|subito|prima|pronto pronta pronti pronte", "*presto* = temprano o pronto (dentro de poco); *subito* = enseguida; *prima* = antes; *pronto* = listo (y «hola» al teléfono)."],
    ["buono buona buoni buone buon|bravo brava bravi brave|bene", "*buono* = bueno (de sabor o de carácter); *bravo* = hábil, bueno en lo que hace; *bene* = bien, el adverbio."],
    ["molto molta molti molte|troppo troppa troppi troppe", "*molto* = mucho, muy; *troppo* = demasiado."],
    ["colazione|pranzo|cena", "*colazione* = desayuno; *pranzo* = almuerzo; *cena* = cena."],
    ["negozio negozi|affare affari", "*negozio* = tienda; un «negocio» (un trato) es *affare*."],
    ["moglie mogli|sposa spose|donna donne", "*moglie* = esposa; *sposa* = la novia el día de la boda; *donna* = mujer."],
    ["marito mariti|sposo sposi|uomo uomini", "*marito* = esposo; *sposo* = el novio el día de la boda; *uomo* = hombre."],
    ["sera sere|notte notti|pomeriggio pomeriggi", "*pomeriggio* = la tarde (después de comer); *sera* = desde que oscurece hasta la hora de dormir; *notte* = la noche de dormir."],
    ["tardi|pomeriggio", "*tardi* = tarde (la hora: è tardi); «la tarde» es *il pomeriggio*."],
    ["mattina mattino|domani", "«Mañana» es *mattina* (la parte del día) o *domani* (el día siguiente)."],
    ["fa|da", "*fa* = hace, para lo terminado (due anni fa); *da* = desde hace, para lo que sigue (studio da due anni)."],
    ["chi|che cosa|quale quali qual", "*chi* = quién; *che* o *cosa* = qué; *quale* = cuál."],
    ["anche pure|neanche nemmeno neppure", "*anche* = también; «tampoco» (y «ni siquiera») es *neanche* o *nemmeno*."],
    ["niente nulla|nessuno nessuna nessun", "*niente* = nada; *nessuno* = nadie, ninguno."],
    ["qualcosa|qualcuno qualcuna|qualche", "*qualcosa* = algo; *qualcuno* = alguien; *qualche* = algún, algunos (siempre con singular: qualche giorno)."],
    ["ogni|tutti tutte tutto tutta", "*ogni* = cada, va con singular (ogni giorno); *tutti* va con plural y artículo (tutti i giorni)."],
    ["vecchio vecchia vecchi vecchie|anziano anziana anziani anziane", "*anziano* = mayor, para personas y con respeto; *vecchio* = viejo."],
    ["fino|fine", "*fino a* = hasta; *la fine* = el final."],
    ["tra fra|entro", "*tra* (o *fra*) = dentro de, en el futuro (tra due giorni); *entro* = antes de un plazo (entro venerdì)."],
    ["esperienza esperienze|esperimento esperimenti", "*esperienza* = experiencia; *esperimento* = experimento."],
    ["gente|persone persona", "*la gente* es singular (la gente è gentile); *le persone* es plural."],
    ["bambino bambina bambini bambine|ragazzo ragazza ragazzi ragazze|figlio figlia figli figlie", "*bambino* = niño; *ragazzo* = chico, joven (y novio); *figlio* = hijo."],
    ["nipote nipoti|cugino cugina cugini cugine", "*nipote* = nieto o sobrino; *cugino* = primo."],
    ["genitori|parenti", "*genitori* = padres (madre y padre); *parenti* = parientes."],
    ["mezzo mezza mezzi mezze mezz'|metà", "*mezzo* = medio (mezz'ora, mezzo litro); *metà* = la mitad (la metà della torta)."],
    ["giorno giorni|giornata giornate", "*giorno* = el día como fecha o unidad; *giornata* = el día vivido, con lo que pasó (una bella giornata)."],
    ["sera|serata", "*sera* = la noche como momento; *serata* = la velada, lo que se hizo esa noche."],
    ["ora adesso|allora", "«Ahora» es *ora* o *adesso*; *allora* = entonces."],
    ["conto conti|racconto racconti", "*conto* = la cuenta (del restaurante, del banco); «cuento» es *racconto*."],
    ["caro cara cari care|faccia facce viso", "*caro* = querido, o caro de precio; «la cara» es *la faccia* (o *il viso*)."],
    ["ufficio uffici|lavoro lavori", "*ufficio* = oficina; *lavoro* = trabajo."],
    ["compleanno compleanni|anniversario anniversari", "*compleanno* = cumpleaños; *anniversario* = aniversario (de un casamiento, de un hecho)."],
    ["piano piani|pavimento pavimenti", "*piano* = piso de un edificio (y despacio); el piso que se pisa es *pavimento*."],
    ["perché|perciò", "*perché* = porque, por qué; *perciò* = por eso."],
    ["cosa cose|causa cause", "*cosa* = cosa, qué; *causa* = causa."],
    ["salute|saluto saluti", "*salute* = salud; *saluto* = saludo."],
  ];
  var LEX_CONF = dict();
  LEX_CONFUSIONS.forEach(function (c, ci) {
    c[0].split("|").forEach(function (lemma, li) {
      lemma.split(" ").forEach(function (f) { (LEX_CONF[f] = LEX_CONF[f] || []).push([ci, li]); });
    });
  });
  function lexConfusion(g, e) {
    var a = LEX_CONF[g] || [], b = LEX_CONF[e] || [];
    for (var i = 0; i < a.length; i++) for (var j = 0; j < b.length; j++) {
      if (a[i][0] === b[j][0] && a[i][1] !== b[j][1]) return LEX_CONFUSIONS[a[i][0]][1];
    }
    return null;
  }

  // Verbs often confused by Spanish speakers: [lemma sbagliato, lemma giusto, spiegazione]
  var VERB_CONFUSIONS = [
    ["stare", "essere", "«Estar» no siempre es *stare*: ubicación y estados van con *essere* (sono a casa, è stanco). *Stare* es para *sto bene*, *sto per*, *sto + gerundio* y quedarse."],
    ["essere", "stare", "Acá va *stare*: salud (sto bene), acción en curso (sto mangiando), *stare per* y quedarse (sta' zitto)."],
    ["conoscere", "sapere", "*Sapere* = saber un dato o hacer algo (so che…, so nuotare); *conoscere* = conocer personas, lugares, cosas."],
    ["sapere", "conoscere", "*Conoscere* = conocer personas, lugares o cosas; *sapere* = saber un dato o saber hacer."],
    ["guardare", "vedere", "*Vedere* = ver (percibir); *guardare* = mirar con intención. Non vedo niente = no veo nada."],
    ["vedere", "guardare", "*Guardare* = mirar con intención (guardo la TV); *vedere* = ver."],
    ["ascoltare", "sentire", "*Sentire* = oír (y sentir); *ascoltare* = escuchar con atención. Non ti sento = no te escucho/oigo."],
    ["sentire", "ascoltare", "*Ascoltare* = escuchar con atención (ascolto musica); *sentire* = oír."],
    ["tenere", "avere", "«Tener» casi siempre es *avere*: ho fame, ho trent'anni, ho una macchina. *Tenere* es sostener o guardar."],
    ["prendere", "portare", "*Portare* = llevar/traer a algún lugar; *prendere* = agarrar, tomar."],
    ["portare", "prendere", "*Prendere* = tomar, agarrar (prendo il treno, prendo un caffè); *portare* = llevar."],
    ["salire", "uscire", "*Uscire* = salir; *salire* = subir."],
    ["uscire", "salire", "*Salire* = subir (salgo sul treno); *uscire* = salir."],
    ["fare", "rendere", "«Hacer + adjetivo» (hacer feliz) es *rendere*: mi rendi felice."],
    ["pensare", "credere", "*Credere* = creer; *pensare* = pensar."],
    ["sperare", "aspettare", "«Esperar» a alguien o algo es *aspettare* (aspetto il treno); *sperare* es tener esperanza (spero di sì)."],
    ["aspettare", "sperare", "*Sperare* = tener esperanza (spero che venga); *aspettare* = esperar a alguien."],
    ["fare", "stare", "Acá va *stare*."],
    ["imparare", "insegnare", "*Insegnare* = enseñar; *imparare* = aprender."],
    ["insegnare", "imparare", "*Imparare* = aprender; *insegnare* = enseñar."],
    ["andare", "venire", "*Venire* = venir hacia donde está quien habla o escucha (vengo da te); *andare* = ir a otro lugar."],
    ["venire", "andare", "*Andare* = ir a otro lugar; *venire* = venir hacia el que habla o acompañar (vieni con noi?)."]
  ];

  var SUBJ = { io: 0, tu: 1, lui: 2, lei: 2, "lui/lei": 2, noi: 3, voi: 4, loro: 5 };
  function subjectPerson(ctx) {
    var stem = String(ctx && ctx.stem || "").replace(/\(.*?\)/g, " ").toLowerCase();
    var m = /(^|[^a-zà-ù])(io|tu|lui\/lei|lui|lei|noi|voi|loro)(?=[^a-zà-ù]|$)/.exec(stem);
    return m ? SUBJ[m[2]] : null;
  }
  function formalContext(ctx) {
    var stem = String(ctx && ctx.stem || "");
    return /(^|[\s,(])Lei[\s,?]/.test(stem) || /\bsignor[ae]?\b/i.test(stem);
  }

  function verbRule(g, e, ctx) {
    var fe = verbForms(e), fg = verbForms(g);
    var prevE = ctx.e[ctx.ei - 1] || "", nextE = ctx.e[ctx.ei + 1] || "";
    var before = ctx.e.slice(0, ctx.ei).join(" ");
    // stanco/stanca are also «io stanco» (stancare): read them as the
    // adjective unless a subject pronoun or a clitic points to the verb.
    if (DATA.adj[e] && DATA.adj[e] === DATA.adj[g] &&
        !/^(io|tu|noi|voi|loro|mi|ti|ci|vi|si|lo|la|li|le|gli|ne)$/.test(prevE)) return null;
    // arrivati/arrivate after essere: agreement, not «voi arrivate».
    if (participleOf(e) && participleOf(e) === participleOf(g) && ESSERE.indexOf(prevE) >= 0 &&
        e.slice(0, -1) === g.slice(0, -1)) return null;
    // c'è / ci sono, ci vuole / ci vogliono
    if ((prevE === "ci" || prevE === "c'") && /^(è|sono|era|erano|sarà|saranno|vuole|vogliono|voleva|volevano)$/.test(e) &&
        !participleOf(nextE)) {
      return { cat: "ci_ne", slip: false,
        hint: "Mirá lo que viene después: ¿singular o plural?",
        explain: /vuol|vogl|vol/.test(e)
          ? "*Ci vuole* + singular, *ci vogliono* + plural: ci vuole un'ora, ci vogliono due ore."
          : "*C'è* + singular, *ci sono* + plural: c'è un problema, ci sono molti turisti." };
    }
    // Prefer the reading of an ambiguous form that fits the context:
    // congiuntivo after a trigger; same grammatical person otherwise.
    var trig = OPINION.some(function (w) { return (" " + before + " ").indexOf(" " + w + " ") >= 0; }) ||
               /\b(che|prima che|benché|sebbene|affinché|purché)\s*$/.test(before);
    if (trig) fe = fe.slice().sort(function (a, b) {
      return (/congiuntivo|congImperfetto/.test(b.tense) ? 1 : 0) - (/congiuntivo|congImperfetto/.test(a.tense) ? 1 : 0);
    });
    if (fg.length) fe = fe.slice().sort(function (a, b) {
      return ((b.p % 3 === fg[0].p % 3) ? 1 : 0) - ((a.p % 3 === fg[0].p % 3) ? 1 : 0);
    });
    var lemE = fe.length ? fe[0].lemma : participleOf(e);
    var lemG = fg.length ? fg[0].lemma : participleOf(g);

    // Simple form where a compound tense is needed (verrebbe → sarebbe venuto)
    var ppNext = participleOf(nextE);
    if ((ESSERE.indexOf(e) >= 0 || AVERE.indexOf(e) >= 0) && ppNext && fg.length &&
        ESSERE.indexOf(g) < 0 && AVERE.indexOf(g) < 0 &&
        fg.some(function (x) { return x.lemma === ppNext; })) {
      var t = fg.filter(function (x) { return x.lemma === ppNext; })[0].tense;
      return { cat: "tempo_verbale", slip: false,
        hint: "Acá hace falta un tiempo compuesto (auxiliar + participio).",
        explain: t === "condizionale"
          ? "Para lo que *habría* pasado (y no pasó) va el condicional compuesto: " + it(e + " " + nextE) + " (sarebbe venuto, avrei detto)."
          : t === "passatoRemoto"
          ? "Para hechos de hoy o de un pasado que sentís cercano, el italiano usa el passato prossimo: " + it(e + " " + nextE) + ". El passato remoto queda para lo lejano o narrado."
          : "Acá va un tiempo compuesto: " + it(e + " " + nextE) + "." };
    }
    if (lemE && /^(piacere|mancare|servire|bastare|interessare|dispiacere)$/.test(participleOf(nextE) || "") &&
        (ESSERE.indexOf(e) >= 0 || AVERE.indexOf(e) >= 0)) {
      lemE = participleOf(nextE);
      return { cat: "piacere", slip: false,
        hint: "Con *" + lemE + "* el verbo concuerda con lo que gustó, no con la persona.",
        explain: "*" + lemE + "* concuerda con lo que gusta, también en pasado: mi è piaciuto il film / mi sono piaciute le foto. Acá: " + it(e) + "." };
    }

    // piacere & co.: the thing liked is the subject
    if (lemE && /^(piacere|mancare|servire|bastare|interessare|dispiacere)$/.test(lemE) &&
        (lemG === lemE || /^(piaccio|piaci|piacciono|piace|manca|mancano|serve|servono|basta|bastano)$/.test(g))) {
      return { cat: "piacere", slip: false,
        hint: "Con *" + lemE + "* el sujeto es la cosa que gusta (o falta), no la persona.",
        explain: "*" + lemE + "* funciona como «gustar»: concuerda con lo que gusta. Mi piace il libro / mi piacciono i libri; " +
          "la persona va con *mi, ti, gli, le…*. Acá: " + it(e) + "." };
    }

    if (!fe.length) {
      // Participles
      var lem = participleOf(e);
      if (!lem && /(ato|uto|ito)$/.test(g) && /(tto|sto|rto|lto|nto|so|to)$/.test(e) &&
          deaccent(g).slice(0, 3) === deaccent(e).slice(0, 3) && !participleOf(g)) {
        return { cat: "irregolare", slip: false,
          hint: "Ese participio es irregular.",
          explain: "Participio irregular: " + it(e) + ", no *" + g + "*. Muchos verbos en -ere lo tienen (preso, messo, scritto, risolto, chiuso)." };
      }
      if (lem && Conj) {
        var reg = Conj.regular(lem, "participio"), real = Conj.participle(lem);
        var looksRegular = /(ato|uto|ito)$/.test(g) && deaccent(g).slice(0, 2) === deaccent(lem).slice(0, 2);
        if (reg !== real && (looksRegular || degeminate(g.slice(0, -1)) === degeminate(reg.slice(0, -1)))) {
          return { cat: "irregolare", slip: false,
            hint: "El participio de " + it(lem) + " es irregular.",
            explain: "Participio irregular: " + it(lem) + " → " + it(real) + ", no *" + g + "*." };
        }
      }
      return null;
    }
    // Same lemma
    for (var i = 0; i < fe.length; i++) {
      for (var j = 0; j < fg.length; j++) {
        var a = fe[i], b = fg[j];
        if (a.lemma !== b.lemma) continue;
        if (a.tense === b.tense && a.p !== b.p) {
          // The hour: «sono le tre», «è l'una» (plural for every hour but one)
          var nx = ctx.e[ctx.ei + 1] || "", nx2 = ctx.e[ctx.ei + 2] || "";
          if ((e === "sono" || e === "è") && (
                (nx === "le" && /^(due|tre|quattro|cinque|sei|sette|otto|nove|dieci|undici|dodici)$/.test(nx2)) ||
                /^(l'una|mezzogiorno|mezzanotte)$/.test(nx) || (nx === "l'" && nx2 === "una"))) {
            return { cat: "persona_verbale", slip: false,
              hint: "¿Qué hora es? Las horas van en plural, salvo la una, mediodía y medianoche.",
              explain: "Las horas: *sono le tre*, *sono le nove e mezza* (plural); *è l'una*, *è mezzogiorno*, *è mezzanotte* (singular)." };
          }
          // «sono» is io and loro: the subject in the sentence decides which
          // one to name («el sujeto acá es loro», not «io»).
          var subj = subjectPerson(ctx);
          if (subj != null && subj !== a.p) {
            var alt = fe.filter(function (x) { return x.lemma === a.lemma && x.tense === a.tense && x.p === subj; })[0];
            if (alt) a = alt;
          }
          // The courtesy form only when the sentence addresses someone as
          // «Lei» / «signora»; a plain lui/lei drill is not «usted».
          var formal = (b.p === 1 && a.p === 2) && formalContext(ctx);
          return { cat: "persona_verbale", slip: false,
            hint: formal ? "¿Tuteás o hablás de usted? Mirá a quién se dirige la frase."
                         : "El verbo está bien elegido, pero no en la persona correcta. ¿Quién es el sujeto?",
            explain: formal
              ? "Con *Lei* (usted) el verbo va en tercera persona: " + it(e) + ". *Signora, come sta?*"
              : it(g) + " es la forma de *" + PERS_ES[b.p] + "*; el sujeto acá es *" + PERS_ES[a.p] + "*: " + it(e) + "." +
                (a.p === 4 && b.p === 5 ? " Ojo: el «ustedes» rioplatense es *voi* en italiano (voi andate)." : "") };
        }
        if (a.p === b.p && a.tense !== b.tense) return tenseRule(g, e, a, b, ctx);
      }
    }
    if (Conj) {
      // Over-regularisation of an irregular verb
      for (var k = 0; k < fe.length; k++) {
        var f = fe[k];
        try {
          var regf = Conj.regular(f.lemma, f.tense)[f.p];
          if (regf && regf.split(" ").pop() === g && regf.split(" ").pop() !== e) {
            var v = Conj.info(f.lemma);
            var stemNote = (f.tense === "futuro" || f.tense === "condizionale")
              ? " En futuro y condicional muchos verbos contraen la raíz: andr-, avr-, potr-, dovr-, vorr-, verr-, sar-." : "";
            return { cat: "irregolare", slip: false,
              hint: "Ese verbo no es regular en este tiempo.",
              explain: v.isc
                ? it(f.lemma) + " es de los verbos en *-isc-*: " + it(e) + " (finisco, capisci, preferiscono)."
                : it(f.lemma) + " es irregular: " + it(e) + ", no *" + g + "*." + stemNote };
          }
        } catch (err) { /* */ }
      }
      // Regularised future/conditional stem not in the table (anderei, poterò)
      if (!fg.length && (/rei$|resti$|rebbe$|remmo$|reste$|rebbero$|rò$|rai$|rà$|remo$|rete$|ranno$/).test(g) &&
          (fe[0].tense === "futuro" || fe[0].tense === "condizionale")) {
        return { cat: "irregolare", slip: false,
          hint: "Revisá la raíz del verbo en " + (fe[0].tense === "futuro" ? "futuro" : "condicional") + ".",
          explain: it(fe[0].lemma) + " contrae la raíz en futuro y condicional: " + it(e) +
            ". Igual: andare → andr-, avere → avr-, potere → potr-, volere → vorr-, venire → verr-, essere → sar-." };
      }
      // -isc- verbs written without -isc-
      for (var q = 0; q < fe.length; q++) {
        var inf = Conj.info(fe[q].lemma);
        if (inf.isc && /isc/.test(e) && !/isc/.test(g) &&
            deaccent(g).slice(0, 3) === deaccent(e).slice(0, 3)) {
          return { cat: "irregolare", slip: false,
            hint: "Ese verbo pertenece a un grupo especial de -ire.",
            explain: it(fe[q].lemma) + " es de los verbos en *-isc-*: " + it(e) +
              " (finisco, capisci, preferiscono; pero finiamo, finite)." };
        }
      }
      // -care/-gare without h
      var eh = e.replace(/([cg])h([ie])/, "$1$2");
      if (eh !== e && eh === g) return { cat: "ortografia", slip: false,
        hint: "Mirá cómo suena la c/g de la palabra marcada.",
        explain: "Para conservar el sonido duro, los verbos en *-care/-gare* agregan *h* antes de i/e: " + it(e) + " (cerchi, paghiamo)." };
    }
    // Different verbs: the classic Spanish-speaker confusions
    if (lemG && lemE && lemG !== lemE) {
      for (var c = 0; c < VERB_CONFUSIONS.length; c++) {
        var vc = VERB_CONFUSIONS[c];
        if (vc[0] === lemG && vc[1] === lemE) return { cat: "lessico", slip: false,
          hint: "Ese verbo no es el que corresponde acá. Pensá en qué significa exactamente.",
          explain: vc[2] + " Acá: " + it(e) + "." };
      }
      return { cat: "lessico", slip: false,
        hint: "Ese verbo no es el que va.",
        explain: it(g) + " es de *" + lemG + "*" + (DATA.lex[lemG] ? " («" + DATA.lex[lemG] + "»)" : "") +
          "; acá va " + it(e) + ", de *" + lemE + "*" + (DATA.lex[lemE] ? " («" + DATA.lex[lemE] + "»)" : "") + "." };
    }
    if (fg.length && fe.length) {
      return { cat: "tempo_verbale", slip: false,
        hint: "Revisá el verbo marcado: forma y tiempo.",
        explain: "Acá va " + it(e) + " (" + TENSE_ES[fe[0].tense] + " de " + it(fe[0].lemma) + ")." };
    }
    return null;
  }

  function isItalian(w) {
    return !!(DATA.lex[w] || ARTICLES[w] || prepInfo(w) || verbForms(w).length ||
              participleOf(w) || CLITICS.indexOf(w) >= 0 || SUBJECTS.indexOf(w) >= 0 ||
              AVERE.indexOf(w) >= 0 || ESSERE.indexOf(w) >= 0);
  }

  function regularPlural(s, g) {
    if (/[àèéìòù]$/.test(s) || /[^aeiou]$/.test(s)) return s;
    if (/a$/.test(s)) return g === "m" ? s.slice(0, -1) + "i" : s.slice(0, -1) + "e";
    return s.slice(0, -1) + "i";
  }

  function findParticipleLemma(toks) {
    for (var i = 0; i < toks.length; i++) {
      var l = participleOf(toks[i]);
      if (l) return l;
    }
    return null;
  }

  // The noun an adjective or possessive agrees with: the nearest known noun.
  function nounNear(ctx) {
    var cands = [ctx.e[ctx.ei + 1], ctx.e[ctx.ei - 1], ctx.e[ctx.ei + 2], ctx.e[ctx.ei - 2]];
    for (var i = 0; i < cands.length; i++) {
      var w = cands[i];
      if (w && (DATA.nouns[w] || DATA.nounsByPlural[w])) return w;
    }
    return null;
  }

  function nounAfter(ctx) {
    return ctx.e[ctx.ei + 1] || "";
  }

  // No known noun nearby: the article in front says what the adjective agrees
  // with («i ___ cugini» → cugini, masculino plural).
  function agreeGuess(ctx) {
    var e = ctx.e, i = ctx.ei;
    var wordish = function (w) {
      return !!w && /^[a-zà-ù]/.test(w) && !ARTICLES[w] && !prepInfo(w) && CLITICS.indexOf(w) < 0 &&
        SUBJECTS.indexOf(w) < 0 && !verbForms(w).length && AVERE.indexOf(w) < 0 && ESSERE.indexOf(w) < 0 && w !== "non";
    };
    for (var k = 1; k <= 2; k++) {
      var a = e[i - k];
      var art = a && (ARTICLES[a] ? a : (prepInfo(a) && prepInfo(a).art));
      var info = art && ARTICLES[art];
      if (!info) continue;
      var noun = wordish(e[i + 1]) ? e[i + 1] : (k === 2 && wordish(e[i - 1]) ? e[i - 1] : null);
      if (!noun) continue;
      var desc = (info[0] === "m" ? "masculino" : info[0] === "f" ? "femenino" : "") + (info[1] === "p" ? " plural" : " singular");
      return { head: noun, desc: desc.trim() };
    }
    return null;
  }

  function soundRule(noun) {
    if (/^(s[bcdfghklmnpqrstvz]|z|gn|ps|pn|x|y)/.test(noun)) return "sz";
    if (/^[aeiouàèéìòùh]/.test(noun)) return "v";
    return "c";
  }

  function articleRule(g, e, ctx) {
    var noun = nounAfter(ctx), ag = ARTICLES[g], ae = ARTICLES[e];
    // The hint may only name the learner's own word: naming the expected noun
    // would give the answer away when the noun itself was wrong (la mesa →
    // il tavolo, i bracci → le braccia).
    var gNoun = ctx.g && ctx.gi >= 0 ? ctx.g[ctx.gi + 1] : noun;
    var shown = gNoun === noun ? noun : null;
    var r = articleRuleInner(g, e, ctx, noun, ag, ae);
    if (!shown) {
      r.hint = r.cat === "genere" ? "Revisá el artículo y la palabra que lo sigue: ¿son del mismo género?"
             : "Revisá el artículo y la palabra que lo sigue.";
    }
    return r;
  }

  function articleRuleInner(g, e, ctx, noun, ag, ae) {
    if (!noun || !/^[a-zà-ù']/.test(noun)) {
      var gg = ag[0] !== "?" && ae[0] !== "?" && ag[0] !== ae[0];
      return { cat: gg ? "genere" : "articolo", slip: false,
        hint: gg ? "Revisá el género." : "Revisá el artículo.",
        explain: "Acá va " + it(e) + (gg ? " (" + (ae[0] === "m" ? "masculino" : "femenino") + "), no " + it(g) : "") + "." };
    }
    var info = DATA.nouns[noun] || DATA.nounsByPlural[noun];
    var sound = soundRule(noun);
    // Gender
    if (ag[0] !== "?" && ae[0] !== "?" && ag[0] !== ae[0]) {
      var gen = ae[0] === "m" ? "masculino" : "femenino";
      return { cat: "genere", slip: false,
        hint: "Revisá el género de " + it(noun) + ".",
        explain: it(noun) + " es " + gen + " en italiano: " + it(e + (e.slice(-1) === "'" ? "" : " ") + noun) + "." +
          (info && info.note ? " " + info.note : "") };
    }
    var withNoun = it(e + (e.slice(-1) === "'" ? "" : " ") + noun);
    if (ag[1] !== ae[1]) return { cat: "accordo", slip: false,
      hint: "Revisá el número: ¿singular o plural?",
      explain: it(noun) + " está en " + (ae[1] === "p" ? "plural" : "singular") + ": " + withNoun + "." +
        (ae[1] === "p" && DATA.nounsByPlural[noun] && DATA.nounsByPlural[noun].s !== noun ? " (singular: " + it(DATA.nounsByPlural[noun].s) + ")"
         : ae[1] === "p" && DATA.nounsByPlural[noun] ? " (" + it(noun) + " no cambia en plural: solo el artículo lo marca)" : "") };
    if (ag[2] !== ae[2]) return { cat: "articolo", slip: false,
      hint: "¿Artículo determinado o indeterminado?",
      explain: "Acá va " + (ae[2] === "det" ? "el artículo determinado" : "el indeterminado") + ": " + withNoun + "." };
    // Same gender/number/type: the sound decides
    if (sound === "sz") return { cat: "articolo", slip: false,
      hint: "Mirá con qué sonido empieza " + it(noun) + ".",
      explain: "Delante de s + consonante, z, gn, ps, x e y va *lo / gli / uno*: " +
        it(e + " " + noun) + " (lo zaino, gli studenti, uno psicologo)." };
    if (sound === "v") return { cat: "articolo", slip: false,
      hint: "Mirá con qué letra empieza " + it(noun) + ".",
      explain: "Delante de vocal: *l'* en singular y *gli* en plural masculino; *un* (sin apóstrofo) para masculinos y *un'* para femeninos: " +
        it(e + (e.slice(-1) === "'" ? "" : " ") + noun) + "." };
    return { cat: "articolo", slip: false,
      hint: "Revisá el artículo antes de " + it(noun) + ".",
      explain: "Delante de consonante normal va *il / i / un* (masculino): " + it(e + " " + noun) + "." };
  }

  var PLACE_IN = ["italia", "argentina", "spagna", "francia", "germania", "sicilia", "toscana",
                  "ufficio", "banca", "centro", "città", "campagna", "montagna", "macchina",
                  "treno", "aereo", "biblioteca", "piscina", "palestra", "cucina", "bagno",
                  "giardino", "piazza", "farmacia", "vacanza", "europa", "america", "chiesa"];

  function prepRule(g, e, pg, pe, ctx) {
    var next = nounAfter(ctx), prev = ctx.e[ctx.ei - 1] || "";
    if (pg.base === pe.base) {
      // Same preposition, wrong article inside it
      if (pe.art && pg.art) {
        var fake = { e: [pe.art, next], ei: 0, g: [pg.art, ctx.g ? ctx.g[ctx.gi + 1] : next], gi: 0 };
        var ar = articleRule(pg.art, pe.art, fake);
        ar.cat = "preposizione_articolata";
        ar.explain = it(e) + " = *" + pe.base + " + " + pe.art + "*. " + ar.explain;
        return ar;
      }
      return { cat: "preposizione_articolata", slip: false,
        hint: pe.art ? "Acá la preposición va unida al artículo." : "Acá la preposición va sola, sin artículo.",
        explain: pe.art ? it(e) + " = *" + pe.base + " + " + pe.art + "*: en italiano la preposición se une al artículo."
                        : "Acá va " + it(e) + " sin artículo." };
    }
    var why;
    if (pe.base === "da" && (/^(\d+|un|una|due|tre|quattro|cinque|sei|dieci|molto|tanto|poco|anni|mesi|giorni|ore|settimane|tempo|sempre|quando)$/.test(next) || /anni|mesi|tempo/.test(ctx.e.slice(ctx.ei).join(" ")))) {
      why = "Duración de algo que todavía sigue: *da* + tiempo (studio italiano da due anni = hace dos años que estudio).";
    } else if (pe.base === "da" && (FAMILY.indexOf(next) >= 0 || /^(medico|dentista|parrucchiere|avvocato|meccanico|nonna|nonno|amico|amica|me|te|lui|lei|noi|voi|loro|marco|giulia|maria|martín)$/.test(next) || (pe.art && /^(medico|dentista|parrucchiere)$/.test(next)))) {
      why = "Para ir o estar «en lo de» alguien se usa *da*: vado dal medico, sono da Giulia.";
    } else if (pe.base === "da" && /^(parte|lontano|qui|lì)$/.test(prev + next)) {
      why = "Origen o punto de partida: *da* (parto da Roma, lontano da qui).";
    } else if (pe.base === "a" && pg.base === "in" && /^[a-zàèìòù]+$/.test(next) && PLACE_IN.indexOf(next) < 0 && !pe.art) {
      why = "Con ciudades va *a*: a Roma, a Buenos Aires. Con países y regiones, *in*: in Italia.";
    } else if (pe.base === "in" && (PLACE_IN.indexOf(next) >= 0 || !pe.art)) {
      why = "Con países, regiones y muchos lugares cerrados o medios de transporte va *in*: in Italia, in ufficio, in macchina, in treno.";
    } else if (pe.base === "di" && pg.base === "da") {
      why = "Origen de una persona: *di* (sono di Buenos Aires); *da* indica procedencia en un movimiento (vengo da Roma).";
    } else if ((pe.base === "tra" || pe.base === "fra") && /^(un|una|due|tre|poco|qualche|\d+)$/.test(next)) {
      why = "«Dentro de» + tiempo es *tra / fra*: fra due ore, tra un mese.";
    } else if (pe.base === "a" && /^(cominciare|iniziare|imparare|provare|aiutare|continuare|andare|venire|riuscire)/.test(prev)) {
      why = "Hay verbos que piden *a* antes del infinitivo: comincio a studiare, riesco a capire.";
    } else if (pe.base === "di" && /^(finire|smettere|cercare|decidere|sperare|credere|pensare|dimenticare|ricordarsi|temere|provare|evitare)/.test(prev)) {
      why = "Muchos verbos piden *di* antes del infinitivo: smetto di fumare, cerco di capire, ho deciso di partire.";
    } else if (pe.base === "per") {
      why = "Finalidad, destino o duración cerrada: *per* (studio per l'esame, parto per Roma, per due ore).";
    } else if (pe.base === "su") {
      why = "«Sobre / en» una superficie o un tema: *su* (sul tavolo, un libro su Dante).";
    } else {
      why = "El italiano usa acá " + it(e) + ", no " + it(g) + ". Las preposiciones no se traducen una a una desde el español: conviene aprenderlas con su verbo o su expresión.";
    }
    return { cat: "preposizione", slip: false,
      hint: "Revisá la preposición marcada: el español te está tirando para otro lado.",
      explain: why };
  }

  function auxRule(g, e, lemma) {
    var needsEssere = ESSERE.indexOf(e) >= 0;
    var refl = lemma && /rsi$/.test(lemma);
    var why = needsEssere
      ? (refl ? "Los verbos reflexivos forman el pasado con *essere*: mi sono alzato."
              : (lemma ? it(lemma) + " forma los tiempos compuestos con *essere*. " : "") +
                "Van con *essere* los verbos de movimiento hacia un lugar o de cambio de estado (andare, venire, partire, arrivare, uscire, tornare, diventare, nascere, morire), *essere, stare, rimanere, piacere* y los reflexivos. Y el participio concuerda: sono andato/a.")
      : (lemma ? it(lemma) + " forma los tiempos compuestos con *avere*. " : "") +
        "La mayoría de los verbos, y todos los que tienen objeto directo, usan *avere*: ho mangiato, ho visto, ho camminato.";
    return { cat: "ausiliare", slip: false,
      hint: "Revisá el auxiliar" + (lemma ? " de " + it(lemma) : "") + ": ¿*essere* o *avere*?",
      explain: why };
  }

  function tenseRule(g, e, a, b, ctx) {
    var before = ctx.e.slice(0, ctx.ei).join(" ");
    var trigger = OPINION.filter(function (w) { return (" " + before + " ").indexOf(" " + w + " ") >= 0; })[0];
    if (a.tense === "congiuntivo" || a.tense === "congImperfetto") {
      if (/\bse\b/.test(before) && a.tense === "congImperfetto") {
        return { cat: "periodo_ipotetico", slip: false,
          hint: "Es una condición con *se* sobre algo irreal: ¿qué modo va?",
          explain: "Condición irreal: *se* + congiuntivo imperfetto (" + it(e) + "), y en la otra parte el condizionale: se avessi tempo, verrei." };
      }
      return { cat: "congiuntivo", slip: false,
        hint: (trigger ? "Mirá lo que viene antes: " + it(trigger) + ". " : "") + "¿Qué modo pide?",
        explain: (trigger ? "Después de " + it(trigger) + " va congiuntivo" : "Acá va congiuntivo") +
          ": " + it(e) + ", no " + it(g) + ". Opinión, deseo, duda o emoción → congiuntivo; certeza → indicativo." };
    }
    if (a.tense === "condizionale" && b.tense === "futuro") return { cat: "condizionale", slip: false,
      hint: "¿Futuro o condicional?",
      explain: "Condicional (-rei, -resti, -rebbe): " + it(e) + ". El futuro sería " + it(g) + "." };
    if (a.tense === "condizionale" && b.tense === "congImperfetto") return { cat: "periodo_ipotetico", slip: false,
      hint: "Esta es la consecuencia, no la condición.",
      explain: "En la consecuencia va el condizionale (" + it(e) + "); el congiuntivo imperfetto va después de *se*." };
    if (a.tense === "imperfetto" && b.tense === "passatoRemoto") return { cat: "tempo_verbale", slip: false,
      hint: "¿Acción puntual o descripción/hábito del pasado?",
      explain: "Para describir o contar lo habitual en el pasado va imperfetto: " + it(e) + "." };
    if (a.tense === "presente" && b.tense === "congiuntivo") return { cat: "congiuntivo", slip: false,
      hint: "¿Hace falta el congiuntivo acá?",
      explain: "Acá el hablante afirma un hecho: va indicativo, " + it(e) + ". El congiuntivo va con opinión, deseo o duda." };
    return { cat: "tempo_verbale", slip: false,
      hint: "El verbo es el correcto, pero no el tiempo. Mirá las pistas temporales de la frase.",
      explain: it(g) + " es " + TENSE_ES[b.tense] + "; acá va " + TENSE_ES[a.tense] + ": " + it(e) + "." };
  }

  /* ----------------------------------------------- parole mancanti / in più */

  function missRule(w, ctx) {
    var next = ctx.e[ctx.ei + 1] || "", prev = ctx.e[ctx.ei - 1] || "";
    if (ARTICLES[w]) {
      if (POSSESSIVE.indexOf(next) >= 0) return { cat: "articolo_possessivo", slip: false,
        hint: "Falta una palabra antes del posesivo.",
        explain: "Con posesivos el italiano usa artículo: " + it(w + " " + next + " " + (ctx.e[ctx.ei + 2] || "")) +
          ". Solo se omite con familiares en singular: mia madre, tuo fratello." };
      if (ctx.names.indexOf(next) >= 0) return { cat: "articolo", slip: false,
        hint: "Falta el artículo: ¿es un país, una región o una ciudad?",
        explain: "Falta " + it(w) + ": los países, las regiones y los continentes llevan artículo (" + it(w + (w.slice(-1) === "'" ? "" : " ") + next.charAt(0).toUpperCase() + next.slice(1)) +
          ", la Toscana, l'Europa). Las ciudades no: Roma è bella, vado a Roma." };
      return { cat: "articolo", slip: false,
        hint: "Falta el artículo.",
        explain: "Falta " + it(w) + ": en italiano el sustantivo casi siempre lleva artículo, incluso donde el español lo omite (*la* mia casa = mi casa, *nel* 2020 = en 2020, *l'*Italia = Italia)." };
    }
    if (prepInfo(w)) return { cat: "preposizione", slip: false,
      hint: "Falta una preposición.",
      explain: "Falta " + it(w) + (prev ? " después de " + it(prev) : "") + "." };
    if (w === "ne") return { cat: "ci_ne", slip: false,
      hint: "Falta un pronombre chiquito que reemplaza una cantidad o «de eso».",
      explain: "Falta *ne*: reemplaza «de eso / de ellos» y se usa con cantidades: *ne* ho due, *ne* parliamo dopo." };
    if (w === "ci" && /^(sono|è|vuole|vogliono|vado|vai|va|andiamo|penso|pensi|metto)/.test(next)) return { cat: "ci_ne", slip: false,
      hint: "Falta *ci*.",
      explain: "Falta *ci*: *c'è / ci sono* = hay; *ci vuole* = hace falta; *ci vado* = voy (ahí)." };
    if (CLITICS.indexOf(w) >= 0) return { cat: "pronome", slip: false,
      hint: "Falta un pronombre.",
      explain: "Falta el pronombre " + it(w) + (verbForms(next).length ? ", que va antes del verbo " + it(next) : "") + "." };
    if (AVERE.indexOf(w) >= 0 || ESSERE.indexOf(w) >= 0) return { cat: "ausiliare", slip: false,
      hint: "Falta el auxiliar.",
      explain: "Los tiempos compuestos llevan auxiliar + participio: " + it(w + " " + next) + "." };
    if (w === "non") return { cat: "lessico", slip: false, hint: "Falta la negación.",
      explain: "Falta *non* delante del verbo." };
    return { cat: "parola_mancante", slip: false,
      hint: "Te falta una palabra" + (prev ? " después de " + it(prev) : "") + ".",
      explain: "Falta " + it(w) + (prev ? " después de " + it(prev) : "") + "." };
  }

  function extraRule(w, gtoks, gi, ctx) {
    var next = gtoks[gi + 1] || "", next2 = gtoks[gi + 2] || "";
    if (w === "a" && next && !prepInfo(next) && !verbForms(next).length) {
      var person = /^[a-zàèìòù]+$/.test(next) && (FAMILY.indexOf(next) >= 0 || POSSESSIVE.indexOf(next) >= 0 ||
        /^(mio|mia|tuo|tua|suo|sua|lui|lei|te|me|nostro|nostra|quel|quella|questo|questa|il|la|gli|i|le)$/.test(next) ||
        ctx.names.indexOf(next) >= 0);
      if (person) return { cat: "a_personale", slip: false,
        hint: "Sobra una palabra que en español sí se pone.",
        explain: "En italiano el objeto directo de persona no lleva «a»: conosco Giulia, ho visto mia madre, aspetto Marco." };
    }
    if (ARTICLES[w] && POSSESSIVE.indexOf(next) >= 0 && FAMILY.indexOf(next2) >= 0) return { cat: "articolo_possessivo", slip: false,
      hint: "Con este posesivo sobra algo.",
      explain: "Con familiares en singular el posesivo va sin artículo: *" + next + " " + next2 + "*. Pero sí va en plural o con diminutivo: *i miei genitori, la mia sorellina*." };
    if (SUBJECTS.indexOf(w) >= 0) return { cat: "soggetto", slip: true,
      hint: "No hace falta el pronombre sujeto.",
      explain: "No hace falta " + it(w) + ": el verbo ya dice quién. Se usa solo para contrastar o enfatizar." };
    if (ARTICLES[w] && ctx.names.indexOf(next) >= 0) return { cat: "articolo", slip: false,
      hint: "Sobra el artículo: ¿es una ciudad o una persona?",
      explain: "Las ciudades y los nombres de persona van sin artículo: Roma è bella, vado a Roma, Marco è qui. Los países y las regiones sí lo llevan: l'Italia, la Sicilia." };
    if (ARTICLES[w]) return { cat: "articolo", slip: false,
      hint: "Sobra el artículo.",
      explain: "Acá no va artículo: sobra " + it(w) + "." };
    if (DATA.esIt[deaccent(w)] && !isItalian(w)) return { cat: "parola_spagnola", slip: false,
      hint: it(w) + " es español.",
      explain: it(w) + " es español y acá sobra." };
    if (!isItalian(w) && looksSpanish(w)) return { cat: "parola_spagnola", slip: false,
      hint: it(w) + " parece español.",
      explain: it(w) + " no es italiano y acá sobra." };
    return { cat: "parola_in_piu", slip: false,
      hint: "Sobra una palabra.",
      explain: "Sobra " + it(w) + "." };
  }

  /* ------------------------------------------------------ diagnose */

  var SEVERITY = {
    ausiliare: 9, congiuntivo: 9, periodo_ipotetico: 9, a_personale: 8,
    preposizione: 8, preposizione_articolata: 8, persona_verbale: 8,
    tempo_verbale: 8, condizionale: 8, irregolare: 8, participio_accordo: 7,
    genere: 7, accordo: 7, articolo: 7, articolo_possessivo: 7, plurale: 7,
    pronome: 7, posizione_pronome: 7, ci_ne: 7, parola_spagnola: 6,
    falso_amico: 6, lessico: 5, parola_mancante: 5, parola_in_piu: 4,
    ordine: 6, ortografia: 4, doppie: 4, accento: 2, soggetto: 1, refuso: 1
  };

  var LABEL = {
    grammatica: "Gramática",
    ia: "Corrección de la IA",
    ausiliare: "Auxiliar essere/avere", congiuntivo: "Congiuntivo",
    periodo_ipotetico: "Periodo hipotético", a_personale: "«a» personal",
    preposizione: "Preposiciones", preposizione_articolata: "Preposición + artículo",
    persona_verbale: "Persona del verbo", tempo_verbale: "Tiempo verbal",
    condizionale: "Condicional", irregolare: "Verbos irregulares",
    participio_accordo: "Concordancia del participio", genere: "Género de los sustantivos",
    accordo: "Concordancia", articolo: "Artículos", articolo_possessivo: "Artículo con posesivos",
    plurale: "Plurales", pronome: "Pronombres", posizione_pronome: "Lugar del pronombre",
    ci_ne: "ci y ne", parola_spagnola: "Palabras del español", falso_amico: "Falsos amigos",
    lessico: "Vocabulario", parola_mancante: "Palabras que faltan", parola_in_piu: "Palabras de más",
    ordine: "Orden de las palabras", ortografia: "Ortografía", doppie: "Dobles consonantes",
    accento: "Tildes", soggetto: "Sujeto innecesario", refuso: "Tipeo"
  };

  function names(s) {
    return (String(s).match(/\b[A-ZÀ-Ý][a-zà-ÿ]+/g) || []).map(function (w) { return w.toLowerCase(); });
  }

  // Verbs that are interchangeable in everyday Italian.
  var SYN = [["finire", "terminare"], ["cominciare", "iniziare"], ["rimanere", "restare"],
             ["tornare", "ritornare"], ["mandare", "inviare", "spedire"], ["continuare", "proseguire"],
             ["chiedere", "domandare"]];
  function synFamily(lemma) {
    for (var i = 0; i < SYN.length; i++) if (SYN[i].indexOf(lemma) >= 0) return i;
    return -1;
  }
  // Everyday words that mean the same (singular, plural).
  var NSYN = [["papà", "padre"], ["papà", "babbo"], ["mamma", "madre"], ["giacca", "giubbotto"], ["giacche", "giubbotti"],
              ["macchina", "auto", "automobile"], ["macchine", "auto", "automobili"], ["bici", "bicicletta"],
              ["biciclette", "bici"], ["televisione", "tv", "tivù"], ["cellulare", "telefonino"], ["cellulari", "telefonini"],
              ["adesso", "ora"], ["tra", "fra"], ["niente", "nulla"], ["qui", "qua"], ["lì", "là"], ["subito", "immediatamente"],
              ["molto", "tanto"], ["molti", "tanti"], ["molta", "tanta"], ["molte", "tante"]];
  function nounSyn(a, b) {
    return NSYN.some(function (f) { return f.indexOf(a) >= 0 && f.indexOf(b) >= 0; });
  }
  // The article agrees with the word the learner chose (l'auto, la macchina).
  function artFits(art, noun) {
    var n = DATA.nouns[noun] || DATA.nounsByPlural[noun];
    var plural = !!(DATA.nounsByPlural[noun] && n && n.pl === noun && n.s !== noun);
    if (plural) return n.g === "f" ? art === "le" : /^(i|gli)$/.test(art);
    if (/^[aeiouàèéìòù]/.test(noun)) return art === "l'";
    if (!n) return art !== "l'";
    if (n.g === "f") return art === "la";
    return /^(s[^aeiou]|z|gn|ps|x|y)/.test(noun) ? art === "lo" : art === "il";
  }
  var MODAL_PP = ["potuto", "voluto", "dovuto", "potuta", "voluta", "dovuta", "potuti", "voluti", "dovuti", "potute", "volute", "dovute"];
  function synonymFree(g, e) {
    if (g.length !== e.length) return false;
    var diff = 0;
    for (var i = 0; i < e.length; i++) {
      if (g[i] === e[i]) continue;
      if (nounSyn(g[i], e[i]) && (!ARTICLES[g[i - 1]] || artFits(g[i - 1], g[i]))) { diff++; continue; }
      // la macchina / l'auto: the article follows the synonym
      if (ARTICLES[g[i]] && ARTICLES[e[i]] && g[i + 1] && e[i + 1] && nounSyn(g[i + 1], e[i + 1]) && artFits(g[i], g[i + 1])) { diff++; continue; }
      // non ho potuto venire = non sono potuto venire: modals take either auxiliary
      if ((AVERE.indexOf(g[i]) >= 0 || ESSERE.indexOf(g[i]) >= 0) && (AVERE.indexOf(e[i]) >= 0 || ESSERE.indexOf(e[i]) >= 0) &&
          MODAL_PP.indexOf(e[i + 1]) >= 0 && g[i + 1] && g[i + 1].slice(0, -1) === e[i + 1].slice(0, -1)) { diff++; continue; }
      if (MODAL_PP.indexOf(g[i]) >= 0 && MODAL_PP.indexOf(e[i]) >= 0 && g[i].slice(0, -1) === e[i].slice(0, -1) &&
          (AVERE.indexOf(g[i - 1]) >= 0 || ESSERE.indexOf(g[i - 1]) >= 0)) { diff++; continue; }
      var fg = verbForms(g[i]), fe = verbForms(e[i]);
      var pg = participleOf(g[i]), pe = participleOf(e[i]);
      var ok = fe.some(function (a) {
        var fam = synFamily(a.lemma);
        return fam >= 0 && fg.some(function (b) {
          return b.lemma !== a.lemma && synFamily(b.lemma) === fam && b.tense === a.tense && b.p === a.p;
        });
      });
      // participles: sono rimasto / sono restato (same ending)
      if (!ok && pg && pe && pg !== pe && synFamily(pg) >= 0 && synFamily(pg) === synFamily(pe) &&
          g[i].slice(-1) === e[i].slice(-1)) ok = true;
      if (!ok) return false;
      diff++;
    }
    return diff > 0;
  }

  var CLOSED = ["io", "tu", "noi", "voi", "loro", "sono", "è", "ieri", "oggi", "domani", "anche", "non", "ma", "e",
    "poi", "adesso", "ora", "qui", "così", "sempre", "mai", "già", "ancora", "forse", "quando", "se", "che", "come",
    "perché", "dopo", "prima", "stamattina", "stasera", "stanotte", "finalmente", "purtroppo", "davvero", "molto", "troppo",
    "tanto", "tutto", "ci", "mi", "ti", "si", "vi", "ne", "ecco"];
  var GENDER_FIXERS = ["lui", "lei", "la", "lo", "li", "le", "l'", "gli", "esso", "essa", "essi", "esse"];
  function genderFree(g, e, target) {
    if (g.length !== e.length) return false;
    var named = names(String(target).replace(/^\s*\S+/, ""));
    var first = e[0];
    if (/^\s*[A-ZÀ-Ý]/.test(String(target)) && !DATA.lex[first] && !verbForms(first).length &&
        CLOSED.indexOf(first) < 0) named.push(first);
    var isNoun = function (w) { return !!(w && (DATA.nouns[w] || DATA.nounsByPlural[w] || named.indexOf(w) >= 0)); };
    var diff = 0;
    for (var i = 0; i < e.length; i++) {
      if (g[i] === e[i]) continue;
      var a = g[i], b = e[i];
      if (a.length < 3 || a.slice(0, -1) !== b.slice(0, -1)) return false;
      var pair = a.slice(-1) + b.slice(-1);
      if (["oa", "ao", "ie", "ei"].indexOf(pair) < 0) return false;
      if (!DATA.adj[b] && !participleOf(b)) return false;
      if (isNoun(e[i + 1]) || ARTICLES[e[i + 1]] || ARTICLES[e[i - 1]]) return false;
      if (isNoun(e[i + 2]) && !/^(di|a|da|in|con|su|per|tra|fra)$/.test(e[i + 1])) return false;
      for (var k = 0; k < i; k++) if (isNoun(e[k]) || GENDER_FIXERS.indexOf(e[k]) >= 0) return false;
      diff++;
    }
    return diff > 0;
  }

  /* Contrazioni non fatte: "a il" → al, "de il" → del … */
  function uncontracted(gtoks, etoks) {
    for (var i = 0; i < gtoks.length - 1; i++) {
      var p = gtoks[i] === "de" ? "di" : gtoks[i] === "en" ? "in" : gtoks[i];
      var c = PREP_BASE[p] && ARTICLES[gtoks[i + 1]] && contract(p, gtoks[i + 1]);
      if (c && etoks.indexOf(c) >= 0) {
        return { i: i, form: c,
          d: { cat: "preposizione_articolata", slip: false,
            hint: "Dos palabras marcadas se tienen que fundir en una.",
            explain: "*" + p + " + " + gtoks[i + 1] + "* se contrae: " + it(c) +
              ". En italiano la contracción es obligatoria con todas estas preposiciones (al, del, dal, nel, sul)." } };
      }
    }
    return null;
  }

  var ENCLITICS = ["glielo", "gliela", "glieli", "gliele", "gliene", "melo", "mela", "telo", "tela",
                   "cene", "vene", "sene", "gli", "lo", "la", "li", "le", "ne", "mi", "ti", "ci", "vi", "si"];

  function enclitic(g, e) {
    // quele scarpe le compro / quelle scarpe le compro: a double consonant, not
    // a clitic out of place.
    if (degeminate(g.join(" ")) === degeminate(e.join(" "))) return null;
    for (var i = 0; i < e.length; i++) {
      var w = e[i];
      if (g.indexOf(w) >= 0) continue;
      for (var k = 0; k < ENCLITICS.length; k++) {
        var c = ENCLITICS[k];
        if (w.length <= c.length + 2 || w.slice(-c.length) !== c) continue;
        var base = w.slice(0, -c.length);
        var bases = [base, base + "e", base.replace(/(.)\1$/, "$1"), base + "i"];
        var clitics = [c, c === "lo" || c === "la" ? "l'" : c, c.replace(/^glie/, "gli")];
        for (var bi = 0; bi < g.length; bi++) {
          if (bases.indexOf(g[bi]) < 0) continue;
          var near = [g[bi - 1], g[bi + 1]];
          if (near.some(function (x) { return x && (clitics.indexOf(x) >= 0 || x === c.slice(0, 2)); })) return w;
        }
      }
    }
    return null;
  }

  function compoundSwap(g, e) {
    for (var i = 0; i < g.length; i++) {
      if (e.indexOf(g[i]) >= 0) continue;
      var fg = verbForms(g[i]);
      if (!fg.length || participleOf(g[i])) continue;   // partite/partiti: agreement
      for (var j = 1; j < e.length; j++) {
        var lem = participleOf(e[j]);
        var aux = e[j - 1];
        if (!lem || g.indexOf(e[j]) >= 0 || (AVERE.indexOf(aux) < 0 && ESSERE.indexOf(aux) < 0)) continue;
        var f = fg.filter(function (x) { return x.lemma === lem; })[0];
        if (!f) continue;
        return { gi: i, ei: [j - 1, j],
          hint: "Acá va un tiempo compuesto (auxiliar + participio).",
          explain: f.tense === "passatoRemoto"
            ? "Para algo de hoy o de un pasado que sentís cercano, el italiano usa el passato prossimo: " + it(aux + " " + e[j]) + ". El passato remoto (" + it(g[i]) + ") queda para lo lejano o narrado."
            : f.tense === "condizionale"
            ? "Para lo que habría pasado va el condicional compuesto: " + it(aux + " " + e[j]) + "."
            : "Acá va " + it(aux + " " + e[j]) + " (auxiliar + participio), no " + it(g[i]) + "." };
      }
    }
    // The other way round: a compound tense where a simple one goes (studio qui da due anni)
    for (var a = 0; a < g.length - 1; a++) {
      if ((AVERE.indexOf(g[a]) >= 0 || ESSERE.indexOf(g[a]) >= 0) && participleOf(g[a + 1]) &&
          e.indexOf(g[a + 1]) < 0) {
        var lemG = participleOf(g[a + 1]);
        for (var b = 0; b < e.length; b++) {
          var fe = verbForms(e[b]).filter(function (x) { return x.lemma === lemG; });
          if (fe.length && g.indexOf(e[b]) < 0 && participleOf(e[b]) !== lemG) {
            var daTime = /\bda\b/.test(e.join(" "));
            return { gi: a + 1, ei: [b],
              hint: daTime ? "Mirá el *da* + tiempo: ¿la acción terminó o sigue?" : "Acá no hace falta un tiempo compuesto.",
              explain: daTime
                ? "Con *da* + tiempo, para algo que empezó y sigue, el italiano usa el presente: " + it(e[b]) + " (studio qui da due anni = hace dos años que estudio acá)."
                : "Acá va " + it(e[b]) + ", no el tiempo compuesto." };
          }
        }
      }
    }
    return null;
  }

  function pickTarget(given, expected) {
    var g = tokens(given), best = null, bestScore = -1;
    expected.forEach(function (x) {
      var s = lcsLen(g, tokens(x)) - Math.abs(tokens(x).length - g.length) * 0.1;
      if (s > bestScore) { bestScore = s; best = x; }
    });
    return best;
  }

  function diagnose(given, expected, ctx) {
    ctx = ctx || {};
    var list = (Array.isArray(expected) ? expected : [expected]).filter(Boolean);
    var rawG = tokens(given);
    var target0 = pickTarget(given, list) || list[0];   // what the exercise asked for, without the sentence around the gap
    var exp = expandGap(ctx.stem, given, list);
    if (exp) { given = exp.given; list = exp.targets; }
    var target = pickTarget(given, list);
    var g = tokens(given), e = tokens(target);
    var res = { cat: null, slip: false, hint: "", explain: "", target: target,
                given: g.map(function (w) { return { w: w }; }),
                fixed: e.map(function (w) { return { w: w }; }), others: 0, all: [] };

    if (!g.length) {
      res.verdict = "sbagliato"; res.cat = "vuoto";
      res.hint = "Escribí algo, aunque no estés seguro: equivocarse y corregirse enseña.";
      res.explain = "La respuesta era " + it(target0) + ".";
      return res;
    }
    if (g.join(" ") === e.join(" ")) { res.verdict = "giusto"; return res; }
    // The whole answer in Spanish («las verduras», «son las tres»): one
    // finding, not five, and the translation of what was written.
    var wordsG = rawG.filter(function (t) { return /[a-zà-ÿ]/i.test(t); });   // digits don't count
    var esToks = wordsG.filter(spanishish);
    var stemToks = ctx.stem && !/_{3,}/.test(ctx.stem) ? tokens(String(ctx.stem).replace(/\([^)]*\)/g, " ")) : [];
    var copied = stemToks.length && esToks.length && rawG.join(" ") === stemToks.join(" ");
    if (copied) {
      res.cat = "parola_spagnola"; res.label = LABEL.parola_spagnola;
      res.hint = "Eso es la consigna, en español. Escribila en italiano; si todavía no lo sabés, pedí las fichas 🧩.";
      res.explain = "Copiaste la consigna en español. En italiano: " + it(target0) + ".";
      res.given.forEach(function (w) { w.bad = true; });
      res.fixed.forEach(function (w) { w.fix = true; });
      res.verdict = "sbagliato"; res.all = ["parola_spagnola"];
      return res;
    }
    if (wordsG.length >= 2 && (esToks.length * 2 >= wordsG.length || (esToks.length >= 3 && esToks.length * 3 >= wordsG.length))) {
      var pairsEs = esToks.filter(spanishWord).slice(0, 3).map(function (t) { return it(t) + " = " + it(String(spanishWord(t)).split(" / ")[0]); });
      var allEs = esToks.length === wordsG.length;
      // The Italian words the learner did write, glossed, so «dove que» gets
      // «dove = dónde» and not only «que = che».
      var itGloss = allEs ? [] : wordsG.filter(function (t) { return !spanishish(t) && DATA.lex[t]; })
        .slice(0, 2).map(function (t) { return it(t) + " = " + DATA.lex[t]; });
      res.cat = "parola_spagnola"; res.label = LABEL.parola_spagnola;
      res.hint = allEs ? "Eso está en español. Escribilo en italiano; si todavía no lo sabés, pedí las fichas 🧩."
                       : "Hay español mezclado: " + esToks.slice(0, 3).map(it).join(", ") + ". Escribilo todo en italiano.";
      res.explain = (allEs ? "Está en español. " : "Mezcla español e italiano" + (itGloss.length ? " (" + itGloss.join(", ") + ")" : "") + ". ") +
        "En italiano: " + it(target0) + "." + (pairsEs.length ? " (" + pairsEs.join(", ") + ")" : "");
      res.given.forEach(function (w) { if (spanishish(w.w)) w.bad = true; });
      res.fixed.forEach(function (w) { if (!rawG.some(function (t) { return t === w.w; })) w.fix = true; });
      res.verdict = "sbagliato"; res.all = ["parola_spagnola"];
      return res;
    }
    // «Sono stanca» for «Sono stanco»: with nobody named, the gender is the
    // learner's own (or the listener's), and both are right.
    if (genderFree(g, e, target)) { res.verdict = "giusto"; return res; }
    // Termino for finisco, resto for rimango: same meaning, same person and tense.
    if (synonymFree(g, e)) { res.verdict = "giusto"; return res; }
    // (tanto) buono quanto, (così) alto come: the first term of an equality is optional.
    if (g.length === e.length - 1) {
      for (var oi = 0; oi < e.length; oi++) {
        if (/^(tanto|tanta|tanti|tante|così)$/.test(e[oi]) && /^(quanto|quanta|quanti|quante|come)$/.test(e[oi + 2] || "")) {
          var rest = e.slice(0, oi).concat(e.slice(oi + 1));
          if (rest.join(" ") === g.join(" ") || synonymFree(g, rest)) { res.verdict = "giusto"; return res; }
        }
      }
    }

    var found = [];
    var nm = names(target).concat(ctx.names || []);

    // Contractions first: fix them and look at what is left.
    var un = uncontracted(g, e);
    if (un) {
      found.push({ d: un.d, gi: un.i, ei: e.indexOf(un.form) });
      g = g.slice(0, un.i).concat([un.form], g.slice(un.i + 2));
      res.given[un.i].bad = true;
      if (res.given[un.i + 1]) res.given[un.i + 1].bad = true;
      res.given.splice(un.i + 1, 1);
    }

    // A clitic written apart that should be glued to the verb (ecco lo →
    // eccolo, per lo ringraziare → per ringraziarlo, ti alza → alzati).
    var encl = enclitic(g, e);
    if (encl) {
      res.cat = "posizione_pronome"; res.label = LABEL.posizione_pronome;
      res.hint = "El pronombre está bien, pero no en su lugar: con esta forma del verbo va pegado al final.";
      res.explain = "Con infinitivo, gerundio, imperativo (tu, noi, voi) y *ecco*, el pronombre se pega al final: " +
        it(encl) + " (vederti, eccolo, alzati, dimmi, facendolo).";
      res.verdict = "sbagliato"; res.all = ["posizione_pronome"];
      g.forEach(function (w, i) { if (CLITICS.indexOf(w) >= 0 && res.given[i]) res.given[i].bad = true; });
      e.forEach(function (w, i) { if (w === encl && res.fixed[i]) res.fixed[i].fix = true; });
      return res;
    }

    // A simple past where Italian wants a compound one (mi svegliai → mi sono
    // svegliato; ho studiato ↔ studio with «da» + time).
    var cp = compoundSwap(g, e);
    if (cp) {
      res.cat = "tempo_verbale"; res.label = LABEL.tempo_verbale;
      res.hint = cp.hint; res.explain = cp.explain;
      res.verdict = "sbagliato"; res.all = ["tempo_verbale"];
      if (res.given[cp.gi]) res.given[cp.gi].bad = true;
      cp.ei.forEach(function (i) { if (res.fixed[i]) res.fixed[i].fix = true; });
      return res;
    }

    // Same words, other order
    if (g.length === e.length && g.slice().sort().join(" ") === e.slice().sort().join(" ") && g.join(" ") !== e.join(" ")) {
      var clit = g.filter(function (w, i) { return w !== e[i] && CLITICS.indexOf(w) >= 0; })[0];
      found.push({ d: clit
        ? { cat: "posizione_pronome", slip: false,
            hint: "Las palabras están bien; revisá dónde va el pronombre.",
            explain: "El pronombre átono va antes del verbo conjugado (" + it(clit) + " + verbo), o pegado al infinitivo, al gerundio y al imperativo con tu: vederlo, dimmi." }
        : { cat: "ordine", slip: false,
            hint: "Están todas las palabras, pero no en el orden italiano.",
            explain: "El orden es: " + it(target) + "." },
        gi: -1, ei: -1 });
    } else {
      var ops = align(g, e);
      ops.forEach(function (o) {
        var c = { e: e, ei: o.ei, g: g, gi: o.gi, names: nm, stem: ctx.stem, prompt: ctx.prompt, nominal: ctx.nominal };
        if (o.op === "sub") {
          var d = pairRules(o.g, o.e, c);
          found.push({ d: d, gi: o.gi, ei: o.ei });
        } else if (o.op === "miss") {
          found.push({ d: missRule(o.e, c), gi: -1, ei: o.ei });
        } else if (o.op === "extra") {
          found.push({ d: extraRule(o.g, g, o.gi, c), gi: o.gi, ei: -1 });
        }
      });
      // An auxiliary swap drags the participle ending with it (ho andato →
      // sono andato is one error, not two): drop the agreement echo.
      var hasAux = found.some(function (f) { return f.d.cat === "ausiliare"; });
      if (hasAux) found = found.filter(function (f) {
        return f.d.cat !== "participio_accordo" && f.d.cat !== "accordo";
      });
    }

    if (!found.length) { res.verdict = "giusto"; return res; }

    found.forEach(function (f) {
      if (f.gi >= 0 && res.given[f.gi]) res.given[f.gi].bad = true;
      if (f.ei >= 0 && res.fixed[f.ei]) res.fixed[f.ei].fix = true;
    });
    found.sort(function (a, b) { return (SEVERITY[b.d.cat] || 5) - (SEVERITY[a.d.cat] || 5); });
    var main = found[0].d;
    res.cat = main.cat;
    res.label = LABEL[main.cat] || main.cat;
    res.hint = main.hint;
    res.explain = main.explain;
    res.others = found.length - 1;
    res.all = found.map(function (f) { return f.d.cat; });
    res.slip = found.every(function (f) { return f.d.slip; });
    // Slips only (accents, typos, a redundant subject): close enough.
    res.verdict = res.slip ? "quasi" : "sbagliato";
    return res;
  }

  /* A wrong option in a multiple-choice question: explain why *that* option
     is wrong (response-specific feedback). */
  function explainChoice(chosen, answer, ctx) {
    var d = diagnose(chosen, [answer], ctx);
    return d.verdict === "giusto" ? null : d;
  }

  /* ---------------------------------------------------------- dati */

  function init(bank) {
    bank = bank || {};
    DATA.esIt = dict(bank.esIt);
    // A few multi-word Spanish structures the engine relies on.
    [["lo que", "quello che / ciò che", "Lo que = quello che (o ciò che)."],
     ["tengo que", "devo", "Tener que = dovere: devo andare."],
     ["hay que", "bisogna / si deve", "Hay que = bisogna + infinitivo."],
     ["acabo de", "ho appena", "Acabar de = appena + passato prossimo: ho appena mangiato."]]
      .forEach(function (x) { if (!DATA.esIt[x[0]]) DATA.esIt[x[0]] = [x[1], x[2]]; });
    DATA.falsi = dict(bank.falsi);
    DATA.spelling = (bank.spelling || []).slice().sort(function (a, b) {
      return b[0].length - a[0].length;
    });
    DATA.lex = dict();
    DATA.nouns = dict();
    DATA.nounsByPlural = dict();
    (bank.nouns || []).forEach(function (n) {
      var x = { s: n[0], g: n[1], pl: n[2], es: n[3], note: n[6] };
      DATA.nouns[n[0]] = x;
      DATA.nounsByPlural[n[2]] = x;
      DATA.lex[n[0]] = n[3];
      if (!DATA.lex[n[2]]) DATA.lex[n[2]] = n[3];
    });
    DATA.adj = dict();
    (bank.adjectives || []).forEach(function (a) {
      for (var i = 0; i < 4; i++) { if (!DATA.lex[a[i]]) DATA.lex[a[i]] = a[4]; DATA.adj[a[i]] = a[0]; }
    });
    (bank.words || []).forEach(function (w) {
      var k = w[0].toLowerCase();
      if (!DATA.lex[k] && k.indexOf(" ") < 0) DATA.lex[k] = w[1];
    });
    (bank.verbs || []).forEach(function (v) {
      if (Conj && !v[4]) Conj.register(v[0], { es: v[1], aux: v[2], isc: v[3] });
      DATA.lex[v[0]] = v[1];
    });
    VIDX = null;   // rebuild with the new verbs on first use
  }

  var api = {
    tokens: tokens,
    align: align,
    diagnose: diagnose,
    explainChoice: explainChoice,
    init: init,
    LABEL: LABEL,
    SEVERITY: SEVERITY,
    verbForms: verbForms,
    participleOf: participleOf,
    DATA: DATA,
    // For the free-writing checker (scrivi.js): the same tables and tests.
    util: {
      ARTICLES: ARTICLES, CLITICS: CLITICS, SUBJECTS: SUBJECTS, POSSESSIVE: POSSESSIVE,
      FAMILY: FAMILY, AVERE: AVERE, ESSERE: ESSERE, prepInfo: prepInfo, contract: contract,
      isItalian: isItalian, spanishWord: spanishWord, looksSpanish: looksSpanish,
      isInfinitive: isInfinitive, soundRule: soundRule, deaccent: deaccent,
      degeminate: degeminate, editDistance: editDistance, lexConfusion: lexConfusion
    }
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Diagnosi = api;
})(typeof window !== "undefined" ? window : globalThis);
