// src/js/variant-from-query.js
// Reads ?size= from the URL on a PDP and activates the matching chip.

const QUERY_PARAM = 'size';

export function activateVariantFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const size = params.get(QUERY_PARAM);
  if (!size) return;

  // Find the chip matching the requested size
  const chip = document.querySelector(
    `.weight-selector .weight-chip[data-size="${CSS.escape(size)}"]`
  );
  if (!chip) return;

  // Already active? Nothing to do.
  if (chip.classList.contains('active')) return;

  // Use the same code path a click would trigger, if it's exposed.
  // Otherwise, simulate a click.
  chip.click();
}

// Auto-init on PDPs. Non-PDP pages simply won't have a matching chip.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', activateVariantFromQuery);
} else {
  activateVariantFromQuery();
}