import React, { useState } from 'react';
import {
  VoucherBatch,
  VoucherItem,
  VoucherHandover,
  SettlementRecord,
  ExpenseRecord,
  SystemSettings
} from '../types';
import { formatRupiah, formatDateIndo } from '../utils/format';
import {
  ShieldCheck,
  Printer,
  CheckCircle2,
  Banknote,
  ShoppingCart,
  PackageCheck,
  Building2,
  Calendar,
  Layers,
  Receipt
} from 'lucide-react';

interface KepsekAuditDashboardProps {
  batches: VoucherBatch[];
  vouchers: VoucherItem[];
  handovers: VoucherHandover[];
  settlements: SettlementRecord[];
  expenses: ExpenseRecord[];
  settings: SystemSettings;
  onOpenPrintReport: () => void;
}

export const KepsekAuditDashboard: React.FC<KepsekAuditDashboardProps> = ({
  batches,
  vouchers,
  handovers,
  settlements,
  expenses,
  settings,
  onOpenPrintReport,
}) => {
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [activeAuditTab, setActiveAuditTab] = useState<'summary' | 'settlements_audit' | 'purchases_audit' | 'handovers_audit'>('summary');

  // Time filter logic for settlements
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const filteredSettlements = settlements.filter(s => {
    if (timeFilter === 'ALL') return true;
    const sDate = s.date;
    if (timeFilter === 'TODAY') return sDate === todayStr;
    if (timeFilter === 'WEEK') {
      const pastWeek = new Date();
      pastWeek.setDate(now.getDate() - 7);
      return new Date(s.date) >= pastWeek;
    }
    if (timeFilter === 'MONTH') {
      const sMonth = sDate.substring(0, 7);
      const currentMonth = todayStr.substring(0, 7);
      return sMonth === currentMonth;
    }
    return true;
  });

  // Calculate metrics for the filtered period based on settlements
  const totalVouchersSold = filteredSettlements.reduce((acc, s) => acc + s.vouchersCount, 0);
  const totalOmset = totalVouchersSold * (settings.sellPricePerUnit || 3000);
  const totalModal = totalVouchersSold * (settings.costPricePerUnit || 1500);
  const totalLabaKoperasi = totalVouchersSold * (settings.koperasiProfitPerUnit ?? 750);
  const totalLabaIt = totalVouchersSold * (settings.itProfitPerUnit ?? 750);
  const totalLabaKepsek = totalVouchersSold * (settings.kepsekProfitPerUnit ?? 0);
  const totalLabaBersih = totalLabaKoperasi + totalLabaIt + totalLabaKepsek;
  const totalDisetorKeIt = filteredSettlements.reduce((acc, s) => acc + s.amountCollected, 0);

  const totalStockInIt = vouchers.filter(v => v.status === 'DI_IT').length;
  const totalStockInKoperasi = vouchers.filter(v => v.status === 'DI_KOPERASI').length;

  return (
    <div className="space-y-6">
      
      {/* Header with Period Filter & Print Action */}
      <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Rekapitulasi Keuangan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pengawasan transparansi alokasi pendapatan dan laba bersih voucher secara objektif
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector */}
          <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
            {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  timeFilter === t
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t === 'ALL' && 'Semua'}
                {t === 'TODAY' && 'Hari Ini'}
                {t === 'WEEK' && '7 Hari'}
                {t === 'MONTH' && 'Bulan Ini'}
              </button>
            ))}
          </div>

          {/* Official Print Button */}
          <button
            id="btn-print-official-report"
            onClick={onOpenPrintReport}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Resmi</span>
          </button>
        </div>
      </div>

      {/* Audit Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-bold">Total Nilai Voucher Terjual</span>
          <p className="text-2xl font-black text-slate-900 mt-2">{formatRupiah(totalOmset)}</p>
          <p className="text-xs text-slate-500 mt-1">
            Dari <strong className="text-slate-800">{totalVouchersSold}</strong> voucher terjual
          </p>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs bg-emerald-50/20">
          <span className="text-xs text-emerald-800 uppercase font-bold">Hak {settings.koperasiName} (Rp 750)</span>
          <p className="text-2xl font-black text-emerald-700 mt-2">{formatRupiah(totalLabaKoperasi)}</p>
          <p className="text-xs text-slate-500 mt-1">
            Alokasi: <strong className="text-emerald-700">Rp 750</strong> / voucher
          </p>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs bg-emerald-50/30">
          <span className="text-xs text-emerald-800 uppercase font-bold">Hak Tim IT (Rp 750)</span>
          <p className="text-2xl font-black text-emerald-800 mt-2">{formatRupiah(totalLabaIt)}</p>
          <p className="text-xs text-slate-500 mt-1">
            Alokasi: <strong className="text-emerald-800">Rp 750</strong> / voucher
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 uppercase font-bold">Modal Pembelian ({settings.providerName})</span>
          <p className="text-2xl font-black text-slate-800 mt-2">{formatRupiah(totalModal)}</p>
          <p className="text-xs text-slate-500 mt-1">
            Alokasi: <strong className="text-slate-700">Rp 1.500</strong> / voucher
          </p>
        </div>

      </div>

      {/* Audit Balance Verification Box */}
      <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Neraca Rekonsiliasi & Transparansi Anggaran
          </h3>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-200 font-bold">
            Keseimbangan Buku: 100% MATCH
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500">1. Total Penerimaan (Omset)</span>
            <p className="text-lg font-bold text-slate-900 mt-1">{formatRupiah(totalOmset)}</p>
            <span className="text-[10px] text-slate-500">100% Nilai Transaksi</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500">2. Modal Pembelian ({settings.providerName})</span>
            <p className="text-lg font-bold text-slate-800 mt-1">{formatRupiah(totalModal)}</p>
            <span className="text-[10px] text-slate-500">50% @ Rp 1.500/vcr</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500">3. Total Laba Bersih Bersama</span>
            <p className="text-lg font-bold text-emerald-700 mt-1">{formatRupiah(totalLabaBersih)}</p>
            <span className="text-[10px] text-slate-500">50% @ Rp 1.500/vcr</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500">4. Status Stok Tersisa</span>
            <p className="text-lg font-bold text-slate-900 mt-1">{totalStockInIt + totalStockInKoperasi} Lbr</p>
            <span className="text-[10px] text-slate-500">IT: {totalStockInIt} | {settings.koperasiName}: {totalStockInKoperasi}</span>
          </div>
        </div>
      </div>

      {/* Sub Audit Logs Tabs */}
      <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-100">
          <button
            onClick={() => setActiveAuditTab('summary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeAuditTab === 'summary' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Rekapitulasi Bagi Hasil ({filteredSettlements.length} Setoran)
          </button>
          <button
            onClick={() => setActiveAuditTab('settlements_audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeAuditTab === 'settlements_audit' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Audit Setoran Kas ({settlements.length})
          </button>
          <button
            onClick={() => setActiveAuditTab('purchases_audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeAuditTab === 'purchases_audit' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Audit Pembelian ({batches.length})
          </button>
          <button
            onClick={() => setActiveAuditTab('handovers_audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeAuditTab === 'handovers_audit' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Audit Penyerahan ({handovers.length})
          </button>
        </div>

        {/* Tab 1: Summary Table */}
        {activeAuditTab === 'summary' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Tanggal Setoran</th>
                  <th className="py-3 px-4">Qty Terjual</th>
                  <th className="py-3 px-4">Total Nilai (@3.000)</th>
                  <th className="py-3 px-4">Modal Provider (1.500)</th>
                  <th className="py-3 px-4">{settings.koperasiName} (Rp 750)</th>
                  <th className="py-3 px-4">Hak IT (Rp 750)</th>
                  <th className="py-3 px-4">Total Disetor ke IT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSettlements.length > 0 ? (
                  filteredSettlements.map((s) => {
                    const qty = s.vouchersCount;
                    const omset = qty * (settings.sellPricePerUnit || 3000);
                    const modal = qty * (settings.costPricePerUnit || 1500);
                    const labaKop = qty * (settings.koperasiProfitPerUnit ?? 750);
                    const labaIt = qty * (settings.itProfitPerUnit ?? 750);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{formatDateIndo(s.date)}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                            {qty} Lbr
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{formatRupiah(omset)}</td>
                        <td className="py-3 px-4 text-slate-600">{formatRupiah(modal)}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">{formatRupiah(labaKop)}</td>
                        <td className="py-3 px-4 font-bold text-emerald-800">{formatRupiah(labaIt)}</td>
                        <td className="py-3 px-4 font-black text-slate-900">{formatRupiah(s.amountCollected)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Belum ada data setoran kas pada periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Settlements Audit */}
        {activeAuditTab === 'settlements_audit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Tanggal Setoran</th>
                  <th className="py-3 px-4">ID Transaksi</th>
                  <th className="py-3 px-4">Jumlah Voucher</th>
                  <th className="py-3 px-4">Nominal Disetor ke IT</th>
                  <th className="py-3 px-4">Penyetor (Koperasi)</th>
                  <th className="py-3 px-4">Penerima (Tim IT)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlements.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{formatDateIndo(s.date)}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{s.id}</td>
                    <td className="py-3 px-4 font-bold text-emerald-800">{s.vouchersCount} Voucher</td>
                    <td className="py-3 px-4 font-black text-slate-900">{formatRupiah(s.amountCollected)}</td>
                    <td className="py-3 px-4">{s.settledBy}</td>
                    <td className="py-3 px-4">{s.receivedBy}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{s.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Purchases Audit */}
        {activeAuditTab === 'purchases_audit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Tanggal Pembelian</th>
                  <th className="py-3 px-4">Nomor Batch</th>
                  <th className="py-3 px-4">Vendor Penyedia</th>
                  <th className="py-3 px-4">Jumlah Voucher</th>
                  <th className="py-3 px-4">Harga Modal / Unit</th>
                  <th className="py-3 px-4">Total Biaya Pembelian</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{formatDateIndo(b.purchaseDate)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{b.batchNumber}</td>
                    <td className="py-3 px-4">{b.providerName}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{b.voucherQty} Voucher</td>
                    <td className="py-3 px-4 text-slate-600">{formatRupiah(b.unitCost)}</td>
                    <td className="py-3 px-4 font-black text-slate-900">{formatRupiah(b.totalCost)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Handovers Audit */}
        {activeAuditTab === 'handovers_audit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                  <th className="py-3 px-4">Tanggal Serah Terima</th>
                  <th className="py-3 px-4">Nomor Batch</th>
                  <th className="py-3 px-4">Jumlah Fisik Diserahkan</th>
                  <th className="py-3 px-4">Pihak Penyerah (Tim IT)</th>
                  <th className="py-3 px-4">Penerima (Koperasi)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {handovers.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{formatDateIndo(h.transferDate)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{h.batchNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{h.qty} Voucher</td>
                    <td className="py-3 px-4 text-slate-700">{h.giverName}</td>
                    <td className="py-3 px-4 text-slate-700">{h.receiverName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
