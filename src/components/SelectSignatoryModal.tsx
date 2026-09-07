import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../types';
import { parseStaffNames } from '../utils/format';
import { UserCheck, Printer, X, ShieldCheck, Building2, User } from 'lucide-react';

interface SelectSignatoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedItStaff: string) => void;
  settings: SystemSettings;
}

export const SelectSignatoryModal: React.FC<SelectSignatoryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  settings,
}) => {
  const itStaffList = parseStaffNames(settings.itStaffNames);

  const [selectedStaffOption, setSelectedStaffOption] = useState<string>(
    itStaffList[0] || `Tim IT ${settings.schoolName}`
  );
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customNameInput, setCustomNameInput] = useState<string>('');

  useEffect(() => {
    const list = parseStaffNames(settings.itStaffNames);
    if (list.length > 0) {
      setSelectedStaffOption(list[0]);
      setIsCustomMode(false);
    } else {
      setSelectedStaffOption(`Tim IT ${settings.schoolName}`);
    }
  }, [settings.itStaffNames, settings.schoolName, isOpen]);

  if (!isOpen) return null;

  const handleSelectOption = (name: string) => {
    setSelectedStaffOption(name);
    setIsCustomMode(false);
  };

  const handleSelectCustom = () => {
    setIsCustomMode(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = isCustomMode
      ? customNameInput.trim() || `Tim IT ${settings.schoolName}`
      : selectedStaffOption;
    onConfirm(finalName);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pilih Penandatangan Tim IT
              </h3>
              <p className="text-xs text-slate-500">
                Laporan Resmi Rekapitulasi Keuangan & Bagi Hasil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Siapa yang akan bertanda tangan mewakili Tim IT?
            </label>

            <div className="space-y-2.5">
              {itStaffList.length > 0 ? (
                itStaffList.map((name, idx) => {
                  const isChecked = !isCustomMode && selectedStaffOption === name;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(name)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isChecked
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{name}</span>
                          <span className="text-[11px] text-slate-500">Perwakilan / Koordinator Tim IT</span>
                        </div>
                      </div>
                      {isChecked && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Terpilih
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div
                  onClick={() => handleSelectOption(`Tim IT ${settings.schoolName}`)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    !isCustomMode
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-600" />
                    <span className="text-sm font-bold text-slate-900">
                      Tim IT {settings.schoolName}
                    </span>
                  </div>
                </div>
              )}

              {/* Option to type custom name */}
              <div
                onClick={handleSelectCustom}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isCustomMode
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isCustomMode
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isCustomMode && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Nama Lain / Tulis Manual...
                  </span>
                </div>

                {isCustomMode && (
                  <input
                    type="text"
                    value={customNameInput}
                    onChange={(e) => setCustomNameInput(e.target.value)}
                    placeholder="Contoh: Drs. H. Ahmad Dahlan, M.T."
                    className="w-full mt-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                  />
                )}
              </div>
            </div>
          </div>

          {/* Additional Signatory Context Preview */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Ringkasan Penandatangan Lain di Laporan:
            </span>
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Pengurus {settings.koperasiName}:
              </span>
              <span className="font-bold text-slate-900 text-[11px]">
                {settings.koperasiManagerName || `Pengurus ${settings.koperasiName}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Kepala Sekolah:
              </span>
              <span className="font-bold text-slate-900 text-[11px]">
                {settings.kepalaSekolahName || `Kepala ${settings.schoolName}`}
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Lanjutkan ke Cetak Laporan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
