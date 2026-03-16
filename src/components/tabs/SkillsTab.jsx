import { memo, useCallback, useState, useEffect, useRef } from "react";
import { CollapsibleSection, CheckBox } from "../ui";
import { rollD100 } from "../../utils/diceRoller";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const ROLL_DISPLAY_MS = 4000;

function rollColor(result) {
  if (!result) return "#5A6A40";
  if (result.isCritical) return "#D4A020";
  if (result.isFumble) return "#C44040";
  return result.pass ? "#60A060" : "#C45050";
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
    const color = rollColor(result);
    return (
      <span
        onClick={handleRoll}
        style={{
          cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 700,
          color, padding: "1px 6px", borderRadius: 3, border: `1px solid ${color}55`,
          background: `${color}15`, whiteSpace: "nowrap", userSelect: "none",
          animation: "fadeIn 0.2s ease",
        }}
        title={`Rolled ${result.roll} vs ${result.target}`}
      >
        {result.roll} {rollLabel(result)}
      </span>
    );
  }

  return (
    <button
      onClick={handleRoll}
      disabled={disabled}
      title={disabled ? undefined : `Roll d100 vs ${target}%`}
      style={{
        background: "none", border: "none", cursor: disabled ? "not-allowed" : "pointer",
        color: disabled ? "#3A4A30" : "#5A6A40", fontSize: 13, padding: "0 3px", lineHeight: 1,
        opacity: disabled ? 0.4 : 0.7, transition: "opacity 0.15s",
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "1"; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = "0.7"; }}
    >
      &#9860;
    </button>
  );
}

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
    // Auto-check failed box on failure
    if (!result.pass && !skill.failed) {
      updateSkillFailed(i, true);
    }
  }, [addLogEntry, updateSkillFailed]);

  const handleOtherSkillRoll = useCallback((skill, result) => {
    if (!skill.name) return;
    const tag = result.isCritical ? " CRITICAL" : result.isFumble ? " FUMBLE" : result.pass ? "" : " FAIL";
    addLogEntry(`Roll ${skill.name}: ${result.roll} vs ${result.target}%${tag}`, null, null, "manual");
  }, [addLogEntry]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <CollapsibleSection icon="09" title="Applicable Skill Sets">
        <div style={{ fontSize: 11, color: "#5A6A40", fontStyle: "italic", marginBottom: 8 }}>
          {isKIA ? "This agent's skill records have been archived." : "Check the box when you fail a skill roll. Hit End Mission at the top when the operation is over to roll 1d4 advancement for each."}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? "100%" : "280px"}, 1fr))`, gap: 4 }}>
          {activeChar.skills.map((skill, i) => skill.name === "Unnatural" ? (
            <div key={i} className="skill-row" title="Tracked in §14 Unnatural Encounters — cannot be manually advanced" style={{ opacity: isKIA ? 0.6 : 1, background: "rgba(130,80,160,0.04)", border: "1px solid rgba(130,80,160,0.1)", borderRadius: 3, padding: isMobile ? "4px 6px" : undefined }}>
              <span style={{ width: 18, height: 18, display: "inline-block", flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12, color: "#9060A0", fontWeight: 500, fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>Unnatural</span>
              {!isMobile && <span style={{ fontSize: 9, color: "#5A4060", fontStyle: "italic", marginRight: 4 }}>forbidden knowledge</span>}
              <span style={{ fontSize: 10, color: "#5A4060", minWidth: 24, textAlign: "right" }}>(0%)</span>
              <span style={{ width: 50, textAlign: "center", background: "rgba(130,80,160,0.1)", border: "1px solid rgba(130,80,160,0.2)", borderRadius: 3, padding: "3px 2px", color: "#9060A0", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", display: "inline-block" }}>{skill.value ?? 0}</span>
              <span style={{ fontSize: 11, color: "#5A6A40" }}>%</span>
            </div>
          ) : (
            <div key={i} className="skill-row" style={{ opacity: isKIA ? 0.7 : 1, padding: isMobile ? "4px 6px" : undefined, gap: isMobile ? 4 : undefined }}>
              <CheckBox checked={skill.failed} disabled={isLocked} onChange={val => updateSkillFailed(i, val)} />
              <span style={{ flex: 1, fontSize: isMobile ? 11 : 12, color: skill.value > skill.base ? (isKIA ? "#886060" : "#A0B880") : "#A0A890", fontWeight: skill.value > skill.base ? 500 : 400 }}>
                {skill.name}{skill.hasSpec ? ":" : ""}
              </span>
              {skill.hasSpec && (
                <input type="text" value={skill.spec || ""} placeholder="..." disabled={isLocked}
                  onChange={e => updateSkillSpec(i, e.target.value)}
                  style={{ width: isMobile ? 50 : 70, background: "transparent", border: "none", borderBottom: `1px solid ${isLocked ? "rgba(80,80,80,0.15)" : "rgba(139,160,105,0.2)"}`, color: isLocked ? "#666" : "#A0A890", fontSize: 11, padding: "2px 4px", outline: "none", cursor: isLocked ? "not-allowed" : undefined }} />
              )}
              {!isMobile && <span style={{ fontSize: 10, color: "#5A6A40", minWidth: 24, textAlign: "right" }}>({skill.base}%)</span>}
              <input type="number" value={skill.value ?? ""} min={0} max={99} disabled={isLocked}
                onChange={e => updateSkillValue(i, skill, e.target.value)}
                style={{ width: isMobile ? 42 : 50, textAlign: "center", background: isLocked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)", border: `1px solid ${isLocked ? "rgba(80,80,80,0.15)" : "rgba(139,160,105,0.2)"}`, borderRadius: 3, padding: "3px 2px", color: isLocked ? "#666" : "#D4D8C8", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", outline: "none", cursor: isLocked ? "not-allowed" : undefined }} />
              <span style={{ fontSize: 11, color: "#5A6A40" }}>%</span>
              <DiceButton target={Number(skill.value) || 0} disabled={isKIA} onResult={r => handleSkillRoll(i, skill, r)} />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection icon="10" title="Foreign Languages & Other Skills">
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? "100%" : "280px"}, 1fr))`, gap: 4 }}>
          {activeChar.otherSkills.map((skill, i) => (
            <div key={i} className="skill-row" style={{ opacity: isKIA ? 0.7 : 1 }}>
              <input type="text" value={skill.name} placeholder={`Skill ${i + 1}...`} disabled={isLocked}
                onChange={e => updateOtherSkillName(i, e.target.value)}
                style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1px solid ${isLocked ? "rgba(80,80,80,0.15)" : "rgba(139,160,105,0.15)"}`, color: isLocked ? "#666" : "#A0A890", fontSize: 12, padding: "2px 4px", outline: "none", cursor: isLocked ? "not-allowed" : undefined }} />
              <input type="number" value={skill.value ?? ""} min={0} max={99} disabled={isLocked}
                onChange={e => updateOtherSkillValue(i, skill, e.target.value)}
                style={{ width: 50, textAlign: "center", background: isLocked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.05)", border: `1px solid ${isLocked ? "rgba(80,80,80,0.15)" : "rgba(139,160,105,0.2)"}`, borderRadius: 3, padding: "3px 2px", color: isLocked ? "#666" : "#D4D8C8", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", outline: "none", cursor: isLocked ? "not-allowed" : undefined }} />
              <span style={{ fontSize: 11, color: "#5A6A40" }}>%</span>
              {skill.name && <DiceButton target={Number(skill.value) || 0} disabled={isKIA} onResult={r => handleOtherSkillRoll(skill, r)} />}
            </div>
          ))}
        </div>
        {!isLocked && <button className="btn btn-sm" style={{ alignSelf: "flex-start" }} onClick={addOtherSkill}>+ ADD SKILL</button>}
      </CollapsibleSection>
    </div>
  );
});
