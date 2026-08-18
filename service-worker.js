/* ==========================================================================
   MUNDO FIT DA MANU — service-worker.js
   Cache simples do "app shell" para funcionar offline.
   Aumente CACHE_VERSION sempre que publicar mudanças relevantes.
   ========================================================================== */

var CACHE_VERSION = "mundofit-v3";

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

// Responde uma Response 206 (Partial Content) a partir de uma Response
// completa em cache. Necessário porque o elemento <video> (principalmente
// no Safari/iOS) faz requisições com cabeçalho "Range" mesmo para vídeos
// de mesma origem — devolver sempre a resposta inteira faz o vídeo falhar
// silenciosamente em vez de tocar.
function rangedResponse(cachedResponse, rangeHeader) {
  return cachedResponse.arrayBuffer().then(function (buffer) {
    var total = buffer.byteLength;
    var match = /bytes=(\d*)-(\d*)/.exec(rangeHeader) || [];
    var start = match[1] ? parseInt(match[1], 10) : 0;
    var end = match[2] ? parseInt(match[2], 10) : total - 1;
    if (isNaN(start)) start = 0;
    if (isNaN(end) || end >= total) end = total - 1;

    var slice = buffer.slice(start, end + 1);
    var headers = new Headers(cachedResponse.headers);
    headers.set("Content-Range", "bytes " + start + "-" + end + "/" + total);
    headers.set("Content-Length", String(slice.byteLength));
    headers.set("Accept-Ranges", "bytes");

    return new Response(slice, {
      status: 206,
      statusText: "Partial Content",
      headers: headers
    });
  });
}

// Estratégia: "network falling back to cache" para HTML,
// "cache first" para os demais arquivos estáticos do app shell
// (incluindo os vídeos de demonstração dos exercícios).
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

  var rangeHeader = request.headers.get("range");

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) {
        return rangeHeader ? rangedResponse(cached, rangeHeader) : cached;
      }
      return fetch(request).then(function (response) {
        // Só armazena respostas válidas e do mesmo domínio
        // (ex.: vídeos de demonstração dos exercícios)
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      }).catch(function () {
        // Sem rede e sem cache: deixa o navegador tratar
        // (ex.: mostra placeholder do vídeo)
        return cached;
      });
    })
  );
});