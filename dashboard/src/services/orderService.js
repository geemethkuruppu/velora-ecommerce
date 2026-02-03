import api from './api';

// Get base URL from environment or default to production
const ORDER_SERVICE_URL = import.meta.env.VITE_ORDER_URL || 'http://localhost:8002/api/v1/orders';


const OrderService = {
    getAllOrders: async () => {
        try {
            const response = await api.get(ORDER_SERVICE_URL);
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    getOrderDetails: async (orderId) => {
        try {
            const response = await api.get(`${ORDER_SERVICE_URL}/${orderId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error);
            throw error;
        }
    },

    getOrderStats: async () => {
        try {
            const response = await api.get(`${ORDER_SERVICE_URL}/stats`);
            return response.data;
        } catch (error) {
            console.error('Error fetching order stats:', error);
            throw error;
        }
    }
};

export default OrderService;
