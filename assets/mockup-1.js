// let appInitialized = false;

/*
(function initAppNav() {
 
    if (appInitialized) return;
    appInitialized = true;

    // 1. Get all page sections
    const sections = {
        home: document.querySelector('.page-home'),
        shop: document.querySelector('.page-shop'),
        pdp: document.querySelector('.page-pdp'),
        cart: document.querySelector('.page-cart'),
        checkout: document.querySelector('.page-checkout')
    };
    
    const radios = document.querySelectorAll('input[name="page"]');

    // 2. Function to show a specific page
    function showPage(pageId) {

        // 1. Close mobile menu (if open)
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) navLinks.classList.remove('active');

        // 2. Hide all sections
        Object.values(sections).forEach(section => {

            //if (section) section.style.display = 'none';

        });

        // 3. Show the selected section
        const target = sections[pageId];
        if (target) target.style.display = 'block';

        // 4. Update nav label highlighting
        document.querySelectorAll('.nav-links label').forEach(label => {

            label.classList.remove('active-radio');

        });

        document.querySelectorAll('.nav-links label').forEach(label => {

            if (label.getAttribute('for') === 'page-' + pageId) {

                label.classList.add('active-radio');

            }

        });

    }

    // 3. Attach change event to each radio
    radios.forEach(radio => {

        radio.addEventListener('change', function() {

            if (this.checked) {

                const pageId = this.id.replace('page-', '');
                showPage(pageId);

            }

        });
        
    });

    // 4. Set initial state: show Home
    const checkbox = document.getElementById('page-home');
    if (checkbox) {
        checkbox.checked = true;
    }
        
    showPage('home');

    // 5. Mobile hamburger toggle (with null check)
    const hamburger = document.querySelector('.mobile-toggle');
    if (hamburger) {

        hamburger.addEventListener('click', function() {

            const nav = document.querySelector('.nav-links');
            if (nav) nav.classList.toggle('active');

        });

    }

})();
*/

// ---- PAGE NAVIGATION CONTROLLER ----
// This runs once when the page loads.
/**
(function initApp() {

    // 1. Get all page sections
    const sections = {
        home: document.querySelector('.page-home'),
        shop: document.querySelector('.page-shop'),
        pdp: document.querySelector('.page-pdp'),
        cart: document.querySelector('.page-cart'),
        checkout: document.querySelector('.page-checkout')
    };

    const radios = document.querySelectorAll('input[name="page"]');

    // 2. Function to show a specific page
    function showPage(pageId) {

        // 2.a. Close mobile menu (if open)
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) navLinks.classList.remove('active');

        // 2.b. Hide all sections
        Object.values(sections).forEach(section => {
            if (section) section.style.display = 'none';
        });

        // 2.c. Show the selected section
        const target = sections[pageId];
        if (target) target.style.display = 'block';

        // 2.d. Update nav label highlighting
        document.querySelectorAll('.nav-links label').forEach(label => {

            label.classList.remove('active-radio');

        });

        document.querySelectorAll('.nav-links label').forEach(label => {

            if (label.getAttribute('for') === 'page-' + pageId) {

                label.classList.add('active-radio');

            }

        });

    }

    // 3. Attach change event to each radio
    radios.forEach(radio => {

        radio.addEventListener('change', function() {

            if (this.checked) {

                const pageId = this.id.replace('page-', '');
                showPage(pageId);

            }

        });

    });

    // 4. Set initial state: show Home
    document.getElementById('page-home').checked = true;
    showPage('home');

    // 5. Mobile hamburger toggle (with null check)
    const hamburger = document.querySelector('.mobile-toggle');
    if (hamburger) {

        hamburger.addEventListener('click', function() {

            const nav = document.querySelector('.nav-links');
            if (nav) nav.classList.toggle('active');

        });

    }

})(); // <-- This immediately invokes the function
**/

