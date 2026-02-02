import axios from 'axios';

// The base URL of the product service
const PRODUCT_SERVICE_BASE = import.meta.env.VITE_PRODUCT_URL || 'https://q4yf0oqk42.execute-api.ap-south-1.amazonaws.com/prod/api/v1/products';
// We'll use the parent of /products as the API root to easily access /types etc.
const API_ROOT = PRODUCT_SERVICE_BASE.replace(/\/products\/?$/, '');

console.log('[ProductService] Initializing');
console.log('[ProductService] PRODUCT_SERVICE_BASE:', PRODUCT_SERVICE_BASE);
console.log('[ProductService] API_ROOT:', API_ROOT);

// Create axios instance pointing to the API root
const api = axios.create({
    baseURL: API_ROOT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
    const savedUser = localStorage.getItem('velora_admin_user');
    const token = savedUser ? JSON.parse(savedUser).token : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[ProductService] Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
}, (error) => {
    console.error('[ProductService] Request Error:', error);
    return Promise.reject(error);
});

// Add response interceptor for logging
api.interceptors.response.use((response) => {
    console.log(`[ProductService] Response: ${response.status} from ${response.config.url}`);
    return response;
}, (error) => {
    console.error(`[ProductService] API Error: ${error.response?.status || 'Network Error'} from ${error.config?.url}`);
    return Promise.reject(error);
});

export const productService = {
    getAll: async (filters = {}) => {
        try {
            console.log('[ProductService] Calling getAll with filters:', filters);
            const response = await api.get('/products', { params: filters });
            return response.data;
        } catch (error) {
            console.error('[ProductService] getAll failed:', error.message);
            throw error;
        }
    },

    getById: async (id) => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/products/categories');
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/products/stats');
        return response.data;
    },

    createCategory: async (categoryData) => {
        const response = await api.post('/products/categories', categoryData);
        return response.data;
    },

    deleteCategory: async (id) => {
        const response = await api.delete(`/products/categories/${id}`);
        if (response.status === 204) return null;
        return response.data;
    },

    getTypes: async (filters = {}) => {
        const response = await api.get('/types', { params: filters });
        return response.data;
    },

    createType: async (typeData) => {
        const response = await api.post('/types', typeData);
        return response.data;
    },

    deleteType: async (id) => {
        const response = await api.delete(`/types/${id}`);
        if (response.status === 204) return null;
        return response.data;
    },

    create: async (productData) => {
        const response = await api.post('/products', productData);
        return response.data;
    },

    update: async (id, productData) => {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    deactivate: async (id) => {
        const response = await api.patch(`/products/${id}/deactivate`);
        return response.data;
    },

    activate: async (id) => {
        const response = await api.patch(`/products/${id}/activate`);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/products/${id}`);
        if (response.status === 204) return null;
        return response.data;
    },

    getProductStock: async (id) => {
        const response = await api.get(`/products/${id}/stock`);
        return response.data;
    },

    getLowStock: async (threshold = 10) => {
        const response = await api.get('/products/low-stock', { params: { threshold } });
        return response.data;
    },

    uploadMedia: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/products/upload-media', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
