import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Default configuration for seamless online deployment on Vercel
const DEFAULT_CONFIG = {
  projectId: "gen-lang-client-0131415670",
  appId: "1:88190261726:web:a96a7c59416932f81f654f",
  apiKey: "AIzaSyAeTjYNIRKd8bdr7ynWOBkHeqxGplzKGHY",
  authDomain: "gen-lang-client-0131415670.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-aplikasiguruwali-9bf7957c-b91e-49ed-a770-b09edb115dfa",
  storageBucket: "gen-lang-client-0131415670.firebasestorage.app",
  messagingSenderId: "88190261726"
};

// Support both embedded configuration and custom Vercel Environment Variables
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_CONFIG.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_CONFIG.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_CONFIG.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || DEFAULT_CONFIG.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_CONFIG.messagingSenderId
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export default app;
