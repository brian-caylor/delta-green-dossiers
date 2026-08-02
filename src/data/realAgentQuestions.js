/**
 * Question bank for the "real person" dossier wizard.
 *
 * Design rule: never ask the player for a number. People rate themselves badly
 * and inflate — everyone thinks they are POW 14. Ask about observable behaviour
 * instead and derive the stat, and ask more than one question per stat so a
 * single odd answer cannot skew the result.
 *
 * Each option carries a weight from -2 to +2, meaning "relative to a median
 * adult". See realAgentDerivation.js for how weights become a 3-18 score.
 *
 * Questions marked core:true make up the ~15-question quick pass. The rest are
 * the optional deep modules.
 */

export const CODE_PHRASE = "NIGHT AT THE OPERA";

export const STAT_QUESTIONS = [
  // ─── STRENGTH ───
  {
    stat: "str", id: "str-pushups", core: true,
    prompt: "In one set, without stopping, how many push-ups can you do?",
    options: [
      { label: "None right now", w: -2 },
      { label: "A handful — under ten", w: -1 },
      { label: "Around twenty", w: 0 },
      { label: "Thirty to forty", w: 1 },
      { label: "Fifty or more", w: 2 },
    ],
  },
  {
    stat: "str", id: "str-carry", core: true,
    prompt: "Could you carry a 50 lb (23 kg) suitcase up two flights of stairs?",
    options: [
      { label: "No", w: -2 },
      { label: "Slowly, with a rest partway", w: -1 },
      { label: "Yes, awkwardly", w: 0 },
      { label: "Yes, without stopping", w: 1 },
      { label: "Easily — I move heavy things often", w: 2 },
    ],
  },
  {
    stat: "str", id: "str-train", core: false,
    prompt: "Do you train strength on purpose?",
    options: [
      { label: "Never", w: -1 },
      { label: "Occasionally", w: 0 },
      { label: "One or two days a week", w: 1 },
      { label: "Three or more days a week", w: 2 },
      { label: "I compete — powerlifting, strongman, similar", w: 2 },
    ],
  },

  // ─── CONSTITUTION ───
  {
    stat: "con", id: "con-mile", core: true,
    prompt: "Could you jog a mile without stopping?",
    options: [
      { label: "Not a chance", w: -2 },
      { label: "With effort, and a lot of walking", w: -1 },
      { label: "Yes, at an easy pace", w: 0 },
      { label: "Yes, comfortably — I run regularly", w: 1 },
      { label: "A mile is a warm-up", w: 2 },
    ],
  },
  {
    stat: "con", id: "con-illness", core: true,
    prompt: "How often does being ill actually put you out of commission?",
    options: [
      { label: "Constantly — something is always wrong", w: -2 },
      { label: "Several times a year", w: -1 },
      { label: "Once or twice a year", w: 0 },
      { label: "Rarely", w: 1 },
      { label: "Almost never", w: 2 },
    ],
  },
  {
    stat: "con", id: "con-recovery", core: false,
    prompt: "Day to day — sleep, stamina, how fast you bounce back?",
    options: [
      { label: "Running on empty most days", w: -2 },
      { label: "Tired often; recovery is slow", w: -1 },
      { label: "About average", w: 0 },
      { label: "Good sleep, quick recovery", w: 1 },
      { label: "I can push hard for days on end", w: 2 },
    ],
  },

  // ─── DEXTERITY ───
  {
    stat: "dex", id: "dex-fine", core: true,
    prompt: "Do you do anything regularly that needs fine motor control — an instrument, a craft, a sport, surgery, sleight of hand?",
    options: [
      { label: "No — I'm notably clumsy with my hands", w: -2 },
      { label: "Not really", w: -1 },
      { label: "A little, casually", w: 0 },
      { label: "Yes — years of practice", w: 1 },
      { label: "Yes — I'm paid for it, or I compete", w: 2 },
    ],
  },
  {
    stat: "dex", id: "dex-keys", core: true,
    prompt: "Someone tosses you a set of keys without warning.",
    options: [
      { label: "They hit me", w: -2 },
      { label: "I fumble it", w: -1 },
      { label: "I usually catch it", w: 0 },
      { label: "I catch it clean", w: 1 },
      { label: "Clean, one hand, every time", w: 2 },
    ],
  },
  {
    stat: "dex", id: "dex-balance", core: false,
    prompt: "Stand on one leg with your eyes closed. How long before you put a foot down?",
    options: [
      { label: "A couple of seconds", w: -2 },
      { label: "About ten seconds", w: -1 },
      { label: "About twenty seconds", w: 0 },
      { label: "Thirty seconds or more", w: 1 },
      { label: "Indefinitely — I train balance", w: 2 },
    ],
  },

  // ─── INTELLIGENCE ───
  {
    stat: "int", id: "int-education", core: true,
    prompt: "Furthest formal education you completed?",
    options: [
      { label: "Did not finish secondary school", w: -2 },
      { label: "Secondary school / GED", w: -1 },
      { label: "Trade certification or some college", w: 0 },
      { label: "Bachelor's degree", w: 1 },
      { label: "Postgraduate — Master's, PhD, MD, JD", w: 2 },
    ],
  },
  {
    stat: "int", id: "int-learning", core: true,
    prompt: "New software, a new game's rules, a new system at work — how fast do you pick it up?",
    options: [
      { label: "I need a lot of hand-holding", w: -2 },
      { label: "Slowly, with repetition", w: -1 },
      { label: "About average", w: 0 },
      { label: "Fast — I usually skip the manual", w: 1 },
      { label: "I end up teaching everyone else", w: 2 },
    ],
  },
  {
    stat: "int", id: "int-problem", core: false,
    prompt: "When something breaks or a problem needs untangling, are you the one people come to?",
    options: [
      { label: "Never", w: -2 },
      { label: "Rarely", w: -1 },
      { label: "Sometimes", w: 0 },
      { label: "Usually", w: 1 },
      { label: "Always — it's my role in every group", w: 2 },
    ],
  },

  // ─── POWER ───
  // POW drives WP, SAN (POW x5) and Breaking Point. It is the whole horror
  // engine, so it gets four questions rather than three.
  {
    stat: "pow", id: "pow-habit", core: true,
    prompt: "You commit to a new habit — gym, diet, practice, a project. Realistically, how long does it hold?",
    options: [
      { label: "It never actually starts", w: -2 },
      { label: "A few days", w: -1 },
      { label: "A few weeks", w: 0 },
      { label: "Months", w: 1 },
      { label: "It becomes permanent — that's just how I work", w: 2 },
    ],
  },
  {
    stat: "pow", id: "pow-emergency", core: true,
    prompt: "A real emergency happens in front of you — a crash, someone collapses. What do you actually do?",
    options: [
      { label: "I freeze completely", w: -2 },
      { label: "I panic, then pull it together", w: -1 },
      { label: "I hesitate, then help", w: 0 },
      { label: "I act immediately", w: 1 },
      { label: "I act, and end up directing everyone else", w: 2 },
    ],
  },
  {
    stat: "pow", id: "pow-confrontation", core: false,
    prompt: "In a heated confrontation, do you keep your head?",
    options: [
      { label: "I shut down, or I blow up", w: -2 },
      { label: "I lose the thread", w: -1 },
      { label: "I hold it together, mostly", w: 0 },
      { label: "I stay level", w: 1 },
      { label: "I get calmer as it escalates", w: 2 },
    ],
  },
  {
    stat: "pow", id: "pow-fear", core: false,
    prompt: "Something frightens you — heights, deep water, speaking to a crowd. How do you carry it?",
    options: [
      { label: "It runs my decisions", w: -2 },
      { label: "It stays with me a long time", w: -1 },
      { label: "I manage it", w: 0 },
      { label: "I push through and move on", w: 1 },
      { label: "I go looking for it on purpose", w: 2 },
    ],
  },

  // ─── CHARISMA ───
  {
    stat: "cha", id: "cha-party", core: true,
    prompt: "A party where you know exactly one person. What happens?",
    options: [
      { label: "I don't go, or I leave early", w: -2 },
      { label: "I stay near the person I know", w: -1 },
      { label: "I talk to whoever talks to me", w: 0 },
      { label: "I'll work the room a little", w: 1 },
      { label: "I'll know half of them by the end", w: 2 },
    ],
  },
  {
    stat: "cha", id: "cha-lead", core: true,
    prompt: "When a group needs someone to take charge, who does?",
    options: [
      { label: "Never me", w: -2 },
      { label: "Rarely me", w: -1 },
      { label: "Sometimes me", w: 0 },
      { label: "Usually me", w: 1 },
      { label: "Always me — people wait for me to start", w: 2 },
    ],
  },
  {
    stat: "cha", id: "cha-strangers", core: false,
    prompt: "Do strangers tell you things they probably shouldn't?",
    options: [
      { label: "People tend to keep their distance", w: -2 },
      { label: "Never", w: -1 },
      { label: "Rarely", w: 0 },
      { label: "Sometimes", w: 1 },
      { label: "Constantly — I don't know why", w: 2 },
    ],
  },
];

