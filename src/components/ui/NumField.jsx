import React from "react";

export const NumField = React.memo(({ label, value, onChange, onFocus, onBlur, min, max, width, highlight, disabled, redacted }) => {
  const labelEl = label && (
    <label className="label" style={{ textAlign: "center", userSelect: "none" }}>{label}</label>
  );

  if (redacted && value !== "" && value !== undefined && value !== null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: width || 70, alignItems: "center" }}>
        {labelEl}
        <div
          className="field-num"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 33, opacity: 0.7 }}
        >
          <div className="redacted" style={{ height: 14, width: "70%" }}>&nbsp;</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: width || 70, alignItems: "center" }}>
      {labelEl}
      <input
        type="number"
        className="field-num"
        value={value ?? ""}
        min={min}
        max={max}
        disabled={disabled}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        style={{
          background: highlight ? "var(--redact-wash)" : undefined,
          borderColor: highlight ? "var(--redact)" : undefined,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : undefined,
        }}
      />
    </div>
  );
});
