import React, { useState, useEffect, createContext, useContext } from 'react';

// Context pour les notifications toast
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Types de toast avec styles
const TOAST_TYPES = {
  success: {
    icon: '✅',
    color: '#10b981',
    bg: '#d1fae5',
    border: '#86efac'
  },
  error: {
    icon: '❌',
    color: '#ef4444',
    bg: '#fee2e2',
    border: '#fca5a5'
  },
  warning: {
    icon: '⚠️',
    color: '#f59e0b',
    bg: '#fef3c7',
    border: '#fcd34d'
  },
  info: {
    icon: 'ℹ️',
    color: '#3b82f6',
    bg: '#dbeafe',
    border: '#93c5fd'
  },
  notification: {
    icon: '🔔',
    color: '#8b5cf6',
    bg: '#ede9fe',
    border: '#c4b5fd'
  }
};

// Composant Toast individuel
const Toast = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  
  const type = TOAST_TYPES[toast.type] || TOAST_TYPES.info;

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss
    if (toast.duration && toast.duration > 0) {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (toast.duration / 100));
          if (newProgress <= 0) {
            clearInterval(progressInterval);
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(progressInterval);
    }
  }, [toast.duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(toast.id), 300);
  };

  return (
    <div
      style={{
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        border: `2px solid ${type.border}`,
        marginBottom: '12px',
        overflow: 'hidden',
        maxWidth: '400px',
        minWidth: '300px'
      }}
    >
      {/* Barre de progression */}
      {toast.duration && toast.duration > 0 && (
        <div style={{
          height: '3px',
          background: '#f3f4f6',
          position: 'relative'
        }}>
          <div style={{
            height: '100%',
            background: type.color,
            width: `${progress}%`,
            transition: 'width 0.1s linear'
          }} />
        </div>
      )}

      <div style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        {/* Icône */}
        <div style={{
          fontSize: '20px',
          flexShrink: 0,
          marginTop: '2px'
        }}>
          {type.icon}
        </div>

        {/* Contenu */}
        <div style={{ flex: 1 }}>
          {toast.title && (
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              margin: '0 0 4px 0',
              color: '#1f2937'
            }}>
              {toast.title}
            </h4>
          )}
          
          <p style={{
            fontSize: '13px',
            color: '#4b5563',
            margin: 0,
            lineHeight: '1.4'
          }}>
            {toast.message}
          </p>

          {/* Actions */}
          {toast.actions && toast.actions.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px'
            }}>
              {toast.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    if (action.closeOnClick !== false) {
                      handleClose();
                    }
                  }}
                  style={{
                    background: action.primary ? type.color : 'transparent',
                    color: action.primary ? 'white' : type.color,
                    border: `1px solid ${type.color}`,
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#9ca3af',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
          onMouseOut={(e) => e.target.style.background = 'none'}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Provider pour les notifications toast
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    };
    
    setToasts(prev => [newToast, ...prev.slice(0, 4)]); // Max 5 toasts
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Méthodes de convenance
  const showSuccess = (message, options = {}) => {
    return addToast({ ...options, type: 'success', message });
  };

  const showError = (message, options = {}) => {
    return addToast({ ...options, type: 'error', message, duration: 7000 });
  };

  const showWarning = (message, options = {}) => {
    return addToast({ ...options, type: 'warning', message, duration: 6000 });
  };

  const showInfo = (message, options = {}) => {
    return addToast({ ...options, type: 'info', message });
  };

  const showNotification = (message, options = {}) => {
    return addToast({ ...options, type: 'notification', message, duration: 8000 });
  };

  const contextValue = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNotification
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Container des toasts */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <Toast toast={toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Hook personnalisé pour les notifications contextuelles
export const useContextualNotifications = () => {
  const toast = useToast();

  const notifyProjectCreated = (projectName) => {
    toast.showSuccess(`Projet "${projectName}" créé avec succès!`, {
      title: '🏗️ Nouveau Projet',
      actions: [
        {
          label: 'Voir Projet',
          primary: true,
          onClick: () => window.location.href = '/admin/projects'
        }
      ]
    });
  };

  const notifyComponentOrdered = (componentCount, projectName) => {
    toast.showNotification(
      `${componentCount} composant(s) commandé(s) pour "${projectName}"`,
      {
        title: '📦 Commande Composants',
        actions: [
          {
            label: 'Voir Stock',
            onClick: () => window.location.href = '/admin/components'
          },
          {
            label: 'Dashboard Magasinier',
            primary: true,
            onClick: () => window.location.href = '/admin/magasinier'
          }
        ]
      }
    );
  };

  const notifyStockAlert = (componentName, remainingStock) => {
    toast.showWarning(
      `Stock faible: ${componentName} (${remainingStock} restant(s))`,
      {
        title: '⚠️ Alerte Stock',
        duration: 10000,
        actions: [
          {
            label: 'Recommander',
            primary: true,
            onClick: () => console.log('Reorder component')
          },
          {
            label: 'Voir Stock',
            onClick: () => window.location.href = '/admin/components'
          }
        ]
      }
    );
  };

  const notifyMaintenanceDue = (equipmentName, dueDate) => {
    toast.showInfo(
      `Maintenance programmée: ${equipmentName} le ${dueDate}`,
      {
        title: '🔧 Maintenance Prévue',
        actions: [
          {
            label: 'Voir Planning',
            primary: true,
            onClick: () => window.location.href = '/admin/interventions'
          }
        ]
      }
    );
  };

  const notifyUrgentRepair = (equipmentName, location) => {
    toast.showError(
      `Panne critique: ${equipmentName} à ${location}`,
      {
        title: '🚨 Intervention Urgente',
        duration: 0, // Pas d'auto-dismiss
        actions: [
          {
            label: 'Intervention d\'Urgence',
            primary: true,
            onClick: () => window.location.href = '/admin/interventions?urgent=true'
          },
          {
            label: 'Alerter Équipe',
            onClick: () => console.log('Alert team')
          }
        ]
      }
    );
  };

  const notifySystemUpdate = (version, features) => {
    toast.showInfo(
      `Nouvelle version ${version} disponible avec ${features.length} nouvelles fonctionnalités`,
      {
        title: '🔄 Mise à Jour Système',
        actions: [
          {
            label: 'Voir Détails',
            primary: true,
            onClick: () => console.log('Show update details')
          }
        ]
      }
    );
  };

  return {
    notifyProjectCreated,
    notifyComponentOrdered,
    notifyStockAlert,
    notifyMaintenanceDue,
    notifyUrgentRepair,
    notifySystemUpdate
  };
};

export default ToastProvider;
