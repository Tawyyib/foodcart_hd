// ============================================
// BUILD CATALOGUE
// ============================================
// Reads catalog-source.js, validates it, merges keywords from
// keywords.json, computes derived fields, and writes
// src/js/catalogue-data.js.
//
// Authoritative source: build/catalog-source.js
// Do not read product data from HTML.
//
// Usage: node build/build-catalogue.mjs
// ============================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

import { CATALOG_SOURCE } from './catalog-source.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'src', 'js','catalog', 'catalogue-data.js');
const KEYWORDS_FILE = path.join(__dirname, 'keywords.json');

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

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

// --------------------------------------------
// Validation
// --------------------------------------------
function validate(source, keywordsMap) {
  const errors = [];
  const warnings = [];

  const seenBaseSku = new Set();
  const seenVariantSku = new Set();

  source.forEach((product, idx) => {
    const id = product.baseSku || `#${idx}`;

    // --- Required product fields ---
    if (!product.baseSku) errors.push(`${id}: missing baseSku.`);
    if (!product.name) errors.push(`${id}: missing name.`);
    if (!product.category) errors.push(`${id}: missing category.`);
    if (!product.url) errors.push(`${id}: missing url.`);
    if (!Array.isArray(product.variants) || product.variants.length === 0) {
      errors.push(`${id}: missing or empty variants array.`);
      return;
    }

    // --- Duplicate base SKU ---
    if (product.baseSku) {
      if (seenBaseSku.has(product.baseSku)) {
        errors.push(`${id}: duplicate baseSku.`);
      }
      seenBaseSku.add(product.baseSku);
    }

    // --- URL existence ---
    if (product.url && !fileExists(product.url)) {
      warnings.push(`${id}: url "${product.url}" does not exist on disk.`);
    }

    // --- Variants ---
    product.variants.forEach((v, vIdx) => {
      const vid = `${id} variant[${vIdx}]`;

      if (!v.size) errors.push(`${vid}: missing size.`);
      if (!v.sku) errors.push(`${vid}: missing sku.`);

      if (v.sku) {
        if (seenVariantSku.has(v.sku)) {
          errors.push(`${vid}: duplicate variant sku "${v.sku}".`);
        }
        seenVariantSku.add(v.sku);
      }

      if (typeof v.priceRetail !== 'number' || v.priceRetail < 0) {
        errors.push(`${vid}: priceRetail must be a non-negative number.`);
      }
      if (typeof v.priceWholesale !== 'number' || v.priceWholesale < 0) {
        errors.push(`${vid}: priceWholesale must be a non-negative number.`);
      }
      if (typeof v.stock !== 'number' || v.stock < 0) {
        errors.push(`${vid}: stock must be a non-negative number.`);
      }
      if (typeof v.packSize !== 'number' || v.packSize < 1) {
        errors.push(`${vid}: packSize must be a positive number.`);
      }
      if (typeof v.moqPacks !== 'number' || v.moqPacks < 1) {
        errors.push(`${vid}: moqPacks must be a positive number.`);
      }
      if (!['all', 'registered', 'wholesale'].includes(v.visibility)) {
        errors.push(`${vid}: visibility must be "all", "registered", or "wholesale".`);
      }
    });
  });

  // --- Orphan keywords ---
  for (const sku of Object.keys(keywordsMap)) {
    if (!seenBaseSku.has(sku)) {
      warnings.push(`keywords.json: "${sku}" matches no product baseSku.`);
    }
  }

  return { errors, warnings };
}

// --------------------------------------------
// Enrichment
// --------------------------------------------
function deriveProductFields(product, keywordsMap) {
  const variants = (product.variants || []).slice();

  // Min retail and wholesale across variants
  const retailPrices = variants.map((v) => v.priceRetail).filter((n) => typeof n === 'number');
  const wholesalePrices = variants.map((v) => v.priceWholesale).filter((n) => typeof n === 'number');

  const priceRetail = retailPrices.length ? Math.min(...retailPrices) : 0;
  const priceWholesale = wholesalePrices.length ? Math.min(...wholesalePrices) : 0;

  // Effective visibility for the product = most restrictive variant
  const order = { all: 0, registered: 1, wholesale: 2 };
  const productVisibility = variants.reduce((acc, v) => {
    const vis = order[v.visibility] ?? 0;
    return vis > acc ? vis : acc;
  }, 0);
  const visibilityName = Object.keys(order).find((k) => order[k] === productVisibility) || 'all';

  // Bestseller flag — could also be authored per-product
  const bestseller = !!product.bestseller;

  return {
    baseSku: product.baseSku,
    name: product.name,
    category: product.category,
    url: product.url,
    image: product.image || null,
    imageAlt: product.imageAlt || product.name,
    variants,
    priceRetail,
    priceWholesale,
    visibility: visibilityName,
    bestseller,
    keywords: Array.isArray(keywordsMap[product.baseSku]) ? keywordsMap[product.baseSku].slice() : [],
  };
}

// --------------------------------------------
// Main
// --------------------------------------------
function main() {
  console.log('🔎 Building catalogue…');

  const keywordsMap = readKeywords();
  const { errors, warnings } = validate(CATALOG_SOURCE, keywordsMap);

  if (errors.length) {
    console.log('\n❌ Errors:');
    for (const e of errors) console.log(`   - ${e}`);
    console.log('\nAborting — fix errors and re-run.');
    process.exit(1);
  }

  const products = CATALOG_SOURCE.map((p) => deriveProductFields(p, keywordsMap));

  products.sort((a, b) =>
    (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
  );

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