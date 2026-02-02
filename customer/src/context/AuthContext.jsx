import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUserFromStorage = async () => {
            try {
                const storedToken = localStorage.getItem('authToken');
                const storedUser = localStorage.getItem('userData');

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));

                    // Optionally verify token is still valid by fetching current user
                    try {
                        const currentUser = await authService.getCurrentUser(storedToken);
                        setUser(currentUser);
                        localStorage.setItem('userData', JSON.stringify(currentUser));
                    } catch (err) {
                        // Token expired or invalid, clear storage
                        console.error('Token validation failed:', err);
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('userData');
                        setToken(null);
                        setUser(null);
                    }
                }
            } catch (err) {
                console.error('Error loading user from storage:', err);
            } finally {
                setLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    /**
     * Register a new user
     */
    const register = async (email, password, fullName) => {
        try {
            setLoading(true);
            setError(null);

            // Register user
            const userData = await authService.register(email, password, fullName);

            // Auto-login after registration
            const loginData = await authService.login(email, password);

            // Store token and user data
            setToken(loginData.access_token);
            setUser(loginData.user);
            localStorage.setItem('authToken', loginData.access_token);
            localStorage.setItem('userData', JSON.stringify(loginData.user));

            return loginData;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Login user
     */
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const data = await authService.login(email, password);

            // Store token and user data
            setToken(data.access_token);
            setUser(data.user);
            localStorage.setItem('authToken', data.access_token);
            localStorage.setItem('userData', JSON.stringify(data.user));

            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        setUser(null);
        setToken(null);
        setError(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    };

    /**
     * Update user profile
     */
    const updateProfile = async (fullName) => {
        try {
            setLoading(true);
            setError(null);

            if (!token) {
                throw new Error('No authentication token found');
            }

            const updatedUser = await authService.updateProfile(token, fullName);

            setUser(updatedUser);
            localStorage.setItem('userData', JSON.stringify(updatedUser));

            return updatedUser;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Update user password
     */
    const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
        try {
            setLoading(true);
            setError(null);

            if (!token) {
                throw new Error('No authentication token found');
            }

            const result = await authService.updatePassword(
                token,
                currentPassword,
                newPassword,
                confirmPassword
            );

            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Refresh user data from server
     */
    const refreshUser = async () => {
        try {
            if (!token) {
                throw new Error('No authentication token found');
            }

            const currentUser = await authService.getCurrentUser(token);
            setUser(currentUser);
            localStorage.setItem('userData', JSON.stringify(currentUser));

            return currentUser;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    /**
     * Delete user account
     */
    const deleteUserAccount = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!token) {
                throw new Error('No authentication token found');
            }

            await authService.deleteAccount(token);

            // Clear all user data and logout
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            setToken(null);
            setUser(null);

            return { message: 'Account deleted successfully' };
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
        deleteUserAccount,
        refreshUser,
        isAuthenticated: !!user && !!token,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
