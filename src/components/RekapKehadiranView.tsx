import React, { useState, useEffect, useMemo } from 'react';
import { RekapKehadiran, MuridBimbingan, GuruWali, User, getGuruClassList, getGuruClassDisplay } from '../types';
import { ALL_CLASSES, MONTHS_LIST } from '../data/initialData';
import { exportRekapKehadiranToPDF } from '../utils/pdfGenerator';
import {
  CalendarCheck,
  Calendar,
  Save,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

interface RekapKehadiranViewProps {
  rekapList: RekapKehadiran[];
  muridList: MuridBimbingan[];
  guruList?: GuruWali[];
  currentUser: User | null;
  onSaveRekapBatch: (records: RekapKehadiran[]) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const RekapKehadiranView: React.FC<RekapKehadiranViewProps> = ({
  rekapList,
  muridList,
  guruList = [],
  currentUser,
  onSaveRekapBatch,
  showToast
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const userClasses = useMemo(() => getGuruClassList(currentUser, guruList), [currentUser, guruList]);
  const userClassDisplay = useMemo(() => getGuruClassDisplay(currentUser, guruList), [currentUser, guruList]);

  // Selectors
  const currentMonthIdx = new Date().getMonth();
  const [bulan, setBulan] = useState<string>(MONTHS_LIST[currentMonthIdx] || 'September');
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [kelas, setKelas] = useState<string>(
    !isAdmin && userClasses.length > 0 ? userClasses[0] : 'VIII E'
  );

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // Editable state map for current view: studentId -> { sakit, izin, tanpaKeterangan }
  const [attendanceMap, setAttendanceMap] = useState<{
    [studentId: string]: { sakit: number; izin: number; tanpaKeterangan: number };
  }>({});

  const effectiveKelas = !isAdmin && userClasses.length === 1 ? userClasses[0] : kelas;

  // Filter students by selected class
  const classStudents = muridList.filter((m) => m.kelas === effectiveKelas);

  // Initialize or reload map when bulan, tahun, or kelas changes
  useEffect(() => {
    const newMap: { [studentId: string]: { sakit: number; izin: number; tanpaKeterangan: number } } = {};

    classStudents.forEach((student) => {
      // Find existing record in rekapList
      const existing = rekapList.find(
        (r) => r.studentId === student.id && r.bulan === bulan && Number(r.tahun) === Number(tahun)
      );

      if (existing) {
        newMap[student.id] = {
          sakit: existing.sakit || 0,
          izin: existing.izin || 0,
          tanpaKeterangan: existing.tanpaKeterangan || 0
        };
      } else {
        newMap[student.id] = { sakit: 0, izin: 0, tanpaKeterangan: 0 };
      }
    });

    setAttendanceMap(newMap);
  }, [bulan, tahun, effectiveKelas, rekapList, muridList]);

  const handleValueChange = (
    studentId: string,
    field: 'sakit' | 'izin' | 'tanpaKeterangan',
    valueStr: string
  ) => {
    const val = Math.max(0, parseInt(valueStr) || 0);
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { sakit: 0, izin: 0, tanpaKeterangan: 0 }),
        [field]: val
      }
    }));
  };

  const handleSaveAll = () => {
    if (classStudents.length === 0) {
      showToast('Peringatan', 'Tidak ada data murid pada kelas ini.', 'info');
      return;
    }

    const recordsToSave: RekapKehadiran[] = classStudents.map((student) => {
      const att = attendanceMap[student.id] || { sakit: 0, izin: 0, tanpaKeterangan: 0 };
      const existing = rekapList.find(
        (r) => r.studentId === student.id && r.bulan === bulan && Number(r.tahun) === Number(tahun)
      );

      return {
        id: existing ? existing.id : `rekap-${student.id}-${bulan}-${tahun}`,
        bulan,
        tahun,
        kelas: effectiveKelas,
        studentId: student.id,
        namaMurid: student.nama,
        nisn: student.nisn,
        sakit: att.sakit,
        izin: att.izin,
        tanpaKeterangan: att.tanpaKeterangan,
        updatedAt: new Date().toISOString(),
        updatedByNip: currentUser?.nip || 'System'
      };
    });

    onSaveRekapBatch(recordsToSave);
    showToast(
      'Berhasil Disimpan',
      `Rekap Kehadiran Bulan ${bulan} ${tahun} Kelas ${effectiveKelas} berhasil disimpan!`,
      'success'
    );
  };

  // Prepare current rekap array for PDF Export
  const currentExportRecords: RekapKehadiran[] = classStudents.map((student) => {
    const att = attendanceMap[student.id] || { sakit: 0, izin: 0, tanpaKeterangan: 0 };
    return {
      id: `export-${student.id}`,
      bulan,
      tahun,
      kelas,
      studentId: student.id,
      namaMurid: student.nama,
      nisn: student.nisn,
      sakit: att.sakit,
      izin: att.izin,
      tanpaKeterangan: att.tanpaKeterangan
    };
  });

  const filteredStudents = classStudents.filter(
    (m) => m.nama.toLowerCase().includes(searchTerm.toLowerCase()) || m.nisn.includes(searchTerm)
  );

  // Total Counters
  let totalSakit = 0;
  let totalIzin = 0;
  let totalAlfa = 0;

  Object.values(attendanceMap).forEach((val: { sakit: number; izin: number; tanpaKeterangan: number }) => {
    totalSakit += val.sakit || 0;
    totalIzin += val.izin || 0;
    totalAlfa += val.tanpaKeterangan || 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>
              {isAdmin
                ? 'Rekapitulasi Kehadiran & Presensi Murid'
                : `Rekap Kehadiran ${userClassDisplay} • ${currentUser?.name}`}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isAdmin ? 'Rekap Kehadiran Murid' : `Rekap Kehadiran Siswa ${userClassDisplay}`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Input dan simpan rekapitulasi jumlah hari Sakit, Izin, dan Tanpa Keterangan per bulan.'
              : `Input dan simpan rekapitulasi presensi bulanan siswa binaan ${userClassDisplay}.`}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportRekapKehadiranToPDF(currentExportRecords, bulan, tahun, effectiveKelas)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm flex items-center space-x-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Rekap</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Month, Year, Class Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Pilih Bulan Kehadiran
          </label>
          <select
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-medium"
          >
            {MONTHS_LIST.map((m) => (
              <option key={m} value={m}>
                Bulan {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pilih Tahun</label>
          <select
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-medium"
          >
            {[2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>
                Tahun {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Kelas
          </label>
          {isAdmin ? (
            <select
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-bold text-blue-600"
            >
              {ALL_CLASSES.map((k) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          ) : userClasses.length > 1 ? (
            <select
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-bold text-blue-600"
            >
              {userClasses.map((k) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full bg-blue-50 border border-blue-200 rounded-lg px-3.5 py-2.5 text-xs text-blue-700 font-bold flex items-center justify-between">
              <span>Kelas {userClasses[0] || 'Bimbingan'}</span>
              <span className="text-[10px] font-normal bg-blue-100 px-2 py-0.5 rounded text-blue-800">Wali Kelas Aktif</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-3 shadow-xs">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Murid Kelas</div>
            <div className="text-xl font-bold text-slate-800">{classStudents.length} Murid</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-3 shadow-xs">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Sakit (Total Hari)</div>
            <div className="text-xl font-bold text-amber-600">{totalSakit} Hari</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-3 shadow-xs">
          <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Izin (Total Hari)</div>
            <div className="text-xl font-bold text-indigo-600">{totalIzin} Hari</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-3 shadow-xs">
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Tanpa Keterangan</div>
            <div className="text-xl font-bold text-rose-600">{totalAlfa} Hari</div>
          </div>
        </div>
      </div>

      {/* Roster & Attendance Form */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Murid..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleSaveAll}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-sm flex items-center space-x-2 transition-all shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Tombol Simpan Rekap Kehadiran</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/90 text-slate-600 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">NISN</th>
                <th className="py-3.5 px-4">Nama Murid Bimbingan</th>
                <th className="py-3.5 px-4 text-center w-32">Sakit (Tulis Angka)</th>
                <th className="py-3.5 px-4 text-center w-32">Izin (Tulis Angka)</th>
                <th className="py-3.5 px-4 text-center w-40">Tanpa Keterangan (Tulis Angka)</th>
                <th className="py-3.5 px-4 text-center w-28">Total Absen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada murid terdaftar di Kelas {kelas}. Tambahkan murid terlebih dahulu di menu "Daftar Bimbingan Murid".
                  </td>
                </tr>
              ) : (
                filteredStudents.map((m, idx) => {
                  const att = attendanceMap[m.id] || { sakit: 0, izin: 0, tanpaKeterangan: 0 };
                  const sumAbsen = att.sakit + att.izin + att.tanpaKeterangan;

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{m.nisn}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{m.nama}</td>

                      {/* Input Sakit */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min={0}
                          value={att.sakit}
                          onChange={(e) => handleValueChange(m.id, 'sakit', e.target.value)}
                          className="w-20 bg-slate-50 border border-slate-300 rounded-lg py-1 px-2 text-center text-xs text-amber-700 font-bold focus:outline-none focus:bg-white focus:border-amber-500"
                        />
                      </td>

                      {/* Input Izin */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min={0}
                          value={att.izin}
                          onChange={(e) => handleValueChange(m.id, 'izin', e.target.value)}
                          className="w-20 bg-slate-50 border border-slate-300 rounded-lg py-1 px-2 text-center text-xs text-indigo-700 font-bold focus:outline-none focus:bg-white focus:border-indigo-500"
                        />
                      </td>

                      {/* Input Tanpa Keterangan */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          min={0}
                          value={att.tanpaKeterangan}
                          onChange={(e) => handleValueChange(m.id, 'tanpaKeterangan', e.target.value)}
                          className="w-20 bg-slate-50 border border-slate-300 rounded-lg py-1 px-2 text-center text-xs text-rose-700 font-bold focus:outline-none focus:bg-white focus:border-rose-500"
                        />
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        {sumAbsen > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                            {sumAbsen} Hari
                          </span>
                        ) : (
                          <span className="text-emerald-600 text-[11px] font-semibold">Hadir Penuh</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Save Bar */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Ingat untuk menekan tombol simpan agar rekapitulasi kehadiran terbaru diperbarui.
          </p>
          <button
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-sm flex items-center space-x-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Tombol Simpan Rekap Kehadiran</span>
          </button>
        </div>
      </div>
    </div>
  );
};
