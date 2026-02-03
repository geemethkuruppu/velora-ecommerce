import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, ArrowRight } from 'lucide-react';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('input'); // input, success, error
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'https://q4yf0oqk42.execute-api.ap-south-1.amazonaws.com/prod/api/v1/auth';
            await axios.post(`${AUTH_URL}/reset-password`, {
                token,
                new_password: password
            });
            setStatus('success');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to reset password. Link may be expired.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-[#E9ECEF] flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-[32px] shadow-xl text-center max-w-md">
                    <h2 className="text-2xl font-bold text-primary mb-4">Invalid Link</h2>
                    <p className="text-text-muted mb-6">This password reset link is invalid or missing a token.</p>
                    <button onClick={() => navigate('/login')} className="w-full bg-primary text-white py-4 rounded-2xl font-bold">Back to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E9ECEF] flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white animate-in fade-in zoom-in duration-500">
                {/* Logo Area */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-primary/20">
                        <span className="text-white font-bold text-xl tracking-tighter">V</span>
                    </div>
                    <span className="text-primary font-bold tracking-[4px] text-xs uppercase">VELORA SECURE</span>
                </div>

                {status === 'input' ? (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-primary tracking-tight">Set New Password</h2>
                            <p className="text-text-muted text-sm mt-1">Please enter your new administrator password.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium animate-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted ml-1">New Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-medium transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-medium transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle size={48} className="text-emerald-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-primary tracking-tight">Success!</h2>
                        <p className="text-text-muted text-sm leading-relaxed">
                            Your password has been updated successfully. You can now log in with your new credentials.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                        >
                            Back to Login
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
