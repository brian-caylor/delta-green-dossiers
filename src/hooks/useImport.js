import { useState, useRef, useCallback } from "react";
import { extractFormFields, parseDeltaGreenSheet, buildCharacterFromParsed } from "../utils/pdfImport";
import { createNewCharacter } from "../data/defaultCharacter";
import { newId } from "../utils/uuid.js";

export function useImport(setCharacters, setActiveId, setTab, setConfirmDialog) {
  const [importState, setImportState] = useState({ active: false, status: "", phase: "", error: null });
  const [pendingImport, setPendingImport] = useState(null);
  const fileInputRef = useRef(null);
  const jsonInputRef = useRef(null);

  const importFromPDF = useCallback(async (file) => {
    setImportState({ active: true, status: "Reading PDF file...", phase: "reading", error: null });
    try {
      const arrayBuffer = await file.arrayBuffer();
      setImportState({ active: true, status: "Reading form fields...", phase: "analyzing", error: null });
      const fields = await extractFormFields(arrayBuffer);
      setImportState({ active: true, status: "Parsing character sheet...", phase: "building", error: null });
      const parsed = parseDeltaGreenSheet(fields);
      setImportState({ active: false, status: "", phase: "", error: null });
      setPendingImport(parsed);
    } catch (err) {
      console.error("Import failed:", err);
      setImportState({ active: true, status: err.message || "Failed to parse PDF.", phase: "error", error: err.message });
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setImportState({ active: true, status: "Please select a PDF file.", phase: "error", error: "Invalid file type" });
      return;
    }
    importFromPDF(file);
    e.target.value = "";
  }, [importFromPDF]);

  const handleConfirmImport = useCallback((reviewedData) => {
    const newChar = buildCharacterFromParsed(reviewedData, createNewCharacter);
    setCharacters(prev => [...prev, newChar]);
    setActiveId(newChar.id);
    setTab("personal");
    setPendingImport(null);
  }, [setCharacters, setActiveId, setTab]);

  const handleJsonImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.id || !parsed.personal || !parsed.stats) throw new Error("Invalid backup");
        const restored = {
          ...parsed,
          id: newId(),
          updatedAt: new Date().toISOString(),
        };
        setCharacters(prev => [...prev, restored]);
        setActiveId(restored.id);
        setTab("personal");
      } catch {
        setConfirmDialog({
          title: "Import Failed",
          message: "The selected file is not a valid agent backup. Please use a .json file exported from this app.",
          danger: false,
          confirmLabel: "OK",
          onConfirm: () => setConfirmDialog(null),
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [setCharacters, setActiveId, setTab, setConfirmDialog]);

  const backupCharacter = useCallback((char) => {
    const blob = new Blob([JSON.stringify(char, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const name = [char.personal.firstName, char.personal.lastName].filter(Boolean).join("-") || "agent";
    a.href = url;
    a.download = `${name}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    importState, setImportState,
    pendingImport, setPendingImport,
    fileInputRef, jsonInputRef,
    handleFileSelect, handleConfirmImport, handleJsonImport,
    backupCharacter,
  };
}
