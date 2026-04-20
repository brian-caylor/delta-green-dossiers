import { useMemo, useState } from "react";
import { createNewCharacter } from "../data/defaultCharacter";
import { calcHpMax, calcWpMax, calcSanMax } from "../utils/statDerivation";

const STATS = [
  { key: "str", label: "STRENGTH", desc: "Physical power and carrying capacity" },
  { key: "con", label: "CONSTITUTION", desc: "Toughness and endurance" },
  { key: "dex", label: "DEXTERITY", desc: "Agility, reflexes, coordination" },
  { key: "int", label: "INTELLIGENCE", desc: "Learning, memory, reasoning" },
  { key: "pow", label: "POWER", desc: "Willpower and force of personality" },
  { key: "cha", label: "CHARISMA", desc: "Social presence and leadership" },
];

const STEPS = ["Identity", "Statistics", "Bonds", "Review"];

// Delta Green standard: 6 stats totaling ~72 points (roughly 4d6 each),
// or a 72-point pool with 8 minimum and 18 maximum.
const DEFAULT_STAT = 10;
const STAT_MIN = 8;
const STAT_MAX = 18;
const STAT_POOL = 72;

export default function Wizard({ onCancel, onCreated, onCommit }) {
  const [step, setStep] = useState(0);
  const [identity, setIdentity] = useState({
    firstName: "", lastName: "", profession: "", employer: "",
    nationality: "", sex: "", age: "", education: "",
  });
  const [stats, setStats] = useState({
    str: DEFAULT_STAT, con: DEFAULT_STAT, dex: DEFAULT_STAT,
    int: DEFAULT_STAT, pow: DEFAULT_STAT, cha: DEFAULT_STAT,
  });
  const [bonds, setBonds] = useState([{ name: "" }, { name: "" }, { name: "" }, { name: "" }]);

  const statTotal = useMemo(() => Object.values(stats).reduce((s, v) => s + (Number(v) || 0), 0), [stats]);
  const statsValid = statTotal === STAT_POOL;
  const identityValid = identity.firstName.trim().length > 0 || identity.lastName.trim().length > 0;

  const setStat = (key, raw) => {
    const v = raw === "" ? "" : Math.max(STAT_MIN, Math.min(STAT_MAX, Number(raw) || STAT_MIN));
    setStats(s => ({ ...s, [key]: v }));
  };

  const setBondName = (i, v) => setBonds(b => b.map((x, idx) => idx === i ? { ...x, name: v } : x));

  const finalize = () => {
    const base = createNewCharacter();
    // Identity
    base.personal = {
      ...base.personal,
      firstName: identity.firstName,
      lastName: identity.lastName,
      profession: identity.profession,
      employer: identity.employer,
      nationality: identity.nationality,
      sex: identity.sex,
      age: identity.age,
      education: identity.education,
    };
    // Stats
    base.stats = {
      str: { score: stats.str, features: "" },
      con: { score: stats.con, features: "" },
      dex: { score: stats.dex, features: "" },
      int: { score: stats.int, features: "" },
      pow: { score: stats.pow, features: "" },
      cha: { score: stats.cha, features: "" },
    };
    // Derived
    const hpMax = calcHpMax(stats.str, stats.con);
    const wpMax = calcWpMax(stats.pow);
    const sanMax = calcSanMax(stats.pow, 0);
    base.derived = {
      hp: { max: hpMax, current: hpMax },
      wp: { max: wpMax, current: wpMax },
      san: { max: sanMax, current: sanMax },
      bp: { max: sanMax - stats.pow, current: sanMax - stats.pow },
    };
    // Bonds — seeded with CHA per Delta Green starting rules
    base.bonds = bonds.map(b => ({
      name: b.name || "",
      score: b.name ? stats.cha : "",
      scoreMax: b.name ? stats.cha : null,
    }));
    // Pad to 5 slots to match existing schema.
    while (base.bonds.length < 5) base.bonds.push({ name: "", score: "", scoreMax: null });

    onCommit(base);
    onCreated(base.id);
  };

  const canAdvance = () => {
    if (step === 0) return identityValid;
    if (step === 1) return statsValid;
    return true;
  };

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 28px 80px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
          <div>
            <div className="label-lg" style={{ color: "var(--redact)", marginBottom: 6 }}>// AGENT INDUCTION</div>
            <h1 className="heading" style={{ fontSize: 26, margin: 0, letterSpacing: "0.12em" }}>NEW DOSSIER</h1>
          </div>
          <button type="button" className="btn btn-sm btn-ghost" onClick={onCancel}>← CANCEL</button>
        </div>

        <div style={{ display: "flex", gap: 4, margin: "16px 0 24px" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                height: 4,
                background: i <= step ? "var(--ink)" : "var(--line-2)",
                marginBottom: 6,
              }} />
              <div className="label" style={{ color: i === step ? "var(--ink)" : "var(--ink-3)" }}>
                {i + 1}. {s.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="col" style={{ gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="label">Last Name</label>
                <input className="field-line" autoFocus value={identity.lastName} onChange={e => setIdentity(s => ({ ...s, lastName: e.target.value }))} />
              </div>
              <div>
                <label className="label">First Name</label>
                <input className="field-line" value={identity.firstName} onChange={e => setIdentity(s => ({ ...s, firstName: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="label">Profession (Rank if applicable)</label>
                <input className="field-line" value={identity.profession} onChange={e => setIdentity(s => ({ ...s, profession: e.target.value }))} />
              </div>
              <div>
                <label className="label">Employer</label>
                <input className="field-line" value={identity.employer} onChange={e => setIdentity(s => ({ ...s, employer: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: 12 }}>
              <div>
                <label className="label">Nationality</label>
                <input className="field-line" value={identity.nationality} onChange={e => setIdentity(s => ({ ...s, nationality: e.target.value }))} />
              </div>
              <div>
                <label className="label">Sex</label>
                <input className="field-line" value={identity.sex} onChange={e => setIdentity(s => ({ ...s, sex: e.target.value }))} />
              </div>
              <div>
                <label className="label">Age</label>
                <input className="field-line" value={identity.age} onChange={e => setIdentity(s => ({ ...s, age: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Education & Occupational History</label>
              <textarea className="field-box" rows={3} value={identity.education} onChange={e => setIdentity(s => ({ ...s, education: e.target.value }))} />
            </div>
            {!identityValid && (
              <div className="label" style={{ color: "var(--redact)", fontStyle: "italic" }}>
                At least a first or last name is required.
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="col" style={{ gap: 10 }}>
            <div style={{ padding: "10px 14px", border: "1px solid var(--line-2)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span className="label">POINT POOL</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: statsValid ? "var(--ok)" : "var(--redact)" }}>
                {statTotal} / {STAT_POOL}
              </span>
              <span className="label" style={{ fontStyle: "italic" }}>
                each stat {STAT_MIN}–{STAT_MAX}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              {STATS.map(s => (
                <div key={s.key} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  border: "1px solid var(--line-2)",
                }}>
                  <div style={{ flex: 1 }}>
                    <div className="handwritten" style={{ fontSize: 14, letterSpacing: 1, color: "var(--ink)" }}>{s.label}</div>
                    <div className="label" style={{ fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>{s.desc}</div>
                  </div>
                  <input type="number" min={STAT_MIN} max={STAT_MAX} className="field-num" style={{ width: 60 }}
                    value={stats[s.key]} onChange={e => setStat(s.key, e.target.value)} />
                </div>
              ))}
            </div>
            {!statsValid && (
              <div className="label" style={{ color: "var(--redact)", fontStyle: "italic" }}>
                Spend exactly {STAT_POOL} points across the six stats to continue.
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="col" style={{ gap: 10 }}>
            <div className="label" style={{ fontStyle: "italic", marginBottom: 4 }}>
              Starting bonds cover the people, places, or communities that hold this agent together.
              Each bond begins at your Charisma score ({stats.cha}). Name as many as feel right — you can add more later.
            </div>
            {bonds.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className="label" style={{ width: 60 }}>BOND {i + 1}</span>
                <input className="field-line" style={{ flex: 1 }} placeholder="e.g. Mother — Marline Monroe"
                  value={b.name} onChange={e => setBondName(i, e.target.value)} />
                <span className="label" style={{ fontFamily: "var(--font-mono)" }}>
                  {b.name ? `${stats.cha} / ${stats.cha}` : "—"}
                </span>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="col" style={{ gap: 14 }}>
            <div className="label-lg">— REVIEW —</div>
            <div style={{ border: "1px solid var(--line-2)", padding: "14px 16px" }}>
              <div className="handwritten" style={{ fontSize: 20, letterSpacing: 1, color: "var(--ink)" }}>
                {(identity.firstName + " " + identity.lastName).trim() || "(UNNAMED)"}
              </div>
              <div className="label" style={{ fontStyle: "italic", textTransform: "none", letterSpacing: 0, marginTop: 2 }}>
                {identity.profession || "No profession"} · {identity.nationality || "—"} · AGE {identity.age || "—"}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {STATS.map(s => (
                <div key={s.key} style={{ textAlign: "center", border: "1px solid var(--line-2)", padding: 8 }}>
                  <div className="label">{s.key.toUpperCase()}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{stats[s.key]}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {[
                { k: "HP", v: calcHpMax(stats.str, stats.con) },
                { k: "WP", v: calcWpMax(stats.pow) },
                { k: "SAN", v: calcSanMax(stats.pow, 0) },
                { k: "BP", v: calcSanMax(stats.pow, 0) - stats.pow },
              ].map(d => (
                <div key={d.k} style={{ textAlign: "center", border: "1px solid var(--line-2)", padding: 8 }}>
                  <div className="label">{d.k}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{d.v}</div>
                </div>
              ))}
            </div>
            <div className="label-lg">BONDS</div>
            <div className="col" style={{ gap: 4 }}>
              {bonds.filter(b => b.name).length === 0 && <div className="label" style={{ fontStyle: "italic" }}>None specified. You can add them on the sheet.</div>}
              {bonds.filter(b => b.name).map((b, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", border: "1px solid var(--line-2)" }}>
                  <span style={{ fontFamily: "var(--font-hand)", fontSize: 14 }}>{b.name}</span>
                  <span className="label" style={{ fontFamily: "var(--font-mono)" }}>{stats.cha} / {stats.cha}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 28, paddingTop: 18, borderTop: "1px dashed var(--line-2)" }}>
          <button type="button" className="btn" onClick={() => step === 0 ? onCancel() : setStep(s => s - 1)}>
            {step === 0 ? "← CANCEL" : "← BACK"}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary" disabled={!canAdvance()} onClick={() => setStep(s => s + 1)}>
              NEXT →
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={finalize}>COMMISSION AGENT</button>
          )}
        </div>
      </div>
    </div>
  );
}
