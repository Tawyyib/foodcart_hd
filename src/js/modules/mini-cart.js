// ============================================
// MINI CART — SLIDE-IN PANEL CONTROLLER
// ============================================
// Owns: panel open/close, render, item actions.
// Depends on: cart-controller.js API.
// ============================================

import {
    getCart,
    getCartCount,
    getCartTotal,
    removeFromCart,
    updateCartQuantity,
} from './cart-controller-v.1.2.2.js';

import { formatNaira } from '../utils/shipping-calculator-v.1.2.js';
import { isWholesaleActive } from './auth-controller.js';

const PANEL_ID = 'miniCart';
const TRIGGER_ID = 'miniCartTrigger';
const CLOSE_ID = 'miniCartClose';
const BACKDROP_ID = 'miniCartBackdrop';

let initialized = false;
let lastFocusedElement = null;

// --------------------------------------------
// HELPERS
// --------------------------------------------
function isWholesaleActiveSafe() {
    if (typeof isWholesaleActive === 'function') {
        return isWholesaleActive();
    }
    return localStorage.getItem('wholesaleMode') === 'true';
}

function getPanel() {
    return document.getElementById(PANEL_ID);
}

function getTrigger() {
    return document.getElementById(TRIGGER_ID);
}

function getBackdrop() {
    return document.getElementById(BACKDROP_ID);
}

// --------------------------------------------
// OPEN / CLOSE
// --------------------------------------------
function openPanel() {
    
    const panel = getPanel();
    const backdrop = getBackdrop();
    const trigger = getTrigger();
    if (!panel || !backdrop) return;

    // Remember what was focused so we can restore it later
    lastFocusedElement = document.activeElement;

    panel.classList.add('is-open');
    backdrop.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    trigger?.setAttribute('aria-expanded', 'true');

    document.body.classList.add('mini-cart-open');

    // Move focus into the panel for accessibility
    setTimeout(() => {
        document.getElementById(CLOSE_ID)?.focus();
    }, 50);

}

function closePanel() {
    const panel = getPanel();
    const backdrop = getBackdrop();
    const trigger = getTrigger();
    if (!panel || !backdrop) return;

    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    trigger?.setAttribute('aria-expanded', 'false');

    document.body.classList.remove('mini-cart-open');

    // Restore focus
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
    }
    lastFocusedElement = null;
}

function togglePanel() {
    
    const panel = getPanel();
    if (!panel) return;

    if (panel.classList.contains('is-open')) {
        closePanel();
    } else {
        openPanel();
    }
}

// --------------------------------------------
// RENDER
// --------------------------------------------
function renderPanel() {

    const listEl = document.getElementById('mini-cart-list');
    const subtotalEl = document.getElementById('mini-cart-subtotal');
    const footerTopEl = document.querySelector('#miniCart .mini-cart-footer__top');   // ← new

    if (!listEl) return;

    const items = getCart();
    const isWholesale = isWholesaleActiveSafe();

    // ---- Empty state ----
    if (items.length === 0) {
        listEl.innerHTML = `
            <div class="mini-cart-empty">
                <span class="mini-cart-empty__icon fas fa-cart-shopping" aria-hidden="true"></span>
                <h3 class="mini-cart-empty__title">Your cart is empty</h3>
                <p class="mini-cart-empty__desc">Add some products to get started.</p>
                <a href="catalogue.html" class="btn btn-green">Browse Catalogue</a>
            </div>`;
    } else {
        // ---- Items ----
        let html = '';
        items.forEach(item => {
            const price = isWholesale
                ? (item.wholesalePrice || item.retailPrice)
                : item.retailPrice;
            const itemTotal = price * item.quantity;

            const thumb = item.image
                ? `<img src="${item.image}" alt="${item.name}">`
                : '<span class="fas fa-wheat-awn" aria-hidden="true"></span>';

            html += `
                <div class="mini-cart-item" data-sku="${item.sku}">

                    <div class="mini-cart-item__thumb">${thumb}</div>

                    <div class="mini-cart-item__content">

                        <div class="mini-cart-item__header">

                            <div class="mini-cart-item__name">${item.name}</div>
                                    
                            <button
                                type="button"
                                class="mini-cart-item__remove"
                                data-action="mini-remove"
                                data-sku="${item.sku}"
                                aria-label="Remove ${item.name}"
                            >
                                <span class="fas fa-xmark" aria-hidden="true"></span>
                            </button>

                        </div>

                        <div class="mini-cart-item__footer">

                            <div class="mini-cart-qty">

                                <button
                                    type="button"
                                    class="mini-cart-qty__btn"
                                    data-action="mini-decrease"
                                    data-sku="${item.sku}"
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </button>

                                    <span class="mini-cart-qty__value">${item.quantity}</span>

                                <button
                                    type="button"
                                    class="mini-cart-qty__btn"
                                    data-action="mini-increase"
                                    data-sku="${item.sku}"
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>

                            </div>
                                
                            <div class="mini-cart-item__costing">
                                
                                <div class="mini-cart-item__meta">
                                    ${formatNaira(price)} / ea
                                </div>
                            
                                <div class="mini-cart-item__price">
                                    ${formatNaira(itemTotal)}
                                </div>

                            </div>
                           
                        </div>

                    </div>

                </div>`;
        });
        listEl.innerHTML = html;
    }

    // ---- Subtotal ----
    if (subtotalEl) {
        subtotalEl.textContent = formatNaira(getCartTotal());
    }

    // ---- Footer Top visibility (hide when empty) ----    ← new block
    if (footerTopEl) {
        footerTopEl.hidden = items.length === 0;
    }

    // ---- Counts (badge + header) ----
    const count = getCartCount();
    document.querySelectorAll('[data-cart-count]').forEach(el => {
        el.textContent = count;
    });
    document.querySelectorAll('[data-cart-count-plural]').forEach(el => {
        el.textContent = count === 1 ? '' : 's';
    });
}

// --------------------------------------------
// EVENT WIRING
// --------------------------------------------
function wireEvents() {
    if (initialized) return;
    initialized = true;

    // 1. Trigger — toggle
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest(`#${TRIGGER_ID}`);
        if (!trigger) return;

        e.preventDefault();
        e.stopPropagation();
        togglePanel();
    });

    // 2. Close button
    document.addEventListener('click', (e) => {
        const closeBtn = e.target.closest(`#${CLOSE_ID}`);
        if (!closeBtn) return;

        e.preventDefault();
        closePanel();
    });

    // 3. Backdrop click
    document.addEventListener('click', (e) => {
        const backdrop = e.target.closest(`#${BACKDROP_ID}`);
        if (!backdrop) return;

        closePanel();
    });

    // 4. ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const panel = getPanel();
        if (panel?.classList.contains('is-open')) {
            closePanel();
        }
    });

    // 5. Item actions (delegated)
    document.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('[data-action="mini-remove"]');
        const increaseBtn = e.target.closest('[data-action="mini-increase"]');
        const decreaseBtn = e.target.closest('[data-action="mini-decrease"]');

        if (removeBtn) {
            e.preventDefault();
            removeFromCart(removeBtn.dataset.sku);
            return;
        }

        if (increaseBtn) {
            e.preventDefault();
            const sku = increaseBtn.dataset.sku;
            const item = getCart().find(i => i.sku === sku);
            if (item) updateCartQuantity(sku, item.quantity + 1);
            return;
        }

        if (decreaseBtn) {
            e.preventDefault();
            const sku = decreaseBtn.dataset.sku;
            const item = getCart().find(i => i.sku === sku);
            if (item) updateCartQuantity(sku, item.quantity - 1);
        }
    });

    // 6. React to cart changes
    document.addEventListener('cartSubtotalChanged', renderPanel);
    document.addEventListener('wholesaleModeChanged', renderPanel);
}

// --------------------------------------------
// INIT
// --------------------------------------------
export function initMiniCart() {

    if (document.body.classList.contains('page-cart') ||
        document.body.classList.contains('woocommerce-cart')) {
        return;
    }

    // Wait for the panel to be injected into the DOM
    if (!document.getElementById(PANEL_ID)) {
        const observer = new MutationObserver(() => {
            if (document.getElementById(PANEL_ID)) {
                observer.disconnect();
                initMiniCart();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        return;
    }

    wireEvents();
    renderPanel();

    console.log('✅ Mini cart side panel ready.');
}
    