import React from "react";

export const Redacted = React.memo(({ children, active, inline, seed }) => {
  if (!active) return children;
  const text = typeof children === "string" ? children : "";
  if (!text && !inline) return children;
  const barCount = inline ? 1 : Math.max(1, Math.min(4, Math.ceil((text.length || 20) / 40)));
  const bars = [];
  for (let i = 0; i < barCount; i++) {
    const w = 55 + (((seed || 7) * (i + 3) * 17) % 40);
    bars.push(
      <div key={i} style={{
        height: inline ? 14 : 16, width: `${Math.min(w, 98)}%`, background: "#0A0A0A",
        borderRadius: 2, marginBottom: inline ? 0 : 3,
        boxShadow: "0 0 0 1px rgba(30,30,30,1), 0 1px 3px rgba(0,0,0,0.5)",
      }} />
    );
  }
  return (
    <div style={{ display: inline ? "inline-flex" : "flex", flexDirection: "column", justifyContent: "center", minWidth: inline ? 50 : undefined, gap: 0, padding: inline ? "0 4px" : "4px 0" }}>
      {bars}
    </div>
  );
});
