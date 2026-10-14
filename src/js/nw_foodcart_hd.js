// ============================================
// GREENCART™ — MAIN JAVASCRIPT ENTRY
// ============================================

// 1. Global styles
import '@scss/foodcart_hd.scss';

// 2. Font Awesome
//import '@fortawesome/fontawesome-free/css/all.min.css';

// 3. Module imports
import { initTopBar } from './global/top-bar.js';
// import { initMobileMenu } from './js/mobile-menu.js';
import { initProfileDropdown } from './global/profile-dropdown.js';
import { initHeroToggle } from './modules/hero-toggle.js';
import { initWholesaleMode } from './modules/wholesale-mode.js';
import { initCart } from './modules/cart.js';
import { initCheckout } from './modules/checkout.js';
import { initAuth } from './modules/auth.js';
import { initBackToTop } from './global/back-to-top.js';
import { initThemeToggle } from './global/mode-toggle.js';

// 4. Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🟢 FoodCart™ initializing...');

  // Remove preload class (re-enables transitions)
  document.body.classList.remove('preload');

  // Run each module in isolation so a failure in one
  // doesn't prevent the others from running.
  const modules = [
    initTopBar,
    // initMobileMenu,
    initProfileDropdown,
    initHeroToggle,
    initWholesaleMode,
    initCart,
    initCheckout,
    initAuth,
    initBackToTop,
    initThemeToggle,
  ];

  modules.forEach((init) => {
    try {
      init();
    } catch (err) {
      console.error(`❌ Init failed: ${init.name}`, err);
    }
  });

  console.log('🟢 GreenCart™ ready.');
});