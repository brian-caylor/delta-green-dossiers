import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithRedirect,
  signOut as fbSignOut,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase.js";
import { AuthContext } from "../lib/AuthContext.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged always fires once with the current user (null or
    // a User) after Firebase initializes persistence. It also fires after
    // a redirect sign-in completes, so we don't need getRedirectResult
    // separately for the happy path.
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = () => signInWithRedirect(auth, googleProvider);
  const signOut = () => fbSignOut(auth);

  const value = { user, session: user, loading, signInWithGoogle, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
