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

var dataRes;
var data = new Promise((resolve) => (dataRes = resolve));

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "POST") {
    event.respondWith(fetch(event.request));
    return;
  }
  if (event.request.url.includes("socket.io"))
    return event.respondWith(fetch(event.request));

  event.respondWith(
    (async () => {
      const formData = await event.request.clone().formData();
      dataRes(Object.fromEntries(formData.entries()));
      console.log("data is", await data);
      return fetch("index.html");
    })()
  );
});
self.addEventListener("message", handler);
async function handler(event) {
  console.log("Got message from client", event.data);
  // Get the client.
  console.log("Getting client");
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/message_event#:~:text=event.source.postMessage(%22Hi%20client%22)%3B
  const client = event.source;
  // Exit early if we don't get the client.
  // Eg, if it closed.
  if (!client) return console.log("No client");
  console.log("Got client");
  // Send a message to the client.
  console.log("awaiting data.", data);
  data = await data;
  console.log("Done waiting for data", data);
  if (!data.file) {
    console.log("No file in data", data);
    data.file = new File(
      [
        new Blob([
          `${data.url ? `${data.url}\n\n` : ""}${data.text || ""}${
            data.url || data.text
              ? ""
              : "No content transfered (theoretically this should never happen)"
          }`,
        ]),
      ],
      "message.txt",
      { type: "text/plain" }
    );
  }
  console.log("Sending message to client with data", data);

  client.postMessage({
    type: "FILE",
    file: data.file,
  });
  console.log("IT WORKED!!!!!!");
  data = new Promise((resolve) => (dataRes = resolve));
  self.removeEventListener("message", handler);
}

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
