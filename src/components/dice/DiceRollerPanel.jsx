import { useEffect, useRef, useState } from "react";
import { useDiceRoller } from "../../hooks/useDiceRoller.js";
import { parseFormula } from "../../utils/diceRoller.js";

const QUICK_DICE = [
  { sides: 4 },
  { sides: 6 },
  { sides: 8 },
  { sides: 10 },
  { sides: 12 },
  { sides: 20 },
  { sides: 100 }, // default
];

// Slide-in panel anchored below the TopBar, top-right. Hosts the dice
// picker, formula input, optional d100 target%, roll button, and a
// session-local history of the last 10 rolls.
export default function DiceRollerPanel() {
  const { isOpen, close, roll, history, clearHistory } = useDiceRoller();
  const [formula, setFormula] = useState("d100");
  const [target, setTarget] = useState("");
  const panelRef = useRef(null);

  // Close on outside click.
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e) => {
      if (!panelRef.current) return;
      if (panelRef.current.contains(e.target)) return;
      // Ignore clicks on the dice button itself (the toggle handles it).
      const diceBtn = document.querySelector("[data-dice-toggle]");
      if (diceBtn && diceBtn.contains(e.target)) return;
      close();
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  const parsed = parseFormula(formula);
  const isValid = !!parsed;
  const isSingleD100 = parsed
    && parsed.groups.length === 1
    && parsed.groups[0].count === 1
    && parsed.groups[0].sides === 100
    && parsed.modifier === 0;

  const onRoll = () => {
    if (!isValid) return;
    const opts = isSingleD100 && target !== "" ? { target: Number(target) } : {};
    roll(formula, opts);
  };

  const onPick = (sides) => {
    setFormula(`d${sides}`);
    if (sides !== 100) setTarget("");
  };

  return (
    <div ref={panelRef} className="dice-roller-panel" role="dialog" aria-label="Dice roller">
      <div className="dice-roller-header">
        <span className="label-lg">FIELD DICE</span>
        <button type="button" className="btn btn-tiny btn-ghost" onClick={close}>✕</button>
      </div>

      <div className="dice-picker-row">
        {QUICK_DICE.map(({ sides }) => (
          <button
            key={sides}
            type="button"
            className={"dice-face-button" + (formula.replace(/\s+/g, "").toLowerCase() === `d${sides}` ? " active" : "")}
            onClick={() => onPick(sides)}
          >
            d{sides}
          </button>
        ))}
      </div>

      <div className="field" style={{ marginTop: 10 }}>
        <label className="label">Formula</label>
        <input
          type="text"
          className="field-line"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          placeholder="e.g. 2d6+3"
          spellCheck={false}
          style={{ fontFamily: "var(--font-mono)" }}
          onKeyDown={(e) => { if (e.key === "Enter" && isValid) onRoll(); }}
        />
        {!isValid && formula.trim() && (
          <span className="label" style={{ color: "var(--redact)" }}>Invalid formula</span>
        )}
      </div>

      {isSingleD100 && (
        <div className="field" style={{ marginTop: 10 }}>
          <label className="label">Target % (optional)</label>
          <input
            type="number"
            className="field-num"
            value={target}
            min={0}
            max={100}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="—"
            style={{ width: 80 }}
          />
        </div>
      )}

      <div className="row" style={{ marginTop: 14, justifyContent: "space-between" }}>
        <button type="button" className="btn btn-primary" disabled={!isValid} onClick={onRoll}>ROLL</button>
        <button type="button" className="btn btn-tiny btn-ghost" onClick={clearHistory} disabled={history.length === 0}>
          Clear history
        </button>
      </div>

      <hr className="divider" />

      <div className="dice-history">
        {history.length === 0 ? (
          <div className="label" style={{ fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>
            No rolls yet this session.
          </div>
        ) : (
          history.map((h) => <HistoryRow key={h.id} entry={h} />)
        )}
      </div>
    </div>
  );
}

function HistoryRow({ entry }) {
  const { formula, total, perGroup, modifier, d100 } = entry;
  let tag = null;
  let tagColor = null;
  if (d100) {
    if (d100.isCritical) { tag = "CRIT";  tagColor = "var(--stamp-blue)"; }
    else if (d100.isFumble) { tag = "FUMB";  tagColor = "var(--redact)"; }
    else if (d100.pass) { tag = "PASS";  tagColor = "var(--ok)"; }
    else { tag = "FAIL";  tagColor = "var(--redact)"; }
  }
  const detail = perGroup.map((g) => g.rolls.join(",")).join("/")
    + (modifier ? (modifier > 0 ? ` +${modifier}` : ` ${modifier}`) : "");

  return (
    <div className="dice-history-row">
      <span className="dice-history-formula">{formula}</span>
      <span className="dice-history-total">{total}</span>
      <span className="label dice-history-detail">({detail}{d100 ? ` vs ${d100.target}` : ""})</span>
      {tag && (
        <span className="dice-history-tag" style={{ color: tagColor, borderColor: tagColor }}>{tag}</span>
      )}
    </div>
  );
}
