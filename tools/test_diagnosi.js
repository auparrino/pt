/* La diagnosi deve riconoscere l'errore che uno studente ispanofono fa
   davvero.  Il test prende frasi corrette, ci inietta errori tipici (come
   farebbe lo studente) e controlla che la diagnosi dica *quale* errore è.
   Run: node tools/test_diagnosi.js  */
var fs = require("fs");
var path = require("path");
var ROOT = path.join(__dirname, "..");
var Conj = require(path.join(ROOT, "docs/js/conjugator.js"));
var D = require(path.join(ROOT, "docs/js/diagnosi.js"));
var Banca = require(path.join(ROOT, "docs/js/banca.js"));

var bankPath = path.join(ROOT, "docs/data/bank.json");
var bank = fs.existsSync(bankPath) ? JSON.parse(fs.readFileSync(bankPath, "utf8")) : null;
if (bank) Banca.load(bank);

var fails = 0, checks = 0;
function ok(cond, what) {
  checks++;
  if (!cond) { fails++; console.log("FAIL " + what); }
}

/* ------------------------------------------------ casi scritti a mano */

var CASES = [
  ["Ieri ho andato al cinema", "Ieri sono andato al cinema.", "ausiliare"],
  ["Mi ho alzato presto", "Mi sono alzato presto.", "ausiliare"],
  ["Ho conosciuto a Giulia", "Ho conosciuto Giulia.", "a_personale"],
  ["Aspetto a mia sorella", "Aspetto mia sorella.", "a_personale"],
  ["Vado a il cinema", "Vado al cinema.", "preposizione_articolata"],
  ["Il libro de il professore", "Il libro del professore.", "preposizione_articolata"],
  ["il zaino", "lo zaino", "articolo"],
  ["il studente", "lo studente", "articolo"],
  ["lo amico", "l'amico", "articolo"],
  ["parlero domani", "parlerò domani", "accento"],
  ["Lei e italiana", "Lei è italiana", "accento"],
  ["Mio nono è simpatico", "Mio nonno è simpatico", "doppie"],
  ["Penso che è tardi", "Penso che sia tardi", "congiuntivo"],
  ["Spero che vieni", "Spero che venga", "congiuntivo"],
  ["Se avrei tempo verrei", "Se avessi tempo verrei", "periodo_ipotetico"],
  ["Noi va al mare", "Noi andiamo al mare", "persona_verbale"],
  ["Loro parla troppo", "Loro parlano troppo", "persona_verbale"],
  ["Io ando a Roma", "Io vado a Roma", "irregolare"],
  ["Ho prenduto il treno", "Ho preso il treno", "irregolare"],
  ["Ho metuto il libro sul tavolo", "Ho messo il libro sul tavolo", "irregolare"],
  ["La mia madre è italiana", "Mia madre è italiana", "articolo_possessivo"],
  ["Mia macchina è rossa", "La mia macchina è rossa", "articolo_possessivo"],
  ["Vado al medico", "Vado dal medico", "preposizione"],
  ["Vivo in Roma", "Vivo a Roma", "preposizione"],
  ["Vivo a Italia", "Vivo in Italia", "preposizione"],
  ["Studio qui per due anni", "Studio qui da due anni", "preposizione"],
  ["Io fino il lavoro", "Io finisco il lavoro", "irregolare"],
  ["Maria è andato a casa", "Maria è andata a casa", "participio_accordo"],
  ["Vedo lo", "Lo vedo", "posizione_pronome"],
  ["le case bianchi", "le case bianche", "accordo"],
  ["Cerci le chiavi?", "Cerchi le chiavi?", "ortografia"],
  ["Domani andrò se potrei", "Domani andrò se potrò", "tempo_verbale"],
  ["Andrò al cinema se ho tempo", "Andrei al cinema se avessi tempo", null],
  ["Mangiavo una pizza ieri sera", "Ho mangiato una pizza ieri sera", null]
];

CASES.forEach(function (c) {
  var d = D.diagnose(c[0], [c[1]]);
  if (c[2]) ok(d.cat === c[2], "«" + c[0] + "» → atteso " + c[2] + ", ottenuto " + d.cat);
  ok(d.verdict !== "giusto", "errore non visto: " + c[0]);
  ok(d.hint && d.explain, "manca indizio o spiegazione: " + c[0]);
  // The hint must not give the answer away.
  var fixedWords = d.fixed.filter(function (t) { return t.fix; }).map(function (t) { return t.w; });
  fixedWords.forEach(function (w) {
    if (w.length > 3) ok(d.hint.indexOf("*" + w + "*") < 0, "l'indizio rivela la risposta: " + c[0] + " / " + d.hint);
  });
});

