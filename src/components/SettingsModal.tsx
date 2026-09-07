import React, { useState } from 'react';
import { SystemSettings } from '../types';
import { Settings, X, Save, Trash2, Edit2, Plus } from 'lucide-react';
import { formatRupiah, parseStaffNames } from '../utils/format';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings;
  onSaveSettings: (newSettings: SystemSettings) => void;
  onOpenReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenReset,
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [isResetting, setIsResetting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [itStaffArray, setItStaffArray] = useState<string[]>([]);
  const [newItName, setNewItName] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setFormData({ ...settings });
      setIsEditing(false);
      const names = parseStaffNames(settings.itStaffNames);
      setItStaffArray(names);
      setNewItName('');
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleAddStaffName = () => {
    const trimmed = newItName.trim();
    if (!trimmed) return;
    if (itStaffArray.includes(trimmed)) {
      alert('Nama anggota IT tersebut sudah terdaftar.');
      return;
    }
    const updated = [...itStaffArray, trimmed];
    setItStaffArray(updated);
    setFormData((prev) => ({ ...prev, itStaffNames: updated.join('; ') }));
    setNewItName('');
  };

  const handleRemoveStaffName = (index: number) => {
    const updated = itStaffArray.filter((_, i) => i !== index);
    setItStaffArray(updated);
    setFormData((prev) => ({ ...prev, itStaffNames: updated.join('; ') }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    alert('Pengaturan berhasil disimpan ke database Firebase!');
    setIsEditing(false);
  };

  const handleResetData = () => {
    onOpenReset();
  };

  const totalCalculated =
    formData.costPricePerUnit +
    formData.koperasiProfitPerUnit +
    formData.itProfitPerUnit +
    formData.kepsekProfitPerUnit;
  const isMatch = totalCalculated === formData.sellPricePerUnit;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pengaturan Sistem & Skema Bagi Hasil
              </h3>
              <p className="text-xs text-slate-500">
                Konfigurasi nama sekolah, koperasi, mitra vendor, dan harga
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Read-only Alert Bar */}
          {!isEditing && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-center justify-between">
              <span>Mode Lihat Pengaturan (Terkunci)</span>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                Edit Sekarang
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Sekolah / Instansi
              </label>
              <input
                type="text"
                required
                disabled={!isEditing}
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama SSID WiFi
              </label>
              <input
                type="text"
                required
                disabled={!isEditing}
                value={formData.wifiSsid}
                onChange={(e) => setFormData({ ...formData, wifiSsid: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-emerald-700 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Mitra Penyedia (Vendor)
              </label>
              <input
                type="text"
                required
                disabled={!isEditing}
                value={formData.providerName}
                onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Koperasi Sekolah
              </label>
              <input
                type="text"
                required
                disabled={!isEditing}
                value={formData.koperasiName}
                onChange={(e) => setFormData({ ...formData, koperasiName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Section: Penanggung Jawab & Pejabat Sekolah */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Nama Penanggung Jawab & Pengurus
              </h4>
              <p className="text-[11px] text-slate-500">
                Nama-nama ini digunakan pada berkas serah terima, tanda tangan laporan LPJ, dan bukti setoran
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Kepala Sekolah (Penanggung Jawab)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isEditing}
                    placeholder="contoh: Drs. H. Suhendra, M.Pd."
                    value={formData.kepalaSekolahName || ''}
                    onChange={(e) => setFormData({ ...formData, kepalaSekolahName: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    placeholder="contoh: 196803151992031004"
                    value={formData.kepalaSekolahNip || ''}
                    onChange={(e) => setFormData({ ...formData, kepalaSekolahNip: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Dynamic Multiple Name Input for IT Staff */}
              <div className="border-t border-slate-200 pt-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Daftar Anggota Tim Pengelola IT ({itStaffArray.length})
                </label>
                
                {/* Visual List of Members */}
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-100 rounded-xl border border-slate-200 mb-2 min-h-[44px] items-center">
                  {itStaffArray.length === 0 ? (
                    <span className="text-[10px] text-slate-400 italic px-1">
                      Belum ada nama yang didaftarkan. Harap tambah nama di bawah.
                    </span>
                  ) : (
                    itStaffArray.map((name, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] px-2.5 py-1 rounded-lg font-bold shadow-xs"
                      >
                        <span>{name}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveStaffName(index)}
                            className="text-emerald-500 hover:text-rose-600 transition-colors p-0.5 rounded cursor-pointer"
                            title="Hapus Nama"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add Input - only when editing */}
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Input nama anggota IT baru"
                      value={newItName}
                      onChange={(e) => setNewItName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddStaffName();
                        }
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddStaffName}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">
                    * Klik "Edit" untuk menambah atau menghapus anggota Tim IT.
                  </p>
                )}
              </div>

              {/* Textbox for NIP Guru IT */}
              <div className="border-t border-slate-200 pt-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  NIP Guru / Tim IT (Dipisahkan koma/titik koma sesuai urutan)
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  placeholder="contoh: 198501012010011005, 198804122015021003"
                  value={formData.itStaffNips || ''}
                  onChange={(e) => setFormData({ ...formData, itStaffNips: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  NIP digunakan sebagai password login autentikasi masing-masing guru IT.
                </p>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Pengurus / Kasir Koperasi Sekolah (bisa dipisah koma untuk banyak nama)
                </label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  placeholder="contoh: Hj. Siti Rohmah, S.Pd., Pak Hendra"
                  value={formData.koperasiManagerName || ''}
                  onChange={(e) => setFormData({ ...formData, koperasiManagerName: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Harga Jual ke Siswa (Rp)
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                required
                disabled={!isEditing}
                value={formData.sellPricePerUnit}
                onChange={(e) => setFormData({ ...formData, sellPricePerUnit: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Skema Alokasi Pembagian per Voucher:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 font-bold mb-1">1. Modal Provider</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  disabled={!isEditing}
                  value={formData.costPricePerUnit}
                  onChange={(e) => setFormData({ ...formData, costPricePerUnit: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 font-bold disabled:opacity-75 disabled:bg-slate-100"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Modal SIDNet (Rp 1.500)</span>
              </div>

              <div>
                <label className="block text-[10px] text-emerald-800 font-bold mb-1">2. Hak Koperasi</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  disabled={!isEditing}
                  value={formData.koperasiProfitPerUnit}
                  onChange={(e) => setFormData({ ...formData, koperasiProfitPerUnit: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-emerald-800 font-bold disabled:opacity-75 disabled:bg-slate-100"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Laba kas koperasi (Rp 750)</span>
              </div>

              <div>
                <label className="block text-[10px] text-emerald-800 font-bold mb-1">3. Hak Tim IT</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  disabled={!isEditing}
                  value={formData.itProfitPerUnit}
                  onChange={(e) => {
                    const totalVal = Number(e.target.value);
                    setFormData({
                      ...formData,
                      itProfitPerUnit: totalVal,
                      kepsekProfitPerUnit: 0,
                    });
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-emerald-800 font-bold disabled:opacity-75 disabled:bg-slate-100"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Laba Pengelola IT (Rp 750)</span>
              </div>
            </div>

            <div
              className={`p-2.5 rounded-lg text-xs flex items-center justify-between ${
                isMatch
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <span className="font-medium">
                Total Alokasi: <strong>{formatRupiah(totalCalculated)}</strong>
              </span>
              <span className="font-bold">
                {isMatch ? '✓ Sesuai Harga Jual' : `⚠ Selisih ${formatRupiah(formData.sellPricePerUnit - totalCalculated)}`}
              </span>
            </div>
          </div>

          {/* Reset Data Section */}
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-rose-900 block">Kosongkan Data Transaksi</span>
              <span className="text-[11px] text-rose-700">Hapus semua data mock/transaksi menjadi 0</span>
            </div>
            <button
              type="button"
              onClick={handleResetData}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset ke 0</span>
            </button>
          </div>

          {/* Footer controls inside form */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Pengaturan
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...settings });
                    const names = parseStaffNames(settings.itStaffNames);
                    setItStaffArray(names);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Batal Edit
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
