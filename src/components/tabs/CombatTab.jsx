import { memo, useCallback, useState } from "react";
import { CollapsibleSection, Field, CheckBox, Redacted } from "../ui";
import { EMPTY_WEAPON } from "../../data/gearCatalog";
import { extractAdded, truncLog } from "../../utils/textHelpers";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const QUICK_REF_SKILLS = ["Dodge", "Firearms", "Melee Weapons", "Unarmed Combat"];

function QuickRefPill({ label, value, max }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", border: "1px solid var(--line-2)" }}>
      <span className="label">{label}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
        {value}{max !== undefined ? <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>/{max}</span> : null}
      </span>
    </div>
  );
}

function AmmoCounter({ w, i, isLocked, updateWeaponField }) {
  const ammoCount = Number(w.ammo) || 0;
  const ammoMax = Number(w.ammoMax) || 0;
  const isEmpty = ammoMax > 0 && ammoCount === 0;
  const isFull = ammoMax > 0 && ammoCount >= ammoMax;
  const curColor = isEmpty ? "var(--redact)" : isFull ? "var(--ok)" : "var(--ink)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      <button type="button" className="btn btn-tiny btn-ghost" disabled={isLocked || ammoCount <= 0}
        onClick={() => updateWeaponField(i, "ammo", Math.max(0, ammoCount - 1))} title="Use one round">▼</button>
      <input type="number" min="0" className="field-num"
        style={{ width: 38, color: curColor, fontWeight: isEmpty || isFull ? 600 : undefined }}
        value={ammoCount} disabled={isLocked}
        onChange={e => updateWeaponField(i, "ammo", Math.max(0, parseInt(e.target.value, 10) || 0))}
      />
      <span style={{ color: "var(--ink-muted)" }}>/</span>
      <input type="number" min="0" className="field-num" style={{ width: 38 }}
        value={ammoMax} disabled={isLocked}
        title="Magazine capacity"
        onChange={e => updateWeaponField(i, "ammoMax", Math.max(0, parseInt(e.target.value, 10) || 0))}
      />
      <button type="button" className="btn btn-tiny btn-ghost" disabled={isLocked || (ammoMax > 0 && ammoCount >= ammoMax)}
        onClick={() => updateWeaponField(i, "ammo", ammoMax > 0 ? Math.min(ammoMax, ammoCount + 1) : ammoCount + 1)} title="Add one round">▲</button>
    </div>
  );
}

function MobileAmmoCounter({ w, i, isLocked, updateWeaponField }) {
  const ammoCount = Number(w.ammo) || 0;
  const ammoMax = Number(w.ammoMax) || 0;
  const isEmpty = ammoMax > 0 && ammoCount === 0;
  const isFull = ammoMax > 0 && ammoCount >= ammoMax;
  const curColor = isEmpty ? "var(--redact)" : isFull ? "var(--ok)" : "var(--ink)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
      <button type="button" className="btn btn-sm btn-danger" disabled={isLocked || ammoCount <= 0}
        style={{ width: 44, height: 44, padding: 0, justifyContent: "center" }}
        onClick={() => updateWeaponField(i, "ammo", Math.max(0, ammoCount - 1))}
      >−</button>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, color: curColor, fontWeight: 600, minWidth: 60, textAlign: "center" }}>
        {ammoCount}<span style={{ color: "var(--ink-muted)" }}>/</span>{ammoMax}
      </span>
      <button type="button" className="btn btn-sm" disabled={isLocked || (ammoMax > 0 && ammoCount >= ammoMax)}
        style={{ width: 44, height: 44, padding: 0, justifyContent: "center" }}
        onClick={() => updateWeaponField(i, "ammo", ammoMax > 0 ? Math.min(ammoMax, ammoCount + 1) : ammoCount + 1)}
      >+</button>
    </div>
  );
}

