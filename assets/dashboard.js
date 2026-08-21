// dashboard.js - 100% Safe & Conflict-Free Version (Fixed)
// Developed by Arshdeep Singh © 2026

// ==================== 1. GLOBAL FUNCTIONS (Defined First) ====================
// 🎯 Base path for GitHub Pages vs Localhost
window.getAppBasePath = function () {
    const isGH = window.location.hostname.includes('github.io');
    return isGH ? '/Dairycare_Pro/' : '/';
};

window.navigateLegal = function (page) {
    window.location.href = window.location.origin + window.getAppBasePath() + 'legal/' + page;
};

window.navigateRoot = function (page) {
    window.location.href = window.location.origin + window.getAppBasePath() + page;
};

// ==================== 2. COMPONENT LOADER (With Script Support) ====================
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Failed to load ' + filePath);
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;

            // ✅ Execute any <script> tags inside the loaded HTML
            const scripts = element.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                // Copy attributes (src, type, etc.)
                Array.from(script.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                // If inline script, set its text content
                newScript.text = script.textContent;
                // Replace old script with new one to execute it
                script.parentNode.replaceChild(newScript, script);
            });
        }
    } catch (error) {
        console.error(error);
    }
}

// ==================== 3. HEADER/FOOTER LOADING (Skip homepage) ====================
document.addEventListener('DOMContentLoaded', async () => {
    let path = window.location.pathname;
    // Remove trailing slash for consistent comparison
    let normalizedPath = path.replace(/\/$/, '');
    // Convert to lowercase for case‑insensitive checks
    const lowerPath = normalizedPath.toLowerCase();

    // 🔥 Homepage detection (case‑insensitive, handles all cases)
    const isHomepage = (
        lowerPath.endsWith('index.html') ||
        normalizedPath === '' ||
        normalizedPath === '/' ||
        lowerPath === '/dairycare_pro'
    );

    if (isHomepage) {
        console.log("Index page detected, skipping dashboard.js component loading.");
        return;
    }

    // 🔥 Now safely call getAppBasePath (because it's defined at top)
    const base = window.getAppBasePath();
    await loadComponent('header-placeholder', `${base}components/header.html`);
    await loadComponent('footer-placeholder', `${base}components/footer.html`);
});
