import React from "react";
import { NavLink } from "react-router-dom";
import { getSidebarLinks } from "./sidebarLinks";
import { useSecurity } from "../../contexts/SecurityContext";

export default function Sidebar() {
  const { user, permissions } = useSecurity();
  const [hoveredItem, setHoveredItem] = React.useState(null);
  const [hoveredSection, setHoveredSection] = React.useState(null);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [activeGlow, setActiveGlow] = React.useState(false);
  
  // Générer les liens selon les permissions de l'utilisateur
  const links = getSidebarLinks(user?.role, permissions);
  
  // Debug: Afficher les informations utilisateur et permissions
  React.useEffect(() => {
    console.log('=== SIDEBAR DEBUG ===');
    console.log('User:', user);
    console.log('User Role:', user?.role);
    console.log('Permissions:', permissions);
    console.log('Permissions length:', permissions?.length);
    console.log('Generated links:', links);
    console.log('Links count:', links?.length);
    console.log('==================');
  }, [user, permissions, links]);

  React.useEffect(() => {
    const glowInterval = setInterval(() => {
      setActiveGlow(prev => !prev);
    }, 3000);
    
    return () => clearInterval(glowInterval);
  }, []);

  // Floating particles data
  const particles = Array.from({ length: 4 }, (_, i) => ({
    id: i,
    delay: i * 0.8,
    size: Math.random() * 6 + 4,
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
  }));

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
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,255,255,0.4); }
          50% { box-shadow: 0 0 40px rgba(0,255,255,0.8), 0 0 60px rgba(255,0,255,0.6); }
        }
        
        @keyframes holographicShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Sidebar Container */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: isCollapsed ? '90px' : '320px',
          background: `
            linear-gradient(135deg, 
              rgba(0,26,61,0.98) 0%, 
              rgba(0,48,97,0.95) 15%,
              rgba(0,60,120,0.92) 30%,
              rgba(0,48,97,0.95) 50%,
              rgba(0,60,120,0.92) 70%,
              rgba(0,48,97,0.95) 85%,
              rgba(0,26,61,0.98) 100%
            ),
            radial-gradient(ellipse at 50% 0%, 
              rgba(0,255,255,0.1) 0%, 
              rgba(255,0,255,0.05) 30%, 
              transparent 70%
            )
          `,
          backdropFilter: 'blur(25px) saturate(1.3)',
          borderRight: '2px solid rgba(0,255,255,0.2)',
          boxShadow: `
            0 0 60px rgba(0,48,97,0.4),
            0 0 30px rgba(0,255,255,0.2),
            inset 0 1px 0 rgba(255,255,255,0.15),
            inset 0 -1px 0 rgba(0,255,255,0.1)
          `,
          zIndex: 1000,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: 'slideInLeft 0.8s ease-out',
          overflow: 'hidden',
        }}
      >
        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `
                radial-gradient(circle, 
                  ${particle.id % 3 === 0 ? 'rgba(0,255,255,0.8)' : 
                    particle.id % 3 === 1 ? 'rgba(255,0,255,0.8)' : 'rgba(255,255,255,0.6)'} 0%, 
                  transparent 70%
                )
              `,
              borderRadius: '50%',
              filter: 'blur(1.5px)',
              animation: `float ${3 + particle.delay}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
              pointerEvents: 'none',
              boxShadow: `0 0 ${particle.size * 2}px ${
                particle.id % 3 === 0 ? 'rgba(0,255,255,0.4)' : 
                particle.id % 3 === 1 ? 'rgba(255,0,255,0.4)' : 'rgba(255,255,255,0.3)'
              }`,
            }}
          />
        ))}

        {/* Toggle Button */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '-15px',
            width: '30px',
            height: '30px',
            background: `
              linear-gradient(135deg, 
                rgba(0,48,97,0.9) 0%, 
                rgba(0,120,212,0.8) 100%
              )
            `,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,48,97,0.3)',
            border: '2px solid rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease',
            zIndex: 1001,
            animation: activeGlow ? 'glow 2s ease-in-out infinite' : 'none',
          }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 20px rgba(0,48,97,0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 15px rgba(0,48,97,0.3)';
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: '14px',
              transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
            }}
          >
            ◀
          </span>
        </div>

        {/* Logo Section */}
        <div
          style={{
            padding: '30px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: isCollapsed ? '0' : '15px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
          >
            <div
              style={{
                fontSize: '32px',
                animation: 'glow 3s ease-in-out infinite',
                filter: 'drop-shadow(0 0 15px rgba(0,255,255,0.8))',
                background: `
                  linear-gradient(135deg, 
                    #00ffff 0%, 
                    #ffffff 25%,
                    #ff00ff 50%,
                    #ffffff 75%,
                    #00ffff 100%
                  )
                `,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                backgroundSize: '200% 200%',
                animation: 'holographicShift 3s ease-in-out infinite, pulse 2s ease-in-out infinite',
              }}
            >
              ⚡
            </div>
            {!isCollapsed && (
              <div
                style={{
                  animation: 'fadeInUp 0.6s ease-out 0.3s both',
                }}
              >
                <h1
                  style={{
                    fontSize: '26px',
                    fontWeight: '900',
                    fontFamily: "'Orbitron', 'Inter', sans-serif",
                    margin: 0,
                    background: `
                      linear-gradient(135deg, 
                        #00ffff 0%, 
                        #ffffff 25%,
                        #ff00ff 50%,
                        #ffffff 75%,
                        #00ffff 100%
                      )
                    `,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 0 25px rgba(0,255,255,0.4)',
                    animation: 'shimmer 4s ease-in-out infinite',
                    backgroundSize: '300% 100%',
                    letterSpacing: '1.2px',
                    filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.3))',
                  }}
                >
                  SAGETECH PRO
                </h1>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.9)',
                    margin: '8px 0 0 0',
                    fontWeight: '600',
                    fontFamily: "'Orbitron', 'Inter', sans-serif",
                    letterSpacing: '0.8px',
                    background: 'linear-gradient(90deg, rgba(0,255,255,0.3), rgba(255,0,255,0.3))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  ⚡ MAINTENANCE PLATFORM ⚡
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '20px 0',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,48,97,0.5) transparent',
          }}
        >
          {links.map((section, sectionIndex) => (
            <div
              key={section.title}
              style={{
                marginBottom: '25px',
                animation: `fadeInUp 0.6s ease-out ${0.1 * sectionIndex}s both`,
              }}
            >
              {/* Section Header */}
              {!isCollapsed && (
                <div
                  style={{
                    padding: '0 20px 15px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: '15px',
                  }}
                  onMouseEnter={() => setHoveredSection(section.title)}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <h3
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color: hoveredSection === section.title 
                        ? '#ffffff' 
                        : 'rgba(255,255,255,0.75)',
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '1.2px',
                      transition: 'all 0.3s ease',
                      background: hoveredSection === section.title
                        ? `linear-gradient(90deg, 
                            rgba(0,120,212,0.3) 0%, 
                            rgba(0,48,97,0.2) 100%
                          )`
                        : 'transparent',
                      padding: '10px 15px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    {section.title}
                  </h3>
                </div>
              )}

              {/* Navigation Items */}
              <div style={{ padding: '0 10px' }}>
                {section.items.map((link, linkIndex) => {
                  const itemKey = `${section.title}-${link.label}`;
                  const isHovered = hoveredItem === itemKey;
                  
                  return (
                    <NavLink
                      key={link.label}
                      to={link.to}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isCollapsed ? '0' : '12px',
                        padding: isCollapsed ? '12px' : '12px 15px',
                        margin: '5px 0',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: isHovered ? '#ffffff' : 'rgba(255,255,255,0.8)',
                        background: isHovered
                          ? `linear-gradient(135deg, 
                              rgba(0,120,212,0.3) 0%, 
                              rgba(0,48,97,0.2) 100%
                            )`
                          : 'transparent',
                        border: isHovered 
                          ? '1px solid rgba(0,120,212,0.3)' 
                          : '1px solid transparent',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isHovered ? 'translateX(5px)' : 'translateX(0)',
                        boxShadow: isHovered 
                          ? '0 8px 25px rgba(0,48,97,0.3)' 
                          : 'none',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={() => setHoveredItem(itemKey)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      {/* Hover Effect Overlay */}
                      {isHovered && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `
                              linear-gradient(90deg, 
                                transparent 0%, 
                                rgba(255,255,255,0.1) 50%, 
                                transparent 100%
                              )
                            `,
                            animation: 'shimmer 2s ease-in-out infinite',
                            backgroundSize: '200% 100%',
                            pointerEvents: 'none',
                          }}
                        />
                      )}

                      <i
                        className={link.icon}
                        style={{
                          fontSize: '18px',
                          filter: isHovered 
                            ? 'drop-shadow(0 0 8px rgba(0,120,212,0.6))' 
                            : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      />
                      
                      {!isCollapsed && (
                        <span
                          style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            transition: 'all 0.3s ease',
                            letterSpacing: '0.2px',
                          }}
                        >
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
          <div
            style={{
              padding: '20px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              background: `
                linear-gradient(135deg, 
                  rgba(0,48,97,0.3) 0%, 
                  rgba(0,60,120,0.2) 100%
                )
              `,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.7)',
                animation: 'pulse 3s ease-in-out infinite',
              }}
            >
              <span style={{ fontSize: '14px' }}>🔒</span>
              <span>Connexion Sécurisée</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
