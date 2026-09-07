import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './config';
import {
  SystemSettings,
  VoucherBatch,
  VoucherItem,
  VoucherHandover,
  SaleTransaction,
  SettlementRecord,
  ExpenseRecord
} from '../types';

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
  itProfitPerUnit: 750,
  kepsekProfitPerUnit: 0,
  autoGenerateSerials: true,
};

// Firestore Collections
const COLLECTIONS = {
  SETTINGS: 'settings',
  BATCHES: 'batches',
  VOUCHERS: 'vouchers',
  HANDOVERS: 'handovers',
  SALES: 'sales',
  SETTLEMENTS: 'settlements',
  EXPENSES: 'expenses',
};

// Real-time Subscriptions
export const subscribeToSettings = (onUpdate: (settings: SystemSettings) => void) => {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'global_settings');
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      onUpdate({ ...defaultSettings, ...(snapshot.data() as SystemSettings) });
    } else {
      // Initialize if not present
      setDoc(docRef, defaultSettings).catch(console.error);
      onUpdate(defaultSettings);
    }
  }, (err) => {
    console.error('Firestore settings listener error:', err);
  });
};

export const subscribeToBatches = (onUpdate: (batches: VoucherBatch[]) => void) => {
  const q = query(collection(db, COLLECTIONS.BATCHES));
  return onSnapshot(q, (snapshot) => {
    const data: VoucherBatch[] = [];
    snapshot.forEach((d) => {
      data.push({ id: d.id, ...(d.data() as Omit<VoucherBatch, 'id'>) });
    });
    // Sort by purchaseDate descending or batchNumber
    data.sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate));
    onUpdate(data);
  }, (err) => {
    console.error('Firestore batches listener error:', err);
  });
};

export const subscribeToVouchers = (onUpdate: (vouchers: VoucherItem[]) => void) => {
  const q = query(collection(db, COLLECTIONS.VOUCHERS));
  return onSnapshot(q, (snapshot) => {
    const data: VoucherItem[] = [];
    snapshot.forEach((d) => {
      data.push({ id: d.id, ...(d.data() as Omit<VoucherItem, 'id'>) });
    });
    onUpdate(data);
  }, (err) => {
    console.error('Firestore vouchers listener error:', err);
  });
};

export const subscribeToHandovers = (onUpdate: (handovers: VoucherHandover[]) => void) => {
  const q = query(collection(db, COLLECTIONS.HANDOVERS));
  return onSnapshot(q, (snapshot) => {
    const data: VoucherHandover[] = [];
    snapshot.forEach((d) => {
      data.push({ id: d.id, ...(d.data() as Omit<VoucherHandover, 'id'>) });
    });
    data.sort((a, b) => b.transferDate.localeCompare(a.transferDate));
    onUpdate(data);
  }, (err) => {
    console.error('Firestore handovers listener error:', err);
  });
};

export const subscribeToSales = (onUpdate: (sales: SaleTransaction[]) => void) => {
  const q = query(collection(db, COLLECTIONS.SALES));
  return onSnapshot(q, (snapshot) => {
    const data: SaleTransaction[] = [];
    snapshot.forEach((d) => {
      data.push({ id: d.id, ...(d.data() as Omit<SaleTransaction, 'id'>) });
    });
    data.sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));
    onUpdate(data);
  }, (err) => {
    console.error('Firestore sales listener error:', err);
  });
};

export const subscribeToSettlements = (onUpdate: (settlements: SettlementRecord[]) => void) => {
  const q = query(collection(db, COLLECTIONS.SETTLEMENTS));
  return onSnapshot(q, (snapshot) => {
    const data: SettlementRecord[] = [];
    snapshot.forEach((d) => {
      data.push({ id: d.id, ...(d.data() as Omit<SettlementRecord, 'id'>) });
    });
    data.sort((a, b) => b.date.localeCompare(a.date));
    onUpdate(data);
  }, (err) => {
    console.error('Firestore settlements listener error:', err);
  });
};

export const subscribeToExpenses = (onUpdate: (expenses: ExpenseRecord[]) => void) => {
  const q = query(collection(db, COLLECTIONS.EXPENSES));
  return onSnapshot(q, (snapshot) => {
    const data: ExpenseRecord[] = [];
    snapshot.forEach((d) => {
      data.push({ id: d.id, ...(d.data() as Omit<ExpenseRecord, 'id'>) });
    });
    data.sort((a, b) => b.date.localeCompare(a.date));
    onUpdate(data);
  }, (err) => {
    console.error('Firestore expenses listener error:', err);
  });
};

// Save Settings
export const saveSettingsToFirestore = async (newSettings: SystemSettings) => {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'global_settings');
  await setDoc(docRef, newSettings, { merge: true });
};

