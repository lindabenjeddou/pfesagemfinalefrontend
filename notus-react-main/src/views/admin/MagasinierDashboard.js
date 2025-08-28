import React, { useState, useEffect } from 'react';
import MagasinierNotifications from '../../components/Notifications/MagasinierNotifications';

const MagasinierDashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({
    totalNotifications: 0,
    unreadNotifications: 0,
    componentsOrdered: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    // Simuler les informations utilisateur (normalement récupérées depuis le contexte d'auth)
    const mockUserInfo = {
      id: 2,
      name: 'Linda Benjeddou',
      role: 'MAGASINIER',
      email: 'benjeddoulindaddd@gmail.com'
    };
    setUserInfo(mockUserInfo);

    // Simuler les statistiques
    setStats({
      totalNotifications: 12,
      unreadNotifications: 2,
      componentsOrdered: 47,
      pendingTasks: 3
    });
  }, []);

  if (!userInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              marginBottom: '0.5rem'
            }}>
              🏢 Dashboard Magasinier
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: '#6b7280',
              margin: 0
            }}>
              👤 Bienvenue, <strong>{userInfo.name}</strong>
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>🔔</div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Notifications</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          {
            title: 'Notifications Totales',
            value: stats.totalNotifications,
            icon: '📊',
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.1)'
          },
          {
            title: 'Non Lues',
            value: stats.unreadNotifications,
            icon: '🔔',
            color: '#ef4444',
            bgColor: 'rgba(239, 68, 68, 0.1)'
          },
          {
            title: 'Composants Commandés',
            value: stats.componentsOrdered,
            icon: '📦',
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.1)'
          },
          {
            title: 'Tâches Pendantes',
            value: stats.pendingTasks,
            icon: '⚡',
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)'
          }
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: `2px solid ${stat.bgColor}`,
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: '0 0 0.5rem 0'
                }}>
                  {stat.title}
                </p>
                <p style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: stat.color,
                  margin: 0
                }}>
                  {stat.value}
                </p>
              </div>
              <div style={{
                fontSize: '2.5rem',
                opacity: 0.7
              }}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem'
      }}>
        {/* Notifications Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
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
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1.5rem'
          }}>
            ⚡ Actions Rapides
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {[
              {
                title: '📦 Gérer Stock',
                description: 'Vérifier et mettre à jour le stock',
                action: () => window.location.href = '/admin/components'
              },
              {
                title: '📋 Voir Commandes',
                description: 'Consulter les commandes en cours',
                action: () => window.location.href = '/admin/bons'
              },
              {
                title: '🔄 Actualiser',
                description: 'Actualiser les notifications',
                action: () => window.location.reload()
              }
            ].map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                style={{
                  background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 48, 97, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  margin: '0 0 0.5rem 0'
                }}>
                  {action.title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  opacity: 0.9,
                  margin: 0
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
        marginTop: '2rem',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '0.875rem'
      }}>
        <p>🏢 Plateforme de Gestion Sagemcom - Dashboard Magasinier</p>
        <p>✅ Système de notifications en temps réel actif</p>
      </div>
    </div>
  );
};

export default MagasinierDashboard;
