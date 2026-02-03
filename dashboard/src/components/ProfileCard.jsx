import React, { useState } from 'react';
import { User, Mail, Shield, Hash, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmationDialog from './ConfirmationDialog';

const ProfileCard = ({ onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        onClose();
    };

    const handleViewProfile = () => {
        navigate('/dashboard/my-profile');
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Profile Card */}
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-black/5 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-primary to-primary/90 p-6 relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white backdrop-blur-sm">
                            <User size={28} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white text-lg font-bold tracking-tight">{user?.full_name || 'Admin User'}</h3>
                            <p className="text-white/60 text-xs font-medium mt-0.5">{user?.email || 'admin@velora.com'}</p>
                        </div>
                    </div>
                </div>

                {/* User Details */}
                <div className="p-4 space-y-3 border-b border-black/5">
                    <div className="flex items-center gap-3 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Shield size={14} />
                        </div>
                        <div className="flex-1">
                            <p className="text-text-muted text-[9px] uppercase tracking-widest font-bold">Role</p>
                            <p className="text-primary font-bold tracking-tight mt-0.5">{user?.role || 'ADMIN'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Hash size={14} />
                        </div>
                        <div className="flex-1">
                            <p className="text-text-muted text-[9px] uppercase tracking-widest font-bold">User ID</p>
                            <p className="text-primary font-bold tracking-tight mt-0.5">#{user?.id || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <Mail size={14} />
                        </div>
                        <div className="flex-1">
                            <p className="text-text-muted text-[9px] uppercase tracking-widest font-bold">Status</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-600">
                                    {user?.is_active ? 'ACTIVE' : 'INACTIVE'}
                                </span>
                                {user?.is_verified && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-600">
                                        VERIFIED
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-3 space-y-1">
                    <button
                        onClick={handleViewProfile}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-all group text-left"
                    >
                        <div className="flex items-center gap-3">
                            <User size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                            <span className="text-xs font-bold text-primary">View Profile</span>
                        </div>
                        <ChevronRight size={14} className="text-text-muted group-hover:text-primary transition-colors" />
                    </button>

                    <button
                        onClick={() => {
                            navigate('/dashboard/settings');
                            onClose();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-all group text-left"
                    >
                        <div className="flex items-center gap-3">
                            <Settings size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                            <span className="text-xs font-bold text-primary">Settings</span>
                        </div>
                        <ChevronRight size={14} className="text-text-muted group-hover:text-primary transition-colors" />
                    </button>

                    <div className="h-px bg-black/5 my-2" />

                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-all group text-left"
                    >
                        <LogOut size={16} className="text-text-muted group-hover:text-red-500 transition-colors" />
                        <span className="text-xs font-bold text-primary group-hover:text-red-500 transition-colors">Logout</span>
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogout}
                title="Logout Confirmation"
                message="Are you sure you want to logout from your account?"
                confirmText="Logout"
                cancelText="Cancel"
                type="warning"
            />
        </>
    );
};

export default ProfileCard;
