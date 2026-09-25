/*
 * Vozes reais: grabaciones de hablantes reales de Lingua Libre (Wikimedia
 * Commons, CC BY-SA 4.0) para las palabras de los pares mínimos de Sons.
 *
 * El HVPT funciona por la variedad de hablantes reales (Uchihara, Karas &
 * Thomson 2025): la voz del teléfono simula esa variedad con velocidad y
 * tono, pero es una sola voz.  La app busca en Commons, desde el teléfono y
 * la primera vez, las grabaciones «LL-Q5146 (por)-<hablante>-<palabra>.wav»
 * (Q5146 es el portugués en Wikidata); guarda qué encontró (localStorage) y
 * el service worker guarda el audio, así la segunda vez anda sin conexión.
 * Si no hay grabación, sin conexión la primera vez o si falla, suena la voz
 * del teléfono como siempre.
 *
 * Brasil o Portugal: Lingua Libre graba todo el portugués bajo el mismo
 * código (Q5146) y el nombre del archivo no dice de dónde es el hablante;
 * ese dato vive en el perfil del hablante, que la búsqueda de Commons no
 * devuelve.  Por eso: (1) BR_SPEAKERS lista a los hablantes que sabemos de
 * Brasil y van primero; (2) PT_SPEAKERS, a los de Portugal o África, que
 * quedan al final (se oyen solo si no hay nadie más).  Las dos listas se
 * completan a mano revisando los perfiles en lingualibre.org; mientras
 * tanto, una palabra puede sonar con acento europeo, lo que para el oído
 * también es variedad, pero no es el modelo del curso.
 *
 * Los pares de Sons se escriben siempre distinto (avó / avô, pôde / pode),
 * así que el nombre del archivo alcanza para saber qué palabra se oye, con
 * tilde y todo.
 */
(function (root) {
  "use strict";

  var KEY = "rumoc1.voci.v1";
  var API = "https://commons.wikimedia.org/w/api.php";
  var MISS_TTL = 30 * 86400000;          // a word with no recording is asked again after a month
  var LICENSE = "Lingua Libre · CC BY-SA 4.0";
  // Hablantes de Lingua Libre por variedad (nombres de usuario tal como
  // aparecen en el archivo).  Ederporto es del equipo de Wiki Movimento
  // Brasil (a confirmar en su perfil).
  var BR_SPEAKERS = ["Ederporto"];
  var PT_SPEAKERS = [];
  function rank(user) {
    return BR_SPEAKERS.indexOf(user) >= 0 ? 0 : PT_SPEAKERS.indexOf(user) >= 0 ? 2 : 1;
  }
  function nfc(s) { s = String(s || "").toLowerCase(); return s.normalize ? s.normalize("NFC") : s; }

  function load() { try { return JSON.parse(root.localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function save(db) { try { root.localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* lleno o bloqueado */ } }
  var db = null;
  function store() { return db || (db = load()); }

  // Una palabra suelta, con las letras del portugués (tildes y ç incluidas):
  // en portugués la tilde es ortografía y está en el nombre del archivo.
  // Nada de frases, guiones ni apóstrofos.
  function usable(word) { return /^[a-zàáâãçéêíóôõúü]+$/.test(nfc(word)); }

  // File:LL-Q5146 (por)-Hablante-palabra.wav → { user, word }
  function parseTitle(title) {
    var m = /^File:LL-Q5146 \(por\)-(.+)-([^-]+)\.(wav|ogg|flac|mp3)$/i.exec(String(title || ""));
    return m ? { user: m[1], word: nfc(m[2]) } : null;
  }
  function searchUrl(word) {
    return API + "?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=20" +
      "&gsrsearch=" + encodeURIComponent('intitle:"LL-Q5146 (por)" intitle:"' + word + '"') +
      "&prop=imageinfo&iiprop=url";
  }
  // Las grabaciones de exactamente esta palabra (no «avó» por «avô», que la
  // búsqueda de Commons confunde al ignorar tildes), hasta cuatro hablantes,
  // los de Brasil primero.
  function fromApi(word, json) {
    word = nfc(word);
    var pages = (json && json.query && json.query.pages) || {}, out = [], users = {};
    Object.keys(pages).forEach(function (k) {
      var p = pages[k], t = parseTitle(p.title), info = p.imageinfo && p.imageinfo[0];
      if (!t || t.word !== word || !info || !info.url || users[t.user]) return;
      users[t.user] = 1;
      out.push({ url: info.url, user: t.user });
    });
    out.sort(function (a, b) { return rank(a.user) - rank(b.user); });
    return out.slice(0, 4);
  }

  var pending = {};
  // cb(list): [] cuando no hay ninguna (o no hay red, la primera vez).
  function lookup(word, cb) {
    word = nfc(word);
    if (!usable(word) || typeof fetch !== "function") return cb([]);
    var hit = store()[word];
    if (hit && (hit.list.length || Date.now() - hit.at < MISS_TTL)) return cb(hit.list);
    if (pending[word]) { pending[word].push(cb); return; }
    pending[word] = [cb];
    var done = function (list, keep) {
      if (keep) { store()[word] = { at: Date.now(), list: list }; save(store()); }
      var cbs = pending[word]; delete pending[word];
      cbs.forEach(function (f) { f(list); });
    };
    var ctl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 6000);
    fetch(searchUrl(word), { signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { clearTimeout(timer); done(j ? fromApi(word, j) : [], !!j); })
      .catch(function () { clearTimeout(timer); done([], false); });     // sin conexión: se vuelve a preguntar la próxima vez
  }
  // Calienta la caché con las palabras de una sesión (así el primer toque suena enseguida).
  function prefetch(words) { (words || []).forEach(function (w) { lookup(w, function () {}); }); }

  var last = 0, current = null;
  /* Reproduce una grabación real de la palabra, con un hablante distinto
     cada vez.  opts.rate: velocidad; opts.onplay(crédito): a quién citar;
     fallback(): la voz del teléfono, cuando no hay nada que reproducir. */
  function play(word, opts, fallback) {
    opts = opts || {};
    lookup(word, function (list) {
      if (!list.length || typeof root.Audio !== "function") return fallback && fallback();
      var rec = list[(last++) % list.length];
      try {
        if (current) current.pause();
        var a = new root.Audio(rec.url);
        current = a;
        if (opts.rate) a.playbackRate = opts.rate;
        a.onerror = function () { if (fallback) fallback(); };
        var p = a.play();
        if (p && p.catch) p.catch(function () { if (fallback) fallback(); });
        if (opts.onplay) opts.onplay(rec.user + " · " + LICENSE);
      } catch (e) { if (fallback) fallback(); }
    });
  }
  // Todos aquellos cuya voz usó la app: para los créditos en el perfil.
  function credits() {
    var users = {};
    var s = store();
    Object.keys(s).forEach(function (w) { (s[w].list || []).forEach(function (r) { (users[r.user] = users[r.user] || []).push(w); }); });
    return users;
  }
  function count() {
    var s = store(), n = 0;
    Object.keys(s).forEach(function (w) { if ((s[w].list || []).length) n++; });
    return n;
  }

  var api = { lookup: lookup, prefetch: prefetch, play: play, usable: usable, parseTitle: parseTitle,
              fromApi: fromApi, searchUrl: searchUrl, credits: credits, count: count, LICENSE: LICENSE,
              BR_SPEAKERS: BR_SPEAKERS, PT_SPEAKERS: PT_SPEAKERS,
              _reset: function () { db = {}; } };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Voci = api;
})(typeof window !== "undefined" ? window : globalThis);
