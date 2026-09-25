# -*- coding: utf-8 -*-
"""Ejercicios de la Estação 4 — O Cume (semanas 40-51, B2 → C1).

Al menos 45 ítems por semana (la 52 es el examen final, que va aparte).
Mezcla por semana: 12 choice, 12 cloze, 8 translate, 4 fixerr, 3 garden,
2 scopri, 2 typed y 3 combina.  «part» es el índice de la parte de la
lección (tools/lessons/s4.py) que el ítem ejercita.  Nada antes de su
teoría: cada ítem usa solo tiempos con TENSE_WEEK <= su semana.

Contenido: el Rio cotidiano (Copacabana, Lapa, o boteco, o bloco) mezclado
con historia, literatura, sociología y política de Brasil y Portugal
(1808, Abolição, República, ditadura, Constituição de 1988; Machado,
Pessoa, Saramago, Freyre, Sérgio Buarque, DaMatta, Paulo Freire...).
"""

CE = "Elegí la forma correcta."
CL = "Completá."
TR = "Traducí al portugués."
GP = "Mirá los tres ejemplos y completá el cuarto."
SP = "Leé las frases y descubrí la regla."
CB = "Uní las frases en una sola usando el conector entre paréntesis."
FX = "Encontrá el error: tocá la palabra que está mal y corregila."

ITEMS = []
_N = {}


def _add(w, part, typ, prompt, stem, answer, note, alt=None, **extra):
    _N[w] = _N.get(w, 0) + 1
    d = dict(id="s4-%d-%02d" % (w, _N[w]), w=w, part=part,
             level="B2" if w == 40 else "C1", type=typ, prompt=prompt,
             stem=stem, answer=answer, alt=list(alt or []), note=note)
    d.update(extra)
    ITEMS.append(d)


def ch(w, p, stem, options, answer, note, prompt=CE):
    _add(w, p, "choice", prompt, stem, answer, note, options=list(options))


def cl(w, p, stem, answer, note, alt=None, prompt=CL):
    _add(w, p, "cloze", prompt, stem, answer, note, alt)


def tr(w, p, stem, answer, alt, note, prompt=TR):
    _add(w, p, "translate", prompt, stem, answer, note, alt)


def fx(w, p, stem, bad, good, cat, note, goodAlt=None):
    extra = dict(bad=bad, good=good, cat=cat)
    if goodAlt:
        extra["goodAlt"] = goodAlt
    _add(w, p, "fixerr", FX, stem, stem.replace(bad, good, 1), note, **extra)


def gd(w, p, lead, stem, answer, trap, note, alt=None):
    _add(w, p, "garden", GP, stem, answer, note, alt, lead=lead, trap=trap)


def sc(w, p, data, stem, options, answer, note):
    _add(w, p, "scopri", SP, stem, answer, note, data=list(data),
         options=list(options))


def ty(w, p, prompt, stem, answer, note, alt=None):
    _add(w, p, "typed", prompt, stem, answer, note, alt)


def cb(w, p, stem, answer, alt, note):
    _add(w, p, "combina", CB, stem, answer, note, alt)


# ===========================================================================
# Semana 40 — Registro formal e nominalização (B2)
# parts: 0 nominalización · 1 haver y verbos del informe · 2 cohesión e
# impersonalidad
# ===========================================================================
W = 40
ch(W, 0, "A ___ dos dados do censo levou meses.",
   ["análise", "analisação", "analisamento"], "análise",
   "analisar → a análise, sin sufijo -ção ni -mento, y femenino: a análise.")
ch(W, 0, "O ___ da passagem de ônibus provocou os protestos de 2013.",
   ["aumento", "aumentamento", "aumentação"], "aumento",
   "aumentar → o aumento. Las Jornadas de Junho de 2013 empezaron contra una suba del boleto.")
ch(W, 0, "A ___ da Lei Áurea, em 13 de maio de 1888, aboliu a escravidão.",
   ["assinatura", "assinação", "assinamento"], "assinatura",
   "assinar → a assinatura (la firma). La Lei Áurea la firmó la princesa Isabel.")
