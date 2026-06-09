const CACHE_NAME = 'dairycare-v5.2';
const BASE_PATH = '/DairyCare_Pro/';

// 🛑 Root (/) ਨੂੰ ਹਟਾ ਦਿੱਤਾ – ਸਿਰਫ਼ index.html ਰੱਖਿਆ
const urlsToCache = [
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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching assets...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
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
