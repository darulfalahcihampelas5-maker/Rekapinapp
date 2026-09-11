import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-slate-900 p-6 select-none overflow-hidden">
      
      {/* Background ambient decorative glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-50/70 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sky-50/70 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-50/40 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Content Container with Grand Bold Branding */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 max-w-2xl w-full text-center flex flex-col items-center space-y-4"
      >
        
        {/* Large Grand Application Title */}
        <div className="space-y-3.5 flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight uppercase font-sans leading-none"
          >
            <span className="text-[#CC2302]">REKAPIN</span>{' '}
            <span className="text-sky-600">AJA</span>
          </motion.h1>
          
          {/* Acronym Breakdown Pill */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs max-w-xl"
          >
            <span><strong className="font-black text-[#CC2302]">R</strong>ekap</span>
            <span className="text-slate-300">•</span>
            <span><strong className="font-black text-sky-600">E</strong>-Voucher</span>
            <span className="text-slate-300">•</span>
            <span><strong className="font-black text-slate-900">K</strong>oneksi</span>
            <span className="text-slate-300">•</span>
            <span><strong className="font-black text-slate-900">A</strong>kurat</span>
            <span className="text-slate-300">•</span>
            <span><strong className="font-black text-slate-900">P</strong>ayments</span>
            <span className="text-slate-300">•</span>
            <span><strong className="font-black text-slate-900">I</strong>nternet</span>
            <span className="text-slate-300">•</span>
            <span><strong className="font-black text-slate-900">N</strong>etwork</span>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="text-sm sm:text-base font-bold text-slate-800 font-sans tracking-wide"
          >
            Sistem Manajemen E-Voucher WiFi Akurat & Real-time
          </motion.p>
        </div>

      </motion.div>
    </div>
  );
};

