export const ImportChoiceModal = ({ onPdf, onJson, onClose }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ background: "rgba(30,35,25,0.97)", border: "1px solid rgba(139,160,105,0.25)", borderRadius: 8, padding: "28px 32px", maxWidth: 420, width: "90%", position: "relative" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none", color: "#5A6A40", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>{"\u2715"}</button>
      <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 16, letterSpacing: 3, color: "#8BA069", marginBottom: 6 }}>IMPORT AGENT</div>
      <div style={{ fontSize: 11, color: "#5A6A40", marginBottom: 22, letterSpacing: 0.5 }}>Select an import source.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={onPdf}
          style={{ textAlign: "left", padding: "14px 18px", background: "rgba(100,140,180,0.07)", border: "1px solid rgba(100,140,180,0.25)", borderRadius: 6, cursor: "pointer", color: "#D4D8C8" }}
        >
          <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 13, letterSpacing: 2, color: "#6090B4", marginBottom: 4 }}>{"\uD83D\uDCC4"} IMPORT FROM PDF</div>
          <div style={{ fontSize: 11, color: "#7A8A70", lineHeight: 1.5 }}>Read from an official Delta Green fillable PDF (DD-315). Parses all fields automatically.</div>
        </button>
        <button
          onClick={onJson}
          style={{ textAlign: "left", padding: "14px 18px", background: "rgba(100,160,100,0.07)", border: "1px solid rgba(100,160,100,0.2)", borderRadius: 6, cursor: "pointer", color: "#D4D8C8" }}
        >
          <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 13, letterSpacing: 2, color: "#70A870", marginBottom: 4 }}>{"\u2193"} RESTORE FROM BACKUP</div>
          <div style={{ fontSize: 11, color: "#7A8A70", lineHeight: 1.5 }}>Restore an agent from a previously exported .json backup file. All data including session log is preserved.</div>
        </button>
      </div>
    </div>
  </div>
);