ch(W, 0, "A ___ da capital do Rio para Brasília aconteceu em 1960.",
   ["transferência", "transferimento", "transferição"], "transferência",
   "transferir → a transferência (-ência, femenino). Brasília se inauguró el 21 de abril de 1960.")
ch(W, 0, "Houve ___ nas vendas do comércio carioca em janeiro.",
   ["uma queda", "uma caída", "um caimento"], "uma queda",
   "cair → a queda (la caída, la baja). «Caída» no existe en portugués.")
ch(W, 1, "No Brasil colonial, ___ centenas de quilombos além de Palmares.",
   ["havia", "haviam", "tinham"], "havia",
   "haver existencial no tiene plural: havia centenas de quilombos. «Haviam» es el mismo error que «habían muchos» en español.",
   prompt="Elegí la forma de la norma escrita.")
ch(W, 1, "Durante a ditadura, ___ censura prévia aos jornais.",
   ["houve", "houveram", "tiveram"], "houve",
   "«Hubo» = houve, siempre en singular. En el habla se oye «teve censura», pero no «tiveram».",
   prompt="Elegí la forma de la norma escrita.")
ch(W, 1, "A comissão procedeu ___ exame dos documentos.",
   ["ao", "o", "no"], "ao",
   "proceder a (dar comienzo a) rige «a»: a + o = ao exame; ante femenino, à análise.")
ch(W, 1, "A audiência pública foi ___ no Palácio Tiradentes.",
   ["realizada", "realizado", "feito"], "realizada",
   "En la pasiva el participio concuerda con el sujeto: a audiência foi realizada. «Realizar» es el verbo del informe para eventos.")
ch(W, 1, "Pode ___ atrasos na entrega do relatório.",
   ["haver", "haverem", "havendo"], "haver",
   "Con haver existencial, el auxiliar queda en singular y haver en infinitivo: pode haver atrasos.")
ch(W, 2, "Freyre publicou Casa-Grande & Senzala em 1933; Sérgio Buarque, Raízes do Brasil em 1936. ___ era pernambucano; este, paulista.",
   ["Aquele", "Este", "Esse"], "Aquele",
   "aquele retoma lo nombrado primero (Freyre, de Recife); este, lo último (Sérgio Buarque, de São Paulo).")
ch(W, 2, "___ mudanças importantes na zona portuária depois de 2016.",
   ["Observam-se", "Observa-se", "Se observam"], "Observam-se",
   "Pasiva con se: el verbo concuerda con mudanças (plural). Al principio de la oración, la norma pide ênclise: Observam-se.")

cl(W, 0, "A ___ (reduzir) da maioridade penal divide o Congresso.", "redução",
   "reduzir → a redução: -zir da -ção, y el sustantivo es femenino.")
cl(W, 0, "O ___ (crescer) das favelas acelerou no século XX.", "crescimento",
   "crescer → o crescimento (-mento, masculino). Ojo: sin la i del español «crecimiento».")
cl(W, 0, "A ___ (perder) do acervo do Museu Nacional, em 2018, foi irreparável.", "perda",
   "perder → a perda (la pérdida), sin sufijo. El Museu Nacional, en la Quinta da Boa Vista, se incendió en 2018.")
cl(W, 0, "O ___ (fechar) do Canecão entristeceu os cariocas.", "fechamento",
   "fechar → o fechamento (el cierre). Muy usado en noticias: o fechamento da praia, do museu.")
cl(W, 0, "A ___ (vender) de ingressos para o Rock in Rio esgotou em horas.", "venda",
   "vender → a venda (la venta), sin sufijo y femenino.")
cl(W, 1, "Em 1808, com a chegada da corte, ___ (haver, perfeito) uma mudança radical no Rio.", "houve",
   "Perfeito de haver existencial: houve. La corte portuguesa llegó a Río en 1808 huyendo de Napoleón.")
