import { memo, useCallback } from "react";
import { CollapsibleSection, Field, NumField, CheckBox } from "../ui";
import { UnnaturalAddForm } from "../modals";
import { extractAdded, truncLog } from "../../utils/textHelpers";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export const PersonalTab = memo(function PersonalTab({ activeChar, isKIA, isLocked, isRedacted, updateChar, addLogEntry, handleUnnaturalChange }) {
  const isMobile = useMediaQuery("(max-width: 700px)");
  const updatePersonal = useCallback((key, v) => {
    updateChar(c => ({ ...c, personal: { ...c.personal, [key]: v } }));
  }, [updateChar]);

  const updateBondName = useCallback((i, v) => {
    updateChar(c => {
      const bonds = [...c.bonds];
      const old = bonds[i];
      const update = { ...old, name: v };
      if (!old.name && v.trim() && (old.score === "" || old.score === null || old.score === undefined)) {
        const cha = Number(c.stats?.cha?.score) || 0;
        if (cha > 0) { update.score = cha; update.scoreMax = cha; }
      }
      bonds[i] = update;
      return { ...c, bonds };
    });
  }, [updateChar]);

  const updateBondScore = useCallback((i, v, bond) => {
    const from = Number(bond.score) || 0;
    const to = Number(v) || 0;
    const newScoreMax = (bond.scoreMax === null || bond.scoreMax === undefined) && to > 0 ? to : (bond.scoreMax ?? null);
    updateChar(c => { const bonds = [...c.bonds]; bonds[i] = { ...bonds[i], score: v, scoreMax: newScoreMax }; return { ...c, bonds }; });
    const bondLabel = bond.name ? `Bond (${bond.name})` : `Bond ${i + 1}`;
    if (from !== to) addLogEntry(`${bondLabel} Score: ${from}→${to}`, from, to, "manual");
  }, [updateChar, addLogEntry]);

  const addBond = useCallback(() => {
    updateChar(c => ({ ...c, bonds: [...c.bonds, { name: "", score: "", scoreMax: null }] }));
  }, [updateChar]);

  const updateSanLossBox = useCallback((type, i, val) => {
    updateChar(c => { const arr = [...c.sanLoss[type]]; arr[i] = val; return { ...c, sanLoss: { ...c.sanLoss, [type]: arr } }; });
  }, [updateChar]);

  const updateAdapted = useCallback((key, val) => {
    updateChar(c => ({ ...c, sanLoss: { ...c.sanLoss, [key]: val } }));
  }, [updateChar]);

  const encounters = activeChar.unnaturalEncounters || [];
  const totalUnnatural = encounters.reduce((sum, e) => sum + (Number(e.pts) || 0), 0);
  const sanMaxCeiling = Math.max(0, 99 - totalUnnatural);

  const kiaStyle = isKIA ? { color: "var(--redact)" } : {};

  return (
    <div className="col" style={{ gap: 24 }}>
      <CollapsibleSection icon="01" title="Personal Data">
        <div className="col" style={{ gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr 60px" : "1fr 1fr 80px", gap: isMobile ? 8 : 12 }}>
            <Field label="Last Name" value={activeChar.personal.lastName} disabled={isLocked} redacted={isRedacted} seed={3} onChange={v => updatePersonal("lastName", v)} />
            <Field label="First Name" value={activeChar.personal.firstName} disabled={isLocked} redacted={isRedacted} seed={7} onChange={v => updatePersonal("firstName", v)} />
            <Field label="M.I." value={activeChar.personal.middleInitial} disabled={isLocked} redacted={isRedacted} seed={11} onChange={v => updatePersonal("middleInitial", v)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Profession (Rank if applicable)" value={activeChar.personal.profession} disabled={isLocked} onChange={v => updatePersonal("profession", v)} />
            <Field label="Employer" value={activeChar.personal.employer} disabled={isLocked} redacted={isRedacted} seed={13} onChange={v => updatePersonal("employer", v)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 120px 120px 120px", gap: isMobile ? 8 : 12 }}>
            <Field label="Nationality" value={activeChar.personal.nationality} disabled={isLocked} onChange={v => updatePersonal("nationality", v)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label className="label">Sex</label>
              <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                {["M", "F", "—"].map(s => {
                  const checked = activeChar.personal.sex === s;
                  return (
                    <label key={s} style={{ display: "flex", alignItems: "center", gap: 6, cursor: isLocked ? "not-allowed" : "pointer", fontFamily: "var(--font-hand)", fontSize: 14, color: "var(--ink)", opacity: isLocked ? 0.5 : 1, ...kiaStyle }}>
                      <span
                        onClick={() => !isLocked && updatePersonal("sex", s)}
                        style={{
                          width: 16, height: 16,
                          border: `1.5px solid ${checked ? "var(--ink)" : "var(--ink-muted)"}`,
                          borderRadius: "50%",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          background: checked ? "var(--ink)" : "transparent",
                          cursor: isLocked ? "not-allowed" : "pointer",
                        }}
                      >
                        {checked && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--paper)" }} />}
                      </span>
                      {s}
                    </label>
                  );
                })}
              </div>
            </div>
            <Field label="Age" value={activeChar.personal.age} disabled={isLocked} onChange={v => updatePersonal("age", v)} />
            <Field label="D.O.B." value={activeChar.personal.dob} disabled={isLocked} redacted={isRedacted} seed={19} onChange={v => updatePersonal("dob", v)} />
          </div>
          <Field label="Education and Occupational History" value={activeChar.personal.education} multiline disabled={isLocked} redacted={isRedacted} seed={23} onChange={v => updatePersonal("education", v)} />
          <Field label="Physical Description" value={activeChar.physicalDesc} multiline disabled={isLocked} redacted={isRedacted} seed={29} onChange={v => updateChar(c => ({ ...c, physicalDesc: v }))} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="02" title="Bonds" headerExtra={
        <span className="label" style={{ fontStyle: "italic" }}>
          Starting bonds = CHA (currently {Number(activeChar.stats?.cha?.score) || 0})
        </span>
      }>
        <div className="col" style={{ gap: 8 }}>
          {activeChar.bonds.map((bond, i) => {
            const pct = bond.scoreMax > 0
              ? Math.max(0, Math.min(100, ((Number(bond.score) || 0) / bond.scoreMax) * 100))
              : null;
            const isBroken = bond.scoreMax > 0 && Number(bond.score) === 0;
            return (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ flex: 2 }}>
                  <Field
                    value={bond.name}
                    placeholder={`Bond ${i + 1}`}
                    disabled={isLocked}
                    redacted={isRedacted}
                    seed={31 + i * 3}
                    onChange={v => updateBondName(i, v)}
                    onFocus={e => { e.target.dataset.logPrev = bond.name || ""; }}
                    onBlur={e => {
                      const prev = e.target.dataset.logPrev ?? "";
                      const next = e.target.value;
                      if (next.trim() && next.trim() !== (prev || "").trim()) {
                        addLogEntry(`Bond ${i + 1}: '${truncLog(next.trim())}'`, prev, next, "manual");
                      }
                    }}
                  />
                </div>
                {pct !== null && !isRedacted && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, minWidth: 40, paddingTop: 10 }}>
                    <div style={{ height: 6, background: "var(--line-soft)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: isBroken ? "var(--redact)" : "var(--ink-2)",
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 9, fontFamily: "var(--font-mono)", color: isBroken ? "var(--redact)" : "var(--ink-3)" }}>
                      <span>{Number(bond.score) || 0} / {bond.scoreMax}</span>
                      {isBroken && <span className="handwritten" style={{ letterSpacing: 2 }}>BROKEN</span>}
                    </div>
                  </div>
                )}
                <NumField value={bond.score} width={70} disabled={isLocked} redacted={isRedacted} onChange={v => updateBondScore(i, v, bond)} />
              </div>
            );
          })}
          {!isLocked && <button type="button" className="btn btn-sm" style={{ alignSelf: "flex-start" }} onClick={addBond}>+ ADD BOND</button>}
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="03" title="Motivations">
        <Field
          value={activeChar.motivations}
          multiline
          disabled={isLocked}
          redacted={isRedacted}
          seed={41}
          onChange={v => updateChar(c => ({ ...c, motivations: v }))}
          placeholder="Agent motivations and psychological notes..."
          onFocus={e => { e.target.dataset.logPrev = activeChar.motivations || ""; }}
          onBlur={e => {
            const added = extractAdded(e.target.dataset.logPrev ?? "", e.target.value);
            if (added) addLogEntry(`Motivations: added '${truncLog(added)}'`, null, added, "manual");
          }}
        />
      </CollapsibleSection>

      <CollapsibleSection icon="04" title="Mental Disorders">
        <Field
          value={activeChar.mentalDisorders || ""}
          multiline
          disabled={isLocked}
          redacted={isRedacted}
          seed={43}
          onChange={v => updateChar(c => ({ ...c, mentalDisorders: v }))}
          placeholder="Disorders, acute episodes, and treatment notes..."
          onFocus={e => { e.target.dataset.logPrev = activeChar.mentalDisorders || ""; }}
          onBlur={e => {
            const added = extractAdded(e.target.dataset.logPrev ?? "", e.target.value);
            if (added) addLogEntry(`Mental Disorders: added '${truncLog(added)}'`, null, added, "manual");
          }}
        />
      </CollapsibleSection>

      <CollapsibleSection icon="05" title="Incidents of SAN Loss Without Going Insane">
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
          <div className="col" style={{ gap: 8 }}>
            <span className="label">VIOLENCE</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {activeChar.sanLoss.violence.map((v, i) => (
                <CheckBox key={i} checked={v} disabled={isLocked} onChange={val => {
                  updateSanLossBox("violence", i, val);
                  addLogEntry(`Violence SAN ${i + 1}: ${val ? "marked" : "cleared"}`, !val, val, "manual");
                }} />
              ))}
              <span style={{ color: "var(--ink-3)", margin: "0 4px" }}>|</span>
              <CheckBox checked={activeChar.sanLoss.violenceAdapted} label="Adapted" disabled={isLocked} onChange={val => {
                updateAdapted("violenceAdapted", val);
                addLogEntry(`Violence Adapted: ${val ? "✓" : "cleared"}`, !val, val, "manual");
              }} />
            </div>
          </div>
          <div className="col" style={{ gap: 8 }}>
            <span className="label">HELPLESSNESS</span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {activeChar.sanLoss.helplessness.map((v, i) => (
                <CheckBox key={i} checked={v} disabled={isLocked} onChange={val => {
                  updateSanLossBox("helplessness", i, val);
                  addLogEntry(`Helplessness SAN ${i + 1}: ${val ? "marked" : "cleared"}`, !val, val, "manual");
                }} />
              ))}
              <span style={{ color: "var(--ink-3)", margin: "0 4px" }}>|</span>
              <CheckBox checked={activeChar.sanLoss.helplessnessAdapted} label="Adapted" disabled={isLocked} onChange={val => {
                updateAdapted("helplessnessAdapted", val);
                addLogEntry(`Helplessness Adapted: ${val ? "✓" : "cleared"}`, !val, val, "manual");
              }} />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="06" title="Unnatural Encounters">
        <div className="row flex-wrap" style={{ gap: 12, padding: "10px 16px", border: "1px solid var(--stamp-blue)", background: "rgba(31,58,107,0.06)", marginBottom: 8 }}>
          <span className="label" style={{ color: "var(--stamp-blue)" }}>UNNATURAL SKILL</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{totalUnnatural}%</span>
          <span style={{ color: "var(--ink-3)" }}>→</span>
          <span className="label" style={{ color: "var(--stamp-blue)" }}>SAN MAX CEILING</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: totalUnnatural > 0 ? "var(--redact)" : "var(--ink)" }}>{sanMaxCeiling}</span>
          <span style={{ flex: 1 }} />
          <span className="label" style={{ fontStyle: "italic" }}>99 − {totalUnnatural} = {sanMaxCeiling}</span>
        </div>
        <div className="label" style={{ fontStyle: "italic", marginBottom: 10 }}>
          Unnatural cannot be voluntarily improved. It is awarded by the Handler after witnessing impossible things. Each point permanently reduces SAN max by 1.
        </div>

        {encounters.length === 0 && (
          <div style={{ padding: "12px 16px", textAlign: "center", fontStyle: "italic", border: "1px dashed var(--line-2)", marginBottom: 4 }} className="label">
            No encounters logged. The void has not yet reached this agent.
          </div>
        )}
        {encounters.length > 0 && (
          <div className="col" style={{ gap: 4, marginBottom: 4 }}>
            {encounters.map((enc, idx) => (
              <div key={enc.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center", padding: "8px 12px", border: "1px solid var(--line-2)" }}>
                {isLocked ? (
                  <span style={{ fontSize: 13, color: "var(--ink-2)", fontStyle: "italic" }}>{enc.desc || "(no description)"}</span>
                ) : (
                  <input type="text" value={enc.desc} placeholder="What did the agent witness?"
                    onChange={e => { const updated = encounters.map((en, i) => i === idx ? { ...en, desc: e.target.value } : en); handleUnnaturalChange(updated); }}
                    className="field-line"
                    style={{ fontFamily: "var(--font-hand)" }}
                  />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span className="label">+</span>
                  {isLocked ? (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--ink)", minWidth: 28, textAlign: "center" }}>{enc.pts}</span>
                  ) : (
                    <input type="number" value={enc.pts} min={0} max={99}
                      onChange={e => { const updated = encounters.map((en, i) => i === idx ? { ...en, pts: Math.max(0, Number(e.target.value) || 0) } : en); handleUnnaturalChange(updated); }}
                      className="field-num" style={{ width: 52 }}
                    />
                  )}
                  <span className="label">pts</span>
                </div>
                {!isLocked && (
                  <button type="button" className="btn btn-tiny btn-ghost"
                    onClick={() => { const updated = encounters.filter((_, i) => i !== idx); handleUnnaturalChange(updated); }}
                    title="Remove encounter"
                  >✕</button>
                )}
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "2px 12px" }}>
              <span className="label">Total: {totalUnnatural} pts across {encounters.length} encounter{encounters.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        )}

        {!isLocked && (
          <UnnaturalAddForm onAdd={(desc, pts) => {
            const newEntry = { id: Date.now() + Math.random(), desc, pts: Math.max(0, Number(pts) || 0), date: new Date().toISOString() };
            handleUnnaturalChange([...encounters, newEntry]);
          }} />
        )}
      </CollapsibleSection>
    </div>
  );
});
