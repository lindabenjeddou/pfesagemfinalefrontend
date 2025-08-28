import React, { useState, useEffect } from 'react';
import { useSecurity } from '../../contexts/SecurityContext';

const NotificationCenter = () => {
  const { user } = useSecurity();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Charger les notifications depuis localStorage
  useEffect(() => {
    if (user?.role === 'MAGASINIER') {
      loadNotifications();
      // Vérifier les nouvelles notifications toutes les 5 secondes
      const interval = setInterval(loadNotifications, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = () => {
    try {
      const storedNotifications = JSON.parse(localStorage.getItem('magasinierNotifications') || '[]');
      setNotifications(storedNotifications);
      const unread = storedNotifications.filter(notif => !notif.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const markAsRead = (notificationId) => {
    try {
      const updatedNotifications = notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      setNotifications(updatedNotifications);
      localStorage.setItem('magasinierNotifications', JSON.stringify(updatedNotifications));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const markAllAsRead = () => {
    try {
      const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
      setNotifications(updatedNotifications);
      localStorage.setItem('magasinierNotifications', JSON.stringify(updatedNotifications));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  };

  const clearAllNotifications = () => {
    try {
      setNotifications([]);
      localStorage.removeItem('magasinierNotifications');
      setUnreadCount(0);
      setShowNotifications(false);
    } catch (error) {
      console.error('Erreur suppression notifications:', error);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // N'afficher que pour les magasiniers
  if (user?.role !== 'MAGASINIER') {
    return null;
  }

  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
      {/* Bouton de notification */}
      <div
        onClick={() => setShowNotifications(!showNotifications)}
        style={{
          position: 'relative',
          backgroundColor: '#003061',
          color: 'white',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 48, 97, 0.3)',
          transition: 'all 0.3s ease',
          animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
        }}
      >
        <i className="fas fa-bell" style={{ fontSize: '20px' }}></i>
        {unreadCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: '#ff4757',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>

      {/* Panel des notifications */}
      {showNotifications && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '0',
            width: '400px',
            maxHeight: '500px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e1e8ed',
            overflow: 'hidden',
            animation: 'slideInDown 0.3s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#003061',
              color: 'white',
              padding: '15px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px' }}>
              🔔 Notifications Magasinier
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Tout lire
                </button>
              )}
              <button
                onClick={clearAllNotifications}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Effacer
              </button>
            </div>
          </div>

          {/* Liste des notifications */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '14px'
                }}
              >
                <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '15px', color: '#ddd' }}></i>
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  style={{
                    padding: '15px 20px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    backgroundColor: notification.read ? 'white' : '#f8f9ff',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#003061' }}>
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#ff4757',
                          borderRadius: '50%',
                          marginTop: '3px'
                        }}
                      ></div>
                    )}
                  </div>
                  
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
                    {notification.message}
                  </p>
                  
                  {notification.components && notification.components.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <strong style={{ fontSize: '12px', color: '#003061' }}>Composants commandés :</strong>
                      <ul style={{ margin: '5px 0 0 0', paddingLeft: '15px', fontSize: '12px', color: '#666' }}>
                        {notification.components.map((comp, index) => (
                          <li key={index}>
                            {comp.name} (ID: {comp.id}) - Qté: {comp.quantity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    📅 {formatDate(notification.timestamp)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationCenter;
