import React from "react";
import { Redacted } from "./Redacted";

export const Field = React.memo(({ label, value, onChange, width, mono, multiline, placeholder, small, disabled, redacted, seed, onFocus: onFocusProp, onBlur: onBlurProp }) => {
  if (redacted && value) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: width || "100%" }}>
        {label && <label style={{ fontSize: 10, fontFamily: "'Special Elite', cursive", letterSpacing: 1.5, textTransform: "uppercase", color: "#7A8A60", userSelect: "none" }}>{label}</label>}
        <div style={{
          width: "100%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(80,80,80,0.2)",
          borderRadius: 4, padding: small ? "4px 8px" : "8px 10px", minHeight: multiline ? 76 : undefined,
        }}>
          <Redacted active={true} seed={seed || 5}>{value}</Redacted>
        </div>
      </div>
    );
  }
  const shared = {
    value: value || "",
    onChange: e => onChange(e.target.value),
    placeholder: placeholder || "",
    disabled: disabled,
    style: {
      width: "100%", background: disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${disabled ? "rgba(80,80,80,0.2)" : "rgba(139,160,105,0.2)"}`,
      borderRadius: 4, padding: small ? "4px 8px" : "8px 10px", color: disabled ? "#666" : "#D4D8C8", fontSize: small ? 12 : 13,
      fontFamily: mono ? "'IBM Plex Mono', monospace" : "'IBM Plex Sans', sans-serif",
      outline: "none", resize: multiline ? "vertical" : "none", transition: "border-color 0.2s",
      cursor: disabled ? "not-allowed" : undefined,
    },
    onFocus: e => { if (!disabled) e.target.style.borderColor = "rgba(139,160,105,0.5)"; if (onFocusProp) onFocusProp(e); },
    onBlur: e => { e.target.style.borderColor = disabled ? "rgba(80,80,80,0.2)" : "rgba(139,160,105,0.2)"; if (onBlurProp) onBlurProp(e); },
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: width || "100%" }}>
      {label && <label style={{ fontSize: 10, fontFamily: "'Special Elite', cursive", letterSpacing: 1.5, textTransform: "uppercase", color: "#7A8A60", userSelect: "none" }}>{label}</label>}
      {multiline ? <textarea rows={3} {...shared} /> : <input type="text" {...shared} />}
    </div>
  );
});
