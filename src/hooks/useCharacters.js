import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { loadFromStorage, saveToStorage } from "../utils/storage";

export function useCharacters() {
  const [characters, setCharacters] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const saveTimeout = useRef(null);

  // Load from IndexedDB on mount (async, with localStorage migration)
  useEffect(() => {
    loadFromStorage().then(({ data, error }) => {
      if (error) setStorageError(error);
      if (data) {
        setCharacters(data.characters || []);
        setActiveId(data.activeId || null);
      }
      setLoaded(true);
    });
  }, []);

  // Debounced save to IndexedDB
  const save = useCallback((chars, aid) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveToStorage(chars, aid).then(err => {
        if (err) setStorageError(err);
      });
    }, 500);
  }, []);

  useEffect(() => { if (loaded) save(characters, activeId); }, [characters, activeId, loaded, save]);

  // Derived state
  const activeChar = useMemo(() => characters.find(c => c.id === activeId), [characters, activeId]);

  const updateChar = useCallback((updater) => {
    setCharacters(prev => prev.map(c => c.id === activeId ? { ...updater(c), updatedAt: new Date().toISOString() } : c));
  }, [activeId]);

  const addLogEntry = useCallback((label, from, to, source = "manual") => {
    if (from !== null && to !== null && from === to) return;
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      label, from, to, source,
    };
    setCharacters(prev => prev.map(c => {
      if (c.id !== activeId) return c;
      return { ...c, sessionLog: [...(c.sessionLog || []), entry], updatedAt: new Date().toISOString() };
    }));
  }, [activeId]);

  return {
    characters, setCharacters,
    activeId, setActiveId,
    loaded,
    activeChar,
    storageError, setStorageError,
    updateChar, addLogEntry,
  };
}
