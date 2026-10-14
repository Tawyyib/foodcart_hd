// ============================================
// PDP STOCK
// ============================================
// Owns: the stock display on the PDP.
// Computes available stock = base stock − qty in cart.
// Enforces: quantity input max = available stock.
// Reacts to: variant change, cart change, mode change.
//
// Scope: only runs if [data-variant-select] is present.
// ============================================

import { getCart } from '../modules/cart-controller-v.1.2.2';

const SELECT_SELECTOR = '[data-variant-select]';
const STOCK_DISPLAY_SELECTOR = '[data-variant-stock]';
const QTY_INPUT_SELECTOR = '.qty-add .qty-count';

let wired = false;

// --------------------------------------------
// Helpers
// --------------------------------------------
function getRoot() {
  const select = document.querySelector(SELECT_SELECTOR);
  return select ? select.closest('.pdp-summary') : null;
}

function getSelect() {
  return document.querySelector(SELECT_SELECTOR);
}

function getCurrentOption(select) {
  return select ? select.options[select.selectedIndex] : null;
}

function getQtyInCart(sku) {
  if (!sku) return 0;
  const cart = getCart();
  const item = cart.find((i) => i.sku === sku);
  return item ? parseInt(item.quantity, 10) || 0 : 0;
}

// --------------------------------------------
// Compute + render
// --------------------------------------------
function refresh() {
  const select = getSelect();
  if (!select) return;

  const option = getCurrentOption(select);
  if (!option) return;

  const root = getRoot();
  if (!root) return;

  const baseStock = parseInt(option.dataset.stock, 10);
  const sku = option.dataset.sku || option.value || '';
  const qtyInCart = getQtyInCart(sku);

  // If base stock isn't defined, leave the display alone.
  if (!isFinite(baseStock)) return;

  const available = Math.max(0, baseStock - qtyInCart);

  // ---- Update display ----
  const stockEl = root.querySelector(STOCK_DISPLAY_SELECTOR);
  if (stockEl) {
    stockEl.textContent = available > 0
      ? `${available} in stock`
      : `Out of stock`;
  }

  // ---- Update status badge ----
  const badge = root.querySelector('[data-stock-status]');
  if (badge) {
    badge.classList.remove('in-stock', 'low-stock', 'out-of-stock');
    const icon = badge.querySelector('.stock-status__icon');
    const text = badge.querySelector('.stock-status__text');

    if (available <= 0) {
      badge.classList.add('out-of-stock');
      if (icon) icon.className = 'stock-status__icon fas fa-xmark';
      if (text) text.textContent = 'Out of Stock';
    } else if (available <= 10) {
      badge.classList.add('low-stock');
      if (icon) icon.className = 'stock-status__icon fas fa-chevron-down';
      if (text) text.textContent = `Only ${available} left`;
    } else {
      badge.classList.add('in-stock');
      if (icon) icon.className = 'stock-status__icon fas fa-check';
      if (text) text.textContent = 'In Stock';
    }
  }

  // ---- Enforce max on the quantity input ----
  const qtyInput = root.querySelector(QTY_INPUT_SELECTOR);
  if (qtyInput) {
    if (available > 0) {
      qtyInput.max = String(available);
      const min = parseInt(qtyInput.min, 10) || 1;
      const current = parseInt(qtyInput.value, 10) || min;
      if (current > available) qtyInput.value = String(available);
    } else {
      qtyInput.max = '0';
      qtyInput.value = '0';
    }
  }

  // ---- Disable add-to-cart when out of stock ----
  const addBtn = root.querySelector('.btn-add-cart');
  if (addBtn) {
    if (available <= 0) {
      addBtn.disabled = true;
      addBtn.setAttribute('aria-disabled', 'true');
    } else {
      addBtn.disabled = false;
      addBtn.removeAttribute('aria-disabled');
    }
  }
}

// --------------------------------------------
// Wiring
// --------------------------------------------
function wire() {
  if (wired) return;
  wired = true;

  // Variant changes
  document.addEventListener('change', (e) => {
    if (!e.target.closest(SELECT_SELECTOR)) return;
    refresh();
  });

  // Cart changes
  document.addEventListener('cartSubtotalChanged', refresh);

  // Mode changes
  document.addEventListener('wholesaleModeChanged', refresh);

  // Variant module fires this; piggyback on it
  document.addEventListener('pdpVariantChanged', refresh);
}

// --------------------------------------------
// Init
// --------------------------------------------
export function initPdpStock() {
  const select = getSelect();
  if (!select) return;

  wire();
  refresh();

  console.log('✅ PDP stock ready.');
}