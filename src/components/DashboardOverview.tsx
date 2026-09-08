import React, { useState } from 'react';
import {
  VoucherBatch,
  VoucherItem,
  SettlementRecord,
  ExpenseRecord,
  SystemSettings
} from '../types';
import { formatRupiah, formatDateIndo } from '../utils/format';
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
  Building2,
  TrendingUp,
  Wallet,
  Receipt,
  Package,
  CircleDollarSign,
  Info,
  ChevronRight,
  History
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
  const [showSidnetDetailModal, setShowSidnetDetailModal] = useState(false);

  // Volume Calculations
  const totalPurchased = batches.reduce((acc, b) => acc + b.voucherQty, 0);
  const totalInIt = vouchers.filter(v => v.status === 'DI_IT').length;
  const totalInKoperasi = vouchers.filter(v => v.status === 'DI_KOPERASI').length;
  
  // Total vouchers settled by Koperasi
  const totalVouchersSettled = settlements.reduce((acc, s) => acc + s.vouchersCount, 0);
  const totalSold = vouchers.filter(v => v.status === 'TERJUAL').length || totalVouchersSettled;

  // Rate definitions
  const costPrice = settings.costPricePerUnit || 1500;
  const sellPrice = settings.sellPricePerUnit || 3000;
  const koperasiProfit = settings.koperasiProfitPerUnit ?? 750;
  const itProfit = settings.itProfitPerUnit ?? 750;
  const itDepositPerVoucher = costPrice + itProfit; // e.g. Rp 2.250

  // Financial Calculations
  const totalPaidToSidnetBatches = batches.reduce((acc, b) => acc + b.totalCost, 0);
  const totalOmsetVoucher = totalSold * sellPrice;
  const totalLabaKoperasi = totalSold * koperasiProfit;
  const totalLabaIt = totalSold * itProfit;
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const labaBersihVoucher = totalLabaIt - totalExpenses;

  // Settlement to IT Calculations
  const totalSettledReceivedByIt = settlements.reduce((acc, st) => acc + st.amountCollected, 0);

  // Core Request: Uang untuk Pembelian Voucher ke PT SIDNet yang diambil dari Total Setoran IT
  const totalUangBeliSidnetDariSetoran = totalVouchersSettled * costPrice;
  const totalHakItDariSetoran = totalVouchersSettled * itProfit;
  const persentaseSidnetDariSetoran = totalSettledReceivedByIt > 0
    ? Math.round((totalUangBeliSidnetDariSetoran / totalSettledReceivedByIt) * 100)
    : Math.round((costPrice / itDepositPerVoucher) * 100);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Beranda Voucher & Kas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring stok voucher, alokasi pembelian ke PT SIDNet, dan pembagian kas secara real-time
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateTab('activity_history')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <History className="w-3.5 h-3.5 text-emerald-600" />
            <span>Riwayat Aktivitas</span>
          </button>
          <button
            onClick={() => onNavigateTab('it_buy_sidnet')}
            className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-sky-200"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Beli ke PT SIDNet</span>
          </button>
          <button
            onClick={() => onNavigateTab('koperasi_settle')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Catat Setoran</span>
          </button>
        </div>
      </div>

      {/* Frame Lembar Voucher */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Sparkles className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-slate-900 text-sm">Informasi Lembar Voucher</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-sky-300 transition-colors">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Pengadaan</span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">{totalPurchased} Lbr</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Modal: {formatRupiah(totalPaidToSidnetBatches)}</span>
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

      {/* Frame Utama: Laporan Pembelian Voucher ke PT SIDNet dari Total Setoran IT */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 text-sky-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                  Laporan Pembelian Voucher ke PT SIDNet
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[10px] font-bold uppercase tracking-wider border border-sky-200">
                  Alokasi dari Setoran IT
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Rekapitulasi dana pengadaan/re-stock kuota voucher ({settings.providerName || 'PT SIDNet'}) yang bersumber dari uang setoran kas Koperasi
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('it_buy_sidnet')}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-sky-200 cursor-pointer"
          >
            <span>Riwayat Pembelian SIDNet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Main Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          
          {/* Card 1: Total Setoran IT Masuk */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Setoran Diterima IT
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-600">
                {totalVouchersSettled} Lbr Voucher
              </span>
            </div>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-2">
              {formatRupiah(totalSettledReceivedByIt)}
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Uang kas bruto yang disetorkan Koperasi ke Tim IT (Rp {itDepositPerVoucher.toLocaleString('id-ID')}/lbr)
            </p>
          </div>

          {/* Card 2: Jumlah Uang Pembelian ke PT SIDNet (Utama) */}
          <div className="bg-sky-50/40 border-2 border-sky-400 rounded-xl p-4 shadow-xs hover:border-sky-500 transition-colors relative overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded-full bg-sky-600 text-white text-[10px] font-black uppercase tracking-wider">
                {persentaseSidnetDariSetoran}% Setoran
              </span>
            </div>
            <span className="text-[11px] font-extrabold text-sky-800 uppercase tracking-wider block">
              Uang Pembelian ke PT SIDNet
            </span>
            <h4 className="text-2xl font-black text-sky-900 mt-2">
              {formatRupiah(totalUangBeliSidnetDariSetoran)}
            </h4>
            <p className="text-[11px] text-sky-700 font-medium mt-1">
              Wajib disisihkan untuk restock kuota (Rp {costPrice.toLocaleString('id-ID')} × {totalVouchersSettled} voucher)
            </p>
          </div>

          {/* Card 3: Sisa Setoran untuk Hak/Laba IT */}
          <div className="bg-indigo-50/30 border border-indigo-200 rounded-xl p-4 shadow-xs hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
                Hak / Laba Tim IT
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-semibold">
                {100 - persentaseSidnetDariSetoran}% Setoran
              </span>
            </div>
            <h4 className="text-2xl font-black text-indigo-900 mt-2">
              {formatRupiah(totalHakItDariSetoran)}
            </h4>
            <p className="text-[11px] text-indigo-700/80 mt-1">
              Sisa setoran setelah dipotong modal PT SIDNet (Rp {itProfit.toLocaleString('id-ID')} × {totalVouchersSettled} voucher)
            </p>
          </div>

        </div>

        {/* Visual Breakdown Bar & Detailed Flow */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CircleDollarSign className="w-4 h-4 text-sky-600" />
              Alur Pembagian Uang Setoran Kas IT:
            </span>
            <span className="text-slate-500 text-[11px]">
              Total Setoran = Modal PT SIDNet ({formatRupiah(costPrice)}/vcr) + Hak IT ({formatRupiah(itProfit)}/vcr)
            </span>
          </div>

          {/* Dual Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-3.5 flex overflow-hidden p-0.5">
            <div
              style={{ width: `${persentaseSidnetDariSetoran}%` }}
              className="bg-sky-500 h-full rounded-l-full transition-all flex items-center justify-center text-[9px] font-black text-white"
              title={`Alokasi PT SIDNet: ${persentaseSidnetDariSetoran}%`}
            >
              {persentaseSidnetDariSetoran >= 20 && `${persentaseSidnetDariSetoran}% SIDNet`}
            </div>
            <div
              style={{ width: `${100 - persentaseSidnetDariSetoran}%` }}
              className="bg-indigo-500 h-full rounded-r-full transition-all flex items-center justify-center text-[9px] font-black text-white"
              title={`Hak Tim IT: ${100 - persentaseSidnetDariSetoran}%`}
            >
              {100 - persentaseSidnetDariSetoran >= 20 && `${100 - persentaseSidnetDariSetoran}% Tim IT`}
            </div>
          </div>

          {/* Sub-details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-[11px]">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-slate-500">Harga Modal Grosir:</span>
              <span className="font-bold text-sky-700">Rp {costPrice.toLocaleString('id-ID')} / vcr</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-slate-500">Voucher Disetor:</span>
              <span className="font-bold text-slate-900">{totalVouchersSettled} Lembar</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-slate-500">Total Dibeli ke SIDNet:</span>
              <span className="font-bold text-emerald-700">{formatRupiah(totalPaidToSidnetBatches)} ({totalPurchased} Lbr)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-slate-500">Modal Terkumpul:</span>
              <span className="font-bold text-sky-700">{formatRupiah(totalUangBeliSidnetDariSetoran)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Frame Laporan Keuangan Keseluruhan */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Ringkasan Laporan Keuangan</h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Tarif: Jual Rp {sellPrice.toLocaleString('id-ID')} &bull; Modal Rp {costPrice.toLocaleString('id-ID')} &bull; Bagi Hasil Koperasi Rp {koperasiProfit.toLocaleString('id-ID')}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-3.5">
        
          {/* Total Nilai Voucher Terjual */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Omset (Rp {sellPrice.toLocaleString('id-ID')})
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">{formatRupiah(totalOmsetVoucher)}</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {totalSold} voucher terjual
            </p>
          </div>

          {/* Laba Koperasi */}
          <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs bg-emerald-50/30">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Laba Koperasi (Rp {koperasiProfit.toLocaleString('id-ID')})
            </span>
            <h3 className="text-xl font-extrabold text-emerald-800 mt-1.5">{formatRupiah(totalLabaKoperasi)}</h3>
            <p className="text-[11px] text-emerald-700 mt-1">
              Hak kas koperasi sekolah
            </p>
          </div>

          {/* Modal Pembelian SIDNet (Rp 1.500 dari setoran IT) */}
          <div className="bg-white border-2 border-sky-400 rounded-2xl p-4 shadow-xs bg-sky-50/40">
            <span className="text-[10px] font-extrabold text-sky-800 uppercase tracking-wider block">
              Beli SIDNet (dari Setoran)
            </span>
            <h3 className="text-xl font-black text-sky-900 mt-1.5">{formatRupiah(totalUangBeliSidnetDariSetoran)}</h3>
            <p className="text-[11px] text-sky-700 font-medium mt-1">
              Rp {costPrice.toLocaleString('id-ID')} × {totalVouchersSettled} disetor
            </p>
          </div>

          {/* Total Setoran Diterima IT (Rp 2.250) */}
          <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-xs bg-slate-50 hover:border-slate-400 transition-colors">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
              Total Setoran IT (Rp {itDepositPerVoucher.toLocaleString('id-ID')})
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1.5">{formatRupiah(totalSettledReceivedByIt)}</h3>
            <p className="text-[11px] text-slate-600 mt-1">
              Modal SIDNet + Laba IT
            </p>
          </div>

          {/* Laba Kotor Voucher (di atas Pengeluaran) */}
          <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-xs bg-indigo-50/25 hover:border-indigo-300 transition-colors">
            <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
              Laba Kotor IT (Rp {itProfit.toLocaleString('id-ID')})
            </span>
            <h3 className="text-xl font-extrabold text-indigo-900 mt-1.5">{formatRupiah(totalLabaIt)}</h3>
            <p className="text-[11px] text-indigo-700 mt-1">
              Hak Tim IT ({totalSold} voucher)
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
              Laba Bersih IT
            </span>
            <h3 className={`text-xl font-extrabold mt-1.5 ${
              labaBersihVoucher >= 0 ? 'text-purple-900' : 'text-amber-900'
            }`}>
              {formatRupiah(labaBersihVoucher)}
            </h3>
            <p className={`text-[11px] mt-1 ${
              labaBersihVoucher >= 0 ? 'text-purple-700' : 'text-amber-700'
            }`}>
              Uang kas IT tersedia saat ini
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Table with PT SIDNet breakdown per settlement */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Rincian Setoran Kas & Alokasi PT SIDNet Terakhir
            </h4>
            <p className="text-[11px] text-slate-500">
              Rincian alokasi pembelian kuota PT SIDNet (Rp {costPrice.toLocaleString('id-ID')}/lbr) dan laba IT dari setiap setoran masuk
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('koperasi_settle')}
            className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Semua Setoran</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {settlements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Volume</th>
                  <th className="py-2.5 px-3">Total Setoran IT</th>
                  <th className="py-2.5 px-3 text-sky-900 bg-sky-50/50">Modal PT SIDNet</th>
                  <th className="py-2.5 px-3 text-indigo-900">Hak Tim IT</th>
                  <th className="py-2.5 px-3 text-emerald-800">Laba Koperasi</th>
                  <th className="py-2.5 px-3">Penyetor & Penerima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.slice(0, 5).map((s) => {
                  const modalSidnet = s.vouchersCount * costPrice;
                  const hakIt = s.vouchersCount * itProfit;
                  const labaKop = s.vouchersCount * koperasiProfit;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{s.date}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{s.vouchersCount} Lbr</td>
                      <td className="py-2.5 px-3 font-black text-slate-900">{formatRupiah(s.amountCollected)}</td>
                      <td className="py-2.5 px-3 font-bold text-sky-800 bg-sky-50/40">
                        {formatRupiah(modalSidnet)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-indigo-700">
                        {formatRupiah(hakIt)}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">
                        {formatRupiah(labaKop)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {s.settledBy} &rarr; {s.receivedBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            Belum ada transaksi setoran. Data alokasi PT SIDNet akan muncul otomatis saat setoran kas dicatat.
          </div>
        )}
      </div>

    </div>
  );
};


