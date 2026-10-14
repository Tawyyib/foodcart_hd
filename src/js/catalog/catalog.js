// ============================================
// CATALOG LOOKUP
// ============================================
// Single entry point for reading product data.
// Backed by catalogue-data.js today.
// Will be backed by an API after WordPress migration.
// ============================================

import { CATALOGUE } from './catalogue-data.js';
import { BUYER_TERMS } from './buyer-terms.js';

// --------------------------------------------
// Product lookups
// --------------------------------------------
export function getProduct(baseSku) {
  if (!baseSku) return null;
  return CATALOGUE.find((p) => p.baseSku === baseSku) || null;
}

export function getAllProducts() {
  return CATALOGUE.slice();
}

// --------------------------------------------
// Variant lookups
// --------------------------------------------
export function getVariant(variantSku) {
  if (!variantSku) return null;
  for (const product of CATALOGUE) {
    const variant = (product.variants || []).find((v) => v.sku === variantSku);
    if (variant) return { product, variant };
  }
  return null;
}

export function getVariants(baseSku) {
  const product = getProduct(baseSku);
  return product && Array.isArray(product.variants) ? product.variants : [];
}

// --------------------------------------------
// Stock
// --------------------------------------------
export function getVariantStock(variantSku) {
  const found = getVariant(variantSku);
  return found ? found.variant.stock : null;
}

export function getProductStockState(baseSku) {
  const variants = getVariants(baseSku);
  if (variants.length === 0) return null;

  let available = 0;
  variants.forEach((v) => {
    if ((v.stock || 0) > 0) available++;
  });

  if (available === 0) return 'out-of-stock';
  if (available < variants.length) return 'limited-stock';
  return 'in-stock';
}

// --------------------------------------------
// Pricing by buyer tier
// --------------------------------------------
/**
 * Effective price for the current buyer tier.
 * @param {Object} variant
 * @param {string} tier  'guest' | 'retail' | 'wholesale'
 * @returns {number}
 */
export function getEffectivePrice(variant, tier) {
  if (!variant) return 0;

  const terms = BUYER_TERMS[tier] || BUYER_TERMS.guest;

  if (tier === 'wholesale') {
    return variant.priceWholesale || 0;
  }

  if (tier === 'retail') {
    return variant.priceDiscountedRetail > 0
      ? variant.priceDiscountedRetail
      : variant.priceRetail;
  }

  // guest
  return variant.priceRetail;
}

/**
 * Effective unit price for a whole pack (wholesale).
 * Returns the per-bag price; the caller multiplies by packSize if needed.
 */
export function getPackPrice(variant, tier) {
  if (!variant) return 0;
  const perUnit = getEffectivePrice(variant, tier);
  return perUnit * (variant.packSize || 1);
}

// --------------------------------------------
// Visibility
// --------------------------------------------
const VISIBILITY_ORDER = { all: 0, registered: 1, wholesale: 2 };

export function isVariantVisible(variant, tier) {
  if (!variant) return false;
  const variantLevel = VISIBILITY_ORDER[variant.visibility] ?? 0;
  const tierLevel = {
    guest: 0,
    retail: 1,
    wholesale: 2,
  }[tier] ?? 0;
  return tierLevel >= variantLevel;
}

export function getVisibleVariants(baseSku, tier) {
  return getVariants(baseSku).filter((v) => isVariantVisible(v, tier));
}