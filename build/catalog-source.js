// ============================================
// CATALOG SOURCE
// ============================================
// The single authoring point for all product data.
// build-catalogue.mjs reads this, validates it, merges keywords,
// and emits src/js/catalogue-data.js.
//
// Edit this file to change:
//   - pricing (retail, discounted-retail, wholesale)
//   - stock levels
//   - variants (sizes, SKUs, pack size, MOQ)
//   - visibility gating
//
// Prices in NGN. Stock in units (bags).
// MOQ values are illustrative placeholders — replace with real terms.
// ============================================

// Shared MOQ rule for retail variants, by size.
// Applied via spread when authoring each variant.
const MOQ_BY_SIZE = {
  '5kg':  { packSize: 10, moqPacks: 20 },
  '10kg': { packSize: 10, moqPacks: 10 },
  '25kg': { packSize: 1,  moqPacks: 20 },
  '50kg': { packSize: 1,  moqPacks: 10 },
};

export const CATALOG_SOURCE = [

  // ============================================
  // RICE
  // ============================================
  {
    baseSku: 'rice-001',
    name: 'Nutragold™ Parboiled Nigerian Rice',
    category: 'rice',
    url: 'rice.html',
    image: 'assets/images/nutragold-pr.webp',
    imageAlt: 'Nutragold Parboiled Nigerian Rice',
    variants: [
      { size: '5kg',  sku: 'rice-001-5kg',  weightKg: 5,  priceRetail: 7000,  priceDiscountedRetail: 0, priceWholesale: 6800,  stock: 200, visibility: 'all', ...MOQ_BY_SIZE['5kg'] },
      { size: '10kg', sku: 'rice-001-10kg', weightKg: 10, priceRetail: 13500, priceDiscountedRetail: 0, priceWholesale: 13000, stock: 140, visibility: 'all', ...MOQ_BY_SIZE['10kg'] },
      { size: '25kg', sku: 'rice-001-25kg', weightKg: 25, priceRetail: 30000, priceDiscountedRetail: 0, priceWholesale: 29000, stock: 80,  visibility: 'all', ...MOQ_BY_SIZE['25kg'] },
      { size: '50kg', sku: 'rice-001-50kg', weightKg: 50, priceRetail: 59000, priceDiscountedRetail: 0, priceWholesale: 57000, stock: 40,  visibility: 'all', ...MOQ_BY_SIZE['50kg'] },
    ],
  },

  // ============================================
  // GARRI — branded retail
  // ============================================
  {
    baseSku: 'garri-001',
    name: 'Nutragold™ White Garri - Premium',
    category: 'garri',
    url: 'garri-premium.html',
    image: 'assets/images/nutragold-pg.webp',
    imageAlt: 'Nutragold White Garri - Premium',
    variants: [
      { size: '5kg',  sku: 'garri-001-5kg',  weightKg: 5,  priceRetail: 8000,  priceDiscountedRetail: 0, priceWholesale: 7500,  stock: 250, visibility: 'all', ...MOQ_BY_SIZE['5kg'] },
      { size: '10kg', sku: 'garri-001-10kg', weightKg: 10, priceRetail: 15000, priceDiscountedRetail: 0, priceWholesale: 14000, stock: 180, visibility: 'all', ...MOQ_BY_SIZE['10kg'] },
      { size: '25kg', sku: 'garri-001-25kg', weightKg: 25, priceRetail: 35000, priceDiscountedRetail: 0, priceWholesale: 33500, stock: 120, visibility: 'all', ...MOQ_BY_SIZE['25kg'] },
    ],
  },
  {
    baseSku: 'garri-002',
    name: 'Nutragold™ White Garri - Standard',
    category: 'garri',
    url: 'garri-standard.html',
    image: 'assets/images/nutragold-sg.webp',
    imageAlt: 'Nutragold White Garri - Standard',
    variants: [
      { size: '5kg',  sku: 'garri-002-5kg',  weightKg: 5,  priceRetail: 6000,  priceDiscountedRetail: 0, priceWholesale: 5500,  stock: 300, visibility: 'all', ...MOQ_BY_SIZE['5kg'] },
      { size: '10kg', sku: 'garri-002-10kg', weightKg: 10, priceRetail: 12000, priceDiscountedRetail: 0, priceWholesale: 11000, stock: 220, visibility: 'all', ...MOQ_BY_SIZE['10kg'] },
      { size: '25kg', sku: 'garri-002-25kg', weightKg: 25, priceRetail: 19000, priceDiscountedRetail: 0, priceWholesale: 17500, stock: 150, visibility: 'all', ...MOQ_BY_SIZE['25kg'] },
    ],
  },

  // ============================================
  // BEANS — branded retail
  // ============================================
  {
    baseSku: 'beans-001',
    name: 'Nutragold™ Honey Beans',
    category: 'beans',
    url: 'beans-honey.html',
    image: 'assets/images/nutragold-hb.webp',
    imageAlt: 'Nutragold Honey Beans',
    variants: [
      { size: '5kg',  sku: 'beans-001-5kg',  weightKg: 5,  priceRetail: 13000, priceDiscountedRetail: 0, priceWholesale: 12500, stock: 200, visibility: 'all', ...MOQ_BY_SIZE['5kg'] },
      { size: '10kg', sku: 'beans-001-10kg', weightKg: 10, priceRetail: 24500, priceDiscountedRetail: 0, priceWholesale: 23000, stock: 140, visibility: 'all', ...MOQ_BY_SIZE['10kg'] },
      { size: '25kg', sku: 'beans-001-25kg', weightKg: 25, priceRetail: 59000, priceDiscountedRetail: 0, priceWholesale: 57500, stock: 80,  visibility: 'all', ...MOQ_BY_SIZE['25kg'] },
    ],
  },
  {
    baseSku: 'beans-002',
    name: 'Nutragold™ Brown Beans',
    category: 'beans',
    url: 'beans-brown.html',
    image: 'assets/images/nutragold-bb.webp',
    imageAlt: 'Nutragold Brown Beans',
    variants: [
      { size: '5kg',  sku: 'beans-002-5kg',  weightKg: 5,  priceRetail: 11000, priceDiscountedRetail: 0, priceWholesale: 10500, stock: 200, visibility: 'all', ...MOQ_BY_SIZE['5kg'] },
      { size: '10kg', sku: 'beans-002-10kg', weightKg: 10, priceRetail: 21000, priceDiscountedRetail: 0, priceWholesale: 20000, stock: 140, visibility: 'all', ...MOQ_BY_SIZE['10kg'] },
      { size: '25kg', sku: 'beans-002-25kg', weightKg: 25, priceRetail: 49000, priceDiscountedRetail: 0, priceWholesale: 47500, stock: 80,  visibility: 'all', ...MOQ_BY_SIZE['25kg'] },
    ],
  },

  // ============================================
  // BULK (plain bag, variable weight)
  // ============================================
  {
    baseSku: 'garri-b001',
    name: 'Nutragold™ Bulky White Garri - Premium',
    category: 'garri',
    url: 'garri-bulky-premium.html',
    image: 'assets/images/nutragold-pg.webp',
    imageAlt: 'Nutragold Bulky White Garri Premium',
    variants: [
      {
        size: 'Bulk',
        sku: 'garri-b001',
        weightApprox: '40–45kg',
        priceRetail: 76000,
        priceDiscountedRetail: 0,
        priceWholesale: 73000,
        stock: 40,
        packSize: 1,
        moqPacks: 10,
        visibility: 'registered',
        note: 'Plain bag. Weight varies by batch.',
      },
    ],
  },
  {
    baseSku: 'garri-b002',
    name: 'Nutragold™ Bulky White Garri - Standard',
    category: 'garri',
    url: 'garri-bulky-standard.html',
    image: 'assets/images/nutragold-sg.webp',
    imageAlt: 'Nutragold Bulky White Garri Standard',
    variants: [
      {
        size: 'Bulk',
        sku: 'garri-b002',
        weightApprox: '40–45kg',
        priceRetail: 46000,
        priceDiscountedRetail: 0,
        priceWholesale: 43500,
        stock: 40,
        packSize: 1,
        moqPacks: 10,
        visibility: 'registered',
        note: 'Plain bag. Weight varies by batch.',
      },
    ],
  },
  {
    baseSku: 'beans-b001',
    name: 'Nutragold™ Bulky Honey Beans',
    category: 'beans',
    url: 'beans-bulky-honey.html',
    image: 'assets/images/nutragold-hb.webp',
    imageAlt: 'Nutragold Bulky Honey Beans',
    variants: [
      {
        size: 'Bulk',
        sku: 'beans-b001',
        weightApprox: '40–45kg',
        priceRetail: 111000,
        priceDiscountedRetail: 0,
        priceWholesale: 107500,
        stock: 80,
        packSize: 1,
        moqPacks: 10,
        visibility: 'registered',
        note: 'Plain bag. Weight varies by batch.',
      },
    ],
  },
  {
    baseSku: 'beans-b002',
    name: 'Nutragold™ Bulky Brown Beans',
    category: 'beans',
    url: 'beans-bulky-brown.html',
    image: 'assets/images/nutragold-bb.webp',
    imageAlt: 'Nutragold Bulky Brown Beans',
    variants: [
      {
        size: 'Bulk',
        sku: 'beans-b002',
        weightApprox: '40–45kg',
        priceRetail: 101000,
        priceDiscountedRetail: 0,
        priceWholesale: 97500,
        stock: 80,
        packSize: 1,
        moqPacks: 10,
        visibility: 'registered',
        note: 'Plain bag. Weight varies by batch.',
      },
    ],
  },
];