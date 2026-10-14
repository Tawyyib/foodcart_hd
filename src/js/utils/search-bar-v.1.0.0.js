// ============================================
// SEARCH BAR — Optional Live Filter
// ============================================
// Behaviour:
//   - On the shop page: live-filter the grid + update the URL.
//   - On other pages: let the form submit to shop.html?q=...
// ============================================

const SEARCH_INPUT_ID = 'searchInput';
const SEARCH_FORM_ID = 'searchForm';
const GRID_SELECTOR = '.products-grid';
const CARD_SELECTOR = '.product-card';
const HIDDEN_CLASS = 'is-hidden';
const QUERY_PARAM = 'q';

let eventsWired = false;

function getInput() {
    return document.getElementById(SEARCH_INPUT_ID);
}

function getForm() {
    return document.getElementById(SEARCH_FORM_ID);
}

function getGrid() {
    return document.querySelector(GRID_SELECTOR);
}

function onShopPage() {
    return Boolean(getGrid());
}

// --------------------------------------------
// LIVE FILTER (shop page only)
// --------------------------------------------
function filterGrid(query) {
    const cards = Array.from(document.querySelectorAll(`${GRID_SELECTOR} ${CARD_SELECTOR}`));
    const q = query.trim().toLowerCase();

    cards.forEach((card) => {
        const name = (card.getAttribute('data-name') || card.textContent || '').toLowerCase();
        const sku = (card.getAttribute('data-sku') || '').toLowerCase();
        const visible = !q || name.includes(q) || sku.includes(q);
        card.classList.toggle(HIDDEN_CLASS, !visible);
    });
}

function syncURL(query) {
    const url = new URL(window.location.href);
    if (query) {
        url.searchParams.set(QUERY_PARAM, query);
    } else {
        url.searchParams.delete(QUERY_PARAM);
    }
    window.history.replaceState({}, '', url.toString());
}

function readURL() {
    const params = new URLSearchParams(window.location.search);
    return (params.get(QUERY_PARAM) || '').trim();
}

// --------------------------------------------
// INIT
// --------------------------------------------
export function initSearchBar() {
    const input = getInput();
    const form = getForm();
    if (!input) return;

    // 1. On the shop page: prefill from URL and filter the grid
    if (onShopPage()) {
        const initial = readURL();
        if (initial) {
            input.value = initial;
            filterGrid(initial);
        }
    }

    if (eventsWired) return;
    eventsWired = true;

    // 2. Live filter (only on shop page)
    let debounce = null;
    document.addEventListener('input', (e) => {
        if (e.target?.id !== SEARCH_INPUT_ID) return;
        if (!onShopPage()) return;

        clearTimeout(debounce);
        debounce = setTimeout(() => {
            filterGrid(e.target.value);
            syncURL(e.target.value);
        }, 200);
    });

    // 3. Form submit — prevent reload only on shop page
    if (form) {
        form.addEventListener('submit', (e) => {
            if (!onShopPage()) return;   // let the browser navigate
            e.preventDefault();
            const q = input.value.trim();
            filterGrid(q);
            syncURL(q);
        });
    }

    console.log('✅ Search bar ready.');
}