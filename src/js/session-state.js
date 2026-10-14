// ============================================
// SESSION STATE
// ============================================
// Owns: the current buyer tier (guest | retail | wholesale).
// Reads: from body class for now.
// Will read from auth when auth is wired.
//
// Emits: 'buyerTierChanged' event when the tier changes.
// ============================================

const TIER_CLASSES = {
  'is-guest': 'guest',
  'is-retail': 'retail',
  'is-wholesale': 'wholesale',
};

let wired = false;

// --------------------------------------------
// Getters
// --------------------------------------------
export function getBuyerTier() {
  for (const [cls, tier] of Object.entries(TIER_CLASSES)) {
    if (document.body.classList.contains(cls)) return tier;
  }
  return 'guest';
}

// --------------------------------------------
// Setters
// --------------------------------------------
export function setBuyerTier(tier) {
  const current = getBuyerTier();
  if (current === tier) return;

  // Remove all tier classes
  Object.keys(TIER_CLASSES).forEach((cls) => document.body.classList.remove(cls));

  // Add the new one
  const cls = Object.keys(TIER_CLASSES).find((k) => TIER_CLASSES[k] === tier);
  if (cls) document.body.classList.add(cls);

  document.dispatchEvent(new CustomEvent('buyerTierChanged', {
    detail: { tier, previous: current },
  }));
}

// --------------------------------------------
// Init (marker only, no wiring yet)
// --------------------------------------------
export function initSessionState() {
  if (wired) return;
  wired = true;

  // Ensure a class exists on body
  if (!Object.keys(TIER_CLASSES).some((cls) => document.body.classList.contains(cls))) {
    document.body.classList.add('is-guest');
  }

  console.log('✅ Session state ready (tier:', getBuyerTier() + ').');
}