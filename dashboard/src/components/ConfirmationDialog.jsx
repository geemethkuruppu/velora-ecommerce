import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';

const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning', // 'warning', 'danger', 'success'
    isLoading = false
}) => {
    const typeStyles = {
        warning: {
            icon: AlertCircle,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-500',
            confirmBg: 'bg-amber-500 hover:bg-amber-600',
            shadow: 'shadow-amber-200'
        },
        danger: {
            icon: AlertCircle,
            iconBg: 'bg-red-50',
            iconColor: 'text-red-500',
            confirmBg: 'bg-red-500 hover:bg-red-600',
            shadow: 'shadow-red-200'
        },
        success: {
            icon: CheckCircle,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-500',
            confirmBg: 'bg-emerald-500 hover:bg-emerald-600',
            shadow: 'shadow-emerald-200'
        }
    };

    const style = typeStyles[type];
    const Icon = style.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!isLoading ? onClose : undefined}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-[40px] p-10 shadow-[0_32px_80px_rgba(0,0,0,0.2)] border border-black/5 w-full max-w-md relative z-10"
                    >
                        {/* Close Button */}
                        {!isLoading && (
                            <button
                                onClick={onClose}
                                className="absolute top-8 right-8 p-2 text-text-muted hover:text-red-500 transition-all rounded-full hover:bg-red-50"
                            >
                                <X size={20} />
                            </button>
                        )}

                        {/* Icon Container */}
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-20 h-20 rounded-3xl ${style.iconBg} flex items-center justify-center mb-8 rotate-3 transition-transform hover:rotate-0 duration-500`}>
                                <Icon size={40} className={style.iconColor} />
                            </div>

                            <h3 className="text-2xl font-bold text-primary tracking-tight mb-3">
                                {title}
                            </h3>

                            <p className="text-sm text-text-muted leading-relaxed mb-10 px-4">
                                {message}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-4 w-full">
                                {!isLoading && (
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-8 py-4 rounded-2xl border-2 border-gray-100 text-xs font-bold text-text-muted hover:bg-gray-50 transition-all uppercase tracking-widest"
                                    >
                                        {cancelText}
                                    </button>
                                )}
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-1 px-8 py-4 rounded-2xl text-xs font-bold text-white transition-all uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 ${style.confirmBg} ${style.shadow} ${isLoading ? 'opacity-80' : 'hover:scale-[1.02] active:scale-95'}`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Processing</span>
                                        </>
                                    ) : (
                                        <span>{confirmText}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationDialog;
