import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import heroMan from '../assets/hero-man.png';
import logo from '../assets/logo.png';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import Loading from '../components/Loading';
import ErrorDisplay from '../components/ErrorDisplay';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "VELORA | Admin Login";
        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'An unexpected error occurred. Please contact system administrator.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen w-screen bg-[#F0F2F5] flex items-center justify-center p-6 md:p-12 overflow-hidden">
            {/* Loading Overlay */}
            {isSubmitting && <Loading />}

            {/* Error Notification */}
            <ErrorDisplay error={error} onClose={() => setError('')} />

            <div className="w-full h-full bg-white rounded-[40px] md:rounded-[60px] shadow-[0_40px_100px_rgba(0,0,0,0.15)] flex flex-col md:flex-row overflow-hidden border border-white">

                {/* Left Side - Hero / Brand */}
                <div className="hidden md:flex md:w-1/2 bg-primary relative overflow-hidden">
                    <img
                        src={heroMan}
                        alt="Velora Luxury Login"
                        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-[10s] hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />

                    <div className="relative z-10 p-16 md:p-24 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-12">
                                <img src={logo} alt="Velora Logo" className="w-16 h-16 object-contain" />
                                <span className="text-white font-bold tracking-[6px] text-2xl mt-1 uppercase">VELORA</span>
                            </div>
                            <p className="text-white/60 text-xs tracking-widest uppercase mb-4 font-bold">Enterprise Edition</p>
                            <h2 className="text-white text-6xl font-serif font-medium leading-tight">
                                Manage your <br />
                                <span className="text-secondary italic">luxury empire.</span>
                            </h2>
                        </div>

                        <div className="text-white/40 text-[10px] tracking-widest uppercase font-bold">
                            <p>&copy; {new Date().getFullYear()} VELORA SYSTEM ADMINISTRATION</p>
                            <p className="mt-2 text-white/30">Secure Terminal Access Only</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full md:w-1/2 p-8 md:p-24 flex flex-col relative justify-center bg-white">
                    <div className="max-w-[420px] mx-auto w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <h1 className="text-5xl font-serif text-primary mb-3">Welcome Back</h1>
                            <p className="text-text-dim mb-12 font-medium">Access your administrative command center.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-[2px] ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl pl-14 pr-5 py-4 text-primary focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold placeholder:text-text-muted/50"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-[2px] ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl pl-14 pr-14 py-4 text-primary focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold placeholder:text-text-muted/50"
                                            required
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors disabled:opacity-50"
                                            disabled={isSubmitting}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="button"
                                            className="text-[10px] font-bold text-text-muted hover:text-primary transition-colors tracking-[1px] uppercase"
                                            onClick={() => alert('Please contact your Super Admin to reset your password.')}
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full primary-btn justify-center py-4 text-base tracking-[3px] group mt-6 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                                    {!isSubmitting && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    <div className="absolute bottom-12 left-0 right-0 px-24 flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-[2px]">
                        <p>VELORA SYSTEM ADMINISTRATION</p>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
                            <span>English</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
