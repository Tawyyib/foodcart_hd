// ============================================
// BACK TO TOP
// ============================================
// Robust against DOM replacements caused by other modules
// (e.g., profile dropdown re-rendering the header).
// ============================================

const btn_selector = '#backToTopBtn, .back-to-top-btn';
const show_threshold = 180;
const scroll_debounce = 100;
const sync_debounce = 200;

let observer = null;
let syncTimer = null;
let scrollBound = false;
let clickBound = false;

/**
 * Smooth-scroll to the top of the page.
 */
function scrollToTop(e) {
  if (e) e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });

  document.querySelectorAll('[data-scroll-container]').forEach((el) => {
    if (el.scrollTop > 0) el.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * Lazily resolve the current active button — never cached globally.
 * This avoids stale references after DOM replacements.
 */
function getActiveButton() {
  const allBtns = Array.from(document.querySelectorAll(btn_selector));

  if (allBtns.length === 0) return null;

  // Prefer button inside footer
  const footerBtn = allBtns.find(
    (btn) => btn.closest('footer') || btn.closest('.site-footer')
  );
  const target = footerBtn || allBtns[0];

  // Remove duplicates
  allBtns.forEach((btn) => {
    if (btn !== target) btn.remove();
  });

  return target;
}

/**
 * Create a fallback button if the footer never injects one.
 */
function createFallbackButton() {
  const btn = document.createElement('button');
  btn.id = 'backToTopBtn';
  btn.className = 'back-to-top-btn';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Scroll back to top');
  btn.innerHTML = '↑';
  document.body.appendChild(btn);
  return btn;
}

/**
 * Ensure a button exists and has the click handler.
 */
function ensureButton() {
  let btn = getActiveButton();

  if (!btn) {
    btn = createFallbackButton();
  }

  if (!btn._bound) {
    btn.addEventListener('click', scrollToTop);
    btn._bound = true;
  }

  return btn;
}

/**
 * Update the visibility of the button based on scroll position.
 * Resolves the button lazily — safe even if DOM changed.
 */
function updateButtonVisibility() {
  const scrolled = window.scrollY || document.documentElement.scrollTop || 0;
  const btn = getActiveButton();
  if (!btn) return;

  btn.classList.toggle('show', scrolled > show_threshold);
}

/**
 * Debounced sync — called when DOM changes.
 */
function scheduleSync() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    ensureButton();
    updateButtonVisibility();
  }, sync_debounce);
}

/**
 * Initialize the back-to-top controller.
 */
export function initBackToTop() {
  // 1. Ensure the button exists immediately
  ensureButton();

  // 2. Bind scroll listener (window-scoped, once)
  if (!scrollBound) {
    window.addEventListener(
      'scroll',
      () => {
        clearTimeout(window._bttScrollTimer);
        window._bttScrollTimer = setTimeout(updateButtonVisibility, scroll_debounce);
      },
      { passive: true }
    );
    scrollBound = true;
  }

  // 3. Bind the click handler via delegation (bulletproof)
  if (!clickBound) {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest(btn_selector);
      if (btn) scrollToTop(e);
    });
    clickBound = true;
  }

  // 4. Observe DOM changes (debounced) — tolerate other modules replacing nodes
  if (!observer) {
    observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  console.log('✅ Back to Top ready.');
}