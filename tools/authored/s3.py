# -*- coding: utf-8 -*-
"""Estação 3 — Mar Aberto (semanas 27-39): ejercicios propios (prefijo s3-).

Para cada semana: choice, cloze, translate (es → pt), fixerr, garden,
scopri, typed y combina; «part» es el índice de la parte de la lección
(tools/lessons/s3.py) a la que corresponde el ítem.  La semana 39 (chefão)
tiene 20 ítems mixtos de toda la estación.

Regla de oro: un ítem de la semana N solo usa tiempos con
TENSE_WEEK <= N (curriculo.py).
"""

ITEMS = []

CE = "Elegí la forma correcta."
CO = "Completá con la forma correcta del verbo entre paréntesis."
TR = "Traducí al portugués."
FX = "Encontrá el error: tocá la palabra que está mal y corregila."
GP = "Mirá los tres ejemplos y completá el cuarto."
SP = "Leé las frases y descubrí la regla."
CB = "Uní las frases en una sola usando el conector entre paréntesis."

_S = {"w": 0, "level": "B2", "n": 0, "topic": ""}


def V(*segs):
    """Todas las combinaciones de segmentos (str o lista de variantes)."""
    out = [""]
    for s in segs:
        opts = s if isinstance(s, list) else [s]
        out = [a + b for a in out for b in opts]
    return out


def trv(part, stem, note, *segs):
    """translate con alternativas generadas: la primera combinación es la respuesta."""
    allv = V(*segs)
    return tr(part, stem, allv[0], note, alt=allv[1:])


def wk(w, level, topic):
    _S.update(w=w, level=level, n=0, topic=topic)


def _add(part, typ, prompt, stem, answer, note, alt=None, **kw):
    _S["n"] += 1
    d = dict(id="s3-%d-%02d" % (_S["w"], _S["n"]), w=_S["w"], part=part,
             level=_S["level"], type=typ, topic=_S["topic"], prompt=prompt,
             stem=stem, answer=answer, alt=list(alt or []), note=note)
    d.update(kw)
    ITEMS.append(d)
    return d


def ch(part, stem, options, answer, note, prompt=CE):
    return _add(part, "choice", prompt, stem, answer, note, options=options)


def cl(part, stem, answer, note, alt=None, prompt=CO):
    return _add(part, "cloze", prompt, stem, answer, note, alt=alt)


def tr(part, stem, answer, note, alt=None):
    return _add(part, "translate", TR, stem, answer, note, alt=alt)


def fx(part, stem, bad, good, answer, cat, note, goodAlt=None):
    d = _add(part, "fixerr", FX, stem, answer, note, bad=bad, good=good, cat=cat)
    if goodAlt:
        d["goodAlt"] = goodAlt
    return d


def gd(part, lead, stem, answer, trap, note, prompt=GP):
    return _add(part, "garden", prompt, stem, answer, note, lead=lead, trap=trap)


def sc(part, data, stem, options, answer, note):
    return _add(part, "scopri", SP, stem, answer, note, data=data, options=options)


def ty(part, prompt, stem, answer, note, alt=None):
    return _add(part, "typed", prompt, stem, answer, note, alt=alt)


def cb(part, stem, answer, note, alt=None):
    return _add(part, "combina", CB, stem, answer, note, alt=alt)


# ============================================================================
# Semana 27 — Futuro do subjuntivo
# partes: 0 forma (regulares, irregulares) · 1 ver/vir, momentos futuros ·
#         2 condiciones abiertas y la principal
# ============================================================================
wk(27, "B1", "futuro do subjuntivo")

ch(0, "Quando eu ___ em casa, te mando uma mensagem.", ["chegar", "chegue", "chego"], "chegar",
   "Con «quando» y un momento futuro va futuro do subjuntivo; en los regulares es igual al infinitivo: quando eu chegar. «Chegue» es el calco de «cuando llegue».")
ch(0, "Se vocês ___ tempo, venham ao ensaio da escola de samba.", ["tiverem", "têm", "tenham"], "tiverem",
   "ter → tiveram → tiver; con vocês se agrega -em: se vocês tiverem. Nunca «se» + presente de subjuntivo.")
ch(0, "Quando nós ___ o apartamento, a gente dá uma festa.", ["alugarmos", "aluguemos", "alugamos"], "alugarmos",
   "Regular: infinitivo + -mos para nós: quando nós alugarmos. «Aluguemos» es subjuntivo presente, que no va con «quando» futuro.")
ch(0, "Se ela ___ a verdade, tudo se resolve.", ["disser", "dizer", "diga"], "disser",
   "dizer → disseram → disser. Los irregulares salen del perfeito, no del infinitivo.")