function WeaponCard({ w, i, isLocked, isRedacted, updateWeaponField, removeWeapon, addLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ border: "1px solid var(--line-2)", padding: 12, display: "flex", flexDirection: "column", gap: 10, background: "rgba(255,255,255,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="label">({String.fromCharCode(97 + i)})</span>
        {!isLocked && (
          <button type="button" className="btn btn-tiny btn-danger" onClick={() => removeWeapon(i)} title="Remove weapon">✕</button>
        )}
      </div>
      {isRedacted && w.name ? (
        <Redacted active inline seed={59 + i}>{w.name}</Redacted>
      ) : (
        <input className="field-line" value={w.name} disabled={isLocked} placeholder="Weapon name..."
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
        <div className="col" style={{ gap: 2 }}>
          <span className="label">SKILL %</span>
          <input className="field-num" value={w.skill} disabled={isLocked} onChange={e => updateWeaponField(i, "skill", e.target.value)} />
        </div>
        <div className="col" style={{ gap: 2 }}>
          <span className="label">DAMAGE</span>
          <input className="field-num" value={w.damage} disabled={isLocked} onChange={e => updateWeaponField(i, "damage", e.target.value)} />
        </div>
      </div>
      <div className="col" style={{ gap: 4 }}>
        <span className="label">AMMO</span>
        <MobileAmmoCounter w={w} i={i} isLocked={isLocked} updateWeaponField={updateWeaponField} />
      </div>
      <button type="button" onClick={() => setExpanded(!expanded)}
        className="label"
        style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
      >{expanded ? "▾ HIDE DETAILS" : "▸ SHOW DETAILS"}</button>
      {expanded && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 4, borderTop: "1px dashed var(--line-2)" }}>
          <div className="col" style={{ gap: 2 }}>
            <span className="label">BASE RANGE</span>
            <input className="field-num" value={w.baseRange} disabled={isLocked} onChange={e => updateWeaponField(i, "baseRange", e.target.value)} />
          </div>
          <div className="col" style={{ gap: 2 }}>
            <span className="label">LETHALITY %</span>
            <input className="field-num" value={w.lethality} disabled={isLocked} onChange={e => updateWeaponField(i, "lethality", e.target.value)} />
          </div>
          <div className="col" style={{ gap: 2 }}>
            <span className="label">KILL RADIUS</span>
            <input className="field-num" value={w.killRadius} disabled={isLocked} onChange={e => updateWeaponField(i, "killRadius", e.target.value)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 14 }}>
            <CheckBox checked={w.armorPiercing} disabled={isLocked} onChange={val => updateWeaponField(i, "armorPiercing", val)} label="ARMOR PIERCING" />
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

  const skillVal = (name) => {
    const s = activeChar.skills.find(sk => sk.name === name);
    return s ? (Number(s.value) || 0) : 0;
  };

  return (
    <div className="col" style={{ gap: 24 }}>
      <CollapsibleSection icon="⚔" title="Combat Quick Reference">
        <div className="row flex-wrap">
          <QuickRefPill label="HP" value={activeChar.derived.hp.current} max={activeChar.derived.hp.max} />
          <QuickRefPill label="WP" value={activeChar.derived.wp.current} max={activeChar.derived.wp.max} />
          <QuickRefPill label="SAN" value={activeChar.derived.san.current} max={activeChar.derived.san.max} />
          {QUICK_REF_SKILLS.map(name => (
            <QuickRefPill key={name} label={name} value={`${skillVal(name)}%`} />
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="11" title="Wounds & Ailments">
        <div className="col" style={{ gap: 12 }}>
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
          <div className="label" style={{ fontStyle: "italic" }}>If checked, only Medicine, Surgery, or long-term rest can help further.</div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="12" title="Armor & Gear">
        <div className="col" style={{ gap: 8 }}>
          <Field value={activeChar.armorAndGear} multiline disabled={isLocked} redacted={isRedacted} seed={53} onChange={v => updateChar(c => ({ ...c, armorAndGear: v }))} placeholder="Body armor, equipment, and gear..." />
          <div className="label" style={{ fontStyle: "italic" }}>Body armor reduces the damage of all attacks except Called Shots and successful Lethality rolls.</div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="13" title="Weapons" headerExtra={!isLocked ? (
        <button type="button" className="btn btn-sm" onClick={() => setGearCatalogOpen(true)}>
          {isMobile ? "📋" : "📋 GEAR CATALOG"}
        </button>
      ) : null}>
        {isMobile ? (
          <div className="col" style={{ gap: 12, opacity: isKIA ? 0.7 : 1 }}>
            {activeChar.weapons.map((w, i) => (
              <WeaponCard key={i} w={w} i={i} isLocked={isLocked} isRedacted={isRedacted}
                updateWeaponField={updateWeaponField} removeWeapon={removeWeapon} addLogEntry={addLogEntry} />
            ))}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ opacity: isKIA ? 0.7 : 1 }}>
              <thead>
                <tr>
                  {[
                    { label: "", tip: "" },
                    { label: "", tip: "" },
                    { label: "Weapon", tip: "" },
                    { label: "Skill %", tip: "The skill percentage used when attacking with this weapon" },
                    { label: "Base Range", tip: "Effective range; attacks beyond this suffer penalties" },
                    { label: "Damage", tip: "Damage dice rolled on a successful hit (e.g. 1d10, 2d6)" },
                    { label: "AP", tip: "Armor Piercing — check if the weapon ignores armor" },
                    { label: "Lethality %", tip: "For weapons too destructive to track HP — roll under this % to kill outright" },
                    { label: "Kill Radius", tip: "Area of effect for explosive or area weapons" },
                    { label: "Ammo / Cap", tip: "Rounds remaining / magazine capacity" },
                    { label: "", tip: "" },
                  ].map((h, hi) => (
                    <th key={hi} title={h.tip || undefined} style={{ cursor: h.tip ? "help" : undefined }}>{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeChar.weapons.map((w, i) => (
                  <tr key={i}
                    draggable={!isLocked}
                    onDragStart={!isLocked ? e => handleWeaponDragStart(e, i) : undefined}
                    onDragEnd={!isLocked ? handleWeaponDragEnd : undefined}
                    onDragOver={!isLocked ? e => handleWeaponDragOver(e, i) : undefined}
                    onDrop={!isLocked ? e => handleWeaponDrop(e, i) : undefined}
                    style={{
                      background: weaponDragState.over === i && weaponDragState.dragging !== i ? "var(--line-soft)" : undefined,
                      opacity: weaponDragState.dragging === i ? 0.5 : 1,
                    }}
                  >
                    <td style={{ width: 18 }}>{!isLocked && <span title="Drag to reorder" style={{ cursor: "grab", color: "var(--ink-muted)" }}>⠿</span>}</td>
                    <td className="label">({String.fromCharCode(97 + i)})</td>
                    <td>
                      {isRedacted && w.name ? (
                        <Redacted active inline seed={59 + i}>{w.name}</Redacted>
                      ) : (
                        <input className="field-line" style={{ minWidth: 100, fontFamily: "var(--font-mono)", fontSize: 12 }}
                          value={w.name} disabled={isLocked}
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
                    <td><input className="field-num" style={{ width: 55 }} value={w.skill} disabled={isLocked} onChange={e => updateWeaponField(i, "skill", e.target.value)} /></td>
                    <td><input className="field-num" style={{ width: 65 }} value={w.baseRange} disabled={isLocked} onChange={e => updateWeaponField(i, "baseRange", e.target.value)} /></td>
                    <td><input className="field-num" style={{ width: 70 }} value={w.damage} disabled={isLocked} onChange={e => updateWeaponField(i, "damage", e.target.value)} /></td>
                    <td style={{ textAlign: "center" }}><CheckBox checked={w.armorPiercing} disabled={isLocked} onChange={val => updateWeaponField(i, "armorPiercing", val)} /></td>
                    <td><input className="field-num" style={{ width: 55 }} value={w.lethality} disabled={isLocked} onChange={e => updateWeaponField(i, "lethality", e.target.value)} /></td>
                    <td><input className="field-num" style={{ width: 65 }} value={w.killRadius} disabled={isLocked} onChange={e => updateWeaponField(i, "killRadius", e.target.value)} /></td>
                    <td>
                      <AmmoCounter w={w} i={i} isLocked={isLocked} updateWeaponField={updateWeaponField} />
                    </td>
                    {!isLocked ? (
                      <td>
                        <button type="button" className="btn btn-tiny btn-danger" onClick={() => removeWeapon(i)} title="Remove weapon">✕</button>
                      </td>
                    ) : <td />}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLocked && <button type="button" className="btn btn-sm" style={{ alignSelf: "flex-start", marginTop: 8 }} onClick={addWeapon}>+ ADD WEAPON</button>}
      </CollapsibleSection>
    </div>
  );
});
