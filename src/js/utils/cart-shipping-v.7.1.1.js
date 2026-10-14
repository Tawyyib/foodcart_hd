// ============================================
// CART SHIPPING CONTROLLER — Live-Save Model V.7.1.1.
// ============================================
// Owns: destination, method, shipping fee, grand total.
// Reacts to: cartSubtotalChanged (from cart-controller).
// Uses: shipping-calculator-v.1.2.js for all fee math.
//
// Model:
//   - Live-save: every input writes to localStorage.
//   - Trigger label: 3 states (initial / editing / committed).
//   - Button inside form: "Clear" (resets everything).
//   - Validation: LGA + Suburb + Method all required.
//
// FIX (this version):
//   - Input handlers now call refreshShippingTotals() instead of
//     updateFeeDisplay(). This ensures the grand total in the cart
//     updates live — not just the fee — without needing a page refresh.
// ============================================

import {
    calculateDeliveryFee,
    calculateBaseFee,
    formatNaira,
    METHOD_LABELS,
    getDiscountRate,
} from '../utils/shipping-calculator-v.1.2.js';

const STORAGE_KEY = 'foodcart_shipping';
const ROOT_SELECTOR = '.cart-shipping-group';

// --------------------------------------------
// MODULE STATE
// --------------------------------------------
let isEditing = false;
let eventsWired = false;
let currentSubtotal = 0;

// --------------------------------------------
// HELPERS
// --------------------------------------------
function els() {
    const root = document.querySelector(ROOT_SELECTOR);
    if (!root) return {};

    return {
        root,
        trigger:       root.querySelector('#pick-destination'),
        destination:   root.querySelector('#cart-shipping-destination'),
        form:          root.querySelector('#shipToForm'),
        lga:           root.querySelector('#cart-shipping-lga'),
        suburb:        root.querySelector('#cart-shipping-suburb'),
        method:        root.querySelector('#cart-shipping-method'),
        methodTrigger: root.querySelector('.shipping-options'),
        feeDisplay:    root.querySelector('#delivery-fee-display'),
        clearBtn:      root.querySelector('[data-action="clear-shipping"]'),
    };
}

/**
 * Read the LGA + Suburb + Method values.
 */
function readValues() {
    const { lga, suburb, method } = els();
    return {
        lga: lga?.value || '',
        suburb: suburb?.value.trim() || '',
        method: method?.value || '',
    };
}

/**
 * Are all three fields set?
 */
function hasValidSelection() {
    const { lga, suburb, method } = readValues();
    return Boolean(lga && suburb && method);
}

/**
 * Are any fields set?
 */
function hasAnyValue() {
    const { lga, suburb, method } = readValues();
    return Boolean(lga || suburb || method);
}

// --------------------------------------------
// FEE DISPLAY
// --------------------------------------------
function updateFeeDisplay() {
    const { feeDisplay, lga, method } = els();
    if (!feeDisplay) return;

    const methodValue = method?.value || '';
    const valid = hasValidSelection();

    // Invalid or incomplete → show pending
    if (!valid || !methodValue) {
        const value = 'pending';
        if (feeDisplay.dataset.value === value) return;

        feeDisplay.textContent = '--';
        feeDisplay.classList.add('is-pending');
        feeDisplay.dataset.value = value;
        return;
    }

    const fee = calculateDeliveryFee(lga.value, methodValue, currentSubtotal);
    const base = calculateBaseFee(lga.value, methodValue);

    // Calculator returned null → show pending
    if (fee === null) {
        const value = 'pending';
        if (feeDisplay.dataset.value === value) return;

        feeDisplay.textContent = '--';
        feeDisplay.classList.add('is-pending');
        feeDisplay.dataset.value = value;
        return;
    }

    // Skip if nothing changed
    const value = String(fee);
    if (feeDisplay.dataset.value === value) return;

    feeDisplay.classList.remove('is-pending');

    const discountRate = getDiscountRate(methodValue);
    const isPickup = methodValue === 'pickup';
    const is100PercentPromo = discountRate >= 1.0;

    // Pickup → ₦0 (neutral)
    if (isPickup) {
        feeDisplay.textContent = formatNaira(0);
        feeDisplay.dataset.value = '0';
        return;
    }

    // 100% promo at/above threshold → FREE
    if (is100PercentPromo && fee === 0) {
        if (base !== null && base > 0) {
            feeDisplay.innerHTML = `
                <span class="fee-was">${formatNaira(base)}</span>
                <span class="fee-now">FREE</span>`;
        } else {
            feeDisplay.textContent = 'FREE';
        }
        feeDisplay.dataset.value = '0';
        return;
    }

    // Partial discount → struck-through base + discounted
    if (base !== null && base > fee) {
        feeDisplay.innerHTML = `
            <span class="fee-was">${formatNaira(base)}</span>
            <span class="fee-now">${formatNaira(fee)}</span>`;
        feeDisplay.dataset.value = value;
        return;
    }

    // Standard fee
    feeDisplay.textContent = formatNaira(fee);
    feeDisplay.dataset.value = value;
}

