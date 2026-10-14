// ============================================
// PDP STOCK
// ============================================
import { getCart } from './cart-controller-v.1.2.2.js';
import { getVariant, getVariants } from './catalog.js';

const SELECT_SELECTOR = '[data-variant-select]';
const SUMMARY_SELECTOR = '.pdp-summary[data-base-sku]';
const STOCK_DISPLAY_SELECTOR = '[data-variant-stock]';
const QTY_INPUT_SELECTOR = '.qty-add .qty-count';

const LOW_STOCK_THRESHOLD = 10;

let wired = false;

// --------------------------------------------
// Helpers
// --------------------------------------------
function getSummary() {
  return document.querySelector(SUMMARY_SELECTOR);
}

function getCurrentVariantSku() {
  // Branded PDP: read from the select
  const select = document.querySelector(SELECT_SELECTOR);
  if (select) {
    const option = select.options[select.selectedIndex];
    if (option) {
      const sku = option.dataset.sku || option.value;
      if (sku) return sku;
    }
  }

  // Bulk PDP: single-variant, read from the summary
  const summary = getSummary();
  if (summary) {
    const variants = getVariants(summary.dataset.baseSku);
    if (variants.length === 1) return variants[0].sku;
  }

  return null;
}

function getQtyInCart(sku) {
  if (!sku) return 0;
  const cart = getCart();
  const item = cart.find((i) => i.sku === sku);
  return item ? parseInt(item.quantity, 10) || 0 : 0;
}

// --------------------------------------------
// Refresh
// --------------------------------------------
function refresh() {
  const summary = getSummary();
  if (!summary) return;

  const sku = getCurrentVariantSku();
  if (!sku) return;

  const found = getVariant(sku);
  if (!found) return;

  const baseStock = found.variant.stock;
  if (!isFinite(baseStock)) return;

  const qtyInCart = getQtyInCart(sku);
  const available = Math.max(0, baseStock - qtyInCart);

  // Stock text
  const stockEl = summary.querySelector(STOCK_DISPLAY_SELECTOR);
  if (stockEl) {
    stockEl.textContent = available > 0
      ? `${available} in stock`
      : 'Out of stock';
  }

  // Status badge
  const badge = summary.querySelector('[data-stock-status]');
  if (badge) {
    badge.classList.remove('in-stock', 'low-stock', 'out-of-stock');
    const icon = badge.querySelector('.stock-status__icon');
    const text = badge.querySelector('.stock-status__text');

    if (available <= 0) {
      badge.classList.add('out-of-stock');
      if (icon) icon.className = 'stock-status__icon fas fa-xmark';
      if (text) text.textContent = 'Out of Stock';
    } else if (available <= LOW_STOCK_THRESHOLD) {
      badge.classList.add('low-stock');
      if (icon) icon.className = 'stock-status__icon fas fa-chevron-down';
      if (text) text.textContent = `Only ${available} left`;
    } else {
      badge.classList.add('in-stock');
      if (icon) icon.className = 'stock-status__icon fas fa-check';
      if (text) text.textContent = 'In Stock';
    }
  }

  // Qty input max
  const qtyInput = summary.querySelector(QTY_INPUT_SELECTOR);
  if (qtyInput) {
    if (available > 0) {
      qtyInput.max = String(available);
      const min = parseInt(qtyInput.min, 10) || 1;
      const current = parseInt(qtyInput.value, 10) || min;
      if (current > available) qtyInput.value = String(available);
      if (current < min) qtyInput.value = String(min);
    } else {
      qtyInput.max = '0';
      qtyInput.value = '0';
    }
  }

  // Disable add-to-cart when out of stock
  const addBtn = summary.querySelector('.btn-add-cart');
  if (addBtn) {
    const disabled = available <= 0;
    addBtn.disabled = disabled;
    if (disabled) addBtn.setAttribute('aria-disabled', 'true');
    else addBtn.removeAttribute('aria-disabled');
  }
}

// --------------------------------------------
// Wiring
// --------------------------------------------
function wire() {
  if (wired) return;
  wired = true;

  document.addEventListener('change', (e) => {
    if (!e.target.closest(SELECT_SELECTOR)) return;
    refresh();
  });

  document.addEventListener('cartSubtotalChanged', refresh);
  document.addEventListener('wholesaleModeChanged', refresh);
  document.addEventListener('pdpVariantChanged', refresh);
}

// --------------------------------------------
// Init
// --------------------------------------------
export function initPdpStock() {
  const summary = getSummary();
  if (!summary) return;

  wire();
  refresh();

  console.log('✅ PDP stock ready.');
}