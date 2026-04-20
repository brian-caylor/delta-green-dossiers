export default function Stepper({ value, onChange, min = -999, max = 999, step = 1, width = 60 }) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  return (
    <div className="row" style={{ gap: 4 }}>
      <button type="button" className="btn btn-tiny" onClick={dec} style={{ padding: "2px 6px" }}>−</button>
      <input
        className="field-num"
        style={{ width }}
        type="number"
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          onChange(Number.isNaN(v) ? 0 : Math.max(min, Math.min(max, v)));
        }}
      />
      <button type="button" className="btn btn-tiny" onClick={inc} style={{ padding: "2px 6px" }}>+</button>
    </div>
  );
}
