// ============================================
// MOBILE MENU
// ============================================
// Toggles the mobile navigation drawer using
// event delegation so it works even when the
// header is injected dynamically.
// ============================================

const TOGGLE_SELECTOR = '#mobileToggle';
const NAV_SELECTOR = '.nav-links';
const ACTIVE_CLASS = 'active';

let initialized = false;

function closeMenu() {
  const nav = document.querySelector(NAV_SELECTOR);
  const btn = document.querySelector(TOGGLE_SELECTOR);

  if (nav) nav.classList.remove(ACTIVE_CLASS);
  if (btn) btn.textContent = '☰';
}

function toggleMenu(btn, nav) {
  nav.classList.toggle(ACTIVE_CLASS);

  const isOpen = nav.classList.contains(ACTIVE_CLASS);
  btn.textContent = isOpen ? '✕' : '☰';
}

export function initMobileMenu() {
  if (initialized) return;
  initialized = true;

  document.addEventListener('click', (e) => {
    // Handle toggle button
    const toggleBtn = e.target.closest(TOGGLE_SELECTOR);
    if (toggleBtn) {
      const nav = document.querySelector(NAV_SELECTOR);
      if (nav) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu(toggleBtn, nav);
      }
      return;
    }

    // Close when clicking a link inside the nav
    const navLink = e.target.closest(`${NAV_SELECTOR} a`);
    if (navLink) {
      closeMenu();
      return;
    }

    // Close when clicking outside
    const nav = document.querySelector(NAV_SELECTOR);
    if (
      nav &&
      nav.classList.contains(ACTIVE_CLASS) &&
      !nav.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) {
      closeMenu();
    }
  });

  console.log('✅ Mobile menu ready.');
}