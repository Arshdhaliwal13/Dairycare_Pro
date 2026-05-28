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
    const path = window.location.pathname;

    // 🎯 ਜੇਕਰ ਮੌਜੂਦਾ ਪੇਜ ਹੋਮਪੇਜ (index.html) ਹੈ, ਤਾਂ ਇੱਥੋਂ ਹੀ ਵਾਪਸ ਮੁੜ ਜਾਓ
    // ਇਸ ਨਾਲ index.html ਦੇ ਆਪਣੇ ਕੋਡ ਨਾਲ ਕੋਈ ਟੱਕਰ (Conflict) ਨਹੀਂ ਹੋਵੇਗੀ
    if (path.endsWith('index.html') || path === '/' || path.endsWith('/DairyCare_Pro/')) {
        console.log("Index page detected, skipping dashboard.js component loading.");
        return;
    }

    // ਇਹ ਲੌਜਿਕ ਸਿਰਫ਼ ਅੰਦਰਲੇ ਪੰਨਿਆਂ (pakka, kacha, reports, dues) 'ਤੇ ਹੀ ਚੱਲੇਗਾ
    const isGitHubPages = window.location.hostname.includes('github.io');
    if (isGitHubPages) {
        await loadComponent('header-placeholder', '/DairyCare_Pro/components/header.html');
        await loadComponent('footer-placeholder', '/DairyCare_Pro/components/footer.html');
    } else {
        await loadComponent('header-placeholder', '/components/header.html');
        await loadComponent('footer-placeholder', '/components/footer.html');
    }
});

// 3. 👑 ਸੁਰੱਖਿਅਤ ਗਲੋਬਲ ਨੈਵੀਗੇਸ਼ਨ ਫੰਕਸ਼ਨ ( window. ਆਬਜੈਕਟ ਨਾਲ ਸੈੱਟ ਕੀਤੇ ਹਨ )
window.getAppBasePath = function () {
    const isGH = window.location.hostname.includes('github.io');
    return isGH ? '/DairyCare_Pro/' : '/';
};

window.navigateLegal = function (page) {
    // ਲੀਗਲ ਫੋਲਡਰ ਦੇ ਪਾਥ ਨੂੰ ਬਿਲਕੁਲ ਸਹੀ ਤਰ੍ਹਾਂ ਜੋੜਦਾ ਹੈ
    window.location.href = window.location.origin + window.getAppBasePath() + 'legal/' + page;
};

window.navigateRoot = function (page) {
    // ਰੂਟ ਫੋਲਡਰ ਦੇ ਪੰਨਿਆਂ 'ਤੇ ਲੈ ਕੇ ਜਾਂਦਾ ਹੈ
    window.location.href = window.location.origin + window.getAppBasePath() + page;
};
