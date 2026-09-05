import React, { useState } from 'react';
import { User, GuruWali } from '../types';
import { Lock, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  guruList: GuruWali[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  guruList
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    // 1. Check Admin Account: Username Admin, Password admin123
    if (cleanUser.toLowerCase() === 'admin' && cleanPass === 'admin123') {
      onLoginSuccess({
        id: 'user-admin',
        username: 'Admin',
        name: 'Administrator Guru Wali',
        role: 'admin',
        email: 'admin@sekolah.sch.id'
      });
      onClose();
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
        onClose();
        return;
      } else {
        setErrorMsg('Password NIP salah. Untuk NIP ini, password default adalah NIP itu sendiri.');
        return;
      }
    }

    setErrorMsg('Username atau Password tidak ditemukan! Pastikan login Admin (Admin/admin123) atau Guru (Username NIP & Password NIP).');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-slate-800 relative">
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Login Sistem</h2>
          <p className="text-xs text-slate-500">
            Aplikasi Guru Wali - Pendampingan & Rekapitulasi Murid
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Username (Admin / NIP Guru)
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: Admin atau NIP Anda"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password anda"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-all mt-2 text-sm"
          >
            <span>Masuk ke Sistem</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Modal Footer with Developer Credit */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-500 font-medium">
            Aplikasi ini di kembangkan oleh:@wayansuma70
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors underline decoration-slate-300 underline-offset-2"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
