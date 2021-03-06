
// Global DEPENDENCIES
const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
	"/",
	"/index.html",
	"/styles.css",
	"/index.js",
	"/manifest.json",
	"/icons/icon-192x192.png",
	"icons/icon-512x512.png",
];

self.addEventListener("install", function (evt) {
	evt.waitUntil(
		caches
			.open(DATA_CACHE_NAME)
			.then((cache) => cache.add("/api/transaction"))
	);
	evt.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
	);
	self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
	evt.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
						console.log(key);
						return caches.delete(key);
					}
				})
			);
		})
	);
	self.clients.claim();
});

self.addEventListener("fetch", function (evt) {
	if (evt.request.url.includes("/api/")) {
		console.log(evt.request.url);
		evt.respondWith(
			caches.open(DATA_CACHE_NAME).then((cache) => {
				return fetch(evt.request)
					.then((response) => {
						if (response.status === 200) {
							cache.put(evt.request.url, response.clone());
						}
						return response;
					})
					.catch((err) => {
						return cache.match(evt.request);
					});
			})
		);
		return;
	}
	evt.respondWith(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.match(evt.request).then((response) => {
				return response || fetch(evt.request);
			});
		})
	);
});
