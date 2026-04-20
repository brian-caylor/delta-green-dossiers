import { memo, useCallback } from "react";
import { CollapsibleSection, Field } from "../ui";
import { printSessionLog } from "../../utils/printDossier";
import { extractAdded, truncLog } from "../../utils/textHelpers";

const SOURCE_BADGES = {
  advancement: { label: "ADV", color: "var(--ok)", bg: "rgba(45,90,61,0.12)" },
  kia:         { label: "K.I.A.", color: "var(--redact)", bg: "var(--redact-wash)" },
  bond:        { label: "PROJ", color: "var(--stamp-blue)", bg: "rgba(31,58,107,0.12)" },
  san:         { label: "SAN", color: "var(--redact-2)", bg: "var(--redact-wash)" },
  unnatural:   { label: "UNNAT", color: "var(--ink-2)", bg: "var(--line-soft)" },
};

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
    <div className="col" style={{ gap: 24 }}>
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
        <div className="col" style={{ gap: 8 }}>
          {activeChar.specialTraining.map((st, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 8 }}>
              <Field value={st.name} placeholder="Training description..." small disabled={isLocked} redacted={isRedacted} seed={73 + i * 5} onChange={v => updateSpecialTraining(i, "name", v)} />
              <Field value={st.skillStat} placeholder="Skill or stat used" small disabled={isLocked} onChange={v => updateSpecialTraining(i, "skillStat", v)} />
            </div>
          ))}
          {!isLocked && <button type="button" className="btn btn-sm" style={{ alignSelf: "flex-start" }} onClick={addTraining}>+ ADD TRAINING</button>}
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="17" title="Recruitment">
        <div className="col" style={{ gap: 12 }}>
          <Field value={activeChar.recruitment} multiline disabled={isLocked} redacted={isRedacted} seed={79} onChange={v => updateChar(c => ({ ...c, recruitment: v }))} placeholder="Why was this agent recruited? Why did the agent agree?" />
          <Field label="Authorizing Officer" value={activeChar.authorizingOfficer} disabled={isLocked} redacted={isRedacted} seed={83} onChange={v => updateChar(c => ({ ...c, authorizingOfficer: v }))} />
        </div>
      </CollapsibleSection>

      {/* Session Log */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
          <span className="handwritten" style={{ fontSize: 14, letterSpacing: 2, color: "var(--ink-2)" }}>◎</span>
          <h3 className="handwritten" style={{ margin: 0, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--ink)" }}>Session Log</h3>
          <div style={{ flex: 1, height: 1, background: "var(--line-2)" }} />
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button type="button" className="btn btn-sm btn-ghost" title="Print session log" onClick={() => printSessionLog(activeChar)}>⎙ Print</button>
            <button type="button" className="btn btn-sm btn-ghost" title="Export as JSON" onClick={exportLog}>⬇ Export</button>
            <button type="button" className="btn btn-sm btn-danger" title="Clear all log entries" onClick={() => setClearLogOpen(true)} disabled={log.length === 0}>✕ Clear</button>
          </div>
        </div>

        <div style={{ maxHeight: 320, overflowY: "auto", border: "1px solid var(--line-2)" }}>
          {log.length === 0 ? (
            <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--ink-3)", fontStyle: "italic", fontSize: 12 }}>
              No changes recorded yet. Stat changes, skill advancements, and K.I.A. events will appear here automatically.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ whiteSpace: "nowrap" }}>DATE</th>
                  <th>CHANGE</th>
                  <th style={{ textAlign: "center", width: 80 }}>SOURCE</th>
                </tr>
              </thead>
              <tbody>
                {log.map((entry, i) => {
                  const badge = SOURCE_BADGES[entry.source];
                  return (
                    <tr key={entry.id ?? i}>
                      <td style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{fmtDate(entry.timestamp)}</td>
                      <td style={{ fontSize: 12, color: "var(--ink)", fontFamily: "var(--font-mono)" }}>{entry.label || "—"}</td>
                      <td style={{ textAlign: "center" }}>
                        {badge ? (
                          <span style={{ display: "inline-block", background: badge.bg, border: `1px solid ${badge.color}`, color: badge.color, fontSize: 9, padding: "1px 6px", fontFamily: "var(--font-mono)", letterSpacing: 1 }}>{badge.label}</span>
                        ) : (
                          <span style={{ color: "var(--ink-muted)", fontSize: 11 }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {log.length > 0 && (
          <div className="label" style={{ marginTop: 6, textAlign: "right" }}>
            {log.length} entr{log.length !== 1 ? "ies" : "y"} · newest first
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, padding: 16, border: "1px solid var(--line-2)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-hand)", fontSize: 48, color: isKIA ? "rgba(140,29,29,0.1)" : "rgba(26,23,18,0.07)",
          transform: "rotate(-12deg)", letterSpacing: 8, pointerEvents: "none",
        }}>{isKIA ? "K.I.A." : "CLASSIFIED"}</div>
        <div className="label" style={{ letterSpacing: 2 }}>
          DD FORM 315 &nbsp;&nbsp;|&nbsp;&nbsp; TOP SECRET // ORCON // SPECIAL ACCESS REQUIRED — DELTA GREEN
        </div>
        <div className="label" style={{ marginTop: 4 }}>
          AGENT DOCUMENTATION SHEET &nbsp;&nbsp;|&nbsp;&nbsp; 112382
        </div>
      </div>
    </div>
  );
});
