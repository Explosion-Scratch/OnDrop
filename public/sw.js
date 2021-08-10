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
	"https://unpkg.com/socket.io-client@4.1.2/dist/socket.io.min.js",
	"https://cdn.jsdelivr.net/gh/explosion-scratch/popup@v1.0.2/popup.js",
	"https://cdn.jsdelivr.net/gh/explosion-scratch/popup@v1.0.2/popup.css",
	"https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.7/tailwind.min.css",
	"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.9.0/css/all.min.css",
	"https://unpkg.com/vue@3",
	"https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap",
	"https://icanhazip.com/",
	"https://fonts.gstatic.com/s/montserrat/v15/JTUPjIg1_i6t8kCHKm459WxZBg_z_PZw.woff2",
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
