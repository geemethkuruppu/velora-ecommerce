import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
    return (
        <footer className="bg-neutral-900 border-t border-white/10 pt-20 pb-10 text-white font-sans snap-start min-h-[50vh] flex flex-col justify-center">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <h2 className="text-3xl font-serif mb-6 tracking-widest">VELORA</h2>
                        <p className="text-white/40 text-sm leading-relaxed">
                            Redefining luxury digital commerce with an immersive, localized experience.
                        </p>
                    </div>

                    {/* Columns */}
                    <div>
                        <h4 className="uppercase tracking-widest text-xs font-medium mb-6 text-white/60">Shop</h4>
                        <ul className="space-y-4 text-sm text-white/50">
                            <li className="hover:text-white transition-colors cursor-pointer">Womenswear</li>
                            <li className="hover:text-white transition-colors cursor-pointer">Menswear</li>
                            <li className="hover:text-white transition-colors cursor-pointer">Kidswear</li>
                            <li className="hover:text-white transition-colors cursor-pointer">New Arrivals</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="uppercase tracking-widest text-xs font-medium mb-6 text-white/60">Support</h4>
                        <ul className="space-y-4 text-sm text-white/50">
                            <li className="hover:text-white transition-colors cursor-pointer">Contact Us</li>
                            <li className="hover:text-white transition-colors cursor-pointer">Shipping & Returns</li>
                            <li className="hover:text-white transition-colors cursor-pointer">FAQ</li>
                            <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="uppercase tracking-widest text-xs font-medium mb-6 text-white/60">Newsletter</h4>
                        <div className="flex border-b border-white/20 pb-2">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="bg-transparent w-full outline-none text-sm placeholder-white/30 text-white"
                            />
                            <button className="uppercase text-xs tracking-widest text-white/60 hover:text-white transition-colors">
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/30">
                    <p>&copy; 2026 VELORA. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <span className="cursor-pointer hover:text-white/50">Instagram</span>
                        <span className="cursor-pointer hover:text-white/50">Twitter</span>
                        <span className="cursor-pointer hover:text-white/50">Pinterest</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
