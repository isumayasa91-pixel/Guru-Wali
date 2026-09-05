import React, { useState } from 'react';
import { User, GuruWali, SchoolSettings } from '../types';
import { Lock, ArrowRight, GraduationCap, ShieldCheck, UserCheck } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  guruList: GuruWali[];
  schoolSettings?: SchoolSettings;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  guruList,
  schoolSettings
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const schoolNameDisplay = schoolSettings?.namaSekolah?.trim() || 'Aplikasi Guru Wali';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    setTimeout(() => {
      // 1. Check Admin Account: Username Admin, Password admin123
      if (cleanUser.toLowerCase() === 'admin' && cleanPass === 'admin123') {
        onLoginSuccess({
          id: 'user-admin',
          username: 'Admin',
          name: 'Administrator Guru Wali',
          role: 'admin',
          email: 'admin@sekolah.sch.id'
        });
        setIsLoading(false);
        return;
      }

      // 2. Check Guru Account: Username NIP, Password NIP
      const foundGuru = guruList.find((g) => g.nip === cleanUser);
      if (foundGuru) {
        if (cleanPass === foundGuru.nip) {
          onLoginSuccess({
            id: foundGuru.id,
            username: foundGuru.nip,
            nip: foundGuru.nip,
            name: foundGuru.nama,
            role: 'guru',
            kelasWali: foundGuru.kelasWali,
            email: foundGuru.email,
            phone: foundGuru.noHp
          });
          setIsLoading(false);
          return;
        } else {
          setErrorMsg('Password NIP tidak sesuai.');
          setIsLoading(false);
          return;
        }
      }

      setErrorMsg('Username atau Password salah! Pastikan login Admin (Admin/admin123) atau Guru Wali (Username NIP & Password NIP).');
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-200/90 flex flex-col justify-between items-center p-4 sm:p-6 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Decor */}
      <div className="w-full max-w-md pt-4 sm:pt-8 text-center">
        <div className="inline-flex items-center justify-center space-x-3 mb-3">
          {schoolSettings?.logoSekolah ? (
            <img
              src={schoolSettings.logoSekolah}
              alt="Logo Sekolah"
              className="w-14 h-14 object-contain rounded-2xl bg-white border border-slate-300/80 p-1.5 shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <GraduationCap className="w-7 h-7" />
            </div>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          Aplikasi Guru Wali
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
          {schoolNameDisplay}
        </p>
        <p className="text-[11px] text-slate-500">
          Sistem Informasi Pendampingan & Rekapitulasi Murid
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md my-auto py-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-300/80 text-slate-800">
          <div className="text-center space-y-1 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Masuk ke Akun Anda
            </h2>
            <p className="text-xs text-slate-500">
              Silakan masukkan Username dan Password untuk mengakses sistem
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed animate-in fade-in">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda"
                required
                autoFocus
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all mt-4 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Guidance Info */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Admin: Username Admin
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Guru: NIP
            </span>
          </div>
        </div>
      </div>

      {/* Footer Credit requested by user */}
      <footer className="w-full max-w-md pb-4 text-center">
        <p className="text-xs text-slate-600 font-medium">
          Aplikasi ini di kembangkan oleh:@wayansuma70
        </p>
      </footer>
    </div>
  );
};
