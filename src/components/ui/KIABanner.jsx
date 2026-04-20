import React from "react";

export const KIABanner = React.memo(({ kia, kiaDate, redacted, onToggleRedact, onRevive }) => {
  if (!kia) return null;
  const dateStr = kiaDate
    ? new Date(kiaDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }).toUpperCase()
    : "";
  return (
    <div
      style={{
        background: "var(--redact-wash)",
        borderTop: "1px solid var(--redact)",
        borderBottom: "1px solid var(--redact)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div
        className="heading"
        style={{
          border: "3px double var(--redact)",
          color: "var(--redact)",
          padding: "4px 14px",
          fontSize: 18,
          letterSpacing: 6,
          transform: "rotate(-1deg)",
          fontFamily: "var(--font-hand)",
        }}
      >
        K.I.A.
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div className="handwritten" style={{ fontSize: 13, color: "var(--redact)", letterSpacing: 2, marginBottom: 2 }}>
          AGENT STATUS: KILLED IN ACTION
        </div>
        <div className="label" style={{ color: "var(--ink-3)" }}>
          FILE ARCHIVED {dateStr} — SENSITIVE DETAILS {redacted ? "REDACTED" : "DECLASSIFIED"}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          className={`btn btn-sm ${redacted ? "btn-ghost" : "btn-danger"}`}
          onClick={onToggleRedact}
        >
          {redacted ? "⬛ DECLASSIFY" : "⬜ RECLASSIFY"}
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onRevive}>
          ↩ REVIVE AGENT
        </button>
      </div>
    </div>
  );
});
