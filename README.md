# Rumo C1 — portugués de Brasil hasta C1 en un año

Curso-juego para **hispanohablantes rioplatenses**: de cero a C1 (Celpe-Bras
Avançado Superior) en 52 semanas, desde el celular y sin internet. Es la
versión portuguesa de *La Via C1* (italiano, repo hermano `auparrino/It`):
el mismo motor y la misma didáctica, con el contenido escrito de nuevo para el
portugués y **estética carioca** (las ondas del calçadão de Copacabana, el mar
de Ipanema, el atardecer del Arpoador, el Pão de Açúcar en el ícono).

Variedad: **portugués de Brasil**, norma urbana culta, con lo coloquial (*a
gente, pra, tá, vi ele, me dá*) enseñado como tal. Portugal y la lusofonía
aparecen como variantes y, sobre todo, como cultura.

## En el celular

Es una app web instalable (PWA): se publica una vez, queda en la pantalla de
inicio, funciona sin conexión y guarda el progreso solo en el teléfono.

1. Publicá `docs/` con GitHub Pages (*Settings → Pages → Deploy from a branch*,
   carpeta `/docs`).
2. Abrí la URL una vez con internet. **iPhone**: *Compartir → Agregar a inicio*.
   **Android**: *Instalar app*.

Si se publica en el mismo dominio que La Via C1 (`usuario.github.io/It` y
`/pt`), no se pisan: todas las claves de guardado llevan el prefijo `rumoc1.` y
el service worker solo toca sus propias cachés.

## Cómo está armado el año

| Estación | Semanas | Nivel | Contenido |
|---|---|---|---|
| Primeiros Passos | 1–13 | A1 → A2 | Sonidos (vocales abiertas, nasales, lh/nh), ser/estar/ter, género y plurales (-ões, -ães, -ãos), **contracciones**, presente, ir + infinitivo, estar + gerúndio, posesivos (*seu / dele*), **pretérito perfeito**, imperativo |
| Pé na Estrada | 14–26 | A2 → B1 | **gostar de** y la regencia, imperfeito, pronombres objeto (norma y habla), futuro, condicional y cortesía, comparativos, **perfeito composto** (≠ «he hecho»), participios dobles y pasiva, **subjuntivo presente**, relativos |
| Mar Aberto | 27–39 | B1 → B2 | **Futuro do subjuntivo**, imperfeito do subjuntivo y condicionales, **infinitivo pessoal**, tiempos compuestos, discurso indirecto, pasiva con *se*, colocação pronominal, conectores, regencia, **crase**, portugués hablado |
| O Cume | 40–52 | B2 → C1 | Registro formal y nominalización, mais-que-perfeito simple y narrativa, oraciones reducidas, correspondencia formal, formación de palabras, falsos amigos, variación (Brasil, Portugal, África), argumentación, resumen, registro culto y coloquial, colocaciones, **Exame C1** |

El temario vive en `tools/curriculo.py` (semanas, función comunicativa, tiempos
y la semana en que se enseña cada uno). El orden sigue los manuales para
hispanohablantes y los **«pontos críticos»** de la bibliografía de Português
para Falantes de Espanhol (Almeida Filho; Grannier; Akerberg; Ferreira; Durão):
lo que el español no tiene (futuro do subjuntivo, infinitivo pessoal, crase,
contracciones) y lo que se parece demasiado (*perfeito composto*, *gostar de*,
*muito*, los heterosemánticos) llegan con semana propia.

**Nada antes de su teoría**: cada ejercicio declara su semana, y
`tools/sillabo.py` (con el léxico de formas del conjugador) avisa si una
respuesta usa un tiempo que todavía no se enseñó.

