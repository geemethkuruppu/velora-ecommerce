import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import CheckoutModal from '../components/CheckoutModal';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Footer from '../components/Footer';
import { formatImageUrl } from '../services/productService';

const MyCart = () => {
    const { user } = useAuth();
    const { cart, loading, removeFromCart, updateQuantity, refreshCart } = useCart();
    const navigate = useNavigate();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            // Refresh cart on mount
            refreshCart();
        }
    }, [user, navigate]);

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            await updateQuantity(itemId, newQuantity);
            toast.success('Quantity updated', {
                duration: 2000,
                position: 'bottom-right'
            });
        } catch (error) {
            toast.error('Failed to update quantity');
        }
    };

    const handleRemoveItem = async (itemId, productName) => {
        try {
            await removeFromCart(itemId);
            toast.success(`${productName} removed from cart`, {
                duration: 2000,
                position: 'bottom-right'
            });
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const calculateSubtotal = () => {
        if (!cart || !cart.subtotal) return 0;
        return parseFloat(cart.subtotal);
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.1; // 10% tax
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    if (!user) {
        return null;
    }

    const cartItems = cart?.items || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Toaster />
            <TopNav isVisible={true} />

            <div className="pt-24 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-serif text-gray-900 mb-2">Shopping Cart</h1>
                    <p className="text-gray-500 uppercase tracking-wider text-sm">
                        {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} in your cart
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-12 h-12 text-gray-900 animate-spin" />
                    </div>
                ) : cartItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl shadow-lg p-12 text-center"
                    >
                        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-serif text-gray-900 mb-2">Your Cart is Empty</h2>
                        <p className="text-gray-500 mb-6">Add items to your cart to see them here</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-gray-900 text-white rounded-sm hover:bg-black transition-colors uppercase tracking-wider text-sm"
                        >
                            Continue Shopping
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                                >
                                    <div className="flex gap-6">
                                        {/* Product Image */}
                                        <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={formatImageUrl(item.product?.image || item.product?.image_url)}
                                                alt={item.product?.name || 'Product'}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-serif text-gray-900 mb-1">
                                                        {item.product?.name || 'Product'}
                                                    </h3>
                                                    <div className="flex gap-4 text-sm text-gray-500">
                                                        <span>SKU: {item.product_id}</span>
                                                        {item.variant_id && <span>Variant: {item.variant_id}</span>}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveItem(item.id, item.product?.name)}
                                                    className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-500"
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="flex justify-between items-end mt-4">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                        className="w-8 h-8 border border-gray-300 rounded-sm hover:bg-gray-100 transition-colors flex items-center justify-center"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                        className="w-8 h-8 border border-gray-300 rounded-sm hover:bg-gray-100 transition-colors flex items-center justify-center"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <p className="text-lg font-medium text-gray-900">
                                                        ${(Number(item.product?.base_price || 0) * item.quantity).toFixed(2)}
                                                    </p>
                                                    {item.quantity > 1 && (
                                                        <p className="text-sm text-gray-500">
                                                            ${Number(item.product?.base_price || 0).toFixed(2)} each
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl shadow-lg p-6 sticky top-24"
                            >
                                <h2 className="text-2xl font-serif text-gray-900 mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>${calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax (10%)</span>
                                        <span>${calculateTax().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className="text-green-600">FREE</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex justify-between text-lg font-medium text-gray-900">
                                            <span>Total</span>
                                            <span>${calculateTotal().toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsCheckoutOpen(true)}
                                    disabled={loading || cartItems.length === 0}
                                    className="w-full py-4 bg-gray-900 text-white rounded-sm hover:bg-black transition-colors uppercase tracking-wider text-sm flex items-center justify-center gap-2 mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Updating Cart...
                                        </>
                                    ) : (
                                        <>
                                            Proceed to Checkout
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full py-3 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors uppercase tracking-wider text-sm"
                                >
                                    Continue Shopping
                                </button>

                                {/* Promo Code */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
                                        Promo Code
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter code"
                                            className="flex-1 px-4 py-2 border border-gray-200 focus:border-gray-900 outline-none transition-colors rounded-sm text-sm"
                                        />
                                        <button className="px-4 py-2 bg-gray-900 text-white rounded-sm hover:bg-black transition-colors text-sm uppercase tracking-wider">
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
            />
            <Footer />
        </div>
    );
};

export default MyCart;
