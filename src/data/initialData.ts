import { GuruWali, MuridBimbingan, JurnalBimbingan, RekapKehadiran, PillarProgram, SchoolSettings } from '../types';

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  namaSekolah: 'SMP NEGERI 1 UNGGUL',
  alamatSekolah: 'Jl. Pendidikan No. 1, Kota Pendidikan - Indonesia | Telp: (021) 555-1234',
  npsn: '20101234',
  headerCetak: 'PEMERINTAH KABUPATEN PENDIDIKAN\nDINAS PENDIDIKAN DAN KEBUDAYAAN',
  namaKepsek: 'Drs. H. Supriyadi, M.Pd.',
  nipKepsek: '197001011995031001',
  logoKabupaten: '',
  logoSekolah: ''
};

export const ALL_CLASSES = [
  'VII A', 'VII B', 'VII C', 'VII D', 'VII E',
  'VIII A', 'VIII B', 'VIII C', 'VIII D', 'VIII E',
  'IX A', 'IX B', 'IX C', 'IX D', 'IX E'
];

export const MONTHS_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const PROGRAM_PILARS: PillarProgram[] = [
  {
    pilar: 'Pendampingan Akademik',
    bentukKegiatan: [
      'Melaksanakan diskusi rutin, minimal satu kali setiap bulan terkait perkembangan nilai, dan kendala belajar.',
      'Memberikan saran strategi belajar yang efektif sesuai kebutuhan murid.',
      'Berkoordinasi dengan guru mata pelajaran lain jika murid mengalami kesulitan pada bidang tertentu.'
    ]
  },
  {
    pilar: 'Pengembangan Kompetensi',
    bentukKegiatan: [
      'Memberikan informasi serta rekomendasi kegiatan ekstrakurikuler, lomba atau seminar yang sesuai dengan kebutuhan murid.'
    ]
  },
  {
    pilar: 'Pengembangan Keterampilan',
    bentukKegiatan: [
      'Mendorong Murid untuk berpartisipasi aktif dalam organisasi atau kepanitiaan.'
    ]
  },
  {
    pilar: 'Pembentukan Karakter',
    bentukKegiatan: [
      'Melakukan observasi terhadap perilaku dan sikap murid dalam keseharian di sekolah.',
      'Melakukan observasi terhadap kehadiran murid di sekolah.',
      'Mengadakan sesi diskusi atau konseling.',
      'Melakukan penanganan awal jika ditemukan indikasi masalah perilaku serta berkoordinasi dengan guru BK dan wali kelas untuk tindak lanjut.'
    ]
  }
];

export const INITIAL_GURU_WALI: GuruWali[] = [
  {
    id: 'guru-1',
    nip: '198501122010011002',
    nama: 'Budi Santoso, S.Pd.',
    kelasWali: 'VIII E',
    noHp: '081234567890',
    email: 'budi.santoso@sekolah.sch.id',
    status: 'Aktif'
  },
  {
    id: 'guru-2',
    nip: '198803152012012005',
    nama: 'Siti Aminah, M.Pd.',
    kelasWali: 'IX A',
    noHp: '082198765432',
    email: 'siti.aminah@sekolah.sch.id',
    status: 'Aktif'
  },
  {
    id: 'guru-3',
    nip: '199007202015021001',
    nama: 'Ahmad Dahlan, S.T.',
    kelasWali: 'VII A',
    noHp: '085712341234',
    email: 'ahmad.dahlan@sekolah.sch.id',
    status: 'Aktif'
  },
  {
    id: 'guru-4',
    nip: '199211042019032008',
    nama: 'Dewi Lestari, S.Si.',
    kelasWali: 'VIII A',
    noHp: '081399887766',
    email: 'dewi.lestari@sekolah.sch.id',
    status: 'Aktif'
  }
];

