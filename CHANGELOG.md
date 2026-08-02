# Changelog

User-facing changes to Delta Green — Agent Dossiers, newest first.

Not everything merged into the app gets an entry here — typos, dependency
bumps, and small tweaks stay in git. Things that change how you use the app
are listed below with the date they went live on the production URL.

---

## 2026-04-20 — Global Settings

Every per-device preference lives in one place now, plus a path to the
docs from inside the app.

- New **sliders icon** in the top bar opens the **Settings** modal.
- **Appearance** section — same three-way palette switcher as the top
  bar, with a one-line description for each theme. Changes sync live.
- **Dice** section — the same size / style / color / shadows controls
  that live behind the dice panel's ⚙ icon, now a second entry point.
- **About** section — the three most recent changelog entries inline,
  plus a link to the full changelog on GitHub.
- **Docs & Links** — jump to the User Guide, Quickstart, Troubleshooting,
  or Readme without leaving the app.
- **Account** section — display name, email, and a Sign Out button
  (the top-bar Sign Out stays where it is).
- Everything is per-device, stored in IndexedDB like the existing
  preferences. Nothing new syncs to the cloud.

## 2026-04-20 — Global Dice Roller

A visual 3D dice roller accessible from anywhere in the app.

- New dice icon in the top bar opens a floating panel.
- **Basic Roll**: one-click tiles for d4, d6, d8, d10, d12, d20, d100.
- **Advanced Roll**: count × die type ± modifier, with an optional Target
  Number field for d100 skill checks (pass / fail / critical / fumble).
- Physics-based 3D animation across the viewport while dice tumble; the
  result card reveals after they settle.
- **Dice settings** (⚙ icon) — per-device preferences:
  - Size: Small / Medium / Large / X-Large
  - Style: Paper (default) / Smooth / Rust / Classic (four themes, each
    with its own font)
  - Color: follow UI theme or pick a custom color
  - Shadows on/off
- Recent-rolls panel keeps the last 10 rolls this session.
- Every roll also logs to the active character's session log with a new
  **ROLL** badge so skill-relevant rolls are still captured for the Notes
  tab.

## 2026-04-20 — Offline UX tightened

- Red banner appears the moment the app can't reach Firestore, not just
  when it first fails.
- Banner is non-dismissible while offline so edits can't silently vanish.
- Detection uses both `navigator.onLine` and Firestore's
  `waitForPendingWrites`, so DevTools' offline toggle + real network drops
  both trigger the banner.

## 2026-04-19 — Cloud sync + Google sign-in + manila UI

Major rewrite. The app is no longer local-only.

- **Sign in with Google** (required). Every user sees only their own
  agents; enforced at the database layer via Firestore security rules.
- **Cloud-synced roster**. Characters live in Firestore under your
  Google account — the same roster follows you to phone, laptop, tablet.
- **Manila dossier visual overhaul**. New typewriter-on-paper UI with
  three palettes switchable on the fly: **MANILA** (default),
  **BONE** (lightest), **FIELD** (greenscreen terminal).
- **Roster** landing screen after sign-in with card-grid of agents.
- **Wizard** for guided agent creation in 6 steps (still works alongside
  the blank-sheet quick-add in the sidebar).
- **SAN modal fires on blur, not keystroke** — lowering SAN current by
  multiple points triggers one modal, not one per keypress.
- **Session log badges** updated: `ADV` / `PROJ` / `SAN` / `UNNAT` /
  `K.I.A.` / (base manual).
- **Print dossier** always renders in manila paper, regardless of the
  active UI theme.
- **PWA manifest** updated (theme colors, install splash).
- **Netlify production deploy** + deploy previews for branches.

## 2026-04-12 — Initial PWA

Local-only character sheet. Installable PWA, IndexedDB-backed, full
Delta Green mechanics (stats, skills with inline d100 roller, bonds,
SAN events, Breaking Points, adaptations, weapons, wounds, session log,
KIA flow, PDF and JSON import).
