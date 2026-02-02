import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import orderService from '../services/orderService';
import TopNav from '../components/TopNav';
import toast from 'react-hot-toast';
import { MapPin, CreditCard, Lock, ArrowRight, Loader, Wallet } from 'lucide-react';

const Checkout = () => {
    const { cart, subtotal, clearCart, loading: cartLoading } = useCart();
    const { token, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'cash'
    // Dummy payment fields - not saved
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error('Please login to checkout');
            navigate('/login');
        }
        if (!cartLoading && cart.items.length === 0) {
            toast('Your cart is empty', { icon: '🛍️' });
            navigate('/my-cart');
        }
    }, [isAuthenticated, cart, cartLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!shippingAddress.trim() || shippingAddress.length < 5) {
            toast.error('Please enter a valid shipping address (min 5 chars)');
            return;
        }

        if (paymentMethod === 'card') {
            if (cardNumber.length < 13 || expiry.length < 4 || cvc.length < 3) {
                toast.error('Please fill in valid card details (Dummy check)');
                return;
            }
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Processing your order...');

        try {
            // Prepare payload matches OrderCreate schema
            const orderData = {
                items: cart.items.map(item => ({
                    product_id: item.product_id,
                    variant_id: item.variant_id || 0,
                    quantity: item.quantity
                })),
                shipping_address: shippingAddress
            };

            const order = await orderService.createOrder(token, orderData);

            toast.success('Order placed successfully!', { id: toastId });
            await clearCart();
            navigate('/my-orders');

        } catch (error) {
            console.error('Checkout failed:', error);
            toast.error(error.response?.data?.detail || 'Failed to place order', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartLoading) return <div className="min-h-screen bg-neutral-900 flex items-center justify-center"><Loader className="animate-spin text-white" /></div>;

    return (
        <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-rose-500/30 pb-20">
            <TopNav />
            {/* Spacer for fixed nav */}
            <div className="h-24"></div>

            <div className="max-w-5xl mx-auto px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl md:text-5xl font-serif mb-3">Checkout</h1>
                    <p className="text-white/50">Complete your purchase securely</p>
                </motion.div>

                <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12">

                        {/* Left Side: Forms (Scaling 7 cols) */}
                        <div className="lg:col-span-7 p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-white/10">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Shipping Section */}
                                <div>
                                    <h2 className="text-xl font-serif mb-6 flex items-center gap-3 text-rose-100">
                                        <MapPin className="text-rose-400 w-5 h-5" />
                                        Shipping Information
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs uppercase tracking-wider text-white/50 mb-2 ml-1">
                                                Full Address
                                            </label>
                                            <textarea
                                                value={shippingAddress}
                                                onChange={(e) => setShippingAddress(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-rose-500/50 transition-colors min-h-[100px] resize-none"
                                                placeholder="Street, City, Zip Code, Country..."
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Section */}
                                <div>
                                    <h2 className="text-xl font-serif mb-6 flex items-center gap-3 text-rose-100 mt-10">
                                        <CreditCard className="text-rose-400 w-5 h-5" />
                                        Payment Method
                                    </h2>

                                    {/* Toggle */}
                                    <div className="flex bg-black/40 p-1 rounded-lg mb-6 border border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('card')}
                                            className={`flex-1 py-3 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${paymentMethod === 'card'
                                                    ? 'bg-rose-500 text-white shadow-lg'
                                                    : 'text-white/50 hover:text-white'
                                                }`}
                                        >
                                            <CreditCard className="w-4 h-4" />
                                            Credit Card
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`flex-1 py-3 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${paymentMethod === 'cash'
                                                    ? 'bg-rose-500 text-white shadow-lg'
                                                    : 'text-white/50 hover:text-white'
                                                }`}
                                        >
                                            <Wallet className="w-4 h-4" />
                                            Cash on Delivery
                                        </button>
                                    </div>

                                    {/* Conditional Fields */}
                                    {paymentMethod === 'card' ? (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-4 bg-black/20 p-6 rounded-lg border border-white/5"
                                        >
                                            <div>
                                                <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Card Number</label>
                                                <input
                                                    type="text"
                                                    value={cardNumber}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                                        setCardNumber(val);
                                                    }}
                                                    className="w-full bg-black/40 border border-white/10 rounded-md p-3 text-white focus:border-rose-500/50 outline-none"
                                                    placeholder="0000 0000 0000 0000"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Expiry</label>
                                                    <input
                                                        type="text"
                                                        value={expiry}
                                                        onChange={(e) => {
                                                            let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                            if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
                                                            setExpiry(val);
                                                        }}
                                                        className="w-full bg-black/40 border border-white/10 rounded-md p-3 text-white focus:border-rose-500/50 outline-none"
                                                        placeholder="MM/YY"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">CVC</label>
                                                    <input
                                                        type="text"
                                                        value={cvc}
                                                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                                        className="w-full bg-black/40 border border-white/10 rounded-md p-3 text-white focus:border-rose-500/50 outline-none"
                                                        placeholder="123"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-white/30 italic flex items-center gap-1">
                                                <Lock className="w-3 h-3" />
                                                Your card details are processed securely and not saved.
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-black/20 p-6 rounded-lg border border-white/5 text-center"
                                        >
                                            <p className="text-white/70 text-sm">
                                                You will pay in cash when the courier delivers your items.
                                                Please ensure you have the exact amount ready.
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Right Side: Summary (Scaling 5 cols) */}
                        <div className="lg:col-span-5 bg-white/5 p-8 md:p-10 flex flex-col h-full bg-gradient-to-b from-white/5 to-transparent">
                            <h2 className="text-xl font-serif mb-6 text-white">Order Summary</h2>

                            {/* Scrollable Items */}
                            <div className="flex-1 overflow-y-auto max-h-[400px] mb-8 pr-2 custom-scrollbar">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 mb-6">
                                        <div className="w-16 h-20 bg-white/10 rounded-md overflow-hidden flex-shrink-0">
                                            {item.product?.image ? (
                                                <img
                                                    src={item.product.image}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-white/20">No Img</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-white truncate">{item.product?.name || `Product #${item.product_id}`}</h4>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-sm text-white/50">Qty: {item.quantity}</p>
                                                <p className="text-sm font-medium text-rose-300">
                                                    ${(item.product?.base_price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 pt-6 border-t border-white/10 text-sm">
                                <div className="flex justify-between text-white/60">
                                    <span>Subtotal ({cart.items.length} items)</span>
                                    <span>${Number(subtotal).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-white/60">
                                    <span>Shipping</span>
                                    <span className="text-green-400">Free</span>
                                </div>
                                <div className="flex justify-between text-2xl font-serif pt-4 mt-2 text-white">
                                    <span>Total</span>
                                    <span>${Number(subtotal).toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || cart.items.length === 0}
                                className="w-full mt-8 bg-rose-600 text-white py-4 rounded-lg hover:bg-rose-500 transition-all shadow-lg hover:shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group font-medium tracking-wide"
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

                            <div className="mt-6 flex items-center justify-center gap-4 opacity-30">
                                {/* Payment Icons */}
                                <CreditCard className="w-6 h-6" />
                                <Wallet className="w-6 h-6" />
                                <div className="w-8 h-5 bg-white/20 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
