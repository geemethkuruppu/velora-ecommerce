import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { ChevronDown } from 'lucide-react';



export const RevenueChart = ({ data = [] }) => (
    <div className="bg-white rounded-[32px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5 flex flex-col h-[280px]">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="text-base font-bold text-primary tracking-tight">Revenue Trend</h3>
                <p className="text-text-muted text-[9px] font-medium mt-0.5">Monthly revenue overview</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-black/5 rounded-lg text-[9px] font-bold text-primary cursor-pointer hover:bg-gray-100 transition-all">
                Amount <ChevronDown size={10} />
            </div>
        </div>

        <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar dataKey="revenue" radius={[8, 8, 8, 8]} barSize={40}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#000B18' : '#E8EAF6'} />
                        ))}
                    </Bar>
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        fontSize={9}
                        fontWeight="bold"
                        tick={{ fill: '#A0AEC0' }}
                        dy={8}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="flex justify-between mt-3 px-2">
            {data.slice(-3).map((d, i) => (
                <span key={i} className="text-xs font-bold text-primary">${parseFloat(d.revenue).toLocaleString()}</span>
            ))}
        </div>
    </div>
);

export const TopCategoriesChart = ({ data = [] }) => {
    // Take top 3
    const sorted = [...data].sort((a, b) => b.product_count - a.product_count);
    const top3 = sorted.slice(0, 3);
    const total = top3.reduce((acc, curr) => acc + curr.product_count, 0) || 1;

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5 flex flex-col h-[400px]">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-base font-bold text-primary tracking-tight">Top Categories</h3>
                    <p className="text-text-muted text-[9px] font-medium mt-0.5">Product distribution by category</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-black/5 rounded-lg text-[9px] font-bold text-primary cursor-pointer hover:bg-gray-100 transition-all">
                    Global <ChevronDown size={10} />
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative scale-90">
                <div className="relative w-64 h-64">
                    {/* Main Circle */}
                    {top3[0] && (
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary rounded-full flex flex-col items-center justify-center text-white border-[8px] border-white shadow-xl z-20">
                            <span className="text-2xl font-bold">{Math.round((top3[0].product_count / total) * 100)}%</span>
                            <span className="text-[8px] uppercase tracking-widest font-bold opacity-60 text-center px-4 leading-tight">{top3[0].category_name}</span>
                        </div>
                    )}

                    {/* Second Circle */}
                    {top3[1] && (
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#7C4DFF] rounded-full flex flex-col items-center justify-center text-white border-[8px] border-white shadow-xl z-30">
                            <span className="text-xl font-bold">{Math.round((top3[1].product_count / total) * 100)}%</span>
                            <span className="text-[7px] uppercase tracking-widest font-bold opacity-60 text-center px-3 leading-tight">{top3[1].category_name}</span>
                        </div>
                    )}

                    {/* Third Circle */}
                    {top3[2] && (
                        <div className="absolute bottom-4 right-0 w-28 h-28 bg-[#D1C4E9] rounded-full flex flex-col items-center justify-center text-primary border-[6px] border-white shadow-xl z-10">
                            <span className="text-lg font-bold">{Math.round((top3[2].product_count / total) * 100)}%</span>
                            <span className="text-[6px] uppercase tracking-widest font-bold opacity-40 text-center px-2 leading-tight">{top3[2].category_name}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DashboardWidgets = () => {
    return (
        <div className="flex flex-col gap-6">
            <RevenueChart />
            <TopCategoriesChart />
        </div>
    );
};

export default DashboardWidgets;
