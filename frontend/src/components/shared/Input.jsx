import "./Input.css";

function Input({ label, type = "text", placeholder, value, onChange, error, hint, name, required }) {
  return (
    <div className="field">
      {label && (
        <label className="field__label">
          {label}{required && <span className="field__req">*</span>}
        </label>
      )}
      <input
        className={`field__input${error ? " field__input--err" : ""}`}
        type={type} placeholder={placeholder} value={value}
        onChange={onChange} name={name} required={required}
      />
      {error  && <span className="field__error">{error}</span>}
      {hint && !error && <span className="field__hint">{hint}</span>}
    </div>
  );
}

export function Select({ label, value, onChange, options = [], name, required }) {
  return (
    <div className="field">
      {label && (
        <label className="field__label">
          {label}{required && <span className="field__req">*</span>}
        </label>
      )}
      <select className="field__select" value={value} onChange={onChange} name={name}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default Input;
