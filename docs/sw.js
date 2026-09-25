/*
 * Service worker de Rumo C1: toda la app queda en el teléfono y anda sin red.
 * Estrategia: responder enseguida desde la caché y actualizar por detrás.
 * Cambiar VERSION en cada versión para tirar la caché vieja (y APP_VERSION en
 * js/app.js, que se ve en Hoje y en Eu: test_game.js y el CI comprueban que
 * «rumoc1-vN» y «vN» coincidan).
 *
 * Las cachés llevan el prefijo «rumoc1-»: la app de italiano (La Via C1)
 * vive en el mismo origen (auparrino.github.io/It y /pt comparten dominio) y
 * sus cachés («laviac1-…») no se tocan nunca.
 */
var VERSION = "rumoc1-v1";
var PREFIX = "rumoc1-";
var FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/app.css",
  "fonts/fraunces-normal.woff2",
  "fonts/fraunces-italic.woff2",
  "fonts/atkinson-400-normal.woff2",
  "fonts/atkinson-400-italic.woff2",
  "fonts/atkinson-700-normal.woff2",
  "fonts/atkinson-700-italic.woff2",
  "fonts/atkinson-800-normal.woff2",
  "js/conjugator.js",
  "js/engine.js",
  "js/frasi.js",
  "js/lab.js",
  "js/letture_settimana.js",
  "js/letture.js",
  "js/lezione.js",
  "js/diagnosi.js",
  "js/scrivi.js",
  "js/banca.js",
  "js/frequenza.js",
  "js/ascolto_data.js",
  "js/dictogloss_data.js",
  "js/esame_data.js",
  "js/suoni.js",
  "js/duelli.js",
  "js/voci.js",
  "js/voci_cv_data.js",
  "js/drills.js",
  "js/app.js",
  "data/course.json",
  "data/bank.json",
  "data/glossario.json",
  "data/frequenza.json",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  // cache: "reload" skips the browser's HTTP cache (GitHub Pages keeps files
  // 10 minutes): otherwise a new version could be filled with old files.
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return c.addAll(FILES.map(function (f) { return new Request(f, { cache: "reload" }); }));
  })
    .then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    // only our own old caches: never those of another app on this origin
    return Promise.all(keys.filter(function (k) { return k.indexOf(PREFIX) === 0 && k !== VERSION && k !== VOCI; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Real voices (Lingua Libre, on upload.wikimedia.org): kept in a cache of
// their own that survives new versions, so a word heard once plays offline.
var VOCI = "rumoc1-voci";
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.hostname === "upload.wikimedia.org") {
    e.respondWith(caches.open(VOCI).then(function (cache) {
      return cache.match(e.request).then(function (hit) {
        return hit || fetch(e.request).then(function (res) {
          if (res && (res.ok || res.type === "opaque")) cache.put(e.request, res.clone());
          return res;
        });
      });
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // The sentences of Common Voice (audio/cv/): cached the first time they
  // play, in the same lasting cache, so a session works offline afterwards
  // without downloading 5 MB at install.
  if (/\/audio\/cv\//.test(url.pathname)) {
    e.respondWith(caches.open(VOCI).then(function (cache) {
      return cache.match(url.href).then(function (hit) {
        // the player asks by ranges (206, which cannot be cached): ask for
        // the whole file, a few KB, and answer with it
        return hit || fetch(url.href).then(function (res) {
          if (res && res.status === 200) cache.put(url.href, res.clone()).catch(function () {});
          return res;
        });
      });
    }));
    return;
  }
  e.respondWith(caches.open(VERSION).then(function (cache) {
    return cache.match(e.request, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(e.request).then(function (res) {
        if (res && res.ok) cache.put(e.request, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
