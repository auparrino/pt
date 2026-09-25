/* El diagnóstico tiene que reconocer el error que un hispanohablante comete
   de verdad.  El test toma frases correctas, les inyecta errores típicos
   (como los haría el alumno) y controla que el diagnóstico diga *cuál*
   error es; además, casos escritos a mano, variantes que el portugués de
   Brasil acepta y entradas absurdas.
   Run: node tools/test_diagnosi.js  */
var fs = require("fs");
var path = require("path");
var ROOT = path.join(__dirname, "..");
var Conj = require(path.join(ROOT, "docs/js/conjugator.js"));
global.Conj = Conj;
var D = require(path.join(ROOT, "docs/js/diagnosi.js"));
global.Diagnosi = D;
var Banca = null;
try { Banca = require(path.join(ROOT, "docs/js/banca.js")); } catch (e) { Banca = null; }

var bankPath = path.join(ROOT, "docs/data/bank.json");
var bank = fs.existsSync(bankPath) ? JSON.parse(fs.readFileSync(bankPath, "utf8")) : null;
// The bank is used only once it is Portuguese (the port goes file by file).
if (bank && !/\b(você|não|está|também)\b/.test((bank.sentences || []).slice(0, 200).map(function (s) { return (s.pt || s.it || [])[0]; }).join(" "))) bank = null;
if (bank && Banca) Banca.load(bank); else if (bank) D.init(bank);
function variants(s) { return s.pt || s.it; }

var fails = 0, checks = 0;
function ok(cond, what) {
  checks++;
  if (!cond) { fails++; console.log("FAIL " + what); }
}

/* ------------------------------------------------ casos escritos a mano */

var CASES = [
  ["Estou em o Brasil", "Estou no Brasil.", "contraccion"],
  ["O carro de ele é azul", "O carro dele é azul.", "contraccion"],
  ["Moro em Brasil", "Moro no Brasil.", "contraccion"],
  ["Vou a a praia", "Vou à praia.", "crase"],
  ["Vou a praia", "Vou à praia.", "crase"],
  ["Eu vou à pé", "Eu vou a pé.", "crase"],
  ["Ele é muy simpático", "Ele é muito simpático.", "muito"],
  ["Muito pessoas", "Muitas pessoas.", "muito"],
  ["Ela é muita bonita", "Ela é muito bonita.", "muito"],
  ["Eu gosto café", "Eu gosto de café.", "gostar"],
  ["Eu gosto o filme", "Eu gosto do filme.", "gostar"],
  ["Me gusta o samba", "Eu gosto do samba.", "gostar"],
  ["Vi ao João na praia", "Vi o João na praia.", "a_personal"],
  ["Conheço a Pedro desde criança", "Conheço o Pedro desde criança.", "a_personal"],
  ["Ontem eu fazi o almoço", "Ontem eu fiz o almoço.", "regularizacion"],
  ["Eu sabo nadar", "Eu sei nadar.", "regularizacion"],
  ["Eu fazerei isso", "Eu farei isso.", "regularizacion"],
  ["Eles são mais grandes", "Eles são maiores.", "regularizacion"],
  ["Hoje eu tenho comido muito", "Hoje eu comi muito.", "perfeito_composto"],
  ["Eu he comido feijoada", "Eu comi feijoada.", "perfeito_composto"],
  ["Se eu ter tempo, vou à praia", "Se eu tiver tempo, vou à praia.", "futuro_subj"],
  ["Quando eu chego, te ligo", "Quando eu chegar, te ligo.", "futuro_subj"],
  ["É importante para eles saber", "É importante para eles saberem.", "inf_pessoal"],
  ["Espero que você vem", "Espero que você venha.", "subjuntivo"],
  ["Se eu teria dinheiro, viajaria", "Se eu tivesse dinheiro, viajaria.", "subjuntivo"],
  ["Acho que ele venha", "Acho que ele vem.", "subjuntivo"],
  ["A cancion é linda", "A canção é linda.", "espanol"],
  ["Eu tengo dois irmãos", "Eu tenho dois irmãos.", "espanol"],
  ["Pero eu não quero", "Mas eu não quero.", "espanol"],
  ["Eu vou a comer", "Eu vou comer.", "espanol"],
  ["Eu no sei", "Eu não sei.", "espanol"],
  ["Ela está embarazada", "Ela está grávida.", "espanol"],
  ["O polvo está na mesa", "O pó está na mesa.", "falso_amigo"],
  ["Trabalhava na oficina", "Trabalhava no escritório.", "falso_amigo"],
  ["A leite está quente", "O leite está quente.", "genero"],
  ["O viagem foi longa", "A viagem foi longa.", "genero"],
  ["Os animals", "Os animais.", "plural"],
  ["Os pãos", "Os pães.", "plural"],
  ["Você falas português", "Você fala português.", "persona"],
  ["A gente vamos à praia", "A gente vai à praia.", "persona"],
  ["Eles tem dois filhos", "Eles têm dois filhos.", "persona"],
  ["Houveram muitos problemas", "Houve muitos problemas.", "persona"],
  ["Isso é para mí", "Isso é para mim.", "pronome"],
  ["Vou comprar-o amanhã", "Vou comprá-lo amanhã.", "pronome"],
  ["Não disse-me nada", "Não me disse nada.", "colocacao"],
  ["Direi-lhe a verdade", "Dir-lhe-ei a verdade.", "colocacao"],
  ["O livro foi escrevido por ela", "O livro foi escrito por ela.", "participio"],
  ["A conta foi pagada", "A conta foi paga.", "participio"],
  ["Ela e carioca", "Ela é carioca.", "tilde"],
  ["Nao sei", "Não sei.", "nasal"],
  ["Ela namora com o Pedro", "Ela namora o Pedro.", "regencia"],
  ["Penso você", "Penso em você.", "regencia"],
  ["Eu penso de que é tarde", "Eu penso que é tarde.", "regencia"],
  ["Ontem eu comia uma pizza", "Ontem eu comi uma pizza.", "tempo"],
  ["Moro no Rio desde três anos", "Moro no Rio há três anos.", "preposicion"],
  ["Vou em pé para o trabalho", "Vou a pé para o trabalho.", "preposicion"],
  ["Ele seje feliz", "Ele seja feliz.", "verbo_irregular"],
  ["Fui para a casa", "Fui para casa.", "articulo"],
  ["", "Oi", "vuoto"]
];

