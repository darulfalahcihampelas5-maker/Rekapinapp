import React, { useState, useMemo } from 'react';
import {
  VoucherBatch,
  VoucherHandover,
  SettlementRecord,
  SystemSettings,
  UserRole,
} from '../types';
import { formatRupiah, formatDateIndo } from '../utils/format';
import {
  Calendar,
  ShoppingCart,
  PackageCheck,
  Banknote,
  ChevronRight,
  Printer,
} from 'lucide-react';

interface ActivityHistoryProps {
  batches: VoucherBatch[];
  handovers: VoucherHandover[];
  settlements: SettlementRecord[];
  settings: SystemSettings;
  currentRole?: UserRole;
  onNavigateTab?: (tab: string) => void;
}

type FilterType = 'ALL' | 'PURCHASE' | 'HANDOVER' | 'SETTLEMENT';

interface SimpleActivity {
  id: string;
  type: 'PURCHASE' | 'HANDOVER' | 'SETTLEMENT';
  typeLabel: string;
  badgeClass: string;
  icon: React.ElementType;
  date: string;
  title: string;
  detail: string;
  amount?: number;
  qty?: number;
  targetTab: string;
}

export const ActivityHistory: React.FC<ActivityHistoryProps> = ({
  batches,
  handovers,
  settlements,
  onNavigateTab,
}) => {
  const todayStr = new Date().toISOString().substring(0, 10);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [showAllDates, setShowAllDates] = useState<boolean>(false);

  // Gabungkan 3 transaksi utama
  const activities = useMemo(() => {
    const list: SimpleActivity[] = [];

    // 1. Pembelian ke SIDNet
    batches.forEach((b) => {
      const d = (b.purchaseDate || '').substring(0, 10);
      list.push({
        id: `b-${b.id}`,
        type: 'PURCHASE',
        typeLabel: 'Beli SIDNet',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: ShoppingCart,
        date: d,
        title: `Batch #${b.batchNumber} (${b.voucherQty} Kupon)`,
        detail: `Pengadaan oleh Tim IT • ${b.providerName || 'PT SIDNet'}`,
        amount: b.totalCost,
        qty: b.voucherQty,
        targetTab: 'it_buy_sidnet',
      });
    });

    // 2. Penyerahan ke Koperasi
    handovers.forEach((h) => {
      const d = (h.transferDate || '').substring(0, 10);
      list.push({
        id: `h-${h.id}`,
        type: 'HANDOVER',
        typeLabel: 'Serah Koperasi',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: PackageCheck,
        date: d,
        title: `Batch #${h.batchNumber} (${h.qty} Kupon)`,
        detail: `Dari ${h.giverName || 'IT'} ke ${h.receiverName || 'Koperasi'}`,
        qty: h.qty,
        targetTab: 'it_handover',
      });
    });

    // 3. Penyetoran ke Tim IT
    settlements.forEach((s) => {
      const d = (s.date || '').substring(0, 10);
      list.push({
        id: `s-${s.id}`,
        type: 'SETTLEMENT',
        typeLabel: 'Setoran ke IT',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: Banknote,
        date: d,
        title: `Setoran ${s.vouchersCount} Kupon Terjual`,
        detail: `Oleh ${s.settledBy || 'Koperasi'} ke ${s.receivedBy || 'IT'}`,
        amount: s.amountCollected,
        qty: s.vouchersCount,
        targetTab: 'koperasi_settle',
      });
    });

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [batches, handovers, settlements]);

  // Filter tanggal & tipe
  const filteredList = useMemo(() => {
    return activities.filter((item) => {
      if (!showAllDates && item.date !== selectedDate) return false;
      if (filterType !== 'ALL' && item.type !== filterType) return false;
      return true;
    });
  }, [activities, showAllDates, selectedDate, filterType]);

  // Ringkasan 3 Alur
  const summary = useMemo(() => {
    const list = showAllDates ? activities : activities.filter((a) => a.date === selectedDate);
    const beli = list.filter((a) => a.type === 'PURCHASE');
    const serah = list.filter((a) => a.type === 'HANDOVER');
    const setor = list.filter((a) => a.type === 'SETTLEMENT');

    return {
      beliQty: beli.reduce((acc, i) => acc + (i.qty || 0), 0),
      beliRp: beli.reduce((acc, i) => acc + (i.amount || 0), 0),
      serahQty: serah.reduce((acc, i) => acc + (i.qty || 0), 0),
      setorQty: setor.reduce((acc, i) => acc + (i.qty || 0), 0),
      setorRp: setor.reduce((acc, i) => acc + (i.amount || 0), 0),
    };
  }, [activities, showAllDates, selectedDate]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header & Filter Tanggal */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900">
            Riwayat Aktivitas
          </h2>
          <p className="text-xs text-slate-500">
            {showAllDates ? 'Menampilkan seluruh tanggal' : `Tanggal: ${formatDateIndo(selectedDate)}`}
          </p>
        </div>

        {/* Tombol Tanggal */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
                  setShowAllDates(false);
                }
              }}
              className="bg-transparent font-bold text-slate-800 cursor-pointer focus:outline-none text-xs"
            />
          </div>

          <button
            onClick={() => {
              setSelectedDate(todayStr);
              setShowAllDates(false);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              !showAllDates && selectedDate === todayStr
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            Hari Ini
          </button>

          <button
            onClick={() => setShowAllDates(!showAllDates)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
              showAllDates
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            {showAllDates ? 'Kembali ke Harian' : 'Semua'}
          </button>

          <button
            onClick={() => window.print()}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 cursor-pointer"
            title="Cetak"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ringkasan 3 Kotak Bersih */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Beli SIDNet */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-indigo-700 block">
            1. Pembelian SIDNet
          </span>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
            {summary.beliQty} <span className="text-xs font-normal text-slate-500">voucher</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            {formatRupiah(summary.beliRp)}
          </span>
        </div>

        {/* 2. Serah Koperasi */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 block">
            2. Serah Koperasi
          </span>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
            {summary.serahQty} <span className="text-xs font-normal text-slate-500">voucher</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Diterima Koperasi
          </span>
        </div>

        {/* 3. Setor ke IT */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 block">
            3. Setoran ke IT
          </span>
          <div className="text-base sm:text-lg font-black text-emerald-700 mt-0.5">
            {formatRupiah(summary.setorRp)}
          </div>
          <span className="text-[11px] text-slate-500 block">
            {summary.setorQty} voucher terjual
          </span>
        </div>
      </div>

      {/* Filter Tabs 3 Kategori */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'Semua' },
          { id: 'PURCHASE', label: '1. Pembelian' },
          { id: 'HANDOVER', label: '2. Serah Terima' },
          { id: 'SETTLEMENT', label: '3. Setoran' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterType(t.id as FilterType)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === t.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Daftar Transaksi Sederhana */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Tidak ada riwayat transaksi pada tanggal ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredList.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-3 sm:p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
                >
                  {/* Kiri: Jenis & Keterangan Singkat */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-xl border shrink-0 ${item.badgeClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${item.badgeClass}`}>
                          {item.typeLabel}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.title}
                        </span>
                        {showAllDates && (
                          <span className="text-[11px] text-slate-400">
                            ({formatDateIndo(item.date)})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.detail}
                      </p>
                    </div>
                  </div>

                  {/* Kanan: Nilai & Tombol */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      {item.amount !== undefined && (
                        <div className="text-xs sm:text-sm font-bold text-slate-900">
                          {formatRupiah(item.amount)}
                        </div>
                      )}
                      {item.qty !== undefined && item.amount === undefined && (
                        <div className="text-xs font-bold text-slate-700">
                          {item.qty} Kupon
                        </div>
                      )}
                    </div>

                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab(item.targetTab)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Buka menu"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
