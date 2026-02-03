import api from './api';

const API_URL = import.meta.env.VITE_PRODUCT_URL;
const API_BASE = API_URL.split('/api/v1')[0];
const IMAGE_BASE_URL = `${API_BASE}/uploads/`;

export const formatImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;

    // Cleanup the URL: remove leading slash, remove leading 'uploads/' if present
    let cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    if (cleanUrl.startsWith('uploads/')) {
        cleanUrl = cleanUrl.replace('uploads/', '');
    }

    return `${IMAGE_BASE_URL}${cleanUrl}`;
};

const productService = {
    getCategories: async (department = null) => {
        try {
            const params = department ? { department } : {};
            const response = await api.get(`${API_URL}/categories`, { params });
            // Format media_url/image for UI
            return response.data.map(cat => ({
                ...cat,
                image: formatImageUrl(cat.image_url || cat.image)
            }));
        } catch (error) {
            console.error('[ProductService] Failed to fetch categories:', error);
            throw error;
        }
    },

    getProducts: async (filters = {}) => {
        try {
            const response = await api.get(`${API_URL}`, { params: filters });

            // Transform backend ProductResponse to UI-friendly format
            return response.data.map(product => {
                // Find primary media or take the first one
                const primaryMedia = product.media?.find(m => m.is_primary) || product.media?.[0];

                return {
                    ...product,
                    image: formatImageUrl(primaryMedia?.media_url),
                    price: `${product.currency === 'USD' ? '$' : product.currency + ' '}${parseFloat(product.base_price).toLocaleString()}`
                };
            });
        } catch (error) {
            console.error('[ProductService] Failed to fetch products:', error);
            throw error;
        }
    }
};

export default productService;
