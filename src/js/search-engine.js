// ============================================
// SEARCH ENGINE
// ============================================
// Pure functions. No DOM. No data source baked in.
// Takes an array of products + a query, returns ranked matches.
//
// Designed to survive the WordPress migration:
//   - Today:  searchCatalogue(CATALOGUE, "garri")
//   - Later:  searchCatalogue(await fetch('/wp-json/...'), "garri")
// ============================================

// --------------------------------------------
// Normalization
// --------------------------------------------
/**
 * Lowercase, strip diacritics, collapse whitespace, and repair common
 * mojibake sequences produced by mis-encoded source files.
 */
function normalise(str) {
  if (!str) return '';
  return String(str)
    .replace(/â„¢/g, '™')      // mojibake: trademark
    .replace(/â€™/g, "'")     // mojibake: right single quote
    .replace(/â€œ/g, '"')     // mojibake: left double quote
    .replace(/â€/g, '"')      // mojibake: right double quote
    .replace(/Â/g, '')        // mojibake: stray non-breaking space marker
    .toLowerCase()
    .normalize('NFKD')          // split accents from letters
    .replace(/[\u0300-\u036f]/g, '') // drop accent marks
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenise a query into individual terms. Also strips plurals so
 * "beans" matches "bean" and vice versa.
 */
function tokenise(str) {
  const normalised = normalise(str);
  if (!normalised) return [];
  return normalised
    .split(' ')
    .map((tok) => tok.replace(/(ies)$/, 'y').replace(/(es|s)$/, ''))
    .filter(Boolean);
}

// --------------------------------------------
// Scoring
// --------------------------------------------
const WEIGHTS = {
  NAME_EXACT: 100,
  NAME_STARTS_WITH: 60,
  NAME_CONTAINS_FULL: 45,
  NAME_ALL_TOKENS: 35,
  NAME_ANY_TOKEN: 20,
  KEYWORD_EXACT: 25,
  KEYWORD_ANY: 12,
  CATEGORY_EXACT: 15,
  CATEGORY_CONTAINS: 8,
  SKU_CONTAINS: 10,
};

/**
 * Score a single product against a query. Higher = better.
 * Returns 0 if the product doesn't match at all.
 */
function scoreProduct(product, rawQuery) {
  const query = normalise(rawQuery);
  if (!query) return 0;

  const tokens = tokenise(rawQuery);
  const name = normalise(product.name || product.title || '');
  const category = normalise(product.category || '');
  const sku = normalise(product.baseSku || '');
  const keywords = (product.keywords || []).map(normalise);

  let score = 0;

  // --- Name matches (highest signal) ---
  if (name === query) score += WEIGHTS.NAME_EXACT;
  if (name.startsWith(query)) score += WEIGHTS.NAME_STARTS_WITH;
  if (query.length >= 3 && name.includes(query)) score += WEIGHTS.NAME_CONTAINS_FULL;

  const nameHits = tokens.filter((t) => name.includes(t));
  if (nameHits.length === tokens.length && tokens.length > 0) {
    score += WEIGHTS.NAME_ALL_TOKENS;
  } else if (nameHits.length > 0) {
    score += WEIGHTS.NAME_ANY_TOKEN * nameHits.length;
  }

  // --- Keyword matches ---
  for (const kw of keywords) {
    if (kw === query) {
      score += WEIGHTS.KEYWORD_EXACT;
      break;
    }
    if (tokens.some((t) => kw.includes(t))) {
      score += WEIGHTS.KEYWORD_ANY;
    }
  }

  // --- Category ---
  if (category === query) score += WEIGHTS.CATEGORY_EXACT;
  else if (category && query.includes(category)) score += WEIGHTS.CATEGORY_CONTAINS;

  // --- SKU ---
  if (sku && sku.includes(query)) score += WEIGHTS.SKU_CONTAINS;

  return score;
}

// --------------------------------------------
// Public API
// --------------------------------------------
/**
 * Search a catalogue. Returns matches sorted by score (desc), then
 * by name (asc) for ties.
 *
 * @param {Array} products   - array of product objects
 * @param {string} query     - the raw user query
 * @param {Object} [opts]
 * @param {boolean} [opts.wholesaleMode] - when false, hide wholesaleOnly products
 * @param {number}  [opts.limit]         - cap on results returned
 * @returns {Array} matching products, ranked
 */
export function searchCatalogue(products, query, opts = {}) {
  const { wholesaleMode = false, limit = 0 } = opts;

  if (!Array.isArray(products) || !query || !query.trim()) return [];

  const results = [];

  for (const product of products) {
    // Mode gate: retail hides wholesale-only products.
    if (!wholesaleMode && product.wholesaleOnly) continue;

    const score = scoreProduct(product, query);
    if (score > 0) {
      results.push({ product, score });
    }
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const an = normalise(a.product.name || '');
    const bn = normalise(b.product.name || '');
    return an.localeCompare(bn);
  });

  const ranked = results.map((r) => r.product);
  return limit > 0 ? ranked.slice(0, limit) : ranked;
}