ch(0, "Quando a Constituição de 1988 ___ cinquenta anos, será 2038.", ["completar", "complete", "completa"], "completar",
   "Momento futuro tras «quando»: futuro do subjuntivo, que en los regulares coincide con el infinitivo.")
ch(1, "Quando você ___ o Pão de Açúcar de perto, vai entender.", ["vir", "ver", "vier"], "vir",
   "ver → viram → vir. «Quando você ver» es el error clásico; «vier» es de vir (venir).")
ch(1, "Se vocês ___ ao Rio em fevereiro, peguem um bloco.", ["vierem", "virem", "vêm"], "vierem",
   "vir (venir) → vieram → vier, vierem. «Virem» es el futuro do subjuntivo de ver.")
ch(1, "Enquanto eu ___ em Lisboa, quero ouvir fado em Alfama.", ["estiver", "esteja", "estar"], "estiver",
   "estar → estiveram → estiver. «Enquanto» con valor futuro pide futuro do subjuntivo.")
ch(1, "Assim que o síndico ___ a chave, a gente entra.", ["trouxer", "trazer", "traga"], "trouxer",
   "trazer → trouxeram → trouxer. «Assim que» (apenas) con futuro: futuro do subjuntivo.")
ch(2, "Se Deus ___, a mudança termina sábado.", ["quiser", "queira", "quer"], "quiser",
   "Fórmula fija: se Deus quiser. querer → quiseram → quiser.")
ch(2, "Se ___ amanhã, a gente não vai à praia.", ["chover", "chova", "choverá"], "chover",
   "Condición futura con «se»: futuro do subjuntivo. Nunca futuro de indicativo ni subjuntivo presente tras «se».")
ch(2, "Se você quiser, a gente ___ de metrô até Ipanema.", ["vai", "for", "iria"], "vai",
   "En la otra mitad va presente, «vou + infinitivo», futuro o imperativo: a gente vai. «For» sería otra condición.")

cl(0, "Quando eu ___ (poder), vou a Salvador.", "puder",
   "poder → puderam → puder. Parece el español «pudiera», pero es futuro: cuando pueda.")
cl(0, "Se vocês ___ (fazer) a reserva hoje, o preço é menor.", "fizerem",
   "fazer → fizeram → fizer, fizerem. El tronco es el del perfeito.")
cl(0, "Assim que nós ___ (saber) o resultado, avisamos.", "soubermos",
   "saber → souberam → souber, soubermos. «Sabermos» es otro tiempo (infinitivo pessoal, semana 29).")
cl(0, "Se a imobiliária ___ (dar) desconto, a gente fecha o contrato.", "der",
   "dar → deram → der. «Se der» también es la fórmula «si se puede».")
cl(0, "Quando eles ___ (pôr) o apartamento para alugar, me avisa.", "puserem",
   "pôr → puseram → puser, puserem. Sin tilde: la tilde de «pôr» es solo del infinitivo.")
cl(1, "Quando você ___ (ir) a Portugal, visite Coimbra.", "for",
   "ir y ser comparten la forma: foram → for. Quando você for = cuando vayas.")
cl(1, "Se eu ___ (ser) aprovado no concurso, mudo para Brasília.", "for",
   "ser → foram → for. Se eu for aprovado = si me aprueban.")
cl(1, "Sempre que vocês ___ (vir) ao Rio, fiquem aqui em casa.", "vierem",
   "vir → vieram → vier, vierem. «Sempre que» con valor futuro pide futuro do subjuntivo.")
cl(1, "Se você ___ (ver) a Bia na praia, fala com ela.", "vir",
   "ver → viram → vir. Sí: el futuro do subjuntivo de ver se escribe igual que el infinitivo de vir.")
cl(2, "Onde você ___ (estar), eu te encontro.", "estiver",
   "«Onde» + lugar indefinido en el futuro: futuro do subjuntivo, como «donde estés».")
cl(2, "Quando você ___ (ler) «Dom Casmurro», vai querer discutir a Capitu.", "ler",
   "Regular en esta forma: quando você ler. Capitu es la protagonista de la novela de Machado de Assis.")
cl(2, "Se ___ (haver) algum problema com o aluguel, me liga.", "houver",
   "haver → houveram → houver. Se houver = si hay (en el futuro).")

tr(0, "Cuando tenga tiempo, voy a visitar el Cristo.", "Quando eu tiver tempo, vou visitar o Cristo",
   "«Cuando tenga» = quando eu tiver (futuro do subjuntivo), nunca «quando eu tenha».",
   alt=["Quando tiver tempo, vou visitar o Cristo", "Quando eu tiver tempo, visitarei o Cristo",
        "Quando tiver tempo, visitarei o Cristo", "Quando eu tiver tempo, vou visitar o Cristo Redentor",
        "Quando tiver tempo, vou visitar o Cristo Redentor"])
