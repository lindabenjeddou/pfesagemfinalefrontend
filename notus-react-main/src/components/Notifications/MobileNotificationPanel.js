import React, { useState, useEffect } from 'react';

const MobileNotificationPanel = ({ userId, userRole, isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);

  // Simulation de données pour mobile
  const generateMobileNotifications = () => {
    return [
      {
        id: 1,
        title: 'Nouveau sous-projet',
        message: 'Installation Capteurs Bâtiment A créé',
        type: 'SOUS_PROJET_CREATED',
        priority: 'NORMAL',
        isRead: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        icon: '🏗️'
      },
      {
        id: 2,
        title: 'Commande urgente',
        message: '8 capteurs température requis',
        type: 'COMPONENT_ORDER',
        priority: 'HIGH',
        isRead: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
        icon: '📦'
      },
      {
        id: 3,
        title: 'Stock critique',
        message: 'Résistances 10kΩ: 5 restantes',
        type: 'STOCK_ALERT',
        priority: 'HIGH',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: '⚠️'
      }
    ];
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8089/PI/PI/notifications/user/${userId}`);
      if (response.ok) {
        const apiNotifications = await response.json();
        setNotifications(apiNotifications);
      } else {
        setNotifications(generateMobileNotifications());
      }
    } catch (error) {
      setNotifications(generateMobileNotifications());
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, userId]);

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'high':
        return notifications.filter(n => n.priority === 'HIGH' || n.priority === 'CRITICAL');
      default:
        return notifications;
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const formatTimeAgo = (date) => {
    const diffInMinutes = Math.floor((new Date() - new Date(date)) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}j`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9998,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '400px',
          height: '100vh',
          background: 'white',
          zIndex: 9999,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 25px rgba(0,0,0,0.15)'
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #003061 0%, #0066cc 100%)',
          color: 'white',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              margin: '0 0 4px 0'
            }}>
              🔔 Notifications
            </h2>
            <p style={{
              fontSize: '14px',
              opacity: 0.9,
              margin: 0
            }}>
              {notifications.filter(n => !n.isRead).length} non lues
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          {[
            { id: 'all', label: 'Toutes', count: notifications.length },
            { id: 'unread', label: 'Non lues', count: notifications.filter(n => !n.isRead).length },
            { id: 'high', label: 'Priorité', count: notifications.filter(n => n.priority === 'HIGH' || n.priority === 'CRITICAL').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 8px',
                border: 'none',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#003061' : '#6b7280',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '2px solid #003061' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.id ? '#003061' : '#9ca3af',
                  color: 'white',
                  borderRadius: '10px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  marginLeft: '4px'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px'
        }}>
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
              Chargement...
            </div>
          ) : getFilteredNotifications().length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <p style={{ margin: 0, fontSize: '16px' }}>
                Aucune notification
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {getFilteredNotifications().map(notification => (
                <div
                  key={notification.id}
                  style={{
                    background: notification.isRead ? '#f9fafb' : 'white',
                    border: notification.isRead ? '1px solid #e5e7eb' : '2px solid #3b82f6',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: notification.isRead ? 'none' : '0 2px 8px rgba(59,130,246,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div style={{
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
                      {notification.icon}
                    </div>

                    {/* Contenu */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '4px'
                      }}>
                        <h4 style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          margin: 0,
                          color: notification.isRead ? '#6b7280' : '#1f2937',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {notification.title}
                        </h4>
                        
                        <span style={{
                          fontSize: '12px',
                          color: '#9ca3af',
                          flexShrink: 0,
                          marginLeft: '8px'
                        }}>
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>

                      <p style={{
                        fontSize: '13px',
                        color: notification.isRead ? '#9ca3af' : '#4b5563',
                        margin: '0 0 8px 0',
                        lineHeight: '1.4',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {notification.message}
                      </p>

                      {/* Badge de priorité */}
                      {(notification.priority === 'HIGH' || notification.priority === 'CRITICAL') && (
                        <span style={{
                          background: notification.priority === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                          color: notification.priority === 'CRITICAL' ? '#dc2626' : '#d97706',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {notification.priority === 'CRITICAL' ? '🚨 Critique' : '⚠️ Élevée'}
                        </span>
                      )}
                    </div>

                    {/* Indicateur non lu */}
                    {!notification.isRead && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#3b82f6',
                        flexShrink: 0,
                        marginTop: '6px'
                      }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div style={{
          padding: '16px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => {
              setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }}
            style={{
              flex: 1,
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ✅ Tout marquer lu
          </button>
          
          <button
            onClick={loadNotifications}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔄
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileNotificationPanel;
