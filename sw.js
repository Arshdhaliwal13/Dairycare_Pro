const CACHE_NAME = 'dairycare-v5.0';

const isGitHub = self.location.hostname.includes('github.io');
const BASE_PATH = isGitHub ? '/DairyCare_Pro/' : '/';

// ✅ FIX 2: Include root path '/' for offline index.html fallback
const urlsToCache = [
  `${BASE_PATH}`,               // root directory (important for offline)
  `${BASE_PATH}index.html`,
  `${BASE_PATH}assets/style.css`,
  `${BASE_PATH}assets/script.js`,
  `${BASE_PATH}assets/dashboard.js`,
  `${BASE_PATH}components/header.html`,
  `${BASE_PATH}components/footer.html`,
  `${BASE_PATH}components/marquee.html`,
  `${BASE_PATH}components/marquee.css`,
  `${BASE_PATH}kacha_hisab/kacha.html`,
  `${BASE_PATH}kacha_hisab/kacha_logic.js`,
  `${BASE_PATH}kacha_hisab/kachaPdf.js`,
  `${BASE_PATH}kacha_hisab/kachaSettings.js`,
  `${BASE_PATH}kacha_hisab/kacha_style.css`,
  `${BASE_PATH}pakka_hisab/pakka.html`,
  `${BASE_PATH}pakka_hisab/pakka_logic.js`,
  `${BASE_PATH}pakka_hisab/pakkaPdf.js`,
  `${BASE_PATH}pakka_hisab/pakkaSettings.js`,
  `${BASE_PATH}pakka_hisab/pakka_style.css`,
  `${BASE_PATH}reports/reports.html`,
  `${BASE_PATH}reports/reports.js`,
  `${BASE_PATH}reports/reportspdf.js`,
  `${BASE_PATH}reports/reports.css`,
  `${BASE_PATH}dues/dues.html`,
  `${BASE_PATH}dues/dues.js`,
  `${BASE_PATH}dues/dues.css`,
  `${BASE_PATH}legal/privacy.html`,
  `${BASE_PATH}legal/about.html`,
  `${BASE_PATH}legal/terms.html`,
  `${BASE_PATH}donate.html`,
  `${BASE_PATH}guide.html`,
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;700&display=swap'
];

// Install – resilient caching
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      const results = await Promise.allSettled(
        urlsToCache.map(url => cache.add(url))
      );
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length) {
        console.warn(`⚠️ ${failed.length} file(s) failed to cache:`, failed.map(f => f.reason?.message));
      } else {
        console.log('✅ All assets cached successfully');
      }
    })
  );
  self.skipWaiting();
});

// ✅ FIX 1 + FIX 3: Fetch – only cache GET requests with http/https scheme, and handle errors
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isFont = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');
  const isGetRequest = event.request.method === 'GET';
  const isHttpScheme = url.protocol === 'http:' || url.protocol === 'https:';

  if (!isGetRequest || !isHttpScheme) {
    // Bypass caching for non-GET, non-http(s) requests (e.g., chrome-extension, POST)
    return;
  }

  if (isFont) {
    // Cache‑first for fonts
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(fetchRes => {
          const copy = fetchRes.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copy).catch(err => console.warn('Font cache put failed:', err));
          });
          return fetchRes;
        });
      })
    );
  } else {
    // Network‑first, cache successful responses for offline
    event.respondWith(
      fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, copy).catch(err => console.warn('Cache put failed for:', url.href, err));
        });
        return response;
      }).catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        // Fallback to index.html for root requests
        if (url.pathname === BASE_PATH || url.pathname === BASE_PATH + 'index.html') {
          return caches.match(`${BASE_PATH}index.html`);
        }
        return new Response('Offline – page not cached', { status: 404 });
      })
    );
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
