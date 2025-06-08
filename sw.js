const CACHE_NAME = "tiktok-clone-v1";

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => !cacheWhitelist.includes(cacheName) && caches.delete(cacheName))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const requestUrl = new URL(event.request.url);
    const cacheKey = new Request(requestUrl.origin + requestUrl.pathname, {
        method: event.request.method,
        headers: event.request.headers,
        mode: "cors",
        cache: "default",
    });

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(cacheKey).then((cachedResponse) => {
                if (cachedResponse) {
                    console.log("From cache:", event.request.url);
                    return cachedResponse;
                }

                return fetch(event.request, { mode: "cors" })
                    .then((networkResponse) => {
                        if (networkResponse.ok && (event.request.url.includes("tongtrankien1605.github.io/daohuyenmy") || event.request.url.includes("raw.githubusercontent.com"))) {
                            console.log("Caching:", event.request.url);
                            const clonedResponse = networkResponse.clone();
                            cache.put(cacheKey, clonedResponse);
                        }
                        return networkResponse;
                    })
                    .catch((err) => {
                        console.error("Fetch failed:", err);
                        return caches.match("/offline.html");
                    });
            });
        })
    );
});
