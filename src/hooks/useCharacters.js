import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "./useAuth.js";
import { listCharacters, upsertCharacter, deleteCharacter, flushOrDetectOffline } from "../lib/charactersRepo.js";
import { readCache, writeCache } from "../lib/cache.js";

// Cloud-first characters hook with a per-user IndexedDB read cache.
//
// - On mount / user change: fetch the roster from Firestore. On success,
//   mirror to the cache. On failure, hydrate from the cache read-only.
// - Authoritative offline signal is navigator.onLine + browser
//   `online`/`offline` events, NOT a stalled Firestore request. As soon as
//   the browser says it's offline we flip read-only and surface the banner;
//   on reconnect we refetch the roster and resume sync.
// - Writes (updateChar, addLogEntry, setCharacters) are blocked while
//   read-only is in effect so edits can't silently disappear.
export function useCharacters() {
  const { user } = useAuth();
  const userId = user?.uid ?? null;

  const [characters, setCharactersState] = useState([]);
  const [activeId, setActiveIdState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(null);
  const [isOnline, setIsOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine !== false);
  const [cloudReachable, setCloudReachable] = useState(true);

  // readOnly is derived. Any write path must check this BEFORE mutating
  // local state, otherwise the user's edits get lost on reload.
  const readOnly = !isOnline || !cloudReachable;

  const syncedRef = useRef(new Map());
  const saveTimeout = useRef(null);

  // Browser online/offline listeners. This is the source of truth for
  // network connectivity — faster and more reliable than waiting for a
  // Firestore request to time out.
  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      setStorageError(null);
    };
    const goOffline = () => {
      setIsOnline(false);
      setStorageError("Offline — reconnect to edit. Your changes won't save until you're back online.");
    };
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Load (and re-load on reconnect) from Firestore.
  const loadRoster = useCallback(async (uid) => {
    const fetched = await Promise.race([
      listCharacters(uid),
      new Promise((res) => setTimeout(() => res({ characters: null, error: new Error("Cloud fetch timed out after 10s") }), 10000)),
    ]);
    const { characters: cloudChars, error } = fetched;
    if (error) console.error("[useCharacters] listCharacters error:", error);
    return { cloudChars, error };
  }, []);

  // Initial load on mount / userId change.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      setLoaded(false);
      // Only reset storageError here if online — preserve the offline banner
      // set by the listener above.
      if (navigator.onLine !== false) setStorageError(null);

      // If the browser already knows it's offline, skip the Firestore hit
      // and go straight to cache. Firestore would throw anyway.
      if (navigator.onLine === false) {
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
        setCloudReachable(false);
        setStorageError("Offline — showing last cached data. Reconnect to edit.");
        setLoaded(true);
        return;
      }

      const { cloudChars, error } = await loadRoster(userId);
      if (cancelled) return;

      if (!error && cloudChars) {
        setCharactersState(cloudChars);
        syncedRef.current = new Map(cloudChars.map(c => [c.id, c]));
        setCloudReachable(true);
        const cached = await readCache(userId);
        if (cancelled) return;
        const cachedActive = cached?.activeId;
        setActiveIdState(cachedActive && cloudChars.some(c => c.id === cachedActive) ? cachedActive : null);
        await writeCache(userId, cloudChars, cachedActive ?? null);
      } else {
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
        setCloudReachable(false);
        if (error) setStorageError(`Offline — cloud unreachable: ${error.message || error}`);
      }
      setLoaded(true);
    })();

    return () => { cancelled = true; };
  }, [userId, loadRoster]);

  // When we come back online (or cloud becomes reachable again), refetch
  // the roster so we pick up any changes made on another device and so the
  // local snapshot matches cloud before sync resumes.
  useEffect(() => {
    if (!userId || !loaded) return;
    if (!isOnline) return;
    if (cloudReachable) return;
    let cancelled = false;
    (async () => {
      const { cloudChars, error } = await loadRoster(userId);
      if (cancelled) return;
      if (!error && cloudChars) {
        setCharactersState(cloudChars);
        syncedRef.current = new Map(cloudChars.map(c => [c.id, c]));
        setCloudReachable(true);
        setStorageError(null);
        await writeCache(userId, cloudChars, activeId);
      }
    })();
    return () => { cancelled = true; };
  }, [isOnline, cloudReachable, userId, loaded, loadRoster, activeId]);

  // Diff-based cloud sync. Blocked while read-only. On cloud failure we
  // flip cloudReachable=false so the offline banner fires and writes are
  // rejected until reconnect.
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
      setCloudReachable(false);
      setStorageError(`Cloud save failed: ${firstError.error.message || firstError.error}. Your changes were not saved.`);
      return;
    }

    // Firestore resolves setDoc/deleteDoc the moment they're queued locally,
    // which succeeds even while offline. Check that the queue actually
    // reached the server before marking the save successful. Timeout here
    // is our real "offline" signal.
    const flush = await flushOrDetectOffline(5000);
    if (!flush.flushed) {
      setCloudReachable(false);
      setStorageError("Offline — cloud unreachable. Your recent changes are queued locally but not saved.");
      return;
    }

    syncedRef.current = new Map(chars.map(c => [c.id, c]));
    await writeCache(userId, chars, aid);
    setCloudReachable(true);
    setStorageError(null);
  }, [userId, readOnly]);

  // Debounced save on any state mutation once loaded. Guard against running
  // while read-only — otherwise we'd diff against syncedRef and try to sync.
  useEffect(() => {
    if (!loaded || !userId || readOnly) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      syncCloud(characters, activeId);
    }, 500);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [characters, activeId, loaded, userId, readOnly, syncCloud]);

  // Write-path guards. Each is a no-op with an explanatory banner when
  // read-only — that way the user sees feedback instead of silent editing
  // that evaporates on reload or re-sync.
  const readOnlyMessage = () => isOnline
    ? "Cloud unreachable — changes can't be saved right now."
    : "Offline — reconnect to edit. Changes won't save until you're back online.";

  const setCharacters = useCallback((next) => {
    if (readOnly) {
      setStorageError(readOnlyMessage());
      return;
    }
    setCharactersState(next);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly, isOnline]);

  const setActiveId = useCallback((id) => {
    setActiveIdState(id);
  }, []);

  const activeChar = useMemo(() => characters.find(c => c.id === activeId), [characters, activeId]);

  const updateChar = useCallback((updater) => {
    if (readOnly) {
      setStorageError(readOnlyMessage());
      return;
    }
    setCharactersState(prev => prev.map(c => c.id === activeId ? { ...updater(c), updatedAt: new Date().toISOString() } : c));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, readOnly, isOnline]);

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
    readOnly, isOnline,
    updateChar, addLogEntry,
  };
}
