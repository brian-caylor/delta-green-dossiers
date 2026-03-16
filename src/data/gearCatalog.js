export const EMPTY_WEAPON = { name: "", skill: "", baseRange: "", damage: "", armorPiercing: false, lethality: "", killRadius: "", ammo: 0, ammoMax: 0 };

export const GEAR_CATALOG = [
  // Handguns
  { category: "Handguns",    name: "Glock 17",              skill: "Firearms", baseRange: "15m",   damage: "1d10",   armorPiercing: false, lethality: "",   killRadius: "",   ammo: 17  },
  { category: "Handguns",    name: "Beretta M9",            skill: "Firearms", baseRange: "15m",   damage: "1d10",   armorPiercing: false, lethality: "",   killRadius: "",   ammo: 15  },
  { category: "Handguns",    name: "Colt 1911",             skill: "Firearms", baseRange: "15m",   damage: "1d10",   armorPiercing: false, lethality: "",   killRadius: "",   ammo: 7   },
  { category: "Handguns",    name: "SIG Sauer P226",        skill: "Firearms", baseRange: "15m",   damage: "1d10",   armorPiercing: false, lethality: "",   killRadius: "",   ammo: 15  },
  { category: "Handguns",    name: ".357 Magnum Revolver",  skill: "Firearms", baseRange: "15m",   damage: "1d12+2", armorPiercing: false, lethality: "",   killRadius: "",   ammo: 6   },
  { category: "Handguns",    name: "Desert Eagle (.50)",    skill: "Firearms", baseRange: "15m",   damage: "1d12+2", armorPiercing: false, lethality: "",   killRadius: "",   ammo: 7   },
  // Rifles & Carbines
  { category: "Rifles",      name: "M4A1 Carbine",          skill: "Firearms", baseRange: "300m",  damage: "1d12+2", armorPiercing: true,  lethality: "",   killRadius: "",   ammo: 30  },
  { category: "Rifles",      name: "M16A4",                 skill: "Firearms", baseRange: "500m",  damage: "1d12+2", armorPiercing: true,  lethality: "",   killRadius: "",   ammo: 30  },
  { category: "Rifles",      name: "AK-47",                 skill: "Firearms", baseRange: "400m",  damage: "1d12+2", armorPiercing: true,  lethality: "",   killRadius: "",   ammo: 30  },
  { category: "Rifles",      name: "AK-74",                 skill: "Firearms", baseRange: "400m",  damage: "1d12+2", armorPiercing: true,  lethality: "",   killRadius: "",   ammo: 30  },
  { category: "Rifles",      name: "M14 / M1A",             skill: "Firearms", baseRange: "500m",  damage: "2d10",   armorPiercing: true,  lethality: "",   killRadius: "",   ammo: 20  },
  { category: "Rifles",      name: "HK G36",                skill: "Firearms", baseRange: "300m",  damage: "1d12+2", armorPiercing: true,  lethality: "",   killRadius: "",   ammo: 30  },
  // Shotguns
  { category: "Shotguns",    name: "Remington 870",         skill: "Firearms", baseRange: "50m",   damage: "2d6",    armorPiercing: false, lethality: "",   killRadius: "",   ammo: 6   },
  { category: "Shotguns",    name: "Mossberg 500",          skill: "Firearms", baseRange: "50m",   damage: "2d6",    armorPiercing: false, lethality: "",   killRadius: "",   ammo: 6   },
  { category: "Shotguns",    name: "Saiga-12 (semi)",       skill: "Firearms", baseRange: "50m",   damage: "2d6",    armorPiercing: false, lethality: "",   killRadius: "",   ammo: 10  },
  { category: "Shotguns",    name: "Sawn-Off Shotgun",      skill: "Firearms", baseRange: "10m",   damage: "2d6",    armorPiercing: false, lethality: "",   killRadius: "",   ammo: 2   },
  // Submachine Guns
  { category: "SMGs",        name: "MP5",                   skill: "Firearms", baseRange: "100m",  damage: "1d10",   armorPiercing: false, lethality: "10", killRadius: "1m", ammo: 30  },
  { category: "SMGs",        name: "UMP-45",                skill: "Firearms", baseRange: "100m",  damage: "1d10",   armorPiercing: false, lethality: "10", killRadius: "1m", ammo: 25  },
  { category: "SMGs",        name: "MAC-10",                skill: "Firearms", baseRange: "50m",   damage: "1d10",   armorPiercing: false, lethality: "10", killRadius: "1m", ammo: 32  },
  // Sniper Rifles
  { category: "Sniper",      name: "M24 SWS",               skill: "Firearms", baseRange: "800m",  damage: "2d10",   armorPiercing: true,  lethality: "",   killRadius: "",   ammo: 5   },
  { category: "Sniper",      name: "M40A5",                 skill: "Firearms", baseRange: "900m",  damage: "2d10",   armorPiercing: true,  lethality: "",   killRadius: "",   ammo: 5   },
  { category: "Sniper",      name: "Barrett M82A1",         skill: "Firearms", baseRange: "1800m", damage: "2d12+4", armorPiercing: true,  lethality: "20", killRadius: "",   ammo: 10  },
  { category: "Sniper",      name: "Dragunov SVD",          skill: "Firearms", baseRange: "800m",  damage: "2d10",   armorPiercing: true,  lethality: "",   killRadius: "",   ammo: 10  },
  // Heavy Weapons
  { category: "Heavy",       name: "M249 SAW",              skill: "Heavy Weapons", baseRange: "500m",  damage: "2d10",   armorPiercing: true,  lethality: "20", killRadius: "2m", ammo: 200 },
  { category: "Heavy",       name: "M60 GPMG",              skill: "Heavy Weapons", baseRange: "700m",  damage: "2d10",   armorPiercing: true,  lethality: "20", killRadius: "2m", ammo: 100 },
  { category: "Heavy",       name: "RPG-7",                 skill: "Heavy Weapons", baseRange: "200m",  damage: "3d10",   armorPiercing: true,  lethality: "40", killRadius: "10m",ammo: 1   },
  { category: "Heavy",       name: "M203 Launcher",         skill: "Heavy Weapons", baseRange: "400m",  damage: "3d6",    armorPiercing: false, lethality: "15", killRadius: "10m",ammo: 1   },
  // Grenades & Explosives
  { category: "Explosives",  name: "M67 Frag Grenade",      skill: "Athletics", baseRange: "30m",   damage: "",       armorPiercing: false, lethality: "15", killRadius: "10m",ammo: 1   },
  { category: "Explosives",  name: "Flashbang (M84)",       skill: "Athletics", baseRange: "20m",   damage: "",       armorPiercing: false, lethality: "",   killRadius: "5m", ammo: 1   },
  { category: "Explosives",  name: "Smoke Grenade",         skill: "Athletics", baseRange: "20m",   damage: "",       armorPiercing: false, lethality: "",   killRadius: "10m",ammo: 1   },
  { category: "Explosives",  name: "Claymore Mine",         skill: "Demolitions", baseRange: "50m",   damage: "",       armorPiercing: false, lethality: "30", killRadius: "30m",ammo: 1   },
  { category: "Explosives",  name: "C4 (shaped charge)",    skill: "Demolitions", baseRange: "0m",    damage: "",       armorPiercing: true,  lethality: "40", killRadius: "3m", ammo: 1   },
  { category: "Explosives",  name: "Molotov Cocktail",      skill: "Athletics", baseRange: "10m",   damage: "1d6",    armorPiercing: false, lethality: "",   killRadius: "3m", ammo: 1   },
  // Melee
  { category: "Melee",       name: "Combat Knife",          skill: "Melee Weapons", baseRange: "1m",    damage: "1d6",    armorPiercing: false, lethality: "",   killRadius: "",   ammo: 0   },
  { category: "Melee",       name: "Machete / Hatchet",     skill: "Melee Weapons", baseRange: "1m",    damage: "1d6",    armorPiercing: false, lethality: "",   killRadius: "",   ammo: 0   },
  { category: "Melee",       name: "Stun Baton",            skill: "Melee Weapons", baseRange: "1m",    damage: "1d6",    armorPiercing: false, lethality: "",   killRadius: "",   ammo: 0   },
  { category: "Melee",       name: "Improvised Club",       skill: "Melee Weapons", baseRange: "1m",    damage: "1d4",    armorPiercing: false, lethality: "",   killRadius: "",   ammo: 0   },
  { category: "Melee",       name: "Baseball Bat",          skill: "Melee Weapons", baseRange: "1m",    damage: "1d6",    armorPiercing: false, lethality: "",   killRadius: "",   ammo: 0   },
  { category: "Melee",       name: "Sword / Bayonet",       skill: "Melee Weapons", baseRange: "1m",    damage: "1d8",    armorPiercing: false, lethality: "",   killRadius: "",   ammo: 0   },
  // Less-Lethal
  { category: "Less-Lethal", name: "Taser X26",             skill: "Firearms", baseRange: "5m",    damage: "1d6",    armorPiercing: false, lethality: "",   killRadius: "",   ammo: 1   },
  { category: "Less-Lethal", name: "Pepper Spray",          skill: "Firearms", baseRange: "2m",    damage: "1d4",    armorPiercing: false, lethality: "",   killRadius: "1m", ammo: 1   },
];
// Seed ammoMax = ammo for every catalog entry (represents a full magazine/load)
GEAR_CATALOG.forEach(w => { w.ammoMax = w.ammo; });
export const GEAR_CATALOG_CATEGORIES = ["All", ...Array.from(new Set(GEAR_CATALOG.map(w => w.category)))];
