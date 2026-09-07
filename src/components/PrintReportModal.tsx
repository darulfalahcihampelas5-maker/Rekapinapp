import React from 'react';
import {
  VoucherBatch,
  VoucherItem,
  SettlementRecord,
  ExpenseRecord,
  SystemSettings
} from '../types';
import { formatRupiah, formatDateIndo, parseStaffNames } from '../utils/format';
import { Printer, X, FileSpreadsheet, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: VoucherBatch[];
  vouchers: VoucherItem[];
  settlements: SettlementRecord[];
  expenses: ExpenseRecord[];
  settings: SystemSettings;
  selectedItStaff?: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  batches,
  vouchers,
  settlements,
  expenses,
  settings,
  selectedItStaff: propSelectedItStaff,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const itStaffList = parseStaffNames(settings.itStaffNames);
  const koperasiStaffList = parseStaffNames(settings.koperasiManagerName);
  const [selectedItStaff, setSelectedItStaff] = React.useState<string>(
    propSelectedItStaff || itStaffList[0] || `Tim IT REKAPIN AJA`
  );
  const [selectedKoperasiStaff, setSelectedKoperasiStaff] = React.useState<string>(koperasiStaffList[0] || settings.koperasiName);

  React.useEffect(() => {
    if (propSelectedItStaff) {
      setSelectedItStaff(propSelectedItStaff);
    } else {
      const itList = parseStaffNames(settings.itStaffNames);
      if (itList.length > 0 && !itList.includes(selectedItStaff)) {
        setSelectedItStaff(itList[0]);
      }
    }
  }, [propSelectedItStaff, settings.itStaffNames, isOpen]);

  React.useEffect(() => {
    const kopList = parseStaffNames(settings.koperasiManagerName);
    if (kopList.length > 0 && !kopList.includes(selectedKoperasiStaff)) {
      setSelectedKoperasiStaff(kopList[0]);
    }
  }, [settings.koperasiManagerName]);

  if (!isOpen) return null;

  const totalVouchersSold = settlements.reduce((acc, s) => acc + s.vouchersCount, 0);
  const totalOmset = totalVouchersSold * (settings.sellPricePerUnit || 3000);
  const totalModal = totalVouchersSold * (settings.costPricePerUnit || 1500);
  const totalLabaKoperasi = totalVouchersSold * (settings.koperasiProfitPerUnit ?? 750);
  const totalLabaIt = totalVouchersSold * (settings.itProfitPerUnit ?? 750);
  const totalLabaKepsek = totalVouchersSold * (settings.kepsekProfitPerUnit ?? 0);
  const totalLabaBersih = totalLabaKoperasi + totalLabaIt + totalLabaKepsek;
  const totalDisetorKeIt = settlements.reduce((acc, s) => acc + s.amountCollected, 0);

  const totalStockInIt = vouchers.filter(v => v.status === 'DI_IT').length;
  const totalStockInKoperasi = vouchers.filter(v => v.status === 'DI_KOPERASI').length;
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  const handlePrint = async () => {
    const element = document.getElementById('print-report-area');
    if (!element) return;
    
    try {
      const dataUrl = await toPng(element, { quality: 0.98, backgroundColor: '#ffffff' });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Laporan_REKAPIN_AJA_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print-container">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Laporan Rekapitulasi Keuangan & Bagi Hasil (Format A4 Resmi)
              </h3>
              <p className="text-xs text-slate-500">
                Desain elegan & profesional disesuaikan persis untuk 1 lembar kertas A4 / PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {itStaffList.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium hidden md:inline">Petugas IT:</span>
                <select
                  value={selectedItStaff}
                  onChange={(e) => setSelectedItStaff(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {itStaffList.map((name, i) => (
                    <option key={i} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF (1 Halaman)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document (A4 1-Page Layout) */}
        <div id="print-report-area" className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0 print:m-0">
          
          {/* Header Kop Surat (Sleek & Official) */}
          <div className="pb-3 border-b-2 border-slate-900 mb-4 print-no-break">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight font-sans">
                  <span className="text-[#CC2302]">REKAPIN</span> <span className="text-sky-600">AJA</span>
                </h2>
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  UNIT PENGELOLAAN IT & {settings.koperasiName}
                </p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Sistem Informasi Pendapatan & Akuntabilitas Penjualan Voucher WiFi Sekolah
                </p>
              </div>
              <div className="text-right border-l-2 border-emerald-600 pl-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3" /> DOKUMEN RESMI LPJ
                </span>
                <p className="text-[10px] font-mono text-slate-600 mt-1 font-bold">
                  LPJ-WF/{new Date().getFullYear()}/{String(new Date().getMonth() + 1).padStart(2, '0')}
                </p>
                <p className="text-[9px] text-slate-400 font-medium">
                  Tgl Cetak: {formatDateIndo(todayStr)}
                </p>
              </div>
            </div>
          </div>

          {/* Section 1 & 2 Side-by-Side 2-Column Layout */}
          <div className="grid grid-cols-2 gap-3 mb-4 print-no-break">
            
            {/* Box A: Ringkasan Penjualan & Keuangan */}
            <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/50">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  I. Volume Penjualan & Omset
                </span>
                <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded">
                  Terverifikasi
                </span>
              </div>
              <table className="w-full text-[11px]">
                <tbody>
                  <tr className="border-b border-slate-200/60">
                    <td className="py-1 text-slate-600">Voucher Terjual (Setor)</td>
                    <td className="py-1 text-right font-extrabold text-slate-900">{totalVouchersSold} Lembar</td>
                  </tr>
                  <tr className="border-b border-slate-200/60">
                    <td className="py-1 text-slate-600">Harga Jual per Voucher</td>
                    <td className="py-1 text-right font-bold text-slate-800">{formatRupiah(settings.sellPricePerUnit)}</td>
                  </tr>
                  <tr className="border-b border-slate-200/60">
                    <td className="py-1 text-slate-600">Total Penerimaan (Omset)</td>
                    <td className="py-1 text-right font-extrabold text-emerald-800">{formatRupiah(totalOmset)}</td>
                  </tr>
                  <tr className="border-b border-slate-200/60">
                    <td className="py-1 text-slate-600">Modal Kuota (@1.500)</td>
                    <td className="py-1 text-right font-semibold text-slate-700">{formatRupiah(totalModal)}</td>
                  </tr>
                  <tr className="bg-emerald-50/80">
                    <td className="py-1 px-1 font-bold text-emerald-900">Total Kas Disetor ke IT</td>
                    <td className="py-1 px-1 text-right font-black text-emerald-800">{formatRupiah(totalDisetorKeIt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Box B: Posisi Stok Voucher & Network Info */}
            <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50/50">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  II. Status Stok & Jaringan
                </span>
                <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded">
                  SSID: {settings.wifiSsid}
                </span>
              </div>
              <table className="w-full text-[11px]">
                <tbody>
                  <tr className="border-b border-slate-200/60">
                    <td className="py-1 text-slate-600">Stok Tersedia di Tim IT</td>
                    <td className="py-1 text-right font-bold text-slate-800">{totalStockInIt} Voucher</td>
                  </tr>
                  <tr className="border-b border-slate-200/60">
                    <td className="py-1 text-slate-600">Stok di Etalase Koperasi</td>
                    <td className="py-1 text-right font-bold text-slate-800">{totalStockInKoperasi} Voucher</td>
                  </tr>
                  <tr className="border-b border-slate-200/60">
                    <td className="py-1 text-slate-600">Total Belum Terjual</td>
                    <td className="py-1 text-right font-black text-amber-700">{totalStockInIt + totalStockInKoperasi} Voucher</td>
                  </tr>
                  <tr className="border-b border-slate-200/60">
                    <td className="py-1 text-slate-600">Penyedia Kuota Induk</td>
                    <td className="py-1 text-right font-bold text-slate-800">{settings.providerName}</td>
                  </tr>
                  <tr className="bg-slate-100">
                    <td className="py-1 px-1 font-bold text-slate-700">Pembagian Nisbah Laba</td>
                    <td className="py-1 px-1 text-right font-bold text-slate-900">50% Kop : 50% IT</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          {/* Section III: Table Pembagian Keuntungan Bersih */}
          <div className="mb-4 print-no-break">
            <div className="bg-slate-800 text-white px-3 py-1 rounded-t-md flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                III. Rincian Alokasi Bagi Hasil Keuntungan Bersih (Profit Sharing)
              </span>
              <span className="text-[9px] text-slate-300 font-mono">Ketentuan per Voucher: Rp 1.500 Net Profit</span>
            </div>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 text-left border-b border-slate-300 font-bold text-[10px] uppercase">
                  <th className="p-1.5 border-r border-slate-300">Penerima Bagi Hasil</th>
                  <th className="p-1.5 border-r border-slate-300">Ketentuan Tarif</th>
                  <th className="p-1.5 border-r border-slate-300 text-center">Persentase</th>
                  <th className="p-1.5 text-right">Total Hak Hak Laba (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                <tr>
                  <td className="p-1.5 font-bold text-slate-900 border-r border-slate-200">
                    1. {settings.koperasiName} (Unit Penjualan)
                  </td>
                  <td className="p-1.5 border-r border-slate-200">
                    Rp {(settings.koperasiProfitPerUnit || 750).toLocaleString('id-ID')} / voucher
                  </td>
                  <td className="p-1.5 text-center font-bold border-r border-slate-200">50.0%</td>
                  <td className="p-1.5 font-extrabold text-slate-900 text-right">{formatRupiah(totalLabaKoperasi)}</td>
                </tr>
                <tr>
                  <td className="p-1.5 font-bold text-slate-900 border-r border-slate-200">
                    2. Tim Pengelola IT REKAPIN AJA
                  </td>
                  <td className="p-1.5 border-r border-slate-200">
                    Rp {(settings.itProfitPerUnit ?? 750).toLocaleString('id-ID')} / voucher
                  </td>
                  <td className="p-1.5 text-center font-bold border-r border-slate-200">50.0%</td>
                  <td className="p-1.5 font-extrabold text-slate-900 text-right">{formatRupiah(totalLabaIt)}</td>
                </tr>
                <tr className="bg-emerald-50 font-black border-t-2 border-emerald-600">
                  <td colSpan={3} className="p-2 uppercase text-emerald-950 font-bold border-r border-slate-300">
                    TOTAL KEUNTUNGAN BERSIH TEREALISASI
                  </td>
                  <td className="p-2 text-right text-emerald-900 text-xs font-black">{formatRupiah(totalLabaBersih)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section IV: Rincian Pengeluaran Operasional IT (If available) */}
          {expenses.length > 0 && (
            <div className="mb-4 print-no-break">
              <div className="bg-rose-900 text-white px-3 py-1 rounded-t-md flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  IV. Catatan Pengeluaran Operasional & Pemeliharaan Jaringan
                </span>
                <span className="text-[9px] text-rose-200">Total {expenses.length} Transaksi</span>
              </div>
              <table className="w-full text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-left border-b border-slate-300 font-bold text-[10px] uppercase">
                    <th className="p-1.5 w-24 border-r border-slate-300">Tanggal</th>
                    <th className="p-1.5 border-r border-slate-300">Keperluan / Keterangan Pembelian</th>
                    <th className="p-1.5 w-32 text-right">Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {expenses.slice(0, 4).map((exp) => (
                    <tr key={exp.id}>
                      <td className="p-1.5 border-r border-slate-200 font-mono text-[10px]">{formatDateIndo(exp.date)}</td>
                      <td className="p-1.5 border-r border-slate-200">
                        <span className="font-bold text-slate-900">{exp.title}</span>
                        {exp.notes && <span className="text-slate-500 block text-[9px]">Ket: {exp.notes}</span>}
                      </td>
                      <td className="p-1.5 text-right font-bold text-rose-700">{formatRupiah(exp.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-rose-50 font-extrabold border-t-2 border-rose-300">
                    <td colSpan={2} className="p-1.5 text-right uppercase text-rose-900 text-[10px] border-r border-slate-300">
                      Total Pengeluaran Operasional
                    </td>
                    <td className="p-1.5 text-right text-rose-800 font-black">{formatRupiah(totalExpenses)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Signatures block (Compact 3-Column Layout, Guarantees 1-Page A4 fit) */}
          <div className="pt-3 border-t-2 border-slate-300 print-no-break">
            <p className="text-[10px] text-right font-semibold text-slate-600 mb-2">
              Disetujui dan Disahkan pada tanggal: <span className="font-bold text-slate-900">{formatDateIndo(todayStr)}</span>
            </p>
            <div className="grid grid-cols-3 gap-3 text-center text-[10px]">
              
              <div className="border border-slate-200 rounded p-2 bg-slate-50/50">
                <p className="font-bold text-slate-700 uppercase">Pengurus {settings.koperasiName}</p>
                <span className="text-[8px] text-slate-400 block">Penyetor Kas / Penjualan</span>
                <div className="h-10 flex items-end justify-center">
                  <span className="text-[8px] text-slate-300 italic">( Tanda Tangan & Cap )</span>
                </div>
                <p className="font-bold text-slate-900 border-t border-slate-400 pt-0.5 mt-1">
                  {settings.koperasiManagerName ? settings.koperasiManagerName : `( Pengurus ${settings.koperasiName} )`}
                </p>
              </div>

              <div className="border border-slate-200 rounded p-2 bg-slate-50/50">
                <p className="font-bold text-slate-700 uppercase">Koordinator Tim IT</p>
                <span className="text-[8px] text-slate-400 block">Penerima Kas / Pengelola</span>
                <div className="h-10 flex items-end justify-center">
                  <span className="text-[8px] text-slate-300 italic">( Tanda Tangan & Cap )</span>
                </div>
                <p className="font-bold text-slate-900 border-t border-slate-400 pt-0.5 mt-1">
                  {selectedItStaff ? selectedItStaff : `( Tim IT REKAPIN AJA )`}
                </p>
              </div>

              <div className="border border-slate-200 rounded p-2 bg-slate-50/50">
                <p className="font-bold text-slate-700 uppercase">Kepala Sekolah (Pengawas)</p>
                <span className="text-[8px] text-slate-400 block">Mengetahui & Menyetujui</span>
                <div className="h-10 flex items-end justify-center">
                  <span className="text-[8px] text-slate-300 italic">( Tanda Tangan & Cap )</span>
                </div>
                <p className="font-bold text-slate-900 border-t border-slate-400 pt-0.5 mt-1">
                  {settings.kepalaSekolahName ? settings.kepalaSekolahName : `( Kepala REKAPIN AJA )`}
                </p>
              </div>

            </div>
            <div className="text-center mt-2 text-[8px] text-slate-400 italic">
              Dokumen ini diterbitkan oleh REKAPIN AJA secara resmi.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
