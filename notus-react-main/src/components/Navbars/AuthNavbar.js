/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";

export default function AuthNavbar(props) {
  const [navbarOpen, setNavbarOpen] = React.useState(false);

  return (
    <>
      <nav className="top-0 absolute z-50 w-full flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg">
        <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            <Link
              className="text-white text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap uppercase"
              to="/"
            >
              Sagemcom Maintenance
            </Link>
            <button
              className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
                `;
                e.target.style.background = `
                  linear-gradient(135deg, 
                    rgba(255,255,255,0.9) 0%, 
                    rgba(0,255,255,0.7) 50%,
                    rgba(255,255,255,0.9) 100%
                  )
                `;
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0) scale(1)";
                e.target.style.boxShadow = `
                  0 8px 20px rgba(0,255,255,0.3),
                  0 0 20px rgba(255,0,255,0.2)
                `;
                e.target.style.background = `
                  linear-gradient(135deg, 
                    rgba(0,255,255,0.8) 0%, 
                    rgba(255,0,255,0.6) 50%,
                    rgba(0,255,255,0.8) 100%
                  )
                `;
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
                  animation: "shimmer 2s infinite",
                }}
              />
              <span style={{ fontSize: "20px" }}>⚡</span>
              Démarrer
            </button>
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
