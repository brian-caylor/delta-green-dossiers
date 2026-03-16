# Delta Green Agent Dossiers — Change Log

> Living document tracking all significant changes to the codebase.
> Updated by each agent after completing work so the next agent can
> pick up without re-reading every file.

---

## Current Architecture Overview

- **Framework:** React 19 + Vite 7
- **UI:** Custom components, inline styles, zero UI library
- **State:** App-level via custom hooks (`useCharacters`, `useModals`, `useDragAndDrop`, `useImport`)
- **Storage:** IndexedDB via `idb-keyval` (migrated from localStorage)
- **Deployment:** PWA-ready (service worker, web manifest, offline support)
- **Fonts:** Google Fonts (Special Elite, IBM Plex Sans, IBM Plex Mono) — cached for offline use

### Key Files

| File | Purpose |
|---|---|
| `src/App.jsx` | Root layout, tab routing, modal rendering, game mechanic handlers |
| `src/hooks/useCharacters.js` | Character CRUD, activeId, async IndexedDB persistence, session logging |
| `src/hooks/useModals.js` | All modal open/close state |
| `src/hooks/useDragAndDrop.js` | Character sidebar + weapon table drag-reorder |
| `src/hooks/useImport.js` | PDF and JSON import flows |
| `src/hooks/useMediaQuery.js` | Responsive breakpoint hook |
| `src/utils/storage.js` | IndexedDB read/write via `idb-keyval`, localStorage migration |
| `src/utils/diceRoller.js` | d100 roll logic with critical/fumble detection |
| `src/utils/statDerivation.js` | `calcSanMax()` — SAN max ceiling from POW and Unnatural |
| `src/utils/pdfImport.js` | PDF.js-based AcroForm parser for official DG character sheets |
| `src/utils/printDossier.js` | HTML generation for print view |
| `src/utils/textHelpers.js` | `charName()`, `extractAdded()`, `truncLog()` |
| `src/data/defaultCharacter.js` | `createNewCharacter()` factory with full schema |
| `src/data/defaultSkills.js` | 41 base skills + PDF field mapping |
| `src/data/gearCatalog.js` | Weapon catalog with skill names (not raw numbers) |
| `src/data/disorders.js` | Disorder lists by category (violence, helplessness, unnatural) |
| `src/components/tabs/` | PersonalTab, StatsTab, SkillsTab, CombatTab, NotesTab |
| `src/components/modals/` | SanEventModal, SanProjectionModal, SessionEndModal, GearCatalogModal, etc. |
| `src/components/ui/` | Field, NumField, StatBar, CheckBox, Redacted, CollapsibleSection, KIABanner |
| `vite.config.js` | Vite + PWA plugin config (service worker, manifest, font caching) |

---

## Changes

### 2026-03-15 — Desktop PWA Icon Fix (PNG Icons)

**What changed:**

Desktop Chromium browsers (Chrome, Edge) require PNG icons in the web manifest for installed PWA icons — SVG-only manifests result in a blank/generic icon on the desktop.

1. **`scripts/generate-icons.mjs`** — New Node script using `sharp` to convert `icon.svg` → PNG:
   - `icon-192.png` (192×192)
   - `icon-512.png` (512×512)
   - `apple-touch-icon.png` (180×180)

2. **`vite.config.js`** — Updated manifest icons to list PNGs as primary (192, 512, 512 maskable) with SVG as fallback. Added `png` to workbox `globPatterns`.

3. **`index.html`** — Added `<link rel="icon" type="image/png">` for 192px PNG and changed `apple-touch-icon` from SVG to PNG.

4. **`package.json`** — Added `sharp` as devDependency for icon generation.

**Result:** PWA install on desktop now shows the Delta Green triangle/eye icon instead of a blank icon.

---

### 2026-03-15 — PWA Conversion + IndexedDB Migration

**What changed:**

1. **Installed dependencies**
   - `idb-keyval@^6.2.2` — lightweight IndexedDB key-value store (~600 bytes)
   - `vite-plugin-pwa@^1.2.0` — service worker generation and web manifest

