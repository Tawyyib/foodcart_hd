// ============================================
// THEME MODE SWITCHER
// ============================================
// Handles light/dark theme toggling with:
//   - localStorage persistence
//   - OS preference fallback on first visit
//   - Event delegation (works with dynamically injected buttons)
//   - Custom event dispatch for other modules to react
// ============================================

const STORAGE_KEY = 'theme';
const THEME_ATTR = 'data-theme';

/**
 * Apply a theme to the document root.
 * @param {string} theme - 'light' or 'dark'
 */
function applyTheme(theme) {
  document.documentElement.setAttribute(THEME_ATTR, theme);

  // Dispatch event so other modules can react
  document.dispatchEvent(
    new CustomEvent('themeChanged', { detail: { theme } })
  );
}

/**
 * Get the initial theme based on:
 *   1. Saved preference (localStorage)
 *   2. OS preference (prefers-color-scheme)
 *   3. Fallback: 'light'
 * @returns {string} - 'light' or 'dark'
 */
function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/**
 * Toggle between light and dark themes.
 */
function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute(THEME_ATTR) || 'light';
  const next = current === 'dark' ? 'light' : 'dark';

  applyTheme(next);
  localStorage.setItem(STORAGE_KEY, next);

  console.log(`🎨 Theme switched to: ${next}`);
}

/**
 * Initialize the theme mode switcher.
 */
export function initThemeToggle() {

  // 1. Apply theme immediately to prevent FOUC
  applyTheme(getInitialTheme());

  // 2. Use event delegation for dynamically injected toggle buttons
  document.addEventListener('click', function (event) {

    const toggleBtn = event.target.closest('#theme-toggle, .btn-theme-toggle');
    if (!toggleBtn) return;

    event.preventDefault();
    toggleTheme();

  });

  // 3. Listen for OS theme changes (only if user hasn't set a preference)
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {

      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }

    });

  console.log('✅ Theme mode switcher ready.');
  
}