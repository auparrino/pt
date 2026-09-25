/* Esame finale C1 (settimana 52): ascolto, lettura e scrittura.
 * Solo dati: la logica sta in app.js.  La parte di strutture e lessico
 * (cloze, formazione di parole, trasformazioni, registro) è in
 * tools/authored/esame_c1.py.
 *
 * ascolto[]:  due ascolti lunghi a due voci (turns: "A" = primo speaker,
 *             "B" = secondo; l'app li legge con due altezze TTS diverse),
 *             8 domande a scelta multipla in castellano (4 opzioni) e
 *             4 frasi da completare con una parola dell'audio.
 * lettura[]:  due testi di 6 paragrafi; 8 titoli (6 giusti + 2 distrattori)
 *             da abbinare (match[i] = indice del titolo del paragrafo i);
 *             8 vero/falso con la frase del testo che giustifica.
 * scrittura[]: due consegne con griglia di valutazione. */
(function (root) { "use strict";
  var ESAME = {
    ascolto: [
      { id: "asc-1", title: "Intervista: il lavoro da remoto", speakers: ["Giornalista", "Esperta"],
        turns: [
          ["A", "Buongiorno e benvenuti. Oggi parliamo di lavoro da remoto con la professoressa Livia Sartori, sociologa del lavoro. Professoressa, a distanza di qualche anno dall'emergenza sanitaria, che cosa è rimasto del cosiddetto smart working?"],
          ["B", "Meno di quanto si pensasse nei momenti di entusiasmo, ma più di quanto temessero gli scettici. La maggior parte delle aziende che lo avevano introdotto in fretta è tornata a chiedere presenza, però quasi nessuna è tornata al modello precedente: prevale la formula ibrida, due o tre giorni a casa e gli altri in ufficio."],
          ["A", "Chi ne ha tratto maggior vantaggio?"],
          ["B", "Le persone con figli piccoli e chi vive lontano dai grandi centri. Per loro il risparmio di tempo negli spostamenti si è tradotto in una qualità della vita nettamente migliore. Il rovescio della medaglia è che i benefici si concentrano sui lavori d'ufficio: un operaio, un'infermiera o un commesso non hanno avuto alcuna scelta."],
          ["A", "E i rischi?"],
          ["B", "Il principale, a mio avviso, è l'isolamento. Non tanto la solitudine in sé, quanto la perdita di quelle conversazioni informali in cui si imparano le cose che nessuno mette per iscritto. I più giovani, che devono ancora costruirsi una rete di relazioni, sono i più penalizzati."],
          ["A", "Le aziende se ne sono rese conto?"],
          ["B", "Alcune sì. Le più attente hanno introdotto giornate comuni obbligatorie, in cui tutta la squadra è presente, e hanno formato i dirigenti a gestire persone che non vedono. Altre si sono limitate a contare le ore di connessione, che è il modo più sicuro per distruggere la fiducia."],
          ["A", "Un'ultima domanda: il diritto alla disconnessione è davvero garantito?"],
          ["B", "Sulla carta sì; nella pratica dipende dalla cultura di ogni ufficio. Finché rispondere a un'email alle dieci di sera sarà considerato un segno di dedizione, nessuna legge basterà. Sarebbe necessario che fossero i capi, per primi, a dare l'esempio."],
          ["A", "Professoressa Sartori, grazie."],
          ["B", "Grazie a voi."]
        ],
        questions: [
          ["Según la experta, ¿qué quedó del trabajo remoto después de la emergencia sanitaria?",
           ["Menos de lo que se pensaba, pero más de lo que temían los escépticos", "Prácticamente nada: todas las empresas volvieron al modelo anterior", "Todo: la mayoría de las empresas mantuvo el trabajo remoto total", "Solo quedó en el sector público"],
           "Menos de lo que se pensaba, pero más de lo que temían los escépticos"],
          ["¿Qué modelo predomina hoy en las empresas?",
           ["Uno híbrido: dos o tres días en casa y el resto en la oficina", "Trabajo remoto cinco días por semana", "Presencia obligatoria todos los días", "Un día en casa por mes"],
           "Uno híbrido: dos o tres días en casa y el resto en la oficina"],
          ["¿Quiénes sacaron mayor provecho?",
           ["Las personas con hijos chicos y quienes viven lejos de las grandes ciudades", "Los operarios y el personal sanitario", "Los jóvenes recién ingresados", "Los directivos"],
           "Las personas con hijos chicos y quienes viven lejos de las grandes ciudades"],
          ["¿Cuál es el «reverso de la medalla» que menciona?",
           ["Que los beneficios se concentran en los trabajos de oficina", "Que se gasta más en transporte", "Que las empresas pagan sueldos más bajos", "Que los hijos rinden peor en la escuela"],
           "Que los beneficios se concentran en los trabajos de oficina"],
          ["¿Por qué el aislamiento es el riesgo principal?",
           ["Porque se pierden las conversaciones informales en las que se aprende lo que nadie escribe", "Porque la gente se deprime cuando está sola", "Porque la conexión a internet falla seguido", "Porque se pierden las reuniones formales"],
           "Porque se pierden las conversaciones informales en las que se aprende lo que nadie escribe"],
          ["¿Qué hicieron las empresas «más atentas»?",
           ["Fijaron días comunes obligatorios y formaron a los directivos", "Contaron las horas de conexión de cada empleado", "Cerraron las oficinas", "Redujeron los sueldos"],
           "Fijaron días comunes obligatorios y formaron a los directivos"],
          ["¿Qué opina la experta de contar las horas de conexión?",
           ["Que es la forma más segura de destruir la confianza", "Que es una medida necesaria", "Que sirve solo con los jóvenes", "Que la exige la ley"],
           "Que es la forma más segura de destruir la confianza"],
          ["¿De qué depende, en la práctica, que funcione el derecho a la desconexión?",
           ["De la cultura de cada oficina y del ejemplo que den los jefes", "De una ley más severa", "De los sindicatos", "De la cantidad de emails que se reciben"],
           "De la cultura de cada oficina y del ejemplo que den los jefes"]
        ],
        completa: [
          ["Secondo l'esperta, il rischio principale è l'___.", "isolamento"],
          ["Oggi prevale la formula ___: due o tre giorni a casa e gli altri in ufficio.", "ibrida"],
          ["I più ___ sono i più penalizzati, perché devono ancora costruirsi una rete di relazioni.", "giovani"],
          ["Il diritto alla disconnessione è garantito sulla ___, ma nella pratica dipende dalla cultura di ogni ufficio.", "carta"]
        ] },

      { id: "asc-2", title: "Conferenza: quando gli italiani impararono l'italiano", speakers: ["Moderatrice", "Storico"],
        turns: [
          ["A", "Buonasera a tutti. Prosegue il nostro ciclo di incontri sulla storia della lingua. Stasera abbiamo con noi il professor Andrea Colombo, storico della lingua italiana. Professore, cominciamo da una domanda provocatoria: nel 1861, quando l'Italia fu unificata, quanti italiani parlavano italiano?"],
          ["B", "Pochissimi. Le stime variano molto, e gli studiosi discutono ancora sui criteri, ma si va da poco più del due per cento a circa il dieci. In ogni caso, la stragrande maggioranza della popolazione parlava esclusivamente il dialetto della propria zona, e l'italiano era una lingua quasi soltanto scritta, patrimonio di una ristretta minoranza colta."],
          ["A", "Eppure la lingua letteraria esisteva da secoli."],
          ["B", "Certo: dal Trecento, con Dante, Petrarca e Boccaccio, il fiorentino colto era diventato il modello. Ma era un modello per chi scriveva, non per chi parlava. Lo stesso Manzoni, nell'Ottocento, sentì il bisogno di andare a Firenze per, come disse lui, «risciacquare i panni in Arno», cioè per rendere più viva e naturale la lingua dei Promessi sposi."],
          ["A", "Che cosa cambiò, allora, dopo l'Unità?"],
          ["B", "Diversi fattori, lentamente. La scuola dell'obbligo, per quanto frequentata in modo irregolare; il servizio militare, che metteva insieme giovani di regioni diverse costretti a capirsi; le migrazioni interne verso le città industriali; la burocrazia dello Stato. Ma il vero salto avvenne nel secondo dopoguerra."],
          ["A", "Si riferisce alla televisione?"],
          ["B", "Esattamente. A partire dagli anni Cinquanta la televisione entrò nelle case, nei bar, nei circoli, e per la prima volta milioni di persone ascoltarono ogni giorno la stessa lingua parlata. Ci fu persino una trasmissione, «Non è mai troppo tardi», con il maestro Alberto Manzi, che insegnava a leggere e a scrivere agli adulti analfabeti."],
          ["A", "Quindi i dialetti sono destinati a scomparire?"],
          ["B", "Non necessariamente. Oggi quasi tutti gli italiani sanno parlare italiano, ma molti continuano ad alternarlo con il dialetto a seconda della situazione. Il dialetto, da lingua della necessità, è diventato lingua dell'affetto e dell'identità."],
          ["A", "Grazie, professore. Apriamo ora le domande del pubblico."]
        ],
        questions: [
          ["Según el historiador, ¿qué porcentaje de italianos hablaba italiano en 1861?",
           ["Entre poco más del 2 % y alrededor del 10 %, según las estimaciones", "Alrededor de la mitad", "Casi todos, salvo en el sur", "Menos del 1 %"],
           "Entre poco más del 2 % y alrededor del 10 %, según las estimaciones"],
          ["¿Qué hablaba la gran mayoría de la población?",
           ["Exclusivamente el dialecto de su zona", "Italiano y dialecto por igual", "Latín en la iglesia e italiano en casa", "Francés en las ciudades"],
           "Exclusivamente el dialecto de su zona"],
          ["¿Qué era el italiano antes de la unificación?",
           ["Una lengua casi solo escrita, patrimonio de una minoría culta", "La lengua que se hablaba en las escuelas", "La lengua del ejército", "Un dialecto más entre otros"],
           "Una lengua casi solo escrita, patrimonio de una minoría culta"],
          ["¿Para qué fue Manzoni a Florencia?",
           ["Para hacer más viva y natural la lengua de su novela", "Para estudiar la obra de Dante", "Para lavar la ropa en el río", "Para fundar una escuela"],
           "Para hacer más viva y natural la lengua de su novela"],
          ["¿Cuál de estos factores NO menciona entre los que difundieron el italiano después de la Unidad?",
           ["La radio", "La escuela obligatoria", "El servicio militar", "Las migraciones internas"],
           "La radio"],
          ["¿Cuándo se produjo «el verdadero salto»?",
           ["En la segunda posguerra, con la televisión", "Con la unificación de 1861", "En el siglo XIV, con Dante", "Con la Primera Guerra Mundial"],
           "En la segunda posguerra, con la televisión"],
          ["¿Qué era «Non è mai troppo tardi»?",
           ["Un programa de televisión que enseñaba a leer y escribir a adultos analfabetos", "Una novela de Manzoni", "Un diario para emigrantes", "Un curso por radio para soldados"],
           "Un programa de televisión que enseñaba a leer y escribir a adultos analfabetos"],
          ["¿Qué pasó con el dialecto, según el historiador?",
           ["De lengua de la necesidad pasó a ser lengua del afecto y de la identidad", "Desapareció por completo", "Fue prohibido por el Estado", "Se volvió la lengua de la escuela"],
           "De lengua de la necesidad pasó a ser lengua del afecto y de la identidad"]
        ],
        completa: [
          ["Nel 1861 l'italiano era una lingua quasi soltanto ___.", "scritta"],
          ["Manzoni andò a Firenze per «risciacquare i panni in ___».", "Arno"],
          ["Il servizio ___ metteva insieme giovani di regioni diverse costretti a capirsi.", "militare"],
          ["Il maestro Alberto Manzi insegnava a leggere e a scrivere agli adulti ___.", "analfabeti"]
        ] }
    ],

    lettura: [
      { id: "let-1", title: "I paesi che si svuotano",
        paragraphs: [
          "Chi percorra le strade secondarie dell'Appennino, dalla Liguria alla Calabria, si imbatte con frequenza crescente in un paesaggio che sembra fermo nel tempo: borghi arroccati, case di pietra dalle persiane chiuse, piazze in cui l'unico bar ha rinunciato da anni a tenere aperto la sera. Non si tratta di un'impressione: gran parte dei comuni italiani conta meno di cinquemila abitanti e molti di essi, soprattutto nelle aree montane e interne, perdono popolazione da decenni, al punto che in alcune vallate il numero degli abitanti si è ridotto a un terzo rispetto all'inizio del Novecento. Lo spopolamento non è un evento improvviso, bensì un lento processo che comincia con la partenza dei giovani e si conclude, spesso, con la chiusura della scuola.",
          "Le ragioni sono note e si intrecciano. L'industrializzazione del secondo dopoguerra attirò verso le città del Nord milioni di persone in cerca di lavoro; l'agricoltura di montagna, faticosa e poco redditizia, fu abbandonata; i servizi, dalla sanità ai trasporti, furono progressivamente concentrati nei centri maggiori, con la conseguenza che vivere in paese divenne sempre più scomodo. A ciò si aggiunge un fattore culturale: per generazioni, andarsene è stato considerato l'unico modo di riuscire nella vita, mentre restare equivaleva a una rinuncia. Chi rimaneva lo faceva, il più delle volte, perché non aveva alternative.",
          "Gli effetti non riguardano soltanto chi resta. Un territorio abbandonato è un territorio che nessuno cura: i terrazzamenti crollano, i boschi avanzano sui campi, i sentieri scompaiono e il rischio di frane e incendi aumenta. Il patrimonio architettonico, privo di manutenzione, si deteriora. Si perdono inoltre saperi che non sono scritti da nessuna parte: come si costruisce un muro a secco, quando si semina una certa varietà di grano, come si chiama in dialetto un certo vento. Quando l'ultimo anziano se ne va, con lui se ne va un'intera biblioteca.",
          "Da alcuni anni lo Stato ha cominciato a occuparsi della questione con una strategia dedicata alle cosiddette aree interne, ossia ai territori lontani dai centri che offrono i servizi essenziali. L'idea di fondo è semplice: nessuno resta in un luogo in cui non ci sono una scuola, un medico e un mezzo per raggiungere il resto del mondo. Alcuni comuni, dal canto loro, hanno tentato la strada delle case vendute a prezzi simbolici, purché l'acquirente si impegni a ristrutturarle: iniziative che hanno avuto grande eco sui giornali, ma i cui risultati, a detta di molti osservatori, restano modesti: una casa comprata per pochi euro non serve a nulla se poi manca il lavoro per chi dovrebbe abitarla.",
          "Accanto agli interventi pubblici si osserva un fenomeno nuovo, ancora limitato ma significativo: persone che hanno lasciato la città per scelta, giovani che tornano al paese dei nonni per aprire un'azienda agricola o un laboratorio, lavoratori da remoto in cerca di affitti bassi e aria pulita. Non sono molti, e non tutti resistono al primo inverno, ma la loro presenza basta talvolta a riaprire un negozio o a far sì che la scuola raggiunga il numero minimo di alunni. Alcuni sindaci hanno capito che accogliere questi nuovi abitanti, anche stranieri, è l'unica alternativa all'estinzione, e hanno cominciato a offrire incentivi a chi apre un'attività o iscrive i figli alla scuola del paese.",
          "Sarebbe ingenuo pensare che i borghi possano tornare a essere ciò che erano: l'economia che li faceva vivere non esiste più. La domanda, semmai, è se sapranno diventare qualcos'altro senza trasformarsi in scenografie per turisti, belle da fotografare e vuote per undici mesi all'anno. La risposta dipenderà da quanto la società italiana nel suo insieme sarà disposta a considerare quei luoghi non come un residuo del passato, bensì come una parte del proprio futuro."
        ],
        titles: [
          "Chi arriva controcorrente",
          "Il turismo di massa nelle città d'arte",
          "Perché la gente se n'è andata",
          "Un lento svuotamento",
          "Né museo né scenografia: quale futuro",
          "Le nuove tecnologie in agricoltura",
          "Ciò che si perde con gli ultimi abitanti",
          "Le politiche pubbliche e le case a prezzo simbolico"
        ],
        match: [3, 2, 6, 7, 0, 4],
        vf: [
          ["Lo spopolamento dei borghi è un processo lento che comincia con la partenza dei giovani.", true, "«un lento processo che comincia con la partenza dei giovani e si conclude, spesso, con la chiusura della scuola»"],
          ["L'industrializzazione del dopoguerra spinse milioni di persone verso le città del Sud.", false, "«attirò verso le città del Nord milioni di persone in cerca di lavoro»"],
          ["Secondo il testo, restare in paese è stato a lungo considerato una rinuncia.", true, "«andarsene è stato considerato l'unico modo di riuscire nella vita, mentre restare equivaleva a una rinuncia»"],
          ["L'abbandono del territorio riduce il rischio di frane e incendi.", false, "«i sentieri scompaiono e il rischio di frane e incendi aumenta»"],
          ["La strategia dello Stato parte dall'idea che senza servizi essenziali nessuno resta.", true, "«nessuno resta in un luogo in cui non ci sono una scuola, un medico e un mezzo per raggiungere il resto del mondo»"],
          ["Secondo molti osservatori, le case vendute a prezzi simbolici hanno dato risultati eccellenti.", false, "«i cui risultati, a detta di molti osservatori, restano modesti»"],
          ["Tutti i nuovi abitanti resistono al primo inverno.", false, "«Non sono molti, e non tutti resistono al primo inverno»"],
          ["L'autore ritiene che i borghi non possano tornare a essere ciò che erano.", true, "«Sarebbe ingenuo pensare che i borghi possano tornare a essere ciò che erano»"]
        ] },

      { id: "let-2", title: "Il Grand Tour: quando l'Italia divenne una meta",
        paragraphs: [
          "Tra il Seicento e i primi decenni dell'Ottocento, per un giovane aristocratico inglese, tedesco o francese il viaggio in Italia costituì una tappa quasi obbligata dell'educazione. Lo si chiamava Grand Tour e poteva durare mesi o anni: si partiva accompagnati da un precettore, si attraversavano le Alpi e si scendeva lungo la penisola toccando Torino o Milano, Venezia, Firenze, Roma e, per i più intraprendenti, Napoli e la Sicilia. Lo scopo dichiarato era completare la formazione classica sui luoghi stessi in cui l'antichità aveva lasciato le sue tracce; quello reale, spesso, era anche divertirsi lontano dagli occhi della famiglia. Al ritorno, il giovane avrebbe dovuto saper conversare di arte antica e di musica, e portare con sé il gusto raffinato che ci si aspettava da un gentiluomo.",
          "Roma era il cuore dell'itinerario. Vi si arrivava con in mano guide e lettere di presentazione, e vi si trascorrevano settimane fra rovine, chiese e collezioni private, alle quali si accedeva grazie a una rete di ciceroni, antiquari e artisti disposti a fare da intermediari. Molti viaggiatori si facevano ritrarre da pittori del posto con sullo sfondo il Colosseo o il Foro, e acquistavano statue, monete e vedute da riportare a casa: le grandi dimore inglesi si riempirono così di frammenti d'Italia, veri o, non di rado, abilmente contraffatti.",
          "Dalla metà del Settecento un evento contribuì a spostare il baricentro del viaggio più a sud: gli scavi di Ercolano e di Pompei, le città sepolte dal Vesuvio nel 79 dopo Cristo, riportavano alla luce per la prima volta non soltanto templi e statue, ma la vita quotidiana degli antichi, con le sue case, le botteghe, le pitture e gli oggetti. Napoli, con il vulcano ancora attivo e il golfo, divenne una meta irrinunciabile, e la Sicilia, con i templi greci di Agrigento e di Segesta, cominciò ad attirare i più audaci, disposti ad affrontare strade pessime e alloggi di fortuna pur di vedere ciò che pochi avevano visto.",
          "Il viaggiatore più celebre fu forse Goethe, che tra il 1786 e il 1788 percorse l'Italia da Verona alla Sicilia e ne ricavò il Viaggio in Italia, pubblicato molti anni dopo. La sua affermazione di considerare il giorno in cui mise piede a Roma come una seconda nascita riassume un atteggiamento diffuso: l'Italia non era soltanto un luogo da vedere, ma un'esperienza che trasformava chi la faceva. Stendhal, alcuni decenni più tardi, descrisse lo sconvolgimento fisico che provò a Firenze davanti a tante opere d'arte, e a questo episodio si è ispirata, nel Novecento, la definizione di una vera e propria sindrome.",
          "Non mancavano, tuttavia, le voci critiche. Molti viaggiatori annotavano con fastidio le locande sporche, le strade insicure, i doganieri avidi, e guardavano gli abitanti con la condiscendenza di chi ammira le rovine ma disprezza chi ci vive intorno. Ne nacque un'immagine ambivalente, destinata a durare a lungo: un paese meraviglioso e al tempo stesso arretrato, in cui il passato glorioso serviva da contrasto per giudicare un presente considerato indolente.",
          "Con l'arrivo della ferrovia e, più tardi, del turismo organizzato, il Grand Tour nella sua forma aristocratica scomparve. Ne rimane però un'eredità profonda: l'idea dell'Italia come museo a cielo aperto, gli itinerari che ancora oggi i turisti seguono quasi senza variazioni, e una certa immagine del paese, fatta di luce, rovine e sensualità, che gli italiani stessi hanno finito per adottare. Molto di ciò che il mondo crede di sapere sull'Italia fu scritto, in fondo, da stranieri di passaggio, che vi cercavano ciò che avevano già deciso di trovare."
        ],
        titles: [
          "L'altra faccia dell'ammirazione",
          "Roma, centro dell'itinerario",
          "Le ferrovie italiane nell'Ottocento",
          "Ciò che resta oggi",
          "Un viaggio di formazione (e di svago)",
          "La scoperta del Sud",
          "Le origini dell'archeologia moderna",
          "Un'esperienza che trasforma"
        ],
        match: [4, 1, 5, 7, 0, 3],
        vf: [
          ["Il Grand Tour poteva durare anche anni.", true, "«poteva durare mesi o anni»"],
          ["Lo scopo reale del viaggio coincideva sempre con quello dichiarato.", false, "«quello reale, spesso, era anche divertirsi lontano dagli occhi della famiglia»"],
          ["A Roma i viaggiatori accedevano alle collezioni private grazie a intermediari.", true, "«alle quali si accedeva grazie a una rete di ciceroni, antiquari e artisti disposti a fare da intermediari»"],
          ["Gli scavi di Ercolano e Pompei riportarono alla luce soltanto templi e statue.", false, "«non soltanto templi e statue, ma la vita quotidiana degli antichi»"],
          ["Goethe pubblicò il suo Viaggio in Italia subito dopo il ritorno.", false, "«pubblicato molti anni dopo»"],
          ["Stendhal provò un malessere fisico a Firenze davanti alle opere d'arte.", true, "«descrisse lo sconvolgimento fisico che provò a Firenze davanti a tante opere d'arte»"],
          ["Molti viaggiatori guardavano gli abitanti con ammirazione e rispetto.", false, "«con la condiscendenza di chi ammira le rovine ma disprezza chi ci vive intorno»"],
          ["Secondo l'autore, gli itinerari turistici attuali ricalcano quelli del Grand Tour.", true, "«gli itinerari che ancora oggi i turisti seguono quasi senza variazioni»"]
        ] }
    ],

    scrittura: [
      { id: "scr-1", kind: "argomentativo", words: 200,
        t: "Un diario italiano abrió un debate con esta afirmación: «Il lavoro da remoto fa bene alle persone, ma fa male alle città e ai rapporti tra colleghi». Escribí un texto argumentativo en italiano (180-220 palabras) para la sección de opinión: tomá posición a favor o en contra de la tesis, sostenela con al menos dos argumentos y un ejemplo concreto, y cerrá con una conclusión. Registro formal, conectores variados (tuttavia, inoltre, pertanto, sebbene…), párrafos bien organizados y al menos una frase con congiuntivo.",
        rubric: [["adeguatezza", "Cumple la consigna: toma posición, dos argumentos y un ejemplo; registro formal"],
                 ["coesione", "Conectores variados y párrafos con una idea cada uno"],
                 ["correttezza", "Gramática: concordancias, tiempos, congiuntivo, preposiciones"],
                 ["lessico", "Riqueza y precisión: léxico C1, sin calcos del castellano"]] },
      { id: "scr-2", kind: "formale", words: 120,
        t: "Compraste por internet un curso de italiano en línea de una escuela de Milán. Pasaron dos semanas, la plataforma sigue sin funcionar y nadie responde a tus mails. Escribí una carta formal de reclamo en italiano (100-140 palabras) a la dirección de la escuela: presentate e indicá qué compraste y cuándo, explicá el problema, pedí una solución concreta (reembolso o activación inmediata) y fijá un plazo. Usá el «Lei», una apertura y un cierre adecuados (Gentile / Egregio…, Distinti saluti) y fórmulas del registro formal (con la presente, in merito a, pertanto, in attesa di un Suo riscontro).",
        rubric: [["adeguatezza", "Estructura de carta formal: apertura, presentación, problema, pedido con plazo, cierre"],
                 ["coesione", "Orden lógico y conectores formales"],
                 ["correttezza", "Gramática: «Lei» coherente, tiempos, pronombres"],
                 ["lessico", "Fórmulas del registro formal-burocrático, sin expresiones coloquiales"]] }
    ]
  };
  if (typeof module === "object" && module.exports) module.exports = ESAME; else root.EsameData = ESAME;
})(typeof window !== "undefined" ? window : globalThis);
