import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase.js";
import { AuthContext } from "../lib/AuthContext.js";

// If Firebase Auth hasn't told us anything after this long, stop blocking
// the UI. The user will get routed to LoginScreen if no session hydrated,
// so they can at least sign in again.
const AUTH_INIT_TIMEOUT_MS = 6000;

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let resolved = false;
    const resolveOnce = (u) => {
      if (resolved) return;
      resolved = true;
      setUser(u ?? null);
      setLoading(false);
    };

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) console.log("[auth] redirect sign-in complete");
      })
      .catch((err) => console.error("[auth] redirect result error:", err));

    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        console.log("[auth] state changed", { hasUser: !!u });
        resolveOnce(u);
      },
      (err) => {
        console.error("[auth] listener error:", err);
        resolveOnce(null);
      },
    );

    const timeout = setTimeout(() => {
      if (!resolved) {
        console.warn(`[auth] init timed out after ${AUTH_INIT_TIMEOUT_MS}ms; unblocking UI`);
        resolveOnce(null);
      }
    }, AUTH_INIT_TIMEOUT_MS);

    return () => { clearTimeout(timeout); unsub(); };
  }, []);

  const signInWithGoogle = () => signInWithRedirect(auth, googleProvider);
  const signOut = () => fbSignOut(auth);

  const value = { user, session: user, loading, signInWithGoogle, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
