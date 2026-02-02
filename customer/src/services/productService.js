import axios from 'axios';

const API_URL = import.meta.env.VITE_PRODUCT_URL;

const productService = {
    getCategories: async (department = null) => {
        try {
            const params = department ? { department } : {};
            const response = await axios.get(`${API_URL}/categories`, { params });
            return response.data;
        } catch (error) {
            console.error('[ProductService] Failed to fetch categories:', error);
            throw error;
        }
    },

    getProducts: async (filters = {}) => {
        try {
            const response = await axios.get(`${API_URL}`, { params: filters });

            // Derive the base URL for uploads (e.g., http://localhost:8001/uploads/)
            const API_BASE = API_URL.split('/api/v1')[0];
            const IMAGE_BASE_URL = `${API_BASE}/uploads/`;

            // Transform backend ProductResponse to UI-friendly format
            return response.data.map(product => {
                // Find primary media or take the first one
                const primaryMedia = product.media?.find(m => m.is_primary) || product.media?.[0];

                let imageUrl = 'https://images.unsplash.com/photo-1539109132314-34a9c655a8c8?q=80&w=2000&auto=format&fit=crop'; // Default elegant fallback

                if (primaryMedia) {
                    imageUrl = primaryMedia.media_url.startsWith('http')
                        ? primaryMedia.media_url
                        : `${IMAGE_BASE_URL}${primaryMedia.media_url}`;
                }

                return {
                    ...product,
                    image: imageUrl,
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
