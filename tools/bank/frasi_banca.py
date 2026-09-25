# -*- coding: utf-8 -*-
"""Banco de oraciones español (rioplatense) → portugués de Brasil para los
ejercicios de traducción y de «verbo en contexto», con corrección automática.

Cada entrada: dict(es, it[list], lvl, w, tags[list], gap=(forma, lema) | None,
note).  La clave «it» (las traducciones aceptadas) conserva el nombre del
esquema italiano porque la leen app.js, banca.js y scrivi.js.

- `w`: semana mínima según la gramática que usa la traducción principal
  (tools/curriculo.py, TENSE_WEEK y WEEKS): nada antes de su teoría.  El
  contenido cultural (historia, literatura, sociología, filosofía y política
  de Brasil y Portugal) va desde la semana 27 y pesa más en la 40-52.
- `lvl`: sale de la semana (A1 1-8, A2 9-16, B1 17-27, B2 28-40, C1 41-52).
- `it`: la primera es la respuesta modelo; las demás, variantes aceptadas
  (con y sin pronombre sujeto, nós / a gente, vou + infinitivo / futuro,
  você / tu, contracción coloquial…).  Para escribirlas sin repetir, cada
  cadena admite alternativas entre llaves: «{Eu |}moro» = «Eu moro» y
  «moro».  La primera opción de cada llave arma la respuesta modelo.
- `gap`: (forma, lema) para el ejercicio de completar; la forma aparece tal
  cual en la respuesta modelo.

Las citas son reales y verificables; cuando una frase famosa es apócrifa, la
nota lo dice.
"""
import itertools as _it
import re as _re

_BRACE = _re.compile(r"\{([^{}]*)\}")
_MAX = 48


def _x(pattern):
    """Expande «{a|b}» en todas las combinaciones (primero, la modelo)."""
    parts = _BRACE.split(pattern)
    fixed, opts = parts[0::2], [p.split("|") for p in parts[1::2]]
    out = []
    for combo in _it.product(*opts):
        s = fixed[0]
        for o, f in zip(combo, fixed[1:]):
            s += o + f
        s = _re.sub(r"\s+", " ", s).strip()
        s = s[:1].upper() + s[1:]
        if s not in out:
            out.append(s)
        if len(out) >= _MAX:
            break
    return out


def _lvl(w):
    return "A1" if w <= 8 else "A2" if w <= 16 else "B1" if w <= 27 else "B2" if w <= 40 else "C1"


def _mk(rows):
    out = []
    for w, es, pt, tags, gap, note in rows:
        pats = [pt] if isinstance(pt, str) else list(pt)
        its = []
        for p in pats:
            for s in _x(p):
                if s.lower() not in [t.lower() for t in its]:
                    its.append(s)
        d = dict(es=es, it=its, lvl=_lvl(w), w=w, tags=tags.split(), note=note)
        if gap:
            d["gap"] = tuple(gap)
        out.append(d)
    return out


