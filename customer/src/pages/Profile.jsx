import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { User, Mail, Shield, LogOut, Lock, Eye, EyeOff, Trash2 } from 'lucide-react';
import Footer from '../components/Footer';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';
import ConfirmModal from '../components/ConfirmModal';

const Profile = () => {
    const { user, logout, updateProfile, updatePassword, deleteUserAccount, loading } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState(user?.full_name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [profileMessage, setProfileMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [profileError, setProfileError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Redirect if not authenticated
    React.useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMessage('');
        setProfileError('');

        try {
            await updateProfile(fullName);
            setProfileMessage('Profile updated successfully!');
            setTimeout(() => setProfileMessage(''), 3000);
        } catch (error) {
            setProfileError(error.message || 'Failed to update profile');
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPasswordMessage('');
        setPasswordError('');

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return;
        }

        try {
            await updatePassword(currentPassword, newPassword, confirmPassword);
            setPasswordMessage('Password updated successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordMessage(''), 3000);
        } catch (error) {
            setPasswordError(error.message || 'Failed to update password');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteUserAccount();
            setModalMessage('Your account has been permanently deleted.');
            setShowSuccessModal(true);
            setShowDeleteConfirm(false);
        } catch (error) {
            setModalMessage(error.message || 'Failed to delete account');
            setShowErrorModal(true);
            setShowDeleteConfirm(false);
        }
    };

    if (!user) {
        return null;
    }

    // Generate initials for avatar
    const initials = user.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : user.email.substring(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <TopNav isVisible={true} />

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    navigate('/');
                }}
                message={modalMessage}
            />

            {/* Error Modal */}
            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                message={modalMessage}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteAccount}
                message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
                title="Delete Account?"
                confirmText="Delete Account"
                cancelText="Cancel"
            />

            <div className="pt-24 pb-16 px-6 md:px-12 max-w-4xl mx-auto">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-8 mb-8"
                >
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-3xl font-serif">
                            {initials}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-serif text-gray-900 mb-1">
                                {user.full_name || 'User'}
                            </h1>
                            <p className="text-gray-500 flex items-center gap-2 mb-2">
                                <Mail className="w-4 h-4" />
                                {user.email}
                            </p>
                            <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider ${user.is_verified ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {user.is_verified ? 'Verified' : 'Unverified'}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs uppercase tracking-wider bg-purple-100 text-purple-700 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-gray-900 text-white rounded-sm hover:bg-black transition-colors flex items-center gap-2 uppercase tracking-wider text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </motion.div>

                {/* Profile Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-8 mb-8"
                >
                    <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-2">
                        <User className="w-6 h-6" />
                        Profile Information
                    </h2>

                    {profileMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-sm">
                            <p className="text-green-600 text-sm">{profileMessage}</p>
                        </div>
                    )}

                    {profileError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm">
                            <p className="text-red-600 text-sm">{profileError}</p>
                        </div>
                    )}

                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 focus:border-gray-900 outline-none transition-colors rounded-sm"
                                placeholder="Your full name"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                                Email (Read-only)
                            </label>
                            <input
                                type="email"
                                value={user.email}
                                className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-sm cursor-not-allowed"
                                disabled
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-3 bg-gray-900 text-white rounded-sm hover:bg-black transition-colors uppercase tracking-wider text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </motion.div>

                {/* Security Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg p-8"
                >
                    <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-2">
                        <Lock className="w-6 h-6" />
                        Change Password
                    </h2>

                    {passwordMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-sm">
                            <p className="text-green-600 text-sm">{passwordMessage}</p>
                        </div>
                    )}

                    {passwordError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm">
                            <p className="text-red-600 text-sm">{passwordError}</p>
                        </div>
                    )}

                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-gray-200 focus:border-gray-900 outline-none transition-colors rounded-sm"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-gray-200 focus:border-gray-900 outline-none transition-colors rounded-sm"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-400">Minimum 8 characters</p>
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 border border-gray-200 focus:border-gray-900 outline-none transition-colors rounded-sm"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-8 py-3 bg-gray-900 text-white rounded-sm hover:bg-black transition-colors uppercase tracking-wider text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </motion.div>

                {/* Delete Account Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200 mt-8"
                >
                    <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-2">
                        <Trash2 className="w-6 h-6 text-red-600" />
                        Delete Account
                    </h2>

                    <div className="bg-red-50 border border-red-200 rounded-sm p-4 mb-6">
                        <p className="text-red-800 text-sm mb-2">
                            <strong>Warning:</strong> Deleting your account is permanent and cannot be undone.
                        </p>
                        <p className="text-red-700 text-sm">
                            All your data, orders, and personal information will be permanently removed from our system.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={loading}
                        className={`px-8 py-3 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors uppercase tracking-wider text-sm flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete My Account
                    </button>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default Profile;
