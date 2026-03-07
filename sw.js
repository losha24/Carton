const CACHE_NAME = 'math-pro-v7.2.2';
const ASSETS = ['./', './index.html', './style.css', './app.js', './manifest.json', './icon.PNG'];

self.addEventListener('install', (e) => { 
    self.skipWaiting(); 
    e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS))); 
});

self.addEventListener('activate', (e) => { 
    e.waitUntil(caches.keys().then((ks) => Promise.all(ks.map((k) => k !== CACHE_NAME && caches.delete(k))))); 
    return self.clients.claim(); 
});

self.addEventListener('fetch', (e) => { 
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request))); 
});
