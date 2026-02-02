import React from 'react';

const Loading = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative w-32 h-32 perspective-1000">
                <div className="absolute w-full h-full transform-style-3d animate-spin-slow">
                    <div className="absolute inset-0 border-2 border-accent/30 rounded-full transform translate-z-10 rotate-x-45 animate-pulse-slow"></div>
                    <div className="absolute inset-2 border-2 border-accent/60 rounded-full transform translate-z-20 rotate-y-45"></div>
                    <div className="absolute inset-4 border-2 border-white/20 rounded-full transform translate-z-30 rotate-x-120"></div>

                    <div className="absolute inset-0 flex items-center justify-center transform-style-3d animate-reverse-spin">
                        <div className="w-4 h-4 bg-accent rounded-full shadow-[0_0_20px_rgba(212,175,55,0.8)] animate-pulse"></div>
                    </div>
                </div>

                <div className="absolute -bottom-12 w-full text-center">
                    <span className="text-sm uppercase tracking-[0.3em] text-white/60 animate-pulse">Velora</span>
                </div>
            </div>

            <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .translate-z-10 { transform: translateZ(20px); }
        .translate-z-20 { transform: translateZ(40px); }
        .translate-z-30 { transform: translateZ(60px); }
        
        @keyframes spin-slow {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(180deg); }
        }
        @keyframes reverse-spin {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(-360deg) rotateY(-180deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-reverse-spin {
           animation: reverse-spin 8s linear infinite; 
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
        </div>
    );
};

export default Loading;
