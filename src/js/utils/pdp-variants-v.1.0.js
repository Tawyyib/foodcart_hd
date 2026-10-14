// ============================================
// PDP VARIANTS
// ============================================
// Owns: variant selection on a product detail page.
// Reads: the <select data-variant-select>.
// Updates: price displays, SKU text, stock text, add-to-cart button.
// Handles: ?size= pre-selection on page load.
//
// Scope: only runs if [data-variant-select] is present.
// ============================================

const SELECT_SELECTOR = '[data-variant-select]';

let initialized = false;
let wired = false;

// --------------------------------------------
// Helpers
// --------------------------------------------
function formatNaira(n) {
  const num = Number(n);
  if (!isFinite(num)) return '₦ 0';
  return '₦ ' + num.toLocaleString('en-NG');
}

function getCard(root) {
  return root.closest('.pdp-summary') || root;
}

// --------------------------------------------
// Update
// --------------------------------------------
function updateFromSelection(select) {
  const option = select.options[select.selectedIndex];
  if (!option) return;

  const root = getCard(select);

  const size = option.dataset.size || '';
  const sku = option.dataset.sku || option.value || '';
  const priceRetail = option.dataset.priceRetail || '';
  const priceWholesale = option.dataset.priceWholesale || '';
  const stock = option.dataset.stock || '';

  // -- Price displays --
  const retailEl = root.querySelector('[data-variant-price-retail]');
  if (retailEl) retailEl.textContent = formatNaira(priceRetail);

  const wholesaleEl = root.querySelector('[data-variant-price-wholesale]');
  if (wholesaleEl) wholesaleEl.textContent = formatNaira(priceWholesale);

  // -- SKU --
  const skuEl = root.querySelector('[data-base-sku]');
  if (skuEl) skuEl.textContent = 'SKU: ' + sku;

  // -- Stock text --
  const stockEl = root.querySelector('[data-variant-stock]');
  
  if (stockEl && stock) {
    stockEl.textContent = `${stock} in stock`;
  }

  // -- Add-to-cart button --
  const btn = root.querySelector('.btn-add-cart');
  if (btn) {
    btn.dataset.sku = sku;
    btn.dataset.priceRetail = priceRetail;
    btn.dataset.priceWholesale = priceWholesale;

    // Read the product name from the page title
    const titleEl = root.querySelector('.title');
    const productName = titleEl ? titleEl.textContent.trim() : '';
    btn.dataset.name = size ? `${productName} (${size})` : productName;

    btn.setAttribute('data-sku', sku);
    btn.setAttribute('data-price-retail', priceRetail);
    btn.setAttribute('data-price-wholesale', priceWholesale);
    btn.setAttribute('data-name', btn.dataset.name);
  }

  // Notify the rest of the app
  document.dispatchEvent(new CustomEvent('pdpVariantChanged', {
    detail: { sku, size, priceRetail, priceWholesale, stock },
  }));
}

// --------------------------------------------
// URL pre-selection
// --------------------------------------------
function applySizeFromQuery(select) {
  const params = new URLSearchParams(window.location.search);
  const size = params.get('size');
  if (!size) return;

  const match = Array.from(select.options).find(
    (o) => o.dataset.size && o.dataset.size.toLowerCase() === size.toLowerCase()
  );
  if (match) {
    select.value = match.value;
    updateFromSelection(select);
  }
}

// --------------------------------------------
// Wiring
// --------------------------------------------
function wire() {
  if (wired) return;
  wired = true;

  document.addEventListener('change', (e) => {
    const select = e.target.closest(SELECT_SELECTOR);
    if (!select) return;
    updateFromSelection(select);
  });
}

// --------------------------------------------
// Init
// --------------------------------------------
export function initPdpVariants() {
  const select = document.querySelector(SELECT_SELECTOR);
  if (!select) return;

  if (initialized) return;
  initialized = true;

  wire();

  applySizeFromQuery(select);
  updateFromSelection(select);

  console.log('✅ PDP variants ready.');
}