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

  const [category, setCategory] = useState(null); // "violence"|"helplessness"|"unnatural"
  const [reaction, setReaction] = useState(null);  // "flee"|"struggle"|"submit"
  const [repressOpen, setRepressOpen] = useState(false);
  const [repressWp, setRepressWp] = useState(1);
  const [repressBondIdx, setRepressBondIdx] = useState(null);
  const [step, setStep] = useState(1); // 1=category, 2=TI, 3=BP, 4=adaptation, 5=permanent
  const [selectedDisorder, setSelectedDisorder] = useState(null); // disorder name | "__other__" | null
  const [customDisorder, setCustomDisorder] = useState("");

  const validBondsForRepress = char.bonds.filter(b => Number(b.score) > 0);
  const wpCurrent = Number(char.derived.wp.current) || 0;

  // Determine sequence of steps to show
  const steps = [1];
  if (tiTriggered) steps.push(2);
  if (bpTriggered) steps.push(3);
  if (true) steps.push(4); // always show adaptation summary (filtered by category later)
  if (permanentInsanity) steps.push(5);
  const currentStepIdx = steps.indexOf(step);
  const nextStep = steps[currentStepIdx + 1] ?? null;
  const isLastStep = nextStep === null;

  const advanceStep = () => { if (nextStep) setStep(nextStep); };

  // Adaptation state helpers
  const catKey = category === "violence" ? "violence" : category === "helplessness" ? "helplessness" : null;
  const currentBoxes = catKey ? char.sanLoss[catKey] : null;
  const currentChecked = currentBoxes ? currentBoxes.filter(Boolean).length : 0;
  const wasRepressed = reaction === "repressed";
  const anyInsanity = (tiTriggered && !wasRepressed) || bpTriggered;
  const newBoxes = catKey && !anyInsanity
    ? currentBoxes.map((v, i) => v || i === currentChecked) // check next unchecked box
    : catKey ? [false, false, false] : null; // clear on insanity
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

  const STEP_COLORS = { 1: "#9060A0", 2: "#C49050", 3: "#C44040", 4: "#5A6A40", 5: "#C44040" };
  const boxStyle = (filled) => ({
    width: 14, height: 14, border: `2px solid ${filled ? "#9060A0" : "rgba(130,80,160,0.3)"}`,
    borderRadius: 2, background: filled ? "rgba(130,80,160,0.3)" : "transparent",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, color: "#9060A0",
  });

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}
        style={{ borderColor: "rgba(130,80,160,0.4)", maxWidth: 500, width: "min(500px, 92vw)" }}>

        {/* Header */}
        <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 18, color: "#9060A0", letterSpacing: 4, marginBottom: 4 }}>
          SAN LOSS EVENT
        </div>
        <div style={{ fontSize: 11, color: "#5A4060", letterSpacing: 1, marginBottom: 16, fontStyle: "italic" }}>
          SAN {from} &rarr; {to} &nbsp;&middot;&nbsp; lost {loss}
        </div>

        {/* Step progress dots */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
          {steps.map(s => (
            <div key={s} style={{
              width: 24, height: 4, borderRadius: 2,
              background: step >= s ? STEP_COLORS[s] : "rgba(130,80,160,0.15)",
              transition: "background 0.3s",
            }} />
          ))}
        </div>

        {/* -- STEP 1: Category -- */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 13, color: "#A0A890", marginBottom: 6 }}>What type of threat caused this SAN loss?</div>
            <div style={{ fontSize: 11, color: "#5A6A40", marginBottom: 20, fontStyle: "italic" }}>
              This determines adaptation tracking and disorder category.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {[
                { key: "violence", label: "Violence", desc: "Physical assault, death, gore, combat" },
                { key: "helplessness", label: "Helplessness", desc: "Captivity, loss of control, powerlessness" },
                { key: "unnatural", label: "Unnatural", desc: "Entities, mythos, things that shouldn't exist \u2014 no adaptation possible" },
              ].map(opt => (
                <div key={opt.key} onClick={() => setCategory(opt.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                    borderRadius: 5, cursor: "pointer",
                    border: `1px solid ${category === opt.key ? "rgba(130,80,160,0.6)" : "rgba(130,80,160,0.15)"}`,
                    background: category === opt.key ? "rgba(130,80,160,0.1)" : "rgba(255,255,255,0.02)",
                    transition: "all 0.15s",
                  }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                    border: `2px solid ${category === opt.key ? "#9060A0" : "rgba(130,80,160,0.35)"}`,
                    background: category === opt.key ? "rgba(130,80,160,0.3)" : "transparent",
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: category === opt.key ? "#D4D8C8" : "#A0A890", fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>{opt.label.toUpperCase()}</div>
                    <div style={{ fontSize: 10, color: "#5A6A40", marginTop: 2 }}>{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button className="btn" disabled={!category} onClick={advanceStep}
                style={{ borderColor: "rgba(130,80,160,0.4)", background: "rgba(130,80,160,0.1)", color: category ? "#9060A0" : "#5A4060", padding: "10px 28px", letterSpacing: 3, opacity: category ? 1 : 0.5 }}>
                NEXT &rarr;
              </button>
            </div>
          </div>
        )}

        {/* -- STEP 2: Temporary Insanity -- */}
        {step === 2 && (
          <div>
            <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 16, color: "#C49050", letterSpacing: 3, marginBottom: 8 }}>{"\u26A1"} TEMPORARY INSANITY</div>
            <div style={{ fontSize: 12, color: "#A0A890", lineHeight: 1.7, marginBottom: 16 }}>
              You lost <strong style={{ color: "#D4D8C8" }}>{loss} SAN</strong> in a single event &mdash; 5 or more triggers temporary insanity.
            </div>

            {!repressOpen ? (
              <>
                <div style={{ fontSize: 12, color: "#8A8A70", marginBottom: 12 }}>Choose your agent's reaction:</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {[
                    { key: "flee", label: "FLEE", desc: `Move away at full speed for ${Number(char.stats.con.score) || "?"} turns` },
                    { key: "struggle", label: "STRUGGLE", desc: "Fight nearby threats indiscriminately until incapacitated" },
                    { key: "submit", label: "SUBMIT", desc: "Collapse into catatonia or unconsciousness" },
                  ].map(opt => (
                    <div key={opt.key} onClick={() => setReaction(opt.key)}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                        borderRadius: 5, cursor: "pointer",
                        border: `1px solid ${reaction === opt.key ? "rgba(196,144,80,0.6)" : "rgba(196,144,80,0.2)"}`,
                        background: reaction === opt.key ? "rgba(196,144,80,0.1)" : "rgba(255,255,255,0.02)",
                        transition: "all 0.15s",
                      }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${reaction === opt.key ? "#C49050" : "rgba(196,144,80,0.35)"}`,
                        background: reaction === opt.key ? "rgba(196,144,80,0.3)" : "transparent",
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: reaction === opt.key ? "#D4D8C8" : "#A0A890", fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>{opt.label}</div>
                        <div style={{ fontSize: 10, color: "#5A6A40", marginTop: 2 }}>{opt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button className="btn btn-sm" onClick={() => setRepressOpen(true)}
                    style={{ borderColor: "rgba(80,140,80,0.3)", color: "#60A060", fontSize: 11, background: "rgba(80,140,80,0.08)" }}>
                    {"\u21A9"} REPRESS (spend WP + Bond)
                  </button>
                  <button className="btn" disabled={!reaction} onClick={advanceStep}
                    style={{ borderColor: "rgba(196,144,80,0.4)", background: "rgba(196,144,80,0.1)", color: reaction ? "#C49050" : "#5A4A30", padding: "10px 24px", letterSpacing: 3, opacity: reaction ? 1 : 0.5 }}>
                    {isLastStep ? "DONE" : "NEXT \u2192"}
                  </button>
                </div>
              </>
            ) : (
              /* Repress sub-form */
              <div style={{ background: "rgba(80,140,80,0.06)", border: "1px solid rgba(80,140,80,0.2)", borderRadius: 6, padding: "16px 18px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#60A060", fontFamily: "'Special Elite', cursive", letterSpacing: 2, marginBottom: 12 }}>REPRESS INSANITY</div>
                <div style={{ fontSize: 11, color: "#5A6A50", marginBottom: 16, lineHeight: 1.6 }}>
                  Roll 1d4. Spend that many WP and reduce a bond by the same amount. On a successful SAN roll, the reaction is suppressed.
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#5A6A40", marginBottom: 4 }}>WP TO SPEND (1d4 result)</div>
                    <input type="number" min={1} max={Math.max(1, wpCurrent - 1)} value={repressWp}
                      onChange={e => setRepressWp(Math.max(1, Math.min(wpCurrent - 1, Number(e.target.value) || 1)))}
                      style={{ width: 60, textAlign: "center", background: "rgba(80,140,80,0.08)", border: "1px solid rgba(80,140,80,0.3)", borderRadius: 4, padding: "6px 4px", color: "#D4D8C8", fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", outline: "none" }} />
                    <div style={{ fontSize: 9, color: "#5A6A40", marginTop: 2 }}>WP: {wpCurrent} &rarr; {Math.max(0, wpCurrent - repressWp)}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <div style={{ fontSize: 10, color: "#5A6A40", marginBottom: 4 }}>BOND TO REDUCE</div>
                    <select value={repressBondIdx ?? ""} onChange={e => setRepressBondIdx(Number(e.target.value))}
                      style={{ width: "100%", background: "rgba(80,140,80,0.08)", border: "1px solid rgba(80,140,80,0.3)", borderRadius: 4, padding: "6px 8px", color: "#D4D8C8", fontSize: 12, outline: "none" }}>
                      <option value="">&mdash; select bond &mdash;</option>
                      {validBondsForRepress.map((b, idx) => {
                        const origIdx = char.bonds.indexOf(b);
                        return <option key={origIdx} value={origIdx}>{b.name || `Bond ${origIdx + 1}`} ({b.score})</option>;
                      })}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button className="btn btn-sm" onClick={() => setRepressOpen(false)} style={{ fontSize: 11 }}>&larr; CANCEL</button>
                  <button className="btn btn-sm" disabled={repressBondIdx === null || wpCurrent <= 1}
                    onClick={() => { setReaction("repressed"); setRepressOpen(false); advanceStep(); }}
                    style={{ borderColor: "rgba(80,140,80,0.4)", background: "rgba(80,140,80,0.1)", color: repressBondIdx !== null ? "#60A060" : "#4A5A40", fontSize: 11, opacity: repressBondIdx !== null && wpCurrent > 1 ? 1 : 0.5 }}>
                    CONFIRM REPRESS &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -- STEP 3: Breaking Point -- */}
        {step === 3 && (
          <div>
            <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 16, color: "#C44040", letterSpacing: 3, marginBottom: 8 }}>{"\u25CF"} BREAKING POINT REACHED</div>
            <div style={{ fontSize: 12, color: "#A0A890", lineHeight: 1.7, marginBottom: 16 }}>
              SAN has fallen to <strong style={{ color: "#D4D8C8" }}>{newSAN}</strong>, at or below the Breaking Point of <strong style={{ color: "#C44040" }}>{bp}</strong>.
            </div>
            <div style={{ background: "rgba(180,50,50,0.06)", border: "1px solid rgba(180,50,50,0.2)", borderRadius: 6, padding: "14px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#A06060", marginBottom: 10 }}>Select your agent's disorder &mdash; it will be added to <em>Mental Disorders</em> (section 12a).</div>
              {category && DISORDERS[category] && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: "#7A5A5A", letterSpacing: 1, marginBottom: 6, fontFamily: "'Special Elite', cursive" }}>
                    {category.toUpperCase()} DISORDERS:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {DISORDERS[category].map(d => {
                      const isSelected = selectedDisorder === d;
                      return (
                        <span key={d} onClick={() => setSelectedDisorder(d)} style={{
                          fontSize: 10, borderRadius: 3, padding: "3px 8px", cursor: "pointer", transition: "all 0.15s",
                          background: isSelected ? "rgba(180,50,50,0.25)" : "rgba(180,50,50,0.1)",
                          border: `1px solid ${isSelected ? "rgba(180,50,50,0.7)" : "rgba(180,50,50,0.2)"}`,
                          color: isSelected ? "#E09090" : "#C08080",
                          fontWeight: isSelected ? 600 : 400,
                        }}>{isSelected ? "\u2713 " : ""}{d}</span>
                      );
                    })}
                    {/* Other chip */}
                    {(() => {
                      const isSelected = selectedDisorder === "__other__";
                      return (
                        <span onClick={() => setSelectedDisorder("__other__")} style={{
                          fontSize: 10, borderRadius: 3, padding: "3px 8px", cursor: "pointer", transition: "all 0.15s",
                          background: isSelected ? "rgba(130,80,160,0.2)" : "rgba(130,80,160,0.08)",
                          border: `1px solid ${isSelected ? "rgba(130,80,160,0.6)" : "rgba(130,80,160,0.2)"}`,
                          color: isSelected ? "#C0A0D4" : "#9070A0",
                          fontWeight: isSelected ? 600 : 400,
                        }}>{isSelected ? "\u2713 " : ""}Other&hellip;</span>
                      );
                    })()}
                  </div>
                  {selectedDisorder === "__other__" && (
                    <input
                      autoFocus
                      type="text"
                      placeholder="Enter disorder name\u2026"
                      value={customDisorder}
                      onChange={e => setCustomDisorder(e.target.value)}
                      style={{
                        marginTop: 10, width: "100%", background: "rgba(130,80,160,0.08)",
                        border: "1px solid rgba(130,80,160,0.35)", borderRadius: 4,
                        padding: "6px 10px", color: "#D4D8C8", fontSize: 12,
                        fontFamily: "'IBM Plex Mono', monospace", outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>
              )}
              <div style={{ borderTop: "1px solid rgba(180,50,50,0.15)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 11, color: "#7A5A5A" }}>Breaking Point reset:</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>
                  <span style={{ color: "#C44040" }}>{bp}</span>
                  <span style={{ color: "#5A6A40" }}> &rarr; </span>
                  <span style={{ color: "#D4D8C8" }}>{newBp}</span>
                  <span style={{ fontSize: 10, color: "#5A6A40" }}> (SAN {newSAN} &minus; POW {pow})</span>
                </span>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {(() => {
                const disorderOk = selectedDisorder && (selectedDisorder !== "__other__" || customDisorder.trim());
                return (
                  <button className="btn" onClick={advanceStep} disabled={!disorderOk}
                    style={{ borderColor: "rgba(180,50,50,0.4)", background: "rgba(180,50,50,0.08)", color: disorderOk ? "#C44040" : "#5A3A3A", padding: "10px 28px", letterSpacing: 3, opacity: disorderOk ? 1 : 0.5 }}>
                    {isLastStep ? "DONE" : "NEXT \u2192"}
                  </button>
                );
              })()}
            </div>
          </div>
        )}

        {/* -- STEP 4: Adaptation tracking -- */}
        {step === 4 && (
          <div>
            {category === "unnatural" ? (
              <>
                <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 14, color: "#9060A0", letterSpacing: 2, marginBottom: 8 }}>ADAPTATION</div>
                <div style={{ fontSize: 12, color: "#A0A890", lineHeight: 1.7, marginBottom: 20 }}>
                  Unnatural SAN loss cannot be adapted to. No tracking boxes are updated.
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 14, color: "#8BA069", letterSpacing: 2, marginBottom: 8 }}>
                  ADAPTATION &mdash; {category ? category.toUpperCase() : ""}
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                  {(newBoxes || [false, false, false]).map((filled, idx) => (
                    <div key={idx} style={boxStyle(filled)}>{filled ? "\u25A0" : ""}</div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: "#A0A890", lineHeight: 1.7, marginBottom: 16, textAlign: "center" }}>
                  {anyInsanity ? (
                    <span style={{ color: "#C49050" }}>{"\u26A0"} Boxes cleared &mdash; insanity or Breaking Point occurred this event.</span>
                  ) : currentChecked >= 3 ? (
                    <span style={{ color: "#8BA069" }}>Already adapted.</span>
                  ) : (
                    <span>Box {currentChecked + 1} of 3 checked &mdash; {2 - currentChecked} more without incident to adapt.</span>
                  )}
                </div>
                {justAdapted && (
                  <div style={{ background: "rgba(139,160,105,0.08)", border: "1px solid rgba(139,160,105,0.25)", borderRadius: 6, padding: "12px 16px", marginBottom: 16 }}>
                    <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 13, color: "#A0C878", letterSpacing: 2, marginBottom: 8 }}>{"\u2605"} ADAPTED TO {category.toUpperCase()}</div>
                    {category === "violence" ? (
                      <div style={{ fontSize: 11, color: "#8A9870", lineHeight: 1.6 }}>
                        Roll 1d6. Lose that many <strong>CHA</strong> permanently. Reduce <strong>each bond score</strong> by the same amount rolled.
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: "#8A9870", lineHeight: 1.6 }}>
                        Roll 1d6. Lose that many <strong>POW</strong> permanently. Note: this raises your Breaking Point &mdash; check if a new disorder triggers.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button className="btn" onClick={isLastStep ? handleApply : advanceStep}
                style={{ borderColor: "rgba(139,160,105,0.4)", background: "rgba(139,160,105,0.08)", color: "#8BA069", padding: "10px 28px", letterSpacing: 3 }}>
                {isLastStep ? "DONE" : "NEXT \u2192"}
              </button>
            </div>
          </div>
        )}

        {/* -- STEP 5: Permanent Insanity -- */}
        {step === 5 && (
          <div>
            <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 24, color: "#C44040", letterSpacing: 6, marginBottom: 6, textShadow: "0 0 20px rgba(180,40,40,0.3)" }}>
              {"\u2620"} PERMANENT INSANITY
            </div>
            <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 10, color: "#884040", letterSpacing: 3, marginBottom: 20 }}>
              AGENT PSYCHOLOGICAL CASUALTY &mdash; DELTA GREEN
            </div>
            <div style={{ fontSize: 13, color: "#C8A080", lineHeight: 1.7, marginBottom: 10, fontStyle: "italic" }}>
              "SAN has reached zero. The mind cannot hold. What remains is not the agent you knew."
            </div>
            <div style={{ fontSize: 12, color: "#A0A890", lineHeight: 1.6, marginBottom: 20 }}>
              This agent is now a Handler-controlled NPC. Their dossier should be archived. Manifestations: catatonia, raving delusions, or psychopathy.
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="btn" onClick={handleApply} style={{ letterSpacing: 2 }}>
                ACKNOWLEDGE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
