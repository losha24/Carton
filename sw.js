const CACHE_NAME = 'math-champions-v3.5.9';
const ASSETS = [
  './',
  './index.html',
  './style.css?v=3.5.9',
  './app.js?v=3.5.9',
  './manifest.json',
  './icon.PNG'
];

// התקנה ושמירת קבצים בזיכרון
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching assets...');
      return cache.addAll(ASSETS);
    })
  );
});

// הפעלה וניקוי זכרון ישן (גרסאות קודמות)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// אסטרטגיית שליפת נתונים: קודם מהרשת, אם אין רשת - מהזיכרון
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
