// ============================================
// PRODUCT CARD STOCK
// ============================================
// Owns: the stock badge on .product-card elements.
// Computes: aggregate availability across all variant chips.
//   - All variants available  → In Stock
//   - Some variants available → Limited Stock
//   - No variants available   → Out of Stock
//
// Does NOT subtract qty in cart. Cards show base availability.
// The PDP subtracts cart quantities (see pdp-stock.js).
//
// Scope: only runs if .product-card elements with chips are present.
// ============================================

const CARD_SELECTOR = '.product-card';
const CHIP_SELECTOR = '.weight-chip';
const BADGE_SELECTOR = '.stock-badge';
const BADGE_ICON_SELECTOR = '.stock-badge .fas, .stock-badge .fa-solid';
const BADGE_TEXT_SELECTOR = '.stock-badge__text';

let wired = false;

// --------------------------------------------
// Helpers
// --------------------------------------------
function readChipStock(chip) {
  const raw = chip.dataset.stock;
  if (raw === undefined) return null;
  const n = parseInt(raw, 10);
  return isFinite(n) ? n : null;
}

function computeCardState(card) {
  const chips = card.querySelectorAll(CHIP_SELECTOR);

  // No chips → single-variant product; look for stock on the card itself
  if (chips.length === 0) {
    const raw = card.dataset.stock;
    if (raw === undefined) return null;
    const n = parseInt(raw, 10);
    if (!isFinite(n)) return null;
    return n > 0 ? 'in-stock' : 'out-of-stock';
  }

  let available = 0;
  let total = 0;

  chips.forEach((chip) => {
    const stock = readChipStock(chip);
    if (stock === null) return; // chip has no stock info — skip
    total++;
    if (stock > 0) available++;
  });

  if (total === 0) return null; // no stock data at all

  if (available === 0) return 'out-of-stock';
  if (available < total) return 'limited-stock';
  return 'in-stock';
}

function applyState(card, state) {
  const badge = card.querySelector(BADGE_SELECTOR);
  if (!badge) return;

  // Reset
  badge.classList.remove('in-stock', 'low-stock', 'out-of-stock');

  // Find the text node. If the badge has a dedicated span, use it;
  // otherwise fall back to the last text node (so we don't wipe the icon).
  const textEl = badge.querySelector('.stock-badge__text');
  const iconEl = badge.querySelector('.fas, .fa-solid');

  if (state === 'out-of-stock') {
    badge.classList.add('out-of-stock');
    if (iconEl) iconEl.className = 'fas fa-xmark';
    if (textEl) textEl.textContent = 'Out of Stock';
    else setBadgeText(badge, 'Out of Stock');
  } else if (state === 'limited-stock') {
    badge.classList.add('low-stock');
    if (iconEl) iconEl.className = 'fas fa-chevron-down';
    if (textEl) textEl.textContent = 'Low Stock';
    else setBadgeText(badge, 'Low Stock');
  } else {
    badge.classList.add('in-stock');
    if (iconEl) iconEl.className = 'fas fa-check';
    if (textEl) textEl.textContent = 'In Stock';
    else setBadgeText(badge, 'In Stock');
  }
}

/**
 * Fallback text setter that preserves the icon element inside the badge.
 */
function setBadgeText(badge, text) {
  // Remove all text nodes
  Array.from(badge.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) node.remove();
  });
  badge.appendChild(document.createTextNode(' ' + text));
}

// --------------------------------------------
// Process all cards
// --------------------------------------------
function refresh() {
  document.querySelectorAll(CARD_SELECTOR).forEach((card) => {
    const state = computeCardState(card);
    if (!state) return;
    applyState(card, state);
  });
}

// --------------------------------------------
// Wiring
// --------------------------------------------
function wire() {
  if (wired) return;
  wired = true;

  // Mode changes don't affect card stock, but a page-side re-render
  // might add new cards — worth a re-run.
  document.addEventListener('wholesaleModeChanged', refresh);

  // Future: if cart ever contributes to card stock, listen here.
  // document.addEventListener('cartSubtotalChanged', refresh);
}

// --------------------------------------------
// Init
// --------------------------------------------
export function initProductCardStock() {
  const cards = document.querySelectorAll(CARD_SELECTOR);
  if (cards.length === 0) return;

  wire();
  refresh();

  console.log('✅ Product card stock ready.');
}