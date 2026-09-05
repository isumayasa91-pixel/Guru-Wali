import React, { useState, useMemo } from 'react';
import {
  GuruWali,
  MuridBimbingan,
  JurnalBimbingan,
  RekapKehadiran,
  User,
  SchoolSettings
} from '../types';
import { ActiveTab } from './Sidebar';
import { PROGRAM_PILARS } from '../data/initialData';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  CalendarCheck,
  BookOpen,
  Settings,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Filter,
  Sparkles,
  Phone,
  AlertTriangle,
  HeartHandshake,
  Trophy,
  Award
} from 'lucide-react';

interface DashboardViewProps {
  guruList: GuruWali[];
  muridList: MuridBimbingan[];
  jurnalList: JurnalBimbingan[];
  rekapList: RekapKehadiran[];
  schoolSettings: SchoolSettings;
  currentUser: User | null;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  guruList,
  muridList,
  jurnalList,
  rekapList,
  schoolSettings,
  currentUser,
  onNavigateTab
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const isGuru = currentUser?.role === 'guru';
  const userKelas = currentUser?.kelasWali || '';

  // Filter toggle for Guru: show only their class vs all school data
  const [filterMyClassOnly, setFilterMyClassOnly] = useState<boolean>(isGuru && !!userKelas);

  // Filter data according to selection
  const filteredMurid = useMemo(() => {
    if (filterMyClassOnly && userKelas) {
      return muridList.filter((m) => m.kelas === userKelas);
    }
    return muridList;
  }, [muridList, filterMyClassOnly, userKelas]);

  const filteredJurnal = useMemo(() => {
    if (filterMyClassOnly && userKelas) {
      return jurnalList.filter((j) => j.kelas === userKelas);
    }
    return jurnalList;
  }, [jurnalList, filterMyClassOnly, userKelas]);

  const filteredRekap = useMemo(() => {
    if (filterMyClassOnly && userKelas) {
      return rekapList.filter((r) => r.kelas === userKelas);
    }
    return rekapList;
  }, [rekapList, filterMyClassOnly, userKelas]);

  // Statistics calculation
  const totalGuruAktif = guruList.filter((g) => g.status === 'Aktif').length;
  const totalMurid = filteredMurid.length;
  const muridLaki = filteredMurid.filter((m) => m.jenisKelamin === 'Laki-laki').length;
  const muridPerempuan = filteredMurid.filter((m) => m.jenisKelamin === 'Perempuan').length;

  const totalJurnal = filteredJurnal.length;

  // Jurnal breakdown by 4 Pillars
  const pilarCounts = useMemo(() => {
    const counts = {
      'Pendampingan Akademik': 0,
      'Pengembangan Kompetensi': 0,
      'Pengembangan Keterampilan': 0,
      'Pembentukan Karakter': 0
    };
    filteredJurnal.forEach((j) => {
      if (counts[j.jenisBimbingan] !== undefined) {
        counts[j.jenisBimbingan]++;
      }
    });
    return counts;
  }, [filteredJurnal]);

  // Rekap presensi summary (Sakit, Izin, Alpa)
  const totalSakit = filteredRekap.reduce((acc, r) => acc + (Number(r.sakit) || 0), 0);
  const totalIzin = filteredRekap.reduce((acc, r) => acc + (Number(r.izin) || 0), 0);
  const totalAlpa = filteredRekap.reduce((acc, r) => acc + (Number(r.tanpaKeterangan) || 0), 0);
  const totalKetidakhadiran = totalSakit + totalIzin + totalAlpa;

  // Unique Classes list
  const classList = useMemo(() => {
    const classes = Array.from(new Set(muridList.map((m) => m.kelas).filter(Boolean))).sort();
    return classes;
  }, [muridList]);

