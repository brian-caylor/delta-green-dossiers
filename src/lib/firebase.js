import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Fail fast if the critical pieces are missing — the app can't do anything
// without Auth + Firestore pointed at a real project.
if (!config.apiKey || !config.projectId || !config.authDomain || !config.appId) {
  const msg =
    "Missing Firebase env vars. Set VITE_FIREBASE_* in .env.local locally " +
    "(see .env.example) and in Netlify site settings for deploys.";
  if (typeof window !== "undefined") console.error(msg);
  throw new Error(msg);
}

export const app = initializeApp(config);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore with persistent IndexedDB cache: reads are served from cache
// when offline; our own readOnly gate (in useCharacters) prevents writes
// while offline so the user doesn't get confused by silent write queueing.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
