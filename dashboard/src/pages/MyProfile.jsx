import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Hash, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MyProfile = () => {
    const { user } = useAuth();
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        // Use existing user data from context
        setUserDetails(user);
    }, [user]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">My Profile</h1>
                    <p className="text-text-muted text-xs font-bold tracking-wider mt-1">View and manage your account information</p>
                </div>
            </header>

            {/* Profile Overview Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5">
                <div className="flex items-start gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-xl">
                        <User size={40} />
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                        <div>
                            <h2 className="text-2xl font-bold text-primary tracking-tight">{userDetails?.full_name || 'Admin User'}</h2>
                            <p className="text-text-muted text-sm font-medium mt-1">{userDetails?.email || 'admin@velora.com'}</p>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2 mt-4">
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-violet-100 text-violet-600 flex items-center gap-2">
                                <Shield size={14} />
                                {userDetails?.role || 'ADMIN'}
                            </span>
                            {userDetails?.is_active && (
                                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600 flex items-center gap-2">
                                    <CheckCircle size={14} />
                                    ACTIVE
                                </span>
                            )}
                            {userDetails?.is_verified && (
                                <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-600 flex items-center gap-2">
                                    <CheckCircle size={14} />
                                    VERIFIED
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Account Details */}
                <div className="bg-white rounded-[32px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5">
                    <h3 className="text-lg font-bold text-primary tracking-tight mb-6">Account Details</h3>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-[20px]">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                <Hash size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1">User ID</p>
                                <p className="text-sm font-bold text-primary">#{userDetails?.id || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-[20px]">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                <Mail size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1">Email Address</p>
                                <p className="text-sm font-bold text-primary break-all">{userDetails?.email || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-[20px]">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                <User size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1">Full Name</p>
                                <p className="text-sm font-bold text-primary">{userDetails?.full_name || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-[20px]">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                <Shield size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1">Role</p>
                                <p className="text-sm font-bold text-primary">{userDetails?.role || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security & Status */}
                <div className="bg-white rounded-[32px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5">
                    <h3 className="text-lg font-bold text-primary tracking-tight mb-6">Security & Status</h3>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-[20px]">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${userDetails?.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {userDetails?.is_active ? <CheckCircle size={18} /> : <XCircle size={18} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1">Account Status</p>
                                <p className={`text-sm font-bold ${userDetails?.is_active ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {userDetails?.is_active ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-[20px]">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${userDetails?.is_verified ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                {userDetails?.is_verified ? <CheckCircle size={18} /> : <XCircle size={18} />}
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] uppercase tracking-widest font-bold text-text-muted mb-1">Verification Status</p>
                                <p className={`text-sm font-bold ${userDetails?.is_verified ? 'text-blue-600' : 'text-amber-600'}`}>
                                    {userDetails?.is_verified ? 'Verified' : 'Not Verified'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;
