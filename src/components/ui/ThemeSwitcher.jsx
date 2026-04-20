import { useTheme } from "../../hooks/useTheme.jsx";

const LABELS = { manila: "MANILA", bone: "BONE", greenscreen: "FIELD" };

export default function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  return (
    <div className="theme-switcher" title="Palette">
      {themes.map((t) => (
        <button
          key={t}
          type="button"
          className={t === theme ? "active" : ""}
          onClick={() => setTheme(t)}
        >
          {LABELS[t] || t.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
