import { useDiceRoller } from "../../hooks/useDiceRoller.js";

// Renders a result card centred on the viewport while a roll is active.
// The underlying 3D canvas is rendered separately by DiceRollerProvider
// into #dice-box-root; this component layers the numeric readout and the
// d100 pass/fail tone on top, and captures click-anywhere to dismiss.
export default function DiceOverlay() {
  const { activeRoll } = useDiceRoller();
  if (!activeRoll) return null;

  const { formula, total, perGroup, modifier, d100 } = activeRoll;

  // Delta Green d100 tone — matches SkillsTab's DiceButton palette.
  let tone = null;
  if (d100) {
    if (d100.isCritical) tone = { label: "CRITICAL", color: "var(--stamp-blue)" };
    else if (d100.isFumble) tone = { label: "FUMBLE", color: "var(--redact)" };
    else if (d100.pass) tone = { label: "PASS", color: "var(--ok)" };
    else tone = { label: "FAIL", color: "var(--redact)" };
  }

  const rollDetail = perGroup
    .map((g) => g.rolls.join(", "))
    .join(" / ") + (modifier ? (modifier > 0 ? ` +${modifier}` : ` ${modifier}`) : "");

  return (
    <div className="dice-overlay-result" role="presentation">
      <div className="dice-overlay-card">
        <div className="label" style={{ marginBottom: 4 }}>{formula}</div>
        <div className="dice-overlay-total">{total}</div>
        {perGroup[0]?.rolls?.length > 1 || modifier !== 0 ? (
          <div className="label" style={{ marginTop: 4 }}>{rollDetail}</div>
        ) : null}
        {d100 && tone && (
          <div className="dice-overlay-tone" style={{ color: tone.color, borderColor: tone.color }}>
            {tone.label}
          </div>
        )}
        {d100 && (
          <div className="label" style={{ marginTop: 6 }}>
            vs {d100.target}%
          </div>
        )}
      </div>
    </div>
  );
}
