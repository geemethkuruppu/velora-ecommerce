import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid verification link. No token found.');
                return;
            }

            try {
                const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'https://q4yf0oqk42.execute-api.ap-south-1.amazonaws.com/prod/api/v1/auth';
                const response = await axios.get(`${AUTH_URL}/verify-email?token=${token}`);
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.detail || 'Verification failed. The link may be expired.');
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="min-h-screen bg-[#E9ECEF] flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-white text-center animate-in fade-in zoom-in duration-500">
                {/* Logo Area */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-primary/20">
                        <span className="text-white font-bold text-xl tracking-tighter">V</span>
                    </div>
                    <span className="text-primary font-bold tracking-[4px] text-xs uppercase">VELORA SECURE</span>
                </div>

                {status === 'verifying' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <Loader2 size={64} className="text-primary animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-primary tracking-tight">Verifying Email...</h2>
                        <p className="text-text-muted text-sm leading-relaxed">
                            Please wait while we confirm your administrator access.
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <CheckCircle size={48} className="text-emerald-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-primary tracking-tight">Email Verified!</h2>
                        <p className="text-text-muted text-sm leading-relaxed font-medium">
                            {message}
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                        >
                            Continue to Login
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <XCircle size={48} className="text-red-600" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-primary tracking-tight">Verification Failed</h2>
                        <p className="text-red-500 text-sm leading-relaxed font-medium">
                            {message}
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full border-2 border-primary/10 hover:border-primary/20 text-primary py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3"
                        >
                            Back to Login
                        </button>
                    </div>
                )}

                {/* Footer Decor */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <p className="text-[10px] text-text-muted font-bold tracking-[2px] uppercase">
                        © 2026 VELORA SYSTEMS • SECURED ACCESS
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
