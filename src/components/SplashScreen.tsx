import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
  mode?: 'initial' | 'refresh';
}

const getEffectiveMode = (explicitMode?: 'initial' | 'refresh'): 'initial' | 'refresh' => {
  if (explicitMode) return explicitMode;
  try {
    const hasSeenInitial = sessionStorage.getItem('rekapin_initial_splash_shown');
    // Check if page was refreshed/reloaded
    let isReload = false;
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      isReload = (navEntries[0] as PerformanceNavigationTiming).type === 'reload';
    } else if (window.performance && (window.performance as any).navigation) {
      isReload = (window.performance as any).navigation.type === 1;
    }

    if (hasSeenInitial === 'true' || isReload) {
      return 'refresh';
    }
    return 'initial';
  } catch (e) {
    return 'initial';
  }
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, mode: explicitMode }) => {
  const [mode] = useState<'initial' | 'refresh'>(() => getEffectiveMode(explicitMode));
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    // Record that initial splash has been shown for this browser session
    try {
      sessionStorage.setItem('rekapin_initial_splash_shown', 'true');
    } catch (e) {
      // Ignored
    }

    let dotInterval: any = null;
    if (mode === 'refresh') {
      dotInterval = setInterval(() => {
        setDotCount((prev) => (prev >= 3 ? 1 : prev + 1));
      }, 350);
    }

    // Duration: 2s for initial splash, 1.4s for refresh loader
    const timer = setTimeout(() => {
      onFinish();
    }, mode === 'initial' ? 2000 : 1400);

    return () => {
      if (dotInterval) clearInterval(dotInterval);
      clearTimeout(timer);
    };
  }, [mode, onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-slate-900 p-6 select-none overflow-hidden">
      
      {/* Background ambient decorative glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-red-50/70 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sky-50/70 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-50/40 rounded-full blur-3xl pointer-events-none"></div>

      {mode === 'initial' ? (
        /* === TAMPILAN SCREENPLASH AWAL (JUDUL BESAR, AKRONIM, TANPA MEMUAT HALAMAN) === */
        <motion.div 
          key="initial-splash"
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
      ) : (
        /* === TAMPILAN KETIKA DI-REFRESH (DENGAN TULISAN MEMUAT HALAMAN & ANIMASI PROGRESS) === */
        <motion.div 
          key="refresh-loader"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative z-10 max-w-md w-full text-center flex flex-col items-center"
        >
          {/* Brand Header */}
          <div className="space-y-1 flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase font-sans leading-none pb-0.5">
              <span className="text-[#CC2302]">REKAPIN</span> <span className="text-sky-600">AJA</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium font-sans tracking-wide">
              Manajemen E-Voucher WiFi Akurat & Real-time
            </p>
          </div>

          {/* Animated Loading Section with Clean "Memuat halaman..." */}
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="mt-6 flex flex-col items-center gap-3 w-full"
          >
            {/* Animated Minimalist Progress Bar */}
            <div className="w-52 h-1.5 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-[#CC2302] via-sky-500 to-emerald-500 rounded-full"
                initial={{ width: "15%" }}
                animate={{ width: "95%" }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            </div>

            {/* Animated "Memuat halaman..." text */}
            <div className="flex items-center justify-center gap-1 text-xs sm:text-sm font-bold text-slate-700 font-sans tracking-wide">
              <span>Memuat halaman</span>
              <span className="inline-block w-5 text-left font-mono font-black text-sky-600">
                {'.'.repeat(dotCount)}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}

    </div>
  );
};
