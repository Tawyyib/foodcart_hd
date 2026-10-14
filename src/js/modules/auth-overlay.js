/**
 * Auth Overlay & Modal Engine
 */

/**
 * Auth Overlay & Modal Engine
 */

let activeRegisterType = 'retail';

export function getOverlayElements() {
    return {
        backdrop: document.getElementById('authBackdrop') || document.querySelector('.auth-backdrop'),
        closeBtn: document.getElementById('authCloseBtn') || document.querySelector('.auth-close-btn'),
        content: document.getElementById('authContent') || document.querySelector('.auth-content')
    };
}

export function openAuthOverlay() {
    const { backdrop } = getOverlayElements();
    if (backdrop) {
        backdrop.classList.add('show');
        document.body.classList.add('no-scroll');
    }
}

export function closeAuthOverlay() {
    const { backdrop } = getOverlayElements();
    if (backdrop) {
        backdrop.classList.remove('show');
        document.body.classList.remove('no-scroll');
    }
}

export function switchRegisterType(type) {
    activeRegisterType = type;
    const tabCustomerBtn = document.getElementById('tabCustomerBtn');
    const tabBusinessBtn = document.getElementById('tabBusinessBtn');
    const bizFieldsGroup = document.getElementById('bizFieldsGroup');
    const regSubmitBtn = document.getElementById('regSubmitBtn');

    // Business inputs
    const regBusinessName = document.getElementById('regBusinessName');
    const regTin = document.getElementById('regTin');
    const regBusinessType = document.getElementById('regBusinessType');

    const isWholesale = (type === 'wholesale');

    // Update Tab Styles and ARIA attributes
    if (tabBusinessBtn) {
        tabBusinessBtn.classList.toggle('active', isWholesale);
        tabBusinessBtn.classList.toggle('inactive', !isWholesale);
        tabBusinessBtn.setAttribute('aria-selected', isWholesale ? 'true' : 'false');
    }

    if (tabCustomerBtn) {
        tabCustomerBtn.classList.toggle('active', !isWholesale);
        tabCustomerBtn.classList.toggle('inactive', isWholesale);
        tabCustomerBtn.setAttribute('aria-selected', !isWholesale ? 'true' : 'false');
    }

    // Toggle Business Fields Visibility
    if (bizFieldsGroup) {
        bizFieldsGroup.classList.toggle('show', isWholesale);
        bizFieldsGroup.classList.toggle('hide', !isWholesale);
    }

    // Toggle required status for Business fields
    [regBusinessName, regTin, regBusinessType].forEach(field => {
        if (!field) return;
        if (isWholesale) {
            field.setAttribute('required', 'required');
        } else {
            field.removeAttribute('required');
        }
    });

    // Update Submit Button Text
    if (regSubmitBtn) {
        // regSubmitBtn.innerHTML = isWholesale 
            // ? '<sapn class="fa-solid fa-check" aria-hidden="true"></span> Create Business Account' 
            // : '<span class="fa-solid fa-check" aria-hidden="true"></ispan> Create Account';
    }
}

export function showOrderSuccess(orderData = {}) {
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
    if (els.name) els.name.textContent = orderData.customerName || 'Customer';

    if (window.showAuthView) {
        window.showAuthView('orderSuccess');
    }
}

export function showOrderError(errorMessage) {
    const msgEl = document.getElementById('orderErrorMessage');
    if (msgEl) msgEl.textContent = errorMessage || 'Payment verification failed. Please try again.';
    
    if (window.showAuthView) {
        window.showAuthView('orderError');
    }
}

export function initAuthOverlayListeners() {
    document.addEventListener('click', function(e) {
        // Tab switcher clicks
        const tabBtn = e.target.closest('.register-type .tabbed-btn');
        if (tabBtn && tabBtn.dataset.registerType) {
            switchRegisterType(tabBtn.dataset.registerType);
            return;
        }

        const closeBtn = e.target.closest('#authCloseBtn, .auth-close-btn');
        if (closeBtn) {
            closeAuthOverlay();
            return;
        }

        const backdrop = e.target;
        if (backdrop && backdrop.id === 'authBackdrop') {
            closeAuthOverlay();
            return;
        }

        const link = e.target.closest('a[href*="login"], a[href*="register"], .login-btn, .register-btn, .switch-view, [data-auth="login"], [data-auth="register"]');
        if (link) {
            e.preventDefault();
            let view = link.dataset.view || link.dataset.auth;

            if (!view) {
                const href = link.getAttribute('href') || '';
                view = href.includes('login') ? 'login' : href.includes('register') ? 'register' : null;
            }

            if (view && typeof window.showAuthView === 'function') {
                window.showAuthView(view);
            }
        }
    });

    document.addEventListener('submit', function(e) {
        if (e.target && (e.target.id === 'auth-form-login' || e.target.closest('#auth-form-login'))) {
            e.preventDefault();
            const form = e.target.id === 'auth-form-login' ? e.target : e.target.closest('#auth-form-login');
            
            const identityInput = document.getElementById('loginIdentity') || form.querySelector('input[type="text"], input[type="email"]');
            const identityVal = identityInput ? identityInput.value.trim() : '';
            
            const selectedTypeRadio = form.querySelector('input[name="loginType"]:checked');
            const accountType = selectedTypeRadio ? selectedTypeRadio.value : 'retail'; 

            let name = identityVal.split('@')[0] || 'Customer';
            name = name.charAt(0).toUpperCase() + name.slice(1);

            if (typeof window.showAuthView === 'function') {
                window.showAuthView('success', 'login', name, accountType);
            }
        } 
        else if (e.target && (e.target.id === 'auth-form-register' || e.target.closest('#auth-form-register'))) {
            e.preventDefault();
            const form = e.target.id === 'auth-form-register' ? e.target : e.target.closest('#auth-form-register');
            
            const accountType = activeRegisterType || 'retail';

            let name = 'Customer';
            if (accountType === 'wholesale') {
                const bizInput = document.getElementById('regFirstName');
                name = bizInput && bizInput.value.trim() ? bizInput.value.trim() : 'Business';
            } else {
                const firstName = document.getElementById('regFirstName')?.value.trim() || '';
                // const lastName = document.getElementById('regLastName')?.value.trim() || '';
                name = `${firstName}`.trim() || 'Shopper';
            }

            if (typeof window.showAuthView === 'function') {
                window.showAuthView('success', 'register', name, accountType);
            }
            
        }

    });

}