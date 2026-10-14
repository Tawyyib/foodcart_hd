// ============================================
// BUYER TERMS
// ============================================
// Per-tier purchasing rules. Every consumer reads from here.
// Change a rule, every consumer follows.
// ============================================

export const BUYER_TERMS = {

  guest: {
    label: 'Guest',
    priceField: 'priceRetail',
    unit: 'bag',
    packSize: 1,
    moq: 0,
    allowsMOQ: false,
    allowedVisibility: ['all'],
  },

  retail: {
    label: 'Retail Account',
    priceField: 'priceDiscountedRetail',   // falls back to priceRetail if 0
    fallbackPriceField: 'priceRetail',
    unit: 'bag',
    packSize: 1,
    moq: 0,
    allowsMOQ: false,
    allowedVisibility: ['all', 'registered'],
  },

  wholesale: {
    label: 'Wholesale Account',
    priceField: 'priceWholesale',
    unit: 'pack',
    packSize: 'fromVariant',
    moq: 'fromVariant',
    allowsMOQ: true,
    allowedVisibility: ['all', 'registered', 'wholesale'],
  },
};