CASES.forEach(function (c) {
  var d = D.diagnose(c[0], [c[1]]);
  if (c[2]) ok(d.cat === c[2], "«" + c[0] + "» → esperado " + c[2] + ", obtenido " + d.cat + " (" + d.explain + ")");
  ok(d.verdict !== "giusto", "error no visto: " + c[0]);
  ok(d.hint && d.explain, "falta pista o explicación: " + c[0]);
  ok(d.label || d.cat === null, "falta la etiqueta: " + c[0]);
  // The hint must not give the answer away.
  d.fixed.filter(function (t) { return t.fix; }).forEach(function (t) {
    if (t.w.length > 3) ok(d.hint.indexOf("*" + t.w + "*") < 0, "la pista revela la respuesta: " + c[0] + " / " + d.hint);
  });
});
ok(D.diagnose("Vi ao João na praia", ["Vi o João na praia."]).explain.indexOf("João") >= 0, "los nombres propios se escriben con mayúscula en la explicación");

// Correct answers stay correct: punctuation, case, and what Brazilian Portuguese lets you choose.
[["oi, tudo bem", "Oi, tudo bem?"], ["cadê o banheiro", "Cadê o banheiro?"], ["É tarde", "é tarde"],
 ["Eu a vi ontem", "Eu a vi ontem."], ["Vi a Maria na praia", "Vi a Maria na praia."], ["Conheço Maria", "Conheço a Maria."],
 ["Antes de ele chegar", "Antes de ele chegar."], ["Está na hora de as crianças dormirem", "Está na hora de as crianças dormirem."],
 ["Eu estou cansada", "Estou cansado."], ["Obrigada", "Obrigado."], ["Eu falo português", "Falo português."],
 ["Minha casa é grande", "A minha casa é grande."], ["Nós vamos à praia", "A gente vai à praia."], ["Vou te ligar amanhã", "Vou ligar-te amanhã."],
 ["Chamo-me Ana", "Me chamo Ana."], ["Moro num apartamento", "Moro em um apartamento."], ["Eu tinha feito", "Eu havia feito."],
 ["Levantamo-nos cedo", "Nós nos levantamos cedo."], ["Vende-se casa", "Se vende casa."], ["Dir-lhe-ei a verdade", "Lhe direi a verdade."],
 ["Eu gostaria de um café", "Gostaria de um café."], ["o João chegou", "João chegou."], ["Se você vir a Ana, dê um abraço nela", "Se você vir a Ana, dê um abraço nela."],
 ["L​'amigo", "L'amigo"], ["Moro em Copacabana 😀", "Moro em Copacabana."]
].forEach(function (c) {
  var d = D.diagnose(c[0], [c[1]]);
  ok(d.verdict === "giusto", "respuesta correcta rechazada: «" + c[0] + "» → " + d.verdict + " " + d.cat + " " + d.explain);
});
ok(D.diagnose("Voce é carioca?", ["Você é carioca?"]).verdict === "quasi", "la tilde que falta es un desliz");
ok(D.diagnose("Me chamo Ana", ["Chamo-me Ana."]).verdict === "quasi", "próclise al empezar, donde se pedía la forma escrita: casi");
ok(D.diagnose("Me chamo Ana", ["Chamo-me Ana.", "Me chamo Ana."]).verdict === "giusto", "si la próclise es una variante aceptada, vale");
ok(D.diagnose("", ["Comi"]).verdict === "sbagliato", "respuesta vacía");
ok(D.diagnose("eu comi", ["Eu comi uma pizza.", "eu comi"]).verdict === "giusto", "se compara con la variante más cercana");
ok(D.diagnose("Maria está cansado", ["Maria está cansada."]).verdict === "sbagliato", "con un nombre, el género no es libre");
ok(D.diagnose("Elas estão cansados", ["Elas estão cansadas."]).verdict === "sbagliato", "con *elas*, el género no es libre");

