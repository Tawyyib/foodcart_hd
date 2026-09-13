// ============================================
// GLOBAL APPLICATION CONTROLLER
// ============================================

/**
 * 1. GLOBAL PRODUCT CATALOG DATA STRUCTURE
 * Acts as the central single source of truth for item pricing and details.
 */
window.productCatalog = {
    'RICE-5KG':    { name: 'NutraGold Rice (5kg)', retailPrice: 7000, wholesalePrice: 6800 },
    'RICE-10KG':   { name: 'NutraGold Rice (10kg)', retailPrice: 13000, wholesalePrice: 12000 },
    'RICE-25KG':   { name: 'NutraGold Rice (25kg)', retailPrice: 29000, wholesalePrice: 26000 },
    'RICE-50KG':   { name: 'NutraGold Rice (50kg)', retailPrice: 59000, wholesalePrice: 52000 },
    'BEANS-HONEY-5KG': { name: 'Honey Beans (5kg)', retailPrice: 11000, wholesalePrice: 10000 },
    'BEANS-HONEY-10KG': { name: 'Honey Beans (10kg)', retailPrice: 21000, wholesalePrice: 19000 },
    'BEANS-HONEY-25KG': { name: 'Honey Beans (25kg)', retailPrice: 49000, wholesalePrice: 45000 },
    'GARRI-PREMIUM-5KG': { name: 'Premium Garri (5kg)', retailPrice: 7000, wholesalePrice: 6500 }
};

/**
 * Global Helper Function: Lookup Product by SKU
 * @param {string} sku - Unique product identifier
 * @returns {Object|null} - Returns product object or null if not found
 */
window.getProductBySku = function(sku) {
    return window.productCatalog[sku] || null;
};

// ============================================
// 2. MOBILE MENU TOGGLE (Clean & Dynamic)
// ============================================
(function() {

    let initialized = false;

    function initMobileMenu() {

        if (initialized) return;
        initialized = true;

        // Event Listener: Delegated handler for mobile navbar toggle (#mobileToggle)
        document.addEventListener('click', function(e) {

            const toggleBtn = e.target.closest('#mobileToggle');
            const nav = document.querySelector('.nav-links');

            // Toggle mobile drawer open/close
            if (toggleBtn && nav) {

                nav.classList.toggle('active');

                const isActive = nav.classList.contains('active');
                toggleBtn.textContent = isActive ? '✕' : '☰';
                return;

            }

            // Close mobile menu when clicking anywhere outside of the menu
            if (nav && nav.classList.contains('active') && !e.target.closest('.nav-links')) {

                nav.classList.remove('active');
                const btn = document.getElementById('mobileToggle');
                if (btn) btn.textContent = '☰';

            }

        });

        console.log('✅ Mobile menu event listener attached.');

    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', initMobileMenu);

    } else {

        initMobileMenu();

    }

})();

// ============================================
// 3. AUTO-HIGHLIGHT ACTIVE NAV LINK (Dynamic)
// ============================================
(function() {

    let initialized = false;

    function applyNavHighlight() {

        // Prevent multiple runs
        if (initialized) return;
        initialized = true;

        console.log('🔍 Applying nav highlight...');

        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        // Remove query strings
        const cleanCurrentPage = currentPage.split('?')[0];
        console.log('📄 Current page:', cleanCurrentPage);

        const links = document.querySelectorAll('.nav-link a');
        console.log('🔗 Links found:', links.length);

        if (links.length === 0) {

            console.warn('⚠️ No .nav-link a elements found yet. Will retry.');
            initialized = false; // Reset so we can try again
            return false; // Indicate failure

        }

        links.forEach(link => {

            let href = link.getAttribute('href');
            if (!href) return;

            // Remove query strings and fragments
            href = href.split('?')[0].split('#')[0];
            const hrefFile = href.split('/').pop() || href;

            if (hrefFile === cleanCurrentPage) {

                link.classList.add('active');
                console.log('  ✅ Active added to:', hrefFile);

            } else {

                link.classList.remove('active');

            }

        });

        return true; // Success
    }

    // 2. Use MutationObserver to watch for injected nav
    function watchForNav() {

        console.log('👀 Watching for nav injection...');

        const observer = new MutationObserver(function(mutations) {

            // Check if any .nav-link a elements have been added
            const links = document.querySelectorAll('.nav-link a');
            if (links.length > 0) {

                console.log('✅ Nav detected! Applying highlight.');
                applyNavHighlight();
                observer.disconnect(); // Stop watching once we have the nav

            }

        });

        // Start observing the entire document for child additions
        observer.observe(document.body, {

            childList: true,
            subtree: true

        });

        // Fallback: try again after a short delay if observer doesn't fire
        setTimeout(function() {

            const links = document.querySelectorAll('.nav-link a');
            if (links.length === 0) {

                console.warn('⏱️ Nav not detected after timeout. Please check your injection script.');

            } else {

                applyNavHighlight();
                observer.disconnect();

            }

        }, 3000); // 3 second fallback

    }

    // 1. Try immediately (in case nav is already in DOM)
    if (document.readyState !== 'loading') {

        if (!applyNavHighlight()) {

            // If failed, wait for DOM changes
            watchForNav();

        }

    } else {

        document.addEventListener('DOMContentLoaded', function() {

            if (!applyNavHighlight()) {

                watchForNav();

            }

        });

    }

})();

