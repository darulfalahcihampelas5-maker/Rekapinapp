import React from 'react';
import { ChevronRight, Power } from 'lucide-react';
import { UserRole, SystemSettings } from '../types';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  currentRole: UserRole;
  settings: SystemSettings;
  onOpenPrintReport: () => void;
  onOpenSettings?: () => void;
  loggedInUser?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  currentRole,
  settings,
  onOpenPrintReport,
  onOpenSettings,
  loggedInUser,
  onLogout,
}) => {
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'IT_ADMIN':
        return { label: 'Tim IT (Administrator Sistem)', tag: 'Tim IT' };
      case 'KOPERASI':
        return { label: 'Koperasi Sekolah (Kasir Penjual)', tag: 'Koperasi' };
      case 'KEPALA_SEKOLAH':
        return { label: 'Kepala Sekolah (Audit & Pengawasan)', tag: 'Kepala Sekolah' };
      case 'PENYEDIA':
        return { label: 'PT ForIT Asta Solusindo - SIDNet (Penyedia Kuota)', tag: 'PT SIDNet' };
    }
  };

  const roleInfo = getRoleLabel(currentRole);

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Mobile Sidebar Toggle - Fixed Left Center (Red) */}
      <button
        onClick={onOpenMobileSidebar}
        className="md:hidden fixed left-0 top-1/2 -translate-y-1/2 z-40 w-7 h-16 bg-red-600 border border-red-700 rounded-r-2xl shadow-lg shadow-red-600/40 flex items-center justify-center text-white hover:bg-red-700 transition-all duration-300 cursor-pointer pl-1"
        title="Buka Sidebar Navigasi"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 h-[68px] flex items-center justify-between shadow-xs print:hidden">
        
        {/* Left Side: Logo & App Name (rapatkan ke kiri) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <img 
            src="/logo.png" 
            alt="Logo SMAN 1 Cililin" 
            className="w-14 h-14 object-contain drop-shadow-sm shrink-0" 
          />
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-xl font-black tracking-tight leading-none">
                <span className="text-[#CC2302]">REKAPIN</span> <span className="text-sky-600 font-extrabold">AJA</span>
              </h1>
              <span className="hidden sm:inline-flex text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 leading-none">
                {roleInfo.tag}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate max-w-[180px] sm:max-w-md mt-0.5 leading-tight">
              {loggedInUser ? loggedInUser : 'Sistem Manajemen Voucher'}
            </p>
          </div>
        </div>

        {/* Right Side: User Badge & Power Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Badge */}
          {loggedInUser && (
            <div className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-50 rounded-full border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center">
                {loggedInUser.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-700 max-w-[120px] truncate">
                {loggedInUser}
              </span>
            </div>
          )}

          {/* Round Power Button */}
          <button
            onClick={handleLogoutClick}
            className="p-2 rounded-full text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 active:bg-rose-200 border border-rose-100 shadow-xs transition-colors cursor-pointer flex items-center justify-center"
            title="Keluar ke Dasbor Login REKAPIN AJA"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>

      </header>
    </>
  );
};
