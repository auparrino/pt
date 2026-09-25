/* Exame final C1 (semana 52): compreensão oral, leitura y produção escrita.
 * Solo datos: la lógica está en app.js.  Estruturas y léxico (huecos,
 * transformaciones, formación de palabras, registro, colocaciones, falsos
 * amigos) están en tools/authored/esame_c1.py.
 *
 * Modelo: Celpe-Bras (nivel Avançado Superior) y exámenes C1.  Contenido
 * cultural de Brasil y Portugal (historia, sociología, literatura); los
 * datos son verificables y lo que la tradición cuenta sin prueba firme se
 * presenta como tal («conta-se»).  Todo en PB; la única cita en portugués
 * europeo (Sophia de Mello Breyner) tiene la misma grafía en ambas normas.
 *
 * ascolto[]:  dos entrevistas largas a dos voces (turns: "A" = primer
 *             hablante, "B" = segundo; la app las lee con dos alturas TTS),
 *             8 preguntas de opción múltiple en castellano (4 opciones) y
 *             4 frases para completar con una palabra del audio.
 * lettura[]:  dos textos de 6 párrafos (~600 palabras); 8 títulos (6 buenos
 *             + 2 distractores) para asignar (match[i] = índice del título
 *             del párrafo i); 8 verdadeiro/falso con la frase que lo prueba.
 * scrittura[]: dos consignas con la grilla del Celpe-Bras.  `kind` conserva
 *             los valores del módulo italiano ("argomentativo", "formale")
 *             porque app.js los usa.  rubric: [clave, descripción]; las
 *             claves (contexto, discursiva, linguistica, lexico) son las
 *             tres adequações del Celpe-Bras, con la lingüística partida en
 *             gramática y léxico para conservar los cuatro puntajes de 0-5. */
