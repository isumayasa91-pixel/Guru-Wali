import React, { useState, useEffect } from 'react';
import { User, SchoolSettings } from '../types';
import { UserCheck, LogOut, Clock, Calendar, GraduationCap, ShieldCheck, UserCog, Cloud } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  isCloudSyncing?: boolean;
  schoolSettings?: SchoolSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onOpenLoginModal,
  isCloudSyncing = false,
  schoolSettings
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setDateStr(
        now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const schoolNameDisplay = schoolSettings?.namaSekolah?.trim() || 'SMP Negeri Indonesia';

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 min-w-0">
            {schoolSettings?.logoSekolah ? (
              <img
                src={schoolSettings.logoSekolah}
                alt="Logo Sekolah"
                className="w-10 h-10 object-contain rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-900 flex items-center gap-2 truncate">
                Aplikasi Guru Wali
                <span className="hidden sm:inline-block text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  Sistem Informasi Pendampingan
                </span>
              </h1>
              <div className="flex items-center space-x-2 text-xs text-slate-500 truncate">
                <span className="font-semibold text-slate-700 truncate max-w-[200px] sm:max-w-[320px]" title={schoolNameDisplay}>
                  {schoolNameDisplay}
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  <Cloud className={`w-3 h-3 ${isCloudSyncing ? 'animate-bounce text-blue-600' : 'text-emerald-600'}`} />
                  <span>{isCloudSyncing ? 'Menyinkronkan...' : 'Cloud Sync Aktif'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Device Date/Time & User Auth */}
          <div className="flex items-center space-x-4 shrink-0">
            {/* Live Clock & Device Date */}
            <div className="hidden lg:flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600">
              <div className="flex items-center space-x-1.5 text-blue-600">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-medium">{dateStr}</span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center space-x-1.5 text-emerald-600 font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{timeStr} WIB</span>
              </div>
            </div>

            {/* User Profile / Login status */}
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-semibold text-slate-800 flex items-center justify-end gap-1.5">
                    {currentUser.name}
                  </div>
                  <div className="flex items-center justify-end space-x-1 text-xs">
                    {currentUser.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                        <ShieldCheck className="w-3 h-3" /> Admin System
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                        <UserCheck className="w-3 h-3" /> Guru Wali ({currentUser.nip})
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 hover:border-rose-300 text-xs font-medium transition-all"
                  title="Keluar dari sistem"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
              >
                <UserCog className="w-4 h-4" />
                <span>Login Sistem</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
