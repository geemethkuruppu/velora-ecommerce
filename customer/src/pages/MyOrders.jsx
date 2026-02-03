import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import CancelOrderModal from '../components/CancelOrderModal';
import { Package, Calendar, DollarSign, Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';
import orderService from '../services/orderService';
import { formatImageUrl } from '../services/productService';

const MyOrders = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    // 1. Redirect if not authenticated (using auth loading)
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // 2. Fetch orders if authenticated
    useEffect(() => {
        if (user) {
            const fetchOrders = async () => {
                try {
                    setLoading(true);
                    const data = await orderService.getUserOrders();
                    // Sort by date newest first
                    const sortedOrders = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setOrders(sortedOrders);
                } catch (error) {
                    console.error('Failed to fetch orders:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchOrders();
        }
    }, [user?.email]); // Anchor to email to prevent referential identity loops

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 5000);
    };

    const handleCancelClick = (order) => {
        setSelectedOrder(order);
        setCancelModalOpen(true);
    };

    const handleCancelConfirm = async () => {
        if (!selectedOrder) return;

        try {
            setCancelling(true);
            await orderService.cancelOrder(selectedOrder.id);

            // Update local state
            setOrders(orders.map(order =>
                order.id === selectedOrder.id
                    ? { ...order, status: 'CANCELLED', can_cancel: false }
                    : order
            ));

            showToast('Order cancelled successfully', 'success');
            setCancelModalOpen(false);
            setSelectedOrder(null);
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Failed to cancel order. Please try again.';
            showToast(errorMessage, 'error');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusIcon = (status) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('delivered')) return <CheckCircle className="w-5 h-5 text-green-600" />;
        if (lowerStatus.includes('shipped')) return <Truck className="w-5 h-5 text-blue-600" />;
        if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) return <Clock className="w-5 h-5 text-yellow-600" />;
        if (lowerStatus.includes('cancel')) return <XCircle className="w-5 h-5 text-red-600" />;
        return <Package className="w-5 h-5 text-gray-600" />;
    };

    const getStatusColor = (status) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('delivered')) return 'bg-green-100 text-green-700';
        if (lowerStatus.includes('shipped')) return 'bg-blue-100 text-blue-700';
        if (lowerStatus.includes('pending') || lowerStatus.includes('processing')) return 'bg-yellow-100 text-yellow-700';
        if (lowerStatus.includes('cancel')) return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <TopNav isVisible={true} />

            <div className="pt-24 pb-16 px-6 md:px-12 max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-serif text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-500 uppercase tracking-wider text-sm">Track and manage your orders</p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-2xl shadow-lg p-12 text-center"
                    >
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-serif text-gray-900 mb-2">No Orders Yet</h2>
                        <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-gray-900 text-white rounded-sm hover:bg-black transition-colors uppercase tracking-wider text-sm"
                        >
                            Start Shopping
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, index) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                            >
                                {/* Order Header */}
                                <div className="flex flex-wrap items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-5 h-5 text-gray-400" />
                                            <span className="font-medium text-gray-900">{order.order_number}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(order.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status.replace('_', ' ')}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                                            <DollarSign className="w-4 h-4" />
                                            ${Number(order.total_amount || 0).toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {order.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="flex items-center gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                                {item.image_url ? (
                                                    <img
                                                        src={formatImageUrl(item.image_url)}
                                                        alt={item.product_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <Package className="w-8 h-8 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                                                <p className="text-sm text-gray-500 font-mono text-xs uppercase tracking-tighter">SKU: {item.sku}</p>
                                                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="text-gray-900 font-medium">
                                                ${Number(item.price || 0).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Actions */}
                                <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                                    {order.can_cancel && (
                                        <button
                                            onClick={() => handleCancelClick(order)}
                                            className="px-6 py-2 border border-red-300 text-red-600 rounded-sm hover:bg-red-50 transition-colors text-sm uppercase tracking-wider font-medium"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                    {!order.can_cancel && order.cancel_reason && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <AlertCircle className="w-4 h-4" />
                                            <span>{order.cancel_reason}</span>
                                        </div>
                                    )}
                                    {order.status === 'DELIVERED' && (
                                        <button className="px-6 py-2 bg-gray-900 text-white rounded-sm hover:bg-black transition-colors text-sm uppercase tracking-wider">
                                            Reorder
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cancel Order Modal */}
            <CancelOrderModal
                isOpen={cancelModalOpen}
                onClose={() => {
                    setCancelModalOpen(false);
                    setSelectedOrder(null);
                }}
                onConfirm={handleCancelConfirm}
                orderNumber={selectedOrder?.order_number}
                orderTotal={selectedOrder?.total_amount}
                isLoading={cancelling}
            />

            {/* Toast Notification */}
            {toast.show && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                        } text-white`}
                >
                    <div className="flex items-center gap-3">
                        {toast.type === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <XCircle className="w-5 h-5" />
                        )}
                        <span>{toast.message}</span>
                    </div>
                </motion.div>
            )}
            <Footer />
        </div>
    );
};

export default MyOrders;
