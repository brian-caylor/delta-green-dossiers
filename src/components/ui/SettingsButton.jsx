// TopBar trigger for the global Settings modal. Sliders icon —
// deliberately not a gear, so it doesn't get confused with the dice
// panel's ⚙ subpanel toggle.
export default function SettingsButton({ isOpen, onClick }) {
  return (
    <button
      type="button"
      className="btn btn-tiny"
      onClick={onClick}
      title="Settings"
      aria-expanded={isOpen}
      aria-label="Open settings"
      style={{
        background: isOpen ? "var(--paper)" : "transparent",
        color: isOpen ? "var(--ink)" : "var(--paper)",
        borderColor: "var(--paper)",
        padding: "3px 8px",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <line x1="4" y1="7" x2="20" y2="7" />
        <circle cx="10" cy="7" r="2.2" fill="currentColor" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <circle cx="16" cy="12" r="2.2" fill="currentColor" />
        <line x1="4" y1="17" x2="20" y2="17" />
        <circle cx="8" cy="17" r="2.2" fill="currentColor" />
      </svg>
    </button>
  );
}
