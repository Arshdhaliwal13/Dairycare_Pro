// assets/script.js – Offline + Daily Refresh + Optimized

// 🎯 GitHub Pages ਅਤੇ Localhost ਦੋਵਾਂ ਲਈ ਸਹੀ ਪਾਥ ਚੁਣੋ
const isGH = window.location.hostname.includes("github.io");
const swPath = isGH ? '/DairyCare_Pro/sw.js' : '/sw.js';

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(swPath)
    .then(reg => console.log('SW registered successfully on path:', swPath))
    .catch(err => console.error('SW registration failed:', err));
}

// Daily version check (once per day) - FIXED INEFFICIENCY
function checkForUpdates() {
  const lastCheck = localStorage.getItem('sw_update_check');
  const today = new Date().toISOString().slice(0, 10);

  if (lastCheck !== today) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.update()
          .then(() => {
            // ਜੇਕਰ ਕੋਈ ਨਵਾਂ ਸਰਵਿਸ ਵਰਕਰ ਵੇਟਿੰਗ ਵਿੱਚ ਹੈ
            if (registration.waiting) {
              localStorage.setItem('sw_update_check', today);
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            } else {
              // [FIXED] ਜੇ ਕੋਈ ਅਪਡੇਟ ਨਹੀਂ ਮਿਲਿਆ, ਤਾਂ ਵੀ ਅੱਜ ਦੀ ਡੇਟ ਸੇਵ ਕਰੋ ਤਾਂ ਜੋ ਵਾਰ-ਵਾਰ ਰਿਕਵੈਸਟ ਨਾ ਜਾਵੇ
              localStorage.setItem('sw_update_check', today);
            }
          })
          .catch(err => console.warn('Auto update check failed (Network issue etc.):', err)); // [FIXED] Added catch block
      });
    } else {
      localStorage.setItem('sw_update_check', today);
    }
  }
}

// Listen for skip waiting message (ਤਾਂ ਜੋ ਸਾਰੇ ਟੈਬਸ ਵਿੱਚ ਅੱਪਡੇਟ ਹੋ ਸਕੇ)
let refreshing = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (!refreshing) {
    refreshing = true;
    window.location.reload();
  }
});

// ਪੇਜ ਲੋਡ ਹੋਣ 'ਤੇ ਚੈੱਕ ਕਰੋ
checkForUpdates();
window.addEventListener('online', () => checkForUpdates());

// Manual update check (User ਵੱਲੋਂ ਬਟਨ ਦਬਾਉਣ 'ਤੇ)
async function checkForManualUpdate() {
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();

    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      alert('No update available. Your app is up to date.');
    }
  } catch (error) {
    console.error('Manual update check failed:', error);
    alert('Update check failed. Please refresh page and try again.');
  }
}

// Event delegation for dynamic button
document.addEventListener('click', async (event) => {
  if (event.target.id === 'checkUpdateBtn') {
    await checkForManualUpdate();
  }
});

// ਐਪ ਵਰਜ਼ਨ ਡਿਸਪਲੇਅ ਲੌਜਿਕ
const APP_VERSION = 'v4.7';

document.addEventListener('DOMContentLoaded', function () {
  setVersionNumber();
});

function setVersionNumber() {
  const versionSpan = document.getElementById('appVersion');
  if (versionSpan) {
    versionSpan.innerText = APP_VERSION; 
    console.log('Version set to:', versionSpan.innerText);
  } else {
    setTimeout(setVersionNumber, 200);
  }
}
