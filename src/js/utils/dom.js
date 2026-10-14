// ============================================
// DOM UTILITIES
// ============================================

/**
 * Toggle visibility and disabled state for a set of elements.
 * @param {HTMLElement[]} elements
 * @param {boolean} enabled - true = visible + interactive
 */
export function setElementsState(elements, enabled) {
  elements.forEach((el) => {
    if (!el) return;

    el.disabled = !enabled;
    el.classList.toggle('is-hidden', !enabled);
    el.classList.toggle('is-disabled', !enabled);
  });
}

/**
 * Hide an element (display: none).
 */
export function hideElement(el) {
  if (!el) return;
  el.classList.add('is-hidden');
  el.classList.remove('is-disabled');
}

/**
 * Show an element.
 */
export function showElement(el) {
  if (!el) return;
  el.classList.remove('is-hidden');
}

/**
 * Disable an element (visible but not interactive).
 */
export function disableElement(el) {
  if (!el) return;
  el.disabled = true;
  el.classList.add('is-disabled');
  el.classList.remove('is-hidden');
}

/**
 * Enable an element.
 */
export function enableElement(el) {
  if (!el) return;
  el.disabled = false;
  el.classList.remove('is-disabled', 'is-hidden');
}

/**
 * Query a single element with optional scope.
 */
export function $(selector, scope = document) {
  return scope.querySelector(selector);
}

/**
 * Query multiple elements as an array.
 */
export function $$(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/**
 * Filter falsy values out of an array.
 * Useful for `[el1, el2, el3].filter(Boolean)`.
 */
export function compact(arr) {
  return arr.filter(Boolean);
}