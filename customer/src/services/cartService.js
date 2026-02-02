import axios from 'axios';

const API_URL = import.meta.env.VITE_CART_URL;

const cartService = {
    /**
     * Get user's cart
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Cart with items
     */
    getCart: async (token) => {
        console.log('[CartService] getCart - API_URL:', API_URL, 'token:', !!token);
        try {
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('[CartService] getCart response:', response.data);
            return response.data;
        } catch (error) {
            console.error('[CartService] Failed to fetch cart:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Add item to cart
     * @param {string} token - JWT token
     * @param {number} productId - Product ID
     * @param {number} quantity - Quantity to add
     * @param {number|null} variantId - Optional variant ID
     * @returns {Promise<Object>} Added cart item
     */
    addToCart: async (token, productId, quantity = 1, variantId = null) => {
        console.log('[CartService] addToCart - productId:', productId, 'quantity:', quantity, 'variantId:', variantId);
        console.log('[CartService] addToCart - API_URL:', `${API_URL}/items`);
        try {
            const response = await axios.post(
                `${API_URL}/items`,
                {
                    product_id: productId,
                    quantity,
                    variant_id: variantId
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            console.log('[CartService] addToCart response:', response.data);
            return response.data;
        } catch (error) {
            console.error('[CartService] Failed to add to cart:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Update cart item quantity
     * @param {string} token - JWT token
     * @param {number} itemId - Cart item ID
     * @param {number} quantity - New quantity
     * @returns {Promise<Object>} Success message
     */
    updateCartItem: async (token, itemId, quantity) => {
        try {
            const response = await axios.put(
                `${API_URL}/items/${itemId}`,
                { quantity },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('[CartService] Failed to update cart item:', error);
            throw error;
        }
    },

    /**
     * Remove item from cart
     * @param {string} token - JWT token
     * @param {number} itemId - Cart item ID
     * @returns {Promise<Object>} Success message
     */
    removeFromCart: async (token, itemId) => {
        try {
            const response = await axios.delete(
                `${API_URL}/items/${itemId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('[CartService] Failed to remove from cart:', error);
            throw error;
        }
    },

    /**
     * Clear entire cart
     * @param {string} token - JWT token
     * @returns {Promise<Object>} Success message
     */
    clearCart: async (token) => {
        try {
            const response = await axios.delete(
                `${API_URL}/clear`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('[CartService] Failed to clear cart:', error);
            throw error;
        }
    },

    /**
     * Merge guest cart with user cart on login
     * @param {string} token - JWT token
     * @param {Array} guestItems - Array of guest cart items
     * @returns {Promise<Object>} Merged cart
     */
    mergeGuestCart: async (token, guestItems) => {
        try {
            const response = await axios.post(
                `${API_URL}/merge`,
                { guest_items: guestItems },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('[CartService] Failed to merge cart:', error);
            throw error;
        }
    }
};

export default cartService;
