import { memo, useCallback, useState, useEffect, useRef } from "react";
import { CollapsibleSection, CheckBox } from "../ui";
import { rollD100 } from "../../utils/diceRoller";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const ROLL_DISPLAY_MS = 4000;

function rollTone(result) {
  if (!result) return { fg: "var(--ink-3)", bg: "var(--line-soft)", border: "var(--line-2)" };
  if (result.isCritical) return { fg: "var(--stamp-blue)", bg: "rgba(31,58,107,0.08)", border: "var(--stamp-blue)" };
  if (result.isFumble) return { fg: "var(--redact)", bg: "var(--redact-wash)", border: "var(--redact)" };
  if (result.pass) return { fg: "var(--ok)", bg: "rgba(45,90,61,0.08)", border: "var(--ok)" };
  return { fg: "var(--redact)", bg: "var(--redact-wash)", border: "var(--redact)" };
}

function rollLabel(result) {
  if (!result) return "";
  if (result.isCritical) return "CRITICAL";
  if (result.isFumble) return "FUMBLE";
  return result.pass ? "PASS" : "FAIL";
}

function DiceButton({ target, disabled, onResult }) {
  const [result, setResult] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handleRoll = () => {
    if (disabled) return;
    const r = rollD100(target);
    setResult(r);
    onResult(r);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setResult(null), ROLL_DISPLAY_MS);
  };

  if (result) {
    const tone = rollTone(result);
    return (
      <span
        onClick={handleRoll}
        style={{
          cursor: "pointer",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 700,
          color: tone.fg,
          padding: "2px 6px",
          border: `1px solid ${tone.border}`,
          background: tone.bg,
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
        title={`Rolled ${result.roll} vs ${result.target}`}
      >
        {result.roll} {rollLabel(result)}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleRoll}
      disabled={disabled}
      title={disabled ? undefined : `Roll d100 vs ${target}%`}
      style={{
        background: "none",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? "var(--ink-muted)" : "var(--ink-2)",
        fontSize: 14,
        padding: "0 4px",
        opacity: disabled ? 0.3 : 0.75,
      }}
    >⚄</button>
  );
}

const skillRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 8px",
  borderBottom: "1px solid var(--line-soft)",
};