(function (root) { "use strict";
  var ESAME = {
    ascolto: [
      { id: "asc-1", title: "Entrevista: o «homem cordial» e o jeitinho", speakers: ["Jornalista", "Historiadora"],
        turns: [
          ["A", "Boa noite. Você está ouvindo o Conversa de Botequim, gravado hoje num bar da Lapa, aqui no Rio. Minha convidada é a historiadora Regina Aguiar, que acaba de lançar um livro sobre as chamadas interpretações do Brasil. Regina, em 1936 Sérgio Buarque de Holanda publicou Raízes do Brasil e popularizou uma expressão que todo mundo cita: o «homem cordial». O que ele queria dizer com isso?"],
          ["B", "Obrigada pelo convite. Antes de mais nada, uma correção: a expressão não foi inventada por ele. O próprio Sérgio Buarque explica que a tomou emprestada do escritor Ribeiro Couto. E quase todo mundo a entende mal. «Cordial», aqui, não quer dizer gentil nem bem-educado. A palavra vem do latim cor, cordis, que significa coração. O homem cordial é aquele que age movido pelo coração, pelas emoções, tanto na amizade quanto na inimizade."],
          ["A", "Ou seja, não é exatamente um elogio."],
          ["B", "Não é. Para Sérgio Buarque, o brasileiro tem dificuldade em separar o público do privado. Trata o Estado como se fosse uma extensão da família, prefere as relações pessoais às regras impessoais e desconfia de tudo o que é formal. Ele dá exemplos do cotidiano: o gosto pelos diminutivos e a mania de chamar as pessoas pelo primeiro nome, deixando de lado o sobrenome."],
          ["A", "E como isso se liga ao famoso jeitinho brasileiro?"],
          ["B", "Um dos que mais escreveram sobre isso foi o antropólogo Roberto DaMatta, a partir do fim dos anos setenta. O jeitinho é uma forma de contornar a regra sem confrontá-la: você conversa, é simpático, conta a sua história e consegue o que queria. Tem um lado criativo e solidário, mas tem também um lado perverso, que aparece quando alguém, em vez de pedir, ameaça: «Você sabe com quem está falando?» Aí a simpatia vira hierarquia."],
          ["A", "Sérgio Buarque também comparou a colonização portuguesa com a espanhola, não é?"],
          ["B", "Sim, no capítulo «O semeador e o ladrilhador». As cidades da América espanhola, como Lima ou Buenos Aires, foram traçadas com régua, em quadras regulares a partir de uma praça central: o espanhol seria o ladrilhador. O português, ao contrário, teria semeado as cidades ao longo do litoral, adaptando-se ao terreno, com certo desleixo. Basta subir até Santa Teresa e olhar as ruas tortas lá embaixo para entender a metáfora."],
          ["A", "Essas interpretações ainda valem hoje?"],
          ["B", "Como hipóteses, sim; como retratos fiéis, não. O próprio Sérgio Buarque via na urbanização o fim lento das nossas raízes rurais e ibéricas. Críticos posteriores mostraram que esses traços não são uma essência nacional, mas o resultado de uma história concreta: o latifúndio, a escravidão, o uso privado do Estado. Eu diria que o livro continua sendo lido não porque tenha acertado em tudo, mas porque nos obriga a fazer as perguntas certas."],
          ["A", "Regina Aguiar, muito obrigado pela conversa."],
          ["B", "Eu que agradeço."]
        ],
        questions: [
          ["¿Qué corrige la historiadora al principio?",
           ["Que Sérgio Buarque no inventó la expresión: la tomó del escritor Ribeiro Couto", "Que el libro se publicó en 1946 y no en 1936", "Que Sérgio Buarque era antropólogo y no historiador", "Que la expresión viene del portugués medieval"],
           "Que Sérgio Buarque no inventó la expresión: la tomó del escritor Ribeiro Couto"],
          ["¿Qué significa «cordial» en el sentido de Sérgio Buarque?",
           ["Que actúa movido por el corazón, por las emociones", "Amable y bien educado", "Que respeta las normas por convicción", "Hospitalario con los extranjeros"],
           "Que actúa movido por el corazón, por las emociones"],
          ["Según Sérgio Buarque, ¿qué le cuesta al brasileño?",
           ["Separar lo público de lo privado", "Hablar con desconocidos", "Aceptar la jerarquía familiar", "Expresar sus emociones"],
           "Separar lo público de lo privado"],
          ["¿Qué ejemplos cotidianos da el libro?",
           ["El gusto por los diminutivos y llamar a la gente por el nombre de pila", "La impuntualidad y las filas en los bancos", "El uso de «o senhor» entre amigos", "El fútbol y el carnaval"],
           "El gusto por los diminutivos y llamar a la gente por el nombre de pila"],
          ["¿Cuándo muestra el jeitinho su lado perverso?",
           ["Cuando alguien, en vez de pedir, amenaza con «¿Sabe con quién está hablando?»", "Cuando alguien cuenta su historia para conseguir un favor", "Cuando se cumple la regla sin excepciones", "Cuando la gente ayuda a desconocidos"],
           "Cuando alguien, en vez de pedir, amenaza con «¿Sabe con quién está hablando?»"],
          ["En «O semeador e o ladrilhador», ¿quién es el «ladrilhador»?",
           ["El colonizador español, que trazaba las ciudades en cuadrícula", "El colonizador portugués, que se adaptaba al terreno", "El bandeirante que abría caminos en el interior", "El urbanista que proyectó Brasília"],
           "El colonizador español, que trazaba las ciudades en cuadrícula"],
          ["¿Qué imagen de Río usa la historiadora para explicar la metáfora?",
           ["Las calles torcidas que se ven desde Santa Teresa", "La cuadrícula de las calles de Copacabana", "Los túneles entre la Zona Sul y el Centro", "La playa de Ipanema vista desde el Arpoador"],
           "Las calles torcidas que se ven desde Santa Teresa"],
          ["¿Por qué se sigue leyendo Raízes do Brasil, según ella?",
           ["Porque obliga a hacer las preguntas correctas", "Porque acertó en todo", "Porque describe fielmente el Brasil de hoy", "Porque es lectura obligatoria en la escuela"],
           "Porque obliga a hacer las preguntas correctas"]
        ],
        completa: [
          ["A palavra «cordial» vem do latim cor, cordis, que significa ___.", "coração"],
          ["O jeitinho é uma forma de contornar a ___ sem confrontá-la.", "regra"],
          ["O espanhol seria o ___; o português, o semeador.", "ladrilhador"],
          ["O brasileiro trata o Estado como se fosse uma extensão da ___.", "família"]
        ] },

      { id: "asc-2", title: "Conversa: 1808, a corte chega ao Rio", speakers: ["Apresentadora", "Historiador"],
        turns: [
          ["A", "Estamos na Praça Quinze, no Centro do Rio, em frente ao Paço Imperial. Meu convidado é o historiador Paulo Menezes. Paulo, foi aqui que tudo começou em 1808?"],
          ["B", "Foi aqui perto, sim. Em março de 1808 desembarcou no Rio o príncipe regente Dom João, com a mãe, a rainha Dona Maria I, e boa parte da corte portuguesa. Eles tinham saído de Lisboa no fim de novembro de 1807, praticamente na véspera de as tropas de Napoleão, comandadas pelo general Junot, entrarem na cidade. Antes de chegar ao Rio, tinham passado por Salvador."],
          ["A", "Por que a corte foi embora de Portugal?"],
          ["B", "Porque Portugal estava entre a cruz e a espada. Napoleão exigia que o país fechasse os portos aos navios ingleses; a Inglaterra, velha aliada, podia tomar as colônias se isso acontecesse. A transferência da corte, escoltada pela marinha inglesa, foi a saída encontrada. Há quem fale em fuga covarde, há quem fale em manobra genial. Provavelmente foi as duas coisas."],
          ["A", "E como a cidade recebeu tanta gente de uma vez?"],
          ["B", "Com dificuldade. Não se sabe ao certo quantas pessoas vieram: as estimativas variam muito, de alguns milhares a mais de dez mil, numa cidade que tinha uns sessenta mil habitantes. Para alojar os recém-chegados, muitas casas foram requisitadas, e nas portas se pintavam as letras P.R., de Príncipe Regente. Conta-se que o povo, com o humor carioca de sempre, lia «Ponha-se na Rua»."],
          ["A", "Mas a presença da corte também trouxe mudanças importantes."],
          ["B", "Enormes. Ainda em Salvador, Dom João decretou a abertura dos portos às nações amigas, o que acabou, na prática, com o monopólio comercial de Portugal. No Rio foram criados a Imprensa Régia, o Banco do Brasil, o Jardim Botânico e a Biblioteca Real, cujo acervo deu origem à atual Biblioteca Nacional. Em 1815, o Brasil foi elevado a Reino Unido de Portugal, Brasil e Algarves: a antiga colônia passava a ser sede da monarquia."],
          ["A", "E a volta para Portugal?"],
          ["B", "Em 1820 estourou no Porto uma revolução liberal que exigia o retorno do rei. Dom João, já Dom João VI, voltou para Lisboa em 1821 e deixou aqui o filho, Pedro. As Cortes de Lisboa queriam reduzir a autonomia do Brasil e exigiam também a volta do príncipe. Pedro decidiu ficar: é o famoso Dia do Fico, em janeiro de 1822. Em setembro daquele ano, veio a independência."],
          ["A", "Uma independência bem peculiar, feita por um príncipe português."],
          ["B", "Exatamente. Muitos historiadores observam que o Brasil é o único caso nas Américas em que a antiga colônia se tornou uma monarquia governada por um membro da família real da própria metrópole. Isso ajudou a manter o território unido, ao contrário do que aconteceu na América espanhola, mas também ajudou a conservar a escravidão por mais sessenta e seis anos."],
          ["A", "Paulo Menezes, obrigada. E você, que está nos ouvindo, aproveite para visitar o Paço Imperial."]
        ],
        questions: [
          ["¿Cuándo llegó la corte a Río de Janeiro?",
           ["En marzo de 1808, después de pasar por Salvador", "En noviembre de 1807, directamente desde Lisboa", "En 1815, cuando Brasil se volvió reino", "En enero de 1822"],
           "En marzo de 1808, después de pasar por Salvador"],
          ["¿Por qué la corte dejó Lisboa?",
           ["Porque estaba atrapada entre las exigencias de Napoleón y las de Inglaterra", "Porque estalló una revolución liberal en Oporto", "Porque la reina quería conocer Brasil", "Porque Inglaterra había invadido Portugal"],
           "Porque estaba atrapada entre las exigencias de Napoleón y las de Inglaterra"],
          ["¿Cómo juzga el historiador la partida de la corte?",
           ["Algunos la ven como fuga cobarde y otros como maniobra genial; probablemente fue las dos cosas", "Como una fuga cobarde, sin más", "Como una maniobra genial de Dom João", "Como un error que hizo perder las colonias"],
           "Algunos la ven como fuga cobarde y otros como maniobra genial; probablemente fue las dos cosas"],
          ["¿Cuántas personas llegaron con la corte?",
           ["No se sabe con certeza: las estimaciones van de algunos miles a más de diez mil", "Unas sesenta mil", "Poco más de quinientas", "Cien mil, más que los habitantes de la ciudad"],
           "No se sabe con certeza: las estimaciones van de algunos miles a más de diez mil"],
          ["Según se cuenta, ¿cómo leía el pueblo las letras P.R. pintadas en las puertas?",
           ["«Ponha-se na Rua» (póngase en la calle)", "«Príncipe Real»", "«Porto do Rio»", "«Propriedade Régia»"],
           "«Ponha-se na Rua» (póngase en la calle)"],
          ["¿Qué decretó Dom João cuando todavía estaba en Salvador?",
           ["La apertura de los puertos a las naciones amigas", "La creación del Banco do Brasil", "La elevación de Brasil a reino", "El fin del tráfico de esclavos"],
           "La apertura de los puertos a las naciones amigas"],
          ["¿Qué fue el «Dia do Fico»?",
           ["El día en que Pedro decidió quedarse en Brasil", "El día en que Dom João volvió a Lisboa", "El día de la independencia", "El día en que la corte desembarcó en Río"],
           "El día en que Pedro decidió quedarse en Brasil"],
          ["¿Qué consecuencias tuvo que la independencia la hiciera un príncipe portugués?",
           ["Ayudó a mantener unido el territorio, pero también a conservar la esclavitud", "Dividió el país en varias repúblicas", "Aceleró la abolición de la esclavitud", "Hizo que Brasil volviera a ser colonia"],
           "Ayudó a mantener unido el territorio, pero también a conservar la esclavitud"]
        ],
        completa: [
          ["Em março de 1808 desembarcou no Rio o príncipe ___ Dom João.", "regente"],
          ["Para alojar os recém-chegados, muitas casas foram ___.", "requisitadas"],
          ["O acervo da Biblioteca Real deu origem à atual Biblioteca ___.", "Nacional"],
          ["Em 1820 estourou no Porto uma revolução ___ que exigia o retorno do rei.", "liberal"]
        ] }
    ],

    lettura: [
      { id: "let-1", title: "Do cortiço à favela: o Rio que se reinventou",
        paragraphs: [
          "No fim do século XIX, o centro do Rio de Janeiro era uma das áreas mais densamente povoadas do país. Capital da recém-proclamada República, a cidade recebia libertos da escravidão, abolida em 1888, migrantes do interior e imigrantes europeus, que se amontoavam em cortiços: casarões antigos divididos em dezenas de cômodos, ou fileiras de pequenas casas em torno de um pátio, com banheiro e tanque coletivos. Aluísio Azevedo fez de uma dessas habitações o cenário de O Cortiço, romance publicado em 1890. Para as elites, os cortiços eram focos de doença e de desordem; para quem morava neles, eram a única maneira de viver perto do trabalho, no porto e no comércio do Centro.",
          "O mais famoso deles, o Cabeça de Porco, ficava perto da atual estação Central do Brasil e chegou a abrigar, segundo algumas estimativas da época, milhares de pessoas. Em janeiro de 1893, o prefeito Barata Ribeiro mandou demoli-lo numa operação que durou pouco mais de um dia e foi acompanhada por soldados e bombeiros. Os moradores foram expulsos sem ter para onde ir. Conta-se que alguns deles, aproveitando a madeira dos escombros, subiram o morro que ficava logo atrás e começaram a construir ali seus barracos.",
          "O morro, conhecido como Providência, ganharia pouco depois outro nome. Em 1897, terminada a Guerra de Canudos, no sertão da Bahia, soldados que haviam lutado contra os seguidores de Antônio Conselheiro chegaram ao Rio à espera de moradias prometidas pelo governo ou, segundo outras versões, do pagamento dos soldos atrasados. Instalaram-se no morro e o chamaram de Morro da Favela, em lembrança de um morro de Canudos coberto por uma planta resistente chamada favela. Com o tempo, o nome próprio virou substantivo comum, e «favela» passou a designar qualquer aglomeração de moradias precárias. A guerra, que terminou com a destruição do arraial, foi narrada por Euclides da Cunha em Os Sertões, de 1902.",
          "No início do século XX, o presidente Rodrigues Alves e o prefeito Pereira Passos decidiram transformar a capital numa vitrine da modernidade, inspirada na Paris redesenhada pelo barão Haussmann. Entre 1903 e 1906, centenas de prédios foram derrubados para abrir largas avenidas, entre elas a Avenida Central, atual Rio Branco, e para modernizar o porto. O povo, que via suas casas desaparecerem, apelidou a reforma de «bota-abaixo». Ao mesmo tempo, o médico sanitarista Oswaldo Cruz comandava campanhas contra a febre amarela, a peste bubônica e a varíola, com brigadas que entravam nas casas para desinfetá-las.",
          "Em novembro de 1904, a lei que tornava obrigatória a vacinação contra a varíola foi a gota d'água. Durante cerca de uma semana, a cidade viveu uma revolta popular: bondes foram virados, lampiões quebrados e barricadas erguidas em bairros como a Saúde. A chamada Revolta da Vacina não se explica apenas pelo medo da injeção, então pouco compreendida, mas pelo acúmulo de ressentimentos de uma população que via suas casas demolidas e sua vida regulada por decisões tomadas sem ela. O governo decretou estado de sítio, reprimiu duramente os revoltosos e, por fim, suspendeu a obrigatoriedade da vacina.",
          "Mais de um século depois, a cidade continua marcada por essa história. As favelas, que o poder público tentou durante décadas remover ou ignorar, abrigam hoje uma parte considerável da população carioca e produziram boa parte da cultura que o mundo associa ao Rio, do samba ao funk. O geógrafo Milton Santos insistia em que o espaço urbano não é um cenário neutro, mas o produto de relações sociais e decisões políticas. Quem caminha hoje pela Pedra do Sal, na região que ficou conhecida como Pequena África e onde o samba ganhou forma no início do século XX, anda sobre camadas de uma disputa que ainda não terminou: quem tem direito ao centro da cidade?"
        ],
        titles: [
          "Uma planta do sertão dá nome ao morro",
          "A vacina e a revolta",
          "O Rio que vive dos turistas",
          "Morar perto do trabalho",
          "Paris nos trópicos",
          "Uma demolição em pouco mais de um dia",
          "A chegada do metrô à Zona Sul",
          "Uma disputa que continua"
        ],
        match: [3, 5, 0, 4, 1, 7],
        vf: [
          ["Os cortiços permitiam que os mais pobres morassem perto do trabalho.", true, "«eram a única maneira de viver perto do trabalho, no porto e no comércio do Centro»"],
          ["A demolição do Cabeça de Porco levou vários meses.", false, "«numa operação que durou pouco mais de um dia»"],
          ["Os soldados de Canudos foram ao Rio à espera de moradias ou do pagamento dos soldos.", true, "«à espera de moradias prometidas pelo governo ou, segundo outras versões, do pagamento dos soldos atrasados»"],
          ["«Favela» era originalmente o nome de uma planta.", true, "«coberto por uma planta resistente chamada favela»"],
          ["A reforma de Pereira Passos se inspirou em Londres.", false, "«inspirada na Paris redesenhada pelo barão Haussmann»"],
          ["Segundo o texto, a Revolta da Vacina se explica apenas pelo medo da injeção.", false, "«não se explica apenas pelo medo da injeção […] mas pelo acúmulo de ressentimentos»"],
          ["Depois da revolta, a vacinação obrigatória foi mantida.", false, "«por fim, suspendeu a obrigatoriedade da vacina»"],
          ["O texto apresenta o direito ao centro da cidade como uma questão ainda em aberto.", true, "«uma disputa que ainda não terminou: quem tem direito ao centro da cidade?»"]
        ] },

      { id: "let-2", title: "Abril em Lisboa: o fim da ditadura e do império",
        paragraphs: [
          "Durante quase meio século, Portugal viveu sob uma ditadura. Depois do golpe militar de 1926, António de Oliveira Salazar, professor de economia da Universidade de Coimbra, tornou-se ministro das Finanças em 1928 e, em 1932, chefe do governo. No ano seguinte, uma nova Constituição instituiu o Estado Novo, um regime autoritário, católico e corporativista, resumido no lema «Deus, Pátria, Família». Havia censura prévia à imprensa, um único partido legal e uma polícia política, conhecida a partir de 1945 como PIDE, que vigiava, prendia e torturava os opositores.",
          "Enquanto outras potências europeias abriam mão de suas colônias, o regime insistia em que Portugal era uma só nação, «do Minho a Timor», espalhada por vários continentes. A partir de 1961, eclodiram movimentos armados de libertação em Angola e, pouco depois, na Guiné-Bissau e em Moçambique. A guerra colonial durou treze anos, mobilizou centenas de milhares de jovens e consumiu uma parte enorme do orçamento. Muitos rapazes emigraram clandestinamente, sobretudo para a França, para escapar do serviço militar. Em 1968, Salazar foi afastado do poder por motivos de saúde e substituído por Marcello Caetano, que prometeu uma abertura que nunca chegou a se concretizar.",
          "Na madrugada de 25 de abril de 1974, um grupo de oficiais de patente intermediária, os capitães do Movimento das Forças Armadas, pôs em marcha um golpe cuidadosamente planejado. Os sinais foram dados pelo rádio: pouco antes das onze da noite do dia 24, tocou a canção «E Depois do Adeus»; passada a meia-noite, «Grândola, Vila Morena», de Zeca Afonso, um cantor perseguido pelo regime. Era a confirmação de que as operações tinham começado. Ao longo do dia, as tropas do capitão Salgueiro Maia cercaram o quartel do Carmo, em Lisboa, onde Marcello Caetano se refugiara. No fim da tarde, Caetano entregou o poder ao general António de Spínola.",
          "O povo não ficou em casa, como pediam os comunicados dos revoltosos: saiu às ruas e se misturou aos soldados. Conta-se que Celeste Caeiro, funcionária de um restaurante de Lisboa, levava para casa os cravos que seriam oferecidos aos clientes numa comemoração que acabou cancelada. Quando um soldado lhe pediu um cigarro, ela lhe ofereceu um cravo, e ele o colocou no cano do fuzil. O gesto se espalhou. Houve poucas vítimas, quase todas baleadas por agentes da polícia política diante da sede dela, e os cravos vermelhos deram nome à revolução.",
          "A revolução abriu caminho para a independência das colônias: a da Guiné-Bissau foi reconhecida em 1974; as de Moçambique, Cabo Verde, São Tomé e Príncipe e Angola vieram em 1975. O fim do império trouxe para Portugal centenas de milhares de pessoas, os chamados «retornados», muitas das quais nunca tinham pisado na metrópole. Marcello Caetano, por sua vez, partiu para o exílio no Brasil e morreu no Rio de Janeiro em 1980. Em 25 de abril de 1975, os portugueses votaram nas primeiras eleições livres em quase cinquenta anos, e em 1976 foi aprovada uma nova Constituição.",
          "A poeta Sophia de Mello Breyner Andresen resumiu o sentimento daquela manhã em versos que muitos portugueses sabem de cor: «Esta é a madrugada que eu esperava / O dia inicial inteiro e limpo». Anos depois, o ensaísta Eduardo Lourenço, em O Labirinto da Saudade (1978), propôs uma leitura menos eufórica: para ele, os portugueses tinham vivido séculos com uma imagem irreal e engrandecida de si mesmos, e o fim do império os obrigava a se verem, enfim, como um pequeno país europeu. Em 1986, Portugal entrou na Comunidade Econômica Europeia. A saudade, porém, não desapareceu: talvez só tenha mudado de objeto."
        ],
        titles: [
          "Uma flor no cano do fuzil",
          "O terremoto de 1755",
          "Da euforia à reflexão",
          "Censura, partido único e polícia política",
          "Canções no rádio, tropas nas ruas",
          "A corte parte para o Brasil",
          "Uma guerra longe de casa",
          "O fim do império"
        ],
        match: [3, 6, 4, 0, 7, 2],
        vf: [
          ["Salazar chegou ao poder como líder do golpe militar de 1926.", false, "«Depois do golpe militar de 1926, […] tornou-se ministro das Finanças em 1928»"],
          ["A guerra colonial levou muitos jovens a emigrar clandestinamente.", true, "«Muitos rapazes emigraram clandestinamente, sobretudo para a França, para escapar do serviço militar»"],
          ["O primeiro sinal do golpe foi transmitido pelo rádio na noite de 24 de abril.", true, "«pouco antes das onze da noite do dia 24, tocou a canção «E Depois do Adeus»»"],
          ["Os revoltosos pediram à população que saísse às ruas.", false, "«O povo não ficou em casa, como pediam os comunicados dos revoltosos»"],
          ["Celeste Caeiro tinha comprado os cravos para oferecê-los aos soldados.", false, "«levava para casa os cravos que seriam oferecidos aos clientes numa comemoração que acabou cancelada»"],
          ["Marcello Caetano morreu no exílio, no Rio de Janeiro.", true, "«partiu para o exílio no Brasil e morreu no Rio de Janeiro em 1980»"],
          ["Eduardo Lourenço fez uma leitura tão eufórica quanto a de Sophia.", false, "«propôs uma leitura menos eufórica»"],
          ["Portugal entrou na Comunidade Econômica Europeia em 1986.", true, "«Em 1986, Portugal entrou na Comunidade Econômica Europeia»"]
        ] }
    ],

    scrittura: [
      { id: "scr-1", kind: "argomentativo", words: 200,
        t: "Un diario carioca abrió un debate en su sección de opinión con esta tesis: «O jeitinho brasileiro é mais uma virtude criativa do que um problema para o país». Como lector o lectora, escribí un artículo de opinión en portugués (180-220 palabras) para esa sección. Tomá posición a favor o en contra, sostenela con al menos dos argumentos y un ejemplo concreto (de Brasil, de Argentina o de tu experiencia), mencioná al menos una idea de Sérgio Buarque de Holanda («homem cordial») o de Roberto DaMatta («Você sabe com quem está falando?»), y cerrá con una conclusión. Tené en cuenta quién escribe, para quién y con qué fin. Registro formal, conectores variados (além disso, no entanto, ainda que, diante do exposto…), párrafos bien organizados y al menos un futuro do subjuntivo o un infinitivo pessoal.",
        rubric: [["contexto", "Adequação ao contexto: respeta el género (artículo de opinión), el enunciador, el lector y el propósito; toma posición, da dos argumentos, un ejemplo y la referencia pedida"],
                 ["discursiva", "Adequação discursiva: coherencia y cohesión; progresión de las ideas, párrafos con una idea cada uno, conectores variados"],
                 ["linguistica", "Adequação linguística (gramática): concordancias, tiempos, subjuntivo, futuro do subjuntivo, crase, regencias, colocação pronominal"],
                 ["lexico", "Adequação linguística (léxico): riqueza y precisión, registro culto, sin calcos del español ni falsos amigos"]] },
      { id: "scr-2", kind: "formale", words: 120,
        t: "Estás escribiendo un trabajo sobre la recepción de Camões en Brasil y querés consultar una edición antigua de Os Lusíadas en la biblioteca del Real Gabinete Português de Leitura, en el Centro de Río. Escribí un e-mail formal en portugués (100-140 palabras) a la dirección de la biblioteca: presentate (quién sos, qué estudiás y dónde), explicá el motivo de la consulta, pedí autorización para dos fechas concretas y preguntá qué documentos tenés que presentar. Usá «o senhor / a senhora», una apertura y un cierre adecuados (Prezado/a…, Atenciosamente) y fórmulas del registro formal (venho por meio deste, gostaria de solicitar, agradeceria se, fico no aguardo).",
        rubric: [["contexto", "Adequação ao contexto: e-mail formal completo (apertura, presentación, motivo, pedido con fechas, pregunta, cierre) dirigido a la institución"],
                 ["discursiva", "Adequação discursiva: orden lógico y conectores del registro formal"],
                 ["linguistica", "Adequação linguística (gramática): tratamiento «o senhor / a senhora» coherente con verbo en 3.ª persona, tiempos, pronombres (lhe, o/a)"],
                 ["lexico", "Adequação linguística (léxico): fórmulas de la correspondencia formal, sin expresiones coloquiales"]] }
    ]
  };
  if (typeof module === "object" && module.exports) module.exports = ESAME; else root.EsameData = ESAME;
})(typeof window !== "undefined" ? window : globalThis);
