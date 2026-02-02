import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CategorySection = ({ category, index }) => {
    const navigate = useNavigate();

    // Choose a color theme based on index for variety
    const themes = [
        { bg: 'bg-[#FDF2F0]', text: 'text-gray-900', accent: 'border-gray-900', hover: 'hover:bg-gray-900 hover:text-white' },
        { bg: 'bg-[#F0F4FD]', text: 'text-gray-900', accent: 'border-gray-900', hover: 'hover:bg-gray-900 hover:text-white' },
        { bg: 'bg-[#F3FDF0]', text: 'text-gray-900', accent: 'border-gray-900', hover: 'hover:bg-gray-900 hover:text-white' },
        { bg: 'bg-[#FDF0FD]', text: 'text-gray-900', accent: 'border-gray-900', hover: 'hover:bg-gray-900 hover:text-white' },
    ];

    const theme = themes[index % themes.length];

    return (
        <section className={`relative w-full h-full snap-start overflow-hidden ${theme.bg} flex flex-col md:flex-row items-center justify-between px-6 md:px-24 py-20`}>
            {/* Left Content Side */}
            <div className="w-full md:w-1/2 flex flex-col items-start gap-8 z-10 order-2 md:order-1">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className="text-xs uppercase tracking-[0.5em] font-medium opacity-60">Featured Category</span>
                    <h2 className={`text-5xl md:text-7xl font-serif ${theme.text} tracking-tight mt-2 mb-6 uppercase`}>
                        {category.name}
                    </h2>
                    <p className={`max-w-md text-lg italic opacity-70 ${theme.text} leading-relaxed`}>
                        {category.description || `Discover our exclusive ${category.name} collection, crafted with timeless elegance and modern sophistication.`}
                    </p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    onClick={() => navigate(`/${category.department.toLowerCase()}`)}
                    className={`px-10 py-4 border-2 ${theme.accent} ${theme.text} ${theme.hover} text-xs uppercase tracking-[0.3em] font-bold transition-all duration-500 rounded-sm`}
                >
                    Explore Collection
                </motion.button>
            </div>

            {/* Right Image Side */}
            <div className="w-full md:w-1/2 h-full relative flex items-center justify-center order-1 md:order-2">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                    whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="relative w-[100%] aspect-[3/2] rounded-3xl overflow-hidden shadow-2xl border-8 border-white"
                >
                    <img
                        src={category.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop'}
                        alt={category.name}
                        className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                    />

                    {/* Floating Decorative Element */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
                </motion.div>

                {/* Decorative Background Text */}
                <span className="absolute -right-20 top-1/2 -translate-y-1/2 text-[200px] font-serif opacity-[0.03] select-none pointer-events-none -rotate-90 whitespace-nowrap">
                    VELORA LUXURY
                </span>
            </div>
        </section>
    );
};

export default CategorySection;
