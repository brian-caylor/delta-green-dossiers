import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase.js";
import { AuthContext } from "../lib/AuthContext.js";

// Safety net: if Firebase Auth hasn't told us anything in this long, stop
// blocking the UI. Better to surface the login screen than to hang forever.
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

    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        console.log("[auth] state changed", { hasUser: !!u, uid: u?.uid });
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

  // Popup flow. The COOP warnings seen in console (about window.closed) are
  // cosmetic in modern Firebase SDK: the popup still completes, auth state
  // lands in IndexedDB, and onAuthStateChanged fires with the new user.
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") {
        return; // user cancelled; don't surface as error
      }
      throw err;
    }
  };

  const signOut = () => fbSignOut(auth);

  const value = { user, session: user, loading, signInWithGoogle, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
