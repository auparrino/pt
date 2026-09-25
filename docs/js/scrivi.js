/* Scrivi: la misión semanal de producción libre.
 *
 * Cada semana (menos las de jefe: 13, 26, 39 y 52) pide un texto corto con
 * la función comunicativa de la semana (SAI_FARE de tools/curriculo.py:
 * «contá lo que hiciste», «pedí con cortesía») y con sus estructuras («al
 * menos 5 verbos en pretérito perfeito», «4 contracciones con em»).  No hay
 * una respuesta única: el corrector cuenta las estructuras pedidas y busca
 * en el texto los errores que un hispanohablante comete de verdad (español
 * metido, «em o», «gosto café», «vi ao João», «tenho comido hoje», «se eu
 * ter», «vou a praia», «muy», heterogenéricos, falsos amigos…), con las
 * mismas categorías del diagnóstico (diagnosi.js).  Cada tarea trae un
 * texto modelo para comparar después de escribir.  Desde la semana 27 los
 * modelos tratan también historia, literatura, sociología y política de
 * Brasil y de Portugal; lo cotidiano pasa en Río.
 */
(function (root) {
  "use strict";
  var D = root.Diagnosi || (typeof require === "function" ? require("./diagnosi.js") : null);
  var Conj = root.Conj || (typeof require === "function" ? (function () { try { return require("./conjugator.js"); } catch (e) { return null; } })() : null);

  /* ------------------------------------------------------------ tareas
     t: la consigna; min: palabras; use: [estructura, cuántas, etiqueta];
     model: un texto que cumple todo (tools/test_scrivi.js lo verifica).
     Cada modelo usa solo la gramática vista hasta su semana. */
  var TASKS = {
    1: { t: "Presentate: cómo te llamás, de dónde sos, cuántos años tenés, qué hacés y cómo estás hoy.", min: 15,
         use: [["ser", 2, "2 formas de ser (sou, é, somos…)"], ["estar", 1, "1 forma de estar (estou, está…)"], ["ter", 1, "1 forma de ter (tenho, tem…)"]],
         model: "Oi! Eu me chamo Martín. Sou argentino, de Rosario, e sou professor de história. Tenho trinta anos. Hoje estou em Copacabana e estou feliz. E você, como está?" },
    2: { t: "Contá qué tenés y qué hay en tu casa: hermanos, animales, cosas. Usá sustantivos en plural.", min: 15,
         use: [["plurais", 4, "4 sustantivos en plural"], ["haTem", 2, "2 veces tem o há"]],
         model: "Tenho dois irmãos e três primos. Em casa tenho dois gatos, cinco plantas e muitos livros. Há duas janelas grandes e três cadeiras. Também tem dois violões: são do meu pai." },
    3: { t: "Describí tu barrio en Río: dónde están las cosas (la playa, el metro, la panadería) y dónde está la gente.", min: 20,
         use: [["contracoes", 4, "4 contracciones (no, na, do, da, ao, pelo…)"], ["estar", 2, "2 formas de estar"]],
         model: "O meu apartamento é em Botafogo, perto da praia. A estação do metrô está no fim da rua e a padaria está na esquina. O mercado é ao lado do banco. Os meus amigos estão na Lapa hoje." },
    4: { t: "Describí a una persona que conocés: de dónde es, cómo es por fuera y por dentro.", min: 20,
         use: [["adjetivos", 5, "5 adjetivos concordados"]],
         model: "A Bia é brasileira, de Niterói. É alta, magra e muito simpática. Tem os olhos verdes e o cabelo castanho e comprido. É uma pessoa alegre, mas um pouco tímida. O irmão dela é engraçado." },
    5: { t: "Contá tu rutina de un día de semana: dónde trabajás o estudiás, qué comés, qué hacés a la noche.", min: 25,
         use: [["presente", 5, "5 verbos en presente"]],
         model: "De manhã eu trabalho num escritório no Centro. Almoço com os colegas perto da Cinelândia. Depois do trabalho, corro no calçadão de Copacabana. De noite janto em casa, estudo português e escuto bossa nova." },
    6: { t: "Contá tus planes simples para el sábado: adónde vas, quién viene, qué querés y qué podés hacer.", min: 25,
         use: [["irregulares", 4, "4 verbos irregulares en presente (ir, vir, poder, querer, fazer, sair…)"]],
         model: "No sábado quero ir ao Arpoador com a Ana. Ela vem de Niterói de barca e eu saio de casa cedo. Vocês podem vir também? Depois vamos ao boteco e fazemos um churrasco no terraço." },
    7: { t: "Escribí tu agenda de la semana: qué día, a qué hora, cuánto cuesta. Los números, con letras.", min: 25,
         use: [["horas", 3, "3 horas (às oito, à uma, ao meio-dia…)"], ["numeros", 3, "3 números escritos con letras"]],
         model: "Na segunda-feira, às oito, tenho aula de português. Na quarta, às seis e meia, jogo futevôlei em Ipanema. O show de samba na Lapa é na sexta, dia doze, às dez da noite. O ingresso custa quarenta reais." },
    8: { t: "Vas a conocer a alguien en una roda de samba: escribí las preguntas que le harías y qué vas a hacer después.", min: 20,
         use: [["perguntas", 5, "5 preguntas"], ["irInf", 1, "1 ir + infinitivo (vou sair, vai chover…)"]],
         model: "Como você se chama? De onde você é? Onde você mora no Rio? O que você está fazendo aqui? Você quer dançar? Depois eu vou comer um pastel na feira." },
    9: { t: "Contá adónde vas esta semana y cómo: en metro, en ómnibus, a pie, por dónde pasás.", min: 30,
         use: [["preposicoes", 7, "7 preposiciones (em, a, para, de, por y sus contracciones)"]],
         model: "Na segunda vou de metrô para o Centro. Na terça vou a pé até a praia de Ipanema. Na quinta vou de ônibus para a Urca e subo o Pão de Açúcar de bondinho. No sábado passo pela Lapa e volto para casa de táxi." },
    10: { t: "Mostrale a un amigo fotos de tu familia: quién es este, de quién es aquella casa, de quién es el perro.", min: 30,
          use: [["possessivos", 4, "4 posesivos (meu, minha, dele, dela…)"], ["demonstrativos", 2, "2 demostrativos (este, esse, aquele…)"]],
          model: "Esta é a minha mãe e este é o meu pai, na varanda da nossa casa em Santa Teresa. Aquela moça de chapéu é a minha prima Carla. O carro dela é aquele vermelho. Esse cachorro é nosso: se chama Samba." },
    11: { t: "Contá qué hiciste el fin de semana pasado.", min: 30,
          use: [["perfeito", 5, "5 verbos en pretérito perfeito"]],
          model: "No sábado passado fui a Paraty com dois amigos. Chegamos cedo e andamos pelo centro histórico. De tarde pegamos um barco e nadamos numa praia linda. De noite comemos peixe, e no domingo voltei para o Rio." },
    12: { t: "Contá tu mañana (me levanto, me visto…) y dale a un amigo tres consejos con el imperativo.", min: 30,
          use: [["reflexivos", 3, "3 verbos reflexivos"], ["imperativo", 2, "2 imperativos"]],
          model: "Eu me levanto às sete, me lavo e me visto rápido. Tomo um café e saio para o trabalho. Três conselhos para você: beba muita água, use protetor solar na praia e não saia sem guarda-chuva no verão!" },
    14: { t: "Contá qué te gusta y qué no (comida, música, deporte) y qué le gusta a otra persona.", min: 35,
          use: [["gostar", 4, "4 veces gostar de"]],
          model: "Eu gosto muito de feijoada, mas não gosto de jiló. Gosto de ouvir bossa nova, principalmente Tom Jobim. O meu namorado gosta de futebol: ele torce pelo Flamengo e adora o Maracanã. Nós dois gostamos de pão de queijo." },
    15: { t: "Contá cómo era tu vida de chico (dónde vivías, qué hacías) y algo que pasó un día.", min: 35,
          use: [["imperfeito", 5, "5 verbos en imperfeito"], ["perfeito", 1, "1 perfeito para lo que pasó"]],
          model: "Quando eu era criança, morava em Córdoba com os meus avós. Todo verão a gente viajava para a praia e eu brincava na areia o dia inteiro. A minha avó fazia empanadas e o meu avô contava histórias. Um dia, fomos ao Brasil pela primeira vez e eu vi o mar de Copacabana." },
    16: { t: "Te preguntan por gente y cosas («¿Conocés a la Bia? ¿Y el libro?»): respondé con pronombres de objeto.", min: 35,
          use: [["pronomes", 4, "4 pronombres de objeto (o, a, os, as, lhe, -lo…)"]],
          model: "A Bia? Eu a conheço desde 2019 e a vejo todo sábado na feira da Glória. Os meus pais? Eu os visito em janeiro e sempre lhes levo alfajores. O livro de crônicas? Comprei-o na Travessa e vou dá-lo à Bia no aniversário dela." },
    17: { t: "Contá tus planes para el año que viene y hacé una previsión del tiempo para Río.", min: 35,
          use: [["futuro", 5, "5 verbos en futuro do presente"]],
          model: "No ano que vem farei um intercâmbio no Rio. Estudarei português na universidade e morarei em Botafogo. Nos fins de semana visitarei as praias do litoral e conhecerei Petrópolis. Segundo a previsão, amanhã choverá na cidade inteira, e o Cristo ficará escondido pelas nuvens." },
    18: { t: "Escribile a un restaurante de Santa Teresa para reservar una mesa y pedir algo especial, con cortesía.", min: 35,
          use: [["condicional", 3, "3 verbos en condicional (futuro do pretérito)"]],
          model: "Boa tarde! Eu gostaria de reservar uma mesa para quatro pessoas no sábado, às oito. Seria possível uma mesa na varanda, com vista para a Baía de Guanabara? Vocês poderiam também preparar uma sobremesa sem glúten? Eu agradeceria muito. Obrigado!" },
    19: { t: "Compará Río con otra ciudad que conozcas: tamaño, playas, comida, precios.", min: 40,
          use: [["comparativos", 4, "4 comparaciones (mais… do que, tão… quanto, melhor, maior…)"]],
          model: "O Rio é menor do que São Paulo, mas é mais bonito. Em São Paulo a comida é tão boa quanto no Rio, e os restaurantes são mais baratos. As praias de Ipanema são as mais famosas, mas para mim a Prainha é a melhor de todas. O trânsito paulistano é o pior do Brasil!" },
    20: { t: "Un amigo te propone planes y a todo decís que no (nada, nadie, ningún, nunca). Cerrá con una frase con tudo.", min: 40,
          use: [["negacoes", 4, "4 negaciones (nada, ninguém, nenhum, nunca, nem…)"]],
          model: "Não, obrigado: hoje não quero fazer nada. Não conheço ninguém nessa festa e não tenho nenhuma roupa para ir. Também não vou à praia, porque está chovendo. Nunca saio no domingo à noite. Fico em casa e pronto: tudo bem assim." },
    21: { t: "Contá lo que venís haciendo últimamente y algo que ya había pasado cuando llegaste a algún lado.", min: 40,
          use: [["perfeitoComposto", 3, "3 perfeitos compostos (tenho trabalhado…)"], ["maisQuePerfeitoComposto", 1, "1 mais-que-perfeito (tinha começado…)"]],
          model: "Ultimamente tenho trabalhado muito e tenho dormido pouco. Nas últimas semanas também tenho estudado português todas as noites. Ontem, quando cheguei à aula, a professora já tinha começado a explicação. Também tenho corrido no calçadão de Ipanema quase todas as manhãs." },
    22: { t: "Contá la historia de un monumento de Río: cuándo fue construido, por quién, qué le pasó después.", min: 40,
          use: [["passiva", 4, "4 pasivas (foi construído, é visitado…)"]],
          model: "O Cristo Redentor foi construído entre 1922 e 1931 e foi inaugurado em outubro de 1931. A estátua foi feita de concreto armado e pedra-sabão. Em 2007 o monumento foi escolhido como uma das sete maravilhas do mundo moderno. Hoje ele é visitado por milhões de turistas." },
    23: { t: "Una amiga está enferma y triste: escribile qué esperás, qué le recomendás y qué deseás.", min: 40,
          use: [["subjuntivo", 4, "4 verbos en presente do subjuntivo"]],
          model: "Querida Bia, espero que você esteja melhor hoje. É importante que você descanse e que beba muita água. Talvez seja uma boa ideia ficar em casa no fim de semana. Quero que você me ligue amanhã. Tomara que tudo dê certo!" },
    24: { t: "Contá un viaje que estás planeando: para qué, con qué condiciones, aunque qué.", min: 40,
          use: [["conjuncoes", 4, "4 conjunciones con subjuntivo (para que, embora, caso, antes que…)"]],
          model: "Vou ao Rio em julho para que os meus filhos conheçam a cidade. Embora seja inverno, faz calor na praia. Caso chova, vamos ao Museu do Amanhã. Vou reservar o hotel hoje, antes que os preços subam. Quero que eles vejam o pôr do sol no Arpoador." },
    25: { t: "Describí tu barrio: la calle donde vivís, la gente con la que vivís, lo que más te gusta.", min: 40,
          use: [["relativos", 4, "4 relativos (que, quem, onde, cujo, o que…)"]],
          model: "Moro num bairro de que eu gosto muito: Santa Teresa. A rua onde moro tem um bonde amarelo que passa o dia inteiro. A vizinha com quem divido o apartamento é uma artista cujos quadros estão num ateliê da Lapa. O que eu mais adoro é a vista da baía." },
    27: { t: "Vas a mudarte a Río: contá qué vas a hacer cuando llegues, si consigues trabajo, apenas puedas. Incluí un lugar histórico de la ciudad.", min: 45,
          use: [["futSubj", 4, "4 verbos en futuro do subjuntivo (quando eu for, se você quiser…)"]],
          model: "Quando eu me mudar para o Rio, vou morar no Centro. Se eu conseguir o emprego, vou visitar o Paço Imperial, onde o príncipe regente dom João despachava depois que a corte portuguesa chegou, em 1808. Assim que eu puder, vou à Biblioteca Nacional. Se você quiser, vamos juntos." },
    28: { t: "¿A qué momento de la historia de Brasil viajarías si pudieras? Imaginá qué harías y a quién conocerías.", min: 45,
          use: [["subjImperfeito", 3, "3 verbos en imperfeito do subjuntivo (se eu fosse…)"], ["condicional", 2, "2 condicionales"]],
          model: "Se eu pudesse viajar no tempo, iria ao Rio de maio de 1888, quando a princesa Isabel assinou a Lei Áurea, que aboliu a escravidão. Se eu vivesse naquela época, gostaria de conhecer André Rebouças e Joaquim Nabuco, dois grandes abolicionistas. Se eu tivesse coragem, perguntaria a eles o que esperavam do futuro do país." },
    29: { t: "¿Qué hace falta para que la gente aprenda de verdad? Usá el infinitivo personal y citá a un educador brasileño.", min: 45,
          use: [["infPessoal", 4, "4 infinitivos personales (para eles saberem, é bom nós irmos…)"]],
          model: "Para os alunos aprenderem de verdade, é importante os professores partirem da realidade deles. Essa era a ideia de Paulo Freire, que escreveu que a leitura do mundo precede a leitura da palavra. Em 1963, em Angicos, trezentos trabalhadores aprenderam a ler sem precisarem de cartilhas com frases alheias à vida deles: bastou eles discutirem palavras do próprio cotidiano." },
    30: { t: "Pensá en un momento de la historia (tuya o de Brasil) que pudo haber sido distinto: qué habría pasado si…", min: 45,
          use: [["hipotesePassado", 4, "4 tiempos compuestos de hipótesis (tivesse feito, teria ido…)"]],
          model: "Se o príncipe Pedro não tivesse proclamado a Independência em 7 de setembro de 1822, talvez o Brasil tivesse continuado ligado a Portugal por mais tempo. Na minha vida também foi assim: se eu não tivesse estudado português, não teria lido Machado de Assis no original e não teria conhecido os meus melhores amigos." },
    31: { t: "Contá lo que te dijo alguien en una charla o entrevista: qué te contó, qué te preguntó, qué le respondiste.", min: 50,
          use: [["indireto", 4, "4 verbos de decir con que, se o para (disse que…, perguntou se…)"]],
          model: "Na palestra, o historiador português disse que o 25 de Abril de 1974 tinha começado com uma canção no rádio: Grândola, Vila Morena, de Zeca Afonso. Explicou que os militares derrubaram o Estado Novo quase sem violência. Perguntei se os cravos eram só um símbolo, e ele respondeu que uma mulher tinha distribuído cravos aos soldados. No fim, pediu que nós lêssemos Sophia de Mello Breyner." },
    32: { t: "Escribí los carteles y avisos de una calle de Río: qué se alquila, qué se vende, qué se busca, qué no se permite.", min: 30,
          use: [["se", 4, "4 construcciones con se (aluga-se, vendem-se, precisa-se de…)"]],
          model: "Aluga-se apartamento de dois quartos em Botafogo. Vendem-se bicicletas usadas na loja da esquina. Precisa-se de garçons para o quiosque do calçadão. Aceitam-se cartões e Pix. Aqui não se permite fumar." },
    33: { t: "Presentá a un escritor brasileño en un texto formal, con pronombres pegados al verbo (fez-se, conta-nos, dir-se-ia).", min: 50,
          use: [["encliticos", 4, "4 pronombres enclíticos o mesoclíticos"]],
          model: "Machado de Assis nasceu em 1839, no Morro do Livramento, no Rio de Janeiro. Filho de um pintor de paredes, fez-se escritor quase sozinho e tornou-se o maior romancista brasileiro. Em Dom Casmurro, de 1899, Bentinho conta-nos a sua versão da história e pede-nos que acreditemos nela. Dir-se-ia que o leitor é o verdadeiro juiz de Capitu." },
    34: { t: "Opiná sobre una cuestión social de Río (la ciudad partida, las favelas, las playas): argumentá y conectá ideas.", min: 50,
          use: [["conectores", 5, "5 conectores distintos (porém, no entanto, aliás, portanto, já que…)"]],
          model: "Em 1994, o jornalista Zuenir Ventura chamou o Rio de cidade partida. De um lado há bairros ricos à beira-mar; do outro, favelas nos morros. No entanto, as duas cidades não vivem separadas: aliás, dependem uma da outra todos os dias. Portanto, a imagem é útil, porém incompleta, já que o samba, o funk e o futebol atravessam essas fronteiras." },
    35: { t: "Contá una película o un libro brasileño que te marcó, con verbos y su preposición (assistir a, gostar de, pensar em, sonhar com…).", min: 50,
          use: [["regencia", 4, "4 verbos con su preposición (assistir a, pensar em…)"]],
          model: "Ontem assisti ao filme Central do Brasil, de Walter Salles, pela terceira vez. Gosto muito da história da Dora e do menino Josué. Sempre penso na viagem dos dois pelo sertão e sonho com uma viagem assim pelo Nordeste. Preciso de muito mais tempo para conhecer o Brasil de verdade." },
    36: { t: "Contá tu sábado en Río con horarios y lugares: la feria, la playa, la noche en la Lapa.", min: 45,
          use: [["crase", 4, "4 veces la crase (à, às, àquele…)"]],
          model: "Todos os sábados vou à feira da Glória às nove da manhã. Depois vou à praia e, à tarde, dou uma volta à beira da Lagoa. Às vezes vou à Lapa à noite com os meus amigos para ouvir samba, e volto para casa às duas." },
    37: { t: "Contá cómo trabaja un instituto científico o una oficina pública, con verbos como manter, obter, propor, prever, intervir.", min: 50,
          use: [["irregDerivados", 4, "4 formas de verbos irregulares menos frecuentes (mantém, obtêm, propõe, preveem…)"]],
          model: "A Fiocruz, que nasceu em 1900 em Manguinhos, mantém até hoje a tradição de Oswaldo Cruz. Quando uma epidemia começa, os pesquisadores preveem os riscos, obtêm dados dos postos de saúde e propõem campanhas de vacinação. Às vezes o governo intervém, e nem sempre as ideias cabem no orçamento. Eu passeio pelo campus e admiro o castelo mourisco." },
    38: { t: "Escribí un mensaje de WhatsApp a un amigo carioca, como se habla: invitalo al boteco.", min: 30,
          use: [["coloquial", 4, "4 marcas del habla (tá, pra, né, cadê, a gente, tô…)"]],
          model: "E aí, Rafa, beleza? Cadê você? A gente tá no boteco da esquina, perto do Arpoador. Vem pra cá, né? Tô com saudade! Se não der, a gente se vê amanhã no futevôlei." },
    40: { t: "Escribí un párrafo de informe sobre la Constitución de 1988, con registro formal y sustantivos en lugar de verbos.", min: 50,
          use: [["nominalizacoes", 5, "5 nominalizaciones (-ção, -mento, -dade, -ência…)"]],
          model: "A promulgação da Constituição de 1988 representou o encerramento formal da transição democrática no Brasil. O texto garantiu a ampliação dos direitos sociais e a universalização do acesso à saúde, com a criação do Sistema Único de Saúde. Houve, ainda, o reconhecimento dos direitos dos povos indígenas e das comunidades quilombolas." },
    41: { t: "Resumí el comienzo de una novela brasileña como un narrador literario, con el mais-que-perfeito simple (fizera, dissera).", min: 50,
          use: [["maisQuePerfeito", 3, "3 verbos en mais-que-perfeito simple (fizera, deixara…)"]],
          model: "Quando Rubião se mudou para o Rio, o filósofo Quincas Borba já morrera e lhe deixara toda a fortuna, com uma condição: cuidar do cachorro, que também se chamava Quincas Borba. O antigo professor de Barbacena, que nunca imaginara tanta riqueza, herdara também uma filosofia estranha, o Humanitismo, que Machado de Assis inventara para rir dos sistemas do século XIX." },
    42: { t: "Escribí una crónica de un domingo en Copacabana, condensando con gerundio, participio y al + infinitivo.", min: 50,
          use: [["gerundio", 2, "2 gerundios"], ["partAbs", 1, "1 participio absoluto (Terminado o almoço, …)"], ["aoInf", 1, "1 ao + infinitivo"]],
          model: "Chegando a Copacabana num domingo de sol, entendi por que Rubem Braga escrevia tanto sobre o mar. Terminado o almoço, descemos para o calçadão. Ao ver as ondas de pedra portuguesa, lembrei de Lisboa. Andando devagar até o Leme, ouvimos um vendedor de mate que cantava o preço como se fosse um samba." },
    43: { t: "Escribí un mail formal a la Biblioteca Nacional pidiendo acceso a documentos para una investigación.", min: 60,
          use: [["formal", 4, "4 fórmulas formales (Prezado/a, venho por meio desta, solicito, Atenciosamente…)"]],
          model: "Prezada Senhora Diretora, venho por meio desta solicitar acesso ao acervo de jornais de 1897 sobre a Guerra de Canudos. Sou pesquisadora argentina e estudo a cobertura que Euclides da Cunha fez do conflito antes de escrever Os Sertões, publicado em 1902. Gostaria de saber se seria possível consultar os originais na Hemeroteca. Segue em anexo a carta da minha universidade. Fico no aguardo de sua resposta. Atenciosamente, Laura Gómez" },
    44: { t: "Describí tu barrio con diminutivos, aumentativos y sustantivos derivados (cafezinho, casarão, jornaleiro…).", min: 50,
          use: [["sufixos", 6, "6 palabras con sufijo (-inho, -zinho, -ão, -aço, -eiro…)"]],
          model: "Todo domingo tomo um cafezinho na padaria da esquina e compro um pãozinho quentinho. Na frente mora um senhor bonachão num casarão antigo de Santa Teresa. O jornaleiro sabe todas as notícias do bairro, e o sorveteiro passa pela praça às quatro. Ontem, no Maracanã, vi um golaço do Flamengo." },
    45: { t: "Contale a un amigo un malentendido con falsos amigos (vaso, embaraçada, esquisito, borracha…), usándolos bien.", min: 50,
          use: [["falsos", 3, "3 falsos amigos bien usados"]],
          model: "Quando cheguei ao Rio, pedi num restaurante um vaso de água, e o garçom me olhou com uma cara esquisita: vaso é para plantas; eu queria um copo. Depois, na praia, disse que estava embaraçada por causa do meu português, e todo mundo entendeu: embaraçada quer dizer envergonhada, não grávida. No escritório, uma colega me emprestou uma borracha para apagar o rascunho." },
    46: { t: "Contá un viaje a Lisboa y a Maputo: qué palabras cambian, qué te llamó la atención, qué autor leíste.", min: 60,
          use: [["variantes", 3, "3 palabras del portugués europeo o africano (autocarro, comboio, pequeno-almoço…)"]],
          model: "Em Lisboa, em vez de ônibus, peguei o autocarro, e para ir a Sintra tomei o comboio. No pequeno-almoço, que é o nosso café da manhã, pedi uma bica, o cafezinho deles. Fernando Pessoa, pela voz de Bernardo Soares, escreveu que a sua pátria era a língua portuguesa. Em Maputo li contos de Mia Couto, que inventa palavras novas com o português de Moçambique." },
    47: { t: "¿El jeitinho brasileño es una virtud o un problema? Sostené una tesis matizada.", min: 60,
          use: [["modalizadores", 4, "4 modalizadores y organizadores (é possível que, ainda que, além disso, em suma…)"]],
          model: "Em primeiro lugar, é possível que o jeitinho seja, como sugere Roberto DaMatta, uma forma de conciliar a lei impessoal com as relações pessoais. Além disso, ao que parece, ele nasce da desconfiança diante de instituições distantes. Por outro lado, ainda que pareça simpático, o jeitinho pode abrir caminho para a corrupção. Em suma, mais do que condená-lo, convém entender de onde ele vem." },
    48: { t: "Resumí las ideas de un ensayo brasileño clásico, atribuyéndolas con precisión (segundo o autor, defende, ressalta…).", min: 60,
          use: [["dicendi", 4, "4 verbos o expresiones para atribuir (defende, segundo, ressalta, ou seja…)"]],
          model: "Em Raízes do Brasil, de 1936, Sérgio Buarque de Holanda defende que o homem cordial é um traço da formação brasileira. Segundo o autor, cordial não quer dizer bondoso: vem de cor, coração, ou seja, de agir pelas emoções e não por regras impessoais. O historiador ressalta que essa cordialidade dificulta a separação entre o público e o privado. Para ele, a herança colonial explica boa parte desse comportamento." },
    49: { t: "Pasá a registro culto un comentario coloquial sobre Carolina Maria de Jesus y su diario.", min: 60,
          use: [["culto", 4, "4 marcas del registro culto (há, nós + verbo, pronombre enclítico, contudo…)"]],
          model: "Há, na obra de Carolina Maria de Jesus, uma força que poucos livros possuem. Em Quarto de Despejo, publicado em 1960, a autora descreve-nos a fome na favela do Canindé, em São Paulo. Nós, leitores, reconhecemo-nos na sua voz, embora vivamos longe daquela realidade. Contudo, convém lembrar que o diário foi editado pelo jornalista Audálio Dantas. Ainda hoje, o livro é lido e discutido nas escolas." },
    50: { t: "Contá un pequeño lío con un amigo en Río usando expresiones idiomáticas (pisar na bola, dar um jeito, fazer questão…).", min: 50,
          use: [["expressoes", 4, "4 expresiones idiomáticas"]],
          model: "Ontem pisei na bola com a minha amiga Carla: esqueci o aniversário dela. Mas dei um jeito: fiz questão de levar um bolo de aipim à casa dela, em Botafogo. Ela levou tudo na brincadeira e ficou de boa. No fim, deu tudo certo e ainda matamos a saudade de tanto tempo." },
    51: { t: "Escribile una carta a tu yo de hace un año: qué aprendiste, qué habría pasado si no hubieras empezado, qué le recomendás.", min: 60,
          use: [["futSubj", 1, "1 futuro do subjuntivo"], ["perfeitoComposto", 1, "1 perfeito composto"], ["infPessoal", 1, "1 infinitivo pessoal"], ["crase", 1, "1 crase"]],
          model: "Querido eu de um ano atrás: quando você ler esta carta, já vai falar português. Tenho estudado todos os dias e tenho aprendido com os erros. Para nós chegarmos até aqui, foi preciso paciência. Se você tivesse desistido, não teria descoberto Guimarães Rosa, que escreveu que o correr da vida embrulha tudo. Vá à praia, leia muito e não tenha medo de errar." }
  };

  /* ------------------------------------------------------------ tokens */

  function toks(text) {
    var out = [], re = /[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[-'][A-Za-zÀ-ÖØ-öø-ÿ]+)*|\d+|[.!?,;:]/g, m, start = true, clause = true, sentAt = 0;
    var src = String(text || "").normalize("NFC").replace(/[’‘`´]/g, "'");
    while ((m = re.exec(src))) {
      var o = m[0];
      if (/^[.!?,;:]$/.test(o)) { out.push({ p: o, at: m.index }); clause = true; if (/[.!?]/.test(o)) { start = true; sentAt = m.index + 1; } continue; }
      out.push({ o: o, w: o.toLowerCase(), at: m.index, len: o.length, start: start, clause: clause || start,
                 cap: /^[A-ZÀ-Ý]/.test(o), dlg: /[–—«"“]/.test(src.slice(sentAt, m.index)) });
      start = false; clause = false;
    }
    return out;
  }

  /* Every Portuguese word the course shows (answers, phrases, readings, the
     bank, the glossary): a word the learner writes that is in here exists. */
  var LEXI = Object.create(null), lexiN = 0;
  function learn(list) {
    (list || []).forEach(function (txt) {
      String(txt || "").normalize("NFC").toLowerCase().replace(/[’‘`´]/g, "'").split(/[^a-zà-ÿ'-]+/).forEach(function (w) {
        w = w.replace(/^['-]+|['-]+$/g, "");
        if (w.length > 1 && !LEXI[w]) { LEXI[w] = 1; lexiN++; }
        if (w.indexOf("-") > 0) w.split("-").forEach(function (x) { if (x.length > 1 && !LEXI[x]) { LEXI[x] = 1; lexiN++; } });
      });
    });
  }
  function learnCourse(src) {
    if (lexiN > 5000) return;
    src = src || {};
    var list = [];
    (src.items || []).forEach(function (it) {
      // Only what the learner has to write: stems and choice options carry Spanish.
      if (it.type === "translate" || it.type === "cloze" || it.type === "conjugate" || it.type === "plural" || it.type === "typed") {
        list.push(String(it.answer || "").replace(/\|/g, " "));
        (it.accept || it.alt || []).forEach(function (a) { list.push(a); });
      }
    });
    (src.bank && src.bank.sentences || []).forEach(function (x) { (x.pt || x.it || []).forEach(function (a) { list.push(a); }); });
    (src.phrases || []).forEach(function (f) { list.push(f.pt || f.it); });
    (src.readings || []).forEach(function (e) { list.push(e.text); });
    learn(list);
    learn(Object.keys(src.glossario || {}));
    learn(Object.keys(DATA.lex || {}));
  }
  // The words of the models and the most frequent Portuguese: known even
  // before the course data arrives.
  var BASE_WORDS = "a o as os um uma uns umas de do da dos das em no na nos nas num numa ao aos à às por pelo pela pelos pelas para " +
    "com sem até entre sobre contra desde após sob e ou mas porém contudo todavia entretanto portanto pois que se como quando onde " +
    "porque quem qual quais quanto quanta quantos quantas não sim já ainda também só muito muita muitos muitas pouco pouca poucos poucas " +
    "mais menos bem mal melhor pior maior menor eu tu ele ela nós eles elas você vocês me te lhe lhes mim ti si comigo contigo conosco " +
    "meu minha meus minhas teu tua teus tuas seu sua seus suas nosso nossa nossos nossas dele dela deles delas este esta estes estas esse " +
    "essa esses essas aquele aquela aqueles aquelas isto isso aquilo aqui aí ali lá cá hoje ontem amanhã agora depois antes sempre nunca " +
    "talvez então logo tarde cedo noite dia dias manhã semana mês ano anos vez vezes hora horas todo toda todos todas tudo nada ninguém " +
    "alguém algum alguma alguns algumas nenhum nenhuma outro outra outros outras cada mesmo mesma próprio própria tão tanto tanta " +
    "casa rua cidade bairro praia mar sol areia calçadão boteco feira metrô ônibus carro barca bonde táxi trem avião bicicleta " +
    "pai mãe pais filho filha irmão irmã irmãos avô avó avós tio tia primo prima primos amigo amiga amigos amigas namorado namorada " +
    "homem mulher menino menina criança crianças gente pessoa pessoas senhor senhora professor professora aluno aluna colega " +
    "trabalho escritório escola aula faculdade universidade livro livros filme música samba história vida mundo país língua " +
    "obrigado obrigada oi olá tchau beleza saudade legal ótimo bom boa bons boas novo nova velho velha grande pequeno pequena " +
    "segunda terça quarta quinta sexta sábado domingo feira janeiro fevereiro março abril maio junho julho agosto setembro outubro " +
    "novembro dezembro zero dois duas três quatro cinco seis sete oito nove dez onze doze treze catorze quatorze quinze vinte trinta " +
    "quarenta cinquenta cem mil primeiro primeira último última meio meia meio-dia meia-noite reais real centavos " +
    "rio brasil brasileiro brasileira carioca cariocas português portuguesa argentino argentina copacabana ipanema leblon arpoador " +
    "lapa botafogo urca glória flamengo tijuca niterói centro corcovado cristo maracanã lagoa leme " +
    "é são sou somos era eram foi foram ser estar estou está estamos estão tenho tem temos têm ter há vou vai vamos vão ir";
  learn([BASE_WORDS]);
  var lexiBase = lexiN;

  function known(w) {
    if (!w) return false;
    if (LEXI[w] || (U.isPortuguese && U.isPortuguese(w)) || V(w).length || PP(w) || GER(w)) return true;
    if (w.indexOf("-") > 0) {
      var sp = U.splitEnclitic && U.splitEnclitic(w);
      if (sp && (known(sp.v) || V(sp.v).length)) return true;
      return w.split("-").every(function (x) { return !x || LEXI[x] || (U.isPortuguese && U.isPortuguese(x)) || V(x).length || /^(se|me|te|nos|lhe|lhes|o|a|os|as|lo|la|los|las|no|na|ei|á|ás|emos|ão|ia|iam|íamos)$/.test(x); });
    }
    return false;
  }
  // An adverb in -mente whose adjective is known (rapidamente, facilmente).
  function menteOK(w) {
    if (!/mente$/.test(w)) return false;
    var b = w.replace(/mente$/, "");
    return [b, b.replace(/a$/, "o"), b + "e"].some(function (x) { return x !== w && (known(x) || ADJ[x]); });
  }

  function words(tk) { return tk.filter(function (t) { return t.w && /[a-zà-ÿ]/.test(t.w); }); }

  var U = D ? D.util : {};
  var DATA = D ? D.DATA : { lex: {}, nouns: {}, nounsByPlural: {}, adj: {}, falsi: {} };
  function V(w) { return D && w ? D.verbForms(w) : []; }
  function PP(w) { return D && w ? D.participleOf(w) : null; }
  function GER(w) { return U.gerundOf && w ? U.gerundOf(w) : null; }
  function lemmas(w) { return V(w).map(function (v) { return v.lemma.replace(/-se$/, ""); }); }
  function hasLem(w, re) { return lemmas(w).some(function (l) { return re.test(l); }) || (PP(w) && re.test(PP(w))); }
  function isInf(w) { return !!(w && U.isInfinitive && U.isInfinitive(w)) || /^(ser|ter|ir|ver|vir|dar|ler|pôr|rir)$/.test(w || ""); }
  function finite(w) { return V(w).some(function (v) { return v.tense !== "infPessoal"; }) && !isInf(w); }
  function isVerb(w) { return !!(w && (V(w).length || PP(w) || GER(w) || isInf(w))); }

  /* Adjetivos frecuentes con sus cuatro formas (ms, fs, mp, fp). */
  var ADJ = Object.create(null);    // forma → [ms, fs, mp, fp]
  function addAdj(ms, fs, mp, fp) { var f = [ms, fs, mp, fp]; f.forEach(function (x) { if (x && !ADJ[x]) ADJ[x] = f; }); }
  ("bonito lindo alto baixo magro gordo novo velho cansado ocupado simpático antipático tímido branco preto vermelho amarelo roxo " +
   "moreno loiro louro ruivo castanho famoso caro barato pequeno rico limpo sujo cheio vazio frio bravo calmo tranquilo nervoso curioso " +
   "preguiçoso engraçado divertido chato lento rápido moderno antigo histórico típico brasileiro argentino mineiro baiano italiano " +
   "americano uruguaio chileno colorido escuro claro comprido curto longo largo estreito gostoso delicioso perigoso seguro animado " +
   "cansativo lotado aberto fechado pronto sozinho próximo último primeiro único sério honesto generoso educado casado solteiro " +
   "apaixonado preocupado atrasado molhado gelado quieto lindo feio magro maravilhoso incrível famoso sujo escondido armado usado " +
   "estranho esquisito embaraçado envergonhado orgulhoso emocionado assustado ótimo péssimo caríssimo baratíssimo lindíssimo " +
   "democrático formal? quilombola").split(" ").forEach(function (a) {
    if (/\?$/.test(a) || !/o$/.test(a)) return;
    var s = a.slice(0, -1); addAdj(a, s + "a", s + "os", s + "as");
  });
  ("alegre triste grande forte doce quente verde contente inteligente importante interessante elegante pobre livre breve leve " +
   "enorme jovem? simples? feliz? fácil? difícil? útil? azul? cultural? social? natural? especial? legal? normal? tropical? federal? " +
   "nacional? popular? regular? melhor? pior? maior? menor? gentil? agradável? possível? incrível? horrível? terrível? confortável? " +
   "responsável? amável? paulistano? carioca? paulista? indígena? cinza?").split(" ").forEach(function (a) {
    var x = a.replace(/\?$/, "");
    if (/e$/.test(x)) return addAdj(x, x, x + "s", x + "s");
    if (/^(jovem)$/.test(x)) return addAdj(x, x, "jovens", "jovens");
    if (/^(simples|cinza)$/.test(x)) return addAdj(x, x, x, x);
    if (/z$/.test(x) || /r$/.test(x)) return addAdj(x, x, x + "es", x + "es");
    if (/(fácil|difícil|útil|agradável|possível|incrível|horrível|terrível|confortável|responsável|amável)$/.test(x)) return addAdj(x, x, x.replace(/il$/, "eis").replace(/el$/, "eis"), x.replace(/il$/, "eis").replace(/el$/, "eis"));
    if (/azul$/.test(x)) return addAdj(x, x, "azuis", "azuis");
    if (/gentil$/.test(x)) return addAdj(x, x, "gentis", "gentis");
    if (/al$/.test(x)) return addAdj(x, x, x.replace(/al$/, "ais"), x.replace(/al$/, "ais"));
    if (/o$/.test(x)) { var s = x.slice(0, -1); return addAdj(x, s + "a", s + "os", s + "as"); }
    if (/a$/.test(x)) return addAdj(x, x, x + "s", x + "s");
  });
  addAdj("bom", "boa", "bons", "boas"); addAdj("mau", "má", "maus", "más");
  addAdj("português", "portuguesa", "portugueses", "portuguesas"); addAdj("francês", "francesa", "franceses", "francesas");
  addAdj("inglês", "inglesa", "ingleses", "inglesas"); addAdj("japonês", "japonesa", "japoneses", "japonesas");
  addAdj("alemão", "alemã", "alemães", "alemãs"); addAdj("espanhol", "espanhola", "espanhóis", "espanholas");
  addAdj("trabalhador", "trabalhadora", "trabalhadores", "trabalhadoras");
  function adjForms(w) {
    if (ADJ[w]) return ADJ[w];
    var lem = DATA.adj && DATA.adj[w];
    if (lem && ADJ[lem]) return ADJ[lem];
    if (lem && /o$/.test(lem)) { var s = lem.slice(0, -1); return [lem, s + "a", s + "os", s + "as"]; }
    return null;
  }
  function isAdj(w) { return !!adjForms(w); }
  var GN_IX = { ms: 0, fs: 1, mp: 2, fp: 3 };

  /* Género y número de un sustantivo: del banco, de los heterogenéricos o,
     con cuidado, de la terminación. */
  var NOT_F = /^(dia|dias|mapa|mapas|planeta|planetas|clima|sistema|sistemas|problema|problemas|tema|temas|programa|programas|idioma|idiomas|poeta|poetas|cometa|sofá|sofás|guarda|telefonema|diploma|drama|dramas|pijama|cinema|cinemas|lema|esquema|panorama|poema|poemas|samba|sambas|fantasma|artista|artistas|colega|colegas|turista|turistas|motorista|jornalista|dentista|atleta|atletas|policial|gente)$/;
  var NOT_M = /^(tribo|tribos|foto|fotos|moto|motos|libido|mão|mãos|virgem|ordem|origem|imagem|tv)$/;
  function nounGN(w) {
    if (!w) return null;
    var s = DATA.nouns[w], p = DATA.nounsByPlural[w];
    if (s && s.s === w) return { g: s.g, n: s.s === s.pl ? null : "s" };
    if (p && p.pl === w) return { g: p.g, n: "p" };
    var h = U.HETERO || {};
    if (h[w]) return { g: h[w], n: "s" };
    if (/s$/.test(w) && h[w.replace(/s$/, "")]) return { g: h[w.replace(/s$/, "")], n: "p" };
    if (/(ções|dades|agens)$/.test(w)) return { g: "f", n: "p" };
    if (/(ção|dade|agem)$/.test(w)) return { g: "f", n: "s" };
    return null;
  }
  function isNoun(w) { return !!(w && (DATA.nouns[w] || DATA.nounsByPlural[w] || (U.HETERO && U.HETERO[w]))); }

  var NUMS = /^(um|uma|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|catorze|quatorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|cento|duzentos|duzentas|trezentos|trezentas|quatrocentos|quinhentos|seiscentos|setecentos|oitocentos|novecentos|mil|milhão|milhões|meia|meio-dia|meia-noite)$/;
  var HOURW = /^(uma|duas|três|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|meio-dia|meia-noite|\d{1,2}h?)$/;
  var POSS = /^(meu|minha|meus|minhas|teu|tua|teus|tuas|seu|sua|seus|suas|nosso|nossa|nossos|nossas|dele|dela|deles|delas)$/;
  var DEM = /^(este|esta|estes|estas|esse|essa|esses|essas|aquele|aquela|aqueles|aquelas|isto|isso|aquilo|neste|nesta|nesse|nessa|naquele|naquela|deste|desta|desse|dessa|daquele|daquela|disso|disto|daquilo|nisso|nisto)$/;
  var ART = /^(o|a|os|as|um|uma|uns|umas)$/;
  var CLIT = /^(me|te|se|nos|vos|lhe|lhes)$/;
  // Words that are also verb forms but almost always something else.
  var AMBIG = /^(como|para|nada|casa|sede|cara|sobre|entre|vale|cedo|logo|fora|era|tarde|conta|forma|pena|volta|vista|olha|corre|segundo|meio|canto|jogo|gosto|passo|caso|fim|sol|mal|bem|só|até|então|onde|quando|mas|mesmo|agora|ainda|também|sempre|lá|aqui|muito|pouco|tudo|todo|nosso|seu|dela|dele|que|se|o|a|e|é|em|um|uma|no|na|de|do|da|pelo|pela|obrigado|obrigada|morro|livro|rio|samba|praia|dança|festa|feira|venda|compra|troca|ajuda|pergunta|resposta|conversa|volta|chegada|saída|espera|visita|viagem|parte|frente|lado|base|fala|falta|fica|ama|ano|anos|sal|sei)$/;
  var SUBJ_PRON = { eu: 0, tu: 1, "você": 2, ele: 2, ela: 2, "nós": 3, eles: 5, elas: 5, "vocês": 5 };
  var SKIPV = /^(não|já|também|sempre|nunca|ainda|só|me|te|se|nos|lhe|lhes|o|a|os|as|muito|bem|mal|jamais|quase|até|logo)$/;
  var PREPS = /^(a|de|em|por|para|pra|com|sem|até|entre|sobre|contra|desde|após|sob|perante|ao|à|do|da|no|na|pelo|pela)$/;
  var SAY = /^(disse|disseram|dizia|contou|contaram|explicou|explicaram|perguntou|perguntaram|pediu|pediram|respondeu|responderam|afirmou|afirmaram|comentou|garantiu|prometeu|avisou|lembrou|contava|explicava|perguntei|pedi|respondi|disse-me|contou-me)$/;
  var CONN = ["porém", "contudo", "entretanto", "no entanto", "todavia", "aliás", "inclusive", "portanto", "por isso", "pois", "já que",
              "uma vez que", "visto que", "ou seja", "além disso", "então", "mas", "logo", "assim", "por outro lado", "de um lado",
              "embora", "enquanto", "por exemplo", "em primeiro lugar", "afinal", "ainda assim", "mesmo assim", "dessa forma", "isto é"];
  var MODAL = ["é possível que", "tudo indica que", "ao que parece", "ainda que", "mesmo que", "por mais que", "em primeiro lugar",
               "em segundo lugar", "além disso", "por outro lado", "em suma", "diante do exposto", "dessa forma", "talvez", "provavelmente",
               "possivelmente", "convém", "parece que", "é provável que", "sem dúvida", "de fato", "em síntese", "por fim", "em resumo"];
  var DICENDI = ["afirma", "defende", "sustenta", "ressalta", "alega", "argumenta", "observa", "destaca", "segundo", "de acordo com",
                 "conforme", "ou seja", "isto é", "em outras palavras", "afirmou", "defendeu", "ressaltou", "sublinha", "aponta", "considera"];
  var FORMAL = ["prezado", "prezada", "prezados", "prezadas", "atenciosamente", "cordialmente", "venho por meio desta", "solicito",
                "solicitar", "gostaria de", "segue em anexo", "seguem em anexo", "fico no aguardo", "desde já agradeço", "vossa senhoria",
                "o senhor", "a senhora", "agradeceria", "respeitosamente", "venho solicitar"];
  var EXPR = /\b(pis\w+ na bola|d\w+ (um )?jeito|f\w+ questão|lev\w+ a sério|lev\w+ (tudo )?na brincadeira|tom\w+ uma decisão|ench\w+ o saco|fic\w+ de boa|d\w+ (tudo )?certo|quem não tem cão caça com gato|de grão em grão|mat\w+ a saudade|bat\w+ (um )?papo|caiu a ficha|cai a ficha|chov\w+ no molhado|custa os olhos da cara|dar uma volta|dei uma volta|fazer falta|faz falta|tirar de letra|tirou de letra|pagar o pato|pagou o pato|dar bola|deu bola|fic\w+ na mão|pôr a mão na massa|meter o bedelho|puxar o saco|segurar vela|chutar o balde|chutou o balde|enfiar o pé na jaca|abrir o jogo|abriu o jogo|ficar a ver navios|arregaçar as mangas|levar em conta|tomar providências)\b/g;
  var VARIANT = /^(autocarro|autocarros|comboio|comboios|telemóvel|telemóveis|pequeno-almoço|bica|bicas|casa-de-banho|frigorífico|ecrã|sumo|sumos|fixe|miúdo|miúdos|miúda|rapariga|raparigas|talho|montra|passadeira|paragem|portagem|apelido|propinas|machimbombo|machimbombos|chapa|kota|bué|candongueiro|matabicho|puto|putos)$/;
  var COLLOQ = /^(tá|tô|tava|tavam|tamo|tamos|pra|pro|pros|pras|né|cadê|cê|ocê|vamo|tipo|beleza|valeu|mó|ó|aí|bora|galera|cara|parada|tranquilo|firmeza)$/;
  var CONJ_SUBJ = ["para que", "embora", "caso", "antes que", "sem que", "até que", "a fim de que", "desde que", "contanto que", "mesmo que",
                   "ainda que", "a não ser que", "por mais que", "a menos que", "logo que"];
  var FUT_TRIG = /^(quando|se|assim|logo|enquanto|sempre|depois|conforme|como|onde|quem|caso)$/;
  var IRR_DERIV = /^(manter|conter|obter|deter|reter|entreter|abster|intervir|convir|provir|propor|compor|supor|dispor|impor|repor|expor|opor|prever|rever|caber|valer|perder|medir|passear|odiar|ansiar|mediar|remediar|incendiar|requerer|prover|reaver|construir|destruir)$/;
  var IRR_PRES = /^(ir|vir|ser|estar|ter|fazer|dizer|trazer|poder|querer|saber|ver|dar|pôr|ler|sair|pedir|dormir|ouvir|perder|haver|caber|valer|crer|rir|medir|subir|preferir|sentir|seguir|vestir|servir|repetir)$/;

  /* ------------------------------------------------ estructuras (features) */

  function features(text) {
    var tk = toks(text), ws = words(tk);
    var f = {};
    var add = function (k, n) { f[k] = (f[k] || 0) + (n == null ? 1 : n); };
    var norm = " " + String(text || "").normalize("NFC").toLowerCase().replace(/[’‘`´]/g, "'").replace(/[.,;:!?«»"“”()—–]/g, " ").replace(/\s+/g, " ") + " ";
    var W = function (k) { return tk[k] && tk[k].w || ""; };
    var prevW = function (i) { for (var k = i - 1; k >= 0; k--) if (tk[k].w) return tk[k].w; return ""; };
    var nextVerb = function (i, max) {
      for (var k = i + 1; k < tk.length && k <= i + (max || 4); k++) {
        if (!tk[k].w) return -1;
        if (SUBJ_PRON[tk[k].w] != null || SKIPV.test(tk[k].w) || tk[k].w === "gente" || (tk[k].w === "a" && W(k + 1) === "gente")) continue;
        return k;
      }
      return -1;
    };
    tk.forEach(function (t, i) {
      if (t.p) { if (t.p === "?") add("perguntas"); return; }
      var w = t.w, n = W(i + 1), n2 = W(i + 2), p = prevW(i), fv = V(w);
      var sp = U.splitEnclitic ? U.splitEnclitic(w) : null;
      var core = sp ? sp.v : w, cv = sp ? V(core) : fv;
      var tense = function (x) { return cv.some(function (v) { return v.tense === x; }); };
      if (/^(sou|és|é|somos|são|era|eras|éramos|eram|fui|foi|fomos|foram)$/.test(w)) add("ser");
      if (/^(estou|estás|está|estamos|estão|estava|estavam|estive|esteve|estivemos|estiveram)$/.test(w)) add("estar");
      if (/^(tenho|tens|tem|temos|têm|tinha|tinham|tive|teve)$/.test(w)) add("ter");
      if (/^(há|tem|têm|havia|tinha)$/.test(w) && !(PP(n) && /^(tem|têm|tinha|havia)$/.test(w))) add("haTem");
      var npl = DATA.nounsByPlural[w] && DATA.nounsByPlural[w].s !== w;
      if (npl || (/s$/.test(w) && w.length > 3 && !finite(w) && !isAdj(w) && !POSS.test(w) && !DEM.test(w) && !ART.test(w) && !NUMS.test(w) &&
          (/^(os|as|uns|umas|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|muitos|muitas|poucos|poucas|vários|várias|meus|minhas|seus|suas|nossos|nossas|dos|das|nos|nas|aos|às|pelos|pelas|alguns|algumas|estes|estas|esses|essas|aqueles|aquelas|todos|todas)$/.test(p) || NUMS.test(p) || /^\d+$/.test(p)))) add("plurais");
      var ci = U.CONTR && U.CONTR[w];
      if (ci && !(w === "nos" && (isVerb(n) || CLIT.test(n))) && !(w === "no" && false) && !(/^(daqui|dali|daí|aonde|donde)$/.test(w))) add("contracoes");
      if ((ci || (U.PREP_BASE && U.PREP_BASE[w])) && !(w === "nos" && isVerb(n)) && !(w === "a" && (isVerb(n) || ART.test(p) === false && !n))) add("preposicoes");
      if (isAdj(w) && !POSS.test(w) && !/^(melhor|pior|maior|menor|próximo|último|primeiro|único)$/.test(w) && !(finite(w) && !/^(é|são)$/.test(p) && CLIT.test(p))) add("adjetivos");
      if (tense("presente") && !/^(sou|és|é|somos|são|estou|está|estamos|estão|tenho|tem|temos|têm|há)$/.test(w) && !isInf(w)) add("presente");
      if (cv.some(function (v) { return v.tense === "presente" && IRR_PRES.test(v.lemma.replace(/-se$/, "")) && !/^(ser|estar|ter|haver)$/.test(v.lemma); })) add("irregulares");
      if ((w === "às" && HOURW.test(n)) || (w === "à" && n === "uma") || /^(meio-dia|meia-noite)$/.test(w) || (/^(as|das|até|entre)$/.test(w) && HOURW.test(n) && /^(horas|e|da|de)$/.test(n2))) add("horas");
      if (NUMS.test(w) && !/^(um|uma|meia|meio-dia|meia-noite)$/.test(w)) add("numeros");
      if (/^(vou|vais|vai|vamos|vão|ia|iam|íamos)$/.test(w) && isInf(n)) add("irInf");
      if (POSS.test(w)) add("possessivos");
      if (DEM.test(w)) add("demonstrativos");
      if (tense("perfeito") && !/^(foi|foram|fui|fomos)$/.test(w) || (/^(fui|foi|fomos|foram)$/.test(w) && !PP(n))) add("perfeito");
      if ((CLIT.test(w) && finite(n) && /^(me|te|se|nos)$/.test(w)) || (sp && /^(me|te|se|nos)$/.test(sp.c) && cv.length)) add("reflexivos");
      if (t.clause || /^(e|ou|mas)$/.test(p)) {
        var imp = cv.some(function (v) { return v.tense === "subjPresente" && v.p === 2; }) && !/^(que|talvez|tomara|embora|caso)$/.test(p) ||
          (w === "não" && V(n).some(function (v) { return v.tense === "subjPresente" && v.p === 2; }));
        if (imp) add("imperativo");
      }
      if (hasLem(w, /^gostar$/) && /^(de|do|da|dos|das|disso|disto|deste|desta|dele|dela)$/.test(n) || (hasLem(w, /^gostar$/) && /^(muito|mais|bastante|tanto)$/.test(n) && /^(de|do|da|dos|das)$/.test(n2))) add("gostar");
      if (tense("imperfeito") && !/^(era|eram|tinha|tinham|havia|estava|estavam)$/.test(w) || /^(era|eram|tinha|tinham|estava|estavam)$/.test(w) && !PP(n)) add("imperfeito");
      if ((/^(o|a|os|as)$/.test(w) && finite(n) && !isNoun(n) && !ART.test(p) && !(tk[i + 1] && tk[i + 1].cap)) || /^(lhe|lhes)$/.test(w) ||
          (sp && /^(o|a|os|as|lhe|lhes)$/.test(sp.c))) add("pronomes");
      if (tense("futuro") && !isInf(w)) add("futuro");
      if (tense("condicional")) add("condicional");
      if (/^(mais|menos)$/.test(w)) {
        for (var k = i + 1; k <= i + 4 && k < tk.length && tk[k].w; k++) if (/^(que|do|da|dos|das)$/.test(tk[k].w) && (tk[k].w === "que" || W(k + 1) === "que")) { add("comparativos"); break; }
        if (/^(o|a|os|as)$/.test(p) && (isAdj(n) || known(n))) add("comparativos");
      }
      if (w === "tão" && /\b(quanto|como)\b/.test(tk.slice(i + 1, i + 5).map(function (x) { return x.w || ""; }).join(" "))) add("comparativos");
      if (/^(melhor|melhores|pior|piores|maior|maiores|menor|menores)$/.test(w) || /íssim[oa]s?$/.test(w)) add("comparativos");
      if (/^(nada|ninguém|nenhum|nenhuma|nunca|nem|jamais)$/.test(w)) add("negacoes");
      if (/^(tenho|tens|tem|temos|têm)$/.test(w) && PP(n) && !/^(que|de)$/.test(n)) add("perfeitoComposto");
      if (/^(tinha|tinhas|tínhamos|tinham|havia|haviam)$/.test(w) && (PP(n) || (/^(já|não|nunca|sempre)$/.test(n) && PP(n2)))) add("maisQuePerfeitoComposto");
      if (/^(é|são|foi|foram|era|eram|será|serão|seja|sejam|fosse|fossem|sido|ser)$/.test(w)) {
        var pk = /^(já|também|muito|sempre)$/.test(n) ? i + 2 : i + 1;
        if (PP(W(pk)) && !/^(nascido|nascida|morto|morta)$/.test(W(pk))) add("passiva");
      }
      if (/^que$/.test(w) || /^(talvez|tomara)$/.test(w)) {
        var vk = nextVerb(i, 5);
        if (vk > 0 && V(W(vk)).some(function (v) { return v.tense === "subjPresente"; }) && !V(W(vk)).some(function (v) { return v.tense === "presente"; })) add("subjuntivo");
      }
      if (/^(quando|se|assim|logo|enquanto|sempre|depois|conforme|como|onde|quem|caso)$/.test(w) && !(w === "se" && (isVerb(n) || CLIT.test(n)) && !SUBJ_PRON.hasOwnProperty(n))) {
        var start = /^(assim|logo|sempre|depois)$/.test(w) && n === "que" ? i + 1 : i;
        var fk = nextVerb(start, 4);
        var fw = W(fk);
        if (fk > 0 && V(fw).some(function (v) { return v.tense === "subjFuturo"; }) && (/(r|res|rmos|rem)$/.test(fw))) add("futSubj");
      }
      if (tense("subjImperfeito")) add("subjImperfeito");
      var infp = V(w).filter(function (v) { return v.tense === "infPessoal" && (v.p === 1 || v.p === 3 || v.p === 5); });
      if (infp.length && !V(w).some(function (v) { return v.tense !== "infPessoal" && v.tense !== "subjFuturo"; })) {
        var trigF = false;
        for (var q = i - 1; q >= Math.max(0, i - 3); q--) if (tk[q].w && /^(quando|se|assim|logo|enquanto|sempre|depois|conforme|caso)$/.test(tk[q].w)) trigF = true;
        if (!trigF) add("infPessoal");
      }
      if (/^(para|sem|de|até|ao|por)$/.test(w) && /^(eu|ele|ela|você|a)$/.test(n) && isInf(n === "a" && W(i + 2) === "gente" ? W(i + 3) : n2)) add("infPessoal");
      if (/^(tivesse|tivéssemos|tivessem|teria|teríamos|teriam|tiver|tivermos|tiverem|tenha|tenham|terei|terá|houvesse)$/.test(w) && PP(n)) add("hipotesePassado");
      if (SAY.test(w)) {
        for (var s2 = i + 1; s2 <= i + 3 && s2 < tk.length && tk[s2].w; s2++) if (/^(que|se|para|como|onde|quando|quem|o)$/.test(tk[s2].w)) { add("indireto"); break; }
      }
      if (sp && sp.c === "se" && cv.some(function (v) { return v.p === 2 || v.p === 5; })) add("se");
      if (w === "se" && /^(não|aqui|lá)$/.test(p) && V(n).some(function (v) { return v.p === 2 || v.p === 5; })) add("se");
      if (sp || (w.split("-").length === 3 && /^(ei|á|ás|emos|ão|ia|iam|íamos)$/.test(w.split("-")[2]))) add("encliticos");
      if (/^(à|às|àquele|àquela|àqueles|àquelas|àquilo)$/.test(w)) add("crase");
      if (cv.some(function (v) { return IRR_DERIV.test(v.lemma) && v.tense !== "infPessoal"; }) && !isInf(w)) add("irregDerivados");
      if (COLLOQ.test(w) || (w === "a" && n === "gente")) add("coloquial");
      if (/(ção|ções|mento|mentos|dade|dades|ência|ências|ância|âncias|ização)$/.test(w) && w.length > 6 && !finite(w)) add("nominalizacoes");
      if (tense("maisQuePerfeito") && !/^(fora|foram)$/.test(w)) add("maisQuePerfeito");
      if (/[aei]ndo$/.test(w) && w.length > 5 && (GER(w) || isInf(w.replace(/ndo$/, "r"))) && !/^(quando|mundo|segundo|fundo|redondo|lindo|vindo)$/.test(w)) add("gerundio");
      if ((t.start || t.clause) && PP(w) && (ART.test(n) || POSS.test(n) || DEM.test(n))) add("partAbs");
      if (w === "ao" && isInf(n)) add("aoInf");
      if (suffixed(w)) add("sufixos");
      if ((U.FALSOS && U.FALSOS[w] && U.FALSOS[w][0]) || (DATA.falsi && DATA.falsi[w]) || /^(copo|copos|escritório|escritórios|gorjeta|namorado|namorada)$/.test(w)) add("falsos");
      if (VARIANT.test(w)) add("variantes");
      if (w === "há" && !PP(n)) add("culto");
      if (sp || (w.split("-").length === 3)) add("culto");
      if (w === "nós" && (finite(n) || CLIT.test(n) || n === "," )) add("culto");
      if (/^(contudo|todavia|entretanto|outrossim|porquanto|destarte)$/.test(w)) add("culto");
      if (w === "cujo" || w === "cuja" || w === "cujos" || w === "cujas") add("relativos");
      if (w === "onde" && p && !t.start && !t.clause && tk[i - 1] && tk[i - 1].w && !/^(de|para|por|aonde)$/.test(p) && !(tk.slice(i).some(function (x) { return x.p === "?"; }) && tk.slice(i).filter(function (x) { return x.p; })[0] && tk.slice(i).filter(function (x) { return x.p; })[0].p === "?")) add("relativos");
      if (w === "quem" && PREPS.test(p)) add("relativos");
      var p2w = W(i - 2);
      var relPrep = /^(de|em|com|por|para|sobre|a)$/.test(p) && tk[i - 1] && tk[i - 1].w && p2w && !isVerb(p2w) && !ART.test(p2w) && !/^(que|mais|menos|antes|depois|até|desde|para|sem|a|fim|tão)$/.test(p2w) && !(p === "para" || p === "a");
      if (w === "que" && (isNoun(p) || relPrep || (p === "o" && !tk[i - 1].start && tk[i - 1].w && !/^(é|foi|era)$/.test(p2w)))) add("relativos");
      else if (w === "que" && tk[i - 1] && tk[i - 1].w && /[a-zà-ÿ]{3,}/.test(p) && !isVerb(p) && !ART.test(p) && !PREPS.test(p) && !/^(o|é|do|da|mais|menos|tão|já|ainda|porque|embora|antes|sem|até|para|desde|logo|assim|acho|disse|pensa|espero|quero|tomara|talvez|claro|bom|bem|pena|melhor|pior|possível|importante|provável|verdade|certeza|pouco)$/.test(p) && (known(p) || isAdj(p)) && !/mente$/.test(p) && !/^(isso|isto|aquilo|tudo|nada|algo|coisa|tanto|tal)$/.test(p) && p2w !== "tão" && p2w !== "tanto") add("relativos");
      if (/^(o|a|os|as)$/.test(w) && /^(qual|quais)$/.test(n)) add("relativos");
    });
    // multi-word counts on the text
    var count = function (list) {
      var used = {};
      list.forEach(function (c) { if (norm.indexOf(" " + c + " ") >= 0) used[c] = 1; });
      return Object.keys(used).length;
    };
    var countAll = function (list) {
      var n = 0;
      list.forEach(function (c) { var at = 0, s = " " + c + " "; while ((at = norm.indexOf(s, at)) >= 0) { n++; at += s.length - 1; } });
      return n;
    };
    f.conectores = count(CONN);
    f.modalizadores = count(MODAL);
    f.dicendi = count(DICENDI);
    f.formal = count(FORMAL);
    f.conjuncoes = countAll(CONJ_SUBJ.filter(function (c) { return c !== "logo que"; }));
    f.expressoes = (norm.match(EXPR) || []).length;
    f.regencia = regenciaCount(tk);
    f.words = ws.length;
    return f;
  }

  function regenciaCount(tk) {
    var R = U.REGENCIA || {}, n = 0;
    tk.forEach(function (t, i) {
      if (!t.w) return;
      var ls = lemmas(t.w).concat(PP(t.w) ? [PP(t.w).replace(/-se$/, "")] : []).concat(isInf(t.w) ? [t.w] : []);
      var nx = tk[i + 1] && tk[i + 1].w || "", nx2 = tk[i + 2] && tk[i + 2].w || "";
      if (/^(muito|mais|sempre|também|bastante|tanto)$/.test(nx)) { nx = nx2; }
      var pi = U.prepInfo ? U.prepInfo(nx) : null;
      if (!pi) return;
      if (ls.some(function (l) { return R[l] && R[l][0] && R[l][0] === pi.base && !/^(ir|chegar|voltar|começar|aprender|ensinar|ajudar|continuar|deixar|acabar|parar|tratar|morar|entrar)$/.test(l); })) n++;
    });
    return n;
  }

  // A word with a derivational suffix whose base is known.
  var SUFF_BASES = "café pão quente casa gol jornal sorvete bonachão livro carro cachorro gato bolo copo mesa rua praia pouco cedo agora " +
    "obrigado amigo filho neto beijo abraço jeito tempo sol flor papel mulher homem lugar peixe chá fruta pedra barco sapato cabeça " +
    "bola mão porta janela doce bom baixo lento devagar calmo quieto rápido feio pobre velho novo caro barato forte grande livro loja";
  var SUFF_BASE = Object.create(null);
  SUFF_BASES.split(" ").forEach(function (b) { SUFF_BASE[b] = 1; });
  var SUFF = /^(.{2,}?)(zinhos|zinhas|zinho|zinha|inhos|inhas|inho|inha|zão|zona|ão|ões|ona|onas|aço|aços|ada|eiro|eira|eiros|eiras|ista|istas|udo|uda)$/;
  var NOT_SUFF = /^(cozinha|vizinho|vizinha|vizinhos|caminho|carinho|sozinho|sozinha|marinho|padrinho|madrinha|linha|farinha|galinha|rainha|ninho|vinho|espinho|sobrinho|sobrinha|moinho|ainda|tinha|vinha|mão|são|não|irmão|pão|chão|avião|ação|nação|feijão|limão|coração|verão|cão|então|razão|estação|canção|visão|opinião|televisão|questão|lição|bastão|mamão|sabão|violão|botão|balcão|capitão|alemão|cidadão|cristão|leão|melão|questão|região|religião|salão|sertão|pessoa|madeira|cadeira|bandeira|carteira|primeiro|primeira|feira|brasileiro|brasileira|terceiro|dinheiro|janeiro|fevereiro|banheiro|companheiro|engenheiro|estrangeiro|verdadeiro|inteiro|inteira|cozinheiro|pedreiro|parceiro|carneiro|cheiro|mineiro|mineira|solteiro|solteira|chuveiro|travesseiro|bombeiro|parada|chegada|estrada|entrada|saída|morada|jornada|piada|salada|calçada|camada|fachada|tomada|pomada|madrugada|garagem|artista|motorista|turista|jornalista|dentista|lista|revista|pista|vista|conquista|entrevista)$/;
  function suffixed(w) {
    if (!w || NOT_SUFF.test(w) || V(w).length || PP(w)) return false;
    var m = SUFF.exec(w);
    if (!m) return false;
    var st = m[1], suf = m[2];
    if (/^zinh|^zão|^zona/.test(suf)) return true;
    var cands = [st, st + "o", st + "a", st + "e", st.replace(/qu$/, "c") + "o", st.replace(/gu$/, "g") + "o", st.replace(/c$/, "ç") + "o", st + "ão", st.replace(/r$/, "rão")];
    return cands.some(function (c) { return SUFF_BASE[c] || (DATA.lex[c] && !V(c).length) || (lexiN > lexiBase + 500 && LEXI[c] && !V(c).length && c.length > 2); });
  }

  /* ------------------------------------------------------------ errores */

  // Palabras frecuentes del castellano rioplatense que no están en las tablas del diagnóstico.
  var ES_EXTRA = Object.create(null);
  ("pibe:rapaz piba:moça laburo:trabalho laburar:trabalhar boludo:bobo che:ei re:muito posta:verdade quilombo:bagunça " +
   "chabón:cara mina:mina bondi:ônibus birra:cerveja joda:festa chamuyo:papo pileta:piscina medialunas:croissants facturas:doces " +
   "alfajor:alfajor mate:chimarrão asado:churrasco buenísimo:ótimo lindísimo:lindíssimo muchísimo:muitíssimo").split(" ").forEach(function (x) {
    var p = x.split(":"); if (p[0] !== p[1]) ES_EXTRA[p[0]] = p[1];
  });
  // Préstamos que el portugués usa tal cual o que son nombres de cosas del Río de la Plata.
  var LOANS = "empanada empanadas alfajor alfajores mate asado dulce leche chimichurri tango tangos milonga fernet malbec gaucho gauchos " +
              "choripán medialuna provoleta quincho yerba pampa pampas futevôlei pix wi-fi funk rap rock jazz show shows kit online";
  learn([LOANS]);
  var LOAN = Object.create(null); LOANS.split(" ").forEach(function (w) { LOAN[w] = 1; });

  // An unknown word that is the regular form of an irregular verb (fazi → fiz).
  // Verbs too short or too rare to guess from, and regular forms that are real words.
  var REG_SKIP = /^(ser|estar|ter|haver|ir|ver|vir|dar|ler|crer|rir|pôr|reaver|prover|rever|reler|prever|deter|reter|conter|manter|obter|abster|abster-se|entreter|convir|provir|intervir|doer|construir|destruir|proibir|reunir|reunir-se|sorrir|cair|sair|requerer|despedir-se|opor|dispor|compor)$/;
  var REG_STOP = /^(cabo|cabos|medo|meda|perda|perdas|vala|valas|vale|pedo|poda|podas|saba|sabas|reta|reto|manta|tema|dita|pona|ponas|repona|poneu|medas)$/;
  var REGMAP = null;
  function regMap() {
    if (REGMAP) return REGMAP;
    REGMAP = Object.create(null);
    if (!Conj || !Conj.list) return REGMAP;
    Conj.list().forEach(function (v) {
      var info = null;
      try { info = Conj.info(v); } catch (e) { return; }
      if (!info || !info.irr || REG_SKIP.test(v)) return;
      ["presente", "perfeito", "futuro", "condicional", "subjPresente", "imperfeito"].forEach(function (t) {
        var real, reg;
        try { real = Conj.conjugate(v, t); reg = Conj.regular(v, t); } catch (e) { return; }
        (reg || []).forEach(function (r, p) {
          var rr = String(r).split(" ").pop(), re = String(real[p] || "").split(" ").pop();
          if (rr && re && rr.length >= 4 && rr !== re && !V(rr).length && !REGMAP[rr] && !REG_STOP.test(rr)) REGMAP[rr] = [re, v, t];
        });
      });
      try {
        var rp = Conj.regular(v, "participio"), pp = Conj.participle(v);
        if (rp && pp && rp !== pp && !PP(rp) && !REGMAP[rp]) {
          REGMAP[rp] = [pp, v, "participio"];
          [["a", "a"], ["os", "os"], ["as", "as"]].forEach(function (x) { REGMAP[rp.replace(/o$/, x[0])] = [pp.replace(/o$/, x[1]), v, "participio"]; });
        }
      } catch (e) { /* */ }
    });
    return REGMAP;
  }

  // Spanish spellings turned Portuguese, for an unknown word.
  var ES_TR = [[/ñ/g, "nh", 1], [/ll/g, "lh", 1], [/ción$/, "ção", 1], [/ciones$/, "ções", 1], [/cion$/, "ção", 1], [/sión$/, "são", 1],
               [/siones$/, "sões", 1], [/zón$/, "ção", 1], [/ón$/, "ão", 1], [/ones$/, "ões", 1], [/idad$/, "idade", 1], [/dad$/, "dade", 1],
               [/tad$/, "dade", 1], [/dades$/, "dades", 1], [/bles$/, "veis", 1], [/ble$/, "vel", 1], [/aje$/, "agem", 1], [/ajes$/, "agens", 1],
               [/miento$/, "mento", 1], [/mientos$/, "mentos", 1], [/aba$/, "ava", 1], [/abas$/, "avas", 1], [/aban$/, "avam", 1],
               [/ábamos$/, "ávamos", 1], [/ue/g, "o", 1], [/ie/g, "e", 1], [/^h/, "", 1], [/j/g, "lh", 1], [/y/g, "i", 1],
               [/n$/, "m", 0], [/ns$/, "ns", 0], [/an$/, "am", 0], [/([aeiou])s([aeiou])/g, "$1ss$2", 0], [/ss/g, "s", 0],
               [/([aeiou])r([aeiou])/g, "$1rr$2", 0], [/rr/g, "r", 0], [/c([ao])/g, "ç$1", 0], [/z/g, "ç", 0], [/z/g, "s", 0],
               [/qu(?=[ao])/g, "c", 0], [/ci/g, "ç", 0], [/b/g, "v", 0], [/v/g, "b", 0], [/n(?=[pb])/g, "m", 0], [/ls$/, "is", 0]];
  function esTransform(w) {
    var tried = {};
    var one = function (x, k) { var r = ES_TR[k], y = x.replace(r[0], r[1]); return y !== x ? y : null; };
    for (var a = 0; a < ES_TR.length; a++) {
      var c1 = one(w, a);
      if (!c1) continue;
      if (known(c1)) return { pt: c1, es: !!ES_TR[a][2] };
      tried[c1] = a;
    }
    for (var x in tried) for (var b = 0; b < ES_TR.length; b++) {
      if (b === tried[x]) continue;
      var c2 = one(x, b);
      if (c2 && known(c2)) return { pt: c2, es: !!(ES_TR[tried[x]][2] || ES_TR[b][2]) };
    }
    return null;
  }
  // A Portuguese plural made the Spanish way (animals, papels, homems, pãos).
  function pluralFix(w) {
    var s, cands = [];
    if (/ls$/.test(w)) { s = w.slice(0, -1); cands.push(s.replace(/al$/, "ais").replace(/el$/, "éis").replace(/ol$/, "óis").replace(/ul$/, "uis").replace(/il$/, "is")); }
    if (/les$/.test(w)) { s = w.slice(0, -2); cands.push(s.replace(/al$/, "ais").replace(/el$/, "éis").replace(/ol$/, "óis").replace(/ul$/, "uis")); }
    if (/ms$/.test(w)) cands.push(w.replace(/ms$/, "ns"));
    if (/mes$/.test(w)) cands.push(w.replace(/mes$/, "ns"));
    if (/(ãos|ães|ões|ãoes|aos|ãos)$/.test(w)) { var st = w.replace(/(ãos|ães|ões|ãoes|aos)$/, ""); cands.push(st + "ões", st + "ães", st + "ãos"); }
    if (/ones$/.test(w)) cands.push(w.replace(/ones$/, "ões"));
    for (var i = 0; i < cands.length; i++) if (cands[i] !== w && (known(cands[i]) || DATA.nounsByPlural[cands[i]])) return cands[i];
    return null;
  }

  var MOTION = /^(ir|chegar|voltar|levar|vir|dirigir|subir|descer|regressar)$/;
  var PLACES_F = /^(praia|feira|festa|escola|faculdade|universidade|igreja|padaria|farmácia|academia|lagoa|lapa|urca|tijuca|glória|biblioteca|livraria|loja|rua|estação|cidade|zona|serra|ilha|barra|rodoviária|pousada|cachoeira|missa|aula|reunião|piscina|quadra|favela|floresta|montanha|baía|europa|argentina|bahia|itália|frança|espanha|alemanha|inglaterra|amazônia|áfrica|ásia|américa|colômbia|venezuela|bolívia|china|índia)$/;
  var DO_VERB = /^(ver|conhecer|amar|ajudar|convidar|visitar|esperar|chamar|encontrar|abraçar|beijar|cumprimentar|buscar|procurar|escutar|ouvir|olhar|entender|acompanhar|admirar|respeitar|odiar|adorar|receber|levar)$/;
  var PERSON_N = /^(pai|mãe|pais|irmão|irmã|irmãos|irmãs|filho|filha|filhos|filhas|avô|avó|avós|tio|tia|tios|primo|prima|primos|amigo|amiga|amigos|amigas|namorado|namorada|marido|esposa|mulher|homem|menino|menina|meninos|crianças|professor|professora|professores|chefe|colega|colegas|vizinho|vizinha|vizinhos|médico|médica|senhor|senhora)$/;
  var TIME_DONE = /^(ontem|anteontem|passado|passada|atrás)$/;
  var SUBJ_TRIG = /^(espero|esperamos|espera|esperam|quero|queremos|quer|querem|tomara|talvez|importante|necessário|preciso|possível|impossível|provável|melhor|pena|duvido|duvida|peço|pede|prefiro|prefere|recomendo|sugiro|aconselho|desejo|deseja|lamento|é bom|bom|ótimo|estranho|embora|caso|para que|antes que|sem que|até que|a fim de que|mesmo que|ainda que|contanto que|desde que)$/;

  function lint(text, week) {
    week = week || 52;
    var tk = toks(text), out = [];
    var push = function (i, n, cat, msg, soft) {
      if (out.some(function (f) { return i < f.i + f.n && f.i < i + (n || 1); })) return;
      out.push({ i: i, n: n || 1, cat: cat, msg: msg, soft: !!soft });
    };
    var it = function (s) { return "*" + s + "*"; };
    var wi = function (k, dir) { for (var x = k + dir; x >= 0 && x < tk.length; x += dir) { if (tk[x].w) return x; if (tk[x].p && /[.!?]/.test(tk[x].p)) return -1; } return -1; };
    var W = function (k) { return k >= 0 && tk[k] && tk[k].w || ""; };
    var lexKeys = null;
    var sentence = function (i) {
      var a = i, b = i;
      while (a > 0 && !(tk[a - 1].p && /[.!?]/.test(tk[a - 1].p))) a--;
      while (b < tk.length - 1 && !(tk[b + 1].p && /[.!?]/.test(tk[b + 1].p))) b++;
      return tk.slice(a, b + 1).filter(function (x) { return x.w; }).map(function (x) { return x.w; });
    };

    tk.forEach(function (t, i) {
      if (!t.w) return;
      var w = t.w, ni = wi(i, 1), n = W(ni), n2 = W(wi(ni, 1)), pi = wi(i, -1), p = W(pi), p2 = W(wi(pi, -1));
      var nxt = ni >= 0 ? tk[ni] : null;
      var proper = t.cap && (!t.start || (nxt && nxt.cap && ni === i + 1));
      var sp = U.splitEnclitic ? U.splitEnclitic(w) : null;

      /* 1. Español metido */
      var esW = !proper && !LOAN[w] && !LEXI[w] && (ES_EXTRA[w] || (U.spanishWord && U.spanishWord(w)));
      if (esW && !(w === "como" || w === "a" || w === "o") && !(t.cap && t.start && /^(la|el)$/.test(w) && nxt && nxt.cap)) {
        var tr = String(esW).split(" / ")[0];
        if (/^(muy|mucho|mucha|muchos|muchas)$/.test(U.deaccent(w))) return push(i, 1, "muito", it(t.o) + " es español: «muy» y «mucho» son " + it(/^(muy|mucho)$/.test(U.deaccent(w)) ? "muito" : w.replace(/^much/, "muit")) + ".");
        if (/^gust/.test(U.deaccent(w))) return push(i, 1, "gostar", it(t.o) + " es español: en portugués " + it("gostar de") + ", con la persona como sujeto (eu gosto de…).");
        if (/^(el|la|los|las)$/.test(w) && /^(de|en|a)$/.test(p)) return push(pi, 2, "contraccion", it(p + " " + w) + " es español: " + it({ "de el": "do", "de la": "da", "de los": "dos", "de las": "das", "en el": "no", "en la": "na", "en los": "nos", "en las": "nas", "a el": "ao", "a la": "à", "a los": "aos", "a las": "às" }[p + " " + w] || "no / do / ao") + ".");
        if (/^(del|al)$/.test(w)) return push(i, 1, "contraccion", it(t.o) + " es español: " + it(w === "del" ? "do (da, dos, das)" : "ao (à, aos, às)") + ".");
        if (/^(le|les|lo)$/.test(w)) return push(i, 1, "pronome", it(t.o) + " es español: " + it(w === "lo" ? "o" : w === "le" ? "lhe" : "lhes") + ".");
        if (/^(he|ha|han|hemos|has)$/.test(w) && PP(n)) return push(i, 2, "perfeito_composto", it(t.o + " " + n) + " es español: «he comido» se dice con el perfeito simple, " + it(conjForm(PP(n), "perfeito", { he: 0, has: 2, ha: 2, hemos: 3, han: 5 }[w]) || "comi") + ".");
        return push(i, 1, "espanol", it(t.o) + " es español; en portugués: " + it(tr) + ".");
      }
      if (/^(y)$/.test(w)) return push(i, 1, "espanol", it("y") + " es español: la conjunción es " + it("e") + ".");

      /* 2. Palabra que no existe: tilde, nasal, cedilla, grafía española, tipeo */
      if (!proper && !t.cap && /^[a-zà-ÿ-]+$/.test(w) && w.length > 1 && !known(w) && !LOAN[w] && !menteOK(w) && !suffixed(w) && !(/[aei]ndo$/.test(w) && isInf(w.replace(/ndo$/, "r")))) {
        var rm = regMap()[w];
        if (rm) return push(i, 1, rm[2] === "participio" ? "participio" : "regularizacion", it(rm[1]) + " es irregular: " + it(rm[0]) + ", no " + it(t.o) + ".");
        if (/^(seje|sejem|esteje|estejem)$/.test(w)) return push(i, 1, "verbo_irregular", "El subjuntivo es " + it(w.replace(/je/, "ja")) + ".");
        if (!lexKeys) lexKeys = Object.keys(LEXI).concat(Object.keys(DATA.lex));
        var da = U.deaccent(w), best = null;
        for (var k = 0; k < lexKeys.length && !best; k++) if (U.deaccent(lexKeys[k]) === da && lexKeys[k] !== w) best = lexKeys[k];
        if (!best) {
          var vf = V(w.replace(/c/g, "ç")).length ? w.replace(/c/g, "ç") : null;
          if (vf) best = vf;
        }
        if (best) {
          if (/[ãõ]/.test(best) && !/[ãõ]/.test(w)) return push(i, 1, "nasal", "Falta la til de la vocal nasal: " + it(best) + ".");
          if (/ç/.test(best) && !/ç/.test(w)) return push(i, 1, "ortografia", "Falta la cedilla: " + it(best) + ".");
          if (/(éia|éias|ôo|ôos|ü|êem|óia|óias|éico|éica)/.test(w)) return push(i, 1, "ortografia", "Desde el Acuerdo de 1990: " + it(best) + ".");
          return push(i, 1, "tilde", (/[áéíóúâêôà]/.test(best) ? "Falta o sobra una tilde" : "Revisá la tilde") + ": " + it(best) + ".");
        }
        var pf = pluralFix(w);
        if (pf) return push(i, 1, "plural", "El plural es " + it(pf) + ".");
        var trx = esTransform(w);
        if (trx) {
          var nasalT = (/m$/.test(trx.pt) && /n$/.test(w)) || (/mp|mb/.test(trx.pt) && /np|nb/.test(w));
          var cedT = /ç/.test(trx.pt) && !/ç/.test(w) && trx.pt.replace(/ç/g, "c") === w;
          return push(i, 1, trx.es ? "espanol" : nasalT ? "nasal" : "ortografia",
            trx.es ? it(t.o) + " está escrita a la española: " + it(trx.pt) + "." : cedT ? "Falta la cedilla: " + it(trx.pt) + "." : "Se escribe " + it(trx.pt) + ".",
            !trx.es && !nasalT && !cedT && lexiN < 5000);
        }
        if (U.looksSpanish && U.looksSpanish(w)) return push(i, 1, "espanol", it(t.o) + " parece español: revisá cómo se dice en portugués.", lexiN < 5000);
        if (/[^aeiouãõ]s$/.test(w) && known(w.slice(0, -1)) && !/ns$/.test(w)) return push(i, 1, "plural", "Revisá el plural de " + it(w.slice(0, -1)) + ".");
        var bd = 9, near = null, lim = w.length > 6 ? 2 : 1;
        for (var k2 = 0; k2 < lexKeys.length; k2++) {
          var c = lexKeys[k2];
          if (Math.abs(c.length - w.length) > lim || c.indexOf(" ") >= 0) continue;
          var d = U.editDistance(c, w);
          if (d < bd) { bd = d; near = c; }
        }
        if (near && bd <= lim && lexiN < 5000) push(i, 1, "tipeo", "¿Quisiste decir " + it(near) + "?", true);
        else if (lexiN < 5000) push(i, 1, "lexico", "No conozco " + it(t.o) + ": revisá cómo se escribe.", true);
        return;
      }

      /* 3. Contracciones sin hacer: em o → no, de ele → dele, a a → à */
      if (/^(em|de|a|por|en)$/.test(w) && ni === i + 1 && !tk[ni].cap) {
        var pw = w === "en" ? "em" : w;
        var cf = U.contract ? U.contract(pw, n) : null;
        if (cf && !(/^(ele|ela|eles|elas|este|esta|esse|essa|aquele|aquela)$/.test(n) && isInf(n2)) && !(pw === "a" && /^(o|os)$/.test(n) && isVerb(n2)) && !(pw === "a" && n === "a" && isVerb(n2)) &&
            !(pw === "em" && /^(um|uma|uns|umas)$/.test(n)) && !(pw === "de" && /^(um|uma|uns|umas)$/.test(n)) && !(pw === "de" && /^(o|a|os|as)$/.test(n) && isInf(n2))) {
          if (cf.charAt(0) === "à") return push(i, 2, "crase", it(w + " " + n) + " se funden con acento grave: " + it(cf) + " (crase).");
          return push(i, 2, "contraccion", it(w + " " + n) + " se contrae: " + it(cf) + (w === "en" ? " (y *en* es español)" : "") + ".");
        }
      }
      // em / de / a + país con artículo: em Brasil → no Brasil
      if (/^(em|de|a|para)$/.test(w) && nxt && nxt.cap && U.PLACE_ART && U.PLACE_ART[n] && !(n === "rio" && W(wi(ni, 1)) === "de" && false)) {
        if (!(n === "rio" && /^(grande|negro|branco|madeira|são)$/.test(n2))) {
          var ga = U.PLACE_ART[n] === "f" ? "a" : "o";
          var cf2 = w === "para" ? "para " + ga : U.contract(w, ga);
          return push(i, 1, "contraccion", it(nxt.o) + " lleva artículo: " + it(cf2 + " " + nxt.o) + ".");
        }
      }

      /* 4. Artículo o contracción + sustantivo de otro género */
      var artW = ART.test(w) ? w : (U.CONTR && U.CONTR[w] && ART.test(U.CONTR[w][1]) ? U.CONTR[w][1] : null);
      if (artW && ni === i + 1 && !tk[ni].cap && !(/^(o|a|os|as)$/.test(w) && (finite(n) || isInf(n)))) {
        var gn = nounGN(n);
        var A = U.ARTICLES && U.ARTICLES[artW];
        if (gn && A && gn.g !== A[0] && !isAdj(n) && !V(n).length) {
          var want = { m: { o: "o", a: "o", os: "os", as: "os", um: "um", uma: "um", uns: "uns", umas: "uns" }, f: { o: "a", a: "a", os: "as", as: "as", um: "uma", uma: "uma", uns: "umas", umas: "umas" } }[gn.g][artW];
          var shown = w === artW ? want : U.contract(U.CONTR[w][0], want);
          var hes = U.HETERO_ES && (U.HETERO_ES[n] || U.HETERO_ES[n.replace(/s$/, "")]);
          push(i, 2, "genero", it(n) + " es " + (gn.g === "m" ? "masculino" : "femenino") + ": " + it(shown + " " + n) + (hes ? " (en español, " + hes + ")." : "."));
        }
      }

      /* 5. muito */
      if (/^(muito|muita|muitos|muitas|pouco|pouca|poucos|poucas)$/.test(w) && ni === i + 1) {
        var base = w.replace(/(o|a|os|as)$/, "");
        var gnM = nounGN(n);
        if (isAdj(n) && !isNoun(n) && w !== base + "o" && !nounGN(n) && !(/^(muitos|muitas|poucos|poucas)$/.test(w) && (/s$/.test(n))) ) push(i, 1, "muito", "Delante de un adjetivo es invariable: " + it(base + "o " + n) + ".");
        else if (gnM && gnM.n && base + { ms: "o", fs: "a", mp: "os", fp: "as" }[gnM.g + gnM.n] !== w && !isAdj(n))
          push(i, 1, "muito", "Delante de un sustantivo concuerda: " + it(base + { ms: "o", fs: "a", mp: "os", fp: "as" }[gnM.g + gnM.n] + " " + n) + ".");
      }
      if (/^(mais|más)$/.test(w) && /^(grande|grandes|bom|boa|bons|boas|mau|má|ruim)$/.test(n) && !/^(do|que)$/.test(n2)) {
        var cmp = { grande: "maior", grandes: "maiores", bom: "melhor", boa: "melhor", bons: "melhores", boas: "melhores", mau: "pior", "má": "pior", ruim: "pior" }[n];
        push(i, 2, "regularizacion", "Comparativo irregular: " + it(cmp) + " (no " + it(w + " " + n) + ").");
      }

      /* 6. gostar sin de; me gusta / me gosta */
      if (hasLem(w, /^gostar$/) && !/^(gostaria|gostarias|gostaríamos|gostariam)$/.test(w) || /^(gostaria|gostaríamos|gostariam)$/.test(w)) {
        var gk = ni;
        while (gk >= 0 && /^(muito|mais|bastante|tanto|também|demais|pouco|sempre|nada|menos)$/.test(W(gk))) gk = wi(gk, 1);
        var gw = W(gk);
        if (gk >= 0 && gw && !/^(de|do|da|dos|das|disso|disto|daquilo|deste|desta|desse|dessa|daquele|daquela|dele|dela|deles|delas|dum|duma|que|quando|se|e|mas|porque|ou)$/.test(gw) && !(tk[gk - 1] && tk[gk - 1].p && gk - 1 > i) && !/^(me|te|se|nos|lhe)$/.test(gw))
          push(i, gk - i + 1, "gostar", it("Gostar") + " lleva siempre " + it("de") + ": " + it(w + " " + (ART.test(gw) && /^(o|a|os|as)$/.test(gw) ? { o: "do", a: "da", os: "dos", as: "das" }[gw] : "de " + gw)) + ".");
        if (/^(me|te|lhe|nos)$/.test(p) && /^(gosta|gostam)$/.test(w)) push(pi, 2, "gostar", it(p + " " + w) + " es un calco de «me gusta»: " + it("eu gosto de…") + " (la persona es el sujeto).");
      }

      /* 7. «a» personal */
      if (/^(a|ao|aos)$/.test(w) && pi >= 0 && (lemmas(p).some(function (l) { return DO_VERB.test(l); }) || DO_VERB.test(PP(p) || "")) && ni >= 0) {
        var isP = (w !== "a" && (tk[ni].cap || PERSON_N.test(n) || POSS.test(n))) || (w === "a" && (/^(meu|meus|teu|seu|seus|nosso|nossos|minhas|suas|nossas|ele|eles|você|vocês|todos|ninguém|alguém|o|os)$/.test(n)));
        if (isP && !/^(casa|pé)$/.test(n) && !isInf(n)) push(i, 1, "a_personal", "Sin «a»: el objeto directo de persona va directo (" + it(p + (w === "ao" ? " o" : w === "aos" ? " os" : "") + " " + tk[ni].o) + ").");
      }

      /* 8. perfeito composto con un pasado cerrado; «he comido» */
      if (/^(tenho|tens|tem|temos|têm)$/.test(w) && PP(n) && !/^(que|de)$/.test(n)) {
        var sw = sentence(i);
        var closed = sw.some(function (x, k) { return TIME_DONE.test(x) || /^(1[89]\d\d|20\d\d)$/.test(x) || (x === "há" && /^(\d+|um|uma|dois|duas|três|muito|pouco|alguns|algumas|anos|meses)$/.test(sw[k + 1] || "")); }) ||
          /(^| )(hoje|esta manhã|hoje de manhã|uma vez|já|nunca|ainda não)( |$)/.test(sw.join(" "));
        if (closed) {
          var pf2 = conjForm(PP(n), "perfeito", { tenho: 0, tens: 1, tem: 2, temos: 3, "têm": 5 }[w]);
          push(i, 2, "perfeito_composto", it(w + " " + n) + " es «vengo " + "…»: para algo terminado va el perfeito simple" + (pf2 ? ", " + it(pf2) : "") + ".");
        }
      }

      /* 9. futuro do subjuntivo: se eu ter, quando eu chego (…vou) */
      if (/^(se|quando|assim|logo|enquanto|sempre|depois|caso)$/.test(w) && week >= 17 && !(w === "se" && (CLIT.test(n) && finite(n2) === false))) {
        var st = /^(assim|logo|sempre|depois)$/.test(w) ? (n === "que" ? ni : -1) : i;
        if (st >= 0) {
          var vk = wi(st, 1), subjP = null;
          while (vk >= 0 && (SUBJ_PRON[W(vk)] != null || /^(não|me|te|se|nos|lhe|já|a|gente)$/.test(W(vk)))) {
            if (SUBJ_PRON[W(vk)] != null) subjP = SUBJ_PRON[W(vk)];
            if (W(vk) === "gente") subjP = 2;
            vk = wi(vk, 1);
          }
          var vw = W(vk), rd = V(vw);
          var sw2 = sentence(i).join(" ");
          var futureMain = /\b(vou|vai|vamos|vão|amanhã|próximo|próxima|que vem|depois)\b/.test(sw2) || /(rei|rá|remos|rão)\b/.test(sw2) || /^(quando|se)$/.test(w) && /\b(liga|ligue|me avisa|avisa|venha|vem|traga|leve|chame)\b/.test(sw2);
          if (vk >= 0 && vw && !tk[vk].cap) {
            var pers = subjP != null ? subjP : 2;
            var fs = conjForm(firstLemma(vw), "subjFuturo", pers);
            if (isInf(vw) && fs && fs !== vw && week >= 27) push(vk, 1, "futuro_subj", "Con *" + (w === "se" ? "se" : w) + "* y el futuro va el futuro do subjuntivo: " + it(fs) + " (no el infinitivo).");
            else if (rd.length && rd.every(function (v) { return v.tense === "subjPresente"; }) && w !== "caso" && fs && week >= 27) push(vk, 1, "futuro_subj", "Para el futuro, el portugués usa el futuro do subjuntivo: " + it(fs) + " (el «cuando llegue» del español).");
            else if (w === "quando" && futureMain && rd.some(function (v) { return v.tense === "presente" && v.p === pers; }) && !rd.some(function (v) { return v.tense === "subjFuturo"; }) && fs && fs !== vw && week >= 27)
              push(vk, 1, "futuro_subj", "Hablando del futuro, después de " + it("quando") + " va el futuro do subjuntivo: " + it(fs) + ".", true);
            else if (w === "se" && rd.some(function (v) { return v.tense === "condicional"; }) && week >= 18 && (t.clause || /^(e|mas|ou|que|porque|mesmo|só|nem|como|pois)$/.test(p))) {
              var si = conjForm(firstLemma(vw), "subjImperfeito", rd.filter(function (v) { return v.tense === "condicional"; })[0].p);
              push(vk, 1, "subjuntivo", "Después de *se* no va condicional: " + it(si || "se eu tivesse…") + " (el condicional va en la otra parte).");
            }
          }
        }
      }

      /* 10. subjuntivo después de espero que, é importante que, embora… */
      if (week >= 23 && (w === "que" && SUBJ_TRIG.test(p) || /^(talvez|tomara|embora|caso)$/.test(w) || (w === "que" && /^(para|antes|sem|até|mesmo|ainda|desde|contanto)$/.test(p)))) {
        var sk = wi(i, 1), sp2 = null;
        if (w === "tomara" && W(sk) === "que") sk = wi(sk, 1);
        while (sk >= 0 && (SUBJ_PRON[W(sk)] != null || /^(não|me|te|se|nos|lhe|o|a|os|as|já|ainda|gente)$/.test(W(sk)) || (tk[sk].cap && !tk[sk].start) || isNoun(W(sk)) || DEM.test(W(sk)) || POSS.test(W(sk)))) {
          if (SUBJ_PRON[W(sk)] != null) sp2 = SUBJ_PRON[W(sk)];
          if (isNoun(W(sk)) && nounGN(W(sk))) sp2 = nounGN(W(sk)).n === "p" ? 5 : 2;
          sk = wi(sk, 1);
        }
        var sv = V(W(sk));
        if (sk >= 0 && sv.length && !sv.some(function (v) { return /^subj/.test(v.tense) || v.tense === "infPessoal"; }) && !(w === "talvez" && false)) {
          var pres = sv.filter(function (v) { return v.tense === "presente"; });
          var pick = pres.filter(function (v) { return v.p === sp2; })[0] || pres.filter(function (v) { return v.p === 2; })[0] || pres[0];
          var sf = pick && conjForm(pick.lemma, "subjPresente", pick.p);
          if (sf && sf !== W(sk)) push(sk, 1, "subjuntivo", "Después de " + it(w === "que" ? p + " que" : w) + " va subjuntivo: " + it(sf) + ".");
        }
      }
      if (w === "que" && /^(acho|achamos|acha|acham|acredito|creio|penso)$/.test(p) && week >= 23) {
        var ak = wi(i, 1);
        while (ak >= 0 && (SUBJ_PRON[W(ak)] != null || /^(não|me|te|se|nos|lhe|já)$/.test(W(ak)))) ak = wi(ak, 1);
        var av = V(W(ak));
        if (av.length && av.every(function (v) { return v.tense === "subjPresente"; })) {
          var ind = conjForm(av[0].lemma, "presente", av[0].p);
          if (ind) push(ak, 1, "subjuntivo", it(p + " que") + " afirma una opinión: va indicativo, " + it(ind) + ".");
        }
      }

      /* 11. infinitivo pessoal: para eles saber → saberem */
      if (week >= 29 && /^(para|sem|de|até|após|antes|depois)$/.test(w) && /^(nós|eles|elas|vocês|tu)$/.test(n) && isInf(n2) && !/^(ser)$/.test(p)) {
        var ip = conjForm(n2, "infPessoal", { "nós": 3, eles: 5, elas: 5, "vocês": 5, tu: 1 }[n]);
        if (ip && ip !== n2) push(wi(ni, 1), 1, "inf_pessoal", "Con sujeto propio el infinitivo lleva persona: " + it(w + " " + n + " " + ip) + ".");
      }

      /* 12. pronombres */
      if (/^(para|pra|por|sem|de|a|contra|entre)$/.test(w) && /^(mí|mi)$/.test(n)) push(ni, 1, "pronome", "Después de preposición: " + it(w + " mim") + ".");
      if (/^(para|pra)$/.test(w) && n === "eu" && !isInf(n2) && !finite(n2) && tk[ni + 1] && (tk[ni + 1].p || !isVerb(n2))) push(ni, 1, "pronome", "Sin verbo detrás va " + it("para mim") + " (para eu solo delante de un infinitivo: para eu fazer).");
      if (w === "com" && /^(eu|mim|mí)$/.test(n)) push(i, 2, "pronome", "Con *com* se funde: " + it("comigo") + ".");
      if (w === "com" && n === "nós" && !/^(todos|dois|três|mesmos|próprios)$/.test(n2)) push(i, 2, "pronome", "Con *com*: " + it("conosco") + ".", true);
      if (w === "conmigo") push(i, 1, "pronome", it("conmigo") + " es español: " + it("comigo") + ".");

      /* 13. colocação: enclisis después de un atractor */
      if (sp && /^(não|nunca|jamais|que|quem|já|também|sempre|ainda|só|talvez|se|quando|onde|como|porque|ninguém|nada|tudo)$/.test(p) && !isInf(sp.v) && !(p === "se" && false) && !GER(sp.v))
        push(pi, 2, "colocacao", it(p) + " atrae el pronombre delante del verbo: " + it(p + " " + sp.c + " " + sp.v) + ".");

      /* 14. crase */
      if (w === "a" && pi >= 0 && ni === i + 1 && PLACES_F.test(n) && (lemmas(p).some(function (l) { return MOTION.test(l); }) || isInf(p) && MOTION.test(p)) && !tk[ni].cap) push(i, 1, "crase", "Ir *a* + *a* praia = " + it("à " + n) + " (con crase; con masculino sería *ao*).");
      if (w === "a" && pi >= 0 && tk[ni] && tk[ni].cap && /^(lapa|urca|tijuca|glória|bahia|argentina|europa|itália|frança|espanha|alemanha|inglaterra|amazônia|áfrica|ásia)$/.test(n) && lemmas(p).some(function (l) { return MOTION.test(l); })) push(i, 1, "crase", "Con lugar femenino con artículo: " + it("à " + tk[ni].o) + ".");
      if (w === "as" && HOURW.test(n) && ni === i + 1 && !/^(são|todas|todas as|eram|entre|das)$/.test(p) && !ART.test(p) && (/^(horas|e|da|de|em)$/.test(n2) || tk[wi(ni, 1) - 1] && tk[wi(ni, 1) - 1].p || !n2)) push(i, 1, "crase", "Con la hora va crase: " + it("às " + n) + ".");
      if (/^(à|às)$/.test(w) && ni === i + 1 && (nounGN(n) && nounGN(n).g === "m" && !/^(moda|maneira)$/.test(n) || isInf(n) || /^(pé|cavalo|vista|prazo)$/.test(n)) && !/^(à-toa)$/.test(n))
        push(i, 1, "crase", "Delante de " + (isInf(n) ? "un verbo" : "un masculino") + " no hay crase: " + it(w.replace("à", "a") + " " + n) + ".");
      if (w === "à" && /^(uma|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez)$/.test(n) && /^(anos|meses|dias|semanas|horas|minutos|séculos)$/.test(n2)) push(i, 1, "ortografia", "Tiempo pasado: " + it("há " + n + " " + n2) + " (hace).");
      if (w === "a" && /^(uma|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|muito|pouco|alguns|algumas|\d+)$/.test(n) && /^(anos|meses|dias|semanas|séculos|tempo)$/.test(n2 === "muito" ? "tempo" : n2) && !/^(daqui|de|até)$/.test(p) && !/^(daqui)$/.test(p2))
        push(i, 1, "ortografia", "«Hace» + tiempo es " + it("há") + ": " + it("há " + n + " " + (n2 || "")) + ".");

      /* 15. persona del verbo */
      if (SUBJ_PRON[w] != null && !(pi >= 0 && (PREPS.test(p) || finite(p))) && !(tk[ni] && tk[ni].p)) {
        var target = SUBJ_PRON[w];
        var vk2 = ni;
        while (vk2 >= 0 && SKIPV.test(W(vk2))) vk2 = wi(vk2, 1);
        var vw2 = W(vk2), rd2 = V(vw2);
        var ok2 = rd2.some(function (v) { return v.p === target || (w === "tu" && v.p === 2) || v.tense === "infPessoal" && isInf(vw2); });
        if (vk2 >= 0 && rd2.length && !ok2 && !isNoun(vw2) && !isAdj(vw2) && !isInf(vw2) && !PP(vw2) && !tk[vk2].cap && !AMBIG.test(vw2) && !(tk[vk2 + 1] && tk[vk2 + 1].p === "?" && /^(como|onde)$/.test(vw2))) {
          var r0 = rd2[0], fm = conjForm(r0.lemma, r0.tense, target);
          if (fm && fm !== vw2) push(vk2, 1, "persona", (w === "você" || w === "vocês" ? it(w) + " va con el verbo en tercera persona: " : "Con " + it(w) + " el verbo es ") + it(fm) + ".");
        }
      }
      if (w === "gente" && p === "a") {
        var gk2 = ni;
        while (gk2 >= 0 && SKIPV.test(W(gk2))) gk2 = wi(gk2, 1);
        var gr = V(W(gk2));
        if (gr.length && gr.every(function (v) { return v.p === 3; })) { var gf = conjForm(gr[0].lemma, gr[0].tense, 2); if (gf) push(gk2, 1, "persona", it("A gente") + " va con el verbo en tercera del singular: " + it("a gente " + gf) + "."); }
      }
      if (/^(eles|elas|vocês)$/.test(w) && ni === i + 1 && /^(tem|vem)$/.test(n)) push(ni, 1, "persona", "En plural lleva circunflejo: " + it(n === "tem" ? "têm" : "vêm") + ".");
      if (/^(houveram|haviam|haverão|hajam|houvessem)$/.test(w) && !PP(n) && !(pi >= 0 && /^(se)$/.test(p))) push(i, 1, "persona", it("Haver") + " existencial va en singular: " + it({ houveram: "houve", haviam: "havia", "haverão": "haverá", hajam: "haja", houvessem: "houvesse" }[w]) + ".");

      /* 16. participios: foi pagado → pago; tinha abrido → aberto */
      if (PP(w) && pi >= 0) {
        var lemP = PP(w), parts = null;
        try { parts = Conj && Conj.participles ? Conj.participles(lemP) : null; } catch (e) { parts = null; }
        if (parts && parts.regular && parts.irregular && parts.regular !== parts.irregular) {
          var regF = parts.regular, irrF = parts.irregular;
          var suffixP = w.slice(regF.length - 1).replace(/^o/, "") ;
          var isReg = w.replace(/(a|os|as)$/, "o") === regF, isIrr = w.replace(/(a|os|as)$/, "o") === irrF;
          if (isReg && /^(é|são|foi|foram|era|eram|será|serão|seja|sejam|fosse|fossem|sido|ser|está|estão|estava|estavam|ficou|ficaram|fica|ficam)$/.test(p))
            push(i, 1, "participio", "Con *ser, estar* y *ficar* va el participio corto: " + it(irrF.replace(/o$/, w.slice(regF.length - 1))) + ".");
        }
      }
      if (/^(\w+)(ido|ida|idos|idas|ado|ada)$/.test(w) && known(w) === false) { /* handled by regMap */ }

      /* 17. número + singular: dois livro */
      if (/^(dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|vinte|trinta|cem|mil|muitos|muitas|vários|várias|\d+)$/.test(w) && !(/^\d+$/.test(w) && +w < 2) && ni === i + 1) {
        var ns = DATA.nouns[n];
        if (ns && ns.s === n && ns.pl && ns.pl !== n && !/^(de|anos)$/.test(n) && !/^(às|as|das)$/.test(p)) push(ni, 1, "plural", "Después de " + it(t.o) + " va el plural: " + it(ns.pl) + ".");
      }

      /* 18. «ir a» + infinitivo; «tener que» ya salió por español */
      if (w === "a" && lemmas(p).indexOf("ir") >= 0 && isInf(n) && ni === i + 1 && !/^(ser)$/.test(n)) push(i, 1, "espanol", "*Ir* + infinitivo va sin *a*: " + it(p + " " + n) + ".");

      /* 19. tildes de verbo: ele e alto → é */
      var capP = pi >= 0 && tk[pi].cap && !tk[pi].start;
      if (w === "e" && pi >= 0 && (/^(ele|ela|você|isso|isto|aquilo|tudo|onde|quem|qual)$/.test(p) || capP) && ni >= 0 &&
          (isAdj(n) && !isNoun(n) || (!capP && /^(muito|um|uma|meu|minha|aqui|lá|verdade|possível|importante)$/.test(n))) && !(tk[ni].cap) && !(tk[wi(pi, -1)] && /^(e|,)$/.test(W(wi(pi, -1)))))
        push(i, 1, "tilde", "El verbo lleva tilde: " + it("é") + " (*e* sin tilde es «y»).");

      /* 20. mas / mais; porque en preguntas */
      if (w === "mais" && (t.start || t.clause) && (SUBJ_PRON[n] != null || /^(não|também|ninguém|nada)$/.test(n)) && !/^(ou)$/.test(p)) push(i, 1, "lexico", it("Mais") + " es «más»; «pero» es " + it("mas") + ".");
      if (w === "porque" && t.start) {
        for (var q2 = i + 1; q2 < tk.length; q2++) if (tk[q2].p && /[.!?]/.test(tk[q2].p)) { if (tk[q2].p === "?") push(i, 1, "ortografia", "En una pregunta, separado: " + it("Por que…?") + " (porque = porque, en la respuesta)."); break; }
      }

      /* 21. falsos amigos en contexto */
      if (/^(vaso|vasos)$/.test(w) && /^(de|com)$/.test(n) && /^(água|suco|vinho|cerveja|leite|refrigerante)$/.test(n2)) push(i, 1, "falso_amigo", "El vaso para tomar es el " + it(w === "vaso" ? "copo" : "copos") + " (" + it("vaso") + " es una maceta o un florero).", true);
      if (/^(borracho|borracha|borrachos|borrachas)$/.test(w) && /^(estava|está|estou|ficou|fiquei|ficaram|estavam|muito|meio|completamente)$/.test(p)) push(i, 1, "falso_amigo", "«Borracho» es " + it(w.replace(/borrach/, "bêbad")) + " (" + it("borracha") + " es la goma).");
      if (/^(pelo|pelos)$/.test(w) && (ART.test(p) || POSS.test(p)) && /^(longo|curto|comprido|loiro|castanho|preto|liso|cacheado|ruivo|crespo|lindo|bonito)$/.test(n)) push(i, 1, "falso_amigo", "El pelo de la cabeza es el " + it("cabelo") + " (" + it("pelo") + " es el vello o el pelaje).");
      if (w === "acordo" && p === "me" && /^(de|do|da|dos|das|que)$/.test(n)) push(pi, 2, "falso_amigo", "«Me acuerdo de» es " + it("lembro de") + " o " + it("me lembro de") + " (acordar = despertarse).");
      if (/^(esquisito|esquisita|esquisitos|esquisitas)$/.test(w) && /^(comida|prato|bolo|feijoada|jantar|almoço|sabor|doce|sobremesa|churrasco|peixe|vinho)$/.test(p)) push(i, 1, "falso_amigo", it(w) + " es «raro»; «exquisito» es " + it(w.replace(/esquisit/, "delicios")) + " o " + it(w.replace(/esquisit/, "gostos")) + ".", true);
      if (/^(propina|propinas)$/.test(w) && sentence(i).some(function (x) { return /^(garçom|garçonete|restaurante|bar|boteco|conta|deixei|deixamos|dei)$/.test(x); })) push(i, 1, "falso_amigo", "La propina del mozo es la " + it("gorjeta") + " (" + it("propina") + " es un soborno).");
      if (w === "rato" && /^(um|uns)$/.test(p) && (/^(depois|mais|atrás|antes)$/.test(n) || lemmas(p2).some(function (l) { return /^(esperar|ficar|descansar|conversar)$/.test(l); }))) push(i, 1, "falso_amigo", "«Un rato» es " + it("um tempinho") + " o " + it("um momento") + " (" + it("rato") + " es el ratón).");
      if (w === "largo" || w === "larga") { if (/^(cabelo|vestido|dia|viagem|filme|caminho|texto|livro)$/.test(p)) push(i, 1, "falso_amigo", "«Largo» es " + it(w === "largo" ? "comprido / longo" : "comprida / longa") + " (" + it("largo") + " es ancho).", true); }
      if (/^(presunto|presunta)$/.test(w) && /^(o|a)$/.test(p) && /^(culpado|culpada|assassino|ladrão|autor)$/.test(n)) push(i, 1, "falso_amigo", "«Presunto» es " + it("suposto") + " (" + it("presunto") + " es el jamón).");
      if (w === "polvo" && /^(muito|tem|cheio|de)$/.test(p) && !/^(grelhado|frito|com|ao|à)$/.test(n)) push(i, 1, "falso_amigo", "El polvo es " + it("pó") + " o " + it("poeira") + " (" + it("polvo") + " es el pulpo).", true);
      if (w === "apelido" && /^(é)$/.test(n) && tk[wi(ni, 1)] && tk[wi(ni, 1)].cap && /(ez|es)$/.test(n2)) push(i, 1, "falso_amigo", "El apellido es el " + it("sobrenome") + " (" + it("apelido") + " es el apodo).");
      if (/^(oficina|oficinas)$/.test(w) && sentence(i).some(function (x) { return /^(chefe|reunião|computador|colegas|expediente|empresa)$/.test(x); })) push(i, 1, "falso_amigo", "La oficina es el " + it("escritório") + " (" + it("oficina") + " es un taller).", true);
      if (w === "logo" && /^(e)$/.test(p) && false) { /* */ }

      /* 22. regencia */
      if (hasLem(w, /^namorar$/) && n === "com") push(ni, 1, "regencia", it("Namorar") + " va sin preposición: " + it(w + " " + n2) + ".", true);
      if (hasLem(w, /^(pensar|acreditar|confiar)$/) && ni === i + 1 && !/^(em|no|na|nos|nas|num|numa|nele|nela|nisso|nisto|naquilo|que|se|bem|muito|melhor|sobre|,)$/.test(n) && !finite(n) && !isInf(n) && (SUBJ_PRON[n] != null || /^(você|ele|ela|mim|ti)$/.test(n) || tk[ni].cap || isNoun(n) || ART.test(n))) {
        var lPen = lemmas(w).filter(function (l) { return /^(pensar|acreditar|confiar)$/.test(l); })[0];
        if (!(lPen === "pensar" && ART.test(n))) push(i, 2, "regencia", it(lPen) + " lleva " + it("em") + ": " + it(w + " em " + n) + ".");
      }
      if (hasLem(w, /^(sonhar)$/) && ni === i + 1 && !/^(com|que|acordado|,)$/.test(n) && (ART.test(n) || SUBJ_PRON[n] != null || tk[ni].cap)) push(i, 2, "regencia", it("Sonhar") + " lleva " + it("com") + ": " + it(w + " com " + n) + ".");
      if (hasLem(w, /^(precisar)$/) && ni === i + 1 && (ART.test(n) || isNoun(n) || POSS.test(n) || /^(ajuda|dinheiro|tempo|ele|ela|você)$/.test(n)) && !isInf(n)) push(i, 2, "regencia", it("Precisar") + " + sustantivo lleva " + it("de") + ": " + it(w + " " + (ART.test(n) ? ({ o: "do", a: "da", os: "dos", as: "das", um: "de um", uma: "de uma" }[n] || "de " + n) : "de " + n)) + ".");
      if (hasLem(w, /^(lembrar|esquecer)$/) && p === "me" && ni === i + 1 && (ART.test(n) || isNoun(n))) push(i, 2, "regencia", "Con pronombre, " + it("lembrar-se") + " lleva " + it("de") + ": " + it("me " + w + " " + ({ o: "do", a: "da", os: "dos", as: "das" }[n] || "de " + n)) + ".", true);
      if (w === "de" && n === "que" && /^(acho|achei|penso|pensei|acredito|disse|falou|sei)$/.test(p)) push(i, 1, "regencia", "Sin *de*: " + it(p + " que") + ".");
      if (hasLem(w, /^(assistir)$/) && ni === i + 1 && ART.test(n) && /^(filme|jogo|show|aula|novela|série|peça|espetáculo|desfile)$/.test(n2)) push(i, 2, "regencia", "En la norma culta, " + it("assistir a") + " (ver): " + it(w + " " + ({ o: "ao", a: "à", os: "aos", as: "às" }[n] || "a " + n) + " " + n2) + " (en el habla también: assisti o jogo).", true);
    });
    return out.sort(function (a, b) { return a.i - b.i; });
  }

  function firstLemma(w) {
    var v = V(w)[0];
    if (v) return v.lemma;
    if (U.isInfinitive && U.isInfinitive(w)) return w;
    if (/^(ser|ter|ir|ver|vir|dar|ler|pôr|rir)$/.test(w)) return w;
    return null;
  }
  function conjForm(lemma, tense, p) {
    if (!lemma || !Conj || p == null) return null;
    try { var f = Conj.conjugate(lemma, tense)[p]; return f ? String(f).split(" ").pop() : null; } catch (e) { return null; }
  }

  /* ------------------------------------------------------------ revisión */

  function check(text, week) {
    var task = TASKS[week] || { min: 20, use: [] };
    var f = features(text);
    var reqs = [{ label: task.min + " palabras", n: f.words || 0, need: task.min }].concat(task.use.map(function (u) {
      return { id: u[0], label: u[2], n: f[u[0]] || 0, need: u[1] };
    }));
    reqs.forEach(function (r) { r.ok = r.n >= r.need; });
    var findings = lint(text, week);
    return { words: f.words || 0, features: f, reqs: reqs, findings: findings,
             hard: findings.filter(function (x) { return !x.soft; }).length,
             ok: reqs.every(function (r) { return r.ok; }) };
  }

  /* The text with the flagged words marked, for the result screen. */
  function markup(text, findings, esc) {
    esc = esc || function (s) { return s; };
    var tk = toks(text), marks = {};
    findings.forEach(function (f, k) { for (var j = 0; j < f.n; j++) if (tk[f.i + j] && tk[f.i + j].w) marks[f.i + j] = { k: k, soft: f.soft }; });
    var src = String(text || "").normalize("NFC").replace(/[’‘`´]/g, "'"), html = "", last = 0;
    tk.forEach(function (t, i) {
      if (!t.w || !marks[i]) return;
      html += esc(src.slice(last, t.at)) + '<mark class="' + (marks[i].soft ? "soft" : "bad") + '">' + esc(src.substr(t.at, t.len)) +
        "<sup>" + (marks[i].k + 1) + "</sup></mark>";
      last = t.at + t.len;
    });
    return html + esc(src.slice(last));
  }

  /* ------------------------------------------------------ LanguageTool
     A second opinion from the free public API of LanguageTool (no key; 20
     requests a minute, plenty for one learner), in Brazilian Portuguese.
     The local findings keep their Spanish explanation, and what
     LanguageTool adds goes after them. */
  var LT_URL = "https://api.languagetool.org/v2/check";
  var LT_KIND = {
    GRAMMAR: ["grammatica", "Gramática", false], TYPOS: ["tipeo", "Ortografía", false],
    CONFUSED_WORDS: ["lexico", "Palabra", false], PUNCTUATION: ["puntuacion", "Puntuación", true],
    CASING: ["mayusculas", "Mayúsculas", true], STYLE: ["estilo", "Estilo", true], REDUNDANCY: ["estilo", "Estilo", true],
    SEMANTICS: ["lexico", "Sentido", true], TYPOGRAPHY: ["estilo", "Tipografía", true], COLLOCATIONS: ["lexico", "Combinación", true]
  };
  function ltCheck(text, done) {
    if (typeof fetch !== "function") return done(new Error("sin fetch"));
    var ctl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 12000);
    var body = "text=" + encodeURIComponent(String(text).slice(0, 18000)) + "&language=pt-BR&motherTongue=es";
    fetch(LT_URL, { method: "POST", body: body, signal: ctl ? ctl.signal : undefined,
                    headers: { "Content-Type": "application/x-www-form-urlencoded" } })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) { clearTimeout(timer); done(null, (j && j.matches) || []); })
      .catch(function (e) { clearTimeout(timer); done(e); });
  }
  // LanguageTool's matches as findings on the same tokens, minus what the
  // local checker already said and what is noise for a learner.
  function fromLT(text, matches, local) {
    var tk = toks(text), taken = {};
    (local || []).forEach(function (f) { for (var j = 0; j < f.n; j++) taken[f.i + j] = 1; });
    var out = [];
    (matches || []).forEach(function (m) {
      var cat = (m.rule && m.rule.category && m.rule.category.id) || "";
      if (/WHITESPACE|DOUBLE_PUNCT|UNPAIRED/.test((m.rule && m.rule.id) || "")) return;
      var kind = LT_KIND[cat] || ["lt", "Revisar", true];
      var first = -1, n = 0;
      tk.forEach(function (t, i) {
        if (!t.w) return;
        if (t.at < m.offset + m.length && t.at + t.len > m.offset) { if (first < 0) first = i; n = i - first + 1; }
      });
      if (first < 0) return;
      for (var j = 0; j < n; j++) if (taken[first + j] && tk[first + j].w) return;
      var w = tk[first];
      if (cat === "TYPOS" && (w.cap && !w.start || known(w.w))) return;   // names and words of the course
      for (var q = 0; q < n; q++) taken[first + q] = 1;
      var rep = (m.replacements || []).slice(0, 2).map(function (r) { return "*" + r.value + "*"; }).join(" o ");
      out.push({ i: first, n: n, cat: kind[0], soft: kind[2], lt: true,
                 msg: kind[1] + " (LanguageTool): " + String(m.message || m.shortMessage || "").replace(/\s+/g, " ").trim() +
                      (rep ? " → " + rep : "") });
    });
    return out;
  }

  /* ------------------------------------------------------------ IA
     Optional: the learner's own free keys.  Groq first (no card, answers in
     a second or two), Gemini as fallback when Groq fails or has no key.
     Both speak the OpenAI-style API.  Which models a key can use changes
     over time, so the app asks each provider for its list and takes the
     best one available.  The keys never leave the phone except to them. */
  var PROVIDERS = [
    { id: "groq", name: "Groq", url: "https://api.groq.com/openai/v1", maxKey: "max_completion_tokens",
      prefer: [/kimi-k2/i, /gpt-oss-120b/i, /llama-3\.3-70b/i, /qwen3?-32b|qwen\//i, /llama-4-maverick/i, /llama-4-scout/i, /gpt-oss-20b/i, /llama-3\.1-8b/i],
      skip: /whisper|tts|guard|playai|orpheus|distil|compound|allam|embed/i,
      fallback: ["moonshotai/kimi-k2-instruct", "openai/gpt-oss-120b", "llama-3.3-70b-versatile", "qwen/qwen3-32b", "llama-3.1-8b-instant"],
      reasoning: function (m) { return /gpt-oss/i.test(m) ? "low" : /qwen3/i.test(m) ? "none" : null; } },
    { id: "gemini", name: "Gemini", url: "https://generativelanguage.googleapis.com/v1beta/openai", maxKey: "max_tokens",
      prefer: [/^gemini-2\.5-flash$/, /^gemini-flash-latest$/, /^gemini-2\.0-flash$/, /^gemini-2\.5-flash-lite$/, /^gemini-flash-lite-latest$/,
               /^gemini-2\.0-flash-lite$/, /^gemini-2\.5-pro$/, /^gemini-[\d.]+-flash$/, /^gemini-.*flash/],
      skip: /embed|imagen|veo|tts|aqa|image|audio|live|native|learnlm|gemma|robotics|computer|thinking/i,
      fallback: ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"],
      reasoning: function (m) { return /pro/i.test(m) ? "low" : /2\.5|latest/i.test(m) ? "none" : null; } }
  ];
  // The error types of the clinic: the AI files each mistake under one of them.
  var AI_TYPES = {
    contraccion: "contracción obligatoria no hecha (em o → no, de ele → dele)", articulo: "artículo (forma, falta o sobra)",
    genero: "género de un sustantivo (heterogenéricos: o leite, a viagem)", plural: "plural de un sustantivo (-ões, -ães, -ãos, -is, -ns)",
    concordancia: "concordancia de adjetivos y determinantes", preposicion: "preposición", regencia: "verbo con su preposición (pensar em, assistir a, namorar)",
    muito: "muito / muy / mucho", gostar: "gostar de (calco de gustar)", a_personal: "«a» personal del castellano",
    perfeito_composto: "perfeito composto mal usado (tenho comido ≠ he comido)", subjuntivo: "subjuntivo presente o imperfecto",
    futuro_subj: "futuro do subjuntivo (quando eu for, se eu tiver)", inf_pessoal: "infinitivo pessoal (para eles saberem)",
    pronome: "pronombre (mim/eu, lhe/o, comigo…)", colocacao: "lugar del pronombre átono", crase: "crase (à, às)",
    ortografia: "ortografía", tilde: "tildes", espanol: "palabra o construcción del castellano", falso_amigo: "falso amigo",
    tempo: "tiempo verbal elegido", persona: "persona o número del verbo", participio: "participio (irregular, doble, concordancia)",
    verbo_irregular: "forma de verbo irregular", regularizacion: "irregular hecho regular (fazi, sabo, mais grande)",
    nasal: "nasales (ã, õ, -m final)", lexico: "palabra equivocada", orden: "orden de las palabras",
    faltante: "falta una palabra", sobrante: "sobra una palabra",
    estilo: "correcto pero poco natural (sugerencia, no error)"
  };
  function levelOf(week) { return week <= 8 ? "A1" : week <= 18 ? "A2" : week <= 30 ? "B1" : week <= 42 ? "B2" : "C1"; }
  var PB_NORM = "La referencia es el portugués de Brasil, norma urbana culta: la próclise del habla brasileña (me chamo, te amo), " +
    "«você» con verbo en tercera, «a gente» con verbo en singular, el artículo opcional ante posesivo, *em um* o *num*, son correctos; " +
    "lo coloquial (pra, tá, vi ele, tem por há) no es error en un texto informal, pero marcalo como \"estilo\" en uno formal. " +
    "No corrijas hacia el portugués europeo. Ortografía del Acuerdo de 1990 (ideia, voo, linguiça).";
  function aiPrompt(text, week, task) {
    return "Sos profesor de portugués de Brasil, nativo, para un hispanohablante rioplatense que está en la semana " + week +
      " de 52 de un curso hasta C1 (nivel actual aproximado: " + levelOf(week) + ").\n" +
      "Consigna del ejercicio: «" + (task ? task.t : "texto libre") + "»." +
      (task && task.use && task.use.length ? " Estructuras que tenía que usar: " + task.use.map(function (u) { return u[2]; }).join("; ") + "." : "") + "\n\n" +
      "Corregí su texto con mucho cuidado, oración por oración. Marcá TODOS los errores, sin dejar pasar ninguno: contracciones, " +
      "artículos, género, concordancia, persona y tiempo del verbo, futuro do subjuntivo, infinitivo pessoal, participios, pronombres, " +
      "preposiciones y regencia, crase, léxico, falsos amigos, castellano metido, ortografía, tildes y nasales, orden. " + PB_NORM + " " +
      "Lo que es correcto pero un brasileño no diría así, marcalo como \"estilo\". " +
      "No marques como error algo correcto solo porque se podría decir mejor, y no cambies el contenido. Corrección MÍNIMA: " +
      "arreglá cada error con el menor cambio posible y no reescribas el estilo (los correctores automáticos tienden a sobrecorregir; no lo hagas).\n" +
      "Cada error lleva un \"tipo\" de esta lista: " + Object.keys(AI_TYPES).map(function (k) { return k + " (" + AI_TYPES[k] + ")"; }).join(", ") + ".\n" +
      "Respondé SOLO con JSON: {\"errores\":[{\"mal\":\"fragmento EXACTO copiado del texto, lo más corto posible\"," +
      "\"bien\":\"la corrección de ese fragmento\",\"tipo\":\"uno de la lista\"," +
      "\"explicacion\":\"una o dos oraciones en castellano rioplatense: qué regla es y por qué, con el dato que le sirve para no repetirlo\"}]," +
      "\"corregido\":\"el texto completo corregido\",\"consigna\":\"una oración: si cumplió la consigna y usó bien las estructuras pedidas\"," +
      "\"comentario\":\"dos o tres oraciones de devolución en castellano: qué hizo bien y qué tiene que practicar\"}\n" +
      "Los errores van en el orden en que aparecen en el texto. Cada error se marca una sola vez: no repitas un error ni marques uno " +
      "adentro de otro (si en «Eu tengo 32 anos» y «muy» hay dos errores, van separados). Las explicaciones, la consigna y el " +
      "comentario van en castellano, con portugués solo en los ejemplos. El comentario habla del texto del alumno, no del corregido. " +
      "Antes de responder, revisá que cada explicación sea cierta.\n\nTexto:\n" + text;
  }
  /* A second teacher checks the first one's correction: drops what is not
     an error or is repeated, fixes wrong explanations, adds what was missed. */
  function reviewPrompt(text, week, task, data, evidence) {
    var ev = "";
    if (evidence && ((evidence.local || []).length || (evidence.lt || []).length)) {
      // A model cannot check its own work without outside evidence (Kamoi
      // et al. 2024): the rule checker and LanguageTool are that evidence.
      ev = "\nEvidencia externa, para contrastar (verificá cada punto: puede tener falsos positivos, no la copies a ciegas):\n" +
        (evidence.local || []).slice(0, 12).map(function (m) { return "- corrector de reglas: " + m; }).join("\n") +
        ((evidence.lt || []).length ? "\n" + evidence.lt.slice(0, 12).map(function (m) { return "- LanguageTool: " + m; }).join("\n") : "") + "\n";
    }
    return "Sos un segundo profesor de portugués de Brasil, nativo, que revisa la corrección que un colega hizo del texto de un alumno " +
      "hispanohablante rioplatense (semana " + week + " de 52 de un curso hasta C1; consigna: «" + (task ? task.t : "texto libre") + "»).\n\n" +
      "Texto del alumno:\n" + text + "\n\nCorrección del colega (JSON):\n" + JSON.stringify(data) + "\n" + ev + "\n" +
      "Revisala y devolvé la versión buena:\n" +
      "1. Cada error tiene que ser un error de verdad en el portugués culto de Brasil; sacá los que no lo sean. " + PB_NORM + "\n" +
      "2. \"mal\" tiene que estar copiado EXACTO del texto del alumno, lo más corto posible.\n" +
      "3. Ningún error repetido ni uno adentro de otro: si un fragmento tiene dos errores, separalos en dos fragmentos cortos.\n" +
      "4. Cada explicación tiene que ser cierta y precisa, en castellano rioplatense, con portugués solo en los ejemplos; corregí las que estén mal.\n" +
      "5. El \"tipo\" tiene que ser el que corresponde de esta lista: " + Object.keys(AI_TYPES).join(", ") + ".\n" +
      "6. Agregá los errores que el colega no vio (la evidencia externa puede señalarlos; confirmalos vos).\n" +
      "6b. Corrección mínima: cada \"bien\" cambia lo menos posible; sacá las correcciones de estilo disfrazadas de error.\n" +
      "7. \"corregido\" tiene que tener todos los arreglos y nada más; \"consigna\" y \"comentario\" tienen que ser ciertos y hablar del texto del alumno.\n" +
      "Respondé SOLO con el JSON revisado, con el mismo formato.";
  }
  // done(err, data, meta): meta says which provider and model corrected and which reviewed.
  function aiCheck(text, week, keys, done, onStage, opts) {
    var task = TASKS[week];
    opts = opts || {};
    llm(aiPrompt(text, week, task), keys, function (err, data, meta) {
      if (err) return done(err);
      if (onStage) onStage("review", meta);
      // the evidence may still be on its way (LanguageTool): wait for it a moment
      var go = function (evidence) {
        llm(reviewPrompt(text, week, task, data, evidence), keys, function (err2, data2, meta2) {
          var good = !err2 && data2 && Array.isArray(data2.errores);
          done(null, good ? data2 : data, { first: meta, review: good ? meta2 : null, evidence: !!evidence });
        });
      };
      if (typeof opts.evidence === "function") opts.evidence(go); else go(opts.evidence || null);
    });
  }

  /* Any exercise: why is my answer wrong (or is it right after all)? */
  function explainPrompt(x) {
    return "Sos profesor de portugués de Brasil para un hispanohablante rioplatense. Un alumno respondió un ejercicio de una app.\n" +
      "Consigna: " + (x.prompt || "") + "\nEnunciado: " + (x.stem || "") +
      (x.options && x.options.length ? "\nOpciones: " + x.options.join(" | ") : "") +
      "\nRespuesta del alumno: " + (x.given || "(vacía)") + "\nRespuesta que la app da por correcta: " + (x.answer || "") +
      (x.accept && x.accept.length > 1 ? "\nOtras respuestas que la app acepta: " + x.accept.join(" | ") : "") +
      (x.feedback ? "\nCorrección que mostró la app: " + x.feedback : "") +
      "\n\nExplicale al alumno, en 2 a 4 oraciones en castellano rioplatense, qué está mal en su respuesta y cuál es la regla, " +
      "con un ejemplo corto en portugués. Si su respuesta en realidad también es correcta en el portugués de Brasil, o si la corrección de la app está mal o confunde, decilo claro.\n" +
      "No le des la razón por cortesía ni porque insista: «tambien_correcta» solo si su respuesta es portugués brasileño correcto y cumple la consigna; " +
      "ante la duda, mantené la corrección de la app y explicá por qué. Verificá la regla antes de afirmarla; si no estás seguro, decilo.\n" +
      "Respondé SOLO con JSON: {\"tambien_correcta\": true o false, \"app_equivocada\": true o false, \"explicacion\": \"...\"}";
  }
  function explain(x, keys, done) { llm(explainPrompt(x), keys, done); }

  /* Graded hints (dynamic assessment, Aljaafreh & Lantolf 1994; LearnLM
     2024): first an implicit nudge, then the rule as a question, and only
     then the explanation.  One request, revealed step by step. */
  function hintsPrompt(x) {
    return "Sos profesor de portugués de Brasil para un hispanohablante rioplatense, y tu método es no dar la respuesta de entrada: " +
      "primero una pista implícita, después la regla como pregunta, y solo al final la explicación.\n" +
      "Consigna: " + (x.prompt || "") + "\nEnunciado: " + (x.stem || "") +
      (x.options && x.options.length ? "\nOpciones: " + x.options.join(" | ") : "") +
      "\nRespuesta del alumno: " + (x.given || "(vacía)") + "\nRespuesta correcta según la app: " + (x.answer || "") +
      (x.accept && x.accept.length > 1 ? "\nOtras respuestas aceptadas: " + x.accept.join(" | ") : "") +
      "\n\nDevolvé tres niveles de mediación, cada uno más explícito que el anterior, SIN revelar la respuesta en los dos primeros:\n" +
      "pista1: una frase corta en portugués fácil que señale dónde está el problema (ej.: «Tem um erro no verbo. Leia de novo.»).\n" +
      "pista2: una pregunta en castellano que apunte a la regla (ej.: «Después de *quando* hablando del futuro, ¿qué tiempo va?»).\n" +
      "explicacion: 2 a 4 oraciones en castellano rioplatense con la regla y un ejemplo en portugués.\n" +
      "Si la respuesta del alumno también es correcta en el portugués de Brasil, decilo en la explicación; no le des la razón por cortesía.\n" +
      "Respondé SOLO con JSON: {\"pista1\": \"...\", \"pista2\": \"...\", \"explicacion\": \"...\", \"tambien_correcta\": true o false, \"app_equivocada\": true o false}";
  }
  function hints(x, keys, done) { llm(hintsPrompt(x), keys, done); }

  /* ------------------------------------------------------------ fala
     Role-play with a goal (Wang et al. 2025; Dugan et al. 2026): hard,
     measurable rules instead of a persona; a vocabulary list the reply
     must stay inside (the app measures the miss rate and asks for a
     rewrite); one recast and at most one note per turn. */
  function parlaScenarioPrompt(ctx) {
    return "Diseñá un role-play breve en portugués de Brasil para un hispanohablante rioplatense de nivel " + ctx.level + " (semana " + ctx.week +
      " de 52). Función de la semana: «" + ctx.fare + "». Tema: «" + ctx.tema + "». La situación pasa preferentemente en Río de Janeiro " +
      "(una feira, un boteco, la playa, el metrô, una roda de samba, una oficina pública…).\n" +
      "Reglas: el alumno tiene que conseguir TRES objetivos comunicativos concretos y verificables hablando con vos. " +
      "Vos hacés un personaje con un rol claro (vendedor, vecina, amigo, funcionario…), no un profesor. Frases de máximo " + ctx.maxWords + " palabras. " +
      "Usá solo estos tiempos verbales: " + ctx.tenses + ". " + PORTUGUES_PRIMEIRO + " El alumno conoce, entre otras: " + (ctx.words || []).slice(0, 100).join(", ") + ".\n" +
      "Respondé SOLO con JSON: {\"titolo\": \"título corto en portugués\", \"ruolo_ia\": \"quién sos, en portugués\", " +
      "\"situazione_es\": \"la situación explicada al alumno en castellano, 2 oraciones\", " +
      "\"obiettivi\": [\"objetivo 1 en castellano\", \"objetivo 2\", \"objetivo 3\"], " +
      "\"apertura\": \"tu primera frase en portugués, en personaje\", \"parole_utili\": [\"6 palabras o expresiones portuguesas útiles\"]}";
  }
  // Portuguese first: the vocabulary list is a preference, never a reason to
  // write broken Portuguese.
  var PORTUGUES_PRIMEIRO = "Tu portugués tiene que ser SIEMPRE correcto y natural, como lo diría un carioca culto: contracciones, artículos y concordancias bien " +
    "(no Rio, da praia, um rapaz, uma moça), mayúscula al empezar cada oración, frases completas con verbo, próclise brasileña (me chama, te vejo). " +
    "Preferí palabras simples y frecuentes, pero nunca sacrifiques la gramática ni el sentido por usar palabras más simples.";
  function parlaTurnPrompt(scen, history, userText, ctx, done) {
    var pending = scen.obiettivi.map(function (o, i) { return (done || []).indexOf(i + 1) < 0 ? (i + 1) + ") " + o : null; }).filter(Boolean);
    return "Seguís un role-play en portugués de Brasil con un alumno hispanohablante de nivel " + ctx.level + ". Tu personaje: " + scen.ruolo_ia +
      ". Situación: " + scen.situazione_es + ". Objetivos del alumno: " + scen.obiettivi.map(function (o, i) { return (i + 1) + ") " + o; }).join(" ") +
      (pending.length ? ". Todavía le faltan: " + pending.join(" ") : "") + "\n" +
      "Cómo conversar: respondé primero a lo que el alumno acaba de decir o preguntar (si te pregunta algo, contestalo en personaje, con un dato concreto); " +
      "no repitas lo que ya dijiste antes; mantené el hilo de la situación; terminá con UNA pregunta simple que lo acerque a un objetivo pendiente. " +
      "Si el alumno escribe algo raro o fuera de tema, reaccioná con naturalidad y volvé a la situación.\n" +
      "Reglas: en personaje, en portugués de Brasil, máximo " + ctx.maxWords + " palabras, solo estos tiempos: " + ctx.tenses + ". " + PORTUGUES_PRIMEIRO +
      " El alumno conoce, entre otras, estas palabras: " + (ctx.words || []).slice(0, 100).join(", ") + ".\n" +
      "No corrijas dentro del diálogo. En \"recast\" dá la frase del alumno corregida con el cambio mínimo (o \"\" si estaba bien); fijate también en las " +
      "palabras españolas y en los falsos amigos que cambian el sentido (polvo = pulpo / pó; esquisito = raro / gostoso; embaraçada = avergonzada / grávida). En \"nota_es\", UNA observación " +
      "breve en castellano sobre el error más importante (o vacío); no inventes reglas.\n" +
      "Objetivos: un objetivo está cumplido si el alumno lo logró de forma comprensible, aunque sea con errores.\n" +
      "Conversación hasta ahora:\n" + history.map(function (h) { return (h[0] === "ia" ? "Personaje: " : "Alumno: ") + h[1]; }).join("\n") +
      "\nAlumno: " + userText + "\n\n" +
      "Respondé SOLO con JSON: {\"risposta\": \"tu turno en portugués\", \"recast\": \"la frase del alumno corregida, o \\\"\\\" si estaba bien\", " +
      "\"nota_es\": \"una observación o vacío\", \"obiettivi_raggiunti\": [números de TODOS los objetivos cumplidos por el alumno hasta ahora], \"fine\": true si los tres objetivos están cumplidos}";
  }
  // Only the hard words, by simpler synonyms: the sentence stays Portuguese.
  function parlaRewritePrompt(reply, miss) {
    return "Reescreva esta fala em português do Brasil simples, trocando por sinônimos mais comuns só estas palavras difíceis: " + miss.join(", ") +
      ". Mesmo sentido, frase completa e gramaticalmente perfeita (contrações, artigos, concordância, maiúscula inicial), no máximo 25 palavras. " +
      "Fala: «" + reply + "». Responda SÓ com JSON: {\"risposta\": \"...\"}";
  }
  /* The learner's sentences reviewed at the end, all together, by a second
     request that does only that. */
  function parlaReviewPrompt(scen, history) {
    var mine = history.map(function (h, i) { return h[0] === "me" ? i : -1; }).filter(function (i) { return i >= 0; });
    return "Sos profesor de portugués de Brasil. Un alumno hispanohablante escribió estas frases en un role-play (situación: " + scen.situazione_es + ").\n" +
      "Conversación:\n" + history.map(function (h, i) { return (h[0] === "ia" ? "Personaje: " : "Alumno [" + i + "]: ") + h[1]; }).join("\n") + "\n\n" +
      "Revisá cada frase del alumno. Corrección mínima: cambiá solo lo que está mal, no reescribas lo que ya es correcto. Mirá contracciones, " +
      "artículos, concordancia, ortografía y tildes, el español metido (muy, tengo, pero, también) y sobre todo las palabras que cambian el sentido " +
      "(polvo = pulpo; esquisito = raro; largo = ancho; rato = ratón). " + PB_NORM + " Si la frase está bien, \"ok\": true. No inventes reglas.\n" +
      "Respondé SOLO con JSON: {\"frasi\": [{\"i\": número de la frase, \"ok\": true o false, \"corretta\": \"la frase corregida\", " +
      "\"nota\": \"una observación breve en castellano rioplatense, o vacío\"}]} con una entrada para cada una de estas frases: " + mine.join(", ");
  }
  function parlaStart(ctx, keys, done) { llm(parlaScenarioPrompt(ctx), keys, done); }
  function parlaTurn(scen, history, userText, ctx, keys, done, reached) { llm(parlaTurnPrompt(scen, history, userText, ctx, reached), keys, done); }
  function parlaRewrite(reply, miss, keys, done) { llm(parlaRewritePrompt(reply, miss), keys, done); }
  function parlaReview(scen, history, keys, done) { llm(parlaReviewPrompt(scen, history), keys, done); }

  /* ------------------------------------------------------- história
     A short story built on the words due for review plus what the learner
     already knows (SRS-Stories, Kamzela, Lango & Dušek 2025): the app
     measures the miss rate and asks for a rewrite when it is too high. */
  function storiaPrompt(ctx) {
    return "Escribí un cuento corto en portugués de Brasil para un hispanohablante de nivel " + ctx.level + " (semana " + ctx.week + " de 52; tema de la semana: «" +
      ctx.tema + "»). Tres párrafos, " + ctx.words + " palabras en total, frases cortas, gramática de estos tiempos solamente: " + ctx.tenses + ".\n" +
      "OBLIGATORIO: usá cada una de estas palabras al menos una vez (son las que el alumno tiene que repasar): " + (ctx.targets || []).join(", ") + ".\n" +
      "Una historia de verdad, que pase en Río de Janeiro o en otra región de Brasil: personajes con nombre, un problema y un final; que cada oración siga a la anterior. " + PORTUGUES_PRIMEIRO + "\n" +
      "Vocabulario: preferí palabras muy frecuentes y estas, que el alumno ya conoce: " + (ctx.known || []).join(", ") + ". " +
      "Como máximo " + ctx.maxNew + " palabras que no sean frecuentes, y ponelas en el glosario.\n" +
      "Respondé SOLO con JSON: {\"titolo\": \"...\", \"testo\": \"párrafo uno\\n\\npárrafo dos\\n\\npárrafo tres\", " +
      "\"glossario\": [[\"palabra portuguesa tal como aparece\", \"significado en castellano\"], ...], " +
      "\"domande\": [[\"pregunta de comprensión en castellano\", [\"opción correcta\", \"distractor\", \"distractor\", \"distractor\"], \"opción correcta\"], ...3 preguntas]}";
  }
  function storiaRewritePrompt(text, miss) {
    return "Reescreva este texto em português do Brasil trocando por sinônimos mais comuns estas palavras, difíceis demais para o aluno: " + miss.join(", ") +
      ". Todo o resto continua igual. O texto tem que continuar correto e natural: contrações, artigos e concordância certos, " +
      "maiúscula no começo de cada frase, a mesma história. Texto:\n" + text +
      "\nResponda SÓ com JSON: {\"testo\": \"...\"}";
  }
  // The errors the local checker found, fixed with the minimal change.
  function correggiPrompt(text, errs) {
    return "Corrija SÓ estes erros no texto em português do Brasil, com a mudança mínima, sem mexer no resto: " + errs.join(" | ") +
      ". Confira também as maiúsculas no começo das frases, as contrações e a concordância artigo-substantivo. Texto:\n" + text + "\nResponda SÓ com JSON: {\"testo\": \"...\"}";
  }
  function correggi(text, errs, keys, done) { llm(correggiPrompt(text, errs), keys, done); }
  function storia(ctx, keys, done) { llm(storiaPrompt(ctx), keys, done); }

  /* The written part of the final exam, graded like the Celpe-Bras
     (Avançado Superior): adequação ao contexto, adequação discursiva,
     adequação linguística (gramática) y léxico, 0-5 each.  The JSON keeps
     the keys app.js reads (punteggi, commento, errori). */
  function esamePrompt(task, text) {
    var rub = (task.rubric || []).map(function (r) { return "- " + r[0] + ": " + r[1]; }).join("\n");
    return "Sos examinador del Celpe-Bras (Certificado de Proficiência em Língua Portuguesa para Estrangeiros), nivel Avançado Superior, " +
      "equivalente a un C1. Un candidato hispanohablante escribió este texto.\n" +
      "Consigna: " + task.t + "\nExtensión pedida: unas " + task.words + " palabras.\n\nTexto:\n" + text + "\n\n" +
      "Evaluá con la grilla de la Produção Escrita del Celpe-Bras, de 0 a 5 cada criterio:\n" +
      "- contexto (adequação ao contexto): cumple el propósito comunicativo, el género textual, el enunciador y el interlocutor pedidos, con la información necesaria;\n" +
      "- discursiva (adequação discursiva): coherencia y cohesión, progresión de las ideas, párrafos, conectores;\n" +
      "- linguistica (adequação linguística): gramática del portugués de Brasil (contracciones, concordancia, tiempos y modos, regencia, crase, colocación pronominal); un Avançado Superior tolera muy pocos errores y ninguno que moleste la lectura;\n" +
      "- lexico: variedad, precisión y adecuación al registro; sin español ni falsos amigos.\n" +
      (rub ? "Descriptores de esta tarea:\n" + rub + "\n" : "") +
      "Sé exigente y justo: un texto de nivel intermedio no pasa de 2 en linguistica y lexico. " + PB_NORM + " " +
      "Listá los errores más importantes (máximo 8) con su corrección mínima.\n" +
      "Respondé SOLO con JSON: {\"punteggi\": {\"contexto\": 0-5, \"discursiva\": 0-5, \"linguistica\": 0-5, \"lexico\": 0-5}, " +
      "\"commento\": \"3 oraciones en castellano rioplatense: qué está bien, qué le falta para el Avançado Superior\", \"errori\": [[\"fragmento mal\", \"corrección\"], ...]}";
  }
  function esame(task, text, keys, done) { llm(esamePrompt(task, text), keys, done); }
  function storiaRewrite(text, miss, keys, done) { llm(storiaRewritePrompt(text, miss), keys, done); }

  /* One request at a time through the models of each provider, best first:
     each attempt waits at most 20 s, each provider at most 40 s.  The model
     that answered last time goes first next time. */
  function store(P, k) { return "rumoc1." + P.id + "." + k; }
  // Models that answered 402 (payment required) with this key: never asked again.
  function paid(P) { try { return JSON.parse(localStorage.getItem(store(P, "paid")) || "{}") || {}; } catch (e) { return {}; } }
  function markPaid(P, model) { var p = paid(P); p[model] = Date.now(); try { localStorage.setItem(store(P, "paid"), JSON.stringify(p)); } catch (e) { /* */ } }
  function models(P, key, cb) {
    try {
      var c = JSON.parse(localStorage.getItem(store(P, "models")) || "null");
      if (c && c.at > Date.now() - 86400000 && c.ids && c.ids.length) return cb(c.ids);
    } catch (e) { /* */ }
    var ctl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
    fetch(P.url + "/models", { headers: { Authorization: "Bearer " + key }, signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        clearTimeout(timer);
        var ids = ((j && j.data) || []).filter(function (m) { return m && m.id && m.active !== false; })
          .map(function (m) { return String(m.id).replace(/^models\//, ""); })
          .filter(function (id) { return !P.skip.test(id); });
        var ranked = [];
        P.prefer.forEach(function (rx) { ids.forEach(function (id) { if (rx.test(id) && ranked.indexOf(id) < 0) ranked.push(id); }); });
        if (P.id === "groq") ids.forEach(function (id) { if (ranked.indexOf(id) < 0) ranked.push(id); });
        if (ranked.length) { try { localStorage.setItem(store(P, "models"), JSON.stringify({ at: Date.now(), ids: ranked })); } catch (e) { /* */ } }
        cb(ranked.length ? ranked : P.fallback.slice());
      })
      .catch(function () { clearTimeout(timer); cb(P.fallback.slice()); });
  }
  // The JSON inside a reply (some models think aloud in <think>…</think> or wrap it in ```).
  function jsonOf(txt) {
    txt = String(txt || "").replace(/<think>[\s\S]*?<\/think>/g, "").replace(/```(json)?/g, "").trim();
    var a = txt.indexOf("{"), b = txt.lastIndexOf("}");
    return JSON.parse(a >= 0 && b > a ? txt.slice(a, b + 1) : txt);
  }
  // keys: {groq, gemini}, or just the Groq key as a string.
  function llm(prompt, keys, done) {
    if (typeof fetch !== "function") return done(new Error("sin fetch"));
    if (typeof keys === "string") keys = { groq: keys };
    keys = keys || {};
    var todo = PROVIDERS.filter(function (P) { return keys[P.id]; }), errs = [];
    if (!todo.length) return done(new Error("sin clave"));
    (function nextProvider() {
      var P = todo.shift();
      if (!P) return done(new Error(errs.length > 1 ? errs.join(" · ") : errs[0].replace(/^\w+: /, "")));
      ask(P, prompt, keys[P.id], function (err, data, model) {
        if (!err) return done(null, data, { provider: P.name, model: model });
        errs.push(P.name + ": " + String(err.message || err));
        nextProvider();
      });
    })();
  }
  function ask(P, prompt, key, done) {
    models(P, key, function (list) {
      // every model of the key, the free-tier-sized ones too, minus those known to be paid
      var skip = paid(P), order = list.filter(function (m) { return !skip[m]; }), deadline = Date.now() + 40000, lastErr = null, plain = {}, n402 = 0;
      if (!order.length) order = list.slice();
      try {
        // the model that answered last goes first, but only if it is among the
        // three best: a small model that answered once during an outage would
        // otherwise stay forever
        var good = localStorage.getItem(store(P, "model"));
        if (good && order.indexOf(good) > 0 && order.indexOf(good) < 3) { order.splice(order.indexOf(good), 1); order.unshift(good); }
      } catch (e) { /* */ }
      var k = 0, over = false;
      function finish(err, data, model) { if (over) return; over = true; done(err, data, model); }
      function next(err) {
        if (err) lastErr = err;
        if (k >= order.length || Date.now() > deadline) {
          var m = n402 && n402 === k ? P.name + " pide un plan pago para todos los modelos de tu cuenta (402)"
                : lastErr && /abort/i.test(String(lastErr.message || lastErr)) ? "la IA no respondió a tiempo" : String((lastErr && lastErr.message) || lastErr || "sin respuesta");
          return finish(new Error(m));
        }
        attempt(order[k++]);
      }
      function attempt(model) {
        var ctl = typeof AbortController === "function" ? new AbortController() : null;
        var timer = setTimeout(function () { if (ctl) ctl.abort(); }, Math.min(20000, Math.max(3000, deadline - Date.now())));
        var body = { model: model, temperature: 0.2,
                     messages: [{ role: "system", content: "Respondés solo con JSON válido." }, { role: "user", content: prompt }] };
        body[P.maxKey] = 4096;
        var re = P.reasoning(model);
        if (!plain[model]) { body.response_format = { type: "json_object" }; if (re) body.reasoning_effort = re; }
        fetch(P.url + "/chat/completions", {
          method: "POST", signal: ctl ? ctl.signal : undefined,
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
          body: JSON.stringify(body)
        }).then(function (r) {
          if (r.ok) return r.json();
          return r.text().then(function (b) {
            clearTimeout(timer);
            if ((r.status === 400 && /api.?key/i.test(b)) || r.status === 401 || r.status === 403) { finish(new Error("HTTP " + r.status + ", clave")); return null; }
            // a model that rejects the JSON mode or the reasoning option: again without them
            if (r.status === 400 && !plain[model] && /response_format|json|reasoning/i.test(b)) { plain[model] = 1; attempt(model); return null; }
            if (r.status === 402) { n402++; markPaid(P, model); next(new Error("HTTP 402")); return null; }
            next(new Error(r.status === 429 ? "se terminó el cupo por ahora (429)" : r.status >= 500 ? P.name + " está saturado ahora (" + r.status + ")" : "HTTP " + r.status));
            return null;
          });
        }).then(function (j) {
          if (!j) return;
          clearTimeout(timer);
          var msg = j.choices && j.choices[0] && j.choices[0].message;
          var data;
          try { data = jsonOf(msg && msg.content); } catch (e) { return next(new Error("respuesta ilegible")); }
          try { localStorage.setItem(store(P, "model"), model); } catch (e) { /* */ }
          finish(null, data, model);
        }).catch(function (e) { clearTimeout(timer); next(e); });
      }
      next();
    });
  }
  // The AI's errors as findings on the text's tokens (each fragment is found
  // in the text; what the local checker already marked is not repeated).
  function fromAI(text, data, local) {
    var tk = toks(text), taken = {}, low = String(text).normalize("NFC").replace(/[’‘`´]/g, "'").toLowerCase(), from = 0, out = [];
    (local || []).forEach(function (f) { if (!f.lt) for (var j = 0; j < f.n; j++) taken[f.i + j] = 1; });
    ((data && data.errores) || []).forEach(function (e) {
      var bad = String(e.mal || "").normalize("NFC").replace(/[’‘`´]/g, "'").trim();
      if (!bad || String(e.bien || "").normalize("NFC").replace(/[’‘`´]/g, "'").trim().toLowerCase() === bad.toLowerCase()) return;
      var at = low.indexOf(bad.toLowerCase(), from);
      if (at < 0) at = low.indexOf(bad.toLowerCase());
      if (at < 0) return;
      from = at + bad.length;
      var first = -1, n = 0;
      tk.forEach(function (t, i) { if (t.w && t.at < at + bad.length && t.at + t.len > at) { if (first < 0) first = i; n = i - first + 1; } });
      if (first < 0) return;
      var dup = true;
      for (var j = 0; j < n; j++) if (!taken[first + j]) dup = false;
      if (dup) return;
      for (var j2 = 0; j2 < n; j2++) taken[first + j2] = 1;
      var tipo = String(e.tipo || "").trim().toLowerCase(), soft = tipo === "estilo";
      out.push({ i: first, n: n, cat: AI_TYPES[tipo] && !soft ? tipo : soft ? "estilo" : "ia", soft: soft, ai: true,
                 msg: (e.bien ? "*" + bad + "* → *" + String(e.bien).trim() + "*. " : "") + (soft ? "(Más natural) " : "") + String(e.explicacion || "").trim() });
    });
    out.sort(function (x, y) { return x.i - y.i; });
    return out;
  }

  function weeks() { return Object.keys(TASKS).map(Number); }

  var api = { TASKS: TASKS, features: features, lint: lint, check: check, markup: markup, weeks: weeks, toks: toks,
              learn: learn, learnCourse: learnCourse, ltCheck: ltCheck, fromLT: fromLT,
              aiCheck: aiCheck, fromAI: fromAI, aiPrompt: aiPrompt, explain: explain, explainPrompt: explainPrompt, reviewPrompt: reviewPrompt,
              hints: hints, hintsPrompt: hintsPrompt, parlaStart: parlaStart, parlaTurn: parlaTurn, parlaRewrite: parlaRewrite, parlaReview: parlaReview, parlaReviewPrompt: parlaReviewPrompt, correggi: correggi,
              parlaScenarioPrompt: parlaScenarioPrompt, parlaTurnPrompt: parlaTurnPrompt, storia: storia, storiaRewrite: storiaRewrite, storiaPrompt: storiaPrompt, esame: esame, esamePrompt: esamePrompt, PROVIDERS: PROVIDERS, AI_TYPES: AI_TYPES };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Scrivi = api;
})(typeof window !== "undefined" ? window : globalThis);
