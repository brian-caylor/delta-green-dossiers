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
import DiceRollerProvider from "./components/DiceRollerProvider.jsx";

// ─── Tab Panels ───
import { PersonalTab, StatsTab, SkillsTab, CombatTab, NotesTab } from "./components/tabs";

// ─── Modals ───
import { ImportReviewModal, SessionEndModal, SanEventModal, SanProjectionModal, UnnaturalAddForm, GearCatalogModal, ImportChoiceModal } from "./components/modals";

// ─── Auth ───
import { useAuth } from "./hooks/useAuth.js";
import LoginScreen from "./components/LoginScreen.jsx";

// ─── Screens ───
import Roster from "./components/Roster.jsx";
import Wizard from "./components/Wizard.jsx";

// ─── Main entry: auth gate, then dossier app ───
export default function App() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#1A1D16", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ color: "#8BA069", fontFamily: "'Special Elite', cursive", fontSize: 18, letterSpacing: 4 }}>
        ACCESSING CLASSIFIED FILES...
      </div>
      <div style={{ color: "#5A6A40", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 2 }}>
        [STAGE 1 · AUTH]
      </div>
    </div>
  );
  if (!user) return <LoginScreen />;
  return <DossierApp />;
}

function DossierApp() {
  // Discriminated screen state. Default landing after login is the Roster.
  // Shapes: { screen: 'roster' } | { screen: 'wizard' } | { screen: 'sheet', characterId }
  // [FWD-COMPAT] future campaign screens drop in as additional discriminants.
  const [view, setView] = useState({ screen: "roster" });

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
    readOnly,
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

  // ─── Navigation helpers ───
  const showRoster = () => setView({ screen: "roster" });
  const showWizard = () => setView({ screen: "wizard" });
  const openSheet = (id) => { setActiveId(id); setTab("stats"); setView({ screen: "sheet", characterId: id }); };

  // When user presses +NEW AGENT in sidebar, still produce a blank character
  // and jump straight to the sheet (legacy behaviour). Roster's +NEW AGENT
  // button routes through the wizard instead.
  const quickNewCharacter = () => {
    const c = createNewCharacter();
    setCharacters(prev => [...prev, c]);
    openSheet(c.id);
  };

  // Wizard output: commit the fully-built character to the cloud.
  const commitCharacterFromWizard = (c) => {
    setCharacters(prev => [...prev, c]);
  };

  // ─── Game mechanics handlers ───
  // Blank add — sidebar +NEW AGENT button. Creates an empty dossier and
  // opens the sheet directly. Roster "+NEW AGENT" routes through the wizard.
  const addCharacter = () => {
    const c = createNewCharacter();
    setCharacters(prev => [...prev, c]);
    setActiveId(c.id);
    setTab("personal");
    setView({ screen: "sheet", characterId: c.id });
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
          if (activeId === id) {
            setActiveId(null);
            // Kick back to the roster when deleting the open character.
            setView({ screen: "roster" });
          }
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div className="handwritten" style={{ fontSize: 18, letterSpacing: 4, color: "var(--ink-3)" }}>
        ACCESSING CLASSIFIED FILES...
      </div>
      <div className="label">[STAGE 2 · ROSTER]</div>
    </div>
  );

  const TABS = [
    { id: "personal", label: "PERSONAL", icon: "▪" },
    { id: "stats", label: "STATS", icon: "▲" },
    { id: "skills", label: "SKILLS", icon: "◆" },
    { id: "combat", label: "COMBAT", icon: "✦" },
    { id: "notes", label: "NOTES", icon: "●" },
  ];

  // Global dice roller → log to the active character's session log.
  // The callback reads activeChar at call-time (via the entry param), so
  // changing agents while the panel is open is safe — the next roll
  // logs to whichever agent is active when the Roll button is pressed.
  const handleGlobalRoll = (entry) => {
    const label = formatRollForLog(entry);
    addLogEntry(label, null, null, "roll");
  };

  return (
    <DiceRollerProvider onRoll={handleGlobalRoll}>
    <div className="paper" style={{ minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      <TopBar />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

      {/* Hidden file input for PDF import */}
      <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileSelect} style={{ display: "none" }} />
      <input type="file" ref={jsonInputRef} accept=".json" onChange={handleJsonImport} style={{ display: "none" }} />

      {/* Storage Error Banner — non-dismissible while read-only so the user
          can't hide the offline indicator and then think their edits are
          saving. Transient save errors (online, cloudReachable briefly
          flickered) remain dismissible. */}
      {storageError && (
        <div className="redact-bar" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "8px 16px", letterSpacing: 1 }}>
          <span style={{ flex: 1 }}>{storageError}</span>
          {!readOnly && (
            <button type="button" className="btn btn-tiny" style={{ color: "var(--paper)", borderColor: "var(--paper)", background: "transparent" }} onClick={() => setStorageError(null)}>Dismiss</button>
          )}
        </div>
      )}

      {/* PWA Install Banner */}
      {canInstall && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9998,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          padding: "10px 16px",
          background: "var(--ink)", color: "var(--paper)", borderTop: "3px solid var(--redact)",
          fontSize: 13, fontFamily: "var(--font-mono)",
        }}>
          <span style={{ flex: 1 }}>📲 Install <strong>Agent Dossiers</strong> for offline access — works without internet.</span>
          <button type="button" className="btn btn-sm" style={{ background: "var(--paper)", color: "var(--ink)" }} onClick={triggerInstall}>Install</button>
          <button type="button" className="btn btn-sm" style={{ background: "transparent", color: "var(--paper)", borderColor: "var(--paper)" }} onClick={dismissInstall}>Maybe later</button>
        </div>
      )}

      {/* Mission End Confirmation */}
      {missionEndConfirm && (
        <div className="modal-backdrop" onClick={() => setMissionEndConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: "min(480px, 92vw)" }}>
            <div className="modal-title">END MISSION?</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 10 }}>
              This will roll <strong>1d4 advancement</strong> for each failed skill and clear all checkboxes.
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.6, marginBottom: 20, padding: "10px 12px", border: "1px dashed var(--line-2)" }}>
              In Delta Green, skill advancement happens at the <em>end of the operation</em> — not after each individual session. Only confirm if the current mission is complete.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn" onClick={() => setMissionEndConfirm(false)}>CANCEL</button>
              <button type="button" className="btn btn-primary" onClick={confirmMissionEnd}>CONFIRM — ROLL ADVANCEMENT</button>
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
        <div className="modal-backdrop" onClick={() => importState.phase === "error" ? setImportState({ active: false, status: "", phase: "", error: null }) : null}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: "min(420px, 92vw)", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>
              {importState.phase === "reading" && "📄"}
              {importState.phase === "analyzing" && "🔍"}
              {importState.phase === "building" && "📋"}
              {importState.phase === "error" && "⚠️"}
            </div>
            <div className="modal-title" style={{ color: importState.phase === "error" ? "var(--redact)" : "var(--ink)" }}>
              {importState.phase === "error" ? "IMPORT FAILED" : "IMPORTING DOSSIER"}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 16 }}>{importState.status}</div>
            {(importState.phase === "reading" || importState.phase === "analyzing" || importState.phase === "building") && (
              <div style={{ height: 4, background: "var(--line-soft)", overflow: "hidden", marginBottom: 16 }}>
                <div style={{
                  height: "100%", background: "var(--ink)",
                  width: importState.phase === "reading" ? "30%" : importState.phase === "analyzing" ? "65%" : "90%",
                  transition: "width 0.5s ease",
                }} />
              </div>
            )}
            {importState.phase === "error" && (
              <button type="button" className="btn" onClick={() => setImportState({ active: false, status: "", phase: "", error: null })}>DISMISS</button>
            )}
          </div>
        </div>
      )}

      {/* KIA Background Stamp */}
      {isKIA && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="handwritten" style={{
            fontSize: 160, fontWeight: 400,
            color: "rgba(140,29,29,0.08)", letterSpacing: 30,
            transform: "rotate(-18deg)", userSelect: "none",
          }}>K.I.A.</div>
        </div>
      )}

      {/* KIA Confirmation Dialog */}
      {kiaConfirmOpen && (
        <div className="modal-backdrop" onClick={() => setKiaConfirmOpen(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: "min(480px, 92vw)", textAlign: "center", borderColor: "var(--redact)" }}>
            <div className="handwritten" style={{ fontSize: 36, color: "var(--redact)", letterSpacing: 8, marginBottom: 6 }}>K.I.A.</div>
            <div className="label" style={{ color: "var(--redact)", marginBottom: 18 }}>
              AGENT CASUALTY REPORT — DELTA GREEN
            </div>
            {kiaConfirmOpen === "hp" ? (
              <>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 10, fontStyle: "italic" }}>
                  "This operative has sustained wounds incompatible with continued field activity.
                  Command has been notified. The Program extends its condolences."
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 6 }}>
                  <strong>{activeChar ? charName(activeChar) : ""}</strong> has fallen in the line of duty.
                  Mark this dossier as Killed in Action?
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.7, marginBottom: 10 }}>
                  Confirm the loss of <strong>{activeChar ? charName(activeChar) : ""}</strong> and close their field file.
                </div>
                <div className="label" style={{ fontStyle: "italic", marginBottom: 6 }}>
                  "Agents of Delta Green accept that some operations end only one way.
                  Their sacrifice is noted — and buried."
                </div>
              </>
            )}
            <div className="label" style={{ fontStyle: "italic", marginTop: 10, marginBottom: 20 }}>
              The dossier will be archived with sensitive details redacted.
              You may declassify or reinstate the agent at any time.
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button type="button" className="btn" onClick={() => setKiaConfirmOpen(null)}>NO — STAND DOWN</button>
              <button type="button" className="btn btn-danger" onClick={markKIA}>YES — MARK K.I.A.</button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Confirm Dialog */}
      {confirmDialog && (
        <div className="modal-backdrop" onClick={() => setConfirmDialog(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: "min(460px, 92vw)", textAlign: "center" }}>
            <div className="modal-title" style={{ color: confirmDialog.danger ? "var(--redact)" : "var(--ok)" }}>{confirmDialog.title}</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 20 }}>{confirmDialog.message}</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button type="button" className="btn" onClick={() => setConfirmDialog(null)}>CANCEL</button>
              <button type="button" className={`btn ${confirmDialog.danger ? "btn-danger" : "btn-primary"}`} onClick={confirmDialog.onConfirm}>
                {confirmDialog.confirmLabel || "CONFIRM"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Session Log Confirm Dialog */}
      {clearLogOpen && (
        <div className="modal-backdrop" onClick={() => setClearLogOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: "min(460px, 92vw)", textAlign: "center", borderColor: "var(--redact)" }}>
            <div className="modal-title" style={{ color: "var(--redact)" }}>CLEAR SESSION LOG</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 8 }}>
              Permanently erase all session log entries for <strong>{activeChar ? charName(activeChar) : ""}</strong>?
            </div>
            <div className="label" style={{ fontStyle: "italic", marginBottom: 20, lineHeight: 1.5 }}>
              This action cannot be undone. Stat changes, skill advancements, and events will be permanently deleted.
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button type="button" className="btn" onClick={() => setClearLogOpen(false)}>CANCEL</button>
              <button type="button" className="btn btn-danger" onClick={() => { updateChar(c => ({ ...c, sessionLog: [] })); setClearLogOpen(false); }}>CLEAR LOG</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Roster screen ─── */}
      {view.screen === "roster" && (
        <Roster
          characters={characters}
          onOpen={openSheet}
          onNew={showWizard}
          onImport={() => setImportChoiceOpen(true)}
          onDuplicate={(id) => { duplicateCharacter(id); }}
          onBackup={backupCharacter}
          onDelete={deleteCharacter}
        />
      )}

      {/* ─── Wizard screen ─── */}
      {view.screen === "wizard" && (
        <Wizard
          onCancel={showRoster}
          onCommit={commitCharacterFromWizard}
          onCreated={(id) => openSheet(id)}
        />
      )}

      {/* ─── Sheet screen: sidebar + tabs (legacy shell) ─── */}
      {view.screen === "sheet" && (
      <>
      {/* Mobile sidebar backdrop */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 49 }} />
      )}

      {/* Mobile floating hamburger */}
      {isMobile && !sidebarOpen && (
        <button type="button" onClick={() => setSidebarOpen(true)} style={{
          position: "fixed", top: 58, left: 10, zIndex: 50,
          width: 40, height: 40,
          background: "var(--ink)", border: "1px solid var(--ink)",
          color: "var(--paper)", fontSize: 20, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>☰</button>
      )}

      {/* Sidebar */}
      <div style={{
        width: isMobile ? (sidebarOpen ? "85vw" : 0) : (sidebarOpen ? 280 : 52),
        minWidth: isMobile ? (sidebarOpen ? "85vw" : 0) : (sidebarOpen ? 280 : 52),
        maxWidth: isMobile ? 340 : undefined,
        background: "var(--paper-2)",
        borderRight: isMobile && !sidebarOpen ? "none" : "1px solid var(--line-2)",
        display: "flex", flexDirection: "column",
        transition: "width 0.25s, min-width 0.25s",
        overflow: "hidden",
        position: isMobile ? "fixed" : "relative",
        top: isMobile ? 0 : undefined,
        left: isMobile ? 0 : undefined,
        bottom: isMobile ? 0 : undefined,
        zIndex: isMobile ? 50 : 10,
      }}>
        <div style={{ padding: sidebarOpen ? "20px 16px 12px" : "20px 8px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", color: "var(--ink-2)", cursor: "pointer", fontSize: 18, padding: 4, lineHeight: 1 }}>
            {sidebarOpen ? "◁" : "▷"}
          </button>
          {sidebarOpen && (
            <button type="button" onClick={showRoster} title="Back to roster"
              style={{ background: "none", border: "none", padding: 0, textAlign: "left", cursor: "pointer" }}>
              <div className="handwritten" style={{ fontSize: 16, letterSpacing: 3, color: "var(--ink)" }}>DELTA GREEN</div>
              <div className="label" style={{ marginTop: 2 }}>◁ AGENT ROSTER</div>
            </button>
          )}
        </div>
        {sidebarOpen && (
          <>
            <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
              <button type="button" className="btn btn-primary" onClick={addCharacter} style={{ width: "100%", justifyContent: "center" }}>+ NEW AGENT</button>
              <button type="button" className="btn btn-sm" onClick={() => setImportChoiceOpen(true)} style={{ width: "100%", justifyContent: "center" }}>IMPORT AGENT</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              {characters.length === 0 && (
                <div className="label" style={{ padding: "24px 16px", textAlign: "center" }}>NO AGENTS ON FILE</div>
              )}
              {characters.map((c) => (
                <div key={c.id}
                  className={`sidebar-item ${c.id === activeId ? "active" : ""} ${c.kia ? "kia" : ""} ${dragState.dragging === c.id ? "dragging" : ""} ${dragState.over === c.id && dragState.dragging !== c.id ? "drag-over" : ""}`}
                  draggable={!isMobile}
                  onDragStart={isMobile ? undefined : (e) => handleDragStart(e, c.id)}
                  onDragEnd={isMobile ? undefined : handleDragEnd}
                  onDragOver={isMobile ? undefined : (e) => handleDragOver(e, c.id)}
                  onDrop={isMobile ? undefined : (e) => handleDrop(e, c.id)}
                  onClick={() => { setActiveId(c.id); if (c.kia) setShowRedactions(true); if (isMobile) setSidebarOpen(false); }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {!isMobile && <span className="drag-handle" onMouseDown={(e) => e.stopPropagation()} title="Drag to reorder">⠿</span>}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", fontSize: 14, fontWeight: 500, color: c.kia ? "var(--redact)" : "var(--ink)", fontFamily: "var(--font-hand)", marginBottom: 2 }}>
                        {c.kia ? <span style={{ textDecoration: "line-through", textDecorationColor: "var(--redact)" }}>{charName(c)}</span> : charName(c)}
                        {c.kia && <span className="kia-badge">KIA</span>}
                      </div>
                      <div className="label" style={{ color: c.kia ? "var(--redact-2)" : "var(--ink-3)" }}>
                        {c.kia ? "ARCHIVED" : (c.personal.profession || "No profession")}
                      </div>
                    </div>
                  </div>
                  {c.id === activeId && (
                    <div style={{ display: "flex", gap: 6, marginTop: 8, paddingLeft: isMobile ? 0 : 22, flexWrap: "wrap" }}>
                      <div className="sidebar-action-btn">
                        <button type="button" className="btn btn-tiny" onClick={(e) => { e.stopPropagation(); duplicateCharacter(c.id); }}>⧉</button>
                        <span className="btn-label">CLONE</span>
                      </div>
                      <div className="sidebar-action-btn">
                        <button type="button" className="btn btn-tiny" onClick={(e) => { e.stopPropagation(); printDossier(c, false); }}>⎙</button>
                        <span className="btn-label">PRINT</span>
                      </div>
                      <div className="sidebar-action-btn">
                        <button type="button" className="btn btn-tiny" onClick={(e) => { e.stopPropagation(); backupCharacter(c); }}>↓</button>
                        <span className="btn-label">DOWNLOAD</span>
                      </div>
                      <div className="sidebar-action-btn">
                        <button type="button" className="btn btn-tiny btn-danger" onClick={(e) => { e.stopPropagation(); deleteCharacter(c.id); }}>✕</button>
                        <span className="btn-label">DELETE</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="label" style={{ padding: "12px 16px", borderTop: "1px solid var(--line-2)", textAlign: "center" }}>TOP SECRET // ORCON</div>
            <div style={{ padding: "0 16px 12px", textAlign: "center" }}>
              <a href="https://oddlyuseful.app" target="_blank" rel="noopener noreferrer" className="label" style={{ textDecoration: "none" }}>
                © {new Date().getFullYear()} oddlyuseful.app
              </a>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {!activeChar ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, position: "relative", overflow: "hidden" }}>
            <div className="handwritten" style={{ position: "absolute", fontSize: 120, color: "rgba(26,23,18,0.05)", transform: "rotate(-12deg)", letterSpacing: 20, pointerEvents: "none", userSelect: "none" }}>CLASSIFIED</div>
            <div className="handwritten" style={{ fontSize: 24, color: "var(--ink-2)", letterSpacing: 4 }}>SELECT OR CREATE AN AGENT</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="btn btn-primary" onClick={addCharacter} style={{ padding: "12px 28px" }}>+ NEW AGENT DOSSIER</button>
              <button type="button" className="btn" onClick={() => fileInputRef.current?.click()} style={{ padding: "12px 28px" }}>IMPORT PDF</button>
            </div>
          </div>
        ) : (
          <>
            {/* KIA Banner */}
            <KIABanner kia={isKIA} kiaDate={activeChar.kiaDate} redacted={showRedactions}
              onToggleRedact={() => setShowRedactions(!showRedactions)} onRevive={reviveAgent} />

            {/* Tab Bar */}
            <div style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "flex-end",
              padding: isMobile ? "0 8px" : "0 24px",
              paddingLeft: isMobile ? 52 : 24,
              borderBottom: `1px solid ${isKIA ? "var(--redact)" : "var(--line)"}`,
              background: "var(--paper-2)",
            }}>
              <div className={isMobile ? "tab-scroll-mobile" : ""} style={{
                padding: isMobile ? "8px 0 0" : "14px 0 0",
                display: "flex", gap: 2, flex: 1,
                flexWrap: isMobile ? "nowrap" : "wrap",
                overflowX: isMobile ? "auto" : undefined,
                WebkitOverflowScrolling: "touch",
              }}>
                {TABS.map((t) => (
                  <button type="button" key={t.id}
                    className={`tab-btn ${tab === t.id ? "active" : ""} ${isKIA ? "kia-tab" : ""}`}
                    onClick={() => setTab(t.id)}
                    style={isMobile ? { whiteSpace: "nowrap", padding: "6px 12px", fontSize: 11, flexShrink: 0 } : undefined}
                  >
                    <span style={{ marginRight: isMobile ? 4 : 6, fontSize: 8 }}>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: isMobile ? 8 : 10,
                padding: isMobile ? "4px 0 6px" : "10px 0", flexShrink: 0,
                justifyContent: isMobile ? "space-between" : undefined,
              }}>
                {!isKIA && (() => {
                  const failCount = activeChar.skills.filter((s) => s.failed).length;
                  return (
                    <button
                      type="button"
                      className={`btn btn-sm ${failCount > 0 ? "btn-primary" : "btn-ghost"}`}
                      onClick={handleMissionEnd}
                      title={failCount > 0 ? `Roll 1d4 advancement for ${failCount} checked skill${failCount !== 1 ? "s" : ""}` : "No failed skills checked"}
                      style={{ position: "relative" }}
                    >
                      ◈ END MISSION
                      {failCount > 0 && (
                        <span style={{
                          position: "absolute", top: -6, right: -6,
                          background: "var(--redact)", color: "var(--paper)",
                          borderRadius: "50%", width: 16, height: 16,
                          fontSize: 10, fontFamily: "var(--font-mono)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, lineHeight: 1,
                        }}>{failCount}</span>
                      )}
                    </button>
                  );
                })()}
                <div className="label" style={{ fontFamily: "var(--font-mono)" }}>
                  {isKIA ? "ARCHIVED" : `SAVED ${new Date(activeChar.updatedAt).toLocaleTimeString()}`}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 12 : 24, position: "relative" }}>
              {tab === "personal" && <PersonalTab activeChar={activeChar} isKIA={isKIA} isLocked={isLocked} isRedacted={isRedacted} updateChar={updateChar} addLogEntry={addLogEntry} handleUnnaturalChange={handleUnnaturalChange} />}
              {tab === "stats" && <StatsTab activeChar={activeChar} isKIA={isKIA} isLocked={isLocked} isRedacted={isRedacted} updateChar={updateChar} addLogEntry={addLogEntry} setKiaConfirmOpen={setKiaConfirmOpen} setSanEventData={setSanEventData} setSanEventOpen={setSanEventOpen} setSanProjectionOpen={setSanProjectionOpen} clearTempInsanity={clearTempInsanity} />}
              {tab === "skills" && <SkillsTab activeChar={activeChar} isKIA={isKIA} isLocked={isLocked} updateChar={updateChar} addLogEntry={addLogEntry} />}
              {tab === "combat" && <CombatTab activeChar={activeChar} isKIA={isKIA} isLocked={isLocked} isRedacted={isRedacted} updateChar={updateChar} addLogEntry={addLogEntry} setGearCatalogOpen={setGearCatalogOpen} weaponDragState={weaponDragState} handleWeaponDragStart={handleWeaponDragStart} handleWeaponDragEnd={handleWeaponDragEnd} handleWeaponDragOver={handleWeaponDragOver} handleWeaponDrop={handleWeaponDrop} />}
              {tab === "notes" && <NotesTab activeChar={activeChar} isKIA={isKIA} isLocked={isLocked} isRedacted={isRedacted} updateChar={updateChar} addLogEntry={addLogEntry} setClearLogOpen={setClearLogOpen} />}
            </div>
          </>
        )}
      </div>
      </>
      )}
      </div>
    </div>
    </DiceRollerProvider>
  );
}

// Session-log label format for a global dice roll. Examples:
//   Roll d100 = 37
//   Roll d100 vs 45 → 37 PASS
//   Roll 2d6+3 = 4, 3 +3 → 10
function formatRollForLog(entry) {
  const { formula, total, perGroup, modifier, d100 } = entry;
  if (d100) {
    const tag = d100.isCritical ? " CRITICAL" : d100.isFumble ? " FUMBLE" : d100.pass ? " PASS" : " FAIL";
    return `Roll ${formula} vs ${d100.target}% → ${perGroup[0].rolls[0]}${tag}`;
  }
  const rollsDetail = perGroup.map(g => g.rolls.join(", ")).join(" / ");
  const modStr = modifier ? (modifier > 0 ? ` +${modifier}` : ` ${modifier}`) : "";
  const multi = perGroup.some(g => g.rolls.length > 1) || modifier !== 0;
  return multi
    ? `Roll ${formula} = ${rollsDetail}${modStr} → ${total}`
    : `Roll ${formula} = ${total}`;
}