/*

document.addEventListener('DOMContentLoaded', function() {

    const toggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav-links');
    
    if (toggle && nav) {

        toggle.addEventListener('click', function(e) {
            
            if (nav) {
                e.preventDefault();
                nav.classList.toggle('active');
                // Optional: change icon text
                this.textContent = nav.classList.contains('active') ? '✕' : '☰';
                console.log(document.querySelector('.mobile-toggle'));
                console.log('Menu toggled. Active:', nav.classList.contains('active'));

            }
        });
    }
});

(function() {

    const btn = document.getElementById('mobileToggle');
    const nav = document.querySelector('.nav-links');
    
    if (btn && nav) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Explicit toggle (add/remove instead of toggle())
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                this.textContent = '☰';
            } else {
                nav.classList.add('active');
                this.textContent = '✕';
            }
            
            // Debug log (remove after testing)
            console.log('Menu active:', nav.classList.contains('active'));
        });
    }
})();

(function() {

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        const btn = document.getElementById('mobileToggle');
        const nav = document.querySelector('.nav-links');
        
        if (!btn) {
            console.warn('Mobile toggle button not found!');
            return;
        }
        if (!nav) {
            console.warn('Nav links not found!');
            return;
        }

        // Remove any existing inline onclick to prevent conflicts
        btn.removeAttribute('onclick');

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Explicit toggle (add/remove instead of toggle())
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                this.textContent = '☰';
            } else {
                nav.classList.add('active');
                this.textContent = '✕';
            }
            
            // Debug (remove after testing)
            console.log('Menu toggled. Active:', nav.classList.contains('active'));
        });
    }
})();


(function() {

    function init() {

        const btn = document.getElementById('mobileToggle');
        const nav = document.querySelector('.nav-links');
        if (!btn || !nav) return;

        // Remove any inline onclick (if any)
        btn.removeAttribute('onclick');

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent interference
            nav.classList.toggle('active');
            this.textContent = nav.classList.contains('active') ? '✕' : '☰';
            console.log('Toggled. Active:', nav.classList.contains('active'));
        });

        // Optional: Close menu when clicking a link inside nav (for mobile UX)
        nav.querySelectorAll('a, label').forEach(function(el) {
            el.addEventListener('click', function() {
                nav.classList.remove('active');
                btn.textContent = '☰';
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
*/

/*
(function() {

    function init() {

        const btn = document.getElementById('mobileToggle');
        const nav = document.querySelector('.nav-links');

        if (!btn || !nav) return;

        // Remove any inline onclick
        btn.removeAttribute('onclick');

        // Use a state variable
        let isOpen = false;

        btn.addEventListener('click', function(e) {

            e.preventDefault();
            e.stopPropagation(); // Stop click from bubbling
            e.stopImmediatePropagation(); // Stop other listeners on same element

            // Toggle state
            isOpen = !isOpen;

            // Apply class based on state
            if (isOpen) {

                nav.classList.add('active');
                this.textContent = '✕';

            } else {

                nav.classList.remove('active');
                this.textContent = '☰';

            }

            console.log('Menu state:', isOpen);
            console.log('nav classList:', nav.classList.toString());

        });

        // Prevent other clicks inside nav from closing it accidentally
        nav.addEventListener('click', function(e) {

            e.stopPropagation();

        });

        // Optional: Close menu when clicking outside
        document.addEventListener('click', function(e) {

            if (isOpen && !nav.contains(e.target) && e.target !== btn) {

                isOpen = false;
                nav.classList.remove('active');
                btn.textContent = '☰';
                
            }

        });

    }

    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', init);

    } else {

        init();

    }

})();

(function() {

    function init() {

        const btn = document.getElementById('mobileToggle');
        const nav = document.querySelector('.nav-links');
        
        // Exit if elements don't exist
        if (!btn || !nav) return;

        // Remove any inline onclick (if present)
        btn.removeAttribute('onclick');

        // State variable
        let isOpen = false;

        // Toggle menu on button click
        btn.addEventListener('click', function(e) {

            e.preventDefault();
            e.stopPropagation();

            isOpen = !isOpen;

            if (isOpen) {

                nav.classList.add('active');
                this.textContent = '✕';

            } else {

                nav.classList.remove('active');
                this.textContent = '☰';

            }

            console.log('Menu state:', isOpen);

        });

        // Clicking inside the nav should NOT close it
        nav.addEventListener('click', function(e) {

            e.stopPropagation();

        });

        // Clicking outside the nav closes it (good UX)
        document.addEventListener('click', function(e) {

            if (isOpen && !nav.contains(e.target) && e.target !== btn) {

                isOpen = false;
                nav.classList.remove('active');
                btn.textContent = '☰';

            }

        });

        // ✅ NEW: Close menu when any link inside is clicked (mobile UX)
        nav.querySelectorAll('a').forEach(function(link) {

            link.addEventListener('click', function() {

                if (window.innerWidth <= 768) {

                    isOpen = false;
                    nav.classList.remove('active');
                    btn.textContent = '☰';
                    
                }

            });

        });

        // ✅ NEW: Close menu on window resize (if screen becomes larger)
        window.addEventListener('resize', function() {

            if (window.innerWidth > 768 && isOpen) {

                isOpen = false;
                nav.classList.remove('active');
                btn.textContent = '☰';

            }

        });

    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', init);

    } else {

        init();
        
    }

})();
*/

