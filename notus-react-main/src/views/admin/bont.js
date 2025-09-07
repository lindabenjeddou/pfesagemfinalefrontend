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
  const { t } = useLanguage();
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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Charger les techniciens
    fetch("http://localhost:8089/PI/user/all")
      .then(response => response.json())
      .then(data => {
        const techniciensList = data.filter(user => 
          user.role === "TECHNICIEN_CURATIF" || user.role === "TECHNICIEN_PREVENTIF"
        );
        setTechniciens(techniciensList);
      })
      .catch(error => console.error("Erreur lors du chargement des techniciens:", error));

    // Charger les composants
    fetch("http://localhost:8089/PI/PI/component/all")
      .then(response => response.json())
      .then(data => {
        setComposantsDisponibles(data);
      })
      .catch(error => console.error("Erreur lors du chargement des composants:", error));
  }, []);

  // Fonction pour générer un nouveau bon de travail
  const genererBT = async () => {
    if (!bonTravail.description || !bonTravail.technicienId || bonTravail.composants.length === 0) {
      setMessage(t('workorder.form.required', "Veuillez remplir tous les champs obligatoires"));
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '24px',
        boxShadow: '0 32px 64px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #003061 0%, #0078d4 50%, #00a2ff 100%)',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>📋</div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.5rem'
          }}>{t('workorder.title', 'Création de Bon de Travail')}</h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>🏢 {t('workorder.subtitle', 'Gestion et Création des Bons de Travail Sagemcom')}</p>
        </div>

        {/* Contenu principal */}
        <div style={{ padding: '3rem 2rem' }}>
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
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>
                {message.includes('succès') ? '✅' : '⚠️'}
              </span>
              <span style={{
                color: message.includes('succès') ? '#065f46' : '#dc2626',
                fontWeight: '500'
              }}>{message}</span>
            </div>
          )}

          {/* Formulaire */}
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
              border: '1px solid rgba(0, 48, 97, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#003061',
                marginBottom: '1.5rem'
              }}>📝 Informations de Base</h3>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#003061',
                  marginBottom: '0.5rem'
                }}>📄 {t('workorder.description', 'Description')}</label>
                <textarea
                  name="description"
                  value={bonTravail.description}
                  onChange={handleChange}
                  placeholder={t('workorder.description.placeholder', 'Décrivez les travaux à effectuer...')}
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: '2px solid rgba(0, 48, 97, 0.2)',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Dates */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#003061',
                    marginBottom: '0.5rem'
                  }}>📅 {t('workorder.start_date', 'Date de Début')}</label>
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
                      outline: 'none',
                      boxSizing: 'border-box'
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
                  }}>📅 {t('workorder.end_date', 'Date de Fin')}</label>
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
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section assignation */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              borderRadius: '16px',
              padding: '2rem',
              border: '1px solid rgba(0, 48, 97, 0.1)'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#003061',
                marginBottom: '1.5rem'
              }}>👨‍🔧 Assignation et Statut</h3>

              {/* Technicien */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#003061',
                  marginBottom: '0.5rem'
                }}>🔧 {t('workorder.technician', 'Technicien')}</label>
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
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Sélectionner un technicien</option>
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
                }}>📊 {t('workorder.status', 'Statut')}</label>
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
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {Object.entries(StatutBT).map(([key, value]) => (
                    <option key={key} value={value}>
                      {StatusIcons[value]} {value.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section composants */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
            borderRadius: '16px',
            padding: '2rem',
            border: '1px solid rgba(0, 48, 97, 0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#003061',
              marginBottom: '1.5rem'
            }}>🔧 Composants Nécessaires</h3>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#003061',
                marginBottom: '0.5rem'
              }}>⚙️ {t('workorder.select_components', 'Sélectionner les composants')}</label>
              <select
                name="composants"
                multiple
                value={bonTravail.composants}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '0.75rem 1rem',
                  border: '2px solid rgba(0, 48, 97, 0.2)',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  background: 'rgba(255, 255, 255, 0.9)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {composantsDisponibles.map(comp => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name || comp.trartArticle || `Composant ${comp.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Boutons d'action */}
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              onClick={genererBT}
              disabled={loading}
              style={{
                padding: '1rem 2rem',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #003061, #0078d4)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? '⏳ Création...' : '✅ Générer le Bon de Travail'}
            </button>

            <button
              type="button"
              onClick={cloturerBT}
              disabled={loading}
              style={{
                padding: '1rem 2rem',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🏁 Clôturer le Bon de Travail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
