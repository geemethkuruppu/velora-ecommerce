import React from 'react';
import { Shield, Key, UserX, UserPlus, Mail, Clock } from 'lucide-react';

const mockAdmins = [
    { id: 1, name: 'Main Administrator', email: 'admin@velora.com', role: 'SUPER_ADMIN', lastActive: 'Currently Online' },
    { id: 2, name: 'Sarah Chen', email: 'sarah.j@velora.com', role: 'MANAGER', lastActive: '2 hours ago' },
    { id: 3, name: 'Marcus Thorne', email: 'm.thorne@velora.com', role: 'ADMIN', lastActive: 'Last active yesterday' },
];

const Admins = () => {
    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-[1.8rem] font-bold text-text-main tracking-tight">Internal Governance</h1>
                    <p className="text-text-dim text-sm mt-2">Manage administrative access and system permissions.</p>
                </div>
                <button className="primary-btn">
                    <UserPlus size={18} />
                    Invite Admin
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockAdmins.map(admin => (
                    <div key={admin.id} className="glass-card flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-xl bg-dark-hover border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all font-bold">
                                {admin.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-extrabold tracking-widest ${admin.role === 'SUPER_ADMIN' ? 'bg-primary/20 text-primary border border-primary/30' :
                                    'bg-white/5 text-text-dim border border-white/10'
                                }`}>
                                {admin.role}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-text-main">{admin.name}</h3>
                            <div className="flex items-center gap-2 mt-1 text-text-muted">
                                <Mail size={14} />
                                <span className="text-sm font-medium">{admin.email}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 py-4 border-t border-border mt-2">
                            <Clock size={14} className="text-emerald-400" />
                            <span className="text-[0.8rem] text-emerald-400 font-semibold">{admin.lastActive}</span>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-dark-hover border border-border text-xs font-bold text-text-dim hover:text-text-main hover:border-white/20 transition-all">
                                <Key size={14} />
                                Keys
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all">
                                <UserX size={14} />
                                Revoke
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card mt-4 border-dashed border-primary/20 bg-primary/2">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-text-main">Audit Logs</h4>
                        <p className="text-xs text-text-muted mt-0.5">All administrative actions are logged and encrypted for security verification.</p>
                    </div>
                    <button className="ml-auto text-xs font-extrabold text-primary uppercase tracking-widest hover:underline">View History</button>
                </div>
            </div>
        </div>
    );
};

export default Admins;