tr(0, "Si hacés la feijoada, yo llevo la caipiriña.", "Se você fizer a feijoada, eu levo a caipirinha",
   "«Si hacés» con valor futuro = se você fizer. La otra mitad, en presente.",
   alt=["Se fizer a feijoada, eu levo a caipirinha", "Se você fizer feijoada, eu levo caipirinha",
        "Se você fizer a feijoada, levo a caipirinha", "Se você fizer a feijoada, eu vou levar a caipirinha",
        "Se tu fizeres a feijoada, eu levo a caipirinha"])
tr(1, "Cuando veas a Rafa, dale un abrazo.", "Quando você vir o Rafa, dá um abraço nele",
   "«Cuando veas» = quando você vir (de ver). Sin «a» personal: vir o Rafa.",
   alt=["Quando vir o Rafa, dá um abraço nele", "Quando você vir o Rafa, dê um abraço nele",
        "Quando vir o Rafa, dê um abraço nele", "Quando você vir o Rafa, abraça ele",
        "Quando você vir o Rafa, abrace-o", "Quando você vir Rafa, dá um abraço nele",
        "Quando você vir o Rafa, manda um abraço pra ele"])
tr(1, "Apenas lleguemos a Río, te llamamos.", "Assim que chegarmos ao Rio, te ligamos",
   "«Apenas» = assim que / logo que, con futuro do subjuntivo: chegarmos.",
   alt=["Assim que nós chegarmos ao Rio, te ligamos", "Logo que chegarmos ao Rio, te ligamos",
        "Assim que chegarmos no Rio, te ligamos", "Assim que a gente chegar ao Rio, te liga",
        "Assim que a gente chegar no Rio, te liga", "Assim que chegarmos ao Rio, ligamos para você",
        "Assim que chegarmos ao Rio, ligamos pra você", "Assim que chegarmos ao Rio, nós te ligamos"])
tr(1, "Mientras estés acá, la casa es tuya.", "Enquanto você estiver aqui, a casa é sua",
   "«Mientras estés» = enquanto você estiver. Con você, el posesivo es seu / sua.",
   alt=["Enquanto estiver aqui, a casa é sua", "Enquanto você estiver aqui a casa é sua",
        "Enquanto tu estiveres aqui, a casa é tua"])
tr(2, "Si querés, vamos a la playa.", "Se você quiser, a gente vai à praia",
   "Condición futura: se você quiser. «Vamos» se dice a gente vai o vamos.",
   alt=["Se você quiser, vamos à praia", "Se quiser, a gente vai à praia", "Se quiser, vamos à praia",
        "Se você quiser, a gente vai pra praia", "Se você quiser, vamos pra praia",
        "Se você quiser, a gente vai para a praia", "Se você quiser, vamos para a praia",
        "Se você quiser, nós vamos à praia"])
tr(2, "Hacé como te parezca mejor.", "Faça como você achar melhor",
   "«Como te parezca» = como você achar: futuro do subjuntivo tras «como» indefinido.",
   alt=["Faz como você achar melhor", "Faça como achar melhor", "Faz como achar melhor",
        "Faça como você acha melhor"])
tr(2, "Si llueve mañana, nos quedamos en casa.", "Se chover amanhã, a gente fica em casa",
   "Condición futura: se chover. «Nos quedamos» = a gente fica / ficamos.",
   alt=["Se chover amanhã, ficamos em casa", "Se amanhã chover, a gente fica em casa",
        "Se amanhã chover, ficamos em casa", "Se chover amanhã, nós ficamos em casa",
        "Se chover amanhã, a gente vai ficar em casa", "Se chover amanhã, vamos ficar em casa"])

fx(0, "Quando eu chegue em casa, te mando uma mensagem.", "chegue", "chegar",
   "Quando eu chegar em casa, te mando uma mensagem.", "futuro_subj",
   "«Cuando llegue» se dice quando eu chegar: el portugués usa futuro do subjuntivo, no el presente de subjuntivo.")
fx(1, "Se você ver o Lucas, diz que eu liguei.", "ver", "vir",
   "Se você vir o Lucas, diz que eu liguei.", "futuro_subj",
   "El futuro do subjuntivo de ver es vir (viram → vir). «Se você ver» es un error muy extendido.")
fx(0, "Quando nós fazermos a mudança, vamos precisar de ajuda.", "fazermos", "fizermos",
   "Quando nós fizermos a mudança, vamos precisar de ajuda.", "futuro_subj",
   "Tras «quando» futuro: fizermos, del tronco de fizeram. «Fazermos» es infinitivo pessoal.")
