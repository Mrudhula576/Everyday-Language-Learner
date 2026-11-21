// Service worker: makes the app installable and lets it open without internet.
//
// Network first: when online you always get the newest files; the saved copy
// is only used when the network fails. API calls (/api/...) are never cached.
// Bump CACHE when the list of app files changes.

const CACHE = 'maatalu-v2';
const APP_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/theme.css',
  './css/shell.css',
  './css/landing.css',
  './js/accents.js',
  './js/app.js',
  './js/config.js',
  './js/i18n.js',
  './js/router.js',
  './js/routes.js',
  './js/pages/index.js',
  './js/pages/landing.js',
  './js/pages/placeholder.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;
  if (event.request.method !== 'GET' || !sameOrigin || url.pathname.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((hit) => hit || caches.match('./index.html'))),
  );
});
