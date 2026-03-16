import { memo, useCallback, useState } from "react";
import { CollapsibleSection, Field, CheckBox, Redacted } from "../ui";
import { EMPTY_WEAPON } from "../../data/gearCatalog";
import { extractAdded, truncLog } from "../../utils/textHelpers";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const QUICK_REF_SKILLS = ["Dodge", "Firearms", "Melee Weapons", "Unarmed Combat"];

function QuickRefPill({ label, value, max, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "rgba(255,255,255,0.03)", border: `1px solid ${color}33`, borderRadius: 4 }}>
      <span style={{ fontSize: 9, fontFamily: "'Special Elite', cursive", letterSpacing: 1, color }}>{label}</span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 600, color: "#D4D8C8" }}>
        {value}{max !== undefined ? <span style={{ color: "#5A6A40", fontWeight: 400 }}>/{max}</span> : null}
      </span>
    </div>
  );
}

function AmmoCounter({ w, i, isLocked, cs, updateWeaponField }) {
  const ammoCount = Number(w.ammo) || 0;
  const ammoMax = Number(w.ammoMax) || 0;
  const isEmpty = ammoMax > 0 && ammoCount === 0;
  const isFull = ammoMax > 0 && ammoCount >= ammoMax;
  const curColor = isEmpty ? "#8B4040" : isFull ? "#5A7A40" : (isLocked ? "#666" : "#D4D8C8");
  const btnStyle = { background: "none", border: "none", color: isLocked ? "#444" : "#5A6A40", cursor: isLocked ? "not-allowed" : "pointer", fontSize: 11, lineHeight: 1, padding: "1px 3px", borderRadius: 2 };
  return (
    <div className="ammo-counter" style={{ display: "flex", alignItems: "center", gap: 1 }}>
      <button style={btnStyle} disabled={isLocked || ammoCount <= 0} title="Use one round"
        onClick={() => updateWeaponField(i, "ammo", Math.max(0, ammoCount - 1))}
        onMouseEnter={e => { if (!isLocked && ammoCount > 0) e.currentTarget.style.color = "#C44040"; }}
        onMouseLeave={e => { e.currentTarget.style.color = isLocked ? "#444" : "#5A6A40"; }}>▼</button>
      <input
        type="number" min="0"
        style={{ ...cs, width: 30, textAlign: "center", MozAppearance: "textfield", appearance: "textfield", color: curColor, fontWeight: isEmpty || isFull ? 600 : undefined }}
        value={ammoCount}
        disabled={isLocked}
        onChange={e => updateWeaponField(i, "ammo", Math.max(0, parseInt(e.target.value, 10) || 0))}
      />
      <span style={{ color: "#4A5A38", fontSize: 11, padding: "0 1px" }}>/</span>
      <input
        type="number" min="0"
        title="Magazine capacity — edit to set max rounds"
        style={{ ...cs, width: 30, textAlign: "center", MozAppearance: "textfield", appearance: "textfield", color: "#5A6A40", fontSize: 11 }}
        value={ammoMax}
        disabled={isLocked}
        onChange={e => updateWeaponField(i, "ammoMax", Math.max(0, parseInt(e.target.value, 10) || 0))}
      />
      <button style={btnStyle} disabled={isLocked || (ammoMax > 0 && ammoCount >= ammoMax)} title="Add one round"
        onClick={() => updateWeaponField(i, "ammo", ammoMax > 0 ? Math.min(ammoMax, ammoCount + 1) : ammoCount + 1)}
        onMouseEnter={e => { if (!isLocked) e.currentTarget.style.color = "#8BA069"; }}
        onMouseLeave={e => { e.currentTarget.style.color = isLocked ? "#444" : "#5A6A40"; }}>▲</button>
    </div>
  );
}

