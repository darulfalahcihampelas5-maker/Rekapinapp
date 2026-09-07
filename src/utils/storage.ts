import {
  SystemSettings,
  VoucherBatch,
  VoucherItem,
  VoucherHandover,
  SaleTransaction,
  SettlementRecord,
  ExpenseRecord
} from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'vousmart_settings_v1',
  BATCHES: 'vousmart_batches_v1',
  VOUCHERS: 'vousmart_vouchers_v1',
  HANDOVERS: 'vousmart_handovers_v1',
  SALES: 'vousmart_sales_v1',
  SETTLEMENTS: 'vousmart_settlements_v1',
  EXPENSES: 'vousmart_expenses_v1',
};

export const defaultSettings: SystemSettings = {
  schoolName: 'SMA / SMK Negeri',
  wifiSsid: 'WIFI-SEKOLAH-DIGITAL',
  providerName: 'PT ForIT Asta Solusindo - SIDNet',
  koperasiName: 'Koperasi Sekolah',
  kepalaSekolahName: 'Drs. H. Suhendra, M.Pd.',
  kepalaSekolahNip: '196803151992031004',
  itStaffNames: 'Asep Maulana, S.Kom., Budi Santoso, S.T.',
  itStaffNips: '198501012010011005, 198804122015021003',
  koperasiManagerName: 'Hj. Siti Rohmah, S.Pd.',
  costPricePerUnit: 1500,
  sellPricePerUnit: 3000,
  koperasiProfitPerUnit: 750,
  itProfitPerUnit: 375,
  kepsekProfitPerUnit: 375,
  autoGenerateSerials: true,
};

