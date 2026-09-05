import React, { useState, useEffect } from 'react';
import {
  GuruWali,
  MuridBimbingan,
  JurnalBimbingan,
  RekapKehadiran,
  User,
  SchoolSettings
} from './types';
import {
  getStoredGuruWali,
  saveStoredGuruWali,
  getStoredMurid,
  saveStoredMurid,
  getStoredJurnal,
  saveStoredJurnal,
  getStoredRekap,
  saveStoredRekap,
  getStoredUser,
  saveStoredUser,
  getStoredSchoolSettings,
  saveStoredSchoolSettings,
  resetAllDataToDefault
} from './utils/storage';
import {
  subscribeToGuru,
  subscribeToMurid,
  subscribeToJurnal,
  subscribeToRekap,
  subscribeToSettings,
  syncSaveGuru,
  syncDeleteGuru,
  syncBatchGuru,
  syncSaveMurid,
  syncDeleteMurid,
  syncBatchMurid,
  syncSaveJurnal,
  syncDeleteJurnal,
  syncBatchRekap,
  syncSaveSettings,
  seedInitialFirestoreDataIfEmpty,
  syncResetAllDataToDefault
} from './utils/firestoreService';

import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';

import { DashboardView } from './components/DashboardView';
import { ProgramKegiatanView } from './components/ProgramKegiatanView';
import { DaftarGuruView } from './components/DaftarGuruView';
import { DaftarMuridView } from './components/DaftarMuridView';
import { JurnalBimbinganView } from './components/JurnalBimbinganView';
import { RekapKehadiranView } from './components/RekapKehadiranView';
import { PengaturanView } from './components/PengaturanView';

import { RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';

export default function App() {
  // Application Data States - Require login upon opening
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());

  const [guruList, setGuruList] = useState<GuruWali[]>(() => getStoredGuruWali());
  const [muridList, setMuridList] = useState<MuridBimbingan[]>(() => getStoredMurid());
  const [jurnalList, setJurnalList] = useState<JurnalBimbingan[]>(() => getStoredJurnal());
  const [rekapList, setRekapList] = useState<RekapKehadiran[]>(() => getStoredRekap());
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => getStoredSchoolSettings());
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  // UI States
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [logoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize Cloud Firestore & Realtime Listeners
  useEffect(() => {
    // Seed initial data if cloud database is empty
    seedInitialFirestoreDataIfEmpty();

    // Attach real-time Firestore listeners for multi-device sync
    const unsubGuru = subscribeToGuru((cloudGuru) => {
      setGuruList(cloudGuru);
      saveStoredGuruWali(cloudGuru);
    });

    const unsubMurid = subscribeToMurid((cloudMurid) => {
      setMuridList(cloudMurid);
      saveStoredMurid(cloudMurid);
    });

    const unsubJurnal = subscribeToJurnal((cloudJurnal) => {
      setJurnalList(cloudJurnal);
      saveStoredJurnal(cloudJurnal);
    });

    const unsubRekap = subscribeToRekap((cloudRekap) => {
      setRekapList(cloudRekap);
      saveStoredRekap(cloudRekap);
    });

    const unsubSettings = subscribeToSettings((cloudSettings) => {
      setSchoolSettings(cloudSettings);
      saveStoredSchoolSettings(cloudSettings);
    });

    return () => {
      unsubGuru();
      unsubMurid();
      unsubJurnal();
      unsubRekap();
      unsubSettings();
    };
  }, []);

  // Trigger brief visual sync indicator
  const triggerSyncIndicator = () => {
    setIsCloudSyncing(true);
    setTimeout(() => setIsCloudSyncing(false), 800);
  };

  // Toast Helper
  const showToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    saveStoredUser(user);
    localStorage.removeItem('guru_wali_logged_out_flag');
    showToast('Login Berhasil', `Selamat datang, ${user.name}!`, 'success');
  };

  const handlePromptLogout = () => {
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setCurrentUser(null);
    saveStoredUser(null);
    showToast('Logout Berhasil', 'Anda telah keluar dari sesi akun.', 'info');
  };

  // Guru Wali CRUD
  const handleSaveGuru = (guru: GuruWali) => {
    const exists = guruList.some((g) => g.id === guru.id);
    let updated: GuruWali[];
    if (exists) {
      updated = guruList.map((g) => (g.id === guru.id ? guru : g));
    } else {
      updated = [guru, ...guruList];
    }
    setGuruList(updated);
    saveStoredGuruWali(updated);
    triggerSyncIndicator();
    syncSaveGuru(guru);
  };

  const handleDeleteGuru = (id: string) => {
    const updated = guruList.filter((g) => g.id !== id);
    setGuruList(updated);
    saveStoredGuruWali(updated);
    triggerSyncIndicator();
    syncDeleteGuru(id);
  };

  const handleImportGuru = (imported: GuruWali[]) => {
    const updated = [...imported, ...guruList];
    setGuruList(updated);
    saveStoredGuruWali(updated);
    triggerSyncIndicator();
    syncBatchGuru(imported);
  };

  // Murid Bimbingan CRUD
  const handleSaveMurid = (murid: MuridBimbingan) => {
    const exists = muridList.some((m) => m.id === murid.id);
    let updated: MuridBimbingan[];
    if (exists) {
      updated = muridList.map((m) => (m.id === murid.id ? murid : m));
    } else {
      updated = [murid, ...muridList];
    }
    setMuridList(updated);
    saveStoredMurid(updated);
    triggerSyncIndicator();
    syncSaveMurid(murid);
  };

  const handleDeleteMurid = (id: string) => {
    const updated = muridList.filter((m) => m.id !== id);
    setMuridList(updated);
    saveStoredMurid(updated);
    triggerSyncIndicator();
    syncDeleteMurid(id);
  };

  const handleImportMurid = (imported: MuridBimbingan[]) => {
    const updated = [...imported, ...muridList];
    setMuridList(updated);
    saveStoredMurid(updated);
    triggerSyncIndicator();
    syncBatchMurid(imported);
  };

  // Jurnal Bimbingan CRUD
  const handleSaveJurnal = (jurnal: JurnalBimbingan) => {
    const exists = jurnalList.some((j) => j.id === jurnal.id);
    let updated: JurnalBimbingan[];
    if (exists) {
      updated = jurnalList.map((j) => (j.id === jurnal.id ? jurnal : j));
    } else {
      updated = [jurnal, ...jurnalList];
    }
    setJurnalList(updated);
    saveStoredJurnal(updated);
    triggerSyncIndicator();
    syncSaveJurnal(jurnal);
  };

  const handleDeleteJurnal = (id: string) => {
    const updated = jurnalList.filter((g) => g.id !== id);
    setJurnalList(updated);
    saveStoredJurnal(updated);
    triggerSyncIndicator();
    syncDeleteJurnal(id);
  };

  // Rekap Kehadiran Batch Save
  const handleSaveRekapBatch = (records: RekapKehadiran[]) => {
    const map = new Map<string, RekapKehadiran>();
    rekapList.forEach((r) => map.set(r.id, r));
    records.forEach((r) => map.set(r.id, r));

    const updated = Array.from(map.values());
    setRekapList(updated);
    saveStoredRekap(updated);
    triggerSyncIndicator();
    syncBatchRekap(records);
  };

  const handleSaveSettings = (newSettings: SchoolSettings) => {
    setSchoolSettings(newSettings);
    saveStoredSchoolSettings(newSettings);
    triggerSyncIndicator();
    syncSaveSettings(newSettings);
  };

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh data ke sampel awal?')) {
      resetAllDataToDefault();
      setGuruList(getStoredGuruWali());
      setMuridList(getStoredMurid());
      setJurnalList(getStoredJurnal());
      setRekapList(getStoredRekap());
      setSchoolSettings(getStoredSchoolSettings());
      triggerSyncIndicator();
      syncResetAllDataToDefault();
      showToast('Reset Data', 'Seluruh data telah dikembalikan ke sampel awal.', 'info');
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  // If user is not logged in, show ONLY the Login Screen (no guest/view mode)
  if (!currentUser) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          guruList={guruList}
          schoolSettings={schoolSettings}
        />
        <NotificationToast toasts={toasts} onDismiss={handleDismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handlePromptLogout}
        onOpenLoginModal={() => {}}
        isCloudSyncing={isCloudSyncing}
        schoolSettings={schoolSettings}
      />

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        {/* Sidebar Menu */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdmin={isAdmin}
          guruCount={guruList.length}
          muridCount={muridList.length}
          jurnalCount={jurnalList.length}
          currentUser={currentUser}
          onLogout={handlePromptLogout}
          onOpenLoginModal={() => {}}
        />

        {/* Dynamic Content Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              guruList={guruList}
              muridList={muridList}
              jurnalList={jurnalList}
              rekapList={rekapList}
              schoolSettings={schoolSettings}
              currentUser={currentUser}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'program' && <ProgramKegiatanView />}

          {activeTab === 'guru' && (
            <DaftarGuruView
              guruList={guruList}
              onSaveGuru={handleSaveGuru}
              onDeleteGuru={handleDeleteGuru}
              onImportGuru={handleImportGuru}
              showToast={showToast}
            />
          )}

          {activeTab === 'murid' && (
            <DaftarMuridView
              muridList={muridList}
              guruList={guruList}
              currentUser={currentUser}
              onSaveMurid={handleSaveMurid}
              onDeleteMurid={handleDeleteMurid}
              onImportMurid={handleImportMurid}
              showToast={showToast}
            />
          )}

          {activeTab === 'jurnal' && (
            <JurnalBimbinganView
              jurnalList={jurnalList}
              muridList={muridList}
              currentUser={currentUser}
              onSaveJurnal={handleSaveJurnal}
              onDeleteJurnal={handleDeleteJurnal}
              showToast={showToast}
            />
          )}

          {activeTab === 'rekap' && (
            <RekapKehadiranView
              rekapList={rekapList}
              muridList={muridList}
              currentUser={currentUser}
              onSaveRekapBatch={handleSaveRekapBatch}
              showToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <PengaturanView
              settings={schoolSettings}
              onSaveSettings={handleSaveSettings}
              showToast={showToast}
              isAdmin={isAdmin}
            />
          )}

          {/* Bottom Data Tools & Reset */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Aplikasi Guru Wali • Pendampingan Academic & Character Development</span>
            </div>

            <button
              onClick={handleResetData}
              className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 transition-colors"
              title="Reset data ke nilai sampel awal"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data Sampel</span>
            </button>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
        currentUser={currentUser}
      />

      {/* Toast Notifications */}
      <NotificationToast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
