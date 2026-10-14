// ============================================
// SHOP FILTERS MODULE
// ============================================
// Owns: category filter, sort, results count.
// Scope: the shop page's product grid only.
// Mode-aware: retail vs. wholesale prices + visibility.
//
// Visibility contract:
//   - A card with class "wholesale" is hidden in retail/guest mode.
//   - Every retail-visible card is also visible in wholesale mode.
//   - Only the price shown differs between modes.
//   - This module is the SINGLE owner of "is-hidden".
//     Do not hide cards by mode via CSS.
// ============================================

const GRID_SELECTOR = '.products-grid';
const CARD_SELECTOR = '.product-card';
const WHOLESALE_ONLY_CLASS = 'wholesale';
const HIDDEN_CLASS = 'is-hidden';

let eventsWired = false;

// --------------------------------------------
// HELPERS
// --------------------------------------------
function getGrid() {
    return document.querySelector(GRID_SELECTOR);
}

function getAllCards() {
    const grid = getGrid();
    return grid ? Array.from(grid.querySelectorAll(CARD_SELECTOR)) : [];
}

function getCategorySelect() {
    return document.getElementById('categoryFilter');
}

function getSortSelect() {
    return document.getElementById('sortSelect');
}

function getResultsLabel() {
    return document.getElementById('sortCount');
}

/**
 * Determine the current pricing mode.
 */
function isWholesaleActiveSafe() {
    if (typeof window.isWholesaleActive === 'function') {
        return window.isWholesaleActive();
    }
    return localStorage.getItem('wholesaleMode') === 'true';
}

/**
 * Read the correct price attribute for the active mode.
 */
function getCardPrice(card, isWholesale) {
    const primary = isWholesale ? 'data-price-wholesale' : 'data-price-retail';
    const secondary = isWholesale ? 'data-price-retail' : 'data-price-wholesale';

    const raw =
        card.getAttribute(primary) ||
        card.getAttribute('data-price') ||
        card.getAttribute(secondary) ||
        '0';

    return parseFloat(raw) || 0;
}

/**
 * A card is wholesale-only if it carries the wholesale class.
 * (Alternatively: data-wholesale-only="true". Pick one and stick to it.)
 */
function isWholesaleOnly(card) {
    return ( 
            card.classList.contains(WHOLESALE_ONLY_CLASS) 
            // card.getAttribute('data-wholesale-only') === 'true'
        );
}


/**
 * Single source of truth for mode visibility.
 * Wholesale is a SUPERSET of retail; only prices differ.
 */
function isCardVisibleInMode(card, isWholesale) {
    if (!isWholesale && isWholesaleOnly(card)) return false;
    return true;
}

// --------------------------------------------
// APPLY CATEGORY FILTER
// --------------------------------------------
function applyCategoryFilter() {

    const cards = getAllCards();
    if (!cards.length) return;

    const select = getCategorySelect();
    const selectedCat = select?.value || 'all';
    const isWholesale = isWholesaleActiveSafe();

    let visibleCount = 0;      // matches current category + mode
    let modeVisibleTotal = 0;  // matches current mode only

    cards.forEach((card) => {
        const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();

        const modeOk = isCardVisibleInMode(card, isWholesale);
        if (modeOk) modeVisibleTotal++;

        const categoryOk =
            selectedCat === 'all' ||
            cardCategory === selectedCat.toLowerCase();

        const isVisible = modeOk && categoryOk;

        card.classList.toggle(HIDDEN_CLASS, !isVisible);
        if (isVisible) visibleCount++;
    });

    updateResultsCount(visibleCount, modeVisibleTotal);
}

// --------------------------------------------
// RESULTS COUNT
// --------------------------------------------
function updateResultsCount(visible, total) {
    const label = getResultsLabel();
    if (!label) return;

    label.textContent = `Showing ${visible} of ${total} results`;
}

// --------------------------------------------
// UPDATE CATEGORY COUNTS
// --------------------------------------------
// Badges reflect only cards visible in the CURRENT mode.
// "All" equals the mode-visible total so it always matches the grid
// when the category filter is set to "all".
function updateCategoryCounts() {
    const select = getCategorySelect();
    if (!select) return;

    const cards = getAllCards();
    const isWholesale = isWholesaleActiveSafe();

    const counts = { all: 0 };

    cards.forEach((card) => {
        if (!isCardVisibleInMode(card, isWholesale)) return;

        counts.all++;
        const cat = (card.getAttribute('data-category') || '').toLowerCase();
        if (cat) counts[cat] = (counts[cat] || 0) + 1;
    });

    Array.from(select.options).forEach((opt) => {
        const base = opt.textContent.replace(/\s*\(\d+\)\s*$/, '').trim();
        const count = counts[opt.value] || 0;
        opt.textContent = `${base} (${count})`;
    });
}

// --------------------------------------------
// SORT
// --------------------------------------------
function sortCards(sortValue) {
    const grid = getGrid();
    if (!grid) return;

    const cards = getAllCards();
    const isWholesale = isWholesaleActiveSafe();

    const getName = (card) =>
        (card.getAttribute('data-name') || card.textContent || '').toLowerCase();

    const getNumber = (card, attr) =>
        parseFloat(card.getAttribute(attr) || '0') || 0;

    const getDate = (card) =>
        new Date(card.getAttribute('data-date') || 0).getTime();

    cards.sort((a, b) => {
        switch (sortValue) {
            case 'price-low':
                return getCardPrice(a, isWholesale) - getCardPrice(b, isWholesale);

            case 'price-high':
                return getCardPrice(b, isWholesale) - getCardPrice(a, isWholesale);

            case 'name-asc':
                return getName(a).localeCompare(getName(b));

            case 'name-desc':
                return getName(b).localeCompare(getName(a));

            case 'popularity':
                return getNumber(b, 'data-popularity') - getNumber(a, 'data-popularity');

            case 'rating':
                return getNumber(b, 'data-rating') - getNumber(a, 'data-rating');

            case 'date':
                return getDate(b) - getDate(a);

            case 'menu-order':
            default:
                return 0;
        }
    });

    cards.forEach((card) => grid.appendChild(card));
}

// --------------------------------------------
// EVENT WIRING
// --------------------------------------------
function wireEvents() {
    if (eventsWired) return;
    eventsWired = true;

    // 1. Category + sort changes
    document.addEventListener('change', (e) => {
        if (e.target?.id === 'categoryFilter') {
            applyCategoryFilter();
        }
        if (e.target?.id === 'sortSelect') {
            sortCards(e.target.value);
        }
    });

    // 2. Wholesale mode toggle — re-count, re-filter, re-sort
    document.addEventListener('wholesaleModeChanged', () => {
        updateCategoryCounts();
        applyCategoryFilter();

        const sortValue = getSortSelect()?.value;
        if (sortValue) sortCards(sortValue);
    });
}

// --------------------------------------------
// INIT
// --------------------------------------------
export function initShopFilters() {
    if (!getGrid()) {
        console.log('ℹ️ Shop filters: no products-grid on this page.');
        return;
    }

    wireEvents();
    updateCategoryCounts();
    applyCategoryFilter();

    console.log('✅ Shop filters ready (category + sort, mode-aware).');
}