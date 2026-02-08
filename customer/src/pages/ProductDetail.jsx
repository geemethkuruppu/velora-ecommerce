import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Star, ChevronLeft, ChevronRight, Check, Info, ArrowLeft, Loader2, Heart } from 'lucide-react';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await productService.getById(id);
                setProduct(data);
                // Set default size if variants exist
                if (data.variants && data.variants.length > 0) {
                    setSelectedSize(data.variants[0]);
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
                toast.error('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const handleAddToBag = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to bag');
            navigate('/login');
            return;
        }

        if (!selectedSize) {
            toast.error('Please select a size');
            return;
        }

        try {
            setIsAdding(true);
            await addToCart(product.id, 1, selectedSize.id, {
                name: product.name,
                base_price: product.base_price,
                image: product.media?.find(m => m.is_primary)?.media_url || product.media?.[0]?.media_url,
                variant: selectedSize
            });
            toast.success(`${product.name} added to your bag!`);
        } catch (error) {
            toast.error('Failed to add to bag');
        } finally {
            setIsAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-gray-900/10 border-t-gray-900 rounded-full"
                />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <h2 className="text-2xl font-serif mb-4">Product Not Found</h2>
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-900 underline">Go Back</button>
            </div>
        );
    }

    const primaryImage = product.media?.find(m => m.is_primary)?.media_url || product.media?.[0]?.media_url;
    const gallery = product.media || [];

    return (
        <div className="min-h-screen bg-[#FDFDFD]">
            <Toaster />
            <TopNav isVisible={true} />

            <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 mb-12 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                    <button onClick={() => navigate('/')} className="hover:text-gray-900 transition-colors">Home</button>
                    <span>/</span>
                    <button onClick={() => navigate(`/${product.type?.category?.department?.toLowerCase()}`)} className="hover:text-gray-900 transition-colors">{product.type?.category?.department}</button>
                    <span>/</span>
                    <span className="text-gray-900 font-bold">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left: Gallery Section */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative aspect-[4/5] bg-gray-50 rounded-[40px] overflow-hidden group">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={selectedImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    src={gallery[selectedImage]?.media_url || primaryImage}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>

                            {/* Navigation Arrows */}
                            {gallery.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setSelectedImage((prev) => (prev - 1 + gallery.length) % gallery.length)}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-900 opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedImage((prev) => (prev + 1) % gallery.length)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-900 opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {gallery.map((media, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`relative min-w-[100px] aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-gray-900 scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={media.media_url} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="lg:col-span-5 flex flex-col pt-4">
                        <div className="space-y-2 mb-8">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold block">
                                {product.brand || 'VELORA EXCLUSIVE'}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tight leading-tight">
                                {product.name}
                            </h1>
                            <p className="text-2xl font-light text-gray-600 mt-4">
                                ${product.base_price?.toLocaleString()}
                            </p>
                        </div>

                        <div className="h-px bg-gray-100 w-full mb-10" />

                        {/* Size Selection */}
                        <div className="space-y-6 mb-10">
                            <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
                                <span>Select Size</span>
                                <button className="text-gray-400 hover:text-gray-900 underline underline-offset-4">Size Guide</button>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {product.variants?.map((variant) => (
                                    <button
                                        key={variant.id}
                                        onClick={() => setSelectedSize(variant)}
                                        className={`py-4 rounded-xl text-xs font-bold transition-all border-2 ${selectedSize?.id === variant.id ? 'bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-900/10 scale-105' : 'bg-white text-gray-900 border-gray-100 hover:border-gray-300'}`}
                                    >
                                        {variant.size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mb-12">
                            <button
                                onClick={handleAddToBag}
                                disabled={isAdding}
                                className="flex-1 h-16 bg-gray-900 text-white text-xs uppercase tracking-[0.3em] font-bold rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl shadow-gray-900/20 disabled:opacity-70"
                            >
                                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag size={20} />}
                                {isAdding ? 'Adding...' : 'Add to Bag'}
                            </button>
                            <button className="w-16 h-16 rounded-2xl border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 transition-all hover:bg-red-50">
                                <Heart size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 mb-8">
                            {['description', 'specifications'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 px-6 text-[10px] uppercase tracking-widest font-bold transition-all relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1">
                            {activeTab === 'description' ? (
                                <div className="space-y-6 text-gray-600 leading-relaxed text-sm italic font-serif">
                                    <p>{product.description || 'Crafted with precision and an unwavering commitment to luxury, this piece embodies the Velora philosophy of timeless elegance and modern sophistication.'}</p>
                                    <ul className="space-y-3 not-italic font-sans text-xs text-gray-500">
                                        <li className="flex gap-3"><Check size={14} className="text-green-500 flex-shrink-0" /> Premium Sustainable Materials</li>
                                        <li className="flex gap-3"><Check size={14} className="text-green-500 flex-shrink-0" /> Hand-finished Details</li>
                                        <li className="flex gap-3"><Check size={14} className="text-green-500 flex-shrink-0" /> Limited Edition Release</li>
                                    </ul>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {product.specifications?.map((spec, i) => (
                                        <div key={i} className="flex justify-between py-3 border-b border-gray-50">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-sans">{spec.spec_key}</span>
                                            <span className="text-xs font-semibold text-gray-900 font-sans">{spec.spec_value}</span>
                                        </div>
                                    ))}
                                    {(!product.specifications || product.specifications.length === 0) && (
                                        <p className="text-xs text-gray-400 italic">No specific details listed.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Extra info */}
                        <div className="mt-12 p-6 bg-gray-50 rounded-3xl flex items-start gap-4 border border-gray-100">
                            <Info size={18} className="text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-[10px] uppercase font-bold text-gray-900 tracking-wider mb-1">Velora Care Assurance</p>
                                <p className="text-xs text-gray-500 leading-relaxed">Complementary white-glove shipping and 30-day returns on all boutique items.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProductDetail;
