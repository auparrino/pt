/*
 * Voces reales de Common Voice (Mozilla, CC0): oraciones leídas por
 * hablantes distintos, para el dictado de Sons y «¿Qué forma escuchaste?».
 *
 * Todavía NO hay grabaciones de Common Voice en portugués incluidas: ALL
 * está vacío y el resto del código funciona igual (el dictado usa el TTS
 * pt-BR con oraciones de la banca y de las frases, y «¿Qué forma
 * escuchaste?» no aparece).  Para sumarlas: elegir oraciones de Common
 * Voice Portuguese (conviene filtrar por acento brasileño, que el corpus
 * declara en `accents`), revisarlas a mano, copiar los mp3 a
 * docs/audio/cv/common_voice_pt_<f>.mp3 y agregarlas acá.
 *
 * Esquema de cada entrada: f, el número del archivo; w, desde qué semana se
 * puede dictar; pt, la oración; a / b (opcional): la forma que se oye y la
 * que compite, que se abre en la semana fw; why: qué la decide.
 */
(function (root) {
  "use strict";
  var ALL = [];
  function url(x) { return "audio/cv/common_voice_pt_" + x.f + ".mp3"; }
  var api = { ALL: ALL, url: url, LICENSE: "Common Voice · CC0" };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.VociCV = api;
})(typeof window !== "undefined" ? window : globalThis);
