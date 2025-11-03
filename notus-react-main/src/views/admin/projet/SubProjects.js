import React, { useState, useEffect } from 'react';

/**
 * Composant pour créer et gérer les sous-projets
 */
export default function SubProjects({ 
  projects,
  selectedProject,
  setSelectedProject,
  sousProjectsWithStats,
  loadingSousProjects,
  availableUsers,
  loadingUsers,
  availableComponents,
  loadingComponents,
  fetchSousProjects,
  confirmSousProjet,
  deleteSousProjet,
  showNotification
}) {
  const [sousProjetForm, setSousProjetForm] = useState({
    sousProjetName: '',
    description: '',
    totalPrice: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Charger les sous-projets quand le projet change
  useEffect(() => {
    if (selectedProject) {
      fetchSousProjects(selectedProject.id);
    }
  }, [selectedProject, fetchSousProjects]);

  // Note: Les notifications sont envoyées automatiquement par le backend
  // lors de la création du sous-projet (voir SousProjetService.java ligne 85)

  const handleSousProjetSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) {
      showNotification('error', '❌ Veuillez sélectionner un projet parent');
      return;
    }

    if (!selectedUser) {
      showNotification('error', '❌ Veuillez sélectionner un utilisateur responsable');
      return;
    }

    setIsLoading(true);

    const dataToSend = {
      sousProjetName: sousProjetForm.sousProjetName,
      description: sousProjetForm.description,
      totalPrice: parseFloat(sousProjetForm.totalPrice),
      components: selectedComponents.map(comp => comp.trartArticle),
      users: [selectedUser.id]
    };

    try {
      const response = await fetch(`http://localhost:8089/PI/PI/sousprojets/create/${selectedProject.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const createdSousProjet = await response.json();
        
        showNotification('success', '✅ Sous-projet créé avec succès ! Les magasiniers ont été notifiés automatiquement.');
        
        // Afficher le nombre de composants commandés
        if (selectedComponents.length > 0) {
          showNotification('info', `📦 ${selectedComponents.length} composant(s) commandé(s) - Stock mis à jour`);
        }
        
        setSousProjetForm({ sousProjetName: '', description: '', totalPrice: '' });
        setSelectedComponents([]);
        setSelectedUser(null);
        fetchSousProjects(selectedProject.id);
      } else {
        showNotification('error', '❌ Erreur lors de la création du sous-projet');
      }
    } catch (error) {
      showNotification('error', '❌ Erreur de connexion au serveur');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      {/* Sélection du projet parent */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#003061',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🔗 Gestion des Sous-projets
        </h3>
        
        <div style={{
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginBottom: '2rem'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: '#374151'
          }}>
            🏗️ Sélectionner un Projet Parent
          </label>
          <select
            value={selectedProject?.id || ''}
            onChange={(e) => {
              const project = projects.find(p => p.id === parseInt(e.target.value));
              setSelectedProject(project);
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              background: 'white'
            }}
          >
            <option value="">-- Choisir un projet --</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.projectName} (Budget: {project.budget?.toLocaleString() || '0'} DT)
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedProject && (
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
          {/* Formulaire de création */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#003061',
              marginBottom: '1.5rem'
            }}>
              ➕ Créer un Sous-projet
            </h4>
            
            <form onSubmit={handleSousProjetSubmit} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  📝 Nom du Sous-projet
                </label>
                <input
                  type="text"
                  value={sousProjetForm.sousProjetName}
                  onChange={(e) => setSousProjetForm({...sousProjetForm, sousProjetName: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  💰 Budget (DT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={sousProjetForm.totalPrice}
                  onChange={(e) => setSousProjetForm({...sousProjetForm, totalPrice: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  📋 Description
                </label>
                <textarea
                  value={sousProjetForm.description}
                  onChange={(e) => setSousProjetForm({...sousProjetForm, description: e.target.value})}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              {/* Sélection utilisateur */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  👥 Utilisateur Responsable *
                </label>
                
                {loadingUsers ? (
                  <div style={{
                    padding: '1rem',
                    textAlign: 'center',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Chargement...</span>
                  </div>
                ) : (
                  <select
                    value={selectedUser?.id || ''}
                    onChange={(e) => {
                      const user = availableUsers.find(u => u.id === parseInt(e.target.value));
                      setSelectedUser(user || null);
                    }}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      background: 'white'
                    }}
                  >
                    <option value="">-- Sélectionner --</option>
                    {availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.role || 'Utilisateur'})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {/* Sélection composants */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                  color: '#374151'
                }}>
                  🔧 Composants ({selectedComponents.length})
                </label>
                
                {loadingComponents ? (
                  <div style={{
                    padding: '1rem',
                    textAlign: 'center',
                    background: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Chargement...</span>
                  </div>
                ) : (
                  <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    background: 'white'
                  }}>
                    {availableComponents.map((component) => {
                      const isSelected = selectedComponents.some(sc => sc.trartArticle === component.trartArticle);
                      return (
                        <div
                          key={component.trartArticle}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedComponents(selectedComponents.filter(sc => sc.trartArticle !== component.trartArticle));
                            } else {
                              setSelectedComponents([...selectedComponents, component]);
                            }
                          }}
                          style={{
                            padding: '0.75rem',
                            borderBottom: '1px solid #e5e7eb',
                            cursor: 'pointer',
                            background: isSelected ? '#eff6ff' : 'white',
                            borderLeft: isSelected ? '4px solid #003061' : '4px solid transparent'
                          }}
                        >
                          <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                            {isSelected ? '✅' : '⚪'} {component.trartDesignation || component.trartArticle}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#059669' }}>
                            {parseFloat(component.prix || 0).toLocaleString()} DT
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? '⏳ Création...' : '✨ Créer le Sous-projet'}
              </button>
            </form>
          </div>

          {/* Liste des sous-projets */}
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h4 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#003061',
              marginBottom: '1rem'
            }}>
              📋 Sous-projets de "{selectedProject.projectName}"
            </h4>
            
            {loadingSousProjects ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: '#6b7280' }}>Chargement...</p>
              </div>
            ) : sousProjectsWithStats.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                background: '#f9fafb',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '3rem' }}>📂</span>
                <h4 style={{ margin: '0.5rem 0', color: '#374151' }}>Aucun sous-projet</h4>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem', maxHeight: '600px', overflowY: 'auto', padding: '0.25rem' }}>
                {sousProjectsWithStats.map((sp) => {
                  const { budgetAlloue, coutReel, depassement } = sp.stats;
                  const isConfirmed = sp.confirmed === 1;
                  
                  return (
                    <div
                      key={sp.id}
                      style={{
                        position: 'relative',
                        background: isConfirmed 
                          ? 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(255,255,255,0.95) 100%)'
                          : 'linear-gradient(135deg, rgba(251,191,36,0.05) 0%, rgba(255,255,255,0.95) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: `2px solid ${isConfirmed ? 'rgba(16,185,129,0.3)' : 'rgba(251,191,36,0.3)'}`,
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                      }}
                    >
                      {/* Badge de statut */}
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        background: isConfirmed 
                          ? 'linear-gradient(135deg, #10b981, #059669)' 
                          : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        color: 'white',
                        boxShadow: isConfirmed 
                          ? '0 4px 12px rgba(16,185,129,0.3)' 
                          : '0 4px 12px rgba(251,191,36,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        {isConfirmed ? '✅ Confirmé' : '⏳ En attente'}
                      </div>

                      {/* Titre */}
                      <h5 style={{
                        margin: '0 0 1rem 0',
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: '#003061',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        paddingRight: '7rem'
                      }}>
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #003061, #0078d4)',
                          color: 'white',
                          fontSize: '1rem'
                        }}>
                          🔗
                        </span>
                        {sp.sousProjetName}
                      </h5>
                      
                      {/* Description si présente */}
                      {sp.description && (
                        <p style={{ 
                          fontSize: '0.875rem', 
                          color: '#6b7280', 
                          marginBottom: '1rem',
                          lineHeight: '1.5'
                        }}>
                          {sp.description}
                        </p>
                      )}

                      {/* Informations financières */}
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1.25rem'
                      }}>
                        <div style={{
                          padding: '0.75rem',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(147,197,253,0.1))',
                          border: '1px solid rgba(59,130,246,0.2)'
                        }}>
                          <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.25rem' }}>
                            💰 BUDGET ALLOUÉ
                          </div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0078d4' }}>
                            {budgetAlloue.toLocaleString()} DT
                          </div>
                        </div>
                        <div style={{
                          padding: '0.75rem',
                          borderRadius: '12px',
                          background: depassement 
                            ? 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(252,165,165,0.1))' 
                            : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(167,243,208,0.1))',
                          border: `1px solid ${depassement ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`
                        }}>
                          <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.25rem' }}>
                            💵 COÛT RÉEL
                          </div>
                          <div style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: '800', 
                            color: depassement ? '#ef4444' : '#10b981'
                          }}>
                            {coutReel.toLocaleString()} DT
                          </div>
                        </div>
                      </div>

                      {/* Indicateur de dépassement */}
                      {depassement && (
                        <div style={{
                          padding: '0.75rem',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(252,165,165,0.1))',
                          border: '1px solid rgba(239,68,68,0.2)',
                          marginBottom: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626' }}>
                            Dépassement de budget : +{(coutReel - budgetAlloue).toLocaleString()} DT
                          </span>
                        </div>
                      )}

                      {/* Composants */}
                      {sp.components && sp.components.length > 0 && (
                        <div style={{
                          padding: '0.75rem',
                          borderRadius: '12px',
                          background: 'rgba(139,92,246,0.05)',
                          border: '1px solid rgba(139,92,246,0.15)',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>
                            🔧 COMPOSANTS ({sp.components.length})
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#8b5cf6', fontWeight: '600' }}>
                            {sp.components.slice(0, 3).join(', ')}
                            {sp.components.length > 3 && ` +${sp.components.length - 3} autres`}
                          </div>
                        </div>
                      )}
                      
                      {/* Boutons d'action */}
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSousProjet(sp.id);
                          }}
                          style={{
                            flex: 1,
                            padding: '0.75rem 1.25rem',
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
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
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
