/*
 * El laboratorio de Rumo C1: ejercicios construidos sobre resultados de la
 * investigación.
 *
 *  Ponte        — transferencia desde el español: reglas de correspondencia
 *                 entre cognados (Ringbom 2007; Otwinowska 2015).  Quien habla
 *                 español ya conoce miles de palabras portuguesas: alcanza con
 *                 la regla (-ción → -ção, ll- → ch-, la l y la n entre vocales
 *                 que caen…).  Cada regla trae `week`: la semana del temario
 *                 en la que entra en el recorrido.
 *  Falsos amigos — la misma transferencia, donde traiciona (heterosemánticos:
 *                 Grannier 2002; Durão 1999).  Entran en el recorrido en
 *                 FALSI_WEEK.
 *  Capire       — input estructurado (VanPatten & Cadierno 1993; VanPatten
 *                 2004): antes de producir una forma, aprender a
 *                 interpretarla.  Cada ítem se resuelve solo mirando la forma,
 *                 no el contexto (você + 3.ª persona, contracciones, dele/dela,
 *                 gostar de, perfeito/imperfeito, perfeito composto, achar
 *                 que + indicativo, futuro do subjuntivo, infinitivo pessoal).
 *                 Cada set trae `week` (tools/curriculo.py, TENSE_WEEK).
 *
 * Sin dependencias del DOM.
 */
