// assets/dashboard.js - Fully Optimized with Navigation Handlers
// Developed by Arshdeep Singh - DairyCare Pro

async function loadComponent(elementId, fileName) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) return;

    // 1. ਡਾਇਨਾਮਿਕਲੀ ਰੈਪੋਜ਼ਿਟਰੀ ਦਾ ਸਹੀ ਨਾਮ (Case-Sensitive) URL ਵਿੱਚੋਂ ਚੁੱਕੋ
    const isGitHub = window.location.hostname.includes("github.io");
    const repoName = window.location.pathname.split('/')[1];
    const basePath = isGitHub ? `/${repoName}/` : "/";

    try {
        const response = await fetch(`${basePath}components/${fileName}`);
        if (!response.ok) throw new Error(`Failed to load ${basePath}components/${fileName}`);
        const data = await response.text();
        placeholder.innerHTML = data;
        
        // ਜਦੋਂ ਹੈਡਰ ਲੋਡ ਹੋ ਜਾਵੇ
        if (elementId === "header-placeholder") {
            highlightActiveNav();
        }
    } catch (error) {
        console.error("Error loading component:", error);
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    // ਹੈਡਰ ਅਤੇ ਫੁੱਟਰ ਲੋਡ ਕਰੋ
    await loadComponent("header-placeholder", "header.html");
    await loadComponent("footer-placeholder", "footer.html");
});

function highlightActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-link, .nav-menu a");
    
    navLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href && currentPath.includes(href)) {
            link.classList.add("active");
        }
    });
}

// ----------------------------------------------------
// 🎯 NAVIGATION FUNCTIONS (ਫੁੱਟਰ ਦੇ ਲਿੰਕਾਂ ਨੂੰ ਚਲਾਉਣ ਵਾਲੇ ਫੰਕਸ਼ਨ)
// ----------------------------------------------------

// ਲੀਗਲ ਪੇਜਾਂ (Privacy, About, Terms) ਲਈ ਫੰਕਸ਼ਨ
function navigateLegal(pageName) {
    const isGitHub = window.location.hostname.includes("github.io");
    const repoName = window.location.pathname.split('/')[1];
    const basePath = isGitHub ? `/${repoName}/` : "/";
    
    // ਜੇਕਰ ਪੇਜ ਕਿਸੇ ਖ਼ਾਸ ਫੋਲਡਰ (ਜਿਵੇਂ legal/) ਵਿੱਚ ਹਨ ਤਾਂ ਇੱਥੇ ਪਾਥ ਬਦਲ ਸਕਦੇ ਹੋ
    // ਅਜੇ ਇਹ ਮੰਨ ਕੇ ਚੱਲ ਰਹੇ ਹਾਂ ਕਿ ਇਹ ਮੇਨ ਫੋਲਡਰ ਵਿੱਚ ਹੀ ਪਏ ਹਨ
    window.location.href = basePath + pageName;
}

// ਬਾਕੀ ਰੂਟ ਪੇਜਾਂ (Guide, Donate) ਲਈ ਫੰਕਸ਼ਨ
function navigateRoot(pageName) {
    const isGitHub = window.location.hostname.includes("github.io");
    const repoName = window.location.pathname.split('/')[1];
    const basePath = isGitHub ? `/${repoName}/` : "/";
    
    window.location.href = basePath + pageName;
}

// Global navigation functions (for footer links)
window.getAppBasePath = function() {
    const isGH = window.location.hostname.includes('github.io');
    return isGH ? '/DairyCare_Pro' : '';
};

window.navigateLegal = function(page) {
    window.location.href = window.getAppBasePath() + '/legal/' + page;
};

window.navigateRoot = function(page) {
    window.location.href = window.getAppBasePath() + '/' + page;
};