cl(W, 1, "Segundo o relatório, ___ (haver, presente) muitas falhas na obra.", "há",
   "haver existencial en presente: há, con tilde, y en singular aunque siga un plural.")
cl(W, 1, "A prefeitura procedeu ___ vistoria dos prédios do Centro.", "à",
   "proceder a + a vistoria = à vistoria, con crase.")
cl(W, 1, "Os técnicos ___ (constatar, perfeito) que a água estava imprópria para banho.", "constataram",
   "constatar = comprobar un hecho. Perfeito, 3.ª plural: constataram.")
cl(W, 2, "Os dados foram coletados e, depois, nós ___ analisamos.", "os",
   "Para no repetir «os dados», el pronombre directo os. En la escritura cuidada de Brasil, «nós os analisamos».")
cl(W, 2, "___ (realizar-se, perfeito) duas audiências públicas sobre o VLT.", "Realizaram-se",
   "Pasiva con se: concuerda con audiências (plural) y, al inicio, el pronombre va después: Realizaram-se.")
cl(W, 2, "Neste artigo, ___ (discutir, nós) o conceito de «homem cordial».", "discutimos",
   "El nós de modestia es típico del texto académico: discutimos, analisamos, propomos.")

tr(W, 0, "El aumento de los precios preocupa al gobierno.",
   "O aumento dos preços preocupa o governo.",
   ["O aumento de preços preocupa o governo"],
   "aumentar → o aumento; de + os = dos. preocupar lleva objeto directo: preocupa o governo, sin «a».")
tr(W, 0, "La decisión del intendente fue polémica.",
   "A decisão do prefeito foi polêmica.",
   ["A decisão do prefeito foi controversa", "A decisão do prefeito foi controvertida"],
   "decidir → a decisão; el intendente es o prefeito. polêmica, con circunflejo.")
tr(W, 0, "El análisis de los datos llevó dos meses.",
   "A análise dos dados levou dois meses.",
   ["A análise dos dados demorou dois meses", "A análise dos dados durou dois meses"],
   "a análise es femenino; de + os = dos.")
tr(W, 1, "Hubo muchas protestas en 2013.",
   "Houve muitos protestos em 2013.",
   ["Em 2013 houve muitos protestos", "Houve muitas manifestações em 2013",
    "Em 2013 houve muitas manifestações"],
   "houve en singular; y protesto es masculino: muitos protestos.")
tr(W, 1, "Había pocos libros sobre Palmares.",
   "Havia poucos livros sobre Palmares.",
   ["Existiam poucos livros sobre Palmares"],
   "havia, nunca «haviam». Palmares fue el mayor quilombo del Brasil colonial.")
tr(W, 1, "La reunión se realizó en el Palácio Tiradentes.",
   "A reunião foi realizada no Palácio Tiradentes.",
   ["A reunião realizou-se no Palácio Tiradentes", "A reunião se realizou no Palácio Tiradentes"],
   "realizar es el verbo formal para eventos; em + o = no.")
tr(W, 2, "Se observa una caída de la violencia.",
   "Observa-se uma queda da violência.",
   ["Observa-se uma queda na violência", "Nota-se uma queda da violência",
    "Nota-se uma queda na violência", "Constata-se uma queda da violência",
    "Constata-se uma queda na violência", "Verifica-se uma queda da violência",
    "Verifica-se uma queda na violência"],
   "Al inicio, ênclise: Observa-se. «Caída» se dice queda.")
tr(W, 2, "En este trabajo analizamos la obra de Darcy Ribeiro.",
   "Neste trabalho, analisamos a obra de Darcy Ribeiro.",
   ["Nesse trabalho, analisamos a obra de Darcy Ribeiro"],
   "em + este = neste; el nós de modestia académico. Darcy Ribeiro escribió O Povo Brasileiro (1995).")

fx(W, 1, "Haviam mais de um milhão de pessoas na Candelária em abril de 1984.",
   "Haviam", "Havia", "concordancia",
   "haver existencial no concuerda: havia um milhão de pessoas. El acto de las Diretas Já en la Candelária reunió a cerca de un millón.")
