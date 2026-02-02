import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileCard from './ProfileCard';
import logo from '../assets/logo.png';
import {
    Search,
    Bell,
    Settings as SettingsIcon,
    LogOut,
    User,
    Calendar,
    Plus,
    MessageSquare
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isDashboard = location.pathname === '/dashboard';
    const [showProfileCard, setShowProfileCard] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const firstName = user?.full_name?.split(' ')[0] || 'Admin';

    // Base navigation items for all admins
    const baseNavItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Orders', path: '/dashboard/orders' },
        { name: 'Products', path: '/dashboard/products' },
        { name: 'Inventory', path: '/dashboard/inventory' },
    ];

    // Add Users only for SUPER_ADMIN
    const navItems = user?.role === 'SUPER_ADMIN'
        ? [...baseNavItems, { name: 'Users', path: '/dashboard/user-management' }]
        : baseNavItems;

    return (
        <div className="min-h-screen bg-[#E9ECEF] p-3 lg:p-4 flex flex-col h-screen">
            {/* Header Section (Standalone Container) */}
            <header className={`sticky top-3 lg:top-4 z-50 bg-primary px-10 flex flex-col rounded-[24px] lg:rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] mb-3 lg:mb-4 w-full max-w-[1700px] mx-auto ${isDashboard ? 'pt-6 pb-8 gap-12' : 'pt-4 pb-5 gap-0'}`}>

                {/* Top Row: Brand, Nav, Tools */}
                <div className="grid grid-cols-3 items-center">
                    {/* Left: Logo & Brand */}
                    <div className="flex items-center gap-2.5">
                        <img src={logo} alt="Velora" className="w-8 h-8 object-contain" />
                        <span className="text-white font-bold tracking-[3px] text-base uppercase">VELORA</span>
                    </div>

                    {/* Middle: Navigation */}
                    <nav className="flex items-center justify-center gap-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `px-5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-300 ${isActive
                                        ? 'bg-white/10 text-white shadow-lg'
                                        : 'text-white/40 hover:text-white/80'
                                    }`
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right: Notification, Profile, Logout */}
                    <div className="flex items-center justify-end gap-2.5">
                        <div className="bg-white/5 p-1 rounded-full flex items-center gap-1">
                            <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all">
                                <Search size={18} />
                            </button>
                            <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all">
                                <MessageSquare size={18} />
                            </button>
                            <button className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all relative">
                                <Bell size={18} />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-secondary rounded-full border border-primary"></span>
                            </button>
                        </div>

                        <div className="relative">
                            <div
                                onClick={() => setShowProfileCard(!showProfileCard)}
                                className="w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white overflow-hidden cursor-pointer hover:border-secondary/30 transition-all ml-1.5"
                            >
                                <User size={18} />
                            </div>
                            {showProfileCard && <ProfileCard onClose={() => setShowProfileCard(false)} />}
                        </div>
                    </div>
                </div>

                {/* Middle Row: Greeting, Date, Action (Only on Dashboard) */}
                {isDashboard && (
                    <div className="flex items-center justify-between">
                        {/* Left: Greeting */}
                        <div>
                            <h2 className="text-white text-3xl font-serif tracking-tight">
                                Good morning, <span className="text-secondary italic">{firstName}!</span>
                            </h2>
                        </div>

                        {/* Right: Date and Primary Action */}
                        <div className="flex items-center gap-6">
                            {/* Date (No background) */}
                            <div className="flex items-center gap-2.5 text-white/60">
                                <Calendar size={16} className="text-white/40" />
                                <span className="text-xs font-bold tracking-wider">
                                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>

                            <button className="flex items-center gap-2.5 px-6 py-3 bg-[#7C4DFF] hover:bg-[#6C3DFF] text-white rounded-xl shadow-xl shadow-[#7C4DFF]/20 transition-all active:scale-95 group">
                                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                <span className="text-xs font-bold tracking-widest uppercase">New reservation</span>
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Content Area Area (Standalone Container) */}
            <main className="flex-1 w-full max-w-[1700px] mx-auto bg-white rounded-[24px] lg:rounded-[40px] shadow-[0_30px_80px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden border border-white">
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F8FAFC] p-6 lg:p-8">
                    <div className="max-w-[1500px] mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
