export const SessionEndModal = ({ report, onClose }) => {
  const hasGains = report.gains.length > 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20, animation: "fadeIn 0.2s ease" }}>
      <div style={{ background: "#1A1D16", border: "1px solid rgba(139,160,105,0.35)", borderRadius: 8, width: "min(520px, 92vw)", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(139,160,105,0.15)", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 18, letterSpacing: 4, color: "#8BA069", marginBottom: 4 }}>
            MISSION DEBRIEF
          </div>
          <div style={{ fontSize: 10, color: "#5A6A40", letterSpacing: 1 }}>
            {hasGains
              ? `${report.gains.length} skill${report.gains.length !== 1 ? "s" : ""} advanced \u00b7 checkboxes cleared`
              : report.noneChecked
                ? "No skills were marked as failed this mission"
                : "No skills advanced"}
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
          {report.noneChecked ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{"\uD83C\uDFAF"}</div>
              <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 14, color: "#7A8A60", letterSpacing: 2, marginBottom: 8 }}>
                NO FAILED ROLLS ON RECORD
              </div>
              <div style={{ fontSize: 12, color: "#4A5A35", lineHeight: 1.6 }}>
                Check a skill's box during play when you fail a roll.<br />
                Skills checked off will advance at mission end.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {report.gains.map((g, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr auto auto auto",
                  alignItems: "center", gap: 12, padding: "10px 14px",
                  background: "rgba(139,160,105,0.05)", borderRadius: 5,
                  border: "1px solid rgba(139,160,105,0.12)",
                  animation: `fadeIn 0.3s ease ${i * 0.04}s both`,
                }}>
                  {/* Skill name */}
                  <span style={{ fontSize: 13, color: "#C8CEB8", fontWeight: 500 }}>{g.name}</span>

                  {/* Roll badge */}
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
                    background: "rgba(139,160,105,0.15)", border: "1px solid rgba(139,160,105,0.3)",
                    borderRadius: 4, padding: "2px 8px", color: "#8BA069", whiteSpace: "nowrap",
                  }}>
                    +{g.roll} (1d4)
                  </span>

                  {/* Old value */}
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: "#5A6A40", minWidth: 32, textAlign: "right" }}>
                    {g.from}%
                  </span>

                  {/* Arrow + new value */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 64 }}>
                    <span style={{ color: "#5A6A40", fontSize: 11 }}>{"\u2192"}</span>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, fontWeight: 600,
                      color: g.to >= 90 ? "#D4A040" : g.to >= 60 ? "#80B060" : "#A0C878",
                    }}>
                      {g.to}%
                    </span>
                    {g.to >= 90 && <span title="Exceptional" style={{ fontSize: 11 }}>{"\u2605"}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(139,160,105,0.15)", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <button className="btn" onClick={onClose} style={{ padding: "8px 28px", letterSpacing: 3 }}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
