// Monochromatic SVG icons for each die type. Stroke uses currentColor so
// the icon inherits its color from the surrounding text style — lets us
// tint them in different palette themes without recoloring the SVG.

const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinejoin: "round", strokeLinecap: "round" };

export function DieIcon({ sides, size = 32 }) {
  switch (sides) {
    case 4:   return <D4   size={size} />;
    case 6:   return <D6   size={size} />;
    case 8:   return <D8   size={size} />;
    case 10:  return <D10  size={size} />;
    case 12:  return <D12  size={size} />;
    case 20:  return <D20  size={size} />;
    case 100: return <D100 size={size} />;
    default:  return null;
  }
}

function D4({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...base}>
      <polygon points="16,3 29,27 3,27" {...base} />
      <line x1="16" y1="3" x2="16" y2="27" {...base} />
    </svg>
  );
}

function D6({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...base}>
      <polygon points="6,10 16,4 26,10 26,24 16,30 6,24" {...base} />
      <polyline points="6,10 16,16 26,10" {...base} />
      <line x1="16" y1="16" x2="16" y2="30" {...base} />
    </svg>
  );
}

function D8({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...base}>
      <polygon points="16,3 29,16 16,29 3,16" {...base} />
      <line x1="3" y1="16" x2="29" y2="16" {...base} />
      <line x1="16" y1="3" x2="16" y2="29" {...base} strokeDasharray="1.5 2" />
    </svg>
  );
}

function D10({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...base}>
      <polygon points="16,3 28,12 23,27 9,27 4,12" {...base} />
      <polyline points="4,12 16,18 28,12" {...base} />
      <line x1="16" y1="18" x2="16" y2="27" {...base} />
    </svg>
  );
}

function D12({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...base}>
      <polygon points="16,3 28,11 25,25 7,25 4,11" {...base} />
      <polygon points="16,9 22,13 20,20 12,20 10,13" {...base} />
    </svg>
  );
}

function D20({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...base}>
      <polygon points="16,3 28,10 28,22 16,29 4,22 4,10" {...base} />
      <polygon points="16,10 23,15 20,23 12,23 9,15" {...base} />
      <line x1="16" y1="3"  x2="16" y2="10" {...base} />
      <line x1="4"  y1="10" x2="9"  y2="15" {...base} />
      <line x1="28" y1="10" x2="23" y2="15" {...base} />
      <line x1="4"  y1="22" x2="12" y2="23" {...base} />
      <line x1="28" y1="22" x2="20" y2="23" {...base} />
      <line x1="16" y1="29" x2="16" y2="23" {...base} />
    </svg>
  );
}

function D100({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...base}>
      <circle cx="16" cy="16" r="13" {...base} />
      <text x="16" y="21" fontSize="11" fontFamily="'IBM Plex Mono', monospace" textAnchor="middle" fill="currentColor" stroke="none">%</text>
    </svg>
  );
}
