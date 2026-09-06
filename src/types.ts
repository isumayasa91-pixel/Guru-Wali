export type UserRole = 'admin' | 'guru';

export interface User {
  id: string;
  username: string; // 'Admin' or NIP
  name: string;
  nip?: string;
  role: UserRole;
  kelasWali?: string; // Kelas bimbingan 1 (e.g. "VIII E")
  kelasWali2?: string; // Kelas bimbingan 2 (optional, e.g. "IX A")
  email?: string;
  phone?: string;
}

export interface GuruWali {
  id: string;
  nip: string;
  nama: string;
  kelasWali: string; // Kelas bimbingan 1 (e.g. "VIII E")
  kelasWali2?: string; // Kelas bimbingan 2 (optional, e.g. "IX A")
  noHp: string;
  email: string;
  status: 'Aktif' | 'Non-Aktif';
}

/**
 * Normalizes teacher name by lowercasing, removing extra whitespace, punctuation, and academic titles.
 */
export function normalizeTeacherName(name?: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/(s\.pd\.?|m\.pd\.?|m\.si\.?|s\.ag\.?|s\.kom\.?|s\.sos\.?|s\.e\.?|s\.si\.?|s\.h\.?|dra\.?|drs\.?|gr\.?|h\.?|hj\.?)/gi, '')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if two teacher/user objects refer to the exact same teacher (by NIP or Name).
 */
export function isSameGuru(
  g1?: { nip?: string; name?: string; nama?: string } | null,
  g2?: { nip?: string; name?: string; nama?: string } | null
): boolean {
  if (!g1 || !g2) return false;

  const nip1 = (g1.nip || '').trim();
  const nip2 = (g2.nip || '').trim();
  if (nip1 && nip2 && nip1.toLowerCase() === nip2.toLowerCase()) {
    return true;
  }

  const name1 = ((g1 as any).nama || g1.name || '').trim().toLowerCase();
  const name2 = ((g2 as any).nama || g2.name || '').trim().toLowerCase();
  if (name1 && name2) {
    if (name1 === name2) return true;
    const norm1 = normalizeTeacherName(name1);
    const norm2 = normalizeTeacherName(name2);
    if (norm1 && norm2 && norm1 === norm2) return true;
  }

  return false;
}

/**
 * Returns an array of unique class names assigned to a Guru or User (supports multi-class from direct fields and guruList records).
 */
export function getGuruClassList(
  guruOrUser?: { nip?: string; name?: string; nama?: string; kelasWali?: string; kelasWali2?: string } | null,
  allGuruList?: GuruWali[]
): string[] {
  if (!guruOrUser) return [];
  const list: string[] = [];

  const addClass = (c?: string) => {
    if (!c) return;
    c.split(',').forEach((part) => {
      const clean = part.trim();
      if (clean && !list.includes(clean)) {
        list.push(clean);
      }
    });
  };

  // 1. Direct fields on the target object
  addClass(guruOrUser.kelasWali);
  addClass(guruOrUser.kelasWali2);

  // 2. If guruList is supplied, scan all records belonging to the same teacher (by NIP or Name)
  if (allGuruList && Array.isArray(allGuruList)) {
    allGuruList.forEach((g) => {
      if (isSameGuru(guruOrUser, g)) {
        addClass(g.kelasWali);
        addClass(g.kelasWali2);
      }
    });
  }

  return list;
}

/**
 * Returns formatted text of assigned classes (e.g., "Kelas VIII E & IX A" or "Kelas VIII E").
 */
export function getGuruClassDisplay(
  guruOrUser?: { nip?: string; name?: string; nama?: string; kelasWali?: string; kelasWali2?: string } | null,
  allGuruList?: GuruWali[]
): string {
  const classes = getGuruClassList(guruOrUser, allGuruList);
  if (classes.length === 0) return '';
  if (classes.length === 1) return `Kelas ${classes[0]}`;
  return `Kelas ${classes.join(' & ')}`;
}

export type JenisKelamin = 'Laki-laki' | 'Perempuan';

export interface MuridBimbingan {
  id: string;
  nisn: string;
  nama: string;
  kelas: string; // VII A s/d IX E
  jenisKelamin: JenisKelamin;
  kontakOrangTua: string; // No HP
  nipGuruWali?: string;
  namaGuruWali?: string;
}

export type JenisBimbingan =
  | 'Pendampingan Akademik'
  | 'Pengembangan Kompetensi'
  | 'Pengembangan Keterampilan'
  | 'Pembentukan Karakter';

export interface JurnalBimbingan {
  id: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string; // HH:mm
  studentId: string;
  namaMurid: string;
  nisn: string;
  kelas: string;
  jenisBimbingan: JenisBimbingan;
  topik: string;
  tindakLanjut: string;
  nipGuruWali: string;
  namaGuruWali: string;
  createdAt?: string;
}

export interface RekapKehadiran {
  id: string;
  bulan: string; // Januari - Desember
  tahun: number; // e.g. 2026
  kelas: string;
  studentId: string;
  namaMurid: string;
  nisn: string;
  sakit: number;
  izin: number;
  tanpaKeterangan: number;
  updatedAt?: string;
  updatedByNip?: string;
}

export interface PillarProgram {
  pilar: JenisBimbingan;
  bentukKegiatan: string[];
}

export interface SchoolSettings {
  namaSekolah: string;
  alamatSekolah: string;
  npsn: string;
  headerCetak: string; // Header / Kop Surat saat cetak
  namaKepsek: string;
  nipKepsek: string;
  logoKabupaten: string; // Base64 image
  logoSekolah: string;   // Base64 image
}
