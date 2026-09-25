/*
 * Las frases — el banco de conversación de Rumo C1.  La gramática del
 * recorrido te da el sistema; estas frases te dan el habla: bloques listos,
 * de alta frecuencia, para decir sin pensar.  Portugués de Brasil, con Río
 * de Janeiro como escenario (boteco, feira, praia, metrô, calçadão) y, desde
 * el B1, historia, literatura y sociedad de Brasil y de Portugal.
 *
 * Cada frase: [portugués, castellano, nota?].  Cada escena trae `week`: la
 * semana del temario (tools/curriculo.py) en la que se abre; usa solo la
 * gramática enseñada hasta esa semana, salvo fórmulas fijas marcadas en la
 * nota.  Lo coloquial va marcado como tal en la nota.
 *
 * Por compatibilidad con el motor, el texto portugués vive en `f.it` (y
 * también en `f.pt`).
 *
 * También contiene la lógica de los ejercicios de frase (fichas, escucha,
 * escritura, lampo, «Adiviná»), sin dependencias del DOM, así se prueba con
 * Node.  Los distractores del «Adiviná» son la misma frase con el error
 * típico del hispanohablante (traps(), abajo).
 */
(function (root) {
  "use strict";

  var SCENES = [
    { id: "oi", week: 1, emoji: "👋", name: "Primeiros passos",
      blurb: "Saludar, presentarte y despedirte como un carioca.",
      phrases: [
        ["Oi, tudo bem?", "Hola, ¿todo bien?", "La respuesta de rigor es *Tudo bem, e você?*: nadie espera que le cuentes tu vida."],
        ["Tudo bem, e você?", "Todo bien, ¿y vos?", "*E você?* devuelve la pregunta; con *você* el verbo va en 3.ª persona. Molde: respondé y devolvé: *Tudo ótimo, e você?*"],
        ["Tudo ótimo!", "¡Todo genial!", "*Tudo* + adjetivo arma la respuesta: *tudo ótimo*, *tudo certo*, *tudo tranquilo*. *Ótimo* = buenísimo, más fuerte que *bom*."],
        ["Bom dia!", "¡Buen día!", "*Bom*, con *m* (suena nasal): nunca «buen». Y *boa tarde*, *boa noite*."],
        ["Boa tarde, como vai?", "Buenas tardes, ¿cómo le va?", "*Boa* en femenino porque *tarde* es femenino. *Como vai?* (¿cómo le va?) es algo más formal que *tudo bem?*"],
        ["Boa noite!", "¡Buenas noches!", "Sirve para saludar y para despedirse de noche."],
        ["Meu nome é Martín.", "Mi nombre es Martín.", "*Meu nome é* + nombre. En Brasil el posesivo puede ir con o sin artículo: *meu nome* o *o meu nome*."],
        ["Eu me chamo Sofía.", "Me llamo Sofía.", "En Brasil se dice *me chamo* (el pronombre adelante); *chamo-me* suena a Portugal o a texto formal."],
        ["Muito prazer!", "¡Mucho gusto!", "*Muito*, nunca «muy»: *muito prazer*, *muito bom*."],
        ["Prazer, eu sou a Bia.", "Un gusto, soy Bia.", "Ante nombre propio, en el habla va el artículo: *a Bia*, *o João*."],
        ["De onde você é?", "¿De dónde sos?", "*Você* va con el verbo en tercera persona: *você é*, *você tem*."],
        ["Sou argentino, de Buenos Aires.", "Soy argentino, de Buenos Aires.", "*Ser* + nacionalidad sin artículo, que concuerda: *argentino*, *argentina*. *De* + ciudad para el origen."],
        ["Sou de Rosario, mas moro no Rio.", "Soy de Rosario, pero vivo en Río.", "*No Rio* = em + o: *o Rio* lleva artículo. *Mas* (pero) va sin i; *mais* es «más»."],
        ["Você fala espanhol?", "¿Hablás español?", "La pregunta no cambia el orden: es la afirmación con entonación de pregunta. *Você fala* = hablás, verbo en 3.ª persona."],
        ["Falo um pouco de português.", "Hablo un poco de portugués.", "Sin *eu*: la terminación *-o* ya dice quién habla. *Um pouco de* + sustantivo = un poco de."],
        ["Até logo!", "¡Hasta luego!", "*Até* = hasta. Mismo molde: *até amanhã*, *até sexta*, *até já* (hasta dentro de un rato)."],
        ["Até amanhã!", "¡Hasta mañana!", "*Amanhã*: ñ española → *nh*."],
        ["Tchau, um beijo!", "¡Chau, un beso!", "Entre amigos se despide con *beijo* o *beijos*; entre hombres, con *um abraço*."],
        ["Valeu, falou!", "¡Gracias, nos vemos!", "Coloquial: *valeu* = gracias; *falou* = chau (entre amigos)."]
      ] },

    { id: "socorro", week: 2, emoji: "🛟", name: "Salva-vidas",
      blurb: "Las frases que te rescatan cuando no entendés nada.",
      phrases: [
        ["Desculpa, não entendi.", "Perdón, no entendí.", "Fórmula fija en perfeito (ese tiempo llega en la semana 11). *Não* es nasal: nunca «no»."],
        ["Pode repetir, por favor?", "¿Podés repetir, por favor?", "*Pode* + infinitivo = ¿podés…?: el pedido cortés más usado. El sujeto *você* se sobreentiende."],
        ["Pode falar mais devagar?", "¿Podés hablar más despacio?", "*Mais*, con i, es «más». *Mas* es «pero»."],
        ["Como se diz «ventana» em português?", "¿Cómo se dice «ventana» en portugués?", "*Como se diz* + palabra + *em* + idioma: tu salvavidas. Respuesta: *janela*."],
        ["O que significa essa palavra?", "¿Qué significa esta palabra?", "*O que* = qué, como pronombre. En el habla *essa* reemplaza a *esta*: *essa palavra* = esta palabra."],
        ["Como se escreve?", "¿Cómo se escribe?", "*Se* impersonal, como en español. Mismo molde: *como se diz?*, *como se pronuncia?*"],
        ["Não sei.", "No sé.", "*Sei*: forma irregular de *saber* para *eu*. La negación va siempre antes del verbo: *não sei*, *não entendi*."],
        ["Não lembro a palavra.", "No me acuerdo de la palabra.", "También *não me lembro da palavra*, más cuidado."],
        ["Estou aprendendo português.", "Estoy aprendiendo portugués.", "*Estar* + gerundio en *-ndo*, como en español. En Portugal dirían *estou a aprender*."],
        ["Pode me corrigir, por favor?", "¿Me podés corregir, por favor?", "En Brasil el pronombre va antes del infinitivo: *pode me corrigir*. Molde: *pode me* + verbo = ¿me podés…?"],
        ["Um momento, deixa eu pensar.", "Un momento, dejame pensar.", "*Deixa eu pensar* es lo que se dice en Brasil; la norma escrita pide *deixe-me pensar*."],
        ["Você quer dizer que…?", "¿Querés decir que…?", "*Querer dizer* = querer decir, significar: *o que quer dizer isso?* = ¿qué significa esto?"],
        ["Ah, entendi!", "¡Ah, entendí!", "Fórmula fija en perfeito de *entender* (ese tiempo llega en la semana 11). *Entendi* = entendí, ya caché."],
        ["Preciso de ajuda.", "Necesito ayuda.", "*Precisar de* + sustantivo: *preciso de ajuda*. Con verbo, sin *de*: *preciso ir*."],
        ["Onde fica o banheiro?", "¿Dónde queda el baño?", "Para ubicar lugares fijos: *onde fica…?*"],
        ["Tudo bem, não tem problema.", "Está bien, no hay problema.", "En el habla de Brasil *tem* reemplaza a *há*: *não tem problema*."],
        ["Você pode escrever aqui?", "¿Me lo podés escribir acá?", "*Você pode* + infinitivo = pedido cortés. *Aqui* = acá; *aí* = ahí, donde estás vos; *lá* = allá."]
      ] },

    { id: "boteco", week: 3, emoji: "🍺", name: "No boteco",
      blurb: "Pedir una cerveza bien gelada y algo para picar, a la carioca.",
      phrases: [
        ["Uma cerveja bem gelada, por favor.", "Una cerveza bien fría, por favor.", "*Gelada* = bien fría. En Río, la cerveza se pide *estupidamente gelada*."],
        ["Me vê um chope?", "¿Me traés un chopp?", "Coloquial: *me vê…* = ¿me traés…? El *chope* es la cerveza tirada."],
        ["Mais uma rodada!", "¡Otra vuelta!", "*Mais um* / *mais uma* = otro/otra más, concuerda con lo pedido: *mais uma cerveja*, *mais um chope*. *Rodada* = vuelta."],
        ["Tem mesa para quatro?", "¿Hay mesa para cuatro?", "*Tem* impersonal = ¿hay?: en el habla de Brasil *ter* reemplaza a *haver*. *Para* + número de personas."],
        ["Uma porção de batata frita.", "Una porción de papas fritas.", "*Batata* = papa. El boniato es *batata-doce*."],
        ["Uma caipirinha sem açúcar, por favor.", "Una caipiriña sin azúcar, por favor.", "*Sem* termina en *m*: suena nasal, más o menos «sein»."],
        ["A conta, por favor.", "La cuenta, por favor.", "Alcanza con el sustantivo + *por favor*. Más completo: *Me traz a conta?* = ¿me traés la cuenta?"],
        ["Vamos dividir a conta?", "¿Dividimos la cuenta?", "*Vamos* + infinitivo = propuesta: ¿dividimos? Mismo molde: *vamos pedir?*, *vamos embora?*"],
        ["Os dez por cento estão incluídos?", "¿Está incluido el diez por ciento?", "En bares y restaurantes la cuenta trae el 10 % de servicio, que es opcional."],
        ["Hoje eu pago!", "¡Hoy pago yo!", "Presente con valor de futuro cercano, como en español. El *eu* explícito marca énfasis: «pago yo»."],
        ["Saúde!", "¡Salud!", "Para brindar. Con tilde: *sa-ú-de*."],
        ["Essa cadeira está livre?", "¿Esta silla está libre?", "*Essa* = esta, en el habla. *Estar livre* = estar libre ahora. Falso amigo: *cadeira* = silla; la cadera es *quadril*."],
        ["Tem cardápio?", "¿Tienen carta?", "*Tem* + sustantivo = ¿hay…?, ¿tienen…?, sin artículo. *Cardápio* = la carta, el menú."],
        ["O que tem para petiscar?", "¿Qué hay para picar?", "*O que tem para* + infinitivo = ¿qué hay para…? *Petiscar* = picar; *o petisco* = la picada del boteco."],
        ["Um guaraná, por favor.", "Un guaraná, por favor.", "Para pedir: *um* / *uma* + cosa + *por favor*. *O guaraná* es masculino."],
        ["Pode trazer mais gelo?", "¿Podés traer más hielo?", "*O gelo* = el hielo; *gelado* = helado, muy frío."],
        ["Esse bolinho de bacalhau está uma delícia!", "¡Este buñuelo de bacalao está riquísimo!", "*Estar uma delícia* = estar riquísimo."],
        ["Garçom, mais um, por favor!", "¡Mozo, otro, por favor!", "*Mais um* sin sustantivo = otro igual; masculino porque se sobreentiende *chope*. Para *cerveja*: *mais uma*."]
      ] },

    { id: "padaria", week: 4, emoji: "🥐", name: "Na padaria",
      blurb: "El café da manhã: pão de queijo, pingado y pão na chapa.",
      phrases: [
        ["Um pão na chapa e um pingado, por favor.", "Un pan a la plancha y un cortado, por favor.", "*Pingado* = café con un poco de leche. El *pão na chapa* es pan francés con manteca, a la plancha."],
        ["Quanto custa o pão de queijo?", "¿Cuánto sale el pan de queso?", "*Custar* concuerda con lo que se compra: *quanto custa o pão?*, *quanto custam os pães?*"],
        ["Quanto é?", "¿Cuánto es?", "Pregunta por el total, sin sujeto: *quanto é?* También: *quanto fica?* = ¿cuánto queda?"],
        ["Me dá dois pães franceses?", "¿Me das dos pancitos?", "Plural en -ães: *pão → pães*. *Me dá* al principio es coloquial y muy común."],
        ["Posso pagar com cartão?", "¿Puedo pagar con tarjeta?", "*Posso* (de *poder*, irregular en 1.ª persona) + infinitivo = ¿puedo…? *Com cartão* o *no cartão*."],
        ["Aceita Pix?", "¿Acepta Pix?", "El Pix es la transferencia instantánea que usa todo Brasil."],
        ["Um café com leite bem quente.", "Un café con leche bien caliente.", "*Bem* + adjetivo = bien, muy: *bem quente*, *bem gelada*. *O leite* es masculino en portugués."],
        ["Um suco de laranja natural, sem açúcar.", "Un jugo de naranja natural, sin azúcar.", "*Suco* = jugo; *de laranja*, sin artículo. *Natural* = exprimido en el momento, no de caja."],
        ["É para viagem.", "Es para llevar.", "*Para viagem* = para llevar; *para comer aqui* = para comer acá."],
        ["Tem alguma coisa sem glúten?", "¿Hay algo sin gluten?", "*Alguma coisa* = algo. *Tem* impersonal = hay. *Sem* + sustantivo = sin."],
        ["O pão está quentinho!", "¡El pan está calentito!", "Diminutivo afectivo: *quentinho*, *cafezinho*."],
        ["Um cafezinho?", "¿Un cafecito?", "El *cafezinho* se ofrece en todos lados: en casa, en la oficina, en el banco."],
        ["Pode ficar com o troco.", "Quedate con el vuelto.", "*Ficar com* algo = quedarse con algo. *Pode* + infinitivo suaviza: «podés quedarte». *O troco* = el vuelto."],
        ["Tem leite sem lactose?", "¿Hay leche sin lactosa?", "Molde para preguntar si hay algo: *Tem* + producto, sin artículo, como en español: *tem leite?*"],
        ["Um misto quente, por favor.", "Un tostado de jamón y queso, por favor.", "*Misto* (mixto) + *quente* (caliente): el tostado de jamón y queso. Masculino: *um misto quente*."],
        ["Muito obrigada!", "¡Muchas gracias!", "*Obrigada* si lo dice una mujer; *obrigado* si lo dice un hombre. Y *muito*, nunca «muy»."]
      ] },

    { id: "trabalho", week: 5, emoji: "💼", name: "No trabalho",
      blurb: "Reuniones, correos y charla de oficina, con você y a gente.",
      phrases: [
        ["O que você faz?", "¿De qué trabajás?", "Literal: «¿qué hacés?». También *você trabalha com o quê?*"],
        ["Trabalho com marketing.", "Trabajo en marketing.", "*Trabalhar com* + área: *trabalho com tecnologia*."],
        ["Trabalho numa empresa de tecnologia.", "Trabajo en una empresa de tecnología.", "*Numa* = em + uma."],
        ["Sou professora de espanhol.", "Soy profesora de español.", "Profesión sin artículo: *sou professora*. *Ser* para la profesión; *estar* para lo pasajero."],
        ["A reunião começa às dez.", "La reunión empieza a las diez.", "*Às dez*: la hora lleva *à/às* (a + as horas)."],
        ["Estou numa reunião agora.", "Estoy en una reunión ahora.", "*Numa* = em + uma, contracción obligatoria. *Estar* porque es algo del momento."],
        ["Mando o e-mail hoje.", "Mando el mail hoy.", "Presente con valor de futuro cercano. *Mandar* = enviar: *mando*, *manda*, *mandamos*."],
        ["A gente almoça ao meio-dia.", "Almorzamos al mediodía.", "*A gente* = nosotros, con el verbo en singular: *a gente almoça*."],
        ["Trabalho de casa às sextas.", "Los viernes trabajo desde casa.", "*Trabalhar de casa* = desde casa. *Às sextas*: *às* + día en plural marca costumbre = los viernes."],
        ["Meu chefe é muito exigente.", "Mi jefe es muy exigente.", "*Muito* + adjetivo = muy; nunca «muy». *Exigente* no cambia en femenino."],
        ["Tenho muito trabalho hoje.", "Tengo mucho trabajo hoy.", "*Trabalho*: j española → *lh*."],
        ["Qual é o prazo?", "¿Cuál es el plazo?", "*Prazo*: pl- español → *pr-*."],
        ["Você tem um minuto?", "¿Tenés un minuto?", "Forma cortés de interrumpir. Se contesta repitiendo el verbo: *Tenho, sim*."],
        ["Estou sem tempo agora.", "Ahora no tengo tiempo.", "*Estar sem* + sustantivo: *estou sem tempo*, *estou sem bateria*."],
        ["Os colegas são muito legais.", "Los compañeros son muy buena onda.", "*Legal* hace el plural *legais* (-al → -ais). *Ser legal* = ser buena onda."],
        ["Saio do escritório às seis.", "Salgo de la oficina a las seis.", "*Escritório* = oficina. La *oficina* brasileña es el taller mecánico."],
        ["Bom fim de semana!", "¡Buen fin de semana!", "*Bom* concuerda con *fim* (masculino): *bom fim de semana*, *boa semana*, *bom trabalho*."]
      ] },

    { id: "planos", week: 6, emoji: "🎉", name: "Planos e convites",
      blurb: "Invitar, aceptar y zafar: bora?, partiu?, fechou!",
      phrases: [
        ["Bora para a praia?", "¿Vamos a la playa?", "Coloquial: *bora* (de *vamos embora*) = ¡vamos!"],
        ["Partiu Arpoador!", "¡Vamos al Arpoador!", "Coloquial: *partiu* + lugar = «¡nos vamos ya para…!»."],
        ["Vamos tomar um chope depois do trabalho?", "¿Vamos a tomar un chopp después del trabajo?", "*Vamos* + infinitivo = propuesta. *Depois do* = depois de + o: la preposición se contrae con el artículo."],
        ["Você quer ir ao cinema?", "¿Querés ir al cine?", "*Ao* = a + o. En el habla también se oye *ir no cinema* (coloquial)."],
        ["Fechou!", "¡Trato hecho! / ¡Dale!", "Perfeito de *fechar* (cerrar) congelado: «trato cerrado» = ¡dale! Coloquial, sin sujeto."],
        ["Combinado!", "¡Quedamos así!", "Participio de *combinar* (acordar un plan) usado como respuesta: ¡quedamos así! También *tá combinado*."],
        ["Que horas a gente se encontra?", "¿A qué hora nos encontramos?", "*Que horas…?* sin «a» delante. *A gente* lleva verbo y pronombre de 3.ª singular: *a gente se encontra*."],
        ["Pode ser às oito?", "¿Puede ser a las ocho?", "*Pode ser* = puede ser, para proponer. *Às* = a + as: las horas son femeninas."],
        ["Hoje não posso, tenho um compromisso.", "Hoy no puedo, tengo un compromiso.", "*Posso* (de *poder*) y *tenho* (de *ter*): irregulares en 1.ª persona. *Compromisso* = cita, obligación."],
        ["Fica para a próxima!", "¡Queda para la próxima!", "*Ficar para* = quedar para. *A próxima* sobreentiende *vez*. En el habla: *fica pra próxima*."],
        ["Topa um samba na Lapa na sexta?", "¿Te prendés a un samba en Lapa el viernes?", "*Topar* = aceptar una propuesta: *topa?*, *topo!*"],
        ["A gente se vê lá.", "Nos vemos allá.", "*A gente se vê* = nos vemos: con *a gente*, pronombre *se* y verbo en 3.ª singular."],
        ["Quer vir comigo?", "¿Querés venir conmigo?", "*Querer* + infinitivo, sin preposición. *Com* + *mim* se funde en *comigo*; igual *contigo*, *conosco*."],
        ["Estou dentro!", "¡Me prendo!", "Literal «estoy adentro»: me sumo. Lo contrario: *estou fora* = paso, no voy."],
        ["Vamos ver, depois eu te falo.", "Veremos, después te aviso.", "*Te falo* mezcla *você* y *te*: es lo normal en el habla de Río."],
        ["Que tal um passeio no Jardim Botânico?", "¿Qué tal un paseo por el Jardín Botánico?", "*Que tal* + sustantivo = ¿qué tal si…? *No* = em + o: *no Jardim Botânico*."],
        ["Onde a gente se encontra?", "¿Dónde nos encontramos?", "*Encontrar-se* = encontrarse con alguien. Con *a gente*: *a gente se encontra*."]
      ] },

    { id: "feira", week: 7, emoji: "🍍", name: "Na feira",
      blurb: "Precios, kilos y regateo en la feria de la calle.",
      phrases: [
        ["Quanto custa o quilo do tomate?", "¿Cuánto sale el kilo de tomate?", "Unidad + *de* + producto con artículo: *o quilo do tomate* (de + o)."],
        ["Está caro!", "¡Está caro!", "*Estar caro* = el precio está alto ahora; *ser caro* = caro siempre. Mismo contraste que en español."],
        ["Faz por dez reais?", "¿Me lo dejás en diez reales?", "*Fazer por* + precio: regatear en la feria."],
        ["Me vê meio quilo de uva.", "Dame medio kilo de uva.", "Coloquial: *me vê* = dame, en un comercio. *Meio* concuerda: *meio quilo*, *meia dúzia*."],
        ["Uma dúzia de bananas, por favor.", "Una docena de bananas, por favor.", "*Dúzia* = docena. El número doce es *doze*."],
        ["Tem troco para cinquenta?", "¿Tenés cambio de cincuenta?", "*Cinquenta*, sin diéresis desde el Acuerdo de 1990."],
        ["Posso provar?", "¿Puedo probar?", "*Provar* = probar (comida o ropa). *Posso* + infinitivo = ¿puedo…?"],
        ["Essa manga está madura?", "¿Este mango está maduro?", "*A manga* = el mango (la fruta), femenino."],
        ["Um pastel de queijo e um caldo de cana.", "Una empanada de queso y un jugo de caña.", "El *pastel* de feria es una empanada frita; la torta es *bolo*."],
        ["São dois reais cada.", "Son dos reales cada uno.", "Precio en plural con *são*: *são dois reais*. *Real → reais* (-al → -ais). *Cada* no cambia."],
        ["Só isso, obrigado.", "Nada más, gracias.", "*Só* = solo. *Só isso* = nada más; para seguir pidiendo: *e mais…*"],
        ["O abacaxi está docinho hoje!", "¡El ananá está dulcecito hoy!", "Diminutivo intensivo: *docinho* = bien dulce. *Abacaxi* = ananá; coloquial, *um abacaxi* = un lío."],
        ["Quanto é tudo?", "¿Cuánto es todo?", "*Tudo* = todo (la totalidad). *Todo* va con sustantivo: *todo dia*."],
        ["Hoje é dia de feira.", "Hoy hay feria.", "*Dia de* + sustantivo sin artículo: *dia de feira*, *dia de praia*, *dia de jogo*."],
        ["A feira fecha ao meio-dia.", "La feria cierra al mediodía.", "*Ao meio-dia* = a + o (*o meio-dia*); con horas, *às duas*. *Fechar* = cerrar."],
        ["Me dá uma sacola?", "¿Me das una bolsa?", "*Sacola* = bolsa de las compras. *Bolsa* es la cartera."]
      ] },

    { id: "praia", week: 8, emoji: "🏖️", name: "Na praia",
      blurb: "Copacabana, Ipanema y el calçadão: sombrilla, mate y biscoito Globo.",
      phrases: [
        ["Vamos à praia?", "¿Vamos a la playa?", "*À* = a + a: *vou à praia*. En el habla: *vou na praia*."],
        ["Estou passando protetor solar.", "Me estoy poniendo protector solar.", "*Passar* una crema = ponérsela: *passar protetor*. *Estar* + gerundio, como en español."],
        ["O mar está uma delícia hoje.", "El mar está buenísimo hoy.", "*Estar* + *uma* + sustantivo = estar buenísimo: *está uma delícia*, *está um gelo*. Molde muy brasileño."],
        ["Cuidado, a água está gelada!", "¡Cuidado, el agua está helada!", "*A água* es femenina con artículo *a* (en español «el agua»). *Gelada* concuerda."],
        ["Vou alugar uma cadeira e um guarda-sol.", "Voy a alquilar una silla y una sombrilla.", "*Ir* + infinitivo sin *a*: *vou alugar* = voy a alquilar."],
        ["Me vê um mate e um biscoito Globo.", "Dame un mate y unas rosquitas Globo.", "En la playa carioca el *mate* es té helado de yerba tostada, y el *biscoito Globo*, el snack de siempre."],
        ["Onde fica o posto nove?", "¿Dónde queda el puesto nueve?", "Las playas de Río se ubican por *postos*, los puestos de guardavidas."],
        ["O pôr do sol no Arpoador é lindo.", "La puesta de sol en el Arpoador es hermosa.", "*Lindo* = hermoso, muy usado. *No Arpoador* = em + o. Allí la gente aplaude cuando el sol se esconde."],
        ["Vou dar um mergulho.", "Me voy a dar un chapuzón.", "*Dar um* + sustantivo = hacer algo una vez: *dar um mergulho*, *dar uma volta*, *dar uma olhada*."],
        ["A gente está esperando vocês no quiosque.", "Los estamos esperando en el quiosco.", "*Esperar* + persona sin *a*: *esperando vocês*. *Vocês* = ustedes; *a gente está* = estamos."],
        ["Vou dar uma volta no calçadão.", "Voy a dar una vuelta por la rambla.", "El *calçadão* de Copacabana tiene las ondas de piedra portuguesa."],
        ["Tem bandeira vermelha hoje.", "Hoy hay bandera roja.", "*Tem* impersonal = hay, sin artículo: *tem bandeira vermelha*. Bandera roja: mar peligroso."],
        ["Você está vendo aquela onda?", "¿Estás viendo esa ola?", "*Aquela* = aquella, lo lejano. *Estar vendo*: el gerundio es más natural que el presente en esta pregunta."],
        ["Esqueci a toalha!", "¡Me olvidé la toalla!", "Fórmula fija en perfeito (semana 11). *Toalha*: ll española → *lh*."],
        ["Que calor, hein!", "¡Qué calor, eh!", "*Que* + sustantivo = ¡qué…! *Hein* refuerza la exclamación, como nuestro «eh»."],
        ["Vai chover mais tarde.", "Va a llover más tarde.", "*Chover*: ll- española → *ch-* (*llover → chover*)."]
      ] },

    { id: "metro", week: 9, emoji: "🚇", name: "Metrô, ônibus e Uber",
      blurb: "Moverse por Río: direcciones, metrô, ônibus y aplicaciones.",
      phrases: [
        ["Com licença, onde fica a estação de metrô?", "Disculpe, ¿dónde queda la estación de metro?", "*Com licença* para pedir paso o disculparse al interrumpir."],
        ["É longe daqui?", "¿Es lejos de acá?", "*Daqui* = de + aqui."],
        ["É só seguir em frente e virar à direita.", "Es seguir derecho y doblar a la derecha.", "*É só* + infinitivo = alcanza con… *Em frente* = derecho; *virar à direita* = doblar a la derecha."],
        ["Esse ônibus passa por Botafogo?", "¿Este colectivo pasa por Botafogo?", "*Ônibus* = colectivo; es igual en singular y en plural."],
        ["Qual é a próxima estação?", "¿Cuál es la próxima estación?", "*Qual é…?* = ¿cuál es…? Se usa aunque en español a veces digamos «qué»: *qual é o seu nome?*"],
        ["Preciso descer na General Osório.", "Me tengo que bajar en General Osório.", "*Precisar* + infinitivo, sin *de*. *Na* = em + a (*a estação*). General Osório es la estación de Ipanema."],
        ["Quanto tempo leva a pé?", "¿Cuánto se tarda a pie?", "*Levar* + tiempo = tardar; el sujeto es el trayecto. *A pé* = a pie; *de carro*, *de ônibus*."],
        ["Leva uns dez minutos.", "Son unos diez minutos.", "*Levar* + tiempo = tardar; el sujeto es el trayecto. *Uns* = unos, aproximadamente."],
        ["Vou pedir um Uber.", "Voy a pedir un Uber.", "*Ir* + infinitivo, sin *a*: *vou pedir*. *Pedir um carro* = pedir un auto por aplicación."],
        ["Pode me deixar aqui, por favor.", "Me puede dejar acá, por favor.", "*Deixar* = dejar a alguien en un lugar. Pronombre antes del infinitivo: *pode me deixar na esquina*."],
        ["Moço, esse ônibus vai para o Centro?", "Disculpe, ¿este colectivo va al Centro?", "*Moço / moça* para dirigirse a desconocidos jóvenes o de mediana edad."],
        ["Estou perdido.", "Estoy perdido.", "*Estar* + participio para un estado; concuerda con quien habla: *perdido*, *perdida*."],
        ["Vou pegar o metrô até Copacabana.", "Voy a tomar el metro hasta Copacabana.", "*Pegar* = tomar un transporte. *Tomar* se usa para bebidas y remedios."],
        ["O trânsito está péssimo hoje.", "El tránsito está pésimo hoy.", "*Péssimo* es el superlativo de *mau* (malo); su opuesto, *ótimo*. *Estar* porque es algo de hoy."],
        ["Onde eu compro o cartão do metrô?", "¿Dónde compro la tarjeta del metro?", "Presente para preguntar dónde se hace algo: *onde eu compro…?* *Do* = de + o."],
        ["Pode ligar o ar-condicionado?", "¿Puede prender el aire acondicionado?", "*Ligar* = prender (un aparato) y también llamar por teléfono."],
        ["É a segunda rua à esquerda.", "Es la segunda calle a la izquierda.", "Ordinal + sustantivo, como en español. *À esquerda* lleva crasis: a + a."]
      ] },

    { id: "familia", week: 10, emoji: "🏠", name: "Família e casa",
      blurb: "Tu gente, tu casa y de quién es cada cosa.",
      phrases: [
        ["Essa é a minha mãe.", "Esta es mi mamá.", "Con posesivo se suele poner artículo: *a minha mãe*. *Mãe* es nasal."],
        ["Tenho dois irmãos e uma irmã.", "Tengo dos hermanos y una hermana.", "*Irmão → irmãos*: plural en -ãos."],
        ["Meus pais moram em Córdoba.", "Mis padres viven en Córdoba.", "*Os pais* = los padres (papá y mamá). *Morar em* + ciudad, sin artículo: *em Córdoba*."],
        ["Você tem filhos?", "¿Tenés hijos?", "*Filho*: h- española → *f-* y j → *lh* (*hijo → filho*)."],
        ["O carro é dele, não é meu.", "El auto es de él, no mío.", "*Dele / dela* aclaran de quién es; *seu* puede ser «tuyo» o «suyo»."],
        ["A casa dela fica em Santa Teresa.", "La casa de ella queda en Santa Teresa.", "*Dela* = de + ela, va después del sustantivo: *a casa dela*. *Ficar* = quedar, estar ubicado."],
        ["Minha avó faz o melhor feijão do mundo.", "Mi abuela hace el mejor feijão del mundo.", "*Avó* (abuela, ó abierta) / *avô* (abuelo, ô cerrada)."],
        ["Meu avô é muito engraçado.", "Mi abuelo es muy divertido.", "*Muito* + adjetivo = muy. *Avô*, con ô cerrada, es el abuelo; *engraçado* = que hace reír."],
        ["Moro num apartamento pequeno.", "Vivo en un departamento chico.", "*Num* = em + um."],
        ["Meu quarto é o da esquerda.", "Mi cuarto es el de la izquierda.", "*O da esquerda* = el de la izquierda: el artículo reemplaza al sustantivo, como en español."],
        ["Este é o meu namorado, o Rafa.", "Este es mi novio, Rafa.", "*Namorado* = novio (de noviazgo). *Noivo* es el prometido."],
        ["Somos uma família grande.", "Somos una familia grande.", "*Somos* sin *nós*: la terminación ya lo dice. *Família* con tilde, tónica en *-mí-*."],
        ["Nossa casa é sua casa.", "Nuestra casa es tu casa.", "Acá *sua* = de você: «tuya»."],
        ["Meu primo mora em Niterói.", "Mi primo vive en Niterói.", "*Primo* / *prima*. *Morar* para la vivienda; con ciudad, *em* sin artículo."],
        ["Esses são os nossos cachorros.", "Estos son nuestros perros.", "*Cachorro* = perro, de cualquier edad. La cría es *filhote*."],
        ["Aquela é a escola do meu filho.", "Aquella es la escuela de mi hijo.", "*Aquela* = lo lejano. *Do meu filho* = de + o + posesivo: el posesivo suele llevar artículo."]
      ] },

    { id: "passado", week: 11, emoji: "⏳", name: "O fim de semana",
      blurb: "Contar lo que hiciste: fui, fiz, comi, vi.",
      phrases: [
        ["O que você fez no fim de semana?", "¿Qué hiciste el fin de semana?", "*Fez*: perfeito irregular de *fazer* (*fiz, fez, fizemos*). *No* = em + o."],
        ["Fui à praia com uns amigos.", "Fui a la playa con unos amigos.", "*Fui* sirve para *ir* y para *ser*. *À praia* = a + a; en el habla, *fui na praia*."],
        ["Comi uma feijoada incrível.", "Comí una feijoada increíble.", "Perfeito regular en *-er*: *comi, comeu, comemos*. En Río, la feijoada es tradición de los sábados."],
        ["Fiquei em casa e descansei.", "Me quedé en casa y descansé.", "*Ficar* = quedarse, sin *se*. Perfeito en *-ar*: *eu* termina en *-ei*: *fiquei*, *descansei*."],
        ["Já comi, obrigado.", "Ya comí, gracias.", "«Ya comí» y «ya he comido» se dicen igual: *já comi*."],
        ["Ainda não fui ao Cristo.", "Todavía no fui al Cristo.", "«Todavía no» = *ainda não*. *Todavia* significa «sin embargo»."],
        ["Você já foi ao Pão de Açúcar?", "¿Ya fuiste al Pan de Azúcar?", "*Já* + perfeito = ¿alguna vez…? Donde el español dice «has ido», el portugués usa *foi*. *Ao* = a + o."],
        ["Vi um show de samba na Lapa.", "Vi un show de samba en Lapa.", "*Vi*: perfeito de *ver* (*vi, viu, vimos*). *Na Lapa*: el barrio lleva artículo."],
        ["Dormi até tarde.", "Dormí hasta tarde.", "Perfeito regular en *-ir*: *dormi, dormiu, dormimos*. *Até tarde* = hasta tarde."],
        ["Ontem choveu o dia todo.", "Ayer llovió todo el día.", "*Choveu*, sin sujeto, como «llovió». *O dia todo* = todo el día: *todo* puede ir después."],
        ["A gente saiu para dançar.", "Salimos a bailar.", "*A gente saiu*: verbo en singular."],
        ["Perdi o celular no Uber.", "Perdí el celular en el Uber.", "Sin pronombre: *perdi o celular*. Perfeito en *-er*: *perdi, perdeu*. *No* = em + o."],
        ["Foi muito divertido!", "¡Fue muy divertido!", "*Foi*, de *ser*, para valorar algo pasado: *foi ótimo*, *foi muito divertido*."],
        ["Conheci uma pessoa muito interessante.", "Conocí a una persona muy interesante.", "Sin «a» personal: *conheci uma pessoa*."],
        ["Cheguei tarde ontem à noite.", "Anoche llegué tarde.", "Perfeito *cheguei*, con *gu* ante *e*. *Ontem à noite* = anoche. Ll- española → *ch-*: *llegar → chegar*."],
        ["Assisti a um filme ótimo.", "Vi una película buenísima.", "*Assistir a* un espectáculo; en el habla, *assisti um filme*."]
      ] },

    { id: "saude", week: 12, emoji: "🩺", name: "Farmácia e médico",
      blurb: "Decir qué te duele, pedir un remedio y entender al médico.",
      phrases: [
        ["Não estou me sentindo bem.", "No me siento bien.", "*Sentir-se* con gerundio: en Brasil el pronombre va antes del gerundio: *estou me sentindo*."],
        ["Estou com dor de cabeça.", "Me duele la cabeza.", "*Estar com dor de…* = tener dolor de… *A dor* es femenino."],
        ["Estou com febre.", "Tengo fiebre.", "*Estar com* + fome, sede, frio, febre, sono."],
        ["Onde tem uma farmácia aqui perto?", "¿Dónde hay una farmacia acá cerca?", "*Onde tem…?* = ¿dónde hay…?, con *ter* impersonal. *Aqui perto* = acá cerca."],
        ["Preciso marcar uma consulta.", "Necesito sacar un turno.", "*Precisar* + infinitivo, sin *de*. *Marcar uma consulta* = sacar turno con el médico."],
        ["Sou alérgico a camarão.", "Soy alérgico al camarón.", "*Alergia*: en portugués la tónica es *-gi-*: a-ler-GI-a."],
        ["Tome este remédio de oito em oito horas.", "Tomá este remedio cada ocho horas.", "*De oito em oito horas* = cada ocho horas."],
        ["Descanse e beba muita água.", "Descansá y tomá mucha agua.", "Imperativo de *você*: *descanse, beba*."],
        ["Minha garganta está doendo.", "Me duele la garganta.", "*Doer*: *doler → doer* (la l entre vocales cae)."],
        ["Machuquei o pé.", "Me lastimé el pie.", "Sin pronombre: *machuquei o pé* = me lastimé el pie. En el perfeito la *c* pasa a *qu* ante *e*."],
        ["Tem algum remédio para gripe?", "¿Hay algún remedio para la gripe?", "*Algum* concuerda: *algum remédio*, *alguma coisa*. *Remédio para* + malestar."],
        ["Precisa de receita?", "¿Hace falta receta?", "*Precisar de* + sustantivo; sin sujeto, impersonal: ¿hace falta…?"],
        ["Estou gripado.", "Estoy engripado.", "*Estar* + adjetivo de enfermedad: *gripado*, *resfriado*. Concuerda: *estou gripada*."],
        ["Estou melhor, obrigada.", "Estoy mejor, gracias.", "*Melhor*: j española → *lh* (*mejor → melhor*)."],
        ["Chame uma ambulância!", "¡Llamá a una ambulancia!", "*Chamar*: ll- española → *ch-*."],
        ["Melhoras!", "¡Que te mejores!", "Plural de *melhora* (mejoría), fórmula fija para quien está enfermo. Versión completa: *Estimo melhoras!*"],
        ["O plano de saúde cobre a consulta?", "¿La prepaga cubre la consulta?", "*Cobrir* = cubrir: *cobre* en 3.ª persona. *Plano de saúde* = prepaga, obra social."]
      ] },

    { id: "reacoes", week: 13, emoji: "🤩", name: "Reações",
      blurb: "Nossa!, Caramba!, Que legal!: las muletillas que te hacen sonar de acá.",
      phrases: [
        ["Nossa!", "¡Uy! / ¡Guau!", "*Nossa* (de *Nossa Senhora*) sirve para la sorpresa buena o mala."],
        ["Caramba!", "¡Caramba!", "Como en español, para sorpresa o fastidio. Más frecuente todavía: *Nossa!*"],
        ["Que legal!", "¡Qué copado!", "*Que* + adjetivo = ¡qué…!: *que legal*, *que bom*, *que chato*. *Legal* = copado."],
        ["Sério?", "¿En serio?", "Alcanza el adjetivo con entonación de pregunta. Variante: *É sério?*"],
        ["Não acredito!", "¡No lo puedo creer!", "*Acreditar* = creer. El portugués omite el objeto: *não acredito* = no lo puedo creer."],
        ["Que pena!", "¡Qué lástima!", "*Que* + sustantivo: *que pena*, *que saudade*, *que vergonha*. Con motivo: *que pena que…*"],
        ["Que chato!", "¡Qué embole!", "*Chato* = aburrido, pesado. Plano es *achatado*."],
        ["Que bom!", "¡Qué bien!", "Exclamación con *bom*: *que bom!* Con oración: *que bom que você veio*."],
        ["Jura?", "¿Posta?", "De *jurar*: ¿me lo jurás?, ¿en serio? Coloquial."],
        ["Pois é.", "Y sí. / Así es.", "Para darle la razón a alguien o llenar un silencio."],
        ["Imagina!", "¡No es nada! / ¡Por favor!", "Imperativo de *imaginar*, respuesta a un *obrigado* o a una disculpa: «¡por favor, nada que ver!»."],
        ["Tá bom.", "Está bien.", "Coloquial: *tá* = *está*. *Tá bom* = está bien, dale."],
        ["Deus me livre!", "¡Dios me libre!", "Fórmula fija con *livrar* en subjuntivo (*livre*). Rechazo fuerte: ¡ni loco!"],
        ["Que saudade!", "¡Cuánto te extrañé! / ¡Qué nostalgia!", "*Saudade*: extrañar a alguien o algo. *Estou com saudade de você* = te extraño."],
        ["Ai, que vergonha!", "¡Ay, qué vergüenza!", "*Ai* = ay. *Vergonha* = vergüenza: *-güenza* española → *-gonha*."],
        ["Tomara!", "¡Ojalá!", "*Tomara* = ojalá. Con oración pide subjuntivo: *tomara que dê certo*."],
        ["Com certeza!", "¡Seguro! / ¡Sin duda!", "*Com certeza* = seguro, claro. *Ter certeza* = estar seguro."],
        ["Que absurdo!", "¡Qué absurdo!", "*Que* + adjetivo = ¡qué…! Invariable como exclamación."]
      ] },

    { id: "falsos", week: 14, emoji: "🪤", name: "Falsos amigos",
      blurb: "Palabras que parecen españolas y te traicionan.",
      phrases: [
        ["Que comida esquisita!", "¡Qué comida más rara!", "*Esquisito* = raro, extraño. Nunca «exquisito», que es *delicioso* o *gostoso*."],
        ["Esse bolo está gostoso!", "¡Esta torta está rica!", "*Estar gostoso* = estar rico (este, ahora). *Bolo* = torta; el *pastel* es otra cosa."],
        ["Ela está grávida.", "Ella está embarazada.", "*Estar grávida* = estar embarazada. Falso amigo: *embaraçada* es avergonzada."],
        ["Fiquei muito embaraçado.", "Me dio mucha vergüenza.", "*Embaraçado* = avergonzado o enredado; no «embarazado»."],
        ["Meu apelido é Tino.", "Mi apodo es Tino.", "*Apelido* = apodo. El apellido es *sobrenome*."],
        ["Qual é o seu sobrenome?", "¿Cuál es tu apellido?", "*O seu*, de *você*: tu apellido. *Sobrenome* = apellido; *apelido* = apodo."],
        ["Deixei o carro na oficina.", "Dejé el auto en el taller.", "*Oficina* = taller mecánico; la oficina es *escritório*."],
        ["Essa rua é bem larga.", "Esta calle es bien ancha.", "*Largo* = ancho. «Largo» es *comprido*."],
        ["Espera um pouquinho.", "Esperá un ratito.", "*Rato* = ratón. «Un rato» = *um pouquinho*, *um tempinho*."],
        ["Pode me emprestar uma borracha?", "¿Me prestás una goma?", "*Borracha* = goma de borrar. Ebrio = *bêbado*."],
        ["Tem polvo no cardápio.", "Hay pulpo en la carta.", "*Polvo* = pulpo. El polvo es *poeira*."],
        ["Qual é a sobremesa de hoje?", "¿Cuál es el postre de hoy?", "Falso amigo: *sobremesa* = postre. *De hoje* = de hoy: el complemento va con *de*."],
        ["Vou tirar uma foto.", "Voy a sacar una foto.", "*Tirar* = sacar: *tirar uma foto*, *tirar férias*, *tirar o passaporte*. Arrojar = *jogar*."],
        ["Ele é muito chato.", "Él es muy pesado.", "*Ser chato* = ser pesado (así es); *estar chato* = estar aburrido (ahora). Falso amigo: no es «chato»."],
        ["Me passa um copo d'água?", "¿Me pasás un vaso de agua?", "*Copo* = vaso. El *vaso* es la maceta (o el inodoro)."],
        ["As crianças estão brincando.", "Los chicos están jugando.", "*Brincar* = jugar (los chicos), bromear. *Criança* = niño."],
        ["Estou sem graça.", "Me da vergüenza. / Estoy incómodo.", "*Sem graça* = incómodo, avergonzado; también «sin gracia»."],
        ["Acordei cedo hoje.", "Hoy me desperté temprano.", "*Acordar* = despertar(se). Ponerse de acuerdo = *combinar*."]
      ] },

    { id: "sentimentos", week: 15, emoji: "❤️", name: "Sentimentos",
      blurb: "Decir lo que sentís: gustos, ganas, miedos y saudade.",
      phrases: [
        ["Estou com saudade de você.", "Te extraño.", "*Estar com saudade de* + persona o lugar = extrañar. También *ter saudade de*."],
        ["Gosto muito de você.", "Te quiero mucho.", "*Gostar de*: el que gusta es sujeto. Entre amigos equivale a «te quiero»."],
        ["Te amo.", "Te amo.", "Pronombre antes del verbo, como en el habla de Brasil. En Portugal: *amo-te*."],
        ["Estou muito feliz por você.", "Estoy muy feliz por vos.", "*Feliz por* alguien. Después de preposición *você* no cambia: *por você*, *com você*."],
        ["Estou com medo.", "Tengo miedo.", "*Estar com* + sustantivo = tener: *com medo*, *com fome*. Miedo de algo: *com medo de*."],
        ["Fiquei chateado com isso.", "Eso me dio bronca.", "*Ficar* + adjetivo = quedar, ponerse: *fiquei chateado*. *Chateado com* algo = molesto por."],
        ["Estou morrendo de fome.", "Me muero de hambre.", "*Fome*: h- española → *f-* (*hambre → fome*)."],
        ["Estou com vontade de chorar.", "Tengo ganas de llorar.", "*Estar com vontade de* + infinitivo = tener ganas de. Ll- → *ch-*: *llorar → chorar*."],
        ["Que alegria te ver!", "¡Qué alegría verte!", "*Te* antes del infinitivo: *te ver*, orden brasileño. *Que* + sustantivo = ¡qué…!"],
        ["Adoro esse lugar.", "Me encanta este lugar.", "*Adorar* sin preposición, mucho más usado que en español: *adoro samba*. *Esse* = este, en el habla."],
        ["Não aguento mais.", "No doy más.", "«Ya no» = *não… mais*: *não aguento mais*. *Aguentar* = aguantar, sin diéresis desde 1990."],
        ["Estou apaixonado.", "Estoy enamorado.", "*Estar apaixonado por* alguien = enamorado de. De *paixão* (pasión)."],
        ["Quando eu era criança, tinha medo do escuro.", "Cuando era chico, le tenía miedo a la oscuridad.", "Imperfeito para describir cómo era el pasado."],
        ["Morro de vergonha de falar em público.", "Me muero de vergüenza de hablar en público.", "*Morrer de* + sustantivo = morirse de: *morro de vergonha*, *morro de fome*."],
        ["Estou nervoso com a entrevista.", "Estoy nervioso por la entrevista.", "*Nervoso com* algo = nervioso por: cambia la preposición."],
        ["Fico feliz em saber.", "Me alegra saberlo.", "*Ficar* + adjetivo: *fico feliz* = me alegra. *Em* + infinitivo: *feliz em saber*."],
        ["Não tem nada a ver.", "No tiene nada que ver.", "*Não tem nada a ver* = no tiene sentido, no tiene relación."]
      ] },

    { id: "conectores", week: 16, emoji: "🌉", name: "Conectores",
      blurb: "Las palabras puente que te dan tiempo para pensar.",
      phrases: [
        ["Na verdade, eu prefiro ficar em casa.", "En realidad, prefiero quedarme en casa.", "*Na verdade* = en realidad. *Preferir* cambia la vocal en 1.ª persona: *eu prefiro*."],
        ["Tipo, não sei explicar.", "O sea, no sé explicarlo.", "Coloquial: *tipo* = como, o sea; muletilla juvenil. *Não sei* + infinitivo = no sé hacer algo."],
        ["Quer dizer, mais ou menos.", "Bueno, más o menos.", "*Quer dizer* = o sea, bueno: sirve para corregirte. Literal: «quiere decir»."],
        ["Ou seja, a gente não vai.", "O sea, no vamos.", "*Ou seja* = o sea: fórmula fija para resumir o reformular."],
        ["Então, o que você acha?", "Entonces, ¿qué te parece?", "*Então* abre o retoma la charla. *O que você acha?* = ¿qué te parece?: *achar* = opinar."],
        ["Aliás, você viu a Bia?", "Por cierto, ¿viste a Bia?", "*Aliás* = por cierto, a propósito; también «mejor dicho»."],
        ["Enfim, vamos ver.", "En fin, ya veremos.", "*Enfim* = en fin, para cerrar. *Vamos ver* = ya veremos: *ir* + infinitivo."],
        ["Por isso eu vim.", "Por eso vine.", "*Por isso* = por eso (*isso* = eso). *Vim*: perfeito irregular de *vir* (*vim, veio, viemos*)."],
        ["Mesmo assim, valeu a pena.", "Aun así, valió la pena.", "*Mesmo assim* = aun así. *Valer a pena* = valer la pena; en perfeito, *valeu*."],
        ["Pelo menos está fazendo sol.", "Por lo menos hay sol.", "*Pelo* = por + o. *Fazer sol* = haber sol; *está fazendo sol* = ahora hay sol."],
        ["De qualquer jeito, obrigado.", "De todas formas, gracias.", "*De qualquer jeito* = de todas formas; *jeito* = manera. También *de qualquer forma*."],
        ["Ah, é mesmo!", "¡Ah, es verdad!", "*Mesmo* refuerza: *é mesmo!* = ¡es verdad! Como pregunta, *é mesmo?* = ¿en serio?"],
        ["Olha, sinceramente, não gostei.", "Mirá, sinceramente, no me gustó.", "*Olha* (mirá) abre una opinión franca. *Gostar* va sin *de* cuando no hay objeto: *não gostei*."],
        ["Além disso, é caríssimo.", "Además, es carísimo.", "*Além disso* = además (*disso* = de + isso). Superlativo en *-íssimo*, con doble *s*."],
        ["No fim das contas, deu tudo certo.", "Al final, salió todo bien.", "*Dar certo* = salir bien, con el sujeto detrás: *deu tudo certo*. *Das* = de + as."],
        ["Aí eu falei: chega!", "Entonces le dije: ¡basta!", "Coloquial: *aí* = entonces, en los relatos. *Chega!* = ¡basta!, de *chegar*."],
        ["Bom, deixa eu ver…", "Bueno, dejame ver…", "*Bom* = bueno, para ganar tiempo. *Deixa eu ver* = dejame ver: en el habla, *eu* después de *deixa*."]
      ] },

    { id: "papo", week: 17, emoji: "☀️", name: "Papo furado",
      blurb: "Charla de ascensor y de playa: el calor, el fútbol, el feriado.",
      phrases: [
        ["Que calor hoje, né?", "Qué calor hoy, ¿no?", "*Né* (= *não é*) pide confirmación, como nuestro «¿no?»."],
        ["Parece que vai chover.", "Parece que va a llover.", "*Parece que* + indicativo. *Vai chover* = futuro con *ir*, sin *a*."],
        ["Amanhã vai fazer quarenta graus.", "Mañana va a hacer cuarenta grados.", "*Fazer* para el clima: *faz calor*, *faz frio*, *vai fazer quarenta graus*."],
        ["O que você vai fazer no feriado?", "¿Qué vas a hacer en el feriado?", "*Ir* + infinitivo = el futuro del habla. *No* = em + o."],
        ["Segundo a previsão, choverá o fim de semana todo.", "Según el pronóstico, va a llover todo el fin de semana.", "El futuro simple (*choverá*) es de la tele y de lo escrito; en la charla, *vai chover*."],
        ["Você viu o jogo ontem?", "¿Viste el partido ayer?", "*Viu*: perfeito de *ver* con *você*. *Jogo* = partido; *jogar* = jugar."],
        ["Você torce para qual time?", "¿De qué cuadro sos?", "*Torcer para* = ser hincha de. En Río: Flamengo, Fluminense, Vasco, Botafogo."],
        ["Sou Flamengo!", "¡Soy de Flamengo!", "*Ser* + club, sin «de»: *sou Flamengo*, *sou Vasco*."],
        ["Faz tempo que não te vejo!", "¡Hace mucho que no te veo!", "*Faz tempo que* = hace mucho que. *Te* antes del verbo; *vejo*: presente irregular de *ver*."],
        ["E aí, quais são as novidades?", "¿Y, qué hay de nuevo?", "*E aí?* abre la charla: ¿y?, ¿qué onda? *Quais*: plural de *qual*."],
        ["Nada de mais.", "Nada del otro mundo.", "*De mais* (nada especial) ≠ *demais* (demasiado; coloquial: genial)."],
        ["Esse fim de semana foi demais!", "¡Este fin de semana estuvo genial!", "*Demais* al final = buenísimo, coloquial. *Foi* (de *ser*) para valorar algo terminado."],
        ["Vou ficar por aqui mesmo.", "Me voy a quedar por acá nomás.", "*Mesmo* al final refuerza: *aqui mesmo* = acá nomás."],
        ["No Rio, o inverno é bem suave.", "En Río, el invierno es bastante suave.", "*Bem* + adjetivo = bastante, muy. *No Rio*: la ciudad lleva artículo (em + o)."],
        ["Está tudo muito caro, né?", "Está todo carísimo, ¿no?", "*Tudo* = todo, pronombre invariable. *Né?* (= *não é?*) pide confirmación."],
        ["O Carnaval está chegando!", "¡Se viene el Carnaval!", "*Estar chegando* = se viene, está por llegar: gerundio para lo que se acerca."],
        ["Hoje o céu está limpo.", "Hoy el cielo está despejado.", "*Céu*: la l entre vocales cae (*cielo → céu*)."]
      ] },

    { id: "restaurante", week: 18, emoji: "🍽️", name: "No restaurante",
      blurb: "Reservar, pedir con cortesía y quejarte sin pelear.",
      phrases: [
        ["Mesa para dois, por favor.", "Mesa para dos, por favor.", "*Para* + número de personas. *Dois* / *duas* concuerda: *duas pessoas*."],
        ["Eu gostaria de fazer uma reserva.", "Quisiera hacer una reserva.", "*Gostaria* (futuro do pretérito) = me gustaría, quisiera: el pedido cortés."],
        ["Poderia trazer o cardápio?", "¿Podría traer la carta?", "*Poderia* (condicional) + infinitivo = pedido cortés. Se sobreentiende *o senhor* o *você*."],
        ["O que você recomenda?", "¿Qué me recomienda?", "*O que* = qué, al comienzo de la pregunta. El portugués omite el «me» si se entiende."],
        ["Eu queria o prato do dia.", "Quería el plato del día.", "*Queria* (imperfeito) también suaviza el pedido."],
        ["Vou querer uma moqueca para dois.", "Voy a pedir una moqueca para dos.", "Para pedir: *vou querer* + plato. *Para dois* = para dos personas."],
        ["Eu queria a carne mal passada.", "Quería la carne jugosa.", "*Mal passada* = jugosa; *ao ponto* = a punto; *bem passada* = bien cocida."],
        ["Pode trazer mais um guardanapo?", "¿Puede traer otra servilleta?", "*Mais um* = otro, uno más. *Pode* + infinitivo = pedido directo y cortés."],
        ["Sou vegetariana.", "Soy vegetariana.", "*Ser* para una característica estable. Concuerda: *vegetariano* / *vegetariana*."],
        ["Estava tudo delicioso.", "Estaba todo riquísimo.", "Imperfeito *estava* para describir cómo estuvo la comida. *Tudo* + adjetivo en masculino."],
        ["Seria possível trocar a batata por salada?", "¿Sería posible cambiar la papa por ensalada?", "*Salada* = ensalada. Salado = *salgado*."],
        ["Bom apetite!", "¡Buen provecho!", "Se dice antes de comer. *Apetite* es masculino: *bom apetite*."],
        ["Estou satisfeito, obrigado.", "Estoy lleno, gracias.", "*Satisfeito*: -cho español → *-ito* (*satisfecho → satisfeito*)."],
        ["Pode embrulhar para viagem?", "¿Me lo puede envolver para llevar?", "*Embrulhar* = envolver; *para viagem* = para llevar. El objeto se sobreentiende."],
        ["Aceitam cartão de débito?", "¿Aceptan tarjeta de débito?", "Verbo en 3.ª plural (*vocês*, el local): *aceitam*. *De débito* / *de crédito*."],
        ["A comida está demorando muito.", "La comida está tardando mucho.", "*Demorar* = tardar; *está demorando* = algo que pasa ahora."],
        ["Você poderia fechar a janela?", "¿Podrías cerrar la ventana?", "*Poderia* + infinitivo = pedido cortés. *Fechar* = cerrar; *abrir* = abrir."]
      ] },

    { id: "whatsapp", week: 19, emoji: "📱", name: "No WhatsApp",
      blurb: "Mensajes, audios y abreviaturas: cómo se escribe en el celular.",
      phrases: [
        ["Tô chegando!", "¡Ya llego!", "Coloquial: *tô* = *estou*, en el habla y en los mensajes."],
        ["Foi mal, me atrasei.", "Perdón, llegué tarde.", "Coloquial: *foi mal* = perdón, fue mi culpa. *Me atrasei* = llegué tarde, de *atrasar-se*."],
        ["Me manda a localização.", "Mandame la ubicación.", "Pronombre al principio, normal en el habla de Brasil: *me manda*. Pedido informal con la forma de *você*."],
        ["Vou ver e te aviso.", "Me fijo y te aviso.", "*Vou ver* = me fijo (futuro con *ir*). *Te aviso*: *te* antes del verbo."],
        ["Pode me mandar um áudio?", "¿Me podés mandar un audio?", "*Pode me* + infinitivo = ¿me podés…? *O áudio* = el mensaje de voz."],
        ["Tá bom, beleza.", "Está bien, dale.", "Coloquial: *beleza* (o *blz*) = dale, ok."],
        ["Kkkkk, que engraçado!", "¡Jajaja, qué gracioso!", "En Brasil la risa escrita es *kkkkk* o *rsrs*."],
        ["Me liga mais tarde?", "¿Me llamás más tarde?", "*Ligar* = llamar por teléfono: *me liga* = llamame. Presente como pedido."],
        ["Vi sua mensagem agora.", "Recién vi tu mensaje.", "*Agora* al final = recién. *A mensagem*: femenina, como todas las palabras en *-agem*."],
        ["Desculpa a demora.", "Perdón por la demora.", "*Desculpa* + sustantivo, sin *por*: *desculpa a demora*, *desculpa o atraso*."],
        ["Estou sem sinal aqui.", "Acá no tengo señal.", "*Estar sem* + sustantivo = no tener (ahora): *sem sinal*, *sem bateria*."],
        ["Meu celular está sem bateria.", "Mi celular se quedó sin batería.", "*Estar sem* = quedarse sin. *Bateria*: tónica en *-ri-*."],
        ["Me adiciona no grupo?", "¿Me agregás al grupo?", "*Adicionar* = agregar (en redes). Pronombre adelante: *me adiciona*. *No* = em + o."],
        ["Vc vem hj?", "¿Venís hoy?", "Abreviaturas de chat: *vc* = você, *hj* = hoje, *tb* = também, *pq* = por que / porque."],
        ["Tô sem crédito, te ligo depois.", "No tengo crédito, te llamo después.", "*Tô* = *estou*. *Te ligo* = te llamo: en el habla *ligar* lleva *te*; en lo escrito, *ligar para alguém*."],
        ["Beijos, até mais!", "¡Besos, hasta la próxima!", "*Beijos* (o *bjs*) cierra mensajes entre amigos. *Até mais* = hasta luego."],
        ["Posso te ligar agora?", "¿Te puedo llamar ahora?", "*Posso* + pronombre + infinitivo: en Brasil el pronombre va antes del infinitivo: *te ligar*."]
      ] },

    { id: "opinioes", week: 23, emoji: "🧠", name: "Opiniões",
      blurb: "Opinar y matizar, ya con el subjuntivo incorporado.",
      phrases: [
        ["Acho que você tem razão.", "Creo que tenés razón.", "*Achar que* va con indicativo: *acho que é*, *acho que tem*."],
        ["Não acho que seja uma boa ideia.", "No creo que sea una buena idea.", "Negado, *achar* pide subjuntivo: *não acho que seja*."],
        ["Na minha opinião, o Rio é a cidade mais bonita do Brasil.", "En mi opinión, Río es la ciudad más linda de Brasil.", "Superlativo: *a* + sustantivo + *mais* + adjetivo + *do*: *a cidade mais bonita do Brasil*."],
        ["Duvido que ele venha.", "Dudo que venga.", "*Duvidar que* + subjuntivo: *venha*, de *vir* (irregular)."],
        ["Tomara que faça sol amanhã!", "¡Ojalá haga sol mañana!", "*Tomara que* + subjuntivo: *faça*, de *fazer*. *Fazer sol* = haber sol."],
        ["Talvez eu vá à festa.", "Tal vez vaya a la fiesta.", "*Talvez* antes del verbo pide subjuntivo."],
        ["Espero que você goste.", "Espero que te guste.", "*Esperar que* + subjuntivo: *goste*. El portugués omite el «lo»."],
        ["Depende.", "Depende.", "Solo, o con *de*: *depende do preço*. *Depender de*, como en español."],
        ["Concordo plenamente.", "Estoy totalmente de acuerdo.", "*Concordar* = estar de acuerdo, un solo verbo. *Plenamente* = totalmente."],
        ["Não concordo com você.", "No estoy de acuerdo con vos.", "*Concordar com* alguien. Lo opuesto: *discordar de*."],
        ["Pode ser, mas não tenho certeza.", "Puede ser, pero no estoy seguro.", "*Ter certeza* = estar seguro: con *ter*, no con *estar*. *Pode ser* = puede ser."],
        ["É importante que todos participem.", "Es importante que todos participen.", "*É importante que* + subjuntivo: *participem*. Mismo molde: *é bom que*, *é preciso que*."],
        ["Para mim, tanto faz.", "Para mí, da igual.", "*Para mim* (nunca «para mí»). *Tanto faz* = me da igual."],
        ["Sinceramente, prefiro que a gente fique em casa.", "Sinceramente, prefiero que nos quedemos en casa.", "*Preferir que* + subjuntivo. Con *a gente*, verbo en 3.ª singular: *fique*."],
        ["Faz sentido.", "Tiene sentido.", "*Fazer sentido* = tener sentido. Negado: *não faz sentido*."],
        ["Por um lado, é caro; por outro, vale a pena.", "Por un lado, es caro; por otro, vale la pena.", "*Por um lado… por outro* = por un lado… por otro. *Valer a pena* = valer la pena."],
        ["Tenho minhas dúvidas.", "Tengo mis dudas.", "*Ter dúvidas* = dudar. Posesivo sin artículo: *tenho minhas dúvidas*."],
        ["Que bom que você veio!", "¡Qué bueno que viniste!", "*Que bom que* + indicativo cuando es un hecho: *você veio*."]
      ] },

    { id: "ideias", week: 30, emoji: "🏛️", name: "Falar de ideias",
      blurb: "Para charlar de historia, política, libros y sociedad de Brasil y Portugal sin quedarte mudo.",
      phrases: [
        ["O Brasil foi o último país independente das Américas a abolir a escravidão, em 1888.", "Brasil fue el último país independiente de América en abolir la esclavitud, en 1888.", "La Lei Áurea la firmó la princesa Isabel el 13 de mayo de 1888."],
        ["A corte portuguesa chegou ao Rio em 1808, fugindo de Napoleão.", "La corte portuguesa llegó a Río en 1808, huyendo de Napoleón.", "Río pasó a ser la sede del Imperio portugués."],
        ["A Independência foi proclamada em 1822, e a República, em 1889.", "La Independencia se proclamó en 1822, y la República, en 1889.", "Pasiva: *ser* + participio que concuerda: *foi proclamada*. La coma reemplaza al verbo repetido: *e a República, em 1889*."],
        ["Palmares foi o maior quilombo do período colonial.", "Palmares fue el mayor quilombo del período colonial.", "Su último líder, Zumbi, murió el 20 de noviembre de 1695: hoy es el Dia da Consciência Negra."],
        ["Durante a ditadura militar, de 1964 a 1985, muitos artistas foram exilados.", "Durante la dictadura militar, de 1964 a 1985, muchos artistas fueron exiliados.", "Caetano Veloso y Gilberto Gil, por ejemplo, vivieron exiliados en Londres."],
        ["O movimento Diretas Já pedia eleições diretas para presidente.", "El movimiento Diretas Já pedía elecciones directas para presidente.", "Las grandes manifestaciones fueron en 1983 y 1984."],
        ["A Constituição de 1988 é chamada de Constituição Cidadã.", "La Constitución de 1988 es llamada Constitución Ciudadana.", "El nombre se lo dio Ulysses Guimarães, presidente de la Asamblea Constituyente."],
        ["Sérgio Buarque de Holanda escreveu sobre o homem cordial.", "Sérgio Buarque de Holanda escribió sobre el hombre cordial.", "En *Raízes do Brasil* (1936). *Cordial* viene de *cor, cordis* (corazón): no quiere decir amable, sino guiado por el afecto y no por la regla."],
        ["Gilberto Freyre publicou Casa-Grande & Senzala em 1933.", "Gilberto Freyre publicó Casa-Grande & Senzala en 1933.", "Una lectura célebre, y muy discutida, de la sociedad colonial."],
        ["O jeitinho brasileiro é um tema clássico da antropologia.", "El jeitinho brasileño es un tema clásico de la antropología.", "Roberto DaMatta lo analizó junto con el «Você sabe com quem está falando?»."],
        ["Paulo Freire defendia uma educação libertadora.", "Paulo Freire defendía una educación liberadora.", "*Pedagogia do Oprimido* la escribió en el exilio, en Chile (1968)."],
        ["Machado de Assis é considerado o maior escritor brasileiro.", "Machado de Assis es considerado el mayor escritor brasileño.", "Fue el primer presidente de la Academia Brasileira de Letras (1897)."],
        ["A Revolução dos Cravos derrubou o Estado Novo em 1974.", "La Revolución de los Claveles derribó el Estado Novo en 1974.", "El 25 de Abril, en Portugal. Una de las señales por radio fue *Grândola, Vila Morena*, de Zeca Afonso."],
        ["O terremoto de 1755 destruiu grande parte de Lisboa.", "El terremoto de 1755 destruyó gran parte de Lisboa.", "La reconstrucción la dirigió el futuro marqués de Pombal."],
        ["Fernando Pessoa escreveu com vários heterônimos.", "Fernando Pessoa escribió con varios heterónimos.", "Alberto Caeiro, Ricardo Reis, Álvaro de Campos. En Portugal se escribe *heterónimos*."],
        ["A saudade é um tema central da cultura portuguesa.", "La saudade es un tema central de la cultura portuguesa.", "Eduardo Lourenço la pensó en *O Labirinto da Saudade* (1978)."],
        ["Brasília foi inaugurada em 1960.", "Brasilia fue inaugurada en 1960.", "Bajo Juscelino Kubitschek; urbanismo de Lúcio Costa, arquitectura de Oscar Niemeyer."],
        ["Esse livro me fez pensar muito.", "Ese libro me hizo pensar mucho.", "*Fazer* + infinitivo = hacer que alguien haga algo: *me fez pensar*."],
        ["Qual é o contexto histórico dessa obra?", "¿Cuál es el contexto histórico de esa obra?", "*Dessa* = de + essa. *Qual é…?* para preguntar por algo concreto."]
      ] },

    { id: "burocracia", week: 35, emoji: "📑", name: "Burocracia",
      blurb: "CPF, cartório, senha y segunda via: sobrevivir a la ventanilla brasileña.",
      phrases: [
        ["Preciso tirar o CPF.", "Necesito sacar el CPF.", "El CPF es el número de contribuyente: te lo piden para casi todo, hasta en la farmacia."],
        ["Onde fica o cartório mais próximo?", "¿Dónde queda la escribanía más cercana?", "*Onde fica…?* para lugares fijos. *Mais próximo* = más cercano. *Cartório* = registro, escribanía."],
        ["Preciso reconhecer firma deste documento.", "Necesito certificar la firma de este documento.", "*Reconhecer firma* = certificar la firma. En otros contextos *firma* es «empresa»."],
        ["Quais documentos eu preciso trazer?", "¿Qué documentos tengo que traer?", "*Quais* + sustantivo plural = ¿qué…? *Precisar* + infinitivo, sin *de*."],
        ["Tem que pegar senha?", "¿Hay que sacar número?", "*Ter que* + infinitivo, impersonal = hay que. *Senha* = número de turno, y también contraseña."],
        ["Qual é o horário de atendimento?", "¿Cuál es el horario de atención?", "*Atendimento* = atención al público, de *atender*. *Qual é…?* = ¿cuál es…?"],
        ["Preciso de uma segunda via do boleto.", "Necesito un duplicado de la boleta.", "*Segunda via* = duplicado. *Boleto* = boleta de pago."],
        ["O sistema está fora do ar.", "El sistema no funciona.", "*Fora do ar* = caído, sin servicio (literal: fuera del aire). *Estar* porque es pasajero."],
        ["Onde eu assino?", "¿Dónde firmo?", "*Assinar* = firmar; *assinatura* = firma. El *eu* explícito es normal en las preguntas del habla."],
        ["Faltou uma cópia autenticada.", "Faltó una copia certificada.", "*Faltar* concuerda con lo que falta: *faltou uma cópia*, *faltaram duas*."],
        ["Quanto tempo demora para ficar pronto?", "¿Cuánto tarda en estar listo?", "*Demorar para* + infinitivo = tardar en. *Ficar pronto* = estar listo; concuerda: *pronta*."],
        ["Vocês aceitam o passaporte como documento?", "¿Aceptan el pasaporte como documento?", "*Vocês* + 3.ª plural: *aceitam*. *Como* = en calidad de."],
        ["Posso agendar pela internet?", "¿Puedo sacar turno por internet?", "*Agendar* = sacar turno. *Pela* = por + a: *pela internet*."],
        ["O prazo já venceu.", "El plazo ya venció.", "*Vencer* = vencer (plazo, factura). *Prazo*: pl- español → *pr-*."],
        ["Preciso abrir uma conta no banco.", "Necesito abrir una cuenta en el banco.", "*Precisar* + infinitivo, sin *de*. *No banco* = em + o."],
        ["Isso depende do seu visto.", "Eso depende de tu visa.", "*Depender de* + artículo: *do seu visto*. *O visto* = la visa, masculino."],
        ["Me informaram que o processo leva trinta dias.", "Me informaron que el trámite tarda treinta días.", "3.ª plural impersonal: *me informaram* = me dijeron. *Processo* = trámite; *levar* + tiempo = tardar."]
      ] },

    { id: "giria", week: 38, emoji: "😎", name: "Gírias cariocas",
      blurb: "El habla de la calle en Río. Todo coloquial: entendelo y usalo solo entre amigos.",
      phrases: [
        ["Coé, mermão!", "¡Qué hacés, hermano!", "Carioca y muy coloquial: *coé* (= qual é) y *mermão* (= meu irmão)."],
        ["Caraca, que maneiro!", "¡Uau, qué copado!", "Coloquial carioca: *maneiro* = copado; *caraca* = ¡uau!"],
        ["Tô bolado com isso.", "Estoy re caliente con eso.", "Coloquial carioca: *bolado* = enojado o preocupado."],
        ["Deu ruim.", "Salió mal.", "*Dar* + adjetivo: *deu ruim* = salió mal; lo opuesto, *deu bom*. Coloquial."],
        ["Vou dar um rolé na orla.", "Voy a dar una vuelta por la costanera.", "Coloquial: *rolé* = vuelta, paseo. *Orla* = costanera."],
        ["Tá de brincadeira?", "¿Me estás cargando?", "*Estar de brincadeira* = estar bromeando. *Tá* = *está*. Coloquial."],
        ["Fala sério!", "¡No me digas! / ¡Dejate de joder!", "Imperativo de *falar*: «¡hablá en serio!». Coloquial: incredulidad o fastidio."],
        ["Ele é gente boa.", "Es buena gente.", "*Gente boa* es invariable: *ele é gente boa*, *ela é gente boa*."],
        ["Que parada é essa?", "¿Qué es esto?", "Coloquial carioca: *parada* = cosa, asunto."],
        ["Papo reto: não gostei.", "Te lo digo sin vueltas: no me gustó.", "Coloquial: *papo reto* = hablando en serio, sin vueltas."],
        ["Tô de boa.", "Estoy tranqui.", "*Tô* = *estou*; *de boa* = tranqui. Muy coloquial."],
        ["Ele deu mole.", "Se descuidó.", "Coloquial carioca: *dar mole* = descuidarse (o dar pie a un coqueteo)."],
        ["Ficou irado!", "¡Quedó bárbaro!", "Coloquial carioca: *irado* = genial, no «enojado»."],
        ["Partiu, galera!", "¡Vamos, gente!", "*Partiu*: perfeito de *partir* usado como «¡vamos!». *Galera* = la barra, los amigos."],
        ["Isso aí é roubada.", "Eso es un clavo.", "*Isso aí* = eso, con refuerzo coloquial. *Roubada* = mal negocio, trampa; de *roubar*."],
        ["Ele é muito mané.", "Es muy gil.", "Coloquial carioca: *mané* = tonto, gil."],
        ["Valeu, tamo junto!", "¡Gracias, estamos!", "Coloquial: *tamo junto* = cuento con vos, estamos juntos en esto."],
        ["Mó calor hoje!", "¡Re calor hoy!", "Coloquial carioca: *mó* (de *maior*) = re, muy."]
      ] },

    { id: "citacoes", week: 40, emoji: "✒️", name: "Citações célebres",
      blurb: "Versos y frases que cualquier brasileño o portugués reconoce, con su fuente. Aprenderlas es aprender la lengua y la cultura a la vez.",
      phrases: [
        ["No meio do caminho tinha uma pedra.", "En medio del camino había una piedra.", "Carlos Drummond de Andrade, «No meio do caminho» (1928). *Tinha* por *havia*: el uso brasileño, llevado a la poesía."],
        ["E agora, José?", "¿Y ahora, José?", "Drummond, «José» (1942). Hoy se usa como frase hecha ante cualquier callejón sin salida."],
        ["Ao vencedor, as batatas!", "¡Al vencedor, las papas!", "Machado de Assis, *Quincas Borba* (1891): la sátira del «humanitismo»."],
        ["Viver é muito perigoso.", "Vivir es muy peligroso.", "Guimarães Rosa, *Grande Sertão: Veredas* (1956): Riobaldo lo repite a lo largo de la novela."],
        ["O sertão é do tamanho do mundo.", "El sertón es del tamaño del mundo.", "Guimarães Rosa, *Grande Sertão: Veredas*."],
        ["O sertanejo é, antes de tudo, um forte.", "El sertanejo es, antes que nada, un fuerte.", "Euclides da Cunha, *Os Sertões* (1902), el libro sobre la guerra de Canudos."],
        ["Só a antropofagia nos une.", "Solo la antropofagia nos une.", "Oswald de Andrade, *Manifesto Antropófago* (1928): la primera frase."],
        ["Ai, que preguiça!", "¡Ay, qué fiaca!", "Mário de Andrade, *Macunaíma* (1928): la muletilla del «herói sem nenhum caráter»."],
        ["O poeta é um fingidor.", "El poeta es un fingidor.", "Fernando Pessoa, «Autopsicografia» (1932)."],
        ["Tudo vale a pena se a alma não é pequena.", "Todo vale la pena si el alma no es pequeña.", "Fernando Pessoa, «Mar Português», en *Mensagem* (1934). En el original son dos versos."],
        ["Navegar é preciso; viver não é preciso.", "Navegar es necesario; vivir no es necesario.", "Pessoa la cita como lema de «navegadores antigos»: viene de Plutarco, que se la atribuye a Pompeyo. Caetano la retomó en «Os Argonautas». *Preciso* = necesario, y también «exacto»."],
        ["As armas e os barões assinalados…", "Las armas y los varones señalados…", "Primer verso de *Os Lusíadas* (1572), de Luís de Camões."],
        ["Amor é fogo que arde sem se ver.", "Amor es fuego que arde sin verse.", "Camões, soneto."],
        ["Mudam-se os tempos, mudam-se as vontades.", "Cambian los tiempos, cambian las voluntades.", "Camões, soneto. Con ênclise (*mudam-se*), la norma escrita."],
        ["Se podes olhar, vê. Se podes ver, repara.", "Si podés mirar, mirá. Si podés ver, fijate.", "Epígrafe de *Ensaio sobre a Cegueira* (1995), de José Saramago, que la atribuye a un imaginario «Livro dos Conselhos». Portugués europeo: tuteo (*podes, vê*)."],
        ["Não tive filhos, não transmiti a nenhuma criatura o legado da nossa miséria.", "No tuve hijos, no le transmití a ninguna criatura el legado de nuestra miseria.", "Machado de Assis, *Memórias Póstumas de Brás Cubas* (1881): el cierre de la novela."],
        ["Saio da vida para entrar na História.", "Salgo de la vida para entrar en la Historia.", "Getúlio Vargas, carta-testamento (1954), escrita antes de suicidarse en el Palácio do Catete, en Río."],
        ["O Brasil não é para principiantes.", "Brasil no es para principiantes.", "Atribuida a Tom Jobim; no hay una fuente escrita segura."],
        ["Educação não transforma o mundo. Educação muda pessoas. Pessoas transformam o mundo.", "La educación no transforma el mundo. La educación cambia a las personas. Las personas transforman el mundo.", "Circula como de Paulo Freire, pero así no aparece en sus libros: es una paráfrasis apócrifa."],
        ["Ninguém educa ninguém, ninguém educa a si mesmo.", "Nadie educa a nadie, nadie se educa a sí mismo.", "Paulo Freire, *Pedagogia do Oprimido* (1968). Sigue: «os homens se educam entre si, mediatizados pelo mundo»."],
        ["O povo é quem mais ordena.", "El pueblo es quien más ordena.", "De «Grândola, Vila Morena», de Zeca Afonso, himno del 25 de Abril de 1974."],
        ["Vemos, ouvimos e lemos. Não podemos ignorar.", "Vemos, oímos y leemos. No podemos ignorar.", "Sophia de Mello Breyner Andresen, «Cantata da Paz» (1969)."],
        ["Liberdade é pouco. O que eu desejo ainda não tem nome.", "La libertad es poco. Lo que deseo todavía no tiene nombre.", "Clarice Lispector, *Perto do Coração Selvagem* (1943)."],
        ["Olhos de ressaca.", "Ojos de resaca.", "Machado de Assis, *Dom Casmurro* (1899): así describe Bentinho la mirada de Capitu. *Ressaca* es la resaca del mar."],
        ["Independência ou morte!", "¡Independencia o muerte!", "El «Grito do Ipiranga» de Pedro I, el 7 de septiembre de 1822, según la tradición."]
      ] },

    { id: "email", week: 43, emoji: "📧", name: "E-mail formal",
      blurb: "Abrir, pedir, adjuntar y cerrar: lo que se escribe todos los días en una oficina brasileña.",
      phrases: [
        ["Prezado senhor Almeida,", "Estimado señor Almeida:", "*Prezado* / *Prezada* abre el mail formal y concuerda con el destinatario. Después va coma, no dos puntos."],
        ["Escrevo para solicitar informações sobre o curso.", "Le escribo para solicitar información sobre el curso.", "*Escrevo para* + infinitivo = le escribo para. *Informações* suele ir en plural."],
        ["Em anexo, envio o meu currículo.", "Adjunto le envío mi currículum.", "*Em anexo* = adjunto. El mail formal habla en primera persona: *envio*."],
        ["Segue em anexo o relatório.", "Adjunto el informe.", "*Segue em anexo* / *segue anexo*: la fórmula más común."],
        ["Conforme combinado, envio a proposta.", "Según lo acordado, le envío la propuesta.", "*Conforme* + participio = según lo…: *conforme combinado*, *conforme solicitado*."],
        ["Agradeço desde já a atenção.", "Le agradezco de antemano su atención.", "*Agradecer* + objeto directo, sin *por*: *agradeço a atenção*. *Desde já* = de antemano."],
        ["Fico no aguardo de seu retorno.", "Quedo a la espera de su respuesta.", "*Ficar no aguardo de* = quedar a la espera de. *Retorno* = respuesta, en el lenguaje de oficina."],
        ["Peço desculpas pelo atraso na resposta.", "Pido disculpas por la demora en responder.", "*Pedir desculpas por* algo; *pelo* = por + o. *Peço*: irregular en 1.ª persona."],
        ["Gostaria de confirmar a reunião de quinta-feira.", "Quisiera confirmar la reunión del jueves.", "*Gostaria de* + infinitivo = quisiera. El día va con *de*: *a reunião de quinta*."],
        ["Poderia me enviar os documentos até sexta?", "¿Podría enviarme los documentos a más tardar el viernes?", "*Até sexta* = hasta el viernes, a más tardar el viernes."],
        ["Estou à disposição para qualquer esclarecimento.", "Quedo a disposición para cualquier aclaración.", "*À disposição*, con crase."],
        ["Atenciosamente,", "Atentamente,", "Adverbio de *atencioso* (atento): el cierre formal estándar, seguido del nombre."],
        ["Um abraço,", "Un abrazo,", "Cierre cordial entre colegas."],
        ["Em resposta ao seu e-mail de ontem, informo que o pagamento foi realizado.", "En respuesta a su mail de ayer, le informo que el pago fue realizado.", "*Informar que* + indicativo. Pasiva: *foi realizado* concuerda con *o pagamento*."],
        ["Solicito, por gentileza, a confirmação do recebimento.", "Solicito, por favor, la confirmación de recepción.", "*Por gentileza* = por favor, en lo formal."],
        ["Encaminho abaixo a mensagem da diretoria.", "Le reenvío abajo el mensaje de la dirección.", "*Encaminhar* = reenviar. *Abaixo* = abajo, en el cuerpo del mail. *Da* = de + a."],
        ["Caso haja alguma dúvida, estou à disposição.", "Si tuviera alguna duda, quedo a disposición.", "*Caso* + subjuntivo presente = si."]
      ] },

    { id: "debate", week: 47, emoji: "🗣️", name: "Debater e argumentar",
      blurb: "Dar la opinión, conceder y contradecir sin pelear, con las ideas de quienes pensaron Brasil y Portugal.",
      phrases: [
        ["Em primeiro lugar, é preciso definir o problema.", "En primer lugar, hay que definir el problema.", "*É preciso* + infinitivo = hay que. Acá *preciso* es necesario, no «exacto»."],
        ["Por outro lado, não podemos esquecer o contexto histórico.", "Por otro lado, no podemos olvidar el contexto histórico.", "*Esquecer* + objeto directo, sin *de*: *esquecer o contexto*."],
        ["Concordo em parte, mas discordo da conclusão.", "Estoy de acuerdo en parte, pero no con la conclusión.", "*Concordar com* / *discordar de*: *discordo da conclusão* (de + a)."],
        ["Não se trata de culpar ninguém.", "No se trata de culpar a nadie.", "*Tratar-se de* impersonal = se trata de. Doble negación normal: *não… ninguém*."],
        ["Darcy Ribeiro via os brasileiros como um povo novo.", "Darcy Ribeiro veía a los brasileños como un pueblo nuevo.", "En *O Povo Brasileiro* (1995): un pueblo hecho de matrices indígenas, africanas y europeas."],
        ["Vale lembrar que a abolição não veio acompanhada de reparação.", "Vale recordar que la abolición no vino acompañada de reparación.", "Florestan Fernandes estudió cómo la sociedad de clases no integró a los libertos (*A Integração do Negro na Sociedade de Classes*, 1964)."],
        ["Lélia Gonzalez propôs o conceito de amefricanidade.", "Lélia Gonzalez propuso el concepto de amefricanidad.", "Intelectual y militante del movimiento negro; el concepto es de 1988."],
        ["Para Roberto Schwarz, o liberalismo no Brasil escravista era uma ideia fora do lugar.", "Para Roberto Schwarz, el liberalismo en el Brasil esclavista era una idea fuera de lugar.", "Del ensayo «As ideias fora do lugar» (1973)."],
        ["Milton Santos pensou a globalização a partir do Sul.", "Milton Santos pensó la globalización desde el Sur.", "Geógrafo bahiano; *Por uma Outra Globalização* (2000)."],
        ["Boaventura de Sousa Santos fala em epistemologias do Sul.", "Boaventura de Sousa Santos habla de epistemologías del Sur.", "Sociólogo portugués, de la Universidad de Coimbra."],
        ["A antropofagia de Oswald propunha devorar a cultura estrangeira e transformá-la.", "La antropofagia de Oswald proponía devorar la cultura extranjera y transformarla.", "Pronombre tras infinitivo: *transformar* + *a* → *transformá-la* (cae la *r*, lleva tilde). Registro escrito."],
        ["Ainda que o argumento seja forte, faltam dados.", "Aunque el argumento sea fuerte, faltan datos.", "*Ainda que* + subjuntivo = aunque. *Faltam dados*: *faltar* concuerda con lo que falta."],
        ["Não resta dúvida de que a desigualdade é o grande problema do país.", "No cabe duda de que la desigualdad es el gran problema del país.", "*Não resta dúvida de que* + indicativo = no cabe duda de que."],
        ["Eu diria que a questão é mais complexa.", "Yo diría que la cuestión es más compleja.", "Condicional *diria* (de *dizer*) para opinar con cautela."],
        ["Se me permite discordar…", "Si me permite disentir…", "*Se* + presente para una condición cortés. *Discordar* = disentir."],
        ["Até que ponto isso é verdade?", "¿Hasta qué punto eso es verdad?", "*Até que ponto* = hasta qué punto. *Isso* = eso."],
        ["O argumento não se sustenta.", "El argumento no se sostiene.", "*Sustentar-se* = sostenerse; con negación el pronombre va antes: *não se sustenta*."],
        ["Em suma, o debate continua aberto.", "En suma, el debate sigue abierto.", "*Em suma* = en suma. *Continuar* + adjetivo = seguir: *continua aberto*."]
      ] }
  ];

  /* ------------------------------------------------------------- índice */

  var ALL = [];
  SCENES.forEach(function (s) {
    s.phrases.forEach(function (p, i) {
      ALL.push({
        id: "frase:" + s.id + ":" + i,
        scene: s.id,
        week: s.week,
        it: p[0],          // el motor lee `it` (esquema heredado de La Via C1)
        pt: p[0],
        es: p[1],
        note: p[2] || ""
      });
    });
  });

  var BY_ID = {};
  ALL.forEach(function (f) { BY_ID[f.id] = f; });

  // A word capitalised in mid-sentence is a name (Copacabana, Machado).
  var PROPER = {};
  ALL.forEach(function (f) {
    var t = String(f.it).replace(/«|»/g, "").split(/\s+/);
    for (var i = 1; i < t.length; i++) {
      var w = t[i].replace(/^[.,!?;:…"]+|[.,!?;:…"]+$/g, "");
      if (/^[A-ZÀ-Ý]/.test(w) && !/[.!?…]$/.test(t[i - 1])) PROPER[w] = true;
    }
  });

  var SCENE_WEEK = {};
  SCENES.forEach(function (s) { SCENE_WEEK[s.id] = s.week; });

  function scene(id) {
    for (var i = 0; i < SCENES.length; i++) if (SCENES[i].id === id) return SCENES[i];
    return null;
  }

  function ofScene(id) {
    return ALL.filter(function (f) { return f.scene === id; });
  }

  // The scenes already open in a given week of the course.
  function openScenes(week) {
    return SCENES.filter(function (s) { return s.week <= (week || 1); });
  }

  /* --------------------------------------------------------- comparar */

  function shuffle(a, rnd) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor((rnd || Math.random)() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Words as the learner sees them on the tiles (punctuation kept on the word).
  function tiles(s) {
    return String(s).replace(/«|»/g, "").split(/\s+/).filter(Boolean);
  }

  /* Tiles as shown on screen: no punctuation and no sentence-initial capital,
     or the tiles give the order away ("Oi," first, "bem?" last).  Proper
     nouns keep their capital (PROPER is filled at load, see above). */
  function tileWords(s) {
    return tiles(s).map(function (t) {
      var w = t.replace(/^[.,!?;:…"]+|[.,!?;:…"]+$/g, "");
      return PROPER[w] ? w : w.charAt(0).toLowerCase() + w.slice(1);
    }).filter(Boolean);
  }

  // Words as the grader compares them: lower case, no punctuation, no
  // accents or cedilla.  Phrase drills train speed of recall, so a missing
  // accent on a phone keyboard is not an error here (the grammar rounds stay
  // strict).  The hyphen of the clitic counts as a space (chamo-me = chamo
  // me) and the apostrophe disappears (d'água = dagua).
  function words(s) {
    return String(s == null ? "" : s)
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[’‘`´]/g, "'")
      .replace(/'/g, "")
      .replace(/[^a-z0-9 ]+/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  // Longest common subsequence of two word lists.
  function lcs(a, b) {
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = 0;
    for (i = 1; i <= a.length; i++) {
      cur = [0];
      for (j = 1; j <= b.length; j++) {
        cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1
               : Math.max(prev[j], cur[j - 1]);
      }
      prev = cur;
    }
    return prev[b.length];
  }

  /* Similarity 0..1 between what was written and the target, word by word.
     Returns also which target words were hit, so the UI can colour them. */
  function compare(said, target) {
    var s = words(said), t = words(target);
    if (!t.length) return { score: 0, hits: [] };
    var common = lcs(s, t);
    var score = (2 * common) / (s.length + t.length || 1);
    var pool = s.slice();
    var hits = t.map(function (w) {
      var k = pool.indexOf(w);
      if (k >= 0) { pool.splice(k, 1); return true; }
      return false;
    });
    return { score: score, hits: hits };
  }

  /* A written phrase: exact words = right; one slip in a longer phrase =
     close.  Word order counts, because that is what makes it Portuguese. */
  function gradeWritten(given, target) {
    var r = compare(given, target);
    var same = words(given).join(" ") === words(target).join(" ");
    r.verdict = same ? "giusto" : r.score >= 0.8 ? "quasi" : "sbagliato";
    return r;
  }

  /* ------------------------------------------- errores del hispanohablante

     traps(frase) devuelve la misma frase con los errores típicos de quien
     habla español (Grannier 2002; Durão 1999; Almeida Filho 1995): la
     palabra española que se cuela (muy, más, hoy, todo), la contracción
     deshecha a la española (del, al, en el, a la), la grafía española
     (ñ, ll, -ción, -dad, -ble, -aje) y la -m final escrita -n.  Nunca un
     error que se descarte por el sentido: siempre la misma frase.  Es el
     port al portugués de Lezione.traps(…, safe) de La Via C1, sin depender
     de lezione.js. */

  // The Spanish word that slips in.  Only what is never right in Portuguese
  // in that slot.
  var SPAN = {
    "muito": "muy", "muita": "mucha", "muitos": "muchos", "muitas": "muchas",
    "mais": "más", "não": "no", "sim": "sí", "também": "también", "então": "entonces",
    "depois": "después", "agora": "ahora", "hoje": "hoy", "amanhã": "mañana", "ontem": "ayer",
    "noite": "noche", "bom": "buen", "boa": "buena", "eu": "yo", "e": "y", "com": "con",
    "sem": "sin", "em": "en", "um": "un", "uma": "una", "tudo": "todo", "sou": "soy",
    "estou": "estoy", "vou": "voy", "tenho": "tengo", "tem": "tiene", "quero": "quiero",
    "posso": "puedo", "pode": "puede", "é": "es", "são": "son", "onde": "donde",
    "quando": "cuando", "qual": "cual", "quem": "quien", "ninguém": "nadie", "alguém": "alguien",
    "sempre": "siempre", "ainda": "todavía", "isso": "eso", "isto": "esto", "esse": "ese",
    "essa": "esa", "aquilo": "aquello", "meu": "mi", "minha": "mi", "seu": "su", "sua": "su",
    "pouco": "poco", "outro": "otro", "outra": "otra", "coisa": "cosa", "pessoa": "persona",
    "nome": "nombre", "fome": "hambre", "praia": "playa", "cerveja": "cerveza",
    "desculpa": "disculpa", "até": "hasta", "mim": "mí", "comigo": "conmigo", "fala": "habla",
    "falar": "hablar", "fazer": "hacer", "faz": "hace", "ele": "él", "ela": "ella",
    "nós": "nosotros", "vocês": "ustedes", "bem": "bien", "mesmo": "mismo", "melhor": "mejor",
    "pior": "peor", "trabalho": "trabajo", "filho": "hijo", "mulher": "mujer", "novo": "nuevo",
    "nova": "nueva", "tempo": "tiempo", "festa": "fiesta", "porta": "puerta",
    "obrigado": "obligado", "obrigada": "obligada", "prato": "plato", "igreja": "iglesia",
    "chegar": "llegar", "chamo": "llamo", "chove": "llueve", "cheio": "lleno", "chave": "llave",
    "leite": "leche", "oito": "ocho", "feito": "hecho", "direito": "derecho",
    "cidade": "ciudad", "ano": "año", "pão": "pan", "mão": "mano", "irmão": "hermano",
    "pequeno": "pequeño", "senhor": "señor", "senhora": "señora", "há": "hay", "aqui": "acá",
    "lá": "allá", "aceita": "acepta", "aceitam": "aceptan", "receita": "receta",
    "dois": "dos", "quatro": "cuatro", "sete": "siete", "nove": "nueve", "dez": "diez",
    "meio": "medio", "quilo": "kilo", "uns": "unos", "umas": "unas", "ajuda": "ayuda",
    "escreve": "escribe", "escrever": "escribir", "quer": "quiere", "dizer": "decir",
    "diz": "dice", "saúde": "salud", "aquela": "aquella", "aquele": "aquel", "deus": "dios",
    "esquisita": "exquisita", "esquisito": "exquisito", "vai": "va", "foi": "fue",
    "goste": "guste", "ou": "o", "morte": "muerte", "se": "si", "pães": "panes"
  };
  // The contraction undone the Spanish way.
  var CONTR = {
    "no": "en el", "na": "en la", "nas": "en las", "do": "del", "da": "de la",
    "dos": "de los", "das": "de las", "ao": "al", "aos": "a los", "à": "a la", "às": "a las",
    "pelo": "por el", "pela": "por la", "pelos": "por los", "pelas": "por las",
    "num": "en un", "numa": "en una", "dele": "de él", "dela": "de ella", "deles": "de ellos",
    "delas": "de ellas", "neste": "en este", "nesta": "en esta", "nesse": "en ese",
    "nessa": "en esa", "disso": "de eso", "nisso": "en eso", "daqui": "de aquí", "deste": "de este",
    "desse": "de ese", "dessa": "de esa"
  };
  // The article the Spanish way.
  var ART = { "o": "el", "os": "los", "a": "la", "as": "las" };

  // The same word spelled the Spanish way (ñ, ll, -ción, -dad, -ble, -aje).
  function spell(low) {
    var out = [];
    if (/nh/.test(low)) out.push(low.replace("nh", "ñ"));
    if (/lh/.test(low)) out.push(low.replace("lh", "ll"));
    if (/ções$/.test(low)) out.push(low.replace(/ções$/, "ciones"));
    else if (/ção$/.test(low)) out.push(low.replace(/ção$/, "ción"));
    if (/dade$/.test(low) && low.length > 5) out.push(low.replace(/dade$/, "dad"));
    if (/veis$/.test(low)) out.push(low.replace(/veis$/, "bles"));
    else if (/vel$/.test(low) && low.length > 4) out.push(low.replace(/vel$/, "ble"));
    if (/agem$/.test(low)) out.push(low.replace(/agem$/, "aje"));
    if (/eir[oa]s?$/.test(low) && low.length > 5) out.push(low.replace(/eir([oa]s?)$/, "er$1"));
    if (/íssim[oa]s?$/.test(low)) out.push(low.replace(/íssim/, "ísim"));
    // ch- where Spanish has ll- (chegar → llegar, chamar → llamar, chover → llover)
    if (/^ch(eg|am|ov|or|ei)/.test(low)) out.push(low.replace(/^ch/, "ll"));
    return out;
  }
  // Looser slips: ss → s, final -m → -n, ç → z.
  function loose(low) {
    var out = [];
    if (/ss/.test(low) && low.length > 4) out.push(low.replace("ss", "s"));
    if (/[aeiouãõ]m$/.test(low) && low.length > 2) out.push(low.slice(0, -1) + "n");
    if (/ç/.test(low)) out.push(low.replace("ç", "z"));
    // the Spanish preterite ending: ficou → ficó, partiu → partió, valeu → valió
    if (/[^aeiou]ou$/.test(low) && low.length > 3) out.push(low.slice(0, -2) + "ó");
    if (/[^aeiou][ie]u$/.test(low) && low.length > 3) out.push(low.slice(0, -2) + "ió");
    return out;
  }

  function uniq(a) {
    var seen = {};
    return a.filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; });
  }

  function traps(sentence, rnd) {
    rnd = rnd || Math.random;
    var toks = String(sentence).split(" ");
    var rule = [], soft = [];
    toks.forEach(function (t, i) {
      var m = t.match(/^([«"(¿¡]*)([A-Za-zÀ-ÿ'-]+)([.,;:!?»")…]*)$/);
      if (!m) return;
      var w = m[2], low = w.toLowerCase();
      if (i > 0 && w[0] !== low[0]) return;          // a name (Rio, Bia) stays as it is
      var hasNext = !!toks[i + 1];
      var put = function (nw, bag) {
        if (w[0] !== low[0]) nw = nw.charAt(0).toUpperCase() + nw.slice(1);
        var c = toks.slice(); c[i] = m[1] + nw + m[3]; bag.push(c.join(" "));
      };
      if (SPAN.hasOwnProperty(low)) {
        var sp = SPAN[low];
        // «muito» alone is «mucho», before a word «muy».
        if (low === "muito" && !hasNext) sp = "mucho";
        put(sp, rule);
      }
      if (CONTR.hasOwnProperty(low) && hasNext) put(CONTR[low], rule);
      if (ART.hasOwnProperty(low) && hasNext) put(ART[low], soft);
      spell(low).forEach(function (x) { put(x, rule); });
      loose(low).forEach(function (x) { put(x, soft); });
    });
    var same = words(sentence).join(" ");
    var clean = function (l) {
      return uniq(shuffle(l, rnd)).filter(function (c) { return words(c).join(" ") !== same; });
    };
    var r = clean(rule);
    return r.concat(clean(soft).filter(function (c) { return r.indexOf(c) < 0; }));
  }

  /* --------------------------------------------------------- ejercicios */

  /* Cada frase genera ejercicios de tipo distinto.  Todos comparten la
     forma de los ítems del curso (id, type, prompt, stem, answer), más el
     campo `frase` que lleva la frase de origen. */

  function tilesItem(f) {
    var own = tileWords(f.it);
    var others = shuffle(ALL.filter(function (g) { return g.scene === f.scene && g.id !== f.id; }));
    var extra = [];
    var have = words(f.it);
    for (var i = 0; i < others.length && extra.length < 3; i++) {
      var cand = tileWords(others[i].it);
      var w = cand[Math.floor(Math.random() * cand.length)];
      var key = words(w).join(" ");
      if (key && have.indexOf(key) < 0 && extra.every(function (e) {
        return words(e).join(" ") !== key;
      })) extra.push(w);
    }
    return {
      id: f.id, frase: f, src: "frasi", type: "tiles",
      prompt: "Armá la frase en portugués",
      stem: f.es,
      tiles: shuffle(own.concat(extra)),
      answer: f.it, accept: [f.it], note: f.note
    };
  }

  /* The phrases that look most like f on one side («es» or «it»): same
     scene, words in common, similar length, both questions or neither.
     Distractors that could be told apart by their look give the answer away. */
  function similar(f, n, side) {
    var key = function (x) { return String(x[side] || ""); };
    var toks = function (x) {
      return key(x).toLowerCase().split(/[^a-záéíóúñüàâêôãõç']+/).filter(function (w) { return w.length > 2; });
    };
    var mine = toks(f), used = {};
    used[key(f)] = true;
    var score = function (g) {
      var gw = toks(g);
      return mine.filter(function (w) { return gw.indexOf(w) >= 0; }).length * 2 + (g.scene === f.scene ? 2 : 0) -
        Math.abs(key(g).length - key(f).length) / 12 + (/\?$/.test(key(g)) === /\?$/.test(key(f)) ? 1 : 0);
    };
    return shuffle(ALL).filter(function (g) {
      if (g.id === f.id || used[key(g)]) return false;
      used[key(g)] = true;
      return true;
    }).slice(0, 120).sort(function (a, b) { return score(b) - score(a); }).slice(0, n);
  }

  function listenItem(f) {
    var best = similar(f, 3, "es");
    return {
      id: f.id, frase: f, src: "frasi", type: "listen",
      prompt: "Escuchá: ¿qué significa?",
      stem: f.it,
      options: shuffle([f.es].concat(best.map(function (g) { return g.es; }))),
      answer: f.es, accept: [f.es], note: f.note
    };
  }

  function writeItem(f) {
    return {
      id: f.id, frase: f, src: "frasi", type: "write",
      prompt: "Escribilo en portugués (las tildes no cuentan)",
      stem: f.es,
      answer: f.it, accept: [f.it], note: f.note
    };
  }

  function flashItem(f) {
    return {
      id: f.id, frase: f, src: "frasi", type: "flash",
      prompt: "¿Cómo se dice? Pensalo y tocá para ver",
      stem: f.es,
      answer: f.it, accept: [f.it], note: f.note
    };
  }

  /* Cloze en contexto: la frase entera, una palabra para recordar.
     Recuperar una palabra dentro de su bloque la ata al bloque (Nation 2013). */
  var STOP = ["você", "vocês", "como", "isso", "esse", "essa", "este", "esta", "muito", "muita",
              "mais", "também", "porque", "sempre", "ainda", "então", "para", "pela", "pelo",
              "está", "estou", "não", "uma", "que", "com", "sem", "mas", "dos", "das", "nos", "nas"];

  function clozeItem(f) {
    var toks = tiles(f.it);
    var cands = [];
    toks.forEach(function (t, i) {
      var core = t.replace(/^[^A-Za-zÀ-ÿ]+|[^A-Za-zÀ-ÿ]+$/g, "");
      if (core.length >= 3 && /^[A-Za-zÀ-ÿ]+$/.test(core) &&
          STOP.indexOf(core.toLowerCase()) < 0) cands.push({ i: i, core: core });
    });
    if (!cands.length) return tilesItem(f);
    var c = cands[Math.floor(Math.random() * cands.length)];
    var stem = toks.map(function (t, i) {
      return i === c.i ? t.replace(c.core, "___") : t;
    }).join(" ");
    return {
      id: f.id, frase: f, src: "frasi", type: "cloze",
      prompt: "Completá la frase: «" + f.es + "»",
      stem: stem,
      answer: c.core, accept: [c.core], note: f.note
    };
  }

  /* Dictado: escuchar y escribir une sonido y grafía. */
  function dictationItem(f) {
    return {
      id: f.id, frase: f, src: "frasi", type: "dictation",
      prompt: "Ditado: escuchá y escribí lo que oís",
      stem: f.it,
      answer: f.it, accept: [f.it], note: f.note
    };
  }

  /* Pretest: intentar adivinar antes de ver la respuesta mejora el
     recuerdo, aun cuando se falla (Kornell, Hays & Bjork 2009; Richland,
     Kornell & Kao 2009).  No cuesta vidas ni entra en el repaso.
     Las opciones son la misma frase con el error del hispanohablante
     (Muy obrigado, Vamos a la praia, amañã): se adivina por la forma, nunca
     por el sentido.  Lo que tiene menos de dos versiones así se completa con
     las frases más parecidas. */
  function guessItem(f) {
    var same = words(f.it).join(" ");
    var tr = traps(f.it).filter(function (t) { return words(t).join(" ") !== same; });
    var others = tr.slice(0, 2);
    // Only one mistake possible: the second option carries two.
    if (others.length === 1) {
      var two = traps(others[0]).filter(function (t) {
        return words(t).join(" ") !== same && words(t).join(" ") !== words(others[0]).join(" ");
      })[0];
      if (two) others.push(two);
    }
    if (others.length < 2) similar(f, 4, "it").forEach(function (g) {
      if (others.length < 2 && others.indexOf(g.it) < 0) others.push(g.it);
    });
    return {
      id: f.id, frase: f, src: "frasi", type: "guess",
      prompt: "Adiviná antes de aprenderla: ¿cuál está bien? (no pasa nada si le errás)",
      stem: f.es,
      options: shuffle([f.it].concat(others)),
      answer: f.it, accept: [f.it], note: f.note
    };
  }

  function pickItem(f, opts) {
    opts = opts || {};
    // Known phrases are asked to be produced more often than recognised:
    // recall is what makes you fast when you talk.
    // Desirable difficulty (Bjork 1994): a phrase seen for the first time is
    // recognised (tiles); once it is known, it has to be produced.
    var kinds = opts.silent ? ["tiles", "cloze", "flash", "write", "write"]
                            : ["tiles", "cloze", "listen", "dictation", "flash", "write", "write"];
    if (opts.fresh) kinds = ["tiles", "tiles", "cloze"];
    var k = kinds[Math.floor(Math.random() * kinds.length)];
    return k === "tiles" ? tilesItem(f) : k === "listen" ? listenItem(f)
         : k === "write" ? writeItem(f) : k === "cloze" ? clozeItem(f)
         : k === "dictation" ? dictationItem(f) : flashItem(f);
  }

  /* Una sesión de escena: primero presenta las frases nuevas, después las
     pone a prueba con tipos de ejercicio distintos. */
  function sceneSession(sceneId, cards, opts) {
    opts = opts || {};
    var list = ofScene(sceneId);
    var fresh = list.filter(function (f) { return !cards[f.id]; });
    var known = list.filter(function (f) { return cards[f.id]; });
    // Six new phrases a session: a scene of 18 closes in three sessions, and
    // each session visibly moves the counter.
    var newOnes = fresh.slice(0, opts.newCount || 6);
    var out = [];
    // Each new phrase appears twice: once to meet it (guessed before being
    // shown, or presented), once to retrieve it.
    newOnes.forEach(function (f, i) {
      out.push(i % 2 === 0 ? guessItem(f) : { id: f.id, frase: f, src: "frasi", type: "intro",
                 prompt: "Frase nueva", stem: f.it, answer: f.it, note: f.note });
    });
    var isNew = {};
    newOnes.forEach(function (f) { isNew[f.id] = true; });
    // Known phrases: the ones due or seen longest ago first.
    var byAge = known.slice().sort(function (a, b) {
      return ((cards[a.id] || {}).due || 0) - ((cards[b.id] || {}).due || 0) + (Math.random() - 0.5) * 86400000;
    });
    var drill = newOnes.concat(byAge.slice(0, Math.max(0, 10 - newOnes.length)));
    shuffle(drill).forEach(function (f) {
      // New ones are recalled by writing them half the time: that is the retrieval.
      out.push(isNew[f.id] && Math.random() < 0.5 ? writeItem(f) : pickItem(f, { silent: opts.silent, fresh: isNew[f.id] }));
    });
    return out;
  }

  // How many phrases of a scene have been seen at least once.
  function progress(sceneId, cards) {
    var list = ofScene(sceneId), seen = 0, strong = 0;
    list.forEach(function (f) {
      var c = cards[f.id];
      if (c) { seen++; if (c.interval >= 3) strong++; }
    });
    return { total: list.length, seen: seen, strong: strong };
  }

  // Phrase of the day: same for the whole calendar day.  With a week, only
  // phrases of scenes already open (no Camões for a beginner).
  function ofTheDay(d, week) {
    d = d || new Date();
    var pool = week ? ALL.filter(function (f) { return f.week <= week; }) : ALL;
    if (!pool.length) pool = ALL;
    var n = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
    return pool[(n * 7919) % pool.length];
  }

  var api = {
    SCENES: SCENES,
    SCENE_WEEK: SCENE_WEEK,
    ALL: ALL,
    BY_ID: BY_ID,
    scene: scene,
    ofScene: ofScene,
    openScenes: openScenes,
    tiles: tiles,
    tileWords: tileWords,
    PROPER: PROPER,
    words: words,
    compare: compare,
    gradeWritten: gradeWritten,
    traps: traps,
    tilesItem: tilesItem,
    listenItem: listenItem,
    similar: similar,
    writeItem: writeItem,
    clozeItem: clozeItem,
    dictationItem: dictationItem,
    guessItem: guessItem,
    flashItem: flashItem,
    pickItem: pickItem,
    sceneSession: sceneSession,
    progress: progress,
    ofTheDay: ofTheDay
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Frasi = api;
})(typeof window !== "undefined" ? window : globalThis);
