export function extractAdded(oldText, newText) {
  const o = (oldText || "").trim();
  const n = (newText || "").trim();
  if (!n) return null;
  if (n === o) return null;
  if (o && n.startsWith(o)) {
    const added = n.slice(o.length).trim();
    return added || null;
  }
  return n;
}

export function truncLog(s, max = 60) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max).trimEnd() + "\u2026" : s;
}

export function charName(c) {
  const name = [c.personal.firstName, c.personal.lastName].filter(Boolean).join(" ");
  return name || "Unnamed Agent";
}