// Correct answers stay correct: punctuation, case and apostrophes.
[["ciao, come stai", "Ciao, come stai?"], ["L'ho visto ieri", "L'ho visto ieri."],
 ["dov'è il bagno", "Dov'è il bagno?"], ["È tardi", "è tardi"]].forEach(function (c) {
  ok(D.diagnose(c[0], [c[1]]).verdict === "giusto", "risposta giusta rifiutata: " + c[0]);
});
ok(D.diagnose("parlero", ["parlerò"]).verdict === "quasi", "l'accento mancante è una svista");
ok(D.diagnose("Io mangio", ["Mangio"]).verdict === "quasi", "il soggetto in più è una svista");
ok(D.diagnose("", ["Mangio"]).verdict === "sbagliato", "risposta vuota");
ok(D.diagnose("ho mangiato", ["Ho mangiato una pizza.", "ho mangiato"]).verdict === "giusto",
   "si confronta con la variante più vicina");

/* ------------------------------ errori iniettati nelle frasi della banca */

var ESS2AV = { sono: ["ho", "hanno"], sei: ["hai"], "è": ["ha"], siamo: ["abbiamo"], siete: ["avete"],
               ero: ["avevo"], era: ["aveva"], eravamo: ["avevamo"], erano: ["avevano"] };
var SPANISH = { molto: "muy", anche: "tambien", sempre: "siempre", quando: "cuando",
                dove: "donde", niente: "nada", adesso: "ahora", dopo: "despues", con: "con",
                oggi: "hoy", ieri: "ayer", domani: "mañana", tutto: "todo", mai: "nunca" };

