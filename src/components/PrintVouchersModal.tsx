import React from 'react';
import { VoucherItem, SystemSettings, VoucherBatch } from '../types';
import { Printer, X, Wifi } from 'lucide-react';

interface PrintVouchersModalProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: VoucherItem[];
  settings: SystemSettings;
  batch?: VoucherBatch;
}

export const PrintVouchersModal: React.FC<PrintVouchersModalProps> = ({
  isOpen,
  onClose,
  vouchers,
  settings,
  batch,
}) => {
  if (!isOpen) return null;

  // Filter vouchers if a specific batch is provided, otherwise show all that are DI_IT or DI_KOPERASI
  const vouchersToPrint = batch 
    ? vouchers.filter(v => v.batchId === batch.id)
    : vouchers.filter(v => v.status === 'DI_IT' || v.status === 'DI_KOPERASI');

  const handlePrint = () => {
    window.focus();
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print-container">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cetak Voucher Fisik
              </h3>
              <p className="text-xs text-slate-500">
                {batch ? `Batch: ${batch.batchNumber}` : 'Semua voucher tersedia'} &bull; {vouchersToPrint.length} Lembar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Grid */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 print:bg-white print:p-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 print:grid-cols-4 print:gap-2">
            {vouchersToPrint.map((voucher) => (
              <div 
                key={voucher.id} 
                className="bg-white border-2 border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center relative overflow-hidden print:border-slate-300 print:rounded-none print:w-[4.5cm] print:h-[3cm] print:m-0"
              >
                {/* School Name & SSID */}
                <div className="w-full flex items-center justify-between mb-2 pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-emerald-600" />
                    <span className="text-[8px] font-black uppercase text-slate-800 truncate max-w-[60px]">
                      REKAPIN App
                    </span>
                  </div>
                  <span className="text-[7px] font-bold text-slate-500">{settings.wifiSsid}</span>
                </div>

                {/* Voucher Code */}
                <div className="text-center my-1">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-widest">Login Code</span>
                  <span className="text-sm font-black text-slate-900 font-mono tracking-tight select-all">
                    {voucher.code}
                  </span>
                </div>

                {/* Serial & Duration */}
                <div className="w-full flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                  <span className="text-[7px] text-slate-400 font-mono">SN: {voucher.serialNumber}</span>
                  <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {voucher.duration || '6 Jam'}
                  </span>
                </div>

                {/* Decorative cut line for print */}
                <div className="absolute -bottom-1 -left-1 -right-1 h-px border-b border-dashed border-slate-300 hidden print:block"></div>
                <div className="absolute -top-1 -bottom-1 -right-1 w-px border-r border-dashed border-slate-300 hidden print:block"></div>
              </div>
            ))}
          </div>

          {vouchersToPrint.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-sm">Tidak ada voucher yang tersedia untuk dicetak.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
