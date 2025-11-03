import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSecurity } from "../../contexts/SecurityContext";
import AdvancedPagination from "../../components/Pagination/AdvancedPagination";

export default function Interventions() {
  const { t } = useLanguage();
  const { user } = useSecurity();
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    description: "",
    titre: "",
    priorite: "NORMALE",
    demandeurId: null,
    demandeurNom: '',
    demandeurEmail: ''
  });
  const [userDetails, setUserDetails] = useState(null);

  // Fonction pour récupérer les vraies données utilisateur depuis l'API
  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Données de fallback par défaut
      const defaultFallbackData = {
        firstName: user?.firstName || 'Prénom',
        lastName: user?.lastName || 'Nom',
        email: user?.email || 'email@exemple.com',
        role: user?.role || 'UTILISATEUR',
        phoneNumber: user?.phoneNumber || '+216 XX XXX XXX',
        adress: user?.adress || 'Adresse'
      };
      
      // Définir les données de fallback immédiatement
      setUserDetails(defaultFallbackData);
      setFormData(prev => ({
        ...prev,
        demandeurId: user?.userId || user?.id,
        demandeurNom: `${defaultFallbackData.firstName} ${defaultFallbackData.lastName}`.trim(),
        demandeurEmail: defaultFallbackData.email
      }));
      
      const response = await fetch('http://localhost:8089/PI/user/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const users = await response.json();
        const currentUser = users.find(u => u.id === user?.userId);
        
        if (currentUser) {
          setUserDetails(currentUser);
          setFormData(prev => ({
            ...prev,
            demandeurId: currentUser.id,
            demandeurNom: `${currentUser.firstName || currentUser.firstname || ''} ${currentUser.lastName || currentUser.lastname || ''}`.trim(),
            demandeurEmail: currentUser.email || ''
          }));
        }
      }
    } catch (error) {
      console.error('Erreur fetch:', error);
    }
  };

  // Mettre à jour les données du demandeur quand l'utilisateur change
  useEffect(() => {
    fetchUserDetails();
  }, [user]);

  useEffect(() => {
    fetchInterventions();
  }, []);

  const fetchInterventions = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('sagemcom_token') || localStorage.getItem('token');
      const response = await fetch("http://localhost:8089/PI/demandes/recuperer/all", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(t('intervention.error.loading', "Erreur lors du chargement des interventions"));
      }
      const data = await response.json();
      setInterventions(data);
    } catch (error) {
      console.error("Erreur:", error);
      setError("Impossible de charger les interventions");
    } finally {
      setLoading(false);
    }
  };

  const createIntervention = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:8089/PI/PI/demandes/create", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'intervention");
      }
      
      const createdIntervention = await response.json();
      
      // Envoyer notification au chef de secteur
      try {
        await fetch(`http://localhost:8089/PI/PI/notifications/nouvelle-intervention?interventionId=${createdIntervention.id}&interventionDescription=${encodeURIComponent(formData.titre || formData.description)}`, {
          method: "POST",
        });
        console.log("✅ Notification envoyée au chef de secteur");
      } catch (notifError) {
        console.warn("⚠️ Erreur notification chef secteur (non bloquant):", notifError);
      }
      
      // Reset form and close modal
      setFormData({ 
        description: "", 
        titre: "", 
        priorite: "NORMALE",
        demandeurId: user?.id || null,
        demandeurNom: user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() : '',
        demandeurEmail: user?.email || ''
      });
      setShowCreateForm(false);
      
      // Refresh interventions list
      await fetchInterventions();
      
    } catch (error) {
      console.error("Erreur création:", error);
      setCreateError("Une erreur s'est produite lors de la création.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Configuration pour la pagination avancée
  const searchFields = ['description', 'titre'];
  const sortFields = [
    { key: 'dateDemande', label: 'Date de demande' },
    { key: 'description', label: 'Description' },
    { key: 'titre', label: 'Titre' },
    { key: 'priorite', label: 'Priorité' },
    { key: 'statut', label: 'Statut' }
  ];
  const filterFields = [
    {
      key: 'statut',
      label: 'Statut',
      type: 'select',
      options: [
        { value: 'EN_ATTENTE', label: 'En Attente' },
        { value: 'EN_COURS', label: 'En Cours' },
        { value: 'TERMINEE', label: 'Terminée' },
        { value: 'REFUSEE', label: 'Refusée' },
        { value: 'VALIDEE', label: 'Validée' },
        { value: 'PLANIFIEE', label: 'Planifiée' }
      ]
    },
    {
      key: 'typeDemande',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'CURATIVE', label: 'Curative' },
        { value: 'PREVENTIVE', label: 'Préventive' }
      ]
    },
    {
      key: 'priorite',
      label: 'Priorité',
      type: 'select',
      options: [
        { value: 'NORMALE', label: 'Normale' },
        { value: 'HAUTE', label: 'Haute' },
        { value: 'URGENTE', label: 'Urgente' }
      ]
    }
  ];


  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
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
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>⚙️</div>
          <h2 style={{
            fontSize: '1.5rem',
            color: '#003061',
            marginBottom: '1rem'
          }}>{t('interventions.loading', 'Chargement des interventions...')}</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
          borderRadius: '24px',
          padding: '3rem',
          border: '1px solid #ef4444',
          maxWidth: '500px'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem'
          }}>⚠️</div>
          <h2 style={{
            fontSize: '1.5rem',
            color: '#dc2626',
            marginBottom: '1rem'
          }}>{t('interventions.error', 'Erreur')}</h2>
          <p style={{
            color: '#dc2626',
            marginBottom: '2rem'
          }}>{error}</p>
          <button
            onClick={fetchInterventions}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #003061, #0078d4)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔄 {t('interventions.retry', 'Réessayer')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(1deg); }
          66% { transform: translateY(4px) rotate(-1deg); }
        }
      `}</style>

      {/* Background avec éléments décoratifs flottants */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(248,250,252,1) 100%)',
        zIndex: -2
      }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${20 + i * 10}px`,
              height: `${20 + i * 10}px`,
              background: `linear-gradient(45deg, ${i % 2 === 0 ? '#00d4ff, #0078d4' : '#ff006e, #8338ec'})`,
              borderRadius: '50%',
              top: `${10 + i * 15}%`,
              left: `${5 + i * 15}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
              filter: 'blur(1px)',
              opacity: 0.6
            }}
          />
        ))}
      </div>

      <div style={{
        minHeight: '100vh',
        padding: '2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          animation: 'fadeInUp 0.6s ease-out'
        }}>

        <div style={{ padding: '2rem', position: 'relative', zIndex: 2 }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,48,97,0.95) 0%, rgba(0,120,212,0.9) 50%, rgba(0,48,97,0.95) 100%)',
            borderRadius: '24px',
            padding: '2.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 20px 40px rgba(0,48,97,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            animation: 'slideInLeft 0.8s ease-out',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,255,255,0.15) 0%, transparent 50%)`,
              zIndex: -1
            }} />
            
            <div style={{ animation: 'fadeInUp 1s ease-out 0.2s both', textAlign: 'center' }}>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: '800',
                color: '#ffffff',
                margin: 0,
                marginBottom: '0.75rem',
                fontFamily: 'Inter, sans-serif',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}>
                🔧 {t('interventions.title', 'Gestion des Interventions')}
              </h1>
              <p style={{
                fontSize: '1.25rem',
                color: 'rgba(255,255,255,0.95)',
                margin: 0,
                fontWeight: '500',
                textShadow: '0 1px 5px rgba(0,0,0,0.2)'
              }}>
                {t('interventions.subtitle', 'Suivi et Gestion des Demandes d\'Intervention Sagemcom')}
              </p>
            </div>
          </div>

          {/* Bouton Créer Intervention */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ➕ {t('interventions.create', 'Créer une Intervention')}
            </button>
          </div>

          {/* Statistiques avec design moderne */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {[
              {
                title: 'Total Interventions',
                value: interventions.length,
                icon: '📊',
                color: '#0078d4',
                bgGradient: 'linear-gradient(135deg, rgba(0,120,212,0.1) 0%, rgba(0,48,97,0.05) 100%)',
                badge: 'Toutes les interventions'
              },
              {
                title: 'En Attente',
                value: interventions.filter(i => i.statut === 'EN_ATTENTE').length,
                icon: '⏳',
                color: '#f59e0b',
                bgGradient: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.05) 100%)',
                badge: 'À traiter'
              },
              {
                title: 'En Cours',
                value: interventions.filter(i => i.statut === 'EN_COURS').length,
                icon: '🔄',
                color: '#10b981',
                bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)',
                badge: 'En traitement'
              },
              {
                title: 'Refusées',
                value: interventions.filter(i => i.statut === 'REFUSEE').length,
                icon: '❌',
                color: '#ef4444',
                bgGradient: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(220,38,38,0.05) 100%)',
                badge: 'Non acceptées'
              }
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 100%)`,
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '2rem',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: `0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 25px 60px rgba(0,48,97,0.25), inset 0 1px 0 rgba(255,255,255,0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = `0 15px 40px rgba(0,48,97,0.15), inset 0 1px 0 rgba(255,255,255,0.2)`;
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: stat.bgGradient,
                  zIndex: -1
                }} />
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#374151',
                      margin: '0 0 0.75rem 0',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {stat.title}
                    </p>
                    <p style={{
                      fontSize: '2.5rem',
                      fontWeight: '800',
                      color: '#003061',
                      margin: '0 0 0.5rem 0',
                      textShadow: '0 2px 4px rgba(0,48,97,0.2)',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {stat.value}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {stat.badge}
                    </p>
                  </div>
                  <div style={{
                    fontSize: '3rem',
                    opacity: 0.8,
                    animation: 'pulse 2s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
                  }}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Liste des interventions avec pagination avancée */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '1.5rem'
            }}>📋 Liste des interventions ({interventions.length})</h3>

            <AdvancedPagination
              data={interventions}
              itemsPerPageOptions={[5, 10, 20, 50]}
              defaultItemsPerPage={10}
              searchFields={searchFields}
              sortFields={sortFields}
              filterFields={filterFields}
              renderItem={(intervention, index) => (
                <div key={intervention.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '0.5rem'
                      }}>
                        <h4 style={{
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#374151',
                          margin: 0
                        }}>
                          {intervention.titre || 'Intervention sans titre'}
                        </h4>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: intervention.typeDemande === 'CURATIVE' ? '#fee2e2' : '#dbeafe',
                          color: intervention.typeDemande === 'CURATIVE' ? '#dc2626' : '#2563eb'
                        }}>
                          {intervention.typeDemande === 'CURATIVE' ? '🔧 CURATIVE' : '🛠️ PRÉVENTIVE'}
                        </span>
                      </div>
                      
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        margin: '0 0 1rem 0',
                        lineHeight: '1.5'
                      }}>
                        {intervention.description || 'Aucune description disponible'}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}>
                        <span>
                          📅 {intervention.dateDemande 
                            ? new Date(intervention.dateDemande).toLocaleDateString('fr-FR')
                            : 'Date non disponible'
                          }
                        </span>
                        <span>
                          ⚡ Priorité: {intervention.priorite || 'Non définie'}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        backgroundColor: intervention.statut === 'EN_ATTENTE' ? '#fef3c7' : 
                                        intervention.statut === 'EN_COURS' ? '#dbeafe' :
                                        intervention.statut === 'REFUSEE' ? '#fee2e2' : '#dcfce7',
                        color: intervention.statut === 'EN_ATTENTE' ? '#d97706' : 
                              intervention.statut === 'EN_COURS' ? '#2563eb' :
                              intervention.statut === 'REFUSEE' ? '#dc2626' : '#16a34a'
                      }}>
                        {intervention.statut === 'EN_ATTENTE' ? '⏳ EN ATTENTE' :
                         intervention.statut === 'EN_COURS' ? '✅ CONFIRMÉE' :
                         intervention.statut === 'REFUSEE' ? '❌ REFUSÉE' : '🏁 TERMINÉE'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              showSearch={true}
              showFilters={true}
              showSort={true}
            />
          </div>
        </div>
        </div>
      </div>

      {/* Modal de création d'intervention */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#374151'
            }}>Créer une nouvelle intervention</h3>

            {createError && (
              <div style={{
                background: '#fee2e2',
                color: '#dc2626',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                {createError}
              </div>
            )}

            <form onSubmit={createIntervention}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Titre
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Priorité
                </label>
                <select
                  name="priorite"
                  value={formData.priorite}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="NORMALE">Normale</option>
                  <option value="HAUTE">Haute</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: createLoading ? '#9ca3af' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: createLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {createLoading ? '⏳ Création...' : '✅ Créer l\'intervention'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
