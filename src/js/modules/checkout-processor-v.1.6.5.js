/**
 * CHECKOUT PROCESSOR MODULE
 * --------------------------------------------
 * Owns: checkout page summary rendering, shipping trigger meta,
 *       LGA/method sync, order submission logic.
 *
 * Storage contract:
 *   - Reads/writes `foodcart_shipping` — same key the cart uses.
 *   - Payload shape: { lga, suburb, method, fee, updatedAt }
 *   - Never writes partial payloads.
 *   - Removes the key when the selection is incomplete.
 * --------------------------------------------
 */

import { setElementsState } from '../utils/dom.js';

import {
    calculateDeliveryFee,
    calculateBaseFee,
    formatNaira,
    METHOD_LABELS,
    getDiscountRate,
    DISCOUNT_THRESHOLD,
} from '../utils/shipping-calculator-v.1.2.js';

const STORAGE_KEY_CART = 'foodcart_cart';
const SHIPPING_KEY = 'foodcart_shipping';

// --------------------------------------------
// STATE & HELPERS
// --------------------------------------------

export function isWholesaleActive() {
    if (typeof window.isWholesaleActive === 'function') {
        return window.isWholesaleActive();
    }
    return localStorage.getItem('wholesaleMode') === 'true';
}

export function getCheckoutCartItems() {

    if (typeof window.getCart === 'function') {
        return window.getCart();
    }
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_CART)) || [];
    } catch {
        return [];
    }

}

export function calculateSubtotal(items = getCheckoutCartItems()) {

    const isWholesale = isWholesaleActive();
    return items.reduce((sum, item) => {

        const price = isWholesale
            ? item.wholesalePrice || item.retailPrice
            : item.retailPrice;
        return sum + price * item.quantity;

    }, 0);

}

function getActiveLgaSelect() {

    const shipDifferent = document.getElementById('ship-to-different');
    const billingLga = document.getElementById('billing-lga');
    const shippingLga = document.getElementById('shipping-lga');

    if (shipDifferent?.checked && shippingLga) return shippingLga;
    return billingLga;

}

function getStoredShipping() {

    try {

        return JSON.parse(localStorage.getItem(SHIPPING_KEY) || 'null') || {};

    } catch {

        return {};

    }

}

/**
 * Is the stored shipping payload complete and valid?
 */
function hasValidStoredShipping(stored = getStoredShipping()) {
    return Boolean(stored?.lga && stored?.suburb && stored?.method);
}

// --------------------------------------------
// SHIPPING PERSISTENCE (merge, never overwrite)
// --------------------------------------------
function persistShippingChoice() {
    const speedSelect = document.getElementById('shipping-method');
    const lgaSelect = getActiveLgaSelect();
    const suburbField =
        document.getElementById('billing-suburb') ||
        document.getElementById('shipping-suburb');

    const method = speedSelect?.value || '';
    const lga = lgaSelect?.value || '';
    const suburb = suburbField?.value.trim() || '';
    const subtotal = calculateSubtotal();

    // Incomplete — clear the key, don't write partial data
    if (!method || !lga || !suburb) {
        localStorage.removeItem(SHIPPING_KEY);
        return;
    }

    const fee = calculateDeliveryFee(lga, method, subtotal);

    const payload = {
        lga,
        suburb,
        method,
        fee: fee === null ? null : fee,
        updatedAt: Date.now(),
    };

    try {
        localStorage.setItem(SHIPPING_KEY, JSON.stringify(payload));
    } catch (e) {
        console.warn('Could not persist shipping selection:', e);
    }
}

// --------------------------------------------
// HYDRATE CHECKOUT FORM FROM STORAGE
// --------------------------------------------
function syncStoredShippingToCheckoutForm() {

    const stored = getStoredShipping();

    // Only hydrate when the cart's payload is complete
    if (!hasValidStoredShipping(stored)) return;

    const billingLga = document.getElementById('billing-lga');
    const billingSuburb = document.getElementById('billing-suburb');
    const shippingLga = document.getElementById('shipping-lga');
    const shippingSuburb = document.getElementById('shipping-suburb');
    const shippingMethod = document.getElementById('shipping-method');
    const shipDifferent = document.getElementById('ship-to-different');

    // Always prefill the method
    if (shippingMethod) shippingMethod.value = stored.method;

    // Prefill billing LGA by default
    if (billingLga) billingLga.value = stored.lga;
    if (billingSuburb) billingSuburb.value = stored.suburb || '';

    // Only prefill shipping LGA if the user has indicated a different shipping address
    if (shipDifferent?.checked) {
        if (shippingLga) shippingLga.value = stored.lga;
        if (shippingSuburb) shippingSuburb.value = stored.suburb || '';
    }

}