fx(W, 0, "O análise dos documentos durou um ano.", "O análise", "A análise", "genero",
   "análise es femenino en portugués (el análisis): a análise.")
fx(W, 0, "O investimiento em saneamento ainda é baixo.", "investimiento", "investimento", "espanol",
   "-miento → -mento: o investimento, o crescimento, o casamento.")
fx(W, 2, "Realizou-se três reuniões com os moradores da Maré.", "Realizou-se", "Realizaram-se", "concordancia",
   "En la pasiva con se, el verbo concuerda con el sujeto plural: realizaram-se três reuniões.")

gd(W, 0, [["aumentar", "o aumento"], ["pagar", "o pagamento"], ["investir", "o investimento"]],
   "analisar → ___", "a análise", "o analisamento",
   "Muchos verbos dan -mento, pero analisar da a análise, sin sufijo y femenina (el análisis).",
   alt=["análise"])
gd(W, 0, [["informar", "a informação"], ["reduzir", "a redução"], ["decidir", "a decisão"]],
   "pesquisar → ___", "a pesquisa", "a pesquisação",
   "El patrón -ção es fuerte, pero pesquisar da a pesquisa: la investigación o la encuesta.",
   alt=["pesquisa"])
gd(W, 1, [["Chegou um aluno.", "Chegaram dois alunos."], ["Caiu uma árvore.", "Caíram duas árvores."],
          ["Saiu uma notícia.", "Saíram duas notícias."]],
   "Houve um protesto. → ___ dois protestos.", "Houve", "Houveram",
   "Los verbos normales concuerdan con el sujeto, pero haver existencial no tiene sujeto: houve dois protestos.")

sc(W, 0, ["decidir → a decisão", "informar → a informação", "reduzir → a redução",
          "pagar → o pagamento", "investir → o investimento", "crescer → o crescimento"],
   "¿Qué género tienen los sustantivos en -ção y en -mento?",
   ["-ção es femenino y -mento, masculino.",
    "Los dos son masculinos, como el español «el».",
    "Depende del género del verbo."],
   "-ção es femenino y -mento, masculino.",
   "Regla: a decisão, as informações (femeninos); o pagamento, o crescimento (masculinos).")
sc(W, 1, ["Há muitos turistas no Rio.", "Havia dois bondes em Santa Teresa.", "Houve protestos em 2013.",
          "Haverá eleições em outubro.", "Pode haver atrasos.", "Deve haver outra saída."],
   "¿Cómo se conjuga «haver» cuando significa «existir»?",
   ["Queda siempre en singular, también el auxiliar.",
    "Concuerda con el sustantivo que sigue.",
    "Va en plural solo en el pasado."],
   "Queda siempre en singular, también el auxiliar.",
   "haver existencial es impersonal: há, havia, houve, haverá; y pode haver, deve haver.")

ty(W, 0, "Escribí el sustantivo, con artículo, que corresponde al verbo.", "vender → ___", "a venda",
   "vender → a venda (la venta).", alt=["venda"])
ty(W, 1, "Escribí la forma de «haver» de la norma culta.", "Ontem ___ (haver) um apagão em Botafogo.", "houve",
   "«Hubo» = houve, perfeito de haver.")

cb(W, 0, "Os preços aumentaram. Isso preocupa os comerciantes. (o aumento de)",
   "O aumento dos preços preocupa os comerciantes.",
   ["O aumento de preços preocupa os comerciantes"],
   "La nominalización condensa: os preços aumentaram → o aumento dos preços.")
cb(W, 2, "O governo publicou os dados. O governo analisou os dados. (e + pronombre)",
   "O governo publicou os dados e os analisou.",
   ["O governo publicou os dados e analisou-os"],
   "Para no repetir, el pronombre directo: e os analisou (o analisou-os).")
