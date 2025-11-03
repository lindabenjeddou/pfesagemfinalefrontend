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

        {/* Main Profile Card - Ultra Modern Design */}
        <div
          style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(240, 248, 255, 0.92))',
            backdropFilter: 'blur(40px) saturate(180%)',
            borderRadius: '32px',
            boxShadow: `
              0 30px 80px rgba(0, 48, 97, 0.2),
              0 0 0 1px rgba(77, 166, 255, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.9)
            `,
            border: '2px solid rgba(77, 166, 255, 0.3)',
            overflow: 'hidden',
            position: 'relative',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = `
              0 40px 100px rgba(0, 48, 97, 0.3),
              0 0 0 2px rgba(77, 166, 255, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 1)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `
              0 30px 80px rgba(0, 48, 97, 0.2),
              0 0 0 1px rgba(77, 166, 255, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.9)
            `;
          }}
        >
          {/* Floating Decorative Elements */}
          <div
            style={{
              position: 'absolute',
              top: '10%',
              right: '-5%',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(77, 166, 255, 0.15), transparent 70%)',
              borderRadius: '50%',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '20%',
              left: '-5%',
              width: '150px',
              height: '150px',
              background: 'radial-gradient(circle, rgba(0, 102, 204, 0.1), transparent 70%)',
              borderRadius: '50%',
              zIndex: 0,
            }}
          />

          {/* Hero Section avec Gradient Futuriste */}
          <div
            style={{
              background: 'linear-gradient(135deg, #003061 0%, #0066cc 50%, #4da6ff 100%)',
              padding: '56px 48px',
              borderRadius: '32px 32px 0 0',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 48, 97, 0.4)',
            }}
          >
            {/* Animated Background Pattern */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.15"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.4,
              }}
            />
            
            {/* Geometric Decorative Shapes */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '40px',
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                backdropFilter: 'blur(10px)',
              }}
            />
            
            <div
              style={{
                position: 'absolute',
                bottom: '30px',
                left: '30px',
                width: '120px',
                height: '120px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
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
              {/* User Info - Modern Design */}
              <div style={{ flex: 1 }}>
                {/* Role Badge with Glow Effect */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(15px)',
                    padding: '10px 20px',
                    borderRadius: '24px',
                    marginBottom: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
                  }}
                >
                  <span style={{ 
                    fontSize: '16px',
                    filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3))',
                  }}>💼</span>
                  <span style={{ 
                    fontSize: '13px', 
                    color: 'white', 
                    fontWeight: '700',
                    letterSpacing: '1px',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}>
                    {userDetails?.role || user?.role || 'UTILISATEUR'}
                  </span>
                </div>
                
                {/* Status Badge - En ligne */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    marginBottom: '20px',
                    border: '2px solid rgba(16, 185, 129, 0.4)',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#10b981',
                      boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)',
                    }}
                  />
                  <span style={{ 
                    fontSize: '12px', 
                    color: 'white', 
                    fontWeight: '600',
                  }}>
                    En ligne
                  </span>
                  <span style={{ 
                    fontSize: '11px', 
                    color: 'rgba(255, 255, 255, 0.8)',
                    marginLeft: '4px',
                  }}>
                    • Dernière connexion: {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                {/* Name with Text Animation */}
                <h2
                  style={{
                    fontSize: '42px',
                    fontWeight: '900',
                    color: 'white',
                    margin: '0 0 24px 0',
                    textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    letterSpacing: '-0.5px',
                    lineHeight: '1.2',
                    background: 'linear-gradient(135deg, #ffffff, #e0f2ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {userDetails?.firstName || user?.firstName || 'Prénom'} {userDetails?.lastName || user?.lastName || 'Nom'}
                </h2>
                
                {/* Info Cards with Modern Design */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* Email Info Card */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(15px)',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(8px) scale(1.02)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0) scale(1)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'rgba(255, 255, 255, 0.25)',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2))',
                      }}
                    >
                      📧
                    </div>
                    <span
                      style={{
                        color: 'white',
                        fontSize: '17px',
                        fontWeight: '600',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                        letterSpacing: '0.3px',
                      }}
                    >
                      {userDetails?.email || user?.email || 'Email non renseigné'}
                    </span>
                  </div>
                  
                  {/* Address Info Card */}
                  {(userDetails?.adress || user?.adress) && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        background: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(15px)',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(8px) scale(1.02)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0) scale(1)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                      }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          background: 'rgba(255, 255, 255, 0.25)',
                          borderRadius: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.2))',
                        }}
                      >
                        📍
                      </div>
                      <span
                        style={{
                          color: 'white',
                          fontSize: '17px',
                          fontWeight: '600',
                          textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {userDetails?.adress || user?.adress}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Quick Stats */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginTop: '24px',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(10px)',
                      padding: '16px 12px',
                      borderRadius: '14px',
                      textAlign: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📅</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>
                      {Math.floor((new Date() - new Date(userDetails?.createdAt || user?.createdAt || new Date())) / (1000 * 60 * 60 * 24)) || 0}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Jours actif</div>
                  </div>
                  
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(10px)',
                      padding: '16px 12px',
                      borderRadius: '14px',
                      textAlign: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>✅</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>100%</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Profil complet</div>
                  </div>
                  
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(10px)',
                      padding: '16px 12px',
                      borderRadius: '14px',
                      textAlign: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>Actif</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>Sécurité</div>
                  </div>
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
        </div>

        {/* Profile Content - Ultra Modern Design */}
        <div
          style={{
            padding: '0 40px 40px 40px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '32px',
            }}
          >
            {/* Informations Utilisateur - Futuristic Card */}
            <div
              style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(240, 248, 255, 0.9))',
                backdropFilter: 'blur(30px) saturate(180%)',
                padding: '48px',
                borderRadius: '32px',
                border: '2px solid rgba(77, 166, 255, 0.4)',
                boxShadow: `
                  0 20px 60px rgba(0, 48, 97, 0.2),
                  0 0 0 1px rgba(77, 166, 255, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = `
                  0 30px 80px rgba(0, 48, 97, 0.3),
                  0 0 0 2px rgba(77, 166, 255, 0.5),
                  inset 0 1px 0 rgba(255, 255, 255, 0.9)
                `;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = `
                  0 20px 60px rgba(0, 48, 97, 0.2),
                  0 0 0 1px rgba(77, 166, 255, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `;
              }}
            >
              {/* Animated Background Pattern */}
              <div
                style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(77, 166, 255, 0.1) 0%, transparent 70%)',
                }}
              />
              
              {/* Decorative Geometric Shapes */}
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.15), rgba(77, 166, 255, 0.08))',
                  borderRadius: '50% 30% 50% 30%',
                }}
              />
              
              <div
                style={{
                  position: 'absolute',
                  bottom: '30px',
                  left: '30px',
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(225deg, rgba(0, 48, 97, 0.1), transparent)',
                  borderRadius: '30% 50% 30% 50%',
                }}
              />
              
              <h3
                style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  margin: '0 0 32px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  position: 'relative',
                  zIndex: 1,
                  background: 'linear-gradient(135deg, #003061, #0066cc, #4da6ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span style={{
                  fontSize: '28px',
                  filter: 'drop-shadow(0 4px 8px rgba(0, 102, 204, 0.3))',
                }}>👤</span>
                INFORMATIONS
              </h3>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '28px',
                position: 'relative',
                zIndex: 1 
              }}>
                {/* Email Field - Futuristic Style */}
                <div
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(8px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '13px',
                      fontWeight: '800',
                      marginBottom: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                      background: 'linear-gradient(135deg, #003061, #0066cc, #4da6ff)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    <span style={{
                      fontSize: '22px',
                      filter: 'drop-shadow(0 2px 4px rgba(0, 102, 204, 0.2))',
                    }}>📧</span>
                    {t('profile.email', 'EMAIL')}
                  </label>
                  <div
                    style={{
                      fontSize: '16px',
                      color: '#003061',
                      fontWeight: '600',
                      padding: '18px 24px 18px 20px',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 248, 255, 0.7))',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: '2px solid rgba(77, 166, 255, 0.25)',
                      position: 'relative',
                      boxShadow: '0 8px 24px rgba(0, 48, 97, 0.08)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(77, 166, 255, 0.5)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 48, 97, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(77, 166, 255, 0.25)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 48, 97, 0.08)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '4px',
                      height: '100%',
                      background: 'linear-gradient(180deg, #003061, #0066cc, #4da6ff)',
                      borderRadius: '16px 0 0 16px',
                    }}/>
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
