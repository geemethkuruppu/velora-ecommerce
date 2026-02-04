import api from './api';

const API_URL = import.meta.env.VITE_PRODUCT_URL;

export const formatImageUrl = (url) => {
    if (!url) return null;
    // If it's already a full URL (S3), return it directly
    if (url.startsWith('http')) return url;

    // For any legacy local paths, we assume they should be handled as-is
    // But since the new system uses S3, we prioritize absolute URLs
    return url;
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
