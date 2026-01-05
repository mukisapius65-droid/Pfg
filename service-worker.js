// Simple Service Worker for PFG Chapati
const CACHE_NAME = 'pfg-chapati-v2';

self.addEventListener('install', event => {
  console.log('📦 Installing PFG Chapati PWA');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/script.js'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
