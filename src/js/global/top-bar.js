// ============================================
// TOP BAR — Multi-Context Notice Controller
// ============================================
console.log('📦 top-bar.js module loaded');

const storage_key = 'foodcart_notice_dismissed_at';
const notice_id = 'siteNoticeBar';
const collapse_class = 'collapsed';
const collapse_duration = 300;
const rotate_interval = 6000;

// ---- Dismissal timeout ----
// How long before the bar re-appears after being dismissed.
// Examples:
//   30 * 60 * 1000        → 30 minutes
//   2  * 60 * 60 * 1000   → 2 hours
//   24 * 60 * 60 * 1000   → 24 hours
const dismiss_timeout = 2 * 60 * 60 * 1000; // 2 hours

let rotationTimer = null;
let currentIndex = 0;
let initialized = false;

// ---- Context detection (unchanged) ----
function getVisitorContext() {
  const explicit = document.body.dataset.context;
  if (explicit) return explicit;

  if (localStorage.getItem('wholesaleMode') === 'true') return 'wholesale';
  if (localStorage.getItem('userLoggedIn') === 'true') return 'retail';
  return 'guest';
}

// ---- Priority resolution (unchanged) ----
function getMatchingNotices(noticeBar) {
  const context = getVisitorContext();
  const notices = [...noticeBar.querySelectorAll('.notice-content')];

  const matching = notices.filter((el) => {
    const ctx = el.dataset.notice;
    return ctx === context || ctx === 'promo';
  });

  return matching.sort(
    (a, b) => (parseInt(b.dataset.priority) || 0) - (parseInt(a.dataset.priority) || 0)
  );
}

// ---- Show one notice (unchanged) ----
function showNotice(noticeBar, index = 0) {
  const notices = getMatchingNotices(noticeBar);

  noticeBar.querySelectorAll('.notice-content').forEach((el) =>
    el.classList.remove('is-active')
  );

  if (notices.length === 0) return;

  notices[index % notices.length].classList.add('is-active');
}

// ---- Rotation (unchanged) ----
function stopRotation() {
  if (rotationTimer) clearInterval(rotationTimer);
  rotationTimer = null;
}

function startRotation(noticeBar) {
  stopRotation();
  const notices = getMatchingNotices(noticeBar);
  if (notices.length <= 1) return;

  rotationTimer = setInterval(() => {
    currentIndex = (currentIndex + 1) % notices.length;
    showNotice(noticeBar, currentIndex);
  }, rotate_interval);
}

// ---- Dismiss state (UPDATED: timestamp-based) ----

/**
 * Check whether the notice bar is still in its dismissal window.
 * @returns {boolean} true if dismissed AND within timeout
 */
function isDismissed() {
  const raw = localStorage.getItem(storage_key);
  if (!raw) return false;

  try {
    const { at, ttl } = JSON.parse(raw);
    if (Date.now() - at < ttl) return true;

    // Expired → clear
    localStorage.removeItem(storage_key);
    return false;
  } catch {
    // Corrupt data → treat as not dismissed
    localStorage.removeItem(storage_key);
    return false;
  }
}

/**
 * Store the dismissal timestamp.
 */
function markDismissed() {
  localStorage.setItem(storage_key, Date.now().toString());
}

// ---- Hide instantly (unchanged, but respects timeout) ----
function hideInstantly() {
  const style = document.createElement('style');
  style.id = 'notice-bar-dismissed';
  style.textContent = `#${notice_id} { display: none !important; }`;
  document.head.appendChild(style);
}

// ---- Collapse on click (UPDATED) ----
function collapseNotice(noticeBar) {
  stopRotation();
  const timeout = parseInt(noticeBar.dataset.dismissTimeout, 10) || dismiss_timeout;

  noticeBar.classList.add(collapse_class);
  localStorage.setItem(storage_key, JSON.stringify({
    at: Date.now(),
    ttl: timeout
  }));

  setTimeout(() => {
    noticeBar.style.display = 'none';
  }, collapse_duration);
}

// ---- Core initialization (unchanged) ----
function setupTopBar(noticeBar) {
  if (initialized) return;
  initialized = true;

  showNotice(noticeBar, 0);

  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('#closeNoticeBtn, [data-notice-close]');
    if (!closeBtn) return;

    e.preventDefault();
    const bar = document.getElementById(notice_id) || closeBtn.closest('.top-bar');
    if (bar) collapseNotice(bar);
  });

  document.addEventListener('contextChanged', () => {
    if (!isDismissed()) {
      showNotice(noticeBar, 0);
      currentIndex = 0;
    }
  });

  console.log('✅ Top bar ready.');
}

// ---- Init (unchanged) ----
export function initTopBar() {
  console.log('🔍 initTopBar() called');

  if (isDismissed()) {
    console.log('⏸️ Top bar dismissed recently — hiding for now.');
    hideInstantly();
    return;
  }

  const existingBar = document.getElementById(notice_id);
  if (existingBar) {
    setupTopBar(existingBar);
    return;
  }

  console.log('⏳ Waiting for #siteNoticeBar to be injected...');

  const observer = new MutationObserver(() => {
    const bar = document.getElementById(notice_id);
    if (bar) {
      console.log('✅ #siteNoticeBar detected');
      observer.disconnect();
      setupTopBar(bar);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    const bar = document.getElementById(notice_id);
    if (bar) {
      clearInterval(interval);
      observer.disconnect();
      setupTopBar(bar);
    } else if (attempts > 20) {
      clearInterval(interval);
      observer.disconnect();
      console.warn('⚠️ #siteNoticeBar not found after 20 attempts.');
    }
  }, 300);
}