// --------------------------------------------
// TRIGGER LABEL
// --------------------------------------------
function syncTriggerLabel() {

    const { trigger } = els();
    if (!trigger) return;

    if (isEditing) {
        trigger.textContent = 'Done';
        trigger.setAttribute('aria-expanded', 'true');
        return;
    }

    if (hasValidSelection()) {
        trigger.textContent = 'Change';
    } else {
        trigger.textContent = 'Select a Destination';
    }

    trigger.setAttribute('aria-expanded', 'false');

}

// --------------------------------------------
// DESTINATION SUMMARY
// --------------------------------------------
function syncDestinationSummary() {

    const { destination } = els();
    if (!destination) return;

    const { lga, suburb } = readValues();
    const lgaSelect = document.getElementById('cart-shipping-lga');
    const lgaText = lga && lgaSelect?.selectedIndex >= 0
        ? lgaSelect.options[lgaSelect.selectedIndex].text
        : '';

    // Partial summary — show whatever we have
    if (suburb && lgaText) {
        destination.textContent = `${suburb}, ${lgaText}`;
        destination.classList.remove('is-hidden');
    } else if (lgaText) {
        destination.textContent = lgaText;
        destination.classList.remove('is-hidden');
    } else if (suburb) {
        destination.textContent = suburb;
        destination.classList.remove('is-hidden');
    } else {
        destination.textContent = '';
        destination.classList.add('is-hidden');
    }

}

// --------------------------------------------
// METHOD TRIGGER SYNC
// --------------------------------------------
function syncMethodTrigger() {

    const { method, methodTrigger } = els();
    if (!method || !methodTrigger) return;

    const iconEl  = methodTrigger.querySelector('.option-icon span');
    const labelEl = methodTrigger.querySelector('.option-label');
    const descEl  = methodTrigger.querySelector('.option-desc');

    const value = method.value;

    // No method selected — show placeholder
    if (!value) {
        if (iconEl)  iconEl.className = 'fa-solid fa-truck';
        if (labelEl) labelEl.textContent = 'Select Shipping Speed';
        if (descEl)  descEl.textContent = 'Choose how fast you need it';
        return;
    }

    const data = METHOD_LABELS[value] || METHOD_LABELS.standard;

    if (iconEl)  iconEl.className = `fa-solid ${data.icon}`;
    if (labelEl) labelEl.textContent = data.label;
    if (descEl)  descEl.textContent = data.desc;
    
}

// --------------------------------------------
// FORM VISIBILITY
// --------------------------------------------
function openForm() {
    const { form } = els();
    if (!form) return;

    form.hidden = false;
    isEditing = true;
    syncTriggerLabel();
}

function closeForm() {

    const { form } = els();
    if (!form) return;

    form.hidden = true;
    isEditing = false;
    syncTriggerLabel();

}

// --------------------------------------------
// CLEAR BUTTON VISIBILITY
// --------------------------------------------
function syncClearButtonVisibility() {

    const { clearBtn } = els();
    if (!clearBtn) return;

    if (hasAnyValue()) {
        clearBtn.classList.remove('is-hidden');
    } else {
        clearBtn.classList.add('is-hidden');
    }

}

// --------------------------------------------
// CLEAR
// --------------------------------------------
function clearSelection() {

    const { lga, suburb, method } = els();

    if (lga)    lga.value = '';
    if (suburb) suburb.value = '';
    if (method) method.value = '';

    localStorage.removeItem(STORAGE_KEY);

    syncMethodTrigger();
    syncDestinationSummary();
    syncTriggerLabel();
    syncClearButtonVisibility();

    // Live update fee AND total
    refreshShippingTotals();

    closeForm();

}

