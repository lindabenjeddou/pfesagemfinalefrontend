import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useSecurity } from "../../contexts/SecurityContext";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const history = useHistory();
  const { login } = useSecurity();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError(t('auth.error.required_fields', "Veuillez remplir tous les champs."));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Utiliser la fonction login du SecurityContext
      const result = await login({ email, password });
      
      if (result.success) {
        console.log("Connexion réussie :", result.user);
        
        // Rediriger vers les pages admin
        history.push("/admin");
      } else {
        throw new Error(result.error || "Email ou mot de passe incorrect.");
      }
    } catch (error) {
      console.error("Erreur :", error);
      setError(error.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    // Implement social login logic here
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(2deg);
          }
          66% {
            transform: translateY(5px) rotate(-2deg);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(0, 48, 97, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(0, 48, 97, 0.6), 0 0 30px rgba(0, 48, 97, 0.4);
          }
        }
      `}</style>
      
      {/* Background with floating elements */}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Animated Background Pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(0,120,255,0.1) 0%, transparent 70%)
            `,
            animation: "float 20s ease-in-out infinite",
          }}
        />
        
        {/* Floating decorative elements */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${40 + Math.random() * 80}px`,
              height: `${40 + Math.random() * 80}px`,
              background: `linear-gradient(45deg, rgba(255,255,255,${0.05 + Math.random() * 0.1}), rgba(0,120,255,${0.1 + Math.random() * 0.1}))`,
              borderRadius: "50%",
              animation: `float ${8 + Math.random() * 8}s ease-in-out infinite`,
              filter: "blur(1px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
        ))}

        {/* Login Card Container */}
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            margin: "0 20px",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Main Login Card */}
          <div
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              boxShadow: `
                0 25px 50px rgba(0,0,0,0.25),
                0 12px 24px rgba(0,0,0,0.15),
                inset 0 1px 0 rgba(255,255,255,0.2)
              `,
              borderRadius: 24,
              padding: "40px 32px",
              position: "relative",
              animation: "fadeInUp 1s ease",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {/* Decorative top border */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "60px",
                height: "4px",
                background: "linear-gradient(90deg, #003061, #0078d4)",
                borderRadius: "0 0 4px 4px",
                animation: "glow 2s ease-in-out infinite",
              }}
            />
            
            {/* Header Section */}
            <div
              style={{
                textAlign: "center",
                marginBottom: 32,
                animation: "slideInLeft 1s ease 0.2s both",
              }}
            >
              {/* Logo/Icon */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #003061, #0078d4)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 8px 16px rgba(0,48,97,0.3)",
                  animation: "pulse 2s ease-in-out infinite",
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
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    animation: "shimmer 2s infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: "32px",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  🔐
                </span>
              </div>
              
              {/* Title */}
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #003061, #0078d4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.5px",
                }}
              >
                {t('auth.secure_login', 'Connexion Sécurisée')}
              </h1>
              
              {/* Subtitle */}
              <p
                style={{
                  fontSize: "16px",
                  color: "#6b7280",
                  margin: 0,
                  fontWeight: "500",
                }}
              >
                🏢 Plateforme de Maintenance Sagemcom
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div
                style={{
                  background: "linear-gradient(135deg, #fee2e2, #fecaca)",
                  border: "1px solid #fca5a5",
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  animation: "fadeInUp 0.3s ease",
                  boxShadow: "0 4px 8px rgba(239,68,68,0.1)",
                }}
              >
                <span style={{ fontSize: "18px" }}>⚠️</span>
                <span
                  style={{
                    color: "#dc2626",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {error}
                </span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div
                style={{
                  marginBottom: 24,
                  animation: "slideInLeft 1s ease 0.4s both",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  📧 {t('auth.email', 'Adresse Email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: 12,
                    fontSize: "16px",
                    background: "rgba(255,255,255,0.8)",
                    transition: "all 0.3s ease",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#003061";
                    e.target.style.boxShadow = "0 0 0 3px rgba(0,48,97,0.1)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                    e.target.style.transform = "translateY(0)";
                  }}
                  placeholder="votre.email@sagemcom.com"
                />
              </div>

              {/* Password Field */}
              <div
                style={{
                  marginBottom: 32,
                  animation: "slideInLeft 1s ease 0.6s both",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  🔒 {t('auth.password', 'Mot de passe')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: 12,
                    fontSize: "16px",
                    background: "rgba(255,255,255,0.8)",
                    transition: "all 0.3s ease",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#003061";
                    e.target.style.boxShadow = "0 0 0 3px rgba(0,48,97,0.1)";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                    e.target.style.transform = "translateY(0)";
                  }}
                  placeholder="••••••••"
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: loading 
                    ? "linear-gradient(135deg, #9ca3af, #6b7280)" 
                    : "linear-gradient(135deg, #003061, #0078d4)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: loading 
                    ? "none" 
                    : "0 8px 16px rgba(0,48,97,0.3)",
                  animation: "slideInLeft 1s ease 0.8s both",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 12px 24px rgba(0,48,97,0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 8px 16px rgba(0,48,97,0.3)";
                  }
                }}
              >
                {!loading && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                      animation: "shimmer 2s infinite",
                    }}
                  />
                )}
                {loading ? (
                  <>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                    {t('auth.logging_in', 'Connexion en cours...')}
                  </>
                ) : (
                  <>
                    🚀 {t('auth.login_button', 'Se Connecter')}
                  </>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div
              style={{
                marginTop: 32,
                textAlign: "center",
                animation: "fadeInUp 1s ease 1s both",
              }}
            >
              {/* Register Link */}
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px",
                  background: "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(5,150,105,0.05))",
                  borderRadius: 12,
                  border: "1px solid rgba(16,185,129,0.1)",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: "0 0 8px 0",
                    fontWeight: "500",
                  }}
                >
                  Pas encore de compte ?
                </p>
                <Link
                  to="/auth/register"
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: 8,
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 4px 8px rgba(16,185,129,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  ✨ Créer un compte
                </Link>
              </div>
              
              <div
                style={{
                  padding: "16px",
                  background: "linear-gradient(135deg, rgba(0,48,97,0.05), rgba(0,120,212,0.05))",
                  borderRadius: 12,
                  border: "1px solid rgba(0,48,97,0.1)",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: "0 0 8px 0",
                    fontWeight: "500",
                  }}
                >
                  🔒 {t('auth.secure_ssl', 'Connexion sécurisée SSL')}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#9ca3af",
                    margin: 0,
                  }}
                >
                  © 2024 Sagemcom - Plateforme de Maintenance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