// Add Batch and its associated generated vouchers in chunks
export const addBatchToFirestore = async (newBatch: VoucherBatch, newVouchers: VoucherItem[]) => {
  // 1. Save batch document
  const batchDocRef = doc(db, COLLECTIONS.BATCHES, newBatch.id);
  await setDoc(batchDocRef, newBatch);

  // 2. Save voucher documents in chunks of 450 (Firestore limit is 500 ops per writeBatch)
  const chunkSize = 400;
  for (let i = 0; i < newVouchers.length; i += chunkSize) {
    const chunk = newVouchers.slice(i, i + chunkSize);
    const writeBatchInstance = writeBatch(db);
    for (const voucher of chunk) {
      const vRef = doc(db, COLLECTIONS.VOUCHERS, voucher.id);
      writeBatchInstance.set(vRef, voucher);
    }
    await writeBatchInstance.commit();
  }
};

// Handover vouchers to Koperasi
export const recordHandoverToFirestore = async (
  newHandover: VoucherHandover,
  updatedVouchers: VoucherItem[]
) => {
  // 1. Save handover record
  const hRef = doc(db, COLLECTIONS.HANDOVERS, newHandover.id);
  await setDoc(hRef, newHandover);

  // 2. Update status of transferred vouchers
  const chunkSize = 400;
  for (let i = 0; i < updatedVouchers.length; i += chunkSize) {
    const chunk = updatedVouchers.slice(i, i + chunkSize);
    const writeBatchInstance = writeBatch(db);
    for (const voucher of chunk) {
      const vRef = doc(db, COLLECTIONS.VOUCHERS, voucher.id);
      writeBatchInstance.set(vRef, voucher, { merge: true });
    }
    await writeBatchInstance.commit();
  }
};

// Record sale and update corresponding vouchers
export const recordSaleToFirestore = async (
  newSale: SaleTransaction,
  soldVouchers: VoucherItem[]
) => {
  // 1. Save sale transaction
  const sRef = doc(db, COLLECTIONS.SALES, newSale.id);
  await setDoc(sRef, newSale);

  // 2. Update sold vouchers in Firestore
  const writeBatchInstance = writeBatch(db);
  for (const voucher of soldVouchers) {
    const vRef = doc(db, COLLECTIONS.VOUCHERS, voucher.id);
    writeBatchInstance.set(vRef, voucher, { merge: true });
  }
  await writeBatchInstance.commit();
};

// Record Settlement and optionally update vouchers to TERJUAL
export const recordSettlementToFirestore = async (
  newSettlement: SettlementRecord,
  soldVouchers?: VoucherItem[]
) => {
  // 1. Save settlement doc
  const sRef = doc(db, COLLECTIONS.SETTLEMENTS, newSettlement.id);
  await setDoc(sRef, newSettlement);

  // 2. Update sold vouchers in Firestore if provided
  if (soldVouchers && soldVouchers.length > 0) {
    const chunkSize = 400;
    for (let i = 0; i < soldVouchers.length; i += chunkSize) {
      const chunk = soldVouchers.slice(i, i + chunkSize);
      const writeBatchInstance = writeBatch(db);
      for (const voucher of chunk) {
        const vRef = doc(db, COLLECTIONS.VOUCHERS, voucher.id);
        writeBatchInstance.set(vRef, voucher, { merge: true });
      }
      await writeBatchInstance.commit();
    }
  }
};

// Record Settlement (simple)
export const addSettlementToFirestore = async (newSettlement: SettlementRecord) => {
  const sRef = doc(db, COLLECTIONS.SETTLEMENTS, newSettlement.id);
  await setDoc(sRef, newSettlement);
};

// Add Expense
export const addExpenseToFirestore = async (newExpense: ExpenseRecord) => {
  const eRef = doc(db, COLLECTIONS.EXPENSES, newExpense.id);
  await setDoc(eRef, newExpense);
};

// Update Expense
export const updateExpenseInFirestore = async (updatedExpense: ExpenseRecord) => {
  const eRef = doc(db, COLLECTIONS.EXPENSES, updatedExpense.id);
  await setDoc(eRef, updatedExpense, { merge: true });
};

// Delete Expense
export const deleteExpenseFromFirestore = async (id: string) => {
  const eRef = doc(db, COLLECTIONS.EXPENSES, id);
  await deleteDoc(eRef);
};

