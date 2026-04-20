// Thin wrapper over @3d-dice/dice-box.
//
// - The library is dynamically imported on first use so it ends up in its
//   own chunk and never ships to users who don't open the roller.
// - We maintain a single DiceBox instance keyed to a DOM container
//   (#dice-box-root). The library owns its canvas imperatively; we just
//   ensure one mount point.
// - `rollFormula` in src/utils/diceRoller.js is the canonical source of
//   truth for dice values. The library's onRollComplete is used only for
//   "animation finished" signalling — we don't read its values.

let instance = null;       // DiceBox instance once initialised
let initPromise = null;    // in-flight init so concurrent callers share it
let currentTheme = null;   // the theme key we last configured

const THEME_CONFIG = {
  // Hexes without the # prefix — dice-box wants them that way.
  manila:      { themeColor: "#e8e0cf", diceColor: "#e8e0cf", textColor: "#1a1712", outlineColor: "#1a1712" },
  bone:        { themeColor: "#f5f1e8", diceColor: "#f5f1e8", textColor: "#1a1712", outlineColor: "#1a1712" },
  greenscreen: { themeColor: "#0f1a10", diceColor: "#142014", textColor: "#a8ff9a", outlineColor: "#a8ff9a" },
};

function detectTheme() {
  if (typeof document === "undefined") return "manila";
  const cls = document.body.className;
  if (cls.includes("theme-greenscreen")) return "greenscreen";
  if (cls.includes("theme-bone")) return "bone";
  return "manila";
}

async function ensureInstance() {
  if (instance) return instance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { default: DiceBox } = await import("@3d-dice/dice-box");
    // Ensure the DOM container exists at a stable selector so the canvas
    // can attach to it. DiceRollerProvider mounts this <div> for us.
    const container = document.getElementById("dice-box-root");
    if (!container) throw new Error("#dice-box-root not mounted");

    currentTheme = detectTheme();
    const theme = THEME_CONFIG[currentTheme];

    const box = new DiceBox({
      container: "#dice-box-root",
      assetPath: "/assets/dice-box/",
      scale: 7,
      gravity: 1.5,
      mass: 1,
      friction: 0.8,
      restitution: 0.2,
      linearDamping: 0.4,
      angularDamping: 0.4,
      spinForce: 5,
      throwForce: 4,
      startingHeight: 10,
      settleTimeout: 4000,
      offscreen: true,
      delay: 10,
      theme: "default",
      themeColor: theme.themeColor,
    });

    await box.init();
    instance = box;
    return box;
  })();

  return initPromise;
}

// Roll using dice-box notation. The promise resolves once the animation
// settles. We don't rely on the returned values for correctness — the
// caller has already computed them via rollFormula() and uses those.
export async function animate(formula) {
  const box = await ensureInstance();

  // Sync theme if the user has switched palettes since init.
  const newTheme = detectTheme();
  if (newTheme !== currentTheme) {
    const theme = THEME_CONFIG[newTheme];
    try {
      box.updateConfig({ themeColor: theme.themeColor });
      currentTheme = newTheme;
    } catch {
      // updateConfig may not exist in all versions — safe to ignore.
    }
  }

  return box.roll(formula);
}

export async function clearScene() {
  if (!instance) return;
  try { instance.clear(); } catch { /* noop */ }
}

// Stop listening / free resources. Currently unused; reserved for when
// the provider unmounts (e.g. user signs out).
export async function disposeBox() {
  if (!instance) return;
  try { instance.clear(); } catch { /* noop */ }
  instance = null;
  initPromise = null;
  currentTheme = null;
}