fx(1, "Quando eu estar em Salvador, vou comer acarajé.", "estar", "estiver",
   "Quando eu estiver em Salvador, vou comer acarajé.", "verbo_irregular",
   "estar es irregular: estiveram → estiver. Solo los regulares coinciden con el infinitivo.")

_L27 = [["falar", "falar"], ["comer", "comer"], ["abrir", "abrir"]]
_GP27 = "Mirá los tres ejemplos (quando eu…, futuro do subjuntivo) y completá el cuarto."
gd(1, _L27, "ver → ___", "vir", "ver",
   "En los regulares el futuro do subjuntivo coincide con el infinitivo, y eso te lleva a «quando eu ver». Pero ver es irregular: viram → vir.",
   prompt=_GP27)
gd(0, _L27, "fazer → ___", "fizer", "fazer",
   "fazer toma el tronco del perfeito: fizeram → fizer. El patrón regular no sirve para los irregulares.",
   prompt=_GP27)
gd(0, _L27, "estar → ___", "estiver", "estar",
   "estar → estiveram → estiver: quando eu estiver no Rio. «Quando eu estar» es regularización.",
   prompt=_GP27)

sc(0, ["Quando eu falar com ela, te conto.", "Quando eu fizer o bolo, te chamo.", "Quando eu tiver tempo, vou.",
       "Quando eu for ao Rio, te ligo.", "Quando eu puder, ajudo.", "Quando eu souber, aviso."],
   "¿De dónde sale la forma del verbo después de «quando» (futuro)?",
   ["De la 3.ª persona plural del perfeito sin -ram (fizeram → fizer).",
    "Del presente de subjuntivo (faça → faça).",
    "Del infinitivo, siempre igual (fazer → fazer)."],
   "De la 3.ª persona plural del perfeito sin -ram (fizeram → fizer).",
   "Regla: tronco de eles en el perfeito: falaram → falar, fizeram → fizer, tiveram → tiver, foram → for. En los regulares coincide con el infinitivo.")
sc(2, ["Se você quiser, a gente vai.", "Se chover, fico em casa.", "Quando ele chegar, jantamos.",
       "Quando ele chega, sempre janta.", "Se você quer, pode ir agora.", "Quando cheguei, ele saiu."],
   "¿Cuándo va futuro do subjuntivo y cuándo indicativo?",
   ["Futuro do subjuntivo si la condición o el momento están en el futuro; indicativo si es un hábito, algo actual o pasado.",
    "Futuro do subjuntivo siempre después de «se» y «quando».",
    "Futuro do subjuntivo solo con verbos irregulares."],
   "Futuro do subjuntivo si la condición o el momento están en el futuro; indicativo si es un hábito, algo actual o pasado.",
   "Regla: lo que todavía no pasó va en futuro do subjuntivo (quando ele chegar); lo habitual (quando ele chega, janta) o pasado (quando cheguei), en indicativo.")

ty(0, "Escribí el futuro do subjuntivo (eu) de «querer».", "querer → quando eu ___", "quiser",
   "querer → quiseram → quiser: se você quiser, quando eu quiser.")
ty(1, "Escribí el futuro do subjuntivo (eles) de «vir» (venir).", "vir → quando eles ___", "vierem",
   "vir → vieram → vier, vierem. No lo confundas con virem (de ver).")

cb(1, "Vou chegar em casa. Te ligo. (quando)", "Quando eu chegar em casa, te ligo.",
   "Momento futuro con «quando»: futuro do subjuntivo (chegar). La principal queda en presente.",
   alt=["Quando chegar em casa, te ligo.", "Te ligo quando eu chegar em casa.", "Te ligo quando chegar em casa.",
        "Quando eu chegar em casa te ligo.", "Eu te ligo quando chegar em casa.", "Quando eu chegar em casa, eu te ligo."])
cb(1, "O bloco vai passar. A gente vai para a Lapa. (assim que)", "Assim que o bloco passar, a gente vai para a Lapa.",
   "«Assim que» = apenas; con futuro: futuro do subjuntivo (passar).",
   alt=["A gente vai para a Lapa assim que o bloco passar.", "Assim que o bloco passar a gente vai para a Lapa.",
        "Assim que o bloco passar, a gente vai pra Lapa.", "A gente vai pra Lapa assim que o bloco passar."])
cb(2, "Talvez você queira. A gente vai ao Pão de Açúcar amanhã. (se)", "Se você quiser, a gente vai ao Pão de Açúcar amanhã.",
   "Condición futura: se + futuro do subjuntivo (quiser).",
   alt=["A gente vai ao Pão de Açúcar amanhã, se você quiser.", "Se você quiser, amanhã a gente vai ao Pão de Açúcar.",
        "Se quiser, a gente vai ao Pão de Açúcar amanhã.", "Se você quiser a gente vai ao Pão de Açúcar amanhã."])
