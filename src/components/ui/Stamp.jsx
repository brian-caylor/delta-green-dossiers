export default function Stamp({ text, rotate = -3, color }) {
  const extra = color === "blue" ? " stamp-blue" : "";
  return (
    <span className={"stamp" + extra} style={{ transform: `rotate(${rotate}deg)` }}>
      {text}
    </span>
  );
}
