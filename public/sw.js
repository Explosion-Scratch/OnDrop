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

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "POST") {
    event.respondWith(fetch(event.request));
    return;
  }
  if (event.request.url.includes("socket.io"))
    return event.respondWith(fetch(event.request));
	
	var dataRes;
	var data = new Promise(resolve => (dataRes = resolve));
  event.respondWith(
    (async () => {
      const formData = await event.request.clone().formData();
			dataRes(Object.fromEntries(formData.entries()))
      console.log(data);
      return fetch("index.html");
    })()
  );
	event.waitUntil(async function() {
    // Exit early if we don't have access to the client.
    // Eg, if it's cross-origin.
    if (!event.clientId) return;

    // Get the client.
    const client = await clients.get(event.clientId);
    // Exit early if we don't get the client.
    // Eg, if it closed.
    if (!client) return;

    // Send a message to the client.
		data = await data;
		if (!data.file){
			console.log('No file in data', data);
		}
    client.postMessage({
      file: data.file
    });

  }());
});

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