cb(W, 2, "A Constituição foi promulgada em 1988. A Constituição é chamada de «Constituição Cidadã». (que)",
   "A Constituição, que foi promulgada em 1988, é chamada de «Constituição Cidadã».",
   ["A Constituição que foi promulgada em 1988 é chamada de Constituição Cidadã",
    "A Constituição, promulgada em 1988, é chamada de «Constituição Cidadã»",
    "A Constituição promulgada em 1988 é chamada de Constituição Cidadã"],
   "El relativo que evita repetir el sujeto. Ulysses Guimarães la llamó «Constituição Cidadã» al promulgarla, el 5 de octubre de 1988.")


# ===========================================================================
# Semana 41 — Mais-que-perfeito simples e narrativa
# parts: 0 forma y trampa · 1 tres formas / dónde se lee · 2 expresiones
# fijas y narración
# ===========================================================================
W = 41
ch(W, 0, "Quando a polícia chegou, o ladrão já ___.",
   ["fugira", "fugisse", "fugiria"], "fugira",
   "fugira = tinha fugido (había huido): mais-que-perfeito, indicativo. fugisse es subjuntivo.")
ch(W, 0, "Nós já ___ a reserva quando o voo foi cancelado.",
   ["fizéramos", "fizeramos", "fizéssemos"], "fizéramos",
   "La 1.ª plural del mais-que-perfeito lleva tilde: fizéramos, fôramos, estivéramos.")
ch(W, 0, "Ela contou que o avô ___ em Trás-os-Montes.",
   ["nascera", "nascesse", "nacera"], "nascera",
   "nasceram → nascera (había nacido). Ojo con la grafía: nascer, con sc.")
ch(W, 0, "Quando lançou Dom Casmurro, em 1899, Machado já ___ Memórias Póstumas de Brás Cubas.",
   ["publicara", "publicasse", "publicaria"], "publicara",
   "publicara = tinha publicado. Brás Cubas es de 1881, anterior a Dom Casmurro.")
ch(W, 0, "Se eu ___ dinheiro, iria a Lisboa no verão.",
   ["tivesse", "tivera", "tiver"], "tivesse",
   "La hipótesis va con imperfeito do subjuntivo: se eu tivesse. «Se eu tivera» es calco del español «tuviera».")
ch(W, 1, "Quando cheguei, o show já ___.",
   ["tinha acabado", "tem acabado", "tive acabado"], "tinha acabado",
   "En la charla, el pasado anterior es tinha + participio. tem acabado sería «viene terminando».",
   prompt="Elegí la forma natural en una charla.")
ch(W, 1, "Quando D. João VI voltou a Lisboa, em 1821, já ___ treze anos no Brasil.",
   ["passara", "passasse", "passava"], "passara",
   "passara = tinha passado: los trece años son anteriores a la vuelta. La corte vivió en Río de 1808 a 1821.")
ch(W, 1, "Em «ninguém sabia o que ele fizera», «fizera» equivale a ___.",
   ["tinha feito", "fizesse", "faria"], "tinha feito",
   "El mais-que-perfeito simples y tinha feito dicen lo mismo; el simple es literario.",
   prompt="Elegí la equivalencia.")
ch(W, 2, "Tomara que o Flamengo ___ o clássico no domingo.",
   ["ganhe", "ganha", "ganhou"], "ganhe",
   "tomara que (ojalá) pide subjuntivo: tomara que ganhe.")
ch(W, 2, "Ela trabalhou doze horas no plantão. — ___! Está exausta.",
   ["Pudera", "Tomara", "Quem me dera"], "Pudera",
   "pudera! = ¡con razón!, ¡no es para menos! tomara y quem me dera expresan deseo.")
ch(W, 2, "___ ter uma casa em Paraty!",
   ["Quem me dera", "Pudera", "Tomara que"], "Quem me dera",
   "quem me dera + infinitivo = ¡quién pudiera!, ¡ojalá! tomara que pediría un verbo conjugado.")
ch(W, 2, "Era manhã de 1.º de novembro de 1755 em Lisboa. De repente, a terra ___.",
   ["tremeu", "tremia", "tremera"], "tremeu",
   "La acción que hace avanzar el relato va en perfeito: tremeu. El imperfeito pinta el fondo; el mais-que-perfeito, lo anterior.")

