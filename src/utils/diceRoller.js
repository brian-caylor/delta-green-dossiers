/**
 * Dice utilities.
 *
 * rollD100(target)           — Delta Green skill check; unchanged public API.
 * rollDie(sides)             — one die, returns 1..sides.
 * parseFormula(str)          — "2d6+3" → { groups: [{count, sides}], modifier }.
 * rollFormula(str, opts)     — full roll of a formula; returns a serializable
 *                              result including per-die rolls for animation.
 */

export function rollDie(sides) {
  const n = Number(sides);
  if (!Number.isFinite(n) || n < 2) throw new Error(`Invalid die size: ${sides}`);
  return Math.floor(Math.random() * n) + 1;
}

// Accepts "d100", "d20", "2d6", "1d4", "2d6+3", "d20-2", with optional whitespace.
// Returns { groups: [{count, sides}], modifier } or null if unparsable.
export function parseFormula(str) {
  if (typeof str !== "string") return null;
  const cleaned = str.replace(/\s+/g, "").toLowerCase();
  if (!cleaned) return null;

  // Shape: (\d*d\d+)(([+-]\d+)|([+-]\d*d\d+))*
  const tokenRe = /^([+-]?)(\d*)d(\d+)|([+-])(\d+)/g;
  const groups = [];
  let modifier = 0;
  let cursor = 0;
  let first = true;

  while (cursor < cleaned.length) {
    tokenRe.lastIndex = cursor;
    const m = tokenRe.exec(cleaned);
    if (!m || m.index !== cursor) return null;

    if (m[3] !== undefined) {
      // dN token
      const sign = m[1] === "-" ? -1 : 1;
      const count = m[2] === "" ? 1 : parseInt(m[2], 10);
      const sides = parseInt(m[3], 10);
      if (!first && sign === -1) return null;       // no subtracted dice groups for DG
      if (count < 1 || count > 100 || sides < 2) return null;
      groups.push({ count, sides });
    } else if (m[5] !== undefined) {
      // numeric modifier
      const delta = (m[4] === "-" ? -1 : 1) * parseInt(m[5], 10);
      modifier += delta;
    }
    cursor = tokenRe.lastIndex;
    first = false;
  }

  if (groups.length === 0) return null;
  return { groups, modifier };
}

export function rollFormula(str, opts = {}) {
  const parsed = parseFormula(str);
  if (!parsed) return null;
  const { groups, modifier } = parsed;

  const perGroup = groups.map(({ count, sides }) => {
    const rolls = Array.from({ length: count }, () => rollDie(sides));
    return { sides, rolls };
  });

  const sum = perGroup.reduce((acc, g) => acc + g.rolls.reduce((a, r) => a + r, 0), 0);
  const total = sum + modifier;

  const result = {
    formula: canonicalize(groups, modifier),
    perGroup,
    modifier,
    total,
    d100: null,
  };

  // Delta Green skill check semantics: only applies to a single d100 with no modifier.
  const isSingleD100 = groups.length === 1 && groups[0].count === 1 && groups[0].sides === 100 && modifier === 0;
  if (isSingleD100 && opts.target != null && opts.target !== "") {
    const roll = perGroup[0].rolls[0];
    const target = Number(opts.target) || 0;
    const pass = roll <= target;
    const matchedDigits = roll !== 100 && roll % 11 === 0;
    result.d100 = {
      target,
      pass,
      isCritical: roll === 1 || (pass && matchedDigits),
      isFumble: roll === 100 || (!pass && matchedDigits && roll > 5),
    };
  }

  return result;
}

function canonicalize(groups, modifier) {
  const parts = groups.map(({ count, sides }) => `${count > 1 ? count : ""}d${sides}`);
  if (modifier > 0) parts.push(`+${modifier}`);
  else if (modifier < 0) parts.push(`${modifier}`);
  return parts.join("");
}

/**
 * Roll d100 against a target number using Delta Green rules.
 *
 * - Critical success: roll of 01, or matched digits (11, 22, ...) that are successes
 * - Fumble: roll of 100, or matched digits (11, 22, ...) that are failures (and roll > 5)
 * - Regular success/failure otherwise
 */
export function rollD100(target) {
  const roll = rollDie(100);
  const numTarget = Number(target) || 0;
  const pass = roll <= numTarget;
  const matchedDigits = roll !== 100 && roll % 11 === 0;
  const isCritical = roll === 1 || (pass && matchedDigits);
  const isFumble = roll === 100 || (!pass && matchedDigits && roll > 5);
  return { roll, target: numTarget, pass, isCritical, isFumble };
}
