export default function Pip({ on, ko, onClick, n }) {
  const cls = "pip" + (ko ? " ko" : on ? " on" : "");
  return (
    <span className={cls} onClick={onClick}>
      {n != null ? n : ""}
    </span>
  );
}
