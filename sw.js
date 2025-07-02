const CACHE_NAME = "service-worker";

// Định nghĩa ánh xạ hostname với base path
const baseConfig = new Map([
    ["netlify.app", "/"],     // Netlify
    ["vercel.app", "/"],      // Vercel
    ["pages.dev", "/"],       // Cloudflare Pages
    ["onrender.com", "/"],    // Render
]);

self.addEventListener("install", (event) => {
    // Lấy hostname từ registration scope
    const scopeUrl = new URL(self.registration.scope);
    const hostname = scopeUrl.hostname;

    // Xác định REPOSITORY_ROOT
    let REPOSITORY_ROOT = "/"; // Mặc định là /
    if (hostname === "github.io" || hostname.endsWith(".github.io") || hostname === "gitlab.io" || hostname.endsWith(".gitlab.io")) {
        // Lấy base path từ scope pathname
        const path = scopeUrl.pathname.split("/").filter(Boolean);
        REPOSITORY_ROOT = path.length > 0 ? `/${path[0]}/` : "/";
    } else {
        for (const [key, value] of baseConfig) {
            if (hostname === key || hostname.endsWith(`.${key}`)) {
                REPOSITORY_ROOT = value;
                break;
            }
        }
    }

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache
                .addAll([
                    `${REPOSITORY_ROOT}favicon.ico`,
                    `${REPOSITORY_ROOT}index.html`,
                    `${REPOSITORY_ROOT}offline.html`,
                    `${REPOSITORY_ROOT}placeholder.jpg`,
                    `${REPOSITORY_ROOT}sw.js`,
                    `${REPOSITORY_ROOT}videos.json`,
                ])
                .catch((error) => console.error("Lỗi cache:", error));
        })
    );
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
    const hostname = requestUrl.hostname;

    // Xác định REPOSITORY_ROOT
    let REPOSITORY_ROOT = "/"; // Mặc định
    if (hostname === "github.io" || hostname.endsWith(".github.io") || hostname === "gitlab.io" || hostname.endsWith(".gitlab.io")) {
        const path = new URL(self.registration.scope).pathname.split("/").filter(Boolean);
        REPOSITORY_ROOT = path.length > 0 ? `/${path[0]}/` : "/";
    } else {
        for (const [key, value] of baseConfig) {
            if (hostname === key || hostname.endsWith(`.${key}`)) {
                REPOSITORY_ROOT = value;
                break;
            }
        }
    }

    // XỬ LÝ CÁC YỀU CẦU VIDEO ĐỂ DÙNG CACHE HTTP
    if (requestUrl.pathname.match(/\.(mp4|webm|ogg)$/i)) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Để trình duyệt tự xử lý cache HTTP theo tiêu đề từ CDN
                    return response;
                })
                .catch(() => caches.match(`${REPOSITORY_ROOT}offline.html`))
        );
        return;
    }

    // // XỬ LÝ CÁC YÊU CẦU ĐỂ BỎ QUA CACHE HTTP CHO VIDEO
    // if (requestUrl.pathname.match(/\.(mp4|webm|ogg)$/i)) {
    //     event.respondWith(
    //         fetch(event.request, {
    //             cache: "no-store", // Không sử dụng cache trình duyệt cho video
    //         }).catch(() => caches.match(`${REPOSITORY_ROOT}offline.html`))
    //     );
    //     return;
    // }

    // Xử lý đặc biệt cho videos.json
    if (requestUrl.pathname.endsWith("videos.json")) {
        event.respondWith(
            fetch(event.request)
                .then(async (networkResponse) => {
                    if (networkResponse.ok) {
                        const newData = await networkResponse.clone().json();
                        const cache = await caches.open(CACHE_NAME);
                        const cachedResponse = await cache.match(event.request);
                        if (cachedResponse) {
                            const cachedData = await cachedResponse.json();
                            if (newData.version !== cachedData.version) {
                                console.log("Cập nhật cache videos.json vì version mới:", newData.version);
                                await cache.put(event.request, networkResponse.clone());
                            }
                        } else {
                            await cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    }
                    return cache.match(event.request) || caches.match(`${REPOSITORY_ROOT}offline.html`);
                })
                .catch(() => {
                    return caches.match(event.request) || caches.match(`${REPOSITORY_ROOT}offline.html`);
                })
        );
        return;
    }

    // Xử lý các tài nguyên khác
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    console.log("From cache:", requestUrl.pathname);
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then((networkResponse) => {
                        if (networkResponse.ok && requestUrl.pathname.match(/\.(ico|html|jpg|json)$/i)) {
                            console.log("Caching:", requestUrl.pathname);
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    })
                    .catch(() => caches.match(`${REPOSITORY_ROOT}offline.html`));
            });
        })
    );
});
