/**
 * UNIVERSAL ADD-TO-CART CLICK HANDLER MODULE
 */

import { isWholesaleActive } from './auth-controller.js';
import { getCart, addToCart, getStockStatus } from './cart-controller-v.1.2.2.js';

/**
 * Safely checks wholesale status with local fallback.
 */
function isWholesaleActiveSafe() {

    if (typeof isWholesaleActive === 'function') {
        return isWholesaleActive();
    }
    return localStorage.getItem('wholesaleMode') === 'true';

}

/**
 * Attaches the global delegated click event listener for add-to-cart actions.
 */
export function initAddToCartHandler() {

    document.addEventListener('click', function(e) {
        
        const btn = e.target.closest('.add-to-cart-btn, .btn-green, .qty-add .btn');
        if (!btn || btn.disabled) return;

        const card = btn.closest('.product-card, .pdp-summary');
        if (!card) return;

        e.preventDefault();

        const isWholesale = isWholesaleActiveSafe();

        // 1. Product Identification
        const titleEl = card.querySelector('.title, .product-title, h3, h4');
        const skuEl = card.querySelector('.sku');
        const productName = titleEl ? titleEl.textContent.trim() : 'Product';
        const rawSku = card.getAttribute('data-base-sku') || (skuEl ? skuEl.textContent.replace(/^SKU:\s*/i, '').trim() : 'GENERIC');

        // 2. Active Weight Chip or Variation Dropdown Evaluation
        const activeChip = card.querySelector('.weight-chip.active');
        const selectEl = card.querySelector('select#wholesale, select#retail, .select.retail, .select.wholesale');

        let variantLabel = '';
        let variantSkuSuffix = '';
        let chipRetailPrice = null;
        let chipWholesalePrice = null;

        if (activeChip) {
            // Read from weight chip (.attr-pill)
            variantLabel = activeChip.getAttribute('data-size') || activeChip.textContent.trim();
            variantSkuSuffix = variantLabel.toLowerCase().replace(/\s+/g, '');
            chipRetailPrice = parseFloat(activeChip.getAttribute('data-price-retail'));
            chipWholesalePrice = parseFloat(activeChip.getAttribute('data-price-wholesale'));
        } else if (selectEl) {
            // Fallback for select dropdowns
            const selectedValue = selectEl.value;
            const selectedOptionText = selectEl.selectedIndex !== -1 ? selectEl.options[selectEl.selectedIndex].text : '';
            variantLabel = selectedOptionText.trim();
            variantSkuSuffix = selectedValue;
        }

        // Construct unique item SKU and Display Name
        const itemSku = variantSkuSuffix ? `${rawSku}-${variantSkuSuffix}` : rawSku;
        const fullItemName = variantLabel ? `${productName} (${variantLabel})` : productName;

        // 3. Price Determination
        let retailPrice = chipRetailPrice || parseFloat(card.getAttribute('data-price-retail')) || 0;
        let wholesalePrice = chipWholesalePrice || parseFloat(card.getAttribute('data-price-wholesale')) || retailPrice;

        if (!retailPrice) {
            const priceEl = card.querySelector('.price.price-retail, .price.retail, .price');
            const priceMatch = priceEl ? priceEl.textContent.match(/₦\s*([\d,]+(?:\.\d+)?)/) : null;
            retailPrice = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
            wholesalePrice = retailPrice;
        }

        // 4. Existing Cart & Stock State
        const cart = typeof getCart === 'function' ? getCart() : (window.getCart ? window.getCart() : []);
        const existingItem = cart.find(i => i.sku === itemSku);
        const qtyInCart = existingItem ? existingItem.quantity : 0;

        // 5. Quantity & Wholesale MOQ Processing
        const qtyInput = card.querySelector('input.qty-count, input[type="number"]');
        let requestedQty = parseInt(qtyInput ? qtyInput.value : 1, 10) || 1;

        const WHOLESALE_MOQ = 10;

        if (isWholesale) {
            const totalVariantQty = qtyInCart + requestedQty;

            if (totalVariantQty < WHOLESALE_MOQ) {
                const topUpAmount = WHOLESALE_MOQ - qtyInCart;
                requestedQty = topUpAmount;

                if (qtyInput) qtyInput.value = WHOLESALE_MOQ;

                alert(`Wholesale orders require a Minimum Order Quantity (MOQ) of ${WHOLESALE_MOQ} bags per variant.\n\nQuantity for this item updated to ${WHOLESALE_MOQ}.`);
            }
        }

        // 6. Stock Validation
        const stockFetcher = typeof getStockStatus === 'function' ? getStockStatus : window.getStockStatus;
        const stockInfo = (typeof stockFetcher === 'function') 
            ? stockFetcher(itemSku) 
            : { stock: 999, status: 'in-stock' };

        const availableStock = stockInfo.stock - qtyInCart;

        if (stockInfo.stock <= 0) {
            alert(`Sorry, ${fullItemName} is currently out of stock.`);
            return;
        }

        if (requestedQty > availableStock) {
            alert(availableStock <= 0 
                ? `You already have all ${stockInfo.stock} available units of ${fullItemName} in your cart.` 
                : `Only ${availableStock} more unit(s) available for ${fullItemName} (${qtyInCart} already in cart).`
            );
            return;
        }

        // 7. Add to Cart Execution
        const executeAddToCart = typeof addToCart === 'function' ? addToCart : window.addToCart;

        if (typeof executeAddToCart === 'function') {
            executeAddToCart(itemSku, fullItemName, retailPrice, wholesalePrice, requestedQty);

            // Button Feedback
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="fas fa-check"></span> Added!';
            btn.style.backgroundColor = '#16a34a';
            btn.style.color = '#ffffff';

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.backgroundColor = '';
                btn.style.color = '';
            }, 1200);
        }
    });
}