/*
    (function() {

        console.log('Script loaded!');

        function init() {

            console.log('init() called');

            const btn = document.getElementById('mobileToggle');
            const nav = document.querySelector('.nav-links');

            console.log('Button:', btn);
            console.log('Nav:', nav);

            if (!btn || !nav) {

                console.error('Button or Nav not found!');
                return;

            }

            // Remove any inline onclick (just in case)
            btn.removeAttribute('onclick');

            // Simple toggle using add/remove (no state variable for now)
            btn.addEventListener('click', function(e) {

                e.preventDefault();
                e.stopPropagation();

                console.log('Button clicked!');

                // Check if nav has the class
                if (nav.classList.contains('active')) {

                    nav.classList.remove('active');
                    this.textContent = '☰';
                    console.log('Menu closed');

                } else {

                    nav.classList.add('active');
                    this.textContent = '✕';
                    console.log('Menu opened');

                }

                // Log current class list for debugging
                console.log('nav classList:', nav.className);

            });

            // Clicking outside closes the menu
            document.addEventListener('click', function(e) {

                if (nav.classList.contains('active') && ! nav.contains(e.target) && e.target !== btn) {

                    nav.classList.remove('active');
                    btn.textContent = '☰';
                    console.log('Menu closed by outside click');

                }
            });
        }

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {

            document.addEventListener('DOMContentLoaded', init);

        } else {

            init();

        }

    })();
*/

/**/
(function() {

    console.log('Script loaded!');

    function init() {

        console.log('init() called');

        // Attach click listener to the document (or a parent container)
        document.addEventListener('click', function(e) {
            
            // Check if the clicked element is our mobile toggle button
            const btn = e.target.closest('#mobileToggle');
            
            // Find the nav – it could be anywhere in the document
            const nav = document.querySelector('.nav-links');
            
            if (!btn || !nav) {

                console.error('Nav not found!');
                return;

            }

            // Toggle the class
            if (nav.classList.contains('active')) {

                nav.classList.remove('active');
                btn.textContent = '☰';
                console.log('Menu closed');

            } else {
                
                nav.classList.add('active');
                btn.textContent = '✕';
                console.log('Menu opened');

            }

        });

        console.log('Event listener attached to document.');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', init);

    } else {

        init();

    }

})();

// --- AUTO-HIGHLIGHT ACTIVE NAV LINK ---
(function() {

    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-link a').forEach(link => {

        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {

            link.classList.add('active');

        } else {

            link.classList.remove('active');

        }

    });

})();

