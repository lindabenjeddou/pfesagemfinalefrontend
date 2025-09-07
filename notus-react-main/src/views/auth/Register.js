import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 48, 97, 0.8)",
        backdropFilter: "blur(10px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        animation: "fadeInUp 0.3s ease",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          padding: "40px",
          borderRadius: "24px",
          width: "400px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
          textAlign: "center",
          animation: "fadeInUp 0.5s ease",
          border: "1px solid rgba(255,255,255,0.2)",
          position: "relative",
        }}
      >
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
          }}
        />
        
        <div
          style={{
            width: "80px",
            height: "80px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 8px 16px rgba(16,185,129,0.3)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          <span style={{ fontSize: "32px", color: "white" }}>✅</span>
        </div>
        {children}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px 24px",
            background: "linear-gradient(135deg, #003061, #0078d4)",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            marginTop: "20px",
          }}
        >
          ✨ Fermer
        </button>
      </div>
    </div>
  );
};

export default function Register() {
  const { t } = useLanguage(); // Hook pour les traductions
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
    phoneNumber: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.role ||
      !formData.phoneNumber ||
      !formData.address
    ) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    const params = new URLSearchParams({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
    }).toString();

    const apiUrl = `http://localhost:8089/PI/user/register/Admin?${params}`;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'inscription.");
      }

      const result = await response.json();
      console.log("Réponse de l'API :", result);

      setIsModalOpen(true);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "",
        phoneNumber: "",
        address: "",
      });
    } catch (error) {
      console.error("Erreur :", error);
      setError("Une erreur s'est produite lors de l'inscription.");
    } finally {
      setLoading(false);
    }
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
      `}</style>
      
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `
            linear-gradient(135deg, #001a3d 0%, #003061 20%, #004080 40%, #0078d4 70%, #00a2ff 100%),
            radial-gradient(ellipse at top left, rgba(0,120,255,0.3) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(0,48,97,0.4) 0%, transparent 50%)
          `,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Dynamic animated mesh background */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.02) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.02) 75%)
            `,
            backgroundSize: "60px 60px",
            backgroundPosition: "0 0, 0 30px, 30px -30px, -30px 0px",
            animation: "float 25s ease-in-out infinite",
            opacity: 0.4,
          }}
        />
        
        {/* Animated gradient orbs */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "15%",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(0,120,255,0.15) 0%, rgba(0,48,97,0.05) 70%, transparent 100%)",
            borderRadius: "50%",
            animation: "float 20s ease-in-out infinite",
            filter: "blur(2px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "10%",
            width: "250px",
            height: "250px",
            background: "radial-gradient(circle, rgba(0,162,255,0.12) 0%, rgba(0,78,212,0.04) 70%, transparent 100%)",
            borderRadius: "50%",
            animation: "float 18s ease-in-out infinite reverse",
            filter: "blur(1.5px)",
          }}
        />
        
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${40 + Math.random() * 60}px`,
              height: `${40 + Math.random() * 60}px`,
              background: `rgba(255,255,255,${0.05 + Math.random() * 0.1})`,
              borderRadius: "50%",
              animation: `float ${8 + Math.random() * 8}s ease-in-out infinite`,
              filter: "blur(1px)",
            }}
          />
        ))}

        <div
          style={{
            width: "100%",
            maxWidth: 650,
            margin: "0 20px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: `
                linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 100%),
                linear-gradient(145deg, rgba(0,48,97,0.02) 0%, rgba(0,120,255,0.04) 100%)
              `,
              backdropFilter: "blur(25px)",
              boxShadow: `
                0 32px 64px rgba(0,48,97,0.25),
                0 16px 32px rgba(0,120,255,0.15),
                inset 0 1px 0 rgba(255,255,255,0.4),
                inset 0 -1px 0 rgba(0,48,97,0.1)
              `,
              borderRadius: 28,
              padding: "48px 40px",
              position: "relative",
              animation: "fadeInUp 1s ease",
              border: "2px solid rgba(255,255,255,0.3)",
              overflow: "hidden",
            }}
          >
            {/* Dynamic corner accents */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100px",
                height: "100px",
                background: "linear-gradient(135deg, rgba(0,120,255,0.1) 0%, transparent 70%)",
                borderRadius: "0 0 100px 0",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: "120px",
                height: "120px",
                background: "linear-gradient(315deg, rgba(0,48,97,0.08) 0%, transparent 70%)",
                borderRadius: "100px 0 0 0",
              }}
            />
            {/* Dynamic top accent bar */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "120px",
                height: "6px",
                background: `
                  linear-gradient(90deg, 
                    transparent 0%, 
                    #003061 20%, 
                    #0078d4 50%, 
                    #00a2ff 80%, 
                    transparent 100%
                  )
                `,
                borderRadius: "0 0 12px 12px",
                boxShadow: "0 4px 12px rgba(0,120,255,0.3)",
                animation: "glow 3s ease-in-out infinite",
              }}
            />
            
            {/* Side accent lines */}
            <div
              style={{
                position: "absolute",
                top: "20px",
                left: 0,
                width: "3px",
                height: "60px",
                background: "linear-gradient(180deg, #0078d4, transparent)",
                borderRadius: "0 3px 3px 0",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: 0,
                width: "3px",
                height: "60px",
                background: "linear-gradient(180deg, #0078d4, transparent)",
                borderRadius: "3px 0 0 3px",
              }}
            />
            


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

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                  marginBottom: 28,
                }}
              >
                <div 
                  style={{ 
                    animation: "slideInLeft 1s ease 0.3s both",
                    position: "relative",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: "15px",
                      fontWeight: "700",
                      background: "linear-gradient(135deg, #003061, #0078d4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      marginBottom: 12,
                      letterSpacing: "0.5px",
                    }}
                  >
                    👤 Prénom
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "16px 20px",
                        border: "2px solid rgba(0,48,97,0.1)",
                        borderRadius: 16,
                        fontSize: "15px",
                        background: `
                          linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)
                        `,
                        backdropFilter: "blur(10px)",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none",
                        boxSizing: "border-box",
                        boxShadow: "0 4px 12px rgba(0,48,97,0.08)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#0078d4";
                        e.target.style.boxShadow = "0 8px 24px rgba(0,120,212,0.2), 0 0 0 4px rgba(0,120,212,0.1)";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.background = "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(0,48,97,0.1)";
                        e.target.style.boxShadow = "0 4px 12px rgba(0,48,97,0.08)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.background = "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)";
                      }}
                      placeholder="Votre prénom"
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "0%",
                        height: "2px",
                        background: "linear-gradient(90deg, #003061, #0078d4)",
                        transition: "width 0.4s ease",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                </div>

                <div 
                  style={{ 
                    animation: "slideInLeft 1s ease 0.4s both",
                    position: "relative",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: "15px",
                      fontWeight: "700",
                      background: "linear-gradient(135deg, #003061, #0078d4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      marginBottom: 12,
                      letterSpacing: "0.5px",
                    }}
                  >
                    👤 Nom
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      style={{
                        width: "100%",
                        padding: "16px 20px",
                        border: "2px solid rgba(0,48,97,0.1)",
                        borderRadius: 16,
                        fontSize: "15px",
                        background: `
                          linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)
                        `,
                        backdropFilter: "blur(10px)",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        outline: "none",
                        boxSizing: "border-box",
                        boxShadow: "0 4px 12px rgba(0,48,97,0.08)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#0078d4";
                        e.target.style.boxShadow = "0 8px 24px rgba(0,120,212,0.2), 0 0 0 4px rgba(0,120,212,0.1)";
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.background = "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(0,48,97,0.1)";
                        e.target.style.boxShadow = "0 4px 12px rgba(0,48,97,0.08)";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.background = "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)";
                      }}
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginBottom: 20,
                  animation: "slideInLeft 1s ease 0.5s both",
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  placeholder="votre.email@sagemcom.com"
                />
              </div>

              <div
                style={{
                  marginBottom: 20,
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
                  🔑 Mot de Passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
                  placeholder="••••••••"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: 20,
                }}
              >
                <div style={{ animation: "slideInLeft 1s ease 0.7s both" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    👔 Rôle
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "2px solid #e5e7eb",
                      borderRadius: 10,
                      fontSize: "14px",
                      background: "rgba(255,255,255,0.8)",
                      transition: "all 0.3s ease",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">Sélectionner un rôle</option>
                    <option value="ADMIN">👑 Admin</option>
                    <option value="MAGASINIER">📦 Magasinier</option>
                    <option value="CHEF_PROJET">👨‍💼 Chef de Projet</option>
                    <option value="TECHNICIEN_CURATIF">🔧 Technicien Curatif</option>
                    <option value="TECHNICIEN_PREVENTIF">⚙️ Technicien Préventif</option>
                    <option value="CHEF_SECTEUR">👨‍💼 Chef de Secteur</option>
                    <option value="SUPERVISEUR_PRODUCTION">🏭 Superviseur Production</option>
                  </select>
                </div>

                <div style={{ animation: "slideInLeft 1s ease 0.8s both" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#374151",
                      marginBottom: 8,
                    }}
                  >
                    📞 Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      border: "2px solid #e5e7eb",
                      borderRadius: 10,
                      fontSize: "14px",
                      background: "rgba(255,255,255,0.8)",
                      transition: "all 0.3s ease",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>

              <div
                style={{
                  marginBottom: 32,
                  animation: "slideInLeft 1s ease 0.9s both",
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
                  🏠 Adresse
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
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
                    resize: "vertical",
                    minHeight: "80px",
                  }}
                  placeholder="Votre adresse complète"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "20px 24px",
                  background: loading 
                    ? "linear-gradient(135deg, rgba(156,163,175,0.8), rgba(107,114,128,0.8))" 
                    : `
                        linear-gradient(135deg, #001a3d 0%, #003061 25%, #0078d4 75%, #00a2ff 100%),
                        linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%)
                      `,
                  color: "white",
                  border: loading ? "2px solid rgba(156,163,175,0.3)" : "2px solid rgba(255,255,255,0.2)",
                  borderRadius: 20,
                  fontSize: "17px",
                  fontWeight: "700",
                  letterSpacing: "0.5px",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  boxShadow: loading 
                    ? "0 4px 12px rgba(156,163,175,0.2)" 
                    : `
                        0 12px 32px rgba(0,48,97,0.4),
                        0 6px 16px rgba(0,120,212,0.3),
                        inset 0 1px 0 rgba(255,255,255,0.2)
                      `,
                  animation: "slideInLeft 1s ease 1s both",
                  position: "relative",
                  overflow: "hidden",
                  backdropFilter: "blur(10px)",
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
                    Inscription en cours...
                  </>
                ) : (
                  "🚀 Créer mon compte"
                )}
              </button>
            </form>

            <div
              style={{
                marginTop: 32,
                textAlign: "center",
                animation: "fadeInUp 1s ease 1.2s both",
              }}
            >
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px",
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
                  Déjà un compte ?
                </p>
                <Link
                  to="/auth/login"
                  style={{
                    display: "inline-block",
                    padding: "8px 16px",
                    background: "linear-gradient(135deg, #003061, #0078d4)",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: 8,
                    fontSize: "14px",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                  }}
                >
                  🔑 Se Connecter
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
                  🔒 Inscription sécurisée SSL
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#003061",
            margin: "0 0 16px 0",
          }}
        >
          🎉 Inscription Réussie !
        </h2>
        <p
          style={{
            fontSize: "16px",
            color: "#6b7280",
            margin: "0 0 8px 0",
            lineHeight: "1.5",
          }}
        >
          Votre compte a été créé avec succès.
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "#9ca3af",
            margin: 0,
            lineHeight: "1.5",
          }}
        >
          Vous pouvez maintenant vous connecter à la plateforme Sagemcom.
        </p>
      </Modal>
    </>
  );
}
