import { useState } from "react";
import { GEAR_CATALOG, GEAR_CATALOG_CATEGORIES } from "../../data/gearCatalog";

export const GearCatalogModal = ({ onAdd, onClose }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = GEAR_CATALOG.filter(w =>
    (activeCategory === "All" || w.category === activeCategory) &&
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  const chipStyle = (active) => ({
    display: "inline-block", padding: "3px 10px", borderRadius: 3, cursor: "pointer", fontSize: 10,
    fontFamily: "'Special Elite', cursive", letterSpacing: 1, userSelect: "none",
    background: active ? "rgba(139,160,105,0.18)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${active ? "rgba(139,160,105,0.5)" : "rgba(139,160,105,0.15)"}`,
    color: active ? "#8BA069" : "#5A6A40",
    transition: "all 0.15s",
  });

  const colStyle = { padding: "5px 8px", fontSize: 11, color: "#9AA880", fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" };
  const headStyle = { padding: "6px 8px", fontSize: 9, fontFamily: "'Special Elite', cursive", letterSpacing: 1, color: "#5A6A40", fontWeight: 400, textAlign: "left" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.80)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "rgba(20,24,18,0.98)", border: "1px solid rgba(139,160,105,0.25)", borderRadius: 8, padding: "24px 28px", width: "min(860px, 95vw)", maxHeight: "85vh", display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
        {/* Header */}
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 14, background: "none", border: "none", color: "#5A6A40", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>{"\u2715"}</button>
        <div>
          <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 16, letterSpacing: 3, color: "#8BA069", marginBottom: 3 }}>{"\uD83D\uDCCB"} GEAR CATALOG</div>
          <div style={{ fontSize: 11, color: "#5A6A40", letterSpacing: 0.5 }}>Click any weapon to add it to your sheet. All values can be edited after adding.</div>
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {GEAR_CATALOG_CATEGORIES.map(cat => (
            <span key={cat} style={chipStyle(activeCategory === cat)} onClick={() => setActiveCategory(cat)}>{cat}</span>
          ))}
        </div>

        {/* Search */}
        <input
          type="text" value={search} placeholder="Search by name\u2026"
          onChange={e => setSearch(e.target.value)}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,160,105,0.2)", borderRadius: 4, padding: "7px 12px", color: "#C8D0B8", fontSize: 12, outline: "none", fontFamily: "'IBM Plex Sans', sans-serif" }}
        />

        {/* Weapons table */}
        <div style={{ overflowY: "auto", flex: 1, borderRadius: 4, border: "1px solid rgba(139,160,105,0.1)" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#4A5A35", fontSize: 12, fontStyle: "italic" }}>No weapons match your search.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, background: "rgba(20,24,18,0.98)" }}>
                <tr style={{ borderBottom: "1px solid rgba(139,160,105,0.2)" }}>
                  {["Weapon", "Category", "Skill %", "Range", "Damage", "AP", "Lethality", "Kill Radius", "Ammo"].map(h => (
                    <th key={h} style={headStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((w, i) => (
                  <tr key={i}
                    onClick={() => onAdd(w)}
                    style={{ cursor: "pointer", borderBottom: "1px solid rgba(139,160,105,0.07)", background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent", transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(139,160,105,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent"}
                  >
                    <td style={{ ...colStyle, color: "#C8D0B8", fontWeight: 500, fontFamily: "'IBM Plex Sans', sans-serif" }}>{w.name}</td>
                    <td style={{ ...colStyle, color: "#5A6A40", fontSize: 10 }}>{w.category}</td>
                    <td style={{ ...colStyle, textAlign: "center" }}>{w.skill}</td>
                    <td style={{ ...colStyle }}>{w.baseRange}</td>
                    <td style={{ ...colStyle }}>{w.damage || "\u2014"}</td>
                    <td style={{ ...colStyle, textAlign: "center" }}>{w.armorPiercing ? <span style={{ color: "#8BA069", fontSize: 13 }}>{"\u2713"}</span> : <span style={{ color: "#3A4030" }}>{"\u2014"}</span>}</td>
                    <td style={{ ...colStyle, textAlign: "center" }}>{w.lethality ? <span style={{ color: "#C49050" }}>{w.lethality}%</span> : <span style={{ color: "#3A4030" }}>{"\u2014"}</span>}</td>
                    <td style={{ ...colStyle, textAlign: "center" }}>{w.killRadius || "\u2014"}</td>
                    <td style={{ ...colStyle, color: "#7A8A60" }}>{w.ammo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ fontSize: 10, color: "#3A4A30", fontStyle: "italic" }}>
          Stats follow Delta Green Agent's Handbook weapon categories. AP weapons reduce armor by 3-5 points.
        </div>
      </div>
    </div>
  );
};
