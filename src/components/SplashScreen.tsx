import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    // Animate the dots in "Memuat halaman..."
    const dotInterval = setInterval(() => {
      setDotCount((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 400);

    const timer = setTimeout(() => {
      onFinish();
    }, 1600);

    return () => {
      clearInterval(dotInterval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-slate-900 p-6 select-none overflow-hidden">
      
      {/* Subtle soft ambient light on pure white background */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-sky-50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-rose-50 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Content Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 max-w-xl w-full text-center flex flex-col items-center"
      >
        
        {/* Brand Header */}
        <div className="space-y-1.5 flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase font-sans leading-none pb-0.5">
            <span className="text-[#CC2302]">REKAPIN</span> <span className="text-sky-600">AJA</span>
          </h1>
          
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 font-sans tracking-wide whitespace-nowrap overflow-x-auto leading-tight">
            <strong className="font-black text-slate-900">R</strong>ekap{' '}
            <strong className="font-black text-slate-900">E</strong>-Voucher,{' '}
            <strong className="font-black text-slate-900">K</strong>oneksi{' '}
            <strong className="font-black text-slate-900">A</strong>kurat,{' '}
            <strong className="font-black text-slate-900">P</strong>ayments{' '}
            <strong className="font-black text-slate-900">I</strong>nternet{' '}
            <strong className="font-black text-slate-900">N</strong>etwork
          </p>
          
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium font-sans tracking-wide leading-tight">
            Manajemen E-Voucher WiFi Akurat & Real-time
          </p>
        </div>

        {/* Animated Loading Section with Clean "Memuat halaman" Animation */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-7 flex flex-col items-center gap-3"
        >
          {/* Animated Minimalist Progress Bar */}
          <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-[#CC2302] via-sky-500 to-emerald-500 rounded-full"
              initial={{ width: "10%" }}
              animate={{ width: "95%" }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
          </div>

          {/* Animated "Memuat halaman" text */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 font-sans tracking-wide">
            <span>Memuat halaman</span>
            <span className="inline-block w-6 text-left font-mono font-black text-sky-600">
              {'.'.repeat(dotCount)}
            </span>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};
