// ============================================
// PRODUCT TABS — PDP TAB SWITCHER
// ============================================
// Owns: the tab bar on the product detail page (Description, Specs,
//       Reviews, Shipping, etc.).
// Scope: only tabs within `.product-tabs` containers.
//
// Usage:
//   import { initProductTabs } from './product-tabs.js';
//   initProductTabs();
//
// Emits 'productTabChanged' event with { id, panel, button } detail.
// ============================================

const CONTAINER_SELECTOR = '.product-tabs';
const BTN_SELECTOR = '.tab-btn';
const PANEL_SELECTOR = '.tab-panel';
const ACTIVE_CLASS = 'active';

let initialized = false;

// --------------------------------------------
// Core
// --------------------------------------------
function activateTab(container, btn) {
  if (!container || !btn) return;

  const btns = container.querySelectorAll(BTN_SELECTOR);
  const panels = container.querySelectorAll(PANEL_SELECTOR);
  const targetId = btn.getAttribute('data-tab');
  if (!targetId) return;

  const targetPanel = container.querySelector(`#${CSS.escape(targetId)}`);
  if (!targetPanel) return;

  // Deactivate all
  btns.forEach((b) => {
    b.classList.remove(ACTIVE_CLASS);
    b.setAttribute('aria-selected', 'false');
    b.setAttribute('tabindex', '-1');
  });
  panels.forEach((p) => {
    p.classList.remove(ACTIVE_CLASS);
    p.hidden = true;
  });

  // Activate selected
  btn.classList.add(ACTIVE_CLASS);
  btn.setAttribute('aria-selected', 'true');
  btn.setAttribute('tabindex', '0');
  targetPanel.classList.add(ACTIVE_CLASS);
  targetPanel.hidden = false;

  // Notify the rest of the app
  document.dispatchEvent(new CustomEvent('productTabChanged', {
    detail: { id: targetId, panel: targetPanel, button: btn },
  }));
}

// --------------------------------------------
// Keyboard navigation
// --------------------------------------------
function handleKeydown(e) {
  const btn = e.target.closest(BTN_SELECTOR);
  if (!btn) return;

  const container = btn.closest(CONTAINER_SELECTOR);
  if (!container) return;

  const btns = Array.from(container.querySelectorAll(BTN_SELECTOR));
  const index = btns.indexOf(btn);
  if (index === -1) return;

  let nextIndex = -1;

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      nextIndex = (index + 1) % btns.length;
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
      nextIndex = (index - 1 + btns.length) % btns.length;
      break;
    case 'Home':
      nextIndex = 0;
      break;
    case 'End':
      nextIndex = btns.length - 1;
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      activateTab(container, btn);
      return;
    default:
      return;
  }

  e.preventDefault();
  const nextBtn = btns[nextIndex];
  nextBtn.focus();
  activateTab(container, nextBtn);
}

// --------------------------------------------
// Init
// --------------------------------------------
function wireEvents() {
  if (initialized) return;
  initialized = true;

  document.addEventListener('click', (e) => {
    const btn = e.target.closest(BTN_SELECTOR);
    if (!btn) return;

    const container = btn.closest(CONTAINER_SELECTOR);
    if (!container) return;

    e.preventDefault();
    activateTab(container, btn);
  });

  document.addEventListener('keydown', handleKeydown);
}

function prepareMarkup(container) {
  // Set ARIA roles and initial state if not already present.
  const btns = container.querySelectorAll(BTN_SELECTOR);
  const panels = container.querySelectorAll(PANEL_SELECTOR);

  const tablist = container.querySelector('[role="tablist"]');
  if (tablist) tablist.setAttribute('role', 'tablist');

  btns.forEach((btn) => {
    const isActive = btn.classList.contains(ACTIVE_CLASS);
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    btn.setAttribute('tabindex', isActive ? '0' : '-1');

    const targetId = btn.getAttribute('data-tab');
    if (targetId) btn.setAttribute('aria-controls', targetId);
  });

  panels.forEach((panel) => {
    const isActive = panel.classList.contains(ACTIVE_CLASS);
    panel.setAttribute('role', 'tabpanel');
    panel.hidden = !isActive;
  });
}

export function initProductTabs() {
  const containers = document.querySelectorAll(CONTAINER_SELECTOR);

  if (containers.length === 0) {
    // Markup may be injected later (loader.js, or PDP sections loaded async).
    const observer = new MutationObserver(() => {
      if (document.querySelector(CONTAINER_SELECTOR)) {
        observer.disconnect();
        initProductTabs();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return;
  }

  containers.forEach(prepareMarkup);
  wireEvents();

  console.log('✅ Product tabs ready.');
}