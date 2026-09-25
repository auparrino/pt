/*
 * Voci vere: grabaciones de hablantes reales de Lingua Libre (Wikimedia
 * Commons, CC BY-SA 4.0) para las palabras de los pares mínimos de Suoni.
 *
 * El HVPT funciona por la variedad de hablantes reales (Uchihara, Karas &
 * Thomson 2025): la voz del teléfono simula esa variedad con velocidad y
 * tono, pero es una sola voz.  La app busca en Commons, desde el teléfono y
 * la primera vez, las grabaciones «LL-Q652 (ita)-<hablante>-<palabra>.wav»;
 * guarda qué encontró (localStorage) y el service worker guarda el audio,
 * así la segunda vez anda sin conexión.  Si no hay grabación, sin conexión
 * la primera vez o si falla, suena la voz del teléfono como siempre.
 */
(function (root) {
  "use strict";

  var KEY = "laviac1.voci.v1";
  var API = "https://commons.wikimedia.org/w/api.php";
  var MISS_TTL = 30 * 86400000;          // a word with no recording is asked again after a month
  var LICENSE = "Lingua Libre · CC BY-SA 4.0";

  function load() { try { return JSON.parse(root.localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function save(db) { try { root.localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* lleno o bloqueado */ } }
  var db = null;
  function store() { return db || (db = load()); }

  // Only plain words: a written accent marks an open/closed vowel or the
  // stress (pèsca / pésca, àncora / ancóra), which the file name cannot tell.
  function usable(word) { return /^[a-z]+$/.test(String(word || "")); }

  // File:LL-Q652 (ita)-Hablante-palabra.wav → { user, word }
  function parseTitle(title) {
    var m = /^File:LL-Q652 \(ita\)-(.+)-([^-]+)\.(wav|ogg|flac|mp3)$/i.exec(String(title || ""));
    return m ? { user: m[1], word: m[2].toLowerCase() } : null;
  }
  function searchUrl(word) {
    return API + "?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=20" +
      "&gsrsearch=" + encodeURIComponent('intitle:"LL-Q652 (ita)" intitle:"' + word + '"') +
      "&prop=imageinfo&iiprop=url";
  }
  // The recordings of exactly this word (not «nonna» for «nonno»), up to four speakers.
  function fromApi(word, json) {
    var pages = (json && json.query && json.query.pages) || {}, out = [], users = {};
    Object.keys(pages).forEach(function (k) {
      var p = pages[k], t = parseTitle(p.title), info = p.imageinfo && p.imageinfo[0];
      if (!t || t.word !== word || !info || !info.url || users[t.user]) return;
      users[t.user] = 1;
      out.push({ url: info.url, user: t.user });
    });
    return out.slice(0, 4);
  }

  var pending = {};
  // cb(list): [] when there is none (or no network, the first time).
  function lookup(word, cb) {
    word = String(word || "").toLowerCase();
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
      .catch(function () { clearTimeout(timer); done([], false); });     // offline: ask again next time
  }
  // Warm the cache for the words of a session (the first tap then plays at once).
  function prefetch(words) { (words || []).forEach(function (w) { lookup(w, function () {}); }); }

  var last = 0, current = null;
  /* Plays a real recording of the word, a different speaker each time.
     opts.rate: playback speed; opts.onplay(credit): what to credit;
     fallback(): the phone's voice, when there is nothing to play. */
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
  // Everyone whose voice the app has used: for the credits in Io.
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
              _reset: function () { db = {}; } };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Voci = api;
})(typeof window !== "undefined" ? window : globalThis);
