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
    event.waitUntil(
        caches.keys().then(cacheNames => 
            Promise.all(cacheNames.map(cacheName => 
                !cacheWhitelist.includes(cacheName) && caches.delete(cacheName)
            ))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.url.includes("/daohuyenmy/music/")) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => 
                cache.match(event.request).then(response => {
                    if (!response) {
                        return fetch(event.request, { cache: "no-store" }).then(networkResponse => {
                            if (networkResponse.ok) cache.put(event.request, networkResponse.clone());
                            return networkResponse;
                        });
                    }
                    return response;
                })
            )
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(response => 
                response || fetch(event.request)
            )
        );
    }
});

const cacheWhitelist = [CACHE_NAME];