// ============================================
// BUILD CATALOGUE
// ============================================
// Walks every .html file in the project root, extracts every
// .product-card, merges keywords.json, dedupes by BASE SKU, and
// writes src/js/catalogue-data.js as an ES module.
//
// Base SKU vs variant SKU:
//   data-base-sku="rice-001"   ← product identity (search, dedupe, keywords)
//   data-sku="rice-001-5kg"    ← variant identity (cart line items)
// If data-base-sku is missing, data-sku is used as a fallback.
//
// Usage: node build/build-catalogue.mjs
// ============================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'src', 'js', 'catalogue-data.js');
const KEYWORDS_FILE = path.join(__dirname, 'keywords.json');

// Pages we never scan for product cards.
const EXCLUDE_FILES = new Set([
  'search.html',
  'cart.html',
  'mini-cart.html',
  'checkout.html',
  'register.html',
  'login.html',
  'header.html',
  'footer.html',
]);

// Directories we never descend into.
const EXCLUDE_DIRS = new Set([
  'node_modules',
  'src',
  'build',
  'dist',
  'includes',
  'public',
  '.git',
  '.vscode',
  '.idea',
]);

// Tracks cards skipped per source file so we can emit one warning per
// file instead of one warning per card.
const skipCounts = new Map();

// --------------------------------------------
// Helpers
// --------------------------------------------
function readKeywords() {
  if (!fs.existsSync(KEYWORDS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(KEYWORDS_FILE, 'utf8'));
  } catch (err) {
    console.warn(`⚠️  Could not parse keywords.json: ${err.message}`);
    return {};
  }
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function normaliseUrl(href, fromFile) {
  const absolute = path.resolve(path.dirname(fromFile), href);
  return toPosix(path.relative(ROOT, absolute));
}

function textOrNull(node) {
  const t = node.text().trim();
  return t || null;
}

// --------------------------------------------
// Card extraction
// --------------------------------------------
function extractCard($, el, sourceFile, keywordsMap) {
  const card = $(el);

  // Base SKU = product identity. Falls back to variant SKU if absent.
  const baseSku = card.attr('data-base-sku') || card.attr('data-sku') || null;

  if (!baseSku) {
    const key = toPosix(path.relative(ROOT, sourceFile));
    skipCounts.set(key, (skipCounts.get(key) || 0) + 1);
    return null;
  }

  const title = textOrNull(card.find('.title').first());
  const name = card.attr('data-name') || title;
  const bestseller = card.hasClass('bestseller');

  const category = (card.attr('data-category') || '').toLowerCase() || null;

  const priceRetail = parseFloat(card.attr('data-price-retail')) || null;
  const priceWholesale = parseFloat(card.attr('data-price-wholesale')) || null;

  const viewLink = card.find('a.btn-primary[href]').first();
  const href = viewLink.attr('href');
  const url = href ? normaliseUrl(href, sourceFile) : null;

  const imgEl = card.find('img').first();
  const image = imgEl.attr('src') || null;
  const imageAlt = imgEl.attr('alt') || name || '';

  const wholesaleOnly = card.hasClass('wholesale');
  const offer = card.attr('data-offer') === 'true';

  const description =
    card.attr('data-description') ||
    textOrNull(card.find('.desc, .description').first()) ||
    null;

  // Keywords are keyed by base SKU.
  let keywords = [];
  if (Array.isArray(keywordsMap[baseSku])) {
    keywords = keywordsMap[baseSku].slice();
  }

  const relSource = toPosix(path.relative(ROOT, sourceFile));

  return {
    baseSku,
    name: name || '',
    title: title || name || '',
    category,
    bestseller,
    priceRetail,
    priceWholesale,
    url,
    image,
    imageAlt,
    wholesaleOnly,
    offer,
    description,
    keywords,
    source: relSource,
    sources: [relSource],
  };
}

// --------------------------------------------
// File walking
// --------------------------------------------
function findHtmlFiles(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      findHtmlFiles(full, results);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.html')) continue;
    if (EXCLUDE_FILES.has(entry.name)) continue;

    results.push(full);
  }

  return results;
}

// --------------------------------------------
// Main
// --------------------------------------------
function main() {
  console.log('🔎 Building catalogue…');

  skipCounts.clear();

  const keywordsMap = readKeywords();
  const warnings = [];
  const files = findHtmlFiles(ROOT);

  files.forEach((f) => console.log('   →', toPosix(path.relative(ROOT, f))));
  console.log(`   Scanning ${files.length} HTML files…`);

  const byBaseSku = new Map();

  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html);

    $('.product-card').each((_, el) => {
      const product = extractCard($, el, file, keywordsMap);
      if (!product) return;

      const key = product.baseSku;
      const existing = byBaseSku.get(key);

      if (!existing) {
        byBaseSku.set(key, product);
        return;
      }

      // Merge fields: prefer non-null values, keep first-seen otherwise.
      if (!existing.url && product.url) existing.url = product.url;
      if (!existing.image && product.image) existing.image = product.image;
      if (!existing.description && product.description) existing.description = product.description;
      if (!existing.category && product.category) existing.category = product.category;
      if (!existing.bestseller && product.bestseller) existing.bestseller = true;

      // Merge keywords (union).
      const merged = new Set([...(existing.keywords || []), ...(product.keywords || [])]);
      existing.keywords = [...merged];

      // Track every source file a product appeared in (useful for debugging).
      if (!Array.isArray(existing.sources)) {
        existing.sources = existing.source ? [existing.source] : [];
      }
      if (product.source && !existing.sources.includes(product.source)) {
        existing.sources.push(product.source);
      }
    });
  }

  const products = [...byBaseSku.values()];

  products.sort((a, b) =>
    (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
  );

  // Warn about orphan keyword entries (SKU in keywords.json, no card).
  const seenBaseSkus = new Set(products.map((p) => p.baseSku).filter(Boolean));
  for (const sku of Object.keys(keywordsMap)) {
    if (!seenBaseSkus.has(sku)) {
      warnings.push(`keywords.json: sku "${sku}" matches no card — check spelling.`);
    }
  }

  // Warn about products missing a URL — they can't be linked from search.
  for (const p of products) {
    if (!p.url) {
      warnings.push(`No View link for "${p.name}" (${p.baseSku || 'no base-sku'}) in ${p.source}.`);
    }
  }

  // Emit one warning per file with skipped cards.
  for (const [file, n] of skipCounts.entries()) {
    warnings.push(`${file}: ${n} card(s) skipped — no data-base-sku.`);
  }

  const banner =
    '// AUTO-GENERATED by build/build-catalogue.mjs — do not edit by hand.\n' +
    `// Generated: ${new Date().toISOString()}\n` +
    `// Products: ${products.length}\n\n`;

  const body =
    `export const CATALOGUE = ${JSON.stringify(products, null, 2)};\n\n` +
    `export const CATALOGUE_META = ${JSON.stringify(
      { generatedAt: new Date().toISOString(), count: products.length },
      null,
      2
    )};\n`;

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, banner + body, 'utf8');

  console.log(`✅ Wrote ${products.length} products to ${toPosix(path.relative(ROOT, OUTPUT))}`);

  if (warnings.length) {
    console.log('\n⚠️  Warnings:');
    for (const w of warnings) console.log(`   - ${w}`);
  }
}

main();