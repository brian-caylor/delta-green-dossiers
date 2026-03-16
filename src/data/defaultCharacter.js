import { DEFAULT_SKILLS } from "./defaultSkills";
import { EMPTY_WEAPON } from "./gearCatalog";

export function createNewCharacter() {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    kia: false,
    kiaDate: null,
    personal: { lastName: "", firstName: "", middleInitial: "", profession: "", employer: "", nationality: "", sex: "", age: "", dob: "", education: "" },
    stats: {
      str: { score: 10, features: "" }, con: { score: 10, features: "" }, dex: { score: 10, features: "" },
      int: { score: 10, features: "" }, pow: { score: 10, features: "" }, cha: { score: 10, features: "" },
    },
    derived: { hp: { max: 10, current: 10 }, wp: { max: 10, current: 10 }, san: { max: 50, current: 50 }, bp: { max: 40, current: 40 } },
    physicalDesc: "",
    bonds: [{ name: "", score: "", scoreMax: null }, { name: "", score: "", scoreMax: null }, { name: "", score: "", scoreMax: null }, { name: "", score: "", scoreMax: null }, { name: "", score: "", scoreMax: null }],
    motivations: "",
    mentalDisorders: "",
    sanLoss: { violence: [false, false, false], violenceAdapted: false, helplessness: [false, false, false], helplessnessAdapted: false },
    skills: DEFAULT_SKILLS.map(s => ({ ...s, value: s.base, failed: false })),
    otherSkills: [{ name: "", value: "" }, { name: "", value: "" }, { name: "", value: "" }, { name: "", value: "" }, { name: "", value: "" }, { name: "", value: "" }],
    wounds: "",
    firstAidAttempted: false,
    armorAndGear: "",
    weapons: [{ ...EMPTY_WEAPON }, { ...EMPTY_WEAPON }, { ...EMPTY_WEAPON }, { ...EMPTY_WEAPON }],
    personalNotes: "",
    homeFamily: "",
    specialTraining: [{ name: "", skillStat: "" }, { name: "", skillStat: "" }, { name: "", skillStat: "" }],
    recruitment: "",
    authorizingOfficer: "",
    sessionLog: [],
    unnaturalEncounters: [],
  };
}
