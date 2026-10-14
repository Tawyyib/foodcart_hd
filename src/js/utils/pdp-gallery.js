// ============================================
// PDP GALLERY
// ============================================
// Owns: thumbnail clicks on the PDP gallery.
// Swaps the main image when a thumbnail is clicked.
//
// Scope: only runs if .pdp-gallery .thumbnail-grid is present.
// ============================================

const GALLERY_SELECTOR = '.pdp-gallery';
const THUMB_SELECTOR = '.thumbnail';
const MAIN_IMG_SELECTOR = '.pdp-picture .img';
const ACTIVE_CLASS = 'active';

let wired = false;

// --------------------------------------------
// Wire
// --------------------------------------------
function wire() {
  if (wired) return;
  wired = true;

  document.addEventListener('click', (e) => {
    const thumb = e.target.closest(THUMB_SELECTOR);
    if (!thumb) return;

    const gallery = thumb.closest(GALLERY_SELECTOR);
    if (!gallery) return;

    e.preventDefault();

    const img = thumb.querySelector('img');
    if (!img) return;

    const mainImg = gallery.querySelector(MAIN_IMG_SELECTOR);
    if (!mainImg) return;

    // Swap the main image
    mainImg.src = img.src;
    mainImg.alt = img.alt || mainImg.alt;

    // Update active state
    gallery.querySelectorAll(THUMB_SELECTOR).forEach((t) => {
      t.classList.toggle(ACTIVE_CLASS, t === thumb);
    });
  });
}

// --------------------------------------------
// Init
// --------------------------------------------
export function initPdpGallery() {
  const gallery = document.querySelector(GALLERY_SELECTOR);
  if (!gallery) return;

  wire();
  console.log('✅ PDP gallery ready.');
}