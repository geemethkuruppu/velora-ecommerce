import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Page Imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Admins from './pages/Admins';
import Settings from './pages/Settings';
import MyProfile from './pages/MyProfile';
import UserManagement from './pages/UserManagement';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';

const Layout = ({ children }) => (
    <DashboardLayout>
        {children}
    </DashboardLayout>
);

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                        <Route path="/dashboard/users" element={<Layout><Users /></Layout>} />
                        <Route path="/dashboard/products" element={<Layout><Products /></Layout>} />
                        <Route path="/dashboard/orders" element={<Layout><Orders /></Layout>} />
                        <Route path="/dashboard/inventory" element={<Layout><Inventory /></Layout>} />
                        <Route path="/dashboard/reports" element={<Layout><Reports /></Layout>} />
                        <Route path="/dashboard/admins" element={<Layout><Admins /></Layout>} />
                        <Route path="/dashboard/settings" element={<Layout><Settings /></Layout>} />
                        <Route path="/dashboard/my-profile" element={<Layout><MyProfile /></Layout>} />
                        <Route path="/dashboard/user-management" element={<Layout><UserManagement /></Layout>} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
