// assets/dashboard.js - Fixed Absolute Paths for GitHub Pages
// Developed by Arshdeep Singh - DairyCare Pro

async function loadComponent(elementId, fileName) {
    const placeholder = document.getElementById(elementId);
    if (!placeholder) return;

    // ਜੇਕਰ ਸਾਈਟ GitHub 'ਤੇ ਚੱਲ ਰਹੀ ਹੈ ਤਾਂ ਰੈਪੋ ਦਾ ਨਾਮ ਡਾਇਨਾਮਿਕਲੀ ਲੱਭੋ
    const isGitHub = window.location.hostname.includes("github.io");
    const repoName = window.location.pathname.split('/')[1];
    const basePath = isGitHub ? `/${repoName}/` : "/";

    try {
        const response = await fetch(`${basePath}components/${fileName}`);
        if (!response.ok) throw new Error(`Failed to load ${basePath}components/${fileName}`);
        const data = await response.text();
        placeholder.innerHTML = data;
        
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
