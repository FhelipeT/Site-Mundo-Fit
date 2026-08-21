/* ==========================================================================
   MUNDO FIT DA MANU — service-worker.js
   Cache simples do "app shell" para funcionar offline.
   Aumente CACHE_VERSION sempre que publicar mudanças relevantes.
   ========================================================================== */

var CACHE_VERSION = "mundofit-v2";

var APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./assets/icons/icon.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(APP_SHELL);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_VERSION; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Estratégia: "network falling back to cache" para HTML,
// "cache first" para os demais arquivos estáticos do app shell.
self.addEventListener("fetch", function (event) {
  var request = event.request;

  if (request.method !== "GET") return;

  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  var isHTML = request.headers.get("accept") &&
    request.headers.get("accept").indexOf("text/html") !== -1;

  if (isHTML) {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            return cached || caches.match("./index.html");
          });
        })
    );
    return;
  }
var pathname = new URL(request.url).pathname;

if (pathname.toLowerCase().endsWith(".mp4")) {
  return;
}
  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;
      return fetch(request).then(function (response) {
        // Só armazena respostas válidas e do mesmo domínio (ex.: GIFs de exercícios)
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      }).catch(function () {
        // Sem rede e sem cache: deixa o navegador tratar (ex.: mostra placeholder do GIF)
        return cached;
      });
    })
  );
});
