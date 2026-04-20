import React from "react";
import Check from "./Check";

// Labeled wrapper around the ported Check primitive. Kept as a separate
// component because many tabs pass a label alongside the toggle and the
// prototype's raw Check has no label slot.
export const CheckBox = React.memo(({ checked, onChange, label, disabled }) => (
  <label
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      cursor: disabled ? "not-allowed" : "pointer",
      userSelect: "none",
      fontSize: 12,
      fontFamily: "var(--font-mono)",
      color: "var(--ink-2)",
      opacity: disabled ? 0.5 : 1,
    }}
  >
    <Check checked={checked} onChange={disabled ? undefined : onChange} />
    {label}
  </label>
));
