import { useState, useCallback, useEffect, useRef } from "react";
import { DiceRollerContext } from "../lib/DiceRollerContext.js";
import { rollFormula } from "../utils/diceRoller.js";
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
    // Ignore a second click while an animation is still mid-flight.
    if (animatingRef.current) return null;

    const result = rollFormula(formulaStr, opts);
    if (!result) return null;

    const entry = { ...result, at: Date.now(), id: cryptoRandomId() };
    setActiveRoll(entry);
    animatingRef.current = true;

    // Fire the consumer callback (session log write) immediately so it
    // lands in Firestore without waiting for the animation to settle.
    if (onRoll) {
      try { onRoll(entry); } catch (err) { console.error("[dice] onRoll hook failed", err); }
    }

    // Drive the animation. If the library can't init (no WebGL, asset
    // load failure, etc.) we still show the result — just without 3D.
    try {
      await animate(result.formula);
    } catch (err) {
      console.warn("[dice] animation skipped:", err?.message || err);
    }

    setHistory((prev) => [entry, ...prev].slice(0, 10));

    // Keep the result visible a beat after settling.
    setTimeout(() => {
      setActiveRoll(null);
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

  const value = { isOpen, open, close, toggle, roll, history, clearHistory, activeRoll, broadcast };

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