function MobileAmmoCounter({ w, i, isLocked, updateWeaponField }) {
  const ammoCount = Number(w.ammo) || 0;
  const ammoMax = Number(w.ammoMax) || 0;
  const isEmpty = ammoMax > 0 && ammoCount === 0;
  const isFull = ammoMax > 0 && ammoCount >= ammoMax;
  const curColor = isEmpty ? "#8B4040" : isFull ? "#5A7A40" : "#D4D8C8";
  const btnBase = { border: "none", borderRadius: 4, cursor: isLocked ? "not-allowed" : "pointer", fontWeight: 600, lineHeight: 1 };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
      <button
        style={{ ...btnBase, width: 44, height: 44, fontSize: 18, background: "rgba(180,60,60,0.12)", color: isLocked || ammoCount <= 0 ? "#444" : "#C44040" }}
        disabled={isLocked || ammoCount <= 0}
        onClick={() => updateWeaponField(i, "ammo", Math.max(0, ammoCount - 1))}
      >-</button>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: curColor, fontWeight: 600, minWidth: 50, textAlign: "center" }}>
        {ammoCount}<span style={{ color: "#4A5A38" }}>/</span>{ammoMax}
      </span>
      <button
        style={{ ...btnBase, width: 44, height: 44, fontSize: 18, background: "rgba(139,160,105,0.12)", color: isLocked || (ammoMax > 0 && ammoCount >= ammoMax) ? "#444" : "#8BA069" }}
        disabled={isLocked || (ammoMax > 0 && ammoCount >= ammoMax)}
        onClick={() => updateWeaponField(i, "ammo", ammoMax > 0 ? Math.min(ammoMax, ammoCount + 1) : ammoCount + 1)}
      >+</button>
    </div>
  );
}

