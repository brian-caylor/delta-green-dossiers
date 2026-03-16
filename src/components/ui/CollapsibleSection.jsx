import { useState } from "react";

export const CollapsibleSection = ({ icon, title, children, headerExtra, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: open ? 16 : 0, paddingBottom: 8, borderBottom: "1px solid rgba(139,160,105,0.3)", cursor: "pointer", userSelect: "none" }}
      >
        <span style={{ fontSize: 14, color: "#8BA069", fontFamily: "'Special Elite', cursive", letterSpacing: 2, textTransform: "uppercase" }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: 13, fontFamily: "'Special Elite', cursive", letterSpacing: 3, textTransform: "uppercase", color: "#8BA069" }}>{title}</h3>
        <div style={{ flex: 1, height: 1, background: "rgba(139,160,105,0.15)" }} />
        {headerExtra && <div onClick={e => e.stopPropagation()} style={{ flexShrink: 0 }}>{headerExtra}</div>}
        <span style={{ fontSize: 10, color: "#5A6A40", fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0, marginLeft: 4, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>&#9654;</span>
      </div>
      {open && <div>{children}</div>}
    </div>
  );
};