// The API app.js and the other modules use.
ok(typeof D.util.isPortuguese === "function" && D.util.isItalian === D.util.isPortuguese, "util.isPortuguese (y el alias isItalian de drills.js)");
ok(D.util.isPortuguese("não") && D.util.isPortuguese("você") && !D.util.isPortuguese("tengo"), "isPortuguese reconoce el portugués");
ok(D.util.spanishWord("tengo") === "tenho" && D.util.spanishWord("muy") === "muito" && !D.util.spanishWord("casa"), "spanishWord: el español y su equivalente");
Object.keys(D.SEVERITY).forEach(function (k) { ok(D.LABEL[k], "falta la etiqueta de " + k); });
ok(Array.isArray(D.PORTUNOL) && D.PORTUNOL.length >= 10 && D.PORTUNOL.every(function (x) { return D.LABEL[x[0]] && x[1]; }), "el cuaderno del portuñol usa categorías del diagnóstico");
["contraccion", "articulo", "genero", "plural", "concordancia", "preposicion", "regencia", "muito", "gostar", "a_personal", "perfeito_composto",
 "subjuntivo", "futuro_subj", "inf_pessoal", "pronome", "colocacao", "crase", "ortografia", "tilde", "espanol", "falso_amigo", "tempo", "persona",
 "participio", "verbo_irregular", "regularizacion", "nasal", "faltante", "sobrante", "tipeo", "orden"].forEach(function (k) {
  ok(D.LABEL[k] && D.SEVERITY[k], "categoría " + k + " con etiqueta y gravedad");
});
ok(D.explainChoice("à", "a", { stem: "Vou ___ pé." }) && D.explainChoice("à", "a", { stem: "Vou ___ pé." }).cat === "crase", "explainChoice: la opción equivocada con su categoría");
ok(D.explainChoice("a", "a", {}) === null, "explainChoice: la correcta no tiene error");

/* ------------------------------ errores inyectados en las frases del banco */

var SPLIT = { no: "em o", na: "em a", nos: "em os", nas: "em as", do: "de o", da: "de a", dos: "de os", das: "de as", ao: "a o", aos: "a os",
              pelo: "por o", pela: "por a", dele: "de ele", dela: "de ela", neste: "em este", nesta: "em esta", nesse: "em esse", nessa: "em essa", "à": "a a", "às": "a as" };
var SPANISH = { muito: "muy", "também": "también", "então": "entonces", agora: "ahora", sempre: "siempre", "até": "hasta", mas: "pero", depois: "después",
                hoje: "hoy", ontem: "ayer", "amanhã": "mañana", "ninguém": "nadie", com: "con", tenho: "tengo", quero: "quiero", "são": "son", estou: "estoy",
                "não": "no", sem: "sin", onde: "donde", quando: "cuando" };

