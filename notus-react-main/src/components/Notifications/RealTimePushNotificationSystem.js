import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

// Context pour les notifications push
const PushNotificationContext = createContext();

export const usePushNotifications = () => {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error('usePushNotifications must be used within a PushNotificationProvider');
  }
  return context;
};

// Types de notifications avec priorités
const NOTIFICATION_TYPES = {
  STOCK_CRITICAL: {
    priority: 'CRITICAL',
    color: '#dc2626',
    icon: '🚨',
    sound: 'critical-alert.mp3',
    vibration: [200, 100, 200, 100, 200],
    persistent: true
  },
  STOCK_LOW: {
    priority: 'HIGH',
    color: '#f59e0b',
    icon: '⚠️',
    sound: 'warning.mp3',
    vibration: [100, 50, 100],
    persistent: false
  },
  ORDER_RECEIVED: {
    priority: 'NORMAL',
    color: '#3b82f6',
    icon: '📦',
    sound: 'notification.mp3',
    vibration: [50],
    persistent: false
  },
  MAINTENANCE_DUE: {
    priority: 'HIGH',
    color: '#8b5cf6',
    icon: '🔧',
    sound: 'maintenance.mp3',
    vibration: [100, 100, 100],
    persistent: true
  },
  SYSTEM_UPDATE: {
    priority: 'LOW',
    color: '#10b981',
    icon: '🔄',
    sound: 'soft-notification.mp3',
    vibration: [30],
    persistent: false
  }
};

// Service Worker pour notifications push
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw-notifications.js');
      console.log('🔔 Service Worker enregistré:', registration);
      return registration;
    } catch (error) {
      console.error('❌ Erreur Service Worker:', error);
      return null;
    }
  }
  return null;
};

// Demander permission pour notifications
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('🔔 Permission notifications:', permission);
    return permission === 'granted';
  }
  return false;
};

