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
// Add version number to force update
const CACHE_VERSION = 'pfg-chapati-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  console.log('🔄 Installing PFG Chapati v3');
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('✨ Activating new PFG Chapati PWA');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_VERSION) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