function WeaponCard({ w, i, isLocked, isRedacted, updateWeaponField, removeWeapon, addLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const cs = {
    background: isLocked ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${isLocked ? "rgba(80,80,80,0.12)" : "rgba(139,160,105,0.12)"}`,
    borderRadius: 3, padding: "8px 10px", color: isLocked ? "#666" : "#D4D8C8", fontSize: 13,
    fontFamily: "'IBM Plex Mono', monospace", outline: "none", width: "100%",
    cursor: isLocked ? "not-allowed" : undefined,
  };
  return (
    <div style={{ border: "1px solid rgba(139,160,105,0.15)", borderRadius: 6, padding: 12, background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: "#5A6A40", fontFamily: "'Special Elite', cursive" }}>({String.fromCharCode(97 + i)})</span>
        {!isLocked && (
          <button onClick={() => removeWeapon(i)} title="Remove weapon"
            style={{ background: "none", border: "none", color: "#5A3030", cursor: "pointer", fontSize: 15, padding: "2px 6px" }}>✕</button>
        )}
      </div>
      {isRedacted && w.name ? (
        <div><Redacted active inline seed={59 + i}>{w.name}</Redacted></div>
      ) : (
        <input style={cs} value={w.name} disabled={isLocked} placeholder="Weapon name..."
          onChange={e => updateWeaponField(i, "name", e.target.value)}
          onFocus={e => { e.target.dataset.logPrev = w.name || ""; }}
          onBlur={e => {
            const prev = e.target.dataset.logPrev ?? "";
            const next = e.target.value.trim();
            if (next && next !== prev.trim()) addLogEntry(`Weapon (${String.fromCharCode(97 + i)}): '${truncLog(next)}'`, prev, next, "manual");
          }}
        />
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <span style={{ fontSize: 9, color: "#7A8A60", fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>SKILL %</span>
          <input style={{ ...cs, marginTop: 2 }} value={w.skill} disabled={isLocked} onChange={e => updateWeaponField(i, "skill", e.target.value)} />
        </div>
        <div>
          <span style={{ fontSize: 9, color: "#7A8A60", fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>DAMAGE</span>
          <input style={{ ...cs, marginTop: 2 }} value={w.damage} disabled={isLocked} onChange={e => updateWeaponField(i, "damage", e.target.value)} />
        </div>
      </div>
      <div>
        <span style={{ fontSize: 9, color: "#7A8A60", fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>AMMO</span>
        <div style={{ marginTop: 4 }}>
          <MobileAmmoCounter w={w} i={i} isLocked={isLocked} updateWeaponField={updateWeaponField} />
        </div>
      </div>
      <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", color: "#5A6A40", cursor: "pointer", fontSize: 10, fontFamily: "'Special Elite', cursive", letterSpacing: 1, padding: "4px 0", textAlign: "left" }}>
        {expanded ? "▾ HIDE DETAILS" : "▸ SHOW DETAILS"}
      </button>
      {expanded && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 4, borderTop: "1px solid rgba(139,160,105,0.1)" }}>
          <div>
            <span style={{ fontSize: 9, color: "#7A8A60", fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>BASE RANGE</span>
            <input style={{ ...cs, marginTop: 2 }} value={w.baseRange} disabled={isLocked} onChange={e => updateWeaponField(i, "baseRange", e.target.value)} />
          </div>
          <div>
            <span style={{ fontSize: 9, color: "#7A8A60", fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>LETHALITY %</span>
            <input style={{ ...cs, marginTop: 2 }} value={w.lethality} disabled={isLocked} onChange={e => updateWeaponField(i, "lethality", e.target.value)} />
          </div>
          <div>
            <span style={{ fontSize: 9, color: "#7A8A60", fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>KILL RADIUS</span>
            <input style={{ ...cs, marginTop: 2 }} value={w.killRadius} disabled={isLocked} onChange={e => updateWeaponField(i, "killRadius", e.target.value)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 14 }}>
            <CheckBox checked={w.armorPiercing} disabled={isLocked} onChange={val => updateWeaponField(i, "armorPiercing", val)} />
            <span style={{ fontSize: 10, color: "#7A8A60", fontFamily: "'Special Elite', cursive" }}>ARMOR PIERCING</span>
          </div>
        </div>
      )}
    </div>
  );
}

export const CombatTab = memo(function CombatTab({ activeChar, isKIA, isLocked, isRedacted, updateChar, addLogEntry, setGearCatalogOpen, weaponDragState, handleWeaponDragStart, handleWeaponDragEnd, handleWeaponDragOver, handleWeaponDrop }) {
  const isMobile = useMediaQuery("(max-width: 700px)");

  const updateWeaponField = useCallback((i, field, val) => {
    updateChar(c => { const weapons = [...c.weapons]; weapons[i] = { ...weapons[i], [field]: val }; return { ...c, weapons }; });
  }, [updateChar]);

  const removeWeapon = useCallback((i) => {
    updateChar(c => ({ ...c, weapons: c.weapons.filter((_, wi) => wi !== i) }));
  }, [updateChar]);

  const addWeapon = useCallback(() => {
    updateChar(c => ({ ...c, weapons: [...c.weapons, { ...EMPTY_WEAPON }] }));
  }, [updateChar]);

  // Quick-ref skill values
  const skillVal = (name) => {
    const s = activeChar.skills.find(sk => sk.name === name);
    return s ? (Number(s.value) || 0) : 0;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ─── Combat Quick Reference ─── */}
      <CollapsibleSection icon="⚔" title="Combat Quick Reference">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <QuickRefPill label="HP" value={activeChar.derived.hp.current} max={activeChar.derived.hp.max} color="#C45050" />
          <QuickRefPill label="WP" value={activeChar.derived.wp.current} max={activeChar.derived.wp.max} color="#5080C4" />
          <QuickRefPill label="SAN" value={activeChar.derived.san.current} max={activeChar.derived.san.max} color="#9060A0" />
          {QUICK_REF_SKILLS.map(name => (
            <QuickRefPill key={name} label={name} value={`${skillVal(name)}%`} color="#8BA069" />
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="11" title="Wounds & Ailments">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field
            value={activeChar.wounds}
            multiline
            disabled={isLocked}
            redacted={isRedacted}
            seed={47}
            onChange={v => updateChar(c => ({ ...c, wounds: v }))}
            placeholder="Describe wounds and ailments..."
            onFocus={e => { e.target.dataset.logPrev = activeChar.wounds || ""; }}
            onBlur={e => {
              const added = extractAdded(e.target.dataset.logPrev ?? "", e.target.value);
              if (added) addLogEntry(`Wounds: added '${truncLog(added)}'`, null, added, "manual");
            }}
          />
          <CheckBox checked={activeChar.firstAidAttempted} disabled={isLocked} label="First Aid has been attempted since last injury" onChange={val => {
            updateChar(c => ({ ...c, firstAidAttempted: val }));
            addLogEntry(`First Aid: ${val ? "attempted" : "cleared"}`, !val, val, "manual");
          }} />
          <div style={{ fontSize: 10, color: "#5A6A40", fontStyle: "italic" }}>If checked, only Medicine, Surgery, or long-term rest can help further.</div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="12" title="Armor & Gear">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Field value={activeChar.armorAndGear} multiline disabled={isLocked} redacted={isRedacted} seed={53} onChange={v => updateChar(c => ({ ...c, armorAndGear: v }))} placeholder="Body armor, equipment, and gear..." />
          <div style={{ fontSize: 10, color: "#5A6A40", fontStyle: "italic" }}>Body armor reduces the damage of all attacks except Called Shots and successful Lethality rolls.</div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="13" title="Weapons" headerExtra={!isLocked ? (
        <button className="btn btn-sm" onClick={() => setGearCatalogOpen(true)}
          style={{ borderColor: "rgba(100,140,180,0.3)", background: "rgba(100,140,180,0.06)", color: "#7090B4", flexShrink: 0 }}>
          {isMobile ? "📋" : "📋 GEAR CATALOG"}
        </button>
      ) : null}>
        {isMobile ? (
          /* ─── Mobile: Card Layout ─── */
          <div style={{ display: "flex", flexDirection: "column", gap: 12, opacity: isKIA ? 0.7 : 1 }}>
            {activeChar.weapons.map((w, i) => (
              <WeaponCard key={i} w={w} i={i} isLocked={isLocked} isRedacted={isRedacted}
                updateWeaponField={updateWeaponField} removeWeapon={removeWeapon} addLogEntry={addLogEntry} />
            ))}
          </div>
        ) : (
          /* ─── Desktop: Table Layout ─── */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 700, opacity: isKIA ? 0.7 : 1 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${isKIA ? "rgba(140,50,50,0.2)" : "rgba(139,160,105,0.3)"}` }}>
                  {[
                    { label: "",            tip: "" },
                    { label: "",            tip: "" },
                    { label: "Weapon",      tip: "" },
                    { label: "Skill %",     tip: "The skill percentage used when attacking with this weapon (e.g. Firearms 40%, Melee Weapons 30%)" },
                    { label: "Base Range",  tip: "Effective range at which the weapon can reliably hit a target — attacks beyond this range suffer penalties" },
                    { label: "Damage",      tip: "Damage dice rolled on a successful hit (e.g. 1d10, 2d6). Lethal weapons use Lethality % instead." },
                    { label: "AP",          tip: "Armor Piercing — check this box if the weapon ignores armor (most rifles and military-grade rounds qualify)" },
                    { label: "Lethality %", tip: "For weapons too destructive to track hit points — roll under this % to kill outright. On failure, roll damage dice normally." },
                    { label: "Kill Radius", tip: "Area of effect for explosive or area weapons — anyone within this radius must make a Lethality check" },
                    { label: "Ammo / Capacity", tip: "Current rounds remaining / magazine capacity — click ▼ to spend one, ▲ to reload one, or type values directly" },
                    { label: "",            tip: "" },
                  ].map((h, hi) => (
                    <th key={hi} title={h.tip || undefined} style={{ padding: "8px 6px", textAlign: "left", fontSize: 9, fontFamily: "'Special Elite', cursive", letterSpacing: 1, color: "#7A8A60", fontWeight: 400, cursor: h.tip ? "help" : undefined }}>{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeChar.weapons.map((w, i) => {
                  const cs = {
                    background: isLocked ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isLocked ? "rgba(80,80,80,0.12)" : "rgba(139,160,105,0.12)"}`,
                    borderRadius: 3, padding: "5px 6px", color: isLocked ? "#666" : "#D4D8C8", fontSize: 12,
                    fontFamily: "'IBM Plex Mono', monospace", outline: "none", width: "100%",
                    cursor: isLocked ? "not-allowed" : undefined,
                  };
                  return (
                    <tr key={i}
                      draggable={!isLocked}
                      onDragStart={!isLocked ? e => handleWeaponDragStart(e, i) : undefined}
                      onDragEnd={!isLocked ? handleWeaponDragEnd : undefined}
                      onDragOver={!isLocked ? e => handleWeaponDragOver(e, i) : undefined}
                      onDrop={!isLocked ? e => handleWeaponDrop(e, i) : undefined}
                      className={`${weaponDragState.dragging === i ? "weapon-row-dragging" : ""} ${weaponDragState.over === i && weaponDragState.dragging !== i ? "weapon-row-drag-over" : ""}`}
                    >
                      <td style={{ padding: "4px 4px", width: 18 }}>
                        {!isLocked && <span className="weapon-drag-handle" title="Drag to reorder">⠿</span>}
                      </td>
                      <td style={{ padding: "4px 6px", color: "#5A6A40", fontSize: 10, fontFamily: "'Special Elite', cursive" }}>({String.fromCharCode(97 + i)})</td>
                      <td style={{ padding: "3px 3px" }}>
                        {isRedacted && w.name ? (
                          <div style={{ padding: "5px 6px" }}><Redacted active inline seed={59 + i}>{w.name}</Redacted></div>
                        ) : (
                          <input
                            style={{ ...cs, minWidth: 100 }}
                            value={w.name}
                            disabled={isLocked}
                            onChange={e => updateWeaponField(i, "name", e.target.value)}
                            onFocus={e => { e.target.dataset.logPrev = w.name || ""; }}
                            onBlur={e => {
                              const prev = e.target.dataset.logPrev ?? "";
                              const next = e.target.value.trim();
                              if (next && next !== prev.trim()) {
                                const letter = String.fromCharCode(97 + i);
                                addLogEntry(`Weapon (${letter}): '${truncLog(next)}'`, prev, next, "manual");
                              }
                            }}
                          />
                        )}
                      </td>
                      <td style={{ padding: "3px 3px" }}><input style={{ ...cs, width: 55 }} value={w.skill} disabled={isLocked} onChange={e => updateWeaponField(i, "skill", e.target.value)} /></td>
                      <td style={{ padding: "3px 3px" }}><input style={{ ...cs, width: 65 }} value={w.baseRange} disabled={isLocked} onChange={e => updateWeaponField(i, "baseRange", e.target.value)} /></td>
                      <td style={{ padding: "3px 3px" }}><input style={{ ...cs, width: 70 }} value={w.damage} disabled={isLocked} onChange={e => updateWeaponField(i, "damage", e.target.value)} /></td>
                      <td style={{ padding: "3px 3px", textAlign: "center" }}><CheckBox checked={w.armorPiercing} disabled={isLocked} onChange={val => updateWeaponField(i, "armorPiercing", val)} /></td>
                      <td style={{ padding: "3px 3px" }}><input style={{ ...cs, width: 55 }} value={w.lethality} disabled={isLocked} onChange={e => updateWeaponField(i, "lethality", e.target.value)} /></td>
                      <td style={{ padding: "3px 3px" }}><input style={{ ...cs, width: 65 }} value={w.killRadius} disabled={isLocked} onChange={e => updateWeaponField(i, "killRadius", e.target.value)} /></td>
                      <td style={{ padding: "3px 3px" }}>
                        <AmmoCounter w={w} i={i} isLocked={isLocked} cs={cs} updateWeaponField={updateWeaponField} />
                      </td>
                      {!isLocked ? (
                        <td style={{ padding: "3px 4px", width: 22 }}>
                          <button
                            onClick={() => removeWeapon(i)}
                            title="Remove weapon"
                            style={{ background: "none", border: "none", color: "#5A3030", cursor: "pointer", fontSize: 15, padding: "2px 4px", borderRadius: 3, lineHeight: 1 }}
                            onMouseEnter={e => e.currentTarget.style.color = "#C44040"}
                            onMouseLeave={e => e.currentTarget.style.color = "#5A3030"}
                          >✕</button>
                        </td>
                      ) : (
                        <td />
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!isLocked && <button className="btn btn-sm" style={{ alignSelf: "flex-start" }} onClick={addWeapon}>+ ADD WEAPON</button>}
      </CollapsibleSection>
    </div>
  );
});