2. **`vite.config.js`** — Added `VitePWA` plugin configuration:
   - `registerType: 'autoUpdate'` — new versions activate automatically on next visit
   - Web manifest with app name, theme color (#1A1D16), standalone display mode
   - SVG icons at 192x192 and 512x512
   - Workbox config: precaches all app assets, runtime-caches Google Fonts (CacheFirst, 1-year TTL)

3. **`src/utils/storage.js`** — Rewrote from synchronous localStorage to async IndexedDB:
   - `loadFromStorage()` is now `async` — tries IndexedDB first, falls back to localStorage
   - On localStorage fallback: silently migrates data to IndexedDB, then removes the localStorage copy
   - `saveToStorage()` is now `async` — writes to IndexedDB via `idb-keyval.set()`
   - Error handling preserved (QuotaExceededError surfaces to user)

4. **`src/hooks/useCharacters.js`** — Updated for async storage:
   - `useEffect` load now calls `loadFromStorage().then(...)` instead of synchronous destructure
   - Debounced save now calls `saveToStorage(...).then(err => ...)` to handle async errors
   - No changes to any other hook behavior (updateChar, addLogEntry, etc.)

5. **`index.html`** — Added PWA meta tags:
   - `<link rel="icon">` → points to `/icon.svg` (was `/vite.svg`)
   - `<link rel="apple-touch-icon">` → `/apple-touch-icon.svg`
   - `<meta name="theme-color" content="#1A1D16">`
   - `<meta name="apple-mobile-web-app-capable" content="yes">`
   - `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">`
   - `<meta name="description">` for SEO/install prompts

6. **`public/`** — Added PWA icon files:
   - `icon.svg` — 512x512, Delta Green triangle/eye motif on dark background
   - `icon-192.svg` — 192x192 version
   - `apple-touch-icon.svg` — 180x180 for iOS home screen

**Migration behavior:**
- Existing users with data in localStorage will have it automatically migrated to IndexedDB on first load
- The localStorage copy is removed after successful migration
- If IndexedDB is unavailable (extremely rare), localStorage fallback still works

**Build output:**
- Service worker (`sw.js`) + Workbox runtime generated in `dist/`
- `manifest.webmanifest` generated from config
- `registerSW.js` auto-injected into the HTML
- 12 assets precached (~369 KB)

---

### 2026-03-15 — Beta Test Audit Implementations (prior to PWA)

These changes were made earlier in the same session, before the PWA conversion.
They are listed here for completeness since they represent the codebase state
the PWA was built on top of.

1. **`src/App.jsx`** — Refactored from monolithic 832-line component:
   - State extracted into `useCharacters`, `useModals`, `useDragAndDrop`, `useImport` hooks
   - Added `clearTempInsanity` handler
   - Added `tempInsanity` tracking in `handleSanEvent` (stores reaction + timestamp)
   - Added `storageError` banner UI
   - `handleUnnaturalChange` now uses `calcSanMax()` from `statDerivation.js`

2. **`src/components/tabs/CombatTab.jsx`** — Major enhancements:
   - Added `Combat Quick Reference` panel (HP, WP, SAN, Dodge%, Firearms%, Melee%, Unarmed%)
   - Added mobile card layout for weapons (viewport < 700px via `useMediaQuery`)
   - Extracted `AmmoCounter`, `MobileAmmoCounter`, `WeaponCard`, `QuickRefPill` components
   - Mobile ammo buttons are 44x44px touch targets
   - Weapon details (range, lethality, kill radius, AP) hidden behind expandable toggle on mobile

3. **`src/components/tabs/SkillsTab.jsx`** — Added inline dice roller:
   - `DiceButton` component next to each skill — rolls d100 vs skill value
   - Results display inline for 4 seconds (green pass, red fail, gold critical, skull fumble)
   - Auto-checks the "failed" box on failed rolls
   - Rolls logged to session log
   - Works on both base skills and other/foreign language skills

4. **`src/components/tabs/PersonalTab.jsx`** — Bond improvements:
   - CHA-based bond count tooltip in section header
   - Auto-fills bond score from CHA when naming a bond for the first time

5. **`src/data/gearCatalog.js`** — Skill field values changed from raw numbers to skill names:
   - `skill: "20"` → `skill: "Firearms"`, `skill: "Heavy Weapons"`, `skill: "Athletics"`, etc.

6. **New files created:**
   - `src/utils/diceRoller.js` — `rollD100(target)` with critical/fumble logic
   - `src/utils/statDerivation.js` — `calcSanMax(pow, unnaturalTotal)`
   - `src/hooks/useCharacters.js` — character state + persistence
   - `src/hooks/useModals.js` — modal open/close state
   - `src/hooks/useDragAndDrop.js` — drag reorder logic
   - `src/hooks/useImport.js` — PDF/JSON import
   - `src/hooks/useMediaQuery.js` — responsive breakpoint hook

---

## Pending Work

All 12 findings from `beta-tester-feedback/audit-2026-03-15.md` have been implemented. No pending items remain.
