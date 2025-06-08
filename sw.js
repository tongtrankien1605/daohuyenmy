const CACHE_NAME = "tiktok-clone-v1";
// Để rỗng urlsToCache
const urlsToCache = [];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Không cần cache trước, chỉ mở cache
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
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                console.log("From cache:", event.request.url);
                return cachedResponse;
            }
            return fetch(event.request).then(networkResponse => {
                if (networkResponse.ok && event.request.url.includes("tongtrankien1605.github.io/daohuyenmy")) {
                    console.log("Caching:", event.request.url);
                    const clonedResponse = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => 
                        cache.put(event.request, clonedResponse)
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