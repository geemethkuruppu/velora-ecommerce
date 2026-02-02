import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopNav from '../components/TopNav';
import ProductArchCard from '../components/ProductArchCard';
import Category3DSlider from '../components/Category3DSlider';
import Footer from '../components/Footer';
import productService from '../services/productService';
import heroImage from '../assets/images/womenswear-hero.jpg';

const Womenswear = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const fetchProducts = async (categoryId = null) => {
        try {
            setLoading(true);
            const data = await productService.getProducts({
                department: 'Womenswear',
                category_id: categoryId
            });
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch womenswear products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleCategorySelect = (categoryId) => {
        setSelectedCategory(categoryId);
        fetchProducts(categoryId);
    };

    // ... (rest of the component)
    return (
        <div className="min-h-screen bg-[#FDF2F0]">
            <TopNav isVisible={true} />

            {/* Hero Section - Full Screen */}
            <div className="relative h-screen w-full overflow-hidden">
                <img
                    src={heroImage}
                    alt="Womenswear Collection"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Hero Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="text-5xl md:text-7xl font-serif tracking-widest mb-4"
                    >
                        WOMENSWEAR
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="text-xl md:text-2xl italic"
                    >
                        Elegance Redefined
                    </motion.p>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="absolute bottom-12 flex flex-col items-center gap-2"
                    >
                        <span className="text-white text-xs uppercase tracking-widest">Explore</span>
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2"
                        >
                            <div className="w-1 h-2 bg-white rounded-full" />
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* 3D Category Slider Section */}
            <Category3DSlider
                department="Womenswear"
                onCategorySelect={handleCategorySelect}
            />

            {/* Products Section */}
            <div className="py-16 px-6 md:px-12 max-w-7xl mx-auto min-h-[400px]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-serif text-gray-900 tracking-wider mb-4">
                        {selectedCategory ? 'Category Collection' : 'Featured Collection'}
                    </h2>
                    <p className="text-gray-600 text-lg">
                        {loading ? 'Refreshing collection...' : 'Discover our curated selection of luxury pieces'}
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-gray-900/10 border-t-gray-900 rounded-full animate-spin" />
                    </div>
                ) : products.length > 0 ? (
                    /* Product Grid - 3 Arches per Row */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {products.map((product, index) => (
                            <ProductArchCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-400 font-serif italic text-xl">No products found in this selection.</p>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Womenswear;