// --------------------------------------------
// Page search
// --------------------------------------------
const PAGE_WEIGHTS = {
  TITLE_EXACT: 100,
  TITLE_STARTS_WITH: 60,
  TITLE_CONTAINS_FULL: 45,
  TITLE_ALL_TOKENS: 35,
  TITLE_ANY_TOKEN: 20,
  KEYWORD_EXACT: 25,
  KEYWORD_ANY: 12,
  CATEGORY_EXACT: 15,
  CATEGORY_CONTAINS: 8,
};

function scorePage(page, rawQuery) {
  const query = normalise(rawQuery);
  if (!query) return 0;

  const tokens = tokenise(rawQuery);
  const title = normalise(page.title || '');
  const category = normalise(page.category || '');
  const keywords = (page.keywords || []).map(normalise);

  let score = 0;

  if (title === query) score += PAGE_WEIGHTS.TITLE_EXACT;
  if (title.startsWith(query)) score += PAGE_WEIGHTS.TITLE_STARTS_WITH;
  if (query.length >= 3 && title.includes(query)) score += PAGE_WEIGHTS.TITLE_CONTAINS_FULL;

  const titleHits = tokens.filter((t) => title.includes(t));
  if (titleHits.length === tokens.length && tokens.length > 0) {
    score += PAGE_WEIGHTS.TITLE_ALL_TOKENS;
  } else if (titleHits.length > 0) {
    score += PAGE_WEIGHTS.TITLE_ANY_TOKEN * titleHits.length;
  }

  for (const kw of keywords) {
    if (kw === query) {
      score += PAGE_WEIGHTS.KEYWORD_EXACT;
      break;
    }
    if (tokens.some((t) => kw.includes(t))) {
      score += PAGE_WEIGHTS.KEYWORD_ANY;
    }
  }

  if (category === query) score += PAGE_WEIGHTS.CATEGORY_EXACT;
  else if (category && query.includes(category)) score += PAGE_WEIGHTS.CATEGORY_CONTAINS;

  return score;
}

/**
 * Search a list of pages. Returns matches sorted by score (desc),
 * then by title (asc) for ties.
 *
 * @param {Array} pages    - array of page objects (title, url, category, keywords)
 * @param {string} query   - the raw user query
 * @param {Object} [opts]
 * @param {number} [opts.limit] - cap on results returned
 * @returns {Array} matching pages, ranked
 */
export function searchPages(pages, query, opts = {}) {
  const { limit = 0 } = opts;

  if (!Array.isArray(pages) || !query || !query.trim()) return [];

  const results = [];

  for (const page of pages) {
    const score = scorePage(page, query);
    if (score > 0) {
      results.push({ page, score });
    }
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const an = normalise(a.page.title || '');
    const bn = normalise(b.page.title || '');
    return an.localeCompare(bn);
  });

  const ranked = results.map((r) => r.page);
  return limit > 0 ? ranked.slice(0, limit) : ranked;
}

// Exported for tests / debugging
export { normalise, tokenise, scoreProduct, scorePage };