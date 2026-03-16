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

  const inputBase = {
    background: "rgba(130,80,160,0.06)", border: "1px solid rgba(130,80,160,0.2)",
    borderRadius: 3, color: "#C8B8D8", fontFamily: "'IBM Plex Sans', sans-serif", outline: "none",
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginTop: 8, padding: "10px 12px", background: "rgba(130,80,160,0.04)", border: "1px dashed rgba(130,80,160,0.2)", borderRadius: 4 }}>
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontSize: 9, fontFamily: "'Special Elite', cursive", letterSpacing: 1.5, textTransform: "uppercase", color: "#5A4060", marginBottom: 3 }}>What did the agent witness?</div>
        <input type="text" value={desc} placeholder="Description of the encounter\u2026" onChange={e => setDesc(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }} style={{ ...inputBase, width: "100%", padding: "6px 8px", fontSize: 12 }} />
      </div>
      <div>
        <div style={{ fontSize: 9, fontFamily: "'Special Elite', cursive", letterSpacing: 1.5, textTransform: "uppercase", color: "#5A4060", marginBottom: 3 }}>Pts gained</div>
        <input type="number" value={pts} min={1} max={99} onChange={e => setPts(Math.max(1, Number(e.target.value) || 1))} onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }} style={{ ...inputBase, width: 60, textAlign: "center", padding: "6px 4px", fontSize: 14, fontFamily: "'IBM Plex Mono', monospace" }} />
      </div>
      <button className="btn btn-sm" onClick={handleSubmit} disabled={!canAdd} style={{ borderColor: canAdd ? "rgba(130,80,160,0.4)" : "rgba(80,80,80,0.2)", background: canAdd ? "rgba(130,80,160,0.12)" : "rgba(255,255,255,0.02)", color: canAdd ? "#9060A0" : "#4A3060", opacity: canAdd ? 1 : 0.5, marginBottom: 0, letterSpacing: 2, fontSize: 10 }}>
        + LOG ENCOUNTER
      </button>
    </div>
  );
};
