const CACHE = 'produzir-registra-v2';
const ASSETS = [
  './',
  './index.html',
  './assets/styles.css',
  './assets/base.css',
  './assets/components.css',
  './assets/icons/app-icon.svg',
  './manifest.webmanifest',
  './src/app.js',
  './src/data/demo-data.js',
  './src/domain/models.js',
  './src/domain/production.js',
  './src/domain/review.js',
  './src/domain/needs.js',
  './src/domain/analytics.js',
  './src/storage/store.js',
  './src/session/session.js',
  './src/ui/common.js',
  './src/ui/motivation.js',
  './src/ui/login.js',
  './src/ui/register.js',
  './src/ui/produced.js',
  './src/ui/results.js',
  './src/ui/review.js',
  './src/ui/router.js',
  './src/scanner/barcode.js',
  './src/offline/sync.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const clone = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, clone));
      return response;
    }).catch(() => event.request.mode === 'navigate' ? caches.match('./index.html') : undefined))
  );
});
