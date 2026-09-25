/*
 * La settimana: un texto corto por cada semana del curso, escrito a mano (no
 * con IA) (Jeon & Day 2016: la lectura extensiva rinde, d = 0,57).  Cada uno
 * usa la gramática de su semana y palabras ya vistas o glosadas, para leer
 * sin diccionario (Hu & Nation 2000: 98 % de cobertura).  Los controla
 * tools/check_letture.py (gramática y vocabulario por semana).
 */
(function (root) {
  "use strict";

  var TESTI = [
    { id: "w-02", week: 2, n: 1, level: "A1", emoji: "🍽️", title: "La cucina di Anna",
      grammar: "nomi: genere e numero",
      text:
        "Anna ha una cucina piccola ma bella. C'è un tavolo e ci sono quattro sedie. " +
        "Sopra il tavolo ci sono due bicchieri, tre piatti e un vaso con i fiori.\n\n" +
        "Il frigorifero è pieno: ci sono le uova, il latte, due formaggi e tante verdure. " +
        "Anna ha anche la pasta, il riso, lo zucchero e il caffè. Il caffè è importante: " +
        "in Italia la mattina è sacro!\n\n" +
        "Sopra il divano ci sono le foto di famiglia: i nonni, gli zii e i cugini. " +
        "In una foto c'è anche il cane, Otto. Otto è vecchio, ma è ancora il re di casa.",
      gloss: { bicchieri: "vasos", piatti: "platos", vaso: "florero", fiori: "flores", frigorifero: "heladera",
               pieno: "lleno", uova: "huevos", verdure: "verduras", divano: "sillón", sopra: "sobre, arriba de", cugini: "primos",
               cane: "perro", vecchio: "viejo", ancora: "todavía", sacro: "sagrado", re: "rey" },
      questions: [
        ["¿Cuántas sillas hay en la cocina?", ["cuatro", "dos", "tres", "seis"], "cuatro"],
        ["¿Qué hay en la heladera?", ["huevos, leche, quesos y verduras", "solo café", "pasta y arroz", "nada"], "huevos, leche, quesos y verduras"],
        ["¿Quién es Otto?", ["el perro", "el abuelo", "un primo", "el rey de Italia"], "el perro"]
      ],
      vf: [["Nella cucina ci sono quattro sedie.", "vero"], ["Il frigorifero è vuoto.", "falso"], ["Anna ha una cucina grande.", "falso"]],
      hunt: { label: "Tocá los sustantivos en plural", targets: ["sedie", "bicchieri", "piatti", "fiori", "uova", "formaggi", "verdure", "foto", "nonni", "zii", "cugini"] } },

    { id: "w-03", week: 3, n: 2, level: "A1", emoji: "🏘️", title: "La mia via",
      grammar: "articoli e preposizioni articolate",
      text:
        "Abito in una via tranquilla, vicino alla stazione. All'angolo c'è un bar: " +
        "il barista è un amico e il caffè è buono. Accanto al bar c'è lo studio di un dentista " +
        "e poi c'è un'edicola.\n\n" +
        "Nella piazza ci sono gli alberi e le panchine. La mattina ci sono degli anziani " +
        "con i giornali e dei bambini con lo zaino. Il sabato c'è il mercato: " +
        "c'è della frutta, c'è del pesce e ci sono dei fiori.\n\n" +
        "Dalla finestra vedo il campanile della chiesa. La sera la via è vuota " +
        "e c'è solo il rumore dell'acqua della fontana.",
      gloss: { via: "calle", tranquilla: "tranquila", angolo: "esquina", accanto: "al lado", edicola: "kiosco de diarios",
               panchine: "bancos (de plaza)", anziani: "ancianos", giornali: "diarios", zaino: "mochila",
               pesce: "pescado", campanile: "campanario", vuota: "vacía", rumore: "ruido",
               fontana: "fuente", vedo: "veo" },
      questions: [
        ["¿Qué hay en la esquina?", ["un bar", "una iglesia", "una estación", "un mercado"], "un bar"],
        ["¿Qué pasa los sábados?", ["hay mercado", "cierra el bar", "no hay nadie", "hay misa"], "hay mercado"],
        ["¿Cómo está la calle de noche?", ["vacía y tranquila", "llena de gente", "con música", "con tráfico"], "vacía y tranquila"]
      ],
      vf: [["Il barista è un amico.", "vero"], ["Il mercato c'è la domenica.", "falso"], ["La fontana è molto antica.", "non si dice"]],
      hunt: { label: "Tocá las preposiciones articuladas (alla, al, nella…)", targets: ["alla", "al", "nella", "della", "del", "dei", "degli", "dalla"] } },

    { id: "w-04", week: 4, n: 3, level: "A1", emoji: "👯", title: "Due sorelle diverse",
      grammar: "aggettivi",
      text:
        "Marta ed Elisa sono sorelle, ma sono molto diverse. Marta è alta e magra, " +
        "ha i capelli lunghi e neri e gli occhi verdi. È una ragazza seria e precisa. " +
        "Elisa è bassa, ha i capelli corti e biondi ed è sempre allegra.\n\n" +
        "Marta ama i vestiti eleganti e le scarpe nere. Elisa preferisce le magliette " +
        "colorate e i pantaloni comodi. Marta ha una macchina nuova; Elisa ha una bici rossa.\n\n" +
        "Però hanno una cosa in comune: sono due buone amiche e hanno un bel rapporto. " +
        "E tutte e due amano la pizza napoletana!",
      gloss: { sorelle: "hermanas", diverse: "distintas", magra: "flaca", capelli: "pelo", occhi: "ojos",
               bassa: "baja", corti: "cortos", allegra: "alegre", vestiti: "ropa, vestidos", scarpe: "zapatos",
               magliette: "remeras", colorate: "de colores", pantaloni: "pantalones", comodi: "cómodos", bici: "bici", comune: "común (in comune = en común)",
               rapporto: "relación", tutte: "todas (tutte e due = las dos)" },
      questions: [
        ["¿Cómo es Marta?", ["alta, flaca y seria", "baja y alegre", "rubia y de pelo corto", "desordenada"], "alta, flaca y seria"],
        ["¿Qué tiene Elisa?", ["una bici roja", "un auto nuevo", "zapatos negros", "vestidos elegantes"], "una bici roja"],
        ["¿Qué tienen en común?", ["son buenas amigas y aman la pizza", "el mismo pelo", "la misma ropa", "nada"], "son buenas amigas y aman la pizza"]
      ],
      vf: [["Marta ha i capelli biondi.", "falso"], ["Elisa ha una bici rossa.", "vero"], ["Marta ed Elisa abitano insieme.", "non si dice"]],
      hunt: { label: "Tocá los adjetivos de color", targets: ["neri", "verdi", "biondi", "nere", "colorate", "rossa"] } },

    { id: "w-06", week: 6, n: 4, level: "A1", emoji: "⏰", title: "Una giornata di Sara",
      grammar: "presente irregolare",
      text:
        "Sara fa l'infermiera e lavora in un ospedale di Torino. Esce di casa alle sei " +
        "e va al lavoro in autobus. Dice sempre che la mattina presto la città è molto bella.\n\n" +
        "In ospedale non può mai stare ferma: deve controllare i pazienti, dare le medicine " +
        "e parlare con i medici. A mezzogiorno beve un caffè veloce con i colleghi.\n\n" +
        "Il pomeriggio viene a casa stanca, ma la sera esce con gli amici. " +
        "\"Vuoi venire al cinema?\" chiede la sua amica Laura. \"Sì, vengo volentieri, " +
        "ma domani devo lavorare presto!\" risponde Sara.",
      gloss: { infermiera: "enfermera", ospedale: "hospital", ferma: "quieta", controllare: "controlar",
               pazienti: "pacientes", medici: "médicos", mezzogiorno: "mediodía", veloce: "rápido",
               colleghi: "compañeros de trabajo", stanca: "cansada", volentieri: "con gusto", presto: "temprano" },
      questions: [
        ["¿Cómo va Sara al trabajo?", ["en colectivo", "a pie", "en auto", "en tren"], "en colectivo"],
        ["¿Qué hace al mediodía?", ["toma un café rápido", "almuerza en casa", "duerme", "va al cine"], "toma un café rápido"],
        ["¿Por qué no puede quedarse hasta tarde?", ["mañana trabaja temprano", "está enferma", "no le gusta el cine", "no tiene plata"], "mañana trabaja temprano"]
      ],
      vf: [["Sara fa l'infermiera.", "vero"], ["Sara esce di casa alle otto.", "falso"], ["Laura lavora con Sara in ospedale.", "non si dice"]],
      hunt: { label: "Tocá los verbos irregulares (fa, esce, va, dice…)", targets: ["fa", "esce", "va", "dice", "può", "deve", "beve", "viene", "vuoi", "vengo", "devo"] } },

    { id: "w-07", week: 7, n: 5, level: "A1", emoji: "📅", title: "L'agenda di Paolo",
      grammar: "numeri, date e ora",
      text:
        "Oggi è lunedì dodici marzo e Paolo ha una settimana piena. Alle otto e mezza " +
        "ha una riunione in ufficio. Alle dieci e un quarto deve chiamare un cliente di Milano.\n\n" +
        "Martedì tredici è il compleanno di sua madre: compie sessantacinque anni. " +
        "Paolo compra una torta e ventiquattro rose rosse.\n\n" +
        "Mercoledì alle diciannove ha lezione di inglese e giovedì alle sette di mattina " +
        "va in palestra. Venerdì sedici prende per Napoli il treno delle quindici e quaranta.\n\n" +
        "Il biglietto costa trentotto euro. \"Che ore sono?\" chiede Paolo al collega. " +
        "\"Sono le nove meno cinque\". Paolo corre: è già in ritardo!",
      gloss: { riunione: "reunión", ufficio: "oficina", quarto: "cuarto",
               cliente: "cliente", compleanno: "cumpleaños", compie: "cumple", torta: "torta", palestra: "gimnasio",
               biglietto: "pasaje", collega: "compañero de trabajo", corre: "corre", ritardo: "retraso (in ritardo = tarde)" },
      questions: [
        ["¿A qué hora es la reunión del lunes?", ["a las ocho y media", "a las diez y cuarto", "a las siete", "a las nueve"], "a las ocho y media"],
        ["¿Cuántos años cumple la madre?", ["sesenta y cinco", "cincuenta y seis", "setenta", "sesenta"], "sesenta y cinco"],
        ["¿Cuánto cuesta el pasaje?", ["treinta y ocho euros", "veintiocho euros", "cuarenta euros", "dieciocho euros"], "treinta y ocho euros"]
      ],
      vf: [["Martedì è il compleanno della madre di Paolo.", "vero"], ["Paolo va in palestra il venerdì.", "falso"], ["Il treno per Napoli è in ritardo.", "non si dice"]],
      hunt: { label: "Tocá los números escritos en letras", targets: ["dodici", "otto", "dieci", "tredici", "sessantacinque", "ventiquattro", "diciannove", "sette", "sedici", "quindici", "quaranta", "trentotto", "nove", "cinque"] } },

    { id: "w-08", week: 8, n: 6, level: "A1", emoji: "🎙️", title: "Un'intervista alla radio",
      grammar: "domande e interrogativi",
      text:
        "Oggi alla radio c'è un'intervista con Luca, un giovane cuoco di Palermo.\n\n" +
        "\"Luca, chi è la persona speciale nella tua cucina?\" " +
        "\"Mia nonna, senza dubbio.\"\n" +
        "\"Dove lavori adesso?\" \"In un piccolo ristorante vicino al porto.\"\n" +
        "\"Quando apri la mattina?\" \"Alle undici, ma arrivo alle otto.\"\n" +
        "\"Che cosa cucini di solito?\" \"Pesce, soprattutto. E la pasta con le sarde.\"\n" +
        "\"Quanti clienti hai ogni sera?\" \"Circa cinquanta.\"\n" +
        "\"Perché fai questo lavoro?\" \"Perché amo il mare e amo le persone.\"\n" +
        "\"E come stai, dopo tante ore in cucina?\" \"Stanco, ma felice!\"",
      gloss: { intervista: "entrevista", giovane: "joven", cuoco: "cocinero", dubbio: "duda (senza dubbio = sin duda)",
               porto: "puerto", solito: "habitual (di solito = por lo general)", soprattutto: "sobre todo", sarde: "sardinas",
               circa: "más o menos", felice: "feliz" },
      questions: [
        ["¿Quién es la persona especial en su cocina?", ["su abuela", "su madre", "un cliente", "su jefe"], "su abuela"],
        ["¿Dónde trabaja?", ["en un restaurante cerca del puerto", "en un hotel", "en la radio", "en Milán"], "en un restaurante cerca del puerto"],
        ["¿Por qué hace este trabajo?", ["ama el mar y a la gente", "gana mucho", "no tiene otra opción", "por su padre"], "ama el mar y a la gente"]
      ],
      vf: [["Luca è un cuoco di Palermo.", "vero"], ["Il ristorante apre alle otto.", "falso"], ["Luca ha due figli.", "non si dice"]],
      hunt: { label: "Tocá las palabras interrogativas", targets: ["chi", "dove", "quando", "che", "quanti", "perché", "come"] } },

    { id: "w-10", week: 10, n: 7, level: "A2", emoji: "🎁", title: "Il regalo per la nonna",
      grammar: "pronomi personali",
      text:
        "Domenica è la festa della nonna Rosa e i nipoti preparano un regalo. " +
        "\"Le compriamo un libro?\" chiede Giulia. \"No, la nonna ha già tanti libri e non li legge più\", " +
        "risponde Marco.\n\n" +
        "\"Allora le regaliamo una pianta?\" \"Buona idea! La mettiamo sul balcone e lei la guarda ogni mattina.\"\n\n" +
        "Marco chiama il fioraio e gli chiede un'orchidea bianca. Il fioraio la prepara e " +
        "gli dice: \"La potete prendere sabato\".\n\n" +
        "Domenica la nonna apre il pacco e sorride: \"Ragazzi, mi fate sempre felice! " +
        "Vi voglio bene\". I nipoti la abbracciano forte.",
      gloss: { festa: "fiesta", nipoti: "nietos", regalo: "regalo", già: "ya", pianta: "planta", balcone: "balcón",
               fioraio: "florista", orchidea: "orquídea", pacco: "paquete", sorride: "sonríe",
               bene: "bien (vi voglio bene = los quiero)", abbracciano: "abrazan", forte: "fuerte" },
      questions: [
        ["¿Por qué no le regalan un libro?", ["ya tiene muchos y no los lee", "no le gusta leer", "son caros", "no hay librería"], "ya tiene muchos y no los lee"],
        ["¿Qué le regalan al final?", ["una orquídea blanca", "un libro", "una torta", "un viaje"], "una orquídea blanca"],
        ["¿Qué hace la abuela?", ["sonríe y les dice que los quiere", "llora", "se enoja", "no abre el paquete"], "sonríe y les dice que los quiere"]
      ],
      vf: [["La nonna ha già molti libri.", "vero"], ["I nipoti regalano un libro alla nonna.", "falso"], ["L'orchidea costa molto.", "non si dice"]],
      hunt: { label: "Tocá los pronombres de objeto (le, la, li, gli, mi, vi)", targets: ["le", "la", "li", "gli", "mi", "vi"] } },

    { id: "w-14", week: 14, n: 8, level: "A2", emoji: "🍕", title: "Gusti di famiglia",
      grammar: "piacere e verbi simili",
      text:
        "Nella famiglia Bianchi nessuno ha gli stessi gusti. A papà piace il calcio, " +
        "ma non gli piacciono i film romantici. A mamma piacciono i libri gialli e le passeggiate in montagna.\n\n" +
        "A Chiara, la figlia, piace ballare. Le piacciono la musica pop e i concerti. " +
        "Il fratello, Tommaso, preferisce i videogiochi: gli piace stare a casa.\n\n" +
        "La domenica è difficile decidere cosa fare. Ieri Chiara ha proposto il mare: " +
        "a tutti è piaciuta l'idea, tranne a Tommaso. Alla fine sono andati al mare " +
        "e Tommaso ha giocato sul telefono. \"Mi manca il mio computer!\" ha detto.",
      gloss: { gusti: "gustos", nessuno: "nadie", stessi: "mismos", gialli: "policiales (libri gialli = novelas policiales)",
               passeggiate: "caminatas", ballare: "bailar", concerti: "recitales", videogiochi: "videojuegos",
               decidere: "decidir", proposto: "propuesto", tranne: "excepto", manca: "extraña (me falta)" },
      questions: [
        ["¿Qué no le gusta al papá?", ["las películas románticas", "el fútbol", "la montaña", "la música"], "las películas románticas"],
        ["¿Qué le gusta a Tommaso?", ["los videojuegos", "bailar", "los libros", "la montaña"], "los videojuegos"],
        ["¿Qué extraña Tommaso en la playa?", ["su computadora", "a su mamá", "la pizza", "la montaña"], "su computadora"]
      ],
      vf: [["Al papà piace il calcio.", "vero"], ["A Tommaso piace andare al mare.", "falso"], ["La mamma va in montagna ogni settimana.", "non si dice"]],
      hunt: { label: "Tocá las formas de piacere y mancare", targets: ["piace", "piacciono", "piaciuta", "manca"] } },

    { id: "w-16", week: 16, n: 9, level: "A2", emoji: "😴", title: "Una mattina storta",
      grammar: "riflessivi al passato",
      text:
        "Ieri Giorgio non ha sentito la sveglia e si è svegliato alle otto e mezza. " +
        "Si è alzato di corsa, si è lavato in due minuti e non si è fatto la barba.\n\n" +
        "Si è vestito al buio e si è messo due calzini diversi: un calzino blu e un calzino verde. " +
        "Poi si è accorto che pioveva e non trovava l'ombrello.\n\n" +
        "In ufficio i colleghi si sono messi a ridere. Giorgio si è arrabbiato un po', " +
        "ma poi si è guardato i piedi e anche lui si è divertito.\n\n" +
        "La sera lui e sua moglie si sono seduti sul divano e si sono raccontati la giornata.",
      gloss: { sveglia: "despertador", corsa: "carrera (di corsa = a las corridas)", barba: "barba",
               buio: "oscuridad", calzini: "medias", pioveva: "llovía",
               ombrello: "paraguas", ridere: "reírse", arrabbiato: "enojado", piedi: "pies",
               divano: "sillón", raccontati: "contado (se contaron)", accorto: "dado cuenta" },
      questions: [
        ["¿Por qué se despertó tarde?", ["no oyó el despertador", "estaba enfermo", "era domingo", "se quedó sin luz"], "no oyó el despertador"],
        ["¿Qué tenía de raro?", ["dos medias distintas", "dos zapatos distintos", "la camisa al revés", "no tenía zapatos"], "dos medias distintas"],
        ["¿Cómo terminó el día?", ["contándose el día con su mujer", "enojado", "en la oficina", "sin cenar"], "contándose el día con su mujer"]
      ],
      vf: [["Giorgio si è svegliato tardi.", "vero"], ["Giorgio aveva due calzini uguali.", "falso"], ["Giorgio è arrivato in ufficio in ritardo.", "non si dice"]],
      hunt: { label: "Tocá los auxiliares de los reflexivos (è, sono)", targets: ["è", "sono"] } },

    { id: "w-17", week: 17, n: 10, level: "A2", emoji: "📦", title: "Il trasloco",
      grammar: "dimostrativi, possessivi, indefiniti",
      text:
        "Oggi Elena e Marco cambiano casa. Ci sono scatole dappertutto. " +
        "\"Di chi è questa scatola?\" chiede Marco. \"È mia: dentro ci sono i miei libri\".\n\n" +
        "\"E quella lì, vicino alla porta?\" \"Quella è tua: ci sono le tue scarpe e qualche maglione\".\n\n" +
        "Alcuni amici aiutano con i mobili. Ognuno porta qualcosa: Luca porta le sedie, " +
        "Anna porta quel vecchio specchio della nonna.\n\n" +
        "Alla fine della giornata sono tutti stanchi. \"Questo appartamento è perfetto\", dice Elena. " +
        "\"Sì, ma quelle scale... Nessuno vuole più portare niente!\" risponde Marco, e ride.",
      gloss: { scatole: "cajas", scatola: "caja", dappertutto: "por todas partes", dentro: "adentro",
               maglione: "pulóver", mobili: "muebles", ognuno: "cada uno", specchio: "espejo", scale: "escaleras",
               ride: "se ríe", appartamento: "departamento" },
      questions: [
        ["¿Qué hay en la caja de Elena?", ["sus libros", "zapatos", "platos", "ropa"], "sus libros"],
        ["¿Qué lleva Anna?", ["el espejo viejo de la abuela", "las sillas", "una caja de libros", "nada"], "el espejo viejo de la abuela"],
        ["¿De qué se queja Marco al final?", ["de las escaleras", "del departamento", "de los amigos", "del precio"], "de las escaleras"]
      ],
      vf: [["Nella scatola di Elena ci sono i libri.", "vero"], ["Luca porta lo specchio della nonna.", "falso"], ["Il nuovo appartamento è al quinto piano.", "non si dice"]],
      hunt: { label: "Tocá los demostrativos (questa, quella, quel…)", targets: ["questa", "quella", "quel", "questo", "quelle"] } },

    { id: "w-23", week: 23, n: 11, level: "B1", emoji: "⚖️", title: "Bologna o Milano?",
      grammar: "comparativi e superlativi",
      text:
        "Francesca deve scegliere dove vivere. Milano è più grande di Bologna e offre più lavoro, " +
        "ma è anche più cara. Un appartamento a Milano costa molto più che a Bologna.\n\n" +
        "Bologna è meno caotica e più tranquilla. Per molti è la città più simpatica d'Italia, " +
        "e la cucina è migliore: i tortellini sono buonissimi!\n\n" +
        "A Milano però lo stipendio è più alto e ci sono più opportunità per una giovane architetta. " +
        "Francesca pensa: \"Il lavoro è importante quanto la qualità della vita\".\n\n" +
        "Alla fine sceglie Bologna, ma lavora due giorni a settimana a Milano. " +
        "Il treno ci mette solo un'ora: è la soluzione migliore.",
      gloss: { scegliere: "elegir", offre: "ofrece", cara: "cara", caotica: "caótica", stipendio: "sueldo",
               opportunità: "oportunidades", architetta: "arquitecta", qualità: "calidad", mette: "tarda (ci mette)",
               soluzione: "solución" },
      questions: [
        ["¿Qué ciudad es más cara?", ["Milán", "Bolonia", "las dos igual", "ninguna"], "Milán"],
        ["¿Qué ofrece Milán?", ["un sueldo más alto", "mejor comida", "más tranquilidad", "casas más baratas"], "un sueldo más alto"],
        ["¿Qué decide Francesca?", ["vivir en Bolonia y trabajar dos días en Milán", "vivir en Milán", "quedarse en su casa", "irse al exterior"], "vivir en Bolonia y trabajar dos días en Milán"]
      ],
      vf: [["Milano è più cara di Bologna.", "vero"], ["Francesca sceglie di vivere a Milano.", "falso"], ["Francesca ha un fidanzato a Bologna.", "non si dice"]],
      hunt: { label: "Tocá las formas de comparación (più, meno, migliore…)", targets: ["più", "meno", "migliore", "buonissimi", "quanto"] } },

    { id: "w-27", week: 27, n: 12, level: "B1", emoji: "💼", title: "Il primo mese di Chiara",
      grammar: "avverbi",
      text:
        "Chiara lavora in una casa editrice da appena un mese. Arriva sempre puntualmente alle nove " +
        "e spesso resta fino a tardi.\n\n" +
        "All'inizio parlava pochissimo: ascoltava attentamente i colleghi e prendeva appunti. " +
        "Adesso si sente già più sicura e discute tranquillamente con il capo.\n\n" +
        "Il lavoro è davvero interessante, ma a volte è piuttosto faticoso. " +
        "Ieri, per esempio, ha letto velocemente tre manoscritti e alla fine era completamente stanca.\n\n" +
        "Comunque Chiara è contenta: finalmente fa il lavoro che sognava. " +
        "\"Non ho ancora capito tutto\", dice, \"ma imparo qualcosa ogni giorno\".",
      gloss: { editrice: "editorial (casa editrice)", appena: "apenas", resta: "se queda",
               inizio: "principio (all'inizio = al principio)", appunti: "apuntes", sicura: "segura", capo: "jefe", davvero: "de verdad",
               volte: "veces (a volte = a veces)", attentamente: "con atención", piuttosto: "bastante", faticoso: "cansador", manoscritti: "manuscritos",
               sognava: "soñaba", imparo: "aprendo" },
      questions: [
        ["¿Hace cuánto trabaja Chiara en la editorial?", ["apenas un mes", "un año", "una semana", "tres meses"], "apenas un mes"],
        ["¿Qué hacía al principio?", ["escuchaba con atención y tomaba apuntes", "hablaba mucho", "llegaba tarde", "discutía con el jefe"], "escuchaba con atención y tomaba apuntes"],
        ["¿Cómo se siente ahora?", ["contenta: hace el trabajo que soñaba", "aburrida", "quiere renunciar", "enojada con el jefe"], "contenta: hace el trabajo que soñaba"]
      ],
      vf: [["Chiara lavora in una casa editrice.", "vero"], ["All'inizio Chiara parlava molto.", "falso"], ["Chiara guadagna bene.", "non si dice"]],
      hunt: { label: "Tocá los adverbios en -mente", targets: ["puntualmente", "attentamente", "tranquillamente", "velocemente", "completamente", "finalmente"] } },

    { id: "w-28", week: 28, n: 13, level: "B1", emoji: "🏙️", title: "Città o campagna?",
      grammar: "connettivi",
      text:
        "Molti giovani italiani lasciano i piccoli paesi e vanno in città. Infatti in città ci sono " +
        "più università e più lavoro. Inoltre la vita culturale è più ricca.\n\n" +
        "Tuttavia la città ha anche dei problemi: gli affitti sono alti, quindi molti vivono " +
        "in appartamenti piccoli. E poi il traffico e il rumore stancano.\n\n" +
        "In campagna, invece, la vita è più lenta e le case costano meno. " +
        "Però i servizi sono pochi e spesso bisogna prendere la macchina per tutto.\n\n" +
        "Insomma, nessuna scelta è perfetta. Comunque, grazie al lavoro da casa, " +
        "oggi alcuni giovani tornano nei paesi, anche se non è sempre facile.",
      gloss: { paesi: "pueblos", lasciano: "dejan", ricca: "rica", affitti: "alquileres", rumore: "ruido",
               stancano: "cansan", lenta: "lenta", servizi: "servicios", bisogna: "hay que", scelta: "elección" },
      questions: [
        ["¿Por qué muchos jóvenes van a la ciudad?", ["hay más universidades y trabajo", "es más barata", "es más tranquila", "no hay tráfico"], "hay más universidades y trabajo"],
        ["¿Qué problema tiene el campo?", ["pocos servicios y hace falta el auto", "el ruido", "los alquileres altos", "el tráfico"], "pocos servicios y hace falta el auto"],
        ["¿Qué cambió con el trabajo desde casa?", ["algunos jóvenes vuelven a los pueblos", "nadie vuelve", "las ciudades se vaciaron", "subieron los alquileres del campo"], "algunos jóvenes vuelven a los pueblos"]
      ],
      vf: [["In città gli affitti sono alti.", "vero"], ["In campagna ci sono molti servizi.", "falso"], ["Il lavoro da casa ha aiutato alcuni giovani a tornare nei paesi.", "vero"]],
      hunt: { label: "Tocá los conectores (infatti, inoltre, tuttavia…)", targets: ["infatti", "inoltre", "tuttavia", "quindi", "invece", "però", "insomma", "comunque"] } },

    { id: "w-32", week: 32, n: 14, level: "B2", emoji: "✉️", title: "La lettera del nonno",
      grammar: "concordanza dei tempi",
      text:
        "Mentre riordinava la soffitta, Laura ha trovato una lettera che il nonno aveva scritto alla nonna nel 1962.\n\n" +
        "\"Cara Maria, pensavo che non mi rispondessi più. Temevo che tuo padre ti avesse proibito " +
        "di scrivermi. Quando è arrivata la tua lettera, ho capito che mi avevi aspettato.\n\n" +
        "Ti prometto che troverò un lavoro e che ti sposerò entro un anno. " +
        "Spero che tu non abbia cambiato idea e che mi aspetti ancora un po'.\"\n\n" +
        "Laura ha pianto mentre la leggeva. Sapeva che i nonni si erano sposati nel 1963, " +
        "ma non immaginava che fosse stato così difficile.",
      gloss: { riordinava: "ordenaba", soffitta: "altillo", temevo: "temía", proibito: "prohibido",
               prometto: "prometo", sposerò: "me casaré con", entro: "dentro de", pianto: "llorado",
               immaginava: "imaginaba" },
      questions: [
        ["¿Dónde encontró Laura la carta?", ["en el altillo", "en un libro", "en el correo", "en la cocina"], "en el altillo"],
        ["¿Qué temía el abuelo?", ["que el padre de ella le prohibiera escribirle", "perder el trabajo", "que la carta no llegara", "mudarse"], "que el padre de ella le prohibiera escribirle"],
        ["¿Qué no se imaginaba Laura?", ["que hubiera sido tan difícil", "que se hubieran casado", "que el abuelo escribiera", "que existiera la carta"], "que hubiera sido tan difícil"]
      ],
      vf: [["Il nonno ha scritto la lettera nel 1962.", "vero"], ["I nonni si sono sposati nel 1962.", "falso"], ["La nonna ha risposto subito alla lettera.", "non si dice"]],
      hunt: { label: "Tocá los congiuntivi (rispondessi, avesse, abbia, aspetti, fosse)", targets: ["rispondessi", "avesse", "abbia", "aspetti", "fosse"] } },

    { id: "w-35", week: 35, n: 15, level: "B2", emoji: "🧀", title: "Com'è fatto il parmigiano",
      grammar: "la voce passiva",
      text:
        "Il Parmigiano Reggiano è prodotto soltanto in alcune province dell'Emilia-Romagna e della Lombardia. " +
        "Il latte viene munto la sera e la mattina, e viene lavorato in grandi caldaie di rame.\n\n" +
        "La forma viene poi immersa in acqua e sale per circa venti giorni. " +
        "Dopo, le forme sono sistemate su lunghi scaffali, dove vengono girate e controllate regolarmente.\n\n" +
        "Il formaggio deve essere stagionato almeno dodici mesi. Ogni forma è esaminata da un esperto, " +
        "che la batte con un martelletto per sentire se è perfetta.\n\n" +
        "Pare che il parmigiano fosse già apprezzato nel Medioevo: " +
        "è stato citato perfino da Boccaccio nel Decameron.",
      gloss: { soltanto: "solamente", province: "provincias", munto: "ordeñado", caldaie: "calderas", rame: "cobre",
               forma: "horma", immersa: "sumergida", sistemate: "acomodadas", scaffali: "estantes",
               girate: "dadas vuelta", stagionato: "estacionado", almeno: "por lo menos", esaminata: "examinada",
               batte: "golpea", martelletto: "martillito", apprezzato: "apreciado", pare: "parece", perfino: "hasta, incluso", citato: "citado" },
      questions: [
        ["¿Cuándo se ordeña la leche?", ["a la tarde y a la mañana", "solo de noche", "una vez por semana", "al mediodía"], "a la tarde y a la mañana"],
        ["¿Cuánto tiempo se estaciona como mínimo?", ["doce meses", "veinte días", "dos años", "seis meses"], "doce meses"],
        ["¿Para qué el experto golpea la horma?", ["para oír si está perfecta", "para cortarla", "para limpiarla", "para darla vuelta"], "para oír si está perfecta"]
      ],
      vf: [["Il parmigiano si stagiona almeno dodici mesi.", "vero"], ["Il latte si lavora in caldaie di plastica.", "falso"], ["Un chilo di parmigiano costa venti euro.", "non si dice"]],
      hunt: { label: "Tocá los participios de la pasiva (prodotto, munto…)", targets: ["prodotto", "munto", "lavorato", "immersa", "sistemate", "girate", "controllate", "stagionato", "esaminata", "citato"] } },

    { id: "w-43", week: 43, n: 16, level: "C1", emoji: "🎓", title: "Imparare da adulti",
      grammar: "l'infinito",
      text:
        "Imparare una lingua da adulti non è impossibile, ma richiede costanza. " +
        "Secondo molti studiosi, studiare venti minuti ogni giorno è più utile che passare " +
        "tre ore sui libri la domenica.\n\n" +
        "Dopo aver letto un testo, conviene riassumerlo con parole proprie: " +
        "ripetere senza capire serve a poco. Prima di andare a dormire, è utile " +
        "ripassare le parole nuove, perché il sonno aiuta a ricordarle.\n\n" +
        "L'importante è non avere paura di sbagliare. Sbagliare fa parte del processo, " +
        "e correggersi da soli insegna più che ricevere la risposta giusta.\n\n" +
        "Per non perdere la motivazione, basta fissarsi obiettivi piccoli e festeggiare ogni progresso.",
      gloss: { richiede: "requiere", costanza: "constancia", studiosi: "investigadores", conviene: "conviene",
               riassumerlo: "resumirlo", proprie: "propias", ripassare: "repasar", sonno: "sueño",
               sbagliare: "equivocarse", correggersi: "corregirse", fissarsi: "ponerse", obiettivi: "objetivos",
               festeggiare: "festejar", motivazione: "motivación" },
      questions: [
        ["¿Qué es más útil según el texto?", ["estudiar veinte minutos por día", "tres horas el domingo", "no estudiar", "leer sin entender"], "estudiar veinte minutos por día"],
        ["¿Por qué repasar antes de dormir?", ["el sueño ayuda a recordar", "hay más tiempo", "se está más despierto", "es más divertido"], "el sueño ayuda a recordar"],
        ["¿Qué enseña más?", ["corregirse solo", "recibir la respuesta correcta", "no equivocarse nunca", "estudiar de memoria"], "corregirse solo"]
      ],
      vf: [["Studiare un po' ogni giorno è più utile che studiare molto la domenica.", "vero"], ["Secondo il testo, sbagliare non serve a niente.", "falso"], ["Il testo consiglia di usare un'app.", "non si dice"]],
      hunt: { label: "Tocá los infinitivos usados como sustantivo o después de preposición", targets: ["imparare", "studiare", "passare", "aver", "andare", "dormire", "ripassare", "ricordarle", "avere", "sbagliare", "perdere", "fissarsi", "festeggiare"] } },

    { id: "w-46", week: 46, n: 17, level: "C1", emoji: "🐱", title: "Il gattino del vicino",
      grammar: "suffissi e alterazione",
      text:
        "Nel palazzone dove abito vive un vecchietto simpaticissimo, il signor Bruno. " +
        "Ha un gattino nero e un cagnolino bianco che abbaia a tutti.\n\n" +
        "Ogni mattina il signor Bruno scende con il suo cappellino e un giornalino sotto il braccio. " +
        "Si siede su una panchina del giardinetto e dà qualche briciolina ai passerotti.\n\n" +
        "Ieri il gattino è sparito. Il vecchietto era disperato: l'ha cercato in ogni angolino. " +
        "Alla fine l'abbiamo trovato dentro uno scatolone, addormentato su un vecchio maglione.\n\n" +
        "\"Che furbacchione!\" ha detto il signor Bruno, e per festeggiare " +
        "ci ha offerto un caffettino al bar.",
      gloss: { palazzone: "edificio grandote", vecchietto: "viejito", abbaia: "ladra", scende: "baja",
               cappellino: "sombrerito", giornalino: "revistita, diarito", braccio: "brazo", briciolina: "miguita",
               passerotti: "gorriones", sparito: "desaparecido", angolino: "rinconcito", scatolone: "cajón, caja grande",
               addormentato: "dormido", furbacchione: "pícaro, vivo", caffettino: "cafecito" },
      questions: [
        ["¿Qué animales tiene el señor Bruno?", ["un gatito negro y un perrito blanco", "dos perros", "un pájaro", "un gato blanco"], "un gatito negro y un perrito blanco"],
        ["¿Dónde encontraron al gatito?", ["dormido en una caja grande", "en el bar", "en el jardín", "en la calle"], "dormido en una caja grande"],
        ["¿Cómo festejó Bruno?", ["los invitó a un cafecito", "hizo una fiesta", "compró una torta", "no festejó"], "los invitó a un cafecito"]
      ],
      vf: [["Il signor Bruno ha un gattino e un cagnolino.", "vero"], ["Il gattino si era perso in strada.", "falso"], ["Il signor Bruno vive al primo piano.", "non si dice"]],
      hunt: { label: "Tocá las palabras con sufijo (-ino, -etto, -one…)", targets: ["palazzone", "vecchietto", "gattino", "cagnolino", "cappellino", "giornalino", "giardinetto", "briciolina", "passerotti", "angolino", "scatolone", "furbacchione", "caffettino"] } },

    { id: "w-47", week: 47, n: 18, level: "C1", emoji: "🧮", title: "La ricetta della nonna",
      grammar: "numerali, misure e quantità",
      text:
        "Per il ragù della nonna servono mezzo chilo di carne macinata, un etto di pancetta, " +
        "una carota, una costa di sedano e mezza cipolla.\n\n" +
        "Si aggiungono un bicchiere di vino rosso, due cucchiai di concentrato di pomodoro " +
        "e circa un litro e mezzo di passata. Il sugo deve cuocere almeno tre ore a fuoco basso.\n\n" +
        "La nonna dice che la ricetta basta per una decina di persone, " +
        "ma la nostra famiglia è di sei persone: gli avanzi finiscono in freezer.\n\n" +
        "Un terzo del ragù va sulle tagliatelle della domenica; il resto, " +
        "la metà almeno, lo regaliamo agli zii, che ne vanno pazzi.",
      gloss: { ragù: "salsa boloñesa", macinata: "picada", etto: "cien gramos", pancetta: "panceta",
               costa: "rama", sedano: "apio", cipolla: "cebolla", aggiungono: "agregan", cucchiai: "cucharadas",
               passata: "puré de tomate", sugo: "salsa", cuocere: "cocinarse", fuoco: "fuego",
               decina: "unas diez", avanzi: "sobras", pazzi: "locos (ne vanno pazzi = les encanta)", tagliatelle: "tallarines al huevo" },
      questions: [
        ["¿Cuánto tiempo se cocina la salsa?", ["por lo menos tres horas", "media hora", "un día", "una hora"], "por lo menos tres horas"],
        ["¿Para cuántas personas alcanza la receta?", ["unas diez", "seis", "dos", "veinte"], "unas diez"],
        ["¿Qué hacen con lo que sobra?", ["va al freezer y a los tíos", "lo tiran", "lo venden", "lo comen al día siguiente"], "va al freezer y a los tíos"]
      ],
      vf: [["Il ragù cuoce almeno tre ore.", "vero"], ["La famiglia è di dieci persone.", "falso"], ["La nonna usa carne di maiale.", "non si dice"]],
      hunt: { label: "Tocá las medidas y cantidades (mezzo, etto, decina…)", targets: ["mezzo", "chilo", "etto", "mezza", "litro", "decina", "terzo", "metà"] } },

    { id: "w-50", week: 50, n: 19, level: "C1", emoji: "🔤", title: "Parole che ingannano",
      grammar: "lessico avanzato e falsi amici",
      text:
        "Appena arrivata a Roma, Valeria ha detto al suo coinquilino che era \"molto imbarazzata\", " +
        "volendo dire che si vergognava. Lui ha capito subito, ma altre parole sono state più insidiose.\n\n" +
        "In un negozio ha chiesto una \"salsa\" per la pasta e le hanno dato del ketchup: " +
        "in italiano si dice \"sugo\". Poi ha raccontato che il suo capo era \"molto largo\", " +
        "pensando alla generosità, e i colleghi si sono messi a ridere.\n\n" +
        "Ormai Valeria ha imparato la lezione: prima di usare una parola che somiglia allo spagnolo, " +
        "la controlla sul dizionario. \"Le parole più pericolose\", dice, " +
        "\"sono quelle che sembrano facili\".",
      gloss: { imbarazzata: "avergonzada, incómoda", vergognava: "le daba vergüenza", coinquilino: "compañero de departamento",
               insidiose: "traicioneras", negozio: "negocio", sugo: "salsa (para pasta)", largo: "ancho",
               generosità: "generosidad", ormai: "a esta altura", somiglia: "se parece", pericolose: "peligrosas" },
      questions: [
        ["¿Qué le dieron cuando pidió «salsa»?", ["ketchup", "salsa de tomate", "aceite", "queso"], "ketchup"],
        ["¿Por qué se rieron los compañeros?", ["dijo «largo» pensando en «generoso»", "llegó tarde", "habló en español", "se equivocó de oficina"], "dijo «largo» pensando en «generoso»"],
        ["¿Qué hace ahora Valeria?", ["controla en el diccionario las palabras parecidas al español", "habla solo en inglés", "no usa palabras nuevas", "pregunta al jefe"], "controla en el diccionario las palabras parecidas al español"]
      ],
      vf: [["Valeria ha chiesto una salsa e le hanno dato il ketchup.", "vero"], ["I colleghi hanno capito subito cosa voleva dire con largo.", "falso"], ["Valeria studia medicina.", "non si dice"]],
      hunt: { label: "Tocá los falsos amigos del texto", targets: ["imbarazzata", "salsa", "largo"] } },

    { id: "w-01", week: 1, level: "A1", emoji: "👋", title: "Sono Lucia",
      grammar: "essere e avere",
      text:
        "Ciao! Sono Lucia. Sono italiana, di Roma, e ho ventiquattro anni. " +
        "Sono una studentessa di musica.\n\n" +
        "Ho un fratello, Paolo. Paolo ha trent'anni ed è medico a Milano. " +
        "È alto, simpatico e un po' pigro.\n\n" +
        "Ho anche una gatta, Nina. Nina è piccola e bianca, e ha gli occhi verdi. " +
        "La mia casa è vecchia ma bella, e ha un balcone con i fiori.\n\n" +
        "Oggi è domenica: sono a casa, ho un caffè e un libro. Il libro è nuovo ed è molto bello. Sono contenta!",
      gloss: { studentessa: "estudiante (mujer)", fratello: "hermano", medico: "médico", pigro: "vago, perezoso",
               anche: "también", gatta: "gata", piccola: "chiquita", bianca: "blanca", occhi: "ojos",
               vecchia: "vieja", balcone: "balcón", fiori: "flores", oggi: "hoy", contenta: "contenta" },
      questions: [
        ["¿Cuántos años tiene Lucia?", ["veinticuatro", "treinta", "veinte", "catorce"], "veinticuatro"],
        ["¿Qué hace Paolo?", ["es médico en Milán", "es estudiante", "es músico", "trabaja en Roma"], "es médico en Milán"],
        ["¿Cómo es la gata?", ["chiquita y blanca, de ojos verdes", "grande y negra", "vieja y gorda", "no tiene gata"], "chiquita y blanca, de ojos verdes"]
      ],
      vf: [["Lucia è di Milano.", "falso"], ["Paolo è il fratello di Lucia.", "vero"], ["Lucia suona il pianoforte.", "non si dice"]],
      hunt: { label: "Tocá las formas de essere y avere", targets: ["sono", "ho", "ha", "è"] } },

    { id: "w-05", week: 5, level: "A1", emoji: "📚", title: "La libraia",
      grammar: "presente dei verbi regolari",
      text:
        "Carla abita a Firenze e lavora in una libreria del centro. La mattina prende " +
        "l'autobus alle otto e legge il giornale. Alle nove apre la libreria e parla con i clienti.\n\n" +
        "A mezzogiorno mangia un panino con la collega, Marta. Il pomeriggio ordina i libri nuovi " +
        "e risponde alle email. Finisce di lavorare alle sette.\n\n" +
        "La sera cucina qualcosa di semplice, guarda un film o telefona alla madre. " +
        "Dorme poco, perché legge sempre fino a tardi. \"I libri sono la mia vita\", dice Carla.",
      gloss: { libreria: "librería", giornale: "diario", clienti: "clientes",
               mezzogiorno: "mediodía", panino: "sándwich", collega: "compañera de trabajo", ordina: "ordena",
               risponde: "responde", finisce: "termina", cucina: "cocina", semplice: "simple", tardi: "tarde" },
      questions: [
        ["¿Dónde trabaja Carla?", ["en una librería del centro", "en un diario", "en una escuela", "en un bar"], "en una librería del centro"],
        ["¿A qué hora termina de trabajar?", ["a las siete", "a las nueve", "al mediodía", "a las ocho"], "a las siete"],
        ["¿Por qué duerme poco?", ["lee hasta tarde", "trabaja de noche", "mira películas", "habla con la madre"], "lee hasta tarde"]
      ],
      vf: [["Carla lavora in una libreria.", "vero"], ["Carla va al lavoro in bicicletta.", "falso"], ["Marta è la sorella di Carla.", "falso"]],
      hunt: { label: "Tocá los verbos en presente de la tercera persona (abita, lavora…)", targets: ["abita", "lavora", "prende", "legge", "apre", "parla", "mangia", "ordina", "risponde", "finisce", "cucina", "guarda", "telefona", "dorme"] } },

    { id: "w-09", week: 9, level: "A2", emoji: "🚆", title: "Da Genova a Lugano",
      grammar: "preposizioni",
      text:
        "Tommaso vive a Genova, ma lavora in Svizzera. Ogni lunedì parte da Genova alle sei " +
        "e arriva a Lugano in tre ore. Va in treno, con un libro e un caffè.\n\n" +
        "A Lugano abita da un amico, Marco, in un piccolo appartamento vicino al lago. " +
        "Lavora per una banca e parla tedesco, francese e italiano.\n\n" +
        "Il venerdì torna a casa per il fine settimana. Il sabato va al mercato con la moglie " +
        "e la domenica pranza dai genitori. Tra un viaggio e l'altro Tommaso è sempre stanco, " +
        "ma dice: \"Per ora va bene così\".",
      gloss: { svizzera: "Suiza", ogni: "cada", treno: "tren", appartamento: "departamento", lago: "lago",
               banca: "banco", tedesco: "alemán", torna: "vuelve", moglie: "esposa", pranza: "almuerza",
               genitori: "padres", viaggio: "viaje", stanco: "cansado" },
      questions: [
        ["¿Cómo va Tommaso a Lugano?", ["en tren", "en auto", "en avión", "en colectivo"], "en tren"],
        ["¿Con quién vive en Lugano?", ["con un amigo", "con su esposa", "solo", "con sus padres"], "con un amigo"],
        ["¿Qué hace el domingo?", ["almuerza con sus padres", "trabaja", "va al mercado", "viaja a Suiza"], "almuerza con sus padres"]
      ],
      vf: [["Tommaso lavora in Svizzera.", "vero"], ["A Lugano Tommaso vive da solo.", "falso"], ["Marco lavora in banca con Tommaso.", "non si dice"]],
      hunt: { label: "Tocá las preposiciones simples (a, in, da, con, per, tra)", targets: ["a", "in", "da", "con", "per", "tra"] } },

    { id: "w-11", week: 11, level: "A2", emoji: "🚤", title: "Un sabato a Venezia",
      grammar: "passato prossimo",
      text:
        "Sabato scorso Anna e Luca sono andati a Venezia. Sono partiti da Padova alle nove " +
        "e sono arrivati in mezz'ora. Hanno camminato per ore tra calli e ponti e hanno visto piazza San Marco.\n\n" +
        "A pranzo hanno mangiato le sarde in saor in una piccola osteria. Anna ha comprato " +
        "una maschera per sua sorella, Luca ha fatto molte foto.\n\n" +
        "Il pomeriggio hanno preso il vaporetto fino a Murano e hanno visitato una fornace del vetro. " +
        "La sera sono tornati a casa stanchi. \"Abbiamo speso troppo\", ha detto Luca, " +
        "\"ma è stata una giornata perfetta\".",
      gloss: { scorso: "pasado", calli: "callecitas (de Venecia)", ponti: "puentes", pranzo: "almuerzo",
               sarde: "sardinas", osteria: "fonda, bodegón", maschera: "máscara", sorella: "hermana",
               vaporetto: "lancha colectivo", fornace: "horno", vetro: "vidrio", speso: "gastado", troppo: "demasiado" },
      questions: [
        ["¿De dónde salieron?", ["de Padua", "de Roma", "de Murano", "de Milán"], "de Padua"],
        ["¿Qué compró Anna?", ["una máscara para su hermana", "vidrio de Murano", "sardinas", "un libro"], "una máscara para su hermana"],
        ["¿Qué dice Luca al final?", ["gastaron mucho, pero fue un día perfecto", "fue un día aburrido", "quiere volver mañana", "Venecia es fea"], "gastaron mucho, pero fue un día perfecto"]
      ],
      vf: [["Anna e Luca sono partiti da Padova.", "vero"], ["Luca ha comprato una maschera.", "falso"], ["A Murano hanno comprato un vaso.", "non si dice"]],
      hunt: { label: "Tocá los participios con essere (andati, partiti…)", targets: ["andati", "partiti", "arrivati", "tornati", "stata"] } },

    { id: "w-12", week: 12, level: "A2", emoji: "👵", title: "Le regole della nonna",
      grammar: "riflessivi e imperativo",
      text:
        "Quando i nipoti arrivano, la nonna Pina dà sempre le sue regole. \"Lavatevi le mani " +
        "prima di mangiare! Sedetevi a tavola e non alzatevi fino alla frutta.\"\n\n" +
        "La mattina i ragazzi si svegliano tardi. \"Alzati, Giacomo! Vestiti e fai colazione\", " +
        "dice la nonna. Giacomo si lamenta, ma si alza.\n\n" +
        "Il pomeriggio si divertono in giardino e la sera si riposano davanti alla televisione. " +
        "\"Non vi addormentate sul divano!\" ripete la nonna. Alla fine, però, è la nonna che si " +
        "addormenta per prima, con gli occhiali sul naso. I nipoti ridono e la coprono con una coperta.",
      gloss: { nipoti: "nietos", regole: "reglas", mani: "manos", tavola: "mesa", svegliano: "despiertan",
               colazione: "desayuno", lamenta: "queja", divertono: "divierten", riposano: "descansan",
               divano: "sillón", occhiali: "anteojos", naso: "nariz", ridono: "se ríen", coperta: "manta" },
      questions: [
        ["¿Qué deben hacer antes de comer?", ["lavarse las manos", "vestirse", "ir al jardín", "mirar la tele"], "lavarse las manos"],
        ["¿Qué hace Giacomo cuando la abuela lo llama?", ["se queja, pero se levanta", "sigue durmiendo", "se enoja y se va", "llora"], "se queja, pero se levanta"],
        ["¿Quién se duerme primero?", ["la abuela", "Giacomo", "los nietos", "nadie"], "la abuela"]
      ],
      vf: [["La nonna vuole che i nipoti si lavino le mani.", "vero"], ["Giacomo si sveglia presto.", "falso"], ["La nonna guarda un film alla televisione.", "non si dice"]],
      hunt: { label: "Tocá los imperativos (lavatevi, sedetevi, alzati…)", targets: ["lavatevi", "sedetevi", "alzatevi", "alzati", "vestiti", "fai", "addormentate"] } },

    { id: "w-13", week: 13, level: "A2", emoji: "🍷", title: "La nuova vicina",
      grammar: "ripasso: presente, passato prossimo, pronomi",
      text:
        "Ieri è arrivata una nuova vicina, Sara. È di Bari e ha ventinove anni. Fa l'architetta " +
        "e lavora in uno studio del centro.\n\n" +
        "L'ho incontrata sulle scale con tre scatole pesanti e l'ho aiutata. Lei mi ha ringraziato " +
        "e mi ha offerto un caffè. Abbiamo parlato di tutto: del lavoro, della città, dei ristoranti. " +
        "Le ho consigliato la trattoria sotto casa e le ho dato il mio numero.\n\n" +
        "Stamattina mi ha scritto: \"Grazie per ieri! Stasera vieni a cena da me?\" Ho messo una camicia elegante, " +
        "ho comprato una bottiglia di vino e alle otto ho suonato alla sua porta.",
      gloss: { vicina: "vecina", architetta: "arquitecta", studio: "estudio", scale: "escaleras",
               scatole: "cajas", pesanti: "pesadas", ringraziato: "agradecido", consigliato: "recomendado",
               trattoria: "bodegón", stamattina: "esta mañana", bottiglia: "botella", suonato: "tocado el timbre" },
      questions: [
        ["¿De dónde es Sara?", ["de Bari", "de Roma", "de Milán", "de Nápoles"], "de Bari"],
        ["¿Cómo se conocieron?", ["en la escalera, con unas cajas", "en un bar", "en el trabajo", "en la trattoria"], "en la escalera, con unas cajas"],
        ["¿Qué lleva el narrador a la cena?", ["una botella de vino", "flores", "una torta", "nada"], "una botella de vino"]
      ],
      vf: [["Sara è di Bari.", "vero"], ["Il narratore ha incontrato Sara al bar.", "falso"], ["Sara ha cucinato il pesce.", "non si dice"]],
      hunt: { label: "Tocá los pronombres de objeto (l', le, mi)", targets: ["l'ho", "le", "mi"] } },

    { id: "w-15", week: 15, level: "A2", emoji: "🌳", title: "L'estate dal nonno",
      grammar: "imperfetto e passato prossimo",
      text:
        "Quando ero bambino passavo le estati dal nonno, in un paese della Puglia. La casa era bianca " +
        "e aveva un grande fico nel cortile.\n\n" +
        "Ogni mattina il nonno mi svegliava presto e andavamo insieme al mercato. Lui conosceva tutti " +
        "e parlava con tutti. Il pomeriggio faceva troppo caldo: dormivamo o giocavamo a carte.\n\n" +
        "Un giorno, però, è successa una cosa strana: mentre raccoglievo i fichi, ho visto un piccolo " +
        "cane sotto l'albero. Era magro e aveva paura. Il nonno l'ha adottato subito e l'ha chiamato Fico.",
      gloss: { estati: "veranos", paese: "pueblo", fico: "higuera, higo", fichi: "higos", cortile: "patio",
               svegliava: "despertaba", presto: "temprano", caldo: "calor", carte: "cartas",
               successa: "pasado, sucedido", raccoglievo: "juntaba", albero: "árbol", magro: "flaco",
               paura: "miedo", adottato: "adoptado" },
      questions: [
        ["¿Dónde pasaba los veranos?", ["en un pueblo de Apulia", "en Roma", "en la playa", "en la montaña"], "en un pueblo de Apulia"],
        ["¿Qué hacían a la tarde?", ["dormían o jugaban a las cartas", "iban al mercado", "nadaban", "trabajaban"], "dormían o jugaban a las cartas"],
        ["¿Cómo se llamó el perro?", ["Fico", "Nonno", "Puglia", "Bianco"], "Fico"]
      ],
      vf: [["La casa del nonno era in Puglia.", "vero"], ["Il pomeriggio andavano al mercato.", "falso"], ["Il cane è vissuto molti anni.", "non si dice"]],
      hunt: { label: "Tocá los verbos en imperfetto", targets: ["ero", "passavo", "era", "aveva", "svegliava", "andavamo", "conosceva", "parlava", "faceva", "dormivamo", "giocavamo", "raccoglievo"] } },

    { id: "w-18", week: 18, level: "A2", emoji: "😩", title: "Che giornata!",
      grammar: "negazioni ed esclamazioni",
      text:
        "Che giornata! Stamattina non ha suonato la sveglia e non ho fatto colazione. Alla fermata " +
        "non c'era nessuno: ho perso l'autobus.\n\n" +
        "In ufficio non funzionava niente, né il computer né la stampante. Il capo non c'era ancora " +
        "e i colleghi non sapevano cosa fare.\n\n" +
        "A pranzo non ho mangiato neanche un panino, perché non avevo più soldi nel portafoglio. Che fame! " +
        "La sera, finalmente, sono arrivato davanti a casa... e non avevo le chiavi! " +
        "Mai più una giornata così, per favore. Che disastro!",
      gloss: { sveglia: "despertador", colazione: "desayuno", fermata: "parada", funzionava: "funcionaba",
               stampante: "impresora", capo: "jefe", colleghi: "compañeros", neanche: "ni siquiera",
               soldi: "plata", portafoglio: "billetera", fame: "hambre", chiavi: "llaves", disastro: "desastre" },
      questions: [
        ["¿Qué pasó en la parada?", ["perdió el colectivo", "era domingo", "llovía", "había paro"], "perdió el colectivo"],
        ["¿Qué no funcionaba en la oficina?", ["ni la computadora ni la impresora", "el ascensor", "la luz", "el teléfono"], "ni la computadora ni la impresora"],
        ["¿Qué le faltaba a la noche?", ["las llaves", "la billetera", "el celular", "el colectivo"], "las llaves"]
      ],
      vf: [["Stamattina il narratore non ha fatto colazione.", "vero"], ["A pranzo ha mangiato un panino.", "falso"], ["Il narratore ha chiamato un fabbro.", "non si dice"]],
      hunt: { label: "Tocá las palabras negativas (non, nessuno, niente, né…)", targets: ["non", "nessuno", "niente", "né", "neanche", "più", "mai"] } },

    { id: "w-19", week: 19, level: "B1", emoji: "✈️", title: "Il piano di Giulia",
      grammar: "futuro",
      text:
        "Il prossimo anno Giulia finirà l'università e partirà per un anno in Spagna. Vivrà a Valencia " +
        "con due amiche e studierà lo spagnolo.\n\n" +
        "All'inizio cercherà un lavoro in un bar o in un albergo. Poi, quando parlerà bene la lingua, " +
        "farà domanda in una scuola di italiano.\n\n" +
        "I genitori sono un po' preoccupati. \"Come farai con i soldi? Dove abiterai?\" chiede la madre. " +
        "\"Non preoccuparti, mamma: andrà tutto bene\", risponde Giulia. Il padre, invece, sorride: " +
        "\"Sarà un'esperienza bellissima. E noi verremo a trovarti a Natale!\"",
      gloss: { prossimo: "próximo", cercherà: "buscará", albergo: "hotel", lingua: "idioma",
               domanda: "solicitud (fare domanda = postularse)", genitori: "padres", preoccupati: "preocupados",
               soldi: "plata", sorride: "sonríe", esperienza: "experiencia", trovarti: "visitarte" },
      questions: [
        ["¿Adónde se va Giulia?", ["a Valencia, en España", "a Madrid", "a Roma", "a Londres"], "a Valencia, en España"],
        ["¿Dónde trabajará al principio?", ["en un bar o en un hotel", "en una escuela", "en una oficina", "en la universidad"], "en un bar o en un hotel"],
        ["¿Qué harán los padres en Navidad?", ["la visitarán", "se quedarán en casa", "irán a la playa", "le mandarán plata"], "la visitarán"]
      ],
      vf: [["Giulia vivrà a Valencia.", "vero"], ["La madre chiede dove abiterà Giulia.", "vero"], ["Giulia ha già un lavoro in Spagna.", "falso"]],
      hunt: { label: "Tocá los verbos en futuro", targets: ["finirà", "partirà", "vivrà", "studierà", "cercherà", "parlerà", "farà", "farai", "abiterai", "andrà", "sarà", "verremo"] } },

    { id: "w-20", week: 20, level: "B1", emoji: "🌅", title: "Un ristorante al mare",
      grammar: "condizionale presente",
      text:
        "Marco lavora in banca, ma non è felice. \"Mi piacerebbe cambiare vita\", dice all'amico Paolo. " +
        "\"Vorrei aprire un piccolo ristorante al mare.\"\n\n" +
        "\"E dove lo apriresti?\" chiede Paolo. \"In Sardegna. Cucinerei pesce fresco e la sera guarderei " +
        "il tramonto dalla terrazza.\"\n\n" +
        "\"Sarebbe bello\", risponde Paolo, \"ma dovresti imparare a cucinare! E il ristorante potrebbe anche non " +
        "guadagnare niente.\" Marco ride: \"Hai ragione. Però almeno sarei libero. Tu verresti a lavorare " +
        "con me?\" \"Forse... ma solo come cliente!\" Ridono tutti e due, ma Marco non dimentica il suo sogno.",
      gloss: { felice: "feliz", pesce: "pescado", fresco: "fresco", tramonto: "atardecer", terrazza: "terraza",
               imparare: "aprender", guadagnare: "ganar (plata)", almeno: "al menos", libero: "libre", forse: "quizás" },
      questions: [
        ["¿Qué quiere hacer Marco?", ["abrir un restaurante en el mar", "cambiar de banco", "irse a vivir con Paolo", "aprender a nadar"], "abrir un restaurante en el mar"],
        ["¿Qué problema ve Paolo?", ["Marco no sabe cocinar", "Cerdeña es cara", "no hay pescado", "Marco es muy joven"], "Marco no sabe cocinar"],
        ["¿Cómo iría Paolo al restaurante?", ["solo como cliente", "como cocinero", "como socio", "no iría"], "solo como cliente"]
      ],
      vf: [["Marco lavora in banca.", "vero"], ["Marco vorrebbe un ristorante in montagna.", "falso"], ["Paolo sa cucinare molto bene.", "non si dice"]],
      hunt: { label: "Tocá los verbos en condizionale", targets: ["piacerebbe", "vorrei", "apriresti", "cucinerei", "guarderei", "sarebbe", "dovresti", "potrebbe", "sarei", "verresti"] } },

    { id: "w-21", week: 21, level: "B1", emoji: "🧺", title: "Il mercato del sabato",
      grammar: "ne e ci",
      text:
        "Il sabato vado al mercato di piazza delle Erbe: ci vado da dieci anni. Compro sempre la frutta " +
        "dal signor Bepi. \"Quante mele vuole?\" \"Ne prendo un chilo.\"\n\n" +
        "Poi passo dal formaggio. \"Il parmigiano? Ne vorrei due etti.\" Al banco del pesce c'è sempre " +
        "la fila, ma ci resto volentieri perché le persone chiacchierano.\n\n" +
        "A volte ci trovo anche la mia amica Lucia. Parliamo del lavoro e dei figli, e ne ridiamo insieme. " +
        "Quando torno a casa la borsa è pesante: ci sono troppe cose! Ma è il mio momento preferito della settimana.",
      gloss: { mele: "manzanas", etti: "cien gramos (due etti = 200 g)", banco: "puesto", fila: "fila, cola",
               volentieri: "con gusto", chiacchierano: "charlan", figli: "hijos", volte: "veces (a volte = a veces)", ridiamo: "nos reímos",
               borsa: "bolsa", pesante: "pesada" },
      questions: [
        ["¿Hace cuánto va a ese mercado?", ["diez años", "un año", "dos meses", "toda la vida"], "diez años"],
        ["¿Cuánto parmesano pide?", ["doscientos gramos", "un kilo", "cien gramos", "medio kilo"], "doscientos gramos"],
        ["¿Por qué no le molesta la fila del pescado?", ["la gente charla", "es corta", "no compra pescado", "va con Lucia"], "la gente charla"]
      ],
      vf: [["Il narratore va al mercato da dieci anni.", "vero"], ["Compra un chilo di parmigiano.", "falso"], ["Lucia vende il pesce al mercato.", "non si dice"]],
      hunt: { label: "Tocá ci y ne", targets: ["ci", "ne"] } },

    { id: "w-22", week: 22, level: "B1", emoji: "📕", title: "Il libro prestato",
      grammar: "pronomi combinati",
      text:
        "Due mesi fa ho prestato un libro a Giorgio. Ieri gliel'ho chiesto: \"Me lo ridai?\" " +
        "\"Certo, te lo porto domani\", mi ha detto.\n\n" +
        "Oggi Giorgio è arrivato senza libro. \"L'ho dato a mia sorella: gliel'ho prestato perché le piace " +
        "quell'autore. Glielo chiedo stasera.\" Mi sono arrabbiato un po'. \"Ma il libro è mio! " +
        "Me l'ha regalato mia madre.\"\n\n" +
        "Giorgio si è scusato: \"Hai ragione. Te lo riporto sabato, te lo prometto.\" " +
        "Sabato il libro è tornato, con un biglietto di sua sorella: \"Grazie! Me lo presti ancora?\"",
      gloss: { prestato: "prestado", ridai: "devolvés", porto: "traigo", sorella: "hermana", autore: "autor",
               arrabbiato: "enojado", regalato: "regalado", scusato: "disculpado", riporto: "devuelvo",
               prometto: "prometo", biglietto: "notita", presti: "prestás" },
      questions: [
        ["¿A quién le dio Giorgio el libro?", ["a su hermana", "a su madre", "a un amigo", "a la biblioteca"], "a su hermana"],
        ["¿Quién le regaló el libro al narrador?", ["su madre", "Giorgio", "su hermana", "un autor"], "su madre"],
        ["¿Qué pide la hermana al final?", ["que se lo preste otra vez", "otro libro", "perdón", "nada"], "que se lo preste otra vez"]
      ],
      vf: [["Giorgio ha dato il libro a sua sorella.", "vero"], ["Il libro è di Giorgio.", "falso"], ["La sorella di Giorgio fa la scrittrice.", "non si dice"]],
      hunt: { label: "Tocá los pronombres combinados (me lo, te lo, glielo…)", targets: ["gliel'ho", "me", "te", "glielo"] } },

    { id: "w-24", week: 24, level: "B1", emoji: "🎂", title: "Il nuovo collega",
      grammar: "congiuntivo presente",
      text:
        "Al lavoro è arrivato un nuovo collega, Stefano. Tutti hanno un'opinione su di lui. Chiara pensa " +
        "che sia simpatico, ma crede che parli troppo. Marco, invece, pensa che lavori poco e che arrivi sempre tardi.\n\n" +
        "Io non lo conosco bene. Credo che abbia bisogno di tempo: è nuovo e forse è timido. " +
        "Spero che si trovi bene con noi.\n\n" +
        "Oggi Stefano ha portato una torta per tutti. \"È il mio compleanno\", ha detto. " +
        "Adesso tutti pensano che sia il collega migliore dell'ufficio!",
      gloss: { collega: "compañero de trabajo", opinione: "opinión", troppo: "demasiado", bisogno: "necesidad (avere bisogno = necesitar)",
               forse: "quizás", timido: "tímido", trovi: "encuentre (trovarsi bene = sentirse a gusto)", torta: "torta",
               compleanno: "cumpleaños", migliore: "mejor", ufficio: "oficina" },
      questions: [
        ["¿Qué piensa Chiara de Stefano?", ["que es simpático pero habla mucho", "que trabaja poco", "que llega tarde", "que es tímido"], "que es simpático pero habla mucho"],
        ["¿Qué cree el narrador?", ["que necesita tiempo", "que es antipático", "que se va a ir", "que es el jefe"], "que necesita tiempo"],
        ["¿Por qué trajo una torta?", ["era su cumpleaños", "para pedir perdón", "se iba", "era viernes"], "era su cumpleaños"]
      ],
      vf: [["Stefano è un nuovo collega.", "vero"], ["Chiara pensa che Stefano parli poco.", "falso"], ["Stefano ha fatto la torta da solo.", "non si dice"]],
      hunt: { label: "Tocá los verbos en congiuntivo", targets: ["sia", "parli", "lavori", "arrivi", "abbia", "trovi"] } },

    { id: "w-25", week: 25, level: "B1", emoji: "👔", title: "Consigli per un colloquio",
      grammar: "congiuntivo: quando si usa",
      text:
        "Domani Elena ha un colloquio importante. Sua sorella le dà qualche consiglio. \"È importante che tu " +
        "arrivi dieci minuti prima. Bisogna che ti vesta in modo semplice ed elegante.\"\n\n" +
        "\"E se mi fanno domande difficili?\" \"È normale che tu sia nervosa. Prima di rispondere, ascolta " +
        "bene la domanda. Anche se non sai tutto, è meglio che tu dica la verità.\"\n\n" +
        "Elena ha paura che il direttore sia antipatico. \"Non credo che sia così\", dice la sorella. " +
        "\"Basta che tu sorrida e che parli con calma. Sono sicura che andrà bene.\"",
      gloss: { colloquio: "entrevista de trabajo", consiglio: "consejo", bisogna: "hace falta", vesta: "vistas",
               semplice: "simple", nervosa: "nerviosa", verità: "verdad", paura: "miedo", direttore: "director",
               basta: "alcanza con", sorrida: "sonrías", calma: "calma" },
      questions: [
        ["¿Cuándo tiene que llegar Elena?", ["diez minutos antes", "a la hora justa", "una hora antes", "tarde"], "diez minutos antes"],
        ["¿Qué hacer si no sabe algo?", ["decir la verdad", "inventar", "cambiar de tema", "irse"], "decir la verdad"],
        ["¿De qué tiene miedo Elena?", ["de que el director sea antipático", "de llegar tarde", "de la ropa", "de su hermana"], "de que el director sea antipático"]
      ],
      vf: [["Elena ha un colloquio domani.", "vero"], ["La sorella le consiglia di arrivare in ritardo.", "falso"], ["Il colloquio è in una banca.", "non si dice"]],
      hunt: { label: "Tocá los congiuntivi", targets: ["arrivi", "vesta", "sia", "dica", "sorrida", "parli"] } },

    { id: "w-26", week: 26, level: "B1", emoji: "📔", title: "Caro diario",
      grammar: "ripasso: futuro, congiuntivo, pronomi",
      text:
        "Caro diario, domani comincia il mio nuovo lavoro a Torino e sono un po' agitato. Ho già preparato " +
        "tutto: i vestiti, la borsa e i documenti. Mia madre me li ha controllati due volte.\n\n" +
        "Spero che i colleghi siano gentili e che il capo non sia troppo severo. Penso che all'inizio farò " +
        "qualche errore, ma imparerò in fretta.\n\n" +
        "Quando ero studente sognavo un lavoro così. Ora ci sono quasi: domani alle nove entrerò in ufficio " +
        "e dirò \"Buongiorno!\" con il mio sorriso migliore. Chissà come andrà!",
      gloss: { diario: "diario (íntimo)", agitato: "nervioso", vestiti: "ropa", documenti: "papeles",
               controllati: "revisado", volte: "veces", severo: "severo", inizio: "principio", fretta: "apuro (in fretta = rápido)",
               sognavo: "soñaba", quasi: "casi", sorriso: "sonrisa", chissà: "quién sabe" },
      questions: [
        ["¿Dónde empieza a trabajar?", ["en Turín", "en Roma", "en Milán", "en casa"], "en Turín"],
        ["¿Quién revisó los papeles?", ["su madre", "el jefe", "un colega", "nadie"], "su madre"],
        ["¿Qué espera de los colegas?", ["que sean amables", "que lo ayuden con plata", "que no estén", "que hablen inglés"], "que sean amables"]
      ],
      vf: [["Il nuovo lavoro è a Torino.", "vero"], ["La madre ha controllato i documenti una volta sola.", "falso"], ["Il capo è una donna.", "non si dice"]],
      hunt: { label: "Tocá los verbos en futuro", targets: ["farò", "imparerò", "entrerò", "dirò", "andrà"] } },

    { id: "w-29", week: 29, level: "B2", emoji: "🎸", title: "Il concerto",
      grammar: "congiuntivo passato",
      text:
        "Ieri sera c'era il concerto di Vasco Rossi, ma Luca non è venuto. I suoi amici non capiscono perché. " +
        "\"Credo che abbia perso il treno\", dice Sara. \"Penso che se ne sia dimenticato\", risponde Paolo. " +
        "\"È strano che non ci abbia scritto niente.\"\n\n" +
        "Stamattina Luca ha telefonato: \"Scusate! Mi dispiace che siate rimasti ad aspettarmi. Ho avuto " +
        "la febbre tutta la notte.\"\n\n" +
        "\"Speriamo che tu sia guarito, almeno\", ha detto Sara. \"Sì, sto meglio. Ma mi dispiace " +
        "che il concerto sia finito senza di me!\"",
      gloss: { concerto: "recital", perso: "perdido", dimenticato: "olvidado", strano: "raro", scusate: "disculpen",
               dispiace: "da pena (mi dispiace = lo siento)", rimasti: "quedado", aspettarmi: "esperarme",
               febbre: "fiebre", guarito: "curado", almeno: "al menos" },
      questions: [
        ["¿Qué cree Sara que pasó?", ["que perdió el tren", "que se olvidó", "que estaba enojado", "que se quedó dormido"], "que perdió el tren"],
        ["¿Qué le pasó a Luca en realidad?", ["tuvo fiebre", "perdió el tren", "se olvidó", "trabajó"], "tuvo fiebre"],
        ["¿Qué lamenta Luca al final?", ["que el recital terminara sin él", "haber llamado", "estar enfermo de nuevo", "nada"], "que el recital terminara sin él"]
      ],
      vf: [["Luca non è andato al concerto.", "vero"], ["Luca ha perso il treno.", "falso"], ["Il concerto è finito a mezzanotte.", "non si dice"]],
      hunt: { label: "Tocá los auxiliares del congiuntivo passato (abbia, sia, siate)", targets: ["abbia", "sia", "siate"] } },

    { id: "w-30", week: 30, level: "B2", emoji: "🎹", title: "Il pianoforte",
      grammar: "congiuntivo imperfetto e trapassato",
      text:
        "Da piccola Marta voleva che suo padre la portasse ogni domenica al mare. Sperava che il sole " +
        "non finisse mai e che l'estate durasse tutto l'anno.\n\n" +
        "Sua madre, invece, voleva che studiasse il pianoforte. \"Se non studi, non imparerai mai\", diceva. " +
        "Marta faceva finta che le piacesse, ma pensava solo al mare.\n\n" +
        "Anni dopo, Marta ha scoperto che sua madre da giovane aveva suonato in un'orchestra. Non immaginava " +
        "che avesse avuto quel sogno e che ci avesse rinunciato per la famiglia. Quella sera ha riaperto il pianoforte.",
      gloss: { portasse: "llevara", sperava: "esperaba", durasse: "durara", studiasse: "estudiara",
               pianoforte: "piano", finta: "de cuenta (fare finta = hacer de cuenta)", scoperto: "descubierto",
               suonato: "tocado", orchestra: "orquesta", sogno: "sueño", rinunciato: "renunciado", riaperto: "vuelto a abrir" },
      questions: [
        ["¿Qué quería Marta de chica?", ["ir al mar los domingos", "tocar el piano", "tocar en una orquesta", "estudiar"], "ir al mar los domingos"],
        ["¿Qué descubrió después?", ["que su madre había tocado en una orquesta", "que su padre era músico", "que el mar estaba lejos", "que no le gustaba el piano"], "que su madre había tocado en una orquesta"],
        ["¿Qué hizo esa noche?", ["volvió a abrir el piano", "fue al mar", "llamó a su padre", "lloró"], "volvió a abrir el piano"]
      ],
      vf: [["Da piccola Marta amava il mare.", "vero"], ["Il padre voleva che Marta suonasse il pianoforte.", "falso"], ["La madre suonava il violino.", "non si dice"]],
      hunt: { label: "Tocá los congiuntivi imperfetti y trapassati", targets: ["portasse", "finisse", "durasse", "studiasse", "piacesse", "avesse"] } },

    { id: "w-31", week: 31, level: "B2", emoji: "🚕", title: "Il treno perso",
      grammar: "condizionale passato",
      text:
        "Venerdì Paolo doveva partire per Roma alle sette. Avrebbe voluto dormire di più, ma aveva un " +
        "appuntamento importante. Purtroppo il taxi è arrivato tardi e il treno è partito senza di lui.\n\n" +
        "\"Sarei dovuto uscire prima\", ha pensato. \"Avrei potuto prendere la metro.\" Ha telefonato al " +
        "cliente: \"Mi dispiace, sarei arrivato alle dieci, ma adesso arriverò a mezzogiorno.\"\n\n" +
        "Il cliente è stato gentile: \"Non si preoccupi. Anch'io avrei preferito vederla più tardi: " +
        "ho avuto una mattinata terribile!\" Paolo ha riso, finalmente tranquillo.",
      gloss: { appuntamento: "cita", purtroppo: "lamentablemente", metro: "subte",
               cliente: "cliente", dispiace: "lamento", mezzogiorno: "mediodía", preoccupi: "preocupe",
               preferito: "preferido", mattinata: "mañana" },
      questions: [
        ["¿Por qué perdió el tren?", ["el taxi llegó tarde", "se quedó dormido", "hubo paro", "se olvidó"], "el taxi llegó tarde"],
        ["¿Qué habría podido hacer?", ["tomar el subte", "ir en auto", "no viajar", "llamar antes"], "tomar el subte"],
        ["¿Cómo reacciona el cliente?", ["es amable: él también tuvo una mañana terrible", "se enoja", "cancela la cita", "no contesta"], "es amable: él también tuvo una mañana terrible"]
      ],
      vf: [["Paolo ha perso il treno delle sette.", "vero"], ["Il cliente si è arrabbiato.", "falso"], ["Paolo lavora a Roma.", "non si dice"]],
      hunt: { label: "Tocá los condizionali passati (avrebbe voluto, sarei dovuto…)", targets: ["avrebbe", "sarei", "avrei"] } },

    { id: "w-33", week: 33, level: "B2", emoji: "🏛️", title: "Se fossi sindaco",
      grammar: "periodo ipotetico",
      text:
        "A scuola la maestra chiede ai bambini: \"Che cosa fareste se foste sindaci della città?\" Luca risponde " +
        "subito: \"Se fossi sindaco, costruirei un parco giochi in ogni quartiere.\"\n\n" +
        "Giulia ci pensa un po': \"Se avessi tanti soldi, darei una casa a tutte le persone che non ce l'hanno.\" " +
        "Marco, invece, ride: \"Se comandassi io, la scuola comincerebbe alle dieci!\"\n\n" +
        "La maestra sorride. \"E se foste stati sindaci l'anno scorso, che cosa avreste cambiato?\" \"Avremmo " +
        "chiuso le strade alle macchine\", dice Giulia. \"Così adesso potremmo giocare fuori!\"",
      gloss: { maestra: "maestra", sindaco: "intendente", sindaci: "intendentes", costruirei: "construiría",
               giochi: "juegos (parco giochi = plaza de juegos)", quartiere: "barrio", comandassi: "mandara",
               chiuso: "cerrado", strade: "calles", fuori: "afuera" },
      questions: [
        ["¿Qué construiría Luca?", ["una plaza de juegos en cada barrio", "una escuela", "un estadio", "casas"], "una plaza de juegos en cada barrio"],
        ["¿Qué cambiaría Marco?", ["la escuela empezaría a las diez", "cerraría las calles", "daría casas", "nada"], "la escuela empezaría a las diez"],
        ["¿Qué habrían hecho el año pasado?", ["cerrar las calles a los autos", "construir un parque", "cambiar de maestra", "abrir más escuelas"], "cerrar las calles a los autos"]
      ],
      vf: [["Luca costruirebbe un parco giochi.", "vero"], ["Marco vorrebbe cominciare la scuola alle otto.", "falso"], ["La maestra è stata sindaca.", "non si dice"]],
      hunt: { label: "Tocá los verbos de la «se» (foste, fossi, avessi, comandassi)", targets: ["foste", "fossi", "avessi", "comandassi"] } },

    { id: "w-34", week: 34, level: "B2", emoji: "📖", title: "La mia libreria",
      grammar: "pronomi relativi",
      text:
        "C'è una libreria in cui passo ore intere. È in una piccola via che pochi conoscono, vicino a un ponte " +
        "da cui vedo il fiume.\n\n" +
        "Il proprietario, che si chiama Ettore, è un signore anziano con cui parlo sempre di romanzi. " +
        "Conosce ogni libro che ha sugli scaffali. Gli scaffali sono pieni di libri usati, alcuni dei quali " +
        "hanno più di cent'anni.\n\n" +
        "I clienti che entrano per la prima volta restano sorpresi. La cosa che mi piace di più è l'odore " +
        "della carta. È il posto in cui mi sento a casa.",
      gloss: { libreria: "librería", intere: "enteras", ponte: "puente", fiume: "río", proprietario: "dueño",
               anziano: "mayor, viejo", romanzi: "novelas", scaffali: "estantes", usati: "usados",
               sorpresi: "sorprendidos", odore: "olor", carta: "papel" },
      questions: [
        ["¿Qué se ve desde el puente?", ["el río", "el mar", "la librería", "la plaza"], "el río"],
        ["¿Quién es Ettore?", ["el dueño de la librería", "un cliente", "un escritor", "el narrador"], "el dueño de la librería"],
        ["¿Qué le gusta más al narrador?", ["el olor del papel", "los precios", "los libros nuevos", "el café"], "el olor del papel"]
      ],
      vf: [["Il proprietario si chiama Ettore.", "vero"], ["La libreria vende solo libri nuovi.", "falso"], ["Ettore ha scritto un romanzo.", "non si dice"]],
      hunt: { label: "Tocá los relativos (che, cui, quali)", targets: ["che", "cui", "quali"] } },

    { id: "w-36", week: 36, level: "B2", emoji: "🍝", title: "In Italia si fa così",
      grammar: "si passivante e si impersonale",
      text:
        "In Italia, a tavola, si seguono alcune regole. Il cappuccino si beve solo la mattina, mai dopo pranzo. " +
        "La pasta non si taglia con il coltello e sugli spaghetti al pesce non si mette il parmigiano.\n\n" +
        "Al bar si paga prima alla cassa e poi si ordina al banco. Il caffè si prende in piedi, velocemente.\n\n" +
        "La domenica si pranza con la famiglia e si sta a tavola per ore. Si parla di tutto: di politica, " +
        "di calcio, di cucina. E quando si va a casa di qualcuno, non si arriva mai a mani vuote: " +
        "si porta un dolce o una bottiglia di vino.",
      gloss: { regole: "reglas", taglia: "corta", coltello: "cuchillo", pesce: "pescado", cassa: "caja",
               banco: "barra", piedi: "pie (in piedi = parado)", velocemente: "rápido", calcio: "fútbol",
               mani: "manos", vuote: "vacías", dolce: "postre" },
      questions: [
        ["¿Cuándo se toma el capuchino?", ["solo a la mañana", "después del almuerzo", "a la noche", "siempre"], "solo a la mañana"],
        ["¿Qué se hace primero en el bar?", ["pagar en la caja", "pedir en la barra", "sentarse", "tomar el café"], "pagar en la caja"],
        ["¿Qué se lleva a una casa?", ["un postre o una botella de vino", "flores", "nada", "pan"], "un postre o una botella de vino"]
      ],
      vf: [["In Italia il cappuccino si beve la mattina.", "vero"], ["Al bar si ordina prima di pagare.", "falso"], ["In Italia si cena alle nove.", "non si dice"]],
      hunt: { label: "Tocá el «si»", targets: ["si"] } },

    { id: "w-37", week: 37, level: "B2", emoji: "🌊", title: "La leggenda di Colapesce",
      grammar: "passato remoto",
      text:
        "Tanto tempo fa, a Messina, visse un ragazzo che si chiamava Cola. Passava le giornate in mare e nuotava " +
        "come un pesce: per questo lo chiamarono Colapesce.\n\n" +
        "Un giorno il re volle metterlo alla prova. Gettò una coppa d'oro in mare e Cola la riportò. Poi gettò " +
        "una corona, e Cola la ritrovò.\n\n" +
        "Alla fine il re lanciò un anello nel punto più profondo. Cola si tuffò e scoprì che la Sicilia " +
        "poggiava su tre colonne, e che una era rotta. Decise di restare sotto il mare a sostenerla. " +
        "Da quel giorno nessuno lo vide più.",
      gloss: { nuotava: "nadaba", pesce: "pez", prova: "prueba", gettò: "tiró",
               coppa: "copa", oro: "oro", corona: "corona", anello: "anillo", profondo: "profundo",
               tuffò: "zambulló", poggiava: "se apoyaba", colonne: "columnas", rotta: "rota", sostenerla: "sostenerla" },
      questions: [
        ["¿Por qué lo llamaron Colapesce?", ["nadaba como un pez", "vendía pescado", "era pescador", "tenía escamas"], "nadaba como un pez"],
        ["¿Qué descubrió en el fondo?", ["que Sicilia se apoya en tres columnas, una rota", "un tesoro", "una ciudad", "al rey"], "que Sicilia se apoya en tres columnas, una rota"],
        ["¿Qué hizo al final?", ["se quedó bajo el mar sosteniendo la columna", "volvió con el anillo", "se casó", "se fue de Messina"], "se quedó bajo el mar sosteniendo la columna"]
      ],
      vf: [["Cola nuotava come un pesce.", "vero"], ["Cola non riuscì a riportare la coppa.", "falso"], ["Il re aveva tre figlie.", "non si dice"]],
      hunt: { label: "Tocá los verbos en passato remoto", targets: ["visse", "chiamarono", "volle", "gettò", "riportò", "ritrovò", "lanciò", "tuffò", "scoprì", "decise", "vide"] } },

    { id: "w-38", week: 38, level: "B2", emoji: "☎️", title: "La telefonata di Anna",
      grammar: "discorso indiretto",
      text:
        "Ieri Anna mi ha telefonato. Mi ha detto che aveva trovato un nuovo lavoro a Milano e che sarebbe " +
        "partita la settimana dopo. Mi ha chiesto se potevo aiutarla con il trasloco.\n\n" +
        "Le ho risposto che quel sabato lavoravo, ma che la domenica ero libero. Lei ha detto che andava " +
        "benissimo e che mi avrebbe offerto la cena.\n\n" +
        "Poi mi ha raccontato che il suo capo le aveva promesso uno stipendio più alto. Mi ha detto di non " +
        "dirlo a nessuno, perché non era ancora sicura. Io le ho promesso che avrei mantenuto il segreto.",
      gloss: { trasloco: "mudanza", libero: "libre", offerto: "invitado, ofrecido",
               capo: "jefe", promesso: "prometido", stipendio: "sueldo", sicura: "segura", mantenuto: "guardado",
               segreto: "secreto" },
      questions: [
        ["¿Qué le pidió Anna?", ["ayuda con la mudanza", "plata", "un trabajo", "un consejo"], "ayuda con la mudanza"],
        ["¿Qué día puede ayudar el narrador?", ["el domingo", "el sábado", "el viernes", "nunca"], "el domingo"],
        ["¿Qué tiene que guardar en secreto?", ["el sueldo más alto", "la mudanza", "la cena", "el nuevo trabajo"], "el sueldo más alto"]
      ],
      vf: [["Anna ha trovato un lavoro a Milano.", "vero"], ["Il narratore è libero il sabato.", "falso"], ["Anna si trasferisce con il fidanzato.", "non si dice"]],
      hunt: { label: "Tocá los condizionali passati del discurso indirecto", targets: ["sarebbe", "avrebbe", "avrei"] } },

    { id: "w-39", week: 39, level: "B2", emoji: "🚢", title: "Il nonno emigrante",
      grammar: "ripasso: passato remoto, periodo ipotetico, congiuntivo",
      text:
        "Mio nonno partì per l'Argentina nel 1951. Aveva vent'anni e non parlava una parola di spagnolo. " +
        "Raccontava sempre che, se non fosse partito, avrebbe fatto il contadino come suo padre.\n\n" +
        "A Buenos Aires trovò lavoro in una fabbrica, dove conobbe mia nonna, che era figlia di italiani. " +
        "Si sposarono due anni dopo.\n\n" +
        "Quando gli chiedevo se gli mancasse l'Italia, mi rispondeva che l'Italia era nei suoi ricordi, " +
        "ma che la sua casa era lì. Credo che sia stato un uomo coraggioso: non so se io ci sarei riuscito.",
      gloss: { raccontava: "contaba", contadino: "campesino", fabbrica: "fábrica",
               conobbe: "conoció", sposarono: "casaron", mancasse: "extrañara", ricordi: "recuerdos",
               coraggioso: "valiente", riuscito: "logrado" },
      questions: [
        ["¿Cuándo se fue el abuelo?", ["en 1951", "en 1915", "en 1981", "en 1961"], "en 1951"],
        ["¿Dónde conoció a la abuela?", ["en una fábrica", "en el barco", "en Italia", "en una fiesta"], "en una fábrica"],
        ["¿Qué respondía sobre Italia?", ["estaba en sus recuerdos, pero su casa era Argentina", "quería volver", "no la extrañaba nada", "odiaba Italia"], "estaba en sus recuerdos, pero su casa era Argentina"]
      ],
      vf: [["Il nonno partì per l'Argentina a vent'anni.", "vero"], ["Il nonno parlava bene lo spagnolo.", "falso"], ["Il nonno tornò in Italia da vecchio.", "non si dice"]],
      hunt: { label: "Tocá los verbos en passato remoto", targets: ["partì", "trovò", "conobbe", "sposarono"] } },

    { id: "w-40", week: 40, level: "C1", emoji: "🏡", title: "Una casa da sistemare",
      grammar: "causativo: fare e lasciare",
      text:
        "Io e mio marito abbiamo comprato una casa vecchia in campagna. Non sappiamo fare niente, quindi " +
        "facciamo fare tutto agli altri.\n\n" +
        "Abbiamo fatto rifare il tetto da un'impresa e abbiamo fatto dipingere le pareti da un amico pittore. " +
        "Ieri ho fatto controllare l'impianto elettrico, perché le luci si spegnevano da sole.\n\n" +
        "I vicini ci guardano curiosi. La signora Rosa ci ha lasciato usare il suo giardino per i materiali, " +
        "e suo figlio ci ha fatto vedere dove comprare la legna. Mio marito dice che si farà crescere la barba " +
        "e vivrà come un contadino. Io lo lascio sognare.",
      gloss: { marito: "marido", campagna: "campo", tetto: "techo", impresa: "empresa",
               dipingere: "pintar", pareti: "paredes", pittore: "pintor", impianto: "instalación",
               spegnevano: "apagaban", legna: "leña", barba: "barba", contadino: "campesino", sognare: "soñar" },
      questions: [
        ["¿Quién pintó las paredes?", ["un amigo pintor", "ellos mismos", "una empresa", "la vecina"], "un amigo pintor"],
        ["¿Por qué revisaron la instalación eléctrica?", ["las luces se apagaban solas", "era vieja", "la vecina se quejó", "no había luz"], "las luces se apagaban solas"],
        ["¿Qué sueña el marido?", ["vivir como un campesino", "volver a la ciudad", "vender la casa", "ser pintor"], "vivir como un campesino"]
      ],
      vf: [["La casa è in campagna.", "vero"], ["Hanno rifatto il tetto da soli.", "falso"], ["La signora Rosa vive da sola.", "non si dice"]],
      hunt: { label: "Tocá fare y lasciare seguidos de infinitivo", targets: ["fare", "fatto", "lasciato", "farà", "lascio"] } },

    { id: "w-41", week: 41, level: "C1", emoji: "🌙", title: "Una notte in campagna",
      grammar: "verbi di percezione",
      text:
        "La prima notte in campagna non riuscivo a dormire. Sentivo le cicale cantare e i cani abbaiare " +
        "lontano. Dalla finestra vedevo la luna salire dietro le colline.\n\n" +
        "A un certo punto ho sentito qualcuno camminare in giardino. Ho visto un'ombra passare vicino alla " +
        "porta e ho sentito il cuore battere forte.\n\n" +
        "Ho acceso la luce e ho visto... un gatto nero mangiare dalla ciotola del cane! Mi ha guardato un " +
        "momento e poi è scappato. Ho riso da sola e finalmente mi sono addormentata, mentre sentivo il " +
        "vento muovere le foglie.",
      gloss: { riuscivo: "lograba", cicale: "chicharras", abbaiare: "ladrar", lontano: "lejos", colline: "colinas",
               ombra: "sombra", cuore: "corazón", battere: "latir", acceso: "prendido", ciotola: "cuenco",
               scappato: "escapado", vento: "viento", foglie: "hojas" },
      questions: [
        ["¿Qué oía al principio?", ["las chicharras y perros a lo lejos", "música", "el mar", "autos"], "las chicharras y perros a lo lejos"],
        ["¿Quién estaba en el jardín?", ["un gato negro", "un ladrón", "el perro", "el vecino"], "un gato negro"],
        ["¿Cómo termina la noche?", ["se duerme mientras oye el viento", "no duerme nada", "llama a la policía", "se va a la ciudad"], "se duerme mientras oye el viento"]
      ],
      vf: [["La prima notte la narratrice non riusciva a dormire.", "vero"], ["In giardino c'era un ladro.", "falso"], ["Il cane dormiva in casa.", "non si dice"]],
      hunt: { label: "Tocá los verbos de percepción (sentivo, vedevo, ho visto…)", targets: ["sentivo", "vedevo", "sentito", "visto"] } },

    { id: "w-42", week: 42, level: "C1", emoji: "🏃", title: "Buoni propositi",
      grammar: "verbi e preposizioni",
      text:
        "A gennaio Luca ha deciso di cambiare vita. Ha smesso di fumare e ha cominciato a correre ogni mattina. " +
        "Ha promesso alla moglie di tornare a casa prima la sera e ha provato a imparare a cucinare.\n\n" +
        "Ha anche pensato di iscriversi a un corso di chitarra, ma non è riuscito a trovare il tempo. " +
        "Si è abituato a svegliarsi alle sei, però si è stancato di mangiare solo insalata.\n\n" +
        "A marzo sua moglie gli ha chiesto: \"Continui a correre?\" Luca ha finto di non sentire. " +
        "\"Almeno hai smesso di fumare\", ha detto lei. \"Quello sì\", ha risposto lui, orgoglioso.",
      gloss: { smesso: "dejado", fumare: "fumar", provato: "intentado",
               iscriversi: "anotarse", chitarra: "guitarra", riuscito: "logrado", abituato: "acostumbrado",
               stancato: "cansado", insalata: "ensalada", finto: "fingido", orgoglioso: "orgulloso" },
      questions: [
        ["¿Qué dejó Luca en enero?", ["de fumar", "de correr", "de trabajar", "de cocinar"], "de fumar"],
        ["¿Por qué no hizo el curso de guitarra?", ["no encontró tiempo", "era caro", "no le gustaba", "se lastimó"], "no encontró tiempo"],
        ["¿Qué pasa en marzo?", ["finge no oír si sigue corriendo", "sigue corriendo", "vuelve a fumar", "empieza guitarra"], "finge no oír si sigue corriendo"]
      ],
      vf: [["Luca ha smesso di fumare.", "vero"], ["Luca si è iscritto a un corso di chitarra.", "falso"], ["Luca ha perso cinque chili.", "non si dice"]],
      hunt: { label: "Tocá las preposiciones que siguen al verbo (di, a)", targets: ["di", "a"] } },

    { id: "w-44", week: 44, level: "C1", emoji: "🌉", title: "Tornando a casa",
      grammar: "gerundio e participio",
      text:
        "Tornando a casa dal lavoro, Silvia ha incontrato una vecchia amica. Parlando del passato, si sono " +
        "accorte di non vedersi da dieci anni.\n\n" +
        "Finita la cena, hanno camminato lungo il fiume, ridendo come ragazze. Arrivate al ponte, si sono " +
        "fermate a guardare le luci della città.\n\n" +
        "\"Pensando a quegli anni, mi viene nostalgia\", ha detto l'amica. Silvia, sorridendo, le ha preso il " +
        "braccio: \"Vedendoti, mi sembra ieri.\" Prima di salutarsi davanti alla stazione, si sono promesse " +
        "di rivedersi presto. E questa volta, conoscendole, lo faranno davvero.",
      gloss: { accorte: "dado cuenta", lungo: "a lo largo de", fiume: "río", ridendo: "riéndose", ponte: "puente",
               fermate: "detenido", nostalgia: "nostalgia", sorridendo: "sonriendo", braccio: "brazo",
               salutarsi: "despedirse", promesse: "prometido", davvero: "de verdad" },
      questions: [
        ["¿Hace cuánto no se veían?", ["diez años", "un año", "veinte años", "un mes"], "diez años"],
        ["¿Dónde se detuvieron?", ["en el puente", "en la estación", "en un bar", "en la casa"], "en el puente"],
        ["¿Qué se prometieron?", ["volver a verse pronto", "escribirse", "viajar juntas", "nada"], "volver a verse pronto"]
      ],
      vf: [["Silvia e l'amica non si vedevano da dieci anni.", "vero"], ["Si sono salutate al ponte.", "falso"], ["L'amica abita in un'altra città.", "non si dice"]],
      hunt: { label: "Tocá los gerundios y participios (tornando, finita…)", targets: ["tornando", "parlando", "finita", "ridendo", "arrivate", "pensando", "sorridendo", "vedendoti", "conoscendole"] } },

    { id: "w-45", week: 45, level: "C1", emoji: "🏅", title: "La maratona",
      grammar: "costruzioni verbali speciali",
      text:
        "Domenica Paolo ha corso la sua prima maratona. Ci ha messo quattro ore e mezza, ma ce l'ha fatta. " +
        "Al trentesimo chilometro voleva andarsene a casa: le gambe non ce la facevano più.\n\n" +
        "Un signore anziano l'ha superato sorridendo, e Paolo se l'è presa un po'. \"Se ce la fa lui, " +
        "ce la faccio anch'io\", ha pensato.\n\n" +
        "All'arrivo sua figlia gli ha detto: \"Te la sei cavata bene, papà!\" Paolo non ci credeva: era " +
        "stanco morto ma felice. \"L'anno prossimo ci metterò meno\", ha promesso. \"Vedremo\", ha detto la moglie ridendo.",
      gloss: { maratona: "maratón", messo: "tardado (metterci)", trentesimo: "trigésimo", andarsene: "irse",
               gambe: "piernas", anziano: "mayor", superato: "pasado", presa: "ofendido (prendersela)",
               arrivo: "llegada", cavata: "arreglado (cavarsela = arreglárselas)", morto: "muerto" },
      questions: [
        ["¿Cuánto tardó?", ["cuatro horas y media", "tres horas", "cinco horas", "dos horas"], "cuatro horas y media"],
        ["¿Qué le molestó?", ["que un señor mayor lo pasara", "el calor", "la lluvia", "su hija"], "que un señor mayor lo pasara"],
        ["¿Qué promete para el año próximo?", ["tardar menos", "no correr", "correr con su hija", "entrenar menos"], "tardar menos"]
      ],
      vf: [["Paolo ci ha messo quattro ore e mezza.", "vero"], ["Paolo si è ritirato al trentesimo chilometro.", "falso"], ["La figlia di Paolo ha corso con lui.", "non si dice"]],
      hunt: { label: "Tocá las partículas de los verbos pronominales (ce, ci, se, te)", targets: ["ce", "ci", "se", "te"] } },

    { id: "w-48", week: 48, level: "C1", emoji: "☕", title: "Il barista Gino",
      grammar: "ordine delle parole e dislocazioni",
      text:
        "Il caffè, lo prendo sempre al bar sotto casa. Il barista, Gino, lo conosco da vent'anni. Di calcio, " +
        "con lui, ne parlo ogni mattina, anche se tifiamo per squadre diverse.\n\n" +
        "\"La Juve, quest'anno, non la ferma nessuno\", dice lui. \"Ma che dici? Lo scudetto lo vince l'Inter\", " +
        "rispondo io.\n\n" +
        "È stato lui a farmi conoscere mia moglie: era una cliente anche lei. Il cornetto, invece, l'ho sempre " +
        "preso altrove, perché quelli di Gino sono duri come pietre. Ma questo, a lui, non l'ho mai detto.",
      gloss: { tifiamo: "somos hinchas", squadre: "equipos", ferma: "para", scudetto: "campeonato",
               cornetto: "medialuna", altrove: "en otro lado", duri: "duros", pietre: "piedras" },
      questions: [
        ["¿Hace cuánto conoce a Gino?", ["veinte años", "dos años", "diez años", "desde chico"], "veinte años"],
        ["¿Qué le debe a Gino?", ["haber conocido a su esposa", "un trabajo", "plata", "un café gratis"], "haber conocido a su esposa"],
        ["¿Qué nunca le dijo?", ["que sus medialunas son duras", "que es de otro equipo", "que no le gusta el café", "que se muda"], "que sus medialunas son duras"]
      ],
      vf: [["Il narratore conosce Gino da vent'anni.", "vero"], ["Il narratore compra i cornetti da Gino.", "falso"], ["Gino tifa per la Juventus.", "vero"]],
      hunt: { label: "Tocá los pronombres que retoman lo dislocado (lo, la, ne, l')", targets: ["lo", "la", "ne", "l'ho"] } },

    { id: "w-49", week: 49, level: "C1", emoji: "📢", title: "Avviso ai condomini",
      grammar: "registro alto e coesione",
      text:
        "Gentili condomini, si comunica che, a partire da lunedì 3 marzo, avranno inizio i lavori di " +
        "manutenzione dell'ascensore. Durante tale periodo, la cui durata si prevede di due settimane, " +
        "l'impianto non sarà utilizzabile.\n\n" +
        "Si invitano pertanto i residenti a servirsi delle scale e a prestare particolare attenzione ai " +
        "materiali depositati nell'atrio. Qualora vi fossero esigenze specifiche, in particolare per persone " +
        "anziane o con disabilità, si prega di contattare l'amministrazione.\n\n" +
        "Ci scusiamo per il disagio e confidiamo nella consueta collaborazione. Distinti saluti, l'Amministratore.",
      gloss: { condomini: "vecinos del consorcio", manutenzione: "mantenimiento",
               ascensore: "ascensor", tale: "dicho", impianto: "instalación", pertanto: "por lo tanto",
               servirsi: "valerse", atrio: "hall", qualora: "en caso de que", esigenze: "necesidades", utilizzabile: "utilizable", depositati: "depositados", amministrazione: "administración", disabilità: "discapacidad", confidiamo: "confiamos", collaborazione: "colaboración", distinti: "atentos (distinti saluti = saludos atentos)",
               prega: "ruega", disagio: "molestia", consueta: "habitual" },
      questions: [
        ["¿Cuánto duran los trabajos?", ["dos semanas", "un mes", "tres días", "no se sabe"], "dos semanas"],
        ["¿Qué deben usar los vecinos?", ["las escaleras", "el ascensor de servicio", "la puerta de atrás", "nada"], "las escaleras"],
        ["¿Quién debe contactar a la administración?", ["quien tenga necesidades específicas", "todos", "nadie", "los niños"], "quien tenga necesidades específicas"]
      ],
      vf: [["I lavori riguardano l'ascensore.", "vero"], ["I lavori durano un mese.", "falso"], ["I lavori costano mille euro.", "non si dice"]],
      hunt: { label: "Tocá los conectores formales (pertanto, qualora, durante…)", targets: ["pertanto", "qualora", "durante", "tale"] } },

    { id: "w-51", week: 51, level: "C1", emoji: "✉️", title: "Lettera a me stesso",
      grammar: "ripasso generale C1",
      text:
        "Caro me, se stai leggendo queste righe, vuol dire che è passato un anno da quando hai cominciato " +
        "a studiare italiano. Ti ricordi quanto faticavi a distinguere il passato prossimo dall'imperfetto? " +
        "E quante volte hai sbagliato l'ausiliare di \"andare\"?\n\n" +
        "Oggi, invece, leggi un giornale senza vocabolario e capisci quasi tutto quello che senti alla radio. " +
        "Non che tu sia diventato perfetto, sia chiaro: il congiuntivo ti fa ancora qualche scherzo.\n\n" +
        "Però, se ti fossi arreso a febbraio, non saresti arrivato fin qui. Continua così, e il prossimo anno " +
        "scrivimi in italiano, possibilmente senza errori.",
      gloss: { righe: "líneas", faticavi: "te costaba", distinguere: "distinguir", vocabolario: "diccionario",
               quasi: "casi", chiaro: "claro", scherzo: "broma, jugada", volte: "veces", arreso: "rendido", possibilmente: "si es posible" },
      questions: [
        ["¿Cuánto tiempo pasó?", ["un año", "un mes", "diez años", "una semana"], "un año"],
        ["¿Qué le cuesta todavía?", ["el congiuntivo", "leer el diario", "entender la radio", "el passato prossimo"], "el congiuntivo"],
        ["¿Qué habría pasado si se rendía en febrero?", ["no habría llegado hasta acá", "hablaría mejor", "nada", "habría viajado"], "no habría llegado hasta acá"]
      ],
      vf: [["È passato un anno da quando ha cominciato a studiare.", "vero"], ["Il congiuntivo non è più un problema.", "falso"], ["Ha studiato in Italia.", "non si dice"]],
      hunt: { label: "Tocá los congiuntivi y el condizionale (sia, fossi, saresti)", targets: ["sia", "fossi", "saresti"] } },

    { id: "w-52", week: 52, level: "C1", emoji: "🎓", title: "Il giorno dell'esame",
      grammar: "tutto l'anno",
      text:
        "Alle otto e mezza Martina era già davanti all'università, con il documento in mano e il cuore che " +
        "batteva forte. Aveva studiato per un anno intero e ora doveva dimostrare di aver raggiunto il livello C1.\n\n" +
        "La prova di ascolto fu la più difficile: due giornalisti parlavano velocissimi di economia. Nella " +
        "produzione scritta, invece, si sentì a suo agio: le chiedevano di argomentare sui pro e i contro " +
        "del lavoro da casa.\n\n" +
        "Un mese dopo arrivò la mail: \"Esame superato.\" Martina la lesse tre volte prima di crederci. " +
        "Poi chiamò la sua insegnante: \"Ce l'ho fatta!\"",
      gloss: { documento: "documento", cuore: "corazón", batteva: "latía", dimostrare: "demostrar",
               raggiunto: "alcanzado", prova: "prueba", ascolto: "escucha", giornalisti: "periodistas",
               agio: "gusto (a suo agio = cómoda)", produzione: "producción", volte: "veces", argomentare: "argumentar", superato: "aprobado",
               insegnante: "profesora" },
      questions: [
        ["¿Qué prueba fue la más difícil?", ["la de escucha", "la escrita", "la oral", "la de lectura"], "la de escucha"],
        ["¿Sobre qué tuvo que argumentar?", ["el trabajo desde casa", "la economía", "la universidad", "el deporte"], "el trabajo desde casa"],
        ["¿A quién llamó al final?", ["a su profesora", "a su madre", "a un periodista", "a la universidad"], "a su profesora"]
      ],
      vf: [["La prova di ascolto è stata la più difficile.", "vero"], ["Martina ha saputo il risultato il giorno stesso.", "falso"], ["Martina ha preso il voto massimo.", "non si dice"]],
      hunt: { label: "Tocá los verbos en passato remoto", targets: ["fu", "sentì", "arrivò", "lesse", "chiamò"] } }
  ];

  // «Vero, falso o non si dice?»: comprehension in Italian, as in the CILS.
  var api = { TESTI: TESTI };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LettureSettimana = api;
})(typeof window !== "undefined" ? window : globalThis);