// ============================================
// 4. PROFILE DROPDOWN MODULE
// ============================================
(function() {

    /**
     * Event Listener: Handles user profile dropdown menu open/close toggling.
     */
    document.addEventListener('click', function(e) {

        const profile = document.getElementById('user-profile');
        if (!profile) return;

        // Toggle active class if clicking on profile, close if clicking outside
        if (profile.contains(e.target)) {

            profile.classList.toggle('active');

        } else {

            profile.classList.remove('active');

        }

    });

})();

// ============================================
// 5. AUTH OVERLAY & VIEW MANAGER MODULE
// ============================================
(function() {

    /**
     * Helper Function: Retrieve key modal backdrop & content DOM elements
     */
    function getOverlayElements() {

        return {
            backdrop: document.getElementById('authBackdrop') || document.querySelector('.auth-backdrop'),
            closeBtn: document.getElementById('authCloseBtn') || document.querySelector('.auth-close-btn'),
            content: document.getElementById('authContent') || document.querySelector('.auth-content')
        };

    }

    /**
     * Global Function: Open authentication overlay backdrop
     */
    window.openAuthOverlay = function() {

        const { backdrop } = getOverlayElements();
        if (backdrop) {
            backdrop.classList.add('show');
            document.body.classList.add('no-scroll'); // Prevent background body scroll
        }

    };

    /**
     * Global Function: Close authentication overlay backdrop
     */
    window.closeAuthOverlay = function() {
        const { backdrop } = getOverlayElements();
        if (backdrop) {
            backdrop.classList.remove('show');
            document.body.classList.remove('no-scroll'); // Re-enable background body scroll
        }
    };

    /**
     * Global Function: Switch active view inside the authentication modal
     * @param {string} view - Target view name ('login', 'register', 'success', 'orderSuccess', 'orderError')
     * @param {string} [authStatus] - Optional status flag ('login' or 'register')
     * @param {string} [businessName] - User/Business name for personalization
     */
    window.showAuthView = function(view, authStatus, businessName) {

        const allViews = document.querySelectorAll('.auth-view');

        if (allViews.length === 0) return;

        // Hide all modal views
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
        if (target) {

            target.classList.remove('hide');
            target.classList.add('show'); // Reveal target view

        } else {

            return;

        }

        // Custom logic for auth success view
        if (view === 'success') {

            const loginEls = target.querySelectorAll('.login');
            const regEls = target.querySelectorAll('.register');

            loginEls.forEach(el => {

                if (authStatus === 'login') {

                    el.classList.remove('hide');
                    el.classList.add('show');

                } else {

                    el.classList.remove('show');
                    el.classList.add('hide');

                }

            });

            regEls.forEach(el => {

                if (authStatus === 'register') {

                    el.classList.remove('hide');
                    el.classList.add('show');

                } else {

                    el.classList.remove('show');
                    el.classList.add('hide');

                }

            });

            if (businessName) {

                target.querySelectorAll('#successBusinessName').forEach(el => {
                    el.innerHTML = `Welcome, <strong>${businessName}</strong>!`;
                });

            }

            // Automatically transition customer to wholesale B2B pricing upon login/register
            if (typeof window.toggleWholesaleMode === 'function') {
                window.toggleWholesaleMode(true, businessName);
            }

        }

        window.openAuthOverlay();

    };

    /**
     * Global Function: Populate and display Order Success View
     * @param {Object} orderData - Order payload (number, total, delivery, eta, customerName)
     */
    window.showOrderSuccess = function(orderData) {

        const els = {
            number: document.getElementById('orderNumber'),
            total: document.getElementById('orderTotal'),
            delivery: document.getElementById('orderDelivery'),
            eta: document.getElementById('orderETA'),
            name: document.getElementById('orderCustomerName')
        };

        if (els.number) els.number.textContent = orderData.orderNumber || '#ORD-2026-001';
        if (els.total) els.total.textContent = orderData.total || '₦0';
        if (els.delivery) els.delivery.textContent = orderData.delivery || 'Express Delivery';
        if (els.eta) els.eta.textContent = orderData.eta || 'Today, 5:00 PM';
        if (els.name) els.name.textContent = orderData.customerName || 'Retailer';

        window.showAuthView('orderSuccess');

    };

    /**
     * Global Function: Populate and display Order Error View
     * @param {string} errorMessage - Message explaining the failure
     */
    window.showOrderError = function(errorMessage) {

        const msgEl = document.getElementById('orderErrorMessage');
        if (msgEl) msgEl.textContent = errorMessage || 'Payment verification failed.';
        window.showAuthView('orderError');

    };

    /**
     * Event Listener: Global delegated click handler for overlay controls and triggers
     */
    document.addEventListener('click', function(e) {

        // Intercept close button clicks
        const closeBtn = e.target.closest('#authCloseBtn, .auth-close-btn');
        if (closeBtn) {

            window.closeAuthOverlay();
            return;

        }

        // Close modal when clicking directly on backdrop background
        const backdrop = e.target;
        if (backdrop && backdrop.id === 'authBackdrop') {

            window.closeAuthOverlay();
            return;

        }

        // Intercept login/register link clicks to open overlay instead of navigating
        const link = e.target.closest('a[href*="login"], a[href*="register"], .login-btn, .register-btn, .switch-view, [data-auth="login"], [data-auth="register"]');
        if (link) {

            e.preventDefault();
            let view = link.dataset.view || link.dataset.auth;

            if (!view) {

                const href = link.getAttribute('href') || '';
                view = href.includes('login') ? 'login' : href.includes('register') ? 'register' : null;

            }

            if (view) window.showAuthView(view);

        }

    });

    /**
     * Event Listener: Handles submit actions on Auth Forms (Login / Register)
     */
    document.addEventListener('submit', function(e) {

        if (e.target.id === 'auth-login-form') {

            e.preventDefault();
            window.showAuthView('success', 'login', 'Adeola Foods');

        } else if (e.target.id === 'auth-register-form') {

            e.preventDefault();
            const input = e.target.querySelector('input[placeholder*="Business Name"]');
            const name = input && input.value.trim() ? input.value.trim() : 'Retailer';
            window.showAuthView('success', 'register', name);

        }

    });

})();