export const INITIAL_MURID: MuridBimbingan[] = [
  {
    id: 'murid-1',
    nisn: '0081234567',
    nama: 'Aditya Pratama',
    kelas: 'VIII E',
    jenisKelamin: 'Laki-laki',
    kontakOrangTua: '081211112222',
    nipGuruWali: '198501122010011002',
    namaGuruWali: 'Budi Santoso, S.Pd.'
  },
  {
    id: 'murid-2',
    nisn: '0081234568',
    nama: 'Anisa Rahmawati',
    kelas: 'VIII E',
    jenisKelamin: 'Perempuan',
    kontakOrangTua: '081233334444',
    nipGuruWali: '198501122010011002',
    namaGuruWali: 'Budi Santoso, S.Pd.'
  },
  {
    id: 'murid-3',
    nisn: '0081234569',
    nama: 'Bagus Setyawan',
    kelas: 'VIII E',
    jenisKelamin: 'Laki-laki',
    kontakOrangTua: '081255556666',
    nipGuruWali: '198501122010011002',
    namaGuruWali: 'Budi Santoso, S.Pd.'
  },
  {
    id: 'murid-4',
    nisn: '0079876543',
    nama: 'Citra Kirana',
    kelas: 'IX A',
    jenisKelamin: 'Perempuan',
    kontakOrangTua: '082177778888',
    nipGuruWali: '198803152012012005',
    namaGuruWali: 'Siti Aminah, M.Pd.'
  },
  {
    id: 'murid-5',
    nisn: '0079876544',
    nama: 'Dimas Anggara',
    kelas: 'IX A',
    jenisKelamin: 'Laki-laki',
    kontakOrangTua: '082199990000',
    nipGuruWali: '198803152012012005',
    namaGuruWali: 'Siti Aminah, M.Pd.'
  },
  {
    id: 'murid-6',
    nisn: '0091122334',
    nama: 'Eka Nurjanah',
    kelas: 'VII A',
    jenisKelamin: 'Perempuan',
    kontakOrangTua: '085744445555',
    nipGuruWali: '199007202015021001',
    namaGuruWali: 'Ahmad Dahlan, S.T.'
  }
];

export const INITIAL_JURNAL: JurnalBimbingan[] = [
  {
    id: 'jurnal-1',
    tanggal: '2026-09-02',
    waktu: '09:30',
    studentId: 'murid-1',
    namaMurid: 'Aditya Pratama',
    nisn: '0081234567',
    kelas: 'VIII E',
    jenisBimbingan: 'Pendampingan Akademik',
    topik: 'Peningkatan hasil belajar Matematika yang menurun pada tes tengah semester.',
    tindakLanjut: 'Diskusi jadwal belajar mandiri 1 jam setiap malam dan rekomendasi kelompok belajar bersama Anisa.',
    nipGuruWali: '198501122010011002',
    namaGuruWali: 'Budi Santoso, S.Pd.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'jurnal-2',
    tanggal: '2026-09-03',
    waktu: '11:00',
    studentId: 'murid-4',
    namaMurid: 'Citra Kirana',
    nisn: '0079876543',
    kelas: 'IX A',
    jenisBimbingan: 'Pengembangan Kompetensi',
    topik: 'Minat mengikuti Lomba Olimpiade Sains SMP tingkat kabupaten.',
    tindakLanjut: 'Mendaftarkan Citra pada pembinaan olimpiade sains sekolah dan koordinasi dengan guru IPA.',
    nipGuruWali: '198803152012012005',
    namaGuruWali: 'Siti Aminah, M.Pd.',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_REKAP: RekapKehadiran[] = [
  {
    id: 'rekap-1',
    bulan: 'September',
    tahun: 2026,
    kelas: 'VIII E',
    studentId: 'murid-1',
    namaMurid: 'Aditya Pratama',
    nisn: '0081234567',
    sakit: 1,
    izin: 0,
    tanpaKeterangan: 0
  },
  {
    id: 'rekap-2',
    bulan: 'September',
    tahun: 2026,
    kelas: 'VIII E',
    studentId: 'murid-2',
    namaMurid: 'Anisa Rahmawati',
    nisn: '0081234568',
    sakit: 0,
    izin: 1,
    tanpaKeterangan: 0
  },
  {
    id: 'rekap-3',
    bulan: 'September',
    tahun: 2026,
    kelas: 'IX A',
    studentId: 'murid-4',
    namaMurid: 'Citra Kirana',
    nisn: '0079876543',
    sakit: 0,
    izin: 0,
    tanpaKeterangan: 0
  }
];
