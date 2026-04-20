import { useState } from "react";

export const CollapsibleSection = ({ icon, title, children, headerExtra, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: open ? 16 : 0,
          paddingBottom: 8,
          borderBottom: "1px solid var(--line)",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {icon && <span className="handwritten" style={{ fontSize: 14, letterSpacing: 2, color: "var(--ink-2)" }}>{icon}</span>}
        <h3 className="handwritten" style={{ margin: 0, fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "var(--ink)" }}>{title}</h3>
        <div style={{ flex: 1, height: 1, background: "var(--line-2)" }} />
        {headerExtra && <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0 }}>{headerExtra}</div>}
        <span style={{
          fontSize: 10,
          color: "var(--ink-3)",
          fontFamily: "var(--font-mono)",
          flexShrink: 0,
          marginLeft: 4,
          transition: "transform 0.2s",
          display: "inline-block",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
        }}>▶</span>
      </div>
      {open && <div>{children}</div>}
    </div>
  );
};