  // Group murid by class
  const classBreakdown = useMemo(() => {
    return classList.map((kelas) => {
      const muridInClass = muridList.filter((m) => m.kelas === kelas);
      const wali = guruList.find((g) => g.kelasWali === kelas);
      const jurnalInClass = jurnalList.filter((j) => j.kelas === kelas);
      const rekapInClass = rekapList.filter((r) => r.kelas === kelas);
      const sakit = rekapInClass.reduce((a, b) => a + (Number(b.sakit) || 0), 0);
      const izin = rekapInClass.reduce((a, b) => a + (Number(b.izin) || 0), 0);
      const alpa = rekapInClass.reduce((a, b) => a + (Number(b.tanpaKeterangan) || 0), 0);

      return {
        kelas,
        wali: wali ? wali.nama : 'Belum Ditentukan',
        waliNip: wali ? wali.nip : '-',
        waliHp: wali ? wali.noHp : '-',
        totalMurid: muridInClass.length,
        laki: muridInClass.filter((m) => m.jenisKelamin === 'Laki-laki').length,
        perempuan: muridInClass.filter((m) => m.jenisKelamin === 'Perempuan').length,
        totalJurnal: jurnalInClass.length,
        totalAbsen: sakit + izin + alpa
      };
    });
  }, [classList, muridList, guruList, jurnalList, rekapList]);

  // Recent 5 Journal entries
  const recentJurnal = useMemo(() => {
    return [...filteredJurnal]
      .sort((a, b) => {
        const dateA = new Date(`${a.tanggal} ${a.waktu || '00:00'}`).getTime();
        const dateB = new Date(`${b.tanggal} ${b.waktu || '00:00'}`).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [filteredJurnal]);

  // Students with highest absences needing attention
  const studentsNeedAttention = useMemo(() => {
    const studentAbsenceMap = new Map<string, {
      nama: string;
      nisn: string;
      kelas: string;
      sakit: number;
      izin: number;
      alpa: number;
      total: number;
    }>();

    filteredRekap.forEach((r) => {
      const key = r.nisn || r.namaMurid;
      const current = studentAbsenceMap.get(key) || {
        nama: r.namaMurid,
        nisn: r.nisn,
        kelas: r.kelas,
        sakit: 0,
        izin: 0,
        alpa: 0,
        total: 0
      };
      current.sakit += Number(r.sakit) || 0;
      current.izin += Number(r.izin) || 0;
      current.alpa += Number(r.tanpaKeterangan) || 0;
      current.total = current.sakit + current.izin + current.alpa;
      studentAbsenceMap.set(key, current);
    });

    return Array.from(studentAbsenceMap.values())
      .filter((s) => s.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filteredRekap]);

  // Greeting based on hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 text-xs font-semibold text-blue-50">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Ringkasan Eksekutif & Laporan Menyeluruh</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {getGreeting()}, {currentUser?.name || 'Bapak/Ibu Pendidik'}
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Selamat datang di Dashboard Utama Sistem Informasi Guru Wali{' '}
              <span className="font-semibold text-white">
                {schoolSettings.namaSekolah || 'Sekolah'}
              </span>
              . Pantau perkembangan murid, jurnal pembinaan, dan rekapitulasi secara terpusat.
            </p>
          </div>

          {/* Quick Info & Filter Badges */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isGuru && userKelas && (
              <button
                onClick={() => setFilterMyClassOnly(!filterMyClassOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs ${
                  filterMyClassOnly
                    ? 'bg-white text-blue-700 hover:bg-blue-50'
                    : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                }`}
                title="Klik untuk mengubah cakupan data dashboard"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>
                  {filterMyClassOnly ? `Fokus Kelas ${userKelas}` : 'Semua Data Sekolah'}
                </span>
              </button>
            )}

            <div className="bg-white/15 border border-white/20 px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2 text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span className="font-medium">
                {isAdmin ? 'Akun Administrator' : `Guru Wali • ${userKelas || 'Guru Mapel'}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Guru Wali */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Guru Wali
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {guruList.length}
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {totalGuruAktif} Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {classList.length} Kelas Terdaftar di Sistem
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('guru')}
            className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 group"
          >
            <span>Kelola Guru Wali</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 2: Murid Bimbingan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Murid Bimbingan
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalMurid}
              </span>
              <span className="text-xs text-slate-500">Siswa/i</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span>👦 {muridLaki} Laki</span>
              <span>•</span>
              <span>👧 {muridPerempuan} Perempuan</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('murid')}
            className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs font-semibold text-emerald-600 hover:text-emerald-700 group"
          >
            <span>Daftar Bimbingan Murid</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 3: Jurnal Bimbingan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Jurnal Bimbingan
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalJurnal}
              </span>
              <span className="text-xs text-slate-500">Catatan Entri</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tercatat di 4 Pilar Pembinaan
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('jurnal')}
            className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs font-semibold text-amber-600 hover:text-amber-700 group"
          >
            <span>Buka Jurnal Harian</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Card 4: Rekap Presensi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Rekap Kehadiran
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalKetidakhadiran}
              </span>
              <span className="text-xs text-slate-500">Total Hari Absen</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span className="text-amber-600 font-medium">S: {totalSakit}</span>
              <span>•</span>
              <span className="text-blue-600 font-medium">I: {totalIzin}</span>
              <span>•</span>
              <span className="text-rose-600 font-medium">A: {totalAlpa}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('rekap')}
            className="mt-4 pt-3 border-t border-slate-100 w-full flex items-center justify-between text-xs font-semibold text-rose-600 hover:text-rose-700 group"
          >
            <span>Rekap Kehadiran Murid</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Middle Section: 4 Pillars Breakdown & Attendance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 4 Pillars Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Distribusi Pembinaan 4 Pilar Program
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rangkuman sebaran kegiatan bimbingan guru wali terhadap murid
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('program')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>Lihat Detail Pilar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pilar 1: Akademik */}
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    Pendampingan Akademik
                  </span>
                  <span className="text-sm font-extrabold text-blue-700">
                    {pilarCounts['Pendampingan Akademik']}
                  </span>
                </div>
                <p className="text-[11px] text-blue-800/80 leading-relaxed line-clamp-2">
                  Diagnostik kesulitan belajar, pemantauan tugas & motivasi belajar murid.
                </p>
              </div>
              <div className="mt-3 w-full bg-blue-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalJurnal > 0
                        ? (pilarCounts['Pendampingan Akademik'] / totalJurnal) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>

