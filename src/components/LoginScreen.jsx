import { useState } from "react";
import { useAuth } from "../hooks/useAuth.js";

const s = {
  screen: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#1A1D16",
    padding: 16,
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
  },
  card: {
    maxWidth: 480,
    width: "100%",
    padding: "40px 32px 28px",
    background: "#e8e0cf",
    color: "#1a1712",
    border: "1px solid rgba(26,23,18,0.25)",
    boxShadow: "0 20px 40px -20px rgba(0,0,0,0.6)",
  },
  bar: {
    background: "#8c1d1d",
    color: "#fff",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 11,
    letterSpacing: 3,
    textAlign: "center",
    padding: "6px 8px",
    marginBottom: 24,
  },
  title: {
    fontFamily: "'Special Elite', serif",
    fontSize: 28,
    letterSpacing: 4,
    margin: "0 0 4px",
    textAlign: "center",
  },
  sub: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    letterSpacing: 3,
    textAlign: "center",
    color: "#6b6254",
    marginBottom: 20,
  },
  divider: {
    height: 1,
    background: "rgba(26,23,18,0.35)",
    margin: "16px 0",
  },
  body: {
    fontSize: 14,
    lineHeight: 1.5,
    margin: "0 0 24px",
    color: "#3a332a",
  },
  btn: {
    width: "100%",
    padding: "12px 16px",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 13,
    letterSpacing: 2,
    background: "#1a1712",
    color: "#e8e0cf",
    border: "1px solid #1a1712",
    cursor: "pointer",
  },
  btnDisabled: { opacity: 0.5, cursor: "wait" },
  error: {
    marginTop: 12,
    padding: "8px 12px",
    background: "rgba(140,29,29,0.08)",
    border: "1px solid #8c1d1d",
    color: "#8c1d1d",
    fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  footer: {
    marginTop: 28,
    fontSize: 10,
    letterSpacing: 1,
    color: "#8a8070",
    fontFamily: "'IBM Plex Mono', monospace",
    textAlign: "center",
  },
};

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
    <div style={s.screen}>
      <div style={s.card}>
        <div style={s.bar}>TOP SECRET // DELTA GREEN // NOFORN</div>
        <h1 style={s.title}>DELTA GREEN OPERATIONS</h1>
        <div style={s.sub}>AUTHORIZATION REQUIRED</div>
        <div style={s.divider} />
        <p style={s.body}>
          Access to this terminal is restricted to authorized personnel.
          Present valid credentials to proceed.
        </p>
        <button
          style={{ ...s.btn, ...(busy ? s.btnDisabled : {}) }}
          onClick={onSignIn}
          disabled={busy}
        >
          {busy ? "AUTHENTICATING…" : "SIGN IN WITH GOOGLE"}
        </button>
        {error && <div style={s.error}>{error}</div>}
        <div style={s.footer}>
          Unauthorized access is a violation of 18 U.S.C. § 1030.
        </div>
      </div>
    </div>
  );
}
