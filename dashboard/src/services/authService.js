import api from './api';

const BASE_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000/api/v1/auth';

export const authService = {
    updatePassword: async (currentPassword, newPassword, confirmPassword) => {
        try {
            const response = await api.put(`${BASE_URL}/update-password`, {
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Failed to update password');
        }
    },

    validatePassword: (password) => {
        if (password.length < 8) return { isValid: false, message: 'At least 8 characters' };
        if (!/[A-Z]/.test(password)) return { isValid: false, message: 'Include uppercase' };
        if (!/[a-z]/.test(password)) return { isValid: false, message: 'Include lowercase' };
        if (!/\d/.test(password)) return { isValid: false, message: 'Include a digit' };
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return { isValid: false, message: 'Include special char' };
        return { isValid: true };
    }
};
