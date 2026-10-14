/**
 * SECTION 10: UNIFIED AUTHENTICATION & UI CONTROLLER
 */

import { openAuthOverlay, closeAuthOverlay } from './auth-overlay.js';

// --------------------------------------------
// 10.1. STATE READERS & GETTERS
// --------------------------------------------
export function getAuthState() {
    return {
        isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
        userName: localStorage.getItem('userName') || 'Guest',
        accountType: localStorage.getItem('accountType') || 'retail'
    };
}

export function isWholesaleActive() {
    const state = getAuthState();
    return state.isLoggedIn && state.accountType === 'wholesale';
}

// --------------------------------------------
// 10.2. HERO VIEW CONTROLLER (.show / .hide)
// --------------------------------------------
export function setHeroView(mode) {
    const views = document.querySelectorAll('.hero-view');
    views.forEach(view => {
        view.classList.remove('show');
        view.classList.add('hide');
    });

    const targetView = document.getElementById(`hero-${mode}-view`);
    if (targetView) {
        targetView.classList.remove('hide');
        targetView.classList.add('show');
    }
}

// --------------------------------------------
// 10.3. HEADER NAV & UI SYNCHRONIZER (WITH DOM RETRY)
// --------------------------------------------
export function updateAuthUI(isLoggedIn, userName, accountType) {
    const loggedIn = String(isLoggedIn) === 'true';
    const isWholesale = (accountType === 'wholesale');
    const name = userName && userName !== 'null' && userName !== 'undefined' ? userName : 'Customer';

    // Persist immediately to localStorage
    if (loggedIn) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', name);
        localStorage.setItem('accountType', isWholesale ? 'wholesale' : 'retail');

        if (isWholesale) {
            localStorage.setItem('wholesaleMode', 'true');
            localStorage.setItem('businessName', name);
        }
    }

    // Function to physically apply CSS classes & text to DOM
    function applyToDOM() {
        const userProfileEl = document.getElementById('profile-logged-out');
        const userProfileLoginEl = document.getElementById('profile-logged-in');
        const nameDisplays = document.querySelectorAll('.header-user-display');
        const pillText = document.getElementById('pillPricingText');
        const pricingPill = document.getElementById('pricing-status-pill');
        const userBadgeWrapper = document.getElementById('userBadgeWrapper');

        // Check if essential header elements exist yet
        if (!userProfileEl && !userProfileLoginEl && nameDisplays.length === 0) {
            return false; // Elements not in DOM yet!
        }

        if (loggedIn) {
            // Hide Login/Register dropdown link, show Logout wrapper
            if (userProfileEl) {
                userProfileEl.classList.remove('show');
                userProfileEl.classList.add('hide');
            }

            if (userProfileLoginEl) {
                userProfileLoginEl.classList.remove('hide');
                userProfileLoginEl.classList.add('show'); // Fixed syntax bug: removed trailing comma
            }

            // Update Name Badges
            nameDisplays.forEach(el => {
                el.textContent = name;
            });

            // Update Wholesale / Retail Status Badges
            if (isWholesale) {
                if (pillText) pillText.textContent = 'Wholesale';

                if (pricingPill) {
                    pricingPill.classList.remove('retail');
                    pricingPill.classList.add('wholesale');
                }

                if (userBadgeWrapper) {
                    userBadgeWrapper.classList.remove('retail');
                    userBadgeWrapper.classList.add('wholesale');
                }
            } else {
                if (pillText) pillText.textContent = 'Retail';

                if (pricingPill) {
                    pricingPill.classList.remove('wholesale');
                    pricingPill.classList.add('retail');
                }

                if (userBadgeWrapper) {
                    userBadgeWrapper.classList.remove('retail');
                    userBadgeWrapper.classList.add('retail');
                }
            }

            document.body.classList.toggle('wholesale-mode-active', isWholesale);

            // Update Product Price Badges
            document.querySelectorAll('.badge-orange, .badge-green').forEach(el => {
                el.textContent = isWholesale ? 'Wholesale' : 'Retail';
                el.classList.toggle('badge-green', isWholesale);
                el.classList.toggle('badge-orange', !isWholesale);
            });

            setHeroView(isWholesale ? 'wholesale' : 'retail');

        } else {
            // Guest Mode
            if (userProfileEl) {
                userProfileEl.classList.remove('hide');
                userProfileEl.classList.add('show');
            }

            if (userProfileLoginEl) {
                userProfileLoginEl.classList.remove('show');
                userProfileLoginEl.classList.add('hide');
            }

            if (pillText) pillText.textContent = 'Guest';
            document.body.classList.remove('wholesale-mode-active');

            // Update Product Price Badges
            document.querySelectorAll('.badge-orange, .badge-green').forEach(el => {
                el.textContent = isWholesale ? 'Wholesale' : 'Retail';
                el.classList.toggle('badge-green', isWholesale);
                el.classList.toggle('badge-orange', !isWholesale);
            });

            setHeroView('guest');
        }

        document.dispatchEvent(new CustomEvent('wholesaleModeChanged'));
        return true; // Successfully applied!
    }

    // Try applying immediately
    const success = applyToDOM();

    // If DOM wasn't ready, poll every 50ms until the header renders
    if (!success) {
        let attempts = 0;
        const interval = setInterval(function() {
            attempts++;
            if (applyToDOM() || attempts > 40) { // Stop after 2 seconds max
                clearInterval(interval);
            }
        }, 50);
    }
}

