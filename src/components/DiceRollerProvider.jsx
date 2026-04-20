import { useState, useCallback, useEffect, useRef } from "react";
import { DiceRollerContext } from "../lib/DiceRollerContext.js";
import { parseFormula, rollFormula } from "../utils/diceRoller.js";
import { animate, clearScene } from "../lib/diceBox.js";
import DiceOverlay from "./dice/DiceOverlay.jsx";
import DiceRollerPanel from "./dice/DiceRollerPanel.jsx";

// Mounts inside DossierApp so the roller only exists while a user has a
// character open. Owns panel visibility, roll history, and the overlay
// animation lifecycle.
//
// Children get { isOpen, open, close, toggle, roll, history, clearHistory }
// via useDiceRoller(). Every roll also fires the `onRoll` callback the
// provider is constructed with — that's how the session log integration
// hooks in without this component knowing about characters or Firestore.
export default function DiceRollerProvider({ onRoll, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  // Currently animating roll — overlay renders this while dice tumble.
  const [activeRoll, setActiveRoll] = useState(null);
  // True from the moment the user clicks Roll until the result card
  // finishes displaying. DiceRollerPanel hides itself while this is true
  // so the dice aren't obscured.
  const [isRolling, setIsRolling] = useState(false);
  const animatingRef = useRef(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((o) => !o), []);

  // Esc to close panel.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const roll = useCallback(async (formulaStr, opts = {}) => {
    if (animatingRef.current) return null;
    const parsed = parseFormula(formulaStr);
    if (!parsed) return null;

    animatingRef.current = true;
    setIsRolling(true);

    let entry = null;
    try {
      // Let the library do the physics AND the rolling. Its returned
      // values are the source of truth so the 3D faces always match
      // the numbers we display and log.
      const libResults = await animate(parsed.groups);
      entry = buildEntry(parsed, libResults, opts);
    } catch (err) {
      console.warn("[dice] animation skipped — falling back to computed result:", err?.message || err);
      const fallback = rollFormula(formulaStr, opts);
      if (fallback) entry = { ...fallback, at: Date.now(), id: cryptoRandomId() };
    }

    if (!entry) {
      animatingRef.current = false;
      setIsRolling(false);
      return null;
    }

    if (onRoll) {
      try { onRoll(entry); } catch (err) { console.error("[dice] onRoll hook failed", err); }
    }

    setActiveRoll(entry);
    setHistory((prev) => [entry, ...prev].slice(0, 10));

    setTimeout(() => {
      setActiveRoll(null);
      setIsRolling(false);
      clearScene().catch(() => { /* noop */ });
      animatingRef.current = false;
    }, 2500);

    return entry;
  }, [onRoll]);

  const clearHistory = useCallback(() => setHistory([]), []);

  // Placeholder for the future campaign broadcast. Stays a no-op until
  // the Handler/Campaign rollout wires it to addDoc('rolls', ...).
  // eslint-disable-next-line no-unused-vars
  const broadcast = useCallback((_entry) => { /* noop — [FWD-COMPAT] */ }, []);

  const value = { isOpen, open, close, toggle, roll, history, clearHistory, activeRoll, isRolling, broadcast };

  return (
    <DiceRollerContext.Provider value={value}>
      {children}
      {/* Stable DOM mount point for the dice-box canvas. */}
      <div id="dice-box-root" className="dice-box-root" aria-hidden="true" />
      <DiceOverlay />
      <DiceRollerPanel />
    </DiceRollerContext.Provider>
  );
}

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `roll-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Build a roll entry from the parsed formula + the library's returned
// dice results. Matches library results back to our groups by sides in
// order, so "2d6+1d4" always maps correctly.
function buildEntry(parsed, libResults, opts) {
  const { groups, modifier } = parsed;
  const pool = libResults.map((r) => ({
    sides: normalizeSides(r.sides),
    value: Number(r.value),
  }));

  const perGroup = groups.map(({ count, sides }) => {
    const rolls = [];
    for (let i = 0; i < count; i++) {
      const idx = pool.findIndex((p) => p.sides === sides && p.value != null);
      if (idx >= 0) {
        rolls.push(pool[idx].value);
        pool.splice(idx, 1);
      } else {
        // Library didn't return a die we needed — extremely unlikely,
        // but don't crash. Fill with a safe fallback.
        rolls.push(Math.floor(Math.random() * sides) + 1);
      }
    }
    return { sides, rolls };
  });

  const sum = perGroup.reduce((acc, g) => acc + g.rolls.reduce((a, r) => a + r, 0), 0);
  const total = sum + modifier;

  const formula = canonicalFormula(groups, modifier);

  let d100 = null;
  const isSingleD100 =
    groups.length === 1 && groups[0].count === 1 && groups[0].sides === 100 && modifier === 0;
  if (isSingleD100 && opts.target != null && opts.target !== "") {
    const roll = perGroup[0].rolls[0];
    const target = Number(opts.target) || 0;
    const pass = roll <= target;
    const matchedDigits = roll !== 100 && roll % 11 === 0;
    d100 = {
      target,
      pass,
      isCritical: roll === 1 || (pass && matchedDigits),
      isFumble: roll === 100 || (!pass && matchedDigits && roll > 5),
    };
  }

  return {
    formula,
    perGroup,
    modifier,
    total,
    d100,
    at: Date.now(),
    id: cryptoRandomId(),
  };
}

// Library returns sides as either a number (6) or a string ("d6" / "6").
function normalizeSides(s) {
  if (typeof s === "number") return s;
  if (typeof s === "string") {
    const n = parseInt(s.replace(/^d/, ""), 10);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function canonicalFormula(groups, modifier) {
  const parts = groups.map(({ count, sides }) => `${count > 1 ? count : ""}d${sides}`);
  if (modifier > 0) parts.push(`+${modifier}`);
  else if (modifier < 0) parts.push(`${modifier}`);
  return parts.join("");
}
