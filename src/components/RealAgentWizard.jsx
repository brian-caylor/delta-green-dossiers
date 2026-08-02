import { useMemo, useState } from "react";
import {
  STAT_QUESTIONS, PROFESSIONS, HOBBIES, CERTIFICATIONS,
  LANGUAGE_LEVELS, EDC_ITEMS,
} from "../data/realAgentQuestions";
import {
  buildRealCharacter, deriveAllStats, statTotal, normalizeToPool, STANDARD_POOL,
} from "../utils/realAgentDerivation";
import { calcHpMax, calcWpMax, calcSanMax } from "../utils/statDerivation";

const STEPS = ["Briefing", "Identity", "Body", "Mind", "History", "Life", "Review"];

// Which stats are assessed on which step.
const BODY_STATS = ["str", "con", "dex"];
const MIND_STATS = ["int", "pow", "cha"];

const STAT_LABELS = {
  str: "STRENGTH", con: "CONSTITUTION", dex: "DEXTERITY",
  int: "INTELLIGENCE", pow: "POWER", cha: "CHARISMA",
};

function Choice({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left", padding: "9px 12px", cursor: "pointer",
        border: `1px solid ${selected ? "var(--ink)" : "var(--line-2)"}`,
        background: selected ? "var(--ink)" : "transparent",
        color: selected ? "var(--paper)" : "var(--ink-2)",
        fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.35,
      }}
    >
      {children}
    </button>
  );
}

function Chip({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 11px", cursor: "pointer", fontSize: 12,
        fontFamily: "var(--font-sans)",
        border: `1px solid ${selected ? "var(--ink)" : "var(--line-2)"}`,
        background: selected ? "var(--ink)" : "transparent",
        color: selected ? "var(--paper)" : "var(--ink-2)",
      }}
    >
      {children}
    </button>
  );
}

