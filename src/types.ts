export type UserRole = 'admin' | 'guru';

export interface User {
  id: string;
  username: string; // 'Admin' or NIP
  name: string;
  nip?: string;
  role: UserRole;
  kelasWali?: string;
  email?: string;
  phone?: string;
}

export interface GuruWali {
  id: string;
  nip: string;
  nama: string;
  kelasWali: string; // e.g. "VIII E", "IX A", or "Guru MP"
  noHp: string;
  email: string;
  status: 'Aktif' | 'Non-Aktif';
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
