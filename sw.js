const CACHE_NAME = "tiktok-clone-v1";
const urlsToCache = [
    "https://tongtrankien1605.github.io/daohuyenmy/",
    "https://tongtrankien1605.github.io/daohuyenmy/index.html",
    "https://tongtrankien1605.github.io/daohuyenmy/videos.json",
    "https://tongtrankien1605.github.io/daohuyenmy/music/tran-ngoc-anh.mp4",
    "https://tongtrankien1605.github.io/daohuyenmy/favicon.ico",
    "https://tongtrankien1605.github.io/daohuyenmy/offline.html"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.all(
                urlsToCache.map(url => {
                    return fetch(url).then(response => {
                        if (!response.ok) {
                            console.error(`Failed to fetch ${url}: ${response.status}`);
                            throw new Error(`Failed to fetch ${url}`);
                        }
                        return cache.add(url);
                    }).catch(err => console.error(`Error caching ${url}:`, err));
                })
            );
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
                    const clonedResponse = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => 
                        cache.put(event.request, clonedResponse)
                    );
                }
                return networkResponse;
            }).catch(() => caches.match('/offline.html'));
        })
    );
});