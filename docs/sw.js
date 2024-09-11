// The version of the cache.
const VERSION = "v2";

const GHPATH = '/pwaTestApp';

// The name of the cache
const CACHE_NAME = `period-tracker-${VERSION}`;

// The static resources that the app needs to function.
const APP_STATIC_RESOURCES = [
  `${GHPATH}/`,
  `${GHPATH}/index.html`,
  `${GHPATH}/app.js`,
  `${GHPATH}/style.css`,
  `${GHPATH}/icons/wheel.svg`,
];

// On install, cache the static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      cache.addAll(APP_STATIC_RESOURCES);
    })()
  );
});

// delete old caches on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
      await clients.claim();
    })()
  );
});


//Fix for the user refreshing the page breaking the app issue
self.addEventListener('message', messageEvent => {
  if (messageEvent.data === 'skipWaiting') return skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith((async () => {
      if (event.request.mode === "navigate" &&
      event.request.method === "GET" &&
      registration.waiting &&
      (await clients.matchAll()).length < 2
      ) {
          registration.waiting.postMessage('skipWaiting');
          return new Response("", {headers: {"Refresh": "0"}});
      }
      return await caches.match(event.request) ||
      fetch(event.request);
  })());
});