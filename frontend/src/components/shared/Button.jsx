import "./Button.css";

function Button({
  children, variant = "primary", size = "", full = false,
  loading = false, disabled = false, onClick, type = "button",
}) {
  const cls = ["btn", `btn--${variant}`, size && `btn--${size}`, full && "btn--full"]
    .filter(Boolean).join(" ");

  return (
    <button className={cls} onClick={onClick} disabled={disabled || loading} type={type}>
      {loading && <span className="btn__spinner" />}
      {children}
    </button>
  );
}

export default Button;
