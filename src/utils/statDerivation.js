/**
 * Delta Green derived-stat formulas.
 *
 * HP max  = ceil((STR + CON) / 2)
 * WP max  = POW
 * SAN max = min(POW × 5, 99 − totalUnnatural)
 */

export function calcHpMax(str, con) {
  return Math.ceil(((Number(str) || 0) + (Number(con) || 0)) / 2);
}

export function calcWpMax(pow) {
  return Number(pow) || 0;
}

export function calcSanMax(pow, totalUnnatural) {
  const powCeiling = (Number(pow) || 0) * 5;
  const unnaturalCeiling = Math.max(0, 99 - (Number(totalUnnatural) || 0));
  return Math.min(powCeiling, unnaturalCeiling);
}