/*
        (function() {

            const toggleBtns = document.querySelectorAll('.pdp-toggle-btn');
            const retailElements = document.querySelectorAll('.price-retail, .stock-retail, .qty-retail, .wholesale-prompt, .delivery-note.retail' );
            const wholesaleElements = document.querySelectorAll('.price-wholesale, .stock-wholesale, .qty-wholesale, .delivery-note.wholesale, .moq');

            function setPDPView(view) {
                // Update button styles
                toggleBtns.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.background = 'transparent';
                    btn.style.color = '#475569';
                });
                const activeBtn = document.querySelector(`.pdp-toggle-btn[data-view="${view}"]`);
                if (activeBtn) {
                    activeBtn.classList.add('active');
                    activeBtn.style.background = '#0f172a';
                    activeBtn.style.color = 'white';
                }

                // Show/hide elements
                if (view === 'retail') {
                    retailElements.forEach(el => el.style.display = 'flex');
                    wholesaleElements.forEach(el => el.style.display = 'none');
                } else {
                    retailElements.forEach(el => el.style.display = 'none');
                    wholesaleElements.forEach(el => el.style.display = 'flex');
                }
            }

            // Attach click events
            toggleBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    setPDPView(this.dataset.view);
                });
            });

            // Default to Wholesale (since this mockup is for wholesale customer)
            setPDPView('wholesale');
        })();
        
*/

        // Functions to handle the success overlay
        function showSuccessOverlay(businessName) {

            document.getElementById('successBusinessName').textContent = businessName || 'Retailer';
            document.getElementById('registration-success-overlay').style.display = 'flex';

            // Simulate auto-login: toggle wholesale mode
            if (typeof toggleWholesaleMode === 'function') {
                toggleWholesaleMode(true);
            }

        }

        function closeSuccessAndGoToShop() {

            document.getElementById('registration-success-overlay').style.display = 'none';
            document.getElementById('page-shop').checked = true;
            // Re-trigger showPage
            if (typeof showPage === 'function') showPage('shop');

        }

        function closeSuccessAndGoToDashboard() {

            document.getElementById('registration-success-overlay').style.display = 'none';

            // For demo, redirect to home (you could add a "Dashboard" page later)
            document.getElementById('page-home').checked = true;
            if (typeof showPage === 'function') showPage('home');
            alert('📊 Dashboard page coming soon!');

        }

        function closeSuccessAndLogout() {

            document.getElementById('registration-success-overlay').style.display = 'none';

            if (typeof toggleWholesaleMode === 'function') {

                toggleWholesaleMode(false);

            }

            document.getElementById('page-home').checked = true;

            if (typeof showPage === 'function') showPage('home');

        }

        // Hook into the registration form submit
        document.addEventListener('DOMContentLoaded', function() {

            const regForm = document.getElementById('registration-form');

            if (regForm) {

                regForm.addEventListener('submit', function(e) {

                    e.preventDefault();
                    // Get business name from the form
                    const bizInput = this.querySelector('input[placeholder*="Business Name"]');
                    const bizName = bizInput ? bizInput.value : 'Retailer';
                    showSuccessOverlay(bizName);

                });

            }
            
        });
        
const loginForm = document.getElementById('login-form');
if (loginForm) {

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('🔐 Login form submitted – simulating wholesale mode.');
        if (typeof toggleWholesaleMode === 'function') {
            toggleWholesaleMode(true);
            const businessName = document.querySelector('#businessNameDisplay');
            if (businessName) businessName.textContent = 'Adeola Foods';
        }
        // Close the success overlay if open
        const overlay = document.getElementById('registration-success-overlay');
        if (overlay) overlay.style.display = 'none';
        // Switch to home or shop page
        document.getElementById('page-home').checked = true;
        if (typeof showPage === 'function') showPage('home');
    });

}

