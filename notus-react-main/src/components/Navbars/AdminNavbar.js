import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import NavbarNotifications from '../Notifications/NavbarNotifications';
import { useSecurity } from '../../contexts/SecurityContext';

export default function AdminNavbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const history = useHistory();
  const { user: securityUser, isAuthenticated, logout } = useSecurity();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        console.log('🔍 AdminNavbar - Utilisateur du SecurityContext:', securityUser);
        const token = localStorage.getItem('token');
        console.log('🔍 AdminNavbar - Token:', token ? 'Présent' : 'Absent');
        
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
        setLoading(false);
        
        const response = await fetch('http://localhost:8089/PI/user/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('🔍 AdminNavbar - Réponse API status:', response.status);
        
        if (response.ok) {
          const users = await response.json();
          console.log('🔍 AdminNavbar - Tous les utilisateurs récupérés:', users);
          console.log('🔍 AdminNavbar - Recherche utilisateur avec ID:', securityUser?.userId);
          
          const currentUser = users.find(u => u.id === securityUser?.userId);
          console.log('🔍 AdminNavbar - Utilisateur trouvé:', currentUser);
          
          if (currentUser) {
            console.log('✅ AdminNavbar - Utilisation des données API');
            setUser(currentUser);
          } else {
            console.log('⚠️ AdminNavbar - Utilisateur non trouvé, conservation des données de fallback');
          }
        } else {
          console.error('❌ AdminNavbar - Erreur API:', response.status, response.statusText);
          console.log('⚠️ AdminNavbar - Conservation des données de fallback par défaut');
        }
      } catch (error) {
        console.error('❌ AdminNavbar - Erreur fetch:', error);
        console.log('⚠️ AdminNavbar - Conservation des données de fallback par défaut');
      }
    };

    fetchUserDetails();

    // Scroll detection
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [securityUser, isAuthenticated]);

  if (loading) {
    return (
      <nav style={{
        position: 'fixed',
        top: 0,
        left: '280px',
        right: 0,
        height: '80px',
        background: 'linear-gradient(135deg, rgba(0,48,97,0.95) 0%, rgba(0,120,212,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'white',
          fontSize: '14px',
          fontFamily: '"Inter", sans-serif'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Chargement...
        </div>
      </nav>
    );
  }

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
      `}</style>

      {/* Ultra-Modern Admin Navbar */}
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
        justifyContent: 'space-between',
        padding: '0 40px',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: 'slideInDown 1s ease-out',
        overflow: 'hidden',
        position: 'relative'
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

        {/* Floating Particles System */}
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
        <div style={{
          position: 'absolute',
          top: '35px',
          right: '120px',
          width: '10px',
          height: '10px',
          background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
          borderRadius: '50%',
          opacity: 0.5,
          animation: 'pulse 4s ease-in-out infinite 3s',
          filter: 'blur(0.4px)',
          boxShadow: '0 0 18px rgba(255,77,79,0.4)'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '200px',
          width: '6px',
          height: '6px',
          background: 'linear-gradient(135deg, #faad14 0%, #ffd666 100%)',
          borderRadius: '50%',
          opacity: 0.6,
          animation: 'pulse 4s ease-in-out infinite 2s',
          filter: 'blur(0.2px)',
          boxShadow: '0 0 12px rgba(250,173,20,0.4)'
        }}></div>

        {/* Ultra-Modern Brand Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: `
              linear-gradient(135deg, 
                #0078d4 0%, 
                #40a9ff 25%,
                #0078d4 50%,
                #003061 75%,
                #001529 100%
              )
            `,
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `
              0 0 40px rgba(0,120,212,0.4),
              inset 0 2px 0 rgba(255,255,255,0.2),
              inset 0 -2px 0 rgba(0,48,97,0.3)
            `,
            animation: 'pulse 4s ease-in-out infinite',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.1)'
          }}>
            {/* Multi-layer shimmer effects */}
            <span style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: 'shimmer 3s infinite'
            }}></span>
            <span style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(45deg, transparent, rgba(64,169,255,0.3), transparent)',
              animation: 'shimmer 4s infinite 1s'
            }}></span>
            
            <i className="fas fa-building" style={{
              fontSize: '24px',
              color: 'white',
              filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.5))',
              animation: 'glow 3s ease-in-out infinite'
            }}></i>
          </div>
          
          <div style={{
            position: 'relative'
          }}>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '800',
              margin: 0,
              fontFamily: '"Inter", sans-serif',
              letterSpacing: '0.8px',
              background: `
                linear-gradient(135deg, 
                  #ffffff 0%, 
                  #e6f7ff 25%,
                  #bae7ff 50%,
                  #91d5ff 75%,
                  #69c0ff 100%
                )
              `,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% 100%',
              animation: 'shimmer 4s ease-in-out infinite',
              textShadow: '0 0 30px rgba(255,255,255,0.1)',
              position: 'relative'
            }}>
              🏢 Sagemcom Maintenance
            </h1>
            <p style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.8)',
              margin: '4px 0 0 0',
              fontWeight: '500',
              fontFamily: '"Inter", sans-serif',
              letterSpacing: '0.3px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(186,231,255,0.9) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ⚡ Plateforme Administrative Avancée
            </p>
          </div>
        </div>

        {/* Ultra-Modern Navigation Items */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Advanced Notifications Container */}
          {user && user.id && (
            <div style={{
              position: 'relative',
              padding: '8px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(0,120,212,0.05) 100%)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(15px)',
              transition: 'all 0.3s ease'
            }}>
              <NavbarNotifications 
                userId={user.id} 
                userRole={user.role}
              />
            </div>
          )}
          
          {/* Premium User Profile Card */}
          <div style={{
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
                {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
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
                👤 {user ? user.role : 'ADMIN'}
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
          </div>
        </div>

        {/* Premium User Profile Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          position: 'relative'
        }}>
          {/* User Profile Card */}
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              background: `
                linear-gradient(135deg, 
                  rgba(255,255,255,0.15) 0%, 
                  rgba(255,255,255,0.08) 50%,
                  rgba(0,120,212,0.1) 100%
                )
              `,
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '12px 20px',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: `
                0 8px 32px rgba(0,48,97,0.25),
                inset 0 1px 0 rgba(255,255,255,0.15),
                inset 0 -1px 0 rgba(0,120,212,0.1)
              `,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              animation: 'fadeInUp 1s ease-out 0.8s both'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
              e.currentTarget.style.boxShadow = `
                0 15px 45px rgba(0,48,97,0.35),
                0 8px 32px rgba(0,120,212,0.15),
                inset 0 1px 0 rgba(255,255,255,0.2)
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = `
                0 8px 32px rgba(0,48,97,0.25),
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
                {user ? `${user.firstName} ${user.lastName}` : 'Utilisateur'}
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
                👤 {user ? user.role : 'ADMIN'}
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

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '10px',
              background: `linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)`,
              backdropFilter: 'blur(25px)',
              borderRadius: '16px',
              padding: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: `0 20px 60px rgba(0,48,97,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`,
              minWidth: '200px',
              zIndex: 1000,
              animation: 'fadeInUp 0.3s ease-out'
            }}>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  history.push('/admin/profile');
                }}
                style={{
                  width: '100%',
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
                  gap: '12px',
                  marginBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,120,212,0.2)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <i className="fas fa-user" style={{ fontSize: '16px' }}></i>
                Mon Profil
              </button>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  history.push('/auth/login');
                }}
                style={{
                  width: '100%',
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
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,107,107,0.2)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <i className="fas fa-sign-out-alt" style={{ fontSize: '16px' }}></i>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}