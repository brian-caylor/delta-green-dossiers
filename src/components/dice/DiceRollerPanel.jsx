import { useEffect, useRef, useState } from "react";
import { useDiceRoller } from "../../hooks/useDiceRoller.js";
import { DieIcon } from "./DiceIcons.jsx";

const DIE_SIDES = [4, 6, 8, 10, 12, 20, 100];

// Roll20-inspired roller panel, adapted to our manila aesthetic.
//
// BASIC ROLL: click a die icon to immediately roll 1dX. Fast path for
//             one-off checks, damage rolls, stat generation.
// ADVANCED ROLL: set count + die type + modifier + optional d100 target
//                before committing with the ROLL button. Fast path for
//                skill checks and multi-die rolls.
// Recent history: last 10 rolls this session.
export default function DiceRollerPanel() {
  const { isOpen, close, roll, history, clearHistory } = useDiceRoller();

  // Advanced-roll state
  const [count, setCount] = useState(1);
  const [sides, setSides] = useState(100);
  const [modifier, setModifier] = useState(0);
  const [useTarget, setUseTarget] = useState(false);
  const [target, setTarget] = useState("");

  const panelRef = useRef(null);

  // Close on outside click.
  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e) => {
      if (!panelRef.current) return;
      if (panelRef.current.contains(e.target)) return;
      const diceBtn = document.querySelector("[data-dice-toggle]");
      if (diceBtn && diceBtn.contains(e.target)) return;
      close();
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  const isSingleD100 = count === 1 && sides === 100 && modifier === 0;
  const targetActive = isSingleD100 && useTarget && target !== "";
  const advancedFormula = buildFormula(count, sides, modifier);

  const rollBasic = (s) => {
    roll(`d${s}`);
  };

  const rollAdvanced = () => {
    const opts = targetActive ? { target: Number(target) } : {};
    roll(advancedFormula, opts);
  };

  return (
    <div ref={panelRef} className="dice-roller-panel" role="dialog" aria-label="Dice roller">
      <div className="dice-roller-header">
        <span className="label-lg">FIELD DICE</span>
        <button type="button" className="btn btn-tiny btn-ghost" onClick={close}>✕</button>
      </div>

      {/* ── Basic Roll ────────────────────────────────────────── */}
      <div className="dice-section">
        <div className="dice-section-label">Basic Roll</div>
        <div className="dice-basic-grid">
          {DIE_SIDES.map((s) => (
            <button
              key={s}
              type="button"
              className="dice-basic-tile"
              title={`Roll 1d${s}`}
              onClick={() => rollBasic(s)}
            >
              <DieIcon sides={s} size={34} />
              <span className="dice-basic-label">d{s}</span>
            </button>
          ))}
        </div>
      </div>

      <hr className="divider" />

      {/* ── Advanced Roll ─────────────────────────────────────── */}
      <div className="dice-section">
        <div className="dice-section-label">Advanced Roll</div>

        <div className="dice-advanced-row">
          <NumberField
            label="COUNT"
            value={count}
            onChange={(v) => setCount(clamp(v, 1, 50))}
            min={1}
            max={50}
          />
          <span className="dice-advanced-op">×</span>
          <SelectField
            label="DIE"
            value={sides}
            onChange={(v) => setSides(Number(v))}
            options={DIE_SIDES.map((s) => ({ value: s, label: `d${s}` }))}
          />
          <span className="dice-advanced-op">{modifier >= 0 ? "+" : "−"}</span>
          <NumberField
            label="MOD"
            value={Math.abs(modifier)}
            onChange={(v) => setModifier(modifier < 0 ? -Math.abs(v) : Math.abs(v))}
            min={0}
            max={99}
          />
          <button
            type="button"
            className="dice-sign-toggle"
            onClick={() => setModifier(-modifier)}
            title="Toggle modifier sign"
          >
            {modifier < 0 ? "−" : "+"}
          </button>
        </div>

        <div className="dice-advanced-formula">{advancedFormula}</div>

        {isSingleD100 && (
          <label className="dice-target-toggle">
            <input
              type="checkbox"
              checked={useTarget}
              onChange={(e) => setUseTarget(e.target.checked)}
            />
            <span className="label">Target Number</span>
            <input
              type="number"
              className="field-num"
              value={target}
              min={0}
              max={100}
              disabled={!useTarget}
              onChange={(e) => setTarget(e.target.value)}
              style={{ width: 60, opacity: useTarget ? 1 : 0.4 }}
            />
          </label>
        )}

        <button
          type="button"
          className="btn btn-primary dice-roll-button"
          onClick={rollAdvanced}
        >
          ROLL
        </button>
      </div>

      <hr className="divider" />

      {/* ── History ────────────────────────────────────────────── */}
      <div className="dice-section">
        <div className="dice-section-header">
          <span className="dice-section-label" style={{ margin: 0 }}>Recent rolls</span>
          <button
            type="button"
            className="btn btn-tiny btn-ghost"
            onClick={clearHistory}
            disabled={history.length === 0}
          >
            Clear
          </button>
        </div>
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
    </div>
  );
}

function HistoryRow({ entry }) {
  const { formula, total, perGroup, modifier, d100 } = entry;
  let tag = null;
  let tagColor = null;
  if (d100) {
    if (d100.isCritical) { tag = "CRIT"; tagColor = "var(--stamp-blue)"; }
    else if (d100.isFumble) { tag = "FUMB"; tagColor = "var(--redact)"; }
    else if (d100.pass) { tag = "PASS"; tagColor = "var(--ok)"; }
    else { tag = "FAIL"; tagColor = "var(--redact)"; }
  }
  const detail = perGroup.map((g) => g.rolls.join(",")).join("/")
    + (modifier ? (modifier > 0 ? ` +${modifier}` : ` ${modifier}`) : "");

  return (
    <div className="dice-history-row">
      <span className="dice-history-formula">{formula}</span>
      <span className="dice-history-total">{total}</span>
      <span className="label dice-history-detail">
        ({detail}{d100 ? ` vs ${d100.target}` : ""})
      </span>
      {tag && (
        <span className="dice-history-tag" style={{ color: tagColor, borderColor: tagColor }}>{tag}</span>
      )}
    </div>
  );
}

function NumberField({ label, value, onChange, min, max }) {
  return (
    <div className="dice-number-field">
      <label className="label">{label}</label>
      <input
        type="number"
        className="field-num"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          onChange(Number.isNaN(n) ? min : n);
        }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="dice-number-field">
      <label className="label">{label}</label>
      <select
        className="dice-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function buildFormula(count, sides, modifier) {
  const core = `${count > 1 ? count : ""}d${sides}`;
  if (modifier > 0) return `${core}+${modifier}`;
  if (modifier < 0) return `${core}${modifier}`;
  return core;
}

function clamp(n, lo, hi) {
  const v = Number(n);
  if (Number.isNaN(v)) return lo;
  return Math.max(lo, Math.min(hi, v));
}
