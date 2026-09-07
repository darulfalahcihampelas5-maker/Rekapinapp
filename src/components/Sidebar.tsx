import React from 'react';
import { UserRole, SystemSettings } from '../types';
import {
  Wifi,
  LayoutDashboard,
  ShoppingCart,
  PackageCheck,
  Banknote,
  ReceiptText,
  FileCheck,
  Gauge,
  Settings,
  Database,
  Power,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  settings: SystemSettings;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenPrintReport: () => void;
  onOpenPrintVouchers: () => void;
  onOpenSettings: () => void;
  isFirebaseConnected: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout?: () => void;
  loggedInUser?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  onSelectRole,
  activeTab,
  onSelectTab,
  settings,
  isOpenMobile,
  onCloseMobile,
  onOpenPrintReport,
  onOpenPrintVouchers,
  onOpenSettings,
  isFirebaseConnected,
  isCollapsed = false,
  onToggleCollapse,
  onLogout,
  loggedInUser,
}) => {
  const menuItems = [
    {
      id: 'overview',
      label: 'Beranda',
      icon: LayoutDashboard,
    },
    {
      id: 'it_buy_sidnet',
      label: 'Pembelian',
      icon: ShoppingCart,
    },
    {
      id: 'it_handover',
      label: 'Penyerahan',
      icon: PackageCheck,
    },
    {
      id: 'koperasi_settle',
      label: 'Setoran',
      icon: Banknote,
    },
    {
      id: 'expenses',
      label: 'Pengeluaran',
      icon: ReceiptText,
    },
    {
      id: 'financial_report',
      label: 'Laporan & Bagi Hasil',
      icon: FileCheck,
    },
    {
      id: 'quota_usage',
      label: 'Penggunaan Limit Kuota',
      icon: Gauge,
    },
  ];

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      window.location.reload();
    }
    onCloseMobile();
  };

  const handleSettingsClick = () => {
    onOpenSettings();
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Floating Expand Button when Sidebar is Collapsed on Desktop */}
      {isCollapsed && onToggleCollapse && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 w-7 h-16 bg-red-600 border border-red-700 rounded-r-2xl shadow-lg shadow-red-600/40 items-center justify-center text-white hover:bg-red-700 hover:w-9 transition-all duration-300 cursor-pointer group pl-1"
          title="Buka Sidebar (Tanda Panah ke Luar)"
          aria-label="Buka Sidebar"
        >
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out print:hidden ${
          isOpenMobile
            ? 'translate-x-0'
            : isCollapsed
            ? '-translate-x-full md:-translate-x-full'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Toggle Collapse / Hide Button (Centered vertically on right edge of sidebar, identical to the expand button) */}
        {(!isCollapsed || isOpenMobile) && (
          <button
            type="button"
            onClick={() => {
              if (isOpenMobile) {
                onCloseMobile();
              } else if (onToggleCollapse) {
                onToggleCollapse();
              }
            }}
            className="flex absolute left-full top-1/2 -translate-y-1/2 z-50 w-7 h-16 bg-red-600 border border-l-0 border-red-700 rounded-r-2xl shadow-lg shadow-red-600/40 items-center justify-center text-white hover:bg-red-700 hover:w-9 transition-all duration-300 cursor-pointer group pr-0.5"
            title="Sembunyikan Sidebar (Tanda Panah ke Kiri)"
            aria-label="Sembunyikan Sidebar"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          </button>
        )}

        {/* Brand Header */}
        <div className="px-3 sm:px-4 h-[68px] border-b border-slate-200 flex items-center">
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src="/logo.png" 
              alt="Logo SMAN 1 Cililin" 
              className="w-14 h-14 object-contain drop-shadow-sm shrink-0" 
            />
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight leading-none">
                <span className="text-[#CC2302]">REKAPIN</span> <span className="text-sky-600 font-extrabold">App</span>
              </h1>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate max-w-[150px] mt-1 leading-tight" title={loggedInUser || settings.schoolName}>
                {loggedInUser ? loggedInUser : 'Sistem Manajemen Voucher'}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
            Menu
          </span>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isSupervisedOnly = currentRole === 'KEPALA_SEKOLAH' && ['it_buy_sidnet', 'it_handover', 'koperasi_settle', 'expenses'].includes(item.id);
              return (
                <button
                  key={item.id}
                  id={`menu-btn-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="text-xs truncate">{item.label}</span>
                  </div>
                  {isSupervisedOnly && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                      isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Pantau
                    </span>
                  )}
                  {currentRole === 'KEPALA_SEKOLAH' && item.id === 'financial_report' && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                      isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      Akses Penuh
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status & Settings Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
          {/* Firestore Database Live Indicator */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-600 font-medium text-[11px]">Firebase Cloud</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Tersimpan
            </span>
          </div>

          {/* Tombol Pengaturan Modern, Elegan & Profesional */}
          <button
            id="btn-sidebar-settings"
            type="button"
            onClick={handleSettingsClick}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100/90 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all duration-200 cursor-pointer border border-slate-200 shadow-2xs hover:shadow-xs group"
            title="Buka Pengaturan Sistem"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-[#AAFF00]/40 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                <Settings className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
              </div>
              <span className="truncate">Pengaturan Sistem</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600 bg-slate-50 group-hover:bg-slate-200/60 px-1.5 py-0.5 rounded-md border border-slate-200/60 transition-colors">
              Konfigurasi
            </span>
          </button>

          <button
            id="btn-sidebar-logout"
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold transition-all cursor-pointer border border-rose-200/80 shadow-2xs group"
          >
            <Power className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>
    </>
  );
};

