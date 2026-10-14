// ============================================
// SEARCH BAR
// ============================================
// Behaviour:
//   - On submit: navigate to search.html?q=<query>
//   - On load on search.html: prefill the input from ?q=
//   - No live filtering for now (site-wide search is navigation-only)
// ============================================

const SEARCH_INPUT_ID = 'searchInput';
const SEARCH_FORM_ID = 'searchForm';
const SEARCH_PAGE = 'search.html';
const QUERY_PARAM = 'q';

let eventsWired = false;

function getInput() {
  return document.getElementById(SEARCH_INPUT_ID);
}

function getForm() {
  return document.getElementById(SEARCH_FORM_ID);
}

// --------------------------------------------
// URL helpers
// --------------------------------------------
function buildSearchUrl(query) {
  return `${SEARCH_PAGE}?${QUERY_PARAM}=${encodeURIComponent(query)}`;
}

function readQueryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (params.get(QUERY_PARAM) || '').trim();
}

function onSearchPage() {
  const path = window.location.pathname.split('/').pop() || '';
  return path === SEARCH_PAGE || path === '';
}

// --------------------------------------------
// Init
// --------------------------------------------
export function initSearchBar() {
  const input = getInput();
  const form = getForm();

  if (!input) return;

  // Prefill from URL when on the search page.
  if (onSearchPage()) {
    const q = readQueryFromUrl();
    if (q) input.value = q;
  }

  if (eventsWired) return;
  eventsWired = true;

  // Submit → navigate to search page.
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      window.location.href = buildSearchUrl(q);
    });
  }

  console.log('✅ Search bar ready.');
  
}