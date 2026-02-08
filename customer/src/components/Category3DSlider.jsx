import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import productService from '../services/productService';

// Import images (fallback)
import productDress from '../assets/images/product-dress-1.png';
import productCoat from '../assets/images/product-coat-2.png';
import productHandbag from '../assets/images/product-handbag-3.png';
import handbagsImg from '../assets/images/handbags.png';
import shoesImg from '../assets/images/shoes.png';
import jewelryImg from '../assets/images/jewelry.png';

const fallbackImages = [productDress, handbagsImg, jewelryImg, shoesImg, productCoat, productHandbag];

const Category3DSlider = ({ department = 'Womenswear', onCategorySelect }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(2);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const lastScrollTime = useRef(0);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const data = await productService.getCategories(department);
                const categoriesWithImages = data.map((cat, idx) => ({
                    id: cat.id,
                    name: cat.name,
                    image: cat.image_url || fallbackImages[idx % fallbackImages.length]
                }));
                setCategories(categoriesWithImages);
            } catch (error) {
                console.error('Failed to load categories:', error);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, [department]);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % categories.length);
        }, 3000); // Change every 3 seconds

        return () => clearInterval(interval);
    }, [isPaused, categories.length]);

    const handleCategoryClick = (index, cat) => {
        if (activeIndex === index) {
            // Toggle selection if clicking the center/active card
            const newSelection = selectedCategoryId === cat.id ? null : cat.id;
            setSelectedCategoryId(newSelection);
            if (onCategorySelect) onCategorySelect(newSelection);
        } else {
            // Just move to card if not active
            setActiveIndex(index);
        }
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % categories.length);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + categories.length) % categories.length);
    };

    // Helper to calculate circular distance
    const getCircularDistance = (index) => {
        const len = categories.length;
        let dist = index - activeIndex;
        if (dist > len / 2) dist -= len;
        if (dist < -len / 2) dist += len;
        return dist;
    };

    return (
        <div className="w-full py-24 overflow-hidden relative bg-transparent perspective-[2000px]">
            <div className="text-center mb-16 relative z-10">
                <h2 className="text-4xl font-serif text-gray-900 tracking-[0.2em] drop-shadow-sm">CATEGORIES</h2>
                <div className="w-20 h-1 bg-gray-900 mx-auto mt-4 rounded-full" />
            </div>

            <div className="relative h-[500px] flex items-center justify-center max-w-[1400px] mx-auto z-20">
                {/* Cards Container */}
                <div
                    className="relative w-full h-full flex justify-center items-center perspective-[3000px] transform-style-3d cursor-grab active:cursor-grabbing"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onWheel={(e) => {
                        const now = Date.now();
                        if (now - lastScrollTime.current < 500) return; // Throttle 500ms

                        if (Math.abs(e.deltaX) > 20) {
                            lastScrollTime.current = now;
                            setIsPaused(true); // Pause auto-rotation
                            if (e.deltaX > 0) handleNext();
                            else handlePrev();
                        }
                    }}
                    // Drag logic for the entire container to detect swipes
                    onPointerDown={(e) => {
                        const startX = e.clientX;
                        const handlePointerUp = (upEvent) => {
                            const endX = upEvent.clientX;
                            const diff = startX - endX;
                            if (Math.abs(diff) > 50) { // Threshold
                                if (diff > 0) handleNext();
                                else handlePrev();
                            }
                            window.removeEventListener('pointerup', handlePointerUp);
                        };
                        window.addEventListener('pointerup', handlePointerUp);
                    }}
                >
                    {categories.map((cat, index) => {
                        const dist = getCircularDistance(index);
                        const absDist = Math.abs(dist);

                        // Enhanced 3D Logic
                        const isActive = dist === 0;
                        const xOffset = dist * 260; // Spread factor
                        const scale = isActive ? 1 : Math.max(0.7, 1 - absDist * 0.15); // Smooth scaling
                        const rotateY = dist * -25; // Rotation towards center
                        const zIndex = 100 - absDist;
                        const opacity = isActive ? 1 : Math.max(0.3, 0.8 - absDist * 0.2);
                        const brightness = isActive ? 1 : Math.max(0.5, 0.8 - absDist * 0.1);

                        // Only render reasonable neighbors
                        if (absDist > 2) return null;

                        return (
                            <motion.div
                                key={cat.id}
                                layout
                                initial={false}
                                animate={{
                                    x: xOffset,
                                    scale: scale,
                                    opacity: opacity,
                                    rotateY: rotateY,
                                    zIndex: zIndex,
                                    filter: `brightness(${brightness}) blur(${isActive ? 0 : absDist * 2}px)`
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 150,
                                    damping: 20,
                                    mass: 1
                                }}
                                className="absolute w-[300px] md:w-[350px] aspect-[3/4] rounded-3xl cursor-pointer"
                                style={{
                                    transformStyle: 'preserve-3d',
                                    boxShadow: isActive ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none',
                                }}
                                onClick={() => handleCategoryClick(index, cat)}
                            >
                                <div className={`relative w-full h-full rounded-3xl overflow-hidden border-4 ${selectedCategoryId === cat.id ? 'border-primary' : 'border-white'} bg-white transition-all duration-300`}>
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Glassmorphism Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                                        <h3 className="text-white text-3xl font-serif tracking-wide drop-shadow-md transform translate-y-0 transition-transform duration-500 delay-100">
                                            {cat.name}
                                        </h3>
                                        <div className="mt-4 px-6 py-2 bg-white/20 backdrop-blur-md border border-white/50 text-white text-xs uppercase tracking-[0.2em] rounded-sm hover:bg-white hover:text-gray-900 transition-all w-fit">
                                            {selectedCategoryId === cat.id ? 'Selected' : 'View Collection'}
                                        </div>
                                    </div>

                                </div>

                                {/* Reflection Effect */}
                                <div
                                    className="absolute top-full left-0 right-0 h-full transform scale-y-[-1] opacity-30 origin-top pointer-events-none"
                                    style={{
                                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))',
                                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))'
                                    }}
                                >
                                    <img
                                        src={cat.image}
                                        alt=""
                                        className="w-full h-full object-cover rounded-3xl blur-[2px]"
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Pagination Line */}
            <div className="flex justify-center items-center gap-3 mt-12">
                {categories.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`h-1 rounded-full transition-all duration-500 ${idx === activeIndex ? 'bg-gray-900 w-12' : 'bg-gray-300 w-4 hover:bg-gray-400'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Category3DSlider;
