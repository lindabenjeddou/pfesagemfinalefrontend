import React, { useState, useEffect } from 'react';
import MagasinierNotifications from '../../components/Notifications/MagasinierNotifications';
import { useSecurity } from '../../contexts/SecurityContext';

const MagasinierDashboard = () => {
  const { user } = useSecurity();
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({
    totalNotifications: 0,
    unreadNotifications: 0,
    componentsOrdered: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    // Récupérer les informations de l'utilisateur connecté
    console.log('🔍 Utilisateur connecté:', user);
    
    if (user) {
      const currentUserInfo = {
        id: user.userId || user.id,
        name: `${user.firstName || user.firstname || ''} ${user.lastName || user.lastname || ''}`.trim() || user.email,
        role: user.role || 'MAGASINIER',
        email: user.email
      };
      console.log('✅ UserInfo pour dashboard:', currentUserInfo);
      setUserInfo(currentUserInfo);
    } else {
      // Fallback: essayer de récupérer depuis localStorage
      const storedUser = localStorage.getItem('sagemcom_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const fallbackUserInfo = {
            id: parsedUser.userId || parsedUser.id,
            name: `${parsedUser.firstName || parsedUser.firstname || ''} ${parsedUser.lastName || parsedUser.lastname || ''}`.trim() || parsedUser.email,
            role: parsedUser.role || 'MAGASINIER',
            email: parsedUser.email
          };
          console.log('✅ UserInfo depuis localStorage:', fallbackUserInfo);
          setUserInfo(fallbackUserInfo);
        } catch (e) {
          console.error('❌ Erreur parsing user localStorage:', e);
        }
      }
    }

    // Simuler les statistiques (à remplacer par un appel API réel)
    setStats({
      totalNotifications: 12,
      unreadNotifications: 2,
      componentsOrdered: 47,
      pendingTasks: 3
    });
  }, [user]);

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(1deg); }
          66% { transform: translateY(4px) rotate(-1deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,120,212,0.3); }
          50% { box-shadow: 0 0 30px rgba(0,120,212,0.5); }
        }
      `}</style>
      
      {/* Background avec éléments décoratifs flottants */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(248,250,252,1) 100%)',
        zIndex: -2
      }}>
        {/* Éléments décoratifs flottants */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${20 + i * 10}px`,
              height: `${20 + i * 10}px`,
              background: `linear-gradient(45deg, ${i % 2 === 0 ? '#00d4ff, #0078d4' : '#ff006e, #8338ec'})`,
              borderRadius: '50%',
              top: `${10 + i * 15}%`,
              left: `${5 + i * 15}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              filter: 'blur(1px)',
              opacity: 0.6
            }}
          />
        ))}
      </div>

      <div style={{
        minHeight: '100vh',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.6s ease-out'
        }}>

        <div style={{ padding: '2rem', position: 'relative', zIndex: 2 }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,48,97,0.95) 0%, rgba(0,120,212,0.9) 50%, rgba(0,48,97,0.95) 100%)',
            borderRadius: '24px',
            padding: '2.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 20px 40px rgba(0,48,97,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            animation: 'slideInLeft 0.8s ease-out',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,255,255,0.15) 0%, transparent 50%)`,
              zIndex: -1
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ animation: 'fadeInUp 1s ease-out 0.2s both' }}>
                <h1 style={{
                  fontSize: '3rem',
                  fontWeight: '800',
                  color: '#ffffff',
                  margin: 0,
                  marginBottom: '0.75rem',
                  fontFamily: 'Inter, sans-serif',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}>
                  🏢 Dashboard Magasinier
                </h1>
                <p style={{
                  fontSize: '1.25rem',
                  color: 'rgba(255,255,255,0.95)',
                  margin: 0,
                  fontWeight: '500',
                  textShadow: '0 1px 5px rgba(0,0,0,0.2)'
                }}>
                  👤 Bienvenue, <strong style={{ color: '#ffffff', textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>{userInfo.name}</strong>
                </p>
              </div>
              
              <div style={{
                background: '#003061',
                color: 'white',
                padding: '1.5rem 2rem',
                borderRadius: '20px',
                textAlign: 'center',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                animation: 'glow 3s ease-in-out infinite'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  marginBottom: '0.5rem'
                }}>
                  🔔
                </div>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  marginBottom: '0.25rem'
                }}>
                  Notifications
                </div>
                <div style={{
                  fontSize: '0.875rem',
                  opacity: 0.9
                }}>
                  En temps réel
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {[
              {
                title: 'Notifications Totales',
                value: stats.totalNotifications,
                icon: '📊',
                color: '#0078d4',
                bgGradient: 'linear-gradient(135deg, rgba(0,120,212,0.1) 0%, rgba(0,48,97,0.05) 100%)'
              },
              {
                title: 'Non Lues',
                value: stats.unreadNotifications,
                icon: '🔔',
                color: '#ff6b6b',
                bgGradient: 'linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(255,0,0,0.05) 100%)'
              },
              {
                title: 'Composants Commandés',
                value: stats.componentsOrdered,
                icon: '📦',
                color: '#51cf66',
                bgGradient: 'linear-gradient(135deg, rgba(81,207,102,0.1) 0%, rgba(0,255,0,0.05) 100%)'
              },
              {
                title: 'Tâches Pendantes',
                value: stats.pendingTasks,
                icon: '⚡',
                color: '#ffd43b',
                bgGradient: 'linear-gradient(135deg, rgba(255,212,59,0.1) 0%, rgba(255,165,0,0.05) 100%)'
              }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '2rem',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: `0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 25px 60px rgba(0,48,97,0.25), inset 0 1px 0 rgba(255,255,255,0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = `0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)`;
                }}
              >
                {/* Background Pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: stat.bgGradient,
                  zIndex: -1
                }} />
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#374151',
                      margin: '0 0 0.75rem 0',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {stat.title}
                    </p>
                    <p style={{
                      fontSize: '2.5rem',
                      fontWeight: '800',
                      color: '#003061',
                      margin: 0,
                      textShadow: '0 2px 4px rgba(0,48,97,0.2)',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {stat.value}
                    </p>
                  </div>
                  <div style={{
                    fontSize: '3rem',
                    opacity: 0.8,
                    animation: 'pulse 2s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                  }}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem',
            '@media (max-width: 1024px)': {
              gridTemplateColumns: '1fr'
            }
          }}>
            {/* Notifications Section */}
            <div style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)`,
              backdropFilter: 'blur(25px)',
              borderRadius: '24px',
              padding: '2.5rem',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: `0 20px 60px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.3)`,
              animation: 'fadeInUp 1s ease-out 0.4s both'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#003061',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textShadow: '0 2px 4px rgba(0,48,97,0.1)'
              }}>
                🔔 Notifications en Temps Réel
              </h2>
              
              <MagasinierNotifications 
                userId={userInfo.id} 
                userRole={userInfo.role} 
              />
            </div>

            {/* Quick Actions */}
            <div style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)`,
              backdropFilter: 'blur(25px)',
              borderRadius: '24px',
              padding: '2.5rem',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: `0 20px 60px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.3)`,
              animation: 'fadeInUp 1s ease-out 0.6s both'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#003061',
                marginBottom: '2rem',
                textShadow: '0 2px 4px rgba(0,48,97,0.1)'
              }}>
                ⚡ Actions Rapides
              </h2>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {[
                  {
                    title: '📦 Gérer Stock',
                    description: 'Vérifier et mettre à jour le stock',
                    action: () => window.location.href = '/admin/components',
                    gradient: 'linear-gradient(135deg, rgba(0,120,212,0.9) 0%, rgba(0,48,97,0.95) 100%)'
                  },
                  {
                    title: '📋 Voir Commandes',
                    description: 'Consulter les commandes en cours',
                    action: () => window.location.href = '/admin/bons',
                    gradient: 'linear-gradient(135deg, rgba(81,207,102,0.9) 0%, rgba(0,150,0,0.95) 100%)'
                  },
                  {
                    title: '🔄 Actualiser',
                    description: 'Actualiser les notifications',
                    action: () => window.location.reload(),
                    gradient: 'linear-gradient(135deg, rgba(255,212,59,0.9) 0%, rgba(255,165,0,0.95) 100%)'
                  }
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    style={{
                      background: action.gradient,
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      textAlign: 'left',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                      animation: `fadeInUp 0.8s ease-out ${0.8 + index * 0.1}s both`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                    }}
                  >
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      margin: '0 0 0.5rem 0',
                      textShadow: '0 0 10px rgba(255,255,255,0.3)'
                    }}>
                      {action.title}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      opacity: 0.9,
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '3rem',
            padding: '2rem',
            background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)`,
            backdropFilter: 'blur(15px)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.2)',
            animation: 'fadeInUp 1s ease-out 1s both'
          }}>
            <p style={{
              color: '#003061',
              fontSize: '1rem',
              margin: '0 0 0.5rem 0',
              fontWeight: '600'
            }}>
              🏢 Plateforme de Gestion Sagemcom - Dashboard Magasinier
            </p>
            <p style={{
              color: '#374151',
              fontSize: '0.875rem',
              margin: 0
            }}>
              ✅ Système de notifications en temps réel actif
            </p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default MagasinierDashboard;
