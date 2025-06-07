const CACHE_NAME = "tiktok-clone-v1";
const urlsToCache = [
    "/daohuyenmy/",
    "/daohuyenmy/index.html",
    "/daohuyenmy/videos.json",
    "/daohuyenmy/music/tran-ngoc-anh.mp4"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => 
            Promise.all(cacheNames.map(cacheName => 
                !cacheWhitelist.includes(cacheName) && caches.delete(cacheName)
            ))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                console.log("From cache:", event.request.url);
                return response;
            }
            return fetch(event.request).then(networkResponse => {
                if (networkResponse.ok && event.request.url.startsWith("https://tongtrankien1605.github.io/daohuyenmy/")) {
                    caches.open(CACHE_NAME).then(cache => 
                        cache.put(event.request, networkResponse.clone())
                    );
                }
                return networkResponse;
            });
        })
    );
});