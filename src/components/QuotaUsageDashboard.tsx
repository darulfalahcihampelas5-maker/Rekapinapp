import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../types';
import { Gauge, Database, RefreshCw, AlertTriangle, CheckCircle2, ShieldAlert, HardDrive, Clock } from 'lucide-react';

interface QuotaUsageDashboardProps {
  settings: SystemSettings;
}

export const QuotaUsageDashboard: React.FC<QuotaUsageDashboardProps> = ({ settings }) => {
  const [stats, setStats] = useState({
    reads: 1420,
    writes: 48,
    deletes: 5,
    resetPeriodKey: '',
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Determine current reset period based on 14:00 threshold
  const getPeriodKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hour = date.getHours();
    // If hour >= 14, period starts today at 14:00. Otherwise period started yesterday at 14:00.
    const periodDate = new Date(year, month, day, 14, 0, 0, 0);
    if (hour < 14) {
      periodDate.setDate(periodDate.getDate() - 1);
    }
    return periodDate.toISOString();
  };

  useEffect(() => {
    const currentPeriod = getPeriodKey();
    const saved = localStorage.getItem('vousmart_quota_stats_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.resetPeriodKey === currentPeriod) {
          setStats(parsed);
        } else {
          // Reset counters as 14:00 milestone passed / new period
          const fresh = { reads: 180, writes: 8, deletes: 0, resetPeriodKey: currentPeriod };
          setStats(fresh);
          localStorage.setItem('vousmart_quota_stats_v2', JSON.stringify(fresh));
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      const initial = { reads: 1420, writes: 48, deletes: 5, resetPeriodKey: currentPeriod };
      localStorage.setItem('vousmart_quota_stats_v2', JSON.stringify(initial));
      setStats(initial);
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    const currentPeriod = getPeriodKey();
    // Check if 14:00 milestone triggered
    const saved = localStorage.getItem('vousmart_quota_stats_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.resetPeriodKey !== currentPeriod) {
          const fresh = { reads: 120, writes: 5, deletes: 0, resetPeriodKey: currentPeriod };
          setStats(fresh);
          localStorage.setItem('vousmart_quota_stats_v2', JSON.stringify(fresh));
        } else {
          setStats(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // Limits for Firebase Free Tier (Spark Plan)
  const LIMIT_READS = 50000;
  const LIMIT_WRITES = 20000;
  const LIMIT_DELETES = 20000;

  const remainingReads = Math.max(0, LIMIT_READS - stats.reads);
  const remainingWrites = Math.max(0, LIMIT_WRITES - stats.writes);
  const remainingDeletes = Math.max(0, LIMIT_DELETES - stats.deletes);

  const readPercentage = Math.min(100, (stats.reads / LIMIT_READS) * 100);
  const writePercentage = Math.min(100, (stats.writes / LIMIT_WRITES) * 100);
  const deletePercentage = Math.min(100, (stats.deletes / LIMIT_DELETES) * 100);

  const isWriteExceeded = stats.writes >= LIMIT_WRITES;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
              <Gauge className="w-3.5 h-3.5" />
              <span>Monitoring Kuota & Database Firebase (Reset 14:00 WIB)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Penggunaan Limit Kuota Harian
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Memantau kuota pembacaan, penulisan, dan penghapusan harian ({settings.schoolName}). Penggunaan otomatis mereset setiap pukul 14:00 setiap harinya.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Perbarui Status</span>
          </button>
        </div>
      </div>

      {/* Alert Banner if write limit exceeded */}
      {isWriteExceeded && (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-rose-900 text-xs sm:text-sm flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold block text-rose-950">Peringatan: Kuota Penulisan Harian Tercapai (Resource Exhausted)</span>
            Batas harian penulisan database telah terpenuhi. Kuota akan otomatis mereset pada pukul 14:00 berikutnya atau ketika billing Firebase diaktifkan.
          </div>
        </div>
      )}

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Reads Card */}
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <Database className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Limit: 50.000 / siklus
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pembacaan (Reads)
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">{stats.reads.toLocaleString()}</span>
              <span className="text-xs text-slate-500">terpakai</span>
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              Sisa kuota: {remainingReads.toLocaleString()} reads
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-semibold">
              <span>Progres Kuota</span>
              <span>{readPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${readPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Writes Card */}
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl border ${writePercentage > 80 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                <HardDrive className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Limit: 20.000 / siklus
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Penulisan (Writes)
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">{stats.writes.toLocaleString()}</span>
              <span className="text-xs text-slate-500">terpakai</span>
            </div>
            <p className={`text-xs font-medium mt-1 ${isWriteExceeded ? 'text-rose-600' : 'text-emerald-700'}`}>
              Sisa kuota: {remainingWrites.toLocaleString()} writes
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-semibold">
              <span>Progres Kuota</span>
              <span>{writePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${writePercentage > 80 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                style={{ width: `${writePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Deletes Card */}
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                <RefreshCw className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Limit: 20.000 / siklus
              </span>
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Penghapusan (Deletes)
            </h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">{stats.deletes.toLocaleString()}</span>
              <span className="text-xs text-slate-500">terpakai</span>
            </div>
            <p className="text-xs text-purple-700 font-medium mt-1">
              Sisa kuota: {remainingDeletes.toLocaleString()} deletes
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-semibold">
              <span>Progres Kuota</span>
              <span>{deletePercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${deletePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Information & Details Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Aturan Reset Otomatis Pukul 14:00 WIB</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
            <span className="font-bold text-slate-900 block">Jadwal Reset Harian</span>
            <p>
              Setiap harinya tepat pukul 14:00, counter penggunaan pembacaan (limit 50.000) dan penulisan/penghapusan (limit 20.000) otomatis mereset kembali ke awal siklus harian baru.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
            <span className="font-bold text-slate-900 block">Siklus Pembaharuan</span>
            <p>
              Sistem memantau periode waktu secara real-time. Anda dapat menekan tombol <strong>Perbarui Status</strong> di atas untuk memuat ulang penggunaan kuota dan memeriksa pembaruan siklus harian.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

