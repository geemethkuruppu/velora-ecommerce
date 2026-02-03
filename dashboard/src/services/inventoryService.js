import api from './api';

// Get base URL from environment or default
const INVENTORY_SERVICE_URL = import.meta.env.VITE_INVENTORY_URL || 'http://localhost:8004/api/v1/inventory';

const InventoryService = {
    // Get all inventory items with optional filters
    getInventory: async (lowStockOnly = false) => {
        try {
            const params = lowStockOnly ? { low_stock: true } : {};
            const response = await api.get(INVENTORY_SERVICE_URL, { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching inventory:', error);
            throw error;
        }
    },

    // Get dashboard stats
    getStats: async () => {
        try {
            const response = await api.get(`${INVENTORY_SERVICE_URL}/stats`);
            return response.data;
        } catch (error) {
            console.error('Error fetching inventory stats:', error);
            throw error;
        }
    },

    // Get all reservations
    getReservations: async () => {
        try {
            const response = await api.get(`${INVENTORY_SERVICE_URL}/reservations`);
            return response.data;
        } catch (error) {
            console.error('Error fetching reservations:', error);
            throw error;
        }
    },

    // Get all events
    getEvents: async () => {
        try {
            const response = await api.get(`${INVENTORY_SERVICE_URL}/events`);
            return response.data;
        } catch (error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    },

    // Get single variant (if needed)
    getVariant: async (variantId) => {
        try {
            const response = await api.get(`${INVENTORY_SERVICE_URL}/variant/${variantId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching variant:', error);
            throw error;
        }
    },

    // Manual stock adjustments
    addStock: async (variantId, quantity) => {
        try {
            const response = await api.post(`${INVENTORY_SERVICE_URL}/add-stock`, { variant_id: variantId, quantity });
            return response.data;
        } catch (error) {
            console.error('Error adding stock:', error);
            throw error;
        }
    },

    removeStock: async (variantId, quantity) => {
        try {
            const response = await api.post(`${INVENTORY_SERVICE_URL}/remove-stock`, { variant_id: variantId, quantity });
            return response.data;
        } catch (error) {
            console.error('Error removing stock:', error);
            throw error;
        }
    },

    updateStock: async (variantId, quantity) => {
        try {
            const response = await api.post(`${INVENTORY_SERVICE_URL}/update-stock`, { variant_id: variantId, quantity });
            return response.data;
        } catch (error) {
            console.error('Error updating stock:', error);
            throw error;
        }
    }
};

export default InventoryService;
