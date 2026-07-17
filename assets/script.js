// assets/script.js – Offline + Daily Refresh + Optimized

// 🎯 GitHub Pages ਅਤੇ Localhost ਲਈ ਸਹੀ ਪਾਥ
const isGH = window.location.hostname.includes("github.io");
const swPath = isGH ? '/Dairycare_Pro/sw.js' : '/sw.js';

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(swPath)
    .then(reg => console.log('SW registered successfully on path:', swPath))
    .catch(err => console.error('SW registration failed:', err));
}

// 🛠️ Daily auto‑update check (once per day)
function checkForUpdates() {
  const lastCheck = localStorage.getItem('sw_update_check');
  const today = new Date().toISOString().slice(0, 10);

  if (lastCheck !== today) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        // ✅ FIRST: Check if a waiting worker already exists (from previous session)
        if (registration.waiting) {
          localStorage.setItem('sw_update_check', today);
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          return;
        }

        // ✅ SECOND: Listen for new update BEFORE calling .update()
        registration.onupdatefound = () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.onstatechange = () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                localStorage.setItem('sw_update_check', today);
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            };
          }
        };
        // Now trigger the update check
        registration.update().catch(err => console.warn('Auto update check failed:', err));
      });
    } else {
      localStorage.setItem('sw_update_check', today);
    }
  }
}

// Listen for SKIP_WAITING message and reload all tabs
let refreshing = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (!refreshing) {
    refreshing = true;
    window.location.reload();
  }
});

// Initial check & online event
checkForUpdates();
window.addEventListener('online', () => checkForUpdates());

// Manual update check (with polling for waiting worker)
async function checkForManualUpdate() {
  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();

    // Poll for waiting worker (max 2 seconds)
    let attempts = 0;
    const checkWaiting = setInterval(() => {
      if (registration.waiting) {
        clearInterval(checkWaiting);
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else if (attempts >= 20) {
        clearInterval(checkWaiting);
        alert('No update available or update taking too long. Try again later.');
      }
      attempts++;
    }, 100);
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

// Version display (sync with sw.js)
const APP_VERSION = 'v7.0';

let versionRetryCount = 0;
const MAX_RETRIES = 20;

function setVersionNumber() {
  const versionSpan = document.getElementById('appVersion');
  if (versionSpan) {
    versionSpan.innerText = APP_VERSION;
    console.log('Version set to:', versionSpan.innerText);
  } else if (versionRetryCount < MAX_RETRIES) {
    versionRetryCount++;
    setTimeout(setVersionNumber, 200);
  } else {
    console.warn('Version span not found after max retries.');
  }
}

document.addEventListener('DOMContentLoaded', setVersionNumber);