function StatBlock({ statKey, questions, answers, onAnswer }) {
  return (
    <div style={{ border: "1px solid var(--line-2)", padding: "14px 16px" }}>
      <div className="handwritten" style={{ fontSize: 15, letterSpacing: 1.5, color: "var(--ink)", marginBottom: 10 }}>
        {STAT_LABELS[statKey]}
      </div>
      <div className="col" style={{ gap: 16 }}>
        {questions.map((q) => (
          <div key={q.id}>
            <div style={{ fontSize: 13, color: "var(--ink)", marginBottom: 7, lineHeight: 1.4 }}>
              {q.prompt}
              {!q.core && <span className="label" style={{ marginLeft: 8, fontStyle: "italic" }}>optional</span>}
            </div>
            <div className="col" style={{ gap: 3 }}>
              {q.options.map((o) => (
                <Choice key={o.label} selected={answers[q.id] === o.w} onClick={() => onAnswer(q.id, o.w)}>
                  {o.label}
                </Choice>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RealAgentWizard({ onCancel, onCreated, onCommit }) {
  const [step, setStep] = useState(0);
  const [deep, setDeep] = useState(false);
  const [normalize, setNormalize] = useState(false);

  const [identity, setIdentity] = useState({
    firstName: "", lastName: "", profession: "", employer: "",
    nationality: "", sex: "", age: "", education: "",
  });
  const [statAnswers, setStatAnswers] = useState({});
  const [professionId, setProfessionId] = useState("none");
  const [hobbyIds, setHobbyIds] = useState([]);
  const [certIds, setCertIds] = useState([]);
  const [languages, setLanguages] = useState([{ name: "", level: "convo" }]);
  const [bonds, setBonds] = useState([{ name: "" }, { name: "" }, { name: "" }, { name: "" }, { name: "" }]);
  const [motivations, setMotivations] = useState("");
  const [physicalDesc, setPhysicalDesc] = useState("");
  const [homeFamily, setHomeFamily] = useState("");
  const [edc, setEdc] = useState([]);
  const [edcNotes, setEdcNotes] = useState("");

  const answer = (id, w) => setStatAnswers((a) => ({ ...a, [id]: w }));
  const toggle = (list, setList, id) =>
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const questionsFor = (keys) =>
    STAT_QUESTIONS.filter((q) => keys.includes(q.stat) && (deep || q.core));

  const coreAnswered = (keys) =>
    STAT_QUESTIONS.filter((q) => keys.includes(q.stat) && q.core)
      .every((q) => typeof statAnswers[q.id] === "number");

  const honestStats = useMemo(() => deriveAllStats(statAnswers), [statAnswers]);
  const finalStats = useMemo(
    () => (normalize ? normalizeToPool(honestStats) : honestStats),
    [honestStats, normalize],
  );
  const honestTotal = statTotal(honestStats);

  const identityValid = identity.firstName.trim().length > 0 || identity.lastName.trim().length > 0;

  const canAdvance = () => {
    if (step === 1) return identityValid;
    if (step === 2) return coreAnswered(BODY_STATS);
    if (step === 3) return coreAnswered(MIND_STATS);
    return true;
  };

  const finalize = () => {
    const base = buildRealCharacter({
      identity, statAnswers, professionId, hobbyIds, certIds,
      languages, bonds, motivations, physicalDesc, homeFamily,
      edc, edcNotes, normalize,
    });
    onCommit(base);
    onCreated(base.id);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "32px 28px 80px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
          <div>
            <div className="label-lg" style={{ color: "var(--redact)", marginBottom: 6 }}>// SUBJECT ASSESSMENT</div>
            <h1 className="heading" style={{ fontSize: 26, margin: 0, letterSpacing: "0.12em" }}>PERSONNEL FILE</h1>
          </div>
          <button type="button" className="btn btn-sm btn-ghost" onClick={onCancel}>← CANCEL</button>
        </div>

        <div style={{ display: "flex", gap: 4, margin: "16px 0 24px" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 4, background: i <= step ? "var(--ink)" : "var(--line-2)", marginBottom: 6 }} />
              <div className="label" style={{ color: i === step ? "var(--ink)" : "var(--ink-3)", fontSize: 10 }}>
                {s.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {/* ─── 0. Briefing ─── */}
        {step === 0 && (
          <div className="col" style={{ gap: 16 }}>
            <div style={{ border: "1px solid var(--redact)", padding: "16px 18px" }}>
              <div className="handwritten" style={{ fontSize: 16, letterSpacing: 1.5, color: "var(--redact)", marginBottom: 10 }}>
                THIS FILE IS ABOUT YOU
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.65, color: "var(--ink-2)" }}>
                This assessment builds a dossier from your own answers rather than from a
                point pool. You will not be asked to rate yourself on any scale — the
                questions ask what you actually do, and the numbers are derived from that.
                <br /><br />
                Answer honestly. An accurate file is more interesting to play than a
                flattering one, and the results are usually humbling.
              </div>
            </div>

            <div className="col" style={{ gap: 6 }}>
              <div className="label">ASSESSMENT DEPTH</div>
              <Choice selected={!deep} onClick={() => setDeep(false)}>
                <strong>Quick pass</strong> — about fifteen questions. Produces a complete sheet.
              </Choice>
              <Choice selected={deep} onClick={() => setDeep(true)}>
                <strong>Full assessment</strong> — adds optional follow-ups to each section for a sharper result.
              </Choice>
            </div>

            <div className="label" style={{ fontStyle: "italic", lineHeight: 1.6 }}>
              Note: you will not be asked about mental health history, and the disorders
              section is left empty on purpose. That space is for what the campaign does
              to you, not what you brought with you.
            </div>
          </div>
        )}

        {/* ─── 1. Identity ─── */}
        {step === 1 && (
          <div className="col" style={{ gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="label">Last Name</label>
                <input className="field-line" autoFocus value={identity.lastName}
                  onChange={(e) => setIdentity((s) => ({ ...s, lastName: e.target.value }))} />
              </div>
              <div>
                <label className="label">First Name</label>
                <input className="field-line" value={identity.firstName}
                  onChange={(e) => setIdentity((s) => ({ ...s, firstName: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="label">What you actually do</label>
                <input className="field-line" value={identity.profession}
                  onChange={(e) => setIdentity((s) => ({ ...s, profession: e.target.value }))} />
              </div>
              <div>
                <label className="label">Employer</label>
                <input className="field-line" value={identity.employer}
                  onChange={(e) => setIdentity((s) => ({ ...s, employer: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px", gap: 12 }}>
              <div>
                <label className="label">Nationality</label>
                <input className="field-line" value={identity.nationality}
                  onChange={(e) => setIdentity((s) => ({ ...s, nationality: e.target.value }))} />
              </div>
              <div>
                <label className="label">Sex</label>
                <input className="field-line" value={identity.sex}
                  onChange={(e) => setIdentity((s) => ({ ...s, sex: e.target.value }))} />
              </div>
              <div>
                <label className="label">Age</label>
                <input className="field-line" value={identity.age}
                  onChange={(e) => setIdentity((s) => ({ ...s, age: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Education & Occupational History</label>
              <textarea className="field-box" rows={3} value={identity.education}
                onChange={(e) => setIdentity((s) => ({ ...s, education: e.target.value }))} />
            </div>
            {!identityValid && (
              <div className="label" style={{ color: "var(--redact)", fontStyle: "italic" }}>
                At least a first or last name is required.
              </div>
            )}
          </div>
        )}

        {/* ─── 2 & 3. Assessment ─── */}
        {(step === 2 || step === 3) && (
          <div className="col" style={{ gap: 14 }}>
            {(step === 2 ? BODY_STATS : MIND_STATS).map((key) => (
              <StatBlock
                key={key}
                statKey={key}
                questions={questionsFor([key])}
                answers={statAnswers}
                onAnswer={answer}
              />
            ))}
            {!canAdvance() && (
              <div className="label" style={{ color: "var(--redact)", fontStyle: "italic" }}>
                Answer the required questions in each block to continue.
              </div>
            )}
          </div>
        )}

        {/* ─── 4. History → skills ─── */}
        {step === 4 && (
          <div className="col" style={{ gap: 20 }}>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>WHICH IS CLOSEST TO YOUR WORK?</div>
              <div className="label" style={{ fontStyle: "italic", marginBottom: 8 }}>
                Current or former — whichever shaped you more. This sets most of your skills.
              </div>
              <div className="col" style={{ gap: 3 }}>
                {PROFESSIONS.map((p) => (
                  <Choice key={p.id} selected={professionId === p.id} onClick={() => setProfessionId(p.id)}>
                    {p.label}
                  </Choice>
                ))}
              </div>
            </div>

            <div>
              <div className="label" style={{ marginBottom: 6 }}>WHAT DO YOU ACTUALLY DO WITH YOUR TIME?</div>
              <div className="label" style={{ fontStyle: "italic", marginBottom: 8 }}>
                Select everything you genuinely do — this is where real people get interesting.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {HOBBIES.map((h) => (
                  <Chip key={h.id} selected={hobbyIds.includes(h.id)} onClick={() => toggle(hobbyIds, setHobbyIds, h.id)}>
                    {h.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <div className="label" style={{ marginBottom: 8 }}>LICENCES & CERTIFICATIONS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {CERTIFICATIONS.map((c) => (
                  <Chip key={c.id} selected={certIds.includes(c.id)} onClick={() => toggle(certIds, setCertIds, c.id)}>
                    {c.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <div className="label" style={{ marginBottom: 8 }}>LANGUAGES BESIDES YOUR FIRST</div>
              <div className="col" style={{ gap: 6 }}>
                {languages.map((l, i) => (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <input className="field-line" style={{ flex: 1 }} placeholder="e.g. Spanish"
                      value={l.name}
                      onChange={(e) => setLanguages((ls) => ls.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} />
                    <select className="field-line" style={{ width: 170 }} value={l.level}
                      onChange={(e) => setLanguages((ls) => ls.map((x, idx) => idx === i ? { ...x, level: e.target.value } : x))}>
                      {LANGUAGE_LEVELS.map((lv) => <option key={lv.id} value={lv.id}>{lv.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button type="button" className="btn btn-sm" style={{ marginTop: 8 }}
                onClick={() => setLanguages((ls) => [...ls, { name: "", level: "convo" }])}>
                + ADD LANGUAGE
              </button>
            </div>
          </div>
        )}

        {/* ─── 5. Life ─── */}
        {step === 5 && (
          <div className="col" style={{ gap: 20 }}>
            <div>
              <div className="label" style={{ marginBottom: 6 }}>BONDS</div>
              <div className="label" style={{ fontStyle: "italic", marginBottom: 8, lineHeight: 1.6 }}>
                Name up to five people whose loss would genuinely damage you. First names
                are enough. Each starts at your Charisma ({finalStats.cha}).
                <br />
                Then ask yourself which of them you would lie to, to keep them away from this.
              </div>
              <div className="col" style={{ gap: 6 }}>
                {bonds.map((b, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="label" style={{ width: 60 }}>BOND {i + 1}</span>
                    <input className="field-line" style={{ flex: 1 }} placeholder="e.g. Sarah — wife"
                      value={b.name}
                      onChange={(e) => setBonds((bs) => bs.map((x, idx) => idx === i ? { name: e.target.value } : x))} />
                    <span className="label" style={{ fontFamily: "var(--font-mono)" }}>
                      {b.name ? `${finalStats.cha} / ${finalStats.cha}` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="label">What do you actually care about?</label>
              <div className="label" style={{ fontStyle: "italic", marginBottom: 6 }}>
                What would you give something up for? What would you refuse to do, whatever the cost?
              </div>
              <textarea className="field-box" rows={3} value={motivations} onChange={(e) => setMotivations(e.target.value)} />
            </div>

            {deep && (
              <>
                <div>
                  <label className="label">Physical description</label>
                  <div className="label" style={{ fontStyle: "italic", marginBottom: 6 }}>
                    Build, height, hair, glasses, scars, tattoos — what a witness would report.
                  </div>
                  <textarea className="field-box" rows={2} value={physicalDesc} onChange={(e) => setPhysicalDesc(e.target.value)} />
                </div>
                <div>
                  <label className="label">Home & family</label>
                  <div className="label" style={{ fontStyle: "italic", marginBottom: 6 }}>
                    Who is at home, and what would they notice if you came back wrong. City is enough — no addresses.
                  </div>
                  <textarea className="field-box" rows={2} value={homeFamily} onChange={(e) => setHomeFamily(e.target.value)} />
                </div>
              </>
            )}

            <div>
              <div className="label" style={{ marginBottom: 6 }}>WHAT IS ON YOU RIGHT NOW?</div>
              <div className="label" style={{ fontStyle: "italic", marginBottom: 8 }}>
                Whatever you are carrying today is what you have when it starts.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                {EDC_ITEMS.map((item) => (
                  <Chip key={item} selected={edc.includes(item)} onClick={() => toggle(edc, setEdc, item)}>
                    {item}
                  </Chip>
                ))}
              </div>
              <input className="field-line" placeholder="Anything else you always have…"
                value={edcNotes} onChange={(e) => setEdcNotes(e.target.value)} />
            </div>
          </div>
        )}

        {/* ─── 6. Review ─── */}
        {step === 6 && (
          <div className="col" style={{ gap: 14 }}>
            <div className="label-lg">— ASSESSMENT COMPLETE —</div>

            <div style={{ border: "1px solid var(--line-2)", padding: "14px 16px" }}>
              <div className="handwritten" style={{ fontSize: 20, letterSpacing: 1, color: "var(--ink)" }}>
                {(identity.firstName + " " + identity.lastName).trim() || "(UNNAMED)"}
              </div>
              <div className="label" style={{ fontStyle: "italic", textTransform: "none", letterSpacing: 0, marginTop: 2 }}>
                {identity.profession || "No profession"} · {identity.nationality || "—"} · AGE {identity.age || "—"}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {Object.keys(STAT_LABELS).map((k) => (
                <div key={k} style={{ textAlign: "center", border: "1px solid var(--line-2)", padding: 8 }}>
                  <div className="label">{k.toUpperCase()}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>
                    {finalStats[k]}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {[
                { k: "HP", v: calcHpMax(finalStats.str, finalStats.con) },
                { k: "WP", v: calcWpMax(finalStats.pow) },
                { k: "SAN", v: calcSanMax(finalStats.pow, 0) },
                { k: "BP", v: calcSanMax(finalStats.pow, 0) - finalStats.pow },
              ].map((d) => (
                <div key={d.k} style={{ textAlign: "center", border: "1px solid var(--line-2)", padding: 8 }}>
                  <div className="label">{d.k}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{d.v}</div>
                </div>
              ))}
            </div>

            <div style={{ border: "1px solid var(--line-2)", padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span className="label">HONEST TOTAL</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: honestTotal < STANDARD_POOL ? "var(--redact)" : "var(--ok)" }}>
                  {honestTotal} / {STANDARD_POOL}
                </span>
              </div>
              <div className="label" style={{ fontStyle: "italic", lineHeight: 1.6, marginBottom: 8 }}>
                A commissioned agent is built on {STANDARD_POOL} points. You came out at {honestTotal}.
                {honestTotal < STANDARD_POOL
                  ? " That gap is the point — you are a person, not an operator."
                  : " Unusually capable for a civilian."}
              </div>
              <Choice selected={normalize} onClick={() => setNormalize(!normalize)}>
                Scale me up to {STANDARD_POOL} points, keeping the same shape
              </Choice>
            </div>

            <div className="label" style={{ fontStyle: "italic", lineHeight: 1.6 }}>
              Skills, bonds, languages and carried gear have been written to the sheet.
              The disorders section is intentionally blank.
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 28, paddingTop: 18, borderTop: "1px dashed var(--line-2)" }}>
          <button type="button" className="btn" onClick={() => step === 0 ? onCancel() : setStep((s) => s - 1)}>
            {step === 0 ? "← CANCEL" : "← BACK"}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary" disabled={!canAdvance()} onClick={() => setStep((s) => s + 1)}>
              NEXT →
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={finalize}>OPEN FILE</button>
          )}
        </div>
      </div>
    </div>
  );
}
