// ============================================
// PRODUCT CARD — Weight Selector
// ============================================
// Handles:
//   - Selecting a weight chip
//   - Updating card's data-price
//   - Updating visible price in retail/wholesale
//   - Updating "Add to Cart" button SKU + prices
// ============================================

const CHIP_SELECTOR = '.weight-chip';
const ACTIVE_CLASS = 'active';

/**
 * Get the currently active wholesale mode state.
 */
function isWholesaleMode() {
  return localStorage.getItem('wholesaleMode') === 'true';
}

document.addEventListener('wholesaleModeChanged', () => {

  document.querySelectorAll('.product-card').forEach((card) => {
    
    const activeChip = card.querySelector('.weight-chip.active') || card.querySelector('.weight-chip');
    if (!activeChip) return;

    const btn = card.querySelector('.btn-add-cart');
    if (!btn) return;

    const size = activeChip.dataset.size;
    const baseSku = card.dataset.sku || 'item';
    const productName = card.querySelector('.title')?.textContent.trim() || 'Product';

    btn.dataset.sku = `${baseSku}-${size}`;
    btn.dataset.size = size;
    btn.dataset.name = `${productName} (${size})`;
    btn.dataset.priceRetail = activeChip.dataset.priceRetail;
    btn.dataset.priceWholesale = activeChip.dataset.priceWholesale;

  });

});

/**
 * Format a number as Naira with thousands separators.
 * @param {number|string} amount
 * @returns {string}
 */
function formatNaira(amount) {
  const num = parseInt(amount, 10) || 0;
  return '₦ ' + num.toLocaleString('en-NG');
}

/**
 * Apply chip selection — marks the card as user-selected and updates prices.
 * @param {HTMLElement} card
 * @param {HTMLElement} chip
 */
function applyChipSelection(card, chip) {

  const retail = chip.dataset.priceRetail;
  const wholesale = chip.dataset.priceWholesale;
  const size = chip.dataset.size;

  // Mark that the user has made an explicit selection
  card.dataset.userSelected = 'true';

  card.dataset.priceRetail = retail;
  card.dataset.priceWholesale = wholesale;
  card.dataset.selectedSize = size;
  card.dataset.price = isWholesaleMode() ? wholesale : retail;

  // Update price displays
  const retailEl = card.querySelector('.price.retail');
  if (retailEl) retailEl.textContent = formatNaira(retail);

  const wholesaleEl = card.querySelector('.price.wholesale');
  if (wholesaleEl) wholesaleEl.textContent = formatNaira(wholesale);

  // Update button
  const addBtn = card.querySelector('.btn-add-cart');
  if (addBtn) {
    const baseSku = card.dataset.sku || 'item';
    addBtn.dataset.sku = `${baseSku}-${size}`;
    addBtn.dataset.size = size;
    addBtn.dataset.name = `${card.querySelector('.title')?.textContent || 'Product'} (${size})`;
    addBtn.dataset.retail = retail;
    addBtn.dataset.wholesale = wholesale;
  }

  console.log(`🔄 Selected ${size} on card ${card.dataset.sku}`, { retail, wholesale });
}

/**
 * Initialize weight chip selectors on all product cards.
 */
export function initProductCard() {
  // 1. Chip click handling (delegated)
  document.addEventListener('click', (e) => {
    const chip = e.target.closest(CHIP_SELECTOR);
    if (!chip) return;

    const card = chip.closest('.product-card');
    if (!card) return;

    e.preventDefault();

    card.querySelectorAll(CHIP_SELECTOR).forEach((c) => c.classList.remove(ACTIVE_CLASS));
    chip.classList.add(ACTIVE_CLASS);

    applyChipSelection(card, chip);
  });

  // 2. React to wholesale mode toggles (only if a chip was explicitly selected)
  document.addEventListener('wholesaleModeChanged', () => {
    document.querySelectorAll('.product-card').forEach((card) => {
      // Only update cards where user has made a selection
      const hasUserSelection = card.dataset.userSelected === 'true';
      const activeChip = card.querySelector(`.weight-chip.${ACTIVE_CLASS}`);

      if (hasUserSelection && activeChip) {
        applyChipSelection(card, activeChip);
      }
    });
  });

  console.log('✅ Product card ready.');
}

