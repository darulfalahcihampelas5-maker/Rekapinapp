import React, { useState } from 'react';
import { UserRole, SystemSettings } from '../types';
import {
  Wifi,
  LayoutDashboard,
  Layers,
  Store,
  FileSpreadsheet,
  Settings,
  Search,
  Printer,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Radio,
  SlidersHorizontal
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  settings: SystemSettings;
  onOpenSearch: () => void;
  onOpenPrintVouchers: () => void;
  onOpenPrintReport: () => void;
  onOpenSettings: () => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  activeTab,
  onSelectTab,
  settings,
  onOpenSearch,
  onOpenPrintVouchers,
  onOpenPrintReport,
  onOpenSettings,
  onResetData,
  onExportData,
  onImportData,
}) => {
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-900/40 text-slate-950 font-bold border border-emerald-400/40">
              <Wifi className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                  <span className="text-[#CC2302]">REKAPIN</span> <span className="text-xs px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30">App</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[200px] sm:max-w-xs">
                {settings.schoolName} &bull; SSID: <span className="text-emerald-400 font-mono">{settings.wifiSsid}</span>
              </p>
            </div>
          </div>

          {/* Navigation Links based on Role */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              id="nav-tab-overview"
              onClick={() => onSelectTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Ikhtisar & Grafik
            </button>

            {currentRole === 'IT_ADMIN' && (
              <>
                <button
                  id="nav-tab-it-batches"
                  onClick={() => onSelectTab('it_batches')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'it_batches'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Top-Up & Stok IT
                </button>
                <button
                  id="nav-tab-it-handover"
                  onClick={() => onSelectTab('it_handover')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'it_handover'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Serah Terima Koperasi
                </button>
              </>
            )}

            {currentRole === 'KOPERASI' && (
              <>
                <button
                  id="nav-tab-koperasi-pos"
                  onClick={() => onSelectTab('koperasi_pos')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'koperasi_pos'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Kasir Penjualan Siswa
                </button>
                <button
                  id="nav-tab-koperasi-settle"
                  onClick={() => onSelectTab('koperasi_settle')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'koperasi_settle'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Setoran ke IT & Riwayat
                </button>
              </>
            )}

            {currentRole === 'KEPALA_SEKOLAH' && (
              <>
                <button
                  id="nav-tab-kepsek-audit"
                  onClick={() => onSelectTab('kepsek_audit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'kepsek_audit'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  Audit Rekapitulasi Laba
                </button>
              </>
            )}

            {currentRole === 'PENYEDIA' && (
              <button
                id="nav-tab-penyedia"
                onClick={() => onSelectTab('penyedia_orders')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'penyedia_orders'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Radio className="w-4 h-4" />
                Pesanan & Vendor
              </button>
            )}

            <button
              id="nav-tab-expenses"
              onClick={() => onSelectTab('expenses')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'expenses'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Biaya Operasional
            </button>
          </nav>

          {/* Quick Actions & Role Switcher Header */}
          <div className="flex items-center gap-2">
            {/* Search Voucher Modal Trigger */}
            <button
              id="btn-search-voucher"
              onClick={onOpenSearch}
              title="Cek Status Kode Voucher"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Cek Kode</span>
            </button>

            {/* Print Vouchers Button */}
            <button
              id="btn-print-vouchers-nav"
              onClick={onOpenPrintVouchers}
              title="Cetak Voucher Fisik Siap Gunting"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Cetak Voucher</span>
            </button>

            {/* Print Official Report */}
            <button
              id="btn-print-report-nav"
              onClick={onOpenPrintReport}
              title="Cetak Laporan Keuangan Resmi"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Cetak Laporan</span>
            </button>

            {/* Settings & Extra Tools dropdown */}
            <div className="relative">
              <button
                id="btn-tools-toggle"
                onClick={() => setShowToolsMenu(!showToolsMenu)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
                title="Pengaturan & Data"
              >
                <Settings className="w-4 h-4" />
              </button>

              {showToolsMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={() => setShowToolsMenu(false)}
                >
                  <button
                    onClick={onOpenSettings}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Pengaturan Harga & SSID
                  </button>
                  <button
                    onClick={onExportData}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-left"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    Ekspor Cadangan (JSON)
                  </button>
                  <label className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-left">
                    <Upload className="w-4 h-4 text-blue-400" />
                    <span>Impor Data Cadangan</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={onImportData}
                      className="hidden"
                    />
                  </label>
                  <div className="border-t border-slate-800 my-1"></div>
                  <button
                    onClick={onResetData}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset ke Data Awal Demo
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center gap-1 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSelectTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-slate-400 bg-slate-800/60'
            }`}
          >
            Ikhtisar
          </button>
          {currentRole === 'IT_ADMIN' && (
            <>
              <button
                onClick={() => onSelectTab('it_batches')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  activeTab === 'it_batches' ? 'bg-emerald-600 text-white' : 'text-slate-400 bg-slate-800/60'
                }`}
              >
                Top-Up IT
              </button>
              <button
                onClick={() => onSelectTab('it_handover')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  activeTab === 'it_handover' ? 'bg-emerald-600 text-white' : 'text-slate-400 bg-slate-800/60'
                }`}
              >
                Serah Terima
              </button>
            </>
          )}
          {currentRole === 'KOPERASI' && (
            <>
              <button
                onClick={() => onSelectTab('koperasi_pos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  activeTab === 'koperasi_pos' ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-800/60'
                }`}
              >
                Kasir Siswa
              </button>
              <button
                onClick={() => onSelectTab('koperasi_settle')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  activeTab === 'koperasi_settle' ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-800/60'
                }`}
              >
                Setoran & Riwayat
              </button>
            </>
          )}
          {currentRole === 'KEPALA_SEKOLAH' && (
            <button
              onClick={() => onSelectTab('kepsek_audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                activeTab === 'kepsek_audit' ? 'bg-amber-600 text-white' : 'text-slate-400 bg-slate-800/60'
              }`}
            >
              Audit Rekap
            </button>
          )}
          {currentRole === 'PENYEDIA' && (
            <button
              onClick={() => onSelectTab('penyedia_orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                activeTab === 'penyedia_orders' ? 'bg-purple-600 text-white' : 'text-slate-400 bg-slate-800/60'
              }`}
            >
              Vendor Orders
            </button>
          )}
          <button
            onClick={() => onSelectTab('expenses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'expenses' ? 'bg-slate-700 text-white' : 'text-slate-400 bg-slate-800/60'
            }`}
          >
            Biaya Operasional
          </button>
        </div>

      </div>
    </header>
  );
};
