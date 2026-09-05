import React, { useState } from 'react';
import { SchoolSettings } from '../types';
import { DEFAULT_SCHOOL_SETTINGS } from '../data/initialData';
import {
  Settings,
  Building2,
  MapPin,
  FileCheck,
  UserCheck,
  Upload,
  Image as ImageIcon,
  Trash2,
  RotateCcw,
  CheckCircle,
  Eye,
  ShieldAlert
} from 'lucide-react';

interface PengaturanViewProps {
  settings: SchoolSettings;
  onSaveSettings: (settings: SchoolSettings) => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  isAdmin: boolean;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  settings,
  onSaveSettings,
  showToast,
  isAdmin
}) => {
  const [formData, setFormData] = useState<SchoolSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field: keyof SchoolSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleLogoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoKabupaten' | 'logoSekolah'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Format File Salah', 'Harap pilih file gambar (PNG, JPG, JPEG).', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran Gambar Terlalu Besar', 'Maksimal ukuran logo adalah 2 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleChange(field, reader.result);
        showToast(
          'Logo Berhasil Diunggah',
          `Logo ${field === 'logoKabupaten' ? 'Kabupaten' : 'Sekolah'} berhasil diperbarui.`,
          'success'
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (field: 'logoKabupaten' | 'logoSekolah') => {
    handleChange(field, '');
    showToast(
      'Logo Dihapus',
      `Logo ${field === 'logoKabupaten' ? 'Kabupaten' : 'Sekolah'} telah dihapus.`,
      'info'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSaved(true);
    showToast('Pengaturan Disimpan', 'Identitas sekolah & header cetak PDF berhasil diperbarui.', 'success');
  };

  const handleReset = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan pengaturan ke standar awal?')) {
      setFormData({ ...DEFAULT_SCHOOL_SETTINGS });
      onSaveSettings({ ...DEFAULT_SCHOOL_SETTINGS });
      showToast('Pengaturan Direset', 'Pengaturan telah dikembalikan ke standar awal.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Sistem & Kop Surat Cetak</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Pengaturan Identitas Sekolah & Logo Header
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Atur nama sekolah, NPSN, alamat, data Kepala Sekolah, serta logo daerah & sekolah untuk cetakan laporan PDF.
          </p>
        </div>

        {!isAdmin && (
          <div className="flex items-center space-x-2 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-2 rounded-lg text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Mode View Only (Hanya Admin yang dapat mengubah pengaturan).</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main School Info Section (2 Cols) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-200 pb-3">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Identitas & Header Cetak Dokumen</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Sekolah */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Sekolah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.namaSekolah}
                  onChange={(e) => handleChange('namaSekolah', e.target.value)}
                  placeholder="Contoh: SMP NEGERI 1 UNGGUL"
                  required
                  disabled={!isAdmin}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              {/* NPSN */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NPSN (Nomor Pokok Sekolah Nasional)
                </label>
                <input
                  type="text"
                  value={formData.npsn}
                  onChange={(e) => handleChange('npsn', e.target.value)}
                  placeholder="Contoh: 20101234"
                  disabled={!isAdmin}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              {/* Tampilan Header Cetak */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tampilan Header saat Cetak File (Kop Atas Dokumen)
                </label>
                <textarea
                  rows={2}
                  value={formData.headerCetak}
                  onChange={(e) => handleChange('headerCetak', e.target.value)}
                  placeholder="Contoh: PEMERINTAH KABUPATEN PENDIDIKAN&#10;DINAS PENDIDIKAN DAN KEBUDAYAAN"
                  disabled={!isAdmin}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 leading-relaxed disabled:opacity-60"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  *Gunakan tombol Enter untuk berpindah baris pada Kop Cetak atas (misal: Baris 1: Pemerintah Kabupaten, Baris 2: Dinas Pendidikan).
                </p>
              </div>

              {/* Alamat Sekolah */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Lengkap & Kontak Sekolah
                </label>
                <textarea
                  rows={2}
                  value={formData.alamatSekolah}
                  onChange={(e) => handleChange('alamatSekolah', e.target.value)}
                  placeholder="Jl. Pendidikan No. 1, Kota Pendidikan - Indonesia | Telp: (021) 555-1234"
                  disabled={!isAdmin}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Kepala Sekolah Section */}
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2 pt-4 border-t border-slate-200">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Pejabat Penandatangan (Kepala Sekolah)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kepala Sekolah & Gelar
                </label>
                <input
                  type="text"
                  value={formData.namaKepsek}
                  onChange={(e) => handleChange('namaKepsek', e.target.value)}
                  placeholder="Contoh: Drs. H. Supriyadi, M.Pd."
                  disabled={!isAdmin}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={formData.nipKepsek}
                  onChange={(e) => handleChange('nipKepsek', e.target.value)}
                  placeholder="Contoh: 197001011995031001"
                  disabled={!isAdmin}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Logo Upload Section (1 Col) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2 border-b border-slate-200 pb-3">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span>Upload Logo Header (Kop PDF)</span>
              </h2>

              {/* Logo Kabupaten */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Logo Kabupaten / Pemerintah (Kiri)
                </label>

                <div className="p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50 flex items-center justify-between gap-3">
                  {formData.logoKabupaten ? (
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={formData.logoKabupaten}
                        alt="Logo Kabupaten"
                        className="w-12 h-12 object-contain bg-white border border-slate-200 rounded p-1"
                      />
                      <div className="text-xs min-w-0">
                        <div className="font-semibold text-slate-800 truncate">Logo Kabupaten</div>
                        <div className="text-[10px] text-emerald-600 font-medium">Tersedia</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5 text-slate-300" />
                      <span>Belum ada logo Kabupaten</span>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="flex items-center space-x-1 shrink-0">
                      <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs px-2.5 py-1.5 rounded-md font-medium flex items-center space-x-1 shadow-xs transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, 'logoKabupaten')}
                          className="hidden"
                        />
                      </label>

                      {formData.logoKabupaten && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLogo('logoKabupaten')}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Hapus Logo Kabupaten"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Logo Sekolah */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Logo Sekolah / Instansi (Kanan)
                </label>

                <div className="p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50 flex items-center justify-between gap-3">
                  {formData.logoSekolah ? (
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={formData.logoSekolah}
                        alt="Logo Sekolah"
                        className="w-12 h-12 object-contain bg-white border border-slate-200 rounded p-1"
                      />
                      <div className="text-xs min-w-0">
                        <div className="font-semibold text-slate-800 truncate">Logo Sekolah</div>
                        <div className="text-[10px] text-emerald-600 font-medium">Tersedia</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5 text-slate-300" />
                      <span>Belum ada logo Sekolah</span>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="flex items-center space-x-1 shrink-0">
                      <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs px-2.5 py-1.5 rounded-md font-medium flex items-center space-x-1 shadow-xs transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, 'logoSekolah')}
                          className="hidden"
                        />
                      </label>

                      {formData.logoSekolah && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLogo('logoSekolah')}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Hapus Logo Sekolah"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Submit & Reset Buttons */}
            {isAdmin && (
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan Perubahan Pengaturan</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Standar Awal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Live Preview Box for Kop Surat PDF */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-800">
              Pratinjau Kop Surat & Header Cetak Laporan (Kertas A4)
            </h2>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-medium">
            Pratinjau Realtime
          </span>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="max-w-2xl mx-auto bg-white p-6 border border-slate-300 shadow-sm rounded relative">
            <div className="flex items-center justify-between gap-4 border-b-2 border-slate-800 pb-3">
              {/* Left Logo */}
              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                {formData.logoKabupaten ? (
                  <img
                    src={formData.logoKabupaten}
                    alt="Logo Kab"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 rounded border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 text-center p-1">
                    [Logo Kab]
                  </div>
                )}
              </div>

              {/* Center Header Text */}
              <div className="text-center flex-1 space-y-1">
                {formData.headerCetak ? (
                  formData.headerCetak.split('\n').map((line, idx) => (
                    <div key={idx} className="text-xs font-bold text-slate-800 uppercase leading-tight">
                      {line}
                    </div>
                  ))
                ) : (
                  <div className="text-xs font-bold text-slate-800 uppercase leading-tight">
                    DINAS PENDIDIKAN DAN KEBUDAYAAN
                  </div>
                )}

                <div className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  {formData.namaSekolah || 'NAMA SEKOLAH ANDA'}
                </div>

                <div className="text-[10px] text-slate-600 leading-tight">
                  {formData.alamatSekolah || 'Alamat Lengkap Sekolah'}
                  {formData.npsn && ` | NPSN: ${formData.npsn}`}
                </div>
              </div>

              {/* Right Logo */}
              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                {formData.logoSekolah ? (
                  <img
                    src={formData.logoSekolah}
                    alt="Logo Sekolah"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 rounded border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 text-center p-1">
                    [Logo Sekolah]
                  </div>
                )}
              </div>
            </div>

            {/* Sample PDF Title */}
            <div className="text-center mt-4">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                LAPORAN JURNAL GURU WALI
              </div>
              <div className="text-[10px] text-slate-500 italic mt-0.5">
                Rekapitulasi Bimbingan & Pendampingan Murid
              </div>
            </div>

            {/* Sample Table Preview */}
            <div className="mt-4 border border-slate-300 rounded overflow-hidden">
              <div className="bg-blue-900 text-white text-[10px] font-bold p-1.5 grid grid-cols-6 gap-1 text-center">
                <span>No</span>
                <span className="col-span-2">Nama Murid</span>
                <span>Jenis Bimbingan</span>
                <span className="col-span-2">Topik & Tindak Lanjut</span>
              </div>
              <div className="p-2 text-[10px] text-slate-600 grid grid-cols-6 gap-1 border-t border-slate-200">
                <span className="text-center">1</span>
                <span className="col-span-2 font-medium text-slate-800">Aditya Pratama (VIII E)</span>
                <span>Pendampingan Akademik</span>
                <span className="col-span-2 truncate">Peningkatan nilai matematika</span>
              </div>
            </div>

            {/* Sample Signature Footer Preview */}
            <div className="mt-6 grid grid-cols-2 text-[10px] text-slate-700 pt-2 border-t border-slate-200">
              <div>
                <div>Mengetahui,</div>
                <div className="font-semibold">Kepala Sekolah</div>
                <div className="h-10"></div>
                <div className="font-bold underline text-slate-900">
                  {formData.namaKepsek || 'Drs. H. Supriyadi, M.Pd.'}
                </div>
                <div>NIP. {formData.nipKepsek || '197001011995031001'}</div>
              </div>

              <div className="text-right">
                <div>Kota Pendidikan, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <div className="font-semibold">Guru Wali,</div>
                <div className="h-10"></div>
                <div className="font-bold underline text-slate-900">
                  Budi Santoso, S.Pd.
                </div>
                <div>NIP. 198501122010011002</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
