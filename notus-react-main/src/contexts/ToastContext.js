import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = toastId++;
    const toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, toast]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    // Play sound
    playSound(type);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast(message, "success", duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, "error", duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, "warning", duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, "info", duration), [addToast]);

  const playSound = (type) => {
    try {
      const audio = new Audio();
      // Frequencies for different notification types
      const frequencies = {
        success: [523.25, 659.25, 783.99], // C E G
        error: [392.00, 329.63], // G E
        warning: [440.00, 493.88], // A B
        info: [523.25, 587.33] // C D
      };
      
      const freq = frequencies[type] || frequencies.info;
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = freq[0];
      oscillator.type = "sine";
      gainNode.gain.value = 0.1;
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.15);
      
      if (freq[1]) {
        const osc2 = context.createOscillator();
        osc2.connect(gainNode);
        osc2.frequency.value = freq[1];
        osc2.type = "sine";
        osc2.start(context.currentTime + 0.1);
        osc2.stop(context.currentTime + 0.25);
      }
    } catch (e) {
      // Silent fail if audio not supported
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info, toasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      top: 20,
      right: 20,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 12,
      maxWidth: 400,
    }}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  const { id, message, type } = toast;

  const styles = {
    success: {
      background: "linear-gradient(135deg, #10b981, #059669)",
      icon: "✅",
    },
    error: {
      background: "linear-gradient(135deg, #ef4444, #dc2626)",
      icon: "❌",
    },
    warning: {
      background: "linear-gradient(135deg, #f59e0b, #d97706)",
      icon: "⚠️",
    },
    info: {
      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
      icon: "ℹ️",
    },
  };

  const style = styles[type] || styles.info;

  return (
    <div
      style={{
        background: style.background,
        color: "#fff",
        padding: "14px 18px",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: 14,
        fontWeight: 600,
        animation: "slideIn 0.3s ease-out",
        cursor: "pointer",
      }}
      onClick={() => onRemove(id)}
    >
      <span style={{ fontSize: 20 }}>{style.icon}</span>
      <div style={{ flex: 1 }}>{message}</div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          border: "none",
          borderRadius: 6,
          color: "#fff",
          cursor: "pointer",
          padding: "4px 8px",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
