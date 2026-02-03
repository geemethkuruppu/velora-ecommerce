import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const hasChecked = React.useRef(false);

    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;

        const verifySession = async () => {
            try {
                const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8000/api/v1/auth';
                const response = await api.get(`${AUTH_URL}/me`, { _silent: true });
                setUser(response.data);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    const login = async (email, password) => {
        try {
            const loginUrl = `${import.meta.env.VITE_AUTH_URL}/login`;
            const response = await api.post(loginUrl, {
                email,
                password
            });

            const { user: userData } = response.data;

            // Business Logic Checks
            if (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN') {
                await logout();
                throw new Error('Access Denied: Administrative privileges required.');
            }

            if (!userData.is_active) {
                await logout();
                throw new Error('Access Suspended: Sorry, your account is not in active status.');
            }

            setUser(userData);
            return userData;

        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.detail || 'Invalid administrative credentials.');
            }
            throw error;
        }
    };

    const logout = async () => {
        try {
            const logoutUrl = `${import.meta.env.VITE_AUTH_URL}/logout`;
            await api.post(logoutUrl);
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
