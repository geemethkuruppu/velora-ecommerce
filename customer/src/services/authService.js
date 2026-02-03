import api from './api';

const API_BASE_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000/api/v1/auth';

/**
 * Register a new user
 */
export const register = async (email, password, fullName = null) => {
    const response = await api.post(`${API_BASE_URL}/register`, {
        email,
        password,
        full_name: fullName,
    });
    return response.data;
};

/**
 * Login user
 */
export const login = async (email, password) => {
    const response = await api.post(`${API_BASE_URL}/login`, {
        email,
        password,
    });
    return response.data;
};

/**
 * Logout user
 */
export const logout = async () => {
    const response = await api.post(`${API_BASE_URL}/logout`);
    return response.data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
    const response = await api.get(`${API_BASE_URL}/me`);
    return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (fullName) => {
    const response = await api.put(`${API_BASE_URL}/edit`, {
        full_name: fullName,
    });
    return response.data;
};

/**
 * Update user password
 */
export const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
    const response = await api.put(`${API_BASE_URL}/update-password`, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
    });
    return response.data;
};

/**
 * Delete user account
 */
export const deleteAccount = async () => {
    const response = await api.delete(`${API_BASE_URL}/delete`);
    return response.data;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
    if (password.length < 8) {
        return {
            isValid: false,
            message: 'Password must be at least 8 characters long',
        };
    }
    if (password.length > 128) {
        return {
            isValid: false,
            message: 'Password must be less than 128 characters',
        };
    }
    if (!/[A-Z]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one uppercase letter',
        };
    }
    if (!/[a-z]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one lowercase letter',
        };
    }
    if (!/\d/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one digit',
        };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one special character',
        };
    }
    return {
        isValid: true,
        message: 'Password is valid',
    };
};
