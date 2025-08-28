import React, { useState, useEffect, createContext, useContext } from 'react';

// Context pour les notifications
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Types de notifications
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  BUDGET_ALERT: 'budget_alert',
  TASK_ASSIGNED: 'task_assigned',
  APPROVAL_NEEDED: 'approval_needed'
};

// Provider pour les notifications
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    enableSound: true,
    enableDesktop: true,
    autoHide: true,
    hideDelay: 5000
  });

  // Ajouter une notification
  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Notification desktop
    if (settings.enableDesktop && 'Notification' in window) {
      showDesktopNotification(notification);
    }

    // Auto-hide
    if (settings.autoHide && notification.type !== NOTIFICATION_TYPES.ERROR) {
      setTimeout(() => {
        removeNotification(id);
      }, settings.hideDelay);
    }

    return id;
  };

  // Supprimer une notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Marquer comme lu
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Marquer toutes comme lues
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Vider toutes les notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Notification desktop
  const showDesktopNotification = (notification) => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      });
    }
  };

  // Notifications prédéfinies pour Sagemcom
  const notificationTemplates = {
    budgetAlert: (projectName, percentage) => ({
      type: NOTIFICATION_TYPES.BUDGET_ALERT,
      title: '⚠️ Alerte Budget',
      message: `Le projet "${projectName}" a utilisé ${percentage}% de son budget`,
      priority: 'high'
    }),
    
    taskAssigned: (taskName, assignee) => ({
      type: NOTIFICATION_TYPES.TASK_ASSIGNED,
      title: '📋 Nouvelle Tâche',
      message: `Tâche "${taskName}" assignée à ${assignee}`,
      priority: 'medium'
    }),
    
    approvalNeeded: (itemName, requester) => ({
      type: NOTIFICATION_TYPES.APPROVAL_NEEDED,
      title: '✅ Approbation Requise',
      message: `"${itemName}" nécessite votre approbation (demandé par ${requester})`,
      priority: 'high'
    }),
    
    stockLow: (componentName, quantity) => ({
      type: NOTIFICATION_TYPES.WARNING,
      title: '📦 Stock Faible',
      message: `Stock critique pour ${componentName}: ${quantity} unités restantes`,
      priority: 'medium'
    }),
    
    maintenanceComplete: (equipmentName, technicianName) => ({
      type: NOTIFICATION_TYPES.SUCCESS,
      title: '🔧 Maintenance Terminée',
      message: `Maintenance de ${equipmentName} terminée par ${technicianName}`,
      priority: 'low'
    })
  };

  const value = {
    notifications,
    settings,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    setSettings,
    notificationTemplates,
    NOTIFICATION_TYPES
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Composant d'affichage des notifications
export const NotificationDisplay = () => {
  const { notifications, removeNotification, markAsRead } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS: return '✅';
      case NOTIFICATION_TYPES.ERROR: return '❌';
      case NOTIFICATION_TYPES.WARNING: return '⚠️';
      case NOTIFICATION_TYPES.INFO: return 'ℹ️';
      case NOTIFICATION_TYPES.BUDGET_ALERT: return '💰';
      case NOTIFICATION_TYPES.TASK_ASSIGNED: return '📋';
      case NOTIFICATION_TYPES.APPROVAL_NEEDED: return '✅';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS: return '#10b981';
      case NOTIFICATION_TYPES.ERROR: return '#dc2626';
      case NOTIFICATION_TYPES.WARNING: return '#f59e0b';
      case NOTIFICATION_TYPES.INFO: return '#0078d4';
      case NOTIFICATION_TYPES.BUDGET_ALERT: return '#dc2626';
      case NOTIFICATION_TYPES.TASK_ASSIGNED: return '#0078d4';
      case NOTIFICATION_TYPES.APPROVAL_NEEDED: return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      maxWidth: '400px'
    }}>
      {notifications.slice(0, 5).map((notification) => (
        <div
          key={notification.id}
          style={{
            background: 'white',
            border: `2px solid ${getNotificationColor(notification.type)}`,
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            animation: 'slideInRight 0.3s ease-out',
            cursor: 'pointer',
            opacity: notification.read ? 0.7 : 1
          }}
          onClick={() => markAsRead(notification.id)}
        >
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>
              {getNotificationIcon(notification.type)}
            </span>
            <div style={{ flex: 1 }}>
              <h4 style={{
                margin: '0 0 0.25rem 0',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#374151'
              }}>
                {notification.title}
              </h4>
              <p style={{
                margin: 0,
                fontSize: '0.8rem',
                color: '#6b7280',
                lineHeight: '1.4'
              }}>
                {notification.message}
              </p>
              <span style={{
                fontSize: '0.7rem',
                color: '#9ca3af',
                marginTop: '0.25rem',
                display: 'block'
              }}>
                {new Date(notification.timestamp).toLocaleTimeString('fr-FR')}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: '0.25rem'
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
      
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
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

// Hook pour les notifications métier Sagemcom
export const useSagemcomNotifications = () => {
  const { addNotification, notificationTemplates } = useNotifications();

  const notifyBudgetAlert = (projectName, percentage) => {
    addNotification(notificationTemplates.budgetAlert(projectName, percentage));
  };

  const notifyTaskAssigned = (taskName, assignee) => {
    addNotification(notificationTemplates.taskAssigned(taskName, assignee));
  };

  const notifyApprovalNeeded = (itemName, requester) => {
    addNotification(notificationTemplates.approvalNeeded(itemName, requester));
  };

  const notifyStockLow = (componentName, quantity) => {
    addNotification(notificationTemplates.stockLow(componentName, quantity));
  };

  const notifyMaintenanceComplete = (equipmentName, technicianName) => {
    addNotification(notificationTemplates.maintenanceComplete(equipmentName, technicianName));
  };

  return {
    notifyBudgetAlert,
    notifyTaskAssigned,
    notifyApprovalNeeded,
    notifyStockLow,
    notifyMaintenanceComplete
  };
};

export default NotificationProvider;
