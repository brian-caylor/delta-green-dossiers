export const ImportChoiceModal = ({ onPdf, onJson, onClose }) => (
  <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: "min(440px, 92vw)" }}>
      <button type="button" className="btn btn-tiny btn-ghost" style={{ position: "absolute", top: 12, right: 14 }} onClick={onClose}>✕</button>
      <div className="modal-title">IMPORT AGENT</div>
      <div className="modal-sub">Select an import source.</div>
      <div className="col" style={{ gap: 12 }}>
        <button type="button" className="btn" style={{ justifyContent: "flex-start", padding: "14px 18px", flexDirection: "column", alignItems: "flex-start", gap: 4 }} onClick={onPdf}>
          <span className="handwritten" style={{ fontSize: 13, letterSpacing: 2, color: "var(--stamp-blue)" }}>📄 IMPORT FROM PDF</span>
          <span className="label" style={{ fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>
            Read from an official Delta Green fillable PDF (DD-315). Parses all fields automatically.
          </span>
        </button>
        <button type="button" className="btn" style={{ justifyContent: "flex-start", padding: "14px 18px", flexDirection: "column", alignItems: "flex-start", gap: 4 }} onClick={onJson}>
          <span className="handwritten" style={{ fontSize: 13, letterSpacing: 2, color: "var(--ok)" }}>↓ RESTORE FROM BACKUP</span>
          <span className="label" style={{ fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>
            Restore an agent from a previously exported .json backup file. All data including session log is preserved.
          </span>
        </button>
      </div>
    </div>
  </div>
);
