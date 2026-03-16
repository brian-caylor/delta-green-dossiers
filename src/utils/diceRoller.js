/**
 * Roll d100 against a target number using Delta Green rules.
 *
 * - Critical success: roll of 01, or matched digits (11, 22, ...) that are successes
 * - Fumble: roll of 100, or matched digits (11, 22, ...) that are failures (and roll > 5)
 * - Regular success/failure otherwise
 */
export function rollD100(target) {
  const roll = Math.floor(Math.random() * 100) + 1;
  const numTarget = Number(target) || 0;
  const pass = roll <= numTarget;
  const matchedDigits = roll !== 100 && roll % 11 === 0; // 11, 22, 33, 44, 55, 66, 77, 88, 99
  const isCritical = roll === 1 || (pass && matchedDigits);
  const isFumble = roll === 100 || (!pass && matchedDigits && roll > 5);
  return { roll, target: numTarget, pass, isCritical, isFumble };
}
