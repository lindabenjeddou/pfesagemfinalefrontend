import React, { useState, useEffect } from 'react';

const NavbarNotifications = ({ userId, userRole }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simulation des notifications en temps réel pour les magasiniers
  const simulateRealTimeNotifications = () => {
    if (userRole !== 'MAGASINIER') return [];

    const baseNotifications = [
      {
        id: Date.now() + 1,
        title: "🆕 Nouveau sous-projet",
        message: "Sous-projet créé avec 3 composants commandés",
        type: "SOUS_PROJET_CREATED",
        isRead: false,
        createdAt: new Date().toISOString(),
        priority: "high",
        icon: "🆕"
      },
      {
        id: Date.now() + 2,
        title: "📦 Commande composants",
        message: "ELEC0014, ELEC0015, ELEC0047 - Stock à vérifier",
        type: "COMPONENT_ORDER",
        isRead: false,
        createdAt: new Date(Date.now() - 300000).toISOString(), // 5 min ago
        priority: "medium",
        icon: "📦"
      },
      {
        id: Date.now() + 3,
        title: "⚠️ Stock faible",
        message: "Composant ELEC0047 en stock faible (2 restants)",
        type: "LOW_STOCK",
        isRead: true,
        createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
        priority: "medium",
        icon: "⚠️"
      }
    ];

    return baseNotifications;
  };

  const fetchNotifications = async () => {
    if (userRole !== 'MAGASINIER') return;

    setLoading(true);
    try {
      // Tentative d'appel à l'API backend
      const response = await fetch(`http://localhost:8089/PI/PI/notifications/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
        console.log('✅ Notifications navbar récupérées depuis l\'API:', data);
      } else {
        throw new Error('API non disponible');
      }
    } catch (error) {
      console.warn('⚠️ API backend non disponible, utilisation de la simulation navbar:', error.message);
      
      // Fallback: utiliser la simulation
      const simulatedNotifications = simulateRealTimeNotifications();
      setNotifications(simulatedNotifications);
      setUnreadCount(simulatedNotifications.filter(n => !n.isRead).length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'MAGASINIER') {
      fetchNotifications();
      
      // Actualiser les notifications toutes les 15 secondes pour la navbar
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [userId, userRole]);

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    setUnreadCount(0);
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const notifDate = new Date(dateString);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${Math.floor(diffHours / 24)}j`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  // Ne pas afficher pour les non-magasiniers
  if (userRole !== 'MAGASINIER') {
    return null;
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: 'relative',
          padding: '0.5rem',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: unreadCount > 0 ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : 'none'
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = '#3b82f6';
          e.target.style.boxShadow = unreadCount > 0 
            ? '0 0 0 3px rgba(239, 68, 68, 0.2)' 
            : '0 0 0 3px rgba(59, 130, 246, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = '#e2e8f0';
          e.target.style.boxShadow = unreadCount > 0 ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : 'none';
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: '600',
            animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          width: '380px',
          maxHeight: '400px',
          overflow: 'hidden',
          zIndex: 1000
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #f3f4f6',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                🔔 Notifications Magasinier
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Tout marquer lu
                </button>
              )}
            </div>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
              {unreadCount} nouvelles notifications
            </p>
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                <div style={{ marginBottom: '0.5rem' }}>🔄</div>
                Chargement...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                Aucune notification
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    background: !notification.isRead ? '#fef3c7' : 'white',
                    borderLeft: !notification.isRead ? `4px solid ${getPriorityColor(notification.priority)}` : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = !notification.isRead ? '#fef3c7' : '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = !notification.isRead ? '#fef3c7' : 'white';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>
                      {notification.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <h4 style={{
                          margin: 0,
                          fontSize: '0.875rem',
                          fontWeight: !notification.isRead ? '600' : '500',
                          color: !notification.isRead ? '#1f2937' : '#6b7280'
                        }}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: getPriorityColor(notification.priority),
                            flexShrink: 0,
                            marginLeft: '0.5rem'
                          }} />
                        )}
                      </div>
                      <p style={{
                        margin: '0 0 0.25rem 0',
                        fontSize: '0.75rem',
                        color: !notification.isRead ? '#4b5563' : '#9ca3af',
                        lineHeight: '1.4'
                      }}>
                        {notification.message}
                      </p>
                      <div style={{
                        fontSize: '0.625rem',
                        color: '#9ca3af'
                      }}>
                        {getTimeAgo(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid #f3f4f6',
            background: '#f9fafb',
            textAlign: 'center'
          }}>
            <button
              onClick={() => {
                setShowDropdown(false);
                window.location.href = '/admin/magasinier';
              }}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              📊 Voir Dashboard Complet
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default NavbarNotifications;
