const CACHE_NAME = 'dairycare-v5.6';
const BASE_PATH = '/Dairycare_Pro/';

const urlsToCache = [
  BASE_PATH,              // 👈 root – offline 'ch index.html without typing full name
  `${BASE_PATH}index.html`,
  `${BASE_PATH}assets/style.css`,
  `${BASE_PATH}assets/script.js`,
  `${BASE_PATH}assets/dashboard.js`,
  `${BASE_PATH}components/header.html`,
  `${BASE_PATH}components/footer.html`
];

// Install Event – cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching essential files...');
      return Promise.all(
        urlsToCache.map(url => cache.add(url).catch(err => {
          console.warn(`Failed to cache: ${url}`, err);
        }))
      );
    })
  );
  self.skipWaiting();
});

// Fetch Event – Stale-While-Revalidate (best for updates)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Background fetch to update cache
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline – ignore silently
      });

      // Return cached version immediately, or wait for network if no cache
      return cachedResponse || fetchPromise;
    }).catch(() => {
      // Ultimate fallback – always show index.html
      return caches.match(`${BASE_PATH}index.html`);
    })
  );
});

// Activate Event – clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// Message Event – for SKIP_WAITING
self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
