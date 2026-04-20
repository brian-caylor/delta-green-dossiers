import { DEFAULT_DICE_SETTINGS } from "../../hooks/useDiceSettings.js";

const SIZES = [
  { value: "small",  label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large",  label: "Large" },
  { value: "xl",     label: "X-Large" },
];

// Settings subpanel rendered inside the main dice panel when the gear
// icon is clicked. Closes back to the roller via onBack.
export default function DiceSettings({ settings, update, reset, onBack }) {
  return (
    <div className="dice-settings">
      <div className="dice-roller-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            className="btn btn-tiny btn-ghost"
            onClick={onBack}
            title="Back to roller"
          >‹</button>
          <span className="label-lg">DICE SETTINGS</span>
        </div>
      </div>

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
    </div>
  );
}

function isDefault(s) {
  return s.size === DEFAULT_DICE_SETTINGS.size
    && s.colorMode === DEFAULT_DICE_SETTINGS.colorMode
    && s.customColor === DEFAULT_DICE_SETTINGS.customColor
    && s.shadows === DEFAULT_DICE_SETTINGS.shadows;
}
