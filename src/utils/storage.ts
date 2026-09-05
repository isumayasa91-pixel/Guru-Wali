import { GuruWali, MuridBimbingan, JurnalBimbingan, RekapKehadiran, User, SchoolSettings } from '../types';
import { INITIAL_GURU_WALI, INITIAL_MURID, INITIAL_JURNAL, INITIAL_REKAP, DEFAULT_SCHOOL_SETTINGS } from '../data/initialData';

const KEYS = {
  GURU: 'guru_wali_data_v1',
  MURID: 'murid_bimbingan_data_v1',
  JURNAL: 'jurnal_guru_wali_v1',
  REKAP: 'rekap_kehadiran_v1',
  AUTH: 'guru_wali_current_user_v1',
  SETTINGS: 'guru_wali_school_settings_v1'
};

export const getStoredGuruWali = (): GuruWali[] => {
  try {
    const raw = localStorage.getItem(KEYS.GURU);
    if (!raw) {
      localStorage.setItem(KEYS.GURU, JSON.stringify(INITIAL_GURU_WALI));
      return INITIAL_GURU_WALI;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading guru data', e);
    return INITIAL_GURU_WALI;
  }
};

export const saveStoredGuruWali = (data: GuruWali[]) => {
  try {
    localStorage.setItem(KEYS.GURU, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving guru data', e);
  }
};

export const getStoredMurid = (): MuridBimbingan[] => {
  try {
    const raw = localStorage.getItem(KEYS.MURID);
    if (!raw) {
      localStorage.setItem(KEYS.MURID, JSON.stringify(INITIAL_MURID));
      return INITIAL_MURID;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading murid data', e);
    return INITIAL_MURID;
  }
};

export const saveStoredMurid = (data: MuridBimbingan[]) => {
  try {
    localStorage.setItem(KEYS.MURID, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving murid data', e);
  }
};

export const getStoredJurnal = (): JurnalBimbingan[] => {
  try {
    const raw = localStorage.getItem(KEYS.JURNAL);
    if (!raw) {
      localStorage.setItem(KEYS.JURNAL, JSON.stringify(INITIAL_JURNAL));
      return INITIAL_JURNAL;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading jurnal data', e);
    return INITIAL_JURNAL;
  }
};

export const saveStoredJurnal = (data: JurnalBimbingan[]) => {
  try {
    localStorage.setItem(KEYS.JURNAL, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving jurnal data', e);
  }
};

export const getStoredRekap = (): RekapKehadiran[] => {
  try {
    const raw = localStorage.getItem(KEYS.REKAP);
    if (!raw) {
      localStorage.setItem(KEYS.REKAP, JSON.stringify(INITIAL_REKAP));
      return INITIAL_REKAP;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading rekap data', e);
    return INITIAL_REKAP;
  }
};

export const saveStoredRekap = (data: RekapKehadiran[]) => {
  try {
    localStorage.setItem(KEYS.REKAP, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving rekap data', e);
  }
};

export const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(KEYS.AUTH);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const saveStoredUser = (user: User | null) => {
  try {
    if (!user) {
      localStorage.removeItem(KEYS.AUTH);
    } else {
      localStorage.setItem(KEYS.AUTH, JSON.stringify(user));
    }
  } catch (e) {
    console.error('Error saving user auth', e);
  }
};

export const getStoredSchoolSettings = (): SchoolSettings => {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SCHOOL_SETTINGS));
      return DEFAULT_SCHOOL_SETTINGS;
    }
    return { ...DEFAULT_SCHOOL_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error reading school settings', e);
    return DEFAULT_SCHOOL_SETTINGS;
  }
};

export const saveStoredSchoolSettings = (data: SchoolSettings) => {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving school settings', e);
  }
};

export const resetAllDataToDefault = () => {
  localStorage.setItem(KEYS.GURU, JSON.stringify(INITIAL_GURU_WALI));
  localStorage.setItem(KEYS.MURID, JSON.stringify(INITIAL_MURID));
  localStorage.setItem(KEYS.JURNAL, JSON.stringify(INITIAL_JURNAL));
  localStorage.setItem(KEYS.REKAP, JSON.stringify(INITIAL_REKAP));
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SCHOOL_SETTINGS));
};
