import { memo, useCallback } from "react";
import { CollapsibleSection, Field } from "../ui";
import { printSessionLog } from "../../utils/printDossier";
import { extractAdded, truncLog } from "../../utils/textHelpers";

export const NotesTab = memo(function NotesTab({ activeChar, isKIA, isLocked, isRedacted, updateChar, addLogEntry, setClearLogOpen }) {
  const updateSpecialTraining = useCallback((i, field, v) => {
    updateChar(c => { const specialTraining = [...c.specialTraining]; specialTraining[i] = { ...specialTraining[i], [field]: v }; return { ...c, specialTraining }; });
  }, [updateChar]);

  const addTraining = useCallback(() => {
    updateChar(c => ({ ...c, specialTraining: [...c.specialTraining, { name: "", skillStat: "" }] }));
  }, [updateChar]);

  const log = [...(activeChar.sessionLog || [])].reverse();

  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
    catch { return "—"; }
  };

  const exportLog = useCallback(() => {
    const blob = new Blob([JSON.stringify(activeChar.sessionLog || [], null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const agentName = [activeChar.personal.firstName, activeChar.personal.lastName].filter(Boolean).join("-") || "agent";
    a.href = url;
    a.download = `${agentName}-session-log.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeChar]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <CollapsibleSection icon="14" title="Personal Details & Notes">
        <Field
          value={activeChar.personalNotes}
          multiline
          disabled={isLocked}
          redacted={isRedacted}
          seed={67}
          onChange={v => updateChar(c => ({ ...c, personalNotes: v }))}
          placeholder="Personal details, background notes..."
          onFocus={e => { e.target.dataset.logPrev = activeChar.personalNotes || ""; }}
          onBlur={e => {
            const added = extractAdded(e.target.dataset.logPrev ?? "", e.target.value);
            if (added) addLogEntry(`Personal Notes: added '${truncLog(added)}'`, null, added, "manual");
          }}
        />
      </CollapsibleSection>

      <CollapsibleSection icon="15" title="Developments Which Affect Home & Family">
        <Field
          value={activeChar.homeFamily}
          multiline
          disabled={isLocked}
          redacted={isRedacted}
          seed={71}
          onChange={v => updateChar(c => ({ ...c, homeFamily: v }))}
          placeholder="Events affecting home life and family..."
          onFocus={e => { e.target.dataset.logPrev = activeChar.homeFamily || ""; }}
          onBlur={e => {
            const added = extractAdded(e.target.dataset.logPrev ?? "", e.target.value);
            if (added) addLogEntry(`Home & Family: added '${truncLog(added)}'`, null, added, "manual");
          }}
        />
      </CollapsibleSection>

      <CollapsibleSection icon="16" title="Special Training">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activeChar.specialTraining.map((st, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 8 }}>
              <Field value={st.name} placeholder="Training description..." small disabled={isLocked} redacted={isRedacted} seed={73 + i * 5} onChange={v => updateSpecialTraining(i, "name", v)} />
              <Field value={st.skillStat} placeholder="Skill or stat used" small disabled={isLocked} onChange={v => updateSpecialTraining(i, "skillStat", v)} />
            </div>
          ))}
          {!isLocked && <button className="btn btn-sm" style={{ alignSelf: "flex-start" }} onClick={addTraining}>+ ADD TRAINING</button>}
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="17" title="Recruitment">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field value={activeChar.recruitment} multiline disabled={isLocked} redacted={isRedacted} seed={79} onChange={v => updateChar(c => ({ ...c, recruitment: v }))} placeholder="Why was this agent recruited? Why did the agent agree?" />
          <Field label="Authorizing Officer" value={activeChar.authorizingOfficer} disabled={isLocked} redacted={isRedacted} seed={83} onChange={v => updateChar(c => ({ ...c, authorizingOfficer: v }))} />
        </div>
      </CollapsibleSection>

      {/* ─── Session Log ─── */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid rgba(139,160,105,0.3)" }}>
          <span style={{ fontSize: 14, color: "#8BA069", fontFamily: "'Special Elite', cursive", letterSpacing: 2 }}>◎</span>
          <h3 style={{ margin: 0, fontSize: 13, fontFamily: "'Special Elite', cursive", letterSpacing: 3, textTransform: "uppercase", color: "#8BA069" }}>Session Log</h3>
          <div style={{ flex: 1, height: 1, background: "rgba(139,160,105,0.15)" }} />
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button
              className="btn btn-sm"
              title="Print session log"
              onClick={() => printSessionLog(activeChar)}
              style={{ borderColor: "rgba(139,160,105,0.25)", background: "rgba(139,160,105,0.06)", color: "#6A8A55", fontSize: 11 }}
            >⎙ Print</button>
            <button
              className="btn btn-sm"
              title="Export as JSON"
              onClick={exportLog}
              style={{ borderColor: "rgba(100,140,180,0.25)", background: "rgba(100,140,180,0.06)", color: "#6090B4", fontSize: 11 }}
            >⬇ Export</button>
            <button
              className="btn btn-sm"
              title="Clear all log entries"
              onClick={() => setClearLogOpen(true)}
              disabled={log.length === 0}
              style={{ borderColor: "rgba(160,80,80,0.25)", background: "rgba(160,80,80,0.06)", color: log.length === 0 ? "#4A3535" : "#A05050", fontSize: 11, opacity: log.length === 0 ? 0.5 : 1, cursor: log.length === 0 ? "not-allowed" : "pointer" }}
            >✕ Clear</button>
          </div>
        </div>

        <div style={{ maxHeight: 320, overflowY: "auto", borderRadius: 6, border: "1px solid rgba(139,160,105,0.12)", background: "rgba(255,255,255,0.02)" }}>
          {log.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "#5A6A40", fontStyle: "italic", fontSize: 12 }}>
              No changes recorded yet. Stat changes, skill advancements, and K.I.A. events will appear here automatically.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(139,160,105,0.08)", borderBottom: "1px solid rgba(139,160,105,0.2)" }}>
                  <th style={{ padding: "6px 12px", textAlign: "left", fontSize: 9, fontFamily: "'Special Elite', cursive", letterSpacing: 1.5, color: "#7A8A60", fontWeight: 400, whiteSpace: "nowrap" }}>DATE</th>
                  <th style={{ padding: "6px 12px", textAlign: "left", fontSize: 9, fontFamily: "'Special Elite', cursive", letterSpacing: 1.5, color: "#7A8A60", fontWeight: 400 }}>CHANGE</th>
                  <th style={{ padding: "6px 12px", textAlign: "center", fontSize: 9, fontFamily: "'Special Elite', cursive", letterSpacing: 1.5, color: "#7A8A60", fontWeight: 400, width: 80 }}>SOURCE</th>
                </tr>
              </thead>
              <tbody>
                {log.map((entry, i) => (
                  <tr key={entry.id ?? i} style={{ borderBottom: "1px solid rgba(139,160,105,0.07)", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(139,160,105,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "7px 12px", fontSize: 11, color: "#5A6A40", fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" }}>{fmtDate(entry.timestamp)}</td>
                    <td style={{ padding: "7px 12px", fontSize: 12, color: entry.source === "kia" ? "#C44040" : entry.source === "advancement" ? "#A0C878" : entry.source === "bond" ? "#7AAAD4" : entry.source === "san" ? "#9060A0" : entry.source === "unnatural" ? "#60A890" : "#C8CEB8", fontFamily: "'IBM Plex Mono', monospace" }}>{entry.label || "—"}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center" }}>
                      {entry.source === "advancement" && (
                        <span style={{ display: "inline-block", background: "rgba(80,140,80,0.15)", border: "1px solid rgba(80,140,80,0.35)", color: "#60A060", fontSize: 9, padding: "1px 6px", borderRadius: 3, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>ADV</span>
                      )}
                      {entry.source === "kia" && (
                        <span style={{ display: "inline-block", background: "rgba(180,50,50,0.15)", border: "1px solid rgba(180,50,50,0.35)", color: "#C44040", fontSize: 9, padding: "1px 6px", borderRadius: 3, fontFamily: "'Special Elite', cursive", letterSpacing: 2 }}>K.I.A.</span>
                      )}
                      {entry.source === "bond" && (
                        <span style={{ display: "inline-block", background: "rgba(100,140,180,0.15)", border: "1px solid rgba(100,140,180,0.35)", color: "#7AAAD4", fontSize: 9, padding: "1px 6px", borderRadius: 3, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>PROJ</span>
                      )}
                      {entry.source === "san" && (
                        <span style={{ display: "inline-block", background: "rgba(130,80,160,0.15)", border: "1px solid rgba(130,80,160,0.35)", color: "#9060A0", fontSize: 9, padding: "1px 6px", borderRadius: 3, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>SAN</span>
                      )}
                      {entry.source === "unnatural" && (
                        <span style={{ display: "inline-block", background: "rgba(80,160,130,0.12)", border: "1px solid rgba(80,160,130,0.3)", color: "#60A890", fontSize: 9, padding: "1px 6px", borderRadius: 3, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 1 }}>UNNAT</span>
                      )}
                      {entry.source === "manual" && (
                        <span style={{ color: "#4A5A40", fontSize: 11 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {log.length > 0 && (
          <div style={{ marginTop: 6, fontSize: 9, color: "#4A5A35", textAlign: "right" }}>
            {log.length} entr{log.length !== 1 ? "ies" : "y"} · newest first
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, padding: 16, border: `1px solid ${isKIA ? "rgba(140,50,50,0.15)" : "rgba(139,160,105,0.15)"}`, borderRadius: 6, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Special Elite', cursive", fontSize: 48, color: isKIA ? "rgba(180,50,50,0.1)" : "rgba(139,160,105,0.07)",
          transform: "rotate(-12deg)", letterSpacing: 8, pointerEvents: "none",
        }}>{isKIA ? "K.I.A." : "CLASSIFIED"}</div>
        <div style={{ fontSize: 10, fontFamily: "'Special Elite', cursive", letterSpacing: 2, color: isKIA ? "#664040" : "#5A6A40" }}>
          DD FORM 315 &nbsp;&nbsp;|&nbsp;&nbsp; TOP SECRET // ORCON // SPECIAL ACCESS REQUIRED — DELTA GREEN
        </div>
        <div style={{ fontSize: 9, color: "#4A5A35", marginTop: 4 }}>
          AGENT DOCUMENTATION SHEET &nbsp;&nbsp;|&nbsp;&nbsp; 112382
        </div>
      </div>
    </div>
  );
});
