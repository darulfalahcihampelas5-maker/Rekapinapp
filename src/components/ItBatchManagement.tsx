import React, { useState } from 'react';
import {
  VoucherBatch,
  VoucherItem,
  VoucherHandover,
  SettlementRecord,
  SystemSettings,
  UserRole
} from '../types';
import { formatRupiah, formatDateIndo, parseStaffNames } from '../utils/format';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import {
  ShoppingCart,
  PackageCheck,
  Layers,
  PlusCircle,
  Search,
  CheckCircle2,
  Sparkles,
  Info,
  Pencil,
  Trash2,
  X,
  Save,
  Printer,
  Receipt,
  Eye
} from 'lucide-react';

interface ItBatchManagementProps {
  batches: VoucherBatch[];
  vouchers: VoucherItem[];
  handovers: VoucherHandover[];
  settlements: SettlementRecord[];
  settings: SystemSettings;
  activeSubTab?: 'buy' | 'handover' | 'inventory';
  onAddBatch: (batch: VoucherBatch, newVouchers: VoucherItem[]) => void;
  onUpdateBatch?: (batch: VoucherBatch) => void;
  onDeleteBatch?: (batchId: string) => void;
  onHandoverVouchers: (handover: VoucherHandover, updatedVouchers: VoucherItem[]) => void;
  onUpdateHandover?: (handover: VoucherHandover, updatedVouchers: VoucherItem[]) => void;
  onDeleteHandover?: (handoverId: string, revertedVouchers: VoucherItem[]) => void;
  onReceiveSettlement: (settlement: SettlementRecord) => void;
  onNavigateTab?: (tab: string) => void;
  currentRole?: UserRole;
}

