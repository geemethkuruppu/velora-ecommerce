import axios from 'axios';

const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'https://q4yf0oqk42.execute-api.ap-south-1.amazonaws.com/prod/api/v1/auth';

export const userService = {
    // Get current user details from backend
    getCurrentUser: async () => {
        try {
            const response = await axios.get(`${AUTH_URL}/me`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch user details');
        }
    },

    // Update user profile
    updateProfile: async (userId, data) => {
        try {
            const response = await axios.put(`${AUTH_URL}/users/${userId}`, data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to update profile');
        }
    },

    // Get all users (admin only)
    getUsers: async () => {
        try {
            const response = await axios.get(`${AUTH_URL}/users`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch users');
        }
    },

    // Get all admin users (SUPER_ADMIN only)
    getAllAdminUsers: async () => {
        try {
            const response = await axios.get(`${AUTH_URL}/users`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to fetch admin users');
        }
    },

    // Create new admin user
    createAdmin: async (data) => {
        try {
            const response = await axios.post(`${AUTH_URL}/register-admin`, {
                email: data.email,
                password: data.password,
                full_name: data.full_name
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to create admin');
        }
    },

    // Delete user account
    deleteUser: async (userId) => {
        try {
            const response = await axios.delete(`${AUTH_URL}/users/${userId}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to delete user');
        }
    },

    // Toggle user status (Activate/Deactivate)
    toggleUserStatus: async (userId, activate) => {
        try {
            const action = activate ? 'activate' : 'deactivate';
            const response = await axios.patch(`${AUTH_URL}/users/${userId}/${action}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || `Failed to ${activate ? 'activate' : 'deactivate'} user`);
        }
    },

    // Request password reset for a user (Admin only)
    requestPasswordReset: async (userId) => {
        try {
            const response = await axios.post(`${AUTH_URL}/users/${userId}/reset-password-request`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to request password reset');
        }
    }
};