/**
 * Skill grants. `s` is the skill name as it appears in DEFAULT_SKILLS, `v` is a
 * floor (the skill becomes at least this), `spec` fills the specialisation for
 * the skills that take one.
 */
export const PROFESSIONS = [
  { id: "none", label: "Something else / prefer not to say", grants: [] },
  {
    id: "physician", label: "Physician / Surgeon / Dentist",
    grants: [{ s: "Medicine", v: 60 }, { s: "First Aid", v: 60 }, { s: "Surgery", v: 50 }, { s: "Pharmacy", v: 40 }, { s: "Science", spec: "Biology", v: 40 }, { s: "Bureaucracy", v: 30 }],
  },
  {
    id: "nurse", label: "Nurse / Paramedic / EMT",
    grants: [{ s: "First Aid", v: 60 }, { s: "Medicine", v: 40 }, { s: "Pharmacy", v: 30 }, { s: "HUMINT", v: 30 }, { s: "Alertness", v: 40 }, { s: "Drive", v: 40 }],
  },
  {
    id: "leo", label: "Police / Federal Agent / Corrections",
    grants: [{ s: "Firearms", v: 50 }, { s: "Criminology", v: 50 }, { s: "Law", v: 30 }, { s: "HUMINT", v: 40 }, { s: "Alertness", v: 40 }, { s: "Drive", v: 40 }, { s: "Unarmed Combat", v: 50 }, { s: "Persuade", v: 40 }, { s: "Bureaucracy", v: 30 }],
  },
  {
    id: "military", label: "Military — serving or veteran",
    grants: [{ s: "Firearms", v: 50 }, { s: "Military Science", spec: "Land", v: 40 }, { s: "Alertness", v: 40 }, { s: "Athletics", v: 50 }, { s: "Unarmed Combat", v: 50 }, { s: "First Aid", v: 30 }, { s: "Navigate", v: 30 }, { s: "Heavy Weapons", v: 20 }],
  },
  {
    id: "fire", label: "Firefighter / Search & Rescue",
    grants: [{ s: "First Aid", v: 50 }, { s: "Athletics", v: 50 }, { s: "Heavy Machinery", v: 40 }, { s: "Alertness", v: 40 }, { s: "Search", v: 40 }, { s: "Demolitions", v: 20 }],
  },
  {
    id: "software", label: "Software / IT / Security",
    grants: [{ s: "Computer Science", v: 60 }, { s: "SIGINT", v: 30 }, { s: "Craft", spec: "Electronics", v: 30 }, { s: "Bureaucracy", v: 20 }],
  },
  {
    id: "engineer", label: "Engineer — civil, mechanical, electrical",
    grants: [{ s: "Craft", spec: "Mechanics", v: 50 }, { s: "Science", spec: "Physics", v: 40 }, { s: "Heavy Machinery", v: 40 }, { s: "Computer Science", v: 30 }],
  },
  {
    id: "scientist", label: "Scientist / Researcher / Lab work",
    grants: [{ s: "Science", v: 60 }, { s: "Computer Science", v: 30 }, { s: "Bureaucracy", v: 30 }, { s: "Pharmacy", v: 20 }],
  },
  {
    id: "educator", label: "Teacher / Professor / Trainer",
    grants: [{ s: "Persuade", v: 50 }, { s: "HUMINT", v: 40 }, { s: "History", v: 40 }, { s: "Bureaucracy", v: 30 }, { s: "Psychotherapy", v: 20 }],
  },
  {
    id: "legal", label: "Lawyer / Paralegal / Judiciary",
    grants: [{ s: "Law", v: 60 }, { s: "Bureaucracy", v: 50 }, { s: "Persuade", v: 50 }, { s: "HUMINT", v: 40 }, { s: "Criminology", v: 30 }, { s: "Accounting", v: 20 }],
  },
  {
    id: "finance", label: "Accounting / Finance / Insurance",
    grants: [{ s: "Accounting", v: 60 }, { s: "Bureaucracy", v: 40 }, { s: "Computer Science", v: 30 }, { s: "Law", v: 20 }],
  },
  {
    id: "trades", label: "Skilled trades — electrician, plumber, carpenter, welder",
    grants: [{ s: "Craft", spec: "Trade", v: 60 }, { s: "Heavy Machinery", v: 40 }, { s: "Athletics", v: 30 }, { s: "Demolitions", v: 20 }],
  },
  {
    id: "creative", label: "Artist / Designer / Musician",
    grants: [{ s: "Art", spec: "Design", v: 60 }, { s: "Craft", v: 30 }, { s: "Persuade", v: 20 }],
  },
  {
    id: "media", label: "Journalist / Writer / Media",
    grants: [{ s: "HUMINT", v: 50 }, { s: "Art", spec: "Writing", v: 45 }, { s: "Persuade", v: 40 }, { s: "Search", v: 40 }, { s: "History", v: 30 }, { s: "Bureaucracy", v: 20 }],
  },
  {
    id: "clergy", label: "Clergy / Therapist / Social work",
    grants: [{ s: "Psychotherapy", v: 50 }, { s: "Persuade", v: 50 }, { s: "HUMINT", v: 50 }, { s: "History", v: 30 }, { s: "Occult", v: 20 }],
  },
  {
    id: "sales", label: "Sales / Marketing / Management",
    grants: [{ s: "Persuade", v: 60 }, { s: "HUMINT", v: 50 }, { s: "Bureaucracy", v: 30 }, { s: "Accounting", v: 20 }],
  },
  {
    id: "service", label: "Service / Hospitality / Retail",
    grants: [{ s: "HUMINT", v: 40 }, { s: "Persuade", v: 40 }, { s: "Alertness", v: 30 }, { s: "Craft", spec: "Cooking", v: 30 }],
  },
  {
    id: "office", label: "Office / Administration / Government",
    grants: [{ s: "Bureaucracy", v: 50 }, { s: "Computer Science", v: 30 }, { s: "Accounting", v: 30 }, { s: "Persuade", v: 20 }],
  },
  {
    id: "aviation", label: "Pilot / Aviation / Maritime",
    grants: [{ s: "Pilot", spec: "Aircraft", v: 55 }, { s: "Navigate", v: 50 }, { s: "Alertness", v: 40 }, { s: "Craft", spec: "Mechanics", v: 20 }],
  },
  {
    id: "transport", label: "Driver / Logistics / Heavy equipment",
    grants: [{ s: "Drive", v: 60 }, { s: "Heavy Machinery", v: 45 }, { s: "Navigate", v: 40 }, { s: "Bureaucracy", v: 20 }],
  },
  {
    id: "athlete", label: "Athlete / Coach / Physical therapy",
    grants: [{ s: "Athletics", v: 60 }, { s: "Dodge", v: 40 }, { s: "First Aid", v: 35 }, { s: "Persuade", v: 30 }, { s: "Unarmed Combat", v: 30 }],
  },
  {
    id: "agriculture", label: "Farming / Ranching / Outdoors work",
    grants: [{ s: "Survival", v: 50 }, { s: "Heavy Machinery", v: 45 }, { s: "Navigate", v: 40 }, { s: "Craft", spec: "Repair", v: 40 }, { s: "Firearms", v: 30 }, { s: "Ride", v: 30 }],
  },
  {
    id: "caregiver", label: "Homemaker / Caregiver",
    grants: [{ s: "HUMINT", v: 40 }, { s: "Craft", spec: "Cooking", v: 40 }, { s: "First Aid", v: 30 }, { s: "Persuade", v: 30 }, { s: "Bureaucracy", v: 20 }],
  },
  {
    id: "student", label: "Student",
    grants: [{ s: "Computer Science", v: 25 }, { s: "History", v: 25 }, { s: "Science", v: 25 }, { s: "Athletics", v: 30 }],
  },
];

