import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase.js";
import { AuthContext } from "../lib/AuthContext.js";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = () => fbSignOut(auth);

  const value = { user, session: user, loading, signInWithGoogle, signOut };
  return <AuthContext value={value}>{children}</AuthContext>;
}
