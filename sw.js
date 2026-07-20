const CACHE_NAME = "westshore-risk-v6";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_FILES);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, {
        cache: "no-store"
      }).catch(() => {
        return caches.match("./index.html");
      })
    );

    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const networkResponse = fetch(event.request, {
        cache: "no-store"
      }).then(response => {
        if (
          response &&
          response.status === 200
        ) {
          const responseCopy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseCopy);
          });
        }

        return response;
      });

      return cachedResponse || networkResponse;
    })
  );
});
