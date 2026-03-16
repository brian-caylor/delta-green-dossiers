export { printDossier, printSessionLog };

function printDossier(char, darkMode) {
  const p = char.personal;
  const s = char.stats;
  const d = char.derived;

  const fullName = [p.lastName, [p.firstName, p.middleInitial].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  const bg      = darkMode ? "#111410" : "#FAFAF6";
  const paper   = darkMode ? "#17191300" : "#FFFFFF";
  const ink     = darkMode ? "#D4D8C8"  : "#111111";
  const inkMid  = darkMode ? "#8BA069"  : "#2A4A1A";
  const inkFade = darkMode ? "#5A6A40"  : "#888888";
  const border  = darkMode ? "rgba(139,160,105,0.35)" : "#AAAAAA";
  const cellBg  = darkMode ? "rgba(255,255,255,0.03)" : "#F4F4F0";
  const headBg  = darkMode ? "rgba(139,160,105,0.15)" : "#E8EDDF";
  const accent  = darkMode ? "#8BA069"  : "#2A4A1A";

  const unnaturalEncounters = char.unnaturalEncounters || [];
  const totalUnnatural = unnaturalEncounters.reduce((sum, e) => sum + (Number(e.pts) || 0), 0);
  const sanMaxCeiling = Math.max(0, 99 - totalUnnatural);
  const unnaturalRow = (enc) => `
    <tr>
      <td style="padding:4px 8px;border-bottom:1px solid ${border};font-size:9.5pt;color:${ink};white-space:pre-wrap">${enc.desc || "(no description)"}</td>
      <td style="padding:4px 8px;border-bottom:1px solid ${border};text-align:center;font-family:monospace;font-size:11pt;font-weight:700;color:#9060A0">+${enc.pts}</td>
      <td style="padding:4px 8px;border-bottom:1px solid ${border};font-size:9pt;color:${inkFade};white-space:nowrap">${enc.date ? new Date(enc.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : ""}</td>
    </tr>`;

  const allSkills = [
    ...char.skills.map(sk => ({
      name: sk.name + (sk.hasSpec && sk.spec ? ` (${sk.spec})` : sk.hasSpec ? "" : ""),
      base: sk.base, value: sk.value, custom: false,
    })),
    ...char.otherSkills.filter(sk => sk.name).map(sk => ({
      name: sk.name, base: 0, value: sk.value || 0, custom: true,
    })),
  ];

  const colSize = Math.ceil(allSkills.length / 3);
  const col1 = allSkills.slice(0, colSize);
  const col2 = allSkills.slice(colSize, colSize * 2);
  const col3 = allSkills.slice(colSize * 2);

  const skillRow = (sk) => {
    if (!sk) return `<tr><td colspan="3" style="padding:3px 6px;border-bottom:1px solid ${border}"></td></tr>`;
    const modified = sk.value !== sk.base;
    const nameColor = sk.custom ? (darkMode ? "#7AAAD4" : "#1A3A6A") : modified ? (darkMode ? "#A0C878" : "#1A4A1A") : ink;
    return `<tr style="background:${sk.custom ? (darkMode ? "rgba(100,140,200,0.06)" : "#EEF4FF") : "transparent"}">
      <td style="padding:3px 6px;border-bottom:1px solid ${border};font-size:9pt;color:${nameColor};font-weight:${modified ? 600 : 400}">${sk.name}</td>
      <td style="padding:3px 6px;border-bottom:1px solid ${border};font-size:8pt;color:${inkFade};text-align:center;font-family:monospace">${sk.base}%</td>
      <td style="padding:3px 6px;border-bottom:1px solid ${border};font-size:10pt;color:${modified ? (darkMode ? "#A0C878" : "#1A4A1A") : ink};text-align:center;font-weight:${modified ? 700 : 400};font-family:monospace">${sk.value ?? sk.base}%</td>
    </tr>`;
  };

  const fieldBlock = (label, value, wide = false) => `
    <div style="display:flex;flex-direction:column;gap:2px;${wide ? "grid-column:1/-1;" : ""}">
      <div style="font-size:7pt;letter-spacing:1.5px;text-transform:uppercase;color:${inkFade};font-family:'Special Elite',cursive">${label}</div>
      <div style="border-bottom:1.5px solid ${border};min-height:20px;padding:2px 4px;font-size:10pt;color:${ink};font-family:'IBM Plex Sans',sans-serif;white-space:pre-wrap;word-break:break-word">${value || ""}</div>
    </div>`;

  const statRow = (abbr, label, obj) => {
    const score = (obj && typeof obj === "object") ? (obj.score ?? 10) : (obj ?? 10);
    const feat  = (obj && typeof obj === "object") ? (obj.features || "") : "";
    return `<tr>
      <td style="padding:5px 8px;border-bottom:1px solid ${border};font-family:'Special Elite',cursive;font-size:10pt;color:${accent};letter-spacing:1px">${abbr}</td>
      <td style="padding:5px 8px;border-bottom:1px solid ${border};font-size:9pt;color:${inkMid}">${label}</td>
      <td style="padding:5px 8px;border-bottom:1px solid ${border};text-align:center;font-family:monospace;font-size:13pt;font-weight:700;color:${ink}">${score}</td>
      <td style="padding:5px 8px;border-bottom:1px solid ${border};text-align:center;font-size:10pt;color:${inkFade};font-family:monospace">${score * 5}</td>
      <td style="padding:5px 8px;border-bottom:1px solid ${border};font-size:9pt;color:${inkFade}">${feat}</td>
    </tr>`;
  };

  const derivedBlock = (abbr, label, cur, max, color) => `
    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;background:${cellBg};border:1px solid ${border};border-radius:5px;padding:10px 8px">
      <div style="font-family:'Special Elite',cursive;font-size:12pt;color:${color};letter-spacing:2px">${abbr}</div>
      <div style="font-size:7.5pt;color:${inkFade};letter-spacing:1px;text-transform:uppercase">${label}</div>
      <div style="display:flex;gap:16px;align-items:baseline;margin-top:2px">
        <div style="text-align:center">
          <div style="font-family:monospace;font-size:18pt;font-weight:700;color:${ink};line-height:1">${cur}</div>
          <div style="font-size:7pt;color:${inkFade}">Current</div>
        </div>
        <div style="color:${inkFade};font-size:10pt">/</div>
        <div style="text-align:center">
          <div style="font-family:monospace;font-size:14pt;color:${inkFade};line-height:1">${max}</div>
          <div style="font-size:7pt;color:${inkFade}">Max</div>
        </div>
      </div>
    </div>`;

  const bondRow = (b) => {
    if (!b || !b.name) return "";
    return `<tr>
      <td style="padding:4px 8px;border-bottom:1px solid ${border};font-size:10pt;color:${ink}">${b.name}</td>
      <td style="padding:4px 8px;border-bottom:1px solid ${border};text-align:center;font-family:monospace;font-size:11pt;font-weight:700;color:${ink}">${b.score ?? ""}</td>
    </tr>`;
  };

  const weaponRow = (w, letter) => {
    if (!w || !w.name) return "";
    return `<tr>
      <td style="padding:3px 5px;border-bottom:1px solid ${border};font-size:8.5pt;color:${inkFade};font-family:monospace">(${letter})</td>
      <td style="padding:3px 5px;border-bottom:1px solid ${border};font-size:9pt;color:${ink}">${w.name}</td>
      <td style="padding:3px 5px;border-bottom:1px solid ${border};font-size:9pt;color:${ink};text-align:center;font-family:monospace">${w.skill}</td>
      <td style="padding:3px 5px;border-bottom:1px solid ${border};font-size:9pt;color:${ink};text-align:center;font-family:monospace">${w.baseRange}</td>
      <td style="padding:3px 5px;border-bottom:1px solid ${border};font-size:9pt;color:${ink};text-align:center;font-family:monospace">${w.damage}</td>
      <td style="padding:3px 5px;border-bottom:1px solid ${border};font-size:9pt;color:${ink};text-align:center">${w.armorPiercing ? "\u2713" : "\u2014"}</td>
      <td style="padding:3px 5px;border-bottom:1px solid ${border};font-size:9pt;color:${ink};text-align:center;font-family:monospace">${w.lethality}</td>
      <td style="padding:3px 5px;border-bottom:1px solid ${border};font-size:9pt;color:${ink};text-align:center;font-family:monospace">${w.killRadius}</td>
      <td style="padding:3px 5px;border-bottom:1px solid ${border};font-size:9pt;color:${ink};text-align:center;font-family:monospace">${w.ammo}</td>
    </tr>`;
  };

  const trainingRow = (t) => {
    if (!t || !t.name) return "";
    return `<tr>
      <td style="padding:4px 8px;border-bottom:1px solid ${border};font-size:9.5pt;color:${ink}">${t.name}</td>
      <td style="padding:4px 8px;border-bottom:1px solid ${border};font-size:9pt;color:${inkFade};font-family:monospace;text-align:center">${t.skillStat}</td>
    </tr>`;
  };

  const sectionHead = (num, title) => `
    <div style="display:flex;align-items:baseline;gap:6px;margin:0 0 8px 0;padding-bottom:5px;border-bottom:2px solid ${accent}">
      <span style="font-family:'Special Elite',cursive;font-size:8pt;color:${inkFade}">${num}.</span>
      <span style="font-family:'Special Elite',cursive;font-size:11pt;color:${accent};letter-spacing:2px;text-transform:uppercase">${title}</span>
    </div>`;

  const sanBox = (checked) => `<span style="display:inline-block;width:12px;height:12px;border:1.5px solid ${border};border-radius:2px;margin-right:4px;vertical-align:middle;background:${checked ? accent : "transparent"};position:relative">
    ${checked ? `<span style="position:absolute;top:-2px;left:1px;color:${darkMode ? "#111" : "#FFF"};font-size:10px;font-weight:700">\u2715</span>` : ""}
  </span>`;

  const kiaStamp = char.kia ? `
    <div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-18deg);font-family:'Special Elite',cursive;font-size:90pt;color:rgba(180,40,40,0.08);letter-spacing:20px;pointer-events:none;z-index:0;white-space:nowrap">K.I.A.</div>` : "";

  const pageBreak = `<div style="page-break-after:always;height:0"></div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>DD-315 \u2014 ${fullName || "Agent Dossier"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: ${bg}; color: ${ink}; font-family: 'IBM Plex Sans', sans-serif; font-size: 10pt; }
    .page { width: 8.27in; min-height: 11in; margin: 0 auto; padding: 0.45in 0.5in; background: ${paper}; position: relative; }
    .page + .page { margin-top: 0.3in; }
    table { border-collapse: collapse; width: 100%; }
    @media print {
      html, body { background: white !important; }
      .page { width: 100%; min-height: 0; margin: 0; padding: 0.35in 0.4in; box-shadow: none; page-break-after: always; }
      .no-print { display: none !important; }
      @page { size: letter; margin: 0; }
    }
  </style>
</head>
<body>
<div class="no-print" style="position:sticky;top:0;z-index:99;background:${darkMode ? "#0D0F0A" : "#2A3520"};padding:10px 24px;display:flex;align-items:center;gap:16px;border-bottom:2px solid ${accent}">
  <span style="font-family:'Special Elite',cursive;font-size:14pt;color:#8BA069;letter-spacing:3px">DD-315 DOSSIER</span>
  <span style="font-size:9pt;color:#5A6A40;letter-spacing:1px;flex:1">${fullName || "Unnamed Agent"}</span>
  <button onclick="window.print()" style="font-family:'Special Elite',cursive;cursor:pointer;border:1px solid #8BA069;background:rgba(139,160,105,0.2);color:#A0C878;padding:6px 18px;border-radius:3px;font-size:10pt;letter-spacing:2px;font-weight:600">\u2399 PRINT</button>
  <button onclick="window.close()" style="font-family:'Special Elite',cursive;cursor:pointer;border:1px solid #664040;background:rgba(140,50,50,0.12);color:#C44040;padding:6px 14px;border-radius:3px;font-size:10pt;letter-spacing:1px">\u2715 CLOSE</button>
</div>
${kiaStamp}
<div class="page">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid ${accent}">
    <div>
      <div style="font-family:'Special Elite',cursive;font-size:16pt;color:${accent};letter-spacing:4px;line-height:1">DELTA GREEN</div>
      <div style="font-size:8pt;color:${inkFade};letter-spacing:2px;margin-top:2px">AGENT DOCUMENTATION SHEET</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:7.5pt;color:${inkFade};font-family:monospace">DD FORM 315 \u2014 112382</div>
      <div style="font-size:7pt;color:${inkFade};margin-top:2px">TOP SECRET // ORCON // SPECIAL ACCESS REQUIRED</div>
      ${char.kia ? `<div style="font-family:'Special Elite',cursive;font-size:11pt;color:#C44040;letter-spacing:4px;margin-top:4px">K.I.A. \u2014 ${char.kiaDate ? new Date(char.kiaDate).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"}).toUpperCase() : ""}</div>` : ""}
    </div>
  </div>
  <div style="margin-bottom:14px">
    ${sectionHead("1\u20137", "Personal Data")}
    <div style="display:grid;grid-template-columns:1fr 1fr 60px;gap:10px;margin-bottom:10px">${fieldBlock("Last Name", p.lastName)}${fieldBlock("First Name", p.firstName)}${fieldBlock("M.I.", p.middleInitial)}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">${fieldBlock("Profession (Rank if applicable)", p.profession)}${fieldBlock("Employer", p.employer)}</div>
    <div style="display:grid;grid-template-columns:1fr 80px 70px 130px;gap:10px;margin-bottom:10px">${fieldBlock("Nationality", p.nationality)}${fieldBlock("Sex", p.sex)}${fieldBlock("Age", p.age)}${fieldBlock("D.O.B.", p.dob)}</div>
    ${fieldBlock("7. Education and Occupational History", p.education, true)}
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px">
    <div>${sectionHead("8", "Statistics")}<table><thead><tr style="background:${headBg}"><th style="padding:4px 8px;text-align:left;font-size:8pt;color:${inkFade};font-weight:400;letter-spacing:1px;font-family:'Special Elite',cursive" colspan="2">ATTRIBUTE</th><th style="padding:4px 8px;text-align:center;font-size:8pt;color:${inkFade};font-weight:400;letter-spacing:1px;font-family:'Special Elite',cursive">SCORE</th><th style="padding:4px 8px;text-align:center;font-size:8pt;color:${inkFade};font-weight:400;letter-spacing:1px;font-family:'Special Elite',cursive">\u00d75</th><th style="padding:4px 8px;text-align:left;font-size:8pt;color:${inkFade};font-weight:400;letter-spacing:1px;font-family:'Special Elite',cursive">FEATURES</th></tr></thead><tbody>${statRow("STR","Strength",s.str)}${statRow("CON","Constitution",s.con)}${statRow("DEX","Dexterity",s.dex)}${statRow("INT","Intelligence",s.int)}${statRow("POW","Power",s.pow)}${statRow("CHA","Charisma",s.cha)}</tbody></table></div>
    <div style="display:flex;flex-direction:column;gap:12px">${sectionHead("9", "Derived Attributes")}<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${derivedBlock("HP","Hit Points",d.hp.current,d.hp.max,"#C45050")}${derivedBlock("WP","Willpower",d.wp.current,d.wp.max,"#5080C4")}${derivedBlock("SAN","Sanity",d.san.current,d.san.max,"#9060A0")}${derivedBlock("BP","Breaking Point",d.bp.current,d.bp.max,"#C49050")}</div></div>
  </div>
  <div style="margin-bottom:14px">${sectionHead("10", "Physical Description")}<div style="border:1px solid ${border};border-radius:3px;padding:8px 10px;min-height:50px;font-size:10pt;color:${ink};white-space:pre-wrap;background:${cellBg}">${char.physicalDesc || ""}</div></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px">
    <div>${sectionHead("11", "Bonds")}<table><thead><tr style="background:${headBg}"><th style="padding:4px 8px;text-align:left;font-size:8pt;color:${inkFade};font-weight:400;font-family:'Special Elite',cursive">BOND</th><th style="padding:4px 8px;text-align:center;font-size:8pt;color:${inkFade};font-weight:400;font-family:'Special Elite',cursive;width:50px">SCORE</th></tr></thead><tbody>${char.bonds.map((b) => bondRow(b)).join("")}</tbody></table></div>
    <div>${sectionHead("12", "Motivations")}<div style="border:1px solid ${border};border-radius:3px;padding:8px 10px;min-height:60px;font-size:10pt;color:${ink};white-space:pre-wrap;background:${cellBg}">${char.motivations || ""}</div>${sectionHead("12a", "Mental Disorders")}<div style="border:1px solid ${border};border-radius:3px;padding:8px 10px;min-height:60px;font-size:10pt;color:${ink};white-space:pre-wrap;background:${cellBg}">${char.mentalDisorders || ""}</div></div>
  </div>
  <div style="margin-bottom:14px">${sectionHead("13", "Incidents of SAN Loss Without Going Insane")}<div style="display:flex;gap:40px;align-items:center;padding:8px 0"><div style="display:flex;align-items:center;gap:8px"><span style="font-family:'Special Elite',cursive;font-size:9pt;color:${inkMid};letter-spacing:1px;margin-right:4px">VIOLENCE</span>${char.sanLoss.violence.map(v => sanBox(v)).join("")}<span style="color:${inkFade};margin:0 8px">|</span>${sanBox(char.sanLoss.violenceAdapted)}<span style="font-size:9pt;color:${inkFade}">Adapted</span></div><div style="display:flex;align-items:center;gap:8px"><span style="font-family:'Special Elite',cursive;font-size:9pt;color:${inkMid};letter-spacing:1px;margin-right:4px">HELPLESSNESS</span>${char.sanLoss.helplessness.map(v => sanBox(v)).join("")}<span style="color:${inkFade};margin:0 8px">|</span>${sanBox(char.sanLoss.helplessnessAdapted)}<span style="font-size:9pt;color:${inkFade}">Adapted</span></div></div></div>
  <div>${sectionHead("Applicable", "Skill Sets")}<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 12px">${[col1, col2, col3].map(col => `<table><thead><tr style="background:${headBg}"><th style="padding:3px 6px;text-align:left;font-size:7.5pt;color:${inkFade};font-weight:400;font-family:'Special Elite',cursive">SKILL</th><th style="padding:3px 6px;text-align:center;font-size:7.5pt;color:${inkFade};font-weight:400;font-family:'Special Elite',cursive">BASE</th><th style="padding:3px 6px;text-align:center;font-size:7.5pt;color:${inkFade};font-weight:400;font-family:'Special Elite',cursive">VALUE</th></tr></thead><tbody>${col.map(skillRow).join("")}</tbody></table>`).join("")}</div></div>
  <div style="margin-top:16px;padding-top:8px;border-top:1px solid ${border};display:flex;justify-content:space-between;align-items:center"><div style="font-size:7.5pt;color:${inkFade};font-family:monospace">DD 315 \u2014 UNITED STATES \u2014 112382</div><div style="font-size:7.5pt;color:${inkFade}">TOP SECRET // ORCON // SPECIAL ACCESS REQUIRED \u2014 DELTA GREEN</div><div style="font-size:7.5pt;color:${inkFade}">PAGE 1 OF 2</div></div>
</div>
${pageBreak}
<div class="page">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid ${accent}"><div style="font-family:'Special Elite',cursive;font-size:13pt;color:${accent};letter-spacing:3px">DELTA GREEN \u2014 DD FORM 315</div><div style="font-size:8pt;color:${inkFade};font-family:monospace">${fullName || "Unnamed Agent"}</div></div>
  <div style="margin-bottom:14px">${sectionHead("13a", "Unnatural Encounters")}<div style="display:flex;align-items:center;gap:16px;margin-bottom:8px;padding:8px 12px;background:rgba(130,80,160,0.06);border:1px solid rgba(130,80,160,0.2);border-radius:4px"><span style="font-family:'Special Elite',cursive;font-size:9pt;color:#9060A0;letter-spacing:1px">UNNATURAL SKILL</span><span style="font-family:monospace;font-size:14pt;font-weight:700;color:${ink}">${totalUnnatural}%</span><span style="color:${inkFade};font-size:10pt">\u2192</span><span style="font-family:'Special Elite',cursive;font-size:9pt;color:#9060A0;letter-spacing:1px">SAN MAX CEILING</span><span style="font-family:monospace;font-size:14pt;font-weight:700;color:${totalUnnatural > 0 ? "#C44040" : ink}">${sanMaxCeiling}</span><span style="font-size:8pt;color:${inkFade};margin-left:auto">99 \u2212 ${totalUnnatural} = ${sanMaxCeiling}</span></div>${unnaturalEncounters.length > 0 ? `<table style="width:100%;border-collapse:collapse"><thead><tr style="background:${headBg}"><th style="padding:4px 8px;text-align:left;font-size:8pt;color:${inkFade};font-weight:400;font-family:'Special Elite',cursive;letter-spacing:1px">ENCOUNTER</th><th style="padding:4px 8px;text-align:center;font-size:8pt;color:${inkFade};font-weight:400;font-family:'Special Elite',cursive;letter-spacing:1px;width:60px">PTS</th><th style="padding:4px 8px;text-align:left;font-size:8pt;color:${inkFade};font-weight:400;font-family:'Special Elite',cursive;letter-spacing:1px;width:110px">DATE</th></tr></thead><tbody>${unnaturalEncounters.map(unnaturalRow).join("")}<tr style="background:${headBg}"><td style="padding:4px 8px;font-size:8.5pt;color:${inkFade};font-style:italic">Total</td><td style="padding:4px 8px;text-align:center;font-family:monospace;font-size:11pt;font-weight:700;color:#9060A0">${totalUnnatural}</td><td></td></tr></tbody></table>` : `<div style="padding:8px 10px;color:${inkFade};font-size:9pt;font-style:italic">No encounters recorded.</div>`}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px"><div>${sectionHead("14", "Wounds & Ailments")}<div style="border:1px solid ${border};border-radius:3px;padding:8px 10px;min-height:90px;font-size:10pt;color:${ink};white-space:pre-wrap;background:${cellBg}">${char.wounds || ""}</div><div style="display:flex;align-items:center;gap:6px;margin-top:8px">${sanBox(char.firstAidAttempted)}<span style="font-size:9pt;color:${inkFade}">First Aid has been attempted since last injury</span></div></div><div>${sectionHead("15", "Armor & Gear")}<div style="border:1px solid ${border};border-radius:3px;padding:8px 10px;min-height:90px;font-size:10pt;color:${ink};white-space:pre-wrap;background:${cellBg}">${char.armorAndGear || ""}</div></div></div>
  <div style="margin-bottom:14px">${sectionHead("16", "Weapons")}<table><thead><tr style="background:${headBg}">${["","WEAPON","SKILL %","BASE RANGE","DAMAGE","AP","LETHALITY %","KILL RADIUS","AMMO"].map(h => `<th style="padding:4px 5px;text-align:${h==="WEAPON"?"left":"center"};font-size:7.5pt;color:${inkFade};font-weight:400;font-family:'Special Elite',cursive;letter-spacing:0.5px">${h}</th>`).join("")}</tr></thead><tbody>${char.weapons.map((w, i) => weaponRow(w, String.fromCharCode(97+i))).join("")}${char.weapons.length === 0 ? `<tr><td colspan="9" style="padding:8px;color:${inkFade};text-align:center;font-size:9pt">No weapons recorded</td></tr>` : ""}</tbody></table></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px"><div>${sectionHead("17", "Personal Details & Notes")}<div style="border:1px solid ${border};border-radius:3px;padding:8px 10px;min-height:100px;font-size:9.5pt;color:${ink};white-space:pre-wrap;background:${cellBg}">${char.personalNotes || ""}</div></div><div>${sectionHead("18", "Developments Affecting Home & Family")}<div style="border:1px solid ${border};border-radius:3px;padding:8px 10px;min-height:100px;font-size:9.5pt;color:${ink};white-space:pre-wrap;background:${cellBg}">${char.homeFamily || ""}</div></div></div>
  <div style="margin-bottom:14px">${sectionHead("19", "Special Training")}<table style="max-width:420px"><thead><tr style="background:${headBg}"><th style="padding:4px 8px;text-align:left;font-size:8pt;color:${inkFade};font-weight:400;font-family:'Special Elite',cursive">TRAINING</th><th style="padding:4px 8px;text-align:center;font-size:8pt;color:${inkFade};font-weight:400;font-family:'Special Elite',cursive;width:100px">SKILL / STAT</th></tr></thead><tbody>${char.specialTraining.map(trainingRow).join("")}${char.specialTraining.filter(t => t.name).length === 0 ? `<tr><td colspan="2" style="padding:6px 8px;color:${inkFade};font-size:9pt">No special training recorded</td></tr>` : ""}</tbody></table></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px"><div>${sectionHead("20", "Authorizing Officer")}<div style="border-bottom:1.5px solid ${border};padding:4px;min-height:28px;font-size:10pt;color:${ink}">${char.authorizingOfficer || ""}</div></div><div>${sectionHead("21", "Recruitment Notes")}<div style="border:1px solid ${border};border-radius:3px;padding:8px 10px;min-height:60px;font-size:9.5pt;color:${ink};white-space:pre-wrap;background:${cellBg}">${char.recruitment || ""}</div></div></div>
  <div style="margin-top:auto;padding-top:12px;border-top:1px solid ${border};display:flex;justify-content:space-between;align-items:center"><div style="font-size:7.5pt;color:${inkFade};font-family:monospace">DD 315 \u2014 UNITED STATES \u2014 112382</div><div style="font-size:7.5pt;color:${inkFade}">TOP SECRET // ORCON // SPECIAL ACCESS REQUIRED \u2014 DELTA GREEN</div><div style="font-size:7.5pt;color:${inkFade}">PAGE 2 OF 2</div></div>
</div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=1100,scrollbars=yes,resizable=yes");
  if (!win) { alert("Pop-up blocked. Please allow pop-ups for this page and try again."); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.document.title = `DD-315 \u2014 ${fullName || "Agent"}`;
}

function printSessionLog(char) {
  const p = char.personal;
  const fullName = [p.firstName, p.lastName].filter(Boolean).join(" ") || "Unnamed Agent";
  const log = [...(char.sessionLog || [])].reverse();

  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
    catch { return iso; }
  };

  const sourceBadge = (source) => {
    if (source === "advancement") return `<span style="display:inline-block;background:#1A3A1A;border:1px solid #3A6A3A;color:#60A060;font-size:8pt;padding:1px 6px;border-radius:3px;font-family:monospace;letter-spacing:1px">ADV</span>`;
    if (source === "kia") return `<span style="display:inline-block;background:#3A1A1A;border:1px solid #6A3A3A;color:#C44040;font-size:8pt;padding:1px 6px;border-radius:3px;font-family:'Special Elite',cursive;letter-spacing:2px">K.I.A.</span>`;
    if (source === "bond") return `<span style="display:inline-block;background:rgba(80,100,180,0.15);border:1px solid rgba(80,100,180,0.35);color:#7AAAD4;font-size:8pt;padding:1px 6px;border-radius:3px;font-family:monospace;letter-spacing:1px">PROJ</span>`;
    if (source === "san") return `<span style="display:inline-block;background:rgba(110,60,140,0.15);border:1px solid rgba(110,60,140,0.35);color:#9060A0;font-size:8pt;padding:1px 6px;border-radius:3px;font-family:monospace;letter-spacing:1px">SAN</span>`;
    if (source === "unnatural") return `<span style="display:inline-block;background:rgba(80,160,130,0.12);border:1px solid rgba(80,160,130,0.3);color:#60A890;font-size:8pt;padding:1px 6px;border-radius:3px;font-family:monospace;letter-spacing:1px">UNNAT</span>`;
    return `<span style="color:#888;font-size:9pt">\u2014</span>`;
  };

  const rows = log.length === 0
    ? `<tr><td colspan="3" style="padding:16px;text-align:center;color:#888;font-style:italic">No session log entries recorded.</td></tr>`
    : log.map(e => `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #DDD;font-size:9pt;color:#555;white-space:nowrap">${fmtDate(e.timestamp)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #DDD;font-size:10pt;color:#111;font-family:monospace">${e.label || ""}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #DDD;text-align:center">${sourceBadge(e.source)}</td>
      </tr>`).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Session Log \u2014 ${fullName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=IBM+Plex+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@400&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #FFF; color: #111; font-family: 'IBM Plex Sans', sans-serif; font-size: 10pt; }
    .page { width: 8.27in; min-height: 11in; margin: 0 auto; padding: 0.5in 0.55in; }
    table { border-collapse: collapse; width: 100%; }
    @media print {
      html, body { background: white !important; }
      .page { width: 100%; min-height: 0; margin: 0; padding: 0.35in 0.4in; }
      .no-print { display: none !important; }
      @page { size: letter; margin: 0; }
    }
  </style>
</head>
<body>
<div class="no-print" style="position:sticky;top:0;z-index:99;background:#2A3520;padding:10px 24px;display:flex;align-items:center;gap:16px;border-bottom:2px solid #8BA069">
  <span style="font-family:'Special Elite',cursive;font-size:14pt;color:#8BA069;letter-spacing:3px">SESSION LOG</span>
  <span style="font-size:9pt;color:#5A6A40;letter-spacing:1px;flex:1">${fullName}</span>
  <button onclick="window.print()" style="font-family:'Special Elite',cursive;cursor:pointer;border:1px solid #8BA069;background:rgba(139,160,105,0.2);color:#A0C878;padding:6px 18px;border-radius:3px;font-size:10pt;letter-spacing:2px">\u2399 PRINT</button>
  <button onclick="window.close()" style="font-family:'Special Elite',cursive;cursor:pointer;border:1px solid #664040;background:rgba(140,50,50,0.12);color:#C44040;padding:6px 14px;border-radius:3px;font-size:10pt;letter-spacing:1px">\u2715 CLOSE</button>
</div>
<div class="page">
  <div style="margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid #2A4A1A">
    <div style="font-family:'Special Elite',cursive;font-size:18pt;color:#2A4A1A;letter-spacing:4px;margin-bottom:4px">DELTA GREEN</div>
    <div style="font-size:9pt;color:#666;letter-spacing:2px">AGENT SESSION LOG \u2014 ${fullName}</div>
    <div style="font-size:8pt;color:#999;margin-top:4px">Generated: ${fmtDate(new Date().toISOString())} \u00b7 ${log.length} entr${log.length !== 1 ? "ies" : "y"}</div>
  </div>
  <table>
    <thead><tr style="background:#E8EDDF"><th style="padding:6px 10px;text-align:left;font-size:8pt;color:#555;font-weight:400;font-family:'Special Elite',cursive;letter-spacing:1px">DATE</th><th style="padding:6px 10px;text-align:left;font-size:8pt;color:#555;font-weight:400;font-family:'Special Elite',cursive;letter-spacing:1px">CHANGE</th><th style="padding:6px 10px;text-align:center;font-size:8pt;color:#555;font-weight:400;font-family:'Special Elite',cursive;letter-spacing:1px;width:80px">SOURCE</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="margin-top:24px;padding-top:8px;border-top:1px solid #DDD;display:flex;justify-content:space-between;align-items:center"><div style="font-size:7.5pt;color:#999;font-family:monospace">DD 315 \u2014 DELTA GREEN \u2014 AGENT SESSION LOG</div><div style="font-size:7.5pt;color:#999">TOP SECRET // ORCON</div></div>
</div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=860,height=900,scrollbars=yes,resizable=yes");
  if (!win) { alert("Pop-up blocked. Please allow pop-ups for this page and try again."); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
