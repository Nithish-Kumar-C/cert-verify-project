import { useEffect } from "react";
import "./Toast.css";

const ICONS = { success: "✅", error: "❌", info: "ℹ️" };

function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div className={`toast toast--${toast.type}`}>
      <span>{ICONS[toast.type]}</span>
      <span>{toast.message}</span>
    </div>
  );
}

export default Toast;