// --------------------------------------------
// PERSISTENCE
// --------------------------------------------
function persist() {
    const { lga, suburb, method } = els();

    // Persist only when all three are set
    if (!hasValidSelection()) {
        localStorage.removeItem(STORAGE_KEY);
        return;
    }

    const fee = calculateDeliveryFee(
        lga.value,
        method.value,
        currentSubtotal
    );

    const payload = {
        lga: lga.value,
        suburb: suburb.value.trim(),
        method: method.value,
        fee: fee === null ? null : fee,
        updatedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function restoreFromStorage() {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        const { lga, suburb, method } = els();

        if (stored) {
            if (lga && stored.lga)       lga.value = stored.lga;
            if (suburb && stored.suburb) suburb.value = stored.suburb;
            if (method && stored.method) method.value = stored.method;
        }

        syncMethodTrigger();
        syncDestinationSummary();
        syncClearButtonVisibility();
        updateFeeDisplay();
        syncTriggerLabel();

    } catch {

        // ignore corrupt data

    }

}

// --------------------------------------------
// PUBLIC API
// --------------------------------------------
/**
 * Recompute fee + total. Safe to call from any module, at any time.
 *
 * - Updates the fee display (this module)
 * - Delegates the grand total update to cart-controller via
 *   window.updateCartTotals()
 *
 * Called on:
 *   - Every input/change in the shipping form (via wireEvents)
 *   - Cart subtotal changes (via cartSubtotalChanged)
 *   - Clear button
 */
export function refreshShippingTotals(passedSubtotal = null) {

    if (typeof passedSubtotal === 'number' && !isNaN(passedSubtotal)) {
        currentSubtotal = passedSubtotal;
    }

    // Update the fee display in the shipping block
    updateFeeDisplay();

    // Update the trigger label
    syncTriggerLabel();

    syncClearButtonVisibility();

    // Delegate grand total computation to cart-controller
    if (typeof window.updateCartTotals === 'function') {
        window.updateCartTotals(currentSubtotal);
    }

}

// --------------------------------------------
// EVENT WIRING
// --------------------------------------------
function wireEvents() {
    if (eventsWired) return;
    eventsWired = true;

    // 1. Trigger — open/close
    document.addEventListener('click', (e) => {
        const toggle = e.target.closest('[data-action="toggle-ship-to"]');
        if (!toggle) return;

        e.preventDefault();

        if (isEditing) {
            closeForm();
        } else {
            openForm();
        }
    });

    // 2. Clear button
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action="clear-shipping"]');
        if (!btn) return;

        e.preventDefault();
        clearSelection();
    });

    // 3. Method trigger — open native select
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('.shipping-options');
        if (!trigger) return;

        e.preventDefault();

        const root = trigger.closest('.shipping-selector');
        const select = root?.querySelector('select');
        if (!select) return;

        if (typeof select.showPicker === 'function') {
            select.showPicker();
        } else {
            select.focus();
            select.click();
        }
    });

    // 4. Suburb input — live save + sync
    document.addEventListener('input', (e) => {
        if (e.target.id !== 'cart-shipping-suburb') return;

        syncDestinationSummary();
        persist();
        refreshShippingTotals();   // ← live fee + total
    });

    // 5. LGA + Method changes
    document.addEventListener('change', (e) => {
        if (e.target.id === 'cart-shipping-lga') {
            syncDestinationSummary();
            persist();
            refreshShippingTotals();   // ← live fee + total
        }

        if (e.target.id === 'cart-shipping-method') {
            syncMethodTrigger();
            persist();
            refreshShippingTotals();   // ← live fee + total
        }
    });

    // 6. React to cart subtotal changes
    document.addEventListener('cartSubtotalChanged', (e) => {
        const subtotal = e.detail?.subtotal ?? 0;
        currentSubtotal = subtotal;
        refreshShippingTotals(subtotal);
    });

    // 7. React to wholesale mode toggle
    document.addEventListener('wholesaleModeChanged', () => {
        refreshShippingTotals();
    });
    
}

// --------------------------------------------
// INIT
// --------------------------------------------
export function initCartShipping() {
    if (!document.querySelector(ROOT_SELECTOR)) {
        const observer = new MutationObserver(() => {
            if (document.querySelector(ROOT_SELECTOR)) {
                observer.disconnect();
                initCartShipping();
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        return;
    }

    wireEvents();
    restoreFromStorage();

    // Reset to closed state
    closeForm();

    // Expose API for cross-module calls
    window.refreshShippingTotals = refreshShippingTotals;

    console.log('✅ Cart shipping ready (live-save model).');
}