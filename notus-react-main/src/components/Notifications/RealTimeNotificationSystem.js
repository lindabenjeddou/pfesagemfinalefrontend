import React, { useState, useEffect, useContext, createContext } from 'react';

// Context pour les notifications temps réel
const RealTimeNotificationContext = createContext();

// Hook personnalisé pour utiliser les notifications
export const useRealTimeNotifications = () => {
  const context = useContext(RealTimeNotificationContext);
  if (!context) {
    throw new Error('useRealTimeNotifications must be used within RealTimeNotificationProvider');
  }
  return context;
};

// Système de priorités avancé
const PRIORITY_LEVELS = {
  CRITIQUE: {
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    sound: 'urgent.mp3',
    vibration: [200, 100, 200, 100, 200],
    icon: '🚨',
    timeout: 0, // Ne se ferme jamais automatiquement
    zIndex: 9999
  },
  HAUTE: {
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    sound: 'high.mp3',
    vibration: [100, 50, 100],
    icon: '⚠️',
    timeout: 10000,
    zIndex: 9998
  },
  NORMALE: {
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    sound: 'normal.mp3',
    vibration: [50],
    icon: '🔔',
    timeout: 5000,
    zIndex: 9997
  },
  BASSE: {
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    sound: null,
    vibration: null,
    icon: 'ℹ️',
    timeout: 3000,
    zIndex: 9996
  }
};

// Types de notifications contextuelles
const NOTIFICATION_TYPES = {
  STOCK_CRITIQUE: { priority: 'CRITIQUE', category: 'stock' },
  COMMANDE_URGENTE: { priority: 'HAUTE', category: 'commande' },
  SOUS_PROJET_CREE: { priority: 'NORMALE', category: 'projet' },
  MAINTENANCE_PROGRAMMEE: { priority: 'BASSE', category: 'maintenance' },
  RUPTURE_STOCK: { priority: 'CRITIQUE', category: 'stock' },
  LIVRAISON_RETARD: { priority: 'HAUTE', category: 'logistique' },
  VALIDATION_REQUISE: { priority: 'NORMALE', category: 'workflow' }
};

// Provider pour les notifications temps réel
export const RealTimeNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [settings, setSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    desktopNotifications: true,
    workingHours: { start: '08:00', end: '18:00' },
    quietMode: false
  });

  // Initialisation WebSocket
  useEffect(() => {
    const initWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:8089/PI/websocket/notifications');
        
        ws.onopen = () => {
          console.log('🔌 WebSocket connecté pour notifications temps réel');
          setIsConnected(true);
          setSocket(ws);
        };

        ws.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data);
            handleIncomingNotification(notification);
          } catch (error) {
            console.error('❌ Erreur parsing notification WebSocket:', error);
          }
        };

        ws.onclose = () => {
          console.log('🔌 WebSocket déconnecté, tentative de reconnexion...');
          setIsConnected(false);
          setTimeout(initWebSocket, 5000); // Reconnexion automatique
        };

        ws.onerror = (error) => {
          console.error('❌ Erreur WebSocket:', error);
        };

        return ws;
      } catch (error) {
        console.error('❌ Impossible d\'initialiser WebSocket:', error);
        return null;
      }
    };

    const ws = initWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Demander permission pour notifications desktop
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Permission notifications desktop:', permission);
      });
    }
  }, []);

  // Gestion des notifications entrantes
  const handleIncomingNotification = (notification) => {
    const enhancedNotification = {
      ...notification,
      id: notification.id || Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      priority: notification.priority || 'NORMALE',
      isRead: false,
      isContextual: checkContextualRelevance(notification)
    };

    // Vérifier les horaires de travail pour notifications non-critiques
    if (!isWorkingHours() && enhancedNotification.priority !== 'CRITIQUE') {
      if (settings.quietMode) {
        console.log('🔇 Mode silencieux activé, notification mise en attente');
        return;
      }
    }

    setNotifications(prev => [enhancedNotification, ...prev]);
    
    // Effets sonores et visuels
    playNotificationEffects(enhancedNotification);
    
    // Notification desktop
    showDesktopNotification(enhancedNotification);
  };

  // Vérifier la pertinence contextuelle
  const checkContextualRelevance = (notification) => {
    // Logique de géolocalisation (si disponible)
    if (navigator.geolocation && notification.location) {
      // Vérifier la proximité géographique
      return true; // Simplifié pour l'exemple
    }
    
    // Vérifier le rôle utilisateur
    const userRole = localStorage.getItem('userRole');
    if (notification.targetRoles && !notification.targetRoles.includes(userRole)) {
      return false;
    }
    
    return true;
  };

  // Vérifier les horaires de travail
  const isWorkingHours = () => {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const startTime = parseInt(settings.workingHours.start.replace(':', ''));
    const endTime = parseInt(settings.workingHours.end.replace(':', ''));
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  // Effets sonores et vibrations
  const playNotificationEffects = (notification) => {
    const priorityConfig = PRIORITY_LEVELS[notification.priority];
    
    // Son
    if (settings.soundEnabled && priorityConfig.sound) {
      try {
        const audio = new Audio(`/sounds/${priorityConfig.sound}`);
        audio.volume = 0.7;
        audio.play().catch(e => console.log('🔇 Son non disponible:', e));
      } catch (error) {
        console.log('🔇 Erreur lecture son:', error);
      }
    }
    
    // Vibration (mobile)
    if (settings.vibrationEnabled && priorityConfig.vibration && 'vibrate' in navigator) {
      navigator.vibrate(priorityConfig.vibration);
    }
  };

  // Notification desktop
  const showDesktopNotification = (notification) => {
    if (!settings.desktopNotifications || Notification.permission !== 'granted') {
      return;
    }

    const priorityConfig = PRIORITY_LEVELS[notification.priority];
    
    const desktopNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/badge-icon.png',
      tag: notification.id,
      requireInteraction: notification.priority === 'CRITIQUE',
      silent: !settings.soundEnabled
    });

    desktopNotif.onclick = () => {
      window.focus();
      markAsRead(notification.id);
      desktopNotif.close();
    };

    // Auto-fermeture selon priorité
    if (priorityConfig.timeout > 0) {
      setTimeout(() => desktopNotif.close(), priorityConfig.timeout);
    }
  };

  // Marquer comme lu
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  // Marquer toutes comme lues
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  // Supprimer notification
  const removeNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  // Envoyer notification (pour tests)
  const sendTestNotification = (type = 'NORMALE') => {
    const testNotifications = {
      CRITIQUE: {
        title: '🚨 ALERTE CRITIQUE',
        message: 'Rupture de stock critique sur ELEC0047 - Action immédiate requise',
        type: 'RUPTURE_STOCK',
        priority: 'CRITIQUE'
      },
      HAUTE: {
        title: '⚠️ Commande Urgente',
        message: 'Nouveau sous-projet avec 5 composants - Préparation requise',
        type: 'COMMANDE_URGENTE',
        priority: 'HAUTE'
      },
      NORMALE: {
        title: '🔔 Nouveau Sous-Projet',
        message: 'Sous-projet "Maintenance Préventive" créé avec 3 composants',
        type: 'SOUS_PROJET_CREE',
        priority: 'NORMALE'
      },
      BASSE: {
        title: 'ℹ️ Maintenance Programmée',
        message: 'Maintenance programmée demain à 14h00',
        type: 'MAINTENANCE_PROGRAMMEE',
        priority: 'BASSE'
      }
    };

    handleIncomingNotification(testNotifications[type]);
  };

  // Statistiques
  const getStats = () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const criticalCount = notifications.filter(n => n.priority === 'CRITIQUE' && !n.isRead).length;
    const todayCount = notifications.filter(n => {
      const today = new Date().toDateString();
      const notifDate = new Date(n.timestamp).toDateString();
      return today === notifDate;
    }).length;

    return {
      total: notifications.length,
      unread: unreadCount,
      critical: criticalCount,
      today: todayCount,
      isConnected
    };
  };

  const contextValue = {
    notifications,
    settings,
    setSettings,
    markAsRead,
    markAllAsRead,
    removeNotification,
    sendTestNotification,
    getStats,
    PRIORITY_LEVELS,
    NOTIFICATION_TYPES,
    isConnected
  };

  return (
    <RealTimeNotificationContext.Provider value={contextValue}>
      {children}
    </RealTimeNotificationContext.Provider>
  );
};

