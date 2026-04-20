import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!envConfig.apiKey || !envConfig.projectId || !envConfig.authDomain || !envConfig.appId) {
  const msg =
    "Missing Firebase env vars. Set VITE_FIREBASE_* in .env.local locally " +
    "(see .env.example) and in Netlify site settings for deploys.";
  if (typeof window !== "undefined") console.error(msg);
  throw new Error(msg);
}

// Override authDomain to the current page origin in the browser so
// signInWithRedirect's cookies and iframe are first-party. The Netlify
// redirects in netlify.toml proxy /__/auth/* and /__/firebase/* through
// to deltagreendossier.firebaseapp.com, so all the Firebase Auth paths
// resolve correctly under this domain.
// Fall back to the env-configured authDomain during SSR / build.
const config = {
  ...envConfig,
  authDomain: typeof window !== "undefined" ? window.location.hostname : envConfig.authDomain,
};

export const app = initializeApp(config);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