(function (root) {
  "use strict";

  /* ------------------------------------------------------------- ponte */

  // [español, portugués, aceptadas además?]
  var RULES = [
    { id: "cao", week: 2, h: "-ción → -ção",
      body: "Casi todas las palabras en **-ción** tienen gemela portuguesa en **-ção**, femenina, con plural en **-ções**: *a nação, as nações*. **-cción** también da **-ção**: *acción → ação*, *colección → coleção*.",
      ex: [["nación", "nação"], ["canción", "canção"]],
      words: [["nación", "nação"], ["estación", "estação"], ["información", "informação"],
              ["situación", "situação"], ["relación", "relação"], ["educación", "educação"],
              ["solución", "solução"], ["condición", "condição"], ["tradición", "tradição"],
              ["atención", "atenção"], ["acción", "ação"], ["colección", "coleção"]] },

    { id: "dade", week: 3, h: "-dad → -dade",
      body: "Las palabras en **-dad** terminan en **-dade** y son femeninas: *a cidade*, *a liberdade*. Ojo con dos que cambian también la vocal: *edad → idade*, *mitad → metade*.",
      ex: [["ciudad", "cidade"], ["libertad", "liberdade"]],
      words: [["ciudad", "cidade"], ["universidad", "universidade"], ["libertad", "liberdade"],
              ["verdad", "verdade"], ["realidad", "realidade"], ["sociedad", "sociedade"],
              ["calidad", "qualidade"], ["posibilidad", "possibilidade"], ["felicidad", "felicidade"],
              ["dificultad", "dificuldade"], ["novedad", "novidade"], ["edad", "idade"]] },

    { id: "vel", week: 4, h: "-ble → -vel",
      body: "Los adjetivos en **-ble** terminan en **-vel**, con tilde en la sílaba anterior, y hacen el plural en **-veis**: *possível, possíveis*. A veces la s se duplica: *posible → possível*.",
      ex: [["posible", "possível"], ["agradable", "agradável"]],
      words: [["posible", "possível"], ["imposible", "impossível"], ["terrible", "terrível"],
              ["increíble", "incrível"], ["responsable", "responsável"], ["probable", "provável"],
              ["horrible", "horrível"], ["visible", "visível"], ["amable", "amável"],
              ["agradable", "agradável"], ["confortable", "confortável"], ["disponible", "disponível"]] },

    { id: "ditongos", week: 5, h: "ie / ue → e / o",
      body: "Los diptongos del español suelen ser vocales simples en portugués: **ie → e**, **ue → o**. *Tiempo → tempo*, *puerta → porta*. Es la trampa de *pueblo*: en portugués, *povo*.",
      ex: [["tiempo", "tempo"], ["puerta", "porta"]],
      words: [["tiempo", "tempo"], ["fiesta", "festa"], ["tierra", "terra"], ["puerta", "porta"],
              ["cuerpo", "corpo"], ["muerte", "morte"], ["puente", "ponte"], ["fuerte", "forte"],
              ["cierto", "certo"], ["siete", "sete"], ["nuevo", "novo"], ["fuego", "fogo"],
              ["escuela", "escola"], ["piedra", "pedra"]] },

    { id: "ao", week: 6, h: "-ón → -ão",
      body: "La **-ón** final del español es **-ão** en portugués: *razón → razão*, *corazón → coração*. El plural varía: casi siempre **-ões** (*opiniões*), pero *mão → mãos*, *pão → pães*.",
      ex: [["razón", "razão"], ["corazón", "coração"]],
      words: [["razón", "razão"], ["corazón", "coração"], ["opinión", "opinião"],
              ["región", "região"], ["religión", "religião"], ["unión", "união"],
              ["avión", "avião"], ["limón", "limão"], ["balcón", "balcão"],
              ["ladrón", "ladrão"], ["algodón", "algodão"], ["millón", "milhão"]] },

    { id: "nh", week: 7, h: "ñ → nh",
      body: "El portugués no tiene **ñ**: el mismo sonido se escribe **nh**. *España → Espanha*, *señor → senhor*. (Y a veces la ñ es solo **n**: *año → ano*, *pequeño → pequeno*.)",
      ex: [["señor", "senhor"], ["montaña", "montanha"]],
      words: [["señor", "senhor"], ["España", "Espanha"], ["montaña", "montanha"],
              ["compañía", "companhia"], ["extraño", "estranho"], ["baño", "banho"],
              ["uña", "unha"], ["tamaño", "tamanho"], ["campaña", "campanha"],
              ["araña", "aranha"], ["castaño", "castanho"], ["sueño", "sonho"]] },

    { id: "lh", week: 8, h: "ll / j → lh",
      body: "El sonido **lh** (parecido a la «ll» de quien la distingue de la «y») aparece donde el español tiene **ll** (*batalla → batalha*) y, muchas veces, **j**: *trabajo → trabalho*, *ojo → olho*, *mujer → mulher*.",
      ex: [["trabajo", "trabalho"], ["medalla", "medalha"]],
      words: [["batalla", "batalha"], ["medalla", "medalha"], ["maravilla", "maravilha"],
              ["orgullo", "orgulho"], ["detalle", "detalhe"], ["toalla", "toalha"],
              ["trabajo", "trabalho"], ["ojo", "olho"], ["mujer", "mulher"],
              ["consejo", "conselho"], ["espejo", "espelho"], ["mejor", "melhor"],
              ["abeja", "abelha"], ["ajo", "alho"]] },

    { id: "efe", week: 9, h: "h- → f-",
      body: "La **h-** inicial del español viene de una **f** latina que el portugués conservó: *hacer → fazer*, *hablar → falar*, *hijo → filho*.",
      ex: [["hablar", "falar"], ["harina", "farinha"]],
      words: [["hacer", "fazer"], ["hablar", "falar"], ["harina", "farinha"], ["hierro", "ferro"],
              ["hijo", "filho"], ["hoja", "folha"], ["hambre", "fome"], ["hormiga", "formiga"],
              ["higo", "figo"], ["horno", "forno"], ["hervir", "ferver"], ["herida", "ferida"]] },

    { id: "ch", week: 10, h: "ll- / pl- / cl- / fl- → ch- / pr- / cr- / fr-",
      body: "La **ll-** inicial del español suele ser **ch-**: *llamar → chamar*, *lleno → cheio*. Y la **l** después de consonante se vuelve **r**: *plaza → praça*, *blanco → branco*, *flaco → fraco*, *iglesia → igreja*.",
      ex: [["llave", "chave"], ["playa", "praia"]],
      words: [["lleno", "cheio"], ["llamar", "chamar"], ["llave", "chave"], ["llover", "chover"],
              ["llorar", "chorar"], ["llegar", "chegar"], ["plaza", "praça"], ["playa", "praia"],
              ["plato", "prato"], ["plata", "prata"], ["placer", "prazer"], ["plazo", "prazo"],
              ["blanco", "branco"], ["flaco", "fraco"], ["iglesia", "igreja"], ["regla", "regra"]] },

    { id: "ele", week: 11, h: "La l entre vocales cae",
      body: "En portugués la **l** latina entre vocales desapareció: *salir → sair*, *volar → voar*, *color → cor*, *dolor → dor*, *cielo → céu*. Por eso *malo* es *mau* y *solo* (solamente) es *só*. Hay excepciones cultas: *calor*, *vela*.",
      ex: [["salir", "sair"], ["color", "cor"]],
      words: [["color", "cor"], ["dolor", "dor"], ["volar", "voar"], ["salir", "sair"],
              ["salud", "saúde"], ["cielo", "céu"], ["palo", "pau"], ["malo", "mau"],
              ["solo (solamente)", "só"], ["polvo", "pó"], ["doler", "doer"], ["vuelo", "voo"]] },

    { id: "ene", week: 12, h: "La n entre vocales cae",
      body: "También la **n** entre vocales cayó, muchas veces dejando la vocal nasal: *mano → mão*, *hermano → irmão*, *lana → lã*. Otras veces no queda rastro: *luna → lua*, *persona → pessoa*, *tener → ter*.",
      ex: [["luna", "lua"], ["mano", "mão"]],
      words: [["luna", "lua"], ["mano", "mão"], ["persona", "pessoa"], ["buena", "boa"],
              ["lana", "lã"], ["hermano", "irmão"], ["tener", "ter"], ["poner", "pôr"],
              ["venir", "vir"], ["arena", "areia"], ["cadena", "cadeia"], ["ballena", "baleia"],
              ["moneda", "moeda"], ["corona", "coroa"]] },

    { id: "it", week: 13, h: "-ch- → -it-",
      body: "Donde el español tiene **ch** (del latín *ct*), el portugués tiene **it**: *noche → noite*, *leche → leite*, *ocho → oito*, *hecho → feito*, *mucho → muito*.",
      ex: [["noche", "noite"], ["leche", "leite"]],
      words: [["noche", "noite"], ["leche", "leite"], ["hecho", "feito"], ["ocho", "oito"],
              ["pecho", "peito"], ["derecho", "direito"], ["estrecho", "estreito"], ["mucho", "muito"],
              ["satisfecho", "satisfeito"], ["provecho", "proveito"]] },

    { id: "ou", week: 14, h: "o → ou / oi",
      body: "Muchas **o** del español son **ou** en portugués (del latín *au*): *oro → ouro*, *otro → outro*, *poco → pouco*. Y a veces **oi**: *cosa → coisa*.",
      ex: [["oro", "ouro"], ["poco", "pouco"]],
      words: [["oro", "ouro"], ["toro", "touro"], ["otro", "outro"], ["poco", "pouco"],
              ["loco", "louco"], ["tesoro", "tesouro"], ["robar", "roubar"], ["otoño", "outono"],
              ["dorado", "dourado"], ["cosa", "coisa"]] },

    { id: "ss", week: 16, h: "-s- → -ss-; -sión → -ssão",
      body: "Entre vocales, la **s** sorda se escribe **ss** (la **s** sola suena como z: *casa*). Por eso *pasar → passar*, *clásico → clássico*, *-sión → -ssão* y *-ísimo → -íssimo*.",
      ex: [["pasar", "passar"], ["misión", "missão"]],
      words: [["pasar", "passar"], ["clásico", "clássico"], ["necesario", "necessário"],
              ["masa", "massa"], ["esencial", "essencial"], ["misión", "missão"],
              ["sesión", "sessão"], ["expresión", "expressão"], ["impresión", "impressão"],
              ["discusión", "discussão"], ["lindísimo", "lindíssimo"], ["riquísimo", "riquíssimo"]] },

    { id: "agem", week: 17, h: "-aje → -agem",
      body: "Las palabras en **-aje** pasan a **-agem** y son **femeninas**: *el viaje → a viagem*, *el mensaje → a mensagem*. Plural en **-agens**.",
      ex: [["viaje", "viagem"], ["mensaje", "mensagem"]],
      words: [["viaje", "viagem"], ["mensaje", "mensagem"], ["paisaje", "paisagem"],
              ["coraje", "coragem"], ["personaje", "personagem"], ["pasaje", "passagem"],
              ["garaje", "garagem"], ["lenguaje", "linguagem"], ["homenaje", "homenagem"],
              ["masaje", "massagem"], ["aprendizaje", "aprendizagem"], ["porcentaje", "porcentagem", ["percentagem"]]] },

    { id: "tude", week: 20, h: "-tud → -tude / -dão",
      body: "La **-tud** del español da **-tude** (*actitud → atitude*, *juventud → juventude*) o **-dão**, femenino (*multitud → multidão*, *esclavitud → escravidão*). *Soledad* también: *solidão*.",
      ex: [["juventud", "juventude"], ["multitud", "multidão"]],
      words: [["actitud", "atitude"], ["juventud", "juventude"], ["virtud", "virtude"],
              ["amplitud", "amplitude"], ["latitud", "latitude"], ["inquietud", "inquietude"],
              ["multitud", "multidão"], ["esclavitud", "escravidão"], ["gratitud", "gratidão"],
              ["soledad", "solidão"]] }
  ];

  /* -------------------------------------------------------- falsos amigos */

  // Semana en que los falsos amigos entran en el recorrido.
  var FALSI_WEEK = 14;

  // [portugués, lo que significa de verdad, la trampa que parece, nota]
  var FALSI = [
    ["esquisito", "raro, extraño", "exquisito", "Exquisito (rico) = *delicioso*, *gostoso*."],
    ["polvo", "pulpo", "polvo (tierra)", "El polvo es *poeira* o *pó*."],
    ["borracha", "goma de borrar; caucho", "borracha (ebria)", "Ebria = *bêbada*."],
    ["apelido", "apodo", "apellido", "El apellido es *sobrenome*."],
    ["sobrenome", "apellido", "sobrenombre, apodo", "El apodo es *apelido*."],
    ["oficina", "taller mecánico", "oficina", "La oficina es *escritório*."],
    ["escritório", "oficina", "escritorio (mueble)", "El mueble es *escrivaninha*."],
    ["embaraçada", "avergonzada; enredada", "embarazada", "Embarazada = *grávida*."],
    ["largo", "ancho", "largo", "Largo = *comprido*, *longo*. En Río, *largo* es también una plazoleta: *Largo do Machado*."],
    ["pelado", "desnudo", "pelado (sin pelo)", "Sin pelo = *careca*."],
    ["cena", "escena", "cena (comida)", "La cena es *o jantar*."],
    ["sobremesa", "postre", "sobremesa (charla)", "La charla después de comer: *papo depois do almoço*."],
    ["ninho", "nido", "niño", "El niño es *menino* o *criança*."],
    ["rato", "ratón", "rato (momento)", "Un rato = *um pouco*, *um tempinho*."],
    ["taça", "copa (de vino); trofeo", "taza", "La taza es *xícara*."],
    ["copo", "vaso (para beber)", "copo (de nieve)", "El copo de nieve es *floco de neve*."],
    ["vaso", "maceta; inodoro", "vaso (para beber)", "El vaso es *copo*. *Vaso sanitário* = inodoro."],
    ["salada", "ensalada", "salada (con sal)", "Salado = *salgado*."],
    ["cachorro", "perro", "cachorro (cría)", "La cría = *filhote*."],
    ["tirar", "sacar, quitar", "tirar (arrojar)", "*Tirar uma foto* = sacar una foto. Arrojar = *jogar*."],
    ["pegar", "agarrar; tomar (un transporte)", "pegar (golpear)", "Golpear = *bater*. *Pegar o ônibus* = tomar el colectivo."],
    ["fechar", "cerrar", "fechar (poner fecha)", "Poner fecha = *datar*."],
    ["contestar", "cuestionar, impugnar", "contestar (responder)", "Responder = *responder*."],
    ["acordar", "despertar(se)", "acordar (ponerse de acuerdo)", "Ponerse de acuerdo = *combinar*, *concordar*."],
    ["assinatura", "firma; suscripción", "asignatura", "La asignatura = *matéria*, *disciplina*."],
    ["presunto", "jamón", "presunto (supuesto)", "Supuesto = *suposto*."],
    ["cadeira", "silla", "cadera", "La cadera = *quadril*."],
    ["cola", "pegamento", "cola (fila, rabo)", "La fila es *fila*; el rabo, *rabo* o *cauda*."],
    ["garrafa", "botella", "garrafa (de gas)", "La garrafa de gas = *botijão*."],
    ["berro", "grito", "berro (verdura)", "El berro = *agrião*."],
    ["brincar", "jugar (los chicos); bromear", "brincar (saltar)", "Saltar = *pular*."],
    ["engraçado", "gracioso, divertido", "engrasado", "Engrasado = *engordurado*."],
    ["latido", "ladrido", "latido (del corazón)", "El latido = *batimento*."],
    ["criança", "niño, niña", "crianza", "La crianza = *criação*."],
    ["propina", "soborno, coima", "propina", "La propina = *gorjeta*."],
    ["prejuízo", "pérdida, daño", "prejuicio", "Prejuicio = *preconceito*."],
    ["balcão", "mostrador, barra", "balcón", "El balcón = *sacada* o *varanda*."],
    ["bolsa", "cartera (de mujer); beca", "bolsa (de plástico)", "La bolsa de las compras = *sacola*. *Bolsa de estudos* = beca."],
    ["carteira", "billetera; carnet", "cartera (de mujer)", "*Carteira de motorista* = registro de conducir."],
    ["camelô", "vendedor ambulante", "camello", "El camello = *camelo*."],
    ["chato", "pesado, aburrido", "chato (plano)", "Plano = *achatado*."],
    ["desenvolver", "desarrollar", "desenvolver (abrir un paquete)", "Abrir un paquete = *desembrulhar*."],
    ["exprimir", "expresar", "exprimir (sacar el jugo)", "Exprimir = *espremer*."],
    ["mala", "valija", "mala (femenino de malo)", "Mala = *má*."],
    ["novela", "telenovela", "novela (libro)", "La novela es *romance*."],
    ["romance", "novela (libro)", "romance (amorío)", "*Um romance de Machado* es una novela; también puede ser un amorío."],
    ["aula", "clase", "aula (salón)", "El aula = *sala de aula*."],
    ["batata", "papa", "batata (boniato)", "El boniato = *batata-doce*."],
    ["sucesso", "éxito", "suceso", "Un suceso = *acontecimento*."],
    ["talher", "cubierto", "taller", "El taller = *oficina*."],
    ["surdo", "sordo", "zurdo", "Zurdo = *canhoto*."],
    ["esperto", "vivo, astuto", "experto", "Experto = *especialista*, *perito*."],
    ["puxar", "tirar (hacia vos)", "empujar", "Empujar = *empurrar*. En las puertas: *puxe* / *empurre*."],
    ["escova", "cepillo", "escoba", "La escoba = *vassoura*."],
    ["conserto", "arreglo, reparación", "concierto", "El concierto = *concerto*, con c."],
    ["ruivo", "pelirrojo", "rubio", "Rubio = *loiro*."],
    ["roxo", "violeta, morado", "rojo", "Rojo = *vermelho*."],
    ["firma", "empresa", "firma (autógrafo)", "La firma = *assinatura*."],
    ["lograr", "engañar, estafar", "lograr (conseguir)", "Lograr = *conseguir*."],
    ["largar", "soltar, dejar", "largar (lanzar)", "*Largar o emprego* = dejar el trabajo."],
    ["morada", "vivienda", "morada (color)", "Morado = *roxo*."],
    ["pronto", "listo", "pronto (enseguida)", "Pronto = *logo*, *em breve*."],
    ["sítio", "finca, casa de campo", "sitio (lugar)", "Un lugar = *lugar*, *local*; el sitio web, *site*."],
    ["tapa", "cachetada", "tapa (de olla)", "La tapa = *tampa*."],
    ["todavia", "sin embargo", "todavía", "Todavía = *ainda*."],
    ["borrar", "manchar, emborronar", "borrar", "Borrar = *apagar*."],
    ["gordura", "grasa", "gordura (obesidad)", "La obesidad = *obesidade*."],
    ["pasta", "carpeta; pasta (de dientes)", "pasta (fideos)", "Los fideos = *macarrão*, *massa*."],
    ["salsa", "perejil", "salsa", "La salsa = *molho*."],
    ["sótão", "altillo, desván", "sótano", "El sótano = *porão*."],
    ["vaga", "vacante; lugar para estacionar", "vaga (perezosa)", "Perezoso = *preguiçoso*."],
    ["palestra", "charla, conferencia", "palestra (lugar de combate)", "*Dar uma palestra* = dar una charla."],
    ["fantasia", "disfraz", "fantasía (imaginación)", "*Fantasia de carnaval* = disfraz. También significa fantasía."],
    ["pastel", "empanada frita", "pastel (torta)", "La torta = *bolo*."],
    ["doce", "dulce", "doce (número)", "El número doce = *doze*."],
    ["aborrecido", "molesto, fastidiado", "aburrido", "Aburrido = *entediado*."],
    ["espantoso", "asombroso", "espantoso (horrible)", "Muchas veces es un elogio: *um resultado espantoso*."],
    ["estofado", "tapizado", "estofado (guiso)", "El guiso = *ensopado*."],
    ["cinto", "cinturón", "cinta", "La cinta = *fita*."],
    ["pipa", "barrilete, cometa", "pipa (para fumar)", "En Río los chicos *soltam pipa* desde las terrazas."],
    ["aceitar", "aceptar", "aceitar (poner aceite)", "El aceite de oliva es *azeite*."],
    ["calçada", "vereda", "calzada", "La calzada = *pista*, *rua*. El *calçadão* es la vereda ancha frente a la playa."],
    ["prender", "arrestar; sujetar", "prender (encender)", "Encender = *acender*, *ligar*."],
    ["cigarro", "cigarrillo", "cigarro (habano)", "El habano = *charuto*."],
    ["cueca", "calzoncillo", "cueca (danza)", "En Brasil *cueca* es ropa interior."],
    ["boleto", "boleta de pago", "boleto (pasaje)", "El pasaje = *passagem*; la entrada, *ingresso*."],
    ["ingresso", "entrada (para un show)", "ingreso (dinero)", "El ingreso de dinero = *renda*."],
    ["rascunho", "borrador", "rasguño", "El rasguño = *arranhão*."],
    ["rapaz", "muchacho", "rapaz (ave, ladrón)", "*Rapaz* es un chico joven."],
    ["mexer", "tocar; revolver", "mecer", "Mecer = *balançar*. *Não mexe nisso!* = ¡No toques eso!"],
    ["brinco", "aro (joya)", "brinco (salto)", "El salto = *pulo*."],
    ["palco", "escenario", "palco (en el teatro)", "El palco = *camarote*."],
    ["abono", "bono, plus salarial", "abono (fertilizante)", "El fertilizante = *adubo*."],
    ["quitar", "saldar (una deuda)", "quitar (sacar)", "Sacar = *tirar*."],
    ["assistir", "ver (un programa, una película)", "asistir (ayudar)", "*Assistir TV* = mirar tele. Ayudar = *ajudar*."],
    ["aposentado", "jubilado", "aposentado (alojado)", "*Aposentadoria* = jubilación."],
    ["seta", "flecha; luz de giro", "seta (hongo)", "El hongo = *cogumelo*."],
    ["namorar", "estar de novio con", "enamorar", "Enamorar = *conquistar*. *Namorar* va sin preposición: *namoro a Bia*."],
    ["noivo", "prometido; novio (en la boda)", "novio (de todos los días)", "El novio de todos los días es *namorado*."],
    ["vitamina", "licuado (de fruta con leche)", "vitamina (nutriente)", "*Uma vitamina de banana* = un licuado de banana."],
    ["batida", "cóctel de cachaça con fruta; choque", "batido (licuado)", "El licuado = *vitamina*."],
    ["bilhete", "nota, mensaje escrito", "billete (dinero)", "El billete = *nota* o *cédula*."],
    ["legal", "copado, buena onda", "legal (según la ley)", "*Que legal!* = ¡qué bueno! También significa «legal»."]
  ];

  /* ------------------------------------------------------------- capire */

  // Cada set: una explicación breve (información explícita, como pide la
  // Processing Instruction) e ítems que se resuelven solo leyendo la forma.
  // Un tercer elemento en el ítem es la semana desde la que se muestra.
  var P = ["yo", "nosotros (o a gente)", "él / ella / você", "ellos / ellas / vocês"];
  var T = ["ya pasó (una vez)", "pasaba siempre (antes)", "pasa ahora / siempre", "va a pasar"];
  var G = ["a Ana le gusta João", "a João le gusta Ana"];
  var F = ["ya pasó", "pasa siempre (hábito)", "todavía no pasó"];
  var I = ["nosotros", "ellos / ellas / vocês", "en general (nadie en particular)"];
  var CAPIRE = [
    { id: "persona", week: 5, h: "¿Quién lo hace?",
      body: "La terminación dice quién: **-o** = eu; **-a / -e** = ele, ela y también **você**; **-amos / -emos / -imos** = nós; **-am / -em** = eles, elas y **vocês**. *A gente* (= nosotros) va con el verbo en singular.",
      q: "¿Quién hace la acción?",
      opts: P,
      items: [["Moro em Copacabana.", P[0]], ["Moramos em Copacabana.", P[1]],
              ["Moram em Copacabana.", P[3]], ["Mora em Copacabana?", P[2]],
              ["Falo espanhol em casa.", P[0]], ["Fala espanhol em casa?", P[2]],
              ["Falam espanhol em casa.", P[3]], ["Falamos espanhol em casa.", P[1]],
              ["A gente trabalha muito.", P[1]], ["Trabalha muito?", P[2]],
              ["Trabalham muito.", P[3]], ["Trabalho muito.", P[0]],
              ["Estuda português?", P[2]], ["A gente estuda português.", P[1]],
              ["Estudam português.", P[3]], ["Estudo português.", P[0]]] },

    { id: "contracao", week: 3, h: "¿Qué preposición hay adentro?",
      body: "Las contracciones son obligatorias: **no, na, nos, nas, num, numa** = *em* + artículo; **do, da** = *de* + artículo; **ao, à** = *a* + artículo; **pelo, pela** = *por* + artículo. Leé la contracción y sabés la preposición.",
      q: "¿Qué preposición está dentro de la contracción?",
      opts: ["em (en)", "de", "a", "por"],
      items: [["Moro no Leblon.", "em (en)"], ["Venho do Leblon.", "de"],
              ["Vou ao Leblon.", "a"], ["Passo pelo Leblon.", "por"],
              ["Estou na praia.", "em (en)"], ["Volto da praia.", "de"],
              ["Vou à praia.", "a"], ["Passeio pela praia.", "por"],
              ["O livro está na mesa.", "em (en)"], ["Gosto do Rio.", "de"],
              ["Andamos pelas ruas de Santa Teresa.", "por"], ["Moro num apartamento pequeno.", "em (en)"],
              ["Mando um beijo às meninas.", "a"]] },

    { id: "dele", week: 10, h: "¿De quién es?",
      body: "*dele, dela, deles, delas* = de + ele, ela, eles, elas. El género y el número son **del dueño**, no de la cosa: *o carro dela* = el auto de ella. Van después del sustantivo.",
      q: "¿De quién es?",
      opts: ["de él", "de ella", "de ellos", "de ellas"],
      items: [["O carro dele é azul.", "de él"], ["O carro dela é azul.", "de ella"],
              ["O carro deles é azul.", "de ellos"], ["O carro delas é azul.", "de ellas"],
              ["A casa dela fica em Botafogo.", "de ella"], ["A casa deles fica em Botafogo.", "de ellos"],
              ["A casa dele fica em Botafogo.", "de él"], ["A casa delas fica em Botafogo.", "de ellas"],
              ["Os filhos dele moram em Recife.", "de él"], ["Os filhos delas moram em Recife.", "de ellas"],
              ["As amigas dela são cariocas.", "de ella"], ["As amigas deles são cariocas.", "de ellos"]] },

    { id: "gostar", week: 14, h: "¿A quién le gusta quién?",
      body: "Al revés que *gustar*: en *gostar de* el sujeto es **el que siente**, y lo que gusta va después de **de** (*do, da*). Mirá quién va con *de*: esa es la persona que gusta.",
      q: "¿Qué dice la oración?",
      opts: G,
      items: [["A Ana gosta do João.", G[0]], ["O João gosta da Ana.", G[1]],
              ["Quem gosta do João é a Ana.", G[0]], ["Quem gosta da Ana é o João.", G[1]],
              ["É do João que a Ana gosta.", G[0]], ["É da Ana que o João gosta.", G[1]],
              ["Do João, a Ana gosta muito.", G[0]], ["Da Ana, o João gosta muito.", G[1]],
              ["A Ana sempre gostou do João.", G[0]], ["O João sempre gostou da Ana.", G[1]]] },

    { id: "tempo", week: 15, h: "¿Cuándo pasa?",
      body: "Leé el tiempo en el verbo: *comeu* = pasó y terminó; *comia* = pasaba siempre, era así; *come* = pasa ahora o siempre; *vai comer* / *comerá* = va a pasar.",
      q: "¿Cuándo pasa?",
      opts: T,
      items: [["O Martín comeu feijoada.", T[0]], ["O Martín comia feijoada.", T[1]],
              ["O Martín come feijoada.", T[2]], ["O Martín vai comer feijoada.", T[3]],
              ["A Bia trabalhava num bar.", T[1]], ["A Bia trabalhou num bar.", T[0]],
              ["A Bia vai trabalhar num bar.", T[3]],
              ["A gente ia à praia.", T[1]], ["A gente foi à praia.", T[0]],
              ["Saio com os amigos.", T[2]], ["Saía com os amigos.", T[1]], ["Saí com os amigos.", T[0]],
              // futuro simple: desde la semana 17
              ["A gente irá à praia.", T[3], 17], ["Sairei com os amigos.", T[3], 17],
              ["O Martín comerá feijoada.", T[3], 17]] },

    { id: "cortesia", week: 18, h: "¿Pedido cortés o directo?",
      body: "El **futuro do pretérito** (*gostaria, poderia, seria, deveria*) y el imperfeito de cortesía (*queria*) suavizan: es la forma educada de pedir en un restaurante o en un mail. El presente (*quero, pode*) es más directo; con desconocidos, *quero* puede sonar brusco.",
      q: "¿Cómo suena?",
      opts: ["cortés / suave", "directo"],
      items: [["Eu queria um café.", "cortés / suave"], ["Eu quero um café.", "directo"],
              ["Poderia repetir?", "cortés / suave"], ["Pode repetir?", "directo"],
              ["Você me daria uma mão?", "cortés / suave"], ["Me dá uma mão?", "directo"],
              ["Seria possível trocar?", "cortés / suave"], ["É possível trocar?", "directo"],
              ["Eu gostaria de uma informação.", "cortés / suave"], ["Preciso de uma informação.", "directo"],
              ["Você deveria descansar.", "cortés / suave"], ["Você tem que descansar.", "directo"]] },

    { id: "composto", week: 21, h: "¿Una vez o viene pasando?",
      body: "*Tenho estudado* no es «he estudiado»: es algo que **se viene repitiendo hasta hoy** («vengo estudiando»). Lo que pasó, una vez o ya terminado, va en perfeito simple: *estudei* («estudié» y también «he estudiado»).",
      q: "¿Qué dice el verbo?",
      opts: ["pasó y terminó", "viene pasando hasta hoy"],
      items: [["Estudei muito.", "pasó y terminó"], ["Tenho estudado muito.", "viene pasando hasta hoy"],
              ["Ela trabalhou em casa.", "pasó y terminó"], ["Ela tem trabalhado em casa.", "viene pasando hasta hoy"],
              ["Choveu no Rio.", "pasó y terminó"], ["Tem chovido no Rio.", "viene pasando hasta hoy"],
              ["A gente se viu pouco.", "pasó y terminó"], ["A gente tem se visto pouco.", "viene pasando hasta hoy"],
              ["Li muitos livros.", "pasó y terminó"], ["Tenho lido muitos livros.", "viene pasando hasta hoy"],
              ["Eles saíram bastante.", "pasó y terminó"], ["Eles têm saído bastante.", "viene pasando hasta hoy"]] },

    { id: "certeza", week: 23, h: "¿Hecho o deseo?",
      body: "Con *acho que, acredito que, sei que, tenho certeza de que, parece que* va **indicativo**: el hablante lo da por cierto o lo cree (ojo: en portugués *acho que* no pide subjuntivo). Con *espero que, quero que, duvido que, talvez, tomara que, é possível que, não acho que* va **subjuntivo**.",
      q: "¿Cómo lo presenta el hablante?",
      opts: ["como un hecho o algo que cree", "como deseo, duda o posibilidad"],
      items: [["Acho que ele vem.", "como un hecho o algo que cree"], ["Não acho que ele venha.", "como deseo, duda o posibilidad"],
              ["Sei que é tarde.", "como un hecho o algo que cree"], ["Duvido que seja tarde.", "como deseo, duda o posibilidad"],
              ["Espero que ela goste.", "como deseo, duda o posibilidad"], ["Tenho certeza de que ela gosta.", "como un hecho o algo que cree"],
              ["Talvez ele saiba.", "como deseo, duda o posibilidad"], ["É óbvio que ele sabe.", "como un hecho o algo que cree"],
              ["Quero que você fique.", "como deseo, duda o posibilidad"], ["É possível que chova.", "como deseo, duda o posibilidad"],
              ["Parece que vai chover.", "como un hecho o algo que cree"], ["Tomara que faça sol.", "como deseo, duda o posibilidad"],
              ["Acredito que faz sol lá.", "como un hecho o algo que cree"]] },

    { id: "futsubj", week: 27, h: "¿Ya pasó o todavía no?",
      body: "*Quando, se, assim que, sempre que* + **futuro do subjuntivo** (*vier, tiver, puder, fizer*) = algo que **todavía no pasó** («cuando venga»). Con presente (*vem*) es un hábito; con perfeito (*veio*), ya pasó.",
      q: "¿Qué dice la oración?",
      opts: F,
      items: [["Quando ela vem ao Rio, fica em Santa Teresa.", F[1]],
              ["Quando ela vier ao Rio, vai ficar em Santa Teresa.", F[2]],
              ["Quando ela veio ao Rio, ficou em Santa Teresa.", F[0]],
              ["Quando eu tenho tempo, leio.", F[1]], ["Quando eu tiver tempo, vou ler.", F[2]],
              ["Quando eu tive tempo, li.", F[0]],
              ["Sempre que eles podem, viajam.", F[1]], ["Assim que eles puderem, vão viajar.", F[2]],
              ["Assim que eles puderam, viajaram.", F[0]],
              ["Quando a gente faz feijoada, chama os amigos.", F[1]],
              ["Quando a gente fizer feijoada, vai chamar os amigos.", F[2]],
              ["Quando a gente fez feijoada, chamou os amigos.", F[0]]] },

    { id: "infpessoal", week: 29, h: "¿Quién, en el infinitivo?",
      body: "El **infinitivo pessoal** lleva la persona en la terminación: **-mos** = nós, **-em** = eles, elas, vocês. Sin terminación, el infinitivo es general: nadie en particular.",
      q: "¿Quién hace lo que dice el infinitivo?",
      opts: I,
      items: [["Antes de sairmos, vamos jantar.", I[0]], ["Antes de saírem, vão jantar.", I[1]],
              ["Antes de sair, é bom jantar.", I[2]],
              ["É importante chegarmos cedo.", I[0]], ["É importante chegarem cedo.", I[1]],
              ["É importante chegar cedo.", I[2]],
              ["Depois de estudarmos, fomos à praia.", I[0]], ["Depois de estudarem, foram à praia.", I[1]],
              ["Sem conhecermos a cidade, nos perdemos.", I[0]], ["Sem conhecerem a cidade, se perderam.", I[1]],
              ["Estudar línguas abre portas.", I[2]], ["Viver no Rio é caro.", I[2]]] }
  ];

  /* -------------------------------------------------------- generadores */

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var BY_ID = {};

  RULES.forEach(function (r) {
    r.words.forEach(function (w, i) {
      var it = {
        id: "ponte:" + r.id + ":" + i, src: "lab", lab: "ponte", group: r.id, week: r.week,
        type: "cloze",
        prompt: "Pasalo al portugués (regla " + r.h + ")",
        stem: w[0] + " → ___",
        answer: w[1],
        accept: [w[1]].concat(w[2] || []),
        note: "Regla: **" + r.h + "**"
      };
      BY_ID[it.id] = it;
    });
  });

  FALSI.forEach(function (f, i) {
    var others = FALSI.filter(function (g) { return g !== f; });
    var it = {
      id: "falso:" + i, src: "lab", lab: "falsi", type: "choice",
      prompt: "¿Qué significa en portugués?",
      stem: f[0],
      // Options are rebuilt on every draw (see item()), this is the template.
      answer: f[1], accept: [f[1]], trap: f[2],
      note: f[3],
      pool: others.map(function (g) { return g[1]; })
    };
    BY_ID[it.id] = it;
  });

  CAPIRE.forEach(function (s) {
    s.items.forEach(function (x, i) {
      var it = {
        id: "capire:" + s.id + ":" + i, src: "lab", lab: "capire", group: s.id, week: x[2] || s.week,
        type: "choice", prompt: s.q, stem: x[0],
        options: s.opts.slice(), answer: x[1], accept: [x[1]],
        note: s.h + " — " + s.body.replace(/\*\*/g, "")
      };
      BY_ID[it.id] = it;
    });
  });

  // A fresh copy of an item, ready to play (false friends get new options).
  function item(id) {
    var base = BY_ID[id];
    if (!base) return null;
    var it = {};
    Object.keys(base).forEach(function (k) { it[k] = base[k]; });
    if (base.lab === "falsi") {
      var opts = [base.answer, base.trap];
      shuffle(base.pool).forEach(function (o) {
        if (opts.length < 4 && opts.indexOf(o) < 0) opts.push(o);
      });
      it.options = shuffle(opts);
      delete it.pool;
    }
    if (base.lab === "capire") it.options = base.options.slice();
    return it;
  }

  function card(h, body, ex) {
    return { id: "card:" + h, src: "lab", type: "card", prompt: "La regla", h: h,
             stem: h, body: body, ex: ex || [], answer: "" };
  }

  function ids(prefix) {
    return Object.keys(BY_ID).filter(function (k) { return k.indexOf(prefix) === 0; });
  }

  // The group with the fewest cards already seen goes first.
  function freshestGroup(groups, prefix, cards) {
    var best = null, bestSeen = 1e9;
    groups.forEach(function (g) {
      var seen = ids(prefix + g.id + ":").filter(function (k) { return cards[k]; }).length;
      if (seen < bestSeen) { best = g; bestSeen = seen; }
    });
    return best;
  }

  // The Ponte rules already reached in a given week (all of them without one).
  function ponteOpen(week) {
    return RULES.filter(function (r) { return !week || r.week <= week; });
  }

  /* Ponte: la regla, después sus palabras, después dos palabras de reglas
     ya vistas (intercalar: Rohrer & Taylor 2007). */
  function ponteSession(cards, groupId, week) {
    var g = groupId ? RULES.filter(function (r) { return r.id === groupId; })[0]
                    : freshestGroup(ponteOpen(week).length ? ponteOpen(week) : RULES.slice(0, 1), "ponte:", cards);
    var out = [card(g.h, g.body, g.ex)];
    // The words not yet seen first: every session moves the rule forward.
    var all = ids("ponte:" + g.id + ":");
    shuffle(all.filter(function (k) { return !cards[k]; })).concat(shuffle(all.filter(function (k) { return cards[k]; })))
      .slice(0, 8).forEach(function (k) { out.push(item(k)); });
    var otherSeen = ids("ponte:").filter(function (k) {
      return cards[k] && k.indexOf("ponte:" + g.id + ":") !== 0;
    });
    shuffle(otherSeen).slice(0, 2).forEach(function (k) { out.push(item(k)); });
    return out;
  }

  function falsiSession(cards) {
    var all = ids("falso:");
    var unseen = shuffle(all.filter(function (k) { return !cards[k]; }));
    var seen = shuffle(all.filter(function (k) { return cards[k]; }));
    return unseen.concat(seen).slice(0, 10).map(item);
  }

  /* Cada set de Capire lee una forma que el curso enseña en una semana
     dada (el perfeito composto, el futuro do subjuntivo): antes, cerrado. */
  function capireOpen(week) {
    return CAPIRE.filter(function (s) { return !week || s.week <= week; });
  }

  function capireSession(cards, groupId, week) {
    var open = capireOpen(week);
    if (!open.length) return [];
    var g = groupId ? CAPIRE.filter(function (s) { return s.id === groupId; })[0]
                    : freshestGroup(open, "capire:", cards);
    var out = [card(g.h, g.body)];
    var pool = ids("capire:" + g.id + ":").filter(function (k) { return !week || BY_ID[k].week <= week; });
    // unseen first, then the rest
    shuffle(pool.filter(function (k) { return !cards[k]; })).concat(shuffle(pool.filter(function (k) { return cards[k]; })))
      .slice(0, 10).forEach(function (k) { out.push(item(k)); });
    return out;
  }

  function progress(prefix, cards) {
    var all = ids(prefix);
    return { total: all.length, seen: all.filter(function (k) { return cards[k]; }).length };
  }

  // One random item for interleaving into the coffee break.
  function randomItem(cards, week) {
    var pool = Object.keys(BY_ID).filter(function (k) {
      if (week && k.indexOf("falso:") === 0) return week >= FALSI_WEEK || !!cards[k];
      return !week || !BY_ID[k].week || BY_ID[k].week <= week;
    });
    if (!pool.length) pool = ids("ponte:" + RULES[0].id + ":");
    var seen = pool.filter(function (k) { return cards[k]; });
    var src = seen.length >= 6 && Math.random() < 0.5 ? seen : pool;
    var id = src[Math.floor(Math.random() * src.length)];
    // Don't drop a ponte word without its rule on a newcomer: prefer seen ones.
    if (id.indexOf("ponte:") === 0 && !cards[id] && seen.length) {
      id = seen[Math.floor(Math.random() * seen.length)];
    }
    return item(id);
  }

  var api = {
    RULES: RULES,
    FALSI: FALSI,
    FALSI_WEEK: FALSI_WEEK,
    CAPIRE: CAPIRE,
    BY_ID: BY_ID,
    item: item,
    ponteSession: ponteSession,
    ponteOpen: ponteOpen,
    falsiSession: falsiSession,
    capireSession: capireSession,
    capireOpen: capireOpen,
    progress: progress,
    randomItem: randomItem
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Lab = api;
})(typeof window !== "undefined" ? window : globalThis);
