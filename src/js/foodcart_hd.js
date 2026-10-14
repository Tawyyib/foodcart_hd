// ============================================
// GREENCART™ MAIN JAVASCRIPT // src/foodcart_hd.js
// ============================================

// ---- 0. Page class (must be first) ----
import { injectPageClass } from './utils/class-injector.js';
injectPageClass();

// 1. Import Styles
import '@scss/foodcart_hd.scss';

//2.1. Profile links dropdown
import { initTopBar } from './global/top-bar.js';

//2.2. Profile links dropdown
import { initProfileDropdown } from './global/profile-dropdown.js';

import { switchHeroTab, initHeroSwipe } from './modules/hero-tabs.js';

//2.8
import { 
    openAuthOverlay, 
    closeAuthOverlay, 
    switchRegisterType, 
    showOrderSuccess, 
    showOrderError, 
    initAuthOverlayListeners 
} from './modules/auth-overlay.js';

// 3. Import Section 10: Auth Controller Module
import { 
    getAuthState, 
    isWholesaleActive, 
    setHeroView, 
    updateAuthUI, 
    handleLogout, 
    showAuthView, 
    initAuthController 
} from './modules/auth-controller.js';

// Initialize click and form event listeners on script load
//initAuthOverlayListeners();

import * as authActions from './modules/auth-actions.js';

// import { initWeightSelector } from './modules/product-weight-selector.js';

import { initProductCard } from './modules/product-card.js';

import { initProductCardStock } from './utils/product-card-stock.js';

import {
    getCart,
    getCartCount,
    getCartTotal,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getStockStatus,
    renderCartPage,
    initCartController
} from './modules/cart-controller-v.1.2.2.js';

import { initCartShipping } from './utils/cart-shipping-v.7.1.1.js'

import { initMiniCart } from './modules/mini-cart.js';

import { initAddToCartHandler } from './modules/add-to-cart-handler.js';

import { initPdpVariants } from './utils/pdp-variants-v.1.1.js';

import { initPdpQuantity } from './utils/pdp-quantity-v.1.1.js';

import { initPdpStock } from './utils/pdp-stock-v.1.1.js';

import { initPdpGallery } from './utils/pdp-gallery.js';

import { initProductTabs } from './utils/product-tabs.js';

import { initShippingToggle } from './modules/shipping-toggle.js';

import { 
    renderCheckoutSummary, 
    initCheckout
 } from './modules/checkout-processor-v.1.6.5.js';

import { initShopFilters } from './utils/shop-filters-v.1.2.js';

import { initSearchBar } from './utils/search-bar-v.1.0.0.js';

import { activateVariantFromQuery } from './utils/variant-from-query.js';

//2.8
import { initBackToTop } from './global/back-to-top.js';

// 2.9. Light / Dark Mode Switcher
import { initThemeToggle } from './global/mode-toggle.js';

document.querySelectorAll('.product-card').forEach(card => {
    console.log({
        category: card.dataset.category,
        price: card.dataset.price,
        retail: card.dataset.priceRetail,
        wholesale: card.dataset.priceWholesale,
        name: card.dataset.name,
        sku: card.dataset.sku,
    });
});

// 3. Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {

  console.log('🟢 GreenCart™ initialized.');

  // Remove preload class (re-enables transitions)
  document.body.classList.remove('preload');

  // Initialize modules
  //initThemeModeSwitcher();
  initTopBar();
  initProfileDropdown();
  initHeroSwipe();
  initAuthOverlayListeners ();
  initAuthController();
  // initMobileMenu();
  // initWeightSelector();
  initProductCard();
  initProductCardStock();
  initCartController();
  initCartShipping();
  initMiniCart();
  initAddToCartHandler();
  initPdpVariants();
  initPdpQuantity();
  initPdpStock();
  initPdpGallery();
  initProductTabs();
  initCheckout();
  initShopFilters();
  initSearchBar();
  initShippingToggle();
  initBackToTop();
  initThemeToggle();
  // 
  activateVariantFromQuery();

  // 4. Attach methods to window so inline HTML onclick handlers continue working
    Object.assign(window, {
        // Overlay Engine
        openAuthOverlay,
        closeAuthOverlay,
        switchRegisterType,
        showOrderSuccess,
        showOrderError,

        // Auth Actions
        handleSuccessStartShopping: authActions.handleSuccessStartShopping,
        handleSuccessDashboard: authActions.handleSuccessDashboard,
        handleSuccessRedirect: authActions.handleSuccessRedirect,
        handleSuccessLogout: authActions.handleSuccessLogout,
        handleOrderContinueShopping: authActions.handleOrderContinueShopping,
        handleOrderViewHistory: authActions.handleOrderViewHistory,
        handleOrderDownloadInvoice: authActions.handleOrderDownloadInvoice,
        handleOrderRetry: authActions.handleOrderRetry,
        handleOrderContactSupport: authActions.handleOrderContactSupport,
        handleOrderReturnToCart: authActions.handleOrderReturnToCart,

        // Auth Controller
        getAuthState,
        isWholesaleActive,
        setHeroView,
        updateAuthUI,
        handleLogout,
        showAuthView,

        // Attach cart methods to window for inline HTML triggers
        getCart,
        getCartCount,
        getCartTotal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getStockStatus,
        renderCartPage,

    });

    window.switchHeroTab = switchHeroTab;

    window.renderCheckoutSummary = renderCheckoutSummary;

});