// --------------------------------------------
// FEE DISPLAY FORMATTER (shared)
// --------------------------------------------
/**
 * Build the HTML/string for a fee display.
 * Returns null when the fee is unknown (caller decides fallback).
 */
function formatFeeDisplay(fee, baseFee, method) {
    if (fee === null || fee === undefined) {
        return { html: '--', className: 'is-pending' };
    }

    if (method === 'pickup') {
        return { html: formatNaira(0), className: 'is-pickup' };
    }

    const isFree = fee === 0;
    const isDiscounted = baseFee !== null && baseFee > fee;

    if (isFree) {
        if (baseFee !== null && baseFee > 0) {
            return {
                html: `<span class="fee-was">${formatNaira(baseFee)}</span><span class="fee-now">FREE</span>`,
                className: 'is-free',
            };
        }
        return { html: 'FREE', className: 'is-free' };
    }

    if (isDiscounted) {
        return {
            html: `<span class="fee-was">${formatNaira(baseFee)}</span><span class="fee-now">${formatNaira(fee)}</span>`,
            className: 'is-discounted',
        };
    }

    return { html: formatNaira(fee), className: 'is-standard' };
}

// --------------------------------------------
// DELIVERY TRIGGER SYNC
// --------------------------------------------
function syncDeliveryTrigger() {

    const select = document.getElementById('shipping-method');
    if (!select) return;

    const trigger = select.parentElement?.querySelector('.shipping-options');
    if (!trigger) return;

    const lgaSelect = getActiveLgaSelect();
    const items = getCheckoutCartItems();
    const subtotal = calculateSubtotal(items);

    const storedShipping = getStoredShipping();
    const methodValue = select.value || storedShipping.method || 'standard';
    const lgaValue = lgaSelect?.value || storedShipping.lga || '';

    const fee = calculateDeliveryFee(lgaValue, methodValue, subtotal);
    const baseFee = calculateBaseFee(lgaValue, methodValue);

    const meta = METHOD_LABELS[methodValue] || METHOD_LABELS.standard;

    // Icon
    const iconEl = trigger.querySelector('.option-icon span');
    if (iconEl) iconEl.className = `fa-solid ${meta.icon}`;

    // Label + desc
    const labelEl = trigger.querySelector('.option-label');
    if (labelEl) labelEl.textContent = meta.label;

    const descEl = trigger.querySelector('.option-desc');
    if (descEl) descEl.textContent = meta.desc;

    // Fee
    const feeEl = trigger.querySelector('.option-fee');
    if (feeEl) {

        feeEl.classList.remove('is-pending', 'is-free', 'is-discounted', 'is-standard', 'is-pickup');

        if (items.length === 0) {
            feeEl.textContent = '--';
            feeEl.classList.add('is-pending');
            return;
        }

        const { html, className } = formatFeeDisplay(fee, baseFee, methodValue);
        feeEl.innerHTML = html;
        feeEl.classList.add(className);

    }

}

