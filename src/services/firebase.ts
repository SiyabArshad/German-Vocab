import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCSEna6_YHeJ2yOxe2ghhT3B2-b_o9zloQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "germanlang-4ed6a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "germanlang-4ed6a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "germanlang-4ed6a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1071284961771",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1071284961771:web:7b43877bfc6d7b4bb399ae",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1E48S51DK3"
};

// Initialize Firebase only once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics support check (safe for SSR / testing / environments without window)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Ignore analytics init error in non-supported environments
  });
}

export default app;
