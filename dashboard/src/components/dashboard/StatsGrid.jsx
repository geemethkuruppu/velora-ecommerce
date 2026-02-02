import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Star, Package } from 'lucide-react';

const StatCard = ({ title, value, subtext, change, icon: Icon, variant = 'white' }) => {
    const isUp = !change.startsWith('-');

    if (variant === 'colored') {
        return (
            <div className="bg-emerald-500 p-4 rounded-[20px] shadow-lg flex flex-col justify-between h-[120px] relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div className="bg-white/20 p-1.5 rounded-lg text-white">
                        <Icon size={16} />
                    </div>
                </div>
                <div className="relative z-10">
                    <p className="text-white/80 text-[9px] uppercase tracking-widest font-bold mb-0.5">{title}</p>
                    <h3 className="text-white text-xl font-bold tracking-tight">{value}</h3>
                </div>
            </div>
        );
    }

    if (variant === 'dark') {
        return (
            <div className="bg-primary p-4 rounded-[20px] shadow-lg flex flex-col justify-between h-[120px] relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="flex justify-between items-start relative z-10">
                    <div className="bg-white/10 p-1.5 rounded-lg text-white">
                        <Icon size={16} />
                    </div>
                </div>
                <div className="relative z-10">
                    <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold mb-0.5">{title}</p>
                    <h3 className="text-white text-xl font-bold tracking-tight">{value}</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5 flex flex-col justify-between h-[120px] group hover:border-primary/20 transition-all">
            <div>
                <p className="text-primary font-bold text-xs mb-0.5">{title}</p>
                <p className="text-text-muted text-[9px] font-medium leading-tight">{subtext}</p>
            </div>
            <div className="flex items-end justify-between">
                <h3 className="text-primary text-xl font-bold tracking-tight">{value}</h3>
                <div className={`flex items-center gap-0.5 text-[9px] font-bold px-1 py-0.5 rounded-full ${isUp ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                    {change}
                </div>
            </div>
        </div>
    );
};

const StatsGrid = ({ stats = {} }) => {
    return (
        <div className="grid grid-cols-4 gap-4 mb-0">
            <StatCard
                title="Total Revenue"
                subtext="Total life-time earnings"
                value={`$${parseFloat(stats.orderStats?.total_revenue || 0).toLocaleString()}`}
                icon={DollarSign}
                change={`${stats.orderStats?.monthly_growth >= 0 ? '+' : ''}${stats.orderStats?.monthly_growth || 0}%`}
            />
            <StatCard
                title="Active Orders"
                subtext="Total processed orders"
                value={stats.orderStats?.total_orders || 0}
                icon={Calendar}
                change="+0%"
            />
            <StatCard
                title="Total Products"
                subtext="Across all categories"
                value={stats.productStats?.total_products || 0}
                change="+0%"
                icon={Package}
            />
            <StatCard
                title="Inventory Stock"
                subtext="Total units available"
                value={stats.inventoryStats?.total_items || 0}
                change="+0%"
                icon={TrendingUp}
            />
        </div>
    );
};

export default StatsGrid;
