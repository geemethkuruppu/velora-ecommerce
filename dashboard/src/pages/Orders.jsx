import React, { useState, useEffect } from 'react';
import { Search, Filter, ShoppingBag, Eye, CreditCard, X, Package } from 'lucide-react';
import OrderService from '../services/orderService';
import { motion, AnimatePresence } from 'framer-motion';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await OrderService.getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (orderId) => {
        try {
            // If we already have full details in the unique fetch list, we can use that, 
            // but usually details might have more info. 
            // Current OrderResponse has items, so we might already have it.
            // To be safe and follow pattern, let's try to find it in local state first, 
            // OR fetch fresh if needed. Since we have items in list response, we use that.
            const order = orders.find(o => o.id === orderId);
            setSelectedOrder(order);
        } catch (error) {
            console.error("Failed to load details", error);
        }
    };

    const closeModal = () => setSelectedOrder(null);

    const filteredOrders = orders.filter(order =>
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_id?.toString().includes(searchTerm)
    );

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500 relative">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-[1.8rem] font-bold text-text-main">Orders Overview</h1>
                    <p className="text-text-dim text-sm mt-2">Track customer purchases and fulfillment status.</p>
                </div>
                <div className="flex gap-4">
                    <button className="primary-btn" onClick={fetchOrders}>Refresh Orders</button>
                </div>
            </header>

            <div className="glass-card !p-0 overflow-hidden">
                <div className="p-6 flex justify-between items-center border-b border-border">
                    <div className="flex items-center bg-dark-hover border border-border px-4 py-2.5 rounded-md w-[350px] gap-3 focus-within:border-primary/50 transition-colors">
                        <Search size={18} className="text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by Order No or User ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none text-text-main w-full focus:outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-white/2">
                                <th className="px-6 py-4 text-text-muted text-[0.75rem] font-semibold uppercase tracking-wider">Order</th>
                                <th className="px-6 py-4 text-text-muted text-[0.75rem] font-semibold uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-text-muted text-[0.75rem] font-semibold uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-text-muted text-[0.75rem] font-semibold uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-text-muted text-[0.75rem] font-semibold uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-text-muted text-[0.75rem] font-semibold uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-text-dim">Loading orders...</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-text-dim">No orders found.</td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="border-b border-border hover:bg-dark-hover/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-bold text-primary tracking-wide">#{order.order_number}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-semibold text-text-main">{order.customer_name || `User #${order.user_id}`}</p>
                                                <span className="text-xs text-text-dim">User ID: {order.user_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-text-dim">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-bold text-text-main">
                                            ${parseFloat(order.total_amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`px-2.5 py-1 rounded-full text-[0.7rem] font-bold tracking-tight ${order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                order.status === 'SHIPPED' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                                                    order.status === 'CONFIRMED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => handleViewDetails(order.id)}
                                                className="px-3 py-1.5 rounded-md bg-dark-hover text-text-dim text-xs font-semibold hover:text-text-main border border-border transition-colors cursor-pointer"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0f0f13] border border-border rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center bg-white/2">
                                <div>
                                    <h2 className="text-xl font-bold text-text-main">Order Details</h2>
                                    <p className="text-text-dim text-sm mt-1">Order #{selectedOrder.order_number}</p>
                                </div>
                                <button onClick={closeModal} className="p-2 hover:bg-dark-hover rounded-full text-text-muted hover:text-text-main transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-1">
                                        <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Shipping Address</p>
                                        <p className="text-text-main text-sm leading-relaxed">{selectedOrder.shipping_address}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-xs text-text-muted uppercase tracking-wider font-semibold">Payment Status</p>
                                        <p className="text-emerald-400 text-sm font-medium">Paid (Simulated)</p>
                                        {/* Assuming paid since order created */}
                                    </div>
                                </div>

                                <h3 className="text-md font-semibold text-text-main mb-4 flex items-center gap-2">
                                    <Package size={18} className="text-primary" />
                                    Order Items
                                </h3>

                                <div className="bg-dark-hover/30 rounded-lg border border-border/50 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 border-b border-border/50">
                                            <tr>
                                                <th className="px-4 py-3 text-text-muted text-xs font-semibold">Product</th>
                                                <th className="px-4 py-3 text-text-muted text-xs font-semibold">SKU</th>
                                                <th className="px-4 py-3 text-text-muted text-xs font-semibold text-right">Price</th>
                                                <th className="px-4 py-3 text-text-muted text-xs font-semibold text-right">Qty</th>
                                                <th className="px-4 py-3 text-text-muted text-xs font-semibold text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {selectedOrder.items?.map((item) => (
                                                <tr key={item.id} className="text-sm">
                                                    <td className="px-4 py-3 text-text-bright font-medium">
                                                        {item.product_name}
                                                    </td>
                                                    <td className="px-4 py-3 text-text-dim font-mono text-xs">
                                                        {item.sku}
                                                    </td>
                                                    <td className="px-4 py-3 text-text-dim text-right">
                                                        ${parseFloat(item.price).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3 text-text-dim text-right">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-4 py-3 text-text-main font-bold text-right">
                                                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-white/5 border-t border-border/50">
                                            <tr>
                                                <td colSpan="4" className="px-4 py-3 text-right text-text-muted text-sm font-semibold">Total Amount</td>
                                                <td className="px-4 py-3 text-right text-primary font-bold text-lg">
                                                    ${parseFloat(selectedOrder.total_amount).toLocaleString()}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div className="p-4 border-t border-border bg-white/2 flex justify-end">
                                <button onClick={closeModal} className="px-4 py-2 bg-dark-hover border border-border rounded-md text-text-main text-sm font-medium hover:bg-border/50 transition-colors">
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Orders;
