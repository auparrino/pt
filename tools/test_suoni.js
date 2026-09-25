/* Suoni, dictogloss e capa de frecuencia: datos íntegros, sesiones que se
   arman, puntuación del dictogloss, cobertura y verificador léxico.
   Run: node tools/test_suoni.js  */
var fs = require("fs"), path = require("path");
var ROOT = path.join(__dirname, "..");
var Engine = require(path.join(ROOT, "docs/js/engine.js"));
var Frasi = require(path.join(ROOT, "docs/js/frasi.js"));
var Banca = require(path.join(ROOT, "docs/js/banca.js"));
Banca.load(JSON.parse(fs.readFileSync(path.join(ROOT, "docs/data/bank.json"), "utf8")));
var A = require(path.join(ROOT, "docs/js/ascolto_data.js"));
var Dg = require(path.join(ROOT, "docs/js/dictogloss_data.js"));
var S = require(path.join(ROOT, "docs/js/suoni.js"));
var F = require(path.join(ROOT, "docs/js/frequenza.js"));
var Es = require(path.join(ROOT, "docs/js/esame_data.js"));
var L = require(path.join(ROOT, "docs/js/letture.js"));
var fails = 0, checks = 0;
function ok(cond, what) { checks++; if (!cond) { fails++; console.log("FAIL " + what); } }

/* ---------------------------------------------------------- ascolto */
var ids = {};
[].concat(A.PAIRS, A.CONNESSO, A.INTONAZIONE, A.ACCENTO).forEach(function (x) {
  ok(!ids[x.id], "id duplicato: " + x.id); ids[x.id] = 1;
  ok(x.week >= 1 && x.week <= 52, "settimana fuori range: " + x.id);
  if (x.options) ok(x.options.indexOf(x.answer) >= 0 && new Set(x.options).size === x.options.length, "opzioni: " + x.id);
});
ok(A.PAIRS.length >= 150, "almeno 150 coppie: " + A.PAIRS.length);
A.PAIRS.forEach(function (p) {
  ok(p.a !== p.b && p.es && p.es.length === 2 && p.cat, "coppia incompleta: " + p.id);
  if (p.written) ok(p.written.length === 2, "written: " + p.id);
});
var cats = {};
A.PAIRS.forEach(function (p) { cats[p.cat] = (cats[p.cat] || 0) + 1; });
ok(cats.geminate >= 50 && cats.affricate >= 20 && cats.palatali >= 20 && cats.vocali >= 20, "categorie coperte: " + JSON.stringify(cats));
for (var w = 1; w <= 40; w++) ok(A.PAIRS.filter(function (p) { return p.week <= w; }).length >= 3 * Math.min(w, 10), "coppie disponibili alla settimana " + w);
ok(A.CONNESSO.filter(function (c) { return c.kind === "conta"; }).every(function (c) { return /^\d+$/.test(c.answer); }), "conta: risposta numerica");
ok(A.INTONAZIONE.every(function (x) { return (x.answer === "pregunta") === /\?$/.test(x.say); }), "intonazione: il punto interrogativo decide");

/* ---------------------------------------------------------- sessione */
var st = Engine.blankSave(); st.unlocked = 12;
var ses = S.session(st, 12, {});
ok(ses.length >= 10 && ses.length <= 14, "sessione di suoni: " + ses.length);
ok(ses.filter(function (x) { return x.type === "coppia"; }).length === 6, "sei coppie");
ok(ses.every(function (x) { return x.id && x.src === "ascolto" && x.answer && x.voice; }), "item completi");
ok(ses.some(function (x) { return x.type === "dictation" && x.dettato; }), "un dettato");
ok(S.session(st, 12, { silent: true }).every(function (x) { return x.type !== "dictation"; }), "in ufficio niente dettato");
// due cards first
st.cards["suoni:" + A.PAIRS[0].id] = { s: 1, d: 5, due: Date.now() - 1000, last: Date.now() - 86400000, reps: 1 };
var ses2 = S.session(st, 12, {});
ok(ses2.some(function (x) { return x.id === "suoni:" + A.PAIRS[0].id; }), "la coppia scaduta rientra");
ok(S.randomItem(st, 3) && S.randomItem(st, 3).src === "ascolto", "item per la pausa");
var sp = S.progress(12, st.cards);
ok(sp.total > 30 && sp.seen === 1, "progresso: " + JSON.stringify(sp));
// the pair item says one of the two and the answer is that one
for (var k = 0; k < 20; k++) {
  var pi = S.pairItem(A.PAIRS[k], k);
  var idx = pi.say === pi.pair.a ? 0 : 1;
  ok(pi.options[idx] === pi.answer, "la risposta è la parola detta: " + pi.id);
}

