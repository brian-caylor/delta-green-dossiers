import { get, set } from "idb-keyval";

const IDB_KEY = "delta-green-sheets";
const LS_KEY = "delta-green-sheets";

/**
 * Load character data. Tries IndexedDB first, falls back to localStorage
 * for seamless migration from pre-PWA versions.
 */
export async function loadFromStorage() {
  // Try IndexedDB first
  try {
    const data = await get(IDB_KEY);
    if (data) return { data, error: null };
  } catch (e) {
    console.warn("IndexedDB load failed, trying localStorage:", e.message);
  }

  // Fall back to localStorage (migration path)
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      // Migrate to IndexedDB silently
      try {
        await set(IDB_KEY, data);
        localStorage.removeItem(LS_KEY);
      } catch {
        // Migration failed — data still in localStorage, will retry next load
      }
      return { data, error: null };
    }
  } catch (e) {
    return { data: null, error: `Failed to load saved data: ${e.message}` };
  }

  return { data: null, error: null };
}

/**
 * Save character data to IndexedDB.
 */
export async function saveToStorage(characters, activeId) {
  try {
    await set(IDB_KEY, { characters, activeId });
    return null;
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      return "Storage quota exceeded. Your changes may not be saved. Try removing unused characters.";
    }
    return `Failed to save: ${e.message}`;
  }
}
