import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  GuruWali,
  MuridBimbingan,
  JurnalBimbingan,
  RekapKehadiran,
  SchoolSettings
} from '../types';
import {
  INITIAL_GURU_WALI,
  INITIAL_MURID,
  INITIAL_JURNAL,
  INITIAL_REKAP,
  DEFAULT_SCHOOL_SETTINGS
} from '../data/initialData';

const COLLECTIONS = {
  GURU: 'guru',
  MURID: 'murid',
  JURNAL: 'jurnal',
  REKAP: 'rekap',
  SETTINGS: 'settings'
};

const SETTINGS_DOC_ID = 'schoolConfig';

// ================= Real-time Listeners ================= //

export const subscribeToGuru = (onData: (data: GuruWali[]) => void) => {
  const colRef = collection(db, COLLECTIONS.GURU);
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list = snapshot.docs.map((d) => d.data() as GuruWali);
      onData(list);
    }
  }, (err) => {
    console.warn('Firestore subscribeToGuru error:', err);
  });
};

export const subscribeToMurid = (onData: (data: MuridBimbingan[]) => void) => {
  const colRef = collection(db, COLLECTIONS.MURID);
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list = snapshot.docs.map((d) => d.data() as MuridBimbingan);
      onData(list);
    }
  }, (err) => {
    console.warn('Firestore subscribeToMurid error:', err);
  });
};

export const subscribeToJurnal = (onData: (data: JurnalBimbingan[]) => void) => {
  const colRef = collection(db, COLLECTIONS.JURNAL);
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list = snapshot.docs.map((d) => d.data() as JurnalBimbingan);
      // Sort by tanggal & waktu desc
      list.sort((a, b) => (b.tanggal + (b.waktu || '')).localeCompare(a.tanggal + (a.waktu || '')));
      onData(list);
    }
  }, (err) => {
    console.warn('Firestore subscribeToJurnal error:', err);
  });
};

export const subscribeToRekap = (onData: (data: RekapKehadiran[]) => void) => {
  const colRef = collection(db, COLLECTIONS.REKAP);
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const list = snapshot.docs.map((d) => d.data() as RekapKehadiran);
      onData(list);
    }
  }, (err) => {
    console.warn('Firestore subscribeToRekap error:', err);
  });
};

export const subscribeToSettings = (onData: (data: SchoolSettings) => void) => {
  const docRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onData({ ...DEFAULT_SCHOOL_SETTINGS, ...docSnap.data() as SchoolSettings });
    }
  }, (err) => {
    console.warn('Firestore subscribeToSettings error:', err);
  });
};

// ================= Seed Initial Data If Cloud Empty ================= //

export const seedInitialFirestoreDataIfEmpty = async () => {
  try {
    const guruSnap = await getDocs(collection(db, COLLECTIONS.GURU));
    if (guruSnap.empty) {
      console.log('Seeding initial data to Firestore cloud...');
      const batch = writeBatch(db);

      INITIAL_GURU_WALI.forEach((g) => {
        batch.set(doc(db, COLLECTIONS.GURU, g.id), g);
      });

      INITIAL_MURID.forEach((m) => {
        batch.set(doc(db, COLLECTIONS.MURID, m.id), m);
      });

      INITIAL_JURNAL.forEach((j) => {
        batch.set(doc(db, COLLECTIONS.JURNAL, j.id), j);
      });

      INITIAL_REKAP.forEach((r) => {
        batch.set(doc(db, COLLECTIONS.REKAP, r.id), r);
      });

      batch.set(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID), DEFAULT_SCHOOL_SETTINGS);

      await batch.commit();
      console.log('Initial data successfully seeded to Firestore cloud!');
    }
  } catch (err) {
    console.warn('Error checking/seeding Firestore:', err);
  }
};

// ================= Guru Operations ================= //

export const syncSaveGuru = async (guru: GuruWali) => {
  try {
    await setDoc(doc(db, COLLECTIONS.GURU, guru.id), guru);
  } catch (err) {
    console.error('Error saving guru to Firestore:', err);
  }
};

export const syncDeleteGuru = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.GURU, id));
  } catch (err) {
    console.error('Error deleting guru from Firestore:', err);
  }
};

export const syncBatchGuru = async (guruList: GuruWali[]) => {
  try {
    const batch = writeBatch(db);
    guruList.forEach((g) => {
      batch.set(doc(db, COLLECTIONS.GURU, g.id), g);
    });
    await batch.commit();
  } catch (err) {
    console.error('Error batch saving guru to Firestore:', err);
  }
};

// ================= Murid Operations ================= //

export const syncSaveMurid = async (murid: MuridBimbingan) => {
  try {
    await setDoc(doc(db, COLLECTIONS.MURID, murid.id), murid);
  } catch (err) {
    console.error('Error saving murid to Firestore:', err);
  }
};

export const syncDeleteMurid = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.MURID, id));
  } catch (err) {
    console.error('Error deleting murid from Firestore:', err);
  }
};

export const syncBatchMurid = async (muridList: MuridBimbingan[]) => {
  try {
    const batch = writeBatch(db);
    muridList.forEach((m) => {
      batch.set(doc(db, COLLECTIONS.MURID, m.id), m);
    });
    await batch.commit();
  } catch (err) {
    console.error('Error batch saving murid to Firestore:', err);
  }
};

// ================= Jurnal Operations ================= //

export const syncSaveJurnal = async (jurnal: JurnalBimbingan) => {
  try {
    await setDoc(doc(db, COLLECTIONS.JURNAL, jurnal.id), jurnal);
  } catch (err) {
    console.error('Error saving jurnal to Firestore:', err);
  }
};

export const syncDeleteJurnal = async (id: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.JURNAL, id));
  } catch (err) {
    console.error('Error deleting jurnal from Firestore:', err);
  }
};

// ================= Rekap Operations ================= //

export const syncBatchRekap = async (rekapList: RekapKehadiran[]) => {
  try {
    const batch = writeBatch(db);
    rekapList.forEach((r) => {
      batch.set(doc(db, COLLECTIONS.REKAP, r.id), r);
    });
    await batch.commit();
  } catch (err) {
    console.error('Error batch saving rekap to Firestore:', err);
  }
};

// ================= School Settings Operations ================= //

export const syncSaveSettings = async (settings: SchoolSettings) => {
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID), settings);
  } catch (err) {
    console.error('Error saving settings to Firestore:', err);
  }
};

// ================= Reset All Data in Cloud ================= //

export const syncResetAllDataToDefault = async () => {
  try {
    const batch = writeBatch(db);

    INITIAL_GURU_WALI.forEach((g) => {
      batch.set(doc(db, COLLECTIONS.GURU, g.id), g);
    });

    INITIAL_MURID.forEach((m) => {
      batch.set(doc(db, COLLECTIONS.MURID, m.id), m);
    });

    INITIAL_JURNAL.forEach((j) => {
      batch.set(doc(db, COLLECTIONS.JURNAL, j.id), j);
    });

    INITIAL_REKAP.forEach((r) => {
      batch.set(doc(db, COLLECTIONS.REKAP, r.id), r);
    });

    batch.set(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID), DEFAULT_SCHOOL_SETTINGS);

    await batch.commit();
  } catch (err) {
    console.error('Error resetting Firestore cloud data:', err);
  }
};
