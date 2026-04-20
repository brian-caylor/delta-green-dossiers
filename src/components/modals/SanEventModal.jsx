import { useState } from "react";
import { DISORDERS } from "../../data/disorders";

export const SanEventModal = ({ char, eventData, onApply, onClose }) => {
  const { loss, from, to } = eventData;
  const newSAN = to;
  const bp = Number(char.derived.bp.current) || 0;
  const pow = Number(char.stats.pow.score) || 0;
  const tiTriggered = loss >= 5;
  const bpTriggered = newSAN <= bp && bp > 0;
  const permanentInsanity = newSAN <= 0;
  const newBp = bpTriggered ? Math.max(0, newSAN - pow) : null;

  const [category, setCategory] = useState(null);
  const [reaction, setReaction] = useState(null);
  const [repressOpen, setRepressOpen] = useState(false);
  const [repressWp, setRepressWp] = useState(1);
  const [repressBondIdx, setRepressBondIdx] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedDisorder, setSelectedDisorder] = useState(null);
  const [customDisorder, setCustomDisorder] = useState("");

  const validBondsForRepress = char.bonds.filter((b) => Number(b.score) > 0);
  const wpCurrent = Number(char.derived.wp.current) || 0;

  const steps = [1];
  if (tiTriggered) steps.push(2);
  if (bpTriggered) steps.push(3);
  steps.push(4);
  if (permanentInsanity) steps.push(5);
  const currentStepIdx = steps.indexOf(step);
  const nextStep = steps[currentStepIdx + 1] ?? null;
  const isLastStep = nextStep === null;

  const advanceStep = () => { if (nextStep) setStep(nextStep); };

  const catKey = category === "violence" ? "violence" : category === "helplessness" ? "helplessness" : null;
  const currentBoxes = catKey ? char.sanLoss[catKey] : null;
  const currentChecked = currentBoxes ? currentBoxes.filter(Boolean).length : 0;
  const wasRepressed = reaction === "repressed";
  const anyInsanity = (tiTriggered && !wasRepressed) || bpTriggered;
  const newBoxes = catKey && !anyInsanity
    ? currentBoxes.map((v, i) => v || i === currentChecked)
    : catKey ? [false, false, false] : null;
  const newChecked = newBoxes ? newBoxes.filter(Boolean).length : 0;
  const justAdapted = catKey && newChecked === 3 && currentChecked < 3;

  const handleApply = () => {
    const disorderValue = bpTriggered
      ? (selectedDisorder === "__other__" ? customDisorder.trim() : selectedDisorder)
      : null;
    onApply({
      category,
      reaction: wasRepressed ? "repressed" : reaction,
      repressWpSpent: wasRepressed ? repressWp : null,
      repressBondIndex: wasRepressed ? repressBondIdx : null,
      bpTriggered,
      newBp,
      adaptationCleared: catKey ? anyInsanity : false,
      adaptationBoxChecked: catKey ? (!anyInsanity && currentChecked < 3) : false,
      justAdapted,
      permanentInsanity,
      disorder: disorderValue,
    });
  };

  const radioOption = (isSelected, opts) => ({
    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
    cursor: "pointer",
    border: `1px solid ${isSelected ? opts.active : "var(--line-2)"}`,
    background: isSelected ? opts.activeBg : "transparent",
  });

  const radioDot = (isSelected, color) => ({
    width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
    border: `2px solid ${isSelected ? color : "var(--ink-muted)"}`,
    background: isSelected ? color : "transparent",
  });

  const pipStyle = (filled) => ({
    width: 14, height: 14,
    border: `2px solid ${filled ? "var(--ok)" : "var(--line-2)"}`,
    background: filled ? "var(--ok)" : "transparent",
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: "min(520px, 94vw)" }}>
        <div className="modal-title" style={{ color: "var(--redact)" }}>SAN LOSS EVENT</div>
        <div className="modal-sub" style={{ fontStyle: "italic" }}>
          SAN {from} → {to} &nbsp;·&nbsp; lost {loss}
        </div>

        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 20 }}>
          {steps.map((s) => (
            <div key={s} style={{
              width: 28, height: 3,
              background: step >= s ? "var(--redact)" : "var(--line-2)",
            }} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 6 }}>What type of threat caused this SAN loss?</div>
            <div className="label" style={{ fontStyle: "italic", marginBottom: 16 }}>
              This determines adaptation tracking and disorder category.
            </div>
            <div className="col" style={{ gap: 6, marginBottom: 20 }}>
              {[
                { key: "violence", label: "Violence", desc: "Physical assault, death, gore, combat" },
                { key: "helplessness", label: "Helplessness", desc: "Captivity, loss of control, powerlessness" },
                { key: "unnatural", label: "Unnatural", desc: "Entities, mythos — no adaptation possible" },
              ].map((opt) => {
                const isSelected = category === opt.key;
                return (
                  <div key={opt.key} onClick={() => setCategory(opt.key)}
                    style={radioOption(isSelected, { active: "var(--redact)", activeBg: "var(--redact-wash)" })}
                  >
                    <span style={radioDot(isSelected, "var(--redact)")} />
                    <div style={{ flex: 1 }}>
                      <div className="handwritten" style={{ fontSize: 14, letterSpacing: 1, color: "var(--ink)" }}>{opt.label.toUpperCase()}</div>
                      <div className="label" style={{ marginTop: 2, fontStyle: "italic" }}>{opt.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button type="button" className="btn btn-primary" onClick={advanceStep} disabled={!category}>NEXT →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="handwritten" style={{ fontSize: 16, color: "var(--redact)", letterSpacing: 3, marginBottom: 8 }}>⚡ TEMPORARY INSANITY</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 16 }}>
              You lost <strong>{loss} SAN</strong> in a single event — 5 or more triggers temporary insanity.
            </div>

            {!repressOpen ? (
              <>
                <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 10 }}>Choose your agent's reaction:</div>
                <div className="col" style={{ gap: 6, marginBottom: 18 }}>
                  {[
                    { key: "flee", label: "FLEE", desc: `Move away at full speed for ${Number(char.stats.con.score) || "?"} turns` },
                    { key: "struggle", label: "STRUGGLE", desc: "Fight nearby threats indiscriminately until incapacitated" },
                    { key: "submit", label: "SUBMIT", desc: "Collapse into catatonia or unconsciousness" },
                  ].map((opt) => {
                    const isSelected = reaction === opt.key;
                    return (
                      <div key={opt.key} onClick={() => setReaction(opt.key)}
                        style={radioOption(isSelected, { active: "var(--redact-2)", activeBg: "var(--redact-wash)" })}
                      >
                        <span style={radioDot(isSelected, "var(--redact-2)")} />
                        <div style={{ flex: 1 }}>
                          <div className="handwritten" style={{ fontSize: 14, letterSpacing: 1, color: "var(--ink)" }}>{opt.label}</div>
                          <div className="label" style={{ marginTop: 2, fontStyle: "italic" }}>{opt.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setRepressOpen(true)}>↩ REPRESS</button>
                  <button type="button" className="btn btn-primary" onClick={advanceStep} disabled={!reaction}>
                    {isLastStep ? "DONE" : "NEXT →"}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ border: "1px solid var(--ok)", padding: "14px 16px", marginBottom: 14 }}>
                <div className="handwritten" style={{ color: "var(--ok)", letterSpacing: 2, marginBottom: 10 }}>REPRESS INSANITY</div>
                <div className="label" style={{ marginBottom: 14, lineHeight: 1.6 }}>
                  Roll 1d4. Spend that many WP and reduce a bond by the same amount. On a successful SAN roll, the reaction is suppressed.
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 14, flexWrap: "wrap" }}>
                  <div>
                    <div className="label" style={{ marginBottom: 4 }}>WP TO SPEND</div>
                    <input type="number" min={1} max={Math.max(1, wpCurrent - 1)} value={repressWp}
                      className="field-num"
                      style={{ width: 60 }}
                      onChange={(e) => setRepressWp(Math.max(1, Math.min(wpCurrent - 1, Number(e.target.value) || 1)))}
                    />
                    <div className="label" style={{ marginTop: 2 }}>WP: {wpCurrent} → {Math.max(0, wpCurrent - repressWp)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <div className="label" style={{ marginBottom: 4 }}>BOND TO REDUCE</div>
                    <select value={repressBondIdx ?? ""} onChange={(e) => setRepressBondIdx(Number(e.target.value))}
                      className="field-num" style={{ width: "100%", textAlign: "left", padding: "6px 8px" }}
                    >
                      <option value="">— select bond —</option>
                      {validBondsForRepress.map((b) => {
                        const origIdx = char.bonds.indexOf(b);
                        return <option key={origIdx} value={origIdx}>{b.name || `Bond ${origIdx + 1}`} ({b.score})</option>;
                      })}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setRepressOpen(false)}>← CANCEL</button>
                  <button type="button" className="btn btn-sm btn-primary"
                    disabled={repressBondIdx === null || wpCurrent <= 1}
                    onClick={() => { setReaction("repressed"); setRepressOpen(false); advanceStep(); }}
                  >CONFIRM REPRESS →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="handwritten" style={{ fontSize: 16, color: "var(--redact)", letterSpacing: 3, marginBottom: 8 }}>● BREAKING POINT REACHED</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 14 }}>
              SAN has fallen to <strong>{newSAN}</strong>, at or below the Breaking Point of <strong style={{ color: "var(--redact)" }}>{bp}</strong>.
            </div>
            <div style={{ border: "1px solid var(--redact)", padding: "12px 14px", marginBottom: 14 }}>
              <div className="label" style={{ marginBottom: 10 }}>Select your agent's disorder — added to Mental Disorders.</div>
              {category && DISORDERS[category] && (
                <div style={{ marginBottom: 10 }}>
                  <div className="label" style={{ marginBottom: 6 }}>{category.toUpperCase()} DISORDERS:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {DISORDERS[category].map((d) => {
                      const isSelected = selectedDisorder === d;
                      return (
                        <span key={d} onClick={() => setSelectedDisorder(d)} style={{
                          fontSize: 10, padding: "3px 8px", cursor: "pointer",
                          background: isSelected ? "var(--redact-wash)" : "transparent",
                          border: `1px solid ${isSelected ? "var(--redact)" : "var(--line-2)"}`,
                          color: isSelected ? "var(--redact)" : "var(--ink-2)",
                          fontWeight: isSelected ? 600 : 400,
                          fontFamily: "var(--font-mono)",
                        }}>
                          {isSelected ? "✓ " : ""}{d}
                        </span>
                      );
                    })}
                    {(() => {
                      const isSelected = selectedDisorder === "__other__";
                      return (
                        <span onClick={() => setSelectedDisorder("__other__")} style={{
                          fontSize: 10, padding: "3px 8px", cursor: "pointer",
                          background: isSelected ? "var(--line-soft)" : "transparent",
                          border: `1px solid ${isSelected ? "var(--ink)" : "var(--line-2)"}`,
                          color: isSelected ? "var(--ink)" : "var(--ink-2)",
                          fontWeight: isSelected ? 600 : 400,
                          fontFamily: "var(--font-mono)",
                        }}>{isSelected ? "✓ " : ""}Other…</span>
                      );
                    })()}
                  </div>
                  {selectedDisorder === "__other__" && (
                    <input
                      autoFocus
                      type="text"
                      placeholder="Enter disorder name…"
                      value={customDisorder}
                      onChange={(e) => setCustomDisorder(e.target.value)}
                      className="field-line"
                      style={{ marginTop: 10, fontFamily: "var(--font-hand)" }}
                    />
                  )}
                </div>
              )}
              <div style={{ borderTop: "1px dashed var(--line-2)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span className="label">Breaking Point reset:</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink)" }}>
                  <span style={{ color: "var(--redact)" }}>{bp}</span> → <span>{newBp}</span>
                  <span className="label" style={{ marginLeft: 4 }}>(SAN {newSAN} − POW {pow})</span>
                </span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {(() => {
                const disorderOk = selectedDisorder && (selectedDisorder !== "__other__" || customDisorder.trim());
                return (
                  <button type="button" className="btn btn-primary" onClick={advanceStep} disabled={!disorderOk}>
                    {isLastStep ? "DONE" : "NEXT →"}
                  </button>
                );
              })()}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            {category === "unnatural" ? (
              <>
                <div className="handwritten" style={{ fontSize: 14, color: "var(--stamp-blue)", letterSpacing: 2, marginBottom: 8 }}>ADAPTATION</div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 16 }}>
                  Unnatural SAN loss cannot be adapted to. No tracking boxes are updated.
                </div>
              </>
            ) : (
              <>
                <div className="handwritten" style={{ fontSize: 14, color: "var(--ok)", letterSpacing: 2, marginBottom: 8 }}>
                  ADAPTATION — {category ? category.toUpperCase() : ""}
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 14 }}>
                  {(newBoxes || [false, false, false]).map((filled, idx) => (
                    <div key={idx} style={pipStyle(filled)} />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 14, textAlign: "center" }}>
                  {anyInsanity ? (
                    <span style={{ color: "var(--redact)" }}>⚠ Boxes cleared — insanity or Breaking Point occurred this event.</span>
                  ) : currentChecked >= 3 ? (
                    <span style={{ color: "var(--ok)" }}>Already adapted.</span>
                  ) : (
                    <span>Box {currentChecked + 1} of 3 checked — {2 - currentChecked} more without incident to adapt.</span>
                  )}
                </div>
                {justAdapted && (
                  <div style={{ border: "1px solid var(--ok)", padding: "12px 14px", marginBottom: 14 }}>
                    <div className="handwritten" style={{ fontSize: 13, color: "var(--ok)", letterSpacing: 2, marginBottom: 6 }}>★ ADAPTED TO {category.toUpperCase()}</div>
                    {category === "violence" ? (
                      <div style={{ fontSize: 11, color: "var(--ink-2)", lineHeight: 1.6 }}>
                        Roll 1d6. Lose that many <strong>CHA</strong> permanently. Reduce each bond score by the same amount.
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: "var(--ink-2)", lineHeight: 1.6 }}>
                        Roll 1d6. Lose that many <strong>POW</strong> permanently. This raises Breaking Point — check if a new disorder triggers.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button type="button" className="btn btn-primary" onClick={isLastStep ? handleApply : advanceStep}>
                {isLastStep ? "DONE" : "NEXT →"}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <div className="handwritten" style={{ fontSize: 22, color: "var(--redact)", letterSpacing: 6, marginBottom: 6 }}>
              ☠ PERMANENT INSANITY
            </div>
            <div className="label" style={{ color: "var(--redact)", letterSpacing: 3, marginBottom: 18 }}>
              AGENT PSYCHOLOGICAL CASUALTY — DELTA GREEN
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 10, fontStyle: "italic" }}>
              "SAN has reached zero. The mind cannot hold. What remains is not the agent you knew."
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 18 }}>
              This agent is now a Handler-controlled NPC. Archive the dossier. Manifestations: catatonia, raving delusions, or psychopathy.
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button type="button" className="btn btn-primary" onClick={handleApply}>ACKNOWLEDGE</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
