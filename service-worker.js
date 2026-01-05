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
// Add to service-worker.js
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      // If fetch fails, return offline page for HTML requests
      if (event.request.headers.get('Accept').includes('text/html')) {
        return caches.match('/offline.html');
      }
      // For other requests, try cache
      return caches.match(event.request);
    })
  );
});
