import { useTheme } from "../../hooks/useTheme.jsx";

const THEME_META = {
  manila: { label: "MANILA", hint: "Field dossier default — warm paper tones" },
  bone: { label: "BONE", hint: "Lightest paper — print-friendly" },
  greenscreen: { label: "FIELD", hint: "Greenscreen retro terminal" },
};

// Appearance section — mirrors the TopBar segmented control, adds
// per-option descriptions. Both surfaces call the same useTheme hook,
// so switching in either place updates the other live.
export default function AppearanceSection() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="dice-section-label">Palette</div>
      <div className="dice-style-list">
        {themes.map((t) => {
          const meta = THEME_META[t] || { label: t.toUpperCase(), hint: "" };
          return (
            <button
              key={t}
              type="button"
              className={"dice-style-row" + (t === theme ? " active" : "")}
              onClick={() => setTheme(t)}
            >
              <span className="dice-style-name">{meta.label}</span>
              <span className="dice-style-hint">{meta.hint}</span>
            </button>
          );
        })}
      </div>
      <div className="label" style={{ fontStyle: "italic" }}>
        Theme persists per device. The TopBar switcher stays in sync.
      </div>
    </div>
  );
}
