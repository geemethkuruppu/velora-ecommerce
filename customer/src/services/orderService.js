import api from './api';
import { formatImageUrl } from './productService';

const API_URL = import.meta.env.VITE_ORDER_URL;

const orderService = {
    /**
     * Create a new order
     */
    createOrder: async (orderData) => {
        try {
            console.log('[OrderService] Creating order:', orderData);
            const response = await api.post(
                API_URL,
                orderData
            );
            return response.data;
        } catch (error) {
            console.error('[OrderService] Failed to create order:', error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Get user's orders
     */
    getUserOrders: async () => {
        try {
            const response = await api.get(`${API_URL}/my`);
            const orders = response.data;

            // Format product images in order items
            return orders.map(order => ({
                ...order,
                items: order.items.map(item => ({
                    ...item,
                    image_url: formatImageUrl(item.image_url)
                }))
            }));
        } catch (error) {
            console.error('[OrderService] Failed to fetch orders:', error);
            throw error;
        }
    },

    /**
     * Get single order by ID
     */
    getOrder: async (orderId) => {
        try {
            const response = await api.get(`${API_URL}/${orderId}`);
            const order = response.data;

            // Format product images in order items
            if (order.items) {
                order.items = order.items.map(item => ({
                    ...item,
                    image_url: formatImageUrl(item.image_url)
                }));
            }

            return order;
        } catch (error) {
            console.error('[OrderService] Failed to fetch order:', error);
            throw error;
        }
    },

    /**
     * Cancel an order
     */
    cancelOrder: async (orderId) => {
        try {
            console.log('[OrderService] Cancelling order:', orderId);
            const response = await api.post(`${API_URL}/${orderId}/cancel`);
            return response.data;
        } catch (error) {
            console.error('[OrderService] Failed to cancel order:', error.response?.data || error.message);
            throw error;
        }
    }
};

export default orderService;
