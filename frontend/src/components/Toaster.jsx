import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const ToastCtx = createContext(null);
export const useToaster = () => useContext(ToastCtx);

export default function ToasterProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeouts = useRef({}); // Track timeouts for safety

  // Add toast
  const push = useCallback((variant, text, duration = 3500) => {
    const id = crypto.randomUUID();

    setToasts((prev) => {
      // Limit to max 5 toasts
      if (prev.length >= 5) prev.shift();
      return [...prev, { id, variant, text }];
    });

    // Auto remove
    timeouts.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      delete timeouts.current[id];
    }, duration);
  }, []);

  // Remove manually (click to close)
  const remove = (id) => {
    clearTimeout(timeouts.current[id]);
    delete timeouts.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const value = {
    success: (msg, duration) => push("success", msg, duration),
    error: (msg, duration) => push("danger", msg, duration),
    info: (msg, duration) => push("info", msg, duration),
    warning: (msg, duration) => push("warning", msg, duration),
  };

  return (
    <ToastCtx.Provider value={value}>
      {children}

      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            bg={t.variant}
            className="text-white shadow-sm"
            onClose={() => remove(t.id)}
            autohide={false}
            style={{ cursor: "pointer" }}
          >
            <Toast.Body className="fw-semibold">{t.text}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastCtx.Provider>
  );
}
