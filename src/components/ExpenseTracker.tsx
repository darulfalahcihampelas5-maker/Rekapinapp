import React, { useState } from 'react';
import { ExpenseRecord } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/format';
import { SlidersHorizontal, PlusCircle, Trash2 } from 'lucide-react';

interface ExpenseTrackerProps {
  expenses: ExpenseRecord[];
  onAddExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseRecord['category']>('CETAK_KUPON');
  const [amount, setAmount] = useState<number>(25000);
  const [recordedBy, setRecordedBy] = useState('Tim IT');
  const [notes, setNotes] = useState('');

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newExpense: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      date: todayStr,
      title,
      category,
      amount,
      recordedBy,
      notes,
    };

    onAddExpense(newExpense);
    setTitle('');
    setNotes('');
    setAmount(25000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Add Expense Form */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              Catat Pengeluaran Operasional
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Biaya kertas voucher, tinta printer, laminasi, atau pemeliharaan router
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Biaya
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="CETAK_KUPON">Cetak Kupon & Kertas Voucher</option>
                <option value="OPERASIONAL_IT">Operasional & Kuota Admin IT</option>
                <option value="PERANGKAT_JARINGAN">Perangkat & Kabel WiFi / Router</option>
                <option value="KONSUMSI">Konsumsi & Operasional Koperasi</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pengeluaran / Kebutuhan
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Kertas HVS 1 Rim untuk Cetak Voucher"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Biaya (Rp)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pencatat
                </label>
                <input
                  type="text"
                  required
                  value={recordedBy}
                  onChange={(e) => setRecordedBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Tambahan
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Simpan Pengeluaran ke Firebase
            </button>
          </form>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
                Daftar Pengeluaran Operasional
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Biaya operasional bersama yang tercatat di Firebase</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Total Pengeluaran:</span>
              <span className="text-base font-extrabold text-slate-900">{formatRupiah(totalExpenses)}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Kebutuhan</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Pencatat</th>
                  <th className="py-3 px-4">Biaya</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.length > 0 ? (
                  expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-600">{formatDateIndo(e.date)}</td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 block">{e.title}</strong>
                        {e.notes && <span className="text-[10px] text-slate-500">{e.notes}</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-700">
                          {e.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{e.recordedBy}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{formatRupiah(e.amount)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDeleteExpense(e.id)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      Belum ada catatan pengeluaran operasional.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
