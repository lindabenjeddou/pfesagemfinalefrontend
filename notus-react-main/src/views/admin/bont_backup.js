import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

// Énumération pour le statut du bon de travail
const StatutBT = {
  EN_ATTENTE: "EN_ATTENTE",
  EN_COURS: "EN_COURS",
  TERMINE: "TERMINE",
  ANNULE: "ANNULE"
};

// Mapping des icônes pour les statuts
const StatusIcons = {
  EN_ATTENTE: "⏳",
  EN_COURS: "🔄",
  TERMINE: "✅",
  ANNULE: "❌"
};

// Mapping des couleurs pour les statuts
const StatusColors = {
  EN_ATTENTE: { bg: "rgba(251, 191, 36, 0.1)", border: "#f59e0b", text: "#92400e" },
  EN_COURS: { bg: "rgba(59, 130, 246, 0.1)", border: "#3b82f6", text: "#1e40af" },
  TERMINE: { bg: "rgba(34, 197, 94, 0.1)", border: "#22c55e", text: "#15803d" },
  ANNULE: { bg: "rgba(239, 68, 68, 0.1)", border: "#ef4444", text: "#dc2626" }
};

export default function Bont() {
  const { t } = useLanguage(); // Hook pour les traductions
  const [bonTravail, setBonTravail] = useState({
    id: "",
    description: "",
    dateCreation: new Date().toISOString().split("T")[0],
    dateDebut: "",
    dateFin: "",
    statut: StatutBT.EN_ATTENTE,
    technicienId: "",
    composants: []
  });

  const [techniciens, setTechniciens] = useState([]);
  const [composantsDisponibles, setComposantsDisponibles] = useState([]);
  const [composantsFiltres, setComposantsFiltres] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Charger la liste des techniciens
    fetch("http://localhost:8089/PI/PI/user/all")
      .then(response => response.json())
      .then(data => {
        const techniciensList = data.filter(user => 
          user.role === "TECHNICIEN_CURATIF" || user.role === "TECHNICIEN_PREVENTIF"
        );
        setTechniciens(techniciensList);
      })
      .catch(error => console.error("Erreur lors du chargement des techniciens:", error));

    // Charger la liste des composants
    fetch("http://localhost:8089/PI/PI/component/all")
      .then(response => response.json())
      .then(data => {
        setComposantsDisponibles(data);
        setComposantsFiltres(data);
      })
      .catch(error => console.error("Erreur lors du chargement des composants:", error));
  }, []);

  // Fonction pour générer un nouveau bon de travail
  const genererBT = async () => {
    if (!bonTravail.description || !bonTravail.technicienId || bonTravail.composants.length === 0) {
      setMessage("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8089/PI/pi/bons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          description: bonTravail.description,
          dateCreation: bonTravail.dateCreation,
          dateDebut: bonTravail.dateDebut,
          dateFin: bonTravail.dateFin,
          statut: bonTravail.statut,
          technicien: parseInt(bonTravail.technicienId),
          composants: bonTravail.composants
        })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création du bon de travail");
      }

      await response.json();
            setMessage("Bon de travail créé avec succès!");
      setBonTravail({
        id: "",
        description: "",
        dateCreation: new Date().toISOString().split("T")[0],
        dateDebut: "",
        dateFin: "",
        statut: StatutBT.EN_ATTENTE,
        technicienId: "",
        composants: []
      });
    } catch (error) {
      console.error("Erreur:", error);
      setMessage("Une erreur s'est produite lors de la création du bon de travail");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour clôturer un bon de travail
  const cloturerBT = () => {
    setBonTravail({
      ...bonTravail,
      statut: StatutBT.TERMINE
    });
  };

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "composants") {
      // Gestion de la sélection multiple des composants
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setBonTravail({
        ...bonTravail,
        composants: selectedOptions
      });
    } else {
      setBonTravail({
        ...bonTravail,
        [name]: value
      });
    }
  };

  return (
    <>
      {/* Animations CSS globales */}
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
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      {/* Container principal avec design moderne ultra-premium */}
      <div style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
        padding: '2rem',
        overflow: 'hidden'
      }}>
        {/* Éléments décoratifs flottants améliorés */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${60 + Math.random() * 100}px`,
              height: `${60 + Math.random() * 100}px`,
              background: `linear-gradient(45deg, rgba(0,48,97,${0.05 + Math.random() * 0.1}), rgba(0,120,212,${0.08 + Math.random() * 0.1}))`,
              borderRadius: '50%',
              animation: `float ${6 + Math.random() * 6}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              filter: 'blur(1px)',
              border: '1px solid rgba(0,48,97,0.1)'
            }}
          />
        ))}

        {/* Container du formulaire premium */}
        <div style={{
          position: 'relative',
          maxWidth: '1400px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: `
            0 32px 64px rgba(0, 0, 0, 0.12),
            0 16px 32px rgba(0, 0, 0, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.3)
          `,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.8s ease-out',
          zIndex: 1
        }}>
          {/* Header moderne premium avec icône et animations */}
          <div style={{
            background: 'linear-gradient(135deg, #003061 0%, #0078d4 50%, #00a2ff 100%)',
            padding: '3rem 2rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Effet de brillance en arrière-plan */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite'
            }} />
            
            <div style={{
              textAlign: 'center',
              position: 'relative',
              zIndex: 2
            }}>
              {/* Icône animée */}
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                animation: 'pulse 2s ease-in-out infinite',
                filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',
                backdropFilter: 'blur(10px)'
              }}>📋</div>
              
              {/* Titre */}
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '0.5rem',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                animation: 'slideInLeft 0.8s ease-out 0.2s both'
              }}>{t('work_orders.create_title', 'Création de Bon de Travail')}</h1>
              
              {/* Sous-titre */}
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '300',
                animation: 'slideInLeft 0.8s ease-out 0.4s both'
              }}>🏢 {t('work_orders.create_subtitle', 'Gestion et Création des Bons de Travail Sagemcom')}</p>
            </div>
          </div>

          {/* Section principale du formulaire */}
          <div style={{
            padding: '3rem 2rem'
          }}>
            {/* Message de statut */}
            {message && (
              <div style={{
                marginBottom: '2rem',
                padding: '1rem 1.5rem',
                background: message.includes('succès') 
                  ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                  : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                border: `1px solid ${message.includes('succès') ? '#10b981' : '#ef4444'}`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                animation: 'bounceIn 0.5s ease-out',
                boxShadow: `0 4px 12px ${message.includes('succès') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                <span style={{ fontSize: '1.25rem' }}>
                  {message.includes('succès') ? '✅' : '⚠️'}
                </span>
                <span style={{
                  color: message.includes('succès') ? '#065f46' : '#dc2626',
                  fontWeight: '500',
                  fontSize: '0.95rem'
                }}>{message}</span>
              </div>
            )}

            {/* Grille du formulaire */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              {/* Section informations de base */}
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid rgba(0, 48, 97, 0.1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                animation: 'slideInLeft 0.8s ease-out 0.6s both'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#003061',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📝 {t('work_orders.basic_info', 'Informations de Base')}
                </h3>

                {/* Description */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#003061',
                    marginBottom: '0.5rem'
                  }}>📄 {t('work_orders.description', 'Description')}</label>
                  <textarea
                    name="description"
                    value={bonTravail.description}
                    onChange={handleChange}
                    placeholder={t('work_orders.description_placeholder', 'Décrivez les travaux à effectuer...')}
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid rgba(0, 48, 97, 0.2)',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      resize: 'vertical',
                      minHeight: '100px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0078d4';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 120, 212, 0.1)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0, 48, 97, 0.2)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>

                {/* Dates */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#003061',
                      marginBottom: '0.5rem'
                    }}>📅 {t('work_orders.start_date', 'Date de Début')}</label>
                    <input
                      type="date"
                      name="dateDebut"
                      value={bonTravail.dateDebut}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid rgba(0, 48, 97, 0.2)',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0078d4';
                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 120, 212, 0.1)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 48, 97, 0.2)';
                        e.target.style.boxShadow = 'none';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#003061',
                      marginBottom: '0.5rem'
                    }}>📅 {t('work_orders.end_date', 'Date de Fin')}</label>
                    <input
                      type="date"
                      name="dateFin"
                      value={bonTravail.dateFin}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid rgba(0, 48, 97, 0.2)',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0078d4';
                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 120, 212, 0.1)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 48, 97, 0.2)';
                        e.target.style.boxShadow = 'none';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Section assignation et statut */}
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid rgba(0, 48, 97, 0.1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                animation: 'slideInRight 0.8s ease-out 0.8s both'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#003061',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  👨‍🔧 {t('work_orders.assignment', 'Assignation et Statut')}
                </h3>

                {/* Technicien */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#003061',
                    marginBottom: '0.5rem'
                  }}>🔧 {t('work_orders.technician', 'Technicien')}</label>
                  <select
                    name="technicienId"
                    value={bonTravail.technicienId}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid rgba(0, 48, 97, 0.2)',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0078d4';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 120, 212, 0.1)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0, 48, 97, 0.2)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <option value="">{t('work_orders.select_technician', 'Sélectionner un technicien')}</option>
                    {techniciens.map(tech => (
                      <option key={tech.id} value={tech.id}>
                        {tech.firstName} {tech.lastName} - {tech.role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Statut */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#003061',
                    marginBottom: '0.5rem'
                  }}>📊 {t('work_orders.status', 'Statut')}</label>
                  <select
                    name="statut"
                    value={bonTravail.statut}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid rgba(0, 48, 97, 0.2)',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0078d4';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 120, 212, 0.1)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(0, 48, 97, 0.2)';
                      e.target.style.boxShadow = 'none';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {Object.entries(StatutBT).map(([key, value]) => (
                      <option key={key} value={value}>
                        {StatusIcons[value]} {t(`work_orders.status_${value.toLowerCase()}`, value.replace('_', ' '))}
                      </option>
                    ))}
                  </select>
                  
                  {/* Badge de statut visuel */}
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem 1rem',
                    background: StatusColors[bonTravail.statut]?.bg || 'rgba(156, 163, 175, 0.1)',
                    border: `1px solid ${StatusColors[bonTravail.statut]?.border || '#9ca3af'}`,
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: StatusColors[bonTravail.statut]?.text || '#6b7280'
                  }}>
                    <span>{StatusIcons[bonTravail.statut]}</span>
                    {t(`work_orders.status_${bonTravail.statut.toLowerCase()}`, bonTravail.statut.replace('_', ' '))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section des composants */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid rgba(0, 48, 97, 0.1)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              animation: 'fadeInUp 0.8s ease-out 1s both',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#003061',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🔧 {t('work_orders.components', 'Composants Requis')}
              </h3>

              {/* Recherche de composants */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#003061',
                  marginBottom: '0.5rem'
                }}>🔍 {t('work_orders.search_components', 'Rechercher des composants')}</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    const filtered = composantsDisponibles.filter(comp =>
                      comp.nom.toLowerCase().includes(e.target.value.toLowerCase()) ||
                      comp.description.toLowerCase().includes(e.target.value.toLowerCase())
                    );
                    setComposantsFiltres(filtered);
                  }}
                  placeholder={t('work_orders.search_placeholder', 'Rechercher par nom ou description...')}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid rgba(0, 48, 97, 0.2)',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0078d4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 120, 212, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 48, 97, 0.2)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>

              {/* Sélection multiple des composants */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#003061',
                  marginBottom: '0.5rem'
                }}>📦 {t('work_orders.select_components', 'Sélectionner les composants')}</label>
                <select
                  name="composants"
                  multiple
                  value={bonTravail.composants}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    minHeight: '120px',
                    padding: '0.75rem 1rem',
                    border: '2px solid rgba(0, 48, 97, 0.2)',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0078d4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 120, 212, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 48, 97, 0.2)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {composantsFiltres.map(composant => (
                    <option key={composant.id} value={composant.id}>
                      {composant.nom} - {composant.description}
                    </option>
                  ))}
                </select>
                
                {/* Instructions */}
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, #e0f2fe, #b3e5fc)',
                  border: '1px solid #0288d1',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#01579b'
                }}>
                  💡 {t('work_orders.components_instruction', 'Maintenez Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs composants')}
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              animation: 'fadeInUp 0.8s ease-out 1.2s both'
            }}>
              {/* Bouton Générer BT */}
              <button
                onClick={genererBT}
                disabled={loading}
                style={{
                  padding: '1rem 2rem',
                  background: loading 
                    ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                    : 'linear-gradient(135deg, #003061, #0078d4)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: loading 
                    ? 'none'
                    : '0 8px 16px rgba(0, 48, 97, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 12px 24px rgba(0, 48, 97, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 16px rgba(0, 48, 97, 0.3)';
                  }
                }}
              >
                {!loading && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'shimmer 2s infinite'
                  }} />
                )}
                {loading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    {t('work_orders.generating', 'Génération en cours...')}
                  </>
                ) : (
                  <>
                    🚀 {t('work_orders.generate_bt', 'Générer le Bon de Travail')}
                  </>
                )}
              </button>

              {/* Bouton Clôturer BT */}
              <button
                onClick={cloturerBT}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 24px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 16px rgba(245, 158, 11, 0.3)';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  animation: 'shimmer 2s infinite'
                }} />
                🏁 {t('work_orders.close_bt', 'Clôturer le Bon de Travail')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 48, 97, 0.05)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                  {/* Indicateur de focus animé */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    width: '0',
                    height: '2px',
                    background: '#003061',
                    transition: 'all 0.3s ease',
                    transform: 'translateX(-50%)'
                  }}></div>
                </div>
              </div>

              {/* Champ Date Création */}
              <div style={{
                position: 'relative',
                animation: 'fadeInUp 0.8s ease-out 0.2s both'
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  fontWeight: '700',
                  color: '#003061',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📅 Date Création
                </label>
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '1rem'
                }}>
                  <input
                    type="date"
                    name="dateCreation"
                    value={bonTravail.dateCreation}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      background: 'linear-gradient(145deg, #f9fafb, #f3f4f6)',
                      transition: 'all 0.3s ease',
                      fontFamily: 'inherit',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 48, 97, 0.05)',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>
              </div>

              {/* Champ Date Début */}
              <div style={{
                position: 'relative',
                animation: 'fadeInUp 0.8s ease-out 0.3s both'
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  fontWeight: '700',
                  color: '#003061',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🚀 Date Début
                </label>
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '1rem'
                }}>
                  <input
                    type="date"
                    name="dateDebut"
                    value={bonTravail.dateDebut}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                      transition: 'all 0.3s ease',
                      fontFamily: 'inherit',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 48, 97, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#003061';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 48, 97, 0.1), 0 8px 15px -3px rgba(0, 0, 0, 0.1)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 48, 97, 0.05)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>
              </div>

              {/* Champ Date Fin */}
              <div style={{
                position: 'relative',
                animation: 'fadeInUp 0.8s ease-out 0.4s both'
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  fontWeight: '700',
                  color: '#003061',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🏁 Date Fin
                </label>
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '1rem'
                }}>
                  <input
                    type="date"
                    name="dateFin"
                    value={bonTravail.dateFin}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                      transition: 'all 0.3s ease',
                      fontFamily: 'inherit',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 48, 97, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#003061';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 48, 97, 0.1), 0 8px 15px -3px rgba(0, 0, 0, 0.1)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 48, 97, 0.05)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>
              </div>

              {/* Champ Statut */}
              <div style={{
                position: 'relative',
                animation: 'fadeInUp 0.8s ease-out 0.5s both'
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  fontWeight: '700',
                  color: '#003061',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📊 Statut
                </label>
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '1rem'
                }}>
                  <select
                    name="statut"
                    value={bonTravail.statut}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                      transition: 'all 0.3s ease',
                      fontFamily: 'inherit',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 48, 97, 0.05)',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#003061';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 48, 97, 0.1), 0 8px 15px -3px rgba(0, 0, 0, 0.1)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 48, 97, 0.05)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {Object.values(StatutBT).map((statut) => (
                      <option key={statut} value={statut}>
                        {statut.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Champ Technicien */}
              <div style={{
                position: 'relative',
                animation: 'fadeInUp 0.8s ease-out 0.6s both'
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  fontWeight: '700',
                  color: '#003061',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  👨‍🔧 Technicien
                </label>
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '1rem'
                }}>
                  <select
                    name="technicienId"
                    value={bonTravail.technicienId}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                      transition: 'all 0.3s ease',
                      fontFamily: 'inherit',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 48, 97, 0.05)',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#003061';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 48, 97, 0.1), 0 8px 15px -3px rgba(0, 0, 0, 0.1)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 48, 97, 0.05)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <option value="" style={{ color: '#9ca3af' }}>-- Choisir un technicien --</option>
                    <optgroup label="👨‍🔧 Techniciens Curatifs" style={{ fontWeight: '600', color: '#003061' }}>
                      {techniciens
                        .filter(tech => tech.role === "TECHNICIEN_CURATIF")
                        .map((tech) => (
                          <option key={tech.id} value={tech.id} style={{ padding: '0.5rem' }}>
                            {tech.firstName} {tech.lastName}
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="🛠️ Techniciens Préventifs" style={{ fontWeight: '600', color: '#003061' }}>
                      {techniciens
                        .filter(tech => tech.role === "TECHNICIEN_PREVENTIF")
                        .map((tech) => (
                          <option key={tech.id} value={tech.id} style={{ padding: '0.5rem' }}>
                            {tech.firstName} {tech.lastName}
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Champ Composants */}
              <div style={{
                gridColumn: '1 / -1',
                position: 'relative',
                animation: 'fadeInUp 0.8s ease-out 0.7s both'
              }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.75rem',
                  fontWeight: '700',
                  color: '#003061',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🔧 Composants
                </label>
                
                {/* Champ de recherche */}
                <div style={{
                  marginBottom: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '1rem'
                }}>
                  <input
                    type="text"
                    placeholder="🔍 Rechercher un composant..."
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase();
                      setSearchTerm(value);
                      const filteredComps = composantsDisponibles.filter(comp =>
                        (comp.name || comp.trartArticle || `Composant ${comp.id}`)
                          .toLowerCase()
                          .includes(value)
                      );
                      setComposantsFiltres(filteredComps);
                    }}
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                      transition: 'all 0.3s ease',
                      fontFamily: 'inherit',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 48, 97, 0.05)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#003061';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 48, 97, 0.1), 0 8px 15px -3px rgba(0, 0, 0, 0.1)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 48, 97, 0.05)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  />
                </div>
                
                {/* Sélecteur multiple de composants */}
                <div style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '1rem'
                }}>
                  <select
                    name="composants"
                    multiple
                    value={bonTravail.composants}
                    onChange={handleChange}
                    size="6"
                    style={{
                      width: '100%',
                      padding: '1rem 1.25rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '1rem',
                      fontSize: '0.875rem',
                      color: '#374151',
                      background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                      transition: 'all 0.3s ease',
                      fontFamily: 'inherit',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 48, 97, 0.05)',
                      minHeight: '150px'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#003061';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0, 48, 97, 0.1), 0 8px 15px -3px rgba(0, 0, 0, 0.1)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 48, 97, 0.05)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {composantsFiltres.map((comp) => (
                      <option 
                        key={comp.id} 
                        value={comp.id}
                        style={{
                          padding: '0.75rem',
                          margin: '0.25rem 0',
                          borderRadius: '0.5rem',
                          background: (comp.id && bonTravail.composants.includes(comp.id.toString())) 
                            ? 'rgba(0, 48, 97, 0.1)' 
                            : 'transparent'
                        }}
                      >
                        {comp.name || comp.trartArticle || `Composant ${comp.id}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Indication d'utilisation */}
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                  border: '1px solid rgba(0, 48, 97, 0.1)',
                  borderRadius: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#003061',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600'
                }}>
                  📝 Maintenez Ctrl (ou Cmd sur Mac) pour sélectionner plusieurs composants
                </div>
              </div>
            </div>

            {/* Section des boutons d'action */}
            <div style={{
              marginTop: '3rem',
              padding: '2rem',
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              borderRadius: '1.5rem',
              border: '1px solid rgba(0, 48, 97, 0.1)',
              animation: 'fadeInUp 0.8s ease-out 0.8s both'
            }}>
              <div style={{
                display: 'flex',
                gap: '1.5rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                {/* Bouton Générer BT */}
                <button
                  type="button"
                  onClick={genererBT}
                  disabled={loading}
                  style={{
                    background: loading 
                      ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                      : '#003061',
                    color: 'white',
                    border: 'none',
                    borderRadius: '1rem',
                    padding: '1rem 2rem',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: loading 
                      ? '0 4px 12px rgba(156, 163, 175, 0.3)' 
                      : '0 8px 20px rgba(0, 48, 97, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    minWidth: '180px',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-3px) scale(1.05)';
                      e.target.style.boxShadow = '0 12px 25px rgba(0, 48, 97, 0.4)';
                      e.target.style.backgroundColor = '#002244';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 8px 20px rgba(0, 48, 97, 0.3)';
                      e.target.style.backgroundColor = '#003061';
                    }
                  }}
                  onMouseDown={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-1px) scale(0.98)';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-3px) scale(1.05)';
                    }
                  }}
                >
                  {loading && (
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  )}
                  <span>📝</span>
                  {loading ? "Création en cours..." : "Générer BT"}
                </button>

                {/* Bouton Clôturer BT */}
                <button
                  type="button"
                  onClick={cloturerBT}
                  disabled={loading}
                  style={{
                    background: loading 
                      ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                      : 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '1rem',
                    padding: '1rem 2rem',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: loading 
                      ? '0 4px 12px rgba(156, 163, 175, 0.3)' 
                      : '0 8px 20px rgba(245, 158, 11, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    minWidth: '180px',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-3px) scale(1.05)';
                      e.target.style.boxShadow = '0 12px 25px rgba(245, 158, 11, 0.4)';
                      e.target.style.background = 'linear-gradient(135deg, #d97706, #b45309)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.3)';
                      e.target.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                    }
                  }}
                  onMouseDown={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-1px) scale(0.98)';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-3px) scale(1.05)';
                    }
                  }}
                >
                  <span>🏁</span>
                  Clôturer BT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animation CSS pour le spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}