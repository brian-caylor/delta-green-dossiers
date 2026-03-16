import React from "react";

export const NumField = React.memo(({ label, value, onChange, min, max, width, highlight, disabled, redacted }) => {
  if (redacted && value !== "" && value !== undefined && value !== null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: width || 70, alignItems: "center" }}>
        {label && <label style={{ fontSize: 9, fontFamily: "'Special Elite', cursive", letterSpacing: 1, textTransform: "uppercase", color: "#7A8A60", textAlign: "center", userSelect: "none" }}>{label}</label>}
        <div style={{
          width: "100%", textAlign: "center", background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(80,80,80,0.2)", borderRadius: 4, padding: "6px 4px",
          display: "flex", alignItems: "center", justifyContent: "center", minHeight: 33,
        }}>
          <div style={{ height: 14, width: "70%", background: "#0A0A0A", borderRadius: 2, boxShadow: "0 0 0 1px rgba(30,30,30,1)" }} />
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: width || 70, alignItems: "center" }}>
      {label && <label style={{ fontSize: 9, fontFamily: "'Special Elite', cursive", letterSpacing: 1, textTransform: "uppercase", color: "#7A8A60", textAlign: "center", userSelect: "none" }}>{label}</label>}
      <input type="number" value={value ?? ""} min={min} max={max} disabled={disabled}
        onChange={e => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        style={{
          width: "100%", textAlign: "center",
          background: disabled ? "rgba(255,255,255,0.02)" : highlight ? "rgba(139,160,105,0.12)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${disabled ? "rgba(80,80,80,0.2)" : highlight ? "rgba(139,160,105,0.4)" : "rgba(139,160,105,0.2)"}`,
          borderRadius: 4, padding: "6px 4px", color: disabled ? "#666" : "#D4D8C8", fontSize: 15,
          fontFamily: "'IBM Plex Mono', monospace", outline: "none",
          cursor: disabled ? "not-allowed" : undefined,
        }}
      />
    </div>
  );
});
