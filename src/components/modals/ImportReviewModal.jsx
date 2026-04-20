import { useState } from "react";
import { SKILL_FIELD_MAP } from "../../data/defaultSkills";

export const ImportReviewModal = ({ parsed, onConfirm, onCancel }) => {
  const [data, setData] = useState(() => ({
    personal: { ...parsed.personal },
    stats: { ...parsed.stats },
    derived: {
      hp: { ...parsed.derived.hp }, wp: { ...parsed.derived.wp },
      san: { ...parsed.derived.san }, bp: { ...parsed.derived.bp },
    },
    physicalDesc: parsed.physicalDesc || "",
    motivations: parsed.motivations || "",
    bonds: parsed.bonds.length > 0
      ? parsed.bonds.map((b) => ({ name: b.name, score: b.score }))
      : [],
    skills: parsed.skills ? { ...parsed.skills } : null,
    specs: { ...parsed.specs },
    otherSkills: parsed.otherSkills.map((s) => ({ ...s })),
    wounds: parsed.wounds || "",
    armorAndGear: parsed.armorAndGear || "",
    weapons: parsed.weapons.map((w) => ({ ...w })),
    personalNotes: parsed.personalNotes || "",
    homeFamily: parsed.homeFamily || "",
    specialTraining: parsed.specialTraining.map((t) => ({ ...t })),
    authorizingOfficer: parsed.authorizingOfficer || "",
  }));

  const set = (path, value) => {
    setData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const sectionStyle = { borderBottom: "1px dashed var(--line-2)", paddingBottom: 16, marginBottom: 16 };
  const sectionTitle = "handwritten";
  const sectionTitleStyle = { fontSize: 14, letterSpacing: 3, color: "var(--ink)", textTransform: "uppercase", marginBottom: 10 };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}
        style={{ width: "min(900px, 95vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0 }}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="modal-title">REVIEW IMPORTED DOSSIER</div>
            <div className="label">Verify and correct fields before confirming the import</div>
          </div>
          <button type="button" className="btn btn-sm btn-ghost" onClick={onCancel}>✕ CANCEL</button>
        </div>

        <div style={{ overflowY: "auto", padding: 24, flex: 1 }}>
          <div style={sectionStyle}>
            <div className={sectionTitle} style={sectionTitleStyle}>Personal Data</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10, marginBottom: 10 }}>
              {[["Last Name", "lastName"], ["First Name", "firstName"], ["M.I.", "middleInitial"]].map(([lbl, key]) => (
                <div key={key}>
                  <label className="label" style={{ display: "block", marginBottom: 3 }}>{lbl}</label>
                  <input className="field-line" value={data.personal[key] || ""} onChange={(e) => set(`personal.${key}`, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[["Profession", "profession"], ["Employer", "employer"]].map(([lbl, key]) => (
                <div key={key}>
                  <label className="label" style={{ display: "block", marginBottom: 3 }}>{lbl}</label>
                  <input className="field-line" value={data.personal[key] || ""} onChange={(e) => set(`personal.${key}`, e.target.value)} />
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 120px", gap: 10, marginBottom: 10 }}>
              {[["Nationality", "nationality"], ["Sex", "sex"], ["Age", "age"], ["D.O.B.", "dob"]].map(([lbl, key]) => (
                <div key={key}>
                  <label className="label" style={{ display: "block", marginBottom: 3 }}>{lbl}</label>
                  <input className="field-line" value={data.personal[key] || ""} onChange={(e) => set(`personal.${key}`, e.target.value)} />
                </div>
              ))}
            </div>
            <div>
              <label className="label" style={{ display: "block", marginBottom: 3 }}>Education & History</label>
              <input className="field-line" value={data.personal.education || ""} onChange={(e) => set("personal.education", e.target.value)} />
            </div>
          </div>

          <div style={sectionStyle}>
            <div className={sectionTitle} style={sectionTitleStyle}>Statistics</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 12 }}>
              {[["STR", "str"], ["CON", "con"], ["DEX", "dex"], ["INT", "int"], ["POW", "pow"], ["CHA", "cha"]].map(([lbl, key]) => {
                const statObj = data.stats[key];
                const score = typeof statObj === "object" ? statObj?.score : statObj;
                return (
                  <div key={key} style={{ textAlign: "center" }}>
                    <label className="label" style={{ display: "block", marginBottom: 3 }}>{lbl}</label>
                    <input type="number" className="field-num" value={score || ""} onChange={(e) => {
                      setData((prev) => {
                        const next = JSON.parse(JSON.stringify(prev));
                        if (typeof next.stats[key] === "object") next.stats[key].score = Number(e.target.value) || 0;
                        else next.stats[key] = Number(e.target.value) || 0;
                        return next;
                      });
                    }} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[["HP Max", "hp.max"], ["HP Cur", "hp.current"], ["WP Max", "wp.max"], ["WP Cur", "wp.current"],
                ["SAN Max", "san.max"], ["SAN Cur", "san.current"], ["BP Max", "bp.max"], ["BP Cur", "bp.current"],
              ].map(([lbl, path]) => {
                const [a, b] = path.split(".");
                const val = data.derived[a][b];
                return (
                  <div key={path} style={{ textAlign: "center" }}>
                    <label className="label" style={{ display: "block", marginBottom: 3 }}>{lbl}</label>
                    <input type="number" className="field-num" value={val || ""} onChange={(e) => set(`derived.${path}`, Number(e.target.value) || 0)} />
                  </div>
                );
              })}
            </div>
          </div>

          {data.physicalDesc && (
            <div style={sectionStyle}>
              <div className={sectionTitle} style={sectionTitleStyle}>Physical Description</div>
              <textarea className="field-box" rows={3} value={data.physicalDesc} onChange={(e) => set("physicalDesc", e.target.value)} />
            </div>
          )}
          <div style={sectionStyle}>
            <div className={sectionTitle} style={sectionTitleStyle}>Motivations</div>
            <textarea className="field-box" rows={3} value={data.motivations} onChange={(e) => set("motivations", e.target.value)} />
          </div>
          <div style={sectionStyle}>
            <div className={sectionTitle} style={sectionTitleStyle}>Mental Disorders</div>
            <textarea className="field-box" rows={3} value={data.mentalDisorders || ""} onChange={(e) => set("mentalDisorders", e.target.value)} />
          </div>

          {data.bonds.length > 0 && (
            <div style={sectionStyle}>
              <div className={sectionTitle} style={sectionTitleStyle}>Bonds</div>
              {data.bonds.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                  <input className="field-line" style={{ flex: 1 }} value={b.name} placeholder="Bond name"
                    onChange={(e) => { const bonds = [...data.bonds]; bonds[i] = { ...bonds[i], name: e.target.value }; setData((prev) => ({ ...prev, bonds })); }} />
                  <input type="number" className="field-num" style={{ width: 70 }} value={b.score || ""}
                    onChange={(e) => { const bonds = [...data.bonds]; bonds[i] = { ...bonds[i], score: Number(e.target.value) || 0 }; setData((prev) => ({ ...prev, bonds })); }} />
                </div>
              ))}
            </div>
          )}

          {data.skills && (
            <div style={sectionStyle}>
              <div className={sectionTitle} style={sectionTitleStyle}>Skills</div>
              <div className="label" style={{ marginBottom: 8 }}>Modified values are highlighted. Review and correct any misread values.</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 4 }}>
                {SKILL_FIELD_MAP.map((def) => {
                  const val = data.skills[def.name] ?? def.base;
                  const modified = val !== def.base;
                  return (
                    <div key={def.name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 6px", background: modified ? "var(--line-soft)" : "transparent" }}>
                      <span style={{ flex: 1, fontSize: 11, color: "var(--ink-2)", fontWeight: modified ? 600 : 400 }}>{def.name}</span>
                      <span className="label">({def.base}%)</span>
                      <input type="number" min={0} max={99} className="field-num" style={{ width: 50 }} value={val}
                        onChange={(e) => setData((prev) => ({ ...prev, skills: { ...prev.skills, [def.name]: Number(e.target.value) || 0 } }))} />
                    </div>
                  );
                })}
              </div>
              {data.otherSkills.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div className="label" style={{ marginBottom: 6 }}>FOREIGN LANGUAGES & OTHER SKILLS</div>
                  {data.otherSkills.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                      <input className="field-line" style={{ flex: 1 }} value={s.name}
                        onChange={(e) => { const oth = [...data.otherSkills]; oth[i] = { ...oth[i], name: e.target.value }; setData((prev) => ({ ...prev, otherSkills: oth })); }} />
                      <input type="number" className="field-num" style={{ width: 60 }} value={s.value || ""}
                        onChange={(e) => { const oth = [...data.otherSkills]; oth[i] = { ...oth[i], value: Number(e.target.value) || 0 }; setData((prev) => ({ ...prev, otherSkills: oth })); }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {data.weapons.length > 0 && (
            <div style={sectionStyle}>
              <div className={sectionTitle} style={sectionTitleStyle}>Weapons</div>
              <div style={{ overflowX: "auto" }}>
                <table className="table" style={{ fontSize: 11 }}>
                  <thead>
                    <tr>{["Weapon", "Skill %", "Range", "Damage", "Lethality", "Kill Radius", "Ammo"].map((h) => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {data.weapons.map((w, i) => (
                      <tr key={i}>
                        {["name", "skill", "baseRange", "damage", "lethality", "killRadius", "ammo"].map((f) => (
                          <td key={f}>
                            <input className={f === "name" ? "field-line" : "field-num"} style={{ width: f === "name" ? 120 : 60 }} value={w[f] || ""}
                              onChange={(e) => { const weapons = [...data.weapons]; weapons[i] = { ...weapons[i], [f]: e.target.value }; setData((prev) => ({ ...prev, weapons })); }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.armorAndGear && (
            <div style={sectionStyle}>
              <div className={sectionTitle} style={sectionTitleStyle}>Armor & Gear</div>
              <textarea className="field-box" rows={3} value={data.armorAndGear} onChange={(e) => set("armorAndGear", e.target.value)} />
            </div>
          )}
          {data.personalNotes && (
            <div style={sectionStyle}>
              <div className={sectionTitle} style={sectionTitleStyle}>Personal Notes</div>
              <textarea className="field-box" rows={3} value={data.personalNotes} onChange={(e) => set("personalNotes", e.target.value)} />
            </div>
          )}

          {data.specialTraining.length > 0 && (
            <div style={sectionStyle}>
              <div className={sectionTitle} style={sectionTitleStyle}>Special Training</div>
              {data.specialTraining.map((t, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 8, marginBottom: 6 }}>
                  <input className="field-line" value={t.name} placeholder="Training"
                    onChange={(e) => { const st = [...data.specialTraining]; st[i] = { ...st[i], name: e.target.value }; setData((prev) => ({ ...prev, specialTraining: st })); }} />
                  <input className="field-line" value={t.skillStat} placeholder="Skill/Stat"
                    onChange={(e) => { const st = [...data.specialTraining]; st[i] = { ...st[i], skillStat: e.target.value }; setData((prev) => ({ ...prev, specialTraining: st })); }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button type="button" className="btn" onClick={onCancel}>CANCEL</button>
          <button type="button" className="btn btn-primary" onClick={() => onConfirm(data)}>✓ CONFIRM IMPORT</button>
        </div>
      </div>
    </div>
  );
};
