/**
 * SHARED SHIPPING CALCULATOR & BUSINESS RULES
 * --------------------------------------------
 * Single source of truth for:
 *   - LGA base fees
 *   - Method multipliers
 *   - Promo/discount rates
 *   - Free delivery threshold
 *   - Fee computation
 *   - Currency formatting
 */

// ============================================
// BUSINESS RULES
// ============================================
export const DISCOUNT_THRESHOLD = 150000;

export const LGA_FEES = {
    ikeja: 1500,
    surulere: 1500,
    'eti_osa': 2500,
    'eti-osa': 2500,
    'lagos_mainland': 1750,
    'lagos-mainland': 1750,
    apapa: 2250,
    alimosho: 2700,
    agege: 1750,
    default: 1500,
};

export const METHOD_MULTIPLIERS = {
    express: 1.65,
    standard: 1.0,
    pickup: 0.0,
};

export const METHOD_LABELS = {
    express:  { icon: 'fa-rocket', label: 'Express',     desc: 'Same-Day Delivery' },
    standard: { icon: 'fa-truck',  label: 'Standard',    desc: '3–5 Business Days' },
    pickup:   { icon: 'fa-store',  label: 'Self Pickup', desc: '0–2 Business days' },
};

// ============================================
// PROMO CONFIGURATION
// ============================================
// Values between 0.00 (0% off) and 1.00 (100% off).
export const PROMO_CONFIG = {
    active: true,
    discounts: {
        express: 0.45,
        standard: 1.00,
        pickup: 0.00,
    },
};

// ============================================
// HELPERS
// ============================================
/**
 * Returns the discount rate (0–1) for a given method.
 * Never exceeds 1.0 and never goes below 0.
 */
export function getDiscountRate(methodKey) {

    if (! PROMO_CONFIG.active) return 0;

    const norm = (methodKey || 'express').toLowerCase();
    const rate = PROMO_CONFIG.discounts[norm] ?? 0;
    return Math.min(Math.max(rate, 0), 1);

}

/**
 * Returns the base fee (before discounts, before free threshold).
 * Null if the inputs are incomplete.
 */
export function calculateBaseFee(lgaKey, methodKey) {

    if (!lgaKey || !methodKey) return null;

    const lga = lgaKey.toLowerCase().replace(/_/g, '-');
    const method = methodKey.toLowerCase();

    const base = LGA_FEES[lga] ?? LGA_FEES.default;
    const multiplier = METHOD_MULTIPLIERS[method] ?? 1.0;

    return Math.round(base * multiplier);

}

/**
 * Returns the final delivery fee after:
 *   - Free delivery threshold (standard only)
 *   - Pickup override
 *   - Discount application
 *
 * Returns null if the inputs are incomplete.
 */
export function calculateDeliveryFee(lgaKey, methodKey = '', subtotal = 0) {

    if (!lgaKey || !methodKey) return null;

    const method = methodKey.toLowerCase();

    // 1. Self-pickup is always free
    if (method === 'pickup') return 0;

    const baseFee = calculateBaseFee(lgaKey, method);
    if (baseFee === null) return null;

    const discountRate = getDiscountRate(method);

    // 2. Apply delivery promotion once threshold is reached
    if (subtotal >= DISCOUNT_THRESHOLD && discountRate > 0) {
        const discountedFee = baseFee * (1 - discountRate);
        return Math.max(0, Math.round(discountedFee));
    }

    // 3. Below threshold or no active discount
    return baseFee;
}

/**
 * Formats a Naira amount with thousands separators.
 */
export function formatNaira(amount) {
    return '₦ ' + Math.round(amount || 0).toLocaleString('en-NG');
}