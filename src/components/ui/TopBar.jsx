import { useAuth } from "../../hooks/useAuth.js";
import ThemeSwitcher from "./ThemeSwitcher";
import DiceButton from "../dice/DiceButton.jsx";

function Crest() {
  return (
    <span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <polygon points="11,2 20,11 11,20 2,11" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <circle cx="11" cy="11" r="3" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function TopBar() {
  const { user, signOut } = useAuth();
  const displayName = user?.displayName || user?.email || "AGENT";
  return (
    <header className="topbar">
      <div className="topbar-crest">
        <Crest />
        DG OPERATIONS
      </div>
      <div className="topbar-right">
        <DiceButton />
        <ThemeSwitcher />
        <span title={user?.email}>{displayName.toUpperCase()}</span>
        <button type="button" className="btn btn-tiny" onClick={signOut} style={{ background: "transparent", color: "var(--paper)", borderColor: "var(--paper)" }}>
          SIGN OUT
        </button>
      </div>
    </header>
  );
}
