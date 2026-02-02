import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const CancelOrderModal = ({ isOpen, onClose, onConfirm, orderNumber, orderTotal }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-2xl font-serif text-gray-900 text-center mb-2">
                                Cancel Order?
                            </h2>

                            {/* Message */}
                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to cancel order <span className="font-medium">{orderNumber}</span>?
                                This action cannot be undone.
                            </p>

                            {/* Order Details */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Order Total</span>
                                    <span className="text-lg font-medium text-gray-900">
                                        ${parseFloat(orderTotal).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                                <p className="text-xs text-yellow-800">
                                    <strong>Note:</strong> Your reserved inventory will be released back to stock.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors text-sm uppercase tracking-wider font-medium"
                                >
                                    Keep Order
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-sm hover:bg-red-700 transition-colors text-sm uppercase tracking-wider font-medium"
                                >
                                    Cancel Order
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CancelOrderModal;