export const HOBBIES = [
  { id: "hunting", label: "Hunting", grants: [{ s: "Firearms", v: 40 }, { s: "Survival", v: 30 }, { s: "Navigate", v: 30 }, { s: "Stealth", v: 30 }] },
  { id: "range", label: "Range / sport shooting", grants: [{ s: "Firearms", v: 50 }] },
  { id: "hiking", label: "Hiking, camping, backpacking", grants: [{ s: "Survival", v: 40 }, { s: "Navigate", v: 40 }, { s: "Athletics", v: 40 }] },
  { id: "martial", label: "Martial arts / boxing / grappling", grants: [{ s: "Unarmed Combat", v: 55 }, { s: "Dodge", v: 40 }, { s: "Athletics", v: 40 }] },
  { id: "team", label: "Team sports", grants: [{ s: "Athletics", v: 45 }, { s: "Dodge", v: 35 }] },
  { id: "lifting", label: "Weightlifting / gym", grants: [{ s: "Athletics", v: 40 }] },
  { id: "endurance", label: "Running / cycling / endurance events", grants: [{ s: "Athletics", v: 50 }, { s: "Dodge", v: 30 }] },
  { id: "swimming", label: "Swimming", grants: [{ s: "Swim", v: 50 }, { s: "Athletics", v: 35 }] },
  { id: "diving", label: "SCUBA / freediving", grants: [{ s: "Swim", v: 60 }, { s: "Survival", v: 25 }] },
  { id: "climbing", label: "Rock climbing", grants: [{ s: "Athletics", v: 50 }, { s: "Dodge", v: 35 }, { s: "Survival", v: 20 }] },
  { id: "moto", label: "Motorcycles", grants: [{ s: "Drive", v: 45 }, { s: "Craft", spec: "Mechanics", v: 25 }] },
  { id: "cars", label: "Cars / wrenching", grants: [{ s: "Craft", spec: "Mechanics", v: 45 }, { s: "Drive", v: 45 }, { s: "Heavy Machinery", v: 25 }] },
  { id: "wood", label: "Woodworking / DIY / home repair", grants: [{ s: "Craft", spec: "Carpentry", v: 45 }, { s: "Heavy Machinery", v: 25 }] },
  { id: "making", label: "3D printing / electronics / making", grants: [{ s: "Craft", spec: "Fabrication", v: 45 }, { s: "Computer Science", v: 30 }] },
  { id: "garden", label: "Gardening / homesteading", grants: [{ s: "Science", spec: "Botany", v: 30 }, { s: "Survival", v: 25 }] },
  { id: "cooking", label: "Cooking / baking", grants: [{ s: "Craft", spec: "Cooking", v: 45 }] },
  { id: "photo", label: "Photography / film", grants: [{ s: "Art", spec: "Photography", v: 45 }, { s: "Search", v: 25 }] },
  { id: "music", label: "Playing music", grants: [{ s: "Art", spec: "Music", v: 45 }] },
  { id: "draw", label: "Drawing / painting", grants: [{ s: "Art", spec: "Painting", v: 45 }] },
  { id: "writing", label: "Creative writing", grants: [{ s: "Art", spec: "Writing", v: 45 }, { s: "History", v: 20 }] },
  { id: "ttrpg", label: "Tabletop RPGs / running games", grants: [{ s: "Persuade", v: 35 }, { s: "HUMINT", v: 30 }, { s: "Occult", v: 25 }, { s: "History", v: 25 }] },
  { id: "games", label: "Video games", grants: [{ s: "Alertness", v: 25 }, { s: "Computer Science", v: 20 }] },
  { id: "code", label: "Programming / homelab", grants: [{ s: "Computer Science", v: 50 }, { s: "SIGINT", v: 20 }] },
  { id: "radio", label: "Amateur radio", grants: [{ s: "SIGINT", v: 45 }, { s: "Craft", spec: "Electronics", v: 30 }] },
  { id: "astro", label: "Astronomy", grants: [{ s: "Science", spec: "Astronomy", v: 40 }, { s: "Navigate", v: 25 }] },
  { id: "boating", label: "Fishing / boating / sailing", grants: [{ s: "Navigate", v: 35 }, { s: "Survival", v: 30 }, { s: "Swim", v: 30 }, { s: "Pilot", spec: "Boat", v: 25 }] },
  { id: "horses", label: "Horses / riding", grants: [{ s: "Ride", v: 50 }, { s: "Athletics", v: 30 }] },
  { id: "dance", label: "Dancing", grants: [{ s: "Athletics", v: 40 }, { s: "Dodge", v: 35 }, { s: "Art", spec: "Dance", v: 35 }] },
  { id: "history", label: "History / documentaries", grants: [{ s: "History", v: 40 }, { s: "Anthropology", v: 25 }, { s: "Archeology", v: 20 }] },
  { id: "truecrime", label: "True crime / forensics", grants: [{ s: "Criminology", v: 35 }, { s: "Forensics", v: 25 }] },
  { id: "occult", label: "Occult / folklore / the paranormal", grants: [{ s: "Occult", v: 40 }, { s: "Anthropology", v: 20 }] },
  { id: "volunteer", label: "Volunteer EMS / search & rescue", grants: [{ s: "First Aid", v: 50 }, { s: "Search", v: 40 }, { s: "Navigate", v: 35 }, { s: "Athletics", v: 40 }] },
  { id: "textiles", label: "Sewing / knitting / textiles", grants: [{ s: "Craft", spec: "Textiles", v: 45 }] },
];

