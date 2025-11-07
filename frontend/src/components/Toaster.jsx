import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const ToastCtx = createContext(null);
export const useToaster = () => useContext(ToastCtx);

export default function ToasterProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((variant, text) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, variant, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const value = {
    success: (t) => push("success", t),
    error: (t) => push("danger", t),
    info: (t) => push("info", t),
  };

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <ToastContainer position="top-end" className="p-3">
        {toasts.map((t) => (
          <Toast key={t.id} bg={t.variant} className="text-white">
            <Toast.Body>{t.text}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastCtx.Provider>
  );
}
