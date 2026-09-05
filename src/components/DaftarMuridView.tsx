import React, { useState, useRef } from 'react';
import { MuridBimbingan, GuruWali, JenisKelamin } from '../types';
import { ALL_CLASSES } from '../data/initialData';
import {
  exportMuridToExcel,
  downloadTemplateMuridExcel,
  readExcelFile,
  parseMuridExcel
} from '../utils/excelHandler';
import { exportMuridListToPDF } from '../utils/pdfGenerator';
import {
  GraduationCap,
  UserPlus,
  Upload,
  Download,
  FileSpreadsheet,
  Search,
  Edit3,
  Trash2,
  Save,
  X,
  FileDown,
  Filter
} from 'lucide-react';

interface DaftarMuridViewProps {
  muridList: MuridBimbingan[];
  guruList: GuruWali[];
  onSaveMurid: (murid: MuridBimbingan) => void;
  onDeleteMurid: (id: string) => void;
  onImportMurid: (imported: MuridBimbingan[]) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const DaftarMuridView: React.FC<DaftarMuridViewProps> = ({
  muridList,
  guruList,
  onSaveMurid,
  onDeleteMurid,
  onImportMurid,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('SEMUA');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State: Identitas Murid Bimbingan
  const [nama, setNama] = useState('');
  const [nisn, setNisn] = useState('');
  const [kelas, setKelas] = useState('VIII E');
  const [jenisKelamin, setJenisKelamin] = useState<JenisKelamin>('Laki-laki');
  const [kontakOrangTua, setKontakOrangTua] = useState('');
  const [nipGuruWali, setNipGuruWali] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setNama('');
    setNisn('');
    setKelas('VIII E');
    setJenisKelamin('Laki-laki');
    setKontakOrangTua('');
    setNipGuruWali('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (m: MuridBimbingan) => {
    setEditingId(m.id);
    setNama(m.nama);
    setNisn(m.nisn);
    setKelas(m.kelas);
    setJenisKelamin(m.jenisKelamin);
    setKontakOrangTua(m.kontakOrangTua);
    setNipGuruWali(m.nipGuruWali || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !nisn.trim()) {
      showToast('Form tidak lengkap', 'Harap isi Nama Murid dan NISN', 'error');
      return;
    }

    // Match Guru Wali by class or assigned NIP
    let matchedGuru = guruList.find((g) => g.nip === nipGuruWali);
    if (!matchedGuru) {
      matchedGuru = guruList.find((g) => g.kelasWali === kelas);
    }

    const updatedMurid: MuridBimbingan = {
      id: editingId || `murid-${Date.now()}`,
      nisn: nisn.trim(),
      nama: nama.trim(),
      kelas,
      jenisKelamin,
      kontakOrangTua: kontakOrangTua.trim() || '-',
      nipGuruWali: matchedGuru?.nip || nipGuruWali,
      namaGuruWali: matchedGuru?.nama || 'Guru Wali Kelas ' + kelas
    };

    onSaveMurid(updatedMurid);
    showToast('Berhasil Disimpan', `Identitas Murid Bimbingan ${nama} berhasil disimpan!`, 'success');
    setShowModal(false);
    resetForm();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const json = await readExcelFile(file);
      const parsed = parseMuridExcel(json);
      if (parsed.length === 0) {
        showToast('Format Kosong', 'File Excel tidak berisi data murid bimbingan yang valid', 'error');
        return;
      }

      // Automatically map guru wali for each parsed student
      const mapped = parsed.map((m) => {
        const matched = guruList.find((g) => g.kelasWali === m.kelas);
        return {
          ...m,
          nipGuruWali: matched?.nip,
          namaGuruWali: matched?.nama || 'Guru Wali Kelas ' + m.kelas
        };
      });

      onImportMurid(mapped);
      showToast('Import Berhasil', `${mapped.length} Data Murid Bimbingan berhasil diimport dari Excel!`, 'success');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      showToast('Gagal Upload', 'Gagal membaca file Excel. Pastikan format file .xlsx / .csv', 'error');
    }
  };

  const filteredList = muridList.filter((m) => {
    const matchesSearch =
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nisn.includes(searchTerm) ||
      m.kelas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClassFilter === 'SEMUA' || m.kelas === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Manajemen Data Peserta Didik</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Daftar Bimbingan Murid</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Identitas Murid Bimbingan: Tersinkronisasi dengan Jurnal & Rekap Kehadiran (Kelas VII A s/d IX E)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center space-x-2 shadow-sm transition-all"
            title="Upload data murid dari file Excel"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Excel</span>
          </button>

          <button
            onClick={downloadTemplateMuridExcel}
            className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs flex items-center space-x-1.5 transition-all shadow-xs"
            title="Download Template Format Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Template</span>
          </button>

          <button
            onClick={() => exportMuridToExcel(filteredList)}
            className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs flex items-center space-x-1.5 transition-all shadow-xs"
            title="Export ke File Excel"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => exportMuridListToPDF(filteredList, selectedClassFilter !== 'SEMUA' ? selectedClassFilter : undefined)}
            className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs flex items-center space-x-1.5 transition-all shadow-xs"
            title="Download PDF"
          >
            <FileDown className="w-4 h-4 text-rose-600" />
            <span>PDF</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center space-x-2 shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Murid Manual</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 rounded-xl p-3 gap-3 shadow-sm">
        <div className="flex items-center space-x-3 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama Murid, NISN, atau Kelas..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
            >
              <option value="SEMUA">Semua Kelas (VII A - IX E)</option>
              {ALL_CLASSES.map((k) => (
                <option key={k} value={k}>
                  Kelas {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Menampilkan <span className="text-blue-600 font-bold">{filteredList.length}</span> Murid Bimbingan
        </div>
      </div>

      {/* Murid Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/90 text-slate-600 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">NISN</th>
                <th className="py-3.5 px-4">Nama Murid Bimbingan</th>
                <th className="py-3.5 px-4 text-center">Kelas</th>
                <th className="py-3.5 px-4">Jenis Kelamin</th>
                <th className="py-3.5 px-4">Kontak Orang Tua (No HP)</th>
                <th className="py-3.5 px-4">Guru Wali</th>
                <th className="py-3.5 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Belum ada data Murid Bimbingan. Silakan Tambah Manual atau Upload File Excel.
                  </td>
                </tr>
              ) : (
                filteredList.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{m.nisn}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{m.nama}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
                        {m.kelas}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          m.jenisKelamin === 'Laki-laki'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-pink-50 text-pink-700 border border-pink-200'
                        }`}
                      >
                        {m.jenisKelamin}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{m.kontakOrangTua}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{m.namaGuruWali || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleEditClick(m)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-500 transition-colors"
                          title="Edit Identitas Murid"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data murid ${m.nama}?`)) {
                              onDeleteMurid(m.id);
                              showToast('Dihapus', `Data ${m.nama} telah dihapus.`, 'info');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-500 transition-colors"
                          title="Hapus Data Murid"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Identitas Murid Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl text-slate-800 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2 mb-1">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <span>Identitas Murid Bimbingan</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Isi formulir identitas murid bimbingan secara manual di bawah ini.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Murid Bimbingan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Aditya Pratama"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    NISN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    placeholder="0081234567"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Kelas (VII A s/d IX E) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    {ALL_CLASSES.map((k) => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as JenisKelamin)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Kontak Orang Tua (No HP)
                  </label>
                  <input
                    type="text"
                    value={kontakOrangTua}
                    onChange={(e) => setKontakOrangTua(e.target.value)}
                    placeholder="Contoh: 081211112222"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Pilih Guru Wali Pembimbing
                </label>
                <select
                  value={nipGuruWali}
                  onChange={(e) => setNipGuruWali(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                >
                  <option value="">-- Otomatis Sesuai Kelas Wali --</option>
                  {guruList.map((g) => (
                    <option key={g.id} value={g.nip}>
                      {g.nama} ({g.nip}) - Wali {g.kelasWali}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tombol Simpan */}
              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm flex items-center space-x-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Tombol Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
