import React from 'react';
import { motion } from 'framer-motion';

const Loading = ({ message = "Authenticating with VELORA Secure Systems..." }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-md">
            <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                    {/* Main Gold Spinner */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-t-4 border-r-4 border-secondary rounded-full"
                    />
                    {/* Inner Navy Spinner */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 border-b-4 border-l-4 border-primary rounded-full opacity-50"
                    />
                    {/* Center Logo/V */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-primary font-bold text-xl font-serif">V</span>
                    </div>
                </div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    className="mt-8 text-primary font-bold tracking-[3px] uppercase text-[10px] text-center"
                >
                    {message}
                </motion.p>
            </div>
        </div>
    );
};

export default Loading;
