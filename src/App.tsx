import React, { useState, useEffect } from 'react';
import { Power } from 'lucide-react';
import {
  UserRole,
  SystemSettings,
  VoucherBatch,
  VoucherItem,
  VoucherHandover,
  SettlementRecord,
  ExpenseRecord
} from './types';
import {
  defaultSettings,
  subscribeToSettings,
  subscribeToBatches,
  subscribeToVouchers,
  subscribeToHandovers,
  subscribeToSettlements,
  subscribeToExpenses,
  saveSettingsToFirestore,
  addBatchToFirestore,
  updateBatchInFirestore,
  deleteBatchFromFirestore,
  recordHandoverToFirestore,
  updateHandoverInFirestore,
  deleteHandoverFromFirestore,
  recordSettlementToFirestore,
  addExpenseToFirestore,
  updateExpenseInFirestore,
  deleteExpenseFromFirestore,
  clearAllDataInFirestore
} from './firebase/firestoreService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { RoleBanner } from './components/RoleBanner';
import { DashboardOverview } from './components/DashboardOverview';
import { ItBatchManagement } from './components/ItBatchManagement';
import { KoperasiSettlement } from './components/KoperasiSettlement';
import { ExpenseManagement } from './components/ExpenseManagement';
import { KepsekAuditDashboard } from './components/KepsekAuditDashboard';
import { QuotaUsageDashboard } from './components/QuotaUsageDashboard';
import { PrintReportModal } from './components/PrintReportModal';
import { PrintVouchersModal } from './components/PrintVouchersModal';
import { SelectSignatoryModal } from './components/SelectSignatoryModal';
import { SettingsModal } from './components/SettingsModal';
import { ResetConfirmationModal } from './components/ResetConfirmationModal';
import { SplashScreen } from './components/SplashScreen';
import { playWelcomeVoice, playLogoutVoice } from './utils/audioSpeech';
import { LoginDashboard } from './components/LoginDashboard';
import { AnimatePresence } from 'motion/react';
import { auth } from './firebase/config';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const AUTH_STORAGE_KEY = 'rekapin_aja_auth_session';

interface SavedAuthSession {
  isLoggedIn: boolean;
  loggedInUser: string;
  loggedInNip: string;
  currentRole: UserRole;
  activeTab: string;
}

const getInitialAuthSession = (): SavedAuthSession => {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.isLoggedIn === 'boolean' && parsed.isLoggedIn) {
        return {
          isLoggedIn: true,
          loggedInUser: parsed.loggedInUser || '',
          loggedInNip: parsed.loggedInNip || '',
          currentRole: parsed.currentRole || 'IT_ADMIN',
          activeTab: parsed.activeTab || 'overview',
        };
      }
    }
  } catch (e) {
    console.error('Failed to load saved session', e);
  }
  return {
    isLoggedIn: false,
    loggedInUser: '',
    loggedInNip: '',
    currentRole: 'IT_ADMIN',
    activeTab: 'overview',
  };
};

