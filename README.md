# Delta Green — Agent Dossiers

*Last updated: 2026-04-20 · see [CHANGELOG.md](CHANGELOG.md) for a user-facing history of changes.*

A Progressive Web App for creating and managing [Delta Green](https://www.delta-green.com/) RPG character sheets. Sign in with Google, build your agents, track sanity, roll dice, run missions. Cloud-synced across devices, and still usable when the signal drops.

## For players

If you just want to play: see [QUICKSTART.md](QUICKSTART.md). Hit
**https://dgfieldguide.oddlyuseful.app**, sign in with Google, and you're off.

## What it does

A tab-based digital character sheet that works on phones, tablets, and desktops. Each player's agents live in Firestore under their Google account, so you can close the tab on your laptop and pick up on your phone with the same roster.

**Character management**
- Create agents via a guided Wizard or drop into a blank sheet
- Duplicate, print, export (JSON), import (PDF or JSON), delete
- Drag-and-drop reordering in the sidebar
- Mark agents KIA (locks fields, redacts personal data, sets a big red stamp); revivable if the GM has mercy

**Stats & skills**
- 6 core stats (STR, CON, DEX, INT, POW, CHA) with derived HP / WP / SAN / BP
- Derived maxes auto-calculate: `HP max = ceil((STR+CON)/2)`, `WP max = POW`, `SAN max = min(POW×5, 99−Unnatural)`
- 40+ pre-loaded skills with correct base percentages, specializations for Art / Craft / Military Science / Pilot / Science
- 6 custom skill slots (languages or anything else)
- Inline d100 roller per skill with critical / fumble / pass / fail detection (doubles logic)

**Sanity system**
- Full SAN event flow fires when current SAN drops: category select → temp insanity reaction (repress / flee / struggle / submit) → breaking point → adaptation tracking → permanent insanity at 0
- SAN ceiling enforcement as Unnatural encounters accrue
- Violence and Helplessness adaptation tracked as 3-box sets with "Adapted" flags
- Bond projection modal (Stats tab) for sacrificing bond score + WP to absorb SAN loss

**Combat**
- Quick-reference panel: HP, WP, SAN, plus the four combat skill percentages, pinned at the top of the tab
- Weapon table / mobile cards with ammo counter, AP flag, lethality %, kill radius
- 50+ weapon gear catalog across 9 categories for fast-add
- Wounds field + "First Aid attempted" flag + armor-and-gear notes

**Session tracking**
- Timestamped session log captures every stat change, roll outcome, bond event, SAN event, advancement, KIA event
- End-of-mission advancement rolls 1d4 on every failed skill at once
- Export log as JSON or print a formatted report

**Three-palette UI**
- MANILA (default dossier paper)
- BONE (clean white, print-friendly)
- FIELD (greenscreen retro terminal)
- Choice persists per device

**Global visual dice roller**
- ⚄ icon in the top bar opens a floating panel
- Basic (one-click d4 / d6 / d8 / d10 / d12 / d20 / d100) + Advanced (count × die ± modifier, optional Target% for d100 skill checks)
- Physics-based 3D animation across the viewport via [@3d-dice/dice-box](https://www.npmjs.com/package/@3d-dice/dice-box)
- Four switchable dice themes (Paper, Smooth, Rust, Classic) — each with its own font and material
- Per-device settings: size, style, color, shadows
- Every roll logs to the active character's session log with a `ROLL` badge

**Global settings**
- Sliders icon in the top bar opens a Settings modal
- Appearance, Dice, About (What's new + docs links), and Account sections
- Composes the existing `useTheme` and `useDiceSettings` hooks — no new persistence, all per-device IDB

**Offline behaviour**
- Works offline for reading existing characters (cached in IndexedDB)
- Red banner appears the moment writes can't reach Firestore; edits are blocked so nothing gets silently lost
- When you reconnect, the roster refetches and sync resumes

## Tech stack

| Layer | Tech |
|---|---|
| UI | React 19, plain CSS with design tokens (no framework) |
| Build | Vite 7, vite-plugin-pwa + Workbox |
| Auth | Firebase Auth (Google sign-in via popup) |
| Database | Firestore (one `characters` doc per agent, JSONB-style shape) |
| Local cache | `idb-keyval` for the per-user read cache |
| Hosting | Netlify (app) + Firebase Hosting (auth handler endpoints only) |
| Dice | `@3d-dice/dice-box` (Babylon.js + Ammo.js, lazy-loaded chunk) |
| PDF parsing | PDF.js (loaded from CDN on first import) |
| Fonts | Special Elite, IBM Plex Sans, IBM Plex Mono |

Security model: Firestore security rules enforce per-user access — a user can only read/write their own character docs. See [firestore.rules](firestore.rules). A future Handler / Campaign mode is intentionally accommodated by the schema (nullable `campaign_id`) but not implemented yet.

## Project structure

```
src/
  components/
    tabs/          # 5 main views: Personal, Stats, Skills, Combat, Notes
    modals/        # SAN events, bond projection, mission end, import, gear catalog
    ui/            # Primitives: SheetBox, Pip, Stepper, Stamp, Check, ThemeSwitcher, TopBar, KIABanner, etc.
    AuthProvider   # Firebase auth context + sign-in state
    LoginScreen    # Manila-paper login gate with Google sign-in
    Roster         # Post-login grid of character cards
    Wizard         # 6-step guided induction
    DiceRollerProvider # Global dice context; mounts the overlay + panel
    dice/          # DiceRollerPanel, DiceOverlay, DiceButton, DiceIcons, DiceSettings
  hooks/           # useCharacters, useAuth, useTheme, useDiceSettings, useDiceRoller, useModals, useDragAndDrop, useImport, usePwaInstall
  lib/             # firebase.js, charactersRepo.js, cache.js, diceBox.js, AuthContext, DiceRollerContext
  data/            # Default character template, skills, gear catalog, disorders
  utils/           # Dice math (rollFormula, parseFormula), stat derivation, PDF parser, print styling, UUID, text helpers
  styles/          # tokens.css (palette variables) + components.css (primitive classes)
```

## Getting started (development)

```bash
npm install
cp .env.example .env.local     # fill in the six VITE_FIREBASE_* values
npm run dev                     # http://localhost:5173
```

You'll need a Firebase project with:
- **Authentication → Google provider** enabled
- **Authentication → Authorized domains** including `localhost` and whatever hostname you deploy to
- **Firestore database** created (production mode)
- **Firestore rules** published (copy [firestore.rules](firestore.rules))
- **Firestore indexes** published (`firebase deploy --only firestore:indexes` or add manually — one composite on `characters.userId` ASC + `updatedAt` DESC)
- **Firebase Hosting** enabled (deploy anything once via `firebase deploy --only hosting`) — this provisions the `<project>.firebaseapp.com/__/firebase/init.json` endpoint that the Auth popup needs

### Other commands

```bash
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

## Deployment

Build output is a static site. Netlify handles production; `netlify.toml` covers build settings, SPA fallback, and proxy routes for the Firebase auth handler. Any `VITE_FIREBASE_*` env vars need to be configured in **Netlify → Site configuration → Environment variables** with scope=Builds and contexts=All. Pushes to `main` auto-deploy production; pushes to other branches get branch previews.

Rolling back a bad deploy is fastest from **Netlify → Deploys → (previous green deploy) → Publish deploy**.

## PDF import

Supports importing from the official Delta Green fillable character sheet PDF. The parser maps PDF form fields to the app's data model (personal info, stats, skills, bonds, weapons). All imported data is previewed for review before committing.

## Print

Every agent has a print button in the sidebar and a separate session-log print in the Notes tab. Both open a cleanly-formatted preview window with a dark top bar for the Print/Close controls and manila paper below. The print palette is fixed — greenscreen or bone UI themes don't leak into the output.

## License

Fan-made tool for the Delta Green RPG. Delta Green is the intellectual property of Arc Dream Publishing.
