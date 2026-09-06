import React, { useState, useRef } from 'react';
import { GuruWali } from '../types';
import { ALL_CLASSES } from '../data/initialData';
import {
  exportGuruWaliToExcel,
  downloadTemplateGuruExcel,
  readExcelFile,
  parseGuruExcel
} from '../utils/excelHandler';
import { Users, UserPlus, Upload, Download, FileSpreadsheet, Search, Edit3, Trash2, Save, X, FileCheck2 } from 'lucide-react';

interface DaftarGuruViewProps {
  guruList: GuruWali[];
  onSaveGuru: (guru: GuruWali) => void;
  onDeleteGuru: (id: string) => void;
  onImportGuru: (imported: GuruWali[]) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const DaftarGuruView: React.FC<DaftarGuruViewProps> = ({
  guruList,
  onSaveGuru,
  onDeleteGuru,
  onImportGuru,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [kelasWali, setKelasWali] = useState('VIII E');
  const [kelasWali2, setKelasWali2] = useState('');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Non-Aktif'>('Aktif');

  const resetForm = () => {
    setEditingId(null);
    setNip('');
    setNama('');
    setKelasWali('VIII E');
    setKelasWali2('');
    setNoHp('');
    setEmail('');
    setStatus('Aktif');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (g: GuruWali) => {
    setEditingId(g.id);
    setNip(g.nip);
    setNama(g.nama);
    setKelasWali(g.kelasWali);
    setKelasWali2(g.kelasWali2 || '');
    setNoHp(g.noHp);
    setEmail(g.email);
    setStatus(g.status);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nip.trim() || !nama.trim()) {
      showToast('Form tidak lengkap', 'Harap isi NIP dan Nama Guru Wali', 'error');
      return;
    }

    const newGuru: GuruWali = {
      id: editingId || `guru-${Date.now()}`,
      nip: nip.trim(),
      nama: nama.trim(),
      kelasWali,
      kelasWali2: kelasWali2 && kelasWali2 !== kelasWali ? kelasWali2 : undefined,
      noHp: noHp.trim() || '-',
      email: email.trim() || `${nip.trim()}@sekolah.sch.id`,
      status
    };

    onSaveGuru(newGuru);
    showToast('Berhasil Disimpan', `Data Guru Wali ${nama} berhasil disimpan!`, 'success');
    setShowModal(false);
    resetForm();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const json = await readExcelFile(file);
      const parsed = parseGuruExcel(json);
      if (parsed.length === 0) {
        showToast('Format Kosong', 'File Excel tidak berisi data guru wali yang valid', 'error');
        return;
      }

      onImportGuru(parsed);
      showToast('Import Berhasil', `${parsed.length} Data Guru Wali berhasil diimport dari Excel!`, 'success');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      showToast('Gagal Upload', 'Gagal membaca file Excel. Pastikan format file .xlsx / .csv', 'error');
    }
  };

  const filteredList = guruList.filter(
    (g) =>
      g.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.nip.includes(searchTerm) ||
      g.kelasWali.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.kelasWali2 && g.kelasWali2.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 mb-1">
            <Users className="w-4 h-4" />
            <span>Manajemen Tenaga Pendidik</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Daftar Guru Wali</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Input manual atau upload data Guru Wali dari file Excel (.xlsx / .csv)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* File input hidden */}
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
            title="Upload data guru dari file Excel"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Excel</span>
          </button>

          <button
            onClick={downloadTemplateGuruExcel}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs flex items-center space-x-2 transition-all shadow-xs"
            title="Download Template Format Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Template Excel</span>
          </button>

          <button
            onClick={() => exportGuruWaliToExcel(guruList)}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium text-xs flex items-center space-x-2 transition-all shadow-xs"
            title="Export ke File Excel"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center space-x-2 shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Guru Wali</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Nama, NIP, atau Kelas Wali..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Total: <span className="text-blue-600 font-bold">{filteredList.length}</span> Guru Wali
        </div>
      </div>

      {/* Guru List Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100/90 text-slate-600 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">NIP</th>
                <th className="py-3.5 px-4">Nama Lengkap Guru</th>
                <th className="py-3.5 px-4">Kelas Wali</th>
                <th className="py-3.5 px-4">No. HP / Whatsapp</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Belum ada data Guru Wali. Silakan Tambah Manual atau Upload File Excel.
                  </td>
                </tr>
              ) : (
                filteredList.map((g, idx) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">{g.nip}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{g.nama}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
                          Kelas {g.kelasWali}
                        </span>
                        {g.kelasWali2 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[11px]">
                            Kelas {g.kelasWali2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{g.noHp}</td>
                    <td className="py-3 px-4 text-slate-500">{g.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          g.status === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {g.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleEditClick(g)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-500 transition-colors"
                          title="Edit Data Guru"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data Guru Wali ${g.nama}?`)) {
                              onDeleteGuru(g.id);
                              showToast('Dihapus', `Data ${g.nama} telah dihapus.`, 'info');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-500 transition-colors"
                          title="Hapus Data Guru"
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

      {/* Manual Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl text-slate-800 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2 mb-4">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>{editingId ? 'Edit Data Guru Wali' : 'Input Manual Guru Wali'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  NIP Guru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Contoh: 198501122010011002"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Pd."
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Kelas Bimbingan 1 <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={kelasWali}
                    onChange={(e) => setKelasWali(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 font-semibold text-blue-600"
                  >
                    {ALL_CLASSES.map((k) => (
                      <option key={k} value={k}>
                        Kelas {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Kelas Bimbingan 2 <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <select
                    value={kelasWali2}
                    onChange={(e) => setKelasWali2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 font-semibold text-indigo-600"
                  >
                    <option value="">-- Tidak Ada (1 Kelas) --</option>
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
                    Status Keaktifan
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Non-Aktif')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    No. HP / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guru@sekolah.sch.id"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

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
