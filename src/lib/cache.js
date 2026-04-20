import { get, set, del } from "idb-keyval";

// User-scoped read cache for offline fallback. Cloud is the source of truth;
// this only hydrates the UI when the network is unreachable. Keyed by user
// so switching accounts on the same device does not leak data.
const CACHE_KEY = "dg-cache-v2";

export async function readCache(userId) {
  if (!userId) return null;
  try {
    const raw = await get(CACHE_KEY);
    if (!raw || raw.userId !== userId) return null;
    return {
      characters: Array.isArray(raw.characters) ? raw.characters : [],
      activeId: raw.activeId ?? null,
    };
  } catch {
    return null;
  }
}

export async function writeCache(userId, characters, activeId) {
  if (!userId) return;
  try {
    await set(CACHE_KEY, { userId, characters, activeId });
  } catch {
    // Quota errors are non-fatal — the cloud copy is authoritative.
  }
}

export async function clearCache() {
  try { await del(CACHE_KEY); } catch { /* noop */ }
}
