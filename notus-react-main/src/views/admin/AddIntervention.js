import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

function AddIntervention() {
  const { t } = useLanguage();
  const [type, setType] = useState("CURATIVE");
  const [description, setDescription] = useState("");
  const [dateDemande] = useState(new Date().toISOString().split("T")[0]);
  const [statut, setStatut] = useState("EN_ATTENTE");
  const [priorite, setPriorite] = useState("MOYENNE");
  const [demandeurId, setDemandeurId] = useState("");
  const [demandeurs, setDemandeurs] = useState([]);
  const [panne, setPanne] = useState("");
  const [urgence, setUrgence] = useState(false);
  const [frequence, setFrequence] = useState("");
  const [prochainRDV, setProchainRDV] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8089/PI/user/all")
      .then((response) => response.json())
      .then((data) => {
        setDemandeurs(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur :", error);
        setLoading(false);
        setMessage("Erreur lors du chargement des utilisateurs.");
      });
  }, []);

  const validateForm = () => {
    if (!demandeurId) {
      setMessage(t('intervention.error.select_requester', "⚠️ Veuillez sélectionner un demandeur."));
      return false;
    }
    if (!description) {
      setMessage(t('intervention.error.enter_description', "⚠️ Veuillez entrer une description."));
      return false;
    }
    if (type === "CURATIVE" && !panne) {
      setMessage(t('intervention.error.enter_failure', "⚠️ Veuillez entrer une panne pour l'intervention curative."));
      return false;
    }
    if (type === "PREVENTIVE" && (!frequence || !prochainRDV)) {
      setMessage("⚠️ Veuillez entrer la fréquence et le prochain RDV pour l'intervention préventive.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage("");

    const baseData = {
      description,
      dateDemande,
      statut,
      priorite,
      demandeurId: Number(demandeurId),
    };

    const intervention =
      type === "CURATIVE"
        ? { ...baseData, panne, urgence, type_demande: "CURATIVE" }
        : { ...baseData, frequence, prochainRDV, type_demande: "PREVENTIVE" };

    try {
      const response = await fetch(`http://localhost:8089/PI/PI/demandes/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(intervention),
      });

      if (!response.ok) throw new Error("Erreur serveur");

      setShowSuccess(true);
      setMessage("✅ Intervention créée avec succès !");
      resetForm();
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (err) {
      console.error("Erreur lors de la création de l'intervention :", err);
      setMessage("❌ Une erreur s'est produite lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDescription("");
    setStatut("EN_ATTENTE");
    setPanne("");
    setUrgence(false);
    setFrequence("");
    setProchainRDV("");
    setDemandeurId("");
    setPriorite("MOYENNE");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '3rem',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.12)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <h2 style={{
            fontSize: '1.5rem',
            color: '#1f2937',
            margin: 0
          }}>Chargement des données...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(2deg); }
          66% { transform: translateY(5px) rotate(-2deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        padding: '2rem',
        overflow: 'hidden'
      }}>
        {/* Éléments décoratifs flottants */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${60 + Math.random() * 80}px`,
              height: `${60 + Math.random() * 80}px`,
              background: `linear-gradient(45deg, rgba(255,255,255,${0.05 + Math.random() * 0.1}), rgba(255,255,255,${0.08 + Math.random() * 0.1}))`,
              borderRadius: '50%',
              animation: `float ${6 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              filter: 'blur(1px)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          />
        ))}

        {/* Container principal */}
        <div style={{
          position: 'relative',
          maxWidth: '1000px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          boxShadow: '0 32px 64px rgba(0, 0, 0, 0.12), 0 16px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.8s ease-out',
          zIndex: 1
        }}>
          {/* Header avec gradient animé */}
          <div style={{
            background: 'linear-gradient(135deg, #003061 0%, #0078d4 50%, #00a2ff 100%)',
            padding: '3rem 2rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
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
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                animation: 'pulse 2s ease-in-out infinite',
                filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))'
              }}>📋</div>
              
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '0.5rem',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                animation: 'slideInLeft 0.8s ease-out 0.2s both'
              }}>{t('intervention.add_title', 'Nouvelle Intervention')}</h1>
              
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '300',
                animation: 'slideInLeft 0.8s ease-out 0.4s both'
              }}>✨ {t('intervention.add_subtitle', 'Créez une nouvelle demande d\'intervention Sagemcom')}</p>
            </div>
          </div>

          {/* Contenu du formulaire */}
          <div style={{ padding: '3rem 2rem' }}>
            {/* Messages de notification */}
            {message && (
              <div style={{
                marginBottom: '2rem',
                padding: '1rem 1.5rem',
                borderRadius: '16px',
                background: message.includes('✅') 
                  ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                  : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                border: `1px solid ${message.includes('✅') ? '#10b981' : '#ef4444'}`,
                color: message.includes('✅') ? '#065f46' : '#dc2626',
                fontSize: '0.875rem',
                fontWeight: '500',
                animation: 'slideDown 0.3s ease-out',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.2rem' }}>
                  {message.includes('✅') ? '✅' : '⚠️'}
                </span>
                {message}
              </div>
            )}

            {/* Animation de succès */}
            {showSuccess && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                animation: 'fadeInUp 0.3s ease-out'
              }}>
                <div style={{
                  background: 'white',
                  borderRadius: '24px',
                  padding: '3rem',
                  textAlign: 'center',
                  animation: 'bounceIn 0.6s ease-out',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
                }}>
                  <div style={{
                    fontSize: '4rem',
                    marginBottom: '1rem',
                    animation: 'pulse 1s ease-in-out infinite'
                  }}>🎉</div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#10b981',
                    marginBottom: '0.5rem'
                  }}>Intervention Créée !</h2>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '1rem'
                  }}>Votre demande a été enregistrée avec succès</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Section Type d'Intervention */}
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#003061',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🔧 {t('intervention.type_title', 'Type d\'Intervention')}
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  {['CURATIVE', 'PREVENTIVE'].map((typeOption) => (
                    <div
                      key={typeOption}
                      onClick={() => setType(typeOption)}
                      style={{
                        padding: '2rem',
                        borderRadius: '16px',
                        border: `2px solid ${type === typeOption ? '#3b82f6' : '#e5e7eb'}`,
                        background: type === typeOption 
                          ? 'linear-gradient(135deg, #dbeafe, #bfdbfe)' 
                          : 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'center',
                        transform: type === typeOption ? 'translateY(-2px)' : 'translateY(0)',
                        boxShadow: type === typeOption ? '0 8px 25px rgba(59, 130, 246, 0.15)' : '0 2px 10px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <div style={{
                        fontSize: '2.5rem',
                        marginBottom: '1rem'
                      }}>
                        {typeOption === 'CURATIVE' ? '🔧' : '⚙️'}
                      </div>
                      <h4 style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: type === typeOption ? '#1e40af' : '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        {typeOption === 'CURATIVE' ? t('intervention.type_curative', 'Curative') : t('intervention.type_preventive', 'Préventive')}
                      </h4>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: 0
                      }}>
                        {typeOption === 'CURATIVE' 
                          ? t('intervention.type_curative_desc', 'Réparation suite à une panne') 
                          : t('intervention.type_preventive_desc', 'Maintenance programmée')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Informations Générales */}
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#003061',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📋 {t('intervention.general_info', 'Informations Générales')}
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '2rem',
                  marginBottom: '2rem'
                }}>
                  {/* Demandeur */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.75rem'
                    }}>
                      👤 {t('intervention.requester', 'Demandeur')} *
                    </label>
                    <select
                      value={demandeurId}
                      onChange={(e) => setDemandeurId(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: 'white',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <option value="">{t('intervention.select_requester', 'Sélectionner un demandeur')}</option>
                      {demandeurs.map((demandeur) => (
                        <option key={demandeur.id} value={demandeur.id}>
                          {demandeur.firstName} {demandeur.lastName} - {demandeur.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priorité */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.75rem'
                    }}>
                      🚨 {t('interventions.priority_field', 'Priorité')}
                    </label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem'
                    }}>
                      {[
                        { value: 'BASSE', label: t('interventions.priority_low', 'Basse'), color: '#10b981', emoji: '🟢' },
                        { value: 'MOYENNE', label: t('interventions.priority_normal', 'Moyenne'), color: '#f59e0b', emoji: '🟡' },
                        { value: 'HAUTE', label: t('interventions.priority_high', 'Haute'), color: '#ef4444', emoji: '🔴' }
                      ].map((priorityOption) => (
                        <div
                          key={priorityOption.value}
                          onClick={() => setPriorite(priorityOption.value)}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: `2px solid ${priorite === priorityOption.value ? priorityOption.color : '#e5e7eb'}`,
                            background: priorite === priorityOption.value 
                              ? `${priorityOption.color}20` 
                              : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                            {priorityOption.emoji}
                          </div>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: priorite === priorityOption.value ? priorityOption.color : '#374151'
                          }}>
                            {priorityOption.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.75rem'
                  }}>
                    📄 {t('interventions.description_field', 'Description')} *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t('interventions.description_placeholder', "Décrivez en détail l'intervention nécessaire...")}
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      background: 'white',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              {/* Section Détails Spécifiques */}
              <div style={{ marginBottom: '3rem' }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#003061',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {type === 'CURATIVE' ? `⚠️ ${t('intervention.failure_details', 'Détails de la Panne')}` : `🔄 ${t('intervention.maintenance_details', 'Détails de la Maintenance')}`}
                </h3>

                {type === "CURATIVE" ? (
                  <>
                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.75rem'
                      }}>
                        ⚠️ {t('intervention.failure', 'Description de la Panne')} *
                      </label>
                      <textarea
                        value={panne}
                        onChange={(e) => setPanne(e.target.value)}
                        placeholder={t('intervention.failure.placeholder', 'Décrivez la panne observée...')}
                        required
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          background: 'white',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                      borderRadius: '12px',
                      border: '1px solid #f59e0b'
                    }}>
                      <input
                        type="checkbox"
                        id="urgence"
                        checked={urgence}
                        onChange={(e) => setUrgence(e.target.checked)}
                        style={{
                          width: '20px',
                          height: '20px',
                          accentColor: '#f59e0b'
                        }}
                      />
                      <label htmlFor="urgence" style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#92400e',
                        cursor: 'pointer'
                      }}>
                        🚨 {t('intervention.urgent', 'Intervention urgente')}
                      </label>
                    </div>
                  </>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem'
                  }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.75rem'
                      }}>
                        🔄 {t('intervention.frequency', 'Fréquence')} *
                      </label>
                      <select
                        value={frequence}
                        onChange={(e) => setFrequence(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          background: 'white',
                          outline: 'none',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <option value="">{t('intervention.frequency.select', 'Sélectionner')}</option>
                        <option value="Hebdomadaire">{t('intervention.frequency.weekly', 'Hebdomadaire')}</option>
                        <option value="Mensuelle">{t('intervention.frequency.monthly', 'Mensuelle')}</option>
                        <option value="Trimestrielle">{t('intervention.frequency.quarterly', 'Trimestrielle')}</option>
                        <option value="Semestrielle">{t('intervention.frequency.biannual', 'Semestrielle')}</option>
                        <option value="Annuelle">{t('intervention.frequency.annual', 'Annuelle')}</option>
                      </select>
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.75rem'
                      }}>
                        📅 {t('intervention.next_appointment', 'Prochain RDV')} *
                      </label>
                      <input
                        type="date"
                        value={prochainRDV}
                        onChange={(e) => setProchainRDV(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          background: 'white',
                          outline: 'none',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton de soumission */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '2rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '1rem 3rem',
                    background: isSubmitting 
                      ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                      : 'linear-gradient(135deg, #003061, #0078d4)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 8px 25px rgba(0, 48, 97, 0.25)',
                    transform: isSubmitting ? 'none' : 'translateY(0)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 12px 35px rgba(0, 48, 97, 0.35)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0, 48, 97, 0.25)';
                    }
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      {t('intervention.creating', 'Création en cours...')}
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '1.2rem' }}>📋</span>
                      {t('intervention.create_button', 'Créer l\'Intervention')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddIntervention;
