const CACHE_NAME = 'buyonboard-v2';  // Schimbă versiunea la fiecare actualizare

const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/data/products.js',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache instalat: ' + CACHE_NAME);
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())  // Forțează activarea imediată
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('Ștergere cache vechi: ' + key);
            return caches.delete(key);
          })
      );
    })
    .then(() => self.clients.claim())  // Preia controlul imediat
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(e.request).then(response => {
          // Salvează în cache pentru utilizare offline
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(e.request, responseClone);
            });
          }
          return response;
        });
      })
      .catch(() => {
        // Pagină offline dacă nu există cache
        return caches.match('/index.html');
      })
  );
});
