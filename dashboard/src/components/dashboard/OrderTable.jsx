import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown, Package, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import OrderService from '../../services/orderService';

const StatusBadge = ({ status }) => {
    const styles = {
        'PENDING': 'bg-amber-100 text-amber-600',
        'CONFIRMED': 'bg-blue-100 text-blue-600',
        'SHIPPED': 'bg-violet-100 text-violet-600',
        'DELIVERED': 'bg-emerald-100 text-emerald-600',
        'CANCELLED': 'bg-rose-100 text-rose-600',
    };

    const icons = {
        'PENDING': <Clock size={10} />,
        'CONFIRMED': <CheckCircle2 size={10} />,
        'SHIPPED': <Package size={10} />,
        'DELIVERED': <CheckCircle2 size={10} />,
        'CANCELLED': <XCircle size={10} />,
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 w-fit ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {icons[status] || null}
            {status}
        </span>
    );
};

const OrderTable = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await OrderService.getAllOrders();
                if (Array.isArray(data)) {
                    setOrders(data.slice(0, 6));
                } else {
                    setOrders([]);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-[32px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5 h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">Loading Orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-primary tracking-tight">Recent Orders</h3>
                    <p className="text-text-muted text-[10px] font-medium mt-0.5">Latest customer transactions from VELORA</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-black/5 rounded-lg text-[10px] font-bold text-primary cursor-pointer hover:bg-gray-100 transition-all">
                        All Orders <ChevronDown size={12} />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b border-black/5">
                            <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Order ID</th>
                            <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Customer</th>
                            <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Items</th>
                            <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Total</th>
                            <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Date</th>
                            <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Status</th>
                            <th className="pb-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {orders.map((order, idx) => (
                            <motion.tr
                                key={order.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group hover:bg-gray-50/50 transition-all cursor-pointer"
                            >
                                <td className="py-4 text-xs font-bold text-primary tracking-tight">
                                    {order.order_number}
                                </td>
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/10">
                                            {order.customer_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-primary tracking-tight">{order.customer_name || 'Guest User'}</p>
                                            <p className="text-[9px] text-text-muted font-medium">User #{order.user_id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 text-xs font-bold text-primary">
                                    {order.items?.length || 0} items
                                </td>
                                <td className="py-4 text-xs font-bold text-primary">
                                    ${parseFloat(order.total_amount).toLocaleString()}
                                </td>
                                <td className="py-4 text-xs font-medium text-text-dim">
                                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="py-4">
                                    <StatusBadge status={order.status} />
                                </td>
                                <td className="py-4 text-right">
                                    <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-primary border border-black/5 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                        <ArrowUpRight size={14} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="7" className="py-20 text-center">
                                    <p className="text-xs font-bold text-primary/20 uppercase tracking-widest">No recent orders found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderTable;
