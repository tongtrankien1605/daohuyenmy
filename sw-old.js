const CACHE_NAME = "tiktok-clone-v1";
const urlsToCache = ["/", "/index.html", "/videos.json"];

// Cài đặt Service Worker và cache các tài nguyên cơ bản
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// Xử lý yêu cầu mạng
self.addEventListener("fetch", (event) => {
    const requestUrl = new URL(event.request.url);

    // Cache video từ videos.json
    if (requestUrl.pathname.endsWith(".mp4") || requestUrl.pathname.endsWith(".webm") || requestUrl.pathname.endsWith(".ogg")) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                    return response || fetchPromise;
                });
            })
        );
    } else {
        // Cache-first cho các tài nguyên khác
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request).then((networkResponse) => {
                    if (networkResponse.ok) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                        });
                    }
                    return networkResponse;
                });
            })
        );
    }
});

// Xóa cache cũ khi kích hoạt Service Worker mới
self.addEventListener("activate", (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});