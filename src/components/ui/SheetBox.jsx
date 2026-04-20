export default function SheetBox({ title, children, style, className = "" }) {
  return (
    <div className={`sheet-box ${className}`.trim()} style={style}>
      {title && <div className="sheet-box-title">{title}</div>}
      {children}
    </div>
  );
}
