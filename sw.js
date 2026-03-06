const cacheName = 'math-kids-v1.0.2';
const assets = ['./', './index.html', './style.css', './app.js', './manifest.json', './icon.png'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
