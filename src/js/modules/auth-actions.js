/**
 * AUTH & ORDER ACTION HANDLERS MODULE
 */

import { closeAuthOverlay } from './auth-overlay.js';

export function handleSuccessStartShopping() {
    closeAuthOverlay();
    window.location.href = 'shop.html';
}

export function handleSuccessDashboard() {
    closeAuthOverlay();
    alert('📊 Dashboard page coming soon!');
    window.location.href = 'index.html';
}

export function handleSuccessRedirect() {
    closeAuthOverlay();
}

export function handleSuccessLogout() {
    closeAuthOverlay();
    if (typeof window.handleLogout === 'function') {
        window.handleLogout();
    }
    window.location.href = 'index.html';
}

export function handleOrderContinueShopping() {
    closeAuthOverlay();
    window.location.href = 'shop.html';
}

export function handleOrderViewHistory() {
    closeAuthOverlay();
    alert('📊 Orders page coming soon!');
    window.location.href = 'index.html';
}

export function handleOrderDownloadInvoice() {
    alert('📄 Invoice download coming soon!');
}

export function handleOrderRetry() {
    closeAuthOverlay();
    window.location.href = 'checkout.html';
}

export function handleOrderContactSupport() {
    alert('📞 Support: support@foodcart.com | +234 800 123 4567');
}

export function handleOrderReturnToCart() {
    closeAuthOverlay();
    window.location.href = 'cart.html';
}