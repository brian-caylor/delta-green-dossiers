import { useDiceRoller } from "../../hooks/useDiceRoller.js";

// TopBar trigger for the global roller. Rendered inside DossierApp only,
// so it's automatically hidden on LoginScreen / Roster / Wizard.
export default function DiceButton() {
  const { isOpen, toggle } = useDiceRoller();
  const active = isOpen;
  return (
    <button
      type="button"
      data-dice-toggle
      className="btn btn-tiny"
      onClick={toggle}
      title="Dice roller"
      aria-expanded={isOpen}
      aria-label="Dice roller"
      style={{
        background: active ? "var(--paper)" : "transparent",
        color: active ? "var(--ink)" : "var(--paper)",
        borderColor: "var(--paper)",
        padding: "3px 6px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="8"  cy="8"  r="1.6" fill="currentColor" stroke="none" />
        <circle cx="16" cy="8"  r="1.6" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="8"  cy="16" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="16" cy="16" r="1.6" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );
}
