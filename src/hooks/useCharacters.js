import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "./useAuth.js";
import { listCharacters, upsertCharacter, deleteCharacter } from "../lib/charactersRepo.js";
import { readCache, writeCache } from "../lib/cache.js";

// Cloud-first characters hook with a per-user IndexedDB read cache.
//
// - On mount / user change: fetch the roster from Supabase. On success,
//   mirror to the cache. On failure, hydrate from the cache and flip
//   `readOnly` true so write attempts surface a useful error.
// - All writes (updateChar, addLogEntry, setCharacters) debounce a diff
//   against the last-synced snapshot and push upserts/deletes to Supabase.
// - `activeId` stays local (cache-only). Which character is open does not
//   need to sync across devices.
export function useCharacters() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [characters, setCharactersState] = useState([]);
  const [activeId, setActiveIdState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const [readOnly, setReadOnly] = useState(false);

  // Snapshot of the last roster we successfully synced to cloud, keyed by id.
  // Used to diff on save so we know what to upsert vs. delete.
  const syncedRef = useRef(new Map());
  const saveTimeout = useRef(null);

  // Load on mount / user change. If there is no user the auth gate
  // is rendering LoginScreen instead of the app — we simply don't load.
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    (async () => {
      setLoaded(false);
      setStorageError(null);
      const { characters: cloudChars, error } = await listCharacters(userId);
      if (cancelled) return;

      if (!error && cloudChars) {
        setCharactersState(cloudChars);
        syncedRef.current = new Map(cloudChars.map(c => [c.id, c]));
        setReadOnly(false);
        // Seed activeId from cache if possible.
        const cached = await readCache(userId);
        if (cancelled) return;
        const cachedActive = cached?.activeId;
        setActiveIdState(cachedActive && cloudChars.some(c => c.id === cachedActive) ? cachedActive : null);
        await writeCache(userId, cloudChars, cachedActive ?? null);
      } else {
        // Cloud fetch failed — fall back to cache in read-only mode.
        const cached = await readCache(userId);
        if (cancelled) return;
        if (cached) {
          setCharactersState(cached.characters);
          setActiveIdState(cached.activeId);
          syncedRef.current = new Map(cached.characters.map(c => [c.id, c]));
        } else {
          setCharactersState([]);
          setActiveIdState(null);
          syncedRef.current = new Map();
        }
        setReadOnly(true);
        if (error) setStorageError(`Offline — cloud unreachable: ${error.message || error}`);
      }
      setLoaded(true);
    })();

    return () => { cancelled = true; };
  }, [userId]);

  // Diff-based cloud sync. Compares current `characters` against
  // `syncedRef` and emits the minimal set of upserts + deletes.
  const syncCloud = useCallback(async (chars, aid) => {
    if (!userId || readOnly) return;
    const prev = syncedRef.current;
    const currentIds = new Set(chars.map(c => c.id));
    const ops = [];

    for (const c of chars) {
      const before = prev.get(c.id);
      if (!before || before.updatedAt !== c.updatedAt || JSON.stringify(before) !== JSON.stringify(c)) {
        ops.push(upsertCharacter(c, userId).then(r => ({ kind: "upsert", id: c.id, ...r })));
      }
    }
    for (const id of prev.keys()) {
      if (!currentIds.has(id)) {
        ops.push(deleteCharacter(id).then(r => ({ kind: "delete", id, ...r })));
      }
    }

    if (ops.length === 0) {
      await writeCache(userId, chars, aid);
      return;
    }

    const results = await Promise.all(ops);
    const firstError = results.find(r => r.error);
    if (firstError) {
      setStorageError(`Cloud save failed: ${firstError.error.message || firstError.error}`);
      return;
    }

    syncedRef.current = new Map(chars.map(c => [c.id, c]));
    await writeCache(userId, chars, aid);
    setStorageError(null);
  }, [userId, readOnly]);

  // Debounced save that runs after any state mutation once loaded.
  useEffect(() => {
    if (!loaded || !userId) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      syncCloud(characters, activeId);
    }, 500);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [characters, activeId, loaded, userId, syncCloud]);

  // Wrapped setters so callers can't easily bypass sync.
  const setCharacters = useCallback((next) => {
    if (readOnly) {
      setStorageError("Offline — reconnect to edit.");
      return;
    }
    setCharactersState(next);
  }, [readOnly]);

  const setActiveId = useCallback((id) => {
    setActiveIdState(id);
  }, []);

  const activeChar = useMemo(() => characters.find(c => c.id === activeId), [characters, activeId]);

  const updateChar = useCallback((updater) => {
    if (readOnly) {
      setStorageError("Offline — reconnect to edit.");
      return;
    }
    setCharactersState(prev => prev.map(c => c.id === activeId ? { ...updater(c), updatedAt: new Date().toISOString() } : c));
  }, [activeId, readOnly]);

  const addLogEntry = useCallback((label, from, to, source = "manual") => {
    if (readOnly) return;
    if (from !== null && to !== null && from === to) return;
    const entry = {
      id: (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
      timestamp: new Date().toISOString(),
      label, from, to, source,
    };
    setCharactersState(prev => prev.map(c => {
      if (c.id !== activeId) return c;
      return { ...c, sessionLog: [...(c.sessionLog || []), entry], updatedAt: new Date().toISOString() };
    }));
  }, [activeId, readOnly]);

  return {
    characters, setCharacters,
    activeId, setActiveId,
    loaded,
    activeChar,
    storageError, setStorageError,
    readOnly,
    updateChar, addLogEntry,
  };
}
