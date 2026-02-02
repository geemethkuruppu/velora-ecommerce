import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword } from '../services/authService';
import { Eye, EyeOff, X } from 'lucide-react';
import SuccessModal from './SuccessModal';
import ErrorModal from './ErrorModal';

const SignupCard = ({ onSwitchToLogin }) => {
    const { register, loading } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const validateForm = () => {
        const newErrors = {};

        if (!name || name.trim().length < 2) {
            newErrors.name = 'Full name must be at least 2 characters';
        }

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.message;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await register(email, password, name);
            setModalMessage(`Welcome to VELORA! Your account has been created successfully.`);
            setShowSuccessModal(true);
        } catch (error) {
            setModalMessage(error.message || 'Registration failed. Please try again.');
            setShowErrorModal(true);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/50 relative"
        >
            {/* Close Button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
                <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Error Modal */}
            <ErrorModal
                isOpen={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                message={modalMessage}
                title="Registration Failed"
            />

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    navigate('/');
                }}
                message={modalMessage}
                title="Account Created!"
            />

            <h2 className="text-2xl font-serif text-gray-900 mb-6 text-center">Create Account</h2>
            <p className="text-gray-500 text-center mb-6 text-xs uppercase tracking-wider">Create your account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setErrors({ ...errors, name: '' });
                        }}
                        className={`w-full px-3 py-2.5 bg-white/50 border ${errors.name ? 'border-red-400' : 'border-gray-200'
                            } focus:border-gray-900 outline-none transition-colors rounded-sm text-sm`}
                        placeholder="John Doe"
                        disabled={loading}
                    />
                    {errors.name && (
                        <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                    )}
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors({ ...errors, email: '' });
                        }}
                        className={`w-full px-3 py-2.5 bg-white/50 border ${errors.email ? 'border-red-400' : 'border-gray-200'
                            } focus:border-gray-900 outline-none transition-colors rounded-sm text-sm`}
                        placeholder="email@example.com"
                        disabled={loading}
                    />
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                    )}
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrors({ ...errors, password: '' });
                            }}
                            className={`w-full px-3 py-2.5 pr-10 bg-white/50 border ${errors.password ? 'border-red-400' : 'border-gray-200'
                                } focus:border-gray-900 outline-none transition-colors rounded-sm text-sm`}
                            placeholder="••••••••"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">Minimum 8 characters</p>
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5">Confirm Password</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setErrors({ ...errors, confirmPassword: '' });
                            }}
                            className={`w-full px-3 py-2.5 pr-10 bg-white/50 border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'
                                } focus:border-gray-900 outline-none transition-colors rounded-sm text-sm`}
                            placeholder="••••••••"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                    )}
                </div>

                <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1 rounded border-gray-300" required />
                    <span className="text-xs text-gray-500">
                        I agree to the <button type="button" className="underline hover:text-gray-900">Terms of Service</button> and <button type="button" className="underline hover:text-gray-900">Privacy Policy</button>
                    </span>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 bg-gray-900 text-white uppercase tracking-widest text-xs hover:bg-black transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-gray-500 text-xs">
                    Already have an account?{' '}
                    <button
                        onClick={onSwitchToLogin}
                        className="text-gray-900 font-medium hover:underline"
                    >
                        Log In
                    </button>
                </p>
            </div>
        </motion.div>
    );
};

export default SignupCard;
