// Service Worker for PWA - News Salud App
const CACHE_NAME = 'news-salud-v1';
const STATIC_ASSETS = [
  './index.html',
  './index.css',
  './index.js',
  './manifest.json'
];
const API_CACHE = 'news-api-cache';

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first for static, stale-while-revalidate for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Static assets: cache-first
  if (STATIC_ASSETS.some(asset => event.request.url.endsWith(asset))) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((netResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, netResponse.clone());
            return netResponse;
          });
        });
      })
    );
    return;
  }
  
  // API calls: network-first, cache backup (stale-while-revalidate)
  if (url.origin === 'https://api.thenewsapi.com') {
    event.respondWith(
      fetch(event.request).then((netResponse) => {
        const clone = netResponse.clone();
        caches.open(API_CACHE).then((cache) => {
          cache.put(event.request, clone);
        });
        return netResponse;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // Default: network-first
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
