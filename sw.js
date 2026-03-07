const CACHE_NAME = 'math-pro-v1.1.4'; // שינוי הגרסה מכריח את הדפדפן להתעדכן
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon.PNG'
];

// התקנה - שמירת הקבצים בזיכרון המטמון
self.addEventListener('install', (event) => {
  self.skipWaiting(); // גורם לגרסה החדשה להיכנס לתוקף מיד
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// הפעלה - מחיקת גרסאות קודמות וישנות של האפליקציה
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('מנקה מטמון ישן:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// אסטרטגיית אחזור - קודם בודק בשרת ואז במטמון (כדי להבטיח עדכונים)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
