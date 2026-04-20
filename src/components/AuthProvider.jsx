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
    // CRITICAL: when using signInWithRedirect, Firebase parks the pending
    // auth state in IndexedDB before navigating to Google. On the way back,
    // we must call getRedirectResult to finalize the sign-in — otherwise
    // the page reloads, sees no session, and renders LoginScreen again.
    // getRedirectResult also triggers onAuthStateChanged with the new user.
    getRedirectResult(auth).catch((err) => {
      console.error("Redirect sign-in did not complete:", err);
    });

    const unsub = onAuthStateChanged(
      auth,
      (u) => { setUser(u ?? null); setLoading(false); },
      (err) => { console.error("Auth listener error:", err); setLoading(false); },
    );
    return unsub;
  }, []);

  const signInWithGoogle = () => signInWithRedirect(auth, googleProvider);
  const signOut = () => fbSignOut(auth);

  const value = { user, session: user, loading, signInWithGoogle, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
