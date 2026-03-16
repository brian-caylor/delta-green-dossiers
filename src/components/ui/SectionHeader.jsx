import React from "react";

export const SectionHeader = React.memo(({ children, icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid rgba(139,160,105,0.3)" }}>
    <span style={{ fontSize: 14, color: "#8BA069", fontFamily: "'Special Elite', cursive", letterSpacing: 2, textTransform: "uppercase" }}>{icon}</span>
    <h3 style={{ margin: 0, fontSize: 13, fontFamily: "'Special Elite', cursive", letterSpacing: 3, textTransform: "uppercase", color: "#8BA069" }}>{children}</h3>
    <div style={{ flex: 1, height: 1, background: "rgba(139,160,105,0.15)" }} />
  </div>
));
