const CACHE_NAME = 'billete-seguro-v42';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './series_db.js',
  './tesseract.min.js',
  './tesseract.worker.min.js',
  './tesseract-core.wasm',
  './eng.traineddata.gz',
  './bg_final.jpg',
  './qr_apoyo.jpg',
  './app_icon_v20.png'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones de analíticas o externas si las hubiera
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      
      return fetch(event.request).then((networkResponse) => {
        // No cachear dinámicamente para evitar llenar el almacenamiento,
        // solo usar lo pre-cacheado en ASSETS
        return networkResponse;
      }).catch(() => {
        // Si no hay red ni cache, fallar silenciosamente
        return null;
      });
    })
  );
});
