import {
  collection, doc, query, where, orderBy,
  getDocs, setDoc, deleteDoc, serverTimestamp,
  waitForPendingWrites,
} from "firebase/firestore";
import { db } from "./firebase.js";
import { charName } from "../utils/textHelpers.js";

// Firestore layout:
//   characters/{id}  — one doc per character
//     userId:      auth uid (owner)
//     name:        denormalized for roster listing
//     kia:         denormalized for roster badge
//     campaignId:  nullable, reserved for future Handler/Campaign mode
//     data:        full React-shape character blob
//     createdAt:   timestamp (first write)
//     updatedAt:   timestamp (every write)
//
// Security: enforced by firestore.rules — a user can only read/write docs
// where userId == request.auth.uid. Future Handler-read policy drops in
// alongside without reshaping docs (see plan's FWD-COMPAT section).

const CHARS = "characters";

function docToChar(d) {
  const row = d.data();
  return {
    ...(row.data || {}),
    id: d.id,
    updatedAt: row.updatedAt?.toDate?.().toISOString?.() ?? row.updatedAt ?? null,
  };
}

export async function listCharacters(userId) {
  try {
    const q = query(
      collection(db, CHARS),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
    );
    const snap = await getDocs(q);
    return { characters: snap.docs.map(docToChar), error: null };
  } catch (error) {
    return { characters: null, error };
  }
}

export async function upsertCharacter(char, userId) {
  try {
    await setDoc(
      doc(db, CHARS, char.id),
      {
        userId,
        name: charName(char) || "",
        kia: !!char.kia,
        campaignId: char.campaignId ?? null,
        data: char,
        updatedAt: serverTimestamp(),
        // createdAt only on first write — merge:true leaves it alone later.
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
    return { error: null };
  } catch (error) {
    return { error };
  }
}

export async function deleteCharacter(id) {
  try {
    await deleteDoc(doc(db, CHARS, id));
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// Check whether the Firestore SDK has actually flushed recent writes to
// the server. setDoc / deleteDoc resolve as soon as their ops are queued
// locally, which happens instantly even while offline — so we can't use
// those promises to detect connectivity. waitForPendingWrites only resolves
// once every pending op has reached the server. If it's still pending
// after `timeoutMs`, we treat the cloud as unreachable.
export async function flushOrDetectOffline(timeoutMs = 5000) {
  let timer;
  const timeoutPromise = new Promise((resolve) => {
    timer = setTimeout(() => resolve({ flushed: false }), timeoutMs);
  });
  try {
    const result = await Promise.race([
      waitForPendingWrites(db).then(() => ({ flushed: true })),
      timeoutPromise,
    ]);
    return result;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
