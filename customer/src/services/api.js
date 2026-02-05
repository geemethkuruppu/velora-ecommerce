import axios from 'axios';

const api = axios.create({
    withCredentials: true, // Necessary for httpOnly cookies
});

// Inject Bearer Token for Cross-Domain Auth
api.interceptors.request.use((config) => {
    console.log('Attaching Token to Request');
    const token = localStorage.getItem('customer_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle Token Refresh & Error Formatting
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // 1. Extract detailed error message from backend if available
        if (error.response?.data?.detail) {
            error.message = error.response.data.detail;
        }

        const originalRequest = error.config;

        // 2. If error is 401 and not a login/refresh request itself, try to refresh
        const isAuthRequest = originalRequest.url.includes('/login') || originalRequest.url.includes('/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true;

            try {
                const AUTH_URL = import.meta.env.VITE_AUTH_URL;
                if (!AUTH_URL) throw new Error('AUTH_URL not configured');
                const refreshResponse = await axios.post(`${AUTH_URL}/refresh`, {}, { withCredentials: true });

                // Update Local Token
                if (refreshResponse.data?.access_token) {
                    localStorage.setItem('customer_token', refreshResponse.data.access_token);
                    originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
                }

                return api(originalRequest);
            } catch (refreshError) {
                console.error('Session expired. Please log in again.');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
