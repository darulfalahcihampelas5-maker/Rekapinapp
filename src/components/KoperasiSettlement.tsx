import React, { useState } from 'react';
import { VoucherItem, SettlementRecord, SystemSettings, UserRole } from '../types';
import { formatRupiah, formatDateIndo, parseStaffNames } from '../utils/format';
import {
  Banknote,
  CheckCircle2,
  Receipt,
  FileCheck,
  History,
  Building2,
  Printer,
  ChevronRight,
  Calculator,
  Sparkles,
  Eye
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface KoperasiSettlementProps {
  vouchers: VoucherItem[];
  settlements: SettlementRecord[];
  settings: SystemSettings;
  onRecordSettlement: (settlement: SettlementRecord, updatedVouchers: VoucherItem[]) => void;
  currentRole?: UserRole;
}

export const KoperasiSettlement: React.FC<KoperasiSettlementProps> = ({
  vouchers,
  settlements,
  settings,
  onRecordSettlement,
  currentRole,
}) => {
  const isKepsek = currentRole === 'KEPALA_SEKOLAH';

  // Stock in Koperasi
  const availableAtKoperasi = vouchers.filter((v) => v.status === 'DI_KOPERASI');
  const totalInKoperasi = availableAtKoperasi.length;

  const todayStr = new Date().toISOString().split('T')[0];

  // Form State
  const [settlementDate, setSettlementDate] = useState<string>(todayStr);
  const [vouchersCount, setVouchersCount] = useState<number>(0);

  const itStaffList = parseStaffNames(settings.itStaffNames);
  const koperasiStaffList = parseStaffNames(settings.koperasiManagerName);

  const [settledBy, setSettledBy] = useState<string>(koperasiStaffList[0] || 'Pengurus Koperasi Sekolah');
  const [receivedBy, setReceivedBy] = useState<string>(itStaffList[0] || 'Tim IT Pengelola');
  const [notes, setNotes] = useState<string>('');

  // Sync default values when settings load or change
  React.useEffect(() => {
    const itList = parseStaffNames(settings.itStaffNames);
    const koperasiList = parseStaffNames(settings.koperasiManagerName);

    if (koperasiList.length > 0) {
      setSettledBy(koperasiList[0]);
    } else {
      setSettledBy('Pengurus Koperasi Sekolah');
    }

    if (itList.length > 0) {
      setReceivedBy(itList[0]);
    } else {
      setReceivedBy('Tim IT Pengelola');
    }
  }, [settings]);

  // Selected settlement for viewing receipt
  const [selectedReceipt, setSelectedReceipt] = useState<SettlementRecord | null>(null);

  // Financial calculations
  // Modal Rp 1.500 + Hak IT Rp 750 = Rp 2.250 disetor ke IT
  // Koperasi retains Rp 750
  const modalRate = settings.costPricePerUnit || 1500;
  const itRate = settings.itProfitPerUnit || 750;
  const kepsekRate = settings.kepsekProfitPerUnit !== undefined ? settings.kepsekProfitPerUnit : 0;
  const koperasiRate = settings.koperasiProfitPerUnit || 750;
  const sellRate = settings.sellPricePerUnit || 3000;

  const itDepositPerUnit = sellRate - koperasiRate; // IT receives the rest after Koperasi takes their cut
  const totalCalculatedDeposit = (vouchersCount || 0) * itDepositPerUnit;
  const totalOmset = (vouchersCount || 0) * sellRate;
  const totalLabaKoperasi = (vouchersCount || 0) * koperasiRate;
  const totalModal = (vouchersCount || 0) * modalRate;
  const totalHakIt = (vouchersCount || 0) * itRate;
  const totalHakKepsek = (vouchersCount || 0) * kepsekRate;

  const [customAmount, setCustomAmount] = useState<string>('');
  const amountToSubmit = customAmount !== '' ? Number(customAmount) : totalCalculatedDeposit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (vouchersCount <= 0) {
      alert('Jumlah voucher yang disetorkan harus lebih dari 0.');
      return;
    }

    if (vouchersCount > totalInKoperasi) {
      alert(`Peringatan: Jumlah setoran (${vouchersCount} voucher) melebihi batas stok yang ada di etalase koperasi (${totalInKoperasi} voucher). Setoran tidak dapat diproses!`);
      return;
    }

    // Mark corresponding vouchers from DI_KOPERASI to TERJUAL
    const vouchersToMark = availableAtKoperasi.slice(0, vouchersCount);
    const updatedVouchers = vouchers.map((v) => {
      if (vouchersToMark.some((target) => target.id === v.id)) {
        return {
          ...v,
          status: 'TERJUAL' as const,
          soldAt: settlementDate,
        };
      }
      return v;
    });

    const newSettlement: SettlementRecord = {
      id: `set-${Date.now()}`,
      date: settlementDate,
      vouchersCount: Number(vouchersCount),
      amountCollected: Number(amountToSubmit),
      settledBy: settledBy.trim() || 'Pengurus Koperasi Sekolah',
      receivedBy: receivedBy.trim() || 'Tim IT Pengelola',
      notes: notes.trim(),
      status: 'LUNAS',
    };

    onRecordSettlement(newSettlement, updatedVouchers);
    setSelectedReceipt(newSettlement);
    setNotes('');
    setCustomAmount('');
    alert(`Setoran kas sebesar ${formatRupiah(amountToSubmit)} untuk ${vouchersCount} voucher terjual berhasil disimpan.`);
  };

  // Lifetime settlement stats
  const totalVouchersSettled = settlements.reduce((acc, s) => acc + s.vouchersCount, 0);
  const totalCashDepositedToIt = settlements.reduce((acc, s) => acc + s.amountCollected, 0);
  const totalLabaKoperasiAccumulated = totalVouchersSettled * koperasiRate;

  return (
    <div className="space-y-6">
      {/* Top Status Bar with Koperasi Stock */}
      <div className="flex flex-col items-center justify-center bg-white px-4 py-5 rounded-2xl border border-slate-200/85 shadow-xs gap-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Manajemen Setoran Koperasi
        </span>
        <div className="flex items-center justify-center gap-2.5 px-6 py-2.5 bg-emerald-50 rounded-xl border border-emerald-200 w-full max-w-sm">
          <span className="text-emerald-800 font-bold text-sm sm:text-base">Sisa Stok di Koperasi:</span>
          <span className="font-black text-emerald-700 text-lg sm:text-xl drop-shadow-sm">{totalInKoperasi} Voucher</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-bold">Total Voucher Terjual/Disetor</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalVouchersSettled} Voucher</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Dari total transaksi setoran</span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs bg-emerald-50/20">
          <span className="text-xs text-emerald-800 uppercase font-bold">Total Disetorkan ke Tim IT</span>
          <p className="text-2xl font-black text-emerald-800 mt-2">{formatRupiah(totalCashDepositedToIt)}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">@ Rp 2.250 / voucher</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-700 uppercase font-bold">Laba Bersih Koperasi (Rp.750)</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{formatRupiah(totalLabaKoperasiAccumulated)}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Hak langsung Koperasi</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-bold">Stok Fisik Siap Dijual</span>
          <p className="text-2xl font-black text-slate-800 mt-2">{totalInKoperasi} Voucher</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Tersedia di etalase koperasi</span>
        </div>
      </div>

      {/* Main Form & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Setoran */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-600" />
                Input Setoran Penjualan Voucher
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
                  Anda sedang mengawasi rekapitulasi setoran kas hasil penjualan voucher. Formulir input setoran kas hanya dapat dioperasikan oleh pihak Koperasi atau Tim IT. Anda dapat meninjau data setoran dan kwitansi pada tabel di bawah.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={isKepsek} className="space-y-4 disabled:opacity-85">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-200 text-xs font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Data Transaksi Setoran:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tanggal Setoran */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">A</span>
                    <span>Tanggal Setoran Kas</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={settlementDate}
                    onChange={(e) => setSettlementDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                </div>

                {/* Jumlah Voucher Terjual */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">B</span>
                      <span>Jumlah Voucher Terjual</span>
                    </div>
                    {!isKepsek && totalInKoperasi > 0 && (
                      <button
                        type="button"
                        onClick={() => setVouchersCount(totalInKoperasi)}
                        className="text-[10px] text-emerald-700 hover:underline font-bold"
                      >
                        Setor Semua ({totalInKoperasi})
                      </button>
                    )}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={totalInKoperasi}
                    required
                    value={vouchersCount === 0 ? '' : vouchersCount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setVouchersCount(0);
                      } else {
                        setVouchersCount(parseInt(val) || 0);
                      }
                    }}
                    placeholder="Contoh: 50"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Batas maksimal stok tersedia: <strong className="text-emerald-700">{totalInKoperasi} voucher</strong>
                  </span>
                </div>
              </div>

             {/* Petugas Penyetor & Penerima */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">C</span>
                  <span>Disetorkan Oleh (Pihak Koperasi)</span>
                </label>
                <select
                  required
                  value={settledBy}
                  onChange={(e) => setSettledBy(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs cursor-pointer"
                >
                  {koperasiStaffList.length === 0 ? (
                    <option value="Pengurus Koperasi">Pengurus Koperasi</option>
                  ) : (
                    koperasiStaffList.map((name, idx) => (
                      <option key={idx} value={name}>{name}</option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">D</span>
                  <span>Diterima Oleh (Tim IT)</span>
                </label>
                <select
                  required
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
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
            </div>

            {/* Total Uang yang Disetorkan */}
            <div className="p-4 rounded-xl bg-emerald-100/50 border border-emerald-200/80 space-y-3 mt-2">
              <div className="text-[11px] text-emerald-800 space-y-1.5 pb-2 border-b border-emerald-200/60">
                <div className="flex justify-between items-center">
                  <span>Harga Jual per Voucher</span>
                  <span className="font-medium">{formatRupiah(sellRate)}</span>
                </div>
                <div className="flex justify-between items-center text-amber-700">
                  <span>Laba Koperasi (Langsung diambil)</span>
                  <span className="font-medium">- {formatRupiah(koperasiRate)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-emerald-900 border-t border-emerald-200/50 pt-1.5 mt-1">
                  <span>Setoran ke Tim IT per Voucher</span>
                  <span>{formatRupiah(itDepositPerUnit)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-emerald-700" />
                    Total Setoran ({vouchersCount} Voucher):
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    {vouchersCount} × {formatRupiah(itDepositPerUnit)}
                  </span>
                </div>
                <span className="text-xl font-black text-emerald-900">
                  {formatRupiah(amountToSubmit)}
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  Penyesuaian Nominal Manual (Opsional, jika berbeda dari kalkulasi):
                </label>
                <input
                  type="number"
                  placeholder={`Default: ${totalCalculatedDeposit}`}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>
            </div>

            {/* Catatan / Keterangan */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-extrabold">E</span>
                <span>Catatan / Keterangan Tambahan</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Setoran hasil penjualan voucher minggu ke-1 bulan berjalan"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs resize-none"
              />
            </div>
            </div>
            </fieldset>

            {/* Submit Button */}
            {isKepsek ? (
              <div className="w-full py-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs text-center border border-slate-200">
                Aksi Dinonaktifkan (Mode Pengawasan Kepala Sekolah)
              </div>
            ) : (
              <button
                type="submit"
                id="btn-submit-koperasi-settlement"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Simpan Bukti</span>
              </button>
            )}
          </form>
        </div>

        {/* Breakdown Card */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <Receipt className="w-4 h-4 text-emerald-600" />
              Rincian Bagi Hasil
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                <span className="text-slate-600">Total Omset ({vouchersCount} × Rp 3.000)</span>
                <span className="font-bold text-slate-900">{formatRupiah(totalOmset)}</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
                <span className="text-[11px] font-bold text-emerald-900 block uppercase">
                  Rincian Uang Disetor ke Tim IT:
                </span>
                
                <div className="flex items-center justify-between text-slate-600 text-[11px]">
                  <span>• Modal SIDNet (Rp 1.500/vcr)</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(totalModal)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 text-[11px]">
                  <span>• Hak Tim IT ({formatRupiah(itRate)}/vcr)</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(totalHakIt)}</span>
                </div>

                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between font-bold text-emerald-900">
                  <span>Subtotal Disetor ke IT</span>
                  <span>{formatRupiah(totalCalculatedDeposit)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-100/60 border border-emerald-200 text-emerald-900">
                <span className="font-bold">Laba Koperasi (Rp 750/vcr)</span>
                <span className="font-black text-sm">{formatRupiah(totalLabaKoperasi)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Setoran Kas Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Riwayat Berita Acara Setoran Kas Koperasi ke Tim IT
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Total {settlements.length} Catatan Setoran
          </span>
        </div>

        {settlements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Jumlah Voucher</th>
                  <th className="py-3 px-4">Total Setoran ke IT</th>
                  <th className="py-3 px-4">Laba Koperasi (Rp 750)</th>
                  <th className="py-3 px-4">Penyetor (Koperasi)</th>
                  <th className="py-3 px-4">Penerima (Tim IT)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{formatDateIndo(s.date)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                        {s.vouchersCount} Voucher
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      {formatRupiah(s.amountCollected)}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {formatRupiah(s.vouchersCount * koperasiRate)}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{s.settledBy}</td>
                    <td className="py-3 px-4 text-slate-700">{s.receivedBy}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(s)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Kuitansi</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            <Banknote className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700">Belum ada catatan setoran kas dari Koperasi.</p>
            <p className="mt-1">Gunakan formulir di atas saat Koperasi menyetorkan hasil penjualan voucher ke Tim IT.</p>
          </div>
        )}
      </div>

      {/* Receipt Modal (Modern A4 Formal Receipt) */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print-container">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 print:border-none print:shadow-none print:max-w-full print:p-0">
            
            {/* Header Controls (Hidden on Print) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Kuitansi / Tanda Terima Setoran Kas</h4>
                  <p className="text-[11px] text-slate-500">Bukti pembayaran resmi dari Koperasi ke Tim IT</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Printable Official Receipt Area (1-Page A4 Ready) */}
            <div id="print-kuitansi-area" className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs space-y-4 font-sans print:bg-white print:border-none print:p-0">
              
              {/* Kop Surat Header */}
              <div className="pb-3 border-b-2 border-slate-900 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight font-sans">
                    <span className="text-[#CC2302]">REKAPIN</span> <span className="text-sky-600">AJA</span>
                  </h3>
                  <p className="text-[10px] font-bold text-slate-700 uppercase">
                    KOPERASI & UNIT PENGELOLAAN IT
                  </p>
                  <p className="text-[9px] text-slate-500">
                    Kuitansi Penyetoran Kas Hasil Penjualan Voucher WiFi
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-widest border border-emerald-200">
                    BUKTI SETORAN SAH
                  </span>
                  <p className="text-[10px] font-mono font-bold text-slate-700 mt-1">
                    ID: {selectedReceipt.id}
                  </p>
                  <p className="text-[9px] text-slate-500">
                    {formatDateIndo(selectedReceipt.date)}
                  </p>
                </div>
              </div>

              {/* Transaction Summary Card */}
              <div className="bg-emerald-900 text-white rounded-xl p-3.5 flex justify-between items-center shadow-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-200 block">
                    Total Kas Disetor Ke Tim IT
                  </span>
                  <span className="text-lg font-black text-white tracking-tight">
                    {formatRupiah(selectedReceipt.amountCollected)}
                  </span>
                </div>
                <div className="text-right border-l border-emerald-700/60 pl-3">
                  <span className="text-[9px] text-emerald-200 block">Voucher Terjual</span>
                  <span className="text-xs font-bold text-emerald-100">{selectedReceipt.vouchersCount} Voucher</span>
                </div>
              </div>

              {/* Breakdown Details Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full text-[11px]">
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 text-slate-600 bg-slate-50 w-2/5">Volume Terjual</td>
                      <td className="p-2 font-bold text-slate-900">{selectedReceipt.vouchersCount} Voucher Fisik</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 text-slate-600 bg-slate-50">Omset Penjualan Kotor (@3.000)</td>
                      <td className="p-2 font-bold text-slate-900">{formatRupiah(selectedReceipt.vouchersCount * (settings.sellPricePerUnit || 3000))}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-2 text-slate-600 bg-slate-50">Hak Laba Koperasi (@750)</td>
                      <td className="p-2 font-bold text-emerald-700">{formatRupiah(selectedReceipt.vouchersCount * (settings.koperasiProfitPerUnit || 750))}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-slate-600 bg-slate-50">Sisa Net Disetor ke IT (Modal + Hak IT)</td>
                      <td className="p-2 font-extrabold text-emerald-800">{formatRupiah(selectedReceipt.amountCollected)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-3 border-t border-slate-300 grid grid-cols-2 text-center text-[10px] gap-3">
                <div className="border border-slate-200 rounded p-2 bg-white">
                  <span className="text-slate-500 font-bold block uppercase">Penyetor (Koperasi)</span>
                  <div className="h-10 flex items-end justify-center">
                    <span className="font-bold text-slate-900 underline">{selectedReceipt.settledBy}</span>
                  </div>
                </div>
                <div className="border border-slate-200 rounded p-2 bg-white">
                  <span className="text-slate-500 font-bold block uppercase">Penerima (Tim IT)</span>
                  <div className="h-10 flex items-end justify-center">
                    <span className="font-bold text-slate-900 underline">{selectedReceipt.receivedBy}</span>
                  </div>
                </div>
              </div>

              <p className="text-center text-[8px] text-slate-400 italic">
                Simpan bukti tanda terima ini sebagai dokumen verifikasi resmi audit keuangan sekolah.
              </p>

            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={async () => {
                  const element = document.getElementById('print-kuitansi-area');
                  if (!element) return;
                  
                  try {
                    const dataUrl = await toPng(element, { quality: 0.98, backgroundColor: '#ffffff' });
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
                    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`Kuitansi_Setoran_${selectedReceipt.id.slice(0, 6)}.pdf`);
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
                onClick={() => setSelectedReceipt(null)}
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
