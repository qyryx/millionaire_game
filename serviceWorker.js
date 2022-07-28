const cache_container = "static_v2";
const files = [
    "/",
    "./styles.css",
    "./script.js"
]

self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(cache_container)
        .then(cache => {
            cache.addAll(files);
        })
    )
});

self.addEventListener("active", function (e){
    console.log("service worker activated", e);
});
