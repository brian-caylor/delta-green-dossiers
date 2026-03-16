import { useState } from "react";

const DICE_GLYPHS = ["\u2680","\u2681","\u2682","\u2683"]; // Unicode die faces for 1-4

export const SanProjectionModal = ({ char, onApply, onClose }) => {
  const [step, setStep] = useState(1);
  const [sanDamage, setSanDamage] = useState(1);
  const [roll, setRoll] = useState(null);
  const [selectedBond, setSelectedBond] = useState(null);

  const validBonds = char.bonds.filter(b => Number(b.score) > 0);
  const wpCurrent = Number(char.derived.wp.current) || 0;
  const canProject = roll !== null && wpCurrent > roll; // must retain >= 1 WP after spend
  const wpInsufficient = roll !== null && wpCurrent <= roll;

  const doRoll = () => {
    setRoll(Math.floor(Math.random() * 4) + 1);
    setStep(2);
  };

  const handleApply = () => {
    if (selectedBond === null) return;
    onApply({ roll, sanDamage, bondIndex: selectedBond });
  };

  const inputStyle = {
    width: 80, textAlign: "center", background: "rgba(100,140,180,0.08)",
    border: "1px solid rgba(100,140,180,0.35)", borderRadius: 4,
    padding: "8px 4px", color: "#D4D8C8", fontSize: 18,
    fontFamily: "'IBM Plex Mono', monospace", outline: "none",
  };

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}
        style={{ borderColor: "rgba(100,140,180,0.35)", maxWidth: 480, width: "min(480px, 92vw)" }}>

        {/* Header */}
        <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 20, color: "#7AAAD4", letterSpacing: 4, marginBottom: 6 }}>
          {"\u26A1"} PROJECT ONTO A BOND
        </div>
        <div style={{ fontSize: 10, color: "#5A6A80", letterSpacing: 2, marginBottom: 20, fontStyle: "italic" }}>
          "The Program demands everything. Your bonds pay the price."
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{
              width: 28, height: 4, borderRadius: 2,
              background: step >= s ? "#7AAAD4" : "rgba(100,140,180,0.2)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        {/* -- STEP 1: Incoming SAN damage -- */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 13, color: "#A0A890", marginBottom: 6, lineHeight: 1.6 }}>
              How much SAN are you taking?
            </div>
            <div style={{ fontSize: 11, color: "#5A6A40", marginBottom: 20, fontStyle: "italic" }}>
              Enter the SAN loss before projection. You'll absorb the remainder after your roll.
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <input
                type="number"
                value={sanDamage}
                min={1}
                style={inputStyle}
                onChange={e => setSanDamage(Math.max(1, Number(e.target.value) || 1))}
                autoFocus
              />
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button className="btn" onClick={doRoll}
                style={{ borderColor: "rgba(100,140,180,0.4)", background: "rgba(100,140,180,0.12)", color: "#7AAAD4", padding: "10px 28px", letterSpacing: 3 }}>
                ROLL 1D4 &rarr;
              </button>
            </div>
          </div>
        )}

        {/* -- STEP 2: Roll result & WP check -- */}
        {step === 2 && roll !== null && (
          <div>
            {/* Die display */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{
                display: "inline-block", fontSize: 56, lineHeight: 1,
                color: "#7AAAD4", animation: "fadeIn 0.25s ease",
              }}>
                {DICE_GLYPHS[roll - 1]}
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, color: "#D4D8C8", marginTop: 4 }}>
                You rolled {roll}
              </div>
            </div>

            {/* Outcome preview */}
            <div style={{
              background: "rgba(100,140,180,0.06)", border: "1px solid rgba(100,140,180,0.2)",
              borderRadius: 6, padding: "14px 18px", marginBottom: 16,
            }}>
              {[
                ["WP spend", `\u2212${roll}`, `(${wpCurrent} \u2192 ${Math.max(0, wpCurrent - roll)})`],
                ["SAN reduction", `\u2212${roll}`, `(you take ${Math.max(0, sanDamage - roll)} instead of ${sanDamage})`],
              ].map(([label, val, note]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#7A8A60" }}>{label}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: "#7AAAD4", fontWeight: 600 }}>{val}</span>
                    <span style={{ fontSize: 11, color: "#5A6A40" }}>{note}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* WP insufficient warning */}
            {wpInsufficient && (
              <div style={{
                background: "rgba(180,100,50,0.1)", border: "1px solid rgba(180,100,50,0.3)",
                borderRadius: 4, padding: "8px 12px", marginBottom: 16, fontSize: 12, color: "#C49050",
              }}>
                {"\u26A0"} Not enough WP &mdash; you have {wpCurrent}. Must retain at least 1 after spending.
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn btn-sm" onClick={doRoll}
                style={{ borderColor: "rgba(100,140,180,0.25)", color: "#5A7A9A", fontSize: 11 }}>
                {"\u21BA"} Re-roll
              </button>
              <button className="btn" onClick={() => setStep(3)}
                disabled={wpInsufficient}
                style={{
                  borderColor: wpInsufficient ? "rgba(80,80,80,0.2)" : "rgba(100,140,180,0.4)",
                  background: wpInsufficient ? "rgba(255,255,255,0.02)" : "rgba(100,140,180,0.12)",
                  color: wpInsufficient ? "#4A5A45" : "#7AAAD4",
                  padding: "10px 24px", letterSpacing: 3, cursor: wpInsufficient ? "not-allowed" : "pointer",
                }}>
                CHOOSE BOND &rarr;
              </button>
            </div>
          </div>
        )}

        {/* -- STEP 3: Bond selection -- */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 13, color: "#A0A890", marginBottom: 4 }}>
              Which bond absorbs the damage?
            </div>
            <div style={{ fontSize: 11, color: "#5A6A40", marginBottom: 16, fontStyle: "italic" }}>
              The bond's score will drop by {roll}. Choose carefully &mdash; a bond at 0 is broken forever.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {validBonds.map((bond, bondIdx) => {
                // Map back to original index in char.bonds
                const origIdx = char.bonds.indexOf(bond);
                const curScore = Number(bond.score) || 0;
                const newScore = Math.max(0, curScore - roll);
                const willBreak = newScore === 0;
                const isSelected = selectedBond === origIdx;
                return (
                  <div key={origIdx}
                    onClick={() => setSelectedBond(origIdx)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      borderRadius: 5, cursor: "pointer",
                      border: `1px solid ${isSelected ? "rgba(100,140,180,0.6)" : "rgba(100,140,180,0.15)"}`,
                      background: isSelected ? "rgba(100,140,180,0.1)" : "rgba(255,255,255,0.02)",
                      boxShadow: isSelected ? "0 0 12px rgba(100,140,180,0.15)" : "none",
                      transition: "all 0.2s",
                    }}>
                    {/* Radio indicator */}
                    <div style={{
                      width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${isSelected ? "#7AAAD4" : "rgba(100,140,180,0.35)"}`,
                      background: isSelected ? "rgba(100,140,180,0.3)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isSelected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#7AAAD4" }} />}
                    </div>
                    {/* Bond name */}
                    <span style={{ flex: 1, fontSize: 13, color: isSelected ? "#D4D8C8" : "#A0A890" }}>
                      {bond.name || `Bond ${origIdx + 1}`}
                    </span>
                    {/* Score change */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
                      <span style={{ fontSize: 13, color: "#5A6A40" }}>{curScore}</span>
                      <span style={{ fontSize: 10, color: "#5A6A40" }}>{"\u2192"}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: willBreak ? "#C44040" : "#7AAAD4" }}>
                        {newScore}
                      </span>
                      {willBreak && (
                        <span style={{ fontSize: 9, fontFamily: "'Special Elite', cursive", color: "#C44040", letterSpacing: 2, marginLeft: 4 }}>
                          BROKEN
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="btn btn-sm" onClick={() => setStep(2)}
                style={{ borderColor: "rgba(100,140,180,0.25)", color: "#5A7A9A" }}>
                &larr; BACK
              </button>
              <button className="btn" onClick={handleApply}
                disabled={selectedBond === null}
                style={{
                  borderColor: selectedBond === null ? "rgba(80,80,80,0.2)" : "rgba(100,140,180,0.4)",
                  background: selectedBond === null ? "rgba(255,255,255,0.02)" : "rgba(100,140,180,0.12)",
                  color: selectedBond === null ? "#4A5A45" : "#7AAAD4",
                  padding: "10px 28px", letterSpacing: 3, cursor: selectedBond === null ? "not-allowed" : "pointer",
                }}>
                APPLY &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Cancel */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button className="btn btn-sm" onClick={onClose}
            style={{ borderColor: "rgba(80,80,80,0.2)", color: "#5A6A40", fontSize: 10 }}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};