// Generate realistic initial seed dataset
export const getInitialData = () => {
  const today = new Date();
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  const todayStr = today.toISOString().split('T')[0];
  const yestStr = yest.toISOString().split('T')[0];
  const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

  const batches: VoucherBatch[] = [
    {
      id: 'batch-101',
      batchNumber: 'BATCH-2026-08A',
      providerName: 'PT CyberNet Solusindo',
      purchaseDate: twoDaysAgoStr,
      voucherQty: 200,
      unitCost: 1500,
      totalCost: 300000,
      status: 'HABIS',
      notes: 'Top-up Kuota Voucher Awal Pekan',
      serialPrefix: 'VOU-08A',
      serialStart: 1001,
      serialEnd: 1200,
    },
    {
      id: 'batch-102',
      batchNumber: 'BATCH-2026-08B',
      providerName: 'PT CyberNet Solusindo',
      purchaseDate: yestStr,
      voucherQty: 300,
      unitCost: 1500,
      totalCost: 450000,
      status: 'TERSEDIA',
      notes: 'Top-up Tambahan untuk Ujian & Jam Istirahat',
      serialPrefix: 'VOU-08B',
      serialStart: 2001,
      serialEnd: 2300,
    }
  ];

  const handovers: VoucherHandover[] = [
    {
      id: 'ho-01',
      transferDate: twoDaysAgoStr,
      batchId: 'batch-101',
      batchNumber: 'BATCH-2026-08A',
      qty: 200,
      giverName: 'Ahmad Fauzi (Tim IT)',
      receiverName: 'Ibu Siti (Koperasi)',
      notes: 'Penyerahan 200 Voucher fisik batch 08A',
      status: 'DITERIMA',
    },
    {
      id: 'ho-02',
      transferDate: todayStr,
      batchId: 'batch-102',
      batchNumber: 'BATCH-2026-08B',
      qty: 150,
      giverName: 'Ahmad Fauzi (Tim IT)',
      receiverName: 'Pak Hendra (Koperasi)',
      notes: 'Penyerahan 150 Voucher fisik batch 08B gelombang 1',
      status: 'DITERIMA',
    }
  ];

  // Generate vouchers
  const vouchers: VoucherItem[] = [];
  
  // Batch 101 vouchers (200 qty) - all transferred to koperasi, 200 sold
  for (let i = 1; i <= 200; i++) {
    const code = `WF-${1000 + i}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const serial = `VOU-08A-${1000 + i}`;
    vouchers.push({
      id: `v-101-${i}`,
      batchId: 'batch-101',
      batchNumber: 'BATCH-2026-08A',
      code,
      serialNumber: serial,
      duration: '6 Jam',
      status: 'TERJUAL',
      unitCost: 1500,
      sellingPrice: 3000,
      soldAt: twoDaysAgoStr + ' 10:15',
      soldToStudent: `Siswa Kelas ${10 + (i % 3)}`,
      koperasiReceiver: 'Ibu Siti (Koperasi)'
    });
  }

  // Batch 102 vouchers (300 qty)
  // 150 handed over to koperasi (70 sold, 80 still in koperasi), 150 still at IT
  for (let i = 1; i <= 300; i++) {
    const code = `WF-${2000 + i}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const serial = `VOU-08B-${2000 + i}`;
    let status: 'DI_IT' | 'DI_KOPERASI' | 'TERJUAL' = 'DI_IT';
    let soldAt: string | undefined = undefined;
    let soldToStudent: string | undefined = undefined;
    let receiver: string | undefined = undefined;

    if (i <= 150) {
      receiver = 'Pak Hendra (Koperasi)';
      if (i <= 70) {
        status = 'TERJUAL';
        soldAt = todayStr + ' 09:30';
        soldToStudent = i % 2 === 0 ? 'Budi Santoso' : 'Rian Pratama';
      } else {
        status = 'DI_KOPERASI';
      }
    } else {
      status = 'DI_IT';
    }

    vouchers.push({
      id: `v-102-${i}`,
      batchId: 'batch-102',
      batchNumber: 'BATCH-2026-08B',
      code,
      serialNumber: serial,
      duration: '6 Jam',
      status,
      unitCost: 1500,
      sellingPrice: 3000,
      soldAt,
      soldToStudent,
      studentClass: soldToStudent ? 'XII RPL 1' : undefined,
      koperasiReceiver: receiver
    });
  }

  const sales: SaleTransaction[] = [
    {
      id: 'tx-01',
      transactionDate: `${twoDaysAgoStr}T09:30:00`,
      voucherCodes: ['WF-1001-A4B2', 'WF-1002-X9K1'],
      qty: 2,
      unitPrice: 3000,
      totalAmount: 6000,
      paymentMethod: 'TUNAI',
      studentName: 'Muhammad Rizky',
      studentClass: 'X TKJ 1',
      cashierName: 'Ibu Siti (Koperasi)',
      koperasiShare: 1500,
      itShare: 750,
      kepsekShare: 750,
      modalCost: 3000,
    },
    {
      id: 'tx-02',
      transactionDate: `${yestStr}T10:15:00`,
      voucherCodes: ['WF-1050-P8L3', 'WF-1051-M1Z8', 'WF-1052-K4W9'],
      qty: 3,
      unitPrice: 3000,
      totalAmount: 9000,
      paymentMethod: 'QRIS',
      studentName: 'Dewi Lestari',
      studentClass: 'XI AKL 2',
      cashierName: 'Ibu Siti (Koperasi)',
      koperasiShare: 2250,
      itShare: 1125,
      kepsekShare: 1125,
      modalCost: 4500,
    },
    {
      id: 'tx-03',
      transactionDate: `${todayStr}T08:45:00`,
      voucherCodes: ['WF-2001-B7N2'],
      qty: 1,
      unitPrice: 3000,
      totalAmount: 3000,
      paymentMethod: 'TUNAI',
      studentName: 'Dimas Setiawan',
      studentClass: 'XII RPL 2',
      cashierName: 'Pak Hendra (Koperasi)',
      koperasiShare: 750,
      itShare: 375,
      kepsekShare: 375,
      modalCost: 1500,
    },
    {
      id: 'tx-04',
      transactionDate: `${todayStr}T10:05:00`,
      voucherCodes: ['WF-2002-C8Y1', 'WF-2003-V5T9'],
      qty: 2,
      unitPrice: 3000,
      totalAmount: 6000,
      paymentMethod: 'QRIS',
      studentName: 'Farhan Maulana',
      studentClass: 'XI OTKP 1',
      cashierName: 'Pak Hendra (Koperasi)',
      koperasiShare: 1500,
      itShare: 750,
      kepsekShare: 750,
      modalCost: 3000,
    },
    {
      id: 'tx-05',
      transactionDate: `${todayStr}T11:20:00`,
      voucherCodes: ['WF-2004-R2Q8', 'WF-2005-W9X1', 'WF-2006-T7Z4', 'WF-2007-L3M6'],
      qty: 4,
      unitPrice: 3000,
      totalAmount: 12000,
      paymentMethod: 'TUNAI',
      studentName: 'Aisyah Putri',
      studentClass: 'X DKV 2',
      cashierName: 'Pak Hendra (Koperasi)',
      koperasiShare: 3000,
      itShare: 1500,
      kepsekShare: 1500,
      modalCost: 6000,
    }
  ];

  const settlements: SettlementRecord[] = [
    {
      id: 'stl-01',
      date: yestStr,
      vouchersCount: 200,
      amountCollected: 450000, // 200 voucher x Rp 2.250 (Modal Rp 1.500 + IT/Kepsek Rp 750) disetorkan ke IT, Koperasi sudah simpan Rp 150.000 labanya
      settledBy: 'Ibu Siti (Koperasi)',
      receivedBy: 'Ahmad Fauzi (Tim IT)',
      notes: 'Setoran Batch 08A tuntas 200 voucher',
      status: 'LUNAS',
    }
  ];

  const expenses: ExpenseRecord[] = [
    {
      id: 'exp-01',
      date: twoDaysAgoStr,
      title: 'Kertas Thermal & Plastik Klip Voucher',
      category: 'CETAK_KUPON',
      amount: 35000,
      recordedBy: 'Tim IT',
      notes: 'Untuk mencetak dan membungkus voucher fisik',
    }
  ];

  return {
    settings: defaultSettings,
    batches,
    vouchers,
    handovers,
    sales,
    settlements,
    expenses,
  };
};

export const loadStoredData = () => {
  try {
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const rawBatches = localStorage.getItem(STORAGE_KEYS.BATCHES);
    const rawVouchers = localStorage.getItem(STORAGE_KEYS.VOUCHERS);
    const rawHandovers = localStorage.getItem(STORAGE_KEYS.HANDOVERS);
    const rawSales = localStorage.getItem(STORAGE_KEYS.SALES);
    const rawSettlements = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    const rawExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);

    if (!rawBatches || !rawVouchers) {
      const initial = getInitialData();
      saveAllData(initial);
      return initial;
    }

    return {
      settings: rawSettings ? JSON.parse(rawSettings) : defaultSettings,
      batches: rawBatches ? JSON.parse(rawBatches) : [],
      vouchers: rawVouchers ? JSON.parse(rawVouchers) : [],
      handovers: rawHandovers ? JSON.parse(rawHandovers) : [],
      sales: rawSales ? JSON.parse(rawSales) : [],
      settlements: rawSettlements ? JSON.parse(rawSettlements) : [],
      expenses: rawExpenses ? JSON.parse(rawExpenses) : [],
    };
  } catch (err) {
    console.error('Error loading data from localStorage:', err);
    return getInitialData();
  }
};

export const saveAllData = (data: {
  settings?: SystemSettings;
  batches?: VoucherBatch[];
  vouchers?: VoucherItem[];
  handovers?: VoucherHandover[];
  sales?: SaleTransaction[];
  settlements?: SettlementRecord[];
  expenses?: ExpenseRecord[];
}) => {
  try {
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    if (data.batches) localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(data.batches));
    if (data.vouchers) localStorage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(data.vouchers));
    if (data.handovers) localStorage.setItem(STORAGE_KEYS.HANDOVERS, JSON.stringify(data.handovers));
    if (data.sales) localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(data.sales));
    if (data.settlements) localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(data.settlements));
    if (data.expenses) localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(data.expenses));
  } catch (err) {
    console.error('Error saving data to localStorage:', err);
  }
};
