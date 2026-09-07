import React, { useState, useEffect, useRef } from 'react';
import {
  UserRole,
  SystemSettings
} from '../types';
import { parseStaffNames } from '../utils/format';
import { defaultSettings } from '../firebase/firestoreService';
import {
  ShieldCheck,
  UserCheck,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  Wifi,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldAlert,
  AlertTriangle,
  X,
  RotateCcw
} from 'lucide-react';

interface LoginDashboardProps {
  settings: SystemSettings;
  onLoginSuccess: (role: UserRole, username: string, nip: string) => void;
  onBypassAsGuest?: () => void;
}

export const LoginDashboard: React.FC<LoginDashboardProps> = ({
  settings,
  onLoginSuccess,
  onBypassAsGuest
}) => {
  const [activeTab, setActiveTab] = useState<'IT_ADMIN' | 'KEPALA_SEKOLAH'>('IT_ADMIN');
  
  // Tim IT credentials state
  const [itUsername, setItUsername] = useState('');
  const [itPassword, setItPassword] = useState('');

  // Kepala Sekolah credentials state
  const [kepsekUsername, setKepsekUsername] = useState('');
  const [kepsekPassword, setKepsekPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showNipErrorModal, setShowNipErrorModal] = useState(false);

  const itPasswordRef = useRef<HTMLInputElement>(null);
  const kepsekPasswordRef = useRef<HTMLInputElement>(null);

  const itStaffList = parseStaffNames(settings.itStaffNames);

  // Close modal with escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showNipErrorModal) {
        handleCloseNipModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showNipErrorModal]);

  const handleCloseNipModal = () => {
    setShowNipErrorModal(false);
    setTimeout(() => {
      if (activeTab === 'IT_ADMIN') {
        itPasswordRef.current?.focus();
        itPasswordRef.current?.select();
      } else {
        kepsekPasswordRef.current?.focus();
        kepsekPasswordRef.current?.select();
      }
    }, 100);
  };

  const normalizeNip = (str: string) => str.replace(/[\s\-\.]/g, '').trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (activeTab === 'IT_ADMIN') {
      if (!itUsername.trim()) {
        setErrorMessage('Silakan pilih salah satu nama akun Guru / Tim IT.');
        return;
      }
      if (!itPassword.trim()) {
        setErrorMessage('Silakan masukkan Password (NIP Guru IT).');
        return;
      }

      // Validasi NIP Guru IT
      const enteredNip = normalizeNip(itPassword);
      const rawNips = settings.itStaffNips || defaultSettings.itStaffNips || '';
      const configuredNips = rawNips
        .split(/[,;]/)
        .map(s => normalizeNip(s))
        .filter(Boolean);

      const staffIdx = itStaffList.indexOf(itUsername.trim());
      let isValidNip = false;

      if (configuredNips.length > 0) {
        if (staffIdx >= 0 && staffIdx < configuredNips.length && configuredNips[staffIdx]) {
          // Cocokkan NIP sesuai urutan nama guru yang dipilih
          isValidNip = enteredNip === configuredNips[staffIdx];
        } else {
          // Jika urutan melebihi konfigurasi NIP, izinkan NIP yang terdaftar di konfigurasi Tim IT
          isValidNip = configuredNips.includes(enteredNip);
        }
      } else {
        // Fallback jika belum terkonfigurasi di database
        isValidNip = enteredNip === '198501012010011005';
      }

      if (!isValidNip) {
        setShowNipErrorModal(true);
        setErrorMessage('Maaf NIP anda salah');
        return;
      }

      onLoginSuccess('IT_ADMIN', itUsername.trim(), itPassword.trim());
    } else {
      // Kepala Sekolah
      if (!kepsekUsername.trim()) {
        setErrorMessage('Silakan pilih nama Kepala Sekolah.');
        return;
      }
      if (!kepsekPassword.trim()) {
        setErrorMessage('Silakan masukkan Password (NIP Kepala Sekolah).');
        return;
      }

      // Validasi NIP Kepala Sekolah
      const enteredNip = normalizeNip(kepsekPassword);
      const expectedKepsekNip = normalizeNip(
        settings.kepalaSekolahNip || defaultSettings.kepalaSekolahNip || '196803151992031004'
      );

      if (enteredNip !== expectedKepsekNip) {
        setShowNipErrorModal(true);
        setErrorMessage('Maaf NIP anda salah');
        return;
      }

      onLoginSuccess('KEPALA_SEKOLAH', kepsekUsername.trim(), kepsekPassword.trim());
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 sm:p-6 text-slate-900 font-sans relative overflow-hidden">
      
      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#AAFF00]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl relative z-10 space-y-6">
        
        {/* Main Branding Header - No Card Frame Wrapper as requested */}
        <div className="space-y-2 text-center py-2">
          
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase font-sans">
              <span className="text-[#CC2302]">REKAPIN</span> <span className="text-sky-600">AJA</span>
            </h1>
            <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-sans tracking-wide whitespace-nowrap">
              <strong className="font-black text-slate-900">R</strong>ekap{' '}
              <strong className="font-black text-slate-900">E</strong>-Voucher,{' '}
              <strong className="font-black text-slate-900">K</strong>oneksi{' '}
              <strong className="font-black text-slate-900">A</strong>kurat,{' '}
              <strong className="font-black text-slate-900">P</strong>ayments{' '}
              <strong className="font-black text-slate-900">I</strong>nternet{' '}
              <strong className="font-black text-slate-900">N</strong>etwork
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal max-w-lg mx-auto text-center px-2 mt-2">
            Aplikasi praktis untuk mencatat transaksi jual-beli dan pembayaran voucher Wi-Fi siswa secara otomatis, akurat, dan real-time.
          </p>

        </div>

        {/* Login Form Container - In a clean card frame */}
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/70 border border-slate-200/90 space-y-6">
          
          {/* Header & Role Switch Tabs */}
          <div>
            <div className="flex items-center justify-center mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                <span>Dasbor Login</span>
              </h2>
            </div>

            {/* 2 Menu Masuk: Tim IT & Kepala Sekolah */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('IT_ADMIN');
                  setErrorMessage(null);
                }}
                className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'IT_ADMIN'
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Tim IT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('KEPALA_SEKOLAH');
                  setErrorMessage(null);
                }}
                className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'KEPALA_SEKOLAH'
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Kepala Sekolah</span>
              </button>
            </div>
          </div>

          {/* Alert Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {activeTab === 'IT_ADMIN' ? (
              /* Tim IT Form Inputs */
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pilih Username Guru IT</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  
                  {/* Dropdown Frame with #AAFF00 Transition */}
                  <div className="rounded-2xl p-1 bg-slate-50 border-2 border-slate-200 hover:border-[#AAFF00] focus-within:border-[#AAFF00] focus-within:ring-4 focus-within:ring-[#AAFF00]/30 transition-all duration-300 shadow-xs">
                    <select
                      value={itUsername}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        setItUsername(selectedName);
                        setItPassword('');
                        setErrorMessage(null);
                      }}
                      className="w-full px-3 py-2 rounded-xl border-none text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-0 transition-colors cursor-pointer"
                      required
                    >
                      <option value="">-- Pilih Salah Satu Guru IT --</option>
                      {itStaffList.map((name, idx) => (
                        <option key={idx} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Password (NIP Guru IT)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  
                  {/* Password Frame with #AAFF00 Transition */}
                  <div className="rounded-2xl p-1 bg-slate-50 border-2 border-slate-200 hover:border-[#AAFF00] focus-within:border-[#AAFF00] focus-within:ring-4 focus-within:ring-[#AAFF00]/30 transition-all duration-300 shadow-xs">
                    <div className="relative flex items-center">
                      <input
                        ref={itPasswordRef}
                        type={showPassword ? 'text' : 'password'}
                        value={itPassword}
                        onChange={(e) => {
                          setItPassword(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="Masukkan NIP Tim IT..."
                        className="w-full px-3 py-2 rounded-xl border-none text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-0 transition-colors pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    NIP digunakan sebagai autentikasi password masuk akun Tim IT.
                  </p>
                </div>
              </>
            ) : (
              /* Kepala Sekolah Form Inputs */
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pilih Username Kepala Sekolah</span>
                    <span className="text-rose-500">*</span>
                  </label>

                  {/* Dropdown Frame with #AAFF00 Transition */}
                  <div className="rounded-2xl p-1 bg-slate-50 border-2 border-slate-200 hover:border-[#AAFF00] focus-within:border-[#AAFF00] focus-within:ring-4 focus-within:ring-[#AAFF00]/30 transition-all duration-300 shadow-xs">
                    <select
                      value={kepsekUsername}
                      onChange={(e) => {
                        const selectedName = e.target.value;
                        setKepsekUsername(selectedName);
                        setKepsekPassword('');
                        setErrorMessage(null);
                      }}
                      className="w-full px-3 py-2 rounded-xl border-none text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-0 transition-colors cursor-pointer"
                      required
                    >
                      <option value="">-- Pilih Nama Kepala Sekolah --</option>
                      <option value={settings.kepalaSekolahName || 'Drs. H. Suhendra, M.Pd.'}>
                        {settings.kepalaSekolahName || 'Drs. H. Suhendra, M.Pd.'}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Password (NIP Kepala Sekolah)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  
                  {/* Password Frame with #AAFF00 Transition */}
                  <div className="rounded-2xl p-1 bg-slate-50 border-2 border-slate-200 hover:border-[#AAFF00] focus-within:border-[#AAFF00] focus-within:ring-4 focus-within:ring-[#AAFF00]/30 transition-all duration-300 shadow-xs">
                    <div className="relative flex items-center">
                      <input
                        ref={kepsekPasswordRef}
                        type={showPassword ? 'text' : 'password'}
                        value={kepsekPassword}
                        onChange={(e) => {
                          setKepsekPassword(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="Masukkan NIP Kepala Sekolah..."
                        className="w-full px-3 py-2 rounded-xl border-none text-xs font-mono font-bold text-slate-900 bg-white focus:outline-none focus:ring-0 transition-colors pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    NIP digunakan sebagai kredensial autentikasi laporan audit Kepala Sekolah.
                  </p>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-login-submit"
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer mt-2"
            >
              <span>Masuk ke REKAPIN AJA ({activeTab === 'IT_ADMIN' ? 'Tim IT' : 'Kepala Sekolah'})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

        </div>

        {/* Kotak Pesan Modern Elegan dan Profesional: Maaf NIP anda salah */}
        {showNipErrorModal && (
          <div 
            id="modal-nip-error"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nip-error-title"
          >
            {/* Backdrop with dark blur */}
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
              onClick={handleCloseNipModal}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-rose-950/25 w-full max-w-md overflow-hidden border border-rose-100 p-6 sm:p-8 text-center z-10 animate-in fade-in zoom-in-95 duration-250 ease-out">
              
              {/* Top decorative gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600" />

              {/* Close button */}
              <button
                type="button"
                onClick={handleCloseNipModal}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup Pesan"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon Container with subtle pulsing glow */}
              <div className="w-20 h-20 mx-auto mb-5 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-rose-200/70 rounded-full animate-ping opacity-50 pointer-events-none" />
                <div className="relative w-full h-full bg-gradient-to-tr from-rose-100 via-rose-50 to-red-100 border-2 border-rose-300 text-rose-600 rounded-full flex items-center justify-center shadow-inner">
                  <ShieldAlert className="w-9 h-9 stroke-[2.2]" />
                </div>
              </div>

              {/* Security Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold uppercase tracking-wider mb-2.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Autentikasi Gagal</span>
              </div>

              {/* Main Error Heading Requested by User */}
              <h3 id="nip-error-title" className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight mb-2">
                Maaf NIP anda salah
              </h3>

              {/* Contextual Polite & Professional Message */}
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                Nomor Induk Pegawai (NIP) yang Anda masukkan tidak cocok dengan data resmi terdaftar untuk akun <strong className="text-slate-800 font-bold">{activeTab === 'IT_ADMIN' ? itUsername || 'Tim IT' : kepsekUsername || 'Kepala Sekolah'}</strong>. Akses masuk ke sistem REKAPIN ditolak.
              </p>

              {/* Professional Security Notice Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-left text-xs text-slate-600 space-y-1.5 mb-6">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Lock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Petunjuk Autentikasi:</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal pl-5">
                  Pastikan Anda memilih nama akun yang sesuai dan memasukkan seluruh digit NIP dengan benar tanpa spasi atau kesalahan pengetikan.
                </p>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                id="btn-retry-login"
                onClick={handleCloseNipModal}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 active:from-rose-800 active:to-red-800 text-white font-bold text-sm shadow-lg shadow-rose-600/30 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                autoFocus
              >
                <RotateCcw className="w-4 h-4" />
                <span>Periksa & Coba Lagi</span>
              </button>

            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center text-slate-600 space-y-1 mt-8 border-t border-slate-200 pt-6">
          <p className="text-[10px] font-bold text-slate-700">App Development by Tim IT SMA Negeri 1 Cililin</p>
          <p className="text-[9px] tracking-wider uppercase font-semibold text-slate-500">KREATIVITAS TANPA BATAS &bull; INOVASI TIADA HENTI</p>
          <p className="text-[10px] italic text-slate-500">&ldquo;Gunawulang Gapuraning Rahayu&rdquo;</p>
          <div className="flex items-center justify-center gap-2 pt-2 text-[10px] font-mono text-slate-400">
            <span>V2.1.0</span>
            <span>|</span>
            <span>Enterprise</span>
            <span>|</span>
            <span>Stable</span>
          </div>
        </div>

      </div>
    </div>
  );
};
