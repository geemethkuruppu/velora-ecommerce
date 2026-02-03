import React, { useEffect, useState } from 'react';
import StatsGrid from '../components/dashboard/StatsGrid';
import OrderTable from '../components/dashboard/OrderTable';
import { RevenueChart, TopCategoriesChart } from '../components/dashboard/DashboardWidgets';
import OrderService from '../services/orderService';
import { productService } from '../services/productService';
import InventoryService from '../services/inventoryService';

const Dashboard = () => {
    const [stats, setStats] = useState({
        orderStats: null,
        productStats: null,
        inventoryStats: null,
        loading: true
    });

    useEffect(() => {
        const fetchAllStats = async () => {
            try {
                const [oStats, pStats, iStats] = await Promise.all([
                    OrderService.getOrderStats(),
                    productService.getStats(),
                    InventoryService.getStats()
                ]);

                setStats({
                    orderStats: oStats,
                    productStats: pStats,
                    inventoryStats: iStats,
                    loading: false
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                setStats(s => ({ ...s, loading: false }));
            }
        };

        fetchAllStats();
    }, []);

    if (stats.loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-primary/40 uppercase tracking-widest animate-pulse">Initializing VELORA Experience...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Top Row: Stats (2/3) and Revenue Chart (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <StatsGrid stats={stats} />
                </div>
                <div className="lg:col-span-1">
                    <RevenueChart data={stats.orderStats?.revenue_history || []} />
                </div>
            </div>

            {/* Bottom Row: Order Table (2/3) and Top Categories (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <OrderTable />
                </div>
                <div className="lg:col-span-1">
                    <TopCategoriesChart data={stats.productStats?.category_distribution || []} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
