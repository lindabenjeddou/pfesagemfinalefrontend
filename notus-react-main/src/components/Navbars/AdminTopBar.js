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

  const notifications = [
    { id: 1, message: "Nouvelle intervention créée", time: "Il y a 5 min", type: "info" },
    { id: 2, message: "Maintenance programmée demain", time: "Il y a 1h", type: "warning" },
    { id: 3, message: "Rapport mensuel disponible", time: "Il y a 2h", type: "success" }
  ];

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇹🇳' }
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderBottom: '1px solid #e2e8f0',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      
      {/* Sélecteur de langue */}
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
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151'
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
          <span style={{ fontSize: '1rem' }}>
            <span>{languages.find(lang => lang.code === currentLanguage)?.flag || '🌐'}</span>
          </span>
          <span>{languages.find(lang => lang.code === currentLanguage)?.code.toUpperCase() || 'FR'}</span>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>▼</span>
        </button>

        {showLanguageMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.25rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            minWidth: '150px',
            zIndex: 50,
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
            {notifications.length > 0 && (
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
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.25rem',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              minWidth: '300px',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 50,
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
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: notification.type === 'warning' ? '#f59e0b' : 
                                   notification.type === 'success' ? '#10b981' : '#3b82f6',
                        marginTop: '0.5rem',
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1 }}>
                        <p style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#374151'
                        }}>
                          {notification.message}
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '0.75rem',
                          color: '#9ca3af'
                        }}>
                          {notification.time}
                        </p>
                      </div>
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

      {/* Menu utilisateur */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setShowUserMenu(!showUserMenu);
            setShowNotifications(false);
            setShowLanguageMenu(false);
          }}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            border: '2px solid white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '1rem',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
          }}
        >
          {user?.role === 'ADMIN' && '👑'}
          {user?.role === 'MAGASINIER' && '📦'}
          {user?.role === 'TECHNICIEN' && '🔧'}
          {user?.role === 'MANAGER' && '📊'}
          {user?.role === 'SUPERVISEUR' && '👥'}
          {!user?.role && '👤'}
        </button>

        {showUserMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.25rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            minWidth: '200px',
            zIndex: 50,
            animation: 'fadeInUp 0.2s ease-out'
          }}>
            <div style={{
              padding: '1rem',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.875rem',
                marginBottom: '0.25rem'
              }}>
                {user ? `${user.firstName || user.firstname || ''} ${user.lastName || user.lastname || ''}`.trim() || `${user.email || 'Utilisateur'}` : 'Chargement...'}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#9ca3af'
              }}>
                {user?.email || 'admin@sagemcom.com'}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: '#3b82f6',
                fontWeight: '500',
                marginTop: '0.25rem'
              }}>
                {user?.role || 'ADMIN'}
              </div>
            </div>
            
            <div style={{ padding: '0.5rem 0' }}>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  // Navigation vers profil
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  border: 'none',
                  background: 'transparent',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                <span>👤</span>
                <span>{t('user.profile', 'Mon Profil')}</span>
              </button>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  // Navigation vers paramètres
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  border: 'none',
                  background: 'transparent',
                  color: '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                <span>⚙️</span>
                <span>{t('user.settings', 'Paramètres')}</span>
              </button>
            </div>
            
            <div style={{
              borderTop: '1px solid #e2e8f0',
              padding: '0.5rem 0'
            }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  border: 'none',
                  background: 'transparent',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                <span>🚪</span>
                <span>{t('user.logout', 'Déconnexion')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
