import { useRef, useState } from "react";
import { charName } from "../utils/textHelpers";
import { printDossier } from "../utils/printDossier";

function initialsOf(c) {
  const f = (c.personal?.firstName || "").trim();
  const l = (c.personal?.lastName || "").trim();
  const init = ((f[0] || "") + (l[0] || "")).toUpperCase();
  return init || "??";
}

function fmtDate(iso) {
  try { return new Date(iso).toISOString().slice(0, 10); }
  catch { return "—"; }
}

function DossierCard({ char: c, onOpen, onDuplicate, onBackup, onDelete }) {
  const isKIA = !!c.kia;
  const hp = c.derived?.hp || { current: 0, max: 0 };
  const wp = c.derived?.wp || { current: 0, max: 0 };
  const san = c.derived?.san || { current: 0, max: 0 };
  const bp = c.derived?.bp || { current: 0 };
  const sanPct = san.max > 0 ? Math.round((san.current / san.max) * 100) : 0;
  const caseNum = (c.id || "").slice(0, 8).toUpperCase();

  return (
    <div
      onClick={onOpen}
      style={{
        border: `1.5px solid ${isKIA ? "var(--redact)" : "var(--ink)"}`,
        background: isKIA ? "var(--redact-wash)" : "rgba(255,255,255,0.08)",
        padding: 14,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: 200,
      }}
    >
      <div className="flex-between label">
        <span>CASE № {caseNum}</span>
        <span style={{ color: isKIA ? "var(--redact)" : "var(--ok)" }}>● {isKIA ? "KIA" : "ACTIVE"}</span>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{
          width: 64, height: 80,
          border: "1.5px solid var(--ink)",
          background: "repeating-linear-gradient(135deg, var(--paper-2) 0 4px, var(--paper-3) 4px 8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18,
          letterSpacing: 2, color: "var(--ink)", flexShrink: 0,
          position: "relative",
        }}>
          {initialsOf(c)}
          {isKIA && <div style={{ position: "absolute", inset: 0, background: "rgba(140,29,29,0.25)", border: "3px solid var(--redact)" }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="label" style={{ marginBottom: 2 }}>AGENT</div>
          <div className="handwritten" style={{
            fontSize: 18, letterSpacing: 1, color: "var(--ink)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            textDecoration: isKIA ? "line-through" : undefined,
            textDecorationColor: isKIA ? "var(--redact)" : undefined,
          }}>
            {charName(c) || "(UNNAMED)"}
          </div>
          <div className="label" style={{ marginTop: 4, textTransform: "none", letterSpacing: 0.5, fontStyle: "italic" }}>
            {c.personal?.profession || "No profession"}
            {c.personal?.age ? ` · AGE ${c.personal.age}` : ""}
          </div>
        </div>
      </div>

      <hr className="divider" style={{ margin: "4px 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
        {[
          { label: "HP", cur: hp.current, max: hp.max, accent: "var(--redact)" },
          { label: "WP", cur: wp.current, max: wp.max, accent: "var(--stamp-blue)" },
          { label: "SAN", cur: san.current, max: san.max, accent: sanPct < 40 ? "var(--redact)" : "var(--ok)" },
          { label: "BP", cur: bp.current, max: null, accent: "var(--ink-2)" },
        ].map(s => (
          <div key={s.label}>
            <div className="label">{s.label}</div>
            <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "var(--font-mono)", color: s.accent }}>
              {s.cur}{s.max != null && <span className="label" style={{ fontSize: 10 }}>/{s.max}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-between" style={{ marginTop: "auto", paddingTop: 8 }}>
        <span className="label">UPDATED {fmtDate(c.updatedAt)}</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button type="button" className="btn btn-tiny btn-ghost" title="Duplicate"
            onClick={(e) => { e.stopPropagation(); onDuplicate(c.id); }}>⎘</button>
          <button type="button" className="btn btn-tiny btn-ghost" title="Print"
            onClick={(e) => { e.stopPropagation(); printDossier(c, false); }}>⎙</button>
          <button type="button" className="btn btn-tiny btn-ghost" title="Export JSON"
            onClick={(e) => { e.stopPropagation(); onBackup(c); }}>↓</button>
          <button type="button" className="btn btn-tiny btn-danger" title="Delete"
            onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}>✕</button>
        </div>
      </div>
    </div>
  );
}

export default function Roster({ characters, onOpen, onNew, onImport, onDuplicate, onBackup, onDelete }) {
  const fileInput = useRef(null);
  const [importMode, setImportMode] = useState(false);

  const active = characters.filter(c => !c.kia);
  const inactive = characters.filter(c => c.kia);

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px 80px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18, gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="label-lg" style={{ color: "var(--redact)", marginBottom: 6 }}>// TOP SECRET // NOFORN</div>
            <h1 className="heading" style={{ fontSize: 28, margin: 0, letterSpacing: "0.12em" }}>
              AGENT ROSTER
            </h1>
            <div className="label" style={{ marginTop: 6 }}>
              {characters.length} DOSSIER{characters.length === 1 ? "" : "S"} ON FILE
              {" · "}{active.length} ACTIVE
              {inactive.length > 0 && <> {" · "}<span style={{ color: "var(--redact)" }}>{inactive.length} KIA</span></>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onImport()}>↓ IMPORT</button>
            <button type="button" className="btn btn-primary" onClick={onNew}>+ NEW AGENT</button>
          </div>
        </div>

        <hr className="divider-double" />

        {characters.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px", border: "2px dashed var(--line-2)", marginTop: 40 }}>
            <div className="handwritten" style={{ fontSize: 40, fontWeight: 700, color: "var(--ink-3)", letterSpacing: 8, marginBottom: 12 }}>
              [ NO RECORDS ]
            </div>
            <div className="label" style={{ marginBottom: 24 }}>
              THIS FILING CABINET IS EMPTY. BEGIN BY INDUCTING A NEW AGENT.
            </div>
            <button type="button" className="btn btn-primary" onClick={onNew}>+ BEGIN INDUCTION</button>
          </div>
        )}

        {active.length > 0 && (
          <>
            <div className="label-lg" style={{ marginTop: 24, marginBottom: 14 }}>— ACTIVE PERSONNEL —</div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}>
              {active.map(c => (
                <DossierCard key={c.id} char={c}
                  onOpen={() => onOpen(c.id)}
                  onDuplicate={onDuplicate}
                  onBackup={onBackup}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </>
        )}

        {inactive.length > 0 && (
          <>
            <div className="label-lg" style={{ marginTop: 36, marginBottom: 14, color: "var(--redact)" }}>
              — CASUALTIES &amp; TERMINATED —
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
              opacity: 0.8,
            }}>
              {inactive.map(c => (
                <DossierCard key={c.id} char={c}
                  onOpen={() => onOpen(c.id)}
                  onDuplicate={onDuplicate}
                  onBackup={onBackup}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
