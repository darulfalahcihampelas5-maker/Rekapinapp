import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ResetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string, onProgress: (p: number, msg: string) => void) => Promise<boolean>;
}

export const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setError(null);
    setIsLoading(true);
    setProgress(10);
    setProgressMessage('Memulai proses pengosongan data...');
    
    try {
      const success = await onConfirm(pin.trim(), (p, msg) => {
        setProgress(p);
        setProgressMessage(msg);
      });

      if (success) {
        setProgress(100);
        setProgressMessage('Semua data berhasil dikosongkan ke 0!');
        setIsSuccess(true);
      } else {
        setError('Kode konfirmasi salah atau terjadi kesalahan.');
        setIsLoading(false);
      }
    } catch (err: any) {
      const errStr = err?.message || String(err);
      if (errStr.includes('resource-exhausted') || errStr.includes('Quota')) {
        setError('Batas kuota harian Firestore telah tercapai (Quota Exceeded). Mohon coba lagi besok atau upgrade paket database Firebase Anda.');
      } else {
        setError('Terjadi kesalahan sistem saat mengosongkan data.');
      }
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    setIsSuccess(false);
    setIsLoading(false);
    setProgress(0);
    setPin('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!isLoading ? onClose : undefined}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className={`p-3 rounded-2xl ${isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {isSuccess ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            {!isLoading && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            )}
          </div>

          <h3 className="text-xl font-black text-slate-900 mb-2">
            {isSuccess ? 'Reset Data Berhasil!' : 'Konfirmasi Reset Data'}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {isSuccess
              ? 'Seluruh data transaksi dan catatan operasional telah berhasil dibersihkan dan dikembalikan ke nilai 0.'
              : 'Tindakan ini akan menghapus permanen seluruh data transaksi dari database. Masukkan kode keamanan untuk melanjutkan.'}
          </p>

          {isSuccess ? (
            <div className="space-y-6">
              {/* Success Message Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2"
              >
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Berhasil Direset ke 0</span>
                </div>
                <p className="text-xs text-emerald-700 pl-7">
                  Database Firebase telah bersih dari data sampel/transaksi sebelumnya.
                </p>
              </motion.div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200"
              >
                Selesai
              </button>
            </div>
          ) : isLoading ? (
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>{progressMessage || 'Memproses penghapusan...'}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                  <motion.div
                    className="bg-rose-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-center text-slate-400 italic">
                Mohon jangan menutup jendela ini selama proses berlangsung...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider ml-1">
                  Kode Konfirmasi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <KeyRound className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Masukkan kode konfirmasi..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-mono"
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!pin.trim()}
                  className="flex-[2] py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  Reset Data Sekarang
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
