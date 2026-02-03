import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Shield, User as UserIcon, Trash2 } from 'lucide-react';

const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'CUSTOMER', status: 'ACTIVE', lastLogin: '2 hours ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN', status: 'ACTIVE', lastLogin: '10 mins ago' },
    { id: 3, name: 'Robert Brown', email: 'robert@example.com', role: 'CUSTOMER', status: 'INACTIVE', lastLogin: '3 days ago' },
    { id: 4, name: 'Alice Wilson', email: 'alice@example.com', role: 'CUSTOMER', status: 'ACTIVE', lastLogin: '1 hour ago' },
    { id: 5, name: 'Michael Scott', email: 'michael@dundermifflin.com', role: 'MANAGER', status: 'ACTIVE', lastLogin: 'Just now' },
];

const Users = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-[1.8rem] font-bold text-text-main">Users Management</h1>
                    <p className="text-text-dim text-sm mt-2">Manage and monitor system users and their roles.</p>
                </div>
                <div className="flex gap-4">
                    <button className="primary-btn">Add New User</button>
                </div>
            </header>

            <div className="glass-card !p-0 overflow-hidden">
                <div className="p-6 flex justify-between items-center border-b border-border">
                    <div className="flex items-center bg-dark-hover border border-border px-4 py-2.5 rounded-md w-[350px] gap-3">
                        <Search size={18} className="text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none text-text-main w-full focus:outline-none text-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md text-text-dim hover:border-primary hover:text-primary transition-all duration-200">
                        <Filter size={18} />
                        <span className="text-sm">Filter</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="px-6 py-4 text-text-muted text-[0.75rem] font-semibold uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-text-muted text-[0.75rem] font-semibold uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-text-muted text-[0.75rem] font-semibold uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-text-muted text-[0.75rem] font-semibold uppercase tracking-wider">Last Login</th>
                                <th className="px-6 py-4 text-text-muted text-[0.75rem] font-semibold uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockUsers.map(user => (
                                <tr key={user.id} className="border-b border-border hover:bg-dark-hover/50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 bg-dark-hover border border-border rounded-full flex items-center justify-center text-primary">
                                                {user.role === 'ADMIN' ? <Shield size={16} /> : <UserIcon size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-text-main">{user.name}</p>
                                                <p className="text-[0.8rem] text-text-muted">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2.5 py-1 rounded text-[0.75rem] font-semibold ${user.role === 'ADMIN' ? 'bg-primary/10 text-primary' :
                                            user.role === 'MANAGER' ? 'bg-success/10 text-success' : 'bg-text-dim/10 text-text-dim'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2.5 py-1 rounded text-[0.75rem] font-semibold ${user.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-text-muted/10 text-text-muted'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-text-dim">{user.lastLogin}</td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 rounded hover:bg-dark-hover text-text-dim hover:text-text-main transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                            <button className="p-2 rounded hover:bg-red-500/10 text-text-dim hover:text-red-500 transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
