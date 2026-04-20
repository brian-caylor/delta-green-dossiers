// Thin wrapper over @3d-dice/dice-box.
//
// - Dynamically imported on first roll so the ~400 KB library ships in
//   its own chunk and is lazy-loaded.
// - One DiceBox instance per page, attached to #dice-box-root.
// - rollFormula() in src/utils/diceRoller.js owns the canonical values;
//   the library is purely visual.

let instance = null;
let initPromise = null;
let currentTheme = null;

// Per-palette dice colours. themeColor overrides the material's base hue
// while the default theme textures handle the highlights / numbers.
const THEME_COLOR = {
  manila:      "#d9cdaa",
  bone:        "#e8e0cf",
  greenscreen: "#35552e",
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
    const mod = await import("@3d-dice/dice-box");
    const DiceBox = mod.default;

    const container = document.getElementById("dice-box-root");
    if (!container) throw new Error("#dice-box-root is not in the DOM");
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      throw new Error("dice-box container has zero dimensions");
    }

    currentTheme = detectTheme();

    const box = new DiceBox({
      container: "#dice-box-root",
      assetPath: "/assets/dice-box/",
      theme: "default",
      themeColor: THEME_COLOR[currentTheme],
      // Defaults for everything else — physics tuning is only worth
      // doing if we hit a real problem. Custom values were throwing or
      // pushing dice off-screen in v1.
    });

    try {
      await box.init();
    } catch (err) {
      // Surface the actual reason so we can diagnose; still re-throw so
      // the provider's outer try/catch can fall back to showing just
      // the numeric result.
      console.error("[dice] DiceBox init failed:", err);
      throw err;
    }

    instance = box;
    return box;
  })();

  // If init fails, let the next call retry instead of being stuck.
  initPromise.catch(() => { initPromise = null; });

  return initPromise;
}

// Kick off the animation for a parsed roll result. We hand the library
// ONLY the dice groups — modifiers are our math, and bare-die notation
// like "d100" is rejected by dice-box's parser (needs explicit counts).
// Build "1d100", "2d6+1d4", etc. from the groups array.
export async function animate(perGroup) {
  const box = await ensureInstance();

  // Re-theme if the palette changed since init.
  const newTheme = detectTheme();
  if (newTheme !== currentTheme && box.updateConfig) {
    try {
      box.updateConfig({ themeColor: THEME_COLOR[newTheme] });
      currentTheme = newTheme;
    } catch { /* noop */ }
  }

  const notation = perGroup.map((g) => `${g.rolls.length}d${g.sides}`).join("+");
  return box.roll(notation);
}

export async function clearScene() {
  if (!instance) return;
  try { instance.clear(); } catch { /* noop */ }
}

export function isAvailable() {
  return !!instance;
}
