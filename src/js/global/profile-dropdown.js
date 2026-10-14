// ============================================
// PROFILE DROPDOWN
// ============================================
// Handles the profile/account dropdown menu with:
//   - Click-to-open on toggle button
//   - Click-outside-to-close
//   - ESC key to close
//   - Event delegation (works with dynamically injected markup)
//   - Only one dropdown open at a time
// ============================================

const wrapper_selector = '.user-access';
const toggle_selector = '.profile-toggle';
const active_class = 'active';

/**
 * Close all open profile dropdowns on the page.
 * @param {HTMLElement|null} except - Optional wrapper to keep open
 */
function closeAllDropdowns(except = null) {

  document.querySelectorAll(`${wrapper_selector}.${active_class}`).forEach((wrapper) => {

    if (wrapper !== except) {

      wrapper.classList.remove(active_class);

    }

  });
}

/**
 * Get the profile wrapper for a given element (or its ancestor).
 * @param {HTMLElement} el
 * @returns {HTMLElement|null}
 */
function getProfileWrapper(el) {

  return el ? el.closest(wrapper_selector) : null;

}

/**
 * Toggle a specific profile dropdown.
 * @param {HTMLElement} wrapper
 */
function toggleDropdown(wrapper) {

  const isOpen = wrapper.classList.contains(active_class);

  if (isOpen) {

    wrapper.classList.remove(active_class);

  } else {

    wrapper.classList.add(active_class);

  }

}

/**
 * Initialize the profile dropdown behavior.
 */
export function initProfileDropdown() {

  // 1. Click handler (delegated)
  document.addEventListener('click', function (e) {

    const toggleBtn = e.target.closest(toggle_selector);
    const currentWrapper = getProfileWrapper(toggleBtn);

    // Close every other dropdown first
    closeAllDropdowns(currentWrapper);

    // If the click was on a toggle, flip its wrapper
    if (currentWrapper) {

      e.preventDefault();

      toggleDropdown(currentWrapper);
      return;

    }

    // If click is inside a dropdown (but not on toggle), keep it open
    const insideDropdown = e.target.closest(`${wrapper_selector}.${active_class}`);
    if (insideDropdown) return;

    // Otherwise close all (click was outside)
    closeAllDropdowns();

  });

  // 2. ESC key closes all dropdowns
  document.addEventListener('keydown', function (e) {

    if (e.key === 'Escape') {

      closeAllDropdowns();

    }

  });

  // Sync aria-expanded on toggle buttons
  function syncAriaExpanded() {
    document.querySelectorAll(`${wrapper_selector}`).forEach((wrapper) => {
      const toggle = wrapper.querySelector(toggle_selector);
      if (!toggle) return;

      const isOpen = wrapper.classList.contains(active_class);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Call after every state change:
  syncAriaExpanded();

  console.log('✅ Profile dropdown ready.');

}