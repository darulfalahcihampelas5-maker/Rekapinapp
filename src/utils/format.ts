export const formatRupiah = (amount: number | null | undefined): string => {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

export const formatDateIndo = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const formatDateTimeIndo = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
};

export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'IT_ADMIN':
      return 'Tim IT (Pengelola Sistem)';
    case 'KOPERASI':
      return 'Koperasi (Penjual Siswa)';
    case 'KEPALA_SEKOLAH':
      return 'Kepala Sekolah (Pengawas)';
    case 'PENYEDIA':
      return 'Penyedia Voucher (Vendor)';
    default:
      return role;
  }
};

/**
 * Parsers staff names from a concatenated string safely.
 * Detects if the string is separated by semicolon or comma.
 * Recombines segments that are academic titles/suffixes containing commas (e.g., S.Kom., S.Pd.).
 */
export const parseStaffNames = (namesStr: string | null | undefined): string[] => {
  if (!namesStr) return [];
  
  // If there's a semicolon, split strictly by semicolon
  if (namesStr.includes(';')) {
    return namesStr.split(';').map(n => n.trim()).filter(Boolean);
  }

  // Fallback for comma-separated lists containing academic titles
  const rawParts = namesStr.split(',').map(n => n.trim()).filter(Boolean);
  const result: string[] = [];
  const titleKeywords = [
    's.kom', 's.t', 's.pd', 'm.pd', 'm.t', 's.si', 'b.sc', 'ph.d', 'm.kom', 
    'h.', 'hj', 'dra', 'drs', 'prof', 'dr', 'm.si', 'm.psi', 's.psi'
  ];
  
  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i];
    const lowerPart = part.toLowerCase().replace(/\./g, '');
    
    // If this part is an academic title/honorific and we have a previous item, append to the previous item
    if (result.length > 0 && (
      titleKeywords.some(tk => lowerPart === tk || lowerPart.includes(tk)) ||
      part.length <= 5 // short suffixes like S.T, M.Pd
    )) {
      result[result.length - 1] = `${result[result.length - 1]}, ${part}`;
    } else {
      result.push(part);
    }
  }
  return result;
};