/* ------------------------------------------------ voci di Common Voice */
var CV = require(path.join(ROOT, "docs/js/voci_cv_data.js"));
var cvIds = {};
ok(CV.ALL.length >= 100, "almeno 100 frasi registrate: " + CV.ALL.length);
CV.ALL.forEach(function (x) {
  ok(!cvIds[x.f], "frase duplicata: " + x.f); cvIds[x.f] = 1;
  ok(fs.existsSync(path.join(ROOT, "docs", CV.url(x))), "manca l'audio: " + CV.url(x));
  ok(x.w >= 1 && x.w <= 52 && x.it.split(/\s+/).length >= 3, "frase o settimana: " + x.f);
  ok(!/["“”]|E' /.test(x.it), "virgolette o E' al posto di È: " + x.it);
  if (x.a) {
    ok(x.a !== x.b && x.b && x.why && x.fw >= x.w, "forma incompleta: " + x.f);
    ok(x.it.indexOf(x.a) >= 0, "la forma non è nella frase: " + x.it);
    var fi = S.formItem(x, 0);
    ok(fi.stem.indexOf("___") >= 0 && fi.stem.indexOf(x.a) < 0 && fi.options.indexOf(x.a) >= 0 &&
       fi.answer === x.a && fi.audio === CV.url(x), "item «¿Qué forma?»: " + x.f);
  }
});
// every mp3 in the folder is used (the discarded ones do not stay in the repo)
fs.readdirSync(path.join(ROOT, "docs/audio/cv")).forEach(function (f) {
  ok(cvIds[(/^common_voice_it_(\d+)\.mp3$/.exec(f) || [])[1]], "audio che nessuno usa: " + f);
});
ok(S.formPool(10).length === 0 && S.formPool(30).length >= 15, "le forme si aprono con la loro settimana");
ok(S.realFragments(12).every(function (x) { return x.audio; }), "dettato con voce reale");
var st30 = Engine.blankSave(); st30.unlocked = 30;
var ses30 = S.session(st30, 30, {});
ok(ses30.filter(function (x) { return x.type === "forma"; }).length === 1, "una «¿Qué forma?» per sessione");
ok(S.session(st30, 30, { silent: true }).every(function (x) { return x.type !== "forma"; }), "in ufficio niente forma");
var sawReal = false;
for (var r = 0; r < 30 && !sawReal; r++) sawReal = S.session(st30, 30, {}).some(function (x) { return x.type === "dictation" && x.audio; });
ok(sawReal, "il dettato usa le frasi registrate");

/* --------------------------------------------------------- dictogloss */
ok(Dg.TESTI.length === 47, "47 testi di dictogloss");
Dg.TESTI.forEach(function (t) {
  ok(t.chunks.length === 6, "sei blocchi: settimana " + t.week);
  t.chunks.forEach(function (c) {
    ok(S.chunkFound(c, t.text), "blocco nel testo: " + t.week + " / " + c);
  });
  ok(S.dgScore(t, t.text).pct === 100, "il testo intero recupera tutto: " + t.week);
  ok(S.dgScore(t, "ciao").found.length === 0, "niente non recupera niente: " + t.week);
});
ok(S.dgFor(13) === null && S.dgFor(11), "settimane di boss senza testo");
ok(S.chunkFound("ci vediamo domani", "ci vediamo poi domani") && !S.chunkFound("ci vediamo domani", "domani ci vediamo"), "ordine e finestra");

/* ---------------------------------------------------------- frequenza */
F.load(JSON.parse(fs.readFileSync(path.join(ROOT, "docs/data/frequenza.json"), "utf8")));
ok(F.loaded(), "frequenze caricate");
ok(F.level("casa") === "A1" && F.zipf("casa") > 5, "casa: A1 e frequente");
ok(F.lemma("mangiato") === "mangiare" && F.lemma("case") === "casa", "forme → lemma");
ok(F.zipf("magari") > 4 && F.zipf("comunque") > 4, "gli avverbi discorsivi hanno frequenza orale");
var s2 = Engine.blankSave();
s2.cards["v:casa"] = { ok: 2 }; s2.cards["v:mangiare"] = { ok: 1 }; s2.cards["b:voc:libro"] = { ok: 1 };
var kn = F.knownLemmas(s2);
ok(kn.casa && kn.libro && !kn.mangiare, "un verbo serve tre successi");
var cov = F.coverage(kn);
ok(cov.fundamental[1] > 1500 && cov.fundamental[0] >= 2, "copertura: " + JSON.stringify(cov.fundamental));
var nw = F.nextWords(kn, "A1", 10);
ok(nw.length === 10 && nw.indexOf("casa") < 0 && nw.every(function (w) { return F.level(w) === "A1"; }), "parole frequenti che mancano: " + nw.join(","));
var mr = F.missRate("Il libro è sulla casa di Marco.", kn);
ok(mr.rate === 0, "frase con parole note e nomi: " + JSON.stringify(mr));
ok(F.missRate("Il fondaco era ingombro di bagattelle.", kn).rate > 0.5, "parole sconosciute contate");
for (var q = 0; q < 30; q++) { var ps = F.pseudo("finestra"); ok(ps && ps !== "finestra" && !F.info(ps) && /^[a-z]+$/.test(ps), "pseudoparola: " + ps); }
ok(F.sameBand("casa", 3).length === 3 && F.sameBand("casa", 3).every(function (w) { return F.pos(w) === "n"; }), "distrattori della stessa classe");

/* -------------------------------------------------------------- esame */
ok(Es.ascolto.length === 2 && Es.lettura.length === 2 && Es.scrittura.length === 2, "esame: due ascolti, due letture, due scritti");
Es.ascolto.forEach(function (a) {
  ok(a.turns.length >= 8 && a.questions.length === 8 && a.completa.length === 4, "ascolto completo: " + a.id);
  a.questions.forEach(function (qq) { ok(qq[1].indexOf(qq[2]) >= 0, "risposta fra le opzioni: " + a.id); });
  var all = a.turns.map(function (t) { return t[1]; }).join(" ").toLowerCase();
  a.completa.forEach(function (c) { ok(all.indexOf(String(c[1]).toLowerCase()) >= 0, "parola del completa nell'audio: " + a.id + "/" + c[1]); });
});
Es.lettura.forEach(function (l) {
  ok(l.paragraphs.length === 6 && l.titles.length === 8 && l.match.length === 6 && new Set(l.match).size === 6, "lettura: " + l.id);
  ok(l.vf.length === 8 && l.vf.every(function (v) { return typeof v[1] === "boolean"; }), "vero/falso: " + l.id);
});
/* ------------------------------------------------------- inondazioni */
var fl = L.ofSeries("flood");
ok(fl.length === 12, "12 inondazioni");
fl.forEach(function (e) { ok(L.huntTargets(e).length >= 8 && e.flood && e.flood.forms.length, "inondazione con almeno 8 forme: " + e.id); });

console.log("controlli: " + checks + "   errori: " + fails);
process.exit(fails ? 1 : 0);
