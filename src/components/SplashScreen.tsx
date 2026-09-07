import React, { useEffect } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white text-slate-900 p-6 select-none overflow-hidden">
      
      {/* Decorative ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl pointer-events-none"></div>

      {/* Direct Content without frame/card wrapper */}
      <div className="relative z-10 max-w-3xl w-full text-center">
        
        {/* Brand Header directly on background with tightened text spacing */}
        <div className="space-y-1.5 flex flex-col items-center">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight uppercase font-sans leading-none pb-1">
            <span className="text-[#CC2302]">REKAPIN</span> <span className="text-sky-600">AJA</span>
          </h1>
          <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-sans tracking-wide whitespace-nowrap overflow-x-auto leading-tight">
            <strong className="font-black text-slate-900">R</strong>ekap{' '}
            <strong className="font-black text-slate-900">E</strong>-Voucher,{' '}
            <strong className="font-black text-slate-900">K</strong>oneksi{' '}
            <strong className="font-black text-slate-900">A</strong>kurat,{' '}
            <strong className="font-black text-slate-900">P</strong>ayments{' '}
            <strong className="font-black text-slate-900">I</strong>nternet{' '}
            <strong className="font-black text-slate-900">N</strong>etwork
          </p>
          <p className="text-xs sm:text-sm text-slate-500 font-medium font-sans tracking-wide leading-tight">
            Manajemen E-Voucher WiFi Akurat & Real-time
          </p>
        </div>

      </div>
    </div>
  );
};
