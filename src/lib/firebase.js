import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

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
// In-memory Firestore cache for now. We can re-enable IndexedDB persistence
// once the auth/load flow is fully verified — persistent cache was stalling
// the initial render in some environments.
export const db = getFirestore(app);