function inject(sentence) {
  var toks = sentence.split(" "), out = [];
  var core = function (t) { return t.replace(/[.,;:!?«»"“”()]/g, ""); };
  toks.forEach(function (t, i) {
    var w = core(t), low = w.toLowerCase(), next = core(toks[i + 1] || "").toLowerCase();
    var put = function (repl, cat) {
      var copy = toks.slice();
      copy[i] = t.replace(w, repl);
      out.push({ bad: copy.join(" "), cat: cat, what: w + "→" + repl });
    };
    // contraction split up (em o, de ele, a a)
    if (SPLIT[low]) put(w.charAt(0) !== low.charAt(0) ? SPLIT[low].charAt(0).toUpperCase() + SPLIT[low].slice(1) : SPLIT[low], low.charAt(0) === "à" ? "crase" : "contraccion");
    // Spanish word
    if (SPANISH[low]) put(SPANISH[low], low === "muito" ? "muito" : "espanol");
    // accent dropped (a slip) and the nasal til dropped
    if (/[áéíóúâêô]/.test(low) && low.length > 3 && !/^(à|às)$/.test(low)) put(w.normalize("NFD").replace(/[́̂]/g, "").normalize("NFC"), "tilde");
    if (/[ãõ]/.test(low) && low.length > 2) put(w.normalize("NFD").replace(/̃/g, "").normalize("NFC"), "nasal");
    // gostar without de
    if (/^gost/.test(low) && /^(de|do|da|dos|das)$/.test(next)) {
      var copy = toks.slice();
      copy[i + 1] = { de: "", do: "o", da: "a", dos: "os", das: "as" }[next];
      out.push({ bad: copy.join(" ").replace(/\s+/g, " "), cat: "gostar", what: "gostar sin de" });
    }
    // person of the verb
    var forms = D.verbForms(low).filter(function (f) { return f.tense === "presente" && f.p !== 1 && f.p !== 4; });
    if (forms.length && low.length > 2 && i > 0 && !/^(é|são|está|tem|vai|vão|há)$/.test(low)) {
      var f = forms[0];
      try {
        var all = Conj.conjugate(f.lemma, "presente").map(function (x) { return x.split(" ").pop(); });
        var other = all[f.p === 0 ? 3 : f.p === 3 ? 0 : f.p === 2 ? 5 : 2];
        if (other && other !== low && D.verbForms(other).length) put(other, "persona");
      } catch (e) { /* */ }
    }
  });
  return out;
}

var ALT = {
  espanol: ["espanol", "ortografia", "tilde", "lexico", "muito", "pronome", "preposicion", "contraccion", "nasal"],
  muito: ["muito", "espanol"],
  persona: ["persona", "tempo", "subjuntivo", "regularizacion", "verbo_irregular", "concordancia", "gostar", "futuro_subj", "inf_pessoal"],
  tilde: ["tilde", "ortografia", "persona", "nasal", "tempo"],
  nasal: ["nasal", "tilde", "ortografia", "espanol", "persona", "tempo"],
  // A closer accepted variant may be built otherwise (subimos o Pão de Açúcar).
  contraccion: ["contraccion", "crase", "preposicion", "regencia", "gostar", "articulo"],
  crase: ["crase", "contraccion"],
  gostar: ["gostar", "regencia"]
};

if (bank) {
  var tally = {};
  bank.sentences.forEach(function (s) {
    inject(variants(s)[0]).forEach(function (x) {
      var d = D.diagnose(x.bad, variants(s));
      var t = tally[x.cat] || (tally[x.cat] = { n: 0, hit: 0, seen: 0, miss: [] });
      t.n++;
      if (d.verdict !== "giusto") t.seen++;
      if ((ALT[x.cat] || [x.cat]).indexOf(d.cat) >= 0) t.hit++;
      else if (t.miss.length < 4) t.miss.push(x.what + " en «" + variants(s)[0] + "» → " + d.cat);
    });
  });
  console.log("errores inyectados en las frases del banco:");
  Object.keys(tally).forEach(function (k) {
    var t = tally[k];
    console.log("  " + (k + "                         ").slice(0, 20) + t.hit + "/" + t.n +
      " bien diagnosticados (" + Math.round(t.hit / t.n * 100) + "%), vistos como error " + t.seen + "/" + t.n);
    ok(t.seen / t.n >= 0.97, k + ": errores no vistos " + (t.n - t.seen));
    ok(t.hit / t.n >= 0.9, k + ": diagnóstico correcto solo en el " + Math.round(t.hit / t.n * 100) + "%");
    if (t.hit / t.n < 0.97) t.miss.forEach(function (m) { console.log("      ej.: " + m); });
  });

  // Every accepted translation is accepted, and every bank error sentence is
  // recognised as wrong.
  bank.sentences.forEach(function (s) {
    variants(s).forEach(function (v) {
      ok(D.diagnose(v, variants(s)).verdict === "giusto", "variante rechazada: " + v);
    });
  });
  var errSeen = 0, errCat = 0;
  bank.errors.forEach(function (e) {
    var d = D.diagnose(e.wrong, [e.right]);
    if (d.verdict !== "giusto") errSeen++;
    else console.log("  no visto: " + e.wrong + " / " + e.right);
    if (d.cat === e.cat || (e.cat === "verbo_irregular" && d.cat === "regularizacion") || (e.cat === "ortografia" && /^(tilde|nasal)$/.test(d.cat)) ||
        (e.cat === "genero" && d.cat === "articulo") || (e.cat === "articulo" && d.cat === "genero")) errCat++;
  });
  console.log("frases de «encontrá el error»: vistas como error " + errSeen + "/" + bank.errors.length +
              ", misma familia que el autor " + errCat + "/" + bank.errors.length);
  ok(errSeen === bank.errors.length, "cada frase equivocada se ve como equivocada");
  ok(errCat / bank.errors.length >= 0.75, "la categoría coincide con la del autor en al menos el 75%");

  /* generadores del banco */
  if (Banca) {
    var st = { unlocked: 52, cards: {} };
    ["vocabSession", "formsSession", "translateSession", "gapSession", "errorSession"].forEach(function (fn) {
      if (typeof Banca[fn] !== "function") return ok(false, "Banca." + fn + " no existe");
      for (var r = 0; r < 20; r++) {
        Banca[fn](st, 12).forEach(function (it) {
          ok(it && it.id && it.answer !== undefined, fn + ": ítem mal formado");
          if (it.type === "choice") ok(it.options.indexOf(it.answer) >= 0, fn + ": falta la opción correcta " + it.id);
          if (it.type === "typed" || it.type === "translate") {
            ok(D.diagnose(it.answer, it.accept || [it.answer]).verdict === "giusto", fn + ": la respuesta esperada se rechaza: " + it.id + " " + it.answer);
          }
          ok(Banca.item(it.id) !== null, fn + ": el ítem no se regenera desde su id: " + it.id);
        });
      }
    });
    // Articles and contractions computed by the bank agree with the rules.
    ok(Banca.defArt("praia", "f") === "a" && Banca.defArt("livros", "m", true) === "os" && Banca.defArt("mãos", "f", true) === "as", "artículos calculados");
    ok(!Banca.indefArt || (Banca.indefArt("mão", "f") === "uma" && Banca.indefArt("livros", "m", true) === "uns"), "artículos indeterminados calculados");
    ok(Banca.CONTR.em.o === "no" && Banca.CONTR.de.as === "das" && Banca.CONTR.a.a === "à" && Banca.CONTR.por.o === "pelo" && Banca.CONTR.em.um === "num", "contracciones");
    Object.keys(Banca.CONTR).forEach(function (p) {
      Object.keys(Banca.CONTR[p]).forEach(function (a) {
        ok(D.util.contract(p, a) === Banca.CONTR[p][a], "la contracción " + p + " + " + a + " del banco es la del diagnóstico");
      });
    });

    if (typeof Banca.clinicaSession === "function") {
      st.errs = { contraccion: { n: 5, fixed: 0, last: Date.now() }, gostar: { n: 3, fixed: 0, last: Date.now() } };
      var cl = Banca.clinicaSession(st, 12);
      ok(cl.length >= 8, "la clínica prepara una sesión: " + cl.length);
      ok(cl.filter(function (x) { return x.clinic === "contraccion"; }).length >=
         cl.filter(function (x) { return x.clinic === "gostar"; }).length, "la clínica pesa más el error más frecuente");
    }
  }
} else {
  console.log("(docs/data/bank.json todavía no está en portugués: tests del banco salteados)");
}

/* ------------------------------ los ítems del curso (docs/data/course.json) */
(function () {
  var cp = path.join(ROOT, "docs/data/course.json");
  var course = fs.existsSync(cp) ? JSON.parse(fs.readFileSync(cp, "utf8")) : null;
  var items = course && course.items || [];
  if (!/\b(você|não|está)\b/.test(items.slice(0, 600).map(function (i) { return String(i.answer || ""); }).join(" "))) {
    console.log("(course.json todavía no está en portugués: tests de los ítems salteados)");
    return;
  }
  var rejected = 0, seen = 0, fx = 0;
  items.forEach(function (it) {
    var acc = [it.answer].concat(it.accept || it.alt || []).filter(Boolean).map(String);
    if (/^(cloze|typed|translate)$/.test(it.type)) acc.forEach(function (a) {
      var d = D.diagnose(a, acc, { stem: it.stem });
      if (d.verdict !== "giusto") { rejected++; if (rejected < 5) console.log("  rechazada: " + it.id + " «" + a + "» " + d.cat); }
    });
    if (it.type === "fixerr") {
      fx++;
      var d2 = D.diagnose(it.stem, acc);
      if (d2.verdict !== "giusto") seen++; else console.log("  error no visto: " + it.id + " «" + it.stem + "»");
    }
  });
  ok(rejected === 0, "respuestas del curso rechazadas: " + rejected);
  ok(!fx || seen / fx >= 0.97, "frases de «corregí el error» vistas como error: " + seen + "/" + fx);
})();

/* ------------------------------------------- intentos de romperlo */

// Words that are also JavaScript property names must not break anything.
["constructor", "__proto__", "toString", "hasOwnProperty", "valueOf", "prototype"].forEach(function (w) {
  ["Ontem fui ao cinema.", w, "__proto__"].forEach(function (t) {
    var ok1 = true;
    try { D.diagnose(w, [t]); D.diagnose(t, [w]); } catch (e) { ok1 = false; }
    ok(ok1, "el diagnóstico se rompe con «" + w + "» / «" + t + "»");
  });
});
// Garbage input never throws and never prints undefined/NaN.
["", "   ", "<script>alert(1)</script>", "😀😀", "a".repeat(3000), "'''", ".,;:!?", "- - -", "\u0000", "levanto-me-me-me", "a-a-a", "dir-lhe-ei-ei"].forEach(function (w) {
  var d = null;
  try { d = D.diagnose(w, ["Comi uma pizza."]); } catch (e) { /* */ }
  ok(d && d.verdict, "entrada absurda no manejada: " + JSON.stringify(w).slice(0, 20));
  if (d && d.hint) ok(!/undefined|NaN|\[object/.test(d.hint + d.explain), "texto roto con entrada absurda");
});
ok(D.diagnose("x", [null, undefined, ""]).verdict, "esperadas vacías no rompen");

if (bank) {
  // Random typing slips on every sentence: never a crash, always a hint.
  var seed = 7;
  var rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  var crashes = 0, noHint = 0;
  bank.sentences.forEach(function (s) {
    for (var r = 0; r < 3; r++) {
      var a = variants(s)[0].split("");
      var k = Math.floor(rnd() * a.length);
      a.splice(k, 1, rnd() < 0.5 ? "" : "x");
      try {
        var d = D.diagnose(a.join(""), variants(s));
        if (d.verdict !== "giusto" && (!d.hint || !d.explain)) noHint++;
      } catch (e) { crashes++; if (crashes < 3) console.log(e.stack); }
    }
  });
  ok(crashes === 0, "el diagnóstico se rompe con frases mutadas: " + crashes);
  ok(noHint === 0, "errores sin pista: " + noHint);

  // A first-attempt hint never names the corrected word.
  var leaks = 0;
  bank.errors.forEach(function (e) {
    var d = D.diagnose(e.wrong, [e.right]);
    d.fixed.filter(function (t) { return t.fix && t.w.length > 2; }).forEach(function (t) {
      if (d.hint.toLowerCase().indexOf("*" + t.w + "*") >= 0) { leaks++; if (leaks < 4) console.log("  pista reveladora: " + e.wrong + " → " + d.hint); }
    });
  });
  ok(leaks === 0, "pistas que revelan la respuesta: " + leaks);

  // Every gap is cut where the word really is (not «é» inside «café»).
  if (Banca && typeof Banca.gapItem === "function") {
    bank.sentences.forEach(function (s, i) {
      if (!s.gap) return;
      var it = Banca.gapItem(i);
      ok(it && it.stem.replace(/___ \([^)]*\)/, it.answer) === variants(s)[0], "hueco mal cortado en: " + variants(s)[0]);
    });
  }
}

console.log("\ncontroles: " + checks + "   errores: " + fails);
process.exit(fails ? 1 : 0);
