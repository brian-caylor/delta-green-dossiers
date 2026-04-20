import React from "react";
import { Redacted } from "./Redacted";

export const Field = React.memo(({ label, value, onChange, width, mono, multiline, placeholder, small, disabled, redacted, seed, onFocus: onFocusProp, onBlur: onBlurProp }) => {
  const labelEl = label && (
    <label className="label" style={{ userSelect: "none" }}>{label}</label>
  );

  if (redacted && value) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4, width: width || "100%" }}>
        {labelEl}
        <div
          className="field-box"
          style={{ padding: small ? "4px 8px" : "8px 10px", minHeight: multiline ? 76 : undefined, opacity: 0.7 }}
        >
          <Redacted active={true} seed={seed || 5}>{value}</Redacted>
        </div>
      </div>
    );
  }

  const cls = multiline ? "field-box" : (mono ? "field-num" : "field-line");
  const shared = {
    className: cls,
    value: value || "",
    onChange: (e) => onChange(e.target.value),
    placeholder: placeholder || "",
    disabled,
    style: {
      fontFamily: mono ? "var(--font-mono)" : multiline ? "var(--font-hand)" : "var(--font-hand)",
      fontSize: small ? 13 : 15,
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? "not-allowed" : undefined,
    },
    onFocus: (e) => { if (onFocusProp) onFocusProp(e); },
    onBlur: (e) => { if (onBlurProp) onBlurProp(e); },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: width || "100%" }}>
      {labelEl}
      {multiline ? <textarea rows={3} {...shared} /> : <input type="text" {...shared} />}
    </div>
  );
});