export const CERTIFICATIONS = [
  { id: "drive", label: "Driver's licence", grants: [{ s: "Drive", v: 40 }] },
  { id: "moto", label: "Motorcycle endorsement", grants: [{ s: "Drive", v: 50 }] },
  { id: "cdl", label: "Commercial driver's licence", grants: [{ s: "Drive", v: 60 }, { s: "Heavy Machinery", v: 40 }] },
  { id: "pilot", label: "Pilot's licence", grants: [{ s: "Pilot", spec: "Aircraft", v: 50 }, { s: "Navigate", v: 40 }] },
  { id: "cpr", label: "CPR / First Aid certified", grants: [{ s: "First Aid", v: 40 }] },
  { id: "emt", label: "EMT / Wilderness First Responder", grants: [{ s: "First Aid", v: 60 }, { s: "Medicine", v: 30 }] },
  { id: "lifeguard", label: "Lifeguard", grants: [{ s: "Swim", v: 60 }, { s: "First Aid", v: 40 }] },
  { id: "scuba", label: "SCUBA certification", grants: [{ s: "Swim", v: 55 }] },
  { id: "ccw", label: "Concealed carry permit", grants: [{ s: "Firearms", v: 40 }] },
  { id: "ham", label: "Amateur radio licence", grants: [{ s: "SIGINT", v: 50 }] },
  { id: "clearance", label: "Security clearance, past or present", grants: [{ s: "Bureaucracy", v: 40 }] },
];

