import { SKILL_FIELD_MAP } from "../data/defaultSkills";
import { EMPTY_WEAPON } from "../data/gearCatalog";

const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174";

let pdfjsLoadPromise = null;

function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (pdfjsLoadPromise) return pdfjsLoadPromise;
  pdfjsLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${PDFJS_CDN}/pdf.min.js`;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js from CDN."));
    document.head.appendChild(script);
  });
  return pdfjsLoadPromise;
}

function fv(fields, name) {
  const v = fields[name];
  if (v === undefined || v === null || v === "Off" || v === "off") return "";
  return String(v).trim();
}

function fi(fields, name, fallback = 0) {
  const v = fv(fields, name);
  const n = parseInt(v);
  return isNaN(n) ? fallback : n;
}

export async function extractFormFields(arrayBuffer) {
  const pdfjsLib = await loadPdfJs();

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let fieldObjects = null;
  try {
    fieldObjects = await pdf.getFieldObjects();
  } catch (e) {
    throw new Error("This PDF does not appear to be an AcroForm PDF. Only the official fillable Delta Green character sheet is supported.");
  }

  if (!fieldObjects || Object.keys(fieldObjects).length === 0) {
    throw new Error("No form fields found. Make sure you are using the official fillable Delta Green PDF character sheet.");
  }

  const fields = {};
  for (const [name, arr] of Object.entries(fieldObjects)) {
    const item = Array.isArray(arr) ? arr[0] : arr;
    let value = item?.value ?? item?.defaultValue ?? "";
    if (typeof value === "string") value = value.trim();
    fields[name] = value;
  }

  return fields;
}

export function parseDeltaGreenSheet(fields) {
  const parsed = {
    personal: {}, stats: {}, derived: {},
    bonds: [], motivations: "", physicalDesc: "",
    skills: {}, specs: {}, otherSkills: [],
    wounds: "", armorAndGear: "", weapons: [],
    personalNotes: "", homeFamily: "",
    specialTraining: [], recruitment: "", authorizingOfficer: "",
    sanLoss: { violence: [false, false, false], violenceAdapted: false, helplessness: [false, false, false], helplessnessAdapted: false },
    firstAidAttempted: false,
  };

  // Personal
  const fullName = fv(fields, "1 LAST NAME FIRST NAME MIDDLE INITIAL");
  const nameParts = fullName.split(/,\s*/);
  parsed.personal.lastName = nameParts[0]?.trim() || "";
  const firstMid = (nameParts[1] || "").trim().split(/\s+/);
  parsed.personal.firstName = firstMid[0] || "";
  parsed.personal.middleInitial = firstMid.slice(1).join(" ").replace(/\.$/, "") || "";
  parsed.personal.profession = fv(fields, "2 PROFESSION RANK IF APPLICABLE");
  parsed.personal.employer = fv(fields, "3 EMPLOYER");
  parsed.personal.nationality = fv(fields, "4 NATIONALITY");
  parsed.personal.sex = fv(fields, "SEX");

  const ageDob = fv(fields, "6 AGE AND DOB");
  const ageDobMatch = ageDob.match(/^(\d+)\s*[-\u2013]\s*(.+)$/);
  if (ageDobMatch) {
    parsed.personal.age = ageDobMatch[1];
    parsed.personal.dob = ageDobMatch[2].trim();
  } else {
    parsed.personal.age = ageDob;
  }

  parsed.personal.education = fv(fields, "7 EDUCATION AND OCCUPATION");
  parsed.physicalDesc = fv(fields, "10 PHYSICAL DESCRIPTION");

  // Stats
  for (const [key, abbr] of [["str","STR"],["con","CON"],["dex","DEX"],["int","INT"],["pow","POW"],["cha","CHA"]]) {
    parsed.stats[key] = {
      score: fi(fields, abbr, 10),
      features: fv(fields, `${abbr} DISTINGUISHING FEATURES`),
    };
  }

  // Derived
  parsed.derived.hp = { max: fi(fields, "MAXIMUMHit Points HP", 10), current: fi(fields, "CURRENTHit Points HP", 10) };
  parsed.derived.wp = { max: fi(fields, "MAXIMUMWillpower Points WP", 10), current: fi(fields, "CURRENTWillpower Points WP", 10) };
  parsed.derived.san = { max: fi(fields, "MAXIMUMSanity Points SAN", 50), current: fi(fields, "CURRENTSanity Points SAN", 50) };
  const bpCurrent = fi(fields, "CURRENTBreaking Point BP", 0);
  parsed.derived.bp = { max: bpCurrent || fi(fields, "MAXIMUMBreaking Point BP", 40), current: bpCurrent };

  // Bonds
  for (let i = 1; i <= 6; i++) {
    const name = fv(fields, `BOND ${i}`);
    const scoreStr = fv(fields, `BOND ${i} SCORE`);
    const score = parseInt(scoreStr);
    if (name || !isNaN(score)) {
      parsed.bonds.push({ name, score: isNaN(score) ? "" : score });
    }
  }

  // Motivations
  parsed.motivations = fv(fields, "12 MOTIVATIONS AND MENTAL DISORDERSPSYCHOLOGICAL DATA") ||
                       fv(fields, "12 MOTIVATIONS AND MENTAL DISORDERS");

  // Skills
  for (const def of SKILL_FIELD_MAP) {
    const rawVal = fv(fields, def.field);
    const num = parseInt(rawVal);
    parsed.skills[def.name] = isNaN(num) ? def.base : num;

    if (def.hasSpec && def.specField) {
      const spec = fv(fields, def.specField);
      const specClean = spec.replace(/-\d+$/, "").trim();
      if (specClean) parsed.specs[def.name] = specClean;
    }
  }

  // Other / Foreign Language Skills
  for (let i = 1; i <= 6; i++) {
    const name = fv(fields, `Foreign Languages and Other Skills ${i}`);
    const scoreStr = fv(fields, `Foreign Languages and Other Skills ${i} Score`);
    const value = parseInt(scoreStr);
    if (name) parsed.otherSkills.push({ name, value: isNaN(value) ? "" : value });
  }

  // SAN loss checkboxes
  const cbVals = [];
  for (let i = 1; i <= 9; i++) {
    cbVals.push(fv(fields, `Check Box${i}`) === "Yes");
  }
  parsed.sanLoss.violence = [cbVals[0], cbVals[1], cbVals[2]];
  parsed.sanLoss.violenceAdapted = cbVals[3];
  parsed.sanLoss.helplessness = [cbVals[4], cbVals[5], cbVals[6]];
  parsed.sanLoss.helplessnessAdapted = cbVals[7];

  const firstAidVal = fv(fields, "Has First Aid been attempted since the last injury") ||
                      fv(fields, "First Aid") || "";
  parsed.firstAidAttempted = firstAidVal === "Yes" || firstAidVal === "On";

  // Page 2
  parsed.wounds = fv(fields, "14 WOUNDS AND AILMENTS_2") || fv(fields, "14 WOUNDS AND AILMENTS");
  parsed.armorAndGear = fv(fields, "15 ARMOR AND GEAR");
  parsed.personalNotes = fv(fields, "17 PERSONAL DETAILS AND NOTES");
  parsed.homeFamily = fv(fields, "18 DEVELOPMENTS WHICH AFFECT HOME AND FAMILY");

  // Weapons
  for (const letter of ["a","b","c","d","e","f","g"]) {
    const name = fv(fields, `WEAPON${letter}`);
    const skill = fv(fields, `SKILL ${letter}`);
    const baseRange = fv(fields, `BASE RANGE${letter}`);
    const damage = fv(fields, `DAMAGE${letter}`);
    const ap = fv(fields, `ARMOR PIERCING${letter}`);
    const lethality = fv(fields, `KILL DAMAGE${letter}`);
    const killRadius = fv(fields, `KILL RADIUS${letter}`);
    const ammo = fv(fields, `AMMO ${letter}`);
    if (name || skill || damage) {
      parsed.weapons.push({
        name, skill, baseRange, damage,
        armorPiercing: ap === "Yes" || ap === "On",
        lethality, killRadius, ammo,
      });
    }
  }

  // Special Training
  for (const letter of ["a","b","c","d","e","f"]) {
    const name = fv(fields, `SPECIAL TRAINING${letter}`);
    const skillStat = fv(fields, `SKILL OR STAT${letter}`);
    if (name) parsed.specialTraining.push({ name, skillStat });
  }

  return parsed;
}

export function buildCharacterFromParsed(parsed, createNewCharacter) {
  const newChar = createNewCharacter();

  Object.assign(newChar.personal, parsed.personal);

  for (const key of ["str", "con", "dex", "int", "pow", "cha"]) {
    const s = parsed.stats[key];
    if (s && typeof s === "object") {
      newChar.stats[key] = { score: Number(s.score) || 10, features: s.features || "" };
    } else if (s !== undefined) {
      newChar.stats[key] = { score: Number(s) || 10, features: "" };
    }
  }

  newChar.derived.hp = { max: parsed.derived.hp.max, current: parsed.derived.hp.current };
  newChar.derived.wp = { max: parsed.derived.wp.max, current: parsed.derived.wp.current };
  newChar.derived.san = { max: parsed.derived.san.max, current: parsed.derived.san.current };
  newChar.derived.bp = { max: parsed.derived.bp.max, current: parsed.derived.bp.current };

  newChar.physicalDesc = parsed.physicalDesc || "";
  newChar.motivations = parsed.motivations || "";
  newChar.mentalDisorders = "";
  const importedUnnatural = newChar.skills.find(s => s.name === "Unnatural")?.value || 0;
  newChar.unnaturalEncounters = importedUnnatural > 0 ? [{
    id: Date.now() + Math.random(),
    desc: "(Imported from PDF \u2014 log specific encounters to track)",
    pts: importedUnnatural,
    date: new Date().toISOString(),
  }] : [];
  newChar.wounds = parsed.wounds || "";
  newChar.armorAndGear = parsed.armorAndGear || "";
  newChar.personalNotes = parsed.personalNotes || "";
  newChar.homeFamily = parsed.homeFamily || "";
  newChar.authorizingOfficer = parsed.authorizingOfficer || "";
  newChar.firstAidAttempted = parsed.firstAidAttempted || false;

  if (parsed.sanLoss) newChar.sanLoss = parsed.sanLoss;

  if (parsed.bonds.length > 0) {
    const bonds = parsed.bonds.map(b => {
      const score = b.score !== "" && b.score !== undefined ? b.score : "";
      const numScore = Number(score) || 0;
      return { name: b.name, score, scoreMax: numScore > 0 ? numScore : null };
    });
    while (bonds.length < 5) bonds.push({ name: "", score: "", scoreMax: null });
    newChar.bonds = bonds;
  }

  if (parsed.skills && Object.keys(parsed.skills).length > 0) {
    newChar.skills = newChar.skills.map(skill => {
      const val = parsed.skills[skill.name];
      const newSkill = { ...skill };
      if (val !== undefined) newSkill.value = Number(val) || skill.base;
      if (skill.hasSpec && parsed.specs?.[skill.name]) newSkill.spec = parsed.specs[skill.name];
      return newSkill;
    });
  }

  if (parsed.otherSkills.length > 0) {
    const others = parsed.otherSkills.map(s => ({ name: s.name, value: s.value }));
    while (others.length < 6) others.push({ name: "", value: "" });
    newChar.otherSkills = others;
  }

  if (parsed.weapons.length > 0) {
    const weapons = parsed.weapons.map(w => ({
      name: w.name || "", skill: String(w.skill || ""), baseRange: String(w.baseRange || ""),
      damage: String(w.damage || ""), armorPiercing: Boolean(w.armorPiercing),
      lethality: String(w.lethality || ""), killRadius: String(w.killRadius || ""),
      ammo: (() => { const v = w.ammo; if (typeof v === "number") return v; const m = String(v || "").match(/(\d+)\s*$/); return m ? parseInt(m[1], 10) : 0; })(),
      ammoMax: (() => { const v = w.ammoMax ?? w.ammo; if (typeof v === "number") return v; const m = String(v || "").match(/(\d+)\s*$/); return m ? parseInt(m[1], 10) : 0; })(),
    }));
    while (weapons.length < 4) weapons.push({ ...EMPTY_WEAPON });
    newChar.weapons = weapons;
  }

  if (parsed.specialTraining.length > 0) {
    const training = parsed.specialTraining.map(t => ({ name: t.name, skillStat: t.skillStat || "" }));
    while (training.length < 3) training.push({ name: "", skillStat: "" });
    newChar.specialTraining = training;
  }

  return newChar;
}
