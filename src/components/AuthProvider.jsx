import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase.js";
import { AuthContext } from "../lib/AuthContext.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Resolve any pending redirect sign-in from a previous page load before
    // we consider auth state stable. Errors here are surfaced to the console
    // so a broken config doesn't silently block the UI.
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect sign-in failed:", err);
    });
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = () => signInWithRedirect(auth, googleProvider);

  const signOut = () => fbSignOut(auth);

  const value = { user, session: user, loading, signInWithGoogle, signOut };
  return <AuthContext value={value}>{children}</AuthContext>;
}
