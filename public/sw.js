const dynamicCacheName = "site-dynamic-v1";
const assets = [
  "/images/OnDrop-48.png",
  "/images/OnDrop-72.png",
  "/images/OnDrop-96.png",
  "/images/OnDrop-192.png",
  "/images/OnDrop-168.png",
  "/images/OnDrop-144.png",
  "/images/OnDrop-512.png",
  "/index.html",
  "/manifest.json",
];
// activate event
self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches.open(dynamicCacheName).then((cache) => {
      cache.addAll(assets);
    })
  );
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== dynamicCacheName)
          .map((key) => caches.delete(key))
      );
    })
  );
});
// fetch event
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((cacheRes) => {
      return cacheRes || fetch(evt.request);
    })
  );
});
