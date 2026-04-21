import { useAuth } from "../../hooks/useAuth.js";

// Account section. Displays the signed-in identity and mirrors the
// TopBar Sign Out control. Sign Out in the TopBar stays as-is — this
// is a second entry point, per the v1 decision to keep familiar
// controls in place while consolidating in Settings.
//
// [FWD-COMPAT] Manage campaigns / invitations / handler-mode toggles
// will grow out of this section once the Handler/Campaign feature
// lands. No shape changes required to the modal shell.
export default function AccountSection({ onAfterSignOut }) {
  const { user, signOut } = useAuth();

  const displayName = user?.displayName || user?.email || "AGENT";
  const initial = (user?.displayName || user?.email || "A").trim().charAt(0).toUpperCase();

  const handleSignOut = () => {
    if (onAfterSignOut) onAfterSignOut();
    signOut();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="sheet-box" style={{ padding: "16px 18px" }}>
        <div className="sheet-box-title">Signed in</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="settings-avatar" aria-hidden="true">{initial}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "var(--ink)", letterSpacing: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </div>
            {user?.email && user?.displayName && (
              <div className="label" style={{ textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-mono)" }}>
                {user.email}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <button
          type="button"
          className="btn btn-danger"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={handleSignOut}
        >
          Sign out
        </button>
        <div className="label" style={{ marginTop: 8, fontStyle: "italic" }}>
          Your agents stay in the cloud. Signing back in on any device retrieves the same roster.
        </div>
      </div>
    </div>
  );
}
