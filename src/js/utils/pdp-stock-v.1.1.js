// ============================================
// PDP STOCK
// ============================================
// Owns: the stock display on the PDP.
// Computes: available stock = base stock − qty in cart.
// Enforces: quantity input max = available stock.
// Disables: add-to-cart when available is 0.
// Reacts to: variant change, cart change, mode change.
//
// Note: "base stock" comes from data-stock on the current option.
// It reflects total inventory, not real-time backend stock. When
// stock becomes a real API source, this module re-reads base stock
// from that source instead of the DOM.
//
// Scope: only runs if [data-variant-select] is present.
// ============================================

import { getCart } from '../modules/cart-controller-v.1.2.2';

const SELECT_SELECTOR = '[data-variant-select]';
const STOCK_DISPLAY_SELECTOR = '[data-variant-stock]';
const QTY_INPUT_SELECTOR = '.qty-add .qty-count';
const LOW_STOCK_THRESHOLD = 10;

let wired = false;

// --------------------------------------------
// Helpers
// --------------------------------------------
function getSelect() {
  return document.querySelector(SELECT_SELECTOR);
}

function getRoot(select) {
  return select ? select.closest('.pdp-summary') : null;
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

  const root = getRoot(select);
  if (!root) return;

  const baseStock = parseInt(option.dataset.stock, 10);
  if (!isFinite(baseStock)) return;

  const sku = option.dataset.sku || option.value || '';
  const qtyInCart = getQtyInCart(sku);
  const available = Math.max(0, baseStock - qtyInCart);

  // ---- Stock text ----
  const stockEl = root.querySelector(STOCK_DISPLAY_SELECTOR);
  if (stockEl) {
    stockEl.textContent = available > 0
      ? `${available} in stock`
      : 'Out of stock';
  }

  // ---- Status badge ----
  const badge = root.querySelector('[data-stock-status]');
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

  // ---- Enforce max on the quantity input ----
  const qtyInput = root.querySelector(QTY_INPUT_SELECTOR);
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

  // ---- Disable add-to-cart when out of stock ----
  const addBtn = root.querySelector('.btn-add-cart');
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

  // Variant change
  document.addEventListener('change', (e) => {
    if (!e.target.closest(SELECT_SELECTOR)) return;
    refresh();
  });

  // Cart change
  document.addEventListener('cartSubtotalChanged', refresh);

  // Mode change
  document.addEventListener('wholesaleModeChanged', refresh);

  // Variant module's own event (covers ?size= preselection and any
  // programmatic variant change)
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