function inject(sentence) {
  var toks = sentence.split(" "), out = [];
  var core = function (t) { return t.replace(/[.,;:!?«»"]/g, ""); };
  toks.forEach(function (t, i) {
    var w = core(t), low = w.toLowerCase(), next = core(toks[i + 1] || "").toLowerCase();
    var put = function (repl, cat) {
      var copy = toks.slice();
      copy[i] = t.replace(w, repl);
      out.push({ bad: copy.join(" "), cat: cat, what: w + "→" + repl });
    };
    // aux essere → avere before a participle
    if (ESS2AV[low] && D.participleOf(next)) {
      put(/[ie]$/.test(next) && low === "sono" ? "hanno" : ESS2AV[low][0], "ausiliare");
    }
    // accent dropped (a slip)
    if (/[àèìòù]$/.test(low) && low.length > 3) put(w.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), "accento");
    // double consonant simplified
    if (/([bcdfglmnprstvz])\1/.test(low) && low.length > 4 && !/^(ss|zz)/.test(low)) {
      put(w.replace(/([bcdfglmnprstvz])\1/, "$1"), "doppie");
    }
    // article il/lo swapped
    if (low === "lo" && /^(s[bcdfgmnpqtv]|z|gn|ps)/.test(next)) put("il", "articolo");
    // articulated preposition split up
    var split = { al: "a il", del: "de il", nel: "in il", dal: "da il", sul: "su il",
                  alla: "a la", della: "di la", nella: "in la" }[low];
    if (split) put(split, "preposizione_articolata");
    // Spanish word
    if (SPANISH[low] && SPANISH[low] !== low) put(SPANISH[low], "parola_spagnola");
    // person of the verb
    var forms = D.verbForms(low).filter(function (f) { return f.tense === "presente"; });
    if (forms.length && low.length > 2 && i > 0) {
      var f = forms[0];
      try {
        var all = Conj.conjugate(f.lemma, "presente").map(function (x) { return x.split(" ").pop(); });
        var other = all[(f.p + 3) % 6];
        if (other && other !== low && D.verbForms(other).length) put(other, "persona_verbale");
      } catch (e) { /* */ }
    }
  });
  return out;
}

var ALT = {
  parola_spagnola: ["parola_spagnola", "ortografia", "accento", "lessico"],
  persona_verbale: ["persona_verbale", "tempo_verbale", "congiuntivo", "irregolare", "accordo", "piacere"],
  doppie: ["doppie", "refuso"],
  accento: ["accento"],
  articolo: ["articolo", "genere"],
  ausiliare: ["ausiliare"],
  // A closer accepted variant may have another preposition (sopra il, il fine settimana).
  preposizione_articolata: ["preposizione_articolata", "preposizione", "parola_in_piu", "falso_amico"]
};

if (bank) {
  var tally = {};
  bank.sentences.forEach(function (s) {
    inject(s.it[0]).forEach(function (x) {
      var d = D.diagnose(x.bad, s.it);
      var t = tally[x.cat] || (tally[x.cat] = { n: 0, hit: 0, seen: 0, miss: [] });
      t.n++;
      if (d.verdict !== "giusto") t.seen++;
      if ((ALT[x.cat] || [x.cat]).indexOf(d.cat) >= 0) t.hit++;
      else if (t.miss.length < 4) t.miss.push(x.what + " in «" + s.it[0] + "» → " + d.cat);
    });
  });
  console.log("errori iniettati nelle frasi della banca:");
  Object.keys(tally).forEach(function (k) {
    var t = tally[k];
    console.log("  " + (k + "                         ").slice(0, 26) + t.hit + "/" + t.n +
      " diagnosticati bene (" + Math.round(t.hit / t.n * 100) + "%), visti come errore " + t.seen + "/" + t.n);
    ok(t.seen / t.n >= 0.97, k + ": errori non visti " + (t.n - t.seen));
    ok(t.hit / t.n >= 0.85, k + ": diagnosi giusta solo nel " + Math.round(t.hit / t.n * 100) + "%");
    if (t.hit / t.n < 0.95) t.miss.forEach(function (m) { console.log("      es.: " + m); });
  });

  // Every accepted translation is accepted, and every bank error sentence is
  // recognised as wrong.
  bank.sentences.forEach(function (s) {
    s.it.forEach(function (v) {
      ok(D.diagnose(v, s.it).verdict === "giusto", "variante rifiutata: " + v);
    });
  });
  var errSeen = 0, errCat = 0;
  bank.errors.forEach(function (e) {
    var d = D.diagnose(e.wrong, [e.right]);
    if (d.verdict !== "giusto") errSeen++;
    if (d.cat === e.cat || (e.cat === "genere" && d.cat === "articolo") ||
        (e.cat === "articolo" && d.cat === "genere")) errCat++;
  });
  console.log("frasi di «trova l'errore»: viste come errore " + errSeen + "/" + bank.errors.length +
              ", stessa categoria dell'autore " + errCat + "/" + bank.errors.length);
  ok(errSeen === bank.errors.length, "ogni frase sbagliata è vista come sbagliata");

  /* generatori della banca */
  var st = { unlocked: 52, cards: {} };
  ["vocabSession", "formsSession", "translateSession", "gapSession", "errorSession"].forEach(function (fn) {
    for (var r = 0; r < 20; r++) {
      Banca[fn](st, 12).forEach(function (it) {
        ok(it && it.id && it.answer !== undefined, fn + ": item malformato");
        if (it.type === "choice") ok(it.options.indexOf(it.answer) >= 0, fn + ": opzione giusta assente " + it.id);
        if (it.type === "typed" || it.type === "translate") {
          ok(D.diagnose(it.answer, it.accept).verdict === "giusto", fn + ": la risposta attesa è rifiutata: " + it.id + " " + it.answer);
        }
        ok(Banca.item(it.id) !== null, fn + ": l'item non si rigenera dal suo id: " + it.id);
      });
    }
  });
  // Articles computed from the bank agree with the rules.
  ok(Banca.defArt("zaino", "m") === "lo" && Banca.defArt("studenti", "m", true) === "gli" &&
     Banca.defArt("amica", "f") === "l'" && Banca.defArt("uova", "f", true) === "le", "articoli calcolati");
  ok(Banca.CONTR.in.lo === "nello" && Banca.CONTR.di.gli === "degli", "preposizioni articolate");

  st.errs = { ausiliare: { n: 5, fixed: 0, last: Date.now() }, preposizione: { n: 3, fixed: 0, last: Date.now() } };
  var cl = Banca.clinicaSession(st, 12);
  ok(cl.length >= 8, "la clinica prepara una sessione: " + cl.length);
  ok(cl.filter(function (x) { return x.clinic === "ausiliare"; }).length >=
     cl.filter(function (x) { return x.clinic === "preposizione"; }).length, "la clinica pesa di più l'errore più frequente");
} else {
  console.log("(docs/data/bank.json assente: test della banca saltati)");
}

/* ------------------------------------------- tentativi di romperla */

// Words that are also JavaScript property names must not break anything.
// Real-world typing and the learner's own gender
[["sono stanca", "Sono stanco.", "giusto"], ["Ieri sono andata a casa", "Ieri sono andato a casa.", "giusto"],
 ["Sei pronta?", "Sei pronto?", "giusto"], ["siamo arrivate", "Siamo arrivati.", "giusto"],
 ["Maria è andato a casa", "Maria è andata a casa.", "sbagliato"], ["Lei è stanco", "Lei è stanca.", "sbagliato"],
 ["Ti è piaciuta il film?", "Ti è piaciuto il film?", "sbagliato"], ["La casa è bello", "La casa è bella.", "sbagliato"],
 ["Tutti le mattine bevo un caffè", "Tutte le mattine bevo un caffè.", "sbagliato"],
 ["L'amico di Marco \u00e8\u200b arrivato", "L'amico di Marco è arrivato.", "giusto"],
 ["L'amico di Marco è arrivato 😀", "L'amico di Marco è arrivato.", "giusto"],
 ["L' amico di Marco è arrivato", "L'amico di Marco è arrivato.", "giusto"]
].forEach(function (c) {
  var d = D.diagnose(c[0], [c[1]]);
  ok(d.verdict === c[2], "«" + c[0] + "» dovrebbe essere " + c[2] + ", è " + d.verdict + " " + d.cat);
});
ok(D.diagnose("L'amico e' arrivato", ["L'amico è arrivato."]).cat === "accento", "e' per è = accento");
ok(D.diagnose("Lei è stanco", ["Lei è stanca."]).cat === "accordo", "stanco/stanca è accordo, non persona");
ok(D.diagnose("Le ragazze sono partiti", ["Le ragazze sono partite."]).cat === "participio_accordo", "partiti/partite dopo essere");

["constructor", "__proto__", "toString", "hasOwnProperty", "valueOf", "prototype"].forEach(function (w) {
  ["Ieri sono andato al cinema.", w, "__proto__"].forEach(function (t) {
    var ok1 = true;
    try { D.diagnose(w, [t]); D.diagnose(t, [w]); } catch (e) { ok1 = false; }
    ok(ok1, "la diagnosi si rompe con «" + w + "» / «" + t + "»");
  });
});
// Garbage input never throws and never prints undefined/NaN.
["", "   ", "<script>alert(1)</script>", "😀😀", "a".repeat(3000), "\x27\x27\x27", ".,;:!?", "l\x27 l\x27 l\x27", "\u0000"].forEach(function (w) {
  var d = null;
  try { d = D.diagnose(w, ["Ho mangiato una pizza."]); } catch (e) { /* */ }
  ok(d && d.verdict, "input assurdo non gestito: " + JSON.stringify(w).slice(0, 20));
  if (d && d.hint) ok(!/undefined|NaN|\[object/.test(d.hint + d.explain), "testo rotto con input assurdo");
});

if (bank) {
  // Random typing slips on every sentence: never a crash, always a hint.
  var seed = 7;
  var rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  var crashes = 0, noHint = 0;
  bank.sentences.forEach(function (s) {
    for (var r = 0; r < 3; r++) {
      var a = s.it[0].split("");
      var k = Math.floor(rnd() * a.length);
      a.splice(k, 1, rnd() < 0.5 ? "" : "x");
      try {
        var d = D.diagnose(a.join(""), s.it);
        if (d.verdict !== "giusto" && (!d.hint || !d.explain)) noHint++;
      } catch (e) { crashes++; }
    }
  });
  ok(crashes === 0, "la diagnosi si rompe su frasi mutate: " + crashes);
  ok(noHint === 0, "errori senza indizio: " + noHint);

  // A first-attempt hint never names the corrected word (binary choices like
  // «¿di o che?» aside).
  var leaks = 0;
  bank.errors.forEach(function (e) {
    var d = D.diagnose(e.wrong, [e.right]);
    if (d.cat === "comparativo") return;
    d.fixed.filter(function (t) { return t.fix && t.w.length > 2; }).forEach(function (t) {
      if (d.hint.toLowerCase().indexOf("*" + t.w + "*") >= 0) leaks++;
    });
  });
  ok(leaks === 0, "indizi che rivelano la risposta: " + leaks);

  // Every gap is cut where the word really is (not «è» inside «caffè»).
  bank.sentences.forEach(function (s, i) {
    if (!s.gap) return;
    var it = Banca.gapItem(i);
    ok(it && it.stem.replace(/___ \([^)]*\)/, it.answer) === s.it[0], "buco sbagliato in: " + s.it[0]);
  });
}

console.log("\ncontrolli: " + checks + "   errori: " + fails);
process.exit(fails ? 1 : 0);
