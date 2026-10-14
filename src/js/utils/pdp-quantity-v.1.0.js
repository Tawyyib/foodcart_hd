// ============================================
// PDP QUANTITY
// ============================================
// Owns: the qty stepper (+, −) and the qty input on the PDP.
// Enforces: min (retail 1, wholesale 10).
// Reacts to: mode changes and variant changes (via the select).
//
// Scope: only runs if .pdp-summary .qty-add is present.
// ============================================

const ROOT_SELECTOR = '.pdp-summary .qty-add';
const STEP_DECREASE = 'qty-decrease';
const STEP_INCREASE = 'qty-increase';

const RETAIL_MIN = 1;
const WHOLESALE_MIN = 10;

let wired = false;

// --------------------------------------------
// Helpers
// --------------------------------------------
function isWholesaleActive() {
  if (typeof window.isWholesaleActive === 'function') {
    return window.isWholesaleActive();
  }
  return localStorage.getItem('wholesaleMode') === 'true';
}

function getRoot() {
  return document.querySelector(ROOT_SELECTOR);
}

function getInput(root) {
  return root ? root.querySelector('.qty-count') : null;
}

function clamp(value, min, max) {
  const n = parseInt(value, 10);
  if (isNaN(n)) return min;
  if (n < min) return min;
  if (max != null && n > max) return max;
  return n;
}

// --------------------------------------------
// Apply mode
// --------------------------------------------
function applyMode(root) {
  const input = getInput(root);
  if (!input) return;

  const wholesale = isWholesaleActive();
  const newMin = wholesale ? WHOLESALE_MIN : RETAIL_MIN;
  const oldMin = parseInt(input.min, 10) || RETAIL_MIN;
  const current = parseInt(input.value, 10) || newMin;

  // If the current value equals the previous mode's default, and the
  // mode has changed, adopt the new mode's default. Otherwise preserve
  // whatever the user typed (unless it's below the new min).
  const oldDefault = oldMin;
  const shouldReset = current === oldDefault && oldMin !== newMin;

  input.min = String(newMin);
  if (shouldReset || current < newMin) {
    input.value = String(newMin);
  }

  // MOQ label visibility
  const moq = root.querySelector('.moq');
  if (moq) moq.hidden = !wholesale;
}

// --------------------------------------------
// Stepper
// --------------------------------------------
function step(root, delta) {
  const input = getInput(root);
  if (!input) return;

  const min = parseInt(input.min, 10) || RETAIL_MIN;
  const current = parseInt(input.value, 10) || min;
  input.value = String(clamp(current + delta, min, null));

  input.dispatchEvent(new Event('input', { bubbles: true }));
}

// --------------------------------------------
// Wiring
// --------------------------------------------
function wire() {
  if (wired) return;
  wired = true;

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.pdp-qty__btn');
    if (!btn) return;

    const root = getRoot();
    if (!root || !root.contains(btn)) return;

    e.preventDefault();
    const action = btn.dataset.action;

    if (action === STEP_INCREASE) step(root, 1);
    else if (action === STEP_DECREASE) step(root, -1);
  });

  // Clamp on manual input
  document.addEventListener('change', (e) => {
    const input = e.target.closest('.qty-count');
    if (!input) return;

    const root = getRoot();
    if (!root || !root.contains(input)) return;

    const min = parseInt(input.min, 10) || RETAIL_MIN;
    input.value = String(clamp(input.value, min, null));
  });

  // React to mode changes
  document.addEventListener('wholesaleModeChanged', () => {
    const root = getRoot();
    if (root) applyMode(root);
  });
}

// --------------------------------------------
// Init
// --------------------------------------------
export function initPdpQuantity() {
  const root = getRoot();
  if (!root) return;

  wire();
  applyMode(root);

  console.log('✅ PDP quantity ready.');
}