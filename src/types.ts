export type UserRole = 'IT_ADMIN' | 'KOPERASI' | 'KEPALA_SEKOLAH' | 'PENYEDIA';

export interface SystemSettings {
  schoolName: string;
  wifiSsid: string;
  providerName: string;
  koperasiName: string;
  kepalaSekolahName: string;      // Nama Kepala Sekolah
  kepalaSekolahNip?: string;       // NIP Kepala Sekolah
  itStaffNames: string;           // Nama-nama Guru / Tim IT
  itStaffNips?: string;            // NIP Guru / Tim IT
  koperasiManagerName: string;    // Nama Pengurus / Petugas Koperasi
  costPricePerUnit: number;       // Rp 1.500
  sellPricePerUnit: number;       // Rp 3.000
  koperasiProfitPerUnit: number;   // Rp 750
  itProfitPerUnit: number;         // Rp 375 (or custom split)
  kepsekProfitPerUnit: number;     // Rp 375 (or custom split)
  autoGenerateSerials: boolean;
  userPhotos?: Record<string, string>; // Mapping of username to avatar image (data URL / base64)
}

export interface VoucherBatch {
  id: string;
  batchNumber: string;
  providerName: string;
  purchaseDate: string; // YYYY-MM-DD
  voucherQty: number;
  unitCost: number;
  totalCost: number;
  status: 'TERSEDIA' | 'HABIS' | 'PROSES';
  notes?: string;
  serialPrefix: string;
  serialStart: number;
  serialEnd: number;
  purchasedBy?: string; // Tim IT yang melakukan pembelian
}

export interface VoucherItem {
  id: string;
  batchId: string;
  batchNumber: string;
  code: string;
  serialNumber: string;
  duration: string; // e.g. "3 Jam", "24 Jam", "1 Hari"
  status: 'DI_IT' | 'DI_KOPERASI' | 'TERJUAL' | 'KADALUARSA';
  unitCost: number;
  sellingPrice: number;
  soldAt?: string;
  soldToStudent?: string;
  studentClass?: string;
  koperasiReceiver?: string;
}

export interface VoucherHandover {
  id: string;
  transferDate: string;
  batchId: string;
  batchNumber: string;
  qty: number;
  giverName: string;      // Tim IT
  receiverName: string;   // Pihak Koperasi
  notes?: string;
  status: 'DITERIMA';
}

export interface SaleTransaction {
  id: string;
  transactionDate: string; // ISO string
  voucherCodes: string[];
  qty: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: 'TUNAI' | 'QRIS';
  studentName: string;
  studentClass?: string;
  cashierName: string;
  koperasiShare: number;   // e.g. Rp 750 * qty
  itShare: number;         // e.g. Rp 375 * qty
  kepsekShare: number;     // e.g. Rp 375 * qty
  modalCost: number;       // e.g. Rp 1500 * qty
}

export interface SettlementRecord {
  id: string;
  date: string;
  vouchersCount: number;
  amountCollected: number; // Setoran dari Koperasi ke IT (biasanya modal + hak IT/Kepsek = Rp 2.250/voucher atau Rp 3.000)
  settledBy: string;       // Nama Petugas Koperasi
  receivedBy: string;      // Nama Tim IT
  notes?: string;
  status: 'LUNAS';
}

export interface ExpenseRecord {
  id: string;
  date: string;
  title: string;
  category: 'OPERASIONAL_IT' | 'CETAK_KUPON' | 'PERANGKAT_JARINGAN' | 'KONSUMSI' | 'LAINNYA';
  amount: number;
  recordedBy: string;
  notes?: string;
}
