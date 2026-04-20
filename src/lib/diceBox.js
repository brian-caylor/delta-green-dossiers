// Thin wrapper over @3d-dice/dice-box.
//
// - Dynamically imported on first roll so the ~400 KB library ships in
//   its own chunk and is lazy-loaded.
// - One DiceBox instance per page, attached to #dice-box-root.
// - Caller passes dice groups (not perGroup) and we derive notation.
// - Caller passes per-player settings via configure(); they're applied
//   to the library on init and on subsequent rolls via updateConfig.

let instance = null;
let initPromise = null;
let activeSettings = null;

// Per-palette base colour, used when the user has chosen "match UI palette".
const PALETTE_COLOR = {
  manila:      "#d9cdaa",
  bone:        "#e8e0cf",
  greenscreen: "#35552e",
};

function detectPalette() {
  if (typeof document === "undefined") return "manila";
  const cls = document.body.className;
  if (cls.includes("theme-greenscreen")) return "greenscreen";
  if (cls.includes("theme-bone")) return "bone";
  return "manila";
}

function resolveThemeColor(settings) {
  if (settings?.colorMode === "custom" && settings.customColor) {
    return settings.customColor;
  }
  return PALETTE_COLOR[detectPalette()];
}

// Map settings → library config. Shared between init and updateConfig.
function settingsToConfig(settings) {
  return {
    scale: settings?.scale ?? 10,
    theme: settings?.style || "default",
    themeColor: resolveThemeColor(settings),
    enableShadows: settings?.shadows !== false,
  };
}

// Allow the provider to publish the latest settings snapshot so the
// library stays in sync. Safe to call repeatedly; cheap.
export async function configure(settings) {
  activeSettings = settings;
  if (instance?.updateConfig) {
    try {
      await instance.updateConfig(settingsToConfig(settings));
    } catch { /* noop — next init will pick up the change */ }
  }
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

    const box = new DiceBox({
      container: "#dice-box-root",
      assetPath: "/assets/dice-box/",
      theme: "default",
      ...settingsToConfig(activeSettings),
    });

    try {
      await box.init();
    } catch (err) {
      console.error("[dice] DiceBox init failed:", err);
      throw err;
    }

    instance = box;
    return box;
  })();

  initPromise.catch(() => { initPromise = null; });
  return initPromise;
}

// Kick off the animation. Accepts either parsed groups ({count, sides})
// or per-group results ({sides, rolls[]}).
export async function animate(groups) {
  const box = await ensureInstance();

  // Keep the library config fresh each roll — palette might have
  // switched, settings might have changed.
  try { await box.updateConfig(settingsToConfig(activeSettings)); } catch { /* noop */ }

  const notation = groups.map((g) => {
    const count = typeof g.count === "number" ? g.count : Array.isArray(g.rolls) ? g.rolls.length : 1;
    return `${count}d${g.sides}`;
  }).join("+");

  return box.roll(notation);
}

export async function clearScene() {
  if (!instance) return;
  try { instance.clear(); } catch { /* noop */ }
}