export const LANGUAGE_LEVELS = [
  { id: "basic", label: "A few phrases", v: 20 },
  { id: "convo", label: "Conversational", v: 35 },
  { id: "fluent", label: "Fluent", v: 55 },
  { id: "native", label: "Native / bilingual", v: 70 },
];

export const EDC_ITEMS = [
  "Phone", "Wallet", "Keys", "Pocket knife", "Multitool", "Flashlight",
  "Notebook & pen", "Water bottle", "Medication", "First aid kit",
  "Laptop or tablet", "Camera", "Firearm", "Lighter",
];

/** Narrative hook for the recruitment field, keyed by profession id. */
export const RECRUITMENT_HOOKS = {
  physician: "Flagged after filing an autopsy report the coroner's office later tried to withdraw.",
  nurse: "Noticed during an ambulance call that never appeared in the county log.",
  leo: "Pulled from an evidence chain that went missing between the scene and the locker.",
  military: "Identified from an after-action report that was classified above the unit's own clearance.",
  fire: "Recruited after a structure fire with a burn pattern no accelerant explains.",
  software: "Surfaced after a network scan turned up a host that does not officially exist.",
  engineer: "Approached after a structural survey of a site with no permit history.",
  scientist: "Contacted following a sample result the lab was instructed to destroy.",
  educator: "Approached after a student's research turned up material it should not have.",
  legal: "Retained after a sealed case file was requested by an agency with no jurisdiction.",
  finance: "Found tracing a payment chain that terminates in an account with no owner.",
  trades: "Recruited after a service call to a building whose plans do not match the interior.",
  creative: "Noticed after producing work that resembles a scene from a classified file.",
  media: "Approached after a story was killed by a call from an office that does not exist.",
  clergy: "Contacted after a confession that matched an ongoing federal matter.",
  sales: "Recruited for the ability to walk into any room and be believed.",
  service: "Noticed for remembering every face that came through the door.",
  office: "Found after filing a records request that triggered an alert three states away.",
  aviation: "Identified after logging a contact that ground radar never registered.",
  transport: "Recruited after a delivery to an address that is not on any map.",
  athlete: "Approached for stamina, and for knowing when to stop asking questions.",
  agriculture: "Contacted after reporting livestock losses the state vet would not sign off on.",
  caregiver: "Noticed for keeping a household running through something that broke everyone else.",
  student: "Flagged by a search history that matched a green box index.",
  none: "Recruited through a contact who vouched, and who has since stopped answering.",
};