// ============================================
// 6. SUCCESS HANDLERS – Updated
// ============================================
(function() {

    console.log('🔍 Success handlers loading...');

    window.handleSuccessStartShopping = function() {
        if (typeof window.closeAuthOverlay === 'function') {
            window.closeAuthOverlay();
        }
        window.location.href = 'shop.html';
    };

    window.handleSuccessDashboard = function() {
        if (typeof window.closeAuthOverlay === 'function') {
            window.closeAuthOverlay();
        }
        alert('📊 Dashboard page coming soon!');
        window.location.href = 'index.html';
    };

    window.handleSuccessRedirect = function() {

        // Stay on the current page
        if (typeof window.closeAuthOverlay === 'function') {
            window.closeAuthOverlay();
        }
        
        // No reload needed – wholesale mode is already active
        console.log('✅ Redirect complete – staying on current page with wholesale prices.');

    };

    window.handleSuccessLogout = function() {

        if (typeof window.closeAuthOverlay === 'function') {
            window.closeAuthOverlay();
        }
        if (typeof window.toggleWholesaleMode === 'function') {
            window.toggleWholesaleMode(false);
        }
        localStorage.removeItem('wholesaleMode');
        localStorage.removeItem('businessName');
        window.location.href = 'index.html';

    };

    console.log('✅ Success handlers ready.');

})();

// ============================================
// 7. ORDER HANDLERS
// ============================================
(function() {

    window.handleOrderContinueShopping = function() {

        if (typeof window.closeAuthOverlay === 'function') {

            window.closeAuthOverlay();

        }

        window.location.href = 'shop.html';

    };

    window.handleOrderViewHistory = function() {

        if (typeof window.closeAuthOverlay === 'function') {

            window.closeAuthOverlay();

        }

        alert('📊 Orders page coming soon!');
        window.location.href = 'index.html';

    };

    window.handleOrderDownloadInvoice = function() {

        alert('📄 Invoice download coming soon!');

    };

    window.handleOrderRetry = function() {

        if (typeof window.closeAuthOverlay === 'function') {

            window.closeAuthOverlay();

        }

        // Return to checkout
        window.location.href = 'checkout.html';

    };

    window.handleOrderContactSupport = function() {

        alert('📞 Support: support@foodcart.com | +234 800 123 4567');

    };

    window.handleOrderReturnToCart = function() {

        if (typeof window.closeAuthOverlay === 'function') {

            window.closeAuthOverlay();

        }

        window.location.href = 'cart.html';

    };

    console.log('✅ Order handlers ready.');

})();