export const SkillsTab = memo(function SkillsTab({ activeChar, isKIA, isLocked, updateChar, addLogEntry }) {
  const isMobile = useMediaQuery("(max-width: 700px)");

  const updateSkillFailed = useCallback((i, val) => {
    updateChar(c => { const skills = [...c.skills]; skills[i] = { ...skills[i], failed: val }; return { ...c, skills }; });
  }, [updateChar]);

  const updateSkillSpec = useCallback((i, val) => {
    updateChar(c => { const skills = [...c.skills]; skills[i] = { ...skills[i], spec: val }; return { ...c, skills }; });
  }, [updateChar]);

  const updateSkillValue = useCallback((i, skill, rawVal) => {
    const from = Number(skill.value) || 0;
    const to = rawVal === "" ? "" : Number(rawVal);
    updateChar(c => { const skills = [...c.skills]; skills[i] = { ...skills[i], value: to }; return { ...c, skills }; });
    const numTo = Number(to) || 0;
    if (to !== "" && from !== numTo) {
      const skillLabel = skill.name + (skill.hasSpec && skill.spec ? ` (${skill.spec})` : "");
      addLogEntry(`${skillLabel}: ${from}→${numTo}`, from, numTo, "manual");
    }
  }, [updateChar, addLogEntry]);

  const updateOtherSkillName = useCallback((i, val) => {
    updateChar(c => { const otherSkills = [...c.otherSkills]; otherSkills[i] = { ...otherSkills[i], name: val }; return { ...c, otherSkills }; });
  }, [updateChar]);

  const updateOtherSkillValue = useCallback((i, skill, rawVal) => {
    const from = Number(skill.value) || 0;
    const to = rawVal === "" ? "" : Number(rawVal);
    updateChar(c => { const otherSkills = [...c.otherSkills]; otherSkills[i] = { ...otherSkills[i], value: to }; return { ...c, otherSkills }; });
    const numTo = Number(to) || 0;
    if (to !== "" && from !== numTo && skill.name) {
      addLogEntry(`${skill.name}: ${from}→${numTo}`, from, numTo, "manual");
    }
  }, [updateChar, addLogEntry]);

  const addOtherSkill = useCallback(() => {
    updateChar(c => ({ ...c, otherSkills: [...c.otherSkills, { name: "", value: "" }] }));
  }, [updateChar]);

  const handleSkillRoll = useCallback((i, skill, result) => {
    const skillLabel = skill.name + (skill.hasSpec && skill.spec ? ` (${skill.spec})` : "");
    const tag = result.isCritical ? " CRITICAL" : result.isFumble ? " FUMBLE" : result.pass ? "" : " FAIL";
    addLogEntry(`Roll ${skillLabel}: ${result.roll} vs ${result.target}%${tag}`, null, null, "manual");
    if (!result.pass && !skill.failed) updateSkillFailed(i, true);
  }, [addLogEntry, updateSkillFailed]);

  const handleOtherSkillRoll = useCallback((skill, result) => {
    if (!skill.name) return;
    const tag = result.isCritical ? " CRITICAL" : result.isFumble ? " FUMBLE" : result.pass ? "" : " FAIL";
    addLogEntry(`Roll ${skill.name}: ${result.roll} vs ${result.target}%${tag}`, null, null, "manual");
  }, [addLogEntry]);

  return (
    <div className="col" style={{ gap: 24 }}>
      <CollapsibleSection icon="09" title="Applicable Skill Sets">
        <div className="label" style={{ fontStyle: "italic", marginBottom: 8 }}>
          {isKIA ? "This agent's skill records have been archived." : "Check the box when you fail a skill roll. Hit End Mission at the top when the operation is over to roll 1d4 advancement for each."}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? "100%" : "280px"}, 1fr))`, gap: 0 }}>
          {activeChar.skills.map((skill, i) => skill.name === "Unnatural" ? (
            <div key={i}
              style={{ ...skillRow, opacity: isKIA ? 0.6 : 1, background: "rgba(31,58,107,0.04)" }}
              title="Tracked in §06 Unnatural Encounters — cannot be manually advanced"
            >
              <span style={{ width: 14, display: "inline-block" }} />
              <span className="handwritten" style={{ flex: 1, color: "var(--stamp-blue)", letterSpacing: 1 }}>Unnatural</span>
              {!isMobile && <span className="label" style={{ fontStyle: "italic" }}>forbidden knowledge</span>}
              <span className="label">(0%)</span>
              <span className="field-num" style={{ width: 50 }}>{skill.value ?? 0}</span>
              <span className="label">%</span>
            </div>
          ) : (
            <div key={i} style={{ ...skillRow, opacity: isKIA ? 0.7 : 1 }}>
              <CheckBox checked={skill.failed} disabled={isLocked} onChange={val => updateSkillFailed(i, val)} />
              <span style={{
                flex: 1,
                fontSize: 13,
                fontFamily: "var(--font-sans)",
                color: skill.value > skill.base ? "var(--ink)" : "var(--ink-2)",
                fontWeight: skill.value > skill.base ? 600 : 400,
              }}>
                {skill.name}{skill.hasSpec ? ":" : ""}
              </span>
              {skill.hasSpec && (
                <input type="text" value={skill.spec || ""} placeholder="..." disabled={isLocked}
                  onChange={e => updateSkillSpec(i, e.target.value)}
                  className="field-line"
                  style={{ width: isMobile ? 50 : 70, fontSize: 12, fontFamily: "var(--font-hand)" }}
                />
              )}
              {!isMobile && <span className="label">({skill.base}%)</span>}
              <input type="number" value={skill.value ?? ""} min={0} max={99} disabled={isLocked}
                onChange={e => updateSkillValue(i, skill, e.target.value)}
                className="field-num" style={{ width: isMobile ? 42 : 50 }}
              />
              <span className="label">%</span>
              <DiceButton target={Number(skill.value) || 0} disabled={isKIA} onResult={r => handleSkillRoll(i, skill, r)} />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="10" title="Foreign Languages & Other Skills">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? "100%" : "280px"}, 1fr))`, gap: 0 }}>
          {activeChar.otherSkills.map((skill, i) => (
            <div key={i} style={{ ...skillRow, opacity: isKIA ? 0.7 : 1 }}>
              <input type="text" value={skill.name} placeholder={`Skill ${i + 1}...`} disabled={isLocked}
                onChange={e => updateOtherSkillName(i, e.target.value)}
                className="field-line" style={{ flex: 1, fontSize: 13 }}
              />
              <input type="number" value={skill.value ?? ""} min={0} max={99} disabled={isLocked}
                onChange={e => updateOtherSkillValue(i, skill, e.target.value)}
                className="field-num" style={{ width: 50 }}
              />
              <span className="label">%</span>
              {skill.name && <DiceButton target={Number(skill.value) || 0} disabled={isKIA} onResult={r => handleOtherSkillRoll(skill, r)} />}
            </div>
          ))}
        </div>
        {!isLocked && <button type="button" className="btn btn-sm" style={{ alignSelf: "flex-start", marginTop: 8 }} onClick={addOtherSkill}>+ ADD SKILL</button>}
      </CollapsibleSection>
    </div>
  );
});