cl(W, 0, "Quando chegamos ao cais, o navio já ___ (partir, mais-que-perfeito simples).", "partira",
   "partiram → partira (había partido).", alt=["tinha partido", "havia partido"])
cl(W, 0, "Eles nunca ___ (ver, mais-que-perfeito simples) o mar antes de chegar ao Rio.", "viram",
   "En 3.ª plural el mais-que-perfeito es igual al perfeito: viram. El contexto («antes de») marca la anterioridad.",
   alt=["tinham visto", "haviam visto"])
cl(W, 0, "Nós ___ (estar, mais-que-perfeito simples) em Coimbra dois anos antes.", "estivéramos",
   "estiveram → estivéramos, con tilde en la 1.ª plural.", alt=["tínhamos estado", "havíamos estado"])
cl(W, 0, "Saramago contou que na juventude ___ (ser, mais-que-perfeito simples) serralheiro mecânico.", "fora",
   "ser e ir: foram → fora. Saramago trabajó de joven como cerrajero mecánico antes de ser escritor.",
   alt=["tinha sido", "havia sido"])
cl(W, 0, "Eu ___ (dizer, mais-que-perfeito simples) a verdade, mas ninguém acreditou.", "dissera",
   "disseram → dissera (había dicho), no «dijera».", alt=["tinha dito", "havia dito"])
cl(W, 1, "Quando a ditadura acabou, muitos exilados já ___ (voltar, habla) com a Anistia de 1979.", "tinham voltado",
   "En el habla: tinha + participio. La Lei da Anistia es de 1979; el régimen militar terminó en 1985.",
   alt=["haviam voltado", "voltaram"])
cl(W, 1, "Quando publicou A Hora da Estrela, em 1977, Clarice já ___ (escrever, mais-que-perfeito simples) A Paixão segundo G.H.", "escrevera",
   "escreveram → escrevera. A Paixão segundo G.H. es de 1964.", alt=["tinha escrito", "havia escrito"])
cl(W, 1, "O jornal noticiou que o incêndio ___ (começar, mais-que-perfeito simples) de madrugada.", "começara",
   "começaram → começara: la prensa escrita todavía usa esta forma.", alt=["tinha começado", "havia começado"])
cl(W, 2, "Quem me ___ (dar) morar perto do mar!", "dera",
   "quem me dera es una fórmula fija: el mais-que-perfeito de dar.")
cl(W, 2, "Tomara que ela ___ (vir) ao ensaio da Portela.", "venha",
   "tomara que + subjuntivo presente: venha.")
cl(W, 2, "Era tarde. Joana ___ (fechar, perfeito) a janela e se deitou.", "fechou",
   "La acción que avanza en el relato va en perfeito: fechou.")
cl(W, 2, "Quando a moça acordou, o sol já ___ (nascer, mais-que-perfeito simples).", "nascera",
   "nasceram → nascera: pasó antes de que ella se despertara.", alt=["tinha nascido", "havia nascido"])

tr(W, 0, "Cuando llegué, ella ya había salido.",
   "Quando cheguei, ela já tinha saído.",
   ["Quando eu cheguei, ela já tinha saído", "Quando cheguei, ela já havia saído",
    "Quando eu cheguei, ela já havia saído", "Quando cheguei, ela já saíra",
    "Quando eu cheguei, ela já saíra"],
   "«Había salido» = tinha saído (habla), havia saído o saíra (escrito).")
tr(W, 0, "Si tuviera tiempo, leería a Eça de Queirós.",
   "Se eu tivesse tempo, leria Eça de Queirós.",
   ["Se tivesse tempo, leria Eça de Queirós", "Se eu tivesse tempo, eu leria Eça de Queirós",
    "Se eu tivesse tempo, leria o Eça de Queirós", "Se tivesse tempo, leria o Eça de Queirós"],
   "«Tuviera» = tivesse, nunca «tivera». Y sin «a»: ler Eça de Queirós, autor de Os Maias.")
