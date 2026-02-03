import api from './api';
import { formatImageUrl } from './productService';

const API_URL = import.meta.env.VITE_CART_URL;

const cartService = {
    /**
     * Get user's cart
     */
    getCart: async () => {
        try {
            const response = await api.get(API_URL);
            const cartData = response.data;

            // Format product images in cart items
            if (cartData.items) {
                cartData.items = cartData.items.map(item => ({
                    ...item,
                    product: item.product ? {
                        ...item.product,
                        image: formatImageUrl(item.product.image || item.product.image_url)
                    } : null
                }));
            }

            return cartData;
        } catch (error) {
            console.error('[CartService] Failed to fetch cart:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Add item to cart
     */
    addToCart: async (productId, quantity = 1, variantId = null) => {
        try {
            const response = await api.post(`${API_URL}/items`, {
                product_id: productId,
                quantity,
                variant_id: variantId
            });
            return response.data;
        } catch (error) {
            console.error('[CartService] Failed to add to cart:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Update cart item quantity
     */
    updateCartItem: async (itemId, quantity) => {
        try {
            const response = await api.put(`${API_URL}/items/${itemId}`, { quantity });
            return response.data;
        } catch (error) {
            console.error('[CartService] Failed to update cart item:', error);
            throw error;
        }
    },

    /**
     * Remove item from cart
     */
    removeFromCart: async (itemId) => {
        try {
            const response = await api.delete(`${API_URL}/items/${itemId}`);
            return response.data;
        } catch (error) {
            console.error('[CartService] Failed to remove from cart:', error);
            throw error;
        }
    },

    /**
     * Clear entire cart
     */
    clearCart: async () => {
        try {
            const response = await api.delete(`${API_URL}/clear`);
            return response.data;
        } catch (error) {
            console.error('[CartService] Failed to clear cart:', error);
            throw error;
        }
    },

    /**
     * Merge guest cart with user cart on login
     */
    mergeGuestCart: async (guestItems) => {
        try {
            const response = await api.post(`${API_URL}/merge`, { guest_items: guestItems });
            return response.data;
        } catch (error) {
            console.error('[CartService] Failed to merge cart:', error);
            throw error;
        }
    }
};

export default cartService;
