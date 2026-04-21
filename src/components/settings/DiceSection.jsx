import { useDiceRoller } from "../../hooks/useDiceRoller.js";
import DiceControls from "../dice/DiceControls.jsx";

// Dice section mirrors the ⚙ subpanel inside the dice roller. Pulls
// settings through useDiceRoller() rather than calling useDiceSettings()
// directly, because the DiceRollerProvider is the single owner of that
// hook — reading independently would give us a separate state tree.
export default function DiceSection() {
  const { settings, updateSettings, resetSettings } = useDiceRoller();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <DiceControls settings={settings} update={updateSettings} reset={resetSettings} />
      <div className="label" style={{ fontStyle: "italic" }}>
        The ⚙ icon inside the dice panel opens the same controls.
      </div>
    </div>
  );
}
