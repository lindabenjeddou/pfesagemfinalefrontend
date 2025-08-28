import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Interventions() {
  const { t } = useLanguage();
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchInterventions();
  }, []);

  const fetchInterventions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8089/PI/PI/demandes/recuperer/all");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des interventions");
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

  // Pagination
  const totalPages = Math.ceil(interventions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInterventions = interventions.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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
            marginBottom: '1rem',
            animation: 'spin 2s linear infinite'
          }}>⚙️</div>
          <h2 style={{
            fontSize: '1.5rem',
            color: '#003061',
            marginBottom: '1rem'
          }}>{t('interventions.loading', 'Chargement des interventions...')}</h2>
          <div style={{
            width: '200px',
            height: '4px',
            background: '#e2e8f0',
            borderRadius: '2px',
            overflow: 'hidden',
            margin: '0 auto'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, #003061, transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s ease-in-out infinite'
            }} />
          </div>
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
      {/* Animations CSS */}
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

      <div style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
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

        {/* Container principal */}
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
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #003061 0%, #0078d4 50%, #00a2ff 100%)',
            padding: '3rem 2rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Effet de brillance */}
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
                filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))',
                backdropFilter: 'blur(10px)'
              }}>🔧</div>
              
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '0.5rem',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                animation: 'slideInLeft 0.8s ease-out 0.2s both'
              }}>{t('interventions.title', 'Gestion des Interventions')}</h1>
              
              <p style={{
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '300',
                animation: 'slideInLeft 0.8s ease-out 0.4s both'
              }}>🏢 {t('interventions.subtitle', 'Suivi et Gestion des Demandes d\'Intervention Sagemcom')}</p>
            </div>
          </div>

          {/* Contenu principal */}
          <div style={{ padding: '3rem 2rem' }}>
            {/* Section des statistiques */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid #10b981',
                textAlign: 'center',
                animation: 'fadeInUp 0.8s ease-out 0.6s both'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
                <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#065f46', marginBottom: '0.5rem' }}>
                  {interventions.length}
                </h3>
                <p style={{ color: '#065f46', fontWeight: '500' }}>
                  {t('interventions.total', 'Total Interventions')}
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid #3b82f6',
                textAlign: 'center',
                animation: 'fadeInUp 0.8s ease-out 0.8s both'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏳</div>
                <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af', marginBottom: '0.5rem' }}>
                  {interventions.filter(i => i.statut === 'EN_ATTENTE').length}
                </h3>
                <p style={{ color: '#1e40af', fontWeight: '500' }}>
                  {t('interventions.pending', 'En Attente')}
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                borderRadius: '16px',
                padding: '2rem',
                border: '1px solid #f59e0b',
                textAlign: 'center',
                animation: 'fadeInUp 0.8s ease-out 1s both'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔄</div>
                <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#92400e', marginBottom: '0.5rem' }}>
                  {interventions.filter(i => i.statut === 'EN_COURS').length}
                </h3>
                <p style={{ color: '#92400e', fontWeight: '500' }}>
                  {t('interventions.in_progress', 'En Cours')}
                </p>
              </div>
            </div>

            {/* Liste des interventions */}
            {interventions.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                borderRadius: '16px',
                border: '1px solid rgba(0, 48, 97, 0.1)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                <h3 style={{ fontSize: '1.5rem', color: '#003061', marginBottom: '1rem' }}>
                  {t('interventions.no_data', 'Aucune intervention trouvée')}
                </h3>
                <p style={{ color: '#6b7280' }}>
                  {t('interventions.no_data_desc', 'Commencez par créer votre première intervention.')}
                </p>
              </div>
            ) : (
              <>
                {/* Grille des interventions */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '2rem',
                  marginBottom: '3rem'
                }}>
                  {currentInterventions.map((intervention, index) => (
                    <div
                      key={intervention.id}
                      style={{
                        background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                        borderRadius: '16px',
                        padding: '2rem',
                        border: '1px solid rgba(0, 48, 97, 0.1)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease',
                        animation: `fadeInUp 0.8s ease-out ${0.1 * index}s both`,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-8px)';
                        e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <h4 style={{
                          fontSize: '1.25rem',
                          fontWeight: '600',
                          color: '#003061',
                          marginBottom: '0.5rem'
                        }}>
                          {intervention.titre || `Intervention #${intervention.id}`}
                        </h4>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: intervention.statut === 'EN_ATTENTE' 
                            ? 'rgba(251, 191, 36, 0.1)' 
                            : intervention.statut === 'EN_COURS'
                            ? 'rgba(59, 130, 246, 0.1)'
                            : 'rgba(34, 197, 94, 0.1)',
                          color: intervention.statut === 'EN_ATTENTE' 
                            ? '#92400e' 
                            : intervention.statut === 'EN_COURS'
                            ? '#1e40af'
                            : '#15803d',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {intervention.statut === 'EN_ATTENTE' && '⏳ En Attente'}
                          {intervention.statut === 'EN_COURS' && '🔄 En Cours'}
                          {intervention.statut === 'TERMINE' && '✅ Terminé'}
                        </span>
                      </div>
                      
                      <p style={{
                        color: '#6b7280',
                        marginBottom: '1rem',
                        lineHeight: '1.5'
                      }}>
                        {intervention.description || 'Aucune description disponible'}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.875rem',
                        color: '#9ca3af'
                      }}>
                        <span>📅 {new Date(intervention.dateCreation).toLocaleDateString()}</span>
                        <span>👤 {intervention.demandeur?.firstName} {intervention.demandeur?.lastName}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                    borderRadius: '16px',
                    padding: '2rem',
                    border: '1px solid rgba(0, 48, 97, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Éléments décoratifs */}
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          width: `${30 + Math.random() * 50}px`,
                          height: `${30 + Math.random() * 50}px`,
                          background: `rgba(0,48,97,${0.03 + Math.random() * 0.05})`,
                          borderRadius: '50%',
                          animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
                          animationDelay: `${Math.random() * 2}s`
                        }}
                      />
                    ))}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      {/* Items per page */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <label style={{
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: '#003061'
                        }}>📄 {t('interventions.items_per_page', 'Éléments par page')}:</label>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            border: '2px solid rgba(0, 48, 97, 0.2)',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            background: 'rgba(255, 255, 255, 0.9)',
                            outline: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#0078d4';
                            e.target.style.boxShadow = '0 0 0 3px rgba(0, 120, 212, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(0, 48, 97, 0.2)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>

                      {/* Pagination info */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}>
                        <span style={{
                          padding: '0.5rem 1rem',
                          background: 'rgba(0, 48, 97, 0.1)',
                          borderRadius: '8px',
                          fontWeight: '600',
                          color: '#003061'
                        }}>
                          {startIndex + 1}-{Math.min(endIndex, interventions.length)} {t('interventions.of', 'sur')} {interventions.length}
                        </span>
                      </div>

                      {/* Navigation buttons */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <button
                          onClick={goToPrevious}
                          disabled={currentPage === 1}
                          style={{
                            padding: '0.75rem 1rem',
                            background: currentPage === 1 
                              ? '#e5e7eb' 
                              : 'linear-gradient(135deg, #003061, #0078d4)',
                            color: currentPage === 1 ? '#9ca3af' : 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== 1) {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(0, 48, 97, 0.3)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          ◀ {t('interventions.previous', 'Précédent')}
                        </button>

                        {/* Page numbers */}
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {[...Array(totalPages)].map((_, index) => {
                            const page = index + 1;
                            const isActive = page === currentPage;
                            return (
                              <button
                                key={page}
                                onClick={() => goToPage(page)}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  background: isActive 
                                    ? 'linear-gradient(135deg, #003061, #0078d4)' 
                                    : 'rgba(255, 255, 255, 0.9)',
                                  color: isActive ? 'white' : '#003061',
                                  border: isActive ? 'none' : '2px solid rgba(0, 48, 97, 0.2)',
                                  borderRadius: '8px',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isActive) {
                                    e.target.style.background = 'rgba(0, 48, 97, 0.1)';
                                  }
                                  e.target.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isActive) {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                                  }
                                  e.target.style.transform = 'translateY(0)';
                                }}
                              >
                                {page}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          onClick={goToNext}
                          disabled={currentPage === totalPages}
                          style={{
                            padding: '0.75rem 1rem',
                            background: currentPage === totalPages 
                              ? '#e5e7eb' 
                              : 'linear-gradient(135deg, #003061, #0078d4)',
                            color: currentPage === totalPages ? '#9ca3af' : 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== totalPages) {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(0, 48, 97, 0.3)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          {t('interventions.next', 'Suivant')} ▶
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
