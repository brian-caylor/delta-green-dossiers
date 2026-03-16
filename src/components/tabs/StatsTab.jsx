import { memo, useCallback } from "react";
import { CollapsibleSection, NumField, Field, StatBar } from "../ui";
import { calcHpMax, calcWpMax, calcSanMax } from "../../utils/statDerivation";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const STATS = [
  { key: "str", label: "Strength", abbr: "STR" }, { key: "con", label: "Constitution", abbr: "CON" },
  { key: "dex", label: "Dexterity", abbr: "DEX" }, { key: "int", label: "Intelligence", abbr: "INT" },
  { key: "pow", label: "Power", abbr: "POW" }, { key: "cha", label: "Charisma", abbr: "CHA" },
];

const DERIVED = [
  { key: "hp", label: "Hit Points", abbr: "HP", color: "#C45050" },
  { key: "wp", label: "Willpower", abbr: "WP", color: "#5080C4" },
  { key: "san", label: "Sanity", abbr: "SAN", color: "#9060A0" },
  { key: "bp", label: "Breaking Point", abbr: "BP", color: "#C49050" },
];

export const StatsTab = memo(function StatsTab({ activeChar, isKIA, isLocked, isRedacted, updateChar, addLogEntry, setKiaConfirmOpen, setSanEventData, setSanEventOpen, setSanProjectionOpen, clearTempInsanity }) {
  const isMobile = useMediaQuery("(max-width: 700px)");
  const updateStatScore = useCallback((key, abbr, v) => {
    const from = Number(activeChar.stats[key].score) || 0;
    const to = Number(v) || 0;
    updateChar(c => {
      let updated = { ...c, stats: { ...c.stats, [key]: { ...c.stats[key], score: v } } };
      const derived = { ...updated.derived };

      // Auto-derive HP max from STR + CON
      if (key === "str" || key === "con") {
        const str = Number(key === "str" ? v : c.stats.str.score) || 0;
        const con = Number(key === "con" ? v : c.stats.con.score) || 0;
        const newHpMax = calcHpMax(str, con);
        const oldHpMax = Number(c.derived.hp.max) || 0;
        const newHpCurrent = Math.min(Number(c.derived.hp.current) || 0, newHpMax);
        derived.hp = { ...derived.hp, max: newHpMax, current: newHpCurrent };
        if (oldHpMax !== newHpMax) {
          setTimeout(() => addLogEntry(`HP max ${oldHpMax}→${newHpMax}`, oldHpMax, newHpMax, "manual"), 0);
        }
      }

      // Auto-derive WP max and SAN max from POW
      if (key === "pow") {
        const pow = Number(v) || 0;
        const newWpMax = calcWpMax(pow);
        const oldWpMax = Number(c.derived.wp.max) || 0;
        const newWpCurrent = Math.min(Number(c.derived.wp.current) || 0, newWpMax);
        derived.wp = { ...derived.wp, max: newWpMax, current: newWpCurrent };
        if (oldWpMax !== newWpMax) {
          setTimeout(() => addLogEntry(`WP max ${oldWpMax}→${newWpMax}`, oldWpMax, newWpMax, "manual"), 0);
        }

        const totalUnnatural = (c.unnaturalEncounters || []).reduce((sum, e) => sum + (Number(e.pts) || 0), 0);
        const newSanMax = calcSanMax(pow, totalUnnatural);
        const oldSanMax = Number(c.derived.san.max) || 0;
        const newSanCurrent = Math.min(Number(c.derived.san.current) || 0, newSanMax);
        derived.san = { ...derived.san, max: newSanMax, current: newSanCurrent };
        if (oldSanMax !== newSanMax) {
          setTimeout(() => addLogEntry(`SAN max ${oldSanMax}→${newSanMax}`, oldSanMax, newSanMax, "manual"), 0);
        }
      }

      return { ...updated, derived };
    });
    if (from !== to) addLogEntry(`${abbr} ${from}→${to}`, from, to, "manual");
  }, [activeChar, updateChar, addLogEntry]);

  const updateStatFeatures = useCallback((key, v) => {
    updateChar(c => ({ ...c, stats: { ...c.stats, [key]: { ...c.stats[key], features: v } } }));
  }, [updateChar]);

  const updateDerivedCurrent = useCallback((key, abbr, v) => {
    const from = Number(activeChar.derived[key].current) || 0;
    const to = Number(v) || 0;
    updateChar(c => ({ ...c, derived: { ...c.derived, [key]: { ...c.derived[key], current: v } } }));
    if (from !== to) addLogEntry(`${abbr} ${from}→${to}`, from, to, "manual");
    if (key === "hp" && to <= 0 && !isKIA) {
      setKiaConfirmOpen("hp");
    }
    if (key === "san" && to < from) {
      setSanEventData({ loss: from - to, from, to });
      setSanEventOpen(true);
    }
  }, [activeChar, isKIA, updateChar, addLogEntry, setKiaConfirmOpen, setSanEventData, setSanEventOpen]);

  const updateDerivedMax = useCallback((key, v) => {
    updateChar(c => ({ ...c, derived: { ...c.derived, [key]: { ...c.derived[key], max: v } } }));
  }, [updateChar]);

  // Formula tooltips for auto-derived max values
  const maxTooltip = (key) => {
    if (key === "hp") return `Auto-calculated: ceil((STR ${activeChar.stats.str.score} + CON ${activeChar.stats.con.score}) / 2)`;
    if (key === "wp") return `Auto-calculated: POW score (${activeChar.stats.pow.score})`;
    if (key === "san") {
      const totalUnnatural = (activeChar.unnaturalEncounters || []).reduce((sum, e) => sum + (Number(e.pts) || 0), 0);
      return totalUnnatural > 0
        ? `Auto-calculated: min(POW×5 = ${(activeChar.stats.pow.score || 0) * 5}, 99 − ${totalUnnatural} = ${99 - totalUnnatural})`
        : `Auto-calculated: POW×5 (${(activeChar.stats.pow.score || 0) * 5})`;
    }
    return undefined;
  };

  // HP, WP, SAN max are auto-derived; BP max is manual
  const isMaxReadOnly = (key) => key === "hp" || key === "wp" || key === "san";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <CollapsibleSection icon="07" title="Statistics">
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {STATS.map(stat => (
            <div key={stat.key} style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr auto auto" : "140px 70px 60px 1fr",
              gap: isMobile ? 8 : 12,
              alignItems: "center",
              padding: isMobile ? "8px 10px" : "10px 12px",
              borderRadius: 4, background: "rgba(255,255,255,0.02)",
              borderBottom: "1px solid rgba(139,160,105,0.08)",
            }}>
              <div>
                <span style={{ fontFamily: "'Special Elite', cursive", fontSize: 14, color: isKIA ? "#884040" : "#8BA069", letterSpacing: 1 }}>{stat.abbr}</span>
                <span style={{ fontSize: 11, color: "#5A6A40", marginLeft: 8 }}>{isMobile ? "" : stat.label}</span>
              </div>
              <NumField value={activeChar.stats[stat.key].score} min={0} max={20} disabled={isLocked} onChange={v => updateStatScore(stat.key, stat.abbr, v)} />
              <div style={{ textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: isMobile ? 12 : 14, color: isKIA ? "#885050" : "#A0B880" }}>
                x5 = {(activeChar.stats[stat.key].score || 0) * 5}
              </div>
              {!isMobile && (
                <Field placeholder="Distinguishing features..." small value={activeChar.stats[stat.key].features} disabled={isLocked} redacted={isRedacted} seed={43 + stat.key.charCodeAt(0)} onChange={v => updateStatFeatures(stat.key, v)} />
              )}
              {isMobile && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <Field placeholder="Features..." small value={activeChar.stats[stat.key].features} disabled={isLocked} redacted={isRedacted} seed={43 + stat.key.charCodeAt(0)} onChange={v => updateStatFeatures(stat.key, v)} />
                </div>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="08" title="Derived Attributes">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {DERIVED.map(attr => (
            <div key={attr.key} style={{
              background: "rgba(255,255,255,0.03)", border: `1px solid ${isKIA && attr.key === "hp" ? "rgba(180,50,50,0.2)" : "rgba(139,160,105,0.15)"}`,
              borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 12,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "'Special Elite', cursive", fontSize: 13, color: isKIA ? "#884040" : "#8BA069", letterSpacing: 2 }}>{attr.abbr}</span>
                <span style={{ fontSize: 10, color: "#5A6A40" }}>{attr.label}</span>
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <NumField
                  label="Current"
                  value={activeChar.derived[attr.key].current}
                  highlight={!isLocked}
                  disabled={isLocked}
                  onChange={v => updateDerivedCurrent(attr.key, attr.abbr, v)}
                />
                <div title={maxTooltip(attr.key)} style={{ cursor: isMaxReadOnly(attr.key) ? "help" : undefined }}>
                  <NumField
                    label="Maximum"
                    value={activeChar.derived[attr.key].max}
                    disabled={isLocked || isMaxReadOnly(attr.key)}
                    onChange={isMaxReadOnly(attr.key) ? undefined : v => updateDerivedMax(attr.key, v)}
                  />
                </div>
              </div>
              {isMaxReadOnly(attr.key) && !isKIA && (
                <div style={{ fontSize: 9, color: "#5A6A40", fontStyle: "italic", textAlign: "center", marginTop: -8 }}>
                  {attr.key === "hp" && "ceil((STR+CON)/2)"}
                  {attr.key === "wp" && "= POW"}
                  {attr.key === "san" && "min(POW×5, 99−Unnatural)"}
                </div>
              )}
              <StatBar current={isKIA && attr.key === "hp" ? 0 : activeChar.derived[attr.key].current} max={activeChar.derived[attr.key].max} color={attr.color} />
              {attr.key === "hp" && isKIA && (
                <div style={{ textAlign: "center", fontFamily: "'Special Elite', cursive", fontSize: 10, color: "#C44040", letterSpacing: 2 }}>DECEASED</div>
              )}
              {attr.key === "hp" && !isKIA && (
                <button
                  className="btn btn-sm btn-kia"
                  onClick={() => setKiaConfirmOpen("manual")}
                  style={{ marginTop: 2, width: "100%", letterSpacing: 2, fontSize: 10 }}
                >
                  ☠ MARK K.I.A.
                </button>
              )}
              {attr.key === "san" && activeChar.tempInsanity?.active && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, padding: "4px 8px", background: "rgba(200,60,60,0.15)", border: "1px solid rgba(200,60,60,0.4)", borderRadius: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#E06060", fontFamily: "'Special Elite', cursive", letterSpacing: 1.5, flex: 1 }}>
                    TEMP INSANITY: {(activeChar.tempInsanity.reaction || "").toUpperCase()}
                  </span>
                  {!isLocked && (
                    <button onClick={clearTempInsanity} style={{ background: "none", border: "1px solid rgba(200,60,60,0.4)", borderRadius: 3, color: "#E06060", cursor: "pointer", padding: "1px 8px", fontSize: 10, fontFamily: "'Special Elite', cursive" }}>
                      Clear
                    </button>
                  )}
                </div>
              )}
              {attr.key === "san" && !isLocked && (
                <button
                  className="btn btn-sm"
                  onClick={() => setSanProjectionOpen(true)}
                  disabled={
                    (Number(activeChar.derived.wp.current) || 0) <= 1 ||
                    !activeChar.bonds.some(b => Number(b.score) > 0)
                  }
                  title={
                    !activeChar.bonds.some(b => Number(b.score) > 0)
                      ? "No bonds to project onto"
                      : (Number(activeChar.derived.wp.current) || 0) <= 1
                        ? "Insufficient WP to project"
                        : undefined
                  }
                  style={{
                    marginTop: 2, width: "100%", letterSpacing: 2, fontSize: 10,
                    borderColor: "rgba(100,140,180,0.4)", color: "#7AAAD4",
                    background: "rgba(100,140,180,0.08)",
                    opacity:
                      (Number(activeChar.derived.wp.current) || 0) <= 1 ||
                      !activeChar.bonds.some(b => Number(b.score) > 0) ? 0.45 : 1,
                  }}
                >
                  ⚡ PROJECT ONTO A BOND
                </button>
              )}
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
});
