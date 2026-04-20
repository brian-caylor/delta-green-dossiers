import React from "react";

export const SectionHeader = React.memo(({ children, icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid var(--line)" }}>
    {icon && <span className="handwritten" style={{ fontSize: 14, letterSpacing: 2, color: "var(--ink-2)" }}>{icon}</span>}
    <h3 className="handwritten" style={{ margin: 0, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--ink)" }}>{children}</h3>
    <div style={{ flex: 1, height: 1, background: "var(--line-2)" }} />
  </div>
));
