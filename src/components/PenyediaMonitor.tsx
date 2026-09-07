import React from 'react';
import { VoucherBatch, SystemSettings } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/format';
import { Package } from 'lucide-react';

interface PenyediaMonitorProps {
  batches: VoucherBatch[];
  settings: SystemSettings;
}

export const PenyediaMonitor: React.FC<PenyediaMonitorProps> = ({ batches, settings }) => {
  const totalVolume = batches.reduce((acc, b) => acc + b.voucherQty, 0);
  const totalInvoiced = batches.reduce((acc, b) => acc + b.totalCost, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            Portal Pemasok & Vendor
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Riwayat Pembelian Kuota dari Tim IT {settings.schoolName}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penyedia: <strong className="text-slate-800">{settings.providerName}</strong> &bull; Harga Modal Grosir: <strong className="text-emerald-700">Rp {settings.costPricePerUnit.toLocaleString('id-ID')} / voucher</strong>
          </p>
        </div>

        <div className="flex gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-right">
            <span className="text-[11px] text-slate-500 block">Total Volume Pesanan:</span>
            <span className="text-lg font-bold text-slate-900">{totalVolume} Voucher</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-right">
            <span className="text-[11px] text-emerald-800 block font-medium">Total Tagihan Lunas:</span>
            <span className="text-lg font-bold text-emerald-700">{formatRupiah(totalInvoiced)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Package className="w-4 h-4 text-emerald-600" />
          Daftar Surat Pesanan / Batch Pembelian
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[11px] border-b border-slate-200">
                <th className="py-3 px-4">Nomor Batch</th>
                <th className="py-3 px-4">Tanggal Order</th>
                <th className="py-3 px-4">Jumlah Kuota</th>
                <th className="py-3 px-4">Harga Satuan</th>
                <th className="py-3 px-4">Total Tagihan</th>
                <th className="py-3 px-4">Prefix Seri</th>
                <th className="py-3 px-4 text-right">Status Pembayaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.length > 0 ? (
                batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{b.batchNumber}</td>
                    <td className="py-3.5 px-4 text-slate-600">{formatDateIndo(b.purchaseDate)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{b.voucherQty} Voucher</td>
                    <td className="py-3.5 px-4 text-slate-600">{formatRupiah(b.unitCost)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{formatRupiah(b.totalCost)}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{b.serialPrefix}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                        LUNAS (TERVERIFIKASI)
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Belum ada riwayat pesanan batch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