// --------------------------------------------
// SUMMARY RENDERER
// --------------------------------------------
export function renderCheckoutSummary() {

    const summaryContainer =
        document.querySelector('.order-summary-inner') ||
        document.getElementById('checkout-order-summary-inner') ||
        document.querySelector('.checkout-summary-inner');

    if (!summaryContainer) return;

    const items = getCheckoutCartItems();
    const subtotal = calculateSubtotal(items);
    const isWholesale = isWholesaleActive();

    const summaryHead =
        document.getElementById('summaryHead') ||
        document.querySelector('.summary-title');
    const submitBtn =
        document.getElementById('order-btn') ||
        document.querySelector('#checkout-form button[type="submit"]');
    const paymentMode = document.getElementById('order-payment');
    const footNote =
        document.getElementById('footnote') ||
        document.querySelector('.footnote');

    const cartControls = [summaryHead, submitBtn, paymentMode, footNote].filter(Boolean);

    // ---- Empty cart ----
    if (items.length === 0) {

        summaryContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-inner">
                    <span class="empty-cart-icon fa-solid fa-cart-shopping" role="img" aria-label="Empty Cart"></span>
                    <h3 class="empty-cart-title">Cart is Empty</h3>
                    <p class="empty-cart-desc">You have not made any purchase.</p>
                    <a href="catalogue.html" class="btn btn-green btn-cart">Return to Shop</a>
                </div>
            </div>
        `;
        setElementsState(cartControls, false);
        return;

    }

    setElementsState(cartControls, true);

    const speedSelect = document.getElementById('shipping-method');
    const lgaSelect = getActiveLgaSelect();
    const storedShipping = getStoredShipping();

    const methodValue = speedSelect?.value || storedShipping.method || 'standard';
    const lgaValue = lgaSelect?.value || storedShipping.lga || '';

    const finalFee = calculateDeliveryFee(lgaValue, methodValue, subtotal);
    const baseFee = calculateBaseFee(lgaValue, methodValue);

    const grandTotal = subtotal + (finalFee === null ? 0 : finalFee);

    const isPickup = methodValue === 'pickup';

    // ---- Items ----
    let html = `<div class="order-items-list">`;
    items.forEach(item => {

        const price = isWholesale
            ? item.wholesalePrice || item.retailPrice
            : item.retailPrice;
        const itemTotal = price * item.quantity;
        html += `
            <div class="order-item">
                <div class="item-desc">
                    ${item.name} <span class="highlight">x ${item.quantity}</span>
                </div>
                <span class="item-cost">${formatNaira(itemTotal)}</span>
            </div>`;

    });
    html += `</div>`;

    // ---- Shipping block ----
    const selectedLgaText =
        lgaSelect?.value && lgaSelect.selectedIndex !== -1
            ? lgaSelect.options[lgaSelect.selectedIndex].text
            : 'Select LGA';

    const speedLabel = METHOD_LABELS[methodValue]?.label || 'Standard';
    const shippingLocationText = isPickup ? '' : ` (${selectedLgaText})`;

    const { html: feeHtml, className: feeClass } = formatFeeDisplay(
        finalFee,
        baseFee,
        methodValue
    );

    html += `<hr class="line-divider">`;
    html += `
        <div class="order-subtotal">
            <span>Subtotal</span>
            <span class="sub-total">${formatNaira(subtotal)}</span>
        </div>
        <div class="order-shipping">
            <span class="order-shipping-speed">Shipping – ${speedLabel}${shippingLocationText}</span>
            <span class="order-shipping-rate ${feeClass}">${feeHtml}</span>
        </div>`;
    html += `<hr class="line-divider">`;
    html += `
        <div class="order-total">
            <span>Total</span>
            <span class="total">${formatNaira(grandTotal)}</span>
        </div>`;

    summaryContainer.innerHTML = html;
    syncDeliveryTrigger();

}
window.renderCheckoutSummary = renderCheckoutSummary;

// ============================================
// CHECKOUT SUBMISSION
// ============================================
/**
 * Validates the checkout form, builds the order payload,
 * clears the cart, and triggers the success overlay.
 *
 * Bound to `#checkout-form` submit event in initCheckout().
 */
function handleCheckoutSubmit(e) {

    e.preventDefault();

    const form = e.currentTarget;

    // ---- 1. Empty cart guard ----
    const items = getCheckoutCartItems();
    if (items.length === 0) {
        if (typeof window.showOrderError === 'function') {
            window.showOrderError('Your cart is empty. Please add items before proceeding.');
        } else {
            alert('Your cart is empty. Please add items before proceeding.');
        }
        return;
    }

    // ---- 2. Read the active shipping prefix ----
    const shipDifferent = document.getElementById('ship-to-different');
    const isShipDifferent = shipDifferent?.checked === true;
    const prefix = isShipDifferent ? 'shipping' : 'billing';

    const getValue = (id) => {
        const el = document.getElementById(id);
        return el ? (el.value || '').trim() : '';
    };

    const firstname = getValue(`${prefix}-firstname`);
    const lastname = getValue(`${prefix}-lastname`);
    const phone = getValue(`${prefix}-phone`);
    const email = getValue('billing-email'); // email is always from billing
    const address = getValue(`${prefix}-address`);
    const landmark = getValue(`${prefix}-suburb`);
    const lga = getValue(`${prefix}-lga`);
    const payment = getValue('payment-method') || 'card';

    // ---- 3. Validation ----
    const errors = [];

    if (!firstname || !lastname) errors.push('Full name is required.');

    if (!phone) {
        errors.push('Phone number is required.');
    } else if (!/^0[789][01]\d{8}$/.test(phone)) {
        errors.push('Phone must be a valid 11-digit Nigerian number (e.g., 08012345678).');
    }

    if (!email) {
        errors.push('Email address is required.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Please enter a valid email address.');
    }

    if (!address) errors.push('Delivery address is required.');
    if (!landmark) errors.push('Landmark / Suburb is required.');
    if (!lga) errors.push('Please select a Local Government Area (LGA).');

    if (errors.length > 0) {
        if (typeof window.showOrderError === 'function') {
            window.showOrderError(errors[0]);
        } else {
            alert(errors[0]);
        }
        return;
    }

    // ---- 4. Compute the totals ----
    const subtotal = calculateSubtotal(items);

    const speedSelect = document.getElementById('shipping-method');
    const methodValue = speedSelect?.value || 'standard';

    const deliveryFee = calculateDeliveryFee(lga, methodValue, subtotal);
    const grandTotal = subtotal + (deliveryFee === null ? 0 : deliveryFee);

    const methodLabel = METHOD_LABELS[methodValue]?.label || 'Standard';

    // ---- 5. Build order data ----
    const orderData = {
        orderNumber: '#ORD-' + Math.floor(100000 + Math.random() * 900000),
        total: formatNaira(grandTotal),
        subtotal: formatNaira(subtotal),
        deliveryFee: deliveryFee === null ? null : formatNaira(deliveryFee),
        delivery: `${lga} – ${methodLabel}${payment === 'cod' ? ' (Cash on Delivery)' : ' (Prepaid)'}`,
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        address,
        landmark,
        lga,
        method: methodValue,
        payment,
        items,
        eta: 'Today, 5:00 PM',
        placedAt: Date.now(),
    };

    // ---- 6. Loading state ----
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '⏳ Processing...';
    }

    // ---- 7. Simulate backend submission ----
    // Replace this setTimeout with a real fetch() call to your backend.
    setTimeout(() => {
        try {
            // Persist the order (mock)
            localStorage.setItem('foodcart_last_order', JSON.stringify(orderData));

            // Clear the cart + shipping
            if (typeof window.clearCart === 'function') {
                window.clearCart();
            } else {
                localStorage.removeItem('foodcart_cart');
                localStorage.removeItem('foodcart_shipping');
            }

            // Restore the button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalLabel || '🛒 Place Order';
            }

            // Trigger the success overlay
            if (typeof window.showOrderSuccess === 'function') {
                window.showOrderSuccess(orderData);
            } else if (typeof window.showSuccessOverlay === 'function') {
                window.showSuccessOverlay(orderData);
            } else {
                alert(`Order placed! Total: ${orderData.total}`);
            }

            // Re-render summary (now empty)
            if (typeof window.renderCheckoutSummary === 'function') {
                window.renderCheckoutSummary();
            }
        } catch (err) {
            console.error('Order submission failed:', err);

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalLabel || '🛒 Place Order';
            }

            if (typeof window.showOrderError === 'function') {
                window.showOrderError('Something went wrong. Please try again.');
            } else {
                alert('Something went wrong. Please try again.');
            }
        }
    }, 1000);

}

