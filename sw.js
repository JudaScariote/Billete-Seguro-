const CACHE_NAME = 'billete-seguro-v23';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './bg_final.jpg',
  './qr_apoyo.jpg',
  './app_icon_v20.png',
  './series_db.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate & Clear Old Cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Service Worker (Network first, then Cache, Dynamic caching for Tesseract)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then(networkResponse => {
        // Solo cachear respuestas válidas y seguras
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      }).catch(() => {
        // Opcional: retornar una página offline si falla la red y no está en caché
      });
    })
  );
});
