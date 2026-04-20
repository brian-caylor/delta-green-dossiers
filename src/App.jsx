import { useState, useCallback } from "react";
import "./App.css";
import { useMediaQuery } from "./hooks/useMediaQuery";

// ─── Data ───
import { createNewCharacter } from "./data/defaultCharacter";

// ─── Utilities ───
import { printDossier } from "./utils/printDossier";
import { charName } from "./utils/textHelpers";
import { calcSanMax } from "./utils/statDerivation";
import { newId } from "./utils/uuid.js";

// ─── Hooks ───
import { useCharacters } from "./hooks/useCharacters";
import { useModals } from "./hooks/useModals";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useImport } from "./hooks/useImport";
import { usePwaInstall } from "./hooks/usePwaInstall";

// ─── UI Components ───
import { KIABanner, TopBar } from "./components/ui";

// ─── Tab Panels ───
import { PersonalTab, StatsTab, SkillsTab, CombatTab, NotesTab } from "./components/tabs";

// ─── Modals ───
import { ImportReviewModal, SessionEndModal, SanEventModal, SanProjectionModal, UnnaturalAddForm, GearCatalogModal, ImportChoiceModal } from "./components/modals";

// ─── Auth ───
import { useAuth } from "./hooks/useAuth.js";
import LoginScreen from "./components/LoginScreen.jsx";

// ─── Main entry: auth gate, then dossier app ───
export default function App() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#1A1D16", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#8BA069", fontFamily: "'Special Elite', cursive", fontSize: 18, letterSpacing: 4 }}>
        ACCESSING CLASSIFIED FILES...
      </div>
    </div>
  );
  if (!user) return <LoginScreen />;
  return <DossierApp />;
}

