import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, CreditCard, Lock, ArrowRight, Loader, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import orderService from '../services/orderService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CheckoutModal = ({ isOpen, onClose }) => {
    const { cart, subtotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!shippingAddress.trim() || shippingAddress.length < 5) {
            toast.error('Please enter a valid shipping address');
            return;
        }

        if (paymentMethod === 'card') {
            if (cardNumber.length < 13 || expiry.length < 4 || cvc.length < 3) {
                toast.error('Please fill in valid card details');
                return;
            }
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Processing your order...');

        try {
            const orderData = {
                items: cart.items.map(item => ({
                    product_id: item.product_id,
                    variant_id: item.variant_id, // Use actual variant_id from cart
                    quantity: item.quantity
                })),
                shipping_address: shippingAddress
            };

            await orderService.createOrder(orderData);

            toast.success('Order placed successfully!', { id: toastId });
            await clearCart();
            onClose();
            navigate('/my-orders');

        } catch (error) {
            console.error('Checkout failed:', error);
            console.error('Error response:', error.response?.data);

            // Extract validation error message
            let errorMessage = 'Failed to place order';
            if (error.response?.data?.detail) {
                if (Array.isArray(error.response.data.detail)) {
                    // Pydantic validation errors
                    errorMessage = error.response.data.detail.map(err =>
                        `${err.loc.join('.')}: ${err.msg}`
                    ).join(', ');
                } else {
                    errorMessage = error.response.data.detail;
                }
            }

            toast.error(errorMessage, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>

                        {/* Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 h-full max-h-[90vh]">

                            {/* Left Side: Forms */}
                            <div className="lg:col-span-7 p-8 md:p-10 overflow-y-auto">
                                <h1 className="text-3xl font-serif text-gray-900 mb-2">Checkout</h1>
                                <p className="text-gray-500 mb-8">Complete your purchase</p>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Shipping */}
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <MapPin className="text-blue-600 w-5 h-5" />
                                            Shipping Information
                                        </h2>
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">
                                                Delivery Address
                                            </label>
                                            <textarea
                                                value={shippingAddress}
                                                onChange={(e) => setShippingAddress(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-none"
                                                placeholder="Street, City, Zip Code, Country..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Payment */}
                                    <div>
                                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <CreditCard className="text-blue-600 w-5 h-5" />
                                            Payment Method
                                        </h2>

                                        {/* Toggle */}
                                        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('card')}
                                                className={`flex-1 py-3 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${paymentMethod === 'card'
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                Credit Card
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('cash')}
                                                className={`flex-1 py-3 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${paymentMethod === 'cash'
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                <Wallet className="w-4 h-4" />
                                                Cash on Delivery
                                            </button>
                                        </div>

                                        {/* Card Fields */}
                                        {paymentMethod === 'card' ? (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200"
                                            >
                                                <div>
                                                    <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">Card Number</label>
                                                    <input
                                                        type="text"
                                                        value={cardNumber}
                                                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                                        className="w-full border border-gray-300 rounded-md p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                        placeholder="0000 0000 0000 0000"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">Expiry</label>
                                                        <input
                                                            type="text"
                                                            value={expiry}
                                                            onChange={(e) => {
                                                                let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                                if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
                                                                setExpiry(val);
                                                            }}
                                                            className="w-full border border-gray-300 rounded-md p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                            placeholder="MM/YY"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs uppercase tracking-wider text-gray-600 mb-2">CVC</label>
                                                        <input
                                                            type="text"
                                                            value={cvc}
                                                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                                            className="w-full border border-gray-300 rounded-md p-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                            placeholder="123"
                                                        />
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 italic flex items-center gap-1">
                                                    <Lock className="w-3 h-3" />
                                                    Card details are not saved
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center"
                                            >
                                                <p className="text-gray-600 text-sm">
                                                    Pay in cash when your order is delivered
                                                </p>
                                            </motion.div>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Right Side: Summary */}
                            <div className="lg:col-span-5 bg-gray-50 p-8 md:p-10 border-l border-gray-200 flex flex-col">
                                <h2 className="text-xl font-serif text-gray-900 mb-6">Order Summary</h2>

                                {/* Items */}
                                <div className="flex-1 overflow-y-auto max-h-[300px] mb-6 pr-2">
                                    {cart.items.map((item) => (
                                        <div key={item.id} className="flex gap-4 mb-4 pb-4 border-b border-gray-200 last:border-0">
                                            <div className="w-16 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                                {item.product?.image ? (
                                                    <img
                                                        src={item.product.image}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 text-sm truncate">
                                                    {item.product?.name || `Product #${item.product_id}`}
                                                </h4>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        ${(item.product?.base_price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="space-y-3 pt-6 border-t border-gray-300 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({cart.items.length} items)</span>
                                        <span>${Number(subtotal).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className="text-green-600">Free</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-semibold pt-3 border-t border-gray-200 text-gray-900">
                                        <span>Total</span>
                                        <span>${Number(subtotal).toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || cart.items.length === 0}
                                    className="w-full mt-8 bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group font-medium"
                                >
                                    {isSubmitting ? (
                                        <Loader className="animate-spin w-5 h-5" />
                                    ) : (
                                        <>
                                            Complete Order
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CheckoutModal;
