const CACHE_NAME = 'dairycare-v4.5';
const urlsToCache = [
  './',
  './index.html',
  './assets/style.css',
  './assets/script.js',
  './assets/dashboard.js',
  './components/header.html',
  './components/footer.html',
  './components/marquee.html',
  './components/marquee.css',
  './kacha_hisab/kacha.html',
  './kacha_hisab/kacha_logic.js',
  './kacha_hisab/kachaPdf.js',
  './kacha_hisab/kachaSettings.js',
  './kacha_hisab/kacha_style.css',
  './pakka_hisab/pakka.html',
  './pakka_hisab/pakka_logic.js',
  './pakka_hisab/pakkaPdf.js',
  './pakka_hisab/pakkaSettings.js',
  './pakka_hisab/pakka_style.css',
  './reports/reports.html',
  './reports/reports.js',
  './reports/reportspdf.js',
  './reports/reports.css',
  './dues/dues.html',
  './dues/dues.js',
  './dues/dues.css',
  './legal/privacy.html',
  './legal/about.html',
  './legal/terms.html',
  './donate.html',
  './guide.html',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;700&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(fetchRes => {
            cache.put(event.request, fetchRes.clone());
            return fetchRes;
          });
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
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