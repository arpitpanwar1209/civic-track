// src/components/ToasterProvider.jsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaInfoCircle, 
  FaExclamationTriangle 
} from "react-icons/fa";

const ToastCtx = createContext(null);
export const useToaster = () => useContext(ToastCtx);

export default function ToasterProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeouts = useRef({}); 

  // Add toast
  const push = useCallback((variant, text, duration = 4000) => {
    const id = crypto.randomUUID();

    const iconMap = {
      success: <FaCheckCircle className="text-success me-2" />,
      danger: <FaExclamationCircle className="text-danger me-2" />,
      info: <FaInfoCircle className="text-info me-2" />,
      warning: <FaExclamationTriangle className="text-warning me-2" />,
    };

    setToasts((prev) => {
      // Limit to max 4 toasts for cleaner UI
      const currentToasts = prev.length >= 4 ? prev.slice(1) : prev;
      return [...currentToasts, { id, variant, text, icon: iconMap[variant] }];
    });

    // Auto remove logic
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

      <ToastContainer 
        position="top-end" 
        className="p-4" 
        style={{ zIndex: 10000, position: 'fixed' }}
      >
        {toasts.map((t) => (
          <Toast
            key={t.id}
            onClose={() => remove(t.id)}
            autohide={false}
            className="border-0 bg-white mb-3 overflow-hidden shadow-lg"
            style={{ 
              borderRadius: '12px', 
              minWidth: '300px',
              borderLeft: `6px solid var(--bs-${t.variant})` 
            }}
          >
            <Toast.Body className="d-flex align-items-center py-3 px-3">
              <div className="fs-5 d-flex align-items-center">
                {t.icon}
              </div>
              <div className="flex-grow-1 mx-2">
                <p className="mb-0 fw-bold text-dark small text-uppercase tracking-tight" style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                  {t.variant === 'danger' ? 'System Error' : 'Notification'}
                </p>
                <p className="mb-0 fw-semibold text-dark lh-sm">
                  {t.text}
                </p>
              </div>
              <button 
                onClick={() => remove(t.id)}
                className="btn-close ms-auto small shadow-none" 
                style={{ fontSize: '0.7rem' }}
              />
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastCtx.Provider>
  );
}