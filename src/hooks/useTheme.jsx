import { createContext, useContext, useEffect, useState } from "react";
import { get, set } from "idb-keyval";

const THEMES = ["manila", "bone", "greenscreen"];
const DEFAULT_THEME = "manila";
const STORAGE_KEY = "dg-theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME);

  // Hydrate from IDB on mount. If not set, default stays.
  useEffect(() => {
    (async () => {
      try {
        const stored = await get(STORAGE_KEY);
        if (stored && THEMES.includes(stored)) setThemeState(stored);
      } catch { /* noop */ }
    })();
  }, []);

  // Keep document.body in sync with theme state.
  useEffect(() => {
    document.body.classList.remove("theme-manila", "theme-bone", "theme-greenscreen");
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  const setTheme = (t) => {
    if (!THEMES.includes(t)) return;
    setThemeState(t);
    set(STORAGE_KEY, t).catch(() => { /* quota errors are non-fatal */ });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
