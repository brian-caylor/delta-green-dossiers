import { useEffect, useState } from "react";
import AppearanceSection from "../settings/AppearanceSection.jsx";
import DiceSection from "../settings/DiceSection.jsx";
import AboutSection from "../settings/AboutSection.jsx";
import AccountSection from "../settings/AccountSection.jsx";

// [FWD-COMPAT] Sections live in a local array. When Handler/Campaign
// mode lands, add a new entry here — no modal-shell changes needed.
// A future provider (`useSettings()`) is intentionally NOT introduced
// in v1; each section composes the existing hooks directly. Add the
// provider if Firestore-synced prefs become a real requirement.
const SECTIONS = [
  { id: "appearance", label: "Appearance", Component: AppearanceSection },
  { id: "dice",       label: "Dice",       Component: DiceSection },
  { id: "about",      label: "About",      Component: AboutSection },
  { id: "account",    label: "Account",    Component: AccountSection },
];

export default function SettingsModal({ onClose }) {
  const [active, setActive] = useState("appearance");

  // Escape closes the modal — matches GearCatalogModal/SanEventModal
  // behaviour so keyboard users get a consistent dismiss.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const activeEntry = SECTIONS.find((s) => s.id === active);
  const sectionProps = active === "account" ? { onAfterSignOut: onClose } : {};
  const ActiveComponent = activeEntry?.Component;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal settings-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Settings"
      >
        <button
          type="button"
          className="btn btn-tiny btn-ghost"
          style={{ position: "absolute", top: 12, right: 14 }}
          onClick={onClose}
          aria-label="Close settings"
        >
          ✕
        </button>

        <div className="modal-title">SETTINGS</div>
        <div className="modal-sub">Per-device preferences</div>

        <div className="settings-body-grid">
          <nav className="settings-nav" aria-label="Settings sections">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={"settings-nav-item" + (active === s.id ? " active" : "")}
                onClick={() => setActive(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>

          <div className="settings-body">
            {ActiveComponent && <ActiveComponent {...sectionProps} />}
          </div>
        </div>
      </div>
    </div>
  );
}
