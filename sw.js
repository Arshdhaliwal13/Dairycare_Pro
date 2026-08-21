const CACHE_NAME = 'dairycare-v7.7';
const isGH = self.location.hostname.includes('github.io');
const BASE_PATH = isGH ? '/DairyCare_Pro/' : '/';

const urlsToCache = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}donate.html`,
  `${BASE_PATH}pakka_hisab/pakka.html`,
  `${BASE_PATH}kacha_hisab/kacha.html`,
  `${BASE_PATH}reports/reports.html`,
  `${BASE_PATH}dues/dues.html`,
  `${BASE_PATH}assets/style.css`,
  `${BASE_PATH}assets/script.js`,
  `${BASE_PATH}assets/dashboard.js`,
  `${BASE_PATH}components/header.html`,
  `${BASE_PATH}components/footer.html`,
  `${BASE_PATH}components/marquee.html`
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
  // 👑 ਆਹ ਲਾਈਨਾਂ ਇੱਥੇ ਐਡ ਹੋ ਗਈਆਂ ਨੇ
  if (event.request.method !== 'GET' || event.request.url.includes('translate.googleapis.com')) {
    return; // ਇਹਨੂੰ ਸਿੱਧਾ ਨੈੱਟ 'ਤੇ ਜਾਣ ਦਿਓ, ਕੈਸ਼ੇ ਬਾਕਸ ਵਿੱਚ ਨਾ ਪਾਓ
  }
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

      // ਕੈਸ਼ੇ ਵਿੱਚੋਂ ਫਾਈਲ ਦਿਓ, ਜੇਕਰ ਕੈਸ਼ੇ 'ਚ ਨਹੀਂ ਹੈ ਤਾਂ ਨੈੱਟਵਰਕ ਰਿਸਪੌਂਸ ਦਿਓ
      return cachedResponse || fetchPromise;
    }).catch(() => {
      // ਜੇਕਰ ਔਫਲਾਈਨ ਹੋਵੇ ਅਤੇ ਫਾਈਲ ਨਾ ਮਿਲੇ ਤਾਂ index.html ਫਾਲਬੈਕ ਦਿਓ
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
