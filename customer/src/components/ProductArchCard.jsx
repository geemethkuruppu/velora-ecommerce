import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LoginModal from './LoginModal';
import toast, { Toaster } from 'react-hot-toast';

const ProductArchCard = ({ product, index }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart, mergeCart } = useCart();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingProduct, setPendingProduct] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToBag = async () => {
        if (!isAuthenticated) {
            // Show login modal with pending product
            setPendingProduct(product);
            setShowLoginModal(true);
            return;
        }

        // Add to cart
        try {
            setIsAdding(true);
            await addToCart(product.id, 1, null, {
                name: product.name,
                base_price: product.base_price,
                image: product.image
            });
            toast.success(`${product.name} added to bag!`, {
                duration: 3000,
                position: 'bottom-right',
                style: {
                    background: '#10B981',
                    color: '#fff',
                    padding: '16px',
                    borderRadius: '8px'
                }
            });
        } catch (error) {
            toast.error('Failed to add to bag', {
                duration: 3000,
                position: 'bottom-right'
            });
        } finally {
            setIsAdding(false);
        }
    };

    const handleLoginSuccess = async () => {
        // Merge guest cart with backend
        await mergeCart();

        // Add pending product if exists
        if (pendingProduct) {
            try {
                await addToCart(pendingProduct.id, 1, null, {
                    name: pendingProduct.name,
                    base_price: pendingProduct.base_price,
                    image: pendingProduct.image
                });
                toast.success(`${pendingProduct.name} added to bag!`, {
                    duration: 3000,
                    position: 'bottom-right',
                    style: {
                        background: '#10B981',
                        color: '#fff',
                        padding: '16px',
                        borderRadius: '8px'
                    }
                });
                setPendingProduct(null);
            } catch (error) {
                toast.error('Failed to add to bag');
            }
        }
    };

    return (
        <>
            <Toaster />
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => {
                    setShowLoginModal(false);
                    setPendingProduct(null);
                }}
                onLoginSuccess={handleLoginSuccess}
                pendingProduct={pendingProduct}
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group cursor-pointer flex flex-col items-center"
                onClick={() => navigate(`/product/${product.id}`)}
            >
                {/* Arch Niche Container - The Wall Cutout */}
                <div className="relative w-full aspect-[3/4] rounded-t-[100px] bg-gray-200 shadow-[inset_0_10px_20px_rgba(0,0,0,0.2)] z-10 overflow-hidden">

                    {/* Inner Shadow Layer for Depth */}
                    <div className="absolute inset-0 shadow-[inset_0_15px_30px_rgba(0,0,0,0.15),inset_0_-10px_20px_rgba(255,255,255,0.8)] pointer-events-none z-20 rounded-t-[100px]" />

                    {/* Product Image Container - Slightly recessed */}
                    <div className="absolute inset-2 top-4 rounded-t-[90px] overflow-hidden bg-white shadow-sm">
                        <img
                            src={product.image || product.media?.find(m => m.is_primary)?.media_url || product.media?.[0]?.media_url}
                            alt={product.name}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>


                    {/* Add to Bag Button - Floating */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToBag();
                        }}
                        disabled={isAdding}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 hover:bg-white shadow-lg translate-y-4 group-hover:translate-y-[-50%] flex items-center gap-2 disabled:opacity-50"
                    >
                        {isAdding ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="w-4 h-4" />
                                Add to Bag
                            </>
                        )}
                    </button>
                </div>

                {/* Pedestal Base - 3D Steps Effect */}
                <div className="relative w-[110%] z-30 -mt-2">
                    {/* Top Step */}
                    <div className="h-2 w-[90%] mx-auto bg-gray-100 shadow-md rounded-sm border-t border-white/50" />
                    {/* Middle Step */}
                    <div className="h-3 w-[95%] mx-auto bg-white shadow-lg rounded-sm border-t border-white" />
                    {/* Bottom Base */}
                    <div className="w-full bg-white shadow-xl rounded-sm pt-4 pb-6 px-4 text-center border-t border-gray-50">
                        <h3 className="text-gray-900 font-serif text-lg mb-1 group-hover:text-[#4A3B69] transition-colors">
                            {product.name}
                        </h3>
                        <p className="text-gray-500 tracking-wider text-sm font-medium">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD' }).format(product.base_price)}
                        </p>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default ProductArchCard;
