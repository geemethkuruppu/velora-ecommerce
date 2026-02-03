import api from './api';

// The base URL of the product service API (e.g. http://localhost:8001/api/v1)
// We strip '/products' if it's there to get the root API path
const SERVICE_URL = (import.meta.env.VITE_PRODUCT_URL || 'http://localhost:8001/api/v1/products')
    .replace(/\/products\/?$/, '');

export const productService = {
    getAll: async (filters = {}) => {
        try {
            console.log('[ProductService] Calling getAll with filters:', filters);
            const response = await api.get(`${SERVICE_URL}/products`, { params: filters });
            return response.data;
        } catch (error) {
            console.error('[ProductService] getAll failed:', error.message);
            throw error;
        }
    },

    getById: async (id) => {
        const response = await api.get(`${SERVICE_URL}/products/${id}`);
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get(`${SERVICE_URL}/products/categories`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get(`${SERVICE_URL}/products/stats`);
        return response.data;
    },

    createCategory: async (categoryData) => {
        const response = await api.post(`${SERVICE_URL}/products/categories`, categoryData);
        return response.data;
    },

    deleteCategory: async (id) => {
        const response = await api.delete(`${SERVICE_URL}/products/categories/${id}`);
        if (response.status === 204) return null;
        return response.data;
    },

    getTypes: async (filters = {}) => {
        const response = await api.get(`${SERVICE_URL}/types`, { params: filters });
        return response.data;
    },

    createType: async (typeData) => {
        const response = await api.post(`${SERVICE_URL}/types`, typeData);
        return response.data;
    },

    deleteType: async (id) => {
        const response = await api.delete(`${SERVICE_URL}/types/${id}`);
        if (response.status === 204) return null;
        return response.data;
    },

    create: async (productData) => {
        const response = await api.post(`${SERVICE_URL}/products`, productData);
        return response.data;
    },

    update: async (id, productData) => {
        const response = await api.put(`${SERVICE_URL}/products/${id}`, productData);
        return response.data;
    },

    deactivate: async (id) => {
        const response = await api.patch(`${SERVICE_URL}/products/${id}/deactivate`);
        return response.data;
    },

    activate: async (id) => {
        const response = await api.patch(`${SERVICE_URL}/products/${id}/activate`);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`${SERVICE_URL}/products/${id}`);
        if (response.status === 204) return null;
        return response.data;
    },

    getProductStock: async (id) => {
        const response = await api.get(`${SERVICE_URL}/products/${id}/stock`);
        return response.data;
    },

    getLowStock: async (threshold = 10) => {
        const response = await api.get(`${SERVICE_URL}/products/low-stock`, { params: { threshold } });
        return response.data;
    },

    uploadMedia: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post(`${SERVICE_URL}/products/upload-media`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
