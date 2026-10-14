// ============================================
// SEARCH PAGE
// ============================================
// Runs on search.html only.
// Reads ?q=, calls the engine, renders simplified result cards,
// respects wholesale mode, handles the empty state.
// ============================================

import { CATALOGUE } from './catalogue-data.js';
import { PAGES } from './pages-index.js';
import { searchCatalogue, searchPages } from './search-engine.js';
import { applyModeBadgeState } from './modules/wholesale-mode.js';

const QUERY_PARAM = 'q';

// --------------------------------------------
// Mode helpers
// --------------------------------------------
function isWholesaleActive() {
  if (typeof window.isWholesaleActive === 'function') {
    return window.isWholesaleActive();
  }
  return localStorage.getItem('wholesaleMode') === 'true';
}

// --------------------------------------------
// URL
// --------------------------------------------
function readQuery() {
  const params = new URLSearchParams(window.location.search);
  return (params.get(QUERY_PARAM) || '').trim();
}

// --------------------------------------------
// Rendering
// --------------------------------------------
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPrice(n) {
  if (typeof n !== 'number' || !isFinite(n)) return '';
  return '₦' + n.toLocaleString('en-NG');
}

function renderCard(product, wholesale) {
  const image = product.image || '';
  const alt = product.imageAlt || product.name || '';
  const url = product.url || '#';
  const category = product.category || '';

  // Wrapper classes: base + search modifier + wholesale-only modifier
  const wrapperClasses = [
    'product-card',
    'search-card',
    product.wholesaleOnly ? 'wholesale' : '',
  ].filter(Boolean).join(' ');

  // Safe stringify for numeric attributes
  const retailAttr = product.priceRetail != null ? String(product.priceRetail) : '';
  const wholesaleAttr = product.priceWholesale != null ? String(product.priceWholesale) : '';

  return `
    <div class="${wrapperClasses}"
         data-base-sku="${escapeHtml(product.baseSku || '')}"
         data-name="${escapeHtml(product.name || '')}"
         data-category="${escapeHtml(category)}"
         data-price-retail="${escapeHtml(retailAttr)}"
         data-price-wholesale="${escapeHtml(wholesaleAttr)}">

      <div class="product-card-header">
        <picture class="product-img">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(alt)}" loading="lazy">
        </picture>
        <span class="stock-badge in-stock">
          <span class="fas fa-check"></span> In Stock
        </span>
      </div>

      <div class="product-card-body">

        <div class="product-details">

          ${category ? `<span class="badge badge-category">${escapeHtml(category)}</span>` : ''}

          <h3 class="title">${escapeHtml(product.name || product.title || '')}</h3>

          <div class="pricing">
            <p class="price retail"><span>From</span>${escapeHtml(formatPrice(product.priceRetail))}</p>
            <p class="price wholesale"><span>From</span>${escapeHtml(formatPrice(product.priceWholesale))}</p>
            <span class="badge badge-orange price-mode-badge">Retail</span>
          </div>

        </div>

        <div class="call-to-act search-cta">
          <a href="${escapeHtml(url)}" class="btn btn-primary">View →</a>
        </div>

      </div>

    </div>
  `;

}

function renderPageResult(page) {
  return `
    <a href="${escapeHtml(page.url)}" class="search-page-result">
      <span class="search-page-result__title">${escapeHtml(page.title)}</span>
      ${page.category ? `<span class="search-page-result__category">${escapeHtml(page.category)}</span>` : ''}
    </a>
  `;
}

// --------------------------------------------
// Status / empty state
// --------------------------------------------
function updateStatus(count, query) {
  const el = document.getElementById('searchStatus');
  if (!el) return;
  if (!query) {
    el.textContent = '';
    return;
  }
  if (count === 0) {
    el.textContent = `No results for "${query}"`;
  } else {
    el.textContent = `${count} result${count === 1 ? '' : 's'} for "${query}"`;
  }
}

function updateTitle(query) {
  const el = document.getElementById('searchTitle');
  if (el) el.textContent = query ? `Search results` : 'Search';
  document.title = query
    ? `${query} — Search — FoodCart™ Stores`
    : `Search — FoodCart™ Stores`;
}

function updateEmptyState(show, query) {
  const empty = document.getElementById('searchEmpty');
  const emptyQuery = document.getElementById('searchEmptyQuery');
  if (!empty) return;
  empty.hidden = !show;
  if (emptyQuery) emptyQuery.textContent = query || '';
}

// --------------------------------------------
// Main render
// --------------------------------------------
function render() {
  const query = readQuery();
  const wholesale = isWholesaleActive();

  const resultsEl = document.getElementById('searchResults');
  const pagesEl = document.getElementById('searchPages');
  const pagesWrapEl = document.getElementById('searchPagesWrap');
  if (!resultsEl) return;

  updateTitle(query);

  // ---- Empty query ----
  if (!query) {
    resultsEl.innerHTML = '';
    resultsEl.hidden = true;
    if (pagesEl) pagesEl.innerHTML = '';
    if (pagesWrapEl) pagesWrapEl.hidden = true;
    updateStatus(0, '');
    updateEmptyState(false, '');
    return;
  }

  // ---- Search ----
  const productResults = searchCatalogue(CATALOGUE, query, { wholesaleMode: wholesale });
  const pageResults = searchPages(PAGES, query);

  const totalCount = productResults.length + pageResults.length;

  updateStatus(totalCount, query);
  updateEmptyState(totalCount === 0, query);

  // ---- Products section ----
  if (productResults.length > 0) {
    resultsEl.hidden = false;
    resultsEl.innerHTML = productResults.map((p) => renderCard(p, wholesale)).join('');

    if (wholesale) {
      applyModeBadgeState(resultsEl, true);
    }
  } else {
    resultsEl.innerHTML = '';
    resultsEl.hidden = true;
  }

  // ---- Pages section ----
  if (pagesEl && pagesWrapEl) {
    if (pageResults.length > 0) {
      pagesWrapEl.hidden = false;
      pagesEl.innerHTML = pageResults.map(renderPageResult).join('');
    } else {
      pagesEl.innerHTML = '';
      pagesWrapEl.hidden = true;
    }
  }
}

// --------------------------------------------
// Init
// --------------------------------------------
export function initSearchPage() {
  // Only run if the search results container exists.
  if (!document.getElementById('searchResults')) return;

  render();

  // Re-render when wholesale mode changes (user toggles while on page).
  document.addEventListener('wholesaleModeChanged', render);

  console.log('✅ Search page ready.');
}

// Auto-init: this script is only loaded on search.html.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSearchPage);
} else {
  initSearchPage();
}