            {/* Pilar 2: Kompetensi */}
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    Pengembangan Kompetensi
                  </span>
                  <span className="text-sm font-extrabold text-amber-700">
                    {pilarCounts['Pengembangan Kompetensi']}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/80 leading-relaxed line-clamp-2">
                  Pendampingan minat bakat, lomba OSN/FLS2N, dan potensi akademik unggul.
                </p>
              </div>
              <div className="mt-3 w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalJurnal > 0
                        ? (pilarCounts['Pengembangan Kompetensi'] / totalJurnal) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>

            {/* Pilar 3: Keterampilan */}
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Pengembangan Keterampilan
                  </span>
                  <span className="text-sm font-extrabold text-indigo-700">
                    {pilarCounts['Pengembangan Keterampilan']}
                  </span>
                </div>
                <p className="text-[11px] text-indigo-800/80 leading-relaxed line-clamp-2">
                  Keterampilan sosial, kepemimpinan organisasi, literasi & komunikasi.
                </p>
              </div>
              <div className="mt-3 w-full bg-indigo-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalJurnal > 0
                        ? (pilarCounts['Pengembangan Keterampilan'] / totalJurnal) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>

            {/* Pilar 4: Karakter */}
            <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-rose-600" />
                    Pembentukan Karakter
                  </span>
                  <span className="text-sm font-extrabold text-rose-700">
                    {pilarCounts['Pembentukan Karakter']}
                  </span>
                </div>
                <p className="text-[11px] text-rose-800/80 leading-relaxed line-clamp-2">
                  Penanaman Profil Pelajar Pancasila, kedisiplinan, empati, dan sopan santun.
                </p>
              </div>
              <div className="mt-3 w-full bg-rose-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      totalJurnal > 0
                        ? (pilarCounts['Pembentukan Karakter'] / totalJurnal) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Action Navigation */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Aksi Cepat & Navigasi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              Jalan pintas langsung ke menu-menu utama aplikasi
            </p>

            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('jurnal')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      Input Jurnal Baru
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Catat bimbingan murid hari ini
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('rekap')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-rose-700">
                      Input Presensi Bulanan
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Rekap Sakit, Izin & Tanpa Keterangan
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('murid')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                      Data Bimbingan Murid
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Tambah atau Import Excel
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => onNavigateTab('settings')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center text-xs">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      Pengaturan & Kop Cetak
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Identitas sekolah & kepala sekolah
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Sistem Otomatis Cloud Firestore</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Journals & Class Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Recent Journal Entries */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Jurnal Bimbingan Terbaru
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  5 catatan pendampingan yang baru saja direkam
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('jurnal')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Lihat Semua ({filteredJurnal.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentJurnal.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Belum ada catatan jurnal bimbingan.
              </div>
            ) : (
              <div className="space-y-3">
                {recentJurnal.map((j) => (
                  <div
                    key={j.id}
                    className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 bg-slate-50/60 hover:bg-blue-50/30 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{j.namaMurid}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold">
                          {j.kelas}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {j.tanggal}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 mb-1.5 font-medium line-clamp-1">
                      <span className="text-blue-600 font-semibold mr-1">
                        [{j.jenisBimbingan}]
                      </span>
                      {j.topik}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                      <span className="truncate max-w-[200px]">
                        Wali: <strong className="text-slate-700">{j.namaGuruWali}</strong>
                      </span>
                      <span className="text-emerald-700 font-medium truncate max-w-[180px]">
                        TL: {j.tindakLanjut || '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table 2: Class & Teacher Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  Rekapitulasi Kelas & Guru Wali
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribusi murid dan penugasan wali kelas
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('murid')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Lihat Murid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {classBreakdown.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Belum ada kelas terdaftar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold rounded-l-lg">Kelas</th>
                      <th className="py-2.5 px-3 font-semibold">Guru Wali</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Murid</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Jurnal</th>
                      <th className="py-2.5 px-3 font-semibold text-center rounded-r-lg">Absen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classBreakdown.map((c) => (
                      <tr key={c.kelas} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-blue-700">
                          {c.kelas}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-800 truncate max-w-[140px]" title={c.wali}>
                            {c.wali}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {c.waliNip}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-bold text-slate-800">{c.totalMurid}</span>
                          <span className="text-[10px] text-slate-400 block">
                            ({c.laki}L / {c.perempuan}P)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[11px] border border-amber-200">
                            {c.totalJurnal}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] border ${
                            c.totalAbsen > 0
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {c.totalAbsen}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Siswa Perlu Perhatian Khusus (Jika ada siswa yang sering absen) */}
      {studentsNeedAttention.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-rose-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center space-x-2 text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="text-sm sm:text-base font-bold">
                  Siswa Perlu Perhatian Khusus (Akumulasi Ketidakhadiran)
                </h3>
                <p className="text-xs text-rose-700/80">
                  Daftar siswa dengan catatan Sakit, Izin, atau Alpa tertinggi untuk diprioritaskan dalam bimbingan
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('rekap')}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 underline self-start sm:self-auto"
            >
              Lihat Detail Presensi
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {studentsNeedAttention.map((s, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800 truncate" title={s.nama}>
                      {s.nama}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 text-[10px] font-semibold border border-rose-200">
                      {s.kelas}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mb-2">NISN: {s.nisn || '-'}</div>
                </div>

                <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Total Absen:</span>
                  <span className="font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                    {s.total} Hari
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
