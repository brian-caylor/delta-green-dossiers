import React from "react";

export const CheckBox = React.memo(({ checked, onChange, label, color, disabled }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: disabled ? "not-allowed" : "pointer", userSelect: "none", fontSize: 12, color: color || "#A0A890", opacity: disabled ? 0.5 : 1 }}>
    <div onClick={() => !disabled && onChange(!checked)} style={{
      width: 18, height: 18, border: `1.5px solid ${checked ? "#8BA069" : "rgba(139,160,105,0.35)"}`,
      borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center",
      background: checked ? "rgba(139,160,105,0.15)" : "transparent", transition: "all 0.2s", cursor: disabled ? "not-allowed" : "pointer",
    }}>
      {checked && <span style={{ color: "#8BA069", fontSize: 13, fontWeight: 700, lineHeight: 1 }}>{"\u2715"}</span>}
    </div>
    {label}
  </label>
));
