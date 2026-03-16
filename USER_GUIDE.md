# Delta Green Character Dossier — User Guide

A digital character sheet manager for Delta Green RPG. Available as a PWA (Progressive Web App) that can be installed on your device and works offline. This app handles everything from character creation and stat tracking to the full sanity flowchart — so players spend less time remembering rules and more time running from what they found in the dark.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [The Sidebar](#2-the-sidebar)
3. [The Personal Tab](#3-the-personal-tab)
4. [The Stats Tab](#4-the-stats-tab)
5. [The Skills Tab](#5-the-skills-tab)
6. [The Combat Tab](#6-the-combat-tab)
7. [The Notes Tab](#7-the-notes-tab)
8. [The Sanity System](#8-the-sanity-system)
9. [The Bonds System](#9-the-bonds-system)
10. [End of Mission & Skill Advancement](#10-session-end--skill-advancement)
11. [KIA — Killed in Action](#11-kia--killed-in-action)
12. [Importing an Agent](#12-importing-an-agent)
13. [Backing Up an Agent](#13-backing-up-an-agent)
14. [Printing Your Dossier](#14-printing-your-dossier)
15. [Session Log](#15-session-log)
16. [Keyboard Shortcuts & Tips](#16-keyboard-shortcuts--tips)
17. [Installing as a PWA](#17-installing-as-a-pwa)

---

## 1. Getting Started

### Creating a New Character
Click **+ NEW AGENT** in the sidebar. A blank character is created with:
- All core stats set to 10
- SAN 50, BP 40, HP 10, WP 10
- All standard Delta Green skills pre-loaded at their base percentages
- Five blank bond slots

Click on the character name in the sidebar to start editing.

### Importing an Agent
Click **IMPORT AGENT** in the sidebar. A dialog appears with two options:
- **Import from PDF** — parse an official Delta Green fillable PDF character sheet
- **Restore from Backup** — load a previously exported `.json` backup file

See [Section 12](#12-importing-an-agent) for full details on both paths.

---

## 2. The Sidebar

The sidebar on the left lists all your characters. Click any name to switch to that agent.

| Action | How |
|---|---|
| **Switch agent** | Click the agent name |
| **Reorder agents** | Drag the ⠿ handle that appears on hover |
| **New agent** | **+ NEW AGENT** at the bottom |
| **Import agent** | **IMPORT AGENT** at the bottom |
| **Clone agent** | **CLONE** button (active agent only) — copies all data, removes KIA status |
| **Print dossier** | **⎙** button (active agent only) |
| **Backup agent** | **↓** button (active agent only) — exports full `.json` backup |
| **Delete agent** | **DELETE** button (active agent only, confirmation required) |
| **Collapse sidebar** | Arrow button on the sidebar edge |

KIA agents are shown with a strikethrough name. The app auto-saves to IndexedDB within half a second of any change — look for the **SAVED [time]** indicator in the top-right corner.

---

## 3. The Personal Tab

This tab covers the agent's biographical data and core personal information.

### Sections
- **§1 Last Name / §2 First Name / §3 Middle Initial** — Agent identity
- **§4 Profession** and **§5 Employer** — What your agent does and who funds it
- **§6 Nationality**, **§7 Sex**, **§8 Age / DOB**, **§9 Education & Occupation** — Background
- **§10 Physical Description** — Appearance and distinguishing features
- **§11 Bonds** — People, places, or things your agent cares about. The section header shows a reminder of the starting bond count based on CHA. When you name a new bond for the first time, the score auto-fills from your CHA stat (see [Section 9](#9-the-bonds-system))
- **§12 Motivations** — What drives your agent; their psychological anchor
- **§12a Mental Disorders** — Disorders your agent has acquired; auto-populated by the SAN system when a Breaking Point is reached
- **§13 Incidents of SAN Loss Without Going Insane** — Adaptation tracking checkboxes for Violence and Helplessness (see [Section 8](#8-the-sanity-system))
- **§14 Unnatural Encounters** — A dedicated log of every unnatural thing your agent has witnessed, with automatic SAN max ceiling enforcement (see below)

> **Tip:** §12a (Mental Disorders) is automatically filled when your agent crosses a Breaking Point during a SAN event. You can also type into it manually.

### §14 Unnatural Encounters

The **Unnatural** skill is unique in Delta Green: it starts at 0%, can never be voluntarily improved, and every point permanently reduces your agent's **SAN max ceiling** by 1.

> **Rule:** `SAN max = min(POW × 5, 99 − Unnatural%)`
>
> SAN max is the lower of two ceilings: POW times 5, and 99 minus Unnatural skill. A character with POW 12 and Unnatural 15 has SAN max = min(60, 84) = 60.

The §14 tracker enforces this automatically. Every time you log an encounter, the app:
- Adds the points to the Unnatural skill total
- Recalculates the SAN max ceiling
- Caps SAN current downward if it now exceeds the ceiling

**To log an encounter:**
1. Scroll to §14 on the Personal tab
2. Type what the agent witnessed in the description field
3. Enter the points gained (as awarded by the Handler)
4. Click **+ LOG ENCOUNTER**

Each logged entry shows the description, point value, and date. You can edit the description or point value inline, or click **✕** to delete an entry. Deleting recalculates the totals automatically.

The formula bar at the top of §14 always shows the live total and current SAN max ceiling at a glance.

---

## 4. The Stats Tab

### Core Statistics
The six core stats (STR, CON, DEX, INT, POW, CHA) are edited here. Stats can be set to any value from 0 to 99. Each stat also has a **Distinguishing Features** field for flavor notes.

### Derived Attributes
Four tracked derived values are displayed with fill bars:

| Attribute | Max formula | Notes |
|---|---|---|
| **HP** (Hit Points) | `ceil((STR + CON) / 2)` | Physical health. Reaching 0 triggers the KIA prompt. |
| **WP** (Willpower) | `POW` | Mental endurance. Spent on SAN Projection and Repress. |
| **SAN** (Sanity) | `min(POW × 5, 99 − Unnatural)` | Sanity rating. Reducing this triggers the full SAN event flow. |
| **BP** (Breaking Point) | *(manual)* | The SAN threshold at which disorders are gained. Resets after each Breaking Point event. |

**HP max**, **WP max**, and **SAN max** are **automatically derived** from your base stats and cannot be edited directly. A formula hint is displayed below each read-only max field. When you change STR, CON, or POW, the relevant max values update instantly and current values are clamped if they exceed the new max. BP max remains manually editable since it is set by game events.

Click the **current** number on any stat to edit it. Changes are logged automatically in the Session Log.

### SAN Controls
The SAN card includes additional controls:
- **⚡ PROJECT ONTO A BOND** — Walk through the bond-projection workflow to absorb SAN damage via a bond relationship (see [Section 9](#9-the-bonds-system)).
- Reducing SAN automatically opens the **SAN Event Modal** to handle all downstream consequences (see [Section 8](#8-the-sanity-system)).

### Temporary Insanity Indicator
When a SAN event results in temporary insanity (flee, struggle, or submit), a red **TEMP INSANITY** badge appears on the SAN card showing the reaction type. Click **Clear** when the insanity ends. Clearing is logged to the Session Log.

---

## 5. The Skills Tab

### Standard Skills
All standard Delta Green skills are pre-loaded. Each shows:
- **Base %** (in parentheses) — the default value from the rulebook
- **Current %** — your agent's actual skill, shown in **green** when it exceeds base
- **Checkbox** — mark it when the skill is used unsuccessfully during play (used for session-end advancement)
- **Dice button** — click the die icon to roll d100 against the skill value (see below)

Some skills have a **specialization** field (Art, Craft, Military Science, Pilot, Science). Click the `:` field to type the specialization (e.g., "Art: Painting").

### Inline Dice Roller
Each skill row (except Unnatural) has a small die button after the `%` symbol. Clicking it rolls d100 against the skill's current value:

| Result | Display | Color |
|---|---|---|
| **Pass** | Roll number + "PASS" | Green |
| **Fail** | Roll number + "FAIL" | Red |
| **Critical** | Roll number + "CRITICAL" | Gold |
| **Fumble** | Roll number + "FUMBLE" | Red |

- **Critical:** Roll of 01, or matched digits (11, 22, 33...) that are successes
- **Fumble:** Roll of 100, or matched digits that are failures (above 05)

Results display inline for about 4 seconds. On a failed roll, the skill's checkbox is automatically checked for session-end advancement. All rolls are logged to the Session Log.

The dice roller is also available on Foreign Languages & Other Skills (only when the skill has a name).

### The Unnatural Skill
The **Unnatural** row is displayed differently from all other skills — it has no checkbox and its value cannot be manually edited. It is labeled *forbidden knowledge* and shown in purple to signal that it is Handler-awarded only.

To change the Unnatural value, use **§14 Unnatural Encounters** on the Personal tab. The skill total there drives the value displayed here. See [Section 3](#3-the-personal-tab) for full details.

### Foreign Languages & Other Skills
Up to 6 custom skills can be added below the standard list. Click **+ ADD SKILL** to add more.

### Skill Advancement
At the end of a session, click **END MISSION** (top-right of the tab, with a badge showing how many skills are checked). The app automatically rolls 1d4 for each checked skill and applies the increase. See [Section 10](#10-session-end--skill-advancement) for the full flow.

---

## 6. The Combat Tab

### Combat Quick Reference
At the top of the Combat tab, a compact reference panel displays your agent's key combat stats at a glance:
- **HP**, **WP**, **SAN** — current/max values with color-coded pills
- **Dodge%**, **Firearms%**, **Melee Weapons%**, **Unarmed Combat%** — pulled live from your skills

This panel is read-only and updates automatically as your stats change.

### Wounds & Ailments (§14)
A freetext field for tracking injuries, first aid attempts, and ongoing ailments. The **First Aid Attempted** checkbox marks whether first aid has already been used this scene.

### Armor & Gear (§15)
A freetext field for body armor, equipment, and anything else your agent is carrying.

### Weapons (§16)
A table of weapons, each with:

| Field | Notes |
|---|---|
| **Name** | Weapon identifier |
| **Skill** | The skill used to attack (e.g., Firearms, Melee Weapons) |
| **Range** | Effective range (short/medium/long or specific distance) |
| **Damage** | Damage dice/formula |
| **AP** | Armor Piercing checkbox |
| **Lethality %** | Lethality rating for lethal weapons |
| **Kill Radius** | Area of effect |
| **Ammo** | Ammunition type or count |

Click **+ ADD WEAPON** to add more rows beyond the default slots.

**Reordering weapons:** Hover over any weapon row to reveal the ⠿ drag handle on the left. Click and drag the handle to move the row to a new position in the list. The row labels (a), (b), (c)... update automatically to reflect the new order. Drag-and-drop is only available on active (non-locked) agents.

**Removing a weapon:** Click the **✕** button at the far right of any weapon row to delete that entry entirely. The remaining rows renumber automatically. The delete button only appears on active agents.

### Mobile Layout
On screens narrower than 700px, the weapons table automatically switches to a **card layout** optimized for touch:
- Each weapon is displayed as a stacked card with large touch targets (44px+) for ammo +/- buttons
- Secondary details (base range, AP, lethality, kill radius) are hidden behind an expandable toggle
- Drag-and-drop reordering is disabled on mobile

### Gear Catalog

Click the **📋 GEAR CATALOG** button (inline with the §16 Weapons header, only visible when the agent is not locked) to open a reference of common Delta Green weapons and equipment.

In the catalog:
- **Filter by category** — click a chip (Handguns, Rifles, Shotguns, SMGs, Sniper, Heavy, Explosives, Melee, Less-Lethal) to narrow the list
- **Search by name** — type in the search field to filter further
- **Click any weapon row** — that weapon is instantly added to your §16 Weapons table with all fields pre-filled (skill name, range, damage, AP, lethality, kill radius, ammo). If any weapon row is currently empty, the catalog weapon fills that slot instead of appending a new row

Catalog weapons use proper skill names (Firearms, Heavy Weapons, Melee Weapons, Athletics, Demolitions) instead of raw percentages. All pre-filled values can be edited after adding.

> **Tip:** If your agent's specific sidearm or rifle isn't listed, pick the closest equivalent and edit the name afterward. The stats will be appropriate for the weapon type.

---

## 7. The Notes Tab

### Personal Details & Notes (§17)
Freetext for background, mission notes, or anything your agent's player wants to remember.

### Developments Which Affect Home & Family (§18)
Track how the horrors of the Program affect your agent's home life.

### Special Training (§19)
Up to 3 training entries (name + associated skill/stat). Click **+ ADD TRAINING** for more.

### Authorizing Officer (§20) & Recruitment (§21)
Who brought your agent into the Program and why.

### Session Log
A full history of every tracked change during your sessions. See [Section 15](#15-session-log) for details.

---

## 8. The Sanity System

This is the heart of Delta Green's horror mechanics. **Whenever you reduce SAN current**, the app intercepts the change and walks you through all the mechanical consequences automatically.

### Step 1 — Event Category
You're asked what type of threat caused the SAN loss:

| Category | Description | Notes |
|---|---|---|
| **Violence** | Combat, death, gore | Disorders and adaptation track separately |
| **Helplessness** | Captivity, loss of control | Disorders and adaptation track separately |
| **Unnatural** | Mythos entities, impossible things | No adaptation possible; Unnatural points are tracked separately in §14 |

> **Note:** Selecting **Unnatural** as the event category is separate from logging Unnatural *skill points*. SAN loss from an unnatural event is entered here; any Unnatural points the Handler awards are logged in **§14 Unnatural Encounters** on the Personal tab.

### Step 2 — Temporary Insanity *(only if you lost 5+ SAN)*
When you lose 5 or more SAN in a single event, temporary insanity triggers. Choose your agent's reaction:

- **FLEE** — Move away at full speed for a number of turns equal to your CON score
- **STRUGGLE** — Fight indiscriminately against anything nearby until incapacitated
- **SUBMIT** — Collapse into catatonia or unconsciousness

**Repressing the Insanity:**
Click **REPRESS INSANITY** to attempt suppression. You'll need to:
1. Roll 1d4 physically
2. Enter the result — that many WP are spent
3. Choose a bond to sacrifice — it loses the same number of points as WP spent

If successful, the insanity reaction is suppressed entirely.

### Step 3 — Breaking Point *(only if SAN drops to or below BP)*
Your agent gains a mental disorder. The app:
- Shows the new Breaking Point formula: `new BP = current SAN − POW`
- Displays category-appropriate disorder suggestions as clickable chips
- Lets you select a disorder (or "Other" to type a custom one)
- Appends the disorder to **§12a Mental Disorders** on the Personal tab with a `[DISORDER]` prefix
- Resets your BP to the new calculated value

> **Temporary Insanity and Breaking Point are independent** — both can trigger from the same SAN loss event.

### Step 4 — Adaptation Tracking *(all categories except Unnatural)*
The three adaptation boxes (§13) are updated automatically:

| Situation | Result |
|---|---|
| Normal SAN loss (no insanity) | One box is checked |
| TI or BP triggered | All boxes for this category are cleared |
| All 3 boxes checked | **ADAPTED** — roll 1d6 for permanent stat loss |

When adapted to **Violence**: roll 1d6, lose that many CHA permanently. All bond scores reduce by the same roll.
When adapted to **Helplessness**: roll 1d6, lose that many POW permanently (which raises your BP — check if a new disorder triggers).

> Adaptation die rolls are physical — enter the result manually in the Stats tab afterward.

### Step 5 — Permanent Insanity *(only if SAN hits 0)*
If SAN reaches 0, a final warning screen appears. The agent's mind is gone — they become a Handler-controlled NPC. The dossier can be printed as an archive.

---

## 9. The Bonds System

Bonds represent the people, places, and relationships that keep your agent human. They have scores that degrade over time through SAN events and projection.

### Bond Scores
Each bond has a **current score** and a **max score**. When you name a new bond for the first time (typing into an empty name field), the score and max are automatically set to your CHA stat value. If you've already manually entered a score, the auto-fill is skipped. A colored bar between the name and score shows how degraded the bond is:
- **Orange bar** — bond is weakened but intact
- **Red bar / BROKEN** — bond score has reached 0

The `current / max` label under the bar shows exact values.

### Bond Projection
When your agent takes SAN damage, they can project part of that damage onto a bond relationship instead. Click **⚡ PROJECT ONTO A BOND** in the SAN panel:

1. **Step 1** — Enter the incoming SAN damage amount
2. **Step 2** — Roll 1d4; the app calculates WP cost and SAN reduction
3. **Step 3** — Choose which bond absorbs the damage

The result: WP is deducted, SAN is reduced by a smaller amount, and the chosen bond score drops by the projected amount. If the bond reaches 0, it is broken. All changes are logged to the Session Log.

> The Project button is disabled if your agent has no bonds with a score above 0, or if WP is too low.

---

## 10. End of Mission & Skill Advancement

When the current operation is complete, click **◈ END MISSION** in the Skills tab (top-right, shows a badge with the number of checked skills).

> **Important:** In Delta Green, skill advancement happens at the end of an *operation* (mission), not after each individual play session. Don't hit this button until the mission is actually over.

### What Happens
1. A **confirmation dialog** appears reminding you that this rolls advancement and clears all checkboxes — click **CONFIRM — ROLL ADVANCEMENT** to proceed, or **CANCEL** to go back
2. For each skill with its checkbox marked, the app rolls 1d4 and adds it to the current percentage (capped at 99%)
3. The **Mission Debrief** screen shows every advancement:
   - Skill name
   - Roll result
   - Old value → new value
   - Gold star ★ for skills now at 90%+
4. Each improvement is added to the Session Log
5. All checkboxes are cleared automatically

If no skills are checked, the debrief screen shows a "no failed rolls on record" message instead.

---

## 11. KIA — Killed in Action

### Automatic Trigger
If HP current drops to 0, a confirmation dialog appears asking whether the wounds are fatal. You can dismiss it if the agent survives.

### Manual Trigger
Click **☠ MARK K.I.A.** in the HP panel to manually flag an agent as killed.

### What Changes When Marked KIA
- All fields become read-only (locked)
- Sensitive information is redacted with visual bars (names, employers, descriptions, bond names, etc.)
- A red K.I.A. banner appears at the top
- A watermark appears across all tabs
- The agent's name in the sidebar shows with strikethrough
- A KIA entry is added to the Session Log

### Redaction
The **⬛ RECLASSIFY / ⬜ DECLASSIFY** button in the KIA banner toggles redaction independently of the locked state. Use this to show or hide sensitive information in the dossier view.

### Reviving an Agent
Click **↩ REVIVE AGENT** in the KIA banner to restore the agent to active duty. This removes all KIA restrictions and allows editing again.

---

## 12. Importing an Agent

Click **IMPORT AGENT** in the sidebar to open the import dialog. Two options are available.

---

### Option A — Import from PDF

**Requirements:** An official Delta Green fillable PDF character sheet (DD-315 or equivalent AcroForm format).

**Process:**
1. Click **IMPORT AGENT** → **📄 IMPORT FROM PDF**
2. Select your `.pdf` file
3. The app reads and parses the form fields through three phases:
   - 📄 **Reading PDF**
   - 🔍 **Analyzing Fields**
   - 📋 **Building Character**
4. The **Import Review** screen opens showing all parsed values
   - Fields modified from their default/base values are highlighted in green
   - Edit any field before confirming
5. Click **CONFIRM IMPORT** — a new agent is created and selected

**Notes:**
- Motivations and mental disorders from a combined PDF field are imported into **§12 Motivations**; Mental Disorders (§12a) starts blank
- Skills with specializations (Art, Craft, etc.) are parsed including the specialization name
- Bond scores are imported as both current and max values

---

### Option B — Restore from Backup

**Requirements:** A `.json` backup file previously exported from this app via the **↓ BACKUP** button.

**Process:**
1. Click **IMPORT AGENT** → **↓ RESTORE FROM BACKUP**
2. Select the `.json` backup file
3. The agent is added to your roster immediately and selected — all data including the full session log is preserved

**Notes:**
- A new internal ID is assigned on restore, so importing a backup never overwrites an existing agent
- KIA status, redaction state, bonds, disorders — everything in the backup is restored exactly as it was
- If the file is not a valid backup, an error dialog appears and nothing is changed

---

## 13. Backing Up an Agent

Click the **↓** button in the sidebar action row of any active agent (between ⎙ and DELETE) to download a full backup.

### What's in the Backup
The backup is a `.json` file containing the agent's **complete data**:
- All personal info, stats, skills, weapons, gear
- All bonds and their current/max scores
- §12 Motivations and §12a Mental Disorders
- §14 Unnatural Encounters (full log with descriptions, points, and dates)
- SAN adaptation tracking state
- KIA status and date
- The full session log history

The file is named `FirstName-LastName-backup.json`.

### Why Use Backup Instead of Print?
The **↓ Backup** export is for data portability and safety — it lets you:
- Move an agent to a different device or browser
- Share an agent with another player
- Keep a dated archive snapshot before a dangerous mission
- Recover from browser data loss (clearing cache, switching profiles)

> ⚠️ **Browser storage is device-specific.** If you clear browser data, switch browsers, or use a different device, your agents will not be there. Regular backups are your safety net.

---

## 14. Printing Your Dossier

Click the **⎙** button next to the active agent in the sidebar to open a formatted two-page printout.

### Page 1 Contains
Personal info, core stats, derived attributes, bonds with degradation, §12 Motivations, §12a Mental Disorders, §13 SAN adaptation tracking, and the full skills grid.

### Page 2 Contains
**§13a Unnatural Encounters** — a formula bar showing the Unnatural total and SAN max ceiling, plus a table of all logged encounters (description, points, date). If no encounters have been logged, a placeholder note is shown instead.

Followed by: Wounds & ailments, armor & gear, weapons table, personal notes, home & family, special training, authorizing officer, and recruitment notes.

### Notes
- KIA agents show a **K.I.A.** stamp watermark on the printout
- The printout opens in a new window — use the **⎙ PRINT** button in that window, or Ctrl+P / Cmd+P

---

## 15. Session Log

The Session Log (at the bottom of the Notes tab) records every significant change made to the character, organized newest-first.

### Entry Sources & Badges

| Badge | Color | Logged by |
|---|---|---|
| *(none)* | — | Manual stat and field edits |
| **ADV** | Green | Skill advancement from End Mission |
| **PROJ** | Blue | SAN projection onto a bond |
| **SAN** | Purple | SAN events (BP, disorders, adaptation, insanity) |
| **UNNAT** | Teal-green | Unnatural encounter logged or removed (§14) |
| **K.I.A.** | Red | Agent marked killed in action |

### Log Actions

| Button | Effect |
|---|---|
| **⎙ PRINT LOG** | Opens a print-ready view of all log entries |
| **↓ EXPORT** | Downloads the session log entries as a `.json` file |
| **CLEAR** | Permanently erases all entries (confirmation required) |

> **Note:** The **↓ EXPORT** log button exports only the session log entries. To export the full agent (all stats, skills, bonds, etc.), use the **↓ Backup** button in the sidebar instead.

---

## 16. Keyboard Shortcuts & Tips

- **Tab** — Move between fields naturally in any form section
- **Scroll** on a NumField — Increment/decrement numeric values quickly
- **Click a disorder chip** in the SAN modal — Select it (shows ✓ highlight); click "Other" to enter a custom disorder
- **End Mission badge** — The number badge on the ◈ END MISSION button tells you how many skills are currently checked for advancement
- **Sidebar drag** — Hold the ⠿ handle to reorder agents in the list

### Saving
The app saves automatically to IndexedDB within half a second of any change. No manual save is needed. The **SAVED [time]** indicator confirms the last save time. If a save fails (e.g., storage quota exceeded), a dismissible warning banner appears at the top of the screen.

> **Note:** If you previously used an older version that stored data in localStorage, your data is automatically migrated to IndexedDB on first load.

> ⚠️ **Browser storage is device-specific.** If you clear browser data, switch browsers, or use a different computer, your agents will not be there unless you have the app installed as a PWA. Use the **↓ Backup** button regularly to keep a portable copy of each agent.

---

## 17. Installing as a PWA

This app is a Progressive Web App and can be installed on your device for offline use.

### Desktop (Chrome/Edge)
- Click the install icon in the browser's address bar, or open the browser menu and select "Install App"
- The app opens in its own window without browser chrome

### Mobile (iOS/Android)
- **iOS:** Tap the Share button in Safari, then "Add to Home Screen"
- **Android:** Tap the browser menu, then "Add to Home Screen" or "Install App"

### What the PWA Provides
- **Offline access** — the app works without an internet connection after first load
- **Home screen icon** — launches like a native app
- **Auto-update** — new versions activate automatically on your next visit
- **Font caching** — Google Fonts (Special Elite, IBM Plex Sans, IBM Plex Mono) are cached for offline use

Data is stored in IndexedDB on your device. Installing as a PWA does not change how your data is stored — backups are still recommended.

---

*Delta Green is published by Arc Dream Publishing. This app is an unofficial player tool.*
