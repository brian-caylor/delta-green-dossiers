import { DEFAULT_DICE_SETTINGS, DICE_STYLES } from "../../hooks/useDiceSettings.js";

const SIZES = [
  { value: "small",  label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large",  label: "Large" },
  { value: "xl",     label: "X-Large" },
];

// Bare dice preference controls — size / style / color / shadows / reset.
// Renders no header so both the dice panel subpanel and the global
// Settings modal can wrap it with their own surrounding chrome.
export default function DiceControls({ settings, update, reset }) {
  return (
    <>
      <div className="dice-section">
        <div className="dice-section-label">Dice Size</div>
        <div className="dice-setting-chiprow">
          {SIZES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={"dice-setting-chip" + (settings.size === value ? " active" : "")}
              onClick={() => update({ size: value })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <hr className="divider" />

      <div className="dice-section">
        <div className="dice-section-label">Dice Style</div>
        <div className="dice-style-list">
          {DICE_STYLES.map(({ value, label, hint }) => (
            <button
              key={value}
              type="button"
              className={"dice-style-row" + (settings.style === value ? " active" : "")}
              onClick={() => update({ style: value })}
            >
              <span className="dice-style-name">{label}</span>
              <span className="dice-style-hint">{hint}</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="divider" />

      <div className="dice-section">
        <div className="dice-section-label">Dice Color</div>
        <label className="dice-setting-radio">
          <input
            type="radio"
            name="diceColorMode"
            checked={settings.colorMode === "palette"}
            onChange={() => update({ colorMode: "palette" })}
          />
          <span>Match UI theme</span>
        </label>
        <label className="dice-setting-radio">
          <input
            type="radio"
            name="diceColorMode"
            checked={settings.colorMode === "custom"}
            onChange={() => update({ colorMode: "custom" })}
          />
          <span>Custom</span>
          <input
            type="color"
            className="dice-color-picker"
            value={settings.customColor}
            onChange={(e) => update({ colorMode: "custom", customColor: e.target.value })}
            aria-label="Custom dice color"
          />
          <span className="label" style={{ fontFamily: "var(--font-mono)" }}>
            {settings.customColor.toUpperCase()}
          </span>
        </label>
      </div>

      <hr className="divider" />

      <div className="dice-section">
        <div className="dice-section-label">Shadows</div>
        <label className="dice-setting-radio">
          <input
            type="checkbox"
            checked={settings.shadows}
            onChange={(e) => update({ shadows: e.target.checked })}
          />
          <span>Enable soft shadows under dice</span>
        </label>
      </div>

      <hr className="divider" />

      <button
        type="button"
        className="btn btn-sm btn-ghost"
        style={{ width: "100%", justifyContent: "center" }}
        onClick={reset}
        disabled={isDefault(settings)}
      >
        Restore defaults
      </button>
    </>
  );
}

function isDefault(s) {
  return s.size === DEFAULT_DICE_SETTINGS.size
    && s.style === DEFAULT_DICE_SETTINGS.style
    && s.colorMode === DEFAULT_DICE_SETTINGS.colorMode
    && s.customColor === DEFAULT_DICE_SETTINGS.customColor
    && s.shadows === DEFAULT_DICE_SETTINGS.shadows;
}
