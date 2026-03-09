const CACHE_NAME = 'billete-seguro-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './bg_new.jpg',
  './logo_full.jpg',
  './qr_apoyo.jpg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch Service Worker
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
