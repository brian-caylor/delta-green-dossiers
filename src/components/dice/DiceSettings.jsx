import DiceControls from "./DiceControls.jsx";

// Settings subpanel rendered inside the main dice panel when the gear
// icon is clicked. Closes back to the roller via onBack. The actual
// controls live in DiceControls so the global Settings modal can reuse
// them.
export default function DiceSettings({ settings, update, reset, onBack }) {
  return (
    <div className="dice-settings">
      <div className="dice-roller-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            className="dice-icon-button"
            onClick={onBack}
            title="Back to roller"
            aria-label="Back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="label-lg">DICE SETTINGS</span>
        </div>
      </div>

      <DiceControls settings={settings} update={update} reset={reset} />
    </div>
  );
}
