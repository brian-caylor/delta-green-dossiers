export const SessionEndModal = ({ report, onClose }) => {
  const hasGains = report.gains.length > 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: "min(520px, 92vw)", padding: 0, display: "flex", flexDirection: "column", maxHeight: "85vh" }}>
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--line)" }}>
          <div className="modal-title">MISSION DEBRIEF</div>
          <div className="label">
            {hasGains
              ? `${report.gains.length} skill${report.gains.length !== 1 ? "s" : ""} advanced · checkboxes cleared`
              : report.noneChecked
                ? "No skills were marked as failed this mission"
                : "No skills advanced"}
          </div>
        </div>

        <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
          {report.noneChecked ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
              <div className="handwritten" style={{ fontSize: 14, letterSpacing: 2, marginBottom: 8, color: "var(--ink-2)" }}>
                NO FAILED ROLLS ON RECORD
              </div>
              <div className="label" style={{ fontStyle: "italic", lineHeight: 1.6 }}>
                Check a skill's box during play when you fail a roll.<br />
                Skills checked off will advance at mission end.
              </div>
            </div>
          ) : (
            <div className="col" style={{ gap: 4 }}>
              {report.gains.map((g, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr auto auto auto",
                  alignItems: "center", gap: 12, padding: "10px 14px",
                  border: "1px solid var(--line-2)",
                }}>
                  <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{g.name}</span>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 11,
                    border: "1px solid var(--ok)", color: "var(--ok)",
                    padding: "2px 8px", whiteSpace: "nowrap",
                  }}>
                    +{g.roll} (1d4)
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-3)", minWidth: 32, textAlign: "right" }}>
                    {g.from}%
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 64 }}>
                    <span style={{ color: "var(--ink-3)", fontSize: 11 }}>→</span>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 600,
                      color: g.to >= 90 ? "var(--redact)" : "var(--ok)",
                    }}>
                      {g.to}%
                    </span>
                    {g.to >= 90 && <span title="Exceptional" style={{ fontSize: 11 }}>★</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>CLOSE</button>
        </div>
      </div>
    </div>
  );
};
