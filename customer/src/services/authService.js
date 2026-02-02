const API_BASE_URL = import.meta.env.VITE_AUTH_URL || 'https://q4yf0oqk42.execute-api.ap-south-1.amazonaws.com/prod/api/v1/auth';

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password (min 8 chars)
 * @param {string} fullName - User's full name (optional)
 * @returns {Promise<Object>} User data
 */
export const register = async (email, password, fullName = null) => {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                full_name: fullName,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Registration failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Token response with user data
 */
export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Get current user profile
 * @param {string} token - JWT access token
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to fetch user data');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update user profile
 * @param {string} token - JWT access token
 * @param {string} fullName - Updated full name
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (token, fullName) => {
    try {
        const response = await fetch(`${API_BASE_URL}/edit`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                full_name: fullName,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to update profile');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Update user password
 * @param {string} token - JWT access token
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise<Object>} Success message
 */
export const updatePassword = async (token, currentPassword, newPassword, confirmPassword) => {
    try {
        const response = await fetch(`${API_BASE_URL}/update-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to update password');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete user account
 * @param {string} token - JWT access token
 * @returns {Promise<Object>} Success message
 */
export const deleteAccount = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/delete`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to delete account');
        }

        return data;
    } catch (error) {
        throw error;
    }
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
    return {
        isValid: true,
        message: 'Password is valid',
    };
};
