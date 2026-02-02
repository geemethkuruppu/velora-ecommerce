import axios from 'axios';

const API_URL = import.meta.env.VITE_ORDER_URL;

const orderService = {
    /**
     * Create a new order
     * @param {string} token - JWT token
     * @param {Object} orderData - Order details { items, shipping_address }
     * @returns {Promise<Object>} Created order
     */
    createOrder: async (token, orderData) => {
        try {
            console.log('[OrderService] Creating order:', orderData);
            const response = await axios.post(
                API_URL,
                orderData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('[OrderService] Failed to create order:', error.response?.data || error.message);
            console.error('[OrderService] Full error:', JSON.stringify(error.response?.data, null, 2));
            throw error;
        }
    },

    /**
     * Get user's orders
     * @param {string} token - JWT token
     * @returns {Promise<Array>} List of orders
     */
    getUserOrders: async (token) => {
        try {
            const response = await axios.get(
                `${API_URL}/my`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('[OrderService] Failed to fetch orders:', error);
            throw error;
        }
    },

    /**
     * Get single order by ID
     * @param {string} token - JWT token
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} Order details
     */
    getOrder: async (token, orderId) => {
        try {
            const response = await axios.get(
                `${API_URL}/${orderId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('[OrderService] Failed to fetch order:', error);
            throw error;
        }
    },

    /**
     * Cancel an order
     * @param {string} token - JWT token
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} Cancelled order
     */
    cancelOrder: async (token, orderId) => {
        try {
            console.log('[OrderService] Cancelling order:', orderId);
            const response = await axios.post(
                `${API_URL}/${orderId}/cancel`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return response.data;
        } catch (error) {
            console.error('[OrderService] Failed to cancel order:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default orderService;
