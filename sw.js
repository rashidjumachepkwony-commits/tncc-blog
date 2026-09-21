const CACHE_NAME = 'tncc-v14';
const APP_SHELL = ['./', './index.html', './404.html', './lookup.html', './teso-north-cross-country.html', './manifest.json', './logo.jpeg', './assets/css/site.css', './assets/js/app.js', './assets/js/components.js'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isDocumentAsset = ['document', 'style', 'script'].includes(event.request.destination);

  if (isDocumentAsset) {
    // Network-first for pages, CSS and JS so deployments appear immediately,
    // with a cached fallback for offline use.
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html'))));
    return;
  }

  // Cache-first for images and other static assets.
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match('./404.html'))));
});