// --- SIMULATE LOGIN / LOGOUT (Wholesale Toggle) ---
(function() {

    let isWholesale = false;

    const loginBtn = document.getElementById('simulateLoginBtn');
    const logoutDisplay = document.getElementById('logoutDisplay');
    const businessNameDisplay = document.getElementById('businessNameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

    // All elements that contain retail vs wholesale prices
    const priceElements = document.querySelectorAll('.price, .price-wholesale, .price-retail, .pdp-summary .price-wholesale, .pdp-summary .price-retail');
    
    // Function to toggle all prices on the page
    function toggleWholesaleMode(enable) {

        isWholesale = enable;

        // Toggle all price displays
        document.querySelectorAll('.price-retail, .wholesale-prompt, .delivery-note-retail, .qty-retail, .stock-retail')

            .forEach(el => el.style.display = enable ? 'none' : 'block');
        
        document.querySelectorAll('.price-wholesale, .delivery-note-wholesale, .qty-wholesale, .stock-wholesale')

            .forEach(el => el.style.display = enable ? 'block' : 'none');

        // Toggle wholesale badges on product cards
        document.querySelectorAll('.badge-orange').forEach(el => {
            el.textContent = enable ? '📦 Wholesale Price' : '🔒 Login for Wholesale';
            el.className = enable ? 'badge-green' : 'badge-orange';
        });

        // Toggle login button visibility
        if (loginBtn) loginBtn.style.display = enable ? 'none' : 'inline-block';
        if (logoutDisplay) logoutDisplay.style.display = enable ? 'inline' : 'none';

        // Update cart badge to show "Wholesale" note (mock)
        const cartBadge = document.querySelector('.cart-badge');
        if (cartBadge) {
            cartBadge.textContent = enable ? 'W' : '2';
            cartBadge.style.background = enable ? '#16a34a' : '#f59e0b';
        }

        // Update hero section to show wholesale welcome
        const heroCols = document.querySelectorAll('.hero-col .tag');
        if (heroCols.length >= 2) {

            if (enable) {
                heroCols[0].textContent = '👋 WELCOME BACK';
                heroCols[0].style.background = '#16a34a';
                heroCols[1].textContent = '📦 WHOLESALE ACTIVE';
                heroCols[1].style.background = '#f59e0b';
                heroCols[1].style.color = '#0f172a';

            } else {

                heroCols[0].textContent = 'RETAIL';
                heroCols[0].style.background = '#16a34a';
                heroCols[1].textContent = 'B2B WHOLESALE';
                heroCols[1].style.background = '#f59e0b';
                heroCols[1].style.color = '#0f172a';

            }

        }

        console.log(`🔄 Switched to ${enable ? 'WHOLESALE' : 'RETAIL'} mode.`);

    }

    // Simulate Login
    if (loginBtn) {

        loginBtn.addEventListener('click', function() {

            toggleWholesaleMode(true);

            if (businessNameDisplay) businessNameDisplay.textContent = 'Adeola Foods';

            // Auto-switch to homepage to show the changes
            document.getElementById('page-home').checked = true;

            // Re-trigger showPage
            if (typeof showPage === 'function') showPage('home');

        });

    }

    // Logout
    if (logoutBtn) {

        logoutBtn.addEventListener('click', function(e) {

            e.preventDefault();
            toggleWholesaleMode(false);

        });

    }

    // Ensure PDP toggle respects wholesale mode
    const pdpToggleBtns = document.querySelectorAll('.pdp-toggle-btn');
    if (pdpToggleBtns.length) {
        pdpToggleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // If wholesale mode is active, force wholesale view on PDP
                if (isWholesale) {
                    document.querySelectorAll('.pdp-toggle-btn').forEach(b => {
                        b.classList.remove('active');
                        b.style.background = 'transparent';
                        b.style.color = '#475569';
                    });
                    const wholesaleBtn = document.querySelector('.pdp-toggle-btn[data-view="wholesale"]');
                    if (wholesaleBtn) {
                        wholesaleBtn.classList.add('active');
                        wholesaleBtn.style.background = '#0f172a';
                        wholesaleBtn.style.color = 'white';
                    }
                }
            });
        });
    }

})();

// --- REDIRECTION LOGIC (Mockup) ---
(function() {

    // Helper to get URL parameters
    function getParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Function to switch page and preserve state
    window.navigateToPage = function(pageId, returnPageId) {
        // If a return page is provided, store it in a global variable
        if (returnPageId) {
            window.returnToPage = returnPageId;
        }
        // Check the radio button
        document.getElementById(pageId).checked = true;
        // Trigger the showPage function (if it exists)
        if (typeof showPage === 'function') {
            const pageName = pageId.replace('page-', '');
            showPage(pageName);
        }
    };

    // Function to handle "Back to Product" from Login/Register
    window.goBackToPrevious = function() {
        const target = window.returnToPage || 'page-pdp'; // Default to PDP if not set
        document.getElementById(target).checked = true;
        if (typeof showPage === 'function') {
            const pageName = target.replace('page-', '');
            showPage(pageName);
        }
        window.returnToPage = null; // Clear it
    };
})();

function handleSuccessRedirect() {
    document.getElementById('registration-success-overlay').style.display = 'none';
    // If we came from the PDP, go back there. Otherwise, go to Shop.
    const target = window.returnToPage || 'page-shop';
    document.getElementById(target).checked = true;
    if (typeof showPage === 'function') {
        const pageName = target.replace('page-', '');
        showPage(pageName);
    }
    window.returnToPage = null;
}

/*
// ============================================
// 6. LOGIN FORM HANDLER
// ============================================
(function() {

    console.log('login links found')

    const loginForm = document.getElementById('auth-login-form');

    if (loginForm) {

        loginForm.addEventListener('submit', function(e) {

            e.preventDefault();
            console.log('🔐 Login submitted – simulating wholesale mode.');
            if (typeof window.toggleWholesaleMode === 'function') {

                window.toggleWholesaleMode(true);
                const nameDisplay = document.getElementById('businessNameDisplay');
                if (nameDisplay) nameDisplay.textContent = 'Adeola Foods';

            }
            // Redirect to the return URL or shop
            const returnUrl = new URLSearchParams(window.location.search).get('return') || 'shop.html';
            window.location.href = returnUrl;

        });

    }

})();

// ============================================
// 7. REGISTRATION FORM HANDLER
// ============================================
(function() {

    const regForm = document.getElementById('auth-register-form');
    if (regForm) {

        regForm.addEventListener('submit', function(e) {

            e.preventDefault();
            const bizInput = this.querySelector('input[placeholder*="Business Name"]');
            const bizName = bizInput ? bizInput.value : 'Retailer';
            window.showSuccessOverlay(bizName);

        });

    }

})();
*/