export const ItBatchManagement: React.FC<ItBatchManagementProps> = ({
  batches,
  vouchers,
  handovers,
  settlements,
  settings,
  activeSubTab = 'buy',
  onAddBatch,
  onUpdateBatch,
  onDeleteBatch,
  onHandoverVouchers,
  onUpdateHandover,
  onDeleteHandover,
  onNavigateTab,
  currentRole,
}) => {
  const isKepsek = currentRole === 'KEPALA_SEKOLAH';
  const [subTab, setSubTab] = useState<'buy' | 'handover' | 'inventory'>(activeSubTab);

  React.useEffect(() => {
    setSubTab(activeSubTab);
  }, [activeSubTab]);

  // Form State: 1. Pembelian dari PT SIDNet
  const todayStr = new Date().toISOString().split('T')[0];
  const [purchaseDate, setPurchaseDate] = useState<string>(todayStr);
  const [topupQty, setTopupQty] = useState<number | ''>('');
  const [unitCost, setUnitCost] = useState<number>(settings.costPricePerUnit || 1500);
  const [totalCostPaid, setTotalCostPaid] = useState<number | ''>('');
  const [isManualTotal, setIsManualTotal] = useState<boolean>(false);
  const [vendorName, setVendorName] = useState('PT ForIT Asta Solusindo - SIDNet');
  const [batchNotes, setBatchNotes] = useState('Pengadaan kuota voucher WiFi sekolah');

  const itStaffList = parseStaffNames(settings.itStaffNames);
  const koperasiStaffList = parseStaffNames(settings.koperasiManagerName);

  const [purchasedBy, setPurchasedBy] = useState<string>(itStaffList[0] || 'Tim IT Pengelola');

  // Edit Batch Modal State
  const [editingBatch, setEditingBatch] = useState<VoucherBatch | null>(null);
  const [editPurchaseDate, setEditPurchaseDate] = useState<string>('');
  const [editVoucherQty, setEditVoucherQty] = useState<number>(0);
  const [editTotalCost, setEditTotalCost] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');
  const [editProviderName, setEditProviderName] = useState<string>('');
  const [editPurchasedBy, setEditPurchasedBy] = useState<string>('');

  // Form State: 2. Serah Terima ke Koperasi
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [handoverDate, setHandoverDate] = useState<string>(todayStr);
  const [handoverQty, setHandoverQty] = useState<number | ''>('');

  const [giverName, setGiverName] = useState(itStaffList[0] || 'Tim IT Pengelola');
  const [receiverName, setReceiverName] = useState(koperasiStaffList[0] || `Pengurus ${settings.koperasiName}`);
  const [handoverNotes, setHandoverNotes] = useState('Penyerahan voucher fisik untuk dijual di koperasi');

  // Custom dialog and toast states
  const [deleteConfirmBatch, setDeleteConfirmBatch] = useState<VoucherBatch | null>(null);
  
  // Handover Receipt modal state
  const [selectedHandoverReceipt, setSelectedHandoverReceipt] = useState<VoucherHandover | null>(null);

  // Handover Edit & Delete states
  const [editingHandover, setEditingHandover] = useState<VoucherHandover | null>(null);
  const [editHandoverDate, setEditHandoverDate] = useState<string>('');
  const [editHandoverQty, setEditHandoverQty] = useState<number>(0);
  const [editHandoverGiver, setEditHandoverGiver] = useState<string>('');
  const [editHandoverReceiver, setEditHandoverReceiver] = useState<string>('');
  const [editHandoverNotes, setEditHandoverNotes] = useState<string>('');
  const [deleteConfirmHandover, setDeleteConfirmHandover] = useState<VoucherHandover | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Sync default names from settings when they load or change
  React.useEffect(() => {
    const itList = parseStaffNames(settings.itStaffNames);
    const koperasiList = parseStaffNames(settings.koperasiManagerName);

    if (itList.length > 0) {
      setGiverName(itList[0]);
      setPurchasedBy(itList[0]);
    } else {
      setGiverName('Tim IT Pengelola');
      setPurchasedBy('Tim IT Pengelola');
    }

    if (koperasiList.length > 0) {
      setReceiverName(koperasiList[0]);
    } else {
      setReceiverName(`Pengurus ${settings.koperasiName}`);
    }
  }, [settings]);

  // Sync selectedBatchId when batches change
  React.useEffect(() => {
    if (batches.length > 0) {
      if (!selectedBatchId || !batches.some(b => b.id === selectedBatchId)) {
        setSelectedBatchId(batches[0].id);
      }
    } else {
      setSelectedBatchId('');
    }
  }, [batches, selectedBatchId]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Auto calculate total cost when qty or unit cost changes
  const handleQtyChange = (newQty: number | '') => {
    setTopupQty(newQty);
    if (!isManualTotal) {
      if (newQty === '') {
        setTotalCostPaid('');
      } else {
        setTotalCostPaid(newQty * unitCost);
      }
    }
  };

  const handleUnitCostChange = (newUnitCost: number) => {
    setUnitCost(newUnitCost);
    if (!isManualTotal) {
      if (topupQty === '') {
        setTotalCostPaid('');
      } else {
        setTotalCostPaid(topupQty * newUnitCost);
      }
    }
  };

  // Open Edit Batch
  const handleOpenEdit = (b: VoucherBatch) => {
    setEditingBatch(b);
    setEditPurchaseDate(b.purchaseDate);
    setEditVoucherQty(b.voucherQty);
    setEditTotalCost(b.totalCost);
    setEditNotes(b.notes || '');
    setEditProviderName(b.providerName || settings.providerName);
    setEditPurchasedBy(b.purchasedBy || itStaffList[0] || 'Tim IT Pengelola');
  };

  // Save Edit Batch
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBatch || !onUpdateBatch) return;

    const updated: VoucherBatch = {
      ...editingBatch,
      purchaseDate: editPurchaseDate,
      voucherQty: editVoucherQty,
      totalCost: editTotalCost,
      unitCost: editVoucherQty > 0 ? Math.round(editTotalCost / editVoucherQty) : editingBatch.unitCost,
      notes: editNotes,
      providerName: editProviderName,
      purchasedBy: editPurchasedBy || 'Tim IT Pengelola',
    };

    onUpdateBatch(updated);
    setEditingBatch(null);
    showToast(`Berhasil memperbarui data batch ${updated.batchNumber}!`, 'success');
  };

  // Delete Batch
  const handleDeleteBatch = (b: VoucherBatch) => {
    setDeleteConfirmBatch(b);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmBatch || !onDeleteBatch) return;
    onDeleteBatch(deleteConfirmBatch.id);
    showToast(`Berhasil menghapus batch ${deleteConfirmBatch.batchNumber}!`, 'success');
    setDeleteConfirmBatch(null);
  };

  // Open Edit Handover
  const handleOpenEditHandover = (h: VoucherHandover) => {
    setEditingHandover(h);
    setEditHandoverDate(h.transferDate);
    setEditHandoverQty(h.qty);
    setEditHandoverGiver(h.giverName);
    setEditHandoverReceiver(h.receiverName);
    setEditHandoverNotes(h.notes || '');
  };

  // Save Edit Handover
  const handleSaveEditHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHandover || !onUpdateHandover) return;

    const oldQty = editingHandover.qty;
    const newQty = editHandoverQty;

    if (newQty <= 0) {
      showToast('Jumlah voucher serah terima harus lebih dari 0.', 'error');
      return;
    }

    let updatedVouchers: VoucherItem[] = [];

    if (newQty > oldQty) {
      // Need to move (newQty - oldQty) vouchers of this batch from DI_IT to DI_KOPERASI
      const diff = newQty - oldQty;
      const availableAtIt = vouchers.filter(v => v.batchId === editingHandover.batchId && v.status === 'DI_IT');
      
      if (availableAtIt.length < diff) {
        showToast(`Stok voucher di Tim IT tersisa ${availableAtIt.length}. Tidak cukup untuk menambah serah terima sebanyak ${diff} voucher.`, 'error');
        return;
      }

      const vouchersToTransfer = availableAtIt.slice(0, diff);
      updatedVouchers = vouchers.map(v => {
        if (vouchersToTransfer.some(vt => vt.id === v.id)) {
          return {
            ...v,
            status: 'DI_KOPERASI' as const,
            koperasiReceiver: editHandoverReceiver,
          };
        }
        return v;
      });
    } else if (newQty < oldQty) {
      // Need to move (oldQty - newQty) vouchers of this batch from DI_KOPERASI back to DI_IT
      const diff = oldQty - newQty;
      const availableAtKop = vouchers.filter(v => v.batchId === editingHandover.batchId && v.status === 'DI_KOPERASI');

      if (availableAtKop.length < diff) {
        showToast(`Gagal merubah jumlah karena hanya ada ${availableAtKop.length} voucher di Koperasi yang berstatus belum terjual (beberapa sudah laku terjual).`, 'error');
        return;
      }

      const vouchersToRevert = availableAtKop.slice(0, diff);
      updatedVouchers = vouchers.map(v => {
        if (vouchersToRevert.some(vr => vr.id === v.id)) {
          return {
            ...v,
            status: 'DI_IT' as const,
            koperasiReceiver: '',
          };
        }
        return v;
      });
    }

    const updatedHandover: VoucherHandover = {
      ...editingHandover,
      transferDate: editHandoverDate,
      qty: newQty,
      giverName: editHandoverGiver,
      receiverName: editHandoverReceiver,
      notes: editHandoverNotes,
    };

    onUpdateHandover(updatedHandover, updatedVouchers);
    setEditingHandover(null);
    showToast(`Berhasil memperbarui data serah terima batch ${updatedHandover.batchNumber}!`, 'success');
  };

  // Delete Handover
  const handleDeleteHandoverClick = (h: VoucherHandover) => {
    setDeleteConfirmHandover(h);
  };

  const handleConfirmDeleteHandover = () => {
    if (!deleteConfirmHandover || !onDeleteHandover) return;

    // Return the handovers back to DI_IT
    const availableAtKop = vouchers.filter(v => v.batchId === deleteConfirmHandover.batchId && v.status === 'DI_KOPERASI');
    
    // We can revert up to deleteConfirmHandover.qty vouchers that are still in DI_KOPERASI status
    const qtyToRevert = Math.min(deleteConfirmHandover.qty, availableAtKop.length);
    const vouchersToRevert = availableAtKop.slice(0, qtyToRevert);

    const revertedVouchers = vouchers.map(v => {
      if (vouchersToRevert.some(vr => vr.id === v.id)) {
        return {
          ...v,
          status: 'DI_IT' as const,
          koperasiReceiver: '',
        };
      }
      return v;
    });

    onDeleteHandover(deleteConfirmHandover.id, revertedVouchers);
    showToast(`Berhasil menghapus serah terima batch ${deleteConfirmHandover.batchNumber} dan mengembalikan voucher ke Tim IT.`, 'success');
    setDeleteConfirmHandover(null);
  };

  // Submit: 1. Pembelian dari PT SIDNet
  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = topupQty === '' ? 0 : Number(topupQty);
    const cost = totalCostPaid === '' ? 0 : Number(totalCostPaid);

    if (qty <= 0) {
      showToast('Jumlah voucher yang dibeli harus lebih dari 0.', 'error');
      return;
    }
    if (cost <= 0) {
      showToast('Jumlah uang yang dibayarkan harus lebih dari 0.', 'error');
      return;
    }

    const newBatchId = `batch-${Date.now()}`;
    const batchNumber = `BATCH-${purchaseDate.replace(/-/g, '')}-${String.fromCharCode(65 + (batches.length % 26))}`;

    const newBatch: VoucherBatch = {
      id: newBatchId,
      batchNumber,
      providerName: vendorName,
      purchaseDate: purchaseDate,
      voucherQty: qty,
      unitCost: unitCost,
      totalCost: cost,
      status: 'TERSEDIA',
      notes: batchNotes,
      serialPrefix: `VOU-${String.fromCharCode(65 + (batches.length % 26))}`,
      serialStart: 1001,
      serialEnd: 1000 + qty,
      purchasedBy: purchasedBy || 'Tim IT Pengelola',
    };

    // Tracking items
    const newVouchers: VoucherItem[] = [];
    for (let i = 1; i <= topupQty; i++) {
      newVouchers.push({
        id: `v-${newBatchId}-${i}`,
        batchId: newBatchId,
        batchNumber: batchNumber,
        code: `${batchNumber}-${i}`,
        serialNumber: `${newBatch.serialPrefix}-${1000 + i}`,
        duration: '6 Jam',
        status: 'DI_IT',
        unitCost: unitCost,
        sellingPrice: settings.sellPricePerUnit || 3000,
      });
    }

    onAddBatch(newBatch, newVouchers);
    showToast(`Berhasil mencatat pembelian ${topupQty} voucher dari ${vendorName} sebesar ${formatRupiah(totalCostPaid)}!`, 'success');
    
    // Reset form after purchase
    setTopupQty(200);
    setTotalCostPaid(200 * unitCost);
  };

  // Submit: 2. Serah Terima ke Koperasi
  const handleHandoverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBatch = batches.find(b => b.id === selectedBatchId);
    if (!targetBatch) {
      showToast('Silakan pilih batch voucher yang akan diserahkan.', 'error');
      return;
    }

    const qty = Number(handoverQty);
    if (qty <= 0) {
      showToast('Jumlah voucher harus lebih dari 0.', 'error');
      return;
    }

    const availableAtIt = vouchers.filter(v => v.batchId === selectedBatchId && v.status === 'DI_IT');
    if (availableAtIt.length < qty) {
      showToast(`Stok voucher di Tim IT untuk batch ini tersisa ${availableAtIt.length} voucher. Tidak cukup untuk menyerahkan ${qty} voucher.`, 'error');
      return;
    }

    const newHandover: VoucherHandover = {
      id: `ho-${Date.now()}`,
      transferDate: handoverDate,
      batchId: targetBatch.id,
      batchNumber: targetBatch.batchNumber,
      qty: qty,
      giverName,
      receiverName,
      notes: handoverNotes,
      status: 'DITERIMA',
    };

    const vouchersToTransfer = availableAtIt.slice(0, qty);
    const updatedVouchers = vouchers.map(v => {
      if (vouchersToTransfer.some(vt => vt.id === v.id)) {
        return {
          ...v,
          status: 'DI_KOPERASI' as const,
          koperasiReceiver: receiverName,
        };
      }
      return v;
    });

    onHandoverVouchers(newHandover, updatedVouchers);
    setSelectedHandoverReceipt(newHandover);
    showToast(`Sukses! ${handoverQty} Voucher diserahkan. Tanda terima siap dicetak.`, 'success');
  };

  const availableStockInItTotal = vouchers.filter(v => v.status === 'DI_IT').length;

  return (
    <div className="space-y-6">
      
      {/* Top Status Bar with IT Stock */}
      <div className="flex flex-col items-center justify-center bg-white px-4 py-5 rounded-2xl border border-slate-200/85 shadow-xs gap-3">
        {subTab === 'buy' && (
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Manajemen Pembelian Voucher
          </span>
        )}
        <div className="flex items-center justify-center gap-2.5 px-6 py-2.5 bg-emerald-50 rounded-xl border border-emerald-200 w-full max-w-sm">
          <span className="text-emerald-800 font-bold text-sm sm:text-base">Stok di Tim IT:</span>
          <span className="font-black text-emerald-700 text-lg sm:text-xl drop-shadow-sm">{availableStockInItTotal} Voucher</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: FORMULIR PEMBELIAN DARI PT SIDNET                              */}
      {/* ========================================================================= */}
      {subTab === 'buy' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Purchase Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShoppingCart className="w-4.5 h-4.5 text-emerald-600" />
                  Form Pembelian Voucher
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pembelian voucher dari {vendorName || 'Mitra Vendor'}
                </p>
              </div>
            </div>

            {/* Supervision Notice for Kepala Sekolah */}
            {isKepsek && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center gap-3 shadow-xs">
                <span className="text-xl">👁️</span>
                <div>
                  <h4 className="font-bold text-sm text-amber-900">Mode Pengawasan Kepala Sekolah (Hanya Mengawasi)</h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Anda sedang memantau data transaksi pembelian voucher ke vendor. Formulir pembelian serta tombol ubah dan hapus dinonaktifkan khusus untuk Tim IT.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handlePurchaseSubmit} className="space-y-4">
              <fieldset disabled={isKepsek} className="space-y-4 disabled:opacity-85">
              {/* Tiga Bagian Utama Input Pembelian */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-emerald-200 text-xs font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Data Transaksi Pembelian:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* A. Tanggal Transaksi */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">A</span>
                      <span>Tanggal Transaksi</span>
                    </label>
                    <input
                      type="date"
                      id="input-purchase-date"
                      required
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">Waktu pembelian</span>
                  </div>

                  {/* B. Jumlah Voucher yang Dibeli */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">B</span>
                      <span>Jumlah Voucher Dibeli</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="input-topup-qty"
                        min="1"
                        step="1"
                        required
                        value={topupQty === '' ? '' : topupQty}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            handleQtyChange('');
                          } else {
                            handleQtyChange(Number(val));
                          }
                        }}
                        placeholder="Contoh: 200"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">Voucher</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Volume kuota</span>
                  </div>

                  {/* C. Jumlah Uang yang Dibayarkan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">C</span>
                      <span>Uang yang Dibayarkan</span>
                    </label>
                    <input
                      type="number"
                      id="input-total-cost"
                      min="1000"
                      step="500"
                      required
                      value={totalCostPaid === '' ? '' : totalCostPaid}
                      onChange={(e) => {
                        setIsManualTotal(true);
                        const val = e.target.value;
                        if (val === '') {
                          setTotalCostPaid('');
                        } else {
                          setTotalCostPaid(Number(val));
                        }
                      }}
                      placeholder="Contoh: 300000"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-emerald-800 font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    />
                    <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                      = {topupQty === '' ? 0 : topupQty} vcr &times; {formatRupiah(unitCost)}
                    </span>
                  </div>

                </div>

                {/* Quick Volume Preset Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-600 font-medium">Pilihan Cepat Volume:</span>
                  {[50, 100, 200, 300, 500].map((q) => (
                    <button
                      type="button"
                      key={q}
                      onClick={() => handleQtyChange(q)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                        topupQty === q
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {q} Vcr
                    </button>
                  ))}
                </div>
              </div>

              {/* Petugas IT & Vendor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>Yang melakukan Pembelian :</span>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Tim IT
                    </span>
                  </label>
                  <select
                    id="input-purchaser-name"
                    value={purchasedBy}
                    onChange={(e) => setPurchasedBy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                  >
                    {itStaffList.map((st, idx) => (
                      <option key={idx} value={st}>
                        {st}
                      </option>
                    ))}
                    {!itStaffList.includes(purchasedBy) && purchasedBy && (
                      <option value={purchasedBy}>{purchasedBy}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Mitra Penyedia (Vendor)
                  </label>
                  <input
                    type="text"
                    required
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Harga Modal / Voucher (Rp)
                  </label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    required
                    value={unitCost}
                    onChange={(e) => handleUnitCostChange(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan / Keterangan Pembelian
                  </label>
                  <input
                    type="text"
                    value={batchNotes}
                    onChange={(e) => setBatchNotes(e.target.value)}
                    placeholder="Keterangan pembelian..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Total Tagihan: <strong className="text-slate-900">{formatRupiah(totalCostPaid)}</strong>
                </div>

                {isKepsek ? (
                  <div className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs border border-slate-200 text-center">
                    Aksi Dinonaktifkan (Mode Pengawasan Kepala Sekolah)
                  </div>
                ) : (
                  <button
                    type="submit"
                    id="btn-submit-purchase"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Simpan Pembelian
                  </button>
                )}
              </div>
              </fieldset>

            </form>
          </div>

          {/* Right Column: Rekap Pembelian Terakhir */}
          <div className="space-y-4">
            
            {/* Recent Purchases List */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Riwayat Pembelian
              </h4>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {batches.length > 0 ? (
                  batches.map((b) => (
                    <div key={b.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{b.batchNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {b.voucherQty} Voucher
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>Tgl: {formatDateIndo(b.purchaseDate)}</span>
                        <span className="font-bold text-slate-800">{formatRupiah(b.totalCost)}</span>
                      </div>
                      <div className="text-[11px] text-slate-700 bg-emerald-50/60 rounded px-2 py-1 border border-emerald-100 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Yang melakukan Pembelian :</span>
                        <span className="font-bold text-emerald-800">{b.purchasedBy || 'Tim IT Pengelola'}</span>
                      </div>
                      {b.notes && (
                        <p className="text-[10px] text-slate-400 truncate">{b.notes}</p>
                      )}
                      {!isKepsek && (
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(b)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3 h-3 text-slate-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBatch(b)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">Belum ada riwayat pembelian.</p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: SERAH TERIMA VOUCHER FISIK KE KOPERASI                         */}
      {/* ========================================================================= */}
      {subTab === 'handover' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Handover Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <PackageCheck className="w-4.5 h-4.5 text-emerald-600" />
                  Form Penyerahan Voucher
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Penyerahan kupon fisik ke pengurus koperasi untuk dijual langsung kepada siswa
                </p>
              </div>
            </div>

            {/* Supervision Notice for Kepala Sekolah */}
            {isKepsek && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center gap-3 shadow-xs">
                <span className="text-xl">👁️</span>
                <div>
                  <h4 className="font-bold text-sm text-amber-900">Mode Pengawasan Kepala Sekolah (Hanya Mengawasi)</h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Anda sedang memantau data serah terima voucher ke Koperasi. Formulir penyerahan voucher baru serta tombol ubah dan hapus dinonaktifkan khusus untuk Tim IT. Anda dapat mencetak tanda terima untuk verifikasi.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleHandoverSubmit} className="space-y-4">
              <fieldset disabled={isKepsek} className="space-y-4 disabled:opacity-85">
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-emerald-200 text-xs font-bold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Data Penyerahan Kupon Fisik:</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">A</span>
                    <span>Pilih Batch Voucher Sumber (Stok di Tim IT)</span>
                  </label>
                  <select
                    value={selectedBatchId}
                    onChange={(e) => setSelectedBatchId(e.target.value)}
                    disabled={batches.length === 0}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    {batches.length === 0 ? (
                      <option value="">-- Belum ada batch voucher yang dibeli (Stok Kosong) --</option>
                    ) : (
                      batches.map((b) => {
                        const countInIt = vouchers.filter(v => v.batchId === b.id && v.status === 'DI_IT').length;
                        return (
                          <option key={b.id} value={b.id} disabled={countInIt === 0}>
                            {b.batchNumber} &bull; Sisa di IT: {countInIt} Voucher (Beli: {formatDateIndo(b.purchaseDate)})
                          </option>
                        );
                      })
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">B</span>
                      <span>Tanggal Penyerahan</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={handoverDate}
                      onChange={(e) => setHandoverDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">C</span>
                      <span>Jumlah Voucher Diserahkan</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        required
                        value={handoverQty}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHandoverQty(val === '' ? '' : Number(val));
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">Voucher</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">D</span>
                      <span>Nama Penyerah (Tim IT)</span>
                    </label>
                  <select
                    required
                    value={giverName}
                    onChange={(e) => setGiverName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
                  >
                    {itStaffList.length === 0 ? (
                      <option value="Tim IT Pengelola">Tim IT Pengelola</option>
                    ) : (
                      itStaffList.map((name, idx) => (
                        <option key={idx} value={name}>{name}</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">E</span>
                    <span>Nama Penerima ({settings.koperasiName})</span>
                  </label>
                  <select
                    required
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
                  >
                    {koperasiStaffList.length === 0 ? (
                      <option value={`Pengurus ${settings.koperasiName}`}>Pengurus {settings.koperasiName}</option>
                    ) : (
                      koperasiStaffList.map((name, idx) => (
                        <option key={idx} value={name}>{name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">F</span>
                  <span>Catatan Berita Acara Serah Terima</span>
                </label>
                <input
                  type="text"
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Potensi Nilai Jual: <strong className="text-emerald-800">{formatRupiah((Number(handoverQty) || 0) * (settings.sellPricePerUnit || 3000))}</strong>
                </span>
                {isKepsek ? (
                  <div className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs border border-slate-200 text-center">
                    Aksi Dinonaktifkan (Mode Pengawasan Kepala Sekolah)
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <PackageCheck className="w-4 h-4" />
                    Simpan Penyerahan ke Koperasi
                  </button>
                )}
              </div>
              </fieldset>

            </form>
          </div>

          {/* Right Column: Handover Logs */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Riwayat Penyerahan / Distribusi Voucher:
            </h4>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {handovers.length > 0 ? (
                handovers.map((h) => (
                  <div key={h.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{h.batchNumber}</span>
                      <span className="font-extrabold text-emerald-800">{h.qty} Voucher</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Diserahkan oleh: <strong>{h.giverName}</strong> &rarr; <strong>{h.receiverName}</strong>
                    </p>
                    {h.notes && (
                      <p className="text-[10px] text-slate-500 italic bg-slate-100/50 p-1 rounded">
                        Catatan: {h.notes}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                      <span>{formatDateIndo(h.transferDate)}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedHandoverReceipt(h)}
                          className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer border border-emerald-200"
                          title="Cetak Bukti Tanda Terima"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Cetak Tanda Terima</span>
                        </button>
                        {!isKepsek && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEditHandover(h)}
                              className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                              title="Edit Distribusi"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHandoverClick(h)}
                              className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Hapus Distribusi & Tarik Voucher"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">Belum ada serah terima voucher ke koperasi.</p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: INVENTARIS BATCH & STOK                                        */}
      {/* ========================================================================= */}
      {subTab === 'inventory' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                Daftar Seluruh Batch & Alokasi Stok Voucher
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pantau jumlah voucher di Tim IT, Koperasi, dan yang sudah terjual
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor batch..."
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Nomor Batch</th>
                  <th className="py-3 px-4">Tgl Pembelian</th>
                  <th className="py-3 px-4">Total Kuota</th>
                  <th className="py-3 px-4">Stok di IT</th>
                  <th className="py-3 px-4">Di Koperasi</th>
                  <th className="py-3 px-4">Terjual</th>
                  <th className="py-3 px-4">Uang Dibayarkan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.length > 0 ? (
                  batches
                    .filter(b => b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) || b.providerName.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((b) => {
                      const totalBatchVouchers = vouchers.filter(v => v.batchId === b.id);
                      const countInIt = totalBatchVouchers.filter(v => v.status === 'DI_IT').length;
                      const countInKoperasi = totalBatchVouchers.filter(v => v.status === 'DI_KOPERASI').length;
                      const countSold = totalBatchVouchers.filter(v => v.status === 'TERJUAL').length;

                      return (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{b.batchNumber}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <span className="text-slate-400">Oleh:</span>
                              <span className="font-semibold text-emerald-700">{b.purchasedBy || 'Tim IT'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{formatDateIndo(b.purchaseDate)}</td>
                           <td className="py-3.5 px-4 font-bold text-slate-900">{b.voucherQty} Voucher</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              countInIt > 0 ? 'bg-slate-100 text-slate-800' : 'text-slate-400'
                            }`}>
                              {countInIt} Vcr
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              countInKoperasi > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'text-slate-400'
                            }`}>
                              {countInKoperasi} Vcr
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-emerald-700">{countSold} Vcr</span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{formatRupiah(b.totalCost)}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Tercatat
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {!isKepsek ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(b)}
                                  title="Edit Batch"
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBatch(b)}
                                  title="Hapus Batch"
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Hanya Pantau</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                      Belum ada batch voucher yang terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Edit Riwayat Pembelian
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {editingBatch.batchNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBatch(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tanggal Transaksi Pembelian
                </label>
                <input
                  type="date"
                  required
                  value={editPurchaseDate}
                  onChange={(e) => setEditPurchaseDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jumlah Voucher
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editVoucherQty}
                    onChange={(e) => {
                      const newQty = Number(e.target.value);
                      setEditVoucherQty(newQty);
                      setEditTotalCost(newQty * (settings.costPricePerUnit || 1500));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Total Biaya Dibayarkan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editTotalCost}
                    onChange={(e) => setEditTotalCost(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Yang melakukan Pembelian (Tim IT)
                  </label>
                  <select
                    value={editPurchasedBy}
                    onChange={(e) => setEditPurchasedBy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {itStaffList.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                    {!itStaffList.includes(editPurchasedBy) && editPurchasedBy && (
                      <option value={editPurchasedBy}>{editPurchasedBy}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Mitra Penyedia (Vendor)
                  </label>
                  <input
                    type="text"
                    required
                    value={editProviderName}
                    onChange={(e) => setEditProviderName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Transaksi
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-in">
          <div className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-bold text-white ${
            toast.type === 'success' ? 'bg-emerald-600 border border-emerald-500' :
            toast.type === 'error' ? 'bg-rose-600 border border-rose-500' : 'bg-slate-700 border border-slate-600'
          }`}>
            <Info className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Konfirmasi Hapus</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus <strong>{deleteConfirmBatch.batchNumber}</strong> ({deleteConfirmBatch.voucherQty} Voucher)? Tindakan ini permanen di Firebase Firestore.
                </p>
                {vouchers.filter(v => v.batchId === deleteConfirmBatch.id && v.status === 'TERJUAL').length > 0 && (
                  <p className="text-[11px] text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-100 mt-2">
                    ⚠ Perhatian: Beberapa voucher dari batch ini sudah laku terjual!
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmBatch(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Handover Modal */}
      {editingHandover && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Edit Penyerahan / Distribusi Voucher
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {editingHandover.batchNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingHandover(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditHandover} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tanggal Serah Terima
                </label>
                <input
                  type="date"
                  required
                  value={editHandoverDate}
                  onChange={(e) => setEditHandoverDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jumlah Voucher yang Diserahkan
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editHandoverQty}
                  onChange={(e) => setEditHandoverQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Sistem otomatis menyesuaikan stok di Tim IT dan Koperasi berdasarkan selisih jumlah baru.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Diserahkan Oleh (Tim IT)
                  </label>
                  <select
                    value={editHandoverGiver}
                    onChange={(e) => setEditHandoverGiver(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {itStaffList.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Diterima Oleh (Koperasi)
                  </label>
                  <select
                    value={editHandoverReceiver}
                    onChange={(e) => setEditHandoverReceiver(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    {koperasiStaffList.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Serah Terima
                </label>
                <input
                  type="text"
                  value={editHandoverNotes}
                  onChange={(e) => setEditHandoverNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingHandover(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Handover Confirmation Modal */}
      {deleteConfirmHandover && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Konfirmasi Hapus Distribusi</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus riwayat serah terima batch <strong>{deleteConfirmHandover.batchNumber}</strong> ({deleteConfirmHandover.qty} Voucher)?
                </p>
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 mt-2">
                  ℹ Voucher yang belum terjual di koperasi otomatis ditarik kembali ke persediaan Tim IT.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmHandover(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteHandover}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Hapus & Tarik Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handover Receipt Modal (Modern A4 Formal Handover Document) */}
      {selectedHandoverReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print-container">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 print:border-none print:shadow-none print:max-w-full print:p-0">
            
            {/* Header (Hidden on Print) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Berita Acara & Tanda Terima Penyerahan Voucher</h4>
                  <p className="text-[11px] text-slate-500">Bukti serah terima voucher fisik dari Tim IT ke Koperasi</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedHandoverReceipt(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Printable Area (1-Page A4 Ready) */}
            <div id="print-handover-area" className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs space-y-4 font-sans print:bg-white print:border-none print:p-0">
              
              {/* Kop Surat Header */}
              <div className="pb-3 border-b-2 border-slate-900 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight font-sans">
                    <span className="text-[#CC2302]">REKAPIN</span> <span className="text-sky-600">AJA</span>
                  </h3>
                  <p className="text-[10px] font-bold text-slate-700 uppercase">
                    UNIT TEKNOLOGI INFORMASI & {settings.koperasiName.toUpperCase()}
                  </p>
                  <p className="text-[9px] text-slate-500">
                    Berita Acara Serah Terima Fisik Kuota Voucher WiFi
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold bg-cyan-100 text-cyan-800 uppercase tracking-widest border border-cyan-200">
                    BERITA ACARA RESMI
                  </span>
                  <p className="text-[10px] font-mono font-bold text-slate-700 mt-1">
                    ID: {selectedHandoverReceipt.id}
                  </p>
                  <p className="text-[9px] text-slate-500">
                    Tgl: {formatDateIndo(selectedHandoverReceipt.transferDate)}
                  </p>
                </div>
              </div>

              {/* Transaction Highlight Banner */}
              <div className="bg-slate-900 text-white rounded-xl p-3.5 flex justify-between items-center shadow-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 block">
                    Jumlah Voucher Diserahkan
                  </span>
                  <span className="text-xl font-black text-emerald-400 tracking-tight">
                    {selectedHandoverReceipt.qty} Voucher Fisik
                  </span>
                </div>
                <div className="text-right border-l border-slate-700 pl-3">
                  <span className="text-[9px] text-slate-300 block">Batch Voucher</span>
                  <span className="text-xs font-bold text-slate-100">{selectedHandoverReceipt.batchNumber}</span>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-[11px]">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 text-slate-600 bg-slate-50 w-2/5">Nomor Batch Source</td>
                      <td className="p-2 font-bold text-slate-900">{selectedHandoverReceipt.batchNumber}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 text-slate-600 bg-slate-50">Volume Kuantitas</td>
                      <td className="p-2 font-bold text-slate-900">{selectedHandoverReceipt.qty} Lembar Voucher</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 text-slate-600 bg-slate-50">Estimasi Omset Jual (@3.000)</td>
                      <td className="p-2 font-bold text-emerald-700">{formatRupiah(selectedHandoverReceipt.qty * (settings.sellPricePerUnit || 3000))}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-600 bg-slate-50">Keterangan / Catatan</td>
                      <td className="p-2 text-slate-800 italic">{selectedHandoverReceipt.notes || 'Penyerahan voucher fisik untuk dijual di etalase koperasi.'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-3 border-t border-slate-300 grid grid-cols-2 text-center text-[10px] gap-3">
                <div className="border border-slate-200 rounded p-2 bg-white">
                  <span className="text-slate-500 font-bold block uppercase">Yang Menyerahkan (Tim IT)</span>
                  <div className="h-10 flex items-end justify-center">
                    <span className="font-bold text-slate-900 underline">{selectedHandoverReceipt.giverName}</span>
                  </div>
                </div>
                <div className="border border-slate-200 rounded p-2 bg-white">
                  <span className="text-slate-500 font-bold block uppercase">Yang Menerima ({settings.koperasiName})</span>
                  <div className="h-10 flex items-end justify-center">
                    <span className="font-bold text-slate-900 underline">{selectedHandoverReceipt.receiverName}</span>
                  </div>
                </div>
              </div>

              <p className="text-center text-[8px] text-slate-400 italic">
                Dokumen berita acara ini berlaku sebagai bukti sah perpindahan inventaris fisik voucher WiFi.
              </p>

            </div>

            {/* Modal Controls */}
            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={async () => {
                  const element = document.getElementById('print-handover-area');
                  if (!element) return;
                  
                  try {
                    const dataUrl = await toPng(element, {
                      quality: 1.0,
                      pixelRatio: 3,
                      backgroundColor: '#ffffff',
                      cacheBust: true,
                    });
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    const margin = 10;
                    const availWidth = pageWidth - (margin * 2);
                    const availHeight = pageHeight - (margin * 2);

                    const elemWidth = element.scrollWidth || element.offsetWidth;
                    const elemHeight = element.scrollHeight || element.offsetHeight;
                    const contentRatio = elemHeight / elemWidth;

                    let renderWidth = availWidth;
                    let renderHeight = renderWidth * contentRatio;

                    if (renderHeight > availHeight) {
                      renderHeight = availHeight;
                      renderWidth = renderHeight / contentRatio;
                    }

                    const posX = margin + (availWidth - renderWidth) / 2;
                    const posY = margin + (availHeight - renderHeight) / 2;

                    pdf.addImage(dataUrl, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
                    pdf.save(`Tanda_Terima_Voucher_${selectedHandoverReceipt.id.slice(0, 6)}.pdf`);
                  } catch (err) {
                    console.error('Error generating PDF:', err);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
              <button
                onClick={() => setSelectedHandoverReceipt(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
