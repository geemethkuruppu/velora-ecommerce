import axios from 'axios';

// Get base URL from environment or default to production
const ORDER_SERVICE_URL = import.meta.env.VITE_ORDER_URL || 'https://q4yf0oqk42.execute-api.ap-south-1.amazonaws.com/prod/api/v1/orders';

// Create axios instance
const api = axios.create({
    baseURL: ORDER_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor for auth token
api.interceptors.request.use(
    (config) => {
        const session = localStorage.getItem('velora_admin_user');
        if (session) {
            const token = JSON.parse(session).token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

const OrderService = {
    getAllOrders: async () => {
        try {
            const response = await api.get('');
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    getOrderDetails: async (orderId) => {
        try {
            const response = await api.get(`/${orderId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error);
            throw error;
        }
    },

    getOrderStats: async () => {
        try {
            const response = await api.get('/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching order stats:', error);
            throw error;
        }
    }
};

export default OrderService;
