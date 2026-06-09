// dashboard.js - 100% Safe & Conflict-Free Version
// Developed by Arshdeep Singh © 2026

// 1. HTML ਕੰਪੋਨੈਂਟ ਲੋਡ ਕਰਨ ਦਾ ਫੰਕਸ਼ਨ
async function loadComponent(elementId, filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Failed to load ' + filePath);
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    } catch (error) {
        console.error(error);
    }
}

// 2. ਬਾਕੀ ਪੰਨਿਆਂ ਲਈ ਹੈਡਰ-ਫੁੱਟਰ ਲੋਡ ਕਰਨਾ (index.html ਨੂੰ ਛੱਡ ਕੇ)
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

    // 🔥 Dynamic base path for components (no hardcoding)
    const base = window.getAppBasePath(); // returns '/DairyCare_Pro/' or '/'
    await loadComponent('header-placeholder', `${base}components/header.html`);
    await loadComponent('footer-placeholder', `${base}components/footer.html`);
});

// 3. ਗਲੋਬਲ ਨੈਵੀਗੇਸ਼ਨ ਫੰਕਸ਼ਨ
window.getAppBasePath = function () {
    const isGH = window.location.hostname.includes('github.io');
    return isGH ? '/DairyCare_Pro/' : '/';
};

window.navigateLegal = function (page) {
    window.location.href = window.location.origin + window.getAppBasePath() + 'legal/' + page;
};

window.navigateRoot = function (page) {
    window.location.href = window.location.origin + window.getAppBasePath() + page;
};
