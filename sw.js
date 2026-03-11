const CACHE_NAME = 'billete-seguro-v39';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './bg_final.jpg',
  './qr_apoyo.jpg',
  './app_icon_v20.png',
  './series_db.js',
  // Tesseract 100% local - sin internet
  './tesseract.min.js',
  './tesseract.worker.min.js',
  './tesseract-core.wasm',
  './eng.traineddata.gz',
  // Fuente de Google (se cachea en primer uso)
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cachear archivos críticos primero, la fuente de Google de forma separada (puede fallar offline)
      const criticalAssets = ASSETS.filter(url => !url.startsWith('https://fonts'));
      const optionalAssets = ASSETS.filter(url => url.startsWith('https://fonts'));

      return cache.addAll(criticalAssets).then(() => {
        return Promise.allSettled(optionalAssets.map(url => cache.add(url)));
      });
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

// Fetch - Cache First para todos los assets
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      // Si no está en caché, intentar red y guardar dinámicamente
      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Sin respuesta offline para este recurso
        return new Response('Offline - recurso no disponible', { status: 503 });
      });
    })
  );
});
