/**
 * SECTION 5: HERO TABS & SWIPE GESTURES MODULE
 */

let touchStartX = 0;
let touchEndX = 0;
const minSwipeDistance = 50; // Minimum pixel swipe distance required to trigger action

/**
 * Switches mobile view between retail and wholesale hero tabs.
 * @param {'retail' | 'wholesale'} mode 
 */
export function switchHeroTab(mode) {
    const retailCol = document.querySelector('.hero-col.retail');
    const wholesaleCol = document.querySelector('.hero-col.wholesale');
    const buttons = document.querySelectorAll('.hero-toggle-btn');

    if (window.innerWidth > 767.98) return;
    if (!retailCol || !wholesaleCol) return;

    buttons.forEach(btn => btn.classList.remove('active'));

    if (mode === 'retail') {
        if (buttons[0]) buttons[0].classList.add('active');
        retailCol.classList.remove('mobile-hide');
        retailCol.classList.add('mobile-show');

        wholesaleCol.classList.remove('mobile-show');
        wholesaleCol.classList.add('mobile-hide');
    } else {
        if (buttons[1]) buttons[1].classList.add('active');
        wholesaleCol.classList.remove('mobile-hide');
        wholesaleCol.classList.add('mobile-show');

        retailCol.classList.remove('mobile-show');
        retailCol.classList.add('mobile-hide');
    }
}

function handleSwipeGesture() {
    const distance = touchEndX - touchStartX;

    // Ensure screen is mobile-sized before triggering swipe behavior
    if (window.innerWidth > 768) return;

    // Swipe Left -> Show Wholesalers
    if (distance < -minSwipeDistance) {
        switchHeroTab('wholesale');
    }
    // Swipe Right -> Show Shoppers
    else if (distance > minSwipeDistance) {
        switchHeroTab('retail');
    }
}

/**
 * Binds touch/swipe gesture listeners to the guest hero view container.
 */
export function initHeroSwipe() {
    const heroContainer = document.getElementById('hero-guest-view');
    if (!heroContainer) return;

    // Capture initial touch coordinates
    heroContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    // Capture final touch coordinates and evaluate swipe direction
    heroContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, { passive: true });
}

// Auto-initialize listeners when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroSwipe);
} else {
    initHeroSwipe();
}