// ============================================
// 8. WHOLESALE MODE CONTROLLER (Class-Based)
// ============================================
(function() {

    let isWholesale = false; // Internal private state variable

    /**
     * Global Function: Safe boolean getter returning active wholesale mode state
     * @returns {boolean}
     */
    window.isWholesaleActive = function() {
        return isWholesale;
    };

    /**
     * Global Function: Toggles interface between Retail and Wholesale (B2B) pricing views
     * @param {boolean} enable - True to activate wholesale, false for retail
     * @param {string} [businessName] - Registered business account name
     */
    window.toggleWholesaleMode = function(enable, businessName) {

        // 1. Update module scope boolean state
        isWholesale = Boolean(enable);

        // 2. Toggle central body class to let CSS automatically handle view swapping
        document.body.classList.toggle('wholesale-mode-active', isWholesale);

        // 3. Swap Price Badges text dynamically
        document.querySelectorAll('.badge-orange, .badge-green').forEach(el => {

            el.textContent = isWholesale ? 'Wholesale Price' : 'Retail Price';

            if (isWholesale) {

                el.classList.remove('badge-orange');
                el.classList.add('badge-green');

            } else {

                el.classList.remove('badge-green');
                el.classList.add('badge-orange');

            }

        });

        // 4. Update header Business Name label
        const name = businessName || localStorage.getItem('businessName') || 'Retailer';
        const businessNameDisplay = document.getElementById('businessNameDisplay');
        if (businessNameDisplay) {
            businessNameDisplay.textContent = isWholesale ? name : 'Retailer';
        }

        // 5. Persist wholesale preference to LocalStorage
        if (isWholesale) {

            localStorage.setItem('wholesaleMode', 'true');
            localStorage.setItem('businessName', name);

        } else {

            localStorage.removeItem('wholesaleMode');
            localStorage.removeItem('businessName');

        }

        // 6. Dispatch global custom event for reactive UI updates (e.g. updating cart totals)
        document.dispatchEvent(new CustomEvent('wholesaleModeChanged', {
            detail: { enabled: isWholesale, businessName: name }
        }));
        
    };

    /**
     * Global Function: Handle user logout reset
     */
    window.handleLogout = function() {

        window.toggleWholesaleMode(false);

        if (typeof window.closeAuthOverlay === 'function') {

            window.closeAuthOverlay();

        }

        window.location.reload();

    };

    /**
     * Helper Function: Restore state on initial page load if saved in local storage
     */
    function restoreState() {

        if (localStorage.getItem('wholesaleMode') === 'true') {

            const name = localStorage.getItem('businessName') || 'Retailer';
            window.toggleWholesaleMode(true, name);

        }

    }

    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', restoreState);

    } else {

        restoreState();

    }
    
})();

