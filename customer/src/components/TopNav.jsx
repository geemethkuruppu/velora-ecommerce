import React, { useState } from 'react';
import { Search, Menu, User, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import MenuDrawer from './MenuDrawer';

const TopNav = ({ isVisible }) => {
    const { user } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleUserClick = () => {
        if (!user) {
            navigate('/login');
        } else {
            navigate('/profile');
        }
    };

    // Generate initials from user data
    const getInitials = () => {
        if (!user) return '';
        if (user.full_name) {
            return user.full_name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
        }
        return user.email.substring(0, 2).toUpperCase();
    };

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
                    {/* Left - Contact Us */}
                    <div className="flex-1">
                        <button className="text-sm uppercase tracking-wider text-gray-700 hover:text-gray-900 transition-colors">
                            Contact Us
                        </button>
                    </div>

                    {/* Center - Brand Name */}
                    <div className="flex-1 flex justify-center">
                        <Link to="/" className="text-2xl md:text-3xl font-serif tracking-[0.3em] text-gray-900 hover:opacity-80 transition-opacity">
                            VELORA
                        </Link>
                    </div>

                    {/* Right - Icons */}
                    <div className="flex-1 flex justify-end items-center gap-4">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Search className="w-5 h-5 text-gray-700" />
                        </button>

                        {/* Shopping Bag with Badge */}
                        <Link
                            to="/my-cart"
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                            title="Shopping Bag"
                        >
                            <ShoppingBag className="w-5 h-5 text-gray-700" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {itemCount > 9 ? '9+' : itemCount}
                                </span>
                            )}
                        </Link>

                        <button
                            onClick={handleUserClick}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                            title={user ? 'View Profile' : 'Login'}
                        >
                            {user ? (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center text-xs font-serif">
                                    {getInitials()}
                                </div>
                            ) : (
                                <User className="w-5 h-5 text-gray-700" />
                            )}
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Menu className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                </div>
            </nav>

            <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    );
};

export default TopNav;