// Composant de notification flottante
export const FloatingNotification = ({ notification, onClose, onRead }) => {
  const priorityConfig = PRIORITY_LEVELS[notification.priority];
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (priorityConfig.timeout > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Attendre l'animation
      }, priorityConfig.timeout);

      return () => clearTimeout(timer);
    }
  }, [priorityConfig.timeout, onClose]);

  const handleClick = () => {
    onRead(notification.id);
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: priorityConfig.zIndex,
        transform: isVisible ? 'translateX(0)' : 'translateX(400px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isVisible ? 1 : 0
      }}
    >
      <div
        onClick={handleClick}
        style={{
          background: priorityConfig.bgColor,
          border: `2px solid ${priorityConfig.borderColor}`,
          borderRadius: '12px',
          padding: '16px',
          minWidth: '320px',
          maxWidth: '400px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          cursor: 'pointer',
          animation: 'slideInRight 0.3s ease-out'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ fontSize: '24px', flexShrink: 0 }}>
            {priorityConfig.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{
              margin: '0 0 8px 0',
              color: priorityConfig.color,
              fontSize: '16px',
              fontWeight: '600'
            }}>
              {notification.title}
            </h4>
            <p style={{
              margin: '0 0 8px 0',
              color: '#374151',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              {notification.message}
            </p>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
              <span style={{
                background: priorityConfig.color,
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                {notification.priority}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant de gestion des notifications flottantes
export const NotificationManager = () => {
  const { notifications, markAsRead, removeNotification } = useRealTimeNotifications();
  const [floatingNotifications, setFloatingNotifications] = useState([]);

  useEffect(() => {
    // Afficher les nouvelles notifications non lues
    const newUnreadNotifications = notifications.filter(n => 
      !n.isRead && !floatingNotifications.find(fn => fn.id === n.id)
    );

    if (newUnreadNotifications.length > 0) {
      setFloatingNotifications(prev => [...prev, ...newUnreadNotifications]);
    }
  }, [notifications, floatingNotifications]);

  const handleCloseFloating = (notificationId) => {
    setFloatingNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
  };

  const handleReadFloating = (notificationId) => {
    markAsRead(notificationId);
    handleCloseFloating(notificationId);
  };

  return (
    <>
      {floatingNotifications.map((notification) => (
        <FloatingNotification
          key={notification.id}
          notification={notification}
          onClose={() => handleCloseFloating(notification.id)}
          onRead={handleReadFloating}
        />
      ))}
      
      <style jsx global>{`
        @keyframes slideInRight {
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
    </>
  );
};

export default RealTimeNotificationProvider;