// ============================================
// CART MANAGEMENT MODULE (COMPLETE & FIXED)
// ============================================
(function() {
    let cart = [];

    // Helper: Safe evaluation of wholesale mode
    function isWholesaleActiveSafe() {
        if (typeof window.isWholesaleActive === 'function') {
            return window.isWholesaleActive();
        }
        return localStorage.getItem('wholesaleMode') === 'true';
    }

    // Load cart state synchronously from localStorage
    function loadCart() {
        try {
            const stored = localStorage.getItem('foodcart_cart');
            cart = stored ? JSON.parse(stored) : [];
        } catch (e) {
            cart = [];
        }
    }

    // Save state & trigger UI updates across components
    function saveCart() {
        try {
            localStorage.setItem('foodcart_cart', JSON.stringify(cart));
        } catch (e) {
            console.error('Failed to save cart to localStorage:', e);
        }
        updateCartBadge();
        updateMiniCart();
        
        if (typeof window.renderCartPage === 'function') {
            window.renderCartPage();
        }
        if (typeof window.renderCheckoutSummary === 'function') {
            window.renderCheckoutSummary();
        }
    }

    // --- Global Cart API Methods ---

    window.getCart = function() {
        loadCart();
        return cart;
    };

    window.getCartCount = function() {
        loadCart();
        return cart.reduce((total, i) => total + (parseInt(i.quantity, 10) || 0), 0);
    };

    window.getCartTotal = function() {
        loadCart();
        const isWholesale = isWholesaleActiveSafe();
        return cart.reduce((total, item) => {
            const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
            return total + (price * item.quantity);
        }, 0);
    };

    window.addToCart = function(sku, name, retailPrice, wholesalePrice, quantity, image) {
        quantity = parseInt(quantity, 10) || 1;
        loadCart();
        const existing = cart.find(i => i.sku === sku);

        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({
                sku: sku,
                name: name,
                retailPrice: parseFloat(retailPrice) || 0,
                wholesalePrice: parseFloat(wholesalePrice || retailPrice) || 0,
                quantity: quantity,
                image: image || ''
            });
        }
        saveCart();
    };

    window.removeFromCart = function(sku) {
        loadCart();
        cart = cart.filter(i => i.sku !== sku);
        saveCart();
    };

    window.updateCartQuantity = function(sku, quantity) {
        loadCart();
        const qty = parseInt(quantity, 10);
        if (isNaN(qty) || qty <= 0) {
            window.removeFromCart(sku);
            return;
        }

        const item = cart.find(i => i.sku === sku);
        if (item) {
            item.quantity = qty;
            saveCart();
        }
    };

    window.clearCart = function() {
        cart = [];
        saveCart();
    };

    // --- UI Synchronizers ---

    // Badges update
    function updateCartBadge() {
        const count = window.getCartCount();
        const badges = document.querySelectorAll('.cart-badge');

        if (badges.length === 0) return;

        const isWholesale = isWholesaleActiveSafe();

        badges.forEach(badge => {
            badge.textContent = count;

            if (isWholesale) {
                badge.classList.remove('bg-amber');
                badge.classList.add('bg-green');
            } else {
                badge.classList.remove('bg-green');
                badge.classList.add('bg-amber');
            }
        });
    }

    // Mini-Cart update
    function updateMiniCart() {
        const miniCartItems = document.querySelectorAll('.mini-cart-items, #mini-cart-list');
        const miniCartTotal = document.querySelectorAll('.mini-cart-total, #mini-cart-subtotal');
        const items = window.getCart();
        const total = window.getCartTotal();
        const isWholesale = isWholesaleActiveSafe();

        if (miniCartItems.length > 0) {
            miniCartItems.forEach(container => {
                if (items.length === 0) {
                    container.innerHTML = `<p style="padding:15px; text-align:center; color:#64748b;">Your cart is empty.</p>`;
                    return;
                }

                let html = '';
                items.forEach(item => {
                    const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
                    html += `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-bottom:1px solid #f1f5f9; font-size:0.9rem;">
                            <div>
                                <div style="font-weight:600;">${item.name}</div>
                                <div style="color:#64748b; font-size:0.8rem;">Qty: <strong>${item.quantity}</strong> × ₦${price.toLocaleString()}</div>
                            </div>
                            <div style="font-weight:700;">₦${(price * item.quantity).toLocaleString()}</div>
                        </div>`;
                });
                container.innerHTML = html;
            });
        }

        if (miniCartTotal.length > 0) {
            miniCartTotal.forEach(el => {
                el.textContent = `₦${total.toLocaleString()}`;
            });
        }
    }

    // Cart Page renderer
    window.renderCartPage = function() {
        const tableBody = document.getElementById('cart-table-body') || document.getElementById('cart-items');
        if (!tableBody) return;

        const isWholesale = isWholesaleActiveSafe();
        const items = window.getCart();
        const subtotal = window.getCartTotal();
        
        const baseDeliveryFee = 700;
        const freeDeliveryThreshold = 150000;

        // 1. Empty Cart Table State
        if (items.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; padding:40px 20px;">
                        <div style="font-size:2.5rem; margin-bottom:0.5rem;">🛒</div>
                        <h3 style="margin-bottom:0.5rem; font-weight:600;">Your cart is currently empty</h3>
                        <p style="color:#64748b; margin-bottom:1rem;">Looks like you haven't added any products to your cart yet.</p>
                        <a href="shop.html" style="display:inline-block; padding:10px 20px; background:#16a34a; color:#fff; text-decoration:none; border-radius:6px; font-weight:600;">Browse Store</a>
                    </td>
                </tr>`;
        } else {
            // 2. Populate Cart Rows
            let tableHtml = '';
            items.forEach(item => {
                const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
                const itemSubtotal = price * item.quantity;
                const itemImage = item.image ? `<img src="${item.image}" alt="${item.name}" style="width:36px; height:36px; object-fit:cover; border-radius:4px; vertical-align:middle; margin-right:8px;">` : '';

                tableHtml += `
                    <tr style="border-bottom:1px solid #e2e8f0;">
                        <td style="padding:12px 8px; font-weight:600;">
                            ${itemImage}${item.name}
                        </td>
                        <td style="padding:12px 8px;">₦${price.toLocaleString()}</td>
                        <td style="padding:12px 8px;">
                            <input 
                                type="number" 
                                min="1" 
                                value="${item.quantity}" 
                                onchange="window.updateCartQuantity('${item.sku}', parseInt(this.value, 10));"
                                style="width:65px; padding:6px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.95rem;">
                        </td>
                        <td style="padding:12px 8px; font-weight:600;">₦${itemSubtotal.toLocaleString()}</td>
                        <td style="padding:12px 8px; text-align:center;">
                            <span 
                                onclick="window.removeFromCart('${item.sku}');" 
                                style="color:#dc2626; cursor:pointer; font-weight:bold; padding:4px 8px;"
                                title="Remove item">✕</span>
                        </td>
                    </tr>`;
            });
            tableBody.innerHTML = tableHtml;
        }

        // 3. Free Shipping Progress Bar
        const shippingProgressContainer = document.getElementById('free-shipping-container');
        if (shippingProgressContainer) {
            if (subtotal >= freeDeliveryThreshold && items.length > 0) {
                shippingProgressContainer.innerHTML = `
                    🎯 🎉 <strong>Congratulations!</strong> You qualify for <strong>Free Delivery</strong> within Lagos.
                    <div style="height:8px; background:#e2e8f0; border-radius:4px; margin-top:8px;">
                        <div style="width:100%; height:8px; background:#16a34a; border-radius:4px;"></div>
                    </div>`;
            } else {
                const amountLeft = freeDeliveryThreshold - subtotal;
                const percentage = Math.min(Math.round((subtotal / freeDeliveryThreshold) * 100), 100);
                shippingProgressContainer.innerHTML = `
                    🎯 <strong>Add ₦${amountLeft.toLocaleString()} more</strong> to qualify for <strong>Free Delivery</strong> within Lagos.
                    <div style="height:8px; background:#e2e8f0; border-radius:4px; margin-top:8px;">
                        <div style="width:${percentage}%; height:8px; background:#16a34a; border-radius:4px; transition:width 0.3s ease;"></div>
                    </div>`;
            }
        }

        // 4. Update Summary Displays
        const isFreeDelivery = subtotal >= freeDeliveryThreshold && items.length > 0;
        const finalDeliveryFee = (items.length === 0 || isFreeDelivery) ? 0 : baseDeliveryFee;
        const grandTotal = subtotal + finalDeliveryFee;

        const subtotalEl = document.getElementById('cart-subtotal-display');
        const deliveryEl = document.getElementById('delivery-fee-display');
        const totalEl = document.getElementById('cart-total-display');

        if (subtotalEl) subtotalEl.textContent = `₦${subtotal.toLocaleString()}`;
        if (deliveryEl) {
            deliveryEl.textContent = isFreeDelivery ? 'FREE' : `₦${finalDeliveryFee.toLocaleString()}`;
            deliveryEl.style.color = isFreeDelivery ? '#16a34a' : '#64748b';
            deliveryEl.style.fontWeight = isFreeDelivery ? '700' : 'normal';
        }
        if (totalEl) totalEl.textContent = `₦${grandTotal.toLocaleString()}`;
    };

    // Listen for pricing mode toggle (Wholesale vs Retail)
    document.addEventListener('wholesaleModeChanged', function() {
        updateCartBadge();
        updateMiniCart();
        window.renderCartPage();
        if (typeof window.renderCheckoutSummary === 'function') {
            window.renderCheckoutSummary();
        }
    });

    // --- Execution & Initialization ---

    // Load storage into memory immediately
    loadCart();

    function initCartUI() {
        loadCart();
        updateCartBadge();
        updateMiniCart();
        window.renderCartPage();
    }

    // Attach to lifecycle events
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCartUI);
    } else {
        initCartUI();
    }

    // Fallback pass to catch late DOM rendering or dynamic header loading
    window.addEventListener('load', function() {
        updateCartBadge();
        updateMiniCart();
    });
})();

// ============================================
// 10. ADD TO CART CONTROLLER MODULE
// ============================================
document.addEventListener('click', function(e) {
    // 1. Listen for clicks on any "Add to Cart" button inside the quantity block
    const btn = e.target.closest('.qty-add .btn');
    if (!btn) return;

    e.preventDefault();

    const pdpSummary = btn.closest('.pdp-summary');
    if (!pdpSummary) return;

    // 2. Determine if Wholesale or Retail is active
    const isWholesale = (typeof window.isWholesaleActive === 'function') 
        ? window.isWholesaleActive() 
        : (localStorage.getItem('wholesaleMode') === 'true');

    // 3. Grab Product Name and base SKU
    const titleEl = pdpSummary.querySelector('.title');
    const skuEl = pdpSummary.querySelector('.sku');
    
    const productName = titleEl ? titleEl.textContent.trim() : 'Product';
    const baseSku = skuEl ? skuEl.textContent.replace(/^SKU:\s*/i, '').trim() : 'GENERIC';

    // 4. Resolve Pricing/Option Element with Fallback Order:
    // Mode Select -> Opposite Mode Select -> Static .price element
    const modeSelect = isWholesale 
        ? pdpSummary.querySelector('select#wholesale') 
        : pdpSummary.querySelector('select#retail');

    const selectEl = modeSelect 
        || pdpSummary.querySelector('select#wholesale') 
        || pdpSummary.querySelector('select#retail');

    const priceStaticEl = pdpSummary.querySelector('.price');

    // Resolve quantity input field
    const qtyInput = isWholesale 
        ? pdpSummary.querySelector('input.qty-count.wholesale') 
        : pdpSummary.querySelector('input.qty-count.retail');

    const fallbackQty = pdpSummary.querySelector('.qty-input input[type="number"]');
    const quantity = parseInt(qtyInput ? qtyInput.value : (fallbackQty ? fallbackQty.value : 1), 10) || 1;

    // 5. Parse selected option, price, and variant SKU
    let selectedValue = selectEl ? selectEl.value : '';
    let selectedOptionText = selectEl && selectEl.selectedIndex !== -1 
        ? selectEl.options[selectEl.selectedIndex].text 
        : '';
    
    // Build unique SKU per variant (e.g., GARR-001-5kg) or fallback to base SKU
    const itemSku = selectedValue ? `${baseSku}-${selectedValue}` : baseSku;

    // Extract raw price string from <select> option text OR static .price element
    let rawPriceText = '';
    if (selectEl && selectedOptionText) {
        rawPriceText = selectedOptionText;
    } else if (priceStaticEl) {
        rawPriceText = priceStaticEl.value || priceStaticEl.textContent || '';
    }

    // Extract monetary number (e.g., "5kg – ₦6,000" or "₦14,000.00" -> 6000 or 14000)
    const priceMatch = rawPriceText.match(/₦\s*([\d,]+(?:\.\d+)?)/);
    const parsedPrice = priceMatch 
        ? parseFloat(priceMatch[1].replace(/,/g, '')) 
        : (parseFloat(rawPriceText.replace(/[^0-9.]/g, '')) || 0);

    // Set retail and wholesale prices
    const retailPrice = parsedPrice; 
    const wholesalePrice = parsedPrice;

    // Build item title including variant label if available
    const fullItemName = selectedOptionText ? `${productName} (${selectedOptionText.trim()})` : productName;

    // 6. Push to Cart Controller
    if (typeof window.addToCart === 'function') {
        window.addToCart(itemSku, fullItemName, retailPrice, wholesalePrice, quantity);
        console.log(`🛒 Added to Cart: ${quantity}x ${fullItemName} [SKU: ${itemSku}] @ ₦${parsedPrice}`);
    } else {
        console.error('❌ window.addToCart is not defined.');
    }
});

// ============================================
// 11. CHECKOUT PROCESSOR MODULE (INTEGRATED)
// ============================================
(function() {
    const STORAGE_KEY = 'foodcart_cart';

    function isWholesaleActive() {
        if (typeof window.isWholesaleActive === 'function') {
            return window.isWholesaleActive();
        }
        return localStorage.getItem('wholesaleMode') === 'true';
    }

    function getCheckoutCartItems() {
        if (typeof window.getCart === 'function') {
            return window.getCart();
        }
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function calculateSubtotal(items) {
        const isWholesale = isWholesaleActive();
        return items.reduce((sum, item) => {
            const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
            return sum + (price * item.quantity);
        }, 0);
    }

    // Dynamic Summary Renderer
    window.renderCheckoutSummary = function() {
        const summaryContainer = document.querySelector('.order-summary-inner') 
                              || document.getElementById('checkout-order-summary-inner') 
                              || document.querySelector('.checkout-summary-inner');
        
        if (!summaryContainer) return;

        const items = getCheckoutCartItems();
        const subtotal = calculateSubtotal(items);
        const isWholesale = isWholesaleActive();

        const submitBtn = document.getElementById('order-btn') || document.querySelector('#checkout-form button[type="submit"]');

        if (items.length === 0) {
            summaryContainer.innerHTML = `
                <div style="padding:24px 0; text-align:center; color:#64748b;">
                    <div style="font-size:2rem; margin-bottom:8px;">🛒</div>
                    <p style="margin-bottom:12px; font-weight:600;">Your cart is empty.</p>
                    <a href="shop.html" style="display:inline-block; padding:8px 16px; background:#16a34a; color:white; border-radius:6px; text-decoration:none; font-weight:600;">Return to Shop</a>
                </div>`;
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.5';
                submitBtn.style.cursor = 'not-allowed';
            }
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }

        const speedSelect = document.getElementById('checkout-speed');
        const lgaSelect = document.getElementById('checkout-lga');
        
        let deliveryFee = 700;
        if (speedSelect && speedSelect.options[speedSelect.selectedIndex]) {
            const selectedOpt = speedSelect.options[speedSelect.selectedIndex];
            deliveryFee = parseFloat(selectedOpt.getAttribute('data-fee')) || 700;
        }

        const freeDeliveryThreshold = 150000;
        const isFreeDelivery = subtotal >= freeDeliveryThreshold;
        const finalDeliveryFee = isFreeDelivery ? 0 : deliveryFee;
        const grandTotal = subtotal + finalDeliveryFee;

        let html = '';
        items.forEach(item => {
            const price = isWholesale ? (item.wholesalePrice || item.retailPrice) : item.retailPrice;
            const itemTotal = price * item.quantity;
            html += `
                <div class="row" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; font-size:0.95rem;">
                    <span>${item.name} <strong style="color:#64748b;">x${item.quantity}</strong></span>
                    <span style="font-weight:600;">₦${itemTotal.toLocaleString()}</span>
                </div>`;
        });

        const selectedLgaText = (lgaSelect && lgaSelect.value && lgaSelect.selectedIndex !== -1) 
            ? lgaSelect.options[lgaSelect.selectedIndex].text 
            : 'Ikeja';
            
        const isStandard = speedSelect && speedSelect.value && speedSelect.value.toLowerCase().includes('standard');
        const speedLabel = isStandard ? 'Standard' : 'Express';

        html += `<hr style="border:0; border-top:1px solid #e2e8f0; margin:14px 0;">`;
        html += `
            <div class="row" style="display:flex; justify-content:space-between; margin-bottom:8px; color:#475569;">
                <span>Subtotal</span>
                <span style="font-weight:600; color:#0f172a;">₦${subtotal.toLocaleString()}</span>
            </div>
            <div class="row" style="display:flex; justify-content:space-between; margin-bottom:8px; color:${isFreeDelivery ? '#16a34a' : '#475569'};">
                <span>🚚 ${speedLabel} Delivery (${selectedLgaText})</span>
                <span style="font-weight:600;">${isFreeDelivery ? 'FREE' : '₦' + finalDeliveryFee.toLocaleString()}</span>
            </div>
            <div class="row total" style="display:flex; justify-content:space-between; font-weight:700; font-size:1.25rem; border-top:2px solid #e2e8f0; padding-top:12px; margin-top:10px; color:#0f172a;">
                <span>Total</span>
                <span style="color:#16a34a;">₦${grandTotal.toLocaleString()}</span>
            </div>`;

        summaryContainer.innerHTML = html;
    };

    function initCheckout() {
        window.renderCheckoutSummary();

        const speedSelect = document.getElementById('checkout-speed');
        const lgaSelect = document.getElementById('checkout-lga');
        const checkoutForm = document.getElementById('checkout-form');

        if (speedSelect) speedSelect.addEventListener('change', window.renderCheckoutSummary);
        if (lgaSelect) lgaSelect.addEventListener('change', window.renderCheckoutSummary);

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', function(e) {
                e.preventDefault();

                // 1. Verify Cart Empty State
                const items = getCheckoutCartItems();
                if (items.length === 0) {
                    if (typeof window.showOrderError === 'function') {
                        window.showOrderError('Your cart is empty. Please add items before proceeding.');
                    } else {
                        alert('Your cart is empty. Please add items before proceeding.');
                    }
                    return;
                }

                // 2. Validate Form Fields
                const name = (document.getElementById('checkout-name')?.value || '').trim();
                const phone = (document.getElementById('checkout-phone')?.value || '').trim();
                const email = (document.getElementById('checkout-email')?.value || '').trim();
                const address = (document.getElementById('checkout-address')?.value || '').trim();
                const landmark = (document.getElementById('checkout-landmark')?.value || '').trim();
                const lga = document.getElementById('checkout-lga')?.value || '';
                const payment = document.getElementById('checkout-payment')?.value || '';

                const errors = [];
                if (!name) errors.push('Full Name is required.');
                if (!phone || !/^0[789][01]\d{8}$/.test(phone)) errors.push('Valid 11-digit Nigerian phone number is required (e.g., 08012345678).');
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email address is required.');
                if (!address) errors.push('Delivery address is required.');
                if (!landmark) errors.push('Landmark / Nearest Junction is required.');
                if (!lga) errors.push('Please select a Local Government Area (LGA).');

                if (errors.length > 0) {
                    if (typeof window.showOrderError === 'function') {
                        window.showOrderError(errors[0]);
                    } else {
                        alert(errors[0]);
                    }
                    return;
                }

                // 3. Process Valid Order
                const submitBtn = checkoutForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = '⏳ Processing...';
                }

                setTimeout(function() {
                    const speedSelectEl = document.getElementById('checkout-speed');
                    const subtotal = calculateSubtotal(items);
                    
                    let deliveryFee = 700;
                    if (speedSelectEl && speedSelectEl.options[speedSelectEl.selectedIndex]) {
                        deliveryFee = parseFloat(speedSelectEl.options[speedSelectEl.selectedIndex].getAttribute('data-fee')) || 700;
                    }
                    
                    const finalFee = (subtotal >= 150000) ? 0 : deliveryFee;
                    const grandTotal = subtotal + finalFee;
                    const isStandard = speedSelectEl && speedSelectEl.value && speedSelectEl.value.toLowerCase().includes('standard');

                    const orderData = {
                        orderNumber: '#ORD-' + Math.floor(100000 + Math.random() * 900000),
                        total: `₦${grandTotal.toLocaleString()}`,
                        delivery: `${lga.toUpperCase()} – ${isStandard ? 'Standard' : 'Express'} (${payment === 'cod' ? 'Cash on Delivery' : 'Prepaid'})`,
                        eta: 'Today, 5:00 PM',
                        customerName: name
                    };

                    // Upgrade account to wholesale mode if currently retail
                    if (typeof window.toggleWholesaleMode === 'function' && !isWholesaleActive()) {
                        window.toggleWholesaleMode(true, name);
                    }

                    // Flush local cart
                    if (typeof window.clearCart === 'function') {
                        window.clearCart();
                    } else {
                        localStorage.removeItem(STORAGE_KEY);
                    }

                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = '🛒 Place Order';
                    }

                    // Trigger success modal
                    if (typeof window.showOrderSuccess === 'function') {
                        window.showOrderSuccess(orderData);
                    } else {
                        alert(`Order Placed Successfully! Order Total: ${orderData.total}`);
                    }
                }, 1000);
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCheckout);
    } else {
        initCheckout();
    }
})();