import React from 'react';
import { ArrowUpRight, Search, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const bookings = [
    { id: '#1223', name: 'Alex Trie', email: 'Alex08@gmail.com', roomNo: 'S-01', type: 'Single', checkIn: 'Jan 21, 2025', checkOut: 'Jan 26, 2025', status: 'New', avatar: 'https://i.pravatar.cc/150?u=alex' },
    { id: '#1224', name: 'Annette Black', email: 'Ann23@gmail.com', roomNo: 'S-22', type: 'Single', checkIn: 'Jan 8, 2025', checkOut: 'Jan 12, 2025', status: 'Checked in', avatar: 'https://i.pravatar.cc/150?u=annette' },
    { id: '#1221', name: 'Jerome Bell', email: 'JB002@gmail.com', roomNo: 'D-08', type: 'Double', checkIn: 'Jan 23, 2025', checkOut: 'Jan 25, 2025', status: 'Cancelled', avatar: 'https://i.pravatar.cc/150?u=jerome' },
    { id: '#1218', name: 'Jenny Wilson', email: 'Wilson77@gmail.com', roomNo: 'D-05', type: 'Double', checkIn: 'Jan 27, 2025', checkOut: 'Jan 28, 2025', status: 'Checked Out', avatar: 'https://i.pravatar.cc/150?u=jenny' },
    { id: '#1217', name: 'Kristin Watson', email: 'Kris09@gmail.com', roomNo: 'D-02', type: 'Deluxe', checkIn: 'Jan 7, 2025', checkOut: 'Jan 20, 2025', status: 'Cancelled', avatar: 'https://i.pravatar.cc/150?u=kristin' },
    { id: '#1216', name: 'Kris Brown', email: 'Kris08@gmail.com', roomNo: 'D-02', type: 'Deluxe', checkIn: 'Jan 7, 2025', checkOut: 'Jan 20, 2025', status: 'Checked Out', avatar: 'https://i.pravatar.cc/150?u=kris' },
];

const StatusBadge = ({ status }) => {
    const styles = {
        'New': 'bg-violet-100 text-violet-600',
        'Checked in': 'bg-amber-100 text-amber-600',
        'Cancelled': 'bg-red-100 text-red-600',
        'Checked Out': 'bg-blue-100 text-blue-600',
    };
    return (
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

const BookingTable = () => {
    return (
        <div className="bg-white rounded-[32px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-black/5">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-primary tracking-tight">New booking</h3>
                    <p className="text-text-muted text-[10px] font-medium mt-0.5">Recent guest reservations list</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-black/5 rounded-lg text-[10px] font-bold text-primary cursor-pointer hover:bg-gray-100 transition-all">
                        Today <ChevronDown size={12} />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b border-black/5">
                            <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Booking ID</th>
                            <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Guest name</th>
                            <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Room No.</th>
                            <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Type</th>
                            <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Check In</th>
                            <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Check Out</th>
                            <th className="pb-4 text-[9px] uppercase tracking-widest font-bold text-text-muted">Status</th>
                            <th className="pb-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {bookings.map((booking, idx) => (
                            <motion.tr
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group hover:bg-gray-50/50 transition-all"
                            >
                                <td className="py-4 text-xs font-bold text-primary tracking-tight">{booking.id}</td>
                                <td className="py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={booking.avatar} alt="" className="w-8 h-8 rounded-full border border-white shadow-sm" />
                                        <div>
                                            <p className="text-xs font-bold text-primary tracking-tight">{booking.name}</p>
                                            <p className="text-[9px] text-text-muted font-medium">{booking.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 text-xs font-bold text-primary">{booking.roomNo}</td>
                                <td className="py-4 text-xs font-medium text-text-dim">{booking.type}</td>
                                <td className="py-4 text-xs font-bold text-primary">{booking.checkIn}</td>
                                <td className="py-4 text-xs font-bold text-primary">{booking.checkOut}</td>
                                <td className="py-4">
                                    <StatusBadge status={booking.status} />
                                </td>
                                <td className="py-4 text-right">
                                    <button className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-primary border border-black/5 hover:bg-primary hover:text-white transition-all">
                                        <ArrowUpRight size={14} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookingTable;