function DossierApp() {
  const [tab, setTab] = useState("stats");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showRedactions, setShowRedactions] = useState(true);

  // ─── Custom hooks ───
  const {
    characters, setCharacters,
    activeId, setActiveId,
    loaded,
    activeChar,
    storageError, setStorageError,
    updateChar, addLogEntry,
  } = useCharacters();

  const modals = useModals();
  const {
    kiaConfirmOpen, setKiaConfirmOpen,
    confirmDialog, setConfirmDialog,
    clearLogOpen, setClearLogOpen,
    sessionReport, setSessionReport,
    sanProjectionOpen, setSanProjectionOpen,
    sanEventOpen, setSanEventOpen,
    sanEventData, setSanEventData,
    importChoiceOpen, setImportChoiceOpen,
    gearCatalogOpen, setGearCatalogOpen,
  } = modals;

  const {
    dragState, weaponDragState,
    handleDragStart, handleDragEnd, handleDragOver, handleDrop,
    handleWeaponDragStart, handleWeaponDragEnd, handleWeaponDragOver, handleWeaponDrop,
  } = useDragAndDrop(setCharacters, updateChar);

  const {
    importState, setImportState,
    pendingImport, setPendingImport,
    fileInputRef, jsonInputRef,
    handleFileSelect, handleConfirmImport, handleJsonImport,
    backupCharacter,
  } = useImport(setCharacters, setActiveId, setTab, setConfirmDialog);

  const { canInstall, triggerInstall, dismiss: dismissInstall } = usePwaInstall();
  const isMobile = useMediaQuery("(max-width: 700px)");

  // ─── Derived state ───
  const isKIA = activeChar?.kia || false;
  const isRedacted = isKIA && showRedactions;
  const isLocked = isKIA;

  // ─── Game mechanics handlers ───
  const addCharacter = () => {
    const c = createNewCharacter();
    setCharacters(prev => [...prev, c]);
    setActiveId(c.id);
    setTab("personal");
  };

  const deleteCharacter = (id) => {
    const c = characters.find(ch => ch.id === id);
    setConfirmDialog({
      title: "DELETE DOSSIER",
      message: `Permanently delete the dossier for ${c ? charName(c) : "this agent"}? This action cannot be undone.`,
      danger: true,
      confirmLabel: "DELETE",
      onConfirm: () => {
        setCharacters(prev => {
          const next = prev.filter(ch => ch.id !== id);
          if (activeId === id) setActiveId(next[0]?.id || null);
          return next;
        });
        setConfirmDialog(null);
      }
    });
  };

  const duplicateCharacter = (id) => {
    const src = characters.find(c => c.id === id);
    if (!src) return;
    const dup = { ...JSON.parse(JSON.stringify(src)), id: newId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    dup.personal.lastName = dup.personal.lastName + " (Copy)";
    dup.kia = false; dup.kiaDate = null;
    setCharacters(prev => [...prev, dup]);
    setActiveId(dup.id);
  };

  const markKIA = () => {
    updateChar(c => ({ ...c, kia: true, kiaDate: new Date().toISOString() }));
    addLogEntry("K.I.A.", null, null, "kia");
    setShowRedactions(true);
    setKiaConfirmOpen(null);
  };

  const handleSanProjection = ({ roll, sanDamage, bondIndex }) => {
    if (!activeChar) return;
    const bond = activeChar.bonds[bondIndex];
    const bondName = bond?.name || `Bond ${bondIndex + 1}`;
    const oldBondScore = Number(bond?.score) || 0;
    const newBondScore = Math.max(0, oldBondScore - roll);
    const actualSanLost = Math.max(0, sanDamage - roll);
    const oldWp = Number(activeChar.derived.wp.current) || 0;
    const newWp = Math.max(0, oldWp - roll);
    const oldSan = Number(activeChar.derived.san.current) || 0;
    const newSan = Math.max(0, oldSan - actualSanLost);

    updateChar(c => {
      const bonds = [...c.bonds];
      bonds[bondIndex] = { ...bonds[bondIndex], score: newBondScore };
      return {
        ...c,
        bonds,
        derived: {
          ...c.derived,
          wp: { ...c.derived.wp, current: newWp },
          san: { ...c.derived.san, current: newSan },
        },
      };
    });

    addLogEntry(
      `Projected onto ${bondName}: SAN −${actualSanLost}, WP −${roll}, Bond ${oldBondScore}→${newBondScore}`,
      null, null, "bond"
    );
    setSanProjectionOpen(false);
  };

  const handleSanEvent = ({ category, reaction, repressWpSpent, repressBondIndex, bpTriggered, newBp, adaptationCleared, adaptationBoxChecked, justAdapted, permanentInsanity, disorder }) => {
    if (!activeChar) return;
    const catKey = category === "violence" ? "violence" : category === "helplessness" ? "helplessness" : null;

    updateChar(c => {
      let updated = { ...c };

      if (reaction === "repressed" && repressWpSpent != null && repressBondIndex != null) {
        const newWp = Math.max(0, (Number(c.derived.wp.current) || 0) - repressWpSpent);
        const bonds = [...c.bonds];
        const oldBond = bonds[repressBondIndex];
        bonds[repressBondIndex] = { ...oldBond, score: Math.max(0, (Number(oldBond.score) || 0) - repressWpSpent) };
        updated = { ...updated, bonds, derived: { ...updated.derived, wp: { ...updated.derived.wp, current: newWp } } };
      }

      if (bpTriggered && newBp != null) {
        updated = { ...updated, derived: { ...updated.derived, bp: { ...updated.derived.bp, current: newBp, max: newBp } } };
      }

      if (disorder) {
        const existing = (c.mentalDisorders || "").trim();
        const entry = `[DISORDER] ${disorder}`;
        updated = { ...updated, mentalDisorders: existing ? existing + "\n" + entry : entry };
      }

      if (catKey) {
        const sanLoss = { ...c.sanLoss };
        if (adaptationCleared) {
          sanLoss[catKey] = [false, false, false];
        } else if (adaptationBoxChecked) {
          const boxes = [...c.sanLoss[catKey]];
          const nextIdx = boxes.indexOf(false);
          if (nextIdx !== -1) boxes[nextIdx] = true;
          sanLoss[catKey] = boxes;
        }
        if (justAdapted) {
          sanLoss[`${catKey}Adapted`] = true;
          sanLoss[catKey] = [true, true, true];
        }
        updated = { ...updated, sanLoss };
      }

      // Track temporary insanity status
      if (reaction && reaction !== "repressed") {
        updated = { ...updated, tempInsanity: { active: true, reaction, since: new Date().toISOString() } };
      }

      return updated;
    });

    if (reaction === "repressed" && repressWpSpent != null && repressBondIndex != null) {
      const bondName = activeChar.bonds[repressBondIndex]?.name || `Bond ${repressBondIndex + 1}`;
      addLogEntry(`Repressed temporary insanity: WP −${repressWpSpent}, ${bondName} −${repressWpSpent}`, null, null, "san");
    } else if (reaction && reaction !== "repressed") {
      addLogEntry(`Temporary insanity: ${reaction.toUpperCase()} reaction`, null, null, "san");
    }
    if (bpTriggered) {
      addLogEntry(`Breaking Point reached (${category}) — new BP: ${newBp}`, null, null, "san");
    }
    if (disorder) {
      addLogEntry(`Disorder noted: ${disorder}`, null, null, "san");
    }
    if (justAdapted) {
      addLogEntry(`Adapted to ${category} — apply 1d6 stat loss manually`, null, null, "san");
    }
    if (permanentInsanity) {
      addLogEntry("Permanent insanity — SAN reached 0", null, null, "san");
    }

    setSanEventOpen(false);
    setSanEventData(null);
  };

  const clearTempInsanity = useCallback(() => {
    updateChar(c => ({ ...c, tempInsanity: null }));
    addLogEntry("Temporary insanity cleared", null, null, "san");
  }, [updateChar, addLogEntry]);

  const reviveAgent = () => {
    setConfirmDialog({
      title: "REVIVE AGENT",
      message: "Restore this agent to active duty? This will remove KIA status and unlock the dossier.",
      danger: false,
      confirmLabel: "REVIVE",
      onConfirm: () => {
        updateChar(c => ({ ...c, kia: false, kiaDate: null }));
        setConfirmDialog(null);
      }
    });
  };

  const [missionEndConfirm, setMissionEndConfirm] = useState(false);

  const handleMissionEnd = () => {
    if (!activeChar || isLocked) return;

    const failedSkills = activeChar.skills
      .map((skill, i) => ({ skill, i }))
      .filter(({ skill }) => skill.failed && skill.name !== "Unnatural");

    if (failedSkills.length === 0) {
      setSessionReport({ gains: [], noneChecked: true });
      return;
    }

    // Show confirmation before rolling
    setMissionEndConfirm(true);
  };

  const confirmMissionEnd = () => {
    setMissionEndConfirm(false);

    const failedSkills = activeChar.skills
      .map((skill, i) => ({ skill, i }))
      .filter(({ skill }) => skill.failed && skill.name !== "Unnatural");

    const gains = [];
    const updatedSkills = [...activeChar.skills];

    for (const { skill, i } of failedSkills) {
      const roll = Math.floor(Math.random() * 4) + 1;
      const from = Number(skill.value) || 0;
      const to = Math.min(99, from + roll);
      updatedSkills[i] = { ...updatedSkills[i], value: to, failed: false };
      gains.push({ name: skill.name + (skill.hasSpec && skill.spec ? ` (${skill.spec})` : ""), roll, from, to });
    }

    updateChar(c => ({ ...c, skills: updatedSkills }));
    for (const g of gains) {
      addLogEntry(`${g.name} ${g.from}→${g.to}`, g.from, g.to, "advancement");
    }
    setSessionReport({ gains, noneChecked: false });
  };

  const handleUnnaturalChange = useCallback((updatedEncounters) => {
    const newTotal = updatedEncounters.reduce((sum, e) => sum + (Number(e.pts) || 0), 0);
    const oldTotal = (activeChar.unnaturalEncounters || []).reduce((sum, e) => sum + (Number(e.pts) || 0), 0);
    const pow = Number(activeChar.stats.pow.score) || 0;
    const newSanMax = calcSanMax(pow, newTotal);
    const currentSan = Number(activeChar.derived.san.current) || 0;
    const newSanCurrent = Math.min(currentSan, newSanMax);

    updateChar(c => ({
      ...c,
      unnaturalEncounters: updatedEncounters,
      skills: c.skills.map(sk => sk.name === "Unnatural" ? { ...sk, value: newTotal } : sk),
      derived: { ...c.derived, san: { ...c.derived.san, max: newSanMax, current: newSanCurrent } },
    }));

    if (oldTotal !== newTotal) {
      const oldSanMax = calcSanMax(pow, oldTotal);
      addLogEntry(
        `Unnatural: ${oldTotal}→${newTotal} | SAN max: ${oldSanMax}→${newSanMax}`,
        oldTotal, newTotal, "unnatural"
      );
      if (currentSan > newSanMax) {
        addLogEntry(`SAN capped at new max: ${currentSan}→${newSanMax}`, currentSan, newSanMax, "unnatural");
      }
    }
  }, [activeChar, updateChar, addLogEntry]);

  // ─── Loading screen ───
  if (!loaded) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="handwritten" style={{ fontSize: 18, letterSpacing: 4, color: "var(--ink-3)" }}>
        ACCESSING CLASSIFIED FILES...
      </div>
    </div>
  );

  const TABS = [
    { id: "personal", label: "PERSONAL", icon: "▪" },
    { id: "stats", label: "STATS", icon: "▲" },
    { id: "skills", label: "SKILLS", icon: "◆" },
    { id: "combat", label: "COMBAT", icon: "✦" },
    { id: "notes", label: "NOTES", icon: "●" },
  ];

  return (
    <div style={{ minHeight: "100vh", width: "100%", color: "#D4D8C8", fontFamily: "'IBM Plex Sans', sans-serif", background: "#1A1D16", display: "flex", flexDirection: "column" }}>
      <TopBar />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

      {/* Hidden file input for PDF import */}
      <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileSelect} style={{ display: "none" }} />
      <input type="file" ref={jsonInputRef} accept=".json" onChange={handleJsonImport} style={{ display: "none" }} />

      {/* Storage Error Banner */}
      {storageError && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "8px 16px", background: "rgba(180,80,40,0.95)", color: "#FFF", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif" }}>
          <span style={{ flex: 1 }}>{storageError}</span>
          <button onClick={() => setStorageError(null)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 3, color: "#FFF", cursor: "pointer", padding: "2px 10px", fontSize: 12 }}>Dismiss</button>
        </div>
      )}

      {/* PWA Install Banner */}
      {canInstall && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9998,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          padding: "10px 16px",
          background: "rgba(30,60,40,0.97)", borderTop: "1px solid rgba(100,180,100,0.3)",
          color: "#D4D8C8", fontSize: 13, fontFamily: "'IBM Plex Sans', sans-serif",
          backdropFilter: "blur(8px)",
        }}>
          <span style={{ flex: 1 }}>📲 Install <strong>Agent Dossiers</strong> for offline access — works without internet.</span>
          <button
            onClick={triggerInstall}
            style={{
              background: "#4A7A3D", border: "none", borderRadius: 4,
              color: "#FFF", cursor: "pointer", padding: "5px 14px",
              fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
            }}
          >
            Install
          </button>
          <button
            onClick={dismissInstall}
            style={{
              background: "none", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 4,
              color: "#AAA", cursor: "pointer", padding: "4px 10px", fontSize: 12,
            }}
          >
            Maybe later
          </button>
        </div>
      )}

      {/* Mission End Confirmation */}
      {missionEndConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20, animation: "fadeIn 0.2s ease" }}>
          <div style={{ background: "#1A1D16", border: "1px solid rgba(139,160,105,0.35)", borderRadius: 8, width: "min(440px, 92vw)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)", padding: "24px" }}>
            <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 18, letterSpacing: 4, color: "#8BA069", marginBottom: 12 }}>
              END MISSION?
            </div>
            <div style={{ fontSize: 13, color: "#A0AA90", lineHeight: 1.7, marginBottom: 8 }}>
              This will roll <strong style={{ color: "#D4D8C8" }}>1d4 advancement</strong> for each failed skill and clear all checkboxes.
            </div>
            <div style={{ fontSize: 12, color: "#7A8A60", lineHeight: 1.6, marginBottom: 20, padding: "10px 12px", background: "rgba(139,160,105,0.06)", borderRadius: 4, border: "1px solid rgba(139,160,105,0.12)" }}>
              In Delta Green, skill advancement happens at the <em>end of the operation</em> — not after each individual session. Only confirm if the current mission is complete.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setMissionEndConfirm(false)} style={{ padding: "8px 20px", letterSpacing: 2 }}>
                CANCEL
              </button>
              <button className="btn" onClick={confirmMissionEnd} style={{ padding: "8px 20px", letterSpacing: 2, borderColor: "rgba(100,160,220,0.45)", background: "rgba(100,160,220,0.1)", color: "#7AAAD4" }}>
                CONFIRM — ROLL ADVANCEMENT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mission Debrief Report Modal */}
      {sessionReport && (
        <SessionEndModal report={sessionReport} onClose={() => setSessionReport(null)} />
      )}

      {/* SAN Event Modal */}
      {sanEventOpen && activeChar && sanEventData && (
        <SanEventModal
          char={activeChar}
          eventData={sanEventData}
          onApply={handleSanEvent}
          onClose={() => { setSanEventOpen(false); setSanEventData(null); }}
        />
      )}

      {/* SAN Projection Modal */}
      {sanProjectionOpen && activeChar && (
        <SanProjectionModal
          char={activeChar}
          onApply={handleSanProjection}
          onClose={() => setSanProjectionOpen(false)}
        />
      )}

      {/* Gear Catalog Modal */}
      {gearCatalogOpen && (
        <GearCatalogModal
          onAdd={(weapon) => {
            const { category, ...weaponData } = weapon;
            updateChar(c => {
              const weapons = [...c.weapons];
              const emptyIdx = weapons.findIndex(w => !w.name && !w.skill && !w.damage);
              if (emptyIdx !== -1) {
                weapons[emptyIdx] = { ...weaponData };
              } else {
                weapons.push({ ...weaponData });
              }
              return { ...c, weapons };
            });
            setGearCatalogOpen(false);
          }}
          onClose={() => setGearCatalogOpen(false)}
        />
      )}

      {/* Import Choice Modal */}
      {importChoiceOpen && (
        <ImportChoiceModal
          onPdf={() => { setImportChoiceOpen(false); fileInputRef.current?.click(); }}
          onJson={() => { setImportChoiceOpen(false); jsonInputRef.current?.click(); }}
          onClose={() => setImportChoiceOpen(false)}
        />
      )}

      {/* Import Review Modal */}
      {pendingImport && (
        <ImportReviewModal
          parsed={pendingImport}
          onConfirm={handleConfirmImport}
          onCancel={() => setPendingImport(null)}
        />
      )}

      {/* Import Progress Overlay */}
      {importState.active && (
        <div className="confirm-overlay" style={{ zIndex: 300 }} onClick={() => importState.phase === "error" ? setImportState({ active: false, status: "", phase: "", error: null }) : null}>
          <div className="confirm-box" onClick={e => e.stopPropagation()} style={{ borderColor: importState.phase === "error" ? "rgba(180,50,50,0.4)" : "rgba(139,160,105,0.3)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>
              {importState.phase === "reading" && "📄"}
              {importState.phase === "analyzing" && "🔍"}
              {importState.phase === "building" && "📋"}
              {importState.phase === "error" && "⚠️"}
            </div>
            <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 16, letterSpacing: 3, marginBottom: 8, color: importState.phase === "error" ? "#C44040" : "#8BA069" }}>
              {importState.phase === "error" ? "IMPORT FAILED" : "IMPORTING DOSSIER"}
            </div>
            <div style={{ fontSize: 13, color: "#A0A890", lineHeight: 1.6, marginBottom: 16 }}>{importState.status}</div>
            {(importState.phase === "reading" || importState.phase === "analyzing" || importState.phase === "building") && (
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 16 }}>
                <div style={{
                  height: "100%", borderRadius: 2, background: "#8BA069",
                  animation: "importProgress 2s ease-in-out infinite",
                  width: importState.phase === "reading" ? "30%" : importState.phase === "analyzing" ? "65%" : "90%",
                  transition: "width 0.5s ease",
                }} />
              </div>
            )}
            {importState.phase === "error" && (
              <button className="btn" onClick={() => setImportState({ active: false, status: "", phase: "", error: null })}>DISMISS</button>
            )}
          </div>
        </div>
      )}

      {/* KIA Background Stamp */}
      {isKIA && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            fontFamily: "'Special Elite', cursive", fontSize: 160, fontWeight: 400,
            color: "rgba(180, 50, 50, 0.06)", letterSpacing: 30,
            transform: "rotate(-18deg)", userSelect: "none",
            textShadow: "0 0 40px rgba(180,50,50,0.04)",
          }}>K.I.A.</div>
        </div>
      )}

      {/* KIA Confirmation Dialog */}
      {kiaConfirmOpen && (
        <div className="confirm-overlay" onClick={() => setKiaConfirmOpen(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <div style={{
              fontFamily: "'Special Elite', cursive", fontSize: 36, color: "#C44040",
              letterSpacing: 8, marginBottom: 6,
              textShadow: "0 0 20px rgba(180,40,40,0.25)",
            }}>K.I.A.</div>
            <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 11, color: "#884040", letterSpacing: 3, marginBottom: 20 }}>
              AGENT CASUALTY REPORT — DELTA GREEN
            </div>
            {kiaConfirmOpen === "hp" ? (
              <>
                <div style={{ fontSize: 13, color: "#C8A080", lineHeight: 1.7, marginBottom: 10, fontStyle: "italic" }}>
                  "This operative has sustained wounds incompatible with continued field activity.
                  Command has been notified. The Program extends its condolences."
                </div>
                <div style={{ fontSize: 12, color: "#A0A890", lineHeight: 1.6, marginBottom: 6 }}>
                  <span style={{ color: "#D4D8C8", fontWeight: 500 }}>{activeChar ? charName(activeChar) : ""}</span> has fallen in the line of duty.
                  Mark this dossier as Killed in Action?
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: "#A0A890", lineHeight: 1.7, marginBottom: 10 }}>
                  Confirm the loss of <span style={{ color: "#D4D8C8", fontWeight: 500 }}>{activeChar ? charName(activeChar) : ""}</span> and close their field file.
                </div>
                <div style={{ fontSize: 12, color: "#7A8A60", lineHeight: 1.6, marginBottom: 6 }}>
                  "Agents of Delta Green accept that some operations end only one way.
                  Their sacrifice is noted — and buried."
                </div>
              </>
            )}
            <div style={{ fontSize: 11, color: "#5A6A40", lineHeight: 1.5, marginBottom: 24, fontStyle: "italic" }}>
              The dossier will be archived with sensitive details redacted.
              You may declassify or reinstate the agent at any time.
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="btn" onClick={() => setKiaConfirmOpen(null)} style={{ letterSpacing: 2 }}>
                NO — STAND DOWN
              </button>
              <button className="btn btn-kia" onClick={markKIA} style={{ padding: "10px 24px", letterSpacing: 2 }}>
                YES — MARK K.I.A.
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Confirm Dialog */}
      {confirmDialog && (
        <div className="confirm-overlay" onClick={() => setConfirmDialog(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}
            style={{ borderColor: confirmDialog.danger ? "rgba(180,50,50,0.3)" : "rgba(80,160,80,0.3)" }}>
            <div style={{
              fontFamily: "'Special Elite', cursive", fontSize: 20, letterSpacing: 4, marginBottom: 16,
              color: confirmDialog.danger ? "#C44040" : "#60A060"
            }}>{confirmDialog.title}</div>
            <div style={{ fontSize: 13, color: "#A0A890", lineHeight: 1.6, marginBottom: 24 }}>{confirmDialog.message}</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="btn" onClick={() => setConfirmDialog(null)}>CANCEL</button>
              <button className={`btn ${confirmDialog.danger ? "btn-danger" : ""}`}
                onClick={confirmDialog.onConfirm}
                style={confirmDialog.danger ? {} : { borderColor: "rgba(80,140,80,0.4)", background: "rgba(80,140,80,0.12)", color: "#60A060" }}>
                {confirmDialog.confirmLabel || "CONFIRM"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Session Log Confirm Dialog */}
      {clearLogOpen && (
        <div className="confirm-overlay" onClick={() => setClearLogOpen(false)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()} style={{ borderColor: "rgba(180,80,80,0.35)" }}>
            <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 18, letterSpacing: 4, marginBottom: 12, color: "#C44040" }}>CLEAR SESSION LOG</div>
            <div style={{ fontSize: 13, color: "#A0A890", lineHeight: 1.6, marginBottom: 8 }}>
              Permanently erase all session log entries for <span style={{ color: "#D4D8C8", fontWeight: 500 }}>{activeChar ? charName(activeChar) : ""}</span>?
            </div>
            <div style={{ fontSize: 11, color: "#5A6A40", fontStyle: "italic", marginBottom: 24, lineHeight: 1.5 }}>
              This action cannot be undone. Stat changes, skill advancements, and events will be permanently deleted.
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button className="btn" onClick={() => setClearLogOpen(false)}>CANCEL</button>
              <button className="btn btn-danger" onClick={() => { updateChar(c => ({ ...c, sessionLog: [] })); setClearLogOpen(false); }} style={{ letterSpacing: 2 }}>
                CLEAR LOG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Mobile sidebar overlay backdrop ─── */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 49, animation: "fadeIn 0.2s ease" }} />
      )}

      {/* ─── Mobile floating hamburger button ─── */}
      {isMobile && !sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} style={{
          position: "fixed", top: 10, left: 10, zIndex: 50,
          width: 40, height: 40, borderRadius: 8,
          background: "rgba(22,25,19,0.95)", border: "1px solid rgba(139,160,105,0.3)",
          color: "#8BA069", fontSize: 20, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)", backdropFilter: "blur(8px)",
        }}>☰</button>
      )}

      {/* ─── Sidebar ─── */}
      <div style={{
        width: isMobile ? (sidebarOpen ? "85vw" : 0) : (sidebarOpen ? 280 : 52),
        minWidth: isMobile ? (sidebarOpen ? "85vw" : 0) : (sidebarOpen ? 280 : 52),
        maxWidth: isMobile ? 340 : undefined,
        background: "#161913",
        borderRight: isMobile && !sidebarOpen ? "none" : "1px solid rgba(139,160,105,0.15)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s, min-width 0.3s",
        overflow: "hidden",
        position: isMobile ? "fixed" : "relative",
        top: isMobile ? 0 : undefined,
        left: isMobile ? 0 : undefined,
        bottom: isMobile ? 0 : undefined,
        zIndex: isMobile ? 50 : 10,
        boxShadow: isMobile && sidebarOpen ? "4px 0 24px rgba(0,0,0,0.5)" : "none",
      }}>
        <div style={{ padding: sidebarOpen ? "20px 16px 12px" : "20px 8px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: "none", border: "none", color: "#7A8A60", cursor: "pointer", fontSize: 18, padding: 4, lineHeight: 1,
          }}>{sidebarOpen ? "◁" : "▷"}</button>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 16, letterSpacing: 3, color: "#8BA069" }}>DELTA GREEN</div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "#5A6A40", marginTop: 2 }}>AGENT DOSSIERS</div>
            </div>
          )}
        </div>
        {sidebarOpen && (
          <>
            <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
              <button className="btn" onClick={addCharacter} style={{ width: "100%", textAlign: "center" }}>+ NEW AGENT</button>
              <button className="btn" onClick={() => setImportChoiceOpen(true)} style={{ width: "100%", textAlign: "center", fontSize: 11, padding: "6px 12px", borderColor: "rgba(100,140,180,0.3)", background: "rgba(100,140,180,0.08)", color: "#6090B4" }}>
                IMPORT AGENT
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {characters.length === 0 && (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "#5A6A40", fontSize: 12, fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>NO AGENTS ON FILE</div>
              )}
              {characters.map((c) => (
                <div key={c.id}
                  className={`sidebar-item ${c.id === activeId ? "active" : ""} ${c.kia ? "kia" : ""} ${dragState.dragging === c.id ? "dragging" : ""} ${dragState.over === c.id && dragState.dragging !== c.id ? "drag-over" : ""}`}
                  draggable={!isMobile}
                  onDragStart={isMobile ? undefined : e => handleDragStart(e, c.id)}
                  onDragEnd={isMobile ? undefined : handleDragEnd}
                  onDragOver={isMobile ? undefined : e => handleDragOver(e, c.id)}
                  onDrop={isMobile ? undefined : e => handleDrop(e, c.id)}
                  onClick={() => { setActiveId(c.id); if (c.kia) setShowRedactions(true); if (isMobile) setSidebarOpen(false); }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {!isMobile && <span className="drag-handle" onMouseDown={e => e.stopPropagation()} title="Drag to reorder">⠿</span>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", fontSize: 13, fontWeight: 500, color: c.kia ? "#884040" : c.id === activeId ? "#D4D8C8" : "#A0A890", marginBottom: 2 }}>
                        {c.kia ? <span style={{ textDecoration: "line-through", textDecorationColor: "rgba(180,50,50,0.5)" }}>{charName(c)}</span> : charName(c)}
                        {c.kia && <span className="kia-badge">KIA</span>}
                      </div>
                      <div style={{ fontSize: 10, color: c.kia ? "#664040" : "#5A6A40" }}>
                        {c.kia ? "ARCHIVED" : (c.personal.profession || "No profession")}
                      </div>
                    </div>
                  </div>
                  {c.id === activeId && (
                    <div style={{ display: "flex", gap: 6, marginTop: 8, paddingLeft: isMobile ? 0 : 22, flexWrap: "wrap" }}>
                      <div className="sidebar-action-btn">
                        <button className="btn btn-sm" style={{ padding: "4px 8px" }} onClick={(e) => { e.stopPropagation(); duplicateCharacter(c.id); }}>⧉</button>
                        <span className="btn-label">CLONE</span>
                      </div>
                      <div className="sidebar-action-btn">
                        <button className="btn btn-sm" style={{ padding: "4px 8px", borderColor: "rgba(139,160,105,0.25)", background: "rgba(139,160,105,0.06)", color: "#6A8A55" }} onClick={(e) => { e.stopPropagation(); printDossier(c, false); }}>⎙</button>
                        <span className="btn-label">PRINT</span>
                      </div>
                      <div className="sidebar-action-btn">
                        <button className="btn btn-sm" style={{ padding: "4px 8px", borderColor: "rgba(100,160,100,0.25)", background: "rgba(100,160,100,0.06)", color: "#70A870" }} onClick={(e) => { e.stopPropagation(); backupCharacter(c); }}>↓</button>
                        <span className="btn-label">DOWNLOAD</span>
                      </div>
                      <div className="sidebar-action-btn danger-label">
                        <button className="btn btn-sm btn-danger" style={{ padding: "4px 8px" }} onClick={(e) => { e.stopPropagation(); deleteCharacter(c.id); }}>✕</button>
                        <span className="btn-label">DELETE</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(139,160,105,0.1)", fontSize: 9, color: "#4A5A35", textAlign: "center", letterSpacing: 1 }}>TOP SECRET // ORCON</div>
            <div style={{ padding: "0 16px 12px", textAlign: "center" }}>
              <a href="https://oddlyuseful.app" target="_blank" rel="noopener noreferrer" style={{ fontSize: 9, color: "#3A4A2A", textDecoration: "none", letterSpacing: 0.5 }}>
                &copy; {new Date().getFullYear()} oddlyuseful.app
              </a>
            </div>
          </>
        )}
      </div>

      {/* ─── Main Content ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {!activeChar ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", fontSize: 120, fontFamily: "'Special Elite', cursive", color: "rgba(139,160,105,0.04)", transform: "rotate(-12deg)", letterSpacing: 20, pointerEvents: "none", userSelect: "none" }}>CLASSIFIED</div>
            <div style={{ fontFamily: "'Special Elite', cursive", fontSize: 24, color: "#5A6A40", letterSpacing: 4 }}>SELECT OR CREATE AN AGENT</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn" onClick={addCharacter} style={{ fontSize: 14, padding: "12px 28px" }}>+ NEW AGENT DOSSIER</button>
              <button className="btn" onClick={() => fileInputRef.current?.click()} style={{ fontSize: 14, padding: "12px 28px", borderColor: "rgba(100,140,180,0.3)", background: "rgba(100,140,180,0.08)", color: "#6090B4" }}>
                IMPORT PDF
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* KIA Banner */}
            <KIABanner kia={isKIA} kiaDate={activeChar.kiaDate} redacted={showRedactions}
              onToggleRedact={() => setShowRedactions(!showRedactions)} onRevive={reviveAgent} />

            {/* Tab Bar */}
            <div style={{
              display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "flex-end",
              padding: isMobile ? "0 8px" : "0 24px",
              paddingLeft: isMobile ? 52 : 24,
              borderBottom: `1px solid ${isKIA ? "rgba(140,50,50,0.2)" : "rgba(139,160,105,0.2)"}`,
              background: isKIA ? "rgba(30,18,18,0.5)" : "rgba(22,25,19,0.5)",
            }}>
              <div className={isMobile ? "tab-scroll-mobile" : ""} style={{
                padding: isMobile ? "8px 0 0" : "16px 0 0",
                display: "flex", gap: 2, flex: 1,
                flexWrap: isMobile ? "nowrap" : "wrap",
                overflowX: isMobile ? "auto" : undefined,
                WebkitOverflowScrolling: "touch",
              }}>
                {TABS.map(t => (
                  <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""} ${isKIA ? "kia-tab" : ""}`} onClick={() => setTab(t.id)}
                    style={isMobile ? { whiteSpace: "nowrap", padding: "6px 12px", fontSize: 11, flexShrink: 0 } : undefined}>
                    <span style={{ marginRight: isMobile ? 4 : 6, fontSize: 8 }}>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: isMobile ? 8 : 10,
                padding: isMobile ? "4px 0 6px" : "12px 0", flexShrink: 0,
                justifyContent: isMobile ? "space-between" : undefined,
              }}>
                {!isKIA && (() => {
                  const failCount = activeChar.skills.filter(s => s.failed).length;
                  return (
                    <button
                      className="btn btn-sm"
                      onClick={handleMissionEnd}
                      title={failCount > 0 ? `Roll 1d4 advancement for ${failCount} checked skill${failCount !== 1 ? "s" : ""}` : "No failed skills checked"}
                      style={{
                        borderColor: failCount > 0 ? "rgba(100,160,220,0.45)" : "rgba(80,80,80,0.25)",
                        background: failCount > 0 ? "rgba(100,160,220,0.1)" : "rgba(255,255,255,0.03)",
                        color: failCount > 0 ? "#7AAAD4" : "#4A5A45",
                        position: "relative",
                        transition: "all 0.2s",
                        fontSize: isMobile ? 10 : undefined,
                        padding: isMobile ? "4px 8px" : undefined,
                      }}
                    >
                      ◈ END MISSION
                      {failCount > 0 && (
                        <span style={{
                          position: "absolute", top: -6, right: -6,
                          background: "#7AAAD4", color: "#0A0E0A",
                          borderRadius: "50%", width: 16, height: 16,
                          fontSize: 10, fontFamily: "'IBM Plex Mono', monospace",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, lineHeight: 1,
                        }}>{failCount}</span>
                      )}
                    </button>
                  );
                })()}
                <div style={{ fontSize: isMobile ? 9 : 10, color: "#5A6A40", fontFamily: "'Special Elite', cursive", letterSpacing: 1 }}>
                  {isKIA ? "ARCHIVED" : `SAVED ${new Date(activeChar.updatedAt).toLocaleTimeString()}`}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 12 : 24, animation: "fadeIn 0.3s ease", position: "relative" }}>

                {tab === "personal" && <PersonalTab activeChar={activeChar} isKIA={isKIA} isLocked={isLocked} isRedacted={isRedacted} updateChar={updateChar} addLogEntry={addLogEntry} handleUnnaturalChange={handleUnnaturalChange} />}
                {tab === "stats" && <StatsTab activeChar={activeChar} isKIA={isKIA} isLocked={isLocked} isRedacted={isRedacted} updateChar={updateChar} addLogEntry={addLogEntry} setKiaConfirmOpen={setKiaConfirmOpen} setSanEventData={setSanEventData} setSanEventOpen={setSanEventOpen} setSanProjectionOpen={setSanProjectionOpen} clearTempInsanity={clearTempInsanity} />}
                {tab === "skills" && <SkillsTab activeChar={activeChar} isKIA={isKIA} isLocked={isLocked} updateChar={updateChar} addLogEntry={addLogEntry} />}
                {tab === "combat" && <CombatTab activeChar={activeChar} isKIA={isKIA} isLocked={isLocked} isRedacted={isRedacted} updateChar={updateChar} addLogEntry={addLogEntry} setGearCatalogOpen={setGearCatalogOpen} weaponDragState={weaponDragState} handleWeaponDragStart={handleWeaponDragStart} handleWeaponDragEnd={handleWeaponDragEnd} handleWeaponDragOver={handleWeaponDragOver} handleWeaponDrop={handleWeaponDrop} />}
                {tab === "notes" && <NotesTab activeChar={activeChar} isKIA={isKIA} isLocked={isLocked} isRedacted={isRedacted} updateChar={updateChar} addLogEntry={addLogEntry} setClearLogOpen={setClearLogOpen} />}

            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
