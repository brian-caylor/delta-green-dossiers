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
      // Auto-fill score from CHA when name goes from empty to non-empty and score is still empty
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <CollapsibleSection icon="01" title="Personal Data">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
              <label style={{ fontSize: 10, fontFamily: "'Special Elite', cursive", letterSpacing: 1.5, textTransform: "uppercase", color: "#7A8A60" }}>Sex</label>
              <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
                {["M", "F", "—"].map(s => (
                  <label key={s} style={{ display: "flex", alignItems: "center", gap: 4, cursor: isLocked ? "not-allowed" : "pointer", color: activeChar.personal.sex === s ? (isKIA ? "#884040" : "#8BA069") : "#5A6A40", fontSize: 13, fontFamily: "'Special Elite', cursive", opacity: isLocked ? 0.6 : 1 }}>
                    <div onClick={() => !isLocked && updatePersonal("sex", s)} style={{
                      width: 16, height: 16, border: `1.5px solid ${activeChar.personal.sex === s ? (isKIA ? "#884040" : "#8BA069") : "rgba(139,160,105,0.3)"}`,
                      borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: activeChar.personal.sex === s ? (isKIA ? "rgba(140,50,50,0.2)" : "rgba(139,160,105,0.2)") : "transparent", cursor: isLocked ? "not-allowed" : "pointer",
                    }}>{activeChar.personal.sex === s && <div style={{ width: 6, height: 6, borderRadius: "50%", background: isKIA ? "#884040" : "#8BA069" }} />}</div>
                    {s}
                  </label>
                ))}
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
        <span style={{ fontSize: 10, color: "#5A6A40", fontStyle: "italic", fontFamily: "'IBM Plex Mono', monospace" }}>
          Starting bonds = CHA (currently {Number(activeChar.stats?.cha?.score) || 0})
        </span>
      }>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activeChar.bonds.map((bond, i) => {
            const pct = bond.scoreMax > 0
              ? Math.max(0, Math.min(100, ((Number(bond.score) || 0) / bond.scoreMax) * 100))
              : null;
            const isBroken = bond.scoreMax > 0 && Number(bond.score) === 0;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
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
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 2, minWidth: 40, alignSelf: "flex-start", paddingTop: 6 }}>
                      <div style={{ height: 6, background: "rgba(180,80,80,0.15)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: isBroken ? "#C44040" : "#C49050",
                          borderRadius: 3,
                          transition: "width 0.4s ease, background 0.3s ease",
                        }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontSize: 9, color: isBroken ? "#C44040" : "#5A6A40", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 0.5, lineHeight: 1 }}>
                          {Number(bond.score) || 0} / {bond.scoreMax}
                        </span>
                        {isBroken && (
                          <span style={{ fontSize: 9, color: "#C44040", fontFamily: "'Special Elite', cursive", letterSpacing: 2, lineHeight: 1 }}>
                            BROKEN
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <NumField value={bond.score} width={70} disabled={isLocked} redacted={isRedacted} onChange={v => updateBondScore(i, v, bond)} />
                </div>
              </div>
            );
          })}
          {!isLocked && <button className="btn btn-sm" style={{ alignSelf: "flex-start" }} onClick={addBond}>+ ADD BOND</button>}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontFamily: "'Special Elite', cursive", color: "#7A8A60", letterSpacing: 1 }}>VIOLENCE</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {activeChar.sanLoss.violence.map((v, i) => (
                <CheckBox key={i} checked={v} disabled={isLocked} onChange={val => {
                  updateSanLossBox("violence", i, val);
                  addLogEntry(`Violence SAN ${i + 1}: ${val ? "marked" : "cleared"}`, !val, val, "manual");
                }} />
              ))}
              <span style={{ fontSize: 10, color: "#5A6A40", margin: "0 4px" }}>|</span>
              <CheckBox checked={activeChar.sanLoss.violenceAdapted} label="Adapted" disabled={isLocked} onChange={val => {
                updateAdapted("violenceAdapted", val);
                addLogEntry(`Violence Adapted: ${val ? "✓" : "cleared"}`, !val, val, "manual");
              }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontFamily: "'Special Elite', cursive", color: "#7A8A60", letterSpacing: 1 }}>HELPLESSNESS</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {activeChar.sanLoss.helplessness.map((v, i) => (
                <CheckBox key={i} checked={v} disabled={isLocked} onChange={val => {
                  updateSanLossBox("helplessness", i, val);
                  addLogEntry(`Helplessness SAN ${i + 1}: ${val ? "marked" : "cleared"}`, !val, val, "manual");
                }} />
              ))}
              <span style={{ fontSize: 10, color: "#5A6A40", margin: "0 4px" }}>|</span>
              <CheckBox checked={activeChar.sanLoss.helplessnessAdapted} label="Adapted" disabled={isLocked} onChange={val => {
                updateAdapted("helplessnessAdapted", val);
                addLogEntry(`Helplessness Adapted: ${val ? "✓" : "cleared"}`, !val, val, "manual");
              }} />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="06" title="Unnatural Encounters">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", padding: "10px 16px", background: "rgba(130,80,160,0.06)", border: "1px solid rgba(130,80,160,0.2)", borderRadius: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: "#9060A0", fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>UNNATURAL SKILL</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 700, color: "#D4D8C8" }}>{totalUnnatural}%</span>
          <span style={{ fontSize: 14, color: "#5A4060" }}>→</span>
          <span style={{ fontSize: 11, color: "#9060A0", fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>SAN MAX CEILING</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 700, color: totalUnnatural > 0 ? "#C44040" : "#D4D8C8" }}>{sanMaxCeiling}</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 10, color: "#5A4060", fontStyle: "italic" }}>99 − {totalUnnatural} = {sanMaxCeiling}</span>
        </div>
        <div style={{ fontSize: 10, color: "#5A4060", fontStyle: "italic", marginBottom: 10 }}>
          Unnatural cannot be voluntarily improved. It is awarded by the Handler after witnessing impossible things. Each point permanently reduces SAN max by 1.
        </div>

        {encounters.length === 0 && (
          <div style={{ padding: "12px 16px", textAlign: "center", color: "#4A3A60", fontSize: 12, fontStyle: "italic", borderRadius: 4, border: "1px dashed rgba(130,80,160,0.15)", marginBottom: 4 }}>
            No encounters logged. The void has not yet reached this agent.
          </div>
        )}
        {encounters.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 4 }}>
            {encounters.map((enc, idx) => (
              <div key={enc.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center", padding: "8px 12px", background: "rgba(130,80,160,0.04)", border: "1px solid rgba(130,80,160,0.12)", borderRadius: 4 }}>
                {isLocked ? (
                  <span style={{ fontSize: 12, color: "#7A6080", fontStyle: "italic" }}>{enc.desc || "(no description)"}</span>
                ) : (
                  <input type="text" value={enc.desc} placeholder="What did the agent witness?" onChange={e => { const updated = encounters.map((en, i) => i === idx ? { ...en, desc: e.target.value } : en); handleUnnaturalChange(updated); }} style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(130,80,160,0.25)", color: "#C8B8D8", fontSize: 12, padding: "2px 4px", outline: "none", fontFamily: "'IBM Plex Sans', sans-serif", width: "100%" }} />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 9, color: "#5A4060", fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>+</span>
                  {isLocked ? (
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: "#9060A0", minWidth: 28, textAlign: "center" }}>{enc.pts}</span>
                  ) : (
                    <input type="number" value={enc.pts} min={0} max={99} onChange={e => { const updated = encounters.map((en, i) => i === idx ? { ...en, pts: Math.max(0, Number(e.target.value) || 0) } : en); handleUnnaturalChange(updated); }} style={{ width: 44, textAlign: "center", background: "rgba(130,80,160,0.08)", border: "1px solid rgba(130,80,160,0.25)", borderRadius: 3, padding: "3px 2px", color: "#C8B8D8", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", outline: "none" }} />
                  )}
                  <span style={{ fontSize: 9, color: "#5A4060" }}>pts</span>
                </div>
                {!isLocked && (
                  <button onClick={() => { const updated = encounters.filter((_, i) => i !== idx); handleUnnaturalChange(updated); }} style={{ background: "none", border: "none", color: "#5A3060", cursor: "pointer", fontSize: 14, padding: "2px 6px", borderRadius: 3 }} onMouseEnter={e => e.currentTarget.style.color = "#C44040"} onMouseLeave={e => e.currentTarget.style.color = "#5A3060"} title="Remove encounter">✕</button>
                )}
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "2px 12px" }}>
              <span style={{ fontSize: 10, color: "#5A4060", fontFamily: "'IBM Plex Mono', monospace" }}>Total: {totalUnnatural} pts across {encounters.length} encounter{encounters.length !== 1 ? "s" : ""}</span>
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
