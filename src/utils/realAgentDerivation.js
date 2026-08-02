/**
 * Turns answers from the "real person" wizard into a Delta Green character.
 *
 * Two rules drive everything here:
 *
 * 1. Stats are derived, never entered. Each answer carries a weight of -2..+2
 *    meaning "relative to a median adult". We average the weights for a stat
 *    and scale, so answering two questions and answering four produce the same
 *    range — the deep modules add accuracy, not inflation.
 *
 * 2. Skills are floors, not additions. A grant says "this skill is at least X".
 *    Overlapping sources take the highest floor plus a small bonus per extra
 *    source, so a police officer who also hunts ends up better with Firearms
 *    than either alone without stacking to an absurd number.
 *
 * There is deliberately no point pool. A real person is spiky and usually adds
 * up to less than the 72 the standard wizard enforces; that is the point of the
 * feature, and the Handler can adjust afterwards.
 */

import { createNewCharacter } from "../data/defaultCharacter";
import { calcHpMax, calcWpMax, calcSanMax } from "./statDerivation";
import { STAT_QUESTIONS, PROFESSIONS, HOBBIES, CERTIFICATIONS, LANGUAGE_LEVELS, RECRUITMENT_HOOKS } from "../data/realAgentQuestions";

const STAT_KEYS = ["str", "con", "dex", "int", "pow", "cha"];
const STANDARD_POOL = 72;
const SKILL_CAP = 80;
const STACK_BONUS = 5;

const clamp = (lo, hi, n) => Math.max(lo, Math.min(hi, n));

/**
 * Average the -2..+2 weights and scale around a median human of 11.
 * Range lands at 5..17 — real people are rarely 3s or 18s.
 */
export function deriveStat(weights) {
  const list = weights.filter((w) => typeof w === "number");
  if (list.length === 0) return 10;
  const avg = list.reduce((a, b) => a + b, 0) / list.length;
  return clamp(3, 18, Math.round(11 + avg * 3));
}

/** answers: { [questionId]: weight } → { str, con, dex, int, pow, cha } */
export function deriveAllStats(answers) {
  const out = {};
  for (const key of STAT_KEYS) {
    const weights = STAT_QUESTIONS
      .filter((q) => q.stat === key)
      .map((q) => answers[q.id])
      .filter((w) => typeof w === "number");
    out[key] = deriveStat(weights);
  }
  return out;
}

export function statTotal(stats) {
  return STAT_KEYS.reduce((sum, k) => sum + (Number(stats[k]) || 0), 0);
}

export { STANDARD_POOL };

/**
 * Scale an honest spread up or down to the standard 72-point pool while
 * preserving its shape. Only used if the player opts in.
 */
export function normalizeToPool(stats, pool = STANDARD_POOL) {
  const total = statTotal(stats);
  if (total === pool) return { ...stats };
  const out = {};
  for (const k of STAT_KEYS) out[k] = clamp(3, 18, Math.round((stats[k] / total) * pool));
  // Rounding drift: nudge the largest/smallest stat until the total matches.
  let drift = pool - statTotal(out);
  const order = [...STAT_KEYS].sort((a, b) => out[b] - out[a]);
  let i = 0;
  while (drift !== 0 && i < 100) {
    const k = drift > 0 ? order[i % order.length] : order[order.length - 1 - (i % order.length)];
    const next = out[k] + (drift > 0 ? 1 : -1);
    if (next >= 3 && next <= 18) {
      out[k] = next;
      drift += drift > 0 ? -1 : 1;
    }
    i++;
  }
  return out;
}

function gatherGrants({ professionId, hobbyIds = [], certIds = [] }) {
  const grants = [];
  const prof = PROFESSIONS.find((p) => p.id === professionId);
  if (prof) grants.push(...prof.grants);
  for (const id of hobbyIds) {
    const h = HOBBIES.find((x) => x.id === id);
    if (h) grants.push(...h.grants);
  }
  for (const id of certIds) {
    const c = CERTIFICATIONS.find((x) => x.id === id);
    if (c) grants.push(...c.grants);
  }
  return grants;
}

/**
 * Resolve grants into skill values.
 *
 * Returns { values, extraSpecs } where values maps "skill name" (and, for
 * specialised skills, the winning spec) onto a number, and extraSpecs holds
 * additional specialisations that cannot fit the single row the sheet gives a
 * skill — those become Foreign Languages & Other Skills entries.
 */
