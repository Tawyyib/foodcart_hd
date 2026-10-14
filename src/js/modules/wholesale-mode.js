// ============================================
// WHOLESALE MODE
// ============================================
// Toggles the site between retail and wholesale pricing.
// Fires 'wholesaleModeChanged' event for other modules.
// ============================================

let isWholesale = false;
let initialized = false;

// ---- Element getters (lazy, resilient to DOM changes) ----
function getElements() {
  return {
    logoutDisplay: document.getElementById('logoutDisplay'),
    businessNameDisplay: document.getElementById('businessNameDisplay'),
    logoutBtn: document.getElementById('logoutBtn'),
    profile: document.getElementById('user-profile'),
    // wholeSaleProducts: document.querySelectorAll('.product-card[data-wholesale-only="true"]'),
  };
}

// ============================================
// TOGGLE
// ============================================
export function toggleWholesaleMode(enable, businessName) {
  isWholesale = enable;
  window.isWholesaleActive = enable;

  console.log(`🔄 ${enable ? 'ENABLING' : 'DISABLING'} wholesale mode...`);

  const els = getElements();

  // 1. Toggle body class
  document.body.classList.toggle('wholesale-mode-active', enable);
  document.body.classList.toggle('mode-wholesale', enable);

  // 3. Toggle logout display
  if (els.logoutDisplay) {
    els.logoutDisplay.style.display = enable ? 'inline-flex' : 'none';
  }

  // 4. Toggle profile dropdown
  if (els.profile) {
    els.profile.style.display = enable ? 'none' : 'block';
  }

  // 5. Update cart badge
  const cartBadge = document.querySelector('.cart-count, .cart-badge');
  if (cartBadge) {
    cartBadge.textContent = window.getCartCount?.() ?? cartBadge.textContent;
  }

  // 6. Update business name
  if (enable && els.businessNameDisplay) {
    els.businessNameDisplay.textContent =
      businessName || localStorage.getItem('businessName') || 'Retailer';
  } else if (!enable && els.businessNameDisplay) {
    els.businessNameDisplay.textContent = 'Retailer';
  }

  // 7. Persist state
  if (enable) {
    localStorage.setItem('wholesaleMode', 'true');
    if (businessName) localStorage.setItem('businessName', businessName);
  } else {
    localStorage.removeItem('wholesaleMode');
    localStorage.removeItem('businessName');
  }

  // 8. Dispatch event
  document.dispatchEvent(
    new CustomEvent('wholesaleModeChanged', {
      detail: { enabled: enable, businessName: businessName || '' },
    })
  );

  console.log(`✅ Switched to ${enable ? 'WHOLESALE' : 'RETAIL'} mode.`);
}

// 2. Toggle badges 
export function applyModeBadgeState(root = document, enable) {
  root.querySelectorAll('.badge-orange, .badge-green').forEach((el) => {
    el.textContent = enable ? 'Wholesale' : 'Retail';
    el.classList.toggle('badge-green', enable);
    el.classList.toggle('badge-orange', !enable);
  });
}

// ============================================
// LOGOUT
// ============================================
export function handleLogout() {
  console.log('🔓 Logout');
  toggleWholesaleMode(false);

  const profile = document.getElementById('user-profile');
  if (profile) profile.style.display = 'block';

  if (typeof window.closeAuthOverlay === 'function') {
    window.closeAuthOverlay();
  }
}

// ============================================
// LOGOUT LISTENER (with MutationObserver for injected header)
// ============================================
function attachLogoutListener() {
  const btn = document.getElementById('logoutBtn');
  if (!btn || btn._listenerAttached) return !!btn;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
    window.location.reload();
  });
  btn._listenerAttached = true;
  console.log('✅ Logout listener attached.');
  return true;
}

// ============================================
// RESTORE FROM STORAGE
// ============================================
function applyRestore() {
  const els = getElements();
  if (!els.businessNameDisplay) {
    setTimeout(applyRestore, 200);
    return;
  }

  const name = localStorage.getItem('businessName') || 'Retailer';
  els.businessNameDisplay.textContent = name;
  toggleWholesaleMode(true, name);
  console.log('✅ Restored wholesale mode.');
}

// ============================================
// INIT
// ============================================
export function initWholesaleMode() {
  if (initialized) return;
  initialized = true;

  // Expose toggle globally
  window.toggleWholesaleMode = toggleWholesaleMode;
  window.handleLogout = handleLogout;

  // Restore state
  if (localStorage.getItem('wholesaleMode') === 'true') {
    applyRestore();
  }

  // Attach logout listener (with retry)
  if (!attachLogoutListener()) {
    const observer = new MutationObserver(() => {
      if (attachLogoutListener()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  console.log('✅ Wholesale mode ready.');
}