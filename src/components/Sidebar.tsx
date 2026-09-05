import React from 'react';
import { User } from '../types';
import { BookOpen, Users, GraduationCap, FileText, CalendarCheck, Shield, Settings, LogOut, LogIn, UserCheck } from 'lucide-react';

export type ActiveTab = 'program' | 'guru' | 'murid' | 'jurnal' | 'rekap' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAdmin: boolean;
  guruCount: number;
  muridCount: number;
  jurnalCount: number;
  currentUser: User | null;
  onLogout: () => void;
  onOpenLoginModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  guruCount,
  muridCount,
  jurnalCount,
  currentUser,
  onLogout,
  onOpenLoginModal
}) => {
  const menuItems = [
    {
      id: 'program' as ActiveTab,
      label: 'Program Kegiatan',
      subtitle: 'Pilar & Bentuk Kegiatan',
      icon: BookOpen,
      badge: '4 Pilar'
    },
    {
      id: 'guru' as ActiveTab,
      label: 'Daftar Guru Wali',
      subtitle: 'Input Manual & Upload Excel',
      icon: Users,
      badge: `${guruCount} Guru`
    },
    {
      id: 'murid' as ActiveTab,
      label: 'Daftar Bimbingan Murid',
      subtitle: 'Identitas & Data Murid',
      icon: GraduationCap,
      badge: `${muridCount} Murid`
    },
    {
      id: 'jurnal' as ActiveTab,
      label: 'Jurnal Guru Wali',
      subtitle: 'Catatan Bimbingan Harian',
      icon: FileText,
      badge: `${jurnalCount} Catatan`
    },
    {
      id: 'rekap' as ActiveTab,
      label: 'Rekap Kehadiran Murid',
      subtitle: 'Sakit, Izin & Tanpa Ket.',
      icon: CalendarCheck,
      badge: 'Bulanan'
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Pengaturan Sekolah',
      subtitle: 'Identitas & Kop Header PDF',
      icon: Settings,
      badge: 'Kop Cetak'
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-[#1E293B] border-r border-slate-800 shrink-0 p-4 flex flex-col justify-between text-white">
      <div className="space-y-6">
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 mb-2">
            Menu Utama
          </h2>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-left transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600 text-white font-medium shadow-xs'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                      }`}
                    />
                    <div>
                      <div className="text-sm leading-tight">{item.label}</div>
                      <div
                        className={`text-[11px] font-normal ${
                          isActive ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User / Session Info Box */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 space-y-2">
          <div className="flex items-center space-x-2 text-slate-100 font-semibold">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Mode: {currentUser ? (isAdmin ? 'Admin Sistem' : `Guru Wali (${currentUser.nip})`) : 'Tamu (Belum Login)'}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            {currentUser
              ? isAdmin
                ? 'Akses Penuh: Kelola Data Guru, Murid, Jurnal, Rekap & Pengaturan.'
                : 'Akses Guru: Pengisian Jurnal & Presensi Murid Bimbingan.'
              : 'Silakan login sebagai Admin atau Guru Wali untuk mengakses semua fitur.'}
          </p>
        </div>
      </div>

      {/* Exit / Logout Action Button in Sidebar */}
      <div className="pt-4 border-t border-slate-800 space-y-2 mt-6">
        {currentUser ? (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-slate-800/60 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 border border-slate-700/60 hover:border-rose-700/60 transition-all group"
            title="Keluar dari sesi akun saat ini"
          >
            <div className="flex items-center space-x-2.5">
              <LogOut className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-semibold">Keluar Aplikasi</div>
                <div className="text-[10px] text-slate-400 group-hover:text-rose-300">Ganti akun atau logout</div>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
              Keluar
            </span>
          </button>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm"
          >
            <div className="flex items-center space-x-2.5">
              <LogIn className="w-4 h-4" />
              <div className="text-left">
                <div className="text-xs font-semibold">Login Sistem</div>
                <div className="text-[10px] text-blue-100">Admin / NIP Guru</div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-700 text-white font-medium">
              Masuk
            </span>
          </button>
        )}

        <div className="text-[11px] text-slate-500 text-center pt-1">
          GuruWali <span className="text-blue-400">v2.5</span> &copy; 2026
        </div>
      </div>
    </aside>
  );
};
