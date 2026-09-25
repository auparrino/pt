# -*- coding: utf-8 -*-
"""Estação 3 — Mar Aberto (semanas 27-39, B1 → B2)."""

LESSONS = {

27: {
"intro": "El portugués conserva un tiempo que el español ya casi no usa: el "
         "futuro do subjuntivo. Es lo que dice cualquier carioca para "
         "hablar de planes: *quando eu for*, *se você quiser*.",
"parts": [
 {"h": "La forma: regulares e irregulares", "blocks": [0, 1, 2]},
 {"h": "ver / vir y los momentos futuros", "blocks": [3, 4]},
 {"h": "Condiciones abiertas y la principal", "blocks": [5, 6]},
],
"blocks": [
 {"h": "La forma que el español perdió",
  "r": "Para un momento o una condición **futura** tras *quando, se, "
       "assim que*: *quando eu chegar*, *se você quiser*. El español usa "
       "presente de subjuntivo o indicativo.",
  "ex": [["Quando eu *chegar* em Copacabana, te ligo.", "Cuando llegue a Copacabana, te llamo."],
         ["Se você *quiser*, a gente vai à praia.", "Si querés, vamos a la playa."],
         ["Assim que ela *puder*, ela vem.", "Apenas pueda, viene."],
         ["Enquanto eu *estiver* no Rio, moro em Botafogo.", "Mientras esté en Río, vivo en Botafogo."]],
  "warn": "«Cuando llegue» te empuja a decir «quando eu chegue». Está mal: "
          "*quando* con futuro pide futuro do subjuntivo: *quando eu chegar*."},

 {"h": "Regulares: igual al infinitivo",
  "q": [{"prompt": "Completá: Quando nós ___ (terminar) a mudança, a gente descansa.", "answer": "terminarmos", "options": ["terminarmos", "terminemos", "terminamos"]},
        {"prompt": "Completá: Se vocês ___ (comer) açaí, vão adorar.", "answer": "comerem", "options": ["comerem", "comam", "comem"]}],
  "r": "En los regulares, *eu* y *ele* son iguales al infinitivo; *nós* "
       "agrega *-mos*, *eles* agrega *-em*: *falar, falarmos, falarem*.",
  "table": {"head": ["", "falar", "comer", "abrir"],
            "rows": [["eu", "falar", "comer", "abrir"],
                     ["ele / você", "falar", "comer", "abrir"],
                     ["nós", "falarmos", "comermos", "abrirmos"],
                     ["eles / vocês", "falarem", "comerem", "abrirem"]]},
  "ex": [["Quando você *voltar*, me avisa.", "Cuando vuelvas, avisame."],
         ["Se nós *sairmos* cedo, pegamos o metrô vazio.", "Si salimos temprano, agarramos el subte vacío."],
         ["Quando eles *abrirem* a loja, eu compro.", "Cuando abran el local, compro."]],
  "tip": "*tu* agrega *-es* (*quando tu falares*); en Brasil casi no lo vas "
         "a necesitar."},

 {"h": "Irregulares: la 3.ª plural del perfeito",
  "r": "Tomá *eles* del perfeito y sacá *-ram*: *fizeram → fizer*, "
       "*tiveram → tiver*, *puderam → puder*. Después, las mismas "
       "terminaciones: *fizermos, fizerem*.",
  "table": {"head": ["Infinitivo", "Perfeito (eles)", "Futuro do subj."],
            "rows": [["ser / ir", "foram", "for"],
                     ["ter", "tiveram", "tiver"],
                     ["estar", "estiveram", "estiver"],
                     ["fazer", "fizeram", "fizer"],
                     ["poder", "puderam", "puder"],
                     ["querer", "quiseram", "quiser"],
                     ["saber", "souberam", "souber"],
                     ["dizer", "disseram", "disser"],
                     ["trazer", "trouxeram", "trouxer"],
                     ["dar", "deram", "der"],
                     ["pôr", "puseram", "puser"]]},
  "ex": [["Quando eu *tiver* tempo, vou ao Pão de Açúcar.", "Cuando tenga tiempo, voy al Pan de Azúcar."],
         ["Se você *fizer* a feijoada, eu levo a caipirinha.", "Si hacés la feijoada, llevo la caipiriña."],
         ["Se Deus *quiser*!", "¡Si Dios quiere! (fórmula fija)"]],
  "tip": "Si sabés el perfeito, ya sabés este tiempo: es el mismo tronco de "
         "*fizeram*, *souberam*, *quiseram*."},

 {"h": "La trampa: ver, vir, ser e ir",
  "q": [{"prompt": "«Cuando veas a Bia, dale un beso.» → Quando você ___ a Bia, dá um beijo nela.", "answer": "vir", "options": ["vir", "ver", "vier"]},
        {"prompt": "«Si venís al Río…» → Se você ___ ao Rio…", "answer": "vier", "options": ["vier", "vir", "vem"]}],
  "r": "*ver → viram → vir*; *vir → vieram → vier*. Y *ser* e *ir* "
       "comparten *for*: *quando eu for rico*, *quando eu for ao Rio*.",
  "ex": [["Se você *vir* o Rafa, fala com ele.", "Si ves a Rafa, hablá con él."],
         ["Quando vocês *vierem* a Salvador, fiquem lá em casa.", "Cuando vengan a Salvador, quédense en casa."],
         ["Quando eu *for* velho, vou morar em Santa Teresa.", "Cuando sea viejo, voy a vivir en Santa Teresa."],
         ["Se a gente *for* ao Maracanã, eu te chamo.", "Si vamos al Maracaná, te aviso."]],
  "warn": "«Quando eu ver» es el error más frecuente, incluso entre "
          "brasileños al escribir rápido. En la norma: *quando eu vir*. Y "
          "*vir* de «venir» da *vier*."},

 {"h": "Los momentos futuros",
  "r": "*quando, assim que, logo que* (apenas), *enquanto* (mientras), "
       "*depois que, sempre que* piden futuro do subjuntivo si hablás del "
       "futuro.",
  "ex": [["*Assim que* o bloco *passar*, a gente vai pra Lapa.", "Apenas pase el bloco, vamos a Lapa."],
         ["*Enquanto* você *estiver* aqui, a casa é sua.", "Mientras estés acá, la casa es tuya."],
         ["*Sempre que* você *quiser*, pode vir.", "Siempre que quieras, podés venir."],
         ["*Depois que* eles *se mudarem*, a gente visita.", "Después de que se muden, los visitamos."]],
  "more": ["Si el hecho es habitual o ya pasó, va indicativo como en "
           "español: *quando eu chego em casa, tomo banho* (siempre); "
           "*quando cheguei, ela saiu* (ayer). El futuro do subjuntivo es "
           "solo para lo que todavía no pasó."]},

 {"h": "Condiciones abiertas: se, como, onde, quem",
  "q": [{"prompt": "«Vení como quieras.» → Vem como você ___.", "answer": "quiser", "options": ["quiser", "queira", "quer"]}],
  "r": "*se* + futuro do subjuntivo para condiciones futuras. Y lo "
       "indefinido: *como você quiser*, *onde você estiver*, *quem "
       "chegar primeiro*, *o que você decidir*.",
  "ex": [["*Se* *chover*, a gente fica em casa.", "Si llueve, nos quedamos en casa."],
         ["Faz *como* você *achar* melhor.", "Hacé como te parezca mejor."],
         ["*Quem* *chegar* primeiro pega a mesa do boteco.", "El que llegue primero agarra la mesa del bar."],
         ["*O que* você *decidir*, eu apoio.", "Lo que decidas, te apoyo."],
         ["*Onde* você *estiver*, eu vou.", "Donde estés, voy."]],
  "warn": "Tras *se* va presente de indicativo solo con hechos de ahora: "
          "*se você quer, pode ir* (ya querés). Para el futuro, *se você "
          "quiser*. Nunca *se* + presente de subjuntivo."},

 {"h": "Qué va en la otra mitad",
  "r": "La principal va en presente, *vou* + infinitivo, futuro o "
       "imperativo: *se chover, fico / vou ficar / ficarei*; *quando "
       "chegar, me liga*.",
  "ex": [["Se der tempo, *passo* na feira.", "Si da el tiempo, paso por la feria."],
         ["Quando a mudança acabar, *vou descansar*.", "Cuando termine la mudanza, voy a descansar."],
         ["Se vocês se mudarem para Niterói, *terão* uma vista linda.", "Si se mudan a Niterói, van a tener una vista hermosa."],
         ["Quando souber o preço do aluguel, *me conta*.", "Cuando sepas el precio del alquiler, contame."],
         ["Quando a Constituição de 1988 *fizer* cinquenta anos, *será* 2038.", "Cuando la Constitución de 1988 cumpla cincuenta años, será 2038."]],
  "tip": "*Se der* (si se puede) y *quando der* (cuando se pueda) son "
         "fórmulas del día a día: *se der, eu vou*.",
  "more": ["Este tiempo aparece en contratos y leyes (*quem infringir…*, "
           "*caso haja…*), y el español jurídico todavía tiene su gemelo: "
           "«el que infringiere». En portugués está vivo en la calle: *se "
           "Deus quiser*, *quando der*, *seja o que for*."]},
]},

28: {
"intro": "Soñar con otra vida en Ipanema necesita dos tiempos: el "
         "imperfeito do subjuntivo (*se eu fosse*) y el futuro do pretérito "
         "(*eu viajaria*). Esta semana los juntás.",
"parts": [
 {"h": "La forma en -sse", "blocks": [0, 1, 2]},
 {"h": "Se eu pudesse, viajaria", "blocks": [3, 4]},
 {"h": "Queria que, como se, y la trampa del -ra", "blocks": [5, 6]},
],
"blocks": [
 {"h": "La forma: -sse",
  "r": "Mismo tronco que el futuro do subjuntivo (3.ª plural del perfeito "
       "sin *-ram*) + *-sse*: *falaram → falasse*, *fizeram → fizesse*.",
  "table": {"head": ["", "falar", "comer", "ser / ir"],
            "rows": [["eu", "falasse", "comesse", "fosse"],
                     ["ele / você", "falasse", "comesse", "fosse"],
                     ["nós", "falássemos", "comêssemos", "fôssemos"],
                     ["eles / vocês", "falassem", "comessem", "fossem"]]},
  "ex": [["Se eu *falasse* bem, trabalharia no Brasil.", "Si hablara bien, trabajaría en Brasil."],
         ["Se ela *comesse* menos açúcar…", "Si comiera menos azúcar…"],
         ["Se nós *fôssemos* ricos, moraríamos no Leblon.", "Si fuéramos ricos, viviríamos en Leblon."]]},

 {"h": "Los irregulares, gratis",
  "q": [{"prompt": "Completá: Se eu ___ (ter) coragem, largaria tudo.", "answer": "tivesse", "options": ["tivesse", "tenhesse", "tiver"]},
        {"prompt": "Completá: Se você ___ (vir) ao Rio, eu te mostraria a Lapa.", "answer": "viesse", "options": ["viesse", "visse", "vinhesse"]}],
  "r": "Si sabés *fizeram, tiveram, vieram*, ya los tenés: *fizesse, "
       "tivesse, viesse*. Ninguno se arma sobre el infinitivo.",
  "table": {"head": ["Perfeito (eles)", "Imperf. do subj.", "Perfeito (eles)", "Imperf. do subj."],
            "rows": [["tiveram", "tivesse", "souberam", "soubesse"],
                     ["estiveram", "estivesse", "disseram", "dissesse"],
                     ["puderam", "pudesse", "trouxeram", "trouxesse"],
                     ["quiseram", "quisesse", "deram", "desse"],
                     ["vieram", "viesse", "puseram", "pusesse"],
                     ["viram", "visse", "houveram", "houvesse"]]},
  "ex": [["Se eu *soubesse*, te contaria.", "Si supiera, te contaría."],
         ["Se *desse*, eu ia.", "Si se pudiera, iría."],
         ["Se você *visse* o pôr do sol no Arpoador…", "Si vieras la puesta de sol en el Arpoador…"]]},

 {"h": "Nós lleva tilde",
  "r": "La 1.ª plural es esdrújula y lleva tilde en la vocal del tronco: "
       "*falássemos, comêssemos, partíssemos, fôssemos, tivéssemos*.",
  "ex": [["Se *tivéssemos* grana, íamos para Noronha.", "Si tuviéramos plata, íbamos a Noronha."],
         ["Ela queria que *fôssemos* juntos.", "Ella quería que fuéramos juntos."],
         ["Se *pudéssemos*, ficaríamos mais.", "Si pudiéramos, nos quedaríamos más."]],
  "warn": "*-a-* lleva tilde aguda (*falássemos*), *-e-* circunflejo "
          "(*comêssemos*), *-i-* aguda (*partíssemos*). Y *fôssemos*, con "
          "circunflejo."},

 {"h": "Se eu pudesse, viajaria",
  "q": [{"prompt": "«Si pudiera, iría.» → Se eu ___, iria.", "answer": "pudesse", "options": ["pudesse", "poderia", "puder"]},
        {"prompt": "«Si tuviera tiempo, te ayudaría.» → Se eu tivesse tempo, te ___.", "answer": "ajudaria", "options": ["ajudaria", "ajudasse", "ajudara"]}],
  "r": "Hipótesis del presente: *se* + imperfeito do subjuntivo, y en la "
       "otra mitad futuro do pretérito: *se eu pudesse, viajaria*.",
  "ex": [["Se eu *morasse* no Rio, *iria* à praia todo dia.", "Si viviera en Río, iría a la playa todos los días."],
         ["Se ele *soubesse* sambar, *dançaria* no bloco.", "Si supiera sambar, bailaría en el bloco."],
         ["O que você *faria* se *ganhasse* na Mega-Sena?", "¿Qué harías si ganaras la lotería?"],
         ["Se Machado *vivesse* hoje, *escreveria* crônicas sobre as redes?", "Si Machado viviera hoy, ¿escribiría crónicas sobre las redes?"]],
  "warn": "Nunca condicional después de *se*: «se eu poderia» es error. "
          "El condicional va en la otra mitad, como en español."},

 {"h": "En el habla: imperfeito en la principal",
  "r": "Hablando, el imperfeito reemplaza al futuro do pretérito: *se eu "
       "pudesse, viajava*. Escribiendo, mejor *viajaria*.",
  "ex": [["Se eu tivesse grana, *comprava* um apê em Botafogo.", "Si tuviera plata, me compraba un depto en Botafogo."],
         ["Se desse, eu *ia* hoje.", "Si se pudiera, iba hoy."],
         ["Se ela me ligasse, eu *atendia*.", "Si me llamara, atendía."]],
  "tip": "Es lo mismo que hacés en el Río de la Plata: «si pudiera, "
         "iba». Acá también suena natural."},

 {"h": "Queria que, era importante que",
  "r": "Principal en pasado o condicional → subordinada en imperfeito do "
       "subjuntivo: *queria que você viesse*, *era importante que "
       "soubessem*.",
  "ex": [["*Queria que* você *viesse* comigo.", "Quería que vinieras conmigo."],
         ["*Era importante que* eles *soubessem*.", "Era importante que supieran."],
         ["Ela *pediu que* eu *trouxesse* o biscoito Globo.", "Me pidió que trajera los Globo."],
         ["*Seria bom que* vocês *chegassem* cedo.", "Sería bueno que llegaran temprano."]],
  "warn": "Muchos rioplatenses dicen «me pidió que venga». En portugués "
          "con principal en pasado va el imperfeito: *pediu que eu viesse*."},

 {"h": "Como se… y la trampa del -ra",
  "q": [{"prompt": "«Si fuera más barato…» → Se ___ mais barato…", "answer": "fosse", "options": ["fosse", "fora", "for"]}],
  "r": "*como se* + imperfeito do subjuntivo: *fala como se fosse "
       "carioca*. Y solo existe la forma en *-sse*: «se eu tivera» no "
       "sirve para hipótesis.",
  "ex": [["Ele fala *como se fosse* carioca.", "Habla como si fuera carioca."],
         ["Se eu *fosse* você, não iria.", "Yo que vos, no iría (si fuera vos)."],
         ["Os sebastianistas esperavam *como se* D. Sebastião *pudesse* voltar.", "Los sebastianistas esperaban como si el rey Sebastián pudiera volver."]],
  "more": ["*tivera, fizera, fora* existen, pero son el pluscuamperfecto "
           "literario (semana 41): *ele fizera* = había hecho. Por eso el "
           "«si tuviera» del español se dice siempre *se tivesse*."]},
]},

29: {
"intro": "Otra joya que el español no tiene: el infinitivo con persona. "
         "*para nós irmos*, *antes de vocês saírem*. Es sencillo y te ahorra "
         "muchos *para que*.",
"parts": [
 {"h": "La forma y su trampa", "blocks": [0, 1]},
 {"h": "Sujeto propio y preposiciones", "blocks": [2, 3]},
 {"h": "Cuándo no flexionar; el habla", "blocks": [4, 5]},
],
"blocks": [
 {"h": "Infinitivo + persona",
  "r": "Al infinitivo le agregás *-es* (tu), *-mos* (nós), *-em* (eles): "
       "*falar, falares, falar, falarmos, falarem*. Todos los verbos, "
       "también los irregulares.",
  "table": {"head": ["", "falar", "ser", "fazer", "sair"],
            "rows": [["eu", "falar", "ser", "fazer", "sair"],
                     ["tu", "falares", "seres", "fazeres", "saíres"],
                     ["ele / você", "falar", "ser", "fazer", "sair"],
                     ["nós", "falarmos", "sermos", "fazermos", "sairmos"],
                     ["eles / vocês", "falarem", "serem", "fazerem", "saírem"]]},
  "ex": [["É melhor *irmos* de metrô.", "Es mejor que vayamos en subte."],
         ["Trouxe o mapa para vocês *acharem* o Cristo.", "Traje el mapa para que encuentren el Cristo."],
         ["Antes de *saírem*, passem protetor.", "Antes de salir, pónganse protector."]],
  "tip": "*sair, cair, sorrir*: *saírem, caírem* llevan tilde en la *i* "
         "para romper el diptongo."},

 {"h": "fazerem no es fizerem",
  "q": [{"prompt": "«Es hora de que ellos hagan la tarea.» → Está na hora de eles ___ o dever.", "answer": "fazerem", "options": ["fazerem", "fizerem", "façam"]},
        {"prompt": "«Para que tengamos tiempo…» → Para nós ___ tempo…", "answer": "termos", "options": ["termos", "tivermos", "tenhamos"]}],
  "r": "El infinitivo pessoal sale **del infinitivo**: *fazer → fazerem, "
       "ter → termos, ver → verem*. El futuro do subjuntivo sale del "
       "perfeito: *fizerem, tivermos, virem*.",
  "table": {"head": ["Verbo", "Infinitivo pessoal (eles)", "Futuro do subj. (eles)"],
            "rows": [["fazer", "fazerem", "fizerem"],
                     ["ter", "terem", "tiverem"],
                     ["ver", "verem", "virem"],
                     ["vir", "virem", "vierem"],
                     ["pôr", "porem", "puserem"],
                     ["falar", "falarem", "falarem"]]},
  "warn": "En los regulares coinciden, y por eso se mezclan. «Para eles "
          "fizerem» es error: *para eles fazerem*."},

 {"h": "Con un sujeto propio",
  "r": "Cuando el infinitivo tiene **otro** sujeto, se flexiona: *é bom "
       "vocês chegarem cedo*, *é hora de nós irmos*.",
  "ex": [["*É bom vocês chegarem* cedo ao Maracanã.", "Es bueno que lleguen temprano al Maracaná."],
         ["*É importante eles saberem* os direitos.", "Es importante que sepan sus derechos."],
         ["O chefe mandou *os estagiários saírem*.", "El jefe mandó que los pasantes salieran."],
         ["*Está na hora de irmos*.", "Es hora de irnos."]],
  "more": ["El español dice «es bueno que lleguen» con subjuntivo; el "
           "portugués puede decir *é bom que vocês cheguem* o, más ágil, "
           "*é bom vocês chegarem*. Las dos son correctas: la segunda es "
           "la que más vas a oír."]},

 {"h": "Tras preposición",
  "q": [{"prompt": "«Sin que nosotros sepamos…» → Sem nós ___…", "answer": "sabermos", "options": ["sabermos", "soubermos", "saibamos"]}],
  "r": "*para, sem, antes de, depois de, até, ao, por* + sujeto + "
       "infinitivo pessoal: *para eles entenderem*, *sem nós sabermos*, "
       "*ao chegarmos*.",
  "ex": [["Falei devagar *para eles entenderem*.", "Hablé despacio para que entendieran."],
         ["Saíram *sem nós sabermos*.", "Se fueron sin que supiéramos."],
         ["*Antes de vocês saírem*, fechem a janela.", "Antes de que salgan, cierren la ventana."],
         ["*Ao chegarmos* à rodoviária, ligamos.", "Al llegar a la terminal, llamamos."],
         ["Paulo Freire alfabetizava adultos *para eles lerem* o mundo, não só a palavra.", "Paulo Freire alfabetizaba adultos para que leyeran el mundo, no solo la palabra."]]},

 {"h": "Cuándo no se flexiona",
  "r": "Con el mismo sujeto y verbos como *querer, poder, dever, ir, "
       "saber*, el infinitivo queda simple: *queremos viajar*, nunca "
       "«queremos viajarmos».",
  "ex": [["Nós *queremos morar* em Floripa.", "Queremos vivir en Floripa."],
         ["Eles *podem sair* agora.", "Pueden salir ahora."],
         ["*Vamos estudar* para o vestibular.", "Vamos a estudiar para el examen de ingreso."],
         ["Eles *precisam trabalhar* amanhã.", "Tienen que trabajar mañana."]],
  "warn": "Si el sujeto es el mismo y no hay preposición, sin terminación. "
          "Con preposición y mismo sujeto, es opcional: *saímos para "
          "almoçar / almoçarmos*."},

 {"h": "En el habla: para a gente ir",
  "q": [{"prompt": "«Para que vayamos…» (habla) → Pra a gente ___…", "answer": "ir", "options": ["ir", "irmos", "vamos"]}],
  "r": "El infinitivo pessoal reemplaza a *para que* + subjuntivo: *para "
       "vocês entenderem* = *para que vocês entendam*. Con *a gente*, "
       "verbo sin *-mos*: *pra a gente ir*.",
  "ex": [["Fala mais alto *pra gente ouvir*.", "Hablá más fuerte para que escuchemos."],
         ["Liguei *para vocês saberem*.", "Llamé para que supieran."],
         ["Liguei *para que vocês soubessem*.", "Lo mismo, más formal."]],
  "tip": "*a gente* concuerda en singular: *a gente vai*, *pra a gente ir* "
         "(en el habla, *pra gente ir*). «Pra a gente irmos» es error."},
]},

30: {
"intro": "*Se eu tivesse sabido, teria ido*: el portugués arma todos los "
         "tiempos compuestos con *ter* + participio. Esta semana hablás de "
         "lo que pudo haber sido.",
"parts": [
 {"h": "Los compuestos y el pasado que no fue", "blocks": [0, 1, 2]},
 {"h": "Tenha feito, tiver feito y el habla", "blocks": [3, 4, 5]},
],
"blocks": [
 {"h": "Un auxiliar para todo: ter",
  "r": "Cada tiempo simple de *ter* + participio da un compuesto. El "
       "participio no cambia: *tenha feito, tivesse feito, tiver feito*.",
  "table": {"head": ["Compuesto", "Ejemplo", "Español"],
            "rows": [["subj. perfeito", "que eu tenha feito", "que haya hecho"],
                     ["subj. mais-que-perfeito", "se eu tivesse feito", "si hubiera hecho"],
                     ["futuro composto do subj.", "quando eu tiver feito", "cuando haya hecho"],
                     ["futuro do pretérito composto", "eu teria feito", "habría hecho"],
                     ["futuro composto", "eu terei feito", "habré hecho"]]},
  "ex": [["Se eu *tivesse visto*, teria avisado.", "Si lo hubiera visto, habría avisado."],
         ["Até dezembro *terei terminado* o curso.", "Para diciembre habré terminado el curso."]],
  "tip": "Los participios irregulares de siempre: *feito, dito, visto, "
         "vindo, posto, escrito, aberto*."},

 {"h": "Se tivesse…, teria…",
  "q": [{"prompt": "«Si hubiera llovido, nos habríamos quedado.» → Se tivesse chovido, ___ ficado.", "answer": "teríamos", "options": ["teríamos", "tivéssemos", "tínhamos sido"]},
        {"prompt": "«Si me hubieras avisado…» → Se você ___ avisado…", "answer": "tivesse me", "options": ["tivesse me", "teria me", "tiver me"]}],
  "r": "Hipótesis en el pasado: *se* + *tivesse* + participio, y en la "
       "otra mitad *teria* + participio: *se tivesse chovido, teríamos "
       "ficado em casa*.",
  "ex": [["Se eu *tivesse sabido*, *teria ido* ao show.", "Si hubiera sabido, habría ido al show."],
         ["Se vocês *tivessem chegado* cedo, *teriam visto* o Cristo sem nuvens.", "Si hubieran llegado temprano, habrían visto el Cristo sin nubes."],
         ["Se ela não *tivesse perdido* o voo, *teria vindo*.", "Si no hubiera perdido el vuelo, habría venido."]],
  "warn": "El español dice «si hubiera sabido, **hubiera** ido». En "
          "portugués la otra mitad no admite *tivesse*: *teria ido* (o, "
          "hablando, *tinha ido*)."},

 {"h": "Hipótesis mixtas",
  "r": "Se combinan los momentos: pasado que afecta al presente (*se "
       "tivesse estudado, hoje seria médico*) o presente que explica el "
       "pasado (*se fosse cuidadoso, não teria caído*).",
  "ex": [["Se eu *tivesse aceitado* aquele emprego, hoje *moraria* em Recife.", "Si hubiera aceptado aquel trabajo, hoy viviría en Recife."],
         ["Se ele *fosse* mais pontual, não *teria perdido* o BRT.", "Si fuera más puntual, no habría perdido el BRT."],
         ["Se a gente *tivesse comprado* antes, *estaria* mais barato.", "Si hubiéramos comprado antes, estaría más barato."],
         ["Se a corte não *tivesse vindo* em 1808, o Rio *seria* outra cidade?", "Si la corte no hubiera venido en 1808, ¿Río sería otra ciudad?"]]},

 {"h": "Espero que tenham gostado",
  "q": [{"prompt": "«Espero que les haya gustado.» → Espero que vocês ___ gostado.", "answer": "tenham", "options": ["tenham", "tivessem", "têm"]}],
  "r": "Subjuntivo perfeito (*tenha* + participio): deseo, duda u opinión "
       "de hoy sobre algo ya pasado. *Espero que tenham gostado*.",
  "ex": [["*Espero que* vocês *tenham gostado* do passeio.", "Espero que les haya gustado el paseo."],
         ["*Talvez* ela já *tenha saído*.", "Quizás ya haya salido."],
         ["*Não acredito que* ele *tenha dito* isso!", "¡No puedo creer que haya dicho eso!"],
         ["*É bom que* você *tenha vindo*.", "Qué bueno que hayas venido."]],
  "more": ["Si la principal está en pasado, pasa a *tivesse*: *esperava "
           "que tivessem gostado*. Es la misma correlación que en español: "
           "«espero que hayan…» / «esperaba que hubieran…»."]},

 {"h": "Quando tiver terminado; terei feito",
  "r": "*quando / se / assim que* + *tiver* + participio: una acción "
       "futura ya terminada. *terei* + participio: lo que habrá pasado "
       "para cierto momento.",
  "ex": [["*Quando tiver terminado*, aviso.", "Cuando haya terminado, aviso."],
         ["*Se* até sexta você não *tiver recebido*, me liga.", "Si para el viernes no recibiste nada, llamame."],
         ["Em 2030 eu *terei aprendido* português.", "En 2030 habré aprendido portugués."],
         ["Às oito o bloco já *terá passado*.", "A las ocho el bloco ya habrá pasado."]],
  "tip": "El futuro composto (*terei feito*) es formal; hablando se dice "
         "*vou ter feito* o *já vou ter terminado*."},

 {"h": "Así se dice en la calle",
  "r": "Hablando, el imperfeito de indicativo reemplaza al condicional, "
       "también en el pasado: *se eu soubesse, tinha ido*; *se tivesse "
       "sabido, tinha ido*.",
  "ex": [["Se eu *soubesse*, *tinha ido* com vocês.", "Si hubiera sabido, iba con ustedes."],
         ["Se ela tivesse ligado, eu *tinha buscado* ela.", "Si hubiera llamado, la iba a buscar."],
         ["*Teria sido* ótimo. / *Tinha sido* ótimo.", "Habría sido genial (formal / habla)."]],
  "more": ["En el habla también se oye *se eu soubesse* con valor de "
           "pasado («si hubiera sabido»). En un texto o un examen usá la "
           "correlación completa: *se tivesse sabido, teria ido*."]},
]},

31: {
"intro": "Contar lo que dijo otro: la vecina, el diario o el entrevistado. "
         "Cambian los tiempos, los pronombres y hasta *hoje* y *aqui*.",
"parts": [
 {"h": "Ele disse que…: los tiempos retroceden", "blocks": [0, 1]},
 {"h": "Pedidos, pronombres y adverbios", "blocks": [2, 3]},
 {"h": "Preguntas y verbos de decir", "blocks": [4, 5]},
],
"blocks": [
 {"h": "Ele disse que ia",
  "q": [{"prompt": "«Vou à praia.» → Ele disse que ___ à praia.", "answer": "ia", "options": ["ia", "vai", "foi"]},
        {"prompt": "«Estou cansada.» → Ela disse que ___ cansada.", "answer": "estava", "options": ["estava", "está", "esteve"]}],
  "r": "Con el verbo de decir en pasado, lo dicho retrocede un paso: "
       "*«vou» → disse que ia*; *«estou» → disse que estava*.",
  "ex": [["«*Moro* em Niterói.» → Disse que *morava* em Niterói.", "Dijo que vivía en Niterói."],
         ["«*Vou* ao show.» → Disse que *ia* ao show.", "Dijo que iba al show."],
         ["«*Gosto* de samba.» → Contou que *gostava* de samba.", "Contó que le gustaba el samba."]],
  "tip": "Si el verbo de decir está en presente, no cambia nada: *ele diz "
         "que vai*."},

 {"h": "La tabla de la correlación",
  "r": "Presente → imperfeito; perfeito → *tinha* + participio; futuro → "
       "futuro do pretérito; subjuntivo presente → imperfeito do "
       "subjuntivo.",
  "table": {"head": ["Discurso directo", "Discurso indirecto"],
            "rows": [["«Trabalho aqui.»", "disse que trabalhava lá"],
                     ["«Comprei o ingresso.»", "disse que tinha comprado o ingresso"],
                     ["«Vou viajar.»", "disse que ia viajar"],
                     ["«Viajarei.»", "disse que viajaria"],
                     ["«Espero que chova.»", "disse que esperava que chovesse"],
                     ["«Quando puder, venho.»", "disse que, quando pudesse, viria"]]},
  "ex": [["«*Vi* o jogo.» → Disse que *tinha visto* o jogo.", "Dijo que había visto el partido."],
         ["«*Farei* isso.» → Prometeu que *faria* isso.", "Prometió que haría eso."]],
  "more": ["El futuro do subjuntivo se vuelve imperfeito do subjuntivo: "
           "*«se puder, vou»* → *disse que, se pudesse, iria* (o *ia*). El "
           "imperfeito y el futuro do pretérito ya no cambian."]},

 {"h": "Pedidos y órdenes",
  "q": [{"prompt": "«¡Andá!» → Ela pediu que eu ___.", "answer": "fosse", "options": ["fosse", "vá", "for"]}],
  "r": "El imperativo pasa a subjuntivo: con verbo en pasado, imperfeito "
       "do subjuntivo: *«Vá!» → pediu que eu fosse*. O *pediu para eu ir*.",
  "ex": [["«*Fecha* a porta!» → Mandou que eu *fechasse* a porta.", "Me mandó cerrar la puerta."],
         ["«*Tragam* bebida!» → Pediu que *trouxéssemos* bebida.", "Pidió que lleváramos bebida."],
         ["«*Não saia*!» → Pediu *para eu não sair*.", "Me pidió que no saliera."]],
  "warn": "En Buenos Aires se dice «me pidió que vaya». En portugués, con "
          "*pediu* va imperfeito del subjuntivo: *pediu que eu fosse*, "
          "nunca «que eu vá»."},

 {"h": "Pronombres, lugar y tiempo",
  "r": "Cambian las personas (*eu → ele*, *meu → dele*) y las "
       "referencias: *hoje → naquele dia*, *amanhã → no dia seguinte*, "
       "*aqui → lá*.",
  "table": {"head": ["Directo", "Indirecto"],
            "rows": [["hoje", "naquele dia"],
                     ["ontem", "no dia anterior / na véspera"],
                     ["amanhã", "no dia seguinte"],
                     ["agora", "naquele momento"],
                     ["aqui", "lá / ali"],
                     ["este / isto", "aquele / aquilo"]]},
  "ex": [["«Chego *amanhã*.» → Disse que chegava *no dia seguinte*.", "Dijo que llegaba al día siguiente."],
         ["«*Este* é o *meu* bairro.» → Disse que *aquele* era o bairro *dele*.", "Dijo que aquel era su barrio."]]},

 {"h": "Preguntas: perguntou se",
  "q": [{"prompt": "«¿Venís al bloco?» → Ela me perguntou ___ eu ia ao bloco.", "answer": "se", "options": ["se", "que se", "que"]}],
  "r": "Preguntas de sí o no: *perguntou se*. Con interrogativo, se "
       "conserva: *perguntou onde*, *quando*, *quanto*. Nunca «perguntou "
       "que se».",
  "ex": [["«Você vem?» → Perguntou *se* eu ia.", "Preguntó si iba."],
         ["«Onde fica a Lapa?» → Perguntou *onde ficava* a Lapa.", "Preguntó dónde quedaba Lapa."],
         ["«Quanto custa?» → Quis saber *quanto custava*.", "Quiso saber cuánto costaba."]],
  "warn": "«Me preguntó que si venía» es muy oral en español y no pasa al "
          "portugués: *me perguntou se eu vinha*."},

 {"h": "Los verbos de decir",
  "r": "Variá: *afirmar, contar, comentar, explicar, avisar, garantir, "
       "prometer, responder, pedir, perguntar*. Cada uno ya dice cómo se "
       "dijo.",
  "ex": [["O ministro *afirmou* que não haveria aumento.", "El ministro afirmó que no habría aumento."],
         ["A vizinha *comentou* que o síndico tinha saído.", "La vecina comentó que el administrador se había ido."],
         ["Ele *garantiu* que chegaria a tempo.", "Garantizó que llegaría a tiempo."],
         ["Na carta-testamento, Vargas *escreveu* que saía da vida para entrar na história.", "En su carta-testamento, Vargas escribió que salía de la vida para entrar en la historia."]],
  "more": ["*pedir* sirve para pedidos (*pediu que eu fosse*), *perguntar* "
           "para preguntas (*perguntou se eu ia*). «Pedir una pregunta» o "
           "«preguntar un favor» son cruces a evitar. Y *contar* también "
           "es «contar una historia»: *contou que tinha se mudado*."]},
]},

32: {
"intro": "*Aluga-se*, *vende-se*, *precisa-se de*: los carteles de Río "
         "hablan con *se*. Esta semana aprendés a leerlos y escribirlos, y "
         "cómo lo dice la gente.",
"parts": [
 {"h": "La pasiva con se", "blocks": [0, 1, 2]},
 {"h": "Sujeto indeterminado y el habla", "blocks": [3, 4, 5]},
],
"blocks": [
 {"h": "Vende-se, vendem-se",
  "q": [{"prompt": "Cartel: ___ apartamentos em Botafogo.", "answer": "Alugam-se", "options": ["Alugam-se", "Aluga-se", "Alugam"]},
        {"prompt": "Cartel: ___ bicicleta usada.", "answer": "Vende-se", "options": ["Vende-se", "Vendem-se", "Se vendem"]}],
  "r": "*se* + verbo transitivo = pasiva: la cosa es el sujeto y el verbo "
       "**concuerda** con ella: *vende-se casa*, *vendem-se casas*.",
  "ex": [["*Aluga-se* quarto em Santa Teresa.", "Se alquila cuarto en Santa Teresa."],
         ["*Vendem-se* pranchas de surfe.", "Se venden tablas de surf."],
         ["*Consertam-se* bicicletas.", "Se arreglan bicicletas."],
         ["Aqui *falam-se* três línguas.", "Acá se hablan tres idiomas."],
         ["No século XVIII, *extraíram-se* toneladas de ouro de Minas.", "En el siglo XVIII se extrajeron toneladas de oro de Minas."]],
  "tip": "Es la misma lógica que «se venden casas». Lo nuevo es el orden: "
         "en el cartel, *se* va detrás y con guion."},

 {"h": "Con preposición no concuerda",
  "r": "Si el verbo lleva preposición (*precisar de*, *tratar de*, "
       "*gostar de*), no hay sujeto y el verbo queda en singular: "
       "*precisa-se de vendedores*.",
  "ex": [["*Precisa-se de* garçons.", "Se necesitan mozos."],
         ["*Trata-se de* casos raros.", "Se trata de casos raros."],
         ["Aqui *se gosta de* samba.", "Acá gusta el samba."],
         ["*Vive-se* bem no Rio.", "Se vive bien en Río."]],
  "warn": "El español dice «se necesitan mozos», en plural. En portugués, "
          "por el *de*: *precisa-se de garçons*. «Precisam-se de» es "
          "error."},

 {"h": "Dónde va el se",
  "r": "En carteles y textos, detrás con guion: *aluga-se*. Delante si hay "
       "*não, aqui, que*…: *não se aceitam cartões*. Hablando: *aqui se "
       "fala português*.",
  "table": {"head": ["Cartel", "Qué dice"],
            "rows": [["Aluga-se", "Se alquila"],
                     ["Vendem-se lotes", "Se venden terrenos"],
                     ["Precisa-se de ajudante", "Se necesita ayudante"],
                     ["Não se aceitam cheques", "No se aceptan cheques"],
                     ["Entrega-se em domicílio", "Envíos a domicilio"],
                     ["Proibido estacionar", "Prohibido estacionar"]]},
  "ex": [["*Não se aceitam* cartões.", "No se aceptan tarjetas."],
         ["Aqui *se fala* espanhol.", "Acá se habla español."]]},

 {"h": "Dizem que…: la 3.ª plural sin sujeto",
  "q": [{"prompt": "«Me robaron el celular.» → ___ meu celular.", "answer": "Roubaram", "options": ["Roubaram", "Se roubou", "Roubou-se"]}],
  "r": "Para un sujeto que no se sabe o no importa: 3.ª plural sin "
       "pronombre: *dizem que vai chover*, *roubaram meu celular*.",
  "ex": [["*Dizem que* o açaí de lá é o melhor.", "Dicen que el açaí de ahí es el mejor."],
         ["*Falaram que* o metrô vai fechar.", "Dijeron que el subte va a cerrar."],
         ["*Ligaram* pra você.", "Te llamaron."],
         ["*Abriram* um boteco novo na esquina.", "Abrieron un bar nuevo en la esquina."],
         ["*Contam que* D. Pedro gritou «Independência ou morte!» no Ipiranga.", "Cuentan que don Pedro gritó «¡Independencia o muerte!» en el Ipiranga."]],
  "warn": "No pongas *eles*: «eles roubaram» señala a alguien concreto. "
          "El sujeto indeterminado va sin pronombre."},

 {"h": "En el habla: você, a gente, o pessoal",
  "r": "Hablando, para lo impersonal se usa *você* genérico y *a gente*: "
       "*aqui você paga na entrada*; *no Rio a gente vai à praia no "
       "inverno*.",
  "ex": [["No bandejão, *você* pega a bandeja e se serve.", "En el comedor, agarrás la bandeja y te servís."],
         ["Nessa praia, *a gente* não entra no mar.", "En esa playa, no nos metemos al mar."],
         ["*O pessoal* fala que é perigoso.", "La gente dice que es peligroso."]],
  "tip": "Igual que el «vos» genérico rioplatense: «acá pagás en la "
         "entrada». El portugués hace exactamente lo mismo con *você*."},

 {"h": "Tres maneras de decir lo mismo",
  "r": "Formal: *diz-se que*, *vende-se*. Neutro: *dizem que*, *vendem*. "
       "Habla: *falam que*, *o pessoal fala*, *você compra*.",
  "table": {"head": ["Formal", "Neutro", "Habla"],
            "rows": [["Diz-se que vai chover.", "Dizem que vai chover.", "Tão falando que vai chover."],
                     ["Aceitam-se cartões.", "Aceitam cartão.", "Pode pagar no cartão."],
                     ["Precisa-se de garçom.", "Estão precisando de garçom.", "Tão precisando de garçom."]]},
  "more": ["En los carteles de comercio vas a ver también *vende casas* o "
           "*aluga salas*, sin *se*. Es muy común, pero la norma pide *se*: "
           "*vendem-se casas*. En tus textos, con *se* y concordancia."]},
]},

33: {
"intro": "En la calle se dice *me disse*; en el diario o en Machado de "
         "Assis, *disse-me*. Esta semana aprendés a leer, y a escribir, "
         "los pronombres en el registro formal.",
"parts": [
 {"h": "Próclise y ênclise", "blocks": [0, 1, 2]},
 {"h": "Formas enclíticas y mesóclise", "blocks": [3, 4]},
 {"h": "Tiempos compuestos y habla", "blocks": [5, 6]},
],
"blocks": [
 {"h": "Tres posiciones",
  "r": "*Próclise*: antes (*me disse*). *Ênclise*: después, con guion "
       "(*disse-me*). *Mesóclise*: en medio del futuro o condicional "
       "(*dir-me-á*).",
  "table": {"head": ["Nombre", "Ejemplo", "Dónde"],
            "rows": [["próclise", "não me disse", "habla y escritura, con atractor"],
                     ["ênclise", "disse-me", "escritura formal, por defecto"],
                     ["mesóclise", "dir-me-á", "solo formal, futuro y condicional"]]},
  "ex": [["Ela *me disse* a verdade.", "Ella me dijo la verdad (habla)."],
         ["*Disse-me* a verdade.", "Me dijo la verdad (escrito)."]]},

 {"h": "Ênclise por defecto",
  "q": [{"prompt": "Texto formal: «Me dijeron que no.» →", "answer": "Disseram-me que não.", "options": ["Disseram-me que não.", "Me disseram que não.", "Disseram-me-lo que não."]}],
  "r": "En la escritura formal, sin nada que lo atraiga, el pronombre va "
       "detrás: *Entregou-lhe a carta*. Y nunca abre la oración.",
  "ex": [["*Entregou-lhe* o prêmio.", "Le entregó el premio."],
         ["*Chamo-me* Martín.", "Me llamo Martín (formal)."],
         ["Os leitores *enviaram-nos* cartas.", "Los lectores nos enviaron cartas."],
         ["Fica quieto e *escuta-me*.", "Quedate quieto y escuchame."]],
  "warn": "En el habla de Brasil, *me chama*, *me dá* abren la oración "
          "sin problema. En un texto formal, no: *Dá-me*, *Chamo-me*."},

 {"h": "Los que atraen el pronombre",
  "q": [{"prompt": "Formal: Ele ___ a verdade.", "answer": "nunca me disse", "options": ["nunca me disse", "nunca disse-me", "me nunca disse"]}],
  "r": "Próclise obligatoria tras negación (*não, nunca*), *que*, *quem*, "
       "adverbios (*já, sempre, aqui*), indefinidos (*tudo, alguém*) y "
       "conjunciones (*quando, se, embora*).",
  "ex": [["*Não me* disse nada.", "No me dijo nada."],
         ["O livro *que me* deram é ótimo.", "El libro que me dieron es buenísimo."],
         ["*Já lhe* contei a história?", "¿Ya le conté la historia?"],
         ["*Quem te* contou?", "¿Quién te contó?"],
         ["*Quando o* vi, entendi.", "Cuando lo vi, entendí."]],
  "tip": "Regla práctica: si delante hay una palabra «negativa, "
         "relativa o adverbial», el pronombre se le pega a ella."},

 {"h": "Formas que cambian: comprá-lo, fi-lo",
  "q": [{"prompt": "Formal: vender + o →", "answer": "vendê-lo", "options": ["vendê-lo", "vender-o", "vendé-lo"]},
        {"prompt": "Formal: fazem + a →", "answer": "fazem-na", "options": ["fazem-na", "fazem-la", "fazem-a"]}],
  "r": "*o, a, os, as* tras *-r, -s, -z* pierden la consonante y toman "
       "*l*: *comprar + o = comprá-lo*. Tras nasal, *n*: *dão + o = "
       "dão-no*.",
  "table": {"head": ["Unión", "Resultado"],
            "rows": [["comprar + o", "comprá-lo"],
                     ["vender + a", "vendê-la"],
                     ["partir + os", "parti-los"],
                     ["fiz + o", "fi-lo"],
                     ["fazemos + a", "fazemo-la"],
                     ["dão + o", "dão-no"],
                     ["fazem + as", "fazem-nas"]]},
  "ex": [["Preciso *vendê-lo* logo.", "Tengo que venderlo pronto."],
         ["Os pescadores *trazem-nos* do mar.", "Los pescadores los traen del mar."]],
  "warn": "Tras *-ar* tilde aguda (*comprá-lo*); tras *-er* circunflejo "
          "(*vendê-lo*); tras *-ir*, nada (*parti-lo*)."},

 {"h": "Mesóclise: dir-lhe-ei",
  "r": "Con futuro o condicional sin atractor, la norma culta mete el "
       "pronombre **dentro**: *dir-lhe-ei*, *far-se-ia*. Con atractor, "
       "próclise: *não lhe direi*.",
  "ex": [["*Dir-lhe-ei* toda a verdade.", "Le diré toda la verdad."],
         ["*Far-se-ia* a obra em 2030.", "La obra se haría en 2030."],
         ["*Encontrar-nos-emos* no cais.", "Nos encontraremos en el muelle."],
         ["*Não lhe direi* nada.", "No le diré nada."],
         ["Nos sermões de Vieira, *dir-se-ia* que cada frase é um argumento.", "En los sermones de Vieira, se diría que cada frase es un argumento."]],
  "more": ["El futuro y el condicional se arman sobre el infinitivo "
           "(*direi* = *dir-* + *-ei*), y el pronombre se mete en la "
           "juntura. Solo vas a verla en discursos, leyes y literatura; en "
           "Brasil casi nadie la usa al hablar. Con reconocerla, alcanza."]},

 {"h": "Tiempos compuestos y perífrasis",
  "q": [{"prompt": "Habla de Brasil: «Te voy a llamar.»", "answer": "Vou te ligar.", "options": ["Vou te ligar.", "Te vou ligar.", "Vou ligar-te."]}],
  "r": "Formal: con el auxiliar (*tinha-lhe dito*, *não lhe tinha dito*). "
       "Brasil: antes del verbo principal, sin guion: *tinha lhe dito*, "
       "*vou te ligar*.",
  "ex": [["*Tinha-lhe dito* que não viesse.", "Le había dicho que no viniera (formal)."],
         ["Eu *tinha lhe dito* isso.", "Yo le había dicho eso (Brasil)."],
         ["*Vou te ligar* amanhã.", "Te voy a llamar mañana."],
         ["*Estou te esperando* no calçadão.", "Te estoy esperando en la rambla."]]},

 {"h": "Habla y escritura",
  "r": "Brasil hablado: próclise siempre (*me dá*, *te amo*) y *ele* como "
       "objeto (*vi ele*). En la escritura culta: *dá-me*, *vi-o*.",
  "table": {"head": ["Habla", "Escritura formal"],
            "rows": [["Me dá um café?", "Dê-me um café."],
                     ["Vi ele ontem.", "Vi-o ontem."],
                     ["Te amo.", "Amo-te."],
                     ["Vou te contar.", "Vou contar-te."],
                     ["Nunca me disse.", "Nunca me disse."]]},
  "tip": "Si dudás al escribir: pronombre detrás del verbo, salvo que haya "
         "*não*, *que* o un adverbio delante."},
]},

34: {
"intro": "Para argumentar sobre el medio ambiente o la ciudad necesitás "
         "conectores. Ojo: dos de los más usados, *todavia* y *entretanto*, "
         "no son lo que parecen.",
"parts": [
 {"h": "Oponer: mas, porém, contudo", "blocks": [0, 1]},
 {"h": "Concluir y explicar", "blocks": [2, 3]},
 {"h": "aliás, inclusive, ou seja; concesión", "blocks": [4, 5]},
],
"blocks": [
 {"h": "Adversativos",
  "q": [{"prompt": "«Todavia» significa…", "answer": "sin embargo", "options": ["sin embargo", "todavía", "mientras tanto"]},
        {"prompt": "«Todavía no llegó.» →", "answer": "Ainda não chegou.", "options": ["Ainda não chegou.", "Todavia não chegou.", "Entretanto não chegou."]}],
  "r": "*mas* (pero), y los formales *porém, contudo, todavia, no entanto, "
       "entretanto*: los cinco = «sin embargo».",
  "ex": [["O Rio é lindo, *mas* é caro.", "Río es hermoso, pero es caro."],
         ["O projeto é bom; *no entanto*, custa muito.", "El proyecto es bueno; sin embargo, cuesta mucho."],
         ["Choveu muito. *Contudo*, não houve enchente.", "Llovió mucho. Sin embargo, no hubo inundación."],
         ["A lei existe; *todavia*, ninguém a cumpre.", "La ley existe; sin embargo, nadie la cumple."],
         ["Para Sérgio Buarque, o brasileiro é cordial; *entretanto*, cordial não quer dizer educado.", "Para Sérgio Buarque, el brasileño es «cordial»; sin embargo, cordial no quiere decir cortés."]],
  "warn": "*todavia* ≠ «todavía» (= *ainda*). *entretanto* ≠ «entretanto» "
          "(mientras tanto): en Brasil significa «sin embargo»."},

 {"h": "Dónde van",
  "r": "*mas* va siempre al principio de su oración. *porém, contudo, no "
       "entanto* pueden desplazarse entre comas: *O plano, porém, "
       "falhou*.",
  "ex": [["O plano, *porém*, falhou.", "El plan, sin embargo, fracasó."],
         ["Gosto da ideia; o prazo, *contudo*, é curto.", "Me gusta la idea; el plazo, sin embargo, es corto."],
         ["Queria ir, *mas* não deu.", "Quería ir, pero no se pudo."]],
  "tip": "Si podés moverlo al medio de la oración, no es *mas*: es "
         "*porém* o *contudo*."},

 {"h": "Conclusivos",
  "q": [{"prompt": "«Por lo tanto» (formal) →", "answer": "portanto", "options": ["portanto", "por tanto", "entanto"]}],
  "r": "*portanto, logo, por isso, então, assim*: introducen la "
       "consecuencia. *pois* también, pero entre comas y después del "
       "verbo.",
  "ex": [["Desmataram a encosta; *portanto*, houve deslizamento.", "Deforestaron la ladera; por lo tanto, hubo un deslave."],
         ["Penso, *logo* existo.", "Pienso, luego existo."],
         ["Estava chovendo, *por isso* ficamos.", "Estaba lloviendo, por eso nos quedamos."],
         ["A água é pouca; devemos, *pois*, economizar.", "El agua es poca; debemos, pues, ahorrar."]],
  "warn": "Se escribe junto: *portanto*. «Por tanto» y «por lo tanto» son "
          "calcos del español."},

 {"h": "Explicativos y causales",
  "r": "*porque*, *pois* (al principio de la explicación), *já que*, *uma "
       "vez que*, *visto que* (= dado que).",
  "ex": [["Leve guarda-chuva, *pois* vai chover.", "Llevá paraguas, que va a llover."],
         ["*Já que* você está aqui, me ajuda.", "Ya que estás acá, ayudame."],
         ["*Uma vez que* o esgoto não é tratado, a baía sofre.", "Dado que las cloacas no se tratan, la bahía sufre."],
         ["*Visto que* ninguém veio, cancelamos.", "Visto que nadie vino, cancelamos."],
         ["Lisboa foi reconstruída em quadras retas, *já que* o terremoto de 1755 a destruiu.", "Lisboa se reconstruyó en manzanas rectas, ya que el terremoto de 1755 la destruyó."]],
  "more": ["*pois* tiene dos caras: al principio explica (*fica, pois está "
           "tarde*); entre comas, después del verbo, concluye (*está "
           "tarde; fica, pois, aqui*). Y *pois é* en el habla es «y sí, "
           "así es»."]},

 {"h": "aliás, inclusive, ou seja",
  "q": [{"prompt": "«Vinieron todos, incluso el administrador.» → Vieram todos, ___ o síndico.", "answer": "inclusive", "options": ["inclusive", "incluso", "aliás"]}],
  "r": "*aliás* = es más / por cierto; *inclusive* = incluso; *ou seja, "
       "isto é* = o sea; *além disso* = además.",
  "ex": [["O show foi ótimo. *Aliás*, você viu o Caetano?", "El show estuvo genial. Por cierto, ¿viste a Caetano?"],
         ["Todos reciclam, *inclusive* o prédio vizinho.", "Todos reciclan, incluso el edificio de al lado."],
         ["Ela é carioca, *ou seja*, ama praia.", "Es carioca, o sea, ama la playa."],
         ["É barato e, *além disso*, fica perto.", "Es barato y, además, queda cerca."]],
  "warn": "*incluso* en portugués es «incluido» (*o café está incluso*). "
          "Para «incluso» decí *inclusive* o *até*."},

 {"h": "Concesión: embora, mesmo que, apesar de",
  "r": "*embora* y *mesmo que* + subjuntivo; *apesar de* + sustantivo o "
       "infinitivo. Los tres = «aunque, a pesar de».",
  "ex": [["*Embora* chova muito, falta água.", "Aunque llueve mucho, falta agua."],
         ["*Mesmo que* seja caro, vale a pena.", "Aunque sea caro, vale la pena."],
         ["*Apesar da* crise, o bairro cresceu.", "A pesar de la crisis, el barrio creció."],
         ["*Apesar de* estar cansado, fui ao debate.", "A pesar de estar cansado, fui al debate."]],
  "warn": "*apesar de* + artículo se contrae: *apesar da crise*, *apesar "
          "do calor*. «Apesar de a crise» solo delante de infinitivo con "
          "sujeto."},
]},

35: {
"intro": "Cada verbo trae su preposición, y muchas veces no es la del "
         "español: *namorar alguém*, *assistir a um jogo*, *esperar o "
         "ônibus*. Esta semana las ordenás.",
"parts": [
 {"h": "assistir a, obedecer a, preferir, namorar", "blocks": [0, 1, 2]},
 {"h": "Sin preposición; chegar e ir", "blocks": [3, 4]},
 {"h": "lembrar, esquecer y el relativo", "blocks": [5, 6]},
],
"blocks": [
 {"h": "assistir a / assistir",
  "q": [{"prompt": "Norma culta: «Vimos el partido en el Maracaná.» → Assistimos ___ jogo no Maracanã.", "answer": "ao", "options": ["ao", "o", "no"]}],
  "r": "*assistir a* = ver un espectáculo: *assisti ao jogo*. *assistir* "
       "sin preposición = atender, ayudar: *o médico assiste o paciente*.",
  "ex": [["*Assistimos ao* desfile na Sapucaí.", "Vimos el desfile en el Sambódromo."],
         ["O enfermeiro *assiste os* doentes.", "El enfermero atiende a los enfermos."],
         ["*Assisti a* uma palestra ótima.", "Fui a una charla buenísima."]],
  "tip": "Hablando, casi todos dicen *assisti o jogo*. En un examen o un "
         "texto formal: *assisti ao jogo*."},

 {"h": "obedecer a, preferir X a Y",
  "r": "*obedecer a* y *desobedecer a*. *preferir* va con *a*, sin "
       "*mais* ni *do que*: *prefiro praia a montanha*.",
  "ex": [["*Prefiro* samba *a* funk.", "Prefiero el samba al funk."],
         ["*Prefiro* ir a pé *a* pegar ônibus.", "Prefiero ir a pie que tomar el colectivo."],
         ["Os motoristas devem *obedecer às* placas.", "Los conductores deben obedecer las señales."]],
  "warn": "«Prefiro mais praia do que montanha» es doble error: *preferir* "
          "ya compara. Decí *prefiro praia a montanha*."},

 {"h": "namorar, casar, sonhar, pensar",
  "q": [{"prompt": "«Bia está de novia con Rafa.» → A Bia ___ o Rafa.", "answer": "namora", "options": ["namora", "namora com", "namora a"]},
        {"prompt": "«Sueño con vivir en Río.» → Sonho ___ morar no Rio.", "answer": "em", "options": ["em", "com", "de"]}],
  "r": "*namorar alguém* (sin *com*), *casar com*, *sonhar com* (alguien, "
       "algo), *sonhar em* + infinitivo, *pensar em*.",
  "ex": [["A Bia *namora o* Rafa há dois anos.", "Bia está de novia con Rafa hace dos años."],
         ["Ela *casou com* um mineiro.", "Se casó con un mineiro."],
         ["*Sonhei com* você.", "Soñé con vos."],
         ["*Sonho em* morar em Ipanema.", "Sueño con vivir en Ipanema."],
         ["*Penso em* você.", "Pienso en vos."]],
  "more": ["*namorar com* se oye en algunas regiones, pero la norma y el "
           "habla del Rio dicen *namorar alguém*. *casar* también se usa "
           "como *casar-se com*. Y *gostar de*, *precisar de*, *lembrar de* "
           "ya los viste en la semana 14."]},

 {"h": "Sin preposición en portugués",
  "q": [{"prompt": "«Ayudé a mi vecina.» →", "answer": "Ajudei a minha vizinha.", "options": ["Ajudei a minha vizinha.", "Ajudei à minha vizinha.", "Ajudei para a minha vizinha."]}],
  "r": "Con personas, sin *a*: *esperar alguém, ajudar alguém, visitar, "
       "convidar, conhecer, ver*. La *a* que ves ahí es artículo.",
  "ex": [["*Espero a* Ana na estação.", "Espero a Ana en la estación (a = artículo)."],
         ["*Ajudei o* vizinho com a mudança.", "Ayudé al vecino con la mudanza."],
         ["Vou *visitar meus* avós em Recife.", "Voy a visitar a mis abuelos en Recife."],
         ["*Convidei* o Lucas pro churrasco.", "Invité a Lucas al asado."]],
  "warn": "Nada de «a» personal: «ajudei ao vizinho» es calco del español. "
          "*ajudar* lleva objeto directo: *ajudei o vizinho*, *ajudei-o*."},

 {"h": "chegar, ir, morar",
  "r": "Norma: *chegar a*, *ir a / para*. Habla: *cheguei em casa*, *vou "
       "no mercado*. Y siempre *morar em*: *moro em Botafogo*.",
  "ex": [["*Chegamos ao* Rio de madrugada.", "Llegamos a Río de madrugada (norma)."],
         ["*Cheguei em* casa tarde.", "Llegué a casa tarde (habla)."],
         ["*Vou à* feira de São Cristóvão.", "Voy a la feria de São Cristóvão."],
         ["*Moro na* rua da praia.", "Vivo en la calle de la playa."]],
  "tip": "En un texto, *chegar a*. Hablando, *chegar em* es lo normal y "
         "nadie lo nota."},

 {"h": "lembrar, esquecer y compañía",
  "r": "Con *se*, preposición; sin *se*, directo: *lembrei-me do nome* = "
       "*lembrei o nome*. Igual *esquecer*. Lo que no vale es mezclar.",
  "table": {"head": ["Verbo", "Con persona o cosa", "Ojo"],
            "rows": [["lembrar(-se)", "lembrar algo / lembrar-se de algo", "habla: lembrar de algo"],
                     ["esquecer(-se)", "esquecer algo / esquecer-se de algo", "habla: esquecer de algo"],
                     ["simpatizar", "simpatizar com alguém", "nunca «simpatizar-se»"],
                     ["implicar", "implicar algo (= acarrear)", "sin «em» en la norma"],
                     ["pagar / perdoar", "pagar algo a alguém", "a la persona, con a"],
                     ["morar / residir", "morar em", "nunca «morar a»"]]},
  "ex": [["*Esqueci* a senha. / *Esqueci-me da* senha.", "Me olvidé de la contraseña."],
         ["*Simpatizei com* ela.", "Me cayó bien."]]},

 {"h": "El relativo lleva la preposición",
  "q": [{"prompt": "«La película que vi (assistir a)…» → O filme ___ assisti…", "answer": "a que", "options": ["a que", "que", "ao que"]}],
  "r": "La preposición del verbo pasa delante del relativo: *o filme a "
       "que assisti*, *a moça com quem casou*, *a cidade em que moro*.",
  "ex": [["O show *a que* assisti foi incrível.", "El show que vi fue increíble."],
         ["A pessoa *de quem* te falei é carioca.", "La persona de la que te hablé es carioca."],
         ["O bairro *em que* moro é tranquilo.", "El barrio en el que vivo es tranquilo."],
         ["O cara *com quem* ela namora é gaúcho.", "El chico con el que sale es gaúcho."],
         ["A revolução *a que* Portugal assistiu em 1974 foi quase sem tiros.", "La revolución que vivió Portugal en 1974 fue casi sin tiros."]],
  "tip": "Hablando se suele caer la preposición («o filme que assisti»). "
         "Escribiendo, no la pierdas."},
]},

36: {
"intro": "El acento grave de *à* tiene fama de difícil, pero se resuelve "
         "con dos trucos. Esta semana los aplicás a horarios, "
         "direcciones y barrios de Río.",
"parts": [
 {"h": "Qué es la crase y el truco del masculino", "blocks": [0, 1, 2]},
 {"h": "Cuándo nunca, y los lugares", "blocks": [3, 4]},
 {"h": "àquele y las locuciones", "blocks": [5, 6]},
],
"blocks": [
 {"h": "a + a = à",
  "q": [{"prompt": "Vou ___ praia de Ipanema.", "answer": "à", "options": ["à", "a", "á"]}],
  "r": "Cuando la preposición *a* se junta con el artículo *a*, se "
       "escribe *à*: *vou a + a praia = vou à praia*. Plural: *às*.",
  "ex": [["Vou *à* praia.", "Voy a la playa."],
         ["Entreguei o livro *à* professora.", "Le entregué el libro a la profesora."],
         ["Fomos *às* lojas do Saara.", "Fuimos a las tiendas del Saara."],
         ["Obedeça *às* placas.", "Obedecé las señales."]],
  "warn": "Es acento grave (`), no agudo: *à*, nunca «á». Y no cambia la "
          "pronunciación: es una *a* sola."},

 {"h": "El truco del masculino",
  "q": [{"prompt": "(Pensá: vou ao mercado) Vou ___ feira.", "answer": "à", "options": ["à", "a", "na"]},
        {"prompt": "(Pensá: fui a pé) Fui ___ cavalo.", "answer": "a", "options": ["a", "à", "ao"]}],
  "r": "Cambiá la palabra femenina por una masculina. Si aparece *ao*, va "
       "crase: *vou ao mercado → vou à feira*. Si queda *a*, no.",
  "ex": [["Fui *ao* cinema → Fui *à* praia.", "ao con masc. → à con fem."],
         ["Refiro-me *ao* aluno → Refiro-me *à* aluna.", "Me refiero al alumno / a la alumna."],
         ["Conheço *o* Rafa → Conheço *a* Bia.", "Sin crase: *conhecer* no lleva preposición."]],
  "tip": "La crase aparece con verbos que piden *a*: *ir, chegar, "
         "voltar, referir-se, obedecer, entregar algo a alguém*."},

 {"h": "Las horas",
  "r": "Ante una hora determinada, siempre crase: *às três*, *à uma*, "
       "*das oito às dez*. Pero *desde as três* y *para as três* no: ahí "
       "la preposición es otra.",
  "ex": [["O show começa *às* nove.", "El show empieza a las nueve."],
         ["Abre *das* oito *às* seis.", "Abre de ocho a seis."],
         ["Chegou *à* uma da manhã.", "Llegó a la una de la mañana."],
         ["Estou aqui *desde as* sete.", "Estoy acá desde las siete."]],
  "tip": "*até as* y *até às* están bien las dos. *ao meio-dia*, sin "
         "crase: *meio-dia* es masculino; *à meia-noite*, con."},

 {"h": "Nunca crase",
  "q": [{"prompt": "Falei ___ ela ontem.", "answer": "a", "options": ["a", "à", "há"]},
        {"prompt": "Começou ___ chover.", "answer": "a", "options": ["a", "à", "há"]}],
  "r": "No hay crase ante **masculino**, **verbo**, **pronombre "
       "personal** (*a ela*), *esta / essa*, *uma* (salvo hora) ni plural "
       "sin artículo (*a pessoas*).",
  "ex": [["Andei *a* pé.", "Anduve a pie (masculino)."],
         ["Começou *a* chover.", "Empezó a llover (verbo)."],
         ["Disse isso *a* ela.", "Le dije eso a ella (pronombre)."],
         ["Refiro-me *a* esta lei.", "Me refiero a esta ley."],
         ["Falou *a* pessoas importantes.", "Habló a personas importantes."]],
  "warn": "En el plural, la *s* te delata: *às pessoas* (con artículo) o "
          "*a pessoas* (sin artículo). «à pessoas» es imposible."},

 {"h": "Barrios y ciudades: vou a, volto da",
  "r": "Si volvés *da*, crase: *vou à Lapa* (volto da Lapa). Si volvés "
       "*de*, no: *vou a Copacabana* (volto de Copacabana).",
  "table": {"head": ["Volto…", "Vou…", "¿Crase?"],
            "rows": [["da Lapa", "à Lapa", "sí"],
                     ["da Bahia", "à Bahia", "sí"],
                     ["de Copacabana", "a Copacabana", "no"],
                     ["de Ipanema", "a Ipanema", "no"],
                     ["do Leblon", "ao Leblon", "masculino"],
                     ["de São Paulo", "a São Paulo", "no"]]},
  "ex": [["Amanhã vou *à* Tijuca.", "Mañana voy a Tijuca."],
         ["Nunca fui *a* Salvador.", "Nunca fui a Salvador."],
         ["Em 1808 a corte chegou *à* Bahia e, depois, *ao* Rio.", "En 1808 la corte llegó a Bahía y, después, a Río."]],
  "tip": "Rima para memorizarlo: *vou a, volto da, crase há; vou a, "
         "volto de, crase pra quê?*"},

 {"h": "àquele, àquela, àquilo",
  "r": "*a* + *aquele / aquela / aquilo* = *àquele, àquela, àquilo*. "
       "Nunca con *este* ni *esse*.",
  "ex": [["Fui *àquele* boteco da Lapa.", "Fui a aquel bar de Lapa."],
         ["Refiro-me *àquela* reunião.", "Me refiero a aquella reunión."],
         ["Não dei importância *àquilo*.", "No le di importancia a eso."],
         ["Fui *a* esta praia uma vez.", "Fui a esta playa una vez (sin crase)."]],
  "tip": "Truco: si con masculino queda *a aquele*, ya está: se funde en "
         "*àquele*."},

 {"h": "Locuciones y à moda de",
  "q": [{"prompt": "«Pagué al contado.» → Paguei ___.", "answer": "à vista", "options": ["à vista", "a vista", "ao contado"]}],
  "r": "Locuciones femeninas llevan crase: *à noite, às vezes, à vontade, "
       "às pressas, à beira-mar, à vista*. Y *à moda de*, también "
       "oculto: *bife à milanesa*.",
  "ex": [["Fique *à vontade*!", "¡Ponete cómodo!"],
         ["Saímos *às pressas*.", "Salimos a las apuradas."],
         ["Um filé *à* parmegiana, por favor.", "Una milanesa a la parmesana, por favor."],
         ["Paguei *à vista*.", "Pagué al contado."],
         ["Moramos *à beira-mar*.", "Vivimos frente al mar."]],
  "more": ["Ante posesivo femenino, la crase es optativa porque el artículo "
           "también lo es: *vou à minha casa* o *vou a minha casa*. Y "
           "*casa* sin determinar (la propia) no lleva: *voltei a casa*; "
           "pero *voltei à casa da Ana*."]},
]},

37: {
"intro": "*manter, propor, prever, intervir*: si sabés *ter, pôr, ver* y "
         "*vir*, ya los sabés. Esta semana, los derivados y los verbos "
         "raros que salen en trámites y ciencia.",
"parts": [
 {"h": "Familias de ter y vir", "blocks": [0, 1]},
 {"h": "Familias de pôr y ver", "blocks": [2, 3]},
 {"h": "-ear, -iar y los sueltos", "blocks": [4, 5, 6]},
],
"blocks": [
 {"h": "manter, obter, conter: como ter",
  "q": [{"prompt": "Ellos mantienen (presente): Eles ___ a tradição.", "answer": "mantêm", "options": ["mantêm", "mantém", "mantienem"]},
        {"prompt": "Perfeito: A equipe ___ ótimos resultados.", "answer": "obteve", "options": ["obteve", "obteu", "obtinha"]}],
  "r": "Se conjugan como *ter* en todos los tiempos: *mantenho, mantém, "
       "mantêm; mantive, manteve; mantenha; mantiver*.",
  "table": {"head": ["", "ter", "manter", "obter"],
            "rows": [["eu (pres.)", "tenho", "mantenho", "obtenho"],
                     ["ele (pres.)", "tem", "mantém", "obtém"],
                     ["eles (pres.)", "têm", "mantêm", "obtêm"],
                     ["ele (perf.)", "teve", "manteve", "obteve"],
                     ["que eu", "tenha", "mantenha", "obtenha"]]},
  "ex": [["Palmares *manteve* a resistência por quase um século.", "Palmares mantuvo la resistencia durante casi un siglo."],
         ["Os abolicionistas *obtiveram* a Lei Áurea em 1888.", "Los abolicionistas consiguieron la Ley Áurea en 1888."]],
  "warn": "*ter* no lleva tilde en *tem*, pero los derivados sí: *mantém* "
          "(él), *mantêm* (ellos), porque son agudas."},

 {"h": "intervir, convir: como vir",
  "r": "*intervenho, intervém, intervêm; intervim, interveio, "
       "intervieram; intervenha*. Igual *convir* (*convém*) y *provir*.",
  "ex": [["O governo *interveio* no porto.", "El gobierno intervino en el puerto."],
         ["*Convém* chegar cedo.", "Conviene llegar temprano."],
         ["Espero que ninguém *intervenha*.", "Espero que nadie intervenga."],
         ["A polícia *interveio* na briga.", "La policía intervino en la pelea."]],
  "warn": "«interviu» y «interviniu» son errores: *vir* da *veio*, así que "
          "*intervir* da *interveio*. «Intervino» → *interveio*."},

 {"h": "propor, compor, supor: como pôr",
  "q": [{"prompt": "Perfeito: Ela ___ uma solução.", "answer": "propôs", "options": ["propôs", "propuso", "propõe"]}],
  "r": "Como *pôr*: *proponho, propõe, propõem; propus, propôs, "
       "propuseram; proponha; propuser*. El infinitivo va **sin** tilde: "
       "*propor*.",
  "table": {"head": ["", "pôr", "propor", "supor"],
            "rows": [["eu (pres.)", "ponho", "proponho", "suponho"],
                     ["ele (pres.)", "põe", "propõe", "supõe"],
                     ["ele (perf.)", "pôs", "propôs", "supôs"],
                     ["eles (perf.)", "puseram", "propuseram", "supuseram"],
                     ["que eu", "ponha", "proponha", "suponha"]]},
  "ex": [["Depois do terremoto de 1755, Pombal *propôs* uma Lisboa nova.", "Después del terremoto de 1755, Pombal propuso una Lisboa nueva."],
         ["Tom Jobim *compôs* «Garota de Ipanema» com Vinicius.", "Tom Jobim compuso «Garota de Ipanema» con Vinicius."]],
  "tip": "Mismo grupo: *compor, dispor, expor, impor, repor, depor*."},

 {"h": "prever, rever: como ver",
  "r": "*prevejo, prevê, preveem; previ, previu; preveja; previr*. Ojo: "
       "*preveem* sin circunflejo (Acuerdo de 1990).",
  "ex": [["Os cientistas *preveem* mais calor.", "Los científicos prevén más calor."],
         ["Ninguém *previu* a tempestade.", "Nadie previó la tormenta."],
         ["Quando você *revir* o texto, me avisa.", "Cuando revises el texto, avisame."],
         ["Espero que o app *preveja* o trânsito.", "Espero que la app prevea el tránsito."]],
  "warn": "*prever* no es *provir*: prever = prever (como *ver*); *provir* "
          "= provenir (como *vir*)."},

 {"h": "Verbos en -ear: passeio",
  "q": [{"prompt": "Eu ___ no calçadão todo domingo.", "answer": "passeio", "options": ["passeio", "passeo", "paseio"]}],
  "r": "En las formas acentuadas en la raíz, *-e-* → *-ei-*: *passeio, "
       "passeia, passeiam*. *nós passeamos* queda igual.",
  "table": {"head": ["", "passear", "frear"],
            "rows": [["eu", "passeio", "freio"],
                     ["ele", "passeia", "freia"],
                     ["nós", "passeamos", "freamos"],
                     ["eles", "passeiam", "freiam"],
                     ["que eu", "passeie", "freie"]]},
  "ex": [["Eles *passeiam* pelo Aterro.", "Pasean por el Aterro."],
         ["*Bloqueie* o cartão pelo app.", "Bloqueá la tarjeta desde la app."]]},

 {"h": "-iar: copio, pero odeio",
  "r": "Casi todos en *-iar* son regulares: *copio, anuncio, estudio*. "
       "Cinco van como *-ear*: **M**ediar, **A**nsiar, **R**emediar, "
       "**I**ncendiar, **O**diar → *odeio, medeio*.",
  "ex": [["Eu *odeio* acordar cedo.", "Odio levantarme temprano."],
         ["Eu *copio* o arquivo na pasta.", "Copio el archivo en la carpeta."],
         ["Quem *medeia* o debate?", "¿Quién modera el debate?"],
         ["Eles *anunciam* os resultados hoje.", "Anuncian los resultados hoy."]],
  "tip": "Regla mnemotécnica: MARIO. Todo lo demás en *-iar* es regular."},

 {"h": "caber, valer, perder, medir",
  "q": [{"prompt": "Eu não ___ nessa roupa.", "answer": "caibo", "options": ["caibo", "cabo", "quepo"]}],
  "r": "Irregulares en *eu* (y en el subjuntivo): *caibo, valho, perco, "
       "meço* → *caiba, valha, perca, meça*. *caber*: perfeito *coube*.",
  "table": {"head": ["Verbo", "eu (pres.)", "ele (pres.)", "que eu"],
            "rows": [["caber", "caibo", "cabe", "caiba"],
                     ["valer", "valho", "vale", "valha"],
                     ["perder", "perco", "perde", "perca"],
                     ["medir", "meço", "mede", "meça"]]},
  "ex": [["Não *coube* tudo na mala.", "No entró todo en la valija."],
         ["Sempre *perco* o metrô.", "Siempre pierdo el subte."],
         ["Espero que você não *perca* o voo.", "Espero que no pierdas el vuelo."]]},
]},

38: {
"intro": "*Cê tá onde? Tô chegando, pera aí.* Así se escribe en "
         "WhatsApp y se habla en la calle. Esta semana entendés el "
         "portugués hablado de Brasil, con acento carioca.",
"parts": [
 {"h": "Reducciones y marcadores", "blocks": [0, 1, 2]},
 {"h": "cadê y ter por haver", "blocks": [3, 4]},
 {"h": "Pronombres del habla y registro", "blocks": [5, 6]},
],
"blocks": [
 {"h": "tá, tô, pra, pro, cê",
  "q": [{"prompt": "«Vou para o Arpoador» dicho rápido →", "answer": "Vou pro Arpoador.", "options": ["Vou pro Arpoador.", "Vou pra o Arpoador.", "Vou po Arpoador."]}],
  "r": "El habla reduce: *estou → tô*, *está → tá*, *para → pra*, *para "
       "o → pro*, *você → cê*. Se escriben así en chats.",
  "table": {"head": ["Forma plena", "Habla", "Ejemplo"],
            "rows": [["estou / está / estava", "tô / tá / tava", "Tô cansado."],
                     ["para / para a", "pra", "Vou pra praia."],
                     ["para o / para os", "pro / pros", "Vou pro Leblon."],
                     ["você", "cê", "Cê vem?"],
                     ["espera aí", "pera aí", "Pera aí!"],
                     ["em um / em uma", "num / numa", "Tô num bar."]]},
  "warn": "*cê* nunca va al final ni después de preposición: *é pra você*, "
          "no «é pra cê». Y *tá?* al final es «¿sí? / ¿dale?»."},

 {"h": "né, então, tipo, aí",
  "r": "*né* (= ¿no?) pide acuerdo; *então* ordena; *tipo* (= como, "
       "onda) aproxima; *aí* (= y entonces) hace avanzar el relato.",
  "ex": [["Tá quente hoje, *né*?", "Hace calor hoy, ¿no?"],
         ["*Então*, eu queria te falar uma coisa.", "Bueno, te quería decir algo."],
         ["Ele chegou, *tipo*, meia-noite.", "Llegó, tipo, a medianoche."],
         ["Fui no bar, *aí* encontrei o Rafa.", "Fui al bar, y ahí me encontré con Rafa."]],
  "tip": "*né* viene de *não é*. Es tan frecuente que aparece en casi "
         "cualquier charla, y hasta en entrevistas."},

 {"h": "Reacciones: pois é, sei lá, nossa",
  "r": "*pois é* (y sí, así es), *sei lá* (qué sé yo), *nossa!* "
       "(¡guau!), *caraca!* (¡uh!, carioca), *que isso!* (¡por favor, "
       "nada que ver!).",
  "ex": [["— Tá caro, né? — *Pois é*.", "—Está caro, ¿no? —Y sí."],
         ["*Sei lá*, acho que ele vem.", "Qué sé yo, creo que viene."],
         ["*Nossa*, que vista!", "¡Guau, qué vista!"],
         ["— Obrigado! — *Que isso*!", "—¡Gracias! —¡Por favor, de nada!"]],
  "more": ["*nossa* viene de *Nossa Senhora* y ya no tiene nada de "
           "religioso. *caraca*, *maneiro* (copado), *irado* (buenísimo), "
           "*partiu!* (¡vamos!) y *mermão* (hermano, muy informal) suenan "
           "cariocas; usalos con amigos, nunca en una entrevista."]},

 {"h": "cadê?",
  "q": [{"prompt": "«¿Dónde están las llaves?» (habla) →", "answer": "Cadê as chaves?", "options": ["Cadê as chaves?", "Cadê estão as chaves?", "Onde cadê as chaves?"]}],
  "r": "*cadê* = ¿dónde está? / ¿dónde están?, sin verbo: *cadê o "
       "Rafa?*, *cadê as chaves?* Solo en el habla y en chats.",
  "ex": [["*Cadê* meu celular?", "¿Dónde está mi celular?"],
         ["*Cadê* vocês?", "¿Dónde están ustedes?"],
         ["*Cadê* o biscoito Globo que eu comprei?", "¿Dónde están los Globo que compré?"]],
  "warn": "*cadê* ya incluye el verbo: «cadê está» es error. En un texto "
          "formal: *onde está?*"},

 {"h": "ter por haver",
  "r": "En Brasil, para «hay» se dice *tem*: *tem gente aqui*, *tinha "
       "muita gente*. *há* queda para lo escrito y lo formal.",
  "ex": [["*Tem* um boteco ótimo na esquina.", "Hay un bar buenísimo en la esquina."],
         ["*Tinha* muita gente no bloco.", "Había mucha gente en el bloco."],
         ["Não *tem* problema.", "No hay problema."],
         ["*Há* vagas para estagiários.", "Hay vacantes para pasantes (escrito)."],
         ["«No meio do caminho *tinha* uma pedra.» (Drummond)", "«En medio del camino había una piedra»: el poeta eligió el ter del habla."]],
  "tip": "*tem* como «hay» no lleva plural: *tem muitas pessoas*, nunca "
         "«têm muitas pessoas»."},

 {"h": "Pronombres del habla",
  "q": [{"prompt": "Habla de Brasil: «¿Lo viste a João?» →", "answer": "Você viu o João?", "options": ["Você viu o João?", "Você viu ao João?", "Você o viu a João?"]}],
  "r": "Hablando: *vi ele* (lo vi), *me dá* (dame), *te* con *você* "
       "(*você sabe que te amo*), *a gente* por *nós*.",
  "table": {"head": ["Habla", "Norma escrita"],
            "rows": [["Vi ele na praia.", "Vi-o na praia."],
                     ["Me dá um minuto.", "Dê-me um minuto."],
                     ["Você sabe que eu te amo.", "Você sabe que eu o amo."],
                     ["A gente vai.", "Nós vamos."],
                     ["Tô te esperando.", "Estou esperando você."]]},
  "ex": [["Liga pra mim quando *cê* chegar.", "Llamame cuando llegues."]]},

 {"h": "Cuándo usarlo",
  "r": "Estas formas se escuchan, se entienden y se usan con amigos, en "
       "chats y en redes. En un mail formal o en un examen escrito, forma "
       "plena.",
  "ex": [["*Tô* chegando, *pera aí*!", "¡Estoy llegando, esperá!"],
         ["*Partiu* praia?", "¿Vamos a la playa?"],
         ["Que show *maneiro*!", "¡Qué show copado!"],
         ["Estou a caminho.", "Estoy en camino (formal)."]],
  "tip": "El chiado carioca: la *s* final suena «sh»: *mais* ≈ «maish», "
         "*três* ≈ «treish». No se escribe; solo se oye."},
]},

39: {
"intro": "Chefão de la tercera estación: futuro do subjuntivo, infinitivo "
         "pessoal, condicionales, discurso indirecto, regencia, crase, "
         "conectores y pronombres. Esta es tu hoja de repaso.",
"parts": [
 {"h": "Repaso: subjuntivos, condicionales, discurso", "blocks": [0, 1, 2]},
 {"h": "Repaso: regencia, crase, conectores, trampas", "blocks": [3, 4, 5]},
],
"blocks": [
 {"h": "Futuro do subjuntivo e infinitivo pessoal",
  "q": [{"prompt": "Quando você ___ (ver) a Bia, avisa.", "answer": "vir", "options": ["vir", "ver", "vier"]},
        {"prompt": "É bom vocês ___ (fazer) a reserva.", "answer": "fazerem", "options": ["fazerem", "fizerem", "façam"]}],
  "r": "Futuro do subjuntivo: tronco del perfeito (*fizer, for, vier*). "
       "Infinitivo pessoal: tronco del infinitivo (*fazerem, irmos*).",
  "ex": [["Quando eu *for* ao Rio, te ligo.", "Cuando vaya a Río, te llamo."],
         ["Se você *puder*, vem.", "Si podés, vení."],
         ["É hora de *irmos*.", "Es hora de irnos."],
         ["Trouxe isso para vocês *verem*.", "Traje esto para que vean."]]},

 {"h": "Los tres condicionales",
  "r": "Real: *se* + futuro do subj. Posible: *se* + imperfeito do subj. "
       "Imposible: *se* + *tivesse* + participio. Nunca condicional tras "
       "*se*.",
  "table": {"head": ["Tipo", "Condición", "Resultado"],
            "rows": [["real", "Se eu tiver tempo,", "vou / irei."],
                     ["posible", "Se eu tivesse tempo,", "iria (habla: ia)."],
                     ["imposible", "Se eu tivesse tido tempo,", "teria ido (habla: tinha ido)."]]},
  "ex": [["Se *chover*, a gente fica.", "Si llueve, nos quedamos."],
         ["Se *chovesse*, a gente ficaria.", "Si lloviera, nos quedaríamos."],
         ["Se *tivesse chovido*, a gente *teria ficado*.", "Si hubiera llovido, nos habríamos quedado."]]},

 {"h": "Discurso indirecto",
  "r": "Con verbo de decir en pasado, cada tiempo retrocede un paso; el "
       "imperativo pasa a imperfeito do subjuntivo.",
  "table": {"head": ["Dijo", "Se reporta"],
            "rows": [["«Vou.»", "disse que ia"],
                     ["«Fui.»", "disse que tinha ido"],
                     ["«Irei.»", "disse que iria"],
                     ["«Vá!»", "pediu que eu fosse"],
                     ["«Você vem?»", "perguntou se eu ia"]]},
  "ex": [["Ela disse que *voltaria* no dia seguinte.", "Dijo que volvería al día siguiente."]]},

 {"h": "Regencia y crase",
  "q": [{"prompt": "Vou ___ Lapa hoje à noite.", "answer": "à", "options": ["à", "a", "na"]},
        {"prompt": "A Bia namora ___ Rafa.", "answer": "o", "options": ["o", "com o", "ao"]}],
  "r": "*assistir a, obedecer a, preferir X a Y, namorar alguém, casar "
       "com*. Crase = *a* + *a*: si con masculino queda *ao*, va *à*.",
  "ex": [["Assisti *ao* jogo.", "Vi el partido."],
         ["Prefiro praia *a* montanha.", "Prefiero playa a montaña."],
         ["Chegamos *às* dez.", "Llegamos a las diez."],
         ["Vou *a* Copacabana e depois *à* Urca.", "Voy a Copacabana y después a Urca."]]},

 {"h": "Conectores, pasiva y pronombres",
  "r": "*todavia, entretanto* = sin embargo. *vendem-se casas* pero "
       "*precisa-se de*. Escritura formal: ênclise, salvo atractor (*não "
       "me disse*).",
  "ex": [["Choveu; *no entanto*, fomos.", "Llovió; sin embargo, fuimos."],
         ["*Alugam-se* quartos.", "Se alquilan cuartos."],
         ["*Precisa-se de* garçons.", "Se necesitan mozos."],
         ["*Disse-me* que não vinha.", "Me dijo que no venía (formal)."],
         ["*Não me* disse nada.", "No me dijo nada."]]},

 {"h": "Las trampas de la estación",
  "r": "Las faltas que más delatan al hispanohablante. Tapá la columna de "
       "la derecha y corregí vos.",
  "table": {"head": ["No", "Sí"],
            "rows": [["quando eu chegue", "quando eu chegar"],
                     ["quando eu ver", "quando eu vir"],
                     ["se eu poderia", "se eu pudesse"],
                     ["se tivesse sabido, tivesse ido", "se tivesse sabido, teria ido"],
                     ["para eles fizerem", "para eles fazerem"],
                     ["pediu que eu vá", "pediu que eu fosse"],
                     ["precisam-se de garçons", "precisa-se de garçons"],
                     ["namoro com a Bia", "namoro a Bia"],
                     ["prefiro mais X do que Y", "prefiro X a Y"],
                     ["vou à Copacabana", "vou a Copacabana"],
                     ["todavia não chegou", "ainda não chegou"]]}},
]},

}
