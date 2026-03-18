const CACHE_NAME = 'billete-seguro-v52';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './series_db.js',
  './bg_final.jpg',
  './qr_apoyo.jpg',
  './app_icon_v20.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); })
    ))
  );
});

self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones del mismo origen
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});
