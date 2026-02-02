import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, LogIn, LogOut, ShoppingCart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MenuDrawer = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();

    const menuItems = [
        { name: 'Home', path: '/' },
        { name: 'Womenswear', path: '/womenswear' },
        { name: 'Menswear', path: '/menswear' },
        { name: 'Kidswear', path: '/kidswear' },
    ];

    const handleNavigation = (path) => {
        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        logout();
        onClose();
        navigate('/');
    };

    // Generate initials for avatar
    const initials = user?.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : user?.email.substring(0, 2).toUpperCase() || 'GK';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed top-0 right-0 h-full w-[80%] md:w-[25%] bg-white shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
                            <h2 className="text-xl font-serif tracking-widest text-gray-900">VELORA</h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* User Info (if logged in) */}
                        {isAuthenticated && user && (
                            <div className="px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-sm font-serif">
                                        {initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {user.full_name || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Menu Links */}
                        <div className="flex-1 overflow-y-auto py-8 px-6 space-y-6">
                            {menuItems.map((item, index) => (
                                <motion.button
                                    key={item.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => handleNavigation(item.path)}
                                    className="block w-full text-left text-lg font-serif text-gray-800 hover:text-[#4A3B69] hover:pl-2 transition-all duration-300"
                                >
                                    {item.name}
                                </motion.button>
                            ))}

                            {/* Divider */}
                            <div className="border-t border-gray-200 my-4" />

                            {/* Auth-related links */}
                            {isAuthenticated ? (
                                <>
                                    <motion.button
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: menuItems.length * 0.05 }}
                                        onClick={() => handleNavigation('/profile')}
                                        className="flex items-center gap-3 w-full text-left text-lg font-serif text-gray-800 hover:text-[#4A3B69] hover:pl-2 transition-all duration-300"
                                    >
                                        <User className="w-5 h-5" />
                                        Profile
                                    </motion.button>
                                    <motion.button
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (menuItems.length + 1) * 0.05 }}
                                        onClick={() => handleNavigation('/my-orders')}
                                        className="flex items-center gap-3 w-full text-left text-lg font-serif text-gray-800 hover:text-[#4A3B69] hover:pl-2 transition-all duration-300"
                                    >
                                        <Package className="w-5 h-5" />
                                        My Orders
                                    </motion.button>
                                    <motion.button
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (menuItems.length + 2) * 0.05 }}
                                        onClick={() => handleNavigation('/my-cart')}
                                        className="flex items-center gap-3 w-full text-left text-lg font-serif text-gray-800 hover:text-[#4A3B69] hover:pl-2 transition-all duration-300"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        My Cart
                                    </motion.button>
                                    <motion.button
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (menuItems.length + 3) * 0.05 }}
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full text-left text-lg font-serif text-gray-800 hover:text-red-600 hover:pl-2 transition-all duration-300"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Logout
                                    </motion.button>
                                </>
                            ) : (
                                <motion.button
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: menuItems.length * 0.05 }}
                                    onClick={() => handleNavigation('/login')}
                                    className="flex items-center gap-3 w-full text-left text-lg font-serif text-gray-800 hover:text-[#4A3B69] hover:pl-2 transition-all duration-300"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Login
                                </motion.button>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100">
                            <p className="text-xs text-center text-gray-400 uppercase tracking-widest">
                                © 2026 VELORA
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MenuDrawer;
