import { parseChangelog } from "../../lib/changelog.js";

// GitHub location of the docs. Hardcoded per the v1 plan — move to an
// env constant if the repo ever moves.
const REPO_BASE = "https://github.com/brian-caylor/delta-green-dossiers/blob/main";

const DOCS_LINKS = [
  { href: `${REPO_BASE}/USER_GUIDE.md`, label: "User guide", hint: "Every feature in one long reference" },
  { href: `${REPO_BASE}/QUICKSTART.md`, label: "Quickstart", hint: "Two-minute onboarding for new players" },
  { href: `${REPO_BASE}/CHANGELOG.md`, label: "Full changelog", hint: "Complete history of user-facing changes" },
  { href: `${REPO_BASE}/TROUBLESHOOTING.md`, label: "Troubleshooting", hint: "Auth / offline / sync gotchas" },
  { href: `${REPO_BASE}/README.md`, label: "Readme", hint: "Tech stack and architecture overview" },
];

export default function AboutSection() {
  const entries = parseChangelog(undefined, 3);
  const latestDate = entries[0]?.date || "—";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="sheet-box" style={{ padding: "12px 14px" }}>
        <div className="sheet-box-title">Build</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "var(--ink)", letterSpacing: 1 }}>
            Delta Green — Agent Dossiers
          </div>
          <div className="label">Last updated {latestDate}</div>
        </div>
      </div>

      <div>
        <div className="dice-section-label" style={{ marginBottom: 8 }}>What's New</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {entries.length === 0 && (
            <div className="label" style={{ fontStyle: "italic" }}>
              No changelog entries found.
            </div>
          )}
          {entries.map((entry, i) => (
            <div key={i} className="settings-changelog-entry">
              <div className="settings-changelog-head">
                <span className="settings-changelog-date">{entry.date}</span>
                {entry.title && <span className="settings-changelog-title">{entry.title}</span>}
              </div>
              <ChangelogBody blocks={entry.blocks} />
            </div>
          ))}
        </div>
        <a
          href={`${REPO_BASE}/CHANGELOG.md`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-ghost"
          style={{ marginTop: 12, width: "100%", justifyContent: "center", textDecoration: "none" }}
        >
          View full changelog →
        </a>
      </div>

      <div>
        <div className="dice-section-label" style={{ marginBottom: 8 }}>Docs &amp; Links</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {DOCS_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="settings-link-row"
            >
              <span className="settings-link-label">{link.label}</span>
              <span className="settings-link-hint">{link.hint}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// Render a parsed changelog entry's blocks. Bullets → list, prose →
// paragraph. **bold** inline markers are rendered as <strong>; other
// markdown flavours are left as literal text on purpose.
function ChangelogBody({ blocks }) {
  return (
    <div className="settings-changelog-body">
      {blocks.map((block, i) => {
        if (block.kind === "ul") {
          return (
            <ul key={i} className="settings-changelog-list">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i} className="settings-changelog-p">{renderInline(block.text)}</p>;
      })}
    </div>
  );
}

// Bare-bones inline renderer: split on **bold** markers. No links, no
// emphasis. Anything more and the CHANGELOG should move to a real
// markdown renderer.
function renderInline(text) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
  );
}
