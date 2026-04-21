import changelogRaw from "../../CHANGELOG.md?raw";

// Parse CHANGELOG.md into discrete entries. Format convention:
//   ## YYYY-MM-DD — Title
//   (optional paragraph)
//   - bullet one
//   - bullet two
//
// Returns newest-first as { date, title, blocks } where each block is
// either { kind: "p", text } or { kind: "ul", items: [text, ...] }.
//
// [FWD-COMPAT] Intentionally dumb: no nested bullets, no headings,
// `**bold**` preserved as-is so the renderer can choose to strip or
// bold it. If CHANGELOG format grows a real markdown surface, swap
// for a micro-renderer at that point — don't pre-optimize.

const ENTRY_SPLIT = /^## /m;

export function parseChangelog(raw = changelogRaw, limit = 3) {
  const chunks = raw.split(ENTRY_SPLIT).slice(1); // drop preamble
  const entries = [];

  for (const chunk of chunks) {
    const nl = chunk.indexOf("\n");
    if (nl < 0) continue;
    const headingLine = chunk.slice(0, nl).trim();
    const body = chunk.slice(nl + 1);

    const dashMatch = headingLine.match(/^(\S+)\s+[—–-]\s+(.+)$/);
    const date = dashMatch ? dashMatch[1] : headingLine;
    const title = dashMatch ? dashMatch[2] : "";

    entries.push({ date, title, blocks: parseBlocks(body) });
    if (entries.length >= limit) break;
  }

  return entries;
}

function parseBlocks(body) {
  const blocks = [];
  const lines = body.split("\n");
  let paragraph = [];
  let list = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "p", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ kind: "ul", items: list });
      list = null;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    const bullet = line.match(/^\s*- (.*)$/);
    if (bullet) {
      flushParagraph();
      if (!list) list = [];
      list.push(bullet[1]);
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();

  return blocks;
}