// ============================================
// UNIFIED AUTH OVERLAY CONTROLLER
// ============================================/
/*
(function() {

    console.log('🔍 Auth overlay controller loading...');

    const backdrop = document.getElementById('authBackdrop');
    const closeBtn = document.getElementById('authCloseBtn');
    const content = document.getElementById('authContent');

    if (!backdrop || !closeBtn || !content) {

        console.warn('⚠️ Auth overlay elements not found in DOM.');
        return;

    }

    console.log('✅ Auth overlay elements found.');

    function openAuthOverlay() {

        console.log('📂 Opening auth overlay...');
        backdrop.classList.add('show');
        document.body.style.overflow = 'hidden';

    }

    function closeAuthOverlay() {
        console.log('📂 Closing auth overlay...');
        backdrop.classList.remove('show');
        document.body.style.overflow = '';
    }

    window.openAuthOverlay = openAuthOverlay;
    window.closeAuthOverlay = closeAuthOverlay;

    closeBtn.addEventListener('click', closeAuthOverlay);

    backdrop.addEventListener('click', function(e) {

        if (e.target === backdrop) {
            closeAuthOverlay();
        }

    });

    document.addEventListener('keydown', function(e) {

        if (e.key === 'Escape' && backdrop.classList.contains('show')) {
            closeAuthOverlay();
        }

    });

    // ---- Intercept Login/Register Links ----
    document.addEventListener('click', function(e) {

        const link = e.target.closest('a[href*="login.html"], a[href*="register.html"]');
        if (!link) return;

        e.preventDefault();
        e.stopPropagation();

        openAuthOverlay();
        // We'll add view switching later
    });

    console.log('✅ Auth overlay controller ready.');
    console.log('👉 Use openAuthOverlay() and closeAuthOverlay() to control it.');

})();
*/


// ============================================
// 5. VIEW MANAGER – Show/Hide Views Inside Overlay
// ============================================
/*
(function() {

    console.log('🔍 View manager loading...');

    function showAuthView(view, authStatus, businessName) {

        console.log(`📄 Showing view: ${view}`);

        const allViews = document.querySelectorAll('.auth-view');

        if (allViews.length === 0) {

            console.warn('⚠️ No .auth-view elements found. Retrying...');
            setTimeout(() => showAuthView(view, businessName), 500);
            return;

        }

        allViews.forEach(el => {

            el.style.display = 'none';

        });

        const target = document.getElementById(

            view === 'login' ? 'authViewLogin' :
            view === 'register' ? 'authViewRegister' :
            'authViewSuccess'

        );
        if (target) {

            target.style.display = 'flex';
            console.log(`✅ Showing: ${target.id}`);

        } else {

            console.warn(`⚠️ View "${view}" not found.`);
            return;

        }

        if (view === 'success' && businessName) {

            const nameEl = document.getElementById('successBusinessName');

            if (nameEl) {

                nameEl.innerHTML = `Welcome, <strong>${businessName}</strong>!`;

            }
            if (typeof window.toggleWholesaleMode === 'function') {

                window.toggleWholesaleMode(true);

            }
            localStorage.setItem('wholesaleMode', 'true');
            localStorage.setItem('businessName', businessName || 'Retailer');

        }

        if (typeof window.openAuthOverlay === 'function') {

            window.openAuthOverlay();

        }

    }

    window.showAuthView = showAuthView;
    console.log('✅ View manager ready.');

})();
*/

