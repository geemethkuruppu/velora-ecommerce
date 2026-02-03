import React from 'react';
import {
    TrendingUp,
    BarChart3,
    PieChart as PieChartIcon,
    Download,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const salesData = [
    { name: 'Jan', revenue: 45000, profit: 12000 },
    { name: 'Feb', revenue: 52000, profit: 15000 },
    { name: 'Mar', revenue: 48000, profit: 14000 },
    { name: 'Apr', revenue: 61000, profit: 19000 },
    { name: 'May', revenue: 55000, profit: 17000 },
    { name: 'Jun', revenue: 67000, profit: 22000 },
];

const categoryData = [
    { name: 'Watches', value: 45 },
    { name: 'Jewelry', value: 30 },
    { name: 'Accessories', value: 15 },
    { name: 'Leather Goods', value: 10 },
];

const COLORS = ['#d4af37', '#10b981', '#3b82f6', '#8b5cf6'];

const KpiCard = ({ title, value, change, trend, icon }) => (
    <div className="glass-card flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-300">
        <div className="w-14 h-14 rounded-2xl bg-dark-hover border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
            {icon}
        </div>
        <div>
            <p className="text-[0.8rem] font-bold text-text-muted uppercase tracking-widest">{title}</p>
            <div className="flex items-end gap-3 mt-1">
                <h3 className="text-2xl font-bold text-text-main leading-none">{value}</h3>
                <span className={`text-[0.75rem] font-bold flex items-center gap-0.5 ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <ArrowUpRight size={12} className={trend === 'down' ? 'rotate-90' : ''} />
                    {change}
                </span>
            </div>
        </div>
    </div>
);

const Reports = () => {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-[2rem] font-bold text-text-main tracking-tight">Analytics & Intelligence</h1>
                    <p className="text-text-dim font-medium mt-2">Deep dive into your business growth and market performance.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-5 py-2.5 bg-dark-card border border-border rounded-xl text-sm font-bold text-text-dim flex items-center gap-2 hover:border-white/20 transition-all">
                        <Calendar size={18} />
                        Jan 2026 - Jun 2026
                    </button>
                    <button className="px-5 py-2.5 bg-primary text-black rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#e5c05b] transition-all shadow-xl shadow-primary/20">
                        <Download size={18} />
                        Export Intel
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Gross Revenue" value="$428.5k" change="+14.2%" trend="up" icon={<TrendingUp size={24} />} />
                <KpiCard title="Net Profit" value="$124.2k" change="+8.1%" trend="up" icon={<BarChart3 size={24} />} />
                <KpiCard title="Avg. Order" value="$542.00" change="-2.4%" trend="down" icon={<PieChartIcon size={24} />} />
                <KpiCard title="Conversion" value="3.82%" change="+0.4%" trend="up" icon={<Activity size={24} />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card flex flex-col gap-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-text-main">Revenue vs Profit Growth</h3>
                        <div className="flex gap-4 text-[0.75rem]">
                            <div className="flex items-center gap-2 text-text-dim"><span className="w-2.5 h-2.5 rounded bg-primary"></span> Revenue</div>
                            <div className="flex items-center gap-2 text-text-dim"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Profit</div>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
                                <XAxis dataKey="name" stroke="#444" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#444" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{ backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px' }}
                                />
                                <Bar dataKey="revenue" fill="#d4af37" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card flex flex-col gap-8">
                    <h3 className="text-lg font-bold text-text-main">Market Share by Category</h3>
                    <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-8">
                        <div className="h-[280px] w-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-5">
                            {categoryData.map((item, index) => (
                                <div key={item.name} className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-text-main leading-tight">{item.name}</span>
                                        <span className="text-[0.75rem] text-text-muted font-medium">{item.value}% of volume</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