// Composant de notification flottante
const FloatingNotification = ({ notification, onClose, onAction }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timeoutRef = useRef();
  const intervalRef = useRef();

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss si pas persistant
    if (!notification.persistent) {
      const duration = 5000;
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, duration);

      // Barre de progression
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [notification.persistent]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(notification.id), 300);
  };

  const handleAction = (action) => {
    onAction(notification.id, action);
    handleClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: isVisible ? '20px' : '-400px',
      width: '350px',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      border: `2px solid ${notification.type.color}`,
      zIndex: 10000,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-10px) scale(0.95)',
      opacity: isVisible ? 1 : 0
    }}>
      {/* Barre de progression */}
      {!notification.persistent && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '3px',
          width: `${progress}%`,
          background: notification.type.color,
          borderRadius: '16px 16px 0 0',
          transition: 'width 0.1s linear'
        }} />
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px 12px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '24px',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
          }}>
            {notification.type.icon}
          </div>
          <div>
            <h4 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937'
            }}>
              {notification.title}
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '2px'
            }}>
              <span style={{
                background: notification.type.color,
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                {notification.type.priority}
              </span>
              <span style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>
                {new Date(notification.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '4px',
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 0, 0, 0.1)';
            e.target.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#6b7280';
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 20px' }}>
        <p style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          color: '#4b5563',
          lineHeight: '1.5'
        }}>
          {notification.message}
        </p>

        {/* Actions */}
        {notification.actions && notification.actions.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {notification.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action)}
                style={{
                  background: action.primary ? notification.type.color : 'transparent',
                  color: action.primary ? 'white' : notification.type.color,
                  border: `2px solid ${notification.type.color}`,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!action.primary) {
                    e.target.style.background = notification.type.color;
                    e.target.style.color = 'white';
                  } else {
                    e.target.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!action.primary) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = notification.type.color;
                  } else {
                    e.target.style.transform = 'scale(1)';
                  }
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Metadata */}
        {notification.metadata && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            {Object.entries(notification.metadata).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>{key}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Provider principal
export const PushNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isSupported, setIsSupported] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [serviceWorkerReg, setServiceWorkerReg] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const audioRef = useRef({});

  // Initialisation
  useEffect(() => {
    initializePushNotifications();
    connectWebSocket();
    preloadSounds();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const initializePushNotifications = async () => {
    // Vérifier support
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      // Demander permission
      const permission = await requestNotificationPermission();
      setIsPermissionGranted(permission);

      // Enregistrer Service Worker
      const registration = await registerServiceWorker();
      setServiceWorkerReg(registration);
    }
  };

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:8089/PI/PI/websocket/notifications');
      
      ws.onopen = () => {
        console.log('🔗 WebSocket connecté');
        setIsConnected(true);
        
        // Authentifier avec userId
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
          ws.send(JSON.stringify({
            type: 'AUTH',
            userId: user.id,
            role: user.role
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingNotification(data);
        } catch (error) {
          console.error('❌ Erreur parsing WebSocket:', error);
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket déconnecté');
        setIsConnected(false);
        
        // Reconnexion automatique après 5 secondes
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('❌ Erreur connexion WebSocket:', error);
    }
  };

  const preloadSounds = () => {
    Object.values(NOTIFICATION_TYPES).forEach(type => {
      if (type.sound) {
        const audio = new Audio(`/sounds/${type.sound}`);
        audio.preload = 'auto';
        audioRef.current[type.sound] = audio;
      }
    });
  };

  const handleIncomingNotification = (data) => {
    const notificationType = NOTIFICATION_TYPES[data.type] || NOTIFICATION_TYPES.ORDER_RECEIVED;
    
    const notification = {
      id: Date.now() + Math.random(),
      title: data.title,
      message: data.message,
      type: notificationType,
      timestamp: data.timestamp || new Date().toISOString(),
      actions: data.actions,
      metadata: data.metadata,
      persistent: notificationType.persistent
    };

    // Ajouter à la liste
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Max 5 notifications

    // Effets sonores et vibrations
    playNotificationEffects(notificationType);

    // Notification native du navigateur
    if (isPermissionGranted) {
      showNativeNotification(notification);
    }
  };

  const playNotificationEffects = (type) => {
    // Son
    if (type.sound && audioRef.current[type.sound]) {
      audioRef.current[type.sound].play().catch(e => console.log('Son non joué:', e));
    }

    // Vibration
    if ('vibrate' in navigator && type.vibration) {
      navigator.vibrate(type.vibration);
    }
  };

  const showNativeNotification = (notification) => {
    if (document.hidden) { // Seulement si l'onglet n'est pas actif
      const nativeNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/badge-icon.png',
        tag: notification.id,
        requireInteraction: notification.persistent,
        actions: notification.actions?.map(action => ({
          action: action.id,
          title: action.label
        }))
      });

      nativeNotif.onclick = () => {
        window.focus();
        nativeNotif.close();
      };
    }
  };

  const sendNotification = (type, title, message, options = {}) => {
    const notificationData = {
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      ...options
    };

    // Envoyer via WebSocket si connecté
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(notificationData));
    } else {
      // Fallback: traiter localement
      handleIncomingNotification(notificationData);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationAction = (id, action) => {
    console.log('🎯 Action notification:', id, action);
    
    // Traiter l'action selon le type
    switch (action.id) {
      case 'view_stock':
        window.location.href = '/admin/components';
        break;
      case 'order_now':
        window.location.href = '/admin/components?action=order';
        break;
      case 'view_maintenance':
        window.location.href = '/admin/interventions';
        break;
      case 'dismiss':
        // Juste fermer
        break;
      default:
        console.log('Action non reconnue:', action);
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    isSupported,
    isPermissionGranted,
    isConnected,
    sendNotification,
    removeNotification,
    clearAllNotifications,
    handleNotificationAction
  };

  return (
    <PushNotificationContext.Provider value={value}>
      {children}
      
      {/* Notifications flottantes */}
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 10000 }}>
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              marginBottom: '12px',
              transform: `translateY(${index * 10}px)`,
              zIndex: 10000 - index
            }}
          >
            <FloatingNotification
              notification={notification}
              onClose={removeNotification}
              onAction={handleNotificationAction}
            />
          </div>
        ))}
      </div>

      {/* Indicateur de connexion */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: isConnected ? '#10b981' : '#ef4444',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'white',
          animation: isConnected ? 'pulse 2s infinite' : 'none'
        }} />
        {isConnected ? '🔗 Connecté' : '🔌 Déconnecté'}
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </PushNotificationContext.Provider>
  );
};

export default PushNotificationProvider;
