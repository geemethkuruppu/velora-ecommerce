import React, { useState, useEffect } from 'react';
import { User, CheckCircle, XCircle, Plus, X, AlertCircle, Key, Trash2, Power, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import SuccessMessage from '../components/SuccessMessage';
import ConfirmationDialog from '../components/ConfirmationDialog';

const UserManagement = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [adminUsers, setAdminUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [successTitle, setSuccessTitle] = useState('Success!');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterActive, setFilterActive] = useState('all');
    const [filterVerified, setFilterVerified] = useState('all');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null });
    const [statusModal, setStatusModal] = useState({ isOpen: false, userId: null, currentStatus: null });
    const [resetModal, setResetModal] = useState({ isOpen: false, userId: null });
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirm_password: ''
    });

    useEffect(() => {
        fetchAdminUsers();
    }, []);

    const fetchAdminUsers = async () => {
        try {
            setLoading(true);
            const users = await userService.getAllAdminUsers();
            setAdminUsers(users);
        } catch (error) {
            console.error('Failed to fetch admin users:', error);
            setErrorMessage('Failed to load admin users. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({
            full_name: '',
            email: '',
            password: '',
            confirm_password: ''
        });
        setErrorMessage('');
        setShowPassword(false);
        setShowConfirmPassword(false);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Validate empty fields
        if (!formData.full_name.trim()) {
            setErrorMessage('Full name is required!');
            return;
        }

        if (!formData.email.trim()) {
            setErrorMessage('Email is required!');
            return;
        }

        if (!formData.password) {
            setErrorMessage('Password is required!');
            return;
        }

        if (!formData.confirm_password) {
            setErrorMessage('Please confirm your password!');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setErrorMessage('Please enter a valid email address!');
            return;
        }

        // Validate password match
        if (formData.password !== formData.confirm_password) {
            setErrorMessage('Passwords do not match!');
            return;
        }

        // Validate strong password
        if (formData.password.length < 8) {
            setErrorMessage('Password must be at least 8 characters long!');
            return;
        }

        // Check for uppercase letter
        if (!/[A-Z]/.test(formData.password)) {
            setErrorMessage('Password must contain at least one uppercase letter!');
            return;
        }

        // Check for lowercase letter
        if (!/[a-z]/.test(formData.password)) {
            setErrorMessage('Password must contain at least one lowercase letter!');
            return;
        }

        // Check for number
        if (!/[0-9]/.test(formData.password)) {
            setErrorMessage('Password must contain at least one number!');
            return;
        }

        // Check for special character
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
            setErrorMessage('Password must contain at least one special character (!@#$%^&*...)!');
            return;
        }

        try {
            setLoading(true);
            await userService.createAdmin({
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password
            });
            setIsModalOpen(false);
            fetchAdminUsers();
            setSuccessTitle('Admin Created!');
            setSuccessMessage('New admin created successfully!');
            setShowSuccessMessage(true);
        } catch (error) {
            setErrorMessage(error.message || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = (userId) => {
        setResetModal({ isOpen: true, userId });
    };

    const handleConfirmReset = async () => {
        const userId = resetModal.userId;
        if (!userId) return;

        try {
            setLoading(true);
            await userService.requestPasswordReset(userId);
            setSuccessTitle('Reset Link Sent');
            setSuccessMessage('A secure password reset link has been sent to the user\'s email.');
            setShowSuccessMessage(true);
        } catch (error) {
            setErrorMessage(error.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
            setResetModal({ isOpen: false, userId: null });
        }
    };

    const handleToggleActive = (userId, currentStatus) => {
        setStatusModal({ isOpen: true, userId, currentStatus });
    };

    const handleConfirmToggle = async () => {
        const { userId, currentStatus } = statusModal;
        if (!userId) return;

        try {
            setLoading(true);
            const shouldActivate = !currentStatus;
            await userService.toggleUserStatus(userId, shouldActivate);
            setSuccessTitle(shouldActivate ? 'Account Activated' : 'Account Deactivated');
            setSuccessMessage(shouldActivate ? 'The user can now access the platform.' : 'The user has been barred from the platform.');
            setShowSuccessMessage(true);
            fetchAdminUsers();
        } catch (error) {
            setErrorMessage(error.message || 'Failed to update user status');
        } finally {
            setLoading(false);
            setStatusModal({ isOpen: false, userId: null, currentStatus: null });
        }
    };

    const handleDeleteAccount = (userId) => {
        setDeleteModal({ isOpen: true, userId });
    };

    const handleConfirmDelete = async () => {
        const userId = deleteModal.userId;
        if (!userId) return;

        try {
            setLoading(true);
            await userService.deleteUser(userId);
            setSuccessTitle('Account Deleted');
            setSuccessMessage('User account has been permanently removed.');
            setShowSuccessMessage(true);
            fetchAdminUsers();
        } catch (error) {
            setErrorMessage(error.message || 'Failed to delete account');
        } finally {
            setLoading(false);
            setDeleteModal({ isOpen: false, userId: null });
        }
    };

    // Filter and search users
    const filteredUsers = adminUsers.filter(user => {
        // Search filter
        const matchesSearch = searchQuery === '' ||
            user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.id.toString().includes(searchQuery);

        // Role filter
        const matchesRole = filterRole === 'all' || user.role === filterRole;

        // Active status filter
        const matchesActive = filterActive === 'all' ||
            (filterActive === 'active' && user.is_active) ||
            (filterActive === 'inactive' && !user.is_active);

        // Verified status filter
        const matchesVerified = filterVerified === 'all' ||
            (filterVerified === 'verified' && user.is_verified) ||
            (filterVerified === 'unverified' && !user.is_verified);

        return matchesSearch && matchesRole && matchesActive && matchesVerified;
    });

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">User Management</h1>
                    <p className="text-text-muted text-xs font-bold tracking-wider mt-1">Manage all user accounts and permissions</p>
                </div>
                {user?.role === 'SUPER_ADMIN' && (
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center gap-2.5 px-6 py-3 bg-[#7C4DFF] hover:bg-[#6C3DFF] text-white rounded-xl shadow-xl shadow-[#7C4DFF]/20 transition-all active:scale-95 group"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        <span className="text-xs font-bold tracking-widest uppercase">Add New Admin</span>
                    </button>
                )}
            </header>

            {/* Search and Filters */}
            <div className="bg-white rounded-[24px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5">
                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search Bar */}
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by name, email, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none transition-all"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-primary focus:border-primary/50 focus:outline-none transition-all bg-white"
                    >
                        <option value="all">All Roles</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="ADMIN">Admin</option>
                        <option value="CUSTOMER">Customer</option>
                    </select>

                    {/* Active Status Filter */}
                    <select
                        value={filterActive}
                        onChange={(e) => setFilterActive(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-primary focus:border-primary/50 focus:outline-none transition-all bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    {/* Verified Status Filter */}
                    <select
                        value={filterVerified}
                        onChange={(e) => setFilterVerified(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-primary focus:border-primary/50 focus:outline-none transition-all bg-white"
                    >
                        <option value="all">All Verification</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                    </select>
                </div>

                {/* Results Count */}
                {(searchQuery || filterRole !== 'all' || filterActive !== 'all' || filterVerified !== 'all') && (
                    <div className="mt-3 pt-3 border-t border-black/5">
                        <p className="text-xs font-medium text-text-muted">
                            Showing {filteredUsers.length} of {adminUsers.length} users
                        </p>
                    </div>
                )}
            </div>

            {/* Admin Users Table */}
            <div className="bg-white rounded-[32px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">ID</th>
                                <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Name</th>
                                <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Email</th>
                                <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Role</th>
                                <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Active</th>
                                <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Verified</th>
                                {user?.role === 'SUPER_ADMIN' && <th className="px-6 py-4 text-[9px] uppercase tracking-widest font-bold text-text-muted text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                            <p className="text-sm font-medium text-text-muted">Loading users...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center">
                                        <p className="text-sm font-medium text-text-muted">
                                            {adminUsers.length === 0 ? 'No users found' : 'No users match your filters'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(admin => (
                                    <tr key={admin.id} className="border-b border-border hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-bold text-primary">#{admin.id}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <User size={14} />
                                                </div>
                                                <span className="text-xs font-bold text-primary">{admin.full_name}</span>
                                                {user?.id === admin.id && (
                                                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">(You)</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-xs font-medium text-text-dim">{admin.email}</td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 rounded-full text-[9px] font-bold bg-violet-100 text-violet-600">
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold ${admin.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                {admin.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            {admin.is_verified ? (
                                                <CheckCircle size={16} className="text-emerald-600" />
                                            ) : (
                                                <XCircle size={16} className="text-red-600" />
                                            )}
                                        </td>
                                        {user?.role === 'SUPER_ADMIN' && (
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleResetPassword(admin.id)}
                                                        className="p-2 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                        title="Reset Password"
                                                    >
                                                        <Key size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(admin.id, admin.is_active)}
                                                        disabled={user?.id === admin.id}
                                                        className={`p-2 rounded-md transition-colors ${user?.id === admin.id ? 'opacity-30 cursor-not-allowed grayscale' : admin.is_active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                                        title={user?.id === admin.id ? "Cannot deactivate yourself" : admin.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <Power size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAccount(admin.id)}
                                                        disabled={user?.id === admin.id}
                                                        className={`p-2 rounded-md transition-colors ${user?.id === admin.id ? 'opacity-30 cursor-not-allowed grayscale' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                        title={user?.id === admin.id ? "Cannot delete yourself" : "Delete Account"}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add New Admin Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[24px] p-6 shadow-2xl border border-black/5 w-full max-w-lg animate-in zoom-in-95 duration-200">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main transition-colors rounded-full hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>

                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-primary tracking-tight">Add New Admin</h2>
                            <p className="text-xs text-text-muted mt-1">Create a new administrator account</p>
                        </div>

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2 duration-200">
                                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-2 block">
                                    Full Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-black/10 text-sm font-medium text-primary focus:border-primary/50 focus:outline-none transition-all"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div>
                                <label className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-2 block">
                                    Email Address
                                </label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-black/10 text-sm font-medium text-primary focus:border-primary/50 focus:outline-none transition-all"
                                    placeholder="admin@velora.com"
                                />
                            </div>

                            <div>
                                <label className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-2 block">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 rounded-xl border border-black/10 text-sm font-medium text-primary focus:border-primary/50 focus:outline-none transition-all"
                                        placeholder="Enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-2 block">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirm_password}
                                        onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 rounded-xl border border-black/10 text-sm font-medium text-primary focus:border-primary/50 focus:outline-none transition-all"
                                        placeholder="Re-enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-primary transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-black/10 text-sm font-bold text-primary hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 rounded-xl bg-[#7C4DFF] hover:bg-[#6C3DFF] text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Creating...' : 'Create Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Message */}
            <SuccessMessage
                isOpen={showSuccessMessage}
                onClose={() => setShowSuccessMessage(false)}
                title={successTitle}
                message={successMessage}
                autoClose={true}
                autoCloseDuration={3000}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, userId: null })}
                onConfirm={handleConfirmDelete}
                title="Delete User Account"
                message="Are you sure you want to delete this account? This action is permanent and cannot be undone."
                confirmText="Delete Account"
                type="danger"
            />

            {/* Status Toggle Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={statusModal.isOpen}
                onClose={() => setStatusModal({ isOpen: false, userId: null, currentStatus: null })}
                onConfirm={handleConfirmToggle}
                title={statusModal.currentStatus ? "Deactivate User Account" : "Activate User Account"}
                message={`Are you sure you want to ${statusModal.currentStatus ? "deactivate" : "activate"} this account?`}
                confirmText={statusModal.currentStatus ? "Deactivate" : "Activate"}
                type={statusModal.currentStatus ? "warning" : "success"}
            />

            {/* Reset Password Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={resetModal.isOpen}
                onClose={() => setResetModal({ isOpen: false, userId: null })}
                onConfirm={handleConfirmReset}
                title="Send Reset Password Link"
                message="Are you sure you want to send a password reset link to this user's email?"
                confirmText="Send Link"
                type="warning"
            />
        </div>
    );
};

export default UserManagement;