// --------------------------------------------
// 10.4. LOGOUT HANDLER
// --------------------------------------------
export function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('accountType');
    localStorage.removeItem('wholesaleMode');
    localStorage.removeItem('businessName');

    updateAuthUI(false);
    closeAuthOverlay();

    alert('You have logged out successfully.');
}

// --------------------------------------------
// 10.5. VIEW SWITCHER & MODAL CONTROLLER
// --------------------------------------------
export function showAuthView(view, authStatus, userName, accountType) {
    const allViews = document.querySelectorAll('.auth-view');
    if (allViews.length === 0) return;

    allViews.forEach(el => {
        el.classList.remove('show');
        el.classList.add('hide');
    });

    const viewMap = {
        login: 'authViewLogin',
        register: 'authViewRegister',
        success: 'authViewSuccess',
        orderSuccess: 'authViewOrderSuccess',
        orderError: 'authViewOrderError'
    };

    const target = document.getElementById(viewMap[view]);
    if (!target) return;

    target.classList.remove('hide');
    target.classList.add('show');

    if (view === 'success') {
        const isWholesale = (accountType === 'wholesale');

        target.querySelectorAll('.login').forEach(el => {
            el.classList.toggle('show', authStatus === 'login');
            el.classList.toggle('hide', authStatus !== 'login');
        });

        target.querySelectorAll('.register').forEach(el => {
            el.classList.toggle('show', authStatus === 'register');
            el.classList.toggle('hide', authStatus !== 'register');
        });

        target.querySelectorAll('#successBusinessName, .user-name-display').forEach(el => {
            const badge = isWholesale ? '🏢 Business Account' : '🛍️ Individual Account';
            el.innerHTML = `Welcome, <strong>${userName}</strong>! <span style="font-size: 0.85rem; color: #64748b;">(${badge})</span>`;
        });

        // Immediately persist & apply login session
        updateAuthUI(true, userName, accountType || 'retail');
    }

    openAuthOverlay();
}

// --------------------------------------------
// 10.6 & 10.7. INITIALIZER & EVENT LISTENERS
// --------------------------------------------
export function initAuthController() {
    // Global Logout Click Delegation
    document.addEventListener('click', function(e) {
        if (e.target && (e.target.id === 'logoutBtn' || e.target.classList.contains('logout-button'))) {
            e.preventDefault();
            handleLogout();
        }
    });

    // Page Load Auth Check
    function initializeAuthOnLoad() {
        console.log("🔍 Checking Auth on Page Load...");

        const rawLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const rawUserName = localStorage.getItem('userName');
        const rawAccountType = localStorage.getItem('accountType');
        
        console.log("Storage Values Found:", { rawLoggedIn, rawUserName, rawAccountType });
        
        const legacyWholesale = localStorage.getItem('wholesaleMode') === 'true';
        const legacyName = localStorage.getItem('businessName');

        let isLoggedIn = rawLoggedIn;
        let userName = rawUserName;
        let accountType = rawAccountType;

        if (!isLoggedIn && legacyWholesale) {
            console.log("✅ User is logged in! Attempting to update UI...");
            isLoggedIn = true;
            accountType = 'wholesale';
            userName = legacyName || 'Retailer';
        }

        if (isLoggedIn) {
            if (!accountType) accountType = legacyWholesale ? 'wholesale' : 'retail';
            if (!userName || userName === 'null') userName = legacyName || 'Customer';
            
            updateAuthUI(true, userName, accountType);
        } else {
            updateAuthUI(false);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAuthOnLoad);
    } else {
        initializeAuthOnLoad();
    }
}