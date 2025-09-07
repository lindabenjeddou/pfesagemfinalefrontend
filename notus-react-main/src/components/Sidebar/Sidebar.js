import React from "react";
import { NavLink } from "react-router-dom";
import { getSidebarLinks } from "./sidebarLinks";
import { useSecurity } from "../../contexts/SecurityContext";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Sidebar() {
  const { user, permissions } = useSecurity();
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [hoveredItem, setHoveredItem] = React.useState(null);
  
  // Générer les liens selon les permissions de l'utilisateur
  const links = getSidebarLinks(user?.role, permissions, t);

  return (
    <>
      <style jsx global>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
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
        
        /* Custom Scrollbar Styles */
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        
        .sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(0,48,97,0.2);
          border-radius: 3px;
        }
        
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #0078d4 0%, #003061 100%);
          border-radius: 3px;
          transition: all 0.3s ease;
        }
        
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #40a9ff 0%, #0078d4 100%);
          box-shadow: 0 0 8px rgba(0,120,212,0.4);
        }
      `}</style>

      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: isCollapsed ? '80px' : '280px',
        height: '100vh',
        background: `
          linear-gradient(135deg, 
            rgba(0,48,97,0.98) 0%, 
            rgba(0,60,120,0.95) 30%,
            rgba(0,48,97,0.98) 100%
          )
        `,
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 0 40px rgba(0,48,97,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        zIndex: 1000,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: 'slideInLeft 0.8s ease-out',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Section */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'linear-gradient(135deg, rgba(0,120,212,0.1) 0%, rgba(0,48,97,0.1) 100%)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isCollapsed ? '0' : '16px',
            justifyContent: isCollapsed ? 'center' : 'flex-start'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #0078d4 0%, #003061 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,120,212,0.3)',
              animation: 'pulse 3s ease-in-out infinite',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <span style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation: 'shimmer 3s infinite'
              }}></span>
              <i className="fas fa-building" style={{
                fontSize: '24px',
                color: 'white',
                filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
              }}></i>
            </div>
            
            {!isCollapsed && (
              <div style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}>
                <h1 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: 0,
                  color: 'white',
                  fontFamily: '"Inter", sans-serif',
                  letterSpacing: '0.5px'
                }}>
                  {t('sidebar.title')}
                </h1>
                <p style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.7)',
                  margin: '4px 0 0 0',
                  fontWeight: '400'
                }}>
                  {t('sidebar.subtitle')}
                </p>
              </div>
            )}
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              position: 'absolute',
              top: '32px',
              right: '-12px',
              width: '24px',
              height: '24px',
              background: 'linear-gradient(135deg, #0078d4 0%, #003061 100%)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,120,212,0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 6px 16px rgba(0,120,212,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,120,212,0.3)';
            }}
          >
            <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>

        {/* Navigation Content */}
        <div 
          className="sidebar-scroll"
          style={{
            flex: 1,
            height: 'calc(100vh - 200px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '20px 0',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,120,212,0.5) transparent'
          }}>
          {links.map((section, sectionIndex) => (
            <div
              key={section.title}
              style={{
                marginBottom: '24px',
                animation: `fadeInUp 0.6s ease-out ${0.1 * sectionIndex}s both`
              }}
            >
              {/* Section Header */}
              {!isCollapsed && (
                <div style={{
                  padding: '0 20px 12px 20px',
                  marginBottom: '12px'
                }}>
                  <h3 style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'rgba(255,255,255,0.6)',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: '"Inter", sans-serif'
                  }}>
                    {section.title}
                  </h3>
                </div>
              )}

              {/* Navigation Items */}
              <div style={{ padding: '0 12px' }}>
                {section.items.map((link) => {
                  const itemKey = `${section.title}-${link.label}`;
                  const isHovered = hoveredItem === itemKey;
                  const isActive = window.location.href.indexOf(link.to) !== -1;
                  
                  return (
                    <NavLink
                      key={link.label}
                      to={link.to}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isCollapsed ? '0' : '14px',
                        padding: isCollapsed ? '14px' : '14px 16px',
                        margin: '4px 0',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: isActive ? '#ffffff' : (isHovered ? '#ffffff' : 'rgba(255,255,255,0.8)'),
                        background: isActive 
                          ? 'linear-gradient(135deg, rgba(0,120,212,0.4) 0%, rgba(0,48,97,0.3) 100%)'
                          : (isHovered 
                            ? 'linear-gradient(135deg, rgba(0,120,212,0.2) 0%, rgba(0,48,97,0.1) 100%)'
                            : 'transparent'),
                        border: isActive 
                          ? '1px solid rgba(0,120,212,0.4)' 
                          : '1px solid transparent',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                        boxShadow: isActive 
                          ? '0 8px 24px rgba(0,120,212,0.2)' 
                          : (isHovered ? '0 4px 12px rgba(0,120,212,0.1)' : 'none'),
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={() => setHoveredItem(itemKey)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      {/* Shimmer Effect */}
                      {(isHovered || isActive) && (
                        <span style={{
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                          animation: 'shimmer 2s ease-in-out infinite',
                          backgroundSize: '200% 100%'
                        }}></span>
                      )}

                      <i
                        className={link.icon}
                        style={{
                          fontSize: '18px',
                          filter: (isActive || isHovered) 
                            ? 'drop-shadow(0 0 8px rgba(0,120,212,0.6))' 
                            : 'none',
                          transition: 'all 0.3s ease'
                        }}
                      />
                      
                      {!isCollapsed && (
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          fontFamily: '"Inter", sans-serif',
                          transition: 'all 0.3s ease',
                          letterSpacing: '0.2px'
                        }}>
                          {link.label}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div style={{
            padding: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            background: 'linear-gradient(135deg, rgba(0,120,212,0.1) 0%, rgba(0,48,97,0.1) 100%)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.7)',
              animation: 'glow 3s ease-in-out infinite'
            }}>
              <i className="fas fa-shield-alt" style={{ fontSize: '16px', color: '#0078d4' }}></i>
              <span style={{ fontWeight: '600' }}>{t('sidebar.secure_connection')}</span>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
