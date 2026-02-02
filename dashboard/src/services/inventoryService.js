import axios from 'axios';

// Get base URL from environment or default to production
const INVENTORY_SERVICE_URL = import.meta.env.VITE_INVENTORY_URL || 'https://q4yf0oqk42.execute-api.ap-south-1.amazonaws.com/prod/api/v1/inventory';

const api = axios.create({
    baseURL: INVENTORY_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
    const session = localStorage.getItem('velora_admin_user');
    if (session) {
        const token = JSON.parse(session).token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

const InventoryService = {
    // Get all inventory items with optional filters
    getInventory: async (lowStockOnly = false) => {
        try {
            const params = lowStockOnly ? { low_stock: true } : {};
            const response = await api.get('', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching inventory:', error);
            throw error;
        }
    },

    // Get dashboard stats
    getStats: async () => {
        try {
            const response = await api.get('/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching inventory stats:', error);
            throw error;
        }
    },

    // Get all reservations
    getReservations: async () => {
        try {
            const response = await api.get('/reservations');
            return response.data;
        } catch (error) {
            console.error('Error fetching reservations:', error);
            throw error;
        }
    },

    // Get all events
    getEvents: async () => {
        try {
            const response = await api.get('/events');
            return response.data;
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    // Get single variant (if needed)
    getVariant: async (variantId) => {
        try {
            const response = await api.get(`/variant/${variantId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching variant:', error);
            throw error;
        }
    },

    // Manual stock adjustments
    addStock: async (variantId, quantity) => {
        try {
            const response = await api.post('/add-stock', { variant_id: variantId, quantity });
            return response.data;
        } catch (error) {
            console.error('Error adding stock:', error);
            throw error;
        }
    },

    removeStock: async (variantId, quantity) => {
        try {
            const response = await api.post('/remove-stock', { variant_id: variantId, quantity });
            return response.data;
        } catch (error) {
            console.error('Error removing stock:', error);
            throw error;
        }
    },

    updateStock: async (variantId, quantity) => {
        try {
            const response = await api.post('/update-stock', { variant_id: variantId, quantity });
            return response.data;
        } catch (error) {
            console.error('Error updating stock:', error);
            throw error;
        }
    }
};

export default InventoryService;
