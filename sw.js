const CACHE_NAME = 'billete-seguro-v32';
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

// Fetch Service Worker con Caché Dinámico para Tesseract
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Interceptar peticiones de Tesseract para guardarlas offline
  if (url.hostname === 'unpkg.com' || url.hostname.includes('tesseract')) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Comportamiento normal para resto de assets
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
