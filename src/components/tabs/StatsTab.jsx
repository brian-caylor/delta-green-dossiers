import { memo, useCallback, useRef } from "react";
import { CollapsibleSection, NumField, Field, StatBar, SheetBox } from "../ui";
import { calcHpMax, calcWpMax, calcSanMax } from "../../utils/statDerivation";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const STATS = [
  { key: "str", label: "Strength", abbr: "STR" }, { key: "con", label: "Constitution", abbr: "CON" },
  { key: "dex", label: "Dexterity", abbr: "DEX" }, { key: "int", label: "Intelligence", abbr: "INT" },
  { key: "pow", label: "Power", abbr: "POW" }, { key: "cha", label: "Charisma", abbr: "CHA" },
];

const DERIVED = [
  { key: "hp", label: "Hit Points", abbr: "HP", color: "var(--redact)" },
  { key: "wp", label: "Willpower", abbr: "WP", color: "var(--stamp-blue)" },
  { key: "san", label: "Sanity", abbr: "SAN", color: "var(--ok)" },
  { key: "bp", label: "Breaking Point", abbr: "BP", color: "var(--ink-2)" },
];

export const StatsTab = memo(function StatsTab({ activeChar, isKIA, isLocked, isRedacted, updateChar, addLogEntry, setKiaConfirmOpen, setSanEventData, setSanEventOpen, setSanProjectionOpen, clearTempInsanity }) {
  const isMobile = useMediaQuery("(max-width: 700px)");

  const updateStatScore = useCallback((key, abbr, v) => {
    const from = Number(activeChar.stats[key].score) || 0;
    const to = Number(v) || 0;
    updateChar(c => {
      let updated = { ...c, stats: { ...c.stats, [key]: { ...c.stats[key], score: v } } };
      const derived = { ...updated.derived };

      if (key === "str" || key === "con") {
        const str = Number(key === "str" ? v : c.stats.str.score) || 0;
        const con = Number(key === "con" ? v : c.stats.con.score) || 0;
        const newHpMax = calcHpMax(str, con);
        const oldHpMax = Number(c.derived.hp.max) || 0;
        const newHpCurrent = Math.min(Number(c.derived.hp.current) || 0, newHpMax);
        derived.hp = { ...derived.hp, max: newHpMax, current: newHpCurrent };
        if (oldHpMax !== newHpMax) setTimeout(() => addLogEntry(`HP max ${oldHpMax}→${newHpMax}`, oldHpMax, newHpMax, "manual"), 0);
      }

      if (key === "pow") {
        const pow = Number(v) || 0;
        const newWpMax = calcWpMax(pow);
        const oldWpMax = Number(c.derived.wp.max) || 0;
        const newWpCurrent = Math.min(Number(c.derived.wp.current) || 0, newWpMax);
        derived.wp = { ...derived.wp, max: newWpMax, current: newWpCurrent };
        if (oldWpMax !== newWpMax) setTimeout(() => addLogEntry(`WP max ${oldWpMax}→${newWpMax}`, oldWpMax, newWpMax, "manual"), 0);

        const totalUnnatural = (c.unnaturalEncounters || []).reduce((sum, e) => sum + (Number(e.pts) || 0), 0);
        const newSanMax = calcSanMax(pow, totalUnnatural);
        const oldSanMax = Number(c.derived.san.max) || 0;
        const newSanCurrent = Math.min(Number(c.derived.san.current) || 0, newSanMax);
        derived.san = { ...derived.san, max: newSanMax, current: newSanCurrent };
        if (oldSanMax !== newSanMax) setTimeout(() => addLogEntry(`SAN max ${oldSanMax}→${newSanMax}`, oldSanMax, newSanMax, "manual"), 0);
      }

      return { ...updated, derived };
    });
    if (from !== to) addLogEntry(`${abbr} ${from}→${to}`, from, to, "manual");
  }, [activeChar, updateChar, addLogEntry]);

  const updateStatFeatures = useCallback((key, v) => {
    updateChar(c => ({ ...c, stats: { ...c.stats, [key]: { ...c.stats[key], features: v } } }));
  }, [updateChar]);

  // Silent value update — no log, no modal. Fires on every keystroke/spinner
  // click. Side effects (log entry, SAN event modal, KIA prompt) are deferred
  // to blur so the user can fully adjust the number before committing.
  const updateDerivedCurrent = useCallback((key, v) => {
    updateChar(c => ({ ...c, derived: { ...c.derived, [key]: { ...c.derived[key], current: v } } }));
  }, [updateChar]);

  // Track the value when the field gained focus so blur can diff against it.
  const preEditRef = useRef({});

  const handleDerivedFocus = useCallback((key) => () => {
    preEditRef.current[key] = Number(activeChar.derived[key].current) || 0;
  }, [activeChar]);

  const handleDerivedBlur = useCallback((key, abbr) => () => {
    const from = preEditRef.current[key];
    const to = Number(activeChar.derived[key].current) || 0;
    if (from == null || from === to) return;
    addLogEntry(`${abbr} ${from}→${to}`, from, to, "manual");
    if (key === "hp" && to <= 0 && !isKIA) setKiaConfirmOpen("hp");
    if (key === "san" && to < from) {
      setSanEventData({ loss: from - to, from, to });
      setSanEventOpen(true);
    }
    preEditRef.current[key] = to;
  }, [activeChar, isKIA, addLogEntry, setKiaConfirmOpen, setSanEventData, setSanEventOpen]);

  const updateDerivedMax = useCallback((key, v) => {
    updateChar(c => ({ ...c, derived: { ...c.derived, [key]: { ...c.derived[key], max: v } } }));
  }, [updateChar]);

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

  const isMaxReadOnly = (key) => key === "hp" || key === "wp" || key === "san";

  return (
    <div className="col" style={{ gap: 24 }}>
      <CollapsibleSection icon="07" title="Statistics">
        <div className="col" style={{ gap: 4 }}>
          {STATS.map(stat => (
            <div key={stat.key} style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr auto auto" : "140px 70px 80px 1fr",
              gap: isMobile ? 8 : 12,
              alignItems: "center",
              padding: isMobile ? "8px 10px" : "8px 12px",
              borderBottom: "1px solid var(--line-soft)",
            }}>
              <div>
                <span className="handwritten" style={{ fontSize: 15, letterSpacing: 1 }}>{stat.abbr}</span>
                <span className="label" style={{ marginLeft: 8 }}>{isMobile ? "" : stat.label}</span>
              </div>
              <NumField value={activeChar.stats[stat.key].score} min={0} max={20} disabled={isLocked} onChange={v => updateStatScore(stat.key, stat.abbr, v)} />
              <div style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-2)" }}>
                ×5 = {(activeChar.stats[stat.key].score || 0) * 5}
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
            <SheetBox key={attr.key} title={`${attr.abbr} — ${attr.label}`}>
              <div className="col" style={{ gap: 10 }}>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <NumField
                    label="Current"
                    value={activeChar.derived[attr.key].current}
                    highlight={!isLocked}
                    disabled={isLocked}
                    onChange={v => updateDerivedCurrent(attr.key, v)}
                    onFocus={handleDerivedFocus(attr.key)}
                    onBlur={handleDerivedBlur(attr.key, attr.abbr)}
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
                  <div className="label" style={{ fontStyle: "italic", textAlign: "center", marginTop: -4 }}>
                    {attr.key === "hp" && "ceil((STR+CON)/2)"}
                    {attr.key === "wp" && "= POW"}
                    {attr.key === "san" && "min(POW×5, 99−Unnatural)"}
                  </div>
                )}
                <StatBar current={isKIA && attr.key === "hp" ? 0 : activeChar.derived[attr.key].current} max={activeChar.derived[attr.key].max} color={attr.color} />
                {attr.key === "hp" && isKIA && (
                  <div className="handwritten" style={{ textAlign: "center", fontSize: 11, color: "var(--redact)", letterSpacing: 2 }}>DECEASED</div>
                )}
                {attr.key === "hp" && !isKIA && (
                  <button type="button" className="btn btn-sm btn-danger"
                    onClick={() => setKiaConfirmOpen("manual")}
                    style={{ width: "100%", justifyContent: "center" }}
                  >☠ MARK K.I.A.</button>
                )}
                {attr.key === "san" && activeChar.tempInsanity?.active && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "var(--redact-wash)", border: "1px solid var(--redact)" }}>
                    <span className="handwritten" style={{ fontSize: 11, color: "var(--redact)", letterSpacing: 1.5, flex: 1 }}>
                      TEMP INSANITY: {(activeChar.tempInsanity.reaction || "").toUpperCase()}
                    </span>
                    {!isLocked && (
                      <button type="button" className="btn btn-tiny btn-danger" onClick={clearTempInsanity}>Clear</button>
                    )}
                  </div>
                )}
                {attr.key === "san" && !isLocked && (
                  <button type="button" className="btn btn-sm"
                    onClick={() => setSanProjectionOpen(true)}
                    disabled={(Number(activeChar.derived.wp.current) || 0) <= 1 || !activeChar.bonds.some(b => Number(b.score) > 0)}
                    title={
                      !activeChar.bonds.some(b => Number(b.score) > 0) ? "No bonds to project onto"
                        : (Number(activeChar.derived.wp.current) || 0) <= 1 ? "Insufficient WP to project"
                          : undefined
                    }
                    style={{ width: "100%", justifyContent: "center" }}
                  >⚡ PROJECT ONTO A BOND</button>
                )}
              </div>
            </SheetBox>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
});