_ROWS = [
    # ================================================================ A1
    # --- semana 1: saludos, ser, estar, ter
    (1, "Hola, me llamo Martín.", ["{Oi|Olá}, {eu |}me chamo Martín.", "{Oi|Olá}, meu nome é Martín.", "{Oi|Olá}, chamo-me Martín."],
     "ser_estar lexico", None,
     "Me llamo = (eu) me chamo o meu nome é. Hola = oi (informal) u olá."),
    (1, "Soy argentino, de Buenos Aires.", "{Eu |}sou argentino, de Buenos Aires.",
     "ser_estar", ("sou", "ser"),
     "Soy = sou. El origen va con ser de: sou de Buenos Aires."),
    (1, "¿Vos sos brasileña?", ["Você é brasileira?", "Tu és brasileira?", "Tu é brasileira?"],
     "ser_estar", ("é", "ser"),
     "Vos = você, con el verbo en 3.ª persona: você é. Tu és existe, pero en Río se oye más você."),
    (3, "Ella es de Río; es carioca.", "Ela é do Rio{| de Janeiro}, {|ela }é carioca.",
     "ser_estar contracciones", ("é", "ser"),
     "Carioca = de la ciudad de Río (fluminense = del estado). Do Rio: el Rio lleva artículo."),
    (1, "Estoy bien, gracias.", "{Eu |}estou bem, {obrigado|obrigada}.",
     "ser_estar", ("estou", "estar"),
     "Gracias = obrigado si lo dice un hombre, obrigada si lo dice una mujer."),
    (1, "¿Cómo estás?", ["Como você está?", "Como vai?", "Como vai você?", "Tudo bem?", "Como tu estás?"],
     "ser_estar", ("está", "estar"),
     "¿Cómo estás? = como você está? o, más natural, tudo bem? / como vai?"),
    (1, "Tengo veinte años.", "{Eu |}tenho vinte anos.",
     "ter", ("tenho", "ter"),
     "La edad va con ter: tenho vinte anos. Año = ano (sin ñ)."),
    (1, "Tenemos un perro y un gato.", "{Nós temos|Temos|A gente tem} um {cachorro|cão} e um gato.",
     "ter lexico", ("temos", "ter"),
     "Perro = cachorro (o cão). A gente tem = nosotros tenemos, con verbo en singular."),
    (3, "Ellos están en la playa.", "Eles estão na praia.",
     "ser_estar contracciones", ("estão", "estar"),
     "em + a = na: na praia. Estão lleva tilde nasal."),
    (3, "Mi madre es profesora.", "{A |}minha mãe é professora.",
     "ser_estar posesivos", ("é", "ser"),
     "Ante posesivo el artículo es optativo en Brasil: minha mãe o a minha mãe."),
    (1, "Somos amigos.", "{Nós somos|Somos|A gente é} amigos.",
     "ser_estar", ("somos", "ser"),
     "Somos = somos; con a gente, el verbo va en singular: a gente é amigo(s)."),
    (3, "¿Dónde está el baño?", ["Onde {está|fica|é} o banheiro?"],
     "ser_estar lexico", ("está", "estar"),
     "El baño = o banheiro. Para ubicar se usa mucho ficar: onde fica o banheiro?"),
    (1, "Buen día, señora.", "Bom dia, {senhora|dona}.",
     "lexico", None,
     "Buen día = bom dia (en singular). Señora = senhora; ante nombre de pila, dona: dona Maria."),
    (1, "¡Chau, hasta mañana!", "Tchau, até amanhã!",
     "lexico", None,
     "Chau = tchau; hasta = até; mañana = amanhã."),
    (1, "Muchas gracias.", "Muito {obrigado|obrigada}.",
     "muito lexico", None,
     "Muchas gracias = muito obrigado / obrigada (no «muitas»)."),
    (1, "Estamos muy contentos.", "{Nós estamos|Estamos|A gente está} muito {contentes|felizes}.",
     "ser_estar muito", ("estamos", "estar"),
     "Muy = muito; contento = contente o feliz."),
    (1, "¿Tenés hermanos?", ["Você tem irmãos?", "Tu tens irmãos?", "Tu tem irmãos?"],
     "ter", ("tem", "ter"),
     "Vos tenés = você tem. Hermanos = irmãos."),

    # --- semana 2: sustantivos, género y número
    (3, "Hay un libro en la mesa.", ["{Tem|Há} um livro {na|em cima da} mesa."],
     "ter articulos contracciones", ("Tem", "ter"),
     "Hay = tem (habla) o há (escrito)."),
    (4, "La leche está fría.", "O leite está {frio|gelado}.",
     "genero concordancia", ("está", "estar"),
     "Leite es masculino: o leite está frio."),
    (2, "Tengo dolor de cabeza.", ["{Eu |}{estou com|tenho} dor de cabeça."],
     "genero ter", None,
     "Dor es femenino (a dor). Me duele la cabeza = estou com dor de cabeça."),
    (2, "Tengo dos hermanos y una hermana.", "{Eu |}tenho dois irmãos e uma irmã.",
     "plurales genero", ("tenho", "ter"),
     "Irmão → irmãos; irmã, con tilde nasal."),
    (4, "El viaje es largo.", "A viagem é {longa|comprida}.",
     "genero falsos_amigos", ("é", "ser"),
     "Viagem es femenino. Largo = longo, comprido («largo» en portugués es ancho)."),
    (2, "La ciudad tiene muchos árboles.", "A cidade tem muitas árvores.",
     "genero muito", ("tem", "ter"),
     "Árvore es femenino: muitas árvores. Ciudad = cidade."),
    (4, "Mis manos están frías.", "{As |}minhas mãos estão {frias|geladas}.",
     "plurales concordancia", ("estão", "estar"),
     "Mão → mãos (no «mões»)."),
    (3, "Hay tres limones en la heladera.", "{Tem|Há} três limões na geladeira.",
     "plurales lexico", None,
     "Limão → limões. Heladera = geladeira."),
    (3, "El mensaje es de Bia.", "A mensagem é da Bia.",
     "genero contracciones", ("é", "ser"),
     "Las palabras en -agem son femeninas: a mensagem, a viagem."),
    (3, "La sal está en la mesa.", "O sal está na mesa.",
     "genero contracciones", ("está", "estar"),
     "Sal es masculino en portugués: o sal."),
    (4, "El puente es muy lindo.", "A ponte é muito {bonita|linda}.",
     "genero concordancia", ("é", "ser"),
     "Ponte es femenino: a ponte é bonita."),
    (2, "Tengo una pregunta.", "{Eu |}tenho uma pergunta.",
     "ter lexico", None,
     "Pregunta = pergunta."),
    (3, "Los hombres están en el bar.", "Os homens estão no bar.",
     "plurales contracciones", ("estão", "estar"),
     "Homem → homens (-m → -ns)."),
    (4, "Los hoteles de Copacabana son caros.", "Os hotéis de Copacabana são caros.",
     "plurales", ("são", "ser"),
     "Hotel → hotéis (-el → -éis)."),
    (2, "La computadora es nueva.", "O computador é novo.",
     "genero", ("é", "ser"),
     "Computador es masculino: o computador é novo."),

    # --- semana 3: artículos y contracciones
    (3, "Estoy en la playa de Copacabana.", "{Eu |}estou na praia de Copacabana.",
     "contracciones", ("estou", "estar"),
     "em + a = na: na praia."),
    (3, "El libro de João está en la mochila.", "O livro do João está na mochila.",
     "contracciones articulos", ("está", "estar"),
     "de + o = do; em + a = na. Ante nombre de persona el artículo es común en Río: o João."),
    (3, "La casa de Ana está en el centro.", "A casa da Ana {está|fica|é} no centro.",
     "contracciones", ("está", "estar"),
     "de + a = da; em + o = no."),
    (3, "Estamos en el bar de la esquina.", "{Nós estamos|Estamos|A gente está} no bar da esquina.",
     "contracciones", ("estamos", "estar"),
     "em + o = no; de + a = da."),
    (3, "Mi celular está en la cartera.", "{O |}meu celular está na bolsa.",
     "contracciones falsos_amigos", ("está", "estar"),
     "La cartera (de mujer) = a bolsa. La carteira es la billetera."),
    (3, "La capital de Brasil es Brasilia.", "A capital do Brasil é Brasília.",
     "contracciones articulos", ("é", "ser"),
     "O Brasil lleva artículo: do Brasil."),
    (3, "El Cristo está en el Corcovado.", "O Cristo{| Redentor} está no Corcovado.",
     "contracciones", ("está", "estar"),
     "em + o = no: no Corcovado."),
    (3, "Las llaves están en la puerta.", "As chaves estão na porta.",
     "contracciones lexico", ("estão", "estar"),
     "Llave = chave; puerta = porta."),
    (3, "Los chicos están en los cuartos.", "{Os meninos|As crianças} estão nos quartos.",
     "contracciones", ("estão", "estar"),
     "em + os = nos. Los chicos (niños) = as crianças, os meninos."),
    (3, "El Pan de Azúcar está en Urca.", "O Pão de Açúcar {está|fica} na Urca.",
     "contracciones", ("está", "estar"),
     "A Urca, el barrio, lleva artículo: na Urca."),
    (3, "Estoy en casa.", "{Eu |}estou em casa.",
     "articulos", ("estou", "estar"),
     "El propio hogar va sin artículo: em casa."),
    (3, "¿Estás en el trabajo?", ["Você está no trabalho?", "Tu estás no trabalho?", "Tá no trabalho?"],
     "contracciones", ("está", "estar"),
     "em + o = no trabalho."),
    (3, "El vaso está en la mesa.", "O copo está {na|em cima da|sobre a} mesa.",
     "falsos_amigos contracciones", ("está", "estar"),
     "El vaso = o copo. El vaso portugués es una maceta."),
    (3, "Los turistas están en el hotel.", "Os turistas estão no hotel.",
     "contracciones", ("estão", "estar"),
     "em + o = no."),
    (3, "El perro de los vecinos está en la calle.", "O cachorro dos vizinhos está na rua.",
     "contracciones lexico", ("está", "estar"),
     "de + os = dos; calle = rua; vecino = vizinho."),
    (3, "La Lagoa está cerca de Ipanema.", "A Lagoa {está|fica} perto de Ipanema.",
     "preposiciones", ("está", "estar"),
     "Cerca de = perto de."),

    # --- semana 4: adjetivos, colores, nacionalidades, muito
    (4, "Ella es muy simpática.", "Ela é muito simpática.",
     "muito concordancia", ("é", "ser"),
     "Muy = muito: muito simpática."),
    (4, "Somos argentinos, pero ella es portuguesa.", "{Nós somos|Somos|A gente é} argentinos, mas ela é portuguesa.",
     "concordancia ser_estar", ("somos", "ser"),
     "Pero = mas. Português → portuguesa."),
    (4, "El mar está muy azul hoy.", ["O mar está muito azul hoje.", "Hoje o mar está muito azul."],
     "muito", ("está", "estar"),
     "Hoy = hoje; muy = muito."),
    (4, "Las remeras son blancas.", "As camisetas são brancas.",
     "concordancia lexico", ("são", "ser"),
     "Remera = camiseta; blanco = branco."),
    (4, "El departamento es chico pero lindo.", "O apartamento é pequeno, mas {é |}{bonito|lindo}.",
     "concordancia lexico", ("é", "ser"),
     "Departamento = apartamento; chico = pequeno."),
    (4, "Mi abuela es alemana.", "{A |}minha avó é alemã.",
     "concordancia", ("é", "ser"),
     "Alemão → alemã. Avó (abuela) con o abierta."),
    (4, "Los ejercicios son fáciles.", "Os exercícios são fáceis.",
     "plurales", ("são", "ser"),
     "Fácil → fáceis."),
    (4, "Ella tiene ojos azules.", "Ela tem olhos azuis.",
     "plurales ter", ("tem", "ter"),
     "Azul → azuis; ojo = olho."),
    (4, "El hotel es caro, pero es muy cómodo.", "O hotel é caro, mas é muito confortável.",
     "muito lexico", ("é", "ser"),
     "Cómodo = confortável; muy = muito."),
    (4, "La playa está llena.", "A praia está {cheia|lotada}.",
     "concordancia", ("está", "estar"),
     "Lleno = cheio (llena = cheia)."),
    (4, "Ellos son muy altos.", "Eles são muito altos.",
     "muito concordancia", ("são", "ser"),
     "Son = são."),
    (4, "Estoy muy cansada.", "{Eu |}estou muito cansada.",
     "muito ser_estar", ("estou", "estar"),
     "Estoy = estou."),
    (4, "Río es una ciudad muy linda.", "O Rio é uma cidade muito {linda|bonita}.",
     "muito articulos", ("é", "ser"),
     "O Rio lleva artículo."),
    (4, "Tengo mucho trabajo.", "{Eu |}tenho muito trabalho.",
     "muito ter", ("tenho", "ter"),
     "Mucho = muito; trabajo = trabalho."),
    (4, "Hay mucha gente en la feria.", "{Tem|Há} muita gente na feira.",
     "muito", None,
     "Mucha gente = muita gente (femenino singular)."),
    (4, "El agua está fría.", "A água está {fria|gelada}.",
     "concordancia", ("está", "estar"),
     "Água es femenino: fria."),
    (4, "Los pasteles de la feria son buenísimos.", ["Os pastéis da feira são {ótimos|muito bons|deliciosos}."],
     "plurales falsos_amigos", ("são", "ser"),
     "Pastel → pastéis: la empanada frita de la feira."),
    (4, "La remera roja es de Rafa.", "A camiseta vermelha é do Rafa.",
     "concordancia lexico", ("é", "ser"),
     "Rojo = vermelho (roxo es morado)."),
    (4, "Mis amigos son uruguayos.", "{Os |}meus amigos são uruguaios.",
     "concordancia", ("são", "ser"),
     "Uruguayo = uruguaio."),
]
