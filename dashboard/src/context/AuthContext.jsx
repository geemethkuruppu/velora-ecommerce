import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Initial Session Load
        const savedUser = localStorage.getItem('velora_admin_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        // 2. Setup Robust Axios Interceptors
        const requestInterceptor = axios.interceptors.request.use((config) => {
            const session = localStorage.getItem('velora_admin_user');
            if (session) {
                const token = JSON.parse(session).token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            return config;
        });

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    // Prevent infinite loop if we're already on login
                    if (!window.location.pathname.includes('/login')) {
                        logout();
                        window.location.href = `/login?error=${encodeURIComponent(error.response.data.detail || 'Access denied or session expired.')}`;
                    }
                }
                return Promise.reject(error);
            }
        );

        setLoading(false);

        // Cleanup interceptors on unmount
        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    const login = async (email, password) => {
        try {
            const loginUrl = `${import.meta.env.VITE_AUTH_URL}/login`;
            const response = await axios.post(loginUrl, {
                email,
                password
            });

            const { access_token, user: userData } = response.data;

            // Business Logic Checks
            if (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN') {
                throw new Error('Access Denied: Administrative privileges required.');
            }

            if (!userData.is_active) {
                throw new Error('Access Suspended: Sorry, your account is not in active status.');
            }

            if (!userData.is_verified) {
                throw new Error('Verification Required: Please verify your account first and then try again.');
            }

            // If all checks pass
            const sessionData = { ...userData, token: access_token };
            setUser(sessionData);
            localStorage.setItem('velora_admin_user', JSON.stringify(sessionData));

            // Set axios default header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            return sessionData;

        } catch (error) {
            if (error.response) {
                // Backend returned an error (e.g., 401 Unauthorized)
                throw new Error(error.response.data.detail || 'Invalid administrative credentials.');
            }
            // Re-throw the error message (manual throws or network errors)
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('velora_admin_user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
