import React, { useState } from 'react';
import { ExpenseRecord, SystemSettings, SettlementRecord, UserRole } from '../types';
import { formatRupiah, formatDateIndo, parseStaffNames } from '../utils/format';
import { ReceiptText, Plus, Trash2, Calendar, Tag, Wallet, User, FileText, TrendingUp, TrendingDown, ArrowUpRight, Pencil, Save, X, Sparkles, Eye } from 'lucide-react';

interface ExpenseManagementProps {
  expenses: ExpenseRecord[];
  settlements: SettlementRecord[];
  settings: SystemSettings;
  onAddExpense: (expense: ExpenseRecord) => Promise<void> | void;
  onUpdateExpense?: (expense: ExpenseRecord) => Promise<void> | void;
  onDeleteExpense?: (id: string) => Promise<void> | void;
  currentRole?: UserRole;
}

export const ExpenseManagement: React.FC<ExpenseManagementProps> = ({
  expenses,
  settlements,
  settings,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  currentRole,
}) => {
  const isKepsek = currentRole === 'KEPALA_SEKOLAH';
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState<string>(todayStr);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<ExpenseRecord['category']>('OPERASIONAL_IT');
  const [amount, setAmount] = useState<string>('');

  const itStaffList = parseStaffNames(settings.itStaffNames);
  const [recordedBy, setRecordedBy] = useState<string>(itStaffList[0] || 'Tim IT');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast / Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Edit Expense State
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<ExpenseRecord['category']>('OPERASIONAL_IT');
  const [editAmount, setEditAmount] = useState<string>('');
  const [editRecordedBy, setEditRecordedBy] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Expense State
  const [deleteConfirmExpense, setDeleteConfirmExpense] = useState<ExpenseRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync default recorder name when settings change
  React.useEffect(() => {
    const list = parseStaffNames(settings.itStaffNames);
    if (list.length > 0) {
      setRecordedBy(list[0]);
    } else {
      setRecordedBy('Tim IT');
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) {
      showToast('Mohon isi nama pengeluaran dan nominal dengan benar.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newExpense: ExpenseRecord = {
        id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        date,
        title: title.trim(),
        category,
        amount: Number(amount),
        recordedBy: recordedBy.trim() || 'Tim IT',
        notes: notes.trim(),
      };

      await onAddExpense(newExpense);
      setTitle('');
      setAmount('');
      setNotes('');
      showToast('Catatan pengeluaran berhasil disimpan.', 'success');
    } catch (err: any) {
      console.error('Error adding expense:', err);
      showToast('Gagal menyimpan pengeluaran: ' + (err?.message || 'Terjadi kesalahan pada Firebase database.'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (exp: ExpenseRecord) => {
    setEditingExpense(exp);
    setEditDate(exp.date);
    setEditTitle(exp.title);
    setEditCategory(exp.category);
    setEditAmount(exp.amount.toString());
    setEditRecordedBy(exp.recordedBy || itStaffList[0] || 'Tim IT');
    setEditNotes(exp.notes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    if (!editTitle.trim() || !editAmount || Number(editAmount) <= 0) {
      showToast('Mohon isi nama pengeluaran dan nominal dengan benar.', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const updatedExpense: ExpenseRecord = {
        ...editingExpense,
        date: editDate,
        title: editTitle.trim(),
        category: editCategory,
        amount: Number(editAmount),
        recordedBy: editRecordedBy.trim() || 'Tim IT',
        notes: editNotes.trim(),
      };

      if (onUpdateExpense) {
        await onUpdateExpense(updatedExpense);
      } else {
        await onAddExpense(updatedExpense);
      }

      setEditingExpense(null);
      showToast('Catatan pengeluaran berhasil diperbarui.', 'success');
    } catch (err: any) {
      console.error('Error updating expense:', err);
      showToast('Gagal memperbarui pengeluaran: ' + (err?.message || 'Terjadi kesalahan pada Firebase.'), 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmExpense || !onDeleteExpense) return;
    setIsDeleting(true);
    try {
      await onDeleteExpense(deleteConfirmExpense.id);
      showToast(`Berhasil menghapus catatan pengeluaran "${deleteConfirmExpense.title}".`, 'success');
      setDeleteConfirmExpense(null);
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      showToast('Gagal menghapus pengeluaran: ' + (err?.message || 'Terjadi kesalahan pada database.'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Calculate IT Profit
  const totalVouchersSold = settlements.reduce((acc, s) => acc + s.vouchersCount, 0);
  const totalProfitIt = totalVouchersSold * (settings.itProfitPerUnit ?? 750);
  const currentBalance = totalProfitIt - totalExpenses;

  const getCategoryBadge = (cat: ExpenseRecord['category']) => {
    switch (cat) {
      case 'OPERASIONAL_IT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CETAK_KUPON':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'PERANGKAT_JARINGAN':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'KONSUMSI':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getCategoryLabel = (cat: ExpenseRecord['category']) => {
    switch (cat) {
      case 'OPERASIONAL_IT':
        return 'Operasional IT';
      case 'CETAK_KUPON':
        return 'Cetak Kupon';
      case 'PERANGKAT_JARINGAN':
        return 'Perangkat Jaringan';
      case 'KONSUMSI':
        return 'Konsumsi / Rapat';
      case 'LAINNYA':
        return 'Lainnya';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between border shadow-xs transition-all ${
          toast.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:opacity-75 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              Pencatatan Keuangan
            </span>
            <span className="text-xs text-slate-500 font-mono">Manajemen Kas</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ReceiptText className="w-6 h-6 text-emerald-600" />
            Pengeluaran & Operasional Jaringan WiFi
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Catat biaya operasional jaringan, cetak voucher, pemeliharaan router, atau keperluan pendukung lainnya.
          </p>
        </div>

      {/* Profit & Expense Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between overflow-hidden relative group">
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-bold text-emerald-100 block tracking-wider mb-1">Total Keuntungan Voucher</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black">{formatRupiah(totalProfitIt)}</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-300" />
            </div>
          </div>
          <TrendingUp className="w-16 h-16 text-emerald-500/30 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-rose-600 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between overflow-hidden relative group">
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-bold text-rose-100 block tracking-wider mb-1">Total Pengeluaran</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black">{formatRupiah(totalExpenses)}</span>
              <TrendingDown className="w-4 h-4 text-rose-300" />
            </div>
          </div>
          <ReceiptText className="w-16 h-16 text-rose-500/30 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between overflow-hidden relative group border-2 border-emerald-500/20">
          <div className="relative z-10">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider mb-1">Sisa Saldo Bersih</span>
            <span className="text-xl font-black block">{formatRupiah(currentBalance)}</span>
          </div>
          <Wallet className="w-16 h-16 text-slate-700 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" />
        </div>
      </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input Pengeluaran */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Plus className="w-4.5 h-4.5 text-emerald-600" />
                Tambah Catatan Pengeluaran
              </h3>
            </div>
          </div>

          {/* Supervision Notice for Kepala Sekolah */}
          {isKepsek && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center gap-3 shadow-xs">
              <span className="text-xl">👁️</span>
              <div>
                <h4 className="font-bold text-sm text-amber-900">Mode Pengawasan Kepala Sekolah (Hanya Mengawasi)</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Anda sedang mengawasi pencatatan beban operasional jaringan WiFi. Formulir pencatatan pengeluaran baru serta tombol ubah dan hapus dinonaktifkan khusus untuk Tim IT.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={isKepsek} className="space-y-4 disabled:opacity-85">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-200 text-xs font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Data Pengeluaran:</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">A</span>
                  <span>Tanggal Pengeluaran</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">B</span>
                  <span>Keterangan / Keperluan</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: Pembelian kabel UTP & Konektor RJ45"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">C</span>
                    <span>Kategori</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseRecord['category'])}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
                  >
                    <option value="OPERASIONAL_IT">Operasional IT</option>
                    <option value="CETAK_KUPON">Cetak Kupon / Voucher</option>
                    <option value="PERANGKAT_JARINGAN">Perangkat Jaringan (Router/Switch)</option>
                    <option value="KONSUMSI">Konsumsi / Rapat Tim</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">D</span>
                    <span>Nominal (Rp)</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    placeholder="contoh: 150000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">E</span>
                    <span>Dicatat Oleh</span>
                  </label>
                  <select
                    required
                    value={recordedBy}
                    onChange={(e) => setRecordedBy(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
                  >
                    {itStaffList.length === 0 ? (
                      <option value="Tim IT">Tim IT</option>
                    ) : (
                      itStaffList.map((name, idx) => (
                        <option key={idx} value={name}>{name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">F</span>
                    <span>Catatan Tambahan (Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Keterangan tambahan..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>
              </div>
            </div>
            </fieldset>

            {isKepsek ? (
              <div className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs border border-slate-200 text-center">
                Aksi Dinonaktifkan (Mode Pengawasan Kepala Sekolah)
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
              </button>
            )}
          </form>
        </div>

        {/* List Riwayat Pengeluaran */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Riwayat Pengeluaran Operasional ({expenses.length})
            </h3>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <ReceiptText className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-xs font-medium">Belum ada catatan pengeluaran operasional.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${getCategoryBadge(exp.category)}`}>
                        {getCategoryLabel(exp.category)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{formatDateIndo(exp.date)}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{exp.title}</h4>
                    {exp.notes && <p className="text-xs text-slate-600 italic">"{exp.notes}"</p>}
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" /> Pencatat: <span className="font-semibold text-slate-700">{exp.recordedBy}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Nominal</span>
                      <span className="text-sm font-black text-rose-600">{formatRupiah(exp.amount)}</span>
                    </div>

                    {!isKepsek && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(exp)}
                          className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Edit Pengeluaran"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {onDeleteExpense && (
                          <button
                            onClick={() => setDeleteConfirmExpense(exp)}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Pengeluaran"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit Pengeluaran */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Catatan Pengeluaran</h3>
                  <p className="text-xs text-slate-500">Perbarui data pengeluaran operasional IT</p>
                </div>
              </div>
              <button
                onClick={() => setEditingExpense(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pengeluaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli Kertas & Tinta Kupon"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as ExpenseRecord['category'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="OPERASIONAL_IT">Operasional IT</option>
                  <option value="CETAK_KUPON">Cetak Kupon / Voucher</option>
                  <option value="PERANGKAT_JARINGAN">Perangkat Jaringan (Router/Switch)</option>
                  <option value="KONSUMSI">Konsumsi / Rapat Tim</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="500"
                  placeholder="contoh: 150000"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dicatat Oleh</label>
                <select
                  required
                  value={editRecordedBy}
                  onChange={(e) => setEditRecordedBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {itStaffList.length === 0 ? (
                    <option value="Tim IT">Tim IT</option>
                  ) : (
                    itStaffList.map((name, idx) => (
                      <option key={idx} value={name}>{name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan tambahan..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Pengeluaran */}
      {deleteConfirmExpense && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 border border-rose-200">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hapus Catatan Pengeluaran</h3>
                  <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirmExpense(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-700">
                Apakah Anda yakin ingin menghapus catatan pengeluaran <strong className="text-slate-900">{deleteConfirmExpense.title}</strong> sebesar <strong className="text-rose-600">{formatRupiah(deleteConfirmExpense.amount)}</strong>?
              </p>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmExpense(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
