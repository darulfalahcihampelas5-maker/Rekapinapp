import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, Store, UserCheck, Radio, ArrowRightLeft } from 'lucide-react';

interface RoleBannerProps {
  currentRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({ currentRole, onSwitchRole }) => {
  const roleConfig = {
    IT_ADMIN: {
      title: 'Tim IT',
      badge: 'Admin Sistem',
      icon: ShieldCheck,
    },
    KOPERASI: {
      title: 'Koperasi Sekolah',
      badge: 'Kasir & Setoran',
      icon: Store,
    },
    KEPALA_SEKOLAH: {
      title: 'Kepala Sekolah',
      badge: 'Audit & Pengawas',
      icon: UserCheck,
    },
    PENYEDIA: {
      title: 'PT SIDNet',
      badge: 'Mitra Penyedia',
      icon: Radio,
    }
  };

  const current = roleConfig[currentRole];
  const Icon = current.icon;

  return (
    <div id="role-banner" className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {current.title}
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {current.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 px-2 font-medium flex items-center gap-1">
            <ArrowRightLeft className="w-3 h-3 text-emerald-600" /> Pilih Peran:
          </span>
          {(['IT_ADMIN', 'KOPERASI', 'KEPALA_SEKOLAH', 'PENYEDIA'] as UserRole[]).map((r) => (
            <button
              key={r}
              id={`switch-to-${r}`}
              onClick={() => onSwitchRole(r)}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                currentRole === r
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {r === 'IT_ADMIN' && 'Tim IT'}
              {r === 'KOPERASI' && 'Koperasi'}
              {r === 'KEPALA_SEKOLAH' && 'Kepsek'}
              {r === 'PENYEDIA' && 'PT SIDNet'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

