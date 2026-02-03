import React, { useState, useEffect } from 'react';
import {
    Search, Plus, Minus, AlertCircle, Package, Edit,
    Calendar, History, X, ArrowUpRight, ArrowDownLeft,
    ShoppingCart, Clock, CheckCircle2
} from 'lucide-react';
import InventoryService from '../services/inventoryService';
import { motion, AnimatePresence } from 'framer-motion';

const Inventory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [inventory, setInventory] = useState([]);
    const [stats, setStats] = useState({ total_items: 0, low_stock_count: 0, reserved_items_count: 0 });
    const [loading, setLoading] = useState(true);
    const [filterLowStock, setFilterLowStock] = useState(false);

    // View States
    const [showReservations, setShowReservations] = useState(false);
    const [reservations, setReservations] = useState([]);
    const [events, setEvents] = useState([]);

    // Edit Modal State
    const [editModal, setEditModal] = useState({ show: false, item: null, value: 0 });

    useEffect(() => {
        fetchData();
        fetchStats();
        fetchEvents();
    }, [filterLowStock]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await InventoryService.getInventory(filterLowStock);
            setInventory(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await InventoryService.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const fetchEvents = async () => {
        try {
            const data = await InventoryService.getEvents();
            setEvents(Array.isArray(data) ? data.slice(0, 8) : []); // Only show top 8 in Sidebar
        } catch (error) {
            console.error("Failed to fetch events", error);
        }
    };

    const handleShowReservations = async () => {
        try {
            const data = await InventoryService.getReservations();
            setReservations(Array.isArray(data) ? data : []);
            setShowReservations(true);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
        }
    };

    const handleOpenEdit = (item) => {
        setEditModal({ show: true, item, value: item.total_quantity });
    };

    const handleAbsoluteUpdate = async () => {
        try {
            await InventoryService.updateStock(editModal.item.variant_id, editModal.value);
            setEditModal({ show: false, item: null, value: 0 });
            fetchData();
            fetchStats();
            fetchEvents();
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to update stock.");
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.variant_sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variant_id?.toString().includes(searchTerm)
    );

    const getEventIcon = (type) => {
        switch (type) {
            case 'STOCK_ADDED': return <ArrowUpRight className="text-emerald-400" size={14} />;
            case 'STOCK_REMOVED': return <ArrowDownLeft className="text-rose-400" size={14} />;
            case 'STOCK_UPDATED': return <History className="text-blue-400" size={14} />;
            case 'RESERVED': return <ShoppingCart className="text-violet-400" size={14} />;
            case 'CONFIRMED': return <CheckCircle2 className="text-blue-400" size={14} />;
            case 'RELEASED': return <ArrowDownLeft className="text-rose-400" size={14} />;
            default: return <History className="text-text-muted" size={14} />;
        }
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500 relative">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-[1.8rem] font-bold text-text-main">Inventory Management</h1>
                    <p className="text-text-dim text-sm mt-2 font-medium">Precision tracking for Velora's high-end catalog.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleShowReservations}
                        className="flex items-center gap-2 px-5 py-2.5 border border-violet-500/30 rounded-xl text-violet-400 hover:text-violet-300 hover:border-violet-500/60 transition-all bg-white backdrop-blur-md shadow-sm"
                    >
                        <Calendar size={18} />
                        <span className="text-sm font-bold tracking-tight">Reservations</span>
                    </button>
                    <button className="primary-btn !py-2.5 !px-6 !rounded-xl !text-sm">Bulk Update</button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card flex flex-col gap-1 border-white/5 bg-white shadow-sm !p-6">
                    <div className="flex justify-between items-start">
                        <p className="text-[0.7rem] text-text-muted font-bold uppercase tracking-[0.1em]">Total Active SKUs</p>
                        <Package size={16} className="text-primary/50" />
                    </div>
                    {loading ? (
                        <div className="h-9 w-24 bg-white animate-pulse rounded-lg mt-1 border border-border/20"></div>
                    ) : (
                        <h3 className="text-3xl font-bold text-text-main mt-1 tracking-tight">{stats.total_items}</h3>
                    )}
                </div>

                <div className="glass-card flex flex-col gap-1 border-rose-500/20 bg-white shadow-sm !p-6">
                    <div className="flex justify-between items-start">
                        <p className="text-[0.7rem] text-rose-400 font-bold uppercase tracking-[0.1em]">Low Stock Alerts</p>
                        <AlertCircle size={16} className="text-rose-400/50" />
                    </div>
                    {loading ? (
                        <div className="h-9 w-24 bg-white animate-pulse rounded-lg mt-1 border border-border/20"></div>
                    ) : (
                        <h3 className="text-3xl font-bold text-rose-400 mt-1 tracking-tight">{stats.low_stock_count}</h3>
                    )}
                </div>

                {/* Nice Reservation Container Style */}
                <div className="glass-card flex flex-col gap-1 border-violet-500/30 bg-white shadow-sm relative overflow-hidden group !p-6">
                    <div className="absolute -right-4 -bottom-4 bg-violet-500/5 w-24 h-24 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <p className="text-[0.7rem] text-violet-400 font-bold uppercase tracking-[0.1em]">Reserved Items</p>
                        <ShoppingCart size={16} className="text-violet-400/50" />
                    </div>
                    {loading ? (
                        <div className="h-9 w-24 bg-white animate-pulse rounded-lg mt-1 border border-border/20"></div>
                    ) : (
                        <h3 className="text-3xl font-bold text-violet-400 mt-1 tracking-tight relative z-10">{stats.reserved_items_count}</h3>
                    )}
                    <p className="text-[0.65rem] text-violet-400/60 font-semibold mt-2 relative z-10">Requires fulfillment</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Table Content */}
                <div className="glass-card !p-0 overflow-hidden flex-grow border-white/5 bg-white shadow-sm">
                    <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/20 gap-4">
                        <div className="flex items-center bg-white border border-border/30 px-4 py-2.5 rounded-xl w-full sm:w-[350px] gap-3 focus-within:border-primary/40 transition-all shadow-sm">
                            <Search size={18} className="text-text-muted" />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none text-text-main w-full focus:outline-none text-sm font-medium"
                            />
                        </div>
                        <div className="flex gap-2 bg-white p-1 rounded-xl border border-border/20 shadow-sm">
                            <button
                                onClick={() => setFilterLowStock(false)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!filterLowStock ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                            >
                                All Catalog
                            </button>
                            <button
                                onClick={() => setFilterLowStock(true)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${filterLowStock ? 'bg-rose-500 text-white shadow-lg' : 'text-text-muted hover:text-rose-400'}`}
                            >
                                Critical Stock
                                {stats.low_stock_count > 0 && (
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${filterLowStock ? 'bg-white text-rose-500' : 'bg-rose-500/20 text-rose-400'}`}>
                                        {stats.low_stock_count}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-border/10">
                                    <th className="px-6 py-4 text-text-muted text-[0.65rem] font-black uppercase tracking-[0.15em]">SKU / Identity</th>
                                    <th className="px-6 py-4 text-text-muted text-[0.65rem] font-black uppercase tracking-[0.15em]">Availability</th>
                                    <th className="px-6 py-4 text-text-muted text-[0.65rem] font-black uppercase tracking-[0.15em]">Reservation</th>
                                    <th className="px-6 py-4 text-text-muted text-[0.65rem] font-black uppercase tracking-[0.15em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
                                                <p className="text-[0.6rem] font-black text-text-dim tracking-[0.3em] uppercase">Loading Vault...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredInventory.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-12 text-center text-text-dim font-medium italic">Empty storage...</td></tr>
                                ) : (
                                    filteredInventory.map(item => {
                                        const isLowStock = item.available_quantity < 5;
                                        return (
                                            <tr key={item.variant_id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white border border-border/20 rounded-xl flex items-center justify-center text-text-muted group-hover:text-primary transition-all duration-500 group-hover:scale-110 shadow-sm">
                                                            <Package size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-text-main group-hover:translate-x-1 transition-transform">{item.product_name || `Variant #${item.variant_id}`}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[0.65rem] py-0.5 px-2 bg-primary/10 text-primary font-bold rounded uppercase tracking-wider">{item.variant_sku}</span>
                                                                <span className="text-[0.65rem] text-text-dim font-bold">ID: {item.variant_id}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-lg font-black ${isLowStock ? 'text-rose-400' : 'text-text-main'}`}>
                                                                {item.available_quantity}
                                                            </span>
                                                            <span className="text-xs text-text-muted font-bold tracking-tight">Units Available</span>
                                                        </div>
                                                        <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden max-w-[120px]">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min((item.available_quantity / 100) * 100, 100)}%` }}
                                                                className={`h-full ${isLowStock ? 'bg-rose-500' : 'bg-primary'}`}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-text-dim font-bold mt-2 uppercase tracking-wide">Storage Capacity: {item.total_quantity}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${item.reserved_quantity > 0 ? 'bg-violet-50 border-violet-500/20 text-violet-400' : 'bg-white border-border/20 text-text-dim'}`}>
                                                        <ShoppingCart size={12} />
                                                        <span className="text-xs font-black tracking-tight">{item.reserved_quantity} Reserved</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 group-hover:duration-300">
                                                        <button
                                                            onClick={() => handleOpenEdit(item)}
                                                            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-border/30 text-text-dim hover:text-primary hover:border-primary/30 transition-all shadow-sm active:scale-95"
                                                        >
                                                            <Edit size={16} />
                                                            <span className="text-xs font-bold whitespace-nowrap">Edit Stock</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Sidebar: Activity Feed */}
                <div className="w-full lg:w-[350px] shrink-0">
                    <div className="glass-card flex flex-col gap-6 sticky top-8 bg-white shadow-xl !border-white/20">
                        <div className="flex justify-between items-center">
                            <h2 className="text-sm font-black text-text-main uppercase tracking-[0.1em] flex items-center gap-2">
                                <History size={16} className="text-primary" />
                                Recent Activity
                            </h2>
                            <button
                                onClick={fetchEvents}
                                className="text-[0.65rem] font-bold text-primary hover:underline"
                            >
                                Refresh
                            </button>
                        </div>

                        <div className="flex flex-col gap-5">
                            {events.length === 0 ? (
                                <p className="text-xs text-text-dim font-medium italic py-4 text-center">No recent activity logged.</p>
                            ) : (
                                events.map((ev, idx) => (
                                    <motion.div
                                        key={ev.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex gap-4 group"
                                    >
                                        <div className="flex flex-col items-center shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-slate-50 border border-border/20 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-500">
                                                {getEventIcon(ev.event_type)}
                                            </div>
                                            {idx !== events.length - 1 && (
                                                <div className="w-0.5 h-full bg-slate-100 mt-1" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-0.5 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[0.7rem] font-black text-text-main uppercase tracking-tight truncate">{ev.event_type.replace('_', ' ')}</span>
                                                <span className="text-[0.6rem] text-text-muted font-bold whitespace-nowrap">{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-[0.65rem] text-text-dim font-medium leading-relaxed truncate">
                                                {ev.variant_sku} ({ev.quantity} units)
                                            </p>
                                            {ev.order_id && (
                                                <span className="text-[0.6rem] font-mono text-primary/60 truncate"># {ev.order_id.split('-')[0]}</span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={handleShowReservations}
                            className="text-[0.65rem] font-black text-violet-400 bg-violet-50 py-4 rounded-xl border border-violet-500/10 hover:bg-violet-100 transition-colors uppercase tracking-widest mt-2 shadow-sm"
                        >
                            Open Command Center
                        </button>
                    </div>
                </div>
            </div>

            {/* Reservations Command Center Modal */}
            <AnimatePresence>
                {showReservations && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
                        onClick={() => setShowReservations(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="glass-card w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col !p-0 border-violet-500/20 shadow-[0_30px_100px_rgba(124,77,255,0.1)] bg-white"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 border-b border-border/10 flex justify-between items-center bg-white relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 blur-[100px] -z-10"></div>
                                <div>
                                    <h2 className="text-2xl font-black text-text-main tracking-tight">Active Reservations</h2>
                                    <p className="text-[0.7rem] text-violet-400 font-bold uppercase tracking-[0.2em] mt-1">Global Vault Lock Manager</p>
                                </div>
                                <button
                                    onClick={() => setShowReservations(false)}
                                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-text-dim hover:text-text-main transition-colors border border-border/20 shadow-sm"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-auto bg-slate-50/30 custom-scrollbar">
                                {reservations.length === 0 ? (
                                    <div className="py-32 text-center text-text-dim font-medium italic text-sm">No active locks in the vault...</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {reservations.map(res => (
                                            <div key={res.id} className="bg-white border border-border/20 rounded-2xl p-5 hover:border-violet-500/30 transition-all group relative overflow-hidden shadow-sm">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                                                            <Clock size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-text-main tracking-tight line-clamp-1">Variant ID: {res.variant_id}</p>
                                                            <p className="text-[0.65rem] text-text-muted font-bold uppercase">{res.quantity} Units Reserved</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-[9px] font-black tracking-widest uppercase ${res.status === 'ACTIVE' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                                        res.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                            'bg-slate-100 text-slate-500 border border-slate-200'
                                                        }`}>
                                                        {res.status}
                                                    </span>
                                                </div>
                                                <div className="space-y-2 relative z-10">
                                                    <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-border/10">
                                                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Order Reference</span>
                                                        <span className="text-xs font-mono text-primary font-bold"># {res.order_id.split('-')[0].toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center px-1">
                                                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Locked On</span>
                                                        <span className="text-[10px] text-text-dim font-bold">{new Date(res.created_at).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rotate-45 translate-x-16 -translate-y-16 group-hover:translate-x-12 transition-transform duration-700"></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-border/10 bg-white flex justify-end gap-3 font-black text-[0.65rem] tracking-[0.2em] uppercase">
                                <span className="text-text-muted">Velora Security Asset Protection v1.0</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Stock Modal */}
            <AnimatePresence>
                {editModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
                        onClick={() => setEditModal({ show: false, item: null, value: 0 })}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className="glass-card w-full max-w-md overflow-hidden flex flex-col p-8 border-primary/20 bg-white shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-text-main tracking-tight">Manual Stock Update</h2>
                                <button onClick={() => setEditModal({ show: false, item: null, value: 0 })} className="text-text-dim hover:text-text-main">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-border/10">
                                    <p className="text-[0.65rem] font-black text-text-muted uppercase tracking-widest mb-1">Identity</p>
                                    <p className="text-sm font-bold text-text-main">{editModal.item?.variant_sku}</p>
                                </div>

                                <div>
                                    <label className="text-[0.65rem] font-black text-text-muted uppercase tracking-widest mb-2 block">Absolute Quantity</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={editModal.value}
                                            onChange={(e) => setEditModal({ ...editModal, value: parseInt(e.target.value) || 0 })}
                                            className="w-full bg-white border border-border/30 rounded-xl px-4 py-3 font-black text-xl text-primary focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                                            min="0"
                                            autoFocus
                                        />
                                        <Package className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/20" size={20} />
                                    </div>
                                    <p className="text-[0.65rem] text-text-dim font-bold mt-2">Adjusting the total inventory count for this unit.</p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setEditModal({ show: false, item: null, value: 0 })}
                                    className="flex-1 px-4 py-3 rounded-xl border border-border/30 text-sm font-bold text-text-dim hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAbsoluteUpdate}
                                    className="flex-1 px-4 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all shadow-lg active:scale-95"
                                >
                                    Confirm Update
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Inventory;
