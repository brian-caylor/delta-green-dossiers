import { useState } from "react";
import { GEAR_CATALOG, GEAR_CATALOG_CATEGORIES } from "../../data/gearCatalog";

export const GearCatalogModal = ({ onAdd, onClose }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = GEAR_CATALOG.filter((w) =>
    (activeCategory === "All" || w.category === activeCategory) &&
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const chipStyle = (active) => ({
    display: "inline-block", padding: "3px 10px", cursor: "pointer",
    fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: 1,
    textTransform: "uppercase",
    background: active ? "var(--ink)" : "transparent",
    color: active ? "var(--paper)" : "var(--ink-2)",
    border: `1px solid ${active ? "var(--ink)" : "var(--line-2)"}`,
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}
        style={{ width: "min(860px, 95vw)", maxHeight: "85vh", display: "flex", flexDirection: "column", gap: 14, padding: "20px 24px" }}
      >
        <button type="button" className="btn btn-tiny btn-ghost" style={{ position: "absolute", top: 12, right: 14 }} onClick={onClose}>✕</button>
        <div>
          <div className="modal-title">📋 GEAR CATALOG</div>
          <div className="label">Click any weapon to add it to your sheet. All values are editable after adding.</div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {GEAR_CATALOG_CATEGORIES.map((cat) => (
            <span key={cat} style={chipStyle(activeCategory === cat)} onClick={() => setActiveCategory(cat)}>{cat}</span>
          ))}
        </div>

        <input
          type="text" value={search} placeholder="Search by name…"
          onChange={(e) => setSearch(e.target.value)}
          className="field-line"
          style={{ fontFamily: "var(--font-hand)" }}
        />

        <div style={{ overflowY: "auto", flex: 1, border: "1px solid var(--line-2)" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--ink-3)", fontSize: 12, fontStyle: "italic" }}>No weapons match your search.</div>
          ) : (
            <table className="table">
              <thead style={{ position: "sticky", top: 0, background: "var(--paper)" }}>
                <tr>
                  {["Weapon", "Category", "Skill %", "Range", "Damage", "AP", "Lethality", "Kill Radius", "Ammo"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((w, i) => (
                  <tr key={i} onClick={() => onAdd(w)} style={{ cursor: "pointer" }}>
                    <td style={{ color: "var(--ink)", fontWeight: 500 }}>{w.name}</td>
                    <td style={{ fontSize: 10, color: "var(--ink-3)" }}>{w.category}</td>
                    <td style={{ textAlign: "center" }}>{w.skill}</td>
                    <td>{w.baseRange}</td>
                    <td>{w.damage || "—"}</td>
                    <td style={{ textAlign: "center" }}>{w.armorPiercing ? <span style={{ color: "var(--ok)" }}>✓</span> : <span style={{ color: "var(--ink-muted)" }}>—</span>}</td>
                    <td style={{ textAlign: "center" }}>{w.lethality ? <span style={{ color: "var(--redact)" }}>{w.lethality}%</span> : <span style={{ color: "var(--ink-muted)" }}>—</span>}</td>
                    <td style={{ textAlign: "center" }}>{w.killRadius || "—"}</td>
                    <td style={{ color: "var(--ink-3)" }}>{w.ammo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="label" style={{ fontStyle: "italic" }}>
          Stats follow Delta Green Agent's Handbook weapon categories. AP weapons reduce armor by 3–5 points.
        </div>
      </div>
    </div>
  );
};
