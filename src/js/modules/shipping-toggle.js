/**
 * SECTION 16: SHIPPING COLUMN TOGGLE MODULE
 */

export function initShippingToggle() {
    const shipCheckbox = document.getElementById('ship-to-different');
    const shippingColumn = document.getElementById('shipping');

    if (!shipCheckbox || !shippingColumn) return;

    const shippingInputs = shippingColumn.querySelectorAll('input, select, textarea');

    function toggleShippingForm() {
        const isDifferent = shipCheckbox.checked;

        if (isDifferent) {
            shippingColumn.classList.remove('d-none');
            // Enable required attributes when shipping form is visible
            shippingInputs.forEach(input => {
                if (input.dataset.wasRequired !== 'false') {
                    input.setAttribute('required', 'required');
                }
            });
        } else {
            shippingColumn.classList.add('d-none');
            // Remove required attributes so form submission works without hidden fields failing
            shippingInputs.forEach(input => {
                input.removeAttribute('required');
            });
        }
    }

    // Attach listener & run initial check on call
    shipCheckbox.addEventListener('change', toggleShippingForm);
    toggleShippingForm();
}

// Auto-initialize when loaded on DOMReady if imported directly
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShippingToggle);
} else {
    initShippingToggle();
}