// ============================================
// 5. SUCCESS OVERLAY
// ============================================
/*
window.showSuccessOverlay = function(businessName) {

    const overlay = document.getElementById('authBackdrop');
    const nameDisplay = document.getElementById('successBusinessName');
    if (overlay) overlay.style.display = 'flex';
    if (nameDisplay) nameDisplay.textContent = businessName || 'Retailer';

    if (typeof window.toggleWholesaleMode === 'function') {
        window.toggleWholesaleMode(true);
    }

};

window.closeSuccessOverlay = function() {

    const overlay = document.getElementById('authBackdrop');
    if (overlay) overlay.style.display = 'none';

};

window.closeSuccessAndGoToShop = function() {

    window.closeSuccessOverlay();
    window.location.href = 'shop.html';

};

window.closeSuccessAndGoToDashboard = function() {

    window.closeSuccessOverlay();
    alert('📊 Dashboard page coming soon!');
    window.location.href = 'index.html';

};

window.closeSuccessAndLogout = function() {

    window.closeSuccessOverlay();
    if (typeof window.toggleWholesaleMode === 'function') {

        window.toggleWholesaleMode(false);

    }
    localStorage.removeItem('wholesaleMode');
    localStorage.removeItem('businessName');
    window.location.href = 'index.html';

};
*/

// ============================================
// 5. WHOLESALE MODE TOGGLE
// ============================================
/*
(function() {

    let isWholesale = false;

    const loginBtn = document.getElementById('simulateLoginBtn');
    const logoutDisplay = document.getElementById('logoutDisplay');
    const businessNameDisplay = document.getElementById('businessNameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

    // Function to toggle wholesale mode
    window.toggleWholesaleMode = function(enable) {

        isWholesale = enable;
        window.isWholesaleActive = enable;

        // Toggle price displays
        document.querySelectorAll('.price-retail, .wholesale-prompt, .delivery-note-retail, .qty-retail, .stock-retail')
            .forEach(el => el.style.display = enable ? 'none' : 'block');

        document.querySelectorAll('.price-wholesale, .delivery-note-wholesale, .qty-wholesale, .stock-wholesale')
            .forEach(el => el.style.display = enable ? 'block' : 'none');

        // Toggle wholesale badges
        document.querySelectorAll('.badge-orange').forEach(el => {

            el.textContent = enable ? '📦 Wholesale Price' : '🔒 Login for Wholesale';
            el.className = enable ? 'badge-green' : 'badge-orange';

        });

        // Toggle login/logout visibility
        if (loginBtn) loginBtn.style.display = enable ? 'none' : 'inline-block';
        if (logoutDisplay) logoutDisplay.style.display = enable ? 'inline' : 'none';

        // Update cart badge
        const cartBadge = document.querySelector('.cart-badge');
        if (cartBadge) {

            cartBadge.textContent = enable ? 'W' : '2';
            cartBadge.style.background = enable ? '#16a34a' : '#f59e0b';

        }

        // Update hero tags
        const heroCols = document.querySelectorAll('.hero-col .tag');
        if (heroCols.length >= 2) {

            if (enable) {

                heroCols[0].textContent = '👋 WELCOME BACK';
                heroCols[0].style.background = '#16a34a';
                heroCols[1].textContent = '📦 WHOLESALE ACTIVE';
                heroCols[1].style.background = '#f59e0b';
                heroCols[1].style.color = '#0f172a';

            } else {

                heroCols[0].textContent = 'RETAIL';
                heroCols[0].style.background = '#16a34a';
                heroCols[1].textContent = 'B2B WHOLESALE';
                heroCols[1].style.background = '#f59e0b';
                heroCols[1].style.color = '#0f172a';

            }

        }

        // Store state in localStorage for cross-page persistence
        if (enable) {

            localStorage.setItem('wholesaleMode', 'true');
            localStorage.setItem('businessName', businessNameDisplay ? businessNameDisplay.textContent : 'Retailer');

        } else {

            localStorage.removeItem('wholesaleMode');
            localStorage.removeItem('businessName');

        }

        console.log(`🔄 Switched to ${enable ? 'WHOLESALE' : 'RETAIL'} mode.`);

    };

    // Restore wholesale mode from localStorage
    if (localStorage.getItem('wholesaleMode') === 'true') {

        const name = localStorage.getItem('businessName') || 'Retailer';
        if (businessNameDisplay) businessNameDisplay.textContent = name;
        window.toggleWholesaleMode(true);

    }

    // Simulate Login
    if (loginBtn) {

        loginBtn.addEventListener('click', function(e) {

            e.preventDefault();
            if (businessNameDisplay) businessNameDisplay.textContent = 'Adeola Foods';
            window.toggleWholesaleMode(true);
            // Redirect to the page they were on or shop
            const returnUrl = new URLSearchParams(window.location.search).get('return') || 'shop.html';
            window.location.href = returnUrl;

        });

    }

    // Logout
    if (logoutBtn) {

        logoutBtn.addEventListener('click', function(e) {

            e.preventDefault();
            window.toggleWholesaleMode(false);
            window.location.reload();

        });

    }

})();
*/


