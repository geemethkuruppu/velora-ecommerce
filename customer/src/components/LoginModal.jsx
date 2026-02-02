import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../services/authService';
import toast from 'react-hot-toast';

const LoginModal = ({ isOpen, onClose, onLoginSuccess, pendingProduct = null }) => {
    const { login, register } = useAuth();
    const [activeTab, setActiveTab] = useState('login');
    const [loading, setLoading] = useState(false);

    // Login form
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);

    // Signup form
    const [signupFullName, setSignupFullName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [showSignupPassword, setShowSignupPassword] = useState(false);

    const [errors, setErrors] = useState({});

    const handleLogin = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!loginEmail) {
            newErrors.loginEmail = 'Email is required';
        } else if (!validateEmail(loginEmail)) {
            newErrors.loginEmail = 'Please enter a valid email';
        }

        if (!loginPassword) {
            newErrors.loginPassword = 'Password is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            setErrors({});
            const data = await login(loginEmail, loginPassword);
            toast.success('Welcome back!');

            // Call parent callback
            if (onLoginSuccess) {
                await onLoginSuccess(data);
            }

            // Close modal
            onClose();
        } catch (error) {
            toast.error(error.message || 'Login failed');
            setErrors({ general: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!signupFullName) {
            newErrors.signupFullName = 'Full name is required';
        }

        if (!signupEmail) {
            newErrors.signupEmail = 'Email is required';
        } else if (!validateEmail(signupEmail)) {
            newErrors.signupEmail = 'Please enter a valid email';
        }

        if (!signupPassword) {
            newErrors.signupPassword = 'Password is required';
        } else if (signupPassword.length < 8) {
            newErrors.signupPassword = 'Password must be at least 8 characters';
        }

        if (signupPassword !== signupConfirmPassword) {
            newErrors.signupConfirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setLoading(true);
            setErrors({});
            const data = await register(signupFullName, signupEmail, signupPassword);
            toast.success('Account created successfully!');

            // Call parent callback
            if (onLoginSuccess) {
                await onLoginSuccess(data);
            }

            // Close modal
            onClose();
        } catch (error) {
            toast.error(error.message || 'Signup failed');
            setErrors({ general: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="relative z-10 w-full max-w-md"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute -top-4 -right-4 z-20 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-700" />
                    </button>

                    {/* Pending Product Notice */}
                    {pendingProduct && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg"
                        >
                            <p className="text-sm text-amber-800 text-center">
                                <span className="font-semibold">Sign in to add</span> "{pendingProduct.name}" to your bag
                            </p>
                        </motion.div>
                    )}

                    {/* Tab Switcher */}
                    <div className="bg-white rounded-t-2xl overflow-hidden">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => {
                                    setActiveTab('login');
                                    setErrors({});
                                }}
                                className={`flex-1 py-4 text-center font-medium transition-all ${activeTab === 'login'
                                        ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('signup');
                                    setErrors({});
                                }}
                                className={`flex-1 py-4 text-center font-medium transition-all ${activeTab === 'signup'
                                        ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-b-2xl shadow-2xl p-6">
                        {errors.general && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">{errors.general}</p>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {activeTab === 'login' ? (
                                <motion.form
                                    key="login"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={handleLogin}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            value={loginEmail}
                                            onChange={(e) => {
                                                setLoginEmail(e.target.value);
                                                setErrors({ ...errors, loginEmail: '' });
                                            }}
                                            className={`w-full px-3 py-2.5 bg-white border ${errors.loginEmail ? 'border-red-400' : 'border-gray-200'
                                                } focus:border-gray-900 outline-none transition-colors rounded-sm text-sm`}
                                            placeholder="email@example.com"
                                            disabled={loading}
                                        />
                                        {errors.loginEmail && (
                                            <p className="mt-1 text-xs text-red-500">{errors.loginEmail}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showLoginPassword ? 'text' : 'password'}
                                                value={loginPassword}
                                                onChange={(e) => {
                                                    setLoginPassword(e.target.value);
                                                    setErrors({ ...errors, loginPassword: '' });
                                                }}
                                                className={`w-full px-3 py-2.5 pr-10 bg-white border ${errors.loginPassword ? 'border-red-400' : 'border-gray-200'
                                                    } focus:border-gray-900 outline-none transition-colors rounded-sm text-sm`}
                                                placeholder="••••••••"
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.loginPassword && (
                                            <p className="mt-1 text-xs text-red-500">{errors.loginPassword}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-gray-900 text-white uppercase tracking-widest text-xs hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Logging in...
                                            </>
                                        ) : (
                                            'Login'
                                        )}
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="signup"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={handleSignup}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            value={signupFullName}
                                            onChange={(e) => {
                                                setSignupFullName(e.target.value);
                                                setErrors({ ...errors, signupFullName: '' });
                                            }}
                                            className={`w-full px-3 py-2.5 bg-white border ${errors.signupFullName ? 'border-red-400' : 'border-gray-200'
                                                } focus:border-gray-900 outline-none transition-colors rounded-sm text-sm`}
                                            placeholder="John Doe"
                                            disabled={loading}
                                        />
                                        {errors.signupFullName && (
                                            <p className="mt-1 text-xs text-red-500">{errors.signupFullName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Email</label>
                                        <input
                                            type="email"
                                            value={signupEmail}
                                            onChange={(e) => {
                                                setSignupEmail(e.target.value);
                                                setErrors({ ...errors, signupEmail: '' });
                                            }}
                                            className={`w-full px-3 py-2.5 bg-white border ${errors.signupEmail ? 'border-red-400' : 'border-gray-200'
                                                } focus:border-gray-900 outline-none transition-colors rounded-sm text-sm`}
                                            placeholder="email@example.com"
                                            disabled={loading}
                                        />
                                        {errors.signupEmail && (
                                            <p className="mt-1 text-xs text-red-500">{errors.signupEmail}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showSignupPassword ? 'text' : 'password'}
                                                value={signupPassword}
                                                onChange={(e) => {
                                                    setSignupPassword(e.target.value);
                                                    setErrors({ ...errors, signupPassword: '' });
                                                }}
                                                className={`w-full px-3 py-2.5 pr-10 bg-white border ${errors.signupPassword ? 'border-red-400' : 'border-gray-200'
                                                    } focus:border-gray-900 outline-none transition-colors rounded-sm text-sm`}
                                                placeholder="••••••••"
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowSignupPassword(!showSignupPassword)}
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.signupPassword && (
                                            <p className="mt-1 text-xs text-red-500">{errors.signupPassword}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={signupConfirmPassword}
                                            onChange={(e) => {
                                                setSignupConfirmPassword(e.target.value);
                                                setErrors({ ...errors, signupConfirmPassword: '' });
                                            }}
                                            className={`w-full px-3 py-2.5 bg-white border ${errors.signupConfirmPassword ? 'border-red-400' : 'border-gray-200'
                                                } focus:border-gray-900 outline-none transition-colors rounded-sm text-sm`}
                                            placeholder="••••••••"
                                            disabled={loading}
                                        />
                                        {errors.signupConfirmPassword && (
                                            <p className="mt-1 text-xs text-red-500">{errors.signupConfirmPassword}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-gray-900 text-white uppercase tracking-widest text-xs hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Creating account...
                                            </>
                                        ) : (
                                            'Sign Up'
                                        )}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoginModal;
