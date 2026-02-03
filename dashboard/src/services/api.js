import axios from 'axios';

const api = axios.create({
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If the request is marked as silent, don't attempt refresh or log errors
        if (originalRequest._silent && error.response?.status === 401) {
            return Promise.reject(error);
        }

        // Don't retry if the failed request was a login attempt (401 means invalid credentials)
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/login')) {
            originalRequest._retry = true;

            try {
                const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000/api/v1/auth';
                await axios.post(`${AUTH_URL}/refresh`, {}, { withCredentials: true });
                return api(originalRequest);
            } catch (refreshError) {
                // Suppressed generic console error as it's often expected behavior (e.g. not logged in)
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