**Desde B1 la cultura manda**: lecturas, dictogloss, ejemplos, escenas y el
examen tratan historia, filosofía, sociología y literatura de Brasil y de
Portugal: la corte en 1808, la Abolición, Canudos, la Era Vargas, la
dictadura y la Constitución de 1988; Freyre, Sérgio Buarque, Darcy Ribeiro,
Florestan, Lélia Gonzalez, DaMatta, Schwarz, Paulo Freire; Machado, Clarice,
Guimarães Rosa, Carolina Maria de Jesus; Camões, Vieira, 1755 y Pombal, el
25 de Abril, Pessoa, Saramago, Eduardo Lourenço, Mia Couto. Las citas son
reales; las apócrifas se dicen apócrifas.

## Qué trae

| Módulo | Contenido |
|---|---|
| Lecciones (`tools/lessons/`) | 52 lecciones, 340 bloques de teoría en sesiones cortas, con chequeos |
| Ejercicios (`tools/authored/`) | 2.464: elegir, completar, traducir, encontrar el error, *garden path*, *descubrí la regla*, combinar oraciones, escucha, examen |
| Palabras de la semana (`tools/vocab/`) | 648, cada una con significado, ejemplo y **cómo se usa** |
| Conjugador (`docs/js/conjugator.js`) | 419 verbos, 17 tiempos, participios dobles, infinitivo pessoal, imperativo, reflexivos; 8.187 controles |
| Frases (`docs/js/frasi.js`) | 26 escenas, 455 frases de conversación, todas con su nota de construcción |
| Laboratorio (`docs/js/lab.js`) | *Ponte* (16 reglas español → portugués, 196 cognados), 103 falsos amigos, *Entender* (input estructurado) |
| Duelos (`docs/js/duelli.js`) | ser/estar, por/para, seu/dele, perfeito/imperfeito, simple/composto, indicativo/subjuntivo, futuro do subjuntivo/infinitivo pessoal, a/à |
| Lecturas | *A semana* (52 textos), *Martín no Rio* (10 episodios), *Cultura* (23), *Enchentes* (12, input flood) |
| Sons (`docs/js/ascolto_data.js`) | 181 pares mínimos, habla conectada, entonación, acento tónico; 47 dictogloss |
| Diagnóstico (`docs/js/diagnosi.js`) | ~33 categorías de error del hispanohablante, pista primero y explicación después |
| Escreva (`docs/js/scrivi.js`) | 48 tareas de escritura libre con su corrector |
| Banco (`tools/bank/`) | 1.836 sustantivos, 674 verbos, 448 adjetivos, 463 palabras, 700 oraciones, 524 errores típicos, 1.095 interferencias del español, 148 falsos amigos |
| Frecuencia (`docs/data/frequenza.json`) | 16.232 lemas de OpenSubtitles 2018 pt-BR (hermitdave/FrequencyWords, CC BY-SA 4.0); niveles por banda de frecuencia |
| Exame C1 (`docs/js/esame_data.js`) | Compreensão oral, Leitura, Estruturas, Léxico, Produção escrita con la rúbrica del Celpe-Bras |

La investigación detrás de cada ejercicio (recuperación, espaciado con FSRS,
pretest, intercalado, input estructurado, feedback correctivo…) es la misma
que la de La Via C1; está explicada en su README.

## Desarrollo

```sh
npm run build      # tools/build_bank.py + tools/build_course.py → docs/data/
npm test           # conjugador, juego, frases, diagnóstico, escritura, memoria, sonidos
npm start          # http://localhost:8000
NODE_PATH=$(npm root -g) node tools/smoke_browser.js   # recorrida en Chromium
```

Cómo se escribe el contenido: `tools/CONTENIDO.md`. La frecuencia se regenera
con `python3 tools/build_frequenza.py` (necesita red y, para lematizar bien,
`pip install spylls`).

Material de apoyo que se usó: *Noções básicas de gramática portuguesa (PLE)*
(José Carlos Silva), *Gramática portuguesa* (Espasa), *Vamos nessa? Vamos!*
(Ministerio de Educación de Corrientes), la guía de Philipe Brazuca y el
Documento-base del Celpe-Bras (INEP).