export function resolveSkillGrants(selection) {
  const grants = gatherGrants(selection);

  // Group by skill, then by spec within it.
  const bySkill = new Map();
  for (const g of grants) {
    if (!bySkill.has(g.s)) bySkill.set(g.s, new Map());
    const specs = bySkill.get(g.s);
    const key = g.spec || "";
    if (!specs.has(key)) specs.set(key, []);
    specs.get(key).push(g.v);
  }

  const values = {};
  const extraSpecs = [];

  for (const [skill, specs] of bySkill) {
    // Score each spec group: highest floor, plus a little for each extra source.
    const scored = [...specs.entries()].map(([spec, list]) => ({
      spec,
      value: Math.min(SKILL_CAP, Math.max(...list) + STACK_BONUS * (list.length - 1)),
    }));
    scored.sort((a, b) => b.value - a.value);

    const [winner, ...rest] = scored;
    values[skill] = { value: winner.value, spec: winner.spec };
    // A sheet has one row per skill. Surplus specialisations go to Other Skills.
    for (const r of rest) {
      if (r.spec) extraSpecs.push({ name: `${skill} (${r.spec})`, value: r.value });
    }
  }

  return { values, extraSpecs };
}

/**
 * Build the finished character.
 *
 * `answers` shape:
 *   identity        { firstName, lastName, profession, employer, nationality, sex, age, education }
 *   statAnswers     { [questionId]: weight }
 *   professionId    string
 *   hobbyIds        string[]
 *   certIds         string[]
 *   languages       [{ name, level }]
 *   bonds           [{ name }]
 *   motivations     string
 *   physicalDesc    string
 *   homeFamily      string
 *   edc             string[]
 *   edcNotes        string
 *   normalize       boolean
 */
export function buildRealCharacter(answers) {
  const base = createNewCharacter();
  const {
    identity = {}, statAnswers = {}, professionId = "none",
    hobbyIds = [], certIds = [], languages = [], bonds = [],
    motivations = "", physicalDesc = "", homeFamily = "",
    edc = [], edcNotes = "", normalize = false,
  } = answers;

  // ─── Stats ───
  const honest = deriveAllStats(statAnswers);
  const stats = normalize ? normalizeToPool(honest) : honest;

  base.stats = {};
  for (const k of STAT_KEYS) base.stats[k] = { score: stats[k], features: "" };

  const hpMax = calcHpMax(stats.str, stats.con);
  const wpMax = calcWpMax(stats.pow);
  const sanMax = calcSanMax(stats.pow, 0);
  base.derived = {
    hp: { max: hpMax, current: hpMax },
    wp: { max: wpMax, current: wpMax },
    san: { max: sanMax, current: sanMax },
    bp: { max: sanMax - stats.pow, current: sanMax - stats.pow },
  };

  // ─── Identity ───
  base.personal = {
    ...base.personal,
    firstName: identity.firstName || "",
    lastName: identity.lastName || "",
    profession: identity.profession || "",
    employer: identity.employer || "",
    nationality: identity.nationality || "",
    sex: identity.sex || "",
    age: identity.age || "",
    education: identity.education || "",
  };

  // ─── Skills ───
  const { values, extraSpecs } = resolveSkillGrants({ professionId, hobbyIds, certIds });
  base.skills = base.skills.map((skill) => {
    const grant = values[skill.name];
    if (!grant) return skill;
    // Unnatural is only ever earned in play — never grant it here.
    if (skill.name === "Unnatural") return skill;
    const next = { ...skill, value: Math.max(Number(skill.value) || 0, grant.value) };
    if (skill.hasSpec && grant.spec && !next.spec) next.spec = grant.spec;
    return next;
  });

  // ─── Other skills: languages first, then surplus specialisations ───
  const others = [];
  for (const lang of languages) {
    if (!lang.name || !lang.name.trim()) continue;
    const level = LANGUAGE_LEVELS.find((l) => l.id === lang.level);
    others.push({ name: `Language: ${lang.name.trim()}`, value: level ? level.v : 20, failed: false });
  }
  for (const extra of extraSpecs) others.push({ name: extra.name, value: extra.value, failed: false });
  while (others.length < 6) others.push({ name: "", value: "", failed: false });
  base.otherSkills = others;

  // ─── Bonds — seeded at CHA per Delta Green starting rules ───
  const named = bonds.filter((b) => b.name && b.name.trim());
  base.bonds = named.map((b) => ({ name: b.name.trim(), score: stats.cha, scoreMax: stats.cha }));
  while (base.bonds.length < 5) base.bonds.push({ name: "", score: "", scoreMax: null });

  // ─── Narrative ───
  base.motivations = motivations;
  base.physicalDesc = physicalDesc;
  base.homeFamily = homeFamily;
  base.recruitment = RECRUITMENT_HOOKS[professionId] || RECRUITMENT_HOOKS.none;

  const carried = [...edc];
  if (edcNotes.trim()) carried.push(edcNotes.trim());
  base.armorAndGear = carried.join(", ");

  // Mental disorders stay empty on purpose. Real diagnoses are not a character
  // sheet field — that section is for what the campaign does to you.
  base.mentalDisorders = "";

  return base;
}
