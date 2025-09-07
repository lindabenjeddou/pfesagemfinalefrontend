import React, { useState, useEffect } from 'react';
import { useSecurity } from '../../contexts/SecurityContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeSelector from '../../components/ThemeSelector/ThemeSelector';

const Profile = () => {
  const { user } = useSecurity();
  const { t } = useLanguage();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [gamificationData, setGamificationData] = useState(null);
  const [notificationsData, setNotificationsData] = useState(null);
  const [activitiesData, setActivitiesData] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Variables d'état pour l'édition du profil
  const [isEditing, setIsEditing] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [editedUser, setEditedUser] = useState({});

  // Fonction pour récupérer les détails complets de l'utilisateur
  const fetchUserDetails = async () => {
    try {
      console.log('🔍 DEBUG - Utilisateur du SecurityContext:', user);
      const token = localStorage.getItem('token');
      console.log('🔍 DEBUG - Token:', token ? 'Présent' : 'Absent');
      
      // Données de fallback par défaut améliorées
      const defaultFallbackData = {
        firstName: user?.firstName || 'Prénom',
        lastName: user?.lastName || 'Nom',
        email: user?.email || 'email@exemple.com',
        role: user?.role || 'UTILISATEUR',
        phoneNumber: user?.phoneNumber || '+216 XX XXX XXX',
        adress: user?.adress || 'Adresse'
      };
      
      // Définir les données de fallback immédiatement pour éviter l'affichage vide
      setUserDetails(defaultFallbackData);
      setEditedUser(defaultFallbackData);
      
      const response = await fetch('http://localhost:8089/PI/user/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 DEBUG - Réponse API status:', response.status);
      
      if (response.ok) {
        const users = await response.json();
        console.log('🔍 DEBUG - Tous les utilisateurs récupérés:', users);
        console.log('🔍 DEBUG - Recherche utilisateur avec ID:', user?.userId);
        
        const currentUser = users.find(u => u.id === user?.userId);
        console.log('🔍 DEBUG - Utilisateur trouvé:', currentUser);
        
        if (currentUser) {
          console.log('✅ DEBUG - Utilisation des données API');
          setUserDetails(currentUser);
          setEditedUser(currentUser);
        } else {
          console.log('⚠️ DEBUG - Utilisateur non trouvé, conservation des données de fallback');
        }
      } else {
        console.error('❌ DEBUG - Erreur API:', response.status, response.statusText);
        console.log('⚠️ DEBUG - Conservation des données de fallback par défaut');
      }
    } catch (error) {
      console.error('❌ DEBUG - Erreur fetch:', error);
      console.log('⚠️ DEBUG - Conservation des données de fallback par défaut');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les données du dashboard
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8089/PI/user-profile/${user.userId}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dashboard data from API:', data);
        setDashboardData(data);
      } else {
        console.log('⚠️ API Dashboard non disponible, utilisation des données de fallback');
      }
    } catch (error) {
      console.error('❌ Erreur fetch dashboard:', error);
      console.log('⚠️ Utilisation des données de fallback pour le dashboard');
    }
  };

  // Fonction pour récupérer les données de gamification
  const fetchGamificationData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8089/PI/user-profile/${user.userId}/gamification`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🎮 Gamification data from API:', data);
        setGamificationData(data);
      } else {
        console.log('⚠️ API Gamification non disponible, utilisation des données de fallback');
      }
    } catch (error) {
      console.error('❌ Erreur fetch gamification:', error);
      console.log('⚠️ Utilisation des données de fallback pour la gamification');
    }
  };

  // Fonction pour récupérer les notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8089/PI/user-profile/${user.userId}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔔 Notifications data from API:', data);
        setNotificationsData(data);
      } else {
        console.log('⚠️ API Notifications non disponible, utilisation des données de fallback');
      }
    } catch (error) {
      console.error('❌ Erreur fetch notifications:', error);
      console.log('⚠️ Utilisation des données de fallback pour les notifications');
    }
  };

  // Fonction pour récupérer les activités
  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8089/PI/user-profile/${user.userId}/activities?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Activities data from API:', data);
        setActivitiesData(data);
      } else {
        console.log('⚠️ API Activities non disponible, utilisation des données de fallback');
      }
    } catch (error) {
      console.error('❌ Erreur fetch activities:', error);
      console.log('⚠️ Utilisation des données de fallback pour les activités');
    }
  };

  // Fonction pour initialiser les données de fallback
  const initializeFallbackData = () => {
    // Données de dashboard dynamiques basées sur l'utilisateur
    const fallbackDashboard = {
      interventionsCount: Math.floor(Math.random() * 50) + 10,
      projectsManaged: Math.floor(Math.random() * 10) + 1,
      successRate: Math.floor(Math.random() * 20) + 80,
      unreadNotifications: Math.floor(Math.random() * 10)
    };
    setDashboardData(fallbackDashboard);

    // Données de gamification dynamiques
    const randomLevel = Math.floor(Math.random() * 10) + 1;
    const randomXP = Math.floor(Math.random() * 2000) + 500;
    const fallbackGamification = {
      level: randomLevel,
      currentXP: randomXP,
      nextLevelXP: randomLevel * 500 + 1000,
      badges: [
        { id: 1, name: 'Expert Maintenance', icon: '🔧', earned: Math.random() > 0.3 },
        { id: 2, name: 'Gestionnaire Pro', icon: '📊', earned: Math.random() > 0.5 },
        { id: 3, name: 'Innovateur', icon: '💡', earned: Math.random() > 0.7 },
        { id: 4, name: 'Leader', icon: '👑', earned: Math.random() > 0.8 }
      ],
      achievements: [
        'Première intervention réussie',
        `${Math.floor(Math.random() * 20) + 5} projets complétés`,
        `${Math.floor(Math.random() * 60) + 10} jours sans défaut`
      ]
    };
    setGamificationData(fallbackGamification);

    // Données de notifications dynamiques
    const randomUnreadCount = Math.floor(Math.random() * 15);
    const fallbackNotifications = {
      unreadCount: randomUnreadCount,
      notifications: Array.from({ length: randomUnreadCount }, (_, i) => ({
        id: i + 1,
        title: `Notification ${i + 1}`,
        message: `Message dynamique généré pour la notification ${i + 1}`,
        type: ['info', 'success', 'warning'][Math.floor(Math.random() * 3)],
        isRead: Math.random() > 0.6,
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      }))
    };
    setNotificationsData(fallbackNotifications);

    // Données d'activités dynamiques
    const activityTypes = [
      { type: 'intervention', description: 'Intervention terminée', icon: '🔧' },
      { type: 'project', description: 'Projet créé', icon: '📋' },
      { type: 'order', description: 'Commande passée', icon: '📦' },
      { type: 'maintenance', description: 'Maintenance effectuée', icon: '⚙️' },
      { type: 'report', description: 'Rapport généré', icon: '📊' }
    ];
    const randomActivitiesCount = Math.floor(Math.random() * 8) + 3;
    const fallbackActivities = Array.from({ length: randomActivitiesCount }, (_, i) => {
      const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      return {
        id: i + 1,
        type: randomActivity.type,
        description: `${randomActivity.description} #${Math.floor(Math.random() * 1000) + 1}`,
        icon: randomActivity.icon,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    });
    setActivitiesData(fallbackActivities);
  };

  useEffect(() => {
    if (user?.userId) {
      // Initialiser les données de fallback immédiatement
      initializeFallbackData();
      
      // Puis essayer de récupérer les vraies données
      fetchUserDetails();
      fetchDashboardData();
      fetchGamificationData();
      fetchNotifications();
      fetchActivities();
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8089/PI/user/update/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedUser)
      });
      
      if (response.ok) {
        setUserDetails(editedUser);
        setIsEditing(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleCancel = () => {
    setEditedUser(userDetails);
    setIsEditing(false);
    setImagePreview(null);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = () => {
    const firstName = userDetails.firstName || user?.firstName || '';
    const lastName = userDetails.lastName || user?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getDefaultPhoto = () => {
    if (userDetails.role === 'MAGASINIER' || user?.role === 'MAGASINIER') {
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#003061;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#0056b3;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="200" height="200" fill="url(#bg)"/>
          <rect x="30" y="120" width="140" height="60" fill="#2c3e50" stroke="#34495e" stroke-width="2"/>
          <polygon points="30,120 100,80 170,120" fill="#34495e" stroke="#2c3e50" stroke-width="2"/>
          <rect x="80" y="140" width="40" height="30" fill="#e74c3c"/>
          <circle cx="100" cy="70" r="15" fill="#f39c12"/>
          <circle cx="100" cy="85" r="12" fill="#fdbcb4"/>
          <rect x="88" y="95" width="24" height="35" fill="#f39c12" rx="3"/>
          <rect x="85" y="130" width="30" height="25" fill="#2c3e50"/>
          <rect x="90" y="100" width="20" height="3" fill="#ecf0f1"/>
          <rect x="90" y="110" width="20" height="3" fill="#ecf0f1"/>
          <rect x="90" y="120" width="20" height="3" fill="#ecf0f1"/>
          <rect x="60" y="160" width="80" height="20" fill="#003061" rx="10"/>
          <text x="100" y="173" text-anchor="middle" fill="white" font-family="Arial" font-size="10" font-weight="bold">MAGASINIER</text>
        </svg>
      `)}`;
    }
    return null;
  };

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#6c757d'
      }}>
        Chargement du profil...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(248,250,252,1) 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Theme Selector */}
      <ThemeSelector onThemeChange={(theme) => {
        console.log('Theme changed to:', theme);
        // Apply theme changes to the page
      }} />
      {/* Floating Background Elements */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '60%',
          right: '10%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(77,166,255,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(0,102,204,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 10s ease-in-out infinite',
        }}
      />
      
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Success Message */}
      {showSuccess && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideInRight 0.5s ease-out',
          }}
        >
          <span style={{ fontSize: '20px' }}>✨</span>
          <span style={{ fontWeight: '600', fontSize: '15px' }}>{t('profile.success', 'Profil mis à jour avec succès!')}</span>
        </div>
      )}

      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Modern Header */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0 0 8px 0',
                }}
              >
                💼 {t('profile.title', 'Profil Utilisateur')}
              </h1>
              <p
                style={{
                  fontSize: '16px',
                  color: '#64748b',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                {t('profile.subtitle', 'Gérez vos informations personnelles en toute sécurité')}
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '12px',
              }}
            >
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  ✏️ {t('profile.edit', 'Modifier le Profil')}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    style={{
                      background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                      color: 'white',
                      border: 'none',
                      padding: '14px 24px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    ❌ {t('profile.cancel', 'Annuler')}
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      border: 'none',
                      padding: '14px 24px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    💾 {t('profile.save', 'Sauvegarder')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Profile Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
          }}
        >
          {/* Hero Section avec Gradient Bleu Professionnel */}
          <div
            style={{
              background: 'linear-gradient(135deg, #003061 0%, #0066cc 70%, #4da6ff 100%)',
              padding: '48px',
              borderRadius: '24px 24px 0 0',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 48, 97, 0.3)',
            }}
          >
            {/* Background Pattern */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.3,
              }}
            />
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '32px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* User Info */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    marginBottom: '16px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'white', fontWeight: '600' }}>
                    {userDetails?.role || user?.role || 'UTILISATEUR'}
                  </span>
                </div>
                
                <h2
                  style={{
                    fontSize: '36px',
                    fontWeight: '800',
                    color: 'white',
                    margin: '0 0 16px 0',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {userDetails?.firstName || user?.firstName || 'Prénom'} {userDetails?.lastName || user?.lastName || 'Nom'}
                </h2>
                
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                      }}
                    >
                      📧
                    </div>
                    <span
                      style={{
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '500',
                      }}
                    >
                      {userDetails?.email || user?.email || 'Email non renseigné'}
                    </span>
                  </div>
                  
                  {(userDetails?.adress || user?.adress) && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                        }}
                      >
                        📍
                      </div>
                      <span
                        style={{
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: '500',
                        }}
                      >
                        {userDetails?.adress || user?.adress}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Photo de Profil Moderne */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '180px',
                      height: '180px',
                      borderRadius: '50%',
                      background: imagePreview 
                        ? `url(${imagePreview}) center/cover no-repeat`
                        : getDefaultPhoto() 
                          ? `url(${getDefaultPhoto()}) center/cover no-repeat`
                          : 'linear-gradient(135deg, #003061, #0066cc, #4da6ff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '72px',
                      fontWeight: '700',
                      color: 'white',
                      border: '8px solid rgba(255, 255, 255, 0.4)',
                      boxShadow: '0 25px 50px rgba(0, 48, 97, 0.4), 0 0 0 2px rgba(77, 166, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
                      cursor: isEditing ? 'pointer' : 'default',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      animation: 'pulse 3s ease-in-out infinite',
                    }}
                    onClick={() => isEditing && document.getElementById('profileImageInput').click()}
                    onMouseOver={(e) => {
                      if (isEditing) {
                        e.target.style.transform = 'scale(1.08)';
                        e.target.style.boxShadow = '0 30px 60px rgba(0, 48, 97, 0.5), 0 0 0 3px rgba(77, 166, 255, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.2)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (isEditing) {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 25px 50px rgba(0, 48, 97, 0.4), 0 0 0 2px rgba(77, 166, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)';
                      }
                    }}
                  >
                    {!imagePreview && !getDefaultPhoto() && (
                      <span>{getInitials()}</span>
                    )}
                    
                    {isEditing && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0, 0, 0, 0.7)',
                          borderRadius: '50%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '1'}
                        onMouseLeave={(e) => e.target.style.opacity = '0'}
                      >
                        <div style={{ fontSize: '40px', marginBottom: '8px' }}>📷</div>
                        <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>Changer Photo</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Status Badge Bleu Professionnel */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #003061, #0066cc)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: '700',
                      border: '4px solid rgba(255, 255, 255, 0.5)',
                      boxShadow: '0 6px 20px rgba(0, 48, 97, 0.6), 0 0 0 2px rgba(77, 166, 255, 0.3)',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  >
                    ✓
                  </div>
                  
                  {/* Notification Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '32px',
                      height: '32px',
                      background: 'linear-gradient(135deg, #ff4444, #ff6b6b)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '700',
                      border: '3px solid rgba(255, 255, 255, 0.8)',
                      boxShadow: '0 4px 15px rgba(255, 68, 68, 0.5), 0 0 0 2px rgba(255, 107, 107, 0.3)',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      // Toggle notifications panel
                      console.log('Opening notifications panel');
                      // Future: Open notifications modal or panel
                    }}
                  >
                    {notificationsData?.unreadCount || 0}
                  </div>
                </div>
                
                {/* User Status Professionnel */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 48, 97, 0.3), rgba(0, 102, 204, 0.2))',
                    backdropFilter: 'blur(15px)',
                    padding: '16px 24px',
                    borderRadius: '25px',
                    border: '2px solid rgba(77, 166, 255, 0.4)',
                    boxShadow: '0 8px 25px rgba(0, 48, 97, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    animation: 'slideInUp 0.6s ease-out',
                  }}
                >
                  <div
                    style={{
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '700',
                      textAlign: 'center',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      background: 'linear-gradient(135deg, #ffffff, #4da6ff)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    ⚡ Utilisateur Actif Premium
                  </div>
                </div>
                
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Personal Dashboard */}
        <div
          style={{
            padding: '40px 40px 20px 40px',
          }}
        >
          {/* Statistics Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
              marginBottom: '40px',
            }}
          >
            {/* Interventions Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #003061, #0066cc)',
                borderRadius: '20px',
                padding: '24px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 48, 97, 0.3)',
                animation: 'slideInUp 0.6s ease-out',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  fontSize: '80px',
                  opacity: 0.1,
                }}
              >
                🔧
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>INTERVENTIONS</h4>
                <div style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                  {dashboardData?.statistics?.totalInterventions || dashboardData?.interventionsCount || 0}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>📈 Total réalisées</div>
              </div>
            </div>

            {/* Projects Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0066cc, #4da6ff)',
                borderRadius: '20px',
                padding: '24px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 102, 204, 0.3)',
                animation: 'slideInUp 0.8s ease-out',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  fontSize: '80px',
                  opacity: 0.1,
                }}
              >
                📊
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>PROJETS GÉRÉS</h4>
                <div style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                  {dashboardData?.statistics?.projectsManaged || dashboardData?.projectsManaged || 0}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>🎯 Total gérés</div>
              </div>
            </div>

            {/* Performance Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #4da6ff, #80c7ff)',
                borderRadius: '20px',
                padding: '24px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(77, 166, 255, 0.3)',
                animation: 'slideInUp 1s ease-out',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  fontSize: '80px',
                  opacity: 0.1,
                }}
              >
                🏆
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>TAUX DE RÉUSSITE</h4>
                <div style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                  {dashboardData?.statistics?.successRate ? Math.round(dashboardData.statistics.successRate) : 0}%
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>⭐ {dashboardData?.statistics?.successRate >= 90 ? 'Excellent' : dashboardData?.statistics?.successRate >= 70 ? 'Bon' : 'À améliorer'}</div>
              </div>
            </div>

            {/* Notifications Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, #80c7ff, #b3d9ff)',
                borderRadius: '20px',
                padding: '24px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(128, 199, 255, 0.3)',
                animation: 'slideInUp 1.2s ease-out',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  fontSize: '80px',
                  opacity: 0.1,
                }}
              >
                🔔
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>NOTIFICATIONS</h4>
                <div style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0' }}>
                  {notificationsData?.unreadCount || 0}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>📬 {notificationsData?.unreadCount > 0 ? 'Nouvelles' : 'Aucune nouvelle'}</div>
              </div>
            </div>
          </div>

          {/* Activity Timeline & Quick Actions */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '30px',
              marginBottom: '40px',
            }}
          >
            {/* Recent Activity */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(240, 248, 255, 0.95))',
                backdropFilter: 'blur(25px)',
                borderRadius: '24px',
                padding: '32px',
                border: '2px solid rgba(77, 166, 255, 0.3)',
                boxShadow: '0 15px 40px rgba(0, 48, 97, 0.15)',
                animation: 'slideInUp 1.4s ease-out',
              }}
            >
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#003061',
                  margin: '0 0 24px 0',
                  background: 'linear-gradient(135deg, #003061, #0066cc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ⚡ ACTIVITÉ RÉCENTE
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activitiesData && activitiesData.length > 0 ? (
                  activitiesData.slice(0, 5).map((activity, index) => (
                    <div
                      key={activity.id || index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '16px',
                        background: `rgba(${index % 3 === 0 ? '0, 48, 97' : index % 3 === 1 ? '0, 102, 204' : '77, 166, 255'}, 0.05)`,
                        borderRadius: '12px',
                        borderLeft: `4px solid ${index % 3 === 0 ? '#0066cc' : index % 3 === 1 ? '#4da6ff' : '#80c7ff'}`,
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          background: 'linear-gradient(135deg, #003061, #0066cc)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                        }}
                      >
                        {activity.icon || '📋'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#003061', fontSize: '14px' }}>
                          {activity.activityType?.replace('_', ' ') || 'Activité'}
                        </div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          {activity.description || 'Description non disponible'}
                        </div>
                        <div style={{ color: '#999', fontSize: '11px' }}>
                          {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Date inconnue'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback si pas d'activités
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      background: 'rgba(0, 48, 97, 0.05)',
                      borderRadius: '12px',
                      borderLeft: '4px solid #0066cc',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #003061, #0066cc)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                      }}
                    >
                      📋
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: '#003061', fontSize: '14px' }}>Aucune activité récente</div>
                      <div style={{ color: '#666', fontSize: '12px' }}>Vos activités apparaîtront ici</div>
                      <div style={{ color: '#999', fontSize: '11px' }}>En attente...</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & Notifications */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(240, 248, 255, 0.95))',
                backdropFilter: 'blur(25px)',
                borderRadius: '24px',
                padding: '32px',
                border: '2px solid rgba(77, 166, 255, 0.3)',
                boxShadow: '0 15px 40px rgba(0, 48, 97, 0.15)',
                animation: 'slideInUp 1.6s ease-out',
              }}
            >
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#003061',
                  margin: '0 0 24px 0',
                  background: 'linear-gradient(135deg, #003061, #0066cc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                🚀 ACTIONS RAPIDES
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Quick Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #003061, #0066cc)',
                      color: 'white',
                      border: 'none',
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(0, 48, 97, 0.3)',
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0, 48, 97, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0, 48, 97, 0.3)';
                    }}
                  >
                    📝 Nouvelle DI
                  </button>
                  
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #0066cc, #4da6ff)',
                      color: 'white',
                      border: 'none',
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(0, 102, 204, 0.3)',
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0, 102, 204, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0, 102, 204, 0.3)';
                    }}
                  >
                    📊 Rapport
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #4da6ff, #80c7ff)',
                      color: 'white',
                      border: 'none',
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(77, 166, 255, 0.3)',
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(77, 166, 255, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(77, 166, 255, 0.3)';
                    }}
                  >
                    📦 Commande PDR
                  </button>
                  
                  <button
                    style={{
                      background: 'linear-gradient(135deg, #80c7ff, #b3d9ff)',
                      color: 'white',
                      border: 'none',
                      padding: '16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(128, 199, 255, 0.3)',
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(128, 199, 255, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(128, 199, 255, 0.3)';
                    }}
                  >
                    💬 Messages
                  </button>
                </div>

                {/* Urgent Notifications */}
                <div
                  style={{
                    marginTop: '24px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 235, 59, 0.05))',
                    borderRadius: '16px',
                    border: '2px solid rgba(255, 193, 7, 0.3)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #ff9800, #ffc107)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        animation: 'pulse 2s ease-in-out infinite',
                      }}
                    >
                      ⚠️
                    </div>
                    <div style={{ fontWeight: '700', color: '#e65100', fontSize: '16px' }}>URGENT</div>
                  </div>
                  <div style={{ color: '#bf360c', fontSize: '14px', lineHeight: '1.4' }}>
                    Maintenance critique requise sur le système de refroidissement - Secteur B
                  </div>
                  <div style={{ color: '#8d6e63', fontSize: '12px', marginTop: '8px' }}>
                    Échéance: Aujourd'hui 16h00
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Gamification Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '30px',
              marginBottom: '40px',
            }}
          >
            {/* Badges & Achievements */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(240, 248, 255, 0.95))',
                backdropFilter: 'blur(25px)',
                borderRadius: '24px',
                padding: '32px',
                border: '2px solid rgba(77, 166, 255, 0.3)',
                boxShadow: '0 15px 40px rgba(0, 48, 97, 0.15)',
                animation: 'slideInUp 1.8s ease-out',
              }}
            >
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#003061',
                  margin: '0 0 24px 0',
                  background: 'linear-gradient(135deg, #003061, #0066cc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                🏆 BADGES & RÉUSSITES
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '16px' }}>
                {Object.entries(gamificationData?.badges || {}).map(([badgeKey, earned], index) => {
                const badgeInfo = {
                  expertMaintenance: { name: 'Expert Maintenance', icon: '🔧' },
                  innovator: { name: 'Innovateur', icon: '💡' },
                  teamPlayer: { name: 'Équipier', icon: '👥' },
                  perfectionist: { name: 'Perfectionniste', icon: '⭐' }
                }[badgeKey] || { name: badgeKey, icon: '🏆' };
                
                return (
                  <div
                    key={badgeKey}
                    style={{
                      background: earned ? 'linear-gradient(135deg, #ffd700, #ffed4e)' : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      textAlign: 'center',
                      border: earned ? '2px solid #ffd700' : '2px solid rgba(255, 255, 255, 0.2)',
                      opacity: earned ? 1 : 0.5,
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{badgeInfo.icon}</div>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: earned ? '#1f2937' : 'rgba(255, 255, 255, 0.7)'
                    }}>
                      {badgeInfo.name}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Experience Level & Progress */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(240, 248, 255, 0.95))',
                backdropFilter: 'blur(25px)',
                borderRadius: '24px',
                padding: '32px',
                border: '2px solid rgba(77, 166, 255, 0.3)',
                boxShadow: '0 15px 40px rgba(0, 48, 97, 0.15)',
                animation: 'slideInUp 2s ease-out',
              }}
            >
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#003061',
                  margin: '0 0 24px 0',
                  background: 'linear-gradient(135deg, #003061, #0066cc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                🎯 NIVEAU D'EXPÉRIENCE
              </h3>
              
              {/* Current Level */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #003061, #0066cc)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '700',
                    boxShadow: '0 8px 25px rgba(0, 48, 97, 0.3)',
                  }}
                >
                  {gamificationData?.level || 1}
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#003061' }}>
                    {gamificationData?.levelTitle || 'Débutant'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {gamificationData?.experiencePoints || 0} / {gamificationData?.xpForNextLevel || 100} XP
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '12px',
                  background: 'rgba(0, 48, 97, 0.1)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: `${((gamificationData?.experiencePoints || 0) / (gamificationData?.xpForNextLevel || 100)) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(135deg, #003061, #0066cc, #4da6ff)',
                    borderRadius: '6px',
                    position: 'relative',
                    animation: 'shimmer 2s ease-in-out infinite',
                  }}
                />
              </div>
              
              {/* Next Achievements */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#003061', marginBottom: '12px' }}>🎯 Prochains Objectifs:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'rgba(0, 48, 97, 0.05)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <span>🎖️</span>
                    <span style={{ color: '#666' }}>
                      Niveau {(gamificationData?.level || 1) + 1} - {gamificationData?.level >= 15 ? 'Master Expert' : gamificationData?.level >= 10 ? 'Expert Avancé' : 'Niveau Supérieur'} 
                      ({gamificationData?.xpNeededForNext || 100} XP restants)
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'rgba(0, 102, 204, 0.05)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <span>🏅</span>
                    <span style={{ color: '#666' }}>Badge "Mentor" - Former 5 nouveaux techniciens</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div
          style={{
            padding: '0 40px 40px 40px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '30px',
            }}
          >
            {/* Informations Utilisateur */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(240, 248, 255, 0.95))',
                backdropFilter: 'blur(25px)',
                padding: '40px',
                borderRadius: '24px',
                border: '2px solid rgba(77, 166, 255, 0.3)',
                boxShadow: '0 15px 40px rgba(0, 48, 97, 0.15), 0 0 0 1px rgba(77, 166, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                animation: 'slideInUp 0.8s ease-out',
              }}
            >
              {/* Decorative Corner */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, rgba(0, 48, 97, 0.1), rgba(77, 166, 255, 0.05))',
                  borderRadius: '0 24px 0 100px',
                }}
              />
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#003061',
                  margin: '0 0 24px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  position: 'relative',
                  zIndex: 1,
                  background: 'linear-gradient(135deg, #003061, #0066cc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                👤 INFORMATIONS UTILISATEUR
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Email Field */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#003061',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: 'linear-gradient(135deg, #003061, #0066cc)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    📧 {t('profile.email', 'ADRESSE EMAIL').toUpperCase()}
                  </label>
                  <div
                    style={{
                      fontSize: '16px',
                      color: '#003061',
                      fontWeight: '600',
                      padding: '16px 20px',
                      background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.8), rgba(255, 255, 255, 0.6))',
                      borderRadius: '12px',
                      border: '1px solid rgba(77, 166, 255, 0.2)',
                      position: 'relative',
                    }}
                  >
                    {userDetails?.email || user?.email || 'Email non renseigné'}
                  </div>
                </div>

                {/* First Name Field */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#003061',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: 'linear-gradient(135deg, #003061, #0066cc)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    👤 {t('profile.firstName', 'PRÉNOM').toUpperCase()}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.firstName || ''}
                      onChange={(e) => setEditedUser({...editedUser, firstName: e.target.value})}
                      placeholder={t('profile.firstName.placeholder', 'Votre prénom')}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: '2px solid rgba(77, 166, 255, 0.3)',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '500',
                        background: 'rgba(240, 248, 255, 0.5)',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0066cc';
                        e.target.style.boxShadow = '0 0 0 3px rgba(77, 166, 255, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(77, 166, 255, 0.3)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#003061',
                        fontWeight: '600',
                        padding: '16px 20px',
                        background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.8), rgba(255, 255, 255, 0.6))',
                        borderRadius: '12px',
                        border: '1px solid rgba(77, 166, 255, 0.2)',
                        position: 'relative',
                      }}
                    >
                      {userDetails?.firstName || user?.firstName || 'Prénom non renseigné'}
                    </div>
                  )}
                </div>

                {/* Last Name Field */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#003061',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: 'linear-gradient(135deg, #003061, #0066cc)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    👥 {t('profile.lastName', 'NOM DE FAMILLE').toUpperCase()}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.lastName || ''}
                      onChange={(e) => setEditedUser({...editedUser, lastName: e.target.value})}
                      placeholder={t('profile.lastName.placeholder', 'Votre nom de famille')}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: '2px solid rgba(77, 166, 255, 0.3)',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '500',
                        background: 'rgba(240, 248, 255, 0.5)',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0066cc';
                        e.target.style.boxShadow = '0 0 0 3px rgba(77, 166, 255, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(77, 166, 255, 0.3)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#003061',
                        fontWeight: '600',
                        padding: '16px 20px',
                        background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.8), rgba(255, 255, 255, 0.6))',
                        borderRadius: '12px',
                        border: '1px solid rgba(77, 166, 255, 0.2)',
                        position: 'relative',
                      }}
                    >
                      {userDetails?.lastName || user?.lastName || 'Nom non renseigné'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Informations de Contact */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(240, 248, 255, 0.95))',
                backdropFilter: 'blur(25px)',
                padding: '40px',
                borderRadius: '24px',
                border: '2px solid rgba(77, 166, 255, 0.3)',
                boxShadow: '0 15px 40px rgba(0, 48, 97, 0.15), 0 0 0 1px rgba(77, 166, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                animation: 'slideInUp 1s ease-out',
              }}
            >
              {/* Decorative Corner */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.1), rgba(77, 166, 255, 0.05))',
                  borderRadius: '24px 0 100px 0',
                }}
              />
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#003061',
                  margin: '0 0 24px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  position: 'relative',
                  zIndex: 1,
                  background: 'linear-gradient(135deg, #003061, #0066cc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                📞 INFORMATIONS DE CONTACT
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Phone Number Field */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#003061',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: 'linear-gradient(135deg, #003061, #0066cc)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    📱 {t('profile.phone', 'NUMÉRO DE TÉLÉPHONE').toUpperCase()}
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedUser.phoneNumber || ''}
                      onChange={(e) => setEditedUser({...editedUser, phoneNumber: e.target.value})}
                      placeholder={t('profile.phone.placeholder', '+33 1 23 45 67 89')}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: '2px solid rgba(77, 166, 255, 0.3)',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '500',
                        background: 'rgba(240, 248, 255, 0.5)',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0066cc';
                        e.target.style.boxShadow = '0 0 0 3px rgba(77, 166, 255, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(77, 166, 255, 0.3)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#003061',
                        fontWeight: '600',
                        padding: '16px 20px',
                        background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.8), rgba(255, 255, 255, 0.6))',
                        borderRadius: '12px',
                        border: '1px solid rgba(77, 166, 255, 0.2)',
                        position: 'relative',
                      }}
                    >
                      {userDetails?.phoneNumber || user?.phoneNumber || 'Numéro non renseigné'}
                    </div>
                  )}
                </div>

                {/* Address Field */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#003061',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: 'linear-gradient(135deg, #003061, #0066cc)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    🏠 {t('profile.address', 'ADRESSE').toUpperCase()}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.adress || ''}
                      onChange={(e) => setEditedUser({...editedUser, adress: e.target.value})}
                      placeholder={t('profile.address.placeholder', '123 Rue de la République, 75001 Paris')}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        border: '2px solid rgba(77, 166, 255, 0.3)',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '500',
                        background: 'rgba(240, 248, 255, 0.5)',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0066cc';
                        e.target.style.boxShadow = '0 0 0 3px rgba(77, 166, 255, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(77, 166, 255, 0.3)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        fontSize: '16px',
                        color: '#003061',
                        fontWeight: '600',
                        padding: '16px 20px',
                        background: 'linear-gradient(135deg, rgba(240, 248, 255, 0.8), rgba(255, 255, 255, 0.6))',
                        borderRadius: '12px',
                        border: '1px solid rgba(77, 166, 255, 0.2)',
                        position: 'relative',
                      }}
                    >
                      {userDetails?.adress || user?.adress || 'Adresse non renseignée'}
                    </div>
                  )}
                </div>


              </div>
            </div>
          </div>



          {/* Save Button */}
          {isEditing && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '30px',
              }}
            >
              <button
                onClick={handleCancel}
                style={{
                  background: 'linear-gradient(135deg, #003061, #0066cc, #4da6ff)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(0, 48, 97, 0.4), 0 0 0 1px rgba(77, 166, 255, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(0, 48, 97, 0.5), 0 0 0 2px rgba(77, 166, 255, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 48, 97, 0.4), 0 0 0 1px rgba(77, 166, 255, 0.3)';
                }}
              >
                ✏️ {t('profile.cancel', 'Annuler')}
              </button>
              <button
                onClick={handleSave}
                style={{
                  background: 'linear-gradient(135deg, #003061, #0066cc, #4da6ff)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(0, 48, 97, 0.4), 0 0 0 1px rgba(77, 166, 255, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(0, 48, 97, 0.5), 0 0 0 2px rgba(77, 166, 255, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 48, 97, 0.4), 0 0 0 1px rgba(77, 166, 255, 0.3)';
                }}
              >
                💾 {t('profile.save', 'Sauvegarder')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
