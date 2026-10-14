// ============================================
// PRODUCT CARD STOCK
// ============================================
import { getProductStockState } from './catalog.js';

const CARD_SELECTOR = '.product-card';
const BADGE_SELECTOR = '.stock-badge';

let wired = false;

// --------------------------------------------
// Apply state to a card
// --------------------------------------------
function applyState(card, state) {
  const badge = card.querySelector(BADGE_SELECTOR);
  if (!badge) return;

  badge.classList.remove('in-stock', 'low-stock', 'out-of-stock');

  const iconEl = badge.querySelector('.fas, .fa-solid');
  const textEl = badge.querySelector('.stock-badge__text');

  if (state === 'out-of-stock') {
    badge.classList.add('out-of-stock');
    if (iconEl) iconEl.className = 'fas fa-xmark';
    if (textEl) textEl.textContent = 'Out of Stock';
  } else if (state === 'limited-stock') {
    badge.classList.add('low-stock');
    if (iconEl) iconEl.className = 'fas fa-chevron-down';
    if (textEl) textEl.textContent = 'Limited Stock';
  } else {
    badge.classList.add('in-stock');
    if (iconEl) iconEl.className = 'fas fa-check';
    if (textEl) textEl.textContent = 'In Stock';
  }
}

// --------------------------------------------
// Refresh
// --------------------------------------------
function refresh() {
  document.querySelectorAll(CARD_SELECTOR).forEach((card) => {
    const baseSku = card.dataset.baseSku;
    if (!baseSku) return;

    const state = getProductStockState(baseSku);
    if (!state) return;

    applyState(card, state);
  });
}

// --------------------------------------------
// Init
// --------------------------------------------
export function initProductCardStock() {
  const cards = document.querySelectorAll(CARD_SELECTOR);
  if (cards.length === 0) return;

  if (!wired) {
    wired = true;
    document.addEventListener('wholesaleModeChanged', refresh);
    document.addEventListener('buyerTierChanged', refresh);
  }

  refresh();
  console.log('✅ Product card stock ready.');
}