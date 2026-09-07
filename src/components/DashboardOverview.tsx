import React from 'react';
import {
  VoucherBatch,
  VoucherItem,
  SettlementRecord,
  ExpenseRecord,
  SystemSettings
} from '../types';
import { formatRupiah } from '../utils/format';
import {
  ShoppingCart,
  PackageCheck,
  Banknote,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Sparkles,
  Layers,
  Building2
} from 'lucide-react';

interface DashboardOverviewProps {
  batches: VoucherBatch[];
  vouchers: VoucherItem[];
  settlements: SettlementRecord[];
  expenses: ExpenseRecord[];
  settings: SystemSettings;
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  batches,
  vouchers,
  settlements,
  expenses,
  settings,
  onNavigateTab,
}) => {
  // Volume Calculations
  const totalPurchased = batches.reduce((acc, b) => acc + b.voucherQty, 0);
  const totalInIt = vouchers.filter(v => v.status === 'DI_IT').length;
  const totalInKoperasi = vouchers.filter(v => v.status === 'DI_KOPERASI').length;
  
  // Total vouchers settled by Koperasi
  const totalVouchersSettled = settlements.reduce((acc, s) => acc + s.vouchersCount, 0);
  const totalSold = vouchers.filter(v => v.status === 'TERJUAL').length || totalVouchersSettled;

  // Financial Calculations
  const totalPaidToSidnet = batches.reduce((acc, b) => acc + b.totalCost, 0);
  const totalOmsetVoucher = totalSold * (settings.sellPricePerUnit || 3000);
  const totalLabaKoperasi = totalSold * (settings.koperasiProfitPerUnit ?? 750);
  const totalLabaIt = totalSold * (settings.itProfitPerUnit ?? 750);
  const totalLabaKepsek = totalSold * (settings.kepsekProfitPerUnit ?? 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const labaBersihVoucher = totalLabaIt - totalExpenses;

  // Settlement to IT Calculations
  const totalSettledReceivedByIt = settlements.reduce((acc, st) => acc + st.amountCollected, 0);

  return (
    <div className="space-y-5">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Beranda Voucher & Kas
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitoring stok voucher, penjualan, dan pembagian hasil kas secara real-time
        </p>
      </div>

      {/* Frame Lembar Voucher */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Sparkles className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-slate-900">Informasi Lembar Voucher</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-sky-300 transition-colors">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Pengadaan</span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">{totalPurchased} Lbr</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Modal: {formatRupiah(totalPaidToSidnet)}</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-sky-300 transition-colors">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Stok di Tim IT</span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">{totalInIt} Lbr</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Belum diserahterimakan</span>
          </div>

          <div className="bg-emerald-50/30 border border-emerald-200 rounded-xl p-4 shadow-xs hover:border-emerald-300 transition-colors">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Stok di Koperasi</span>
            <span className="text-xl font-extrabold text-emerald-800 mt-1 block">{totalInKoperasi} Lbr</span>
            <span className="text-[10px] text-emerald-700 mt-0.5 block">Siap dijual ke siswa</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-sky-300 transition-colors">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Terjual</span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">{totalSold} Lbr</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Omset: {formatRupiah(totalOmsetVoucher)}</span>
          </div>
        </div>
      </div>

      {/* Frame Laporan Keuangan */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Banknote className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900">Ringkasan Laporan Keuangan</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-3.5">
        
        {/* Total Nilai Voucher Terjual */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Omset (Rp 3.000)
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">{formatRupiah(totalOmsetVoucher)}</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalSold} voucher terjual
          </p>
        </div>

        {/* Laba Koperasi */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs bg-emerald-50/30">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            Laba Koperasi (Rp 750)
          </span>
          <h3 className="text-xl font-extrabold text-emerald-800 mt-1.5">{formatRupiah(totalLabaKoperasi)}</h3>
          <p className="text-[11px] text-emerald-700 mt-1">
            Hak kas koperasi sekolah
          </p>
        </div>

        {/* Modal Pembelian SIDNet (Rp 1.500 dari setoran 2250) */}
        <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xs bg-blue-50/20">
          <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
            Modal SIDNet (Rp 1.500)
          </span>
          <h3 className="text-xl font-extrabold text-blue-900 mt-1.5">{formatRupiah(totalSold * (settings.costPricePerUnit || 1500))}</h3>
          <p className="text-[11px] text-blue-700 mt-1">
            Alokasi modal dari setoran
          </p>
        </div>

        {/* Total Setoran Diterima IT (Rp 2.250) */}
        <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs bg-slate-50 hover:border-slate-400 transition-colors">
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
            Total Setoran IT (Rp 2.250)
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">{formatRupiah(totalSettledReceivedByIt)}</h3>
          <p className="text-[11px] text-slate-600 mt-1">
            Modal ({settings.costPricePerUnit || 1500}) + Laba IT ({settings.itProfitPerUnit || 750})
          </p>
        </div>

        {/* Laba Kotor Voucher (di atas Pengeluaran) */}
        <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-xs bg-indigo-50/25 hover:border-indigo-300 transition-colors">
          <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
            Laba Kotor Voucher (Rp {settings.itProfitPerUnit || 750})
          </span>
          <h3 className="text-xl font-extrabold text-indigo-900 mt-1.5">{formatRupiah(totalLabaIt)}</h3>
          <p className="text-[11px] text-indigo-700 mt-1">
            Laba Kotor Voucher ({totalSold} voucher)
          </p>
        </div>

        {/* Pengeluaran */}
        <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-xs bg-rose-50/25 hover:border-rose-300 transition-colors">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
            Pengeluaran
          </span>
          <h3 className="text-xl font-extrabold text-rose-700 mt-1.5">{formatRupiah(totalExpenses)}</h3>
          <p className="text-[11px] text-rose-600 mt-1">
            {expenses.length} transaksi beban kas
          </p>
        </div>

        {/* Laba Bersih Voucher (Laba IT dikurangi Pengeluaran) */}
        <div className={`bg-white border rounded-2xl p-4 shadow-xs transition-colors ${
          labaBersihVoucher >= 0 
            ? 'border-purple-200 bg-purple-50/25 hover:border-purple-300' 
            : 'border-amber-200 bg-amber-50/35 hover:border-amber-300'
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${
            labaBersihVoucher >= 0 ? 'text-purple-800' : 'text-amber-800'
          }`}>
            Laba Bersih Voucher
          </span>
          <h3 className={`text-xl font-extrabold mt-1.5 ${
            labaBersihVoucher >= 0 ? 'text-purple-900' : 'text-amber-900'
          }`}>
            {formatRupiah(labaBersihVoucher)}
          </h3>
          <p className={`text-[11px] mt-1 ${
            labaBersihVoucher >= 0 ? 'text-purple-700' : 'text-amber-700'
          }`}>
            Uang yang tersedia saat ini
          </p>
        </div>
      </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <h4 className="font-bold text-sm text-slate-900">
            Transaksi Setoran Terakhir
          </h4>
          <button
            onClick={() => onNavigateTab('koperasi_settle')}
            className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            Lihat Semua &rarr;
          </button>
        </div>

        {settlements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Jumlah Voucher</th>
                  <th className="py-2.5 px-3">Setoran ke IT</th>
                  <th className="py-2.5 px-3">Laba Koperasi</th>
                  <th className="py-2.5 px-3">Penyetor</th>
                  <th className="py-2.5 px-3">Penerima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{s.date}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-800">{s.vouchersCount} Lbr</td>
                    <td className="py-2.5 px-3 font-black text-slate-900">{formatRupiah(s.amountCollected)}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">{formatRupiah(s.vouchersCount * (settings.koperasiProfitPerUnit || 750))}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.settledBy}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.receivedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            Belum ada transaksi setoran. Data akan muncul otomatis saat dicatat.
          </div>
        )}
      </div>

    </div>
  );
};