export default function App() {
  const initialSession = getInitialAuthSession();

  // Application Data States populated via Firestore real-time listeners
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [batches, setBatches] = useState<VoucherBatch[]>([]);
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [handovers, setHandovers] = useState<VoucherHandover[]>([]);
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);

  // Splash Screen & Loading State on Refresh
  // Always show clean splash screen with animated "Memuat halaman" during initial load/refresh
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(initialSession.isLoggedIn);
  const [loggedInUser, setLoggedInUser] = useState<string>(initialSession.loggedInUser);
  const [loggedInNip, setLoggedInNip] = useState<string>(initialSession.loggedInNip);

  // Alur Manajemen Sederhana
  const [currentRole, setCurrentRole] = useState<UserRole>(initialSession.currentRole);
  const [activeTab, setActiveTab] = useState<string>(initialSession.activeTab);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Persist session to localStorage on any auth/nav state change
  useEffect(() => {
    if (isLoggedIn) {
      try {
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            isLoggedIn: true,
            loggedInUser,
            loggedInNip,
            currentRole,
            activeTab,
          })
        );
      } catch (e) {
        console.error('Failed to persist session to localStorage', e);
      }
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [isLoggedIn, loggedInUser, loggedInNip, currentRole, activeTab]);

  // Login Handlers
  const handleLoginSuccess = (role: UserRole, username: string, nip: string) => {
    setLoggedInUser(username);
    setLoggedInNip(nip);
    setCurrentRole(role);
    setActiveTab('overview');
    setIsLoggedIn(true);
    playWelcomeVoice(username);
  };

  const handleBypassAsGuest = () => {
    setLoggedInUser('Kasir Koperasi');
    setCurrentRole('KOPERASI');
    setActiveTab('koperasi_settle');
    setIsLoggedIn(true);
    playWelcomeVoice('Kasir Koperasi');
  };

  const requestLogout = () => {
    setShowLogoutModal(true);
  };

  const handleLogout = () => {
    playLogoutVoice();
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsLoggedIn(false);
    setLoggedInUser('');
    setLoggedInNip('');
    setActiveTab('overview');
    setShowLogoutModal(false);
  };

  // Modal Dialog States
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
  const [isPrintVouchersOpen, setIsPrintVouchersOpen] = useState(false);
  const [isSelectSignatoryOpen, setIsSelectSignatoryOpen] = useState(false);
  const [selectedItStaffSignatory, setSelectedItStaffSignatory] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [quotaError, setQuotaError] = useState<string | null>(null);

  const handleOpenPrintFlow = () => {
    setIsSelectSignatoryOpen(true);
  };

  const handleConfirmSignatory = (staffName: string) => {
    setSelectedItStaffSignatory(staffName);
    setIsSelectSignatoryOpen(false);
    setIsPrintReportOpen(true);
  };

  const handleOperationError = (err: any, defaultMsg: string) => {
    console.error(defaultMsg, err);
    const errStr = err?.message || String(err);
    if (errStr.includes('resource-exhausted') || errStr.includes('Quota')) {
      setQuotaError('Peringatan: Batas kuota harian Firebase Firestore telah tercapai (Resource Exceeded). Operasi penulisan tidak dapat disimpan ke cloud saat ini. Mohon coba lagi besok atau aktifkan billing pada proyek Firebase Anda.');
    } else {
      alert(defaultMsg);
    }
  };

  // Real-time Firestore subscriptions
  useEffect(() => {
    const unsubSettings = subscribeToSettings((data) => setSettings(data));
    const unsubBatches = subscribeToBatches((data) => setBatches(data));
    const unsubVouchers = subscribeToVouchers((data) => setVouchers(data));
    const unsubHandovers = subscribeToHandovers((data) => setHandovers(data));
    const unsubSettlements = subscribeToSettlements((data) => setSettlements(data));
    const unsubExpenses = subscribeToExpenses((data) => setExpenses(data));

    return () => {
      unsubSettings();
      unsubBatches();
      unsubVouchers();
      unsubHandovers();
      unsubSettlements();
      unsubExpenses();
    };
  }, []);

  // Handlers
  const handleSelectRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'IT_ADMIN') setActiveTab('it_buy_sidnet');
    else if (role === 'KOPERASI') setActiveTab('koperasi_settle');
    else if (role === 'KEPALA_SEKOLAH') setActiveTab('financial_report');
    else if (role === 'PENYEDIA') setActiveTab('it_buy_sidnet');
  };

  const handleNavigateTab = (tab: string, role?: UserRole) => {
    if (role) setCurrentRole(role);
    setActiveTab(tab);
  };

  // Add new Batch in Firestore
  const handleAddBatch = async (newBatch: VoucherBatch, newVouchers: VoucherItem[]) => {
    try {
      await addBatchToFirestore(newBatch, newVouchers);
    } catch (err) {
      handleOperationError(err, 'Gagal menyimpan batch ke Firebase. Silakan periksa koneksi Anda.');
    }
  };

  // Update existing Batch in Firestore
  const handleUpdateBatch = async (updatedBatch: VoucherBatch) => {
    try {
      await updateBatchInFirestore(updatedBatch);
    } catch (err) {
      handleOperationError(err, 'Gagal memperbarui data pembelian di Firebase.');
    }
  };

  // Delete Batch in Firestore
  const handleDeleteBatch = async (batchId: string) => {
    try {
      const batchVoucherIds = vouchers.filter(v => v.batchId === batchId).map(v => v.id);
      await deleteBatchFromFirestore(batchId, batchVoucherIds);
    } catch (err) {
      handleOperationError(err, 'Gagal menghapus batch pembelian dari Firebase.');
    }
  };

  // Handover vouchers to Koperasi in Firestore
  const handleHandoverVouchers = async (newHandover: VoucherHandover, updatedVouchers: VoucherItem[]) => {
    try {
      await recordHandoverToFirestore(newHandover, updatedVouchers);
    } catch (err) {
      handleOperationError(err, 'Gagal menyimpan serah terima ke Firebase.');
    }
  };

  // Update Handover in Firestore
  const handleUpdateHandover = async (updatedHandover: VoucherHandover, updatedVouchers: VoucherItem[]) => {
    try {
      await updateHandoverInFirestore(updatedHandover, updatedVouchers);
    } catch (err) {
      handleOperationError(err, 'Gagal memperbarui data penyerahan di Firebase.');
    }
  };

  // Delete Handover in Firestore
  const handleDeleteHandover = async (handoverId: string, revertedVouchers: VoucherItem[]) => {
    try {
      await deleteHandoverFromFirestore(handoverId, revertedVouchers);
    } catch (err) {
      handleOperationError(err, 'Gagal menghapus data penyerahan di Firebase.');
    }
  };

  // Settlement from Koperasi to IT in Firestore
  const handleRecordSettlement = async (newSettlement: SettlementRecord, updatedVouchers: VoucherItem[]) => {
    try {
      await recordSettlementToFirestore(newSettlement, updatedVouchers);
    } catch (err) {
      handleOperationError(err, 'Gagal menyimpan setoran ke Firebase.');
    }
  };

  const handleAddExpense = async (newExpense: ExpenseRecord) => {
    try {
      await addExpenseToFirestore(newExpense);
    } catch (err) {
      handleOperationError(err, 'Gagal menyimpan pengeluaran ke Firebase.');
    }
  };

  const handleUpdateExpense = async (updatedExpense: ExpenseRecord) => {
    try {
      await updateExpenseInFirestore(updatedExpense);
    } catch (err) {
      handleOperationError(err, 'Gagal memperbarui pengeluaran di Firebase.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpenseFromFirestore(id);
    } catch (err) {
      handleOperationError(err, 'Gagal menghapus pengeluaran dari Firebase.');
    }
  };

  const handleSaveSettings = async (newSettings: SystemSettings) => {
    try {
      await saveSettingsToFirestore(newSettings);
      setSettings(newSettings);
    } catch (err) {
      handleOperationError(err, 'Gagal memperbarui pengaturan di Firebase.');
    }
  };


  const handleResetAllData = async (pin: string, onProgress: (p: number, msg: string) => void) => {
    console.log('handleResetAllData triggered in App.tsx');
    
    if (pin !== 'kobongangker123') {
      console.warn('Wrong PIN entered');
      return false;
    }
    
    try {
      console.log('Calling clearAllDataInFirestore...');
      await clearAllDataInFirestore(onProgress);
      console.log('clearAllDataInFirestore success');
      setIsSettingsOpen(false); // Close settings
      return true;
    } catch (err: any) {
      console.error('Error in handleResetAllData:', err);
      try {
        handleFirestoreError(err, OperationType.DELETE, 'all_transactional_collections');
      } catch (logErr) {
        // Logged
      }
      throw err;
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!isLoggedIn) {
    return (
      <LoginDashboard
        settings={settings}
        onLoginSuccess={handleLoginSuccess}
        onBypassAsGuest={handleBypassAsGuest}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Left-Aligned Sidebar Navigation */}
      <Sidebar
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        settings={settings}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenPrintVouchers={() => setIsPrintVouchersOpen(true)}
        onOpenPrintReport={handleOpenPrintFlow}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isFirebaseConnected={isFirebaseConnected}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={requestLogout}
        loggedInUser={loggedInUser}
      />

      {/* Main Content Area (Offset for Desktop Sidebar) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-0' : 'md:pl-64'}`}>
        
        {/* Top Header */}
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          currentRole={currentRole}
          settings={settings}
          onOpenPrintReport={handleOpenPrintFlow}
          onOpenSettings={() => setIsSettingsOpen(true)}
          loggedInUser={loggedInUser}
          onLogout={requestLogout}
        />

        {/* Main Body Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {quotaError && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-amber-900 text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                <span>{quotaError}</span>
              </div>
              <button
                onClick={() => setQuotaError(null)}
                className="text-amber-700 hover:text-amber-900 font-bold ml-4 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}

          {/* View Routing */}
          {activeTab === 'overview' && (
            <DashboardOverview
              batches={batches}
              vouchers={vouchers}
              settlements={settlements}
              expenses={expenses}
              settings={settings}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {/* Pembelian PT SIDNet */}
          {activeTab === 'it_buy_sidnet' && (
            <ItBatchManagement
              batches={batches}
              vouchers={vouchers}
              handovers={handovers}
              settlements={settlements}
              settings={settings}
              activeSubTab="buy"
              currentRole={currentRole}
              onAddBatch={handleAddBatch}
              onUpdateBatch={handleUpdateBatch}
              onDeleteBatch={handleDeleteBatch}
              onHandoverVouchers={handleHandoverVouchers}
              onUpdateHandover={handleUpdateHandover}
              onDeleteHandover={handleDeleteHandover}
              onReceiveSettlement={(s) => handleRecordSettlement(s, [])}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {/* Serah Terima ke Koperasi */}
          {activeTab === 'it_handover' && (
            <ItBatchManagement
              batches={batches}
              vouchers={vouchers}
              handovers={handovers}
              settlements={settlements}
              settings={settings}
              activeSubTab="handover"
              currentRole={currentRole}
              onAddBatch={handleAddBatch}
              onUpdateBatch={handleUpdateBatch}
              onDeleteBatch={handleDeleteBatch}
              onHandoverVouchers={handleHandoverVouchers}
              onUpdateHandover={handleUpdateHandover}
              onDeleteHandover={handleDeleteHandover}
              onReceiveSettlement={(s) => handleRecordSettlement(s, [])}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {/* Setoran Koperasi ke Tim IT Sesuai Voucher Terjual */}
          {activeTab === 'koperasi_settle' && (
            <KoperasiSettlement
              vouchers={vouchers}
              settlements={settlements}
              settings={settings}
              currentRole={currentRole}
              onRecordSettlement={handleRecordSettlement}
            />
          )}

          {/* Pengeluaran Operasional */}
          {activeTab === 'expenses' && (
            <ExpenseManagement
              expenses={expenses}
              settlements={settlements}
              settings={settings}
              currentRole={currentRole}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {/* Laporan & Bagi Hasil */}
          {activeTab === 'financial_report' && (
            <KepsekAuditDashboard
              batches={batches}
              vouchers={vouchers}
              handovers={handovers}
              settlements={settlements}
              expenses={expenses}
              settings={settings}
              onOpenPrintReport={handleOpenPrintFlow}
            />
          )}

          {/* Penggunaan Limit Kuota */}
          {activeTab === 'quota_usage' && (
            <QuotaUsageDashboard
              settings={settings}
            />
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/85 bg-white py-4 mt-8 text-center text-xs text-slate-500 print:hidden font-mono tracking-tight">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-1.5">
            <div className="font-bold text-slate-800 text-xs sm:text-sm tracking-normal">
              App Development by Tim IT SMA Negeri 1 Cililin
            </div>
            <div className="text-emerald-700 font-semibold text-[10px] sm:text-[11px] tracking-wider uppercase">
              KREATIVITAS TANPA BATAS &bull; INOVASI TIADA HENTI
            </div>
            <p className="text-slate-600 italic text-[11px] sm:text-xs">
              &ldquo;Gunawulang Gapuraning Rahayu&rdquo;
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600 mt-1">
              <span>V2.1.0</span>
              <span className="text-slate-300">|</span>
              <span>Enterprise</span>
              <span className="text-slate-300">|</span>
              <span>Stable</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Modals */}
      <SelectSignatoryModal
        isOpen={isSelectSignatoryOpen}
        onClose={() => setIsSelectSignatoryOpen(false)}
        onConfirm={handleConfirmSignatory}
        settings={settings}
      />

      <PrintReportModal
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        batches={batches}
        vouchers={vouchers}
        settlements={settlements}
        expenses={expenses}
        settings={settings}
        selectedItStaff={selectedItStaffSignatory}
      />

      <PrintVouchersModal
        isOpen={isPrintVouchersOpen}
        onClose={() => setIsPrintVouchersOpen(false)}
        vouchers={vouchers}
        settings={settings}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onOpenReset={() => setIsResetModalOpen(true)}
        loggedInUser={loggedInUser}
        currentRole={currentRole}
      />

      <AnimatePresence>
        {isResetModalOpen && (
          <ResetConfirmationModal
            isOpen={isResetModalOpen}
            onClose={() => setIsResetModalOpen(false)}
            onConfirm={handleResetAllData}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Darker, blurrier backdrop for an elegant depth effect */}
            <div 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
              onClick={() => setShowLogoutModal(false)}
            ></div>
            
            {/* Modern, glass-like modal body with smooth entrance animation */}
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-900/30 w-full max-w-md overflow-hidden p-8 text-center z-10 animate-in fade-in zoom-in-95 duration-300 ease-out border border-white/20">
              
              {/* Elegant Icon Container */}
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-70"></div>
                <div className="relative w-full h-full bg-gradient-to-tr from-rose-50 to-rose-100 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center shadow-inner">
                  <Power className="w-8 h-8 stroke-[2.5]" />
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Konfirmasi Keluar</h3>
              <p className="text-sm font-medium text-slate-500 mb-8 max-w-xs mx-auto leading-relaxed">
                Apakah Anda yakin ingin mengakhiri sesi dan keluar dari sistem REKAPIN?
              </p>
              
              <div className="flex items-center gap-4 w-full">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-sm hover:from-rose-700 hover:to-red-700 transition-all shadow-lg shadow-rose-600/30 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Ya, Keluar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
