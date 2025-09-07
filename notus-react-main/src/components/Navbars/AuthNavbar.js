/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";

// Import Sagemcom logo
import sagemcomLogo from "assets/img/sagem.png";

export default function AuthNavbar(props) {
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(0, 120, 255, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(0, 120, 255, 0.6), 0 0 30px rgba(0, 120, 255, 0.4);
          }
        }
      `}</style>
      
      <nav 
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: isScrolled 
            ? `
                linear-gradient(135deg, rgba(0,26,61,0.95) 0%, rgba(0,48,97,0.92) 50%, rgba(0,120,212,0.95) 100%),
                linear-gradient(45deg, rgba(255,255,255,0.05) 0%, transparent 100%)
              `
            : "rgba(0,48,97,0.1)",
          backdropFilter: isScrolled ? "blur(20px)" : "blur(5px)",
          borderBottom: isScrolled 
            ? "1px solid rgba(255,255,255,0.1)" 
            : "1px solid rgba(255,255,255,0.05)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: "slideInDown 1s ease",
          boxShadow: isScrolled 
            ? "0 8px 32px rgba(0,48,97,0.3), 0 4px 16px rgba(0,120,212,0.2)"
            : "0 4px 16px rgba(0,48,97,0.1)",
        }}
      >
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
          {/* Logo Section */}
          <div 
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              animation: "fadeIn 1s ease 0.2s both",
              marginLeft: "-20px",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                background: "linear-gradient(135deg, #003061, #0078d4)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 16px rgba(0,48,97,0.3)",
                animation: "pulse 3s ease-in-out infinite",
                position: "relative",
                overflow: "hidden",
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
              <img 
                src={sagemcomLogo}
                alt="Sagemcom Logo"
                style={{
                  width: "48px",
                  height: "48px",
                  objectFit: "contain",
                  filter: "brightness(0) invert(1)",
                }}
              />
            </div>
            
            <Link
              to="/"
              style={{
                fontSize: "30px",
                fontWeight: "800",
                background: "linear-gradient(135deg, #ffffff, #e0f2ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textDecoration: "none",
                marginLeft: "16px",
                letterSpacing: "0.5px"
              }}
            >
              Sagemcom Maintenance
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-grow items-center justify-center" style={{
            animation: 'fadeIn 1s ease-out 0.4s both'
          }}>
            <ul className="flex items-center space-x-8">
              <li>
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
                  Connexion
                </Link>
              </li>
              <li>
                <Link
                  to="/auth/register"
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
                  <i className="fas fa-user-plus"></i>
                  Inscription
                </Link>
              </li>
            </ul>
          </div>

          {/* CTA Button */}
          <div style={{
            animation: 'fadeIn 1s ease-out 0.6s both'
          }}>
            <Link
              to="/auth/login"
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
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: 'shimmer 2s infinite'
              }}></span>
              <i className="fas fa-rocket"></i>
              Commencer
            </Link>
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
              🔑 Connexion
            </Link>
            
            <Link
              to="/auth/register"
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
              📝 Inscription
            </Link>
            
            <button
              style={{
                padding: "16px 20px",
                background: "linear-gradient(135deg, #ffffff, #e0f2ff)",
                color: "#003061",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
                textAlign: "center",
              }}
            >
              🚀 Commencer
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
