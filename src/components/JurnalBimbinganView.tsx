import React, { useState, useEffect, useMemo } from 'react';
import { JurnalBimbingan, MuridBimbingan, JenisBimbingan, User } from '../types';
import { ALL_CLASSES } from '../data/initialData';
import { exportJurnalToPDF } from '../utils/pdfGenerator';
import {
  FileText,
  Calendar,
  Clock,
  UserCheck,
  Save,
  Download,
  Search,
  Trash2,
  Edit3,
  Filter,
  CheckCircle,
  PlusCircle,
  Sparkles
} from 'lucide-react';

interface JurnalBimbinganViewProps {
  jurnalList: JurnalBimbingan[];
  muridList: MuridBimbingan[];
  currentUser: User | null;
  onSaveJurnal: (jurnal: JurnalBimbingan) => void;
  onDeleteJurnal: (id: string) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const JurnalBimbinganView: React.FC<JurnalBimbinganViewProps> = ({
  jurnalList,
  muridList,
  currentUser,
  onSaveJurnal,
  onDeleteJurnal,
  showToast
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const userKelas = currentUser?.kelasWali || '';
  const userNip = currentUser?.nip || '';

  // Filter students available for bimbingan based on user role
  const availableStudents = useMemo(() => {
    if (!isAdmin && userKelas) {
      return muridList.filter((m) => m.kelas === userKelas || m.nipGuruWali === userNip);
    }
    return muridList;
  }, [muridList, isAdmin, userKelas, userNip]);

  // Helper to format device date and time
  const getDeviceDate = () => new Date().toISOString().slice(0, 10);
  const getDeviceTime = () => {
    const d = new Date();
    const hrs = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hrs}:${mins}`;
  };

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tanggal, setTanggal] = useState<string>(getDeviceDate());
  const [waktu, setWaktu] = useState<string>(getDeviceTime());
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [kelas, setKelas] = useState<string>(!isAdmin && userKelas ? userKelas : 'VIII E');
  const [jenisBimbingan, setJenisBimbingan] = useState<JenisBimbingan>('Pendampingan Akademik');
  const [topik, setTopik] = useState<string>('');
  const [tindakLanjut, setTindakLanjut] = useState<string>('');

  // Table Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>(!isAdmin && userKelas ? userKelas : 'SEMUA');
  const [filterJenis, setFilterJenis] = useState<string>('SEMUA');

  // Set default student if available
  useEffect(() => {
    if (availableStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(availableStudents[0].id);
      setKelas(availableStudents[0].kelas);
    }
  }, [availableStudents, selectedStudentId]);

  // When student dropdown changes, auto update class
  const handleStudentSelect = (sId: string) => {
    setSelectedStudentId(sId);
    const found = availableStudents.find((m) => m.id === sId);
    if (found) {
      setKelas(found.kelas);
    }
  };

  const handleResetForm = () => {
    setEditingId(null);
    setTanggal(getDeviceDate());
    setWaktu(getDeviceTime());
    if (availableStudents.length > 0) {
      setSelectedStudentId(availableStudents[0].id);
      setKelas(availableStudents[0].kelas);
    } else {
      setSelectedStudentId('');
      setKelas(!isAdmin && userKelas ? userKelas : 'VIII E');
    }
    setJenisBimbingan('Pendampingan Akademik');
    setTopik('');
    setTindakLanjut('');
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId) {
      showToast('Pilih Murid', 'Silakan pilih Nama Murid Bimbingan terlebih dahulu', 'error');
      return;
    }

    if (!topik.trim() || !tindakLanjut.trim()) {
      showToast('Form Belum Lengkap', 'Harap isi deskripsi Topik/Permasalahan dan Tindak Lanjut', 'error');
      return;
    }

    const selectedMurid = availableStudents.find((m) => m.id === selectedStudentId);
    const namaMurid = selectedMurid ? selectedMurid.nama : 'Murid Bimbingan';
    const nisn = selectedMurid ? selectedMurid.nisn : '-';

    const teacherName = currentUser?.name || 'Guru Wali';
    const teacherNip = currentUser?.nip || (selectedMurid?.nipGuruWali || '-');

    const newJurnal: JurnalBimbingan = {
      id: editingId || `jurnal-${Date.now()}`,
      tanggal,
      waktu,
      studentId: selectedStudentId,
      namaMurid,
      nisn,
      kelas: !isAdmin && userKelas ? userKelas : kelas,
      jenisBimbingan,
      topik: topik.trim(),
      tindakLanjut: tindakLanjut.trim(),
      nipGuruWali: teacherNip,
      namaGuruWali: teacherName,
      createdAt: new Date().toISOString()
    };

    onSaveJurnal(newJurnal);
    showToast('Jurnal Tersimpan', `Catatan jurnal bimbingan untuk ${namaMurid} berhasil disimpan!`, 'success');
    handleResetForm();
  };

  const handleEditClick = (j: JurnalBimbingan) => {
    setEditingId(j.id);
    setTanggal(j.tanggal);
    setWaktu(j.waktu);
    setSelectedStudentId(j.studentId);
    setKelas(j.kelas);
    setJenisBimbingan(j.jenisBimbingan);
    setTopik(j.topik);
    setTindakLanjut(j.tindakLanjut);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const roleBaseJurnal = useMemo(() => {
    if (!isAdmin && userKelas) {
      return jurnalList.filter((j) => j.kelas === userKelas || j.nipGuruWali === userNip);
    }
    return jurnalList;
  }, [jurnalList, isAdmin, userKelas, userNip]);

  const filteredJurnal = roleBaseJurnal.filter((j) => {
    const matchesSearch =
      j.namaMurid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.nisn.includes(searchTerm) ||
      j.topik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.tindakLanjut.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      !isAdmin && userKelas
        ? true
        : filterClass === 'SEMUA' || j.kelas === filterClass;
    const matchesJenis = filterJenis === 'SEMUA' || j.jenisBimbingan === filterJenis;
    return matchesSearch && matchesClass && matchesJenis;
  });

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 mb-1">
            <FileText className="w-4 h-4" />
            <span>
              {isAdmin
                ? 'Pencatatan Harian Bimbingan'
                : `Jurnal Bimbingan Kelas ${userKelas} • ${currentUser?.name}`}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isAdmin ? 'Jurnal Guru Wali' : `Jurnal Bimbingan Kelas ${userKelas}`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isAdmin
              ? 'Dokumentasikan sesi diskusi, kendala akademik, kompetensi, keterampilan, dan pembentukan karakter murid.'
              : `Dokumentasikan pendampingan dan bimbingan untuk siswa perwalian Kelas ${userKelas}.`}
          </p>
        </div>

        <div>
          <button
            onClick={() => exportJurnalToPDF(filteredJurnal)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm flex items-center space-x-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Jurnal</span>
          </button>
        </div>
      </div>

      {/* Input Form Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">
                {editingId ? 'Edit Catatan Jurnal Guru Wali' : 'Form Input Jurnal Guru Wali'}
              </h3>
              <p className="text-xs text-slate-500">
                Silakan isi data bimbingan di bawah ini lalu klik tombol simpan.
              </p>
            </div>
          </div>

          {editingId && (
            <button
              onClick={handleResetForm}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Batal Edit / Reset Form
            </button>
          )}
        </div>

        <form onSubmit={handleSaveSubmit} className="space-y-6">
          {/* Row 1: Tanggal & Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Tanggal ( Sesuai Sistem/Perangkat )</span>
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Waktu ( Sesuai Waktu Perangkat )</span>
              </label>
              <input
                type="time"
                value={waktu}
                onChange={(e) => setWaktu(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Row 2: Nama Murid & Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 mb-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Nama Murid Bimbingan ( Pilih Sesuai Data Murid )</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-medium"
              >
                <option value="">-- Pilih Nama Murid Bimbingan --</option>
                {availableStudents.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nama} (NISN: {m.nisn}) - Kelas {m.kelas}
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
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-medium"
                >
                  {ALL_CLASSES.map((k) => (
                    <option key={k} value={k}>
                      Kelas {k}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  disabled
                  value={`Kelas ${userKelas}`}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-700 font-bold"
                />
              )}
            </div>
          </div>

          {/* Row 3: Pilih Jenis Bimbingan */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Pilih Jenis Bimbingan ( 4 Pilar Utama Guru Wali )
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {[
                'Pendampingan Akademik',
                'Pengembangan Kompetensi',
                'Pengembangan Keterampilan',
                'Pembentukan Karakter'
              ].map((jb) => {
                const isSelected = jenisBimbingan === jb;
                return (
                  <button
                    key={jb}
                    type="button"
                    onClick={() => setJenisBimbingan(jb as JenisBimbingan)}
                    className={`p-3 rounded-lg border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-semibold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {jb}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Topik / Permasalahan */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Topik/Permasalahan ( Jelaskan topik atau permasalahan yang di bahas... )
            </label>
            <textarea
              rows={3}
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="Jelaskan topik atau permasalahan yang di bahas..."
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* Row 5: Tindak Lanjut */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Tindak Lanjut ( Jelaskan tindak lanjut yang akan dilakukan... )
            </label>
            <textarea
              rows={3}
              value={tindakLanjut}
              onChange={(e) => setTindakLanjut(e.target.value)}
              placeholder="Jelaskan tindak lanjut yang akan dilakukan..."
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* Tombol Simpan */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-[11px] text-slate-500">
              * Data tersimpan aman di sistem lokal perangkat & dapat diunduh PDF
            </span>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-sm flex items-center space-x-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Tombol Simpan Jurnal</span>
            </button>
          </div>
        </form>
      </div>

      {/* History Table & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Murid, Topik, atau Tindak Lanjut..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                <Filter className="w-3.5 h-3.5" />
                <span>Kelas:</span>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                >
                  <option value="SEMUA">Semua Kelas</option>
                  {ALL_CLASSES.map((k) => (
                    <option key={k} value={k}>
                      Kelas {k}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                Kelas {userKelas}
              </div>
            )}

            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
              <span>Pilar:</span>
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="SEMUA">Semua Pilar</option>
                <option value="Pendampingan Akademik">Pendampingan Akademik</option>
                <option value="Pengembangan Kompetensi">Pengembangan Kompetensi</option>
                <option value="Pengembangan Keterampilan">Pengembangan Keterampilan</option>
                <option value="Pembentukan Karakter">Pembentukan Karakter</option>
              </select>
            </div>
          </div>
        </div>

        {/* History Cards / Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Riwayat Jurnal Guru Wali ({filteredJurnal.length})</span>
            </h3>
            <span className="text-xs text-slate-500">Tersusun berdasarkan waktu terbaru</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredJurnal.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Belum ada data jurnal bimbingan yang sesuai kriteria pencarian.
              </div>
            ) : (
              filteredJurnal.map((j) => (
                <div
                  key={j.id}
                  className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start justify-between gap-4"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        {j.tanggal} • {j.waktu} WIB
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
                        Kelas {j.kelas}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                        {j.jenisBimbingan}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {j.namaMurid} <span className="text-xs font-normal text-slate-500">(NISN: {j.nisn})</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Guru Wali: <span className="text-slate-700 font-medium">{j.namaGuruWali}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="font-semibold text-blue-700 mb-1">Topik / Permasalahan:</div>
                        <p className="text-slate-700 leading-relaxed">{j.topik}</p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="font-semibold text-emerald-700 mb-1">Tindak Lanjut:</div>
                        <p className="text-slate-700 leading-relaxed">{j.tindakLanjut}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 shrink-0 self-end md:self-start">
                    <button
                      onClick={() => handleEditClick(j)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-500 transition-colors"
                      title="Edit Jurnal Ini"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus jurnal bimbingan untuk ${j.namaMurid}?`)) {
                          onDeleteJurnal(j.id);
                          showToast('Dihapus', `Jurnal ${j.namaMurid} telah dihapus.`, 'info');
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-500 transition-colors"
                      title="Hapus Jurnal Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
