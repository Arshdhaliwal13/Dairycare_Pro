const CACHE_NAME = 'dairycare-v4.6';

// 1. ਆਟੋਮੈਟਿਕ ਪਾਥ ਡਿਟੈਕਸ਼ਨ (Localhost 'ਤੇ '/' ਅਤੇ GitHub 'ਤੇ '/DairyCare_Pro/')
const isGitHub = self.location.hostname.includes("github.io");
const BASE_PATH = isGitHub ? `/${self.location.pathname.split('/')[1]}/` : '/';

// 2. ਕੈਸ਼ ਹੋਣ ਵਾਲੀਆਂ ਫਾਈਲਾਂ ਦੀ ਲਿਸਟ (Redirect ਰਿਸਕ ਤੋਂ ਬਿਨਾਂ 100% Safe)
const urlsToCache = [
  `${BASE_PATH}index.html`, // ਰੂਟ (/) ਦੀ ਬਜਾਏ ਸਿੱਧਾ index.html ਕੈਸ਼ ਕੀਤਾ ਤਾਂ ਜੋ 301 ਰੀਡਾਇਰੈਕਟ ਨਾ ਹੋਵੇ
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

// 3. Install Event - ਸਾਰੀਆਂ ਫਾਈਲਾਂ ਨੂੰ ਪਹਿਲੀ ਵਾਰ ਕੈਸ਼ ਵਿੱਚ ਸੇਵ ਕਰਨ ਲਈ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Validating and caching all assets cleanly...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 4. Fetch Event - Network-First Strategy (ਔਫਲਾਈਨ ਹੋਣ 'ਤੇ ਕੈਸ਼ ਚੱਲੇਗਾ, ਨੈੱਟ ਹੋਣ 'ਤੇ ਲੇਟੈਸਟ ਕੋਡ)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Google Fonts ਲਈ ਕੈਸ਼-ਫਸਟ ਸਟ੍ਰੈਟਿਜੀ (ਕਿਉਂਕਿ ਫੌਂਟਸ ਵਾਰ-ਵਾਰ ਬਦਲਦੇ ਨਹੀਂ)
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
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
    // ਬਾਕੀ ਸਾਰੀਆਂ ਐਪ ਫਾਈਲਾਂ ਲਈ: ਪਹਿਲਾਂ ਨੈੱਟਵਰਕ ਤੋਂ ਲੇਟੈਸਟ ਡਾਟਾ ਲਵੋ, 
    // ਜੇ ਯੂਜ਼ਰ ਔਫਲਾਈਨ (Offline) ਹੋਵੇ ਤਾਂ ਕੈਸ਼ ਵਿੱਚੋਂ ਫਾਈਲ ਕੱਢ ਕੇ ਦਿਖਾਓ
    event.respondWith(
      fetch(event.request).catch(() => {
        // [FIXED EDGE CASE] Trailing slash (/) ਨੂੰ ਨਾਰਮਲਾਈਜ਼ ਕਰਨਾ ਤਾਂ ਜੋ ਬਿਨਾਂ ਸਲੈਸ਼ ਦੇ ਵੀ ਔਫਲਾਈਨ ਚੱਲੇ
        const normalizedPath = url.pathname.replace(/\/$/, '');
        const baseWithoutSlash = BASE_PATH.replace(/\/$/, '');
        
        if (normalizedPath === baseWithoutSlash || url.pathname === BASE_PATH + 'index.html') {
          return caches.match(`${BASE_PATH}index.html`);
        }
        return caches.match(event.request);
      })
    );
  }
});

// 5. Activate Event - ਪੁਰਾਣੇ ਵਰਜ਼ਨ ਦੇ ਕੈਸ਼ ਨੂੰ ਡਿਲੀਟ ਕਰਕੇ ਸਟੋਰੇਜ ਸਾਫ਼ ਕਰਨ ਲਈ
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// 6. Message Event - SKIP_WAITING ਕਮਾਂਡ ਹੈਂਡਲ ਕਰਨ ਲਈ
self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
// 3. Install Event - ਹੁਣ ਇਹ ਮਿਸਿੰਗ ਫਾਈਲ ਦਾ ਨਾਮ ਸਾਫ਼-ਸਾਫ਼ ਦੱਸੇਗਾ ਅਤੇ SW ਫੇਲ੍ਹ ਨਹੀਂ ਹੋਵੇਗਾ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Validating and caching all assets cleanly...');
      
      // cache.addAll ਦੀ ਥਾਂ ਇੱਕ-ਇੱਕ ਕਰਕੇ ਫਾਈਲ ਚੈੱਕ ਕਰਨਾ ਤਾਂ ਜੋ SW ਇੰਸਟਾਲੇਸ਼ਨ ਫੇਲ੍ਹ ਨਾ ਹੋਵੇ
      return Promise.all(
        urlsToCache.map(url => {
          return cache.add(url).catch(err => {
            console.error(`❌ ਕੈਸ਼ ਹੋਣੋਂ ਰਹਿ ਗਈ ਫਾਈਲ (This file failed to cache): ${url}`, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});
