import React from "react";

export const KIABanner = React.memo(({ kia, kiaDate, redacted, onToggleRedact, onRevive }) => {
  if (!kia) return null;
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(140,35,35,0.15) 0%, rgba(100,25,25,0.25) 100%)",
      border: "1px solid rgba(180,50,50,0.3)", borderRadius: 0,
      padding: "12px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      borderBottom: "1px solid rgba(180,50,50,0.2)", animation: "fadeIn 0.5s ease",
    }}>
      <div style={{
        background: "rgba(180,50,50,0.2)", border: "2px solid rgba(180,50,50,0.5)",
        borderRadius: 4, padding: "6px 14px", fontFamily: "'Special Elite', cursive",
        fontSize: 18, letterSpacing: 6, color: "#C44040", fontWeight: 400,
        textShadow: "0 0 10px rgba(180,50,50,0.3)", transform: "rotate(-1deg)",
      }}>K.I.A.</div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 13, color: "#C44040", letterSpacing: 2, marginBottom: 2 }}>
          AGENT STATUS: KILLED IN ACTION
        </div>
        <div style={{ fontSize: 10, color: "#884040", fontFamily: "'IBM Plex Mono', monospace" }}>
          FILE ARCHIVED {kiaDate ? new Date(kiaDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }).toUpperCase() : ""} {"\u2014"} SENSITIVE DETAILS {redacted ? "REDACTED" : "DECLASSIFIED"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className={`btn btn-sm ${redacted ? "" : "btn-danger"}`} onClick={onToggleRedact}
          style={redacted ? { borderColor: "rgba(180,160,50,0.4)", background: "rgba(180,160,50,0.1)", color: "#B4A040" } : {}}
        >{redacted ? "\u2B1B DECLASSIFY" : "\u2B1C RECLASSIFY"}</button>
        <button className="btn btn-sm" onClick={onRevive} style={{ borderColor: "rgba(80,140,80,0.4)", background: "rgba(80,140,80,0.1)", color: "#60A060" }}>
          {"\u21A9"} REVIVE AGENT
        </button>
      </div>
    </div>
  );
});
