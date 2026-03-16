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
      ? parsed.bonds.map(b => ({ name: b.name, score: b.score }))
      : [],
    skills: parsed.skills ? { ...parsed.skills } : null,
    specs: { ...parsed.specs },
    otherSkills: parsed.otherSkills.map(s => ({ ...s })),
    wounds: parsed.wounds || "",
    armorAndGear: parsed.armorAndGear || "",
    weapons: parsed.weapons.map(w => ({ ...w })),
    personalNotes: parsed.personalNotes || "",
    homeFamily: parsed.homeFamily || "",
    specialTraining: parsed.specialTraining.map(t => ({ ...t })),
    authorizingOfficer: parsed.authorizingOfficer || "",
  }));

  const set = (path, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let obj = next;
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]];
      obj[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,160,105,0.25)",
    borderRadius: 3, padding: "4px 8px", color: "#D4D8C8", fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace", outline: "none", width: "100%",
  };

  const labelStyle = { fontSize: 9, fontFamily: "'Special Elite', cursive", letterSpacing: 1.5, textTransform: "uppercase", color: "#7A8A60", display: "block", marginBottom: 3 };
  const sectionStyle = { borderBottom: "1px solid rgba(139,160,105,0.15)", paddingBottom: 16, marginBottom: 16 };
  const sectionTitleStyle = { fontFamily: "'Special Elite', cursive", fontSize: 12, letterSpacing: 3, color: "#8BA069", textTransform: "uppercase", marginBottom: 10 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, padding: 20 }}>
      <div style={{ background: "#1A1D16", border: "1px solid rgba(139,160,105,0.3)", borderRadius: 8, width: "min(900px, 95vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(139,160,105,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 18, letterSpacing: 4, color: "#8BA069" }}>REVIEW IMPORTED DOSSIER</div>
            <div style={{ fontSize: 10, color: "#5A6A40", marginTop: 2 }}>Verify and correct fields before confirming the import</div>
          </div>
          <button className="btn btn-sm" onClick={onCancel}>&#10005; CANCEL</button>
        </div>

        <div style={{ overflowY: "auto", padding: 24, flex: 1 }}>
          {/* Personal */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Personal Data</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10, marginBottom: 10 }}>
              {[["Last Name", "personal.lastName"], ["First Name", "personal.firstName"], ["M.I.", "personal.middleInitial"]].map(([lbl, path]) => (
                <div key={path}><label style={labelStyle}>{lbl}</label><input style={inputStyle} value={data.personal[path.split(".")[1]] || ""} onChange={e => set(path, e.target.value)} /></div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              {[["Profession", "personal.profession"], ["Employer", "personal.employer"]].map(([lbl, path]) => (
                <div key={path}><label style={labelStyle}>{lbl}</label><input style={inputStyle} value={data.personal[path.split(".")[1]] || ""} onChange={e => set(path, e.target.value)} /></div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 120px", gap: 10, marginBottom: 10 }}>
              {[["Nationality", "personal.nationality"], ["Sex", "personal.sex"], ["Age", "personal.age"], ["D.O.B.", "personal.dob"]].map(([lbl, path]) => (
                <div key={path}><label style={labelStyle}>{lbl}</label><input style={inputStyle} value={data.personal[path.split(".")[1]] || ""} onChange={e => set(path, e.target.value)} /></div>
              ))}
            </div>
            <div><label style={labelStyle}>Education & History</label><input style={inputStyle} value={data.personal.education || ""} onChange={e => set("personal.education", e.target.value)} /></div>
          </div>

          {/* Stats */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Statistics</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginBottom: 12 }}>
              {[["STR","str"],["CON","con"],["DEX","dex"],["INT","int"],["POW","pow"],["CHA","cha"]].map(([lbl, key]) => {
                const statObj = data.stats[key];
                const score = typeof statObj === "object" ? statObj?.score : statObj;
                return (
                  <div key={key} style={{ textAlign: "center" }}>
                    <label style={labelStyle}>{lbl}</label>
                    <input type="number" style={{ ...inputStyle, textAlign: "center" }} value={score || ""} onChange={e => {
                      setData(prev => {
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
              {[["HP Max","derived.hp.max"],["HP Current","derived.hp.current"],["WP Max","derived.wp.max"],["WP Current","derived.wp.current"],["SAN Max","derived.san.max"],["SAN Current","derived.san.current"],["BP Max","derived.bp.max"],["BP Current","derived.bp.current"]].map(([lbl, path]) => {
                const parts = path.split(".");
                const val = data.derived[parts[1]][parts[2]];
                return (
                  <div key={path} style={{ textAlign: "center" }}>
                    <label style={labelStyle}>{lbl}</label>
                    <input type="number" style={{ ...inputStyle, textAlign: "center" }} value={val || ""} onChange={e => set(path, Number(e.target.value) || 0)} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Physical / Motivations */}
          {data.physicalDesc && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Physical Description</div>
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={data.physicalDesc} onChange={e => set("physicalDesc", e.target.value)} />
            </div>
          )}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Motivations</div>
            <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={data.motivations} onChange={e => set("motivations", e.target.value)} />
          </div>
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Mental Disorders</div>
            <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={data.mentalDisorders || ""} onChange={e => set("mentalDisorders", e.target.value)} />
          </div>

          {/* Bonds */}
          {data.bonds.length > 0 && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Bonds</div>
              {data.bonds.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
                  <input style={{ ...inputStyle, flex: 1 }} value={b.name} placeholder="Bond name" onChange={e => { const bonds = [...data.bonds]; bonds[i] = { ...bonds[i], name: e.target.value }; setData(prev => ({ ...prev, bonds })); }} />
                  <input type="number" style={{ ...inputStyle, width: 70, textAlign: "center" }} value={b.score || ""} onChange={e => { const bonds = [...data.bonds]; bonds[i] = { ...bonds[i], score: Number(e.target.value) || 0 }; setData(prev => ({ ...prev, bonds })); }} />
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {data.skills && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Skills (editable values)</div>
              <div style={{ fontSize: 10, color: "#5A6A40", marginBottom: 8 }}>Green = modified from base. Review and correct any misread values.</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 4 }}>
                {SKILL_FIELD_MAP.map(def => {
                  const val = data.skills[def.name] ?? def.base;
                  const modified = val !== def.base;
                  return (
                    <div key={def.name} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 6px", borderRadius: 3, background: modified ? "rgba(139,160,105,0.06)" : "transparent" }}>
                      <span style={{ flex: 1, fontSize: 11, color: modified ? "#A0B880" : "#7A8A60" }}>{def.name}</span>
                      <span style={{ fontSize: 10, color: "#4A5A35", minWidth: 30, textAlign: "right" }}>({def.base}%)</span>
                      <input type="number" min={0} max={99} style={{ ...inputStyle, width: 50, textAlign: "center", padding: "2px 4px" }} value={val} onChange={e => setData(prev => ({ ...prev, skills: { ...prev.skills, [def.name]: Number(e.target.value) || 0 } }))} />
                    </div>
                  );
                })}
              </div>
              {data.otherSkills.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, color: "#7A8A60", marginBottom: 6, fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>FOREIGN LANGUAGES & OTHER SKILLS</div>
                  {data.otherSkills.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                      <input style={{ ...inputStyle, flex: 1 }} value={s.name} onChange={e => { const oth = [...data.otherSkills]; oth[i] = { ...oth[i], name: e.target.value }; setData(prev => ({ ...prev, otherSkills: oth })); }} />
                      <input type="number" style={{ ...inputStyle, width: 60, textAlign: "center" }} value={s.value || ""} onChange={e => { const oth = [...data.otherSkills]; oth[i] = { ...oth[i], value: Number(e.target.value) || 0 }; setData(prev => ({ ...prev, otherSkills: oth })); }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Weapons */}
          {data.weapons.length > 0 && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Weapons</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr>{["Weapon","Skill %","Range","Damage","Lethality","Kill Radius","Ammo"].map(h => <th key={h} style={{ padding: "4px 6px", textAlign: "left", color: "#5A6A40", fontWeight: 400, fontSize: 9, fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {data.weapons.map((w, i) => (
                      <tr key={i}>
                        {["name","skill","baseRange","damage","lethality","killRadius","ammo"].map(f => (
                          <td key={f} style={{ padding: "2px 3px" }}><input style={{ ...inputStyle, width: f === "name" ? 120 : 60 }} value={w[f] || ""} onChange={e => { const weapons = [...data.weapons]; weapons[i] = { ...weapons[i], [f]: e.target.value }; setData(prev => ({ ...prev, weapons })); }} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Gear / Notes */}
          {data.armorAndGear && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Armor & Gear</div>
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={data.armorAndGear} onChange={e => set("armorAndGear", e.target.value)} />
            </div>
          )}
          {data.personalNotes && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Personal Notes</div>
              <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={data.personalNotes} onChange={e => set("personalNotes", e.target.value)} />
            </div>
          )}

          {/* Special Training */}
          {data.specialTraining.length > 0 && (
            <div style={sectionStyle}>
              <div style={sectionTitleStyle}>Special Training</div>
              {data.specialTraining.map((t, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 8, marginBottom: 6 }}>
                  <input style={inputStyle} value={t.name} placeholder="Training" onChange={e => { const st = [...data.specialTraining]; st[i] = { ...st[i], name: e.target.value }; setData(prev => ({ ...prev, specialTraining: st })); }} />
                  <input style={inputStyle} value={t.skillStat} placeholder="Skill/Stat" onChange={e => { const st = [...data.specialTraining]; st[i] = { ...st[i], skillStat: e.target.value }; setData(prev => ({ ...prev, specialTraining: st })); }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(139,160,105,0.2)", display: "flex", justifyContent: "flex-end", gap: 12, flexShrink: 0 }}>
          <button className="btn" onClick={onCancel}>CANCEL</button>
          <button className="btn" onClick={() => onConfirm(data)} style={{ borderColor: "rgba(100,140,180,0.4)", background: "rgba(100,140,180,0.12)", color: "#6090B4" }}>
            &#10003; CONFIRM IMPORT
          </button>
        </div>
      </div>
    </div>
  );
};
