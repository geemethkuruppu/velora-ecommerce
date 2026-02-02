import React, { useState, useEffect, useRef } from 'react';
import LandingViewSection from '../components/LandingViewSection';
import Department from '../components/Department';
import CategorySection from '../components/CategorySection';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';
import productService from '../services/productService';

// Import images for fallback
import handbagsImg from '../assets/images/handbags.png';
import shoesImg from '../assets/images/shoes.png';
import jewelryImg from '../assets/images/jewelry.png';
import womenswearImg from '../assets/images/womens-wear.png';

const fallbackImages = [womenswearImg, handbagsImg, jewelryImg, shoesImg];

const Home = () => {
    const [showNav, setShowNav] = useState(false);
    const [categories, setCategories] = useState([]);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch all categories
                const allCategories = await productService.getCategories();

                // Filter categories to only show those under "Others" department
                const othersCategories = allCategories.filter(cat =>
                    cat.department?.toLowerCase() === 'others' ||
                    cat.department_name?.toLowerCase() === 'others'
                );

                // Map with fallback images if none provided
                const enriched = othersCategories.map((cat, idx) => ({
                    ...cat,
                    image: cat.image || fallbackImages[idx % fallbackImages.length]
                }));
                setCategories(enriched);
            } catch (error) {
                console.error('Failed to load categories for home:', error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (scrollContainerRef.current) {
                const scrollPosition = scrollContainerRef.current.scrollTop;
                const windowHeight = window.innerHeight;

                // Show TopNav when scrolled past 80% of first screen
                setShowNav(scrollPosition > windowHeight * 0.8);
            }
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return (
        <div
            ref={scrollContainerRef}
            className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        >
            <LandingViewSection />
            <TopNav isVisible={showNav} />
            <Department />

            {/* Display Categories one by one as sections */}
            {categories.map((category, index) => (
                <CategorySection key={category.id} category={category} index={index} />
            ))}

            <Footer />
        </div>
    );
};

export default Home;
