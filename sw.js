const dynamicCacheName = 'site-dynamic-v1';
const assets = []
// activate event
self.addEventListener('activate', evt => {
	evt.waitUntil(
    caches.open(dynamicCacheName).then((cache) => {
      cache.addAll(assets);
    })
  );
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key =>  key !== dynamicCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});
// fetch event
self.addEventListener('fetch', evt => {
	console.log("fetched");
	console.log(evt.request.url);
	if (evt.request.url.includes("/socket.io") && evt.request.url.includes("?EIO")) {
		console.log("Request URL has socket.io in it");
		return fetch(evt.request)
	}
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request).then(fetchRes => {
        return caches.open(dynamicCacheName).then(cache => {
          cache.put(evt.request.url, fetchRes.clone());
          return fetchRes;
        })
      });
    })
  );
});