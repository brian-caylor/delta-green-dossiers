# Delta Green — Agent Dossiers — User Guide

*Last updated: 2026-04-20 · [What's new](CHANGELOG.md)*

A digital character sheet manager for [Delta Green](https://www.delta-green.com/). Progressive Web App; installable on any device; cloud-synced across your Google account.

This guide covers everything the app can do. For a friendlier 2-minute onboarding, see [QUICKSTART.md](QUICKSTART.md).

---

## Table of Contents

1. [Signing In](#1-signing-in)
2. [The Roster](#2-the-roster)
3. [Creating an Agent (Wizard vs. Quick-Add)](#3-creating-an-agent-wizard-vs-quick-add)
4. [The Sidebar](#4-the-sidebar)
5. [The Personal Tab](#5-the-personal-tab)
6. [The Stats Tab](#6-the-stats-tab)
7. [The Skills Tab](#7-the-skills-tab)
8. [The Combat Tab](#8-the-combat-tab)
9. [The Notes Tab](#9-the-notes-tab)
10. [The Sanity System](#10-the-sanity-system)
11. [The Bonds System](#11-the-bonds-system)
12. [End of Mission & Skill Advancement](#12-end-of-mission--skill-advancement)
13. [KIA — Killed in Action](#13-kia--killed-in-action)
14. [Importing an Agent](#14-importing-an-agent)
15. [Backing Up an Agent](#15-backing-up-an-agent)
16. [Printing Your Dossier](#16-printing-your-dossier)
17. [Session Log](#17-session-log)
18. [The Theme Switcher (Palette)](#18-the-theme-switcher-palette)
19. [Cloud Sync, Offline & Auto-Save](#19-cloud-sync-offline--auto-save)
20. [Keyboard Shortcuts & Tips](#20-keyboard-shortcuts--tips)
21. [Installing as a PWA](#21-installing-as-a-pwa)
22. [Global Dice Roller](#22-global-dice-roller)
23. [Settings](#23-settings)

---

## 1. Signing In

The app requires a Google sign-in. All of your agents are stored in the cloud under your Google account — sign in from any device and your roster follows you.

1. Open the app URL.
2. You'll land on **DELTA GREEN OPERATIONS — AUTHORIZATION REQUIRED**.
3. Hit **SIGN IN WITH GOOGLE**. A Google account picker appears.
4. Pick the account you want tied to your agents. (Whichever you pick is the "owner" account — use the same one every time.)
5. You land on your Roster.

**To sign out**, use the **SIGN OUT** button in the top-right of the top bar. Your agents remain in the cloud; next sign-in retrieves them.

> **Why login?** Because the data lives in cloud storage scoped per-user, your friends can use the same app without seeing each other's agents. Firestore security rules enforce per-user isolation — nobody but you can read or write your dossier.

---

## 2. The Roster

The **Roster** is the post-login landing page — a grid of cards showing every agent on your account. Click any card to open the dossier. Empty cabinet? Make one via the Wizard (see next section).

Each roster card shows:
- Codename and last/first name
- Profession
- A red **K.I.A.** overlay if the agent is dead
- Last-updated timestamp

Hover (or tap) a card for quick actions: open, duplicate, export, print, delete.

---

## 3. Creating an Agent (Wizard vs. Quick-Add)

Two ways to roll an agent:

### Wizard — Guided Induction (Recommended)
From the Roster, click **+ NEW AGENT**. A 6-step wizard walks you through:

1. **Dossier** — codename, name, profession, employer, nationality, age, description
2. **Stats** — assign 6 core stat scores (STR, CON, DEX, INT, POW, CHA)
3. **Profession** — pick from the Delta Green profession presets (or go custom)
4. **Skills** — adjust skill values from the profession baseline
5. **Bonds** — name up to 5 bonds; scores auto-fill from your CHA
6. **Review** — final check, then **FINISH** commits the agent and drops you onto the sheet

### Quick-Add — Blank Sheet
Once inside a dossier, open the sidebar (◁ arrow, left edge) and click **+ NEW AGENT** at the top. A blank dossier is created with defaults (all stats at 10, SAN 50, BP 40, HP 10, WP 10) and you land directly on the Personal tab.

Both paths save immediately to the cloud. You can delete or duplicate either type from the roster later.

---

## 4. The Sidebar

Visible inside any dossier. Click the **◁** arrow at the left edge to collapse/expand.

| Action | How |
|---|---|
| **Switch agent** | Click a name in the list |
| **Back to Roster** | Use the **DG OPERATIONS** link in the top bar or collapse the sidebar and use Roster navigation |
| **Reorder agents** | Drag the ⠿ handle on the name row |
| **New agent (blank)** | **+ NEW AGENT** button at the top |
| **Import agent** | **IMPORT AGENT** button at the top |
| **Clone agent** | ⎘ button (active agent row) — copies all data, clears KIA, appends "(Copy)" to last name |
| **Print dossier** | ⎙ button (active agent row) |
| **Backup agent** | ⬇ button (active agent row) — downloads a full JSON backup |
| **Delete agent** | ✕ button (active agent row, confirmation required) |

KIA agents show a strikethrough in the list. The **SAVED [time]** indicator in the top-right of the sheet shows the most recent save time; it updates within half a second of any edit.

---

## 5. The Personal Tab

Biographical data, bonds, motivations, mental state.

### Sections
- **§1–3** — Last Name / First Name / Middle Initial
- **§4 Profession** / **§5 Employer** — Job and employer
- **§6 Nationality**, **§7 Sex**, **§8 Age / DOB**, **§9 Education & Occupation** — Background
- **§10 Physical Description** — Appearance and distinguishing features
- **§11 Bonds** — Up to 5 (expandable) with auto-fill from CHA on first-naming. See [Section 11](#11-the-bonds-system)
- **§12 Motivations** — Psychological anchors
- **§12a Mental Disorders** — Auto-populated when a SAN Breaking Point triggers; editable manually
- **§13 SAN Loss Adaptation** — 3-box adaptation tracker for Violence and Helplessness; see [Section 10](#10-the-sanity-system)
- **§14 Unnatural Encounters** — Log of every unnatural thing witnessed; drives the Unnatural skill + SAN max ceiling

> **Tip:** §12a (Mental Disorders) fills automatically when your agent crosses a Breaking Point during a SAN event. You can also type there manually.

### §14 Unnatural Encounters

The **Unnatural** skill is unique: it starts at 0%, can never be voluntarily improved, and every point permanently reduces your agent's **SAN max ceiling** by 1.

> **Rule:** `SAN max = min(POW × 5, 99 − Unnatural%)`
>
> A character with POW 12 and Unnatural 15 has SAN max = min(60, 84) = 60.

Every time you log an encounter, the app:
- Adds the points to the Unnatural skill total
- Recalculates the SAN max ceiling
- Caps SAN current downward if it now exceeds the ceiling

**To log an encounter:**
1. Scroll to §14 on the Personal tab
2. Type what the agent witnessed in the description field
3. Enter the points awarded
4. Click **+ LOG ENCOUNTER**

Each entry shows description, points, and date. Edit inline or delete with ✕. Deletion recalculates totals.

The formula bar at the top of §14 always shows the live total and the current SAN max ceiling.

---

## 6. The Stats Tab

### Core Statistics
Six core stats (STR, CON, DEX, INT, POW, CHA) — any value 0–20 per the core book, though the UI allows 0–99 if you want to override. Each has a **Distinguishing Features** field for flavor.

### Derived Attributes

| Attribute | Max formula | Notes |
|---|---|---|
| **HP** (Hit Points) | `ceil((STR + CON) / 2)` | Physical health. Reaching 0 triggers the KIA prompt. |
| **WP** (Willpower) | `POW` | Mental endurance. Spent on SAN Projection and Repress. |
| **SAN** (Sanity) | `min(POW × 5, 99 − Unnatural)` | Sanity rating. Lowering this triggers the SAN event flow. |
| **BP** (Breaking Point) | *(manual)* | Threshold at which disorders gain. Resets after each BP event. |

**HP max**, **WP max**, and **SAN max** are auto-derived and read-only. Change STR, CON, or POW and they update instantly, clamping current values if needed. BP max stays manually editable — it's set by game events.

Click any **current** number to edit. The SAN Event Modal (Section 10) fires once you leave the field with a lower value, not on every keystroke, so you can type a multi-point drop without triggering the modal multiple times.

### SAN Controls
The SAN card has extra controls:
- **⚡ PROJECT ONTO A BOND** — absorb SAN damage via a bond relationship (see [Section 11](#11-the-bonds-system))
- Reducing SAN current opens the **SAN Event Modal** to handle all downstream consequences

### Temporary Insanity Indicator
When a SAN event results in temp insanity (FLEE / STRUGGLE / SUBMIT), a red **TEMP INSANITY** badge appears on the SAN card. Click **Clear** when the insanity ends.

---

## 7. The Skills Tab

### Standard Skills
All standard Delta Green skills are pre-loaded. Each shows:
- **Base %** (in parentheses) — from the rulebook
- **Current %** — your agent's actual skill, displayed differently when modified from base
- **Failed checkbox** — tick when you fail a roll during play (used for end-of-mission advancement)
- **Dice button** — roll d100 against the current value

Skills with specializations (Art, Craft, Military Science, Pilot, Science) have a `:` field to type the specialization (e.g. "Art: Painting").

### Inline Dice Roller
Click the die icon after the `%` symbol. Rolls d100 against the current value:

| Result | Display | Tone |
|---|---|---|
| **Pass** | Roll + "PASS" | Green outline |
| **Fail** | Roll + "FAIL" | Red outline |
| **Critical** | Roll + "CRITICAL" | Blue outline |
| **Fumble** | Roll + "FUMBLE" | Red outline |

- **Critical:** roll of 01, or matched digits (11, 22, 33...) that are successes
- **Fumble:** roll of 100, or matched digits that are failures

Results flash for ~4 seconds. On a fail, the skill's Failed checkbox auto-ticks. All rolls are logged.

### The Unnatural Skill
The **Unnatural** row has no checkbox and its value can't be edited directly. Labeled *forbidden knowledge* and styled in blue. To change it, log an encounter in **§14 Unnatural Encounters** on the Personal tab.

### Foreign Languages & Other Skills
Up to 6 custom skills can be added. Click **+ ADD SKILL** for more. Roll buttons appear only when the skill has a name.

### Skill Advancement
At mission end, click **END MISSION** in the top-right. Every skill with its Failed checkbox ticked rolls 1d4 advancement. Full flow in [Section 12](#12-end-of-mission--skill-advancement).

---

## 8. The Combat Tab

### Combat Quick Reference
Pinned at the top of the tab: HP, WP, SAN (current/max), plus Dodge, Firearms, Melee Weapons, and Unarmed Combat percentages pulled live from your Skills tab. Read-only.

### Wounds & Ailments (§14)
Freetext for injuries and ongoing conditions. The **First Aid attempted** checkbox marks whether first aid has been used since the last injury.

### Armor & Gear (§15)
Freetext for body armor, equipment, and anything your agent is carrying.

### Weapons (§16)
A table on desktop, card layout on mobile (≤700px width). Each weapon row has:

| Field | Notes |
|---|---|
| **Weapon** | Name |
| **Skill %** | Skill used to attack |
| **Base Range** | Effective range |
| **Damage** | Damage formula (e.g. `1d10`, `2d6+2`) |
| **AP** | Armor Piercing checkbox |
| **Lethality %** | For lethal weapons — roll under this to kill outright |
| **Kill Radius** | Area of effect for explosives |
| **Ammo / Cap** | Rounds remaining / magazine capacity, with ± buttons |

Click **+ ADD WEAPON** for more rows.

**Reordering (desktop):** hover any row to reveal the ⠿ drag handle on the left. Drag to reorder. The letter labels `(a)`, `(b)`, `(c)` update automatically.

**Removing:** ✕ button at the right of each row. Remaining rows renumber.

### Mobile Layout
On narrow screens the table becomes a card per weapon with large 44px+ touch targets for ammo +/- buttons. Secondary details (range, AP, lethality, kill radius) are behind a **SHOW DETAILS** toggle. Drag-to-reorder is disabled on mobile.

### Gear Catalog
Click **📋 GEAR CATALOG** in the §16 header (visible when the agent isn't locked). The catalog contains 50+ weapons in categories (Handguns, Rifles, Shotguns, SMGs, Sniper, Heavy, Explosives, Melee, Less-Lethal):

- **Filter by category** — click a chip
- **Search by name** — type in the search field
- **Click any row** — instantly adds it to your §16 table with skill, damage, range, AP, lethality, kill radius, and ammo pre-filled. If an empty row exists, the catalog weapon fills that slot instead of appending.

Catalog weapons use proper skill names ("Firearms", "Heavy Weapons", "Melee Weapons", "Demolitions", etc.) rather than raw percentages. Everything's editable after adding.

> **Tip:** If your agent's specific sidearm isn't listed, pick the closest equivalent and edit the name. The stats will be appropriate for the weapon type.

---

## 9. The Notes Tab

### Personal Details & Notes (§17)
Freetext for background, mission notes, or player commentary.

### Developments Which Affect Home & Family (§18)
How the Program's horror bleeds into ordinary life.

### Special Training (§19)
Up to 3 training entries (name + associated skill/stat). **+ ADD TRAINING** for more.

### Authorizing Officer (§20) & Recruitment (§21)
Who brought your agent into the Program and why.

### Session Log
A full history of every tracked change. Details in [Section 17](#17-session-log).

---

## 10. The Sanity System

The heart of Delta Green's horror. **Whenever you reduce SAN current**, the app intercepts the change (on field blur, not keystroke) and walks through all the mechanical consequences automatically.

### Step 1 — Event Category
Pick what caused the SAN loss:

| Category | Description | Notes |
|---|---|---|
| **Violence** | Combat, death, gore | Disorders and adaptation track separately |
| **Helplessness** | Captivity, loss of control | Disorders and adaptation track separately |
| **Unnatural** | Mythos entities, impossible things | No adaptation possible; Unnatural points are tracked separately in §14 |

> **Note:** Selecting **Unnatural** as the event category is separate from logging Unnatural *skill points*. SAN loss from an unnatural event is entered here; any Unnatural points the Handler awards are logged in **§14 Unnatural Encounters** on the Personal tab.

### Step 2 — Temporary Insanity *(only if 5+ SAN lost at once)*
Choose the reaction:

- **FLEE** — full-speed retreat for CON turns
- **STRUGGLE** — fight indiscriminately until incapacitated
- **SUBMIT** — collapse into catatonia or unconsciousness

**Repressing:** Click **REPRESS INSANITY** to attempt suppression.
1. Roll 1d4 physically
2. Enter the result — that many WP are spent
3. Choose a bond to sacrifice — it loses the same number of points

If successful, the insanity reaction is suppressed entirely.

### Step 3 — Breaking Point *(only if SAN ≤ BP)*
The agent gains a mental disorder. The app:
- Shows the new Breaking Point formula: `new BP = current SAN − POW`
- Displays category-appropriate disorder suggestions as clickable chips
- Lets you pick a preset or type your own via "Other"
- Appends the disorder to **§12a Mental Disorders** with a `[DISORDER]` prefix
- Resets your BP

> Temporary Insanity and Breaking Point are independent — both can trigger from the same event.

### Step 4 — Adaptation Tracking *(all categories except Unnatural)*
The three adaptation boxes (§13) update automatically:

| Situation | Result |
|---|---|
| Normal SAN loss (no insanity) | One box is checked |
| TI or BP triggered | All boxes for this category are cleared |
| All 3 boxes checked | **ADAPTED** — roll 1d6 for permanent stat loss |

When adapted to **Violence**: roll 1d6, lose that many CHA permanently. All bond scores reduce by the same roll.
When adapted to **Helplessness**: roll 1d6, lose that many POW permanently (which may raise your BP — check if a new disorder triggers).

> Adaptation die rolls are physical — enter the result manually in the Stats tab afterward.

### Step 5 — Permanent Insanity *(only if SAN reaches 0)*
A final warning screen appears. The agent's mind is gone — they become a Handler-controlled NPC. The dossier can still be printed as an archive.

---

## 11. The Bonds System

Bonds represent the people, places, and relationships that keep your agent human.

### Bond Scores
Each bond has a **current score** and a **max score**. When you name a new bond for the first time, both auto-fill from your CHA. A colored bar shows degradation:
- **Amber/ink bar** — bond weakened but intact
- **Red bar / BROKEN** — bond score has reached 0

The `current / max` label under the bar shows exact values.

### Bond Projection
When your agent takes SAN damage, some can be absorbed by a bond. Click **⚡ PROJECT ONTO A BOND** on the SAN card:

1. Enter the incoming SAN damage amount
2. Roll 1d4 (shown as a die face); the app calculates WP cost and effective SAN reduction
3. Choose which bond absorbs it

Result: WP deducted, SAN reduced by a smaller amount, chosen bond score drops by the projected amount. If the bond hits 0, it breaks. Everything logged.

> The Project button is disabled if your agent has no bonds with score > 0, or if WP is too low to spend.

---

## 12. End of Mission & Skill Advancement

When an operation ends, click **END MISSION** at the top-right of the Skills tab (shows a badge with the number of failed skills).

> **Important:** In Delta Green, advancement happens at the end of an *operation*, not after each session. Don't hit this unless the mission is actually done.

### What Happens
1. A confirmation dialog reminds you this rolls advancement and clears all checkboxes.
2. For each skill with its Failed checkbox ticked, the app rolls 1d4 and adds it to the current percentage (capped at 99%).
3. The **Mission Debrief** shows every advancement — name, roll, old → new, with a ★ for any skill now at 90%+.
4. Each improvement is added to the Session Log.
5. All Failed checkboxes clear.

If no skills are checked, the debrief shows a "no failed rolls on record" message.

---

## 13. KIA — Killed in Action

### Automatic Trigger
If HP current drops to 0, a confirmation dialog asks whether the wounds are fatal. Dismiss it if the agent survives.

### Manual Trigger
Click **☠ MARK K.I.A.** in the HP panel on the Stats tab.

### What Changes
- All fields become read-only
- Sensitive info is redacted with visual bars (names, employers, descriptions, bond names, etc.)
- A red K.I.A. banner appears at the top of the sheet
- A large K.I.A. watermark appears across all tabs
- The agent's name in the sidebar shows strikethrough
- A KIA entry is added to the Session Log

### Toggle Redaction
The **⬛ RECLASSIFY / ⬜ DECLASSIFY** button in the KIA banner toggles redaction without un-locking the agent.

### Reviving
Click **↩ REVIVE AGENT** in the KIA banner to restore the agent to active duty. All KIA restrictions are removed and editing resumes.

---

## 14. Importing an Agent

Click **IMPORT AGENT** in the sidebar. Two options.

### Option A — Import from PDF

**Requirements:** An official Delta Green fillable PDF (DD-315 or equivalent AcroForm format).

1. Click **IMPORT AGENT** → **📄 IMPORT FROM PDF**
2. Select your `.pdf` file
3. Three-phase progress appears:
   - 📄 **Reading PDF**
   - 🔍 **Analyzing Fields**
   - 📋 **Building Character**
4. The **Import Review** screen opens with all parsed values. Fields modified from their default/base are highlighted. Edit any field before confirming.
5. Click **CONFIRM IMPORT** — the new agent is created, synced to cloud, and selected.

**Notes:**
- Motivations + mental disorders from a combined PDF field go into **§12 Motivations**; **§12a Mental Disorders** starts blank
- Skills with specializations parse with the specialization name
- Bond scores import as both current and max

### Option B — Restore from Backup

**Requirements:** A `.json` backup file previously exported via the ⬇ button.

1. **IMPORT AGENT** → **↓ RESTORE FROM BACKUP**
2. Select the `.json` file
3. The agent is added to your roster and selected. All data, including the full session log, is preserved.

**Notes:**
- A new internal ID is assigned on restore, so importing a backup never overwrites an existing agent
- KIA status, redaction state, bonds, disorders — everything restores as it was
- Invalid file → error dialog, nothing changes

---

## 15. Backing Up an Agent

Click the **⬇** button in the sidebar row of any active agent.

### What's in the Backup
A `.json` file containing the agent's **complete data**:
- Personal info, stats, skills, weapons, gear
- Bonds and current/max scores
- §12 Motivations and §12a Mental Disorders
- §14 Unnatural Encounters (full log with descriptions, points, dates)
- SAN adaptation state, KIA status and date
- Full session log history

File is named `FirstName-LastName-backup.json`.

### Why Backup Instead of Rely on Cloud?
Cloud sync is your primary safety net, but manual backups are still useful for:
- Sharing an agent with another player
- Archiving a snapshot before a dangerous mission (pre-TPK insurance)
- Moving an agent to a different Google account
- Playing in a context where the cloud isn't reachable (see [Section 19](#19-cloud-sync-offline--auto-save))

---

## 16. Printing Your Dossier

Click the **⎙** button in the sidebar row of any agent. Opens a formatted two-page printout in a new window.

### Page 1
Personal info, core stats, derived attributes, bonds with degradation, §12 Motivations, §12a Mental Disorders, §13 SAN adaptation, and the full skills grid.

### Page 2
**§13a Unnatural Encounters** (formula bar + table of all encounters), Wounds & Ailments, Armor & Gear, Weapons table, Personal Notes, Home & Family, Special Training, Authorizing Officer, Recruitment.

### Notes
- KIA agents get a large **K.I.A.** watermark on both pages
- The printout always renders in the manila-paper palette regardless of the active theme (greenscreen/bone UI doesn't bleed into paper)
- Use the **⎙ PRINT** button in the printout window, or Cmd/Ctrl+P

There's also a **⎙ Print** option on the Session Log specifically — see [Section 17](#17-session-log).

---

## 17. Session Log

At the bottom of the Notes tab. Records every significant change; newest first.

### Entry Badges

| Badge | When it's applied |
|---|---|
| *(none)* | Manual stat and field edits |
| **ADV** | Skill advancement from End Mission |
| **PROJ** | SAN projection onto a bond |
| **SAN** | SAN events (BP, disorders, adaptation, insanity) |
| **UNNAT** | Unnatural encounter logged or removed (§14) |
| **ROLL** | Global dice roller was used (see §22 below) |
| **K.I.A.** | Agent marked killed in action |

### Log Actions

| Button | Effect |
|---|---|
| **⎙ Print** | Opens a print-ready view of all log entries |
| **⬇ Export** | Downloads the log entries only as `.json` |
| **✕ Clear** | Permanently erases all entries (confirmation required) |

> **Note:** The **⬇ Export** log button exports only the session log entries. To export the full agent (stats, skills, bonds, etc.), use the **⬇** backup button in the sidebar instead.

---

## 18. The Theme Switcher (Palette)

The top bar has three palette options, switchable on the fly:

- **MANILA** — The default dossier paper look: warm manila, black ink, restrained red accents. Good default for play.
- **BONE** — Cleaner white paper. Best for printing, screenshots, or brighter environments.
- **FIELD** — Retro green-on-black terminal. Fun for field-report reading, night sessions, or just vibes.

Click any of the three to swap. The choice is saved to your device (via IndexedDB) — next visit loads your last selection. It doesn't sync across devices, so you can have MANILA on your laptop and FIELD on your phone.

> **Tip:** The printed dossier ignores the selected theme and always prints in manila — greenscreen on paper would be unreadable.

---

## 19. Cloud Sync, Offline & Auto-Save

### Cloud Sync (Firestore)
Every agent is stored in Firestore under your Google account. Security rules ensure no other user can see or modify your data.

When you make a change:
1. It's applied to your screen immediately.
2. After ~500ms of inactivity, the app syncs to the cloud in the background.
3. The **SAVED [time]** indicator (top-right) updates to the latest save.

Switch devices: your whole roster appears wherever you sign in with the same Google account. Edit on your phone, refresh on your laptop, see the same state.

### Offline Behavior
If the network drops (or the cloud is unreachable):

- A **red banner** appears at the top: *"Offline — cloud unreachable. Your recent changes are queued locally but not saved."*
- All edits are **blocked** — the banner is non-dismissible while offline to prevent accidental edits that would be lost.
- You can still **read** the agent you have open (last-known data).
- When the connection returns, the banner clears automatically and the roster refetches from the cloud.

> **Unsaved edits made offline are not preserved.** If you try to edit offline, the change is refused (not queued). Come back online before you make changes.

### Multi-Device Caveat
If you have the app open on two devices simultaneously and edit the same agent on both, the most recent save wins. There's no real-time co-editing — so if you're playing on a laptop, don't also leave a phone open on the same character.

### Auto-Save Indicator
The **SAVED [time]** label in the top-right of the sheet tells you when the last successful cloud save happened. KIA agents show **ARCHIVED** instead.

---

## 20. Keyboard Shortcuts & Tips

- **Tab** — Move between fields naturally
- **Scroll** on a number field — increment/decrement quickly
- **Click a disorder chip** in the SAN modal — select it (✓ highlight); "Other" lets you type custom
- **End Mission badge** — the number on the END MISSION button is how many failed skills are queued for advancement
- **Sidebar drag** — hold the ⠿ handle to reorder agents in the list

### When Editing Derived Values
For HP, WP, SAN, and BP **current** values specifically, side effects (SAN event modal, KIA prompt, session log entry) fire on blur — when you leave the field — not on each keystroke. Useful for typing a multi-point drop without triggering the modal repeatedly.

---

## 21. Installing as a PWA

The app is a Progressive Web App. Installing gives you an icon on your home screen/dock, launches in its own window without browser chrome, and keeps everything cached for fast starts.

### Desktop (Chrome/Edge/Brave)
- Click the install icon at the right end of the address bar, or browser menu → **Install app**
- Opens in a standalone window

### iPhone / iPad (Safari)
- Tap the Share button → **Add to Home Screen**
- Launch from the home screen icon

### Android (Chrome)
- Browser menu ⋮ → **Install app** (or **Add to Home Screen**)

### What You Get
- **Home-screen icon** with the manila dossier branding
- **Manila splash screen** while the app boots
- **Offline read access** to your cached roster (edits still require network — see [Section 19](#19-cloud-sync-offline--auto-save))
- **Auto-update** — new versions activate on your next visit

Installing doesn't change where your data lives — the cloud is still the source of truth. Your agents follow you across devices regardless of whether you install or use the browser version.

---

## 22. Global Dice Roller

A companion roller alongside the inline per-skill dice buttons. Use it for anything not tied to a specific skill row — damage dice, Lethality rolls, ad-hoc checks, random encounter rolls, stat generation.

The **⚄ icon** in the top bar opens the **Field Dice** panel (only visible while a character is open). Close it by clicking ⚄ again, pressing **Esc**, or clicking outside the panel.

### Basic Roll — one-click dice

Seven clickable tiles with SVG die shapes:

| Tile | Rolls |
|---|---|
| **d4** | One d4 |
| **d6** | One d6 |
| **d8** | One d8 |
| **d10** | One d10 |
| **d12** | One d12 |
| **d20** | One d20 |
| **d100** | One d100 (no target — use Advanced for a skill check) |

Click any tile to roll immediately. Result lands in the overlay and the Recent rolls history.

### Advanced Roll — count × die ± modifier

Below Basic Roll:

- **COUNT** — how many dice of this type (1–50)
- **DIE** — die type (d4 through d100)
- **MOD** — signed modifier (−99 to +99). The browser's up/down arrows step through `… 3, 2, 1, 0, −1, −2 …` across zero.

The live formula renders in handwritten script below the controls (e.g. `2d6+3`). Press **ROLL** to commit.

### Target Number (d100 only)

When the formula resolves to a single `d100` with no modifier, a **Target Number** toggle appears. Enable it and type the skill percentage you're rolling against — the result card then shows:

| Tone | When |
|---|---|
| **CRITICAL** (blue) | Roll of 01 or matched digits (11, 22, …) at or below target |
| **PASS** (green) | Roll is at or below target |
| **FAIL** (red) | Roll is above target |
| **FUMBLE** (red) | Roll of 100 or matched digits over 5 above target |

Same rules as the inline per-skill roller — just with an arbitrary target.

### The visual roll

Click ROLL → the panel auto-hides, 3D dice tumble across the full viewport, physics sim resolves in 2–3 s, and a centered result card appears. The card lingers for ~2.5 s, then dice + card clear and the panel slides back in.

### Recent rolls history

The last 10 rolls of the session appear below Advanced Roll: formula, total, per-die breakdown, and the d100 tone tag if applicable. Session-local — refreshing the page clears it. A **Clear** button empties the list manually.

### Dice settings (⚙)

The gear icon in the panel header opens **Dice Settings**. Each option persists per device (IndexedDB) and applies on the next roll.

- **Dice Size** — Small / Medium / Large / X-Large. How big the dice render.
- **Dice Style** — four themes, each with its own font and material:
  - **Paper** (default) — Manila paper, typewriter numerals
  - **Smooth** — Rounded edges, clean modern font
  - **Rust** — Weathered metal, distressed face
  - **Classic** — Traditional multicolor RPG set
- **Dice Color** — *Match UI theme* (follows MANILA / BONE / FIELD) or *Custom* with a native color picker.
- **Shadows** — soft shadows under the dice; toggle off for a cleaner look or slight perf benefit on older devices.
- **Restore defaults** at the bottom resets all four.

### Session log integration

Every global roll writes an entry to the active character's session log with a blue **ROLL** badge. Example labels:

- `Roll d20 = 14`
- `Roll 2d6+3 = 4, 3 +3 → 10`
- `Roll d100 vs 45% → 37 PASS`

The inline per-skill dice rollers on the Skills tab are unaffected — they continue to work and log the same way they always have.

### Limitations

- The global roller requires a character to be open. It's hidden on the Roster / Wizard screens.
- Roll history is **per session** — refreshing clears it. (The per-character session log is persistent across sessions.)
- Modifiers must be flat numbers (`+3`, `−2`). Advanced notation like drop-lowest or advantage isn't supported — Delta Green doesn't use those.
- **Coming later**: when Campaign / Handler mode ships, non-private rolls broadcast to the campaign feed in real time, while Handler rolls stay private.

---

## 23. Settings

A **sliders icon** in the top bar (between the dice ⚄ icon and the palette switcher) opens the **Settings** modal. Everything in here is per-device — theme and dice preferences are stored in IndexedDB the same way they always were; nothing new syncs to the cloud.

The modal is split into four sections, chosen from the nav on the left (or a scrollable tab row on phones):

### Appearance
The same MANILA / BONE / FIELD palette switcher as the top bar, with a short description for each option. Changes sync live: switching here updates the top-bar control and vice versa. See §18 for what each palette looks like.

### Dice
Every dice preference from the floating roller's ⚙ subpanel — size, style, color, shadows, Restore defaults — available here too. The two surfaces share state: adjusting in either place updates the other. See §22 for the dice roller itself.

### About
- **Build card** — app name and the date of the most recent changelog entry, so you can tell at a glance whether you're on a fresh load.
- **What's New** — the three most recent changelog entries inline (date, title, and bullets). This is the first time the app surfaces "what changed" without opening GitHub.
- **View full changelog** — link to the complete CHANGELOG.md on GitHub.
- **Docs & Links** — one-click access to the User Guide, Quickstart, Troubleshooting, and Readme. All open in a new tab.

### Account
- Signed-in identity — display name, email, and an initial-letter avatar.
- **Sign Out** — signs you out and returns to the login screen. The top-bar **SIGN OUT** button still works the same way; this is a second entry point.

### How it relates to the other preferences

The Settings modal doesn't replace the top-bar theme switcher or the dice panel's ⚙ subpanel — both remain where they are as shortcuts. Think of Settings as the canonical home for per-device preferences; the in-context controls are accelerators that write to the same storage.

> **Coming later**: when Campaign / Handler mode ships, campaign-level options (broadcast preferences, handler-only toggles) will get their own Settings section.

---

*Delta Green is published by Arc Dream Publishing. This app is an unofficial player tool.*
