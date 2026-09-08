import React, { useState } from 'react';
import {
  VoucherBatch,
  VoucherItem,
  SettlementRecord,
  ExpenseRecord,
  SystemSettings
} from '../types';
import { formatRupiah, formatDateIndo, parseStaffNames } from '../utils/format';
import { Printer, X, FileSpreadsheet, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
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

  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  const costPrice = settings.costPricePerUnit || 1500;
  const itRate = settings.itProfitPerUnit ?? 750;
  const kopRate = settings.koperasiProfitPerUnit ?? 750;
  const sellPrice = settings.sellPricePerUnit || 3000;

  const totalVouchersSold = settlements.reduce((acc, s) => acc + s.vouchersCount, 0);
  const totalOmset = totalVouchersSold * sellPrice;
  const totalUangBeliSidnet = totalVouchersSold * costPrice;
  const totalLabaKoperasi = totalVouchersSold * kopRate;
  const totalLabaItKotor = totalVouchersSold * itRate;
  const totalLabaKepsek = totalVouchersSold * (settings.kepsekProfitPerUnit ?? 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalLabaItBersih = totalLabaItKotor - totalExpenses;
  const totalLabaBersih = totalLabaKoperasi + totalLabaItBersih + totalLabaKepsek;
  const totalDisetorKeIt = settlements.reduce((acc, s) => acc + s.amountCollected, 0);

  const totalStockInIt = vouchers.filter(v => v.status === 'DI_IT').length;
  const totalStockInKoperasi = vouchers.filter(v => v.status === 'DI_KOPERASI').length;

  const handlePrint = async () => {
    const element = document.getElementById('print-report-area');
    if (!element) return;
    
    setIsPrinting(true);
    try {
      // Use pixelRatio: 4 for crystal-clear 300-400 DPI print quality
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 4,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210; // 210mm A4 width
      const pageHeight = 297; // 297mm A4 height
      const topMargin = 8; // 8mm top margin (starts neatly at top of paper)
      const sideMargin = 8; // 8mm side margin
      const maxPrintWidth = pageWidth - (sideMargin * 2); // 194mm
      const maxPrintHeight = pageHeight - topMargin - 8; // 281mm max printable height

      const elemWidth = element.offsetWidth || 794;
      const elemHeight = element.scrollHeight || element.offsetHeight;
      const contentRatio = elemHeight / elemWidth;

      let renderWidth = maxPrintWidth;
      let renderHeight = renderWidth * contentRatio;

      // If document height exceeds available page height, scale down proportionally so signatures never get cut off
      if (renderHeight > maxPrintHeight) {
        renderHeight = maxPrintHeight;
        renderWidth = renderHeight / contentRatio;
      }

      // Position from TOP margin (posisi di atas kertas) and center horizontally
      const posX = (pageWidth - renderWidth) / 2;
      const posY = topMargin;

      pdf.addImage(dataUrl, 'PNG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
      pdf.save(`Laporan_Resmi_REKAPIN_AJA_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsPrinting(false);
    }
  };

  const handleNativePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print-container">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
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
                Dokumen resmi presisi 1 lembar A4 lengkap dengan rincian laba & 3 tanda tangan pengesahan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end flex-wrap">
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
              disabled={isPrinting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-75"
            >
              {isPrinting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses PDF Tajam...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Unduh PDF (1 Halaman)</span>
                </>
              )}
            </button>
            <button
              onClick={handleNativePrint}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer hidden sm:flex"
              title="Cetak langsung ke printer fisik"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Printer Fisik</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container for Preview */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-6 bg-slate-100/70 flex justify-center items-start print:p-0 print:bg-white">
          {/* Printable Report Document (A4 1-Page Layout with Explicit Width & Sharp High-Contrast Bold Fonts) */}
          <div
            id="print-report-area"
            className="w-full max-w-[794px] bg-white text-slate-950 font-sans p-5 sm:p-7 rounded-lg shadow-sm border-2 border-slate-800 print:shadow-none print:border-none print:p-0 print:max-w-none antialiased"
          >
            
            {/* Header Kop Surat (Sleek, Crisp & Official with Strong Bottom Border) */}
            <div className="pb-3 border-b-2 border-slate-900 mb-3.5 print-no-break">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight font-sans">
                    <span className="text-[#CC2302]">REKAPIN</span> <span className="text-sky-700">AJA</span>
                  </h2>
                  <p className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">
                    UNIT PENGELOLAAN IT & {settings.koperasiName}
                  </p>
                  <p className="text-[11.5px] text-slate-800 font-semibold mt-0.5">
                    Sistem Informasi Pendapatan & Akuntabilitas Penjualan Voucher WiFi Sekolah
                  </p>
                </div>
                <div className="text-right border-l-4 border-emerald-700 pl-3.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10.5px] font-black bg-emerald-100 text-emerald-950 uppercase tracking-widest border-2 border-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" /> DOKUMEN RESMI LPJ
                  </span>
                  <p className="text-xs font-mono text-slate-950 mt-1 font-black">
                    LPJ-WF/{new Date().getFullYear()}/{String(new Date().getMonth() + 1).padStart(2, '0')}
                  </p>
                  <p className="text-[10.5px] text-slate-800 font-bold">
                    Tgl Cetak: {formatDateIndo(todayStr)}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 1 & 2 Side-by-Side 2-Column Layout */}
            <div className="grid grid-cols-2 gap-3.5 mb-3.5 print-no-break">
              
              {/* Box A: Ringkasan Penjualan & Keuangan */}
              <div className="border-2 border-slate-800 rounded-lg p-3 bg-white shadow-2xs">
                <div className="flex items-center justify-between pb-1.5 border-b-2 border-slate-800 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-950">
                    I. Volume Penjualan & Omset
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-950 font-black px-2 py-0.5 rounded border border-slate-700">
                    Terverifikasi
                  </span>
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="py-1 text-slate-800 font-bold">Voucher Terjual (Setor)</td>
                      <td className="py-1 text-right font-black text-slate-950">{totalVouchersSold} Lembar</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="py-1 text-slate-800 font-bold">Harga Jual per Voucher</td>
                      <td className="py-1 text-right font-black text-slate-950">{formatRupiah(sellPrice)}</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="py-1 text-slate-800 font-bold">Total Penerimaan (Omset)</td>
                      <td className="py-1 text-right font-black text-emerald-950">{formatRupiah(totalOmset)}</td>
                    </tr>
                    <tr className="border-b border-slate-300 bg-emerald-50/70">
                      <td className="py-1 px-1 font-black text-slate-950">Total Kas Disetor ke IT</td>
                      <td className="py-1 px-1 text-right font-black text-emerald-950">{formatRupiah(totalDisetorKeIt)}</td>
                    </tr>
                    <tr className="bg-sky-50">
                      <td className="py-1 px-1 text-sky-950">
                        <span className="font-black text-slate-950 block">Uang Beli Voucher ke PT SIDNet</span>
                        <span className="text-[10px] text-sky-900 block font-bold">(Diambil dari kas setor IT @{formatRupiah(costPrice)})</span>
                      </td>
                      <td className="py-1 px-1 text-right font-black text-sky-950">{formatRupiah(totalUangBeliSidnet)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Box B: Posisi Stok Voucher & Network Info */}
              <div className="border-2 border-slate-800 rounded-lg p-3 bg-white shadow-2xs">
                <div className="flex items-center justify-between pb-1.5 border-b-2 border-slate-800 mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-950">
                    II. Status Stok & Jaringan
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-950 font-black px-2 py-0.5 rounded border border-slate-700">
                    SSID: {settings.wifiSsid}
                  </span>
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-slate-300">
                      <td className="py-1 text-slate-800 font-bold">Stok Tersedia di Tim IT</td>
                      <td className="py-1 text-right font-black text-slate-950">{totalStockInIt} Voucher</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="py-1 text-slate-800 font-bold">Stok di Etalase Koperasi</td>
                      <td className="py-1 text-right font-black text-slate-950">{totalStockInKoperasi} Voucher</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="py-1 text-slate-800 font-bold">Total Belum Terjual</td>
                      <td className="py-1 text-right font-black text-amber-950">{totalStockInIt + totalStockInKoperasi} Voucher</td>
                    </tr>
                    <tr className="border-b border-slate-300">
                      <td className="py-1 text-slate-800 font-bold">Penyedia Kuota Induk</td>
                      <td className="py-1 text-right font-black text-slate-950">{settings.providerName}</td>
                    </tr>
                    <tr className="bg-slate-100">
                      <td className="py-1 px-1 font-black text-slate-900">Pembagian Nisbah Laba</td>
                      <td className="py-1 px-1 text-right font-black text-slate-950">50% Kop : 50% IT</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* Section III: Rincian Pengeluaran Operasional IT */}
            <div className="mb-3.5 print-no-break border-2 border-slate-800 rounded-lg overflow-hidden">
              <div className="bg-slate-200 border-b-2 border-slate-800 text-slate-950 px-3 py-1.5 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-950">
                  III. Catatan Pengeluaran Operasional & Pemeliharaan Jaringan
                </span>
                <span className="text-[11px] font-black text-rose-900">
                  {expenses.length > 0 ? `Total ${expenses.length} Transaksi: -${formatRupiah(totalExpenses)}` : 'Nihil (Rp 0)'}
                </span>
              </div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-950 text-left border-b-2 border-slate-800 font-black text-xs uppercase">
                    <th className="p-1.5 w-28 border-r-2 border-slate-800">Tanggal</th>
                    <th className="p-1.5 border-r-2 border-slate-800">Keperluan / Keterangan Pembelian</th>
                    <th className="p-1.5 w-32 text-right">Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-slate-300 text-xs">
                  {expenses.length > 0 ? (
                    expenses.slice(0, 4).map((exp) => (
                      <tr key={exp.id} className="border-b border-slate-300">
                        <td className="p-1.5 border-r-2 border-slate-800 font-mono text-[11px] font-bold text-slate-950">{formatDateIndo(exp.date)}</td>
                        <td className="p-1.5 border-r-2 border-slate-800">
                          <span className="font-bold text-slate-950">{exp.title}</span>
                          {exp.notes && <span className="text-slate-800 block text-[10.5px] font-semibold">Ket: {exp.notes}</span>}
                        </td>
                        <td className="p-1.5 text-right font-black text-rose-900">{formatRupiah(exp.amount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-slate-300">
                      <td colSpan={3} className="p-2 text-center text-slate-700 italic text-xs font-bold">
                        Tidak ada catatan pengeluaran operasional (Beban: Rp 0)
                      </td>
                    </tr>
                  )}
                  <tr className="bg-rose-50 font-black border-t-2 border-slate-800">
                    <td colSpan={2} className="p-1.5 text-right uppercase text-rose-950 text-xs border-r-2 border-slate-800 font-black">
                      Total Pengeluaran Operasional IT
                    </td>
                    <td className="p-1.5 text-right text-rose-950 font-black">{formatRupiah(totalExpenses)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section IV: Table Pembagian Keuntungan Bersih (Profit Sharing) with Abu Muda Header & Bold Frame */}
            <div className="mb-3.5 print-no-break border-2 border-slate-800 rounded-lg overflow-hidden">
              <div className="bg-slate-200 border-b-2 border-slate-800 text-slate-950 px-3 py-1.5 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-950">
                  IV. Rincian Alokasi Bagi Hasil Keuntungan Bersih (Profit Sharing)
                </span>
                <span className="text-[11px] text-slate-900 font-bold font-mono">
                  {totalExpenses > 0 ? `Beban Pengeluaran IT: -${formatRupiah(totalExpenses)}` : 'Ketentuan: 50% Koperasi : 50% IT'}
                </span>
              </div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-950 text-left border-b-2 border-slate-800 font-black text-xs uppercase">
                    <th className="p-1.5 border-r-2 border-slate-800">Penerima Bagi Hasil</th>
                    <th className="p-1.5 border-r-2 border-slate-800">Ketentuan Tarif</th>
                    <th className="p-1.5 border-r-2 border-slate-800 text-center">Persentase</th>
                    <th className="p-1.5 text-right">Total Hak Laba (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-slate-300 text-xs">
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 font-bold text-slate-950 border-r-2 border-slate-800">
                      1. {settings.koperasiName} (Unit Penjualan)
                    </td>
                    <td className="p-1.5 border-r-2 border-slate-800 font-bold text-slate-900">
                      Rp {kopRate.toLocaleString('id-ID')} / voucher
                    </td>
                    <td className="p-1.5 text-center font-black border-r-2 border-slate-800 text-slate-950">50.0%</td>
                    <td className="p-1.5 font-black text-slate-950 text-right">{formatRupiah(totalLabaKoperasi)}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 font-bold text-slate-950 border-r-2 border-slate-800">
                      2. Tim Pengelola IT REKAPIN AJA
                      {totalExpenses > 0 && (
                        <span className="block text-[10.5px] font-semibold text-slate-700">
                          (Laba Kotor {formatRupiah(totalLabaItKotor)} &minus; Beban Pengeluaran {formatRupiah(totalExpenses)})
                        </span>
                      )}
                    </td>
                    <td className="p-1.5 border-r-2 border-slate-800 font-bold text-slate-900">
                      Rp {itRate.toLocaleString('id-ID')} / voucher
                      {totalExpenses > 0 && (
                        <span className="block text-[10.5px] text-rose-800 font-bold">
                          (Net Bersih Operasional)
                        </span>
                      )}
                    </td>
                    <td className="p-1.5 text-center font-black border-r-2 border-slate-800 text-slate-950">50.0%</td>
                    <td className="p-1.5 font-black text-slate-950 text-right">
                      <div>{formatRupiah(totalLabaItBersih)}</div>
                      <span className="block text-[9.5px] font-black text-rose-800 whitespace-nowrap">
                        Sudah dipotong pengeluaran
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-emerald-50 font-black border-t-2 border-slate-800">
                    <td colSpan={3} className="p-2 uppercase text-emerald-950 font-black border-r-2 border-slate-800 text-xs">
                      TOTAL KEUNTUNGAN BERSIH TEREALISASI
                    </td>
                    <td className="p-2 text-right text-emerald-950 text-xs font-black">{formatRupiah(totalLabaBersih)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signatures block (Compact 3-Column Layout with Crisp Strong Frames, Guarantees 1-Page A4 fit) */}
            <div className="pt-2 border-t-2 border-slate-900 print-no-break">
              <p className="text-xs text-right font-bold text-slate-900 mb-1.5">
                Disetujui dan Disahkan pada tanggal: <span className="font-black text-slate-950">{formatDateIndo(todayStr)}</span>
              </p>
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                
                <div className="border-2 border-slate-800 rounded-lg p-2.5 bg-white">
                  <p className="font-black text-slate-950 uppercase text-xs">Pengurus {settings.koperasiName}</p>
                  <span className="text-[10px] text-slate-800 block font-bold">Penyetor Kas / Penjualan</span>
                  <div className="h-10 flex items-end justify-center">
                    <span className="text-[9px] text-slate-500 italic font-bold">( Tanda Tangan & Cap )</span>
                  </div>
                  <p className="font-black text-slate-950 border-t-2 border-slate-800 pt-1 mt-1 text-xs">
                    {settings.koperasiManagerName ? settings.koperasiManagerName : `( Pengurus ${settings.koperasiName} )`}
                  </p>
                </div>

                <div className="border-2 border-slate-800 rounded-lg p-2.5 bg-white">
                  <p className="font-black text-slate-950 uppercase text-xs">Koordinator Tim IT</p>
                  <span className="text-[10px] text-slate-800 block font-bold">Penerima Kas / Pengelola</span>
                  <div className="h-10 flex items-end justify-center">
                    <span className="text-[9px] text-slate-500 italic font-bold">( Tanda Tangan & Cap )</span>
                  </div>
                  <p className="font-black text-slate-950 border-t-2 border-slate-800 pt-1 mt-1 text-xs">
                    {selectedItStaff ? selectedItStaff : `( Tim IT REKAPIN AJA )`}
                  </p>
                </div>

                <div className="border-2 border-slate-800 rounded-lg p-2.5 bg-white">
                  <p className="font-black text-slate-950 uppercase text-xs">Kepala Sekolah (Pengawas)</p>
                  <span className="text-[10px] text-slate-800 block font-bold">Mengetahui & Menyetujui</span>
                  <div className="h-10 flex items-end justify-center">
                    <span className="text-[9px] text-slate-500 italic font-bold">( Tanda Tangan & Cap )</span>
                  </div>
                  <p className="font-black text-slate-950 border-t-2 border-slate-800 pt-1 mt-1 text-xs">
                    {settings.kepalaSekolahName ? settings.kepalaSekolahName : `( Kepala REKAPIN AJA )`}
                  </p>
                </div>

              </div>
              <div className="text-center mt-1.5 text-[9.5px] text-slate-700 italic font-bold">
                Dokumen ini diterbitkan oleh REKAPIN AJA secara resmi sebagai Laporan Pertanggungjawaban (LPJ).
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
