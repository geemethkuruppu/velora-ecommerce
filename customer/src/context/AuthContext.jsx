import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial auth check on mount (relying on httpOnly cookies)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // If we have an access_token cookie, this will succeed
                const userData = await authService.getCurrentUser();
                setUser(userData);
            } catch (err) {
                // If 401, interceptor might have already tried refresh
                // If truly unauthorized, user remains null
                console.log('User not authenticated (no valid cookie)');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    /**
     * Register a new user
     */
    const register = async (email, password, fullName) => {
        try {
            setLoading(true);
            setError(null);

            await authService.register(email, password, fullName);

            // Auto-login after registration
            const loginData = await authService.login(email, password);

            if (loginData.access_token) {
                localStorage.setItem('customer_token', loginData.access_token);
            }

            setUser(loginData.user);
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

            if (data.access_token) {
                localStorage.setItem('customer_token', data.access_token);
            }

            setUser(data.user);
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
    const logout = async () => {
        try {
            await authService.logout();
            localStorage.removeItem('customer_token');
            setUser(null);
            setError(null);
        } catch (err) {
            console.error('Logout failed:', err);
            // Force logout state anyway
            setUser(null);
        }
    };

    /**
     * Update user profile
     */
    const updateProfile = async (fullName) => {
        try {
            setLoading(true);
            setError(null);

            const updatedUser = await authService.updateProfile(fullName);
            setUser(updatedUser);
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

            const result = await authService.updatePassword(
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
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
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

            await authService.deleteAccount();

            // Clear all user data and logout
            setUser(null);

            return { message: 'Account deleted successfully' };
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const contextValue = useMemo(() => ({
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
        deleteUserAccount,
        refreshUser,
        isAuthenticated: !!user,
    }), [user, loading, error]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
