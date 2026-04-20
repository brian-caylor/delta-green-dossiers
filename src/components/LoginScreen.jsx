import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const onSignIn = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e.message || "Sign-in failed. Try again.");
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="paper paper-edge" style={{ maxWidth: 480, width: "100%", padding: "40px 32px 28px" }}>
        <div className="classified-bar" style={{ display: "block", textAlign: "center", marginBottom: 24 }}>
          TOP SECRET // DELTA GREEN // NOFORN
        </div>
        <h1 className="handwritten" style={{ fontSize: 28, letterSpacing: 4, margin: "0 0 4px", textAlign: "center" }}>
          DELTA GREEN OPERATIONS
        </h1>
        <div className="label" style={{ textAlign: "center", marginBottom: 20 }}>AUTHORIZATION REQUIRED</div>
        <hr className="divider-solid" />
        <p style={{ fontSize: 14, lineHeight: 1.5, margin: "0 0 24px", color: "var(--ink-2)" }}>
          Access to this terminal is restricted to authorized personnel.
          Present valid credentials to proceed.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSignIn}
          disabled={busy}
          style={{ width: "100%", justifyContent: "center" }}
        >
          {busy ? "AUTHENTICATING…" : "SIGN IN WITH GOOGLE"}
        </button>
        {error && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "var(--redact-wash)", border: "1px solid var(--redact)", color: "var(--redact)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
            {error}
          </div>
        )}
        <div className="label" style={{ marginTop: 28, textAlign: "center" }}>
          Unauthorized access is a violation of 18 U.S.C. § 1030.
        </div>
      </div>
    </div>
  );
}
