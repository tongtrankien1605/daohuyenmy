const CACHE_NAME = "tiktok-clone-v1";

// Định nghĩa BASE URL
const GITHUB_PAGES_BASE = "https://tongtrankien1605.github.io";
const REPOSITORY_ROOT = "/daohuyenmy/";
const BASE_URL = GITHUB_PAGES_BASE + REPOSITORY_ROOT;

const RAW_GITHUB_BASE = "https://raw.githubusercontent.com/tongtrankien1605";
const RAW_REPOSITORY_ROOT = "/daohuyenmy/main/";
const RAW_BASE_URL = RAW_GITHUB_BASE + RAW_REPOSITORY_ROOT;

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                // `${BASE_URL}videos`, // Uncomment nếu cần cache thư mục videos
                `${BASE_URL}favicon.ico`,
                `${BASE_URL}index.html`,
                `${BASE_URL}offline.html`,
                `${BASE_URL}placeholder.jpg`,
                // `${BASE_URL}README.md`, // Uncomment nếu cần
                `${BASE_URL}sw.js`,
                `${BASE_URL}videos.json`
            ]);
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
    const cacheKey = new Request(requestUrl.origin + requestUrl.pathname, {
        method: event.request.method,
        headers: event.request.headers,
        mode: 'cors',
        cache: 'default',
        credentials: 'omit'
    });

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(cacheKey).then(cachedResponse => {
                if (cachedResponse) {
                    console.log("From cache:", event.request.url);
                    return cachedResponse;
                }

                return fetch(event.request, { mode: 'cors', credentials: 'omit' }).then(networkResponse => {
                    if (networkResponse.ok && (event.request.url.includes(BASE_URL) || event.request.url.includes(RAW_BASE_URL))) {
                        console.log("Caching:", event.request.url);
                        const clonedResponse = networkResponse.clone();
                        cache.put(cacheKey, clonedResponse);
                    }
                    return networkResponse;
                }).catch(err => {
                    console.error("Fetch failed:", err);
                    return caches.match(`${BASE_URL}offline.html`);
                });
            });
        })
    );
});