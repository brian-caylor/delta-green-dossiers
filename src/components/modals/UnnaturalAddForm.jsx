import { useState } from "react";

export const UnnaturalAddForm = ({ onAdd }) => {
  const [desc, setDesc] = useState("");
  const [pts, setPts] = useState(1);
  const canAdd = pts >= 1;

  const handleSubmit = () => {
    if (!canAdd) return;
    onAdd(desc, pts);
    setDesc("");
    setPts(1);
  };

  return (
    <div style={{
      display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap",
      marginTop: 8, padding: "10px 12px",
      border: "1px dashed var(--stamp-blue)",
    }}>
      <div style={{ flex: 1, minWidth: 180 }}>
        <div className="label" style={{ marginBottom: 3 }}>What did the agent witness?</div>
        <input type="text" value={desc} placeholder="Description of the encounter…"
          className="field-line"
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
          style={{ fontFamily: "var(--font-hand)" }}
        />
      </div>
      <div>
        <div className="label" style={{ marginBottom: 3 }}>Pts gained</div>
        <input type="number" value={pts} min={1} max={99}
          className="field-num" style={{ width: 60 }}
          onChange={(e) => setPts(Math.max(1, Number(e.target.value) || 1))}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
        />
      </div>
      <button type="button" className="btn btn-sm" onClick={handleSubmit} disabled={!canAdd}>
        + LOG ENCOUNTER
      </button>
    </div>
  );
};
