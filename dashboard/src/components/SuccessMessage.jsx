import React from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessMessage = ({
    isOpen,
    onClose,
    title = 'Success!',
    message = 'Operation completed successfully.',
    autoClose = true,
    autoCloseDuration = 3000
}) => {
    React.useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDuration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, autoCloseDuration, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] p-6 shadow-2xl border border-black/5 w-full max-w-md animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main transition-colors rounded-full hover:bg-gray-100"
                >
                    <X size={18} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle size={32} className="text-emerald-600" />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center">
                    <h3 className="text-xl font-bold text-primary tracking-tight mb-2">{title}</h3>
                    <p className="text-sm text-text-muted">{message}</p>
                </div>
            </div>
        </div>
    );
};

export default SuccessMessage;