// --------------------------------------------
// INIT
// --------------------------------------------
export function initCheckout() {

    // Hydrate form from storage (only if complete)
    syncStoredShippingToCheckoutForm();

    // Initial render
    renderCheckoutSummary();
    syncDeliveryTrigger();

    const speedSelect = document.getElementById('shipping-method');
    const billingLga = document.getElementById('billing-lga');
    const shippingLga = document.getElementById('shipping-lga');
    const shipDifferent = document.getElementById('ship-to-different');
    const billingSuburb = document.getElementById('billing-suburb');
    const shippingSuburb = document.getElementById('shipping-suburb');

    const handleShippingChange = () => {
        persistShippingChoice();
        syncDeliveryTrigger();
        renderCheckoutSummary();
    };

    // ---- Change events ----
    speedSelect?.addEventListener('change', handleShippingChange);
    billingLga?.addEventListener('change', handleShippingChange);
    shippingLga?.addEventListener('change', handleShippingChange);
    shipDifferent?.addEventListener('change', handleShippingChange);

    // ---- Suburb inputs ----
    billingSuburb?.addEventListener('input', handleShippingChange);
    shippingSuburb?.addEventListener('input', handleShippingChange);

    // ---- Chevron rotation ----
    document.addEventListener('focusin', (e) => {
        const select = e.target.closest('#shipping-method, #payment-method');
        if (!select) return;
        select
            .closest('.shipping-selector, .payment-selector')
            ?.classList.add('is-open');
    });

    document.addEventListener('focusout', (e) => {
        const select = e.target.closest('#shipping-method, #payment-method');
        if (!select) return;
        select
            .closest('.shipping-selector, .payment-selector')
            ?.classList.remove('is-open');
    });

    // ---- Cross-module sync ----
    document.addEventListener('cartSubtotalChanged', () => {
        renderCheckoutSummary();
    });

    document.addEventListener('wholesaleModeChanged', () => {
        renderCheckoutSummary();
        syncDeliveryTrigger();
    });

    // ---- Form submission ----
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    } else {
        console.warn('⚠️ #checkout-form not found — submission handler not attached.');
    }

    console.log('✅ Checkout processor ready.');
    
}