// ============================================
// 7. FORM HANDLER – Debug Version
// ============================================
/*
(function() {

    console.log('🔍 Form handler loading...');

    // ---- Form Submissions ----
    document.addEventListener('submit', function(e) {

        console.log('🖱️ Submit event captured:', e.target.id);
        if (e.target.id === 'auth-login-form') {

            e.preventDefault();

            console.log('🔐 Login form submitted.');
            if (typeof window.showAuthView === 'function') {

                window.showAuthView('success', 'Adeola Foods');

            } else {

                console.warn('⚠️ showAuthView not found!');

            }
        } else if (e.target.id === 'auth-register-form') {

            e.preventDefault();
            
            const bizInput = e.target.querySelector('input[placeholder*="Business Name"]');
            const bizName = bizInput ? bizInput.value : 'Retailer';
            console.log('📝 Registration submitted.');

            if (typeof window.showAuthView === 'function') {

                window.showAuthView('success', bizName);

            } else {

                console.warn('⚠️ showAuthView not found!');

            }

        }

    });

    // ---- View Switching ----
    document.addEventListener('click', function(e) {

        const switchLink = e.target.closest('.switch-view');

        if (switchLink) {

            e.preventDefault();
            e.stopPropagation();

            const view = switchLink.dataset.view;
            console.log(`🔄 Switch link clicked → view: ${view}`);
            if (view && typeof window.showAuthView === 'function') {

                window.showAuthView(view);

            } else {

                console.warn(`⚠️ View "${view}" or showAuthView not found.`);

            }

        }

    });

    // ---- Also check if forms exist ----
    setTimeout(function() {

        console.log('🔎 Checking forms:');
        console.log('  auth-login-form:', document.getElementById('auth-login-form'));
        console.log('  auth-register-form:', document.getElementById('auth-register-form'));
        console.log('  switch-view links:', document.querySelectorAll('.switch-view'));

    }, 500);

    console.log('✅ Form handler ready.');

})();
*/

// ============================================
// 8. PDP TOGGLE (Retail/Wholesale View)
// ============================================
(function() {

    const toggleBtns = document.querySelectorAll('.pdp-toggle-btn');
    if (!toggleBtns.length) return;

    const retailElements = document.querySelectorAll('.price-retail, .stock-retail, .qty-retail, .wholesale-prompt, .delivery-note-retail');
    const wholesaleElements = document.querySelectorAll('.price-wholesale, .stock-wholesale, .qty-wholesale, .delivery-note-wholesale');

    function setPDPView(view) {
        toggleBtns.forEach(btn => {
            btn.classList.remove('active');
            btn.style.background = 'transparent';
            btn.style.color = '#475569';
        });
        const activeBtn = document.querySelector(`.pdp-toggle-btn[data-view="${view}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.background = '#0f172a';
            activeBtn.style.color = 'white';
        }

        if (view === 'retail') {
            retailElements.forEach(el => el.style.display = 'block');
            wholesaleElements.forEach(el => el.style.display = 'none');
        } else {
            retailElements.forEach(el => el.style.display = 'none');
            wholesaleElements.forEach(el => el.style.display = 'block');
        }
    }

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            setPDPView(this.dataset.view);
        });
    });

    // Default: check wholesale mode from localStorage
    if (localStorage.getItem('wholesaleMode') === 'true') {
        setPDPView('wholesale');
    } else {
        setPDPView('retail');
    }
})();

// ============================================
// 9. REDIRECTION LOGIC (For multi-page flow)
// ============================================
(function() {

    // Store the page we came from
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Function to go back to previous page
    window.goBackToPrevious = function() {

        const returnUrl = localStorage.getItem('returnUrl') || 'index.html';
        window.location.href = returnUrl;

    };

    // Save return URL when clicking Login/Register
    document.querySelectorAll('.login-btn, .register-btn').forEach(link => {

        link.addEventListener('click', function() {

            const current = window.location.pathname.split('/').pop() || 'index.html';
            localStorage.setItem('returnUrl', current);

        });

    });

})();