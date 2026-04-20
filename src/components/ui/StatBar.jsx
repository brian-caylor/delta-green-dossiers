import React from "react";

export const StatBar = React.memo(({ current, max, color }) => {
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  return (
    <div style={{
      height: 6,
      background: "var(--line-soft)",
      overflow: "hidden",
      width: "100%",
    }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        background: color || "var(--ink)",
        transition: "width 0.4s ease",
      }} />
    </div>
  );
});
