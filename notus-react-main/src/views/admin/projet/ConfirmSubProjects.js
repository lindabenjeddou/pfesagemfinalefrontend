import React, { useState, useEffect } from 'react';

/**
 * Composant pour confirmer les sous-projets
 */
export default function ConfirmSubProjects({ 
  confirmSousProjet,
  deleteSousProjet
}) {
  const [allSousProjects, setAllSousProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSousProjet, setSelectedSousProjet] = useState(null);

  // Charger tous les sous-projets non confirmés au montage
  useEffect(() => {
    fetchAllPendingSousProjects();
  }, []);

  const fetchAllPendingSousProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8089/PI/PI/sousprojets/');
      if (response.ok) {
        const data = await response.json();
        // Afficher tous les sous-projets (confirmés et non confirmés)
        setAllSousProjects(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sous-projets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    await confirmSousProjet(id);
    setSelectedSousProjet(null);
    fetchAllPendingSousProjects();
  };

  const handleDelete = async (id) => {
    await deleteSousProjet(id);
    setSelectedSousProjet(null);
    fetchAllPendingSousProjects();
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '2rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '2.5rem' }}>✅</div>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                Confirmation des Sous-projets
              </h2>
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '1.1rem',
                opacity: 0.9
              }}>
                🏢 Interface Chef de Projet - Validation des Sous-projets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des sous-projets non confirmés */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,48,97,0.1)'
        }}>
          <div style={{
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#003061',
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <span style={{
                background: 'linear-gradient(135deg, #0078d4, #003061)',
                color: 'white',
                padding: '0.75rem 1.25rem',
                borderRadius: '16px',
                fontWeight: '700',
                fontSize: '1.25rem',
                boxShadow: '0 4px 12px rgba(0,120,212,0.3)'
              }}>
                📋 {allSousProjects.length}
              </span>
              Tous les Sous-projets
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <span style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
                }}>
                  ⏳ {allSousProjects.filter(sp => sp.confirmed === 0).length} En attente
                </span>
                <span style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                }}>
                  ✅ {allSousProjects.filter(sp => sp.confirmed === 1).length} Confirmés
                </span>
              </div>
            </h3>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '1rem' }}>
              Tous les sous-projets de tous les projets - Confirmés et en attente de validation
            </p>
          </div>

          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '3rem',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                fontSize: '3rem',
                animation: 'spin 2s linear infinite'
              }}>⚙️</div>
              <p style={{ color: '#6b7280', fontSize: '1.1rem', margin: 0 }}>
                Chargement des sous-projets...
              </p>
            </div>
          ) : allSousProjects.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#374151' }}>
                Aucun sous-projet trouvé
              </h4>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                Aucun sous-projet n'a été créé pour le moment.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {allSousProjects.map((sousProjet, index) => {
                // Calculer les stats pour chaque sous-projet
                const budgetAlloue = parseFloat(sousProjet.totalPrice || 0);
                const coutReel = sousProjet.components?.reduce((sum, compRef) => sum + 0, 0) || 0;
                const depassement = coutReel > budgetAlloue;
                
                return (
                  <div
                    key={sousProjet.id}
                    onClick={() => setSelectedSousProjet(sousProjet)}
                    style={{
                      background: sousProjet.confirmed === 1 ? 
                        'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(255,255,255,0.95) 100%)' :
                        'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(255,255,255,0.95) 100%)',
                      border: sousProjet.confirmed === 1 ? 
                        '2px solid rgba(16,185,129,0.3)' : 
                        '2px solid rgba(245,158,11,0.3)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    }}
                  >
                    {/* Badge de statut */}
                    <div style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      background: sousProjet.confirmed === 1 ? 
                        'linear-gradient(135deg, #10b981, #059669)' :
                        'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: 'white',
                      padding: '0.375rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                      {sousProjet.confirmed === 1 ? '✅' : '⏳'}
                    </div>

                    {/* Titre */}
                    <div style={{ paddingRight: '3rem' }}>
                      <h4 style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#003061',
                        margin: '0 0 0.5rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #003061, #0078d4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem'
                        }}>
                          🔗
                        </span>
                        {sousProjet.sousProjetName}
                      </h4>
                      
                      {/* Info projet parent */}
                      {sousProjet.project && (
                        <p style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          margin: '0 0 0.75rem 0'
                        }}>
                          📂 Projet: <strong>{sousProjet.project.projectName || 'N/A'}</strong>
                        </p>
                      )}

                      {/* Infos budgétaires compactes */}
                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '0.75rem'
                      }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#6b7280', display: 'block' }}>
                            💰 BUDGET
                          </span>
                          <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0078d4' }}>
                            {budgetAlloue.toLocaleString()} DT
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#6b7280', display: 'block' }}>
                            💵 COÛT
                          </span>
                          <span style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: depassement ? '#ef4444' : '#10b981'
                          }}>
                            {coutReel.toLocaleString()} DT
                          </span>
                        </div>
                      </div>

                      {/* Indicateur de clic */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginTop: '1rem'
                      }}>
                        <span>🔍 Cliquez pour voir les détails</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* Modal de détails */}
      {selectedSousProjet && (() => {
        const budgetAlloue = parseFloat(selectedSousProjet.totalPrice || 0);
        const coutReel = selectedSousProjet.components?.reduce((sum, compRef) => sum + 0, 0) || 0;
        const depassement = coutReel > budgetAlloue;
        const pourcentageUtilise = budgetAlloue > 0 ? (coutReel / budgetAlloue) * 100 : 0;

        return (
          <div
            onClick={() => setSelectedSousProjet(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '2rem'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '24px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                position: 'relative'
              }}
            >
              {/* Header de la modal */}
              <div style={{
                background: selectedSousProjet.confirmed === 1 
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #f59e0b, #d97706)',
                padding: '2rem',
                borderRadius: '24px 24px 0 0',
                color: 'white',
                position: 'relative'
              }}>
                <button
                  onClick={() => setSelectedSousProjet(null)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    color: 'white',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.transform = 'rotate(90deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'rotate(0deg)';
                  }}
                >
                  ✕
                </button>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    🔗
                  </div>
                  <h2 style={{
                    margin: 0,
                    fontSize: '1.75rem',
                    fontWeight: '800'
                  }}>
                    {selectedSousProjet.sousProjetName}
                  </h2>
                </div>

                <div style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: '700'
                }}>
                  {selectedSousProjet.confirmed === 1 ? '✅ Confirmé' : '⏳ En attente de validation'}
                </div>
              </div>

              {/* Contenu de la modal */}
              <div style={{ padding: '2rem' }}>
                {/* Projet parent */}
                {selectedSousProjet.project && (
                  <div style={{
                    background: 'rgba(0,120,212,0.05)',
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(0,120,212,0.2)'
                  }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>📂 Projet Parent</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#003061', marginTop: '0.25rem' }}>
                      {selectedSousProjet.project.projectName || 'N/A'}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedSousProjet.description && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#003061',
                      marginBottom: '0.75rem'
                    }}>
                      📝 Description
                    </h3>
                    <p style={{
                      color: '#4b5563',
                      lineHeight: '1.6',
                      margin: 0,
                      background: '#f9fafb',
                      padding: '1rem',
                      borderRadius: '12px'
                    }}>
                      {selectedSousProjet.description}
                    </p>
                  </div>
                )}

                {/* Informations budgétaires */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '700',
                    color: '#003061',
                    marginBottom: '1rem'
                  }}>
                    💰 Informations Financières
                  </h3>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(147,197,253,0.1))',
                      border: '1px solid rgba(59,130,246,0.2)',
                      padding: '1rem',
                      borderRadius: '12px'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        💰 Budget Alloué
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0078d4' }}>
                        {budgetAlloue.toLocaleString()} DT
                      </div>
                    </div>
                    <div style={{
                      background: depassement 
                        ? 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(252,165,165,0.1))'
                        : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(167,243,208,0.1))',
                      border: `1px solid ${depassement ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                      padding: '1rem',
                      borderRadius: '12px'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        💵 Coût Réel
                      </div>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: depassement ? '#ef4444' : '#10b981'
                      }}>
                        {coutReel.toLocaleString()} DT
                      </div>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div style={{
                    width: '100%',
                    height: '16px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{
                      width: `${Math.min(pourcentageUtilise, 100)}%`,
                      height: '100%',
                      background: depassement 
                        ? 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)'
                        : 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>

                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: depassement ? '#dc2626' : '#059669'
                  }}>
                    {depassement ? (
                      <span>⚠️ Dépassement budgétaire : +{(coutReel - budgetAlloue).toLocaleString()} DT</span>
                    ) : (
                      <span>✅ Économie réalisée : {(budgetAlloue - coutReel).toLocaleString()} DT</span>
                    )}
                  </div>
                </div>

                {/* Composants */}
                {selectedSousProjet.components && selectedSousProjet.components.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: '#003061',
                      marginBottom: '0.75rem'
                    }}>
                      🔧 Composants Utilisés
                    </h3>
                    <div style={{
                      background: 'rgba(139,92,246,0.05)',
                      border: '1px solid rgba(139,92,246,0.15)',
                      padding: '1rem',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      color: '#6b7280'
                    }}>
                      <strong style={{ color: '#8b5cf6' }}>{selectedSousProjet.components.length}</strong> composant(s) utilisé(s)
                      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                        {selectedSousProjet.components.join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  paddingTop: '1.5rem',
                  borderTop: '2px solid #e5e7eb'
                }}>
                  {selectedSousProjet.confirmed === 0 && (
                    <button
                      onClick={() => handleConfirm(selectedSousProjet.id)}
                      style={{
                        flex: 1,
                        padding: '1rem 2rem',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(16,185,129,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
                      }}
                    >
                      ✅ Confirmer le Sous-projet
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedSousProjet.id)}
                    style={{
                      flex: selectedSousProjet.confirmed === 0 ? 0 : 1,
                      padding: '1rem 2rem',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(239,68,68,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
                    }}
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
