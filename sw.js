const CACHE_NAME = "tiktok-clone-v1";
const urlsToCache = []; // Giữ rỗng

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.resolve();
        })
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
    const requestUrl = new URL(event.request.url);
    const cacheKey = requestUrl.origin + requestUrl.pathname; // Bỏ query string

    event.respondWith(
        caches.match(cacheKey).then(cachedResponse => {
            if (cachedResponse) {
                console.log("From cache:", event.request.url);
                return cachedResponse;
            }
            return fetch(event.request).then(networkResponse => {
                if (networkResponse.ok && event.request.url.includes("tongtrankien1605.github.io/daohuyenmy")) {
                    console.log("Caching:", event.request.url);
                    const clonedResponse = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => 
                        cache.put(cacheKey, clonedResponse) // Sử dụng cacheKey
                    );
                }
                return networkResponse;
            }).catch(err => {
                console.error("Fetch failed:", err);
                return caches.match('/offline.html');
            });
        })
    );
});