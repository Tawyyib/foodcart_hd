/**
 * CART CONTROLLER MODULE
 * Owns: cart state, persistence, totals, badge, cart page render.
 * Does NOT own: mini-cart DOM (that belongs to mini-cart.js).
 * Manages: cart state, persistence, and dynamic total calculation.
 */

import { isWholesaleActive } from './auth-controller.js';

import {
    calculateDeliveryFee,
    formatNaira,
    DISCOUNT_THRESHOLD,
} from '../utils/shipping-calculator-v.1.2.js';

const STORAGE_KEY_CART = 'foodcart_cart';
const STORAGE_KEY_SHIPPING = 'foodcart_shipping';

let cart = [];

// --------------------------------------------
// HELPERS
// --------------------------------------------
function isWholesaleActiveSafe() {
    if (typeof isWholesaleActive === 'function') {
        return isWholesaleActive();
    }
    return localStorage.getItem('wholesaleMode') === 'true';
}

function getStoredShipping() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_SHIPPING) || '{}');
    } catch {
        return {};
    }
}

// --------------------------------------------
// STORAGE
// --------------------------------------------
export function loadCart() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_CART);
        cart = stored ? JSON.parse(stored) : [];
    } catch (e) {
        cart = [];
    }
}

export function saveCart() {
    try {
        localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
    } catch (e) {
        console.error('Failed to save cart:', e);
    }

    updateCartBadge();
    renderCartPage();

    if (typeof window.renderCheckoutSummary === 'function') {
        window.renderCheckoutSummary();
    }

    // Notify the rest of the app that cart state changed.
    // mini-cart.js listens for this and re-renders itself.
    document.dispatchEvent(new CustomEvent('cartSubtotalChanged'));
}

// --------------------------------------------
// API METHODS
// --------------------------------------------
export function getCart() {
    loadCart();
    return cart;
}

export function getCartCount() {
    loadCart();
    return cart.reduce(
        (total, item) => total + (parseInt(item.quantity, 10) || 0),
        0
    );
}

export function getCartTotal() {
    loadCart();
    const isWholesale = isWholesaleActiveSafe();
    return cart.reduce((total, item) => {
        const price = isWholesale
            ? item.wholesalePrice || item.retailPrice
            : item.retailPrice;
        return total + price * item.quantity;
    }, 0);
}

export function addToCart(sku, name, retailPrice, wholesalePrice, quantity, image) {
    quantity = parseInt(quantity, 10) || 1;
    loadCart();
    const existing = cart.find(i => i.sku === sku);

    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({
            sku,
            name,
            retailPrice: parseFloat(retailPrice) || 0,
            wholesalePrice: parseFloat(wholesalePrice || retailPrice) || 0,
            quantity,
            image: image || '',
        });
    }

    saveCart();
}

export function removeFromCart(sku) {
    loadCart();
    cart = cart.filter(i => i.sku !== sku);
    saveCart();
}

export function updateCartQuantity(sku, quantity) {
    loadCart();
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
        removeFromCart(sku);
        return;
    }

    const item = cart.find(i => i.sku === sku);
    if (item) {
        item.quantity = qty;
        saveCart();
    }
}

export function clearCart() {
    cart = [];
    localStorage.removeItem(STORAGE_KEY_SHIPPING);
    saveCart();
}

export function getStockStatus() {
    return { stock: 999, status: 'in-stock' };
}

// --------------------------------------------
// UI: BADGE
// --------------------------------------------
export function updateCartBadge() {
    const count = getCartCount();
    const badges = document.querySelectorAll('.cart-count');
    if (!badges.length) return;

    const isWholesale = isWholesaleActiveSafe();
    badges.forEach(badge => {
        badge.textContent = count;
        badge.classList.toggle('bg-green', isWholesale);
        badge.classList.toggle('bg-amber', !isWholesale);
    });
}

// --------------------------------------------
// UI: TOTALS & SUMMARY CALCULATOR
// --------------------------------------------
/**
 * Single source of truth for subtotal and dynamic grand total updates.
 */
export function updateCartTotals(passedSubtotal = null) {
    const subtotal = (typeof passedSubtotal === 'number' && !isNaN(passedSubtotal))
        ? passedSubtotal
        : getCartTotal();

    const subtotalEl = document.getElementById('cart-subtotal-display');
    const totalEl = document.getElementById('cart-total-display');

    if (subtotalEl) {
        subtotalEl.textContent = formatNaira(subtotal);
    }

    const stored = getStoredShipping();
    const deliveryFee = calculateDeliveryFee(stored.lga, stored.method, subtotal) ?? 0;
    const grandTotal = subtotal + deliveryFee;

    if (totalEl) {
        totalEl.textContent = formatNaira(grandTotal);
    }

    document.dispatchEvent(new CustomEvent('cartSubtotalChanged', {
        detail: { subtotal, grandTotal, deliveryFee }
    }));
}

window.updateCartTotals = updateCartTotals;

// --------------------------------------------
// UI: CART PAGE
// --------------------------------------------
export function renderCartPage() {
    const tableBody =
        document.getElementById('cart-items-list') ||
        document.getElementById('cart-items');
    if (!tableBody) return;

    const isWholesale = isWholesaleActiveSafe();
    const items = getCart();
    const subtotal = getCartTotal();

    // ---- Render items ----
    if (items.length === 0) {
        tableBody.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-inner">
                    <span class="empty-cart-icon fa-solid fa-cart-shopping" role="img" aria-label="Empty Cart"></span>
                    <h3 class="empty-cart-title">Cart is Empty</h3>
                    <p class="empty-cart-desc">You have not added any item yet.</p>
                    <a href="catalogue.html" class="btn btn-green btn-cart">Browse Catalogue</a>
                </div>
            </div>`;
    } else {
        let html = '';
        items.forEach(item => {
            const price = isWholesale
                ? item.wholesalePrice || item.retailPrice
                : item.retailPrice;
            const itemSubtotal = price * item.quantity;
            const itemImage = item.image
                ? `<img src="${item.image}" alt="${item.name}">`
                : '<span class="fa-solid fa-wheat-awn"></span>';

            html += `
                <div class="cart-card">
                    <div class="card-thumb">
                        <div class="thumb-placeholder">${itemImage}</div>
                    </div>
                    <div class="card-content">
                        <div class="card-header">
                            <h3 class="item-title">${item.name}</h3>
                            <button
                                type="button"
                                class="btn-remove"
                                aria-label="Remove item"
                                onclick="window.removeFromCart('${item.sku}')"
                            >
                                <span class="fas fa-xmark"></span>
                            </button>
                        </div>

                        <div class="card-footer">
                            <div class="qty-stepper">
                                <button
                                    type="button"
                                    class="step-btn"
                                    onclick="window.updateCartQuantity('${item.sku}', ${item.quantity - 1})"
                                >−</button>
                                <input
                                    type="number"
                                    class="qty-field"
                                    value="${item.quantity}"
                                    min="1"
                                    aria-label="Quantity"
                                    onchange="window.updateCartQuantity('${item.sku}', parseInt(this.value, 10))"
                                />
                                <button
                                    type="button"
                                    class="step-btn"
                                    onclick="window.updateCartQuantity('${item.sku}', ${item.quantity + 1})"
                                >+</button>
                            </div>

                            <div class="item-price-block">
                                <span class="unit-price">${formatNaira(price)} / ea</span>
                                <span class="subtotal-price">${formatNaira(itemSubtotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
        tableBody.innerHTML = html;
    }

    // ---- Free-shipping progress ----
    const progressEl = document.getElementById('free-shipping-container');
    if (progressEl) {
        if (subtotal >= DISCOUNT_THRESHOLD && items.length > 0) {
            progressEl.innerHTML = `
                <p>
                    <i class="fa-solid fa-medal shipping-progress-icon" aria-hidden="true"></i>
                    <span> 
                        <strong>Congratulations!</strong> 
                        You qualify for <strong>Shipping Cost Discounts</strong> within Lagos.
                    </span>
                </p>
                <div class="progress-track"><div class="progress-fill" style="width:100%;"></div></div>`;
        } else {
            const amountLeft = DISCOUNT_THRESHOLD - subtotal;
            const percentage = Math.min(
                Math.round((subtotal / DISCOUNT_THRESHOLD) * 100),
                100
            );
            progressEl.innerHTML = `
                <p>Add <strong>${formatNaira(amountLeft)}</strong> more to qualify for <strong>Shipping Costs Discounts</strong> within Lagos.</p>
                <div class="progress-track"><div class="progress-fill" style="width:${percentage}%;"></div></div>`;
        }
    }

    // ---- Delegate Shipping Fee & Grand Total Updates ----
    if (typeof window.refreshShippingTotals === 'function') {
        window.refreshShippingTotals(subtotal);
    } else {
        updateCartTotals(subtotal);
    }
}

window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;

// --------------------------------------------
// INIT
// --------------------------------------------
export function initCartController() {
    document.addEventListener('wholesaleModeChanged', function () {
        updateCartBadge();
        renderCartPage();

        if (typeof window.renderCheckoutSummary === 'function') {
            window.renderCheckoutSummary();
        }
    });

    loadCart();
    updateCartBadge();
    renderCartPage();
}