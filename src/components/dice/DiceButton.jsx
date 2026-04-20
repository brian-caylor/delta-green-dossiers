import { useDiceRoller } from "../../hooks/useDiceRoller.js";

// TopBar trigger for the global roller. Rendered inside DossierApp only,
// so it's automatically hidden on LoginScreen / Roster / Wizard.
export default function DiceButton() {
  const { isOpen, toggle } = useDiceRoller();
  return (
    <button
      type="button"
      data-dice-toggle
      className="btn btn-tiny"
      onClick={toggle}
      title="Dice roller"
      aria-expanded={isOpen}
      style={{
        background: isOpen ? "var(--paper)" : "transparent",
        color: isOpen ? "var(--ink)" : "var(--paper)",
        borderColor: "var(--paper)",
        padding: "4px 10px",
        fontSize: 14,
        letterSpacing: 0,
      }}
    >
      ⚄
    </button>
  );
}