tr(W, 1, "Nunca había visto el Cristo de cerca.",
   "Eu nunca tinha visto o Cristo de perto.",
   ["Nunca tinha visto o Cristo de perto", "Nunca havia visto o Cristo de perto",
    "Eu nunca havia visto o Cristo de perto", "Nunca vira o Cristo de perto",
    "Eu nunca vira o Cristo de perto"],
   "«De cerca» = de perto. «Había visto» = tinha visto, havia visto o vira.")
tr(W, 1, "El diario dijo que Jânio Quadros había renunciado.",
   "O jornal disse que Jânio Quadros tinha renunciado.",
   ["O jornal disse que Jânio Quadros havia renunciado", "O jornal disse que Jânio Quadros renunciara",
    "O jornal noticiou que Jânio Quadros tinha renunciado", "O jornal noticiou que Jânio Quadros havia renunciado",
    "O jornal noticiou que Jânio Quadros renunciara"],
   "Jânio Quadros renunció en agosto de 1961, a los siete meses de gobierno.")
tr(W, 1, "Machado ya había fundado la Academia cuando publicó Dom Casmurro.",
   "Machado já tinha fundado a Academia quando publicou Dom Casmurro.",
   ["Machado já havia fundado a Academia quando publicou Dom Casmurro",
    "Machado já fundara a Academia quando publicou Dom Casmurro"],
   "La Academia Brasileira de Letras es de 1897 y Dom Casmurro, de 1899: anterioridad con tinha fundado o fundara.")
tr(W, 2, "¡Ojalá llueva mañana!", "Tomara que chova amanhã!",
   ["Tomara que amanhã chova", "Espero que chova amanhã", "Quem dera chovesse amanhã"],
   "tomara que + subjuntivo presente: chova.")
tr(W, 2, "¡Quién pudiera vivir en Lisboa!", "Quem me dera morar em Lisboa!",
   ["Quem me dera viver em Lisboa", "Quem dera morar em Lisboa", "Quem dera viver em Lisboa"],
   "quem me dera + infinitivo = ¡quién pudiera!")
tr(W, 2, "Era de noche. Ana abrió la puerta y vio que alguien había entrado.",
   "Era noite. Ana abriu a porta e viu que alguém tinha entrado.",
   ["Era de noite. Ana abriu a porta e viu que alguém tinha entrado",
    "Era noite. Ana abriu a porta e viu que alguém havia entrado",
    "Era de noite. Ana abriu a porta e viu que alguém havia entrado",
    "Era noite. Ana abriu a porta e viu que alguém entrara",
    "Era de noite. Ana abriu a porta e viu que alguém entrara"],
   "Imperfeito para el fondo (era), perfeito para lo que avanza (abriu, viu) y mais-que-perfeito para lo anterior.")

fx(W, 0, "Se eu tivera mais tempo, estudaria em Coimbra.", "tivera", "tivesse", "subjuntivo",
   "tivera es indicativo (había tenido). La hipótesis pide imperfeito do subjuntivo: se eu tivesse.")
fx(W, 0, "Nós já fizeramos a reserva quando o voo foi cancelado.", "fizeramos", "fizéramos", "ortografia",
   "La 1.ª plural lleva tilde: fizéramos (es esdrújula).")
fx(W, 2, "Tomara que você vem ao ensaio da Mangueira.", "vem", "venha", "subjuntivo",
   "tomara que pide subjuntivo: tomara que você venha.")
fx(W, 1, "Quando cheguei, o filme já tem começado.", "tem começado", "tinha começado", "tempo",
   "Para lo anterior a otro pasado: tinha começado. tem começado sería una acción repetida hasta hoy.")

gd(W, 0, [["fizeram", "fizera"], ["disseram", "dissera"], ["tiveram", "tivera"]],
   "estiveram → (nós) ___", "estivéramos", "estiveramos",
   "La 1.ª plural del mais-que-perfeito es esdrújula y lleva tilde: estivéramos, fizéramos, disséramos.")
