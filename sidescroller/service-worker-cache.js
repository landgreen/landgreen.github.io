const CACHE_NAME = 'n-gon-cache';
const PRECACHE_ASSETS = [
    "/",
    "/index.html",
    "/style.css",
    'lib/matter.min.js',
    'lib/decomp.min.js',
    "js/simulation.js",
    "js/player.js",
    "js/powerup.js",
    "js/tech.js",
    "js/bullet.js",
    "js/mob.js",
    "js/spawn.js",
    "js/level.js",
    "js/lore.js",
    "js/engine.js",
    "js/index.js",
]

// if (!localSettings.isHideImages) {
//     addEventListener("load", () => {
//         let urls = new Array()
//         for (let i = 0, len = b.guns.length; i < len; i++) urls.push("img/gun/" + b.guns[i].name + ".webp")
//         for (let i = 1, len = m.fieldUpgrades.length; i < len; i++) urls.push("img/field/" + m.fieldUpgrades[i].name + ".webp")
//         for (let i = 0, len = tech.tech.length; i < len; i++) {
//             if (!tech.tech[i].isJunk) urls.push("img/" + tech.tech[i].name + ".webp")
//         }
//         let images = new Array()
//         for (let i = 0; i < urls.length; i++) {
//             images[i] = new Image()
//             images[i].src = urls[i]
//         }
//         // console.log(urls, images)
//     });
// }


// Listener for the install event - precaches our assets list on service worker install.
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(PRECACHE_ASSETS);
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
    event.respondWith(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request); // match the request to our cache
        if (cachedResponse !== undefined) { // check if we got a valid response
            return cachedResponse; // Cache hit, return the resource
        } else {
            return fetch(event.request) // Otherwise, go to the network
        };
    });
});