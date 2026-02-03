import React from 'react';
import heroVideo from '../assets/video/Video Fashion Ads.  Passa Silkwear - KUEDEE CREATIVE PRODUCTION (720p, h264).mp4';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const LandingViewSection = () => {
    return (
        <div className="relative w-full h-screen overflow-hidden snap-start">
            {/* Background Video */}
            <video
                className="absolute top-0 left-0 w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src={heroVideo} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-black/60"></div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full">
                <motion.h1
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                        delay: 4,
                        duration: 1.5,
                        ease: "easeOut"
                    }}
                    className="text-white font-bold tracking-widest text-5xl md:text-7xl lg:text-9xl"
                >
                    VELORA
                </motion.h1>
            </div>

            {/* Animated Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5.5, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
            >
                <span className="text-white text-xs uppercase tracking-widest">Scroll</span>
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <ChevronDown className="w-6 h-6 text-white" />
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LandingViewSection;
