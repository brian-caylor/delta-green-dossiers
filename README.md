# Delta Green -- Agent Dossiers

A Progressive Web App for creating and managing [Delta Green](https://www.delta-green.com/) RPG character sheets. Build your agents, track sanity, roll dice, and run missions -- all from your browser, even offline.

## What It Does

Delta Green -- Agent Dossiers digitizes the full Delta Green character sheet into a tab-based interface that works on phones, tablets, and desktops. All data is stored locally in IndexedDB -- nothing leaves your device.

**Character Management**
- Create, duplicate, and manage multiple agents
- Drag-and-drop reordering in the sidebar
- Mark agents KIA (locks fields, redacts personal data)
- Import characters from official Delta Green fillable PDFs
- Export/import character backups as JSON

**Stats & Skills**
- 6 core stats (STR, CON, DEX, INT, POW, CHA) with derived attributes (HP, WP, SAN, BP)
- Auto-calculated derived values that stay in sync with base stats
- 40+ pre-loaded skills with correct base percentages
- Specializations for Art, Craft, Military Science, Pilot, and Science
- Up to 6 custom skills (Foreign Languages and Other)
- Inline d100 roller with critical/fumble detection (doubles logic)

**Sanity System**
- Full SAN event flow with reaction choices (Repress, Flee, Struggle, Submit)
- Breaking point tracking and automatic disorder assignment
- SAN ceiling enforcement: min(POW x 5, 99 - Unnatural%)
- Violence and Helplessness adaptation tracking (3-box system)
- Temporary insanity state management

**Bonds**
- Up to 5 bonds (expandable), auto-populated from CHA
- Score tracking with visual progress bars
- SAN projection via bond sacrifice with WP damage rolls

**Combat**
- Quick-reference panel showing HP, WP, SAN, and key skill percentages
- Weapon management with full stat tracking (damage, AP, lethality, kill radius, ammo)
- Built-in gear catalog with 50+ weapons across 9 categories
- First aid and wound tracking

**Session Tracking**
- Timestamped session log records all meaningful changes
- End Mission handler rolls 1d4 for each failed skill (advancement system)
- Notes tab for freeform session notes

**Offline & Installable**
- Service worker caches all assets for full offline use
- Installable as a PWA on mobile and desktop
- Automatic background updates when new versions deploy

## Tech Stack

| Layer | Tech |
|---|---|
| UI | React 19, plain CSS |
| Build | Vite 7 |
| Persistence | IndexedDB via `idb-keyval` |
| PWA | `vite-plugin-pwa` + Workbox |
| PDF Parsing | PDF.js (loaded from CDN on first import) |
| Fonts | Special Elite, IBM Plex Sans, IBM Plex Mono |

No backend. No accounts. No telemetry. Just a static site with local storage.

## Project Structure

```
src/
  components/
    tabs/         # 5 main views: Personal, Stats, Skills, Combat, Notes
    modals/       # SAN events, bond projection, mission end, import, gear catalog
    ui/           # Reusable inputs, stat bars, collapsible sections, KIA banner
  hooks/          # State management, IndexedDB sync, import logic, drag-and-drop
  data/           # Game data: default character template, skills, gear catalog, disorders
  utils/          # Dice roller, stat derivation, PDF parser, print styling, text helpers
```

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Click **+ New Agent** in the sidebar to create your first dossier.

### Other Commands

```bash
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

## Deployment

The build output is a static site (`dist/`). Deploy to any static host -- Netlify, Vercel, GitHub Pages, Cloudflare Pages, etc. The service worker handles offline caching automatically.

## PDF Import

Supports importing from the official Delta Green fillable character sheet PDF. The parser maps PDF form fields to the app's data model, covering personal info, stats, skills, bonds, and weapons. You can review all imported data before confirming.

## Print

Use the browser's print function (Ctrl/Cmd+P) to generate a formatted dossier. The app applies print-specific CSS to produce a clean, readable output.

## License

This project is a fan-made tool for the Delta Green RPG. Delta Green is the intellectual property of Arc Dream Publishing.
