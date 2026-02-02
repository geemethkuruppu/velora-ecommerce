import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoginCard from '../components/LoginCard';
import SignupCard from '../components/SignupCard';
import TopNav from '../components/TopNav';
import heroImage from '../assets/images/womenswear-hero.jpg'; // Using existing image for background

const Login = () => {
    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-gray-900">
            {/* Background Image with Blur */}
            <div className="absolute inset-0 overflow-hidden">
                <img
                    src={heroImage}
                    alt="Background"
                    className="w-full h-full object-cover opacity-50 blur-sm scale-110"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <TopNav isVisible={true} />

            {/* Login/Signup Container */}
            <div className="relative z-10 w-full px-6 flex justify-center">
                {isLoginView ? (
                    <LoginCard onSwitchToSignup={() => setIsLoginView(false)} />
                ) : (
                    <SignupCard onSwitchToLogin={() => setIsLoginView(true)} />
                )}
            </div>
        </div>
    );
};

export default Login;
