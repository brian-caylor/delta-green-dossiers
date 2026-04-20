export default function Check({ checked, onChange, filled, title }) {
  const cls = "check" + (checked ? " checked" : "") + (filled ? " filled" : "");
  return (
    <span
      className={cls}
      onClick={() => onChange && onChange(!checked)}
      title={title}
      role="button"
    />
  );
}
