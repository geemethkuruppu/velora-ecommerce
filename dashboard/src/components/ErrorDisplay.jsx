import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ErrorDisplay = ({ error, onClose }) => {
    if (!error) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[24px] p-8 shadow-2xl border border-black/5 w-full max-w-sm animate-in zoom-in-95 duration-200 relative">
                {/* Close Button - Top Right */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main transition-colors rounded-full hover:bg-gray-100"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
                        <AlertCircle size={32} />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-primary tracking-tight">Error Occurred</h3>
                    <p className="text-sm text-text-muted font-medium leading-relaxed">{error}</p>
                </div>

                {/* Close Action */}
                <div className="mt-8">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 rounded-xl bg-gray-50 text-primary text-sm font-bold hover:bg-gray-100 transition-all uppercase tracking-widest border border-transparent hover:border-black/5"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorDisplay;
