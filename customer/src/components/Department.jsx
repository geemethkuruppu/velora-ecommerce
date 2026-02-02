import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import departmentImg from '../assets/images/depertment.png';

const departments = [
    {
        id: 1,
        name: 'Womenswear',
        slogan: 'Elegance Redefined',
        position: 'left-[8%]', // Position for left arch
        route: '/womenswear'
    },
    {
        id: 2,
        name: 'Menswear',
        slogan: 'Timeless Sophistication',
        position: 'left-[38%]', // Moved more to the left
        route: '/menswear'
    },
    {
        id: 3,
        name: 'Kidswear',
        slogan: 'Playful Luxury',
        position: 'right-[8%]', // Right arch
        route: '/kidswear'
    }
];

const Department = () => {
    const navigate = useNavigate();

    return (
        <section className="relative w-full h-full snap-start overflow-hidden">
            {/* Background Image */}
            <img
                src={departmentImg}
                alt="Departments"
                className="absolute inset-0 w-full h-full object-cover object-bottom"
            />

            {/* Overlay Content for Each Arch */}
            <div className="absolute inset-0 flex items-end justify-center pb-[8%]">
                {departments.map((dept, index) => (
                    <motion.div
                        key={dept.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2, duration: 0.8 }}
                        className={`absolute ${dept.position} w-[25%] group cursor-pointer`}
                    >
                        {/* Content Container */}
                        <div className="relative flex flex-col items-center text-center gap-3">
                            {/* Department Name */}
                            <motion.h2
                                className="text-2xl md:text-3xl font-serif text-white tracking-widest uppercase group-hover:scale-105 transition-transform duration-300"
                            >
                                {dept.name}
                            </motion.h2>

                            {/* Slogan - appears on hover */}
                            <p className="text-sm text-white/80 italic overflow-hidden opacity-0 h-0 group-hover:opacity-100 group-hover:h-auto transition-all duration-300">
                                {dept.slogan}
                            </p>

                            {/* View Collection Button - appears on hover */}
                            <button
                                onClick={() => navigate(dept.route)}
                                className="px-6 py-2 border-2 border-white text-white text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-gray-900 transition-all duration-300 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
                            >
                                View Collection
                            </button>

                            {/* Decorative underline animation */}
                            <motion.div
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[2px] bg-white"
                                initial={{ width: 0 }}
                                whileHover={{ width: '100%' }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Department;
