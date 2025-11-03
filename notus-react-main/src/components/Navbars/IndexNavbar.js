/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSecurity } from "../../contexts/SecurityContext";
// components

import IndexDropdown from "components/Dropdowns/IndexDropdown.js";

export default function Navbar(props) {
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const { t, currentLanguage, changeLanguage, getAvailableLanguages } = useLanguage();
  const { user, isAuthenticated, logout } = useSecurity();

  // Récupérer les données utilisateur avec fallback immédiat
  React.useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        console.log('🔍 IndexNavbar - Utilisateur du SecurityContext:', user);
        const token = localStorage.getItem('token');
        console.log('🔍 IndexNavbar - Token:', token ? 'Présent' : 'Absent');
        
        // Données de fallback par défaut améliorées (exactement comme Profile.js)
        const defaultFallbackData = {
          firstName: user?.firstName || 'Prénom',
          lastName: user?.lastName || 'Nom',
          email: user?.email || 'email@exemple.com',
          role: user?.role || 'UTILISATEUR',
          phoneNumber: user?.phoneNumber || '+216 XX XXX XXX',
          adress: user?.adress || 'Adresse'
        };
        
        // Définir les données de fallback immédiatement pour éviter l'affichage vide
        setCurrentUser(defaultFallbackData);
        
        const response = await fetch('http://localhost:8089/PI/user/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('🔍 IndexNavbar - Réponse API status:', response.status);
        
        if (response.ok) {
          const users = await response.json();
          console.log('🔍 IndexNavbar - Tous les utilisateurs récupérés:', users);
          console.log('🔍 IndexNavbar - Recherche utilisateur avec ID:', user?.userId);
          
          const currentUser = users.find(u => u.id === user?.userId);
          console.log('🔍 IndexNavbar - Utilisateur trouvé:', currentUser);
          
          if (currentUser) {
            console.log('✅ IndexNavbar - Utilisation des données API');
            setCurrentUser(currentUser);
          } else {
            console.log('⚠️ IndexNavbar - Utilisateur non trouvé, conservation des données de fallback');
          }
        } else {
          console.error('❌ IndexNavbar - Erreur API:', response.status, response.statusText);
          console.log('⚠️ IndexNavbar - Conservation des données de fallback par défaut');
        }
      } catch (error) {
        console.error('❌ IndexNavbar - Erreur fetch:', error);
        console.log('⚠️ IndexNavbar - Conservation des données de fallback par défaut');
      }
    };

    fetchUserDetails();
  }, [user, isAuthenticated]);

  React.useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,120,212,0.3); }
          50% { box-shadow: 0 0 30px rgba(0,120,212,0.5); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      
      <nav 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: scrolled 
            ? `linear-gradient(135deg, rgba(0,26,61,0.95) 0%, rgba(0,48,97,0.92) 50%, rgba(0,120,212,0.95) 100%)`
            : "rgba(0,48,97,0.1)",
          backdropFilter: scrolled ? "blur(20px)" : "blur(5px)",
          borderBottom: scrolled 
            ? "1px solid rgba(255,255,255,0.1)" 
            : "1px solid rgba(255,255,255,0.05)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: "slideInDown 1s ease",
          boxShadow: scrolled 
            ? "0 8px 32px rgba(0,48,97,0.3), 0 4px 16px rgba(0,120,212,0.2)"
            : "0 4px 16px rgba(0,48,97,0.1)",
        }}>
        <div 
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "96px",
            position: "relative",
          }}
        >
          {/* Floating Particles */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '30px',
            width: '8px',
            height: '8px',
            background: 'linear-gradient(135deg, #40a9ff 0%, #0078d4 100%)',
            borderRadius: '50%',
            opacity: 0.7,
            animation: 'float 4s ease-in-out infinite',
            filter: 'blur(0.5px)',
            boxShadow: '0 0 15px rgba(64,169,255,0.4)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '65px',
            left: '80px',
            width: '6px',
            height: '6px',
            background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
            borderRadius: '50%',
            opacity: 0.6,
            animation: 'float 4s ease-in-out infinite 1.5s',
            filter: 'blur(0.3px)',
            boxShadow: '0 0 12px rgba(82,196,26,0.4)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '35px',
            right: '120px',
            width: '7px',
            height: '7px',
            background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
            borderRadius: '50%',
            opacity: 0.5,
            animation: 'float 4s ease-in-out infinite 3s',
            filter: 'blur(0.4px)',
            boxShadow: '0 0 14px rgba(255,77,79,0.4)'
          }}></div>

          {/* Logo Section */}
          <div 
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              animation: "fadeIn 1s ease 0.2s both",
              position: "relative",
              zIndex: 2
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                background: "linear-gradient(135deg, #003061, #0078d4)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 32px rgba(0,48,97,0.4)",
                animation: "pulse 3s ease-in-out infinite",
                position: "relative",
                overflow: "hidden",
                border: "2px solid rgba(255,255,255,0.1)"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  animation: "shimmer 3s infinite",
                }}
              />
              <span style={{
                fontSize: "32px",
                fontWeight: "800",
                color: "white",
                filter: "drop-shadow(0 0 12px rgba(255,255,255,0.5))",
                animation: "glow 3s ease-in-out infinite"
              }}>
                🏢
              </span>
            </div>
            
            <Link
              to="/"
              style={{
                fontSize: "28px",
                fontWeight: "800",
                background: "linear-gradient(135deg, #ffffff, #e0f2ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textDecoration: "none",
                letterSpacing: "0.5px",
                textShadow: "0 0 30px rgba(255,255,255,0.1)"
              }}
            >
              Sagemcom Maintenance
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            animation: 'fadeIn 1s ease-out 0.4s both',
            position: "relative",
            zIndex: 2
          }} className="hidden lg:flex">

            {/* Language Selector */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "linear-gradient(135deg, rgba(0,120,212,0.3) 0%, rgba(0,48,97,0.2) 100%)";
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 16px rgba(0,120,212,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                <span style={{ fontSize: "16px" }}>
                  {currentLanguage === 'fr' ? '🇫🇷' : currentLanguage === 'en' ? '🇺🇸' : '🇸🇦'}
                </span>
                <span>{currentLanguage === 'fr' ? 'FR' : currentLanguage === 'en' ? 'EN' : 'AR'}</span>
                <i className={`fas fa-chevron-${languageDropdownOpen ? 'up' : 'down'}`} style={{ fontSize: "10px" }}></i>
              </button>

              {/* Language Dropdown */}
              {languageDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: "0",
                    marginTop: "8px",
                    minWidth: "160px",
                    background: `linear-gradient(135deg, 
                      rgba(0,48,97,0.95) 0%, 
                      rgba(0,60,120,0.92) 50%, 
                      rgba(0,120,212,0.95) 100%),
                      linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 100%)`,
                    backdropFilter: "blur(25px)",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 20px 40px rgba(0,48,97,0.4)",
                    padding: "8px",
                    zIndex: 1000,
                    animation: "fadeIn 0.2s ease-out",
                  }}
                >
                  {getAvailableLanguages().map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setLanguageDropdownOpen(false);
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        background: currentLanguage === lang.code 
                          ? "linear-gradient(135deg, rgba(0,120,212,0.3) 0%, rgba(0,48,97,0.2) 100%)"
                          : "transparent",
                        border: "none",
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        if (currentLanguage !== lang.code) {
                          e.target.style.background = "rgba(255,255,255,0.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentLanguage !== lang.code) {
                          e.target.style.background = "transparent";
                        }
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>{lang.flag}</span>
                      <span>{lang.name}</span>
                      {currentLanguage === lang.code && (
                        <i className="fas fa-check" style={{ marginLeft: "auto", fontSize: "12px", color: "#40a9ff" }}></i>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons only (no user dropdown on homepage) */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link
                to="/auth/login"
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  textDecoration: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(0,120,212,0.3) 0%, rgba(0,48,97,0.2) 100%)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 24px rgba(0,120,212,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <i className="fas fa-sign-in-alt"></i>
                {t('auth.login')}
              </Link>
              
              <Link
                to="/auth/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, #0078d4 0%, #003061 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: '700',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 32px rgba(0,120,212,0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1.05)';
                  e.target.style.boxShadow = '0 16px 40px rgba(0,120,212,0.4)';
                  e.target.style.background = 'linear-gradient(135deg, #003061 0%, #0078d4 100%)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 32px rgba(0,120,212,0.3)';
                  e.target.style.background = 'linear-gradient(135deg, #0078d4 0%, #003061 100%)';
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shimmer 2.5s infinite'
                }}></span>
                <i className="fas fa-user-plus"></i>
                {t('auth.register')}
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            style={{
              display: "none",
              width: "48px",
              height: "48px",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255,255,255,0.2)",
              borderRadius: "12px",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="flex lg:hidden"
            onClick={() => setNavbarOpen(!navbarOpen)}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.1)";
              e.target.style.transform = "scale(1)";
            }}
          >
            <span style={{ fontSize: "24px" }}>☰</span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          style={{
            display: navbarOpen ? "block" : "none",
            background: `
              linear-gradient(135deg, rgba(0,26,61,0.98) 0%, rgba(0,48,97,0.95) 50%, rgba(0,120,212,0.98) 100%),
              linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 100%)
            `,
            backdropFilter: "blur(25px)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "24px",
            boxShadow: "0 8px 32px rgba(0,48,97,0.4)",
          }}
          className="lg:hidden"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Language Selector Mobile */}
            <div style={{ 
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              marginBottom: "16px"
            }}>
              <div style={{ 
                color: "rgba(255,255,255,0.7)", 
                fontSize: "12px", 
                fontWeight: "600", 
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}>
                {t('language.select')}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {getAvailableLanguages().map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      changeLanguage(lang.code);
                      setNavbarOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: currentLanguage === lang.code 
                        ? "linear-gradient(135deg, rgba(0,120,212,0.3) 0%, rgba(0,48,97,0.2) 100%)"
                        : "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>{lang.flag}</span>
                    <span>{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <i className="fas fa-check" style={{ fontSize: "10px", color: "#40a9ff" }}></i>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Link
              to="/auth/login"
              style={{
                padding: "16px 20px",
                color: "rgba(255,255,255,0.9)",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.3s ease",
                textAlign: "center",
              }}
              onClick={() => setNavbarOpen(false)}
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              {t('auth.login')}
            </Link>
            
            <Link
              to="/auth/register"
              style={{
                padding: "16px 20px",
                color: "#ffffff",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0078d4 0%, #003061 100%)",
                border: "none",
                transition: "all 0.3s ease",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
              onClick={() => setNavbarOpen(false)}
            >
              <span style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: 'shimmer 2s infinite'
              }}></span>
              <i className="fas fa-user-plus mr-2"></i>
              {t('auth.register')}
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