// Update Batch in Firestore
export const updateBatchInFirestore = async (
  updatedBatch: VoucherBatch,
  updatedVouchers?: VoucherItem[]
) => {
  const batchDocRef = doc(db, COLLECTIONS.BATCHES, updatedBatch.id);
  await setDoc(batchDocRef, updatedBatch, { merge: true });

  if (updatedVouchers && updatedVouchers.length > 0) {
    const chunkSize = 400;
    for (let i = 0; i < updatedVouchers.length; i += chunkSize) {
      const chunk = updatedVouchers.slice(i, i + chunkSize);
      const writeBatchInstance = writeBatch(db);
      for (const v of chunk) {
        writeBatchInstance.set(doc(db, COLLECTIONS.VOUCHERS, v.id), v, { merge: true });
      }
      await writeBatchInstance.commit();
    }
  }
};

// Update Handover and related vouchers
export const updateHandoverInFirestore = async (
  updatedHandover: VoucherHandover,
  updatedVouchers: VoucherItem[]
) => {
  await setDoc(doc(db, COLLECTIONS.HANDOVERS, updatedHandover.id), updatedHandover, { merge: true });

  if (updatedVouchers.length > 0) {
    const chunkSize = 400;
    for (let i = 0; i < updatedVouchers.length; i += chunkSize) {
      const chunk = updatedVouchers.slice(i, i + chunkSize);
      const writeBatchInstance = writeBatch(db);
      for (const v of chunk) {
        writeBatchInstance.set(doc(db, COLLECTIONS.VOUCHERS, v.id), v, { merge: true });
      }
      await writeBatchInstance.commit();
    }
  }
};

// Delete Handover and revert related vouchers
export const deleteHandoverFromFirestore = async (
  handoverId: string,
  revertedVouchers: VoucherItem[]
) => {
  await deleteDoc(doc(db, COLLECTIONS.HANDOVERS, handoverId));

  if (revertedVouchers.length > 0) {
    const chunkSize = 400;
    for (let i = 0; i < revertedVouchers.length; i += chunkSize) {
      const chunk = revertedVouchers.slice(i, i + chunkSize);
      const writeBatchInstance = writeBatch(db);
      for (const v of chunk) {
        writeBatchInstance.set(doc(db, COLLECTIONS.VOUCHERS, v.id), v, { merge: true });
      }
      await writeBatchInstance.commit();
    }
  }
};

// Delete Batch and related vouchers
export const deleteBatchFromFirestore = async (batchId: string, voucherIds: string[] = []) => {
  // 1. Delete batch doc
  await deleteDoc(doc(db, COLLECTIONS.BATCHES, batchId));

  // 2. Delete voucher docs
  if (voucherIds.length > 0) {
    const chunkSize = 400;
    for (let i = 0; i < voucherIds.length; i += chunkSize) {
      const chunk = voucherIds.slice(i, i + chunkSize);
      const writeBatchInstance = writeBatch(db);
      for (const id of chunk) {
        writeBatchInstance.delete(doc(db, COLLECTIONS.VOUCHERS, id));
      }
      await writeBatchInstance.commit();
    }
  }
};

// Reset all transactional data in Firestore to 0
export const clearAllDataInFirestore = async (onProgress?: (progress: number, message: string) => void) => {
  const collectionsToClear = [
    { name: COLLECTIONS.BATCHES, label: 'Batch Voucher' },
    { name: COLLECTIONS.VOUCHERS, label: 'Item Voucher' },
    { name: COLLECTIONS.HANDOVERS, label: 'Serah Terima' },
    { name: COLLECTIONS.SALES, label: 'Data Penjualan' },
    { name: COLLECTIONS.SETTLEMENTS, label: 'Setoran Koperasi' },
    { name: COLLECTIONS.EXPENSES, label: 'Pengeluaran IT' },
  ];

  console.log('Starting total reset of all transactional collections...');
  const total = collectionsToClear.length;

  for (let idx = 0; idx < total; idx++) {
    const col = collectionsToClear[idx];
    const progressPercent = Math.round((idx / total) * 80);
    if (onProgress) {
      onProgress(progressPercent, `Menghapus data ${col.label}...`);
    }

    try {
      const snap = await getDocs(collection(db, col.name));
      const docs = snap.docs;
      
      if (docs.length > 0) {
        console.log(`Deleting ${docs.length} documents from collection: ${col.name}`);
        
        const chunkSize = 450;
        for (let i = 0; i < docs.length; i += chunkSize) {
          const chunk = docs.slice(i, i + chunkSize);
          const b = writeBatch(db);
          for (const d of chunk) {
            b.delete(d.ref);
          }
          await b.commit();
        }
        console.log(`Successfully cleared ${col.name}`);
      }
    } catch (err) {
      console.error(`Error clearing collection ${col.name}:`, err);
      throw err;
    }
  }

  if (onProgress) {
    onProgress(100, 'Semua data berhasil dikosongkan ke 0!');
  }
  console.log('Reset complete.');
};
