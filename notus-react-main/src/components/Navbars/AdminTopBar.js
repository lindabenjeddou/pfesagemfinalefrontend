import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSecurity } from "../../contexts/SecurityContext";
import NavbarNotifications from "../Notifications/NavbarNotifications.js";

export default function AdminTopBar() {
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const { user: securityUser, isAuthenticated, logout } = useSecurity();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const history = useHistory();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        console.log('🔍 AdminTopBar - Utilisateur du SecurityContext:', securityUser);
        const token = localStorage.getItem('token');
        console.log('🔍 AdminTopBar - Token:', token ? 'Présent' : 'Absent');
        
        // Données de fallback par défaut améliorées (exactement comme Profile.js)
        const defaultFallbackData = {
          firstName: securityUser?.firstName || 'Prénom',
          lastName: securityUser?.lastName || 'Nom',
          email: securityUser?.email || 'email@exemple.com',
          role: securityUser?.role || 'UTILISATEUR',
          phoneNumber: securityUser?.phoneNumber || '+216 XX XXX XXX',
          adress: securityUser?.adress || 'Adresse'
        };
        
        // Définir les données de fallback immédiatement pour éviter l'affichage vide
        setUser(defaultFallbackData);
        
        const response = await fetch('http://localhost:8089/PI/user/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('🔍 AdminTopBar - Réponse API status:', response.status);
        
        if (response.ok) {
          const users = await response.json();
          console.log('🔍 AdminTopBar - Tous les utilisateurs récupérés:', users);
          console.log('🔍 AdminTopBar - Recherche utilisateur avec ID:', securityUser?.userId);
          
          const currentUser = users.find(u => u.id === securityUser?.userId);
          console.log('🔍 AdminTopBar - Utilisateur trouvé:', currentUser);
          
          if (currentUser) {
            console.log('✅ AdminTopBar - Utilisation des données API');
            setUser(currentUser);
          } else {
            console.log('⚠️ AdminTopBar - Utilisateur non trouvé, conservation des données de fallback');
          }
        } else {
          console.error('❌ AdminTopBar - Erreur API:', response.status, response.statusText);
          console.log('⚠️ AdminTopBar - Conservation des données de fallback par défaut');
        }
      } catch (error) {
        console.error('❌ AdminTopBar - Erreur fetch:', error);
        console.log('⚠️ AdminTopBar - Conservation des données de fallback par défaut');
      }
    };

    fetchUserDetails();
  }, [securityUser, isAuthenticated]);

  const handleLogout = () => {
    // Utiliser la fonction logout du SecurityContext
    if (logout) {
      logout();
    }
    // Nettoyer le localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sagemcom_user');
    localStorage.removeItem('sagemcom_login_time');
    // Rediriger vers la page de connexion
    history.push('/auth/login');
  };

  // Charger les notifications depuis l'API
  useEffect(() => {
    const loadNotifications = async () => {
      console.log("🔍 DEBUG SecurityUser complet:", securityUser);
      console.log("🔍 DEBUG securityUser.id:", securityUser?.id);
      console.log("🔍 DEBUG securityUser.userId:", securityUser?.userId);
      
      if (!securityUser?.id && !securityUser?.userId) {
        console.warn("⚠️ Aucun ID utilisateur - Impossible de charger les notifications");
        return;
      }
      
      // Utiliser userId si disponible, sinon id
      const userId = securityUser?.userId || securityUser?.id;
      console.log("🔍 DEBUG userId final utilisé:", userId);
      
      try {
        const url = `http://localhost:8089/PI/PI/notifications/user/${userId}`;
        console.log("🔍 Chargement notifications pour userId:", userId);
        console.log("🔍 URL:", url);
        
        const response = await fetch(url);
        console.log("🔍 Réponse status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
          console.log("✅ Notifications chargées:", data.length);
          console.log("📋 Notifications:", data);
          if (data.length > 0) {
            console.log("📅 Format date première notification:", data[0].createdAt);
            console.log("📅 Tous les champs de la notification:", Object.keys(data[0]));
          }
        } else {
          console.error("❌ Erreur HTTP:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("❌ Erreur chargement notifications:", error);
      }
    };

    const loadUnreadCount = async () => {
      if (!securityUser?.id && !securityUser?.userId) return;
      const userId = securityUser?.userId || securityUser?.id;
      try {
        const response = await fetch(`http://localhost:8089/PI/PI/notifications/user/${userId}/unread/count`);
        if (response.ok) {
          const count = await response.json();
          setUnreadCount(count);
          console.log("🔍 Compteur non-lues:", count);
        }
      } catch (error) {
        console.error("Erreur compteur notifications:", error);
      }
    };

    loadNotifications();
    loadUnreadCount();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(() => {
      loadNotifications();
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [securityUser?.id, securityUser?.userId]);

  const markAsRead = async (notificationId) => {
    const userId = securityUser?.userId || securityUser?.id;
    try {
      await fetch(`http://localhost:8089/PI/PI/notifications/${notificationId}/read`, {
        method: "PUT",
      });
      // Recharger les notifications
      const response = await fetch(`http://localhost:8089/PI/PI/notifications/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
      // Recharger le compteur
      const countResponse = await fetch(`http://localhost:8089/PI/PI/notifications/user/${userId}/unread/count`);
      if (countResponse.ok) {
        const count = await countResponse.json();
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Erreur marquage lu:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "INTERVENTION_ASSIGNED": return "🔧";
      case "INTERVENTION_CREATED": return "📋";
      case "BON_TRAVAIL_CREATED": return "🛠️";
      case "COMPONENT_ORDER": return "📦";
      case "SOUS_PROJET_CREATED": return "📁";
      default: return "ℹ️";
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date inconnue";
    
    try {
      // Si c'est déjà un objet Date valide
      if (dateValue instanceof Date && !isNaN(dateValue)) {
        return dateValue.toLocaleString("fr-FR");
      }
      
      // Si c'est un timestamp (nombre)
      if (typeof dateValue === 'number') {
        return new Date(dateValue).toLocaleString("fr-FR");
      }
      
      // Si c'est une string, essayer de la parser
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString("fr-FR");
        }
      }
      
      // Si c'est un array [year, month, day, hour, minute, second]
      if (Array.isArray(dateValue) && dateValue.length >= 3) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
        const date = new Date(year, month - 1, day, hour, minute, second);
        return date.toLocaleString("fr-FR");
      }
      
      console.warn("Format de date non reconnu:", dateValue);
      return "Date invalide";
    } catch (error) {
      console.error("Erreur formatage date:", error, dateValue);
      return "Date invalide";
    }
  };

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇹🇳' }
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,120,212,0.3); }
          50% { box-shadow: 0 0 30px rgba(0,120,212,0.5); }
        }
        
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

    <nav style={{
      position: 'relative',
      width: '100%',
      height: '90px',
      background: `
        linear-gradient(135deg, 
          rgba(0,48,97,0.98) 0%, 
          rgba(0,60,120,0.95) 25%,
          rgba(0,120,212,0.92) 50%,
          rgba(0,60,120,0.95) 75%,
          rgba(0,48,97,0.98) 100%
        )
      `,
      backdropFilter: 'blur(25px)',
      borderBottom: '2px solid rgba(0,120,212,0.3)',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      boxShadow: `
        0 0 60px rgba(0,48,97,0.4),
        inset 0 1px 0 rgba(255,255,255,0.15),
        inset 0 -1px 0 rgba(0,120,212,0.2),
        0 8px 32px rgba(0,120,212,0.2)
      `,
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 40px',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      animation: 'slideInDown 1s ease-out',
      overflow: 'visible'
    }}>
      {/* Advanced Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 50%, rgba(0,120,212,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 50%, rgba(0,120,212,0.08) 0%, transparent 50%),
          linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.02) 50%, transparent 100%)
        `,
        animation: 'shimmer 4s ease-in-out infinite'
      }}></div>

      {/* Floating Particles */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '30px',
        width: '12px',
        height: '12px',
        background: 'linear-gradient(135deg, #40a9ff 0%, #0078d4 100%)',
        borderRadius: '50%',
        opacity: 0.7,
        animation: 'pulse 4s ease-in-out infinite',
        filter: 'blur(0.5px)',
        boxShadow: '0 0 20px rgba(64,169,255,0.4)'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '65px',
        left: '80px',
        width: '8px',
        height: '8px',
        background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
        borderRadius: '50%',
        opacity: 0.6,
        animation: 'pulse 4s ease-in-out infinite 1.5s',
        filter: 'blur(0.3px)',
        boxShadow: '0 0 15px rgba(82,196,26,0.4)'
      }}></div>

      {/* Ultra-Modern Navigation Items */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        position: 'relative',
        zIndex: 2
      }}>
      
      {/* Sélecteur de langue modernisé */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setShowLanguageMenu(!showLanguageMenu);
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(0,120,212,0.08) 100%)',
            border: '2px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '14px',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(15px)',
            boxShadow: '0 4px 16px rgba(0,120,212,0.15)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px) scale(1.02)';
            e.target.style.boxShadow = '0 8px 24px rgba(0,120,212,0.25)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0) scale(1)';
            e.target.style.boxShadow = '0 4px 16px rgba(0,120,212,0.15)';
          }}
        >
          <span style={{ fontSize: '1rem' }}>
            <span>{languages.find(lang => lang.code === currentLanguage)?.flag || '🌐'}</span>
          </span>
          <span>{languages.find(lang => lang.code === currentLanguage)?.code.toUpperCase() || 'FR'}</span>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>▼</span>
        </button>

        {showLanguageMenu && (
          <div style={{
            position: 'fixed',
            top: '90px',
            right: '850px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            minWidth: '150px',
            zIndex: 9999,
            animation: 'fadeInUp 0.2s ease-out'
          }}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setShowLanguageMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: 'none',
                  background: currentLanguage === lang.code ? '#f0f9ff' : 'transparent',
                  color: currentLanguage === lang.code ? '#0369a1' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  borderRadius: lang.code === languages[0].code ? '8px 8px 0 0' : 
                              lang.code === languages[languages.length - 1].code ? '0 0 8px 8px' : '0'
                }}
                onMouseEnter={(e) => {
                  if (currentLanguage !== lang.code) {
                    e.target.style.background = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentLanguage !== lang.code) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {currentLanguage === lang.code && (
                  <span style={{ marginLeft: 'auto', color: '#0369a1', fontSize: '0.75rem' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications Magasinier Intégrées */}
      {user && user.role === 'MAGASINIER' && user.id && (
        <NavbarNotifications 
          userId={user.id} 
          userRole={user.role}
        />
      )}
      
      {/* Notifications Générales (pour autres rôles) */}
      {user && user.role !== 'MAGASINIER' && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
              setShowLanguageMenu(false);
            }}
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
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.boxShadow = 'none';
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
                fontWeight: '600'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'fixed',
              top: '90px',
              right: '280px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              minWidth: '300px',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 9999,
              animation: 'fadeInUp 0.2s ease-out'
            }}>
              <div style={{
                padding: '1rem',
                borderBottom: '1px solid #e2e8f0',
                fontWeight: '600',
                color: '#374151'
              }}>
                {t('notifications.title', 'Notifications')} ({notifications.length})
              </div>
              
              {notifications.length === 0 ? (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '0.875rem'
                }}>
                  {t('notifications.empty', 'Aucune notification')}
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                      background: notification.isRead ? 'transparent' : '#eff6ff'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = notification.isRead ? 'transparent' : '#eff6ff';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        fontSize: '1.25rem',
                        flexShrink: 0
                      }}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#374151'
                        }}>
                          {notification.title}
                        </p>
                        <p style={{
                          margin: '0 0 0.5rem 0',
                          fontSize: '0.8125rem',
                          color: '#64748b',
                          lineHeight: '1.4'
                        }}>
                          {notification.message}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '0.75rem',
                          color: '#9ca3af'
                        }}>
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#3b82f6',
                          marginTop: '0.5rem',
                          flexShrink: 0
                        }} />
                      )}
                    </div>
                  </div>
                ))
              )}
              
              <div style={{
                padding: '0.75rem 1rem',
                borderTop: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <button style={{
                  fontSize: '0.875rem',
                  color: '#3b82f6',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}>
                  {t('notifications.view_all', 'Voir toutes les notifications')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Premium User Profile Card - Container with relative position */}
      <div style={{ position: 'relative' }}>
      <div 
        onClick={() => {
          setShowUserMenu(!showUserMenu);
          setShowNotifications(false);
          setShowLanguageMenu(false);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '16px 24px',
          background: `
            linear-gradient(135deg, 
              rgba(255,255,255,0.12) 0%, 
              rgba(0,120,212,0.08) 50%,
              rgba(255,255,255,0.06) 100%
            )
          `,
          borderRadius: '24px',
          border: '2px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `
            0 8px 32px rgba(0,120,212,0.15),
            inset 0 1px 0 rgba(255,255,255,0.2)
          `
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `
            linear-gradient(135deg, 
              rgba(255,255,255,0.18) 0%, 
              rgba(0,120,212,0.12) 50%,
              rgba(255,255,255,0.08) 100%
            )
          `;
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
          e.currentTarget.style.boxShadow = `
            0 16px 48px rgba(0,120,212,0.25),
            inset 0 1px 0 rgba(255,255,255,0.3)
          `;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `
            linear-gradient(135deg, 
              rgba(255,255,255,0.12) 0%, 
              rgba(0,120,212,0.08) 50%,
              rgba(255,255,255,0.06) 100%
            )
          `;
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = `
            0 8px 32px rgba(0,120,212,0.15),
            inset 0 1px 0 rgba(255,255,255,0.2)
          `;
        }}>
        {/* Shimmer overlay */}
        <span style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          animation: 'shimmer 4s infinite'
        }}></span>

        {/* User Information */}
        <div style={{
          textAlign: 'right',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            fontFamily: '"Inter", sans-serif',
            margin: 0,
            background: 'linear-gradient(135deg, #ffffff 0%, #bae7ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.3px'
          }}>
            {user ? `${user.firstName || user.firstname || ''} ${user.lastName || user.lastname || ''}`.trim() || user.email || 'Utilisateur' : 'Utilisateur'}
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '13px',
            fontWeight: '500',
            margin: '3px 0 0 0',
            fontFamily: '"Inter", sans-serif',
            letterSpacing: '0.2px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(186,231,255,0.7) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            👤 {user?.role || 'ADMIN'}
          </div>
        </div>
        
        {/* Premium Avatar */}
        <div style={{
          width: '52px',
          height: '52px',
          background: `
            linear-gradient(135deg, 
              #0078d4 0%, 
              #40a9ff 25%,
              #0078d4 50%,
              #003061 75%,
              #001529 100%
            )
          `,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid rgba(255,255,255,0.25)',
          boxShadow: `
            0 0 30px rgba(0,120,212,0.4),
            inset 0 2px 0 rgba(255,255,255,0.2),
            inset 0 -2px 0 rgba(0,48,97,0.3)
          `,
          position: 'relative',
          overflow: 'hidden',
          animation: 'pulse 4s ease-in-out infinite'
        }}>
          {/* Multi-layer avatar shimmer */}
          <span style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shimmer 3s infinite'
          }}></span>
          <span style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(45deg, transparent, rgba(64,169,255,0.2), transparent)',
            animation: 'shimmer 4s infinite 1.5s'
          }}></span>
          
          <i className="fas fa-user-tie" style={{
            fontSize: '22px',
            color: 'white',
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.4))',
            animation: 'glow 3s ease-in-out infinite'
          }}></i>
        </div>

        {/* Dropdown Arrow */}
        <i className="fas fa-chevron-down" style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.8)',
          marginLeft: '8px',
          transition: 'transform 0.3s ease',
          transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)'
        }}></i>
      </div>

        {/* Enhanced User Dropdown Menu */}
        {showUserMenu && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '10px',
          background: `linear-gradient(135deg, rgba(30,40,60,0.98) 0%, rgba(20,30,50,0.98) 100%)`,
          backdropFilter: 'blur(25px)',
          borderRadius: '16px',
          padding: '12px',
          border: '2px solid rgba(64,169,255,0.4)',
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(64,169,255,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
          minWidth: '280px',
          zIndex: 9999,
          animation: 'fadeInUp 0.3s ease-out'
        }}>
            {/* Boutons côte à côte */}
            <div style={{
              display: 'flex',
              gap: '10px',
              padding: '4px'
            }}>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  history.push('/admin/profile');
                }}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,120,212,0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <i className="fas fa-user" style={{ fontSize: '16px' }}></i>
                {t('user.profile', 'Profil')}
              </button>
              
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,107,107,0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <i className="fas fa-sign-out-alt" style={{ fontSize: '16px' }}></i>
                {t('user.logout', 'Déconnexion')}
              </button>
            </div>
        </div>
        )}
      </div>
      </div>
    </nav>
    </>
  );
}
