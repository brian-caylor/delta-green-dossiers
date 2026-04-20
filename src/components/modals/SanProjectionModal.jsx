import { useState } from "react";

const DICE_GLYPHS = ["⚀", "⚁", "⚂", "⚃"]; // die faces for 1-4

export const SanProjectionModal = ({ char, onApply, onClose }) => {
  const [step, setStep] = useState(1);
  const [sanDamage, setSanDamage] = useState(1);
  const [roll, setRoll] = useState(null);
  const [selectedBond, setSelectedBond] = useState(null);

  const validBonds = char.bonds.filter((b) => Number(b.score) > 0);
  const wpCurrent = Number(char.derived.wp.current) || 0;
  const wpInsufficient = roll !== null && wpCurrent <= roll;

  const doRoll = () => {
    setRoll(Math.floor(Math.random() * 4) + 1);
    setStep(2);
  };

  const handleApply = () => {
    if (selectedBond === null) return;
    onApply({ roll, sanDamage, bondIndex: selectedBond });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: "min(480px, 92vw)" }}>
        <div className="modal-title" style={{ color: "var(--stamp-blue)" }}>⚡ PROJECT ONTO A BOND</div>
        <div className="modal-sub" style={{ fontStyle: "italic" }}>
          "The Program demands everything. Your bonds pay the price."
        </div>

        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{
              width: 32, height: 3,
              background: step >= s ? "var(--stamp-blue)" : "var(--line-2)",
            }} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 6, lineHeight: 1.6 }}>
              How much SAN are you taking?
            </div>
            <div className="label" style={{ fontStyle: "italic", marginBottom: 20 }}>
              Enter the SAN loss before projection. You'll absorb the remainder after your roll.
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <input type="number" value={sanDamage} min={1} className="field-num"
                style={{ width: 80, fontSize: 18, padding: "8px 4px" }}
                onChange={(e) => setSanDamage(Math.max(1, Number(e.target.value) || 1))}
                autoFocus
              />
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button type="button" className="btn btn-primary" onClick={doRoll}>ROLL 1D4 →</button>
            </div>
          </div>
        )}

        {step === 2 && roll !== null && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 56, lineHeight: 1, color: "var(--stamp-blue)" }}>{DICE_GLYPHS[roll - 1]}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--ink-2)", marginTop: 4 }}>
                You rolled {roll}
              </div>
            </div>

            <div style={{ padding: "12px 16px", marginBottom: 14, border: "1px solid var(--line-2)" }}>
              {[
                ["WP spend", `−${roll}`, `(${wpCurrent} → ${Math.max(0, wpCurrent - roll)})`],
                ["SAN reduction", `−${roll}`, `(you take ${Math.max(0, sanDamage - roll)} instead of ${sanDamage})`],
              ].map(([label, val, note]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span className="label">{label}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--stamp-blue)", fontWeight: 600 }}>{val}</span>
                    <span className="label">{note}</span>
                  </div>
                </div>
              ))}
            </div>

            {wpInsufficient && (
              <div style={{
                background: "var(--redact-wash)", border: "1px solid var(--redact)",
                padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "var(--redact)",
              }}>
                ⚠ Not enough WP — you have {wpCurrent}. Must retain at least 1 after spending.
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button type="button" className="btn btn-sm btn-ghost" onClick={doRoll}>↺ Re-roll</button>
              <button type="button" className="btn btn-primary" onClick={() => setStep(3)} disabled={wpInsufficient}>
                CHOOSE BOND →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 4 }}>
              Which bond absorbs the damage?
            </div>
            <div className="label" style={{ fontStyle: "italic", marginBottom: 16 }}>
              The bond's score will drop by {roll}. Choose carefully — a bond at 0 is broken forever.
            </div>
            <div className="col" style={{ gap: 6, marginBottom: 20 }}>
              {validBonds.map((bond) => {
                const origIdx = char.bonds.indexOf(bond);
                const curScore = Number(bond.score) || 0;
                const newScore = Math.max(0, curScore - roll);
                const willBreak = newScore === 0;
                const isSelected = selectedBond === origIdx;
                return (
                  <div key={origIdx} onClick={() => setSelectedBond(origIdx)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      cursor: "pointer",
                      border: `1px solid ${isSelected ? "var(--stamp-blue)" : "var(--line-2)"}`,
                      background: isSelected ? "rgba(31,58,107,0.08)" : "transparent",
                    }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${isSelected ? "var(--stamp-blue)" : "var(--ink-muted)"}`,
                      background: isSelected ? "var(--stamp-blue)" : "transparent",
                    }} />
                    <span style={{ flex: 1, fontSize: 13, color: "var(--ink)" }}>
                      {bond.name || `Bond ${origIdx + 1}`}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)" }}>
                      <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{curScore}</span>
                      <span style={{ fontSize: 10, color: "var(--ink-3)" }}>→</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: willBreak ? "var(--redact)" : "var(--stamp-blue)" }}>
                        {newScore}
                      </span>
                      {willBreak && (
                        <span className="handwritten" style={{ fontSize: 10, color: "var(--redact)", letterSpacing: 2, marginLeft: 4 }}>BROKEN</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setStep(2)}>← BACK</button>
              <button type="button" className="btn btn-primary" onClick={handleApply} disabled={selectedBond === null}>
                APPLY →
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button type="button" className="btn btn-tiny btn-ghost" onClick={onClose}>CANCEL</button>
        </div>
      </div>
    </div>
  );
};