gd(W, 0, [["falaram", "falara"], ["comeram", "comera"], ["partiram", "partira"]],
   "puseram → ___", "pusera", "pusiera",
   "La raíz sale del perfeito portugués: puseram → pusera. «Pusiera» es el subjuntivo español.")
gd(W, 0, [["quiseram", "quisera"], ["souberam", "soubera"], ["trouxeram", "trouxera"]],
   "foram → ___", "fora", "fuera",
   "foram → fora (había sido / había ido). «Fuera» es español; en portugués fora también significa «afuera».")

sc(W, 1, ["Quando cheguei, ele já saíra.", "Quando cheguei, ele já tinha saído.",
          "Ela já almoçara quando ligamos.", "Ela já tinha almoçado quando ligamos.",
          "O navio partira de madrugada.", "O navio tinha partido de madrugada."],
   "¿Qué relación hay entre «saíra» y «tinha saído»?",
   ["Significan lo mismo; «saíra» es más literario.",
    "«Saíra» es subjuntivo y «tinha saído», indicativo.",
    "«Saíra» es más reciente que «tinha saído»."],
   "Significan lo mismo; «saíra» es más literario.",
   "Los dos son pluscuamperfecto de indicativo: la forma simple se lee, la compuesta se dice.")
sc(W, 2, ["Era uma noite quente.", "Joana abriu a janela.", "Ninguém dormira ali havia anos.",
          "A rua estava vazia.", "Ela saiu de casa.", "Esquecera as chaves."],
   "¿Qué tiempo usa el relato para lo que ocurrió ANTES de la acción principal?",
   ["El mais-que-perfeito (dormira, esquecera).",
    "El imperfeito (era, estava).",
    "El perfeito (abriu, saiu)."],
   "El mais-que-perfeito (dormira, esquecera).",
   "Perfeito = avanza; imperfeito = fondo; mais-que-perfeito = salto hacia atrás.")

ty(W, 0, "Escribí el mais-que-perfeito simples (3.ª persona singular).", "ver → ele ___", "vira",
   "viram → vira (había visto). Ojo: vira también es «da vuelta», de virar.")
ty(W, 0, "Escribí el mais-que-perfeito simples (1.ª persona plural).", "ser → nós ___", "fôramos",
   "foram → fôramos, con circunflejo en la 1.ª plural.")

cb(W, 1, "Pombal reconstruiu a Baixa. O terremoto de 1755 tinha destruído a Baixa. (que)",
   "Pombal reconstruiu a Baixa que o terremoto de 1755 tinha destruído.",
   ["Pombal reconstruiu a Baixa que o terremoto de 1755 destruíra",
    "Pombal reconstruiu a Baixa que o terremoto de 1755 havia destruído"],
   "El relativo retoma la Baixa; el mais-que-perfeito marca que la destrucción fue anterior a la reconstrucción.")
cb(W, 2, "Cheguei à estação. O trem já tinha partido. (quando)",
   "Quando cheguei à estação, o trem já tinha partido.",
   ["O trem já tinha partido quando cheguei à estação",
    "Quando eu cheguei à estação, o trem já tinha partido",
    "Quando cheguei à estação, o trem já partira",
    "Quando cheguei à estação, o trem já havia partido"],
   "quando + perfeito para el momento; el mais-que-perfeito para lo que ya había pasado.")
cb(W, 2, "Cabral chegou à Bahia em 1500. Os tupiniquins já viviam lá havia séculos. (quando)",
   "Quando Cabral chegou à Bahia em 1500, os tupiniquins já viviam lá havia séculos.",
   ["Os tupiniquins já viviam lá havia séculos quando Cabral chegou à Bahia em 1500",
    "Quando Cabral chegou à Bahia, em 1500, os tupiniquins já viviam lá havia séculos"],
   "havia séculos = hacía siglos: en un relato en pasado, haver va en imperfeito. La flota de Cabral llegó a la actual Porto Seguro.")
