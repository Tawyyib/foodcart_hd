// ============================================
// PAGE CLASS INJECTION
// ============================================
// Adds a `page-<name>` class to <body> based on
// the current HTML file (e.g., cart.html → page-cart).
// ============================================

export function injectPageClass() {
    
    const apply = () => {
        const path = window.location.pathname;
        const file = path.split('/').pop() || 'index.html';
        const pageName = file.replace(/\.html?$/, '');

        if (pageName && document.body) {
            document.body.classList.add(`page-${pageName}`);
        }
    };

    if (document.body) {
        apply();
    } else {
        document.addEventListener('DOMContentLoaded', apply);
    }
}