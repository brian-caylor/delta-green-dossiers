import { useCallback, useEffect, useState } from "react";
import { get, set } from "idb-keyval";

// Per-device dice preferences. Stored in IndexedDB so they survive
// reloads but don't sync across devices or Google accounts — like the
// theme switcher.

const STORAGE_KEY = "dg-dice-settings";

export const DEFAULT_DICE_SETTINGS = {
  size: "large",            // "small" | "medium" | "large" | "xl"
  colorMode: "palette",     // "palette" (follow UI theme) | "custom"
  customColor: "#8c1d1d",   // redact red
  shadows: true,
};

// Scale values chosen so dice are clearly visible without being absurd.
export const SIZE_TO_SCALE = {
  small: 6,
  medium: 8,
  large: 10,
  xl: 12,
};

export function useDiceSettings() {
  const [settings, setSettings] = useState(DEFAULT_DICE_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    get(STORAGE_KEY).then((saved) => {
      if (cancelled) return;
      if (saved) setSettings({ ...DEFAULT_DICE_SETTINGS, ...saved });
      setHydrated(true);
    }).catch(() => setHydrated(true));
    return () => { cancelled = true; };
  }, []);

  const update = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      set(STORAGE_KEY, next).catch(() => { /* quota; non-fatal */ });
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_DICE_SETTINGS);
    set(STORAGE_KEY, DEFAULT_DICE_SETTINGS).catch(() => {});
  }, []);

  return { settings, hydrated, update, reset };
}
