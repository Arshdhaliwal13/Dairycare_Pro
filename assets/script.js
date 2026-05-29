// assets/script.js – Offline + Daily Refresh

// 🎯 GitHub Pages ਅਤੇ Localhost ਦੋਵਾਂ ਲਈ ਸਹੀ ਪਾਥ ਚੁਣੋ
const isGH = window.location.hostname.includes("github.io");
const swPath = isGH ? '/DairyCare_Pro/sw.js' : '/sw.js';

// Register Service Worker (ਹੁਣ 404 ਐਰਰ ਨਹੀਂ ਆਵੇਗਾ)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(swPath)
    .then(reg => console.log('SW registered on path:', swPath, reg))
    .catch(err => console.error('SW failed:', err));
}

// Daily version check (once per day)
function checkForUpdates() {
  const lastCheck = localStorage.getItem('sw_update_check');
  const today = new Date().toISOString().slice(0, 10);

  if (lastCheck !== today) {
    localStorage.setItem('sw_update_check', today);

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update().then(() => {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        });
      });
    }
  }
}

// Listen for skip waiting message
navigator.serviceWorker.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
  }
});

checkForUpdates();
window.addEventListener('online', () => checkForUpdates());

// Manual update check (without controller check)
async function checkForManualUpdate() {
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();

    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    } else if (registration.active) {
      alert('No update available. Your app is up to date.');
    } else {
      alert('Service worker is installing. Please reload page once.');
    }
  } catch (error) {
    console.error('Update check failed:', error);
    alert('Update check failed. Please refresh page and try again.');
  }
}

// Event delegation for dynamic button
document.addEventListener('click', async (event) => {
  if (event.target.id === 'checkUpdateBtn') {
    await checkForManualUpdate();
  }
});

// ਨਵਾਂ ਕੋਡ (ਸਿਰਫ਼ 1 ਹੀ v ਦਿਖਾਉਣ ਲਈ)
const APP_VERSION = 'v4.5';

document.addEventListener('DOMContentLoaded', function () {
  setVersionNumber();
});

function setVersionNumber() {
  const versionSpan = document.getElementById('appVersion');
  if (versionSpan) {
    versionSpan.innerText = APP_VERSION; // 🎯 ਹੁਣ ਸਿੱਧਾ v4.5 ਲਿਖਿਆ ਆਵੇਗਾ
    console.log('Version set to:', versionSpan.innerText);
  } else {
    setTimeout(setVersionNumber, 200);
  }
}

// Start checking after DOM ready
document.addEventListener('DOMContentLoaded', function () {
  setVersionNumber();
});