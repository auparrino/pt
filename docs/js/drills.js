/*
 * La fabbrica delle domande.  Trasforma il corso (item dei due manuali +
 * banco d'autore) e il coniugatore in round giocabili.
 */
(function (root) {
  "use strict";

  // In the browser conjugator.js has already put Conj on window; under Node
  // it is a plain module, so fall back to require().
  var Conj = root.Conj ||
    (typeof require === "function" ? require("./conjugator.js") : null);
  var Frasi = root.Frasi ||
    (typeof require === "function" ? require("./frasi.js") : null);
  var Lab = root.Lab ||
    (typeof require === "function" ? require("./lab.js") : null);
  var Banca = root.Banca ||
    (typeof require === "function" ? require("./banca.js") : null);
  var Duelli = root.Duelli ||
    (typeof require === "function" ? require("./duelli.js") : null);
  var Lez = root.Lezione ||
    (typeof require === "function" ? require("./lezione.js") : null);
  var Engine = root.Engine ||
    (typeof require === "function" ? require("./engine.js") : null);

  function shuffle(a, rnd) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor((rnd ? rnd() : Math.random()) * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function sample(a, n) { return shuffle(a).slice(0, n); }

  /* Variety: never-seen items first, then the ones due, then those seen
     longest ago.  What was answered well in the last two days only comes
     back if there is nothing else. */
  function pickFresh(pool, n, state) {
    var cards = (state && state.cards) || {};
    var now = Date.now(), DAY = 86400000;
    var rank = function (it) {
      var c = cards[it.id];
      if (!c) return 0 + Math.random();
      if (!c.due || c.due <= now) return 1 + Math.random();
      var last = c.last || (c.due - (c.interval || 0) * DAY);
      return now - last < 2 * DAY ? 4 + Math.random() : 2 + Math.random() + (c.due - now) / (365 * DAY);
    };
    // The same exercise can live under two ids (a book item and an authored
    // one: «amico → amici»): one session asks it once.
    var seen = {};
    return pool.filter(Boolean)
      .map(function (it) { return { it: it, r: rank(it) }; })
      .sort(function (a, b) { return a.r - b.r; })
      .filter(function (x) {
        var k = sameKey(x.it);
        if (seen[x.it.id] || seen[k]) return false;
        seen[x.it.id] = seen[k] = 1;
        return true;
      })
      .slice(0, n).map(function (x) { return x.it; });
  }
  function sameKey(it) {
    var stem = String(it.stem || "").toLowerCase();
    // a bare «___» says nothing: there the question is in the prompt
    if (!/[a-zà-ù]/.test(stem)) stem += "|" + String(it.prompt || "").toLowerCase();
    return "=" + stem + "|" + String(it.answer || "").toLowerCase();
  }

  // Bank items near the week's level, to top up a short week without repeating.
  function bankFill(state, n) {
    var out = [];
    if (!Banca || !Banca.loaded()) return out;
    for (var i = 0; i < n * 3 && out.length < n; i++) {
      var it = Banca.pausaItem(state);
      if (it && !out.some(function (o) { return o.id === it.id; })) out.push(it);
    }
    return out;
  }

  /* ------------------------------------------------ domande di coniugazione */

  var PERSON_LABEL = ["io", "tu", "lui/lei", "noi", "voi", "loro"];

  /* Verbs marked aux "both" (mancare, guarire, servire, salire...) take
     essere when intransitive: the essere forms are right too. */
  function otherAux(verb, tense) {
    var info = Conj.info(verb);
    if (info.aux !== "both" || info.refl || Conj.SIMPLE_TENSES.indexOf(tense) >= 0) return null;
    return Conj.conjugate(verb, tense, { aux: "essere" });
  }

  /* known: the tenses already taught (week.known).  Distractors come only
     from those, so a week-6 learner never sees a congiuntivo as an option. */
  // persons: which persons make sense (piacere: only lui/lei and loro).
  function pickPerson(persons) {
    return persons && persons.length ? persons[Math.floor(Math.random() * persons.length)]
                                     : Math.floor(Math.random() * 6);
  }

  function conjugationDrill(verb, tense, known, persons) {
    var forms = Conj.conjugate(verb, tense);
    var alt = otherAux(verb, tense);
    var p = pickPerson(persons);
    var answer = forms[p];

    // Distractors: the same verb in other persons, then the same person in
    // other tenses — the mistakes a learner actually makes.  Several persons
    // often share a form (parli/parli/parli), so the pool must be deduped or
    // the same option shows up twice.
    var pool = [];
    function add(f) {
      if (f && f !== answer && pool.indexOf(f) < 0 &&
          !(alt && alt.indexOf(f) >= 0)) pool.push(f);
    }
    forms.forEach(add);
    var tenses = known && known.length ? known : Conj.ALL_TENSES;
    shuffle(tenses).forEach(function (t) {
      if (t === tense || pool.length >= 8) return;
      try { add(Conj.conjugate(verb, t)[p]); } catch (e) { /* non coniugabile */ }
    });
    // Last resort: other persons of other tenses, so we always reach 4 options.
    shuffle(tenses).forEach(function (t) {
      if (pool.length >= 3) return;
      try {
        Conj.conjugate(verb, t).forEach(add);
      } catch (e) { /* non coniugabile */ }
    });

    var options = shuffle(sample(pool, 3).concat([answer]));
    var info = Conj.info(verb);
    return {
      id: "conj:" + verb + ":" + tense + ":" + p,
      src: "coniugatore",
      type: "choice",
      topic: "coniugazione",
      prompt: "Conjugá «" + verb + "» (" + info.es + ") — " +
              Conj.TENSE_LABELS[tense],
      stem: PERSON_LABEL[p] + " ___",
      options: options,
      answer: answer,
      accept: alt ? [answer, alt[p]] : [answer],
      note: verb + " · " + Conj.TENSE_LABELS[tense] + ": " + forms.join(", ") +
            (alt ? " (o con essere: " + alt.join(", ") + ")" : "")
    };
  }

  function conjugationTyped(verb, tense, persons) {
    var forms = Conj.conjugate(verb, tense);
    var alt = otherAux(verb, tense);
    var p = pickPerson(persons);
    var info = Conj.info(verb);
    return {
      id: "conjw:" + verb + ":" + tense + ":" + p,
      src: "coniugatore",
      type: "cloze",
      topic: "coniugazione",
      prompt: "Escribí la forma de «" + verb + "» (" + info.es + ") — " +
              Conj.TENSE_LABELS[tense],
      stem: PERSON_LABEL[p] + " ___ (" + verb + ")",
      answer: forms[p],
      accept: alt ? [forms[p], alt[p]] : [forms[p]],
      note: verb + " · " + Conj.TENSE_LABELS[tense] + ": " + forms.join(", ") +
            (alt ? " (o con essere: " + alt.join(", ") + ")" : "")
    };
  }

  /* ------------------------------------------ riconoscere prima di produrre */

  /* The first time an exercise shows up, you recognise the answer among
     options; from the second time on, you write it (recognition before
     production: Nation 2013, and the project guide).  The options are the
     errors a Spanish speaker makes (accent, double consonant, ending,
     article: Lezione.traps) or answers of the same week that look alike.
     The id stays the same, so the SRS card is the one of the exercise. */
  var TYPED = { cloze: 1, translate: 1, conjugate: 1, plural: 1, numbers: 1, qa: 1, typed: 1 };

  function norm(x) {
    return String(x).toLowerCase().replace(/[’]/g, "'").replace(/[.,!?¿¡;:«»"]/g, "").replace(/\s+/g, " ").trim();
  }

  /* Distractors that test the rule, not the eye: wrong forms of the same
     word (fantasme, fantasmas, fantasma), the other articles of the same
     number, the other forms of an articulated preposition.  «cani / temi /
     baci» next to «fantasmi» gives itself away by mere resemblance. */
  var ART_SG = ["il", "lo", "la", "l'", "un", "uno", "una", "un'"], ART_PL = ["i", "gli", "le"];
  var PREP_ART = { a: ["al", "allo", "alla", "all'", "ai", "agli", "alle"],
                   di: ["del", "dello", "della", "dell'", "dei", "degli", "delle"],
                   da: ["dal", "dallo", "dalla", "dall'", "dai", "dagli", "dalle"],
                   in: ["nel", "nello", "nella", "nell'", "nei", "negli", "nelle"],
                   su: ["sul", "sullo", "sulla", "sull'", "sui", "sugli", "sulle"] };
  var WORD_CLASSES = [
    ["chi", "che", "cosa", "come", "dove", "quando", "quanto", "quanta", "quanti", "quante", "quale", "quali", "perché"],
    ["a", "di", "da", "in", "su", "con", "per", "tra"],
    ["lo", "la", "li", "le", "gli", "ne", "ci"],
    ["mi", "ti", "si", "ci", "vi"],
    ["io", "tu", "lui", "lei", "noi", "voi", "loro"],
    ["san", "santo", "santa", "sant'"], ["buon", "buono", "buona", "buon'"], ["bel", "bello", "bella", "bell'", "bei", "begli", "belle"],
    ["gran", "grande", "grand'", "grandi"],
    ["me", "te", "lui", "lei", "noi", "voi", "loro", "sé"],
    ["mio", "mia", "miei", "mie", "tuo", "tua", "tuoi", "tue", "suo", "sua", "suoi", "sue", "nostro", "nostra", "nostri", "nostre", "vostro", "vostra", "vostri", "vostre", "loro"],
    ["questo", "questa", "questi", "queste", "quel", "quello", "quella", "quei", "quegli", "quelle"],
    ["ma", "però", "quindi", "perché", "invece", "infatti", "anche", "mentre", "siccome", "perciò", "comunque", "dunque", "tuttavia", "allora", "cioè", "oppure"],
    ["che", "cui", "chi", "il quale", "la quale"],
    ["niente", "nessuno", "mai", "più", "neanche", "affatto", "mica"],
    ["molto", "molta", "molti", "molte", "tanto", "troppo", "poco", "poca", "pochi", "poche"],
    ["sempre", "mai", "spesso", "già", "ancora", "appena", "ormai", "subito"]
  ];
  function wordVariants(it) {
    var ans = String(it.answer || "").trim().replace(/’/g, "'"), low = ans.toLowerCase(), out = [];
    if (!ans || /\s/.test(ans) || ans.length < 2) return out;
    var push = function (v) { if (v && v.toLowerCase() !== low && out.indexOf(v) < 0) out.push(v); };
    if (ART_SG.indexOf(low) >= 0) shuffle(ART_SG).forEach(push);
    else if (ART_PL.indexOf(low) >= 0) shuffle(ART_PL).forEach(push);
    Object.keys(PREP_ART).forEach(function (p) { if (PREP_ART[p].indexOf(low) >= 0) shuffle(PREP_ART[p]).forEach(push); });
    // A word of a closed class: the other members of the class (dove →
    // quando, come, quanto; ma → però, quindi), never another verb.
    WORD_CLASSES.forEach(function (cl) { if (cl.indexOf(low) >= 0) shuffle(cl).forEach(push); });
    // An imperative or infinitive with a pronoun glued on (Fagli, Lasciala):
    // the same verb with the other pronouns.
    var cm = /^(.{2,}?)(glielo|gliela|gli|lo|la|li|le|ne)$/.exec(low);
    if (cm && /_{3,}/.test(it.stem || "") && out.length < 3) {
      var st = cm[1], mono = /^(fa|da|di|sta|va)$/.test(st.replace(/(.)\1$/, "$1"));
      var st1 = st.replace(/([lnm])\1$/, "$1");
      ["lo", "la", "li", "le", "gli", "ne"].forEach(function (c) {
        if (c === cm[2]) return;
        var v = (mono && c !== "gli" ? st1 + c.charAt(0) : st1) + c;
        push(ans[0] !== low[0] ? v.charAt(0).toUpperCase() + v.slice(1) : v);
      });
    }
    if (out.length >= 3) return out;
    // Only for nouns, adjectives and articles: a verb form with another
    // vowel («siame» for «siamo») is not a form anybody writes, and the
    // diagnosis would then talk about agreement.  Verb items keep the pool
    // of other persons (step 3).
    var nominal = it.type === "plural" || /plural|singular|concordan|adjetiv|femenin|masculin|sustantiv|artículo/i.test(it.prompt || "");
    var m = /([a-zà-ù']+)\s*→/i.exec(it.stem || "") || /\(([a-zà-ù']+)\)/i.exec(it.stem || "");
    var base = m ? m[1] : null;
    if (it.type === "conjugate" || (!nominal && !base)) return out;
    // The word in the stem («fantasma → ___», «(parco)»): left unchanged, or
    // with the Spanish plural; then the answer with another ending vowel,
    // then without its double consonant.
    var itaW = root.Diagnosi && root.Diagnosi.util ? root.Diagnosi.util.isItalian : null;
    // «(mamá)», «(amiga)»: a Spanish gloss is not the word to transform.
    if (base && /[áéíóúñ]/.test(base)) base = null;
    if (base && itaW && !itaW(base.toLowerCase())) base = null;
    if (base && base.toLowerCase() !== low) { push(base); push(base + "s"); }
    var stem = ans.replace(/[aeio]$/, "");
    if (stem !== ans) shuffle(["a", "e", "i", "o"]).forEach(function (v) { push(stem + v); });
    var undoubled = ans.replace(/([bcdfglmnprstvz])\1/, "$1");
    if (undoubled !== ans) push(undoubled);
    return out;
  }

  function recognitionOf(it, pool, week) {
    if (!it || !TYPED[it.type] || /\|/.test(it.answer || "") || !it.answer) return null;
    var answer = String(it.answer);
    if (answer.length > 90) return null;
    var accepted = {};
    (it.accept || [answer]).forEach(function (a) { accepted[norm(a)] = 1; });
    var opts = [];
    function add(o) {
      if (o && !accepted[norm(o)] && opts.every(function (x) { return norm(x) !== norm(o); })) opts.push(o);
    }
    // 0. the alternatives the prompt itself names («o» (conjunción) o «ho»
    //    (verbo)): that contrast is the whole point of the exercise
    //    (only for a one- or two-word answer: a sentence is not «o» or «ho»)
    var itaQ = root.Diagnosi && root.Diagnosi.util ? root.Diagnosi.util.isItalian : function () { return true; };
    if (answer.trim().split(/\s+/).length <= 2)
      (String(it.prompt || "").match(/«([^»]{1,20})»/g) || []).forEach(function (q) {
        q = q.replace(/[«»]/g, "");
        // «vos», «usted»: Spanish named in the prompt is not an option
        if (q.split(/\s+/).every(function (w) { return itaQ(w.toLowerCase().replace(/’/g, "'")); })) add(q);
      });
    // 0b. a verb in parentheses («Tu ___ (frequentare)»): the other persons
    //     of that same verb in the same tense, never another verb.
    var infM = /\(([a-zà-ù]+(?:are|ere|ire|rre|rsi))\)/i.exec(it.stem || "");
    if (infM && Conj && opts.length < 3) {
      var inf = infM[1].toLowerCase(), forms = null;
      if (!Conj.VERBS[inf]) { try { Conj.register(inf, {}); } catch (e) { /* */ } }
      (Conj.ALL_TENSES || Conj.SIMPLE_TENSES).forEach(function (t) {
        if (forms) return;
        try {
          var f = Conj.conjugate(inf, t);
          if (f.some(function (x) { return norm(x) === norm(answer) || norm(x.split(" ").slice(1).join(" ")) === norm(answer) || norm(x.split(" ").pop()) === norm(answer); })) forms = f;
        } catch (e) { /* */ }
      });
      var multi = answer.trim().split(/\s+/).length;
      addForms(forms, multi);
    }
    // 0c. a conjugated form without the infinitive in sight (___ brutto
    //     tempo → fa): the other persons of the verb the answer belongs to.
    if (!infM && it.type === "conjugate" && Conj && root.Diagnosi && opts.length < 3) {
      var vf = root.Diagnosi.verbForms(norm(answer).split(" ").pop())[0];
      if (vf) { try { addForms(Conj.conjugate(vf.lemma, vf.tense), answer.trim().split(/\s+/).length); } catch (e) { /* */ } }
    }
    function addForms(forms, multi) {
      if (forms) shuffle(forms).forEach(function (x) {
        var xs = x.split(" ");
        if (opts.length < 3) add(xs.length > multi ? xs.slice(xs.length - multi).join(" ") : x);
      });
    }
    // 1. conjugation: the same verb in other persons
    if (it.src === "coniugatore" && Conj) {
      var m = /^conjw?:([^:]+):([^:]+):(\d)$/.exec(it.id);
      if (m) {
        try { shuffle(Conj.conjugate(m[1], m[2])).forEach(add); } catch (e) { /* no */ }
      }
    }
    // 2. the typical errors on the answer itself
    if (opts.length < 3 && Lez) {
      var itaOk = root.Diagnosi && root.Diagnosi.util ? root.Diagnosi.util.isItalian : null;
      var tr = Lez.traps(answer, Math.random, week || 52, itaOk);
      tr.slice(0, 3).forEach(add);
      // Only one mistake possible: the next option carries two.
      if (opts.length < 2 && tr.length) Lez.traps(tr[0], Math.random, week || 52, itaOk).slice(0, 2).forEach(add);
    }
    // 2b. the same word in another shape (never another word that merely
    //     looks like a plural next to the only plural of the right word)
    if (opts.length < 3 && it.src !== "coniugatore") {
      wordVariants(it).forEach(function (v) { if (opts.length < 3) add(v); });
    }
    // 3. answers of the same kind from the same week: same shape (a letter
    //    group against letter groups, never «ho» against «sc»), same topic
    //    when there is one, and the sentences that share most words first
    //    («Paolo ha caldo» against «Micia ha sete», not «La città è bella»).
    if (opts.length < 2 && pool) {
      var len = answer.length, short = len <= 4 && answer.indexOf(" ") < 0;
      var words = function (x) { return norm(x).split(" "); };
      var aw = words(answer);
      var shared = function (x) { return words(x).filter(function (w) { return aw.indexOf(w) >= 0; }).length; };
      var nWords = answer.trim().split(/\s+/).length;
      var cands = pool.filter(function (x) {
        if (!x || x.id === it.id || x.type !== it.type || !x.answer || /\|/.test(x.answer)) return false;
        var xa = String(x.answer);
        if (it.topic && x.topic && x.topic !== it.topic) return false;
        if (short) return xa.indexOf(" ") < 0 && Math.abs(xa.length - len) <= 2;
        // One word in a gap tests a rule: only a near miss of the same word.
        if (nWords === 1 && /_{3,}/.test(it.stem || "") && xa.indexOf(" ") < 0 &&
            Engine && Engine.editDistance && Engine.editDistance(norm(xa), norm(answer)) > Math.max(2, answer.length / 2)) return false;
        // «la gente» against «le genti» or «la casa», never against «appena»
        if (nWords <= 3 && xa.trim().split(/\s+/).length !== nWords) return false;
        // Another sentence only if it shares half the words: otherwise its
        // meaning gives the right one away.
        if (nWords >= 2 && shared(xa) < Math.ceil(nWords / 2)) return false;
        return Math.abs(xa.length - len) <= Math.max(4, len / 2);
      });
      shuffle(cands).sort(function (a, b) { return shared(b.answer) - shared(a.answer); })
        .slice(0, 6).forEach(function (x) { add(String(x.answer)); });
    }
    if (opts.length < 2) return null;
    var copy = {};
    Object.keys(it).forEach(function (k) { copy[k] = it[k]; });
    copy.type = "choice";
    copy.recog = true;
    copy.orig = it.type;
    copy.options = shuffle(opts.slice(0, 3).concat([answer]));
    copy.prompt = it.type === "translate" ? "¿Cuál es la traducción en italiano?" : it.prompt;
    // Said once, and only after a right answer: after a miss it reads as a threat.
    copy.recogNote = "La próxima vez esta la vas a escribir.";
    return copy;
  }

  // First sighting (no SRS card yet): recognition; otherwise as it is.
  function firstRecognize(list, state, week, pool) {
    var cards = (state && state.cards) || {};
    return list.map(function (it) {
      // phrases have their own ladder (tiles → memory): left alone
      if (!it || cards[it.id] || it.src === "frasi" || it.src === "lab" || it.src === "lettura") return it;
      return recognitionOf(it, pool || list, week) || it;
    });
  }

  /* -------------------------------------------------------- costruire round */

  function itemsById(course) {
    var map = {};
    course.items.forEach(function (it) { map[it.id] = it; });
    indexVocab(course);
    return map;
  }

  /* ---------------------------------------------------- palabras de la semana */

  /* Each week lists its new words (build_course.py: week.vocab, [italian,
     spanish, example]).  First you recognise the meaning among options, then
     you produce the word from the Spanish; the SRS card «v:<word>» brings it
     back in the ripasso like any other exercise. */
  var VOC = null;           // word → { v, week }

  function indexVocab(course) {
    VOC = {};
    (course.weeks || []).forEach(function (w) {
      (w.vocab || []).forEach(function (v) { VOC[v[0]] = { v: v, week: w.week }; });
    });
  }

  // What kind of word: verb, noun, adjective, adverb, expression.
  function wordKind(it, es) {
    var D = root.Diagnosi && root.Diagnosi.DATA;
    var first = String(es || "").split(/[,;/(]/)[0].trim().toLowerCase();
    if (/(are|ere|ire|rre|rsi)$/.test(it) && /(ar|er|ir|ír)(se|lo|la|le)?$/.test(first)) return "v";
    if (/^[¡¿]/.test(es || "")) return "x";
    if (/mente$/.test(it)) return "adv";
    if (D && D.nouns && (D.nouns[it] || D.nounsByPlural[it])) return "n";
    if ((D && D.adj && D.adj[it]) || /(at|ut|it)[oaie]$/.test(it) || /(oso|osa|ivo|iva|ico|ica)$/.test(it)) return "a";
    return "o";
  }
  // Closed fields by the Spanish meaning: numbers, days, colours, family…
  var FIELDS = [
    ["num", /^(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|veinte|treinta|cuarenta|cincuenta|cien|mil|millón|docena|centenar)\b/],
    ["ord", /^(primer[oa]?|segund[oa]|tercer[oa]?|cuart[oa]|quint[oa]|sext[oa]|séptim[oa]|octav[oa]|noven[oa]|décim[oa]|undécim[oa]|vigésim[oa]|centésim[oa]|último)\b/],
    ["dia", /^(lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b/],
    ["mes", /^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b/],
    ["hora", /^(mañana|tarde|noche|mediodía|medianoche|madrugada|hoy|ayer|anteayer|pasado mañana|esta noche)\b/],
    ["dir", /^(norte|sur|este|oeste|derecha|izquierda|derecho|arriba|abajo|adelante|atrás)\b/],
    ["color", /^(rojo|azul|verde|amarillo|blanco|negro|gris|marrón|rosa|violeta|celeste|naranja)\b/],
    ["fam", /^(madre|padre|hermano|hermana|hijo|hija|tío|tía|abuel[oa]|prim[oa]|espos[oa]|marido|mujer|novi[oa]|sobrin[oa]|niet[oa]|suegr[oa]|cuñad[oa]|mamá|papá|padres|parientes)\b/]];
  function fieldOf(es) {
    var e = String(es || "").toLowerCase().trim();
    for (var i = 0; i < FIELDS.length; i++) if (FIELDS[i][1].test(e)) return FIELDS[i][0];
    return null;
  }

  // The topic of a noun in the bank (casa, famiglia, cibo…).
  var TOPIC = null;
  function wordTopic(it) {
    if (!TOPIC) {
      TOPIC = {};
      var b = root.Banca && root.Banca.loaded() ? root.Banca.bank() : null;
      ((b && b.nouns) || []).forEach(function (n) { if (n[4]) { TOPIC[n[0]] = n[4]; TOPIC[n[2]] = n[4]; } });
    }
    return TOPIC[String(it).replace(/^(il|lo|la|l'|i|gli|le)\s+/, "")] || null;
  }
  function topicGlosses(topic, v) {
    var b = root.Banca && root.Banca.loaded() ? root.Banca.bank() : null;
    return ((b && b.nouns) || []).filter(function (n) { return n[4] === topic && n[0] !== v[0] && n[3] !== v[1]; })
      .map(function (n) { return n[3]; });
  }

  function vocabItem(word, state) {
    var e = VOC && VOC[word];
    if (!e) return null;
    var v = e.v, id = "v:" + v[0], card = state && state.cards && state.cards[id];
    if (!card) {
      // distractors: meanings of nearby weeks, never the same Spanish word
      var near = Object.keys(VOC).map(function (k) { return VOC[k]; }).filter(function (x) {
        return x.v[0] !== v[0] && x.v[1] !== v[1] && Math.abs(x.week - e.week) <= 3;
      });
      // Same field first (hermano among hija, tío, abuelo), then the same
      // kind of word: a verb among nouns, or «ventana» next to «hermano»,
      // gives itself away.
      var kind = wordKind(v[0], v[1]), topic = wordTopic(v[0]), fld = fieldOf(v[1]);
      // the whole list when the week has too few of the same kind
      var all = Object.keys(VOC).map(function (k) { return VOC[k]; }).filter(function (x) { return x.v[0] !== v[0] && x.v[1] !== v[1]; });
      var ranked = shuffle(all).map(function (x) {
        return { x: x, s: (fld && fieldOf(x.v[1]) === fld ? 8 : 0) + (topic && wordTopic(x.v[0]) === topic ? 4 : 0) +
                          (wordKind(x.v[0], x.v[1]) === kind ? 3 : 0) + (Math.abs(x.week - e.week) <= 3 ? 1 : 0) +
                          (Math.abs(x.v[1].length - v[1].length) <= 6 ? 1 : 0) };
      }).sort(function (a, b) { return b.s - a.s; });
      var opts = [v[1]];
      var field = topic ? topicGlosses(topic, v) : [];
      ranked.filter(function (r) { return r.s >= 4; }).forEach(function (r) { if (opts.length < 4 && opts.indexOf(r.x.v[1]) < 0) opts.push(r.x.v[1]); });
      shuffle(field).forEach(function (g) { if (opts.length < 4 && opts.indexOf(g) < 0) opts.push(g); });
      ranked.forEach(function (r) { if (opts.length < 4 && opts.indexOf(r.x.v[1]) < 0) opts.push(r.x.v[1]); });
      return { id: id, src: "vocab", type: "choice", topic: "vocabolario",
               prompt: "¿Qué significa?", stem: v[0], options: shuffle(opts), answer: v[1],
               accept: [v[1]], note: v[2] ? "Ejemplo: *" + v[2] + "*" : "", say: v[0] };
    }
    return { id: id, src: "vocab", type: "cloze", topic: "vocabolario",
             prompt: "¿Cómo se dice en italiano?", stem: "«" + v[1] + "» → ___", answer: v[0],
             accept: [v[0]], note: v[2] ? "Ejemplo: *" + v[2] + "*" : "", say: v[0] };
  }

  /* A word is met before it is asked (as the phrases are): a card with the
     word, its meaning, audio and the example, two or three items before the
     first question about it. */
  function wordIntro(v) {
    return { id: "vi:" + v[0], src: "vocab", type: "word", prompt: "Palabra nueva",
             stem: v[0], answer: v[0], word: v, say: v[0] };
  }
  function withWordIntros(list, state) {
    var cards = (state && state.cards) || {}, out = list.slice(), done = {};
    for (var i = 0; i < out.length; i++) {
      var it = out[i];
      if (!it || it.src !== "vocab" || it.type !== "choice" || cards[it.id] || done[it.id]) continue;
      var v = VOC && VOC[it.stem];
      if (!v) continue;
      done[it.id] = 1;
      var at = Math.max(0, i - 2);
      out.splice(at, 0, wordIntro(v.v));
      i++;
    }
    return out;
  }

  // The week's words, new ones first, plus a few of earlier weeks that are due.
  function vocabSession(course, week, state, size) {
    if (!VOC) indexVocab(course);
    var cards = (state && state.cards) || {}, now = Date.now();
    var own = (week.vocab || []).map(function (v) { return v[0]; });
    var fresh = own.filter(function (w) { return !cards["v:" + w]; });
    var known = own.filter(function (w) { return cards["v:" + w]; });
    var due = Object.keys(VOC).filter(function (w) {
      var c = cards["v:" + w];
      return VOC[w].week < week.week && c && c.due <= now;
    });
    return fresh.concat(shuffle(known), shuffle(due).slice(0, 4)).slice(0, size || 14)
      .map(function (w) { return vocabItem(w, state); }).filter(Boolean);
  }

  /* Un round mescola tre sorgenti in modo che nessuna sessione sia uguale:
     item dei manuali, banco d'autore e ginnastica di coniugazione. */
  function buildRound(course, week, opts) {
    opts = opts || {};
    var size = opts.size || 12;
    var map = opts.map || itemsById(course);
    var out = [];

    // The week's own items (book, authored and graded sfide), all of them
    // already within reach: build_course.py moves what needs later theory.
    // Listening needs sound: in silent mode (the office) it waits.
    var audible = function (it) { return it && !(opts.silent && it.type === "listen"); };
    var bookItems = (week.items || [])
      .map(function (id) { return map[id]; })
      .filter(audible)
      // a lesson in parts: only the exercises of the parts already read
      .filter(function (it) { return !opts.only || opts.only[it.id]; });
    // Review moved here from earlier weeks (a nouns exercise in passato
    // prossimo lands in week 17): a few per round, interleaved.
    var extra = (week.extra || [])
      .map(function (id) { return map[id]; })
      .filter(audible);

    // The gym weighs more when the week brings a new tense (gymShare, from
    // build_course.py); in review weeks it would only repeat «voi siete».
    // focus: the training of one part of the lesson asks that part and
    // nothing else (no verb gym, no review, no words of the week).
    var focus = !!opts.focus;
    var wantConj = focus ? 0 : Math.min(
      week.verbs && week.verbs.length ? Math.ceil(size * (week.gymShare || 0.35)) : 0,
      size
    );
    var wantBook = size - wantConj;
    var wantExtra = focus ? 0 : Math.min(extra.length, Math.round(wantBook / 4));

    pickFresh(bookItems, wantBook - wantExtra, opts.state).forEach(function (it) { out.push(it); });
    // What the last four weeks left unseen comes along, a couple per round,
    // so that three quarters of the course do not stay in the drawer.
    var cards = (opts.state && opts.state.cards) || {};
    var carry = [];
    (course.weeks || []).forEach(function (pw) {
      if (pw.week >= week.week || pw.week < week.week - 4 || pw.boss) return;
      (pw.items || []).forEach(function (id) { if (map[id] && !cards[id]) carry.push(map[id]); });
    });
    pickFresh(extra.concat(shuffle(carry).filter(audible)), wantExtra, opts.state).forEach(function (it) { out.push(it); });

    for (var i = 0; i < wantConj; i++) {
      var verb = week.verbs[Math.floor(Math.random() * week.verbs.length)];
      var tense = week.tenses[Math.floor(Math.random() * week.tenses.length)];
      try {
        out.push(i % 2 === 0 ? conjugationDrill(verb, tense, week.known, week.persons)
                             : conjugationTyped(verb, tense, week.persons));
      } catch (e) { /* salta i verbi non coniugabili in quel tempo */ }
    }

    // Short: top up with other items of the week, then from the big bank,
    // never with a repeat.
    if (out.length < size) {
      var inRound = {}; out.forEach(function (it) { inRound[it.id] = 1; });
      pickFresh(bookItems.concat(focus ? [] : extra).filter(function (it) { return !inRound[it.id]; }), size - out.length, opts.state)
        .forEach(function (it) { out.push(it); });
    }
    if (out.length < size && !focus) bankFill(opts.state, size - out.length).forEach(function (it) { out.push(it); });
    // two words of the week, interleaved with the grammar
    if (week.vocab && week.vocab.length && !focus) {
      var vs = vocabSession(course, week, opts.state || {}, 2);
      out = out.slice(0, size - vs.length).concat(vs);
    }
    return withWordIntros(firstRecognize(shuffle(out).slice(0, size), opts.state, week.week, bookItems), opts.state);
  }

  /* How badly the learner knows an item: a card that went back to zero or
     lost ease is weak; one never seen is unknown; a retired one is known. */
  function weakness(state, id) {
    var c = state && state.cards && state.cards[id];
    if (!c) return 1;
    if (Engine && Engine.retired && Engine.retired(c)) return 0;
    if (c.reps === 0 && c.seen) return 3;
    if ((c.d != null ? c.d >= 7 : (c.ease || 2.5) < 2.3)) return 2;
    return 0.5;
  }

  /* The season a boss closes (or the one a week belongs to). */
  function seasonWeeks(course, week) {
    var s = (course.seasons || []).filter(function (x) { return week.week >= x.weeks[0] && week.week <= x.weeks[1]; })[0];
    return s ? s.weeks : [1, week.week];
  }

  /* Before the boss: the season's items the learner failed (first) or has
     not met yet, from the weeks where the accuracy was lowest. */
  function weakItems(course, week, state, map) {
    map = map || itemsById(course);
    var sw = seasonWeeks(course, week), out = [], seen = {};
    course.weeks.forEach(function (w) {
      if (w.week < sw[0] || w.week > week.week) return;
      (w.items || []).forEach(function (id) {
        var it = map[id];
        if (!it || seen[id] || it.type === "listen") return;
        seen[id] = 1;
        var k = weakness(state, id);
        if (k >= 2) out.push({ it: it, k: k });
      });
    });
    return out.sort(function (a, b) { return b.k - a.k; }).map(function (x) { return x.it; });
  }

  function buildWeak(course, week, state, opts) {
    opts = opts || {};
    var map = opts.map || itemsById(course), size = opts.size || 15;
    var out = shuffle(weakItems(course, week, state, map).slice(0, size * 2)).slice(0, size);
    if (out.length < size) {
      var sw = seasonWeeks(course, week), have = {};
      out.forEach(function (it) { have[it.id] = 1; });
      var rest = [];
      course.weeks.forEach(function (w) {
        if (w.week < sw[0] || w.week > week.week) return;
        (w.items || []).forEach(function (id) { if (map[id] && !have[id] && map[id].type !== "listen") { have[id] = 1; rest.push(map[id]); } });
      });
      pickFresh(rest, size - out.length, state).forEach(function (it) { out.push(it); });
    }
    return firstRecognize(out, state, week.week);
  }

  /* Il boss pesca da tutte le settimane già sbloccate, non solo dall'ultima. */
  function buildBoss(course, week, state, opts) {
    opts = opts || {};
    var size = opts.size || (week.week === 52 ? 40 : 25);
    var map = opts.map || itemsById(course);
    // Half from the season it closes, a quarter from the one before, the
    // rest from anywhere earlier: the C1 exam examines C1, not «io sono».
    var season = (course.seasons || []).filter(function (s) { return week.week >= s.weeks[0] && week.week <= s.weeks[1]; })[0];
    var lo = season ? season.weeks[0] : 1;
    var prevLo = Math.max(1, lo - 13);
    var pools = { own: [], prev: [], old: [] };
    course.weeks.forEach(function (w) {
      if (w.week > week.week) return;
      (w.items || []).concat(w.extra || []).forEach(function (id) {
        var it = map[id];
        if (!it) return;
        var wk = it.wk || w.week;
        (wk >= lo ? pools.own : wk >= prevLo ? pools.prev : pools.old).push(it);
      });
    });
    // Inside a season, one week at a time in turn: the boss of week 13 asks
    // about every week of the season, not thirteen times about essere.
    // A week the learner got wrong more often gets more turns (up to three
    // per round), and inside each week what was failed comes first.
    var accOf = function (wk) {
      var ws = (state && state.weekStats && state.weekStats[wk]) || {};
      return ws.attempts >= 10 ? ws.right / ws.attempts : 0.85;
    };
    var byWeek = function (pool, n) {
      var groups = {};
      pool.forEach(function (it) { (groups[it.wk || 0] = groups[it.wk || 0] || []).push(it); });
      var keys = shuffle(Object.keys(groups)), picked = [], turns = [];
      keys.forEach(function (key) {
        groups[key] = shuffle(groups[key]).sort(function (a, b) { return weakness(state, a.id) - weakness(state, b.id); });
        var miss = 1 - accOf(+key);
        var t = miss > 0.3 ? 3 : miss > 0.2 ? 2 : 1;
        for (var x = 0; x < t; x++) turns.push(key);
      });
      var k = 0;
      while (picked.length < n && turns.length) {
        var key = turns[k % turns.length];
        if (groups[key].length) { picked.push(groups[key].pop()); k++; }
        else turns = turns.filter(function (t) { return t !== key; });
      }
      return picked;
    };
    var nBook = Math.ceil(size * 0.8);
    var out = byWeek(pools.own, Math.round(nBook * 0.5))
      .concat(byWeek(pools.prev, Math.round(nBook * 0.25)))
      .concat(byWeek(pools.old, nBook));
    var seenB = {};
    out = out.filter(function (it) { if (seenB[it.id]) return false; seenB[it.id] = 1; return true; });
    // The first boss has no earlier season: top up from its own season
    // rather than with conjugation drills.
    shuffle(pools.own.concat(pools.prev, pools.old)).forEach(function (it) {
      if (out.length < nBook && !seenB[it.id]) { seenB[it.id] = 1; out.push(it); }
    });
    out = out.slice(0, nBook);
    var verbs = week.verbs || [], tenses = week.tenses || ["presente"];
    while (out.length < size && verbs.length) {
      var v = verbs[Math.floor(Math.random() * verbs.length)];
      var t = tenses[Math.floor(Math.random() * tenses.length)];
      try { out.push(conjugationTyped(v, t)); } catch (e) { break; }
    }
    out = shuffle(out).slice(0, size);
    // One in five more: sentences of the bank never seen, on grammar already
    // taught, to see whether the rule generalises (reported apart).
    novelItems(state, Math.round(size * 0.2), out).forEach(function (it, k) {
      out.splice(Math.floor((k + 1) * out.length / 6), 0, it);
    });
    return out;
  }
  function novelItems(state, n, have) {
    if (!Banca || !Banca.loaded() || !n || !state) return [];
    var cards = state.cards || {}, seen = {};
    (have || []).forEach(function (it) { seen[sameKey(it)] = 1; });
    var pool = Banca.gapSession(state, 60).concat(Banca.translateSession(state, 60))
      .filter(function (it) { return it && !cards[it.id] && !seen[sameKey(it)]; });
    return shuffle(pool).slice(0, n).map(function (it) { return Object.assign({}, it, { novel: true }); });
  }

  /* Le frasi di conversazione vivono fuori dal corso: ogni ripasso ne
     rigenera l'esercizio, così la stessa frase torna in forma diversa. */
  function reviewItem(map, id, opts) {
    if (map[id]) return map[id];
    if (id.indexOf("v:") === 0) return vocabItem(id.slice(2), opts && opts.state);
    if (Frasi && Frasi.BY_ID[id]) return Frasi.pickItem(Frasi.BY_ID[id], opts);
    if (Lab && Lab.BY_ID[id]) return Lab.item(id);
    if (Banca && id.indexOf("b:") === 0) return Banca.item(id);
    if (Duelli && id.indexOf("duel:") === 0) return Duelli.reviewItem(id);
    return null;
  }

  function knownId(map, id) {
    return !!(map[id] || (id.indexOf("v:") === 0 && VOC && VOC[id.slice(2)]) || (Frasi && Frasi.BY_ID[id]) || (Lab && Lab.BY_ID[id]) ||
              (Banca && Banca.loaded() && id.indexOf("b:") === 0 && Banca.item(id)) ||
              (Duelli && id.indexOf("duel:") === 0 && !!Duelli.reviewItem(id)));
  }

  /* La coda del ripasso: schede scadute, le più in ritardo per prime. */
  /* La coda di ripasso: prima gli errori (reps 0), poi la settimana in
     corso, poi il resto per scadenza.  Le schede con 90 giorni di intervallo
     sono imparate e non tornano (niente arretrato di 2.000 schede). */
  /* Order: what was learnt last night (sleep in between: Mazza 2016) and
     the confident errors (hypercorrection), then the errors, then the
     current week, then the rest by due date; the cards in maintenance
     (months apart) last, at most MAINT_A_DAY a day, so the queue never
     becomes a debt. */
  var MAINT_A_DAY = 6;
  function dueList(map, state) {
    var now = Date.now(), week = (state && state.unlocked) || 1, due = [], today = Engine ? Engine.dayKey() : "";
    var maint = 0;
    Object.keys(state.cards).forEach(function (id) {
      var card = state.cards[id];
      if (!knownId(map, id) || !card.due || card.due > now) return;
      var isMaint = card.state === "maint" || (card.s == null && Engine && Engine.retired && Engine.retired(card));
      var pri = (card.night && card.night === today) || card.hyper ? -1
              : card.reps === 0 ? 0 : (map[id] && map[id].wk === week) ? 1 : isMaint ? 3 : 2;
      due.push({ id: id, due: card.due, pri: pri, maint: isMaint });
    });
    due.sort(function (a, b) { return a.pri - b.pri || a.due - b.due; });
    return due.filter(function (d) { if (!d.maint) return true; return ++maint <= MAINT_A_DAY; });
  }

  function buildReview(course, state, size, opts) {
    var map = (opts && opts.map) || itemsById(course);
    return dueList(map, state).slice(0, size || 20).map(function (d) {
      return reviewItem(map, d.id, Object.assign({ state: state }, opts));
    }).filter(Boolean);
  }

  function dueCount(course, state, map) {
    map = map || itemsById(course);
    return dueList(map, state).length;
  }

  /* Padronanza: l'85 % sulle ultime 30 risposte della settimana (finestra
     mobile, non lo storico), e almeno il 60 % del pool proprio visto. */
  function mastered(ws) {
    var l = (ws && ws.last) || [];
    if (l.length < 30) return false;
    var sum = 0; l.slice(-30).forEach(function (x) { sum += x; });
    return sum >= 26;
  }
  /* Dominala: one long session over the whole week, no lives, the unseen
     exercises first (so one pass also covers the week).  Written items stay
     written: mastering is producing, not recognising. */
  var DOMINA_SIZE = 30;
  function buildDomina(course, week, state, opts) {
    opts = opts || {};
    var map = opts.map || itemsById(course);
    var pool = (week.items || []).map(function (id) { return map[id]; })
      .filter(function (it) { return it && !(opts.silent && it.type === "listen"); });
    var out = pickFresh(pool, DOMINA_SIZE, state);
    if (out.length < DOMINA_SIZE) {
      var have = {};
      out.forEach(function (it) { have[sameKey(it)] = 1; });
      bankFill(state, DOMINA_SIZE - out.length).forEach(function (it) {
        if (!have[sameKey(it)]) { have[sameKey(it)] = 1; out.push(it); }
      });
    }
    return shuffle(out);
  }
  // The week is mastered by passing that session, or (saves from before it
  // existed) by 85 % over the last 30 answers with the week covered.
  function dominated(ws, week, state) {
    return !!(ws && ws.dominated) || (mastered(ws) && coverage(week, state).ok);
  }

  function coverage(week, state) {
    var cards = (state && state.cards) || {}, ids = week.items || [];
    var seen = ids.filter(function (id) { return cards[id]; }).length;
    return { seen: seen, total: ids.length, ok: ids.length === 0 || seen >= Math.min(40, Math.ceil(ids.length * 0.6)) };
  }

  /* La scena consigliata: la prima non ancora completata. */
  /* Il percorso è l'asse del corso: ogni scena di frasi ha la sua settimana,
     così le frasi arrivano quando la grammatica che usano è già stata vista
     (le opinioni con congiuntivo dopo la settimana 26, non il primo giorno). */
  var SCENE_WEEK = { ciao: 1, salva: 2, bar: 3, tavola: 4, giro: 5, casa: 6, lavoro: 7, negozi: 8,
                     reazioni: 9, ponti: 10, trappole: 12, chiacchiere: 14, cuore: 15, tempo: 19,
                     opinioni: 27, idee: 30, citazioni: 40, email: 42, dibattito: 44, aneddoto: 46, sportello: 48 };
  function sceneWeek(id) { return SCENE_WEEK[id] || 52; }
  function scenesOfWeek(week) {
    if (!Frasi) return [];
    return Frasi.SCENES.filter(function (s) { return sceneWeek(s.id) === week; });
  }

  /* La scena del momento: la prima incompleta fra quelle già raggiunte nel
     percorso.  Se sono tutte complete, l'ultima raggiunta (ripasso), mai una
     di una settimana futura. */
  function nextScene(state) {
    if (!Frasi) return null;
    var unlocked = Math.min((state && state.unlocked) || 1, 52);
    var cards = (state && state.cards) || {};
    var ordered = Frasi.SCENES.slice().sort(function (a, b) { return sceneWeek(a.id) - sceneWeek(b.id); });
    var reached = ordered.filter(function (s) { return sceneWeek(s.id) <= unlocked; });
    if (!reached.length) reached = ordered.slice(0, 1);
    for (var i = 0; i < reached.length; i++) {
      var p = Frasi.progress(reached[i].id, cards);
      if (p.seen < p.total) return reached[i];
    }
    return reached[reached.length - 1];
  }

  /* Pausa caffè: tre minuti.  Un po' di ripasso, due frasi nuove, qualche
     frase nota, una domanda del laboratorio e una della settimana.  Ogni frase
     nuova si presenta presto e si richiede dopo qualche domanda di mezzo:
     subito dopo la si ricorda "a vista", senza sforzo, e non serve
     (spacing dentro la sessione: Cepeda et al. 2006). */
  function buildPausa(course, state, week, opts) {
    opts = opts || {};
    var map = opts.map || itemsById(course);
    var review = buildReview(course, state, 4, { map: map, silent: opts.silent });
    var seenIds = {};
    review.forEach(function (it) { seenIds[it.id] = true; });

    var intros = [], drills = [], filler = review.slice();
    if (Frasi) {
      var sc = nextScene(state);
      Frasi.ofScene(sc.id).filter(function (f) {
        return !state.cards[f.id] && !seenIds[f.id];
      }).slice(0, 2).forEach(function (f) {
        intros.push({ id: f.id, frase: f, src: "frasi", type: "intro",
                      prompt: "Frase nueva", stem: f.it, answer: f.it, note: f.note });
        drills.push(Frasi.pickItem(f, { silent: opts.silent, fresh: true }));
        seenIds[f.id] = true;
      });
      shuffle(Frasi.ALL.filter(function (f) {
        return state.cards[f.id] && !seenIds[f.id];
      })).slice(0, 2).forEach(function (f) { filler.push(Frasi.pickItem(f, opts)); });
    }

    // Interleaving (Rohrer & Taylor 2007): una domanda del laboratorio.
    // week: the last week whose lesson the learner has read.  Before the
    // first lesson there is no grammar to practise: only phrases and words.
    if (Lab && week) filler.push(Lab.randomItem(state.cards, week.week));

    // Del libro solo domande a scelta: in pausa si va veloci.
    var bookChoice = ((week && week.items) || []).map(function (id) { return map[id]; })
      .filter(function (it) { return it && it.type === "choice" && !seenIds[it.id]; });
    var fresh = pickFresh(bookChoice, 2, state).filter(function (it) {
      var c = state.cards[it.id];
      return !c || !c.due || c.due <= Date.now();   // already known and not due: leave it
    });
    fresh.forEach(function (it) { filler.push(it); });
    if (week) bankFill(state, 2 - fresh.length).forEach(function (it) { filler.push(it); });
    if (week && week.verbs && week.verbs.length) {
      try {
        filler.push(conjugationDrill(
          week.verbs[Math.floor(Math.random() * week.verbs.length)],
          week.tenses[Math.floor(Math.random() * week.tenses.length)], week.known, week.persons));
      } catch (e) { /* salta */ }
    }
    filler = shuffle(filler);

    // intro A, 2 filler, intro B, 2 filler, drill A, 2 filler, drill B, rest.
    var out = [];
    function take(n) { for (var i = 0; i < n && filler.length; i++) out.push(filler.shift()); }
    if (intros[0]) out.push(intros[0]);
    take(2);
    if (intros[1]) out.push(intros[1]);
    take(2);
    if (drills[0]) out.push(drills[0]);
    take(2);
    if (drills[1]) out.push(drills[1]);
    take(filler.length);
    return firstRecognize(out.slice(0, 11), state, week ? week.week : 1);
  }

  /* Lampo: 60 secondi di scelte rapide castellano → italiano. */
  function lampoItem(state) {
    var pool = Frasi.ALL.filter(function (f) { return state.cards[f.id]; });
    if (pool.length < 8) pool = Frasi.ALL.slice(0, 40);
    var f = pool[Math.floor(Math.random() * pool.length)];
    var near = Frasi.similar(f, 3, "it"), far = [];
    return {
      id: f.id, frase: f, src: "frasi", type: "choice",
      prompt: "¿Cómo se dice?",
      stem: f.es,
      options: shuffle([f.it].concat(near.concat(far).map(function (g) { return g.it; }))),
      answer: f.it, accept: [f.it], note: f.note
    };
  }

  var api = {
    shuffle: shuffle,
    sample: sample,
    itemsById: itemsById,
    conjugationDrill: conjugationDrill,
    conjugationTyped: conjugationTyped,
    buildRound: buildRound,
    recognitionOf: recognitionOf,
    withWordIntros: withWordIntros,
    sceneWeek: sceneWeek,
    scenesOfWeek: scenesOfWeek,
    firstRecognize: firstRecognize,
    vocabSession: vocabSession,
    vocabItem: vocabItem,
    recognitionOf: recognitionOf,
    pickFresh: pickFresh,
    buildBoss: buildBoss,
    buildWeak: buildWeak,
    buildDomina: buildDomina,
    dominated: dominated,
    DOMINA_SIZE: DOMINA_SIZE,
    weakItems: weakItems,
    buildReview: buildReview,
    dueList: dueList,
    mastered: mastered,
    coverage: coverage,
    dueCount: dueCount,
    nextScene: nextScene,
    buildPausa: buildPausa,
    lampoItem: lampoItem
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Drills = api;
})(typeof window !== "undefined" ? window : globalThis);
