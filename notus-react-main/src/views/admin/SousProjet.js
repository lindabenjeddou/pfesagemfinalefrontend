import React, { useState, useEffect } from "react";

export default function SousProjet() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [sousProjects, setSousProjects] = useState([]);
  const [loadingSousProjects, setLoadingSousProjects] = useState(false);
  const [sousProjetForm, setSousProjetForm] = useState({
    sousProjetName: '',
    description: '',
    totalPrice: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [availableComponents, setAvailableComponents] = useState([]);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  // useEffect pour charger les données au démarrage
  useEffect(() => {
    fetchProjects();
    fetchUsers();
    fetchComponents();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4000);
  };

  // Fonction pour récupérer tous les projets du backend
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await fetch("http://localhost:8089/PI/PI/projects/all", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.ok) {
        const projectsData = await response.json();
        setProjects(projectsData);
      } else {
        console.error('Erreur lors de la récupération des projets');
        setProjects([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Fonction pour récupérer les utilisateurs disponibles
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("http://localhost:8089/PI/user/all", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data);
      } else {
        console.error('Erreur lors de la récupération des utilisateurs');
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fonction pour récupérer les composants disponibles
  const fetchComponents = async () => {
    setLoadingComponents(true);
    try {
      const response = await fetch("http://localhost:8089/PI/PI/component/all", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableComponents(data);
      } else {
        console.error('Erreur lors de la récupération des composants');
        setAvailableComponents([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setAvailableComponents([]);
    } finally {
      setLoadingComponents(false);
    }
  };

  // Fonction pour récupérer les sous-projets d'un projet
  const fetchSousProjects = async (projectId) => {
    setLoadingSousProjects(true);
    try {
      const response = await fetch(`http://localhost:8089/PI/PI/sousprojets/project/${projectId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const data = await response.json();
        setSousProjects(data);
      } else {
        console.error('Erreur lors de la récupération des sous-projets');
        setSousProjects([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setSousProjects([]);
    } finally {
      setLoadingSousProjects(false);
    }
  };

  // Fonction pour créer un sous-projet
  const handleSousProjetSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) {
      showNotification('error', '❌ Veuillez sélectionner un projet parent');
      return;
    }

    // Vérifier qu'un utilisateur est sélectionné
    if (!selectedUser) {
      showNotification('error', '❌ Veuillez sélectionner un utilisateur responsable du sous-projet');
      setIsLoading(false);
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
        showNotification('success', '✅ Sous-projet créé avec succès !');
        setSousProjetForm({ sousProjetName: '', description: '', totalPrice: '' });
        setSelectedComponents([]);
        setSelectedUser(null);
        fetchSousProjects(selectedProject.id);
      } else {
        const errorData = await response.text();
        showNotification('error', '❌ Erreur lors de la création du sous-projet');
        console.error('Erreur serveur:', errorData);
      }
    } catch (error) {
      showNotification('error', '❌ Erreur de connexion au serveur');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage du composant
  React.useEffect(() => {
    fetchProjects();
    fetchComponents();
    fetchUsers();
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(248,250,252,1) 100%)', padding: '2rem 0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
          
          {/* Notifications */}
          {notification.show && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 1000,
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              color: 'white',
              fontWeight: '600',
              background: notification.type === 'success' 
                ? 'linear-gradient(135deg, #059669, #10b981)' 
                : 'linear-gradient(135deg, #dc2626, #ef4444)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              animation: 'slideDown 0.3s ease-out'
            }}>
              {notification.message}
            </div>
          )}

          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,48,97,0.1)', border: '1px solid rgba(0,48,97,0.1)', overflow: 'hidden', animation: 'fadeIn 0.5s ease-out' }}>
            
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)', padding: '2rem', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>🔗</span>
                <div>
                  <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Gestion des Sous-Projets</h1>
                  <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9, fontSize: '1.1rem' }}>👥 Interface Collaborative - Créez et gérez vos sous-projets</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '2rem' }}>
              {/* Sélection du projet parent */}
              <div style={{
                background: '#f8fafc',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '2rem'
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#003061',
                  marginBottom: '1rem'
                }}>
                  🏗️ Sélectionner un Projet Parent
                </h3>
                
                {loadingProjects ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #e5e7eb',
                      borderTop: '4px solid #003061',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 1rem'
                    }} />
                    <p style={{ color: '#6b7280' }}>Chargement des projets...</p>
                  </div>
                ) : (
                  <select
                    value={selectedProject?.id || ''}
                    onChange={(e) => {
                      const project = projects.find(p => p.id === parseInt(e.target.value));
                      setSelectedProject(project);
                      if (project) {
                        fetchSousProjects(project.id);
                      } else {
                        setSousProjects([]);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1.1rem',
                      background: 'white'
                    }}
                  >
                    <option value="">-- Choisir un projet --</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        📋 {project.projectName} | 👨‍💼 {project.projectManagerName} | 💰 {project.budget?.toLocaleString() || '0'} DT
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedProject && (
                <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
                  {/* Formulaire de création */}
                  <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    height: 'fit-content'
                  }}>
                    <h4 style={{
                      fontSize: '1.3rem',
                      fontWeight: '600',
                      color: '#003061',
                      marginBottom: '1.5rem'
                    }}>
                      ➕ Créer un Sous-projet
                    </h4>
                    
                    <form onSubmit={handleSousProjetSubmit} style={{ display: 'grid', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                          📝 Nom du Sous-projet
                        </label>
                        <input
                          type="text"
                          value={sousProjetForm.sousProjetName}
                          onChange={(e) => setSousProjetForm({...sousProjetForm, sousProjetName: e.target.value})}
                          required
                          style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                          💰 Budget (DT)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={sousProjetForm.totalPrice}
                          onChange={(e) => setSousProjetForm({...sousProjetForm, totalPrice: e.target.value})}
                          required
                          style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}
                        />
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                          📋 Description
                        </label>
                        <textarea
                          value={sousProjetForm.description}
                          onChange={(e) => setSousProjetForm({...sousProjetForm, description: e.target.value})}
                          rows={3}
                          style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', resize: 'vertical' }}
                        />
                      </div>
                      
                      {/* Sélection utilisateur */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                          👥 Utilisateur Responsable *
                        </label>
                        <select
                          value={selectedUser?.id || ''}
                          onChange={(e) => {
                            const user = availableUsers.find(u => u.id === parseInt(e.target.value));
                            setSelectedUser(user || null);
                          }}
                          required
                          style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', background: 'white' }}
                        >
                          <option value="">-- Sélectionner un utilisateur --</option>
                          {availableUsers.map(user => (
                            <option key={user.id} value={user.id}>
                              {user.firstName} {user.lastName} ({user.role || 'Utilisateur'})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Sélection des composants */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                          🔧 Composants ({selectedComponents.length} sélectionnés)
                        </label>
                        
                        {loadingComponents ? (
                          <div style={{
                            padding: '1rem',
                            textAlign: 'center',
                            background: '#f9fafb',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              border: '2px solid #e5e7eb',
                              borderTop: '2px solid #003061',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite',
                              margin: '0 auto 0.5rem'
                            }} />
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Chargement des composants...</span>
                          </div>
                        ) : availableComponents.length === 0 ? (
                          <div style={{
                            padding: '1rem',
                            textAlign: 'center',
                            background: '#fef3f2',
                            borderRadius: '8px',
                            border: '1px solid #fecaca',
                            color: '#dc2626'
                          }}>
                            ⚠️ Aucun composant disponible
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
                                    borderLeft: isSelected ? '4px solid #003061' : '4px solid transparent',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}
                                >
                                  <div>
                                    <div style={{
                                      fontWeight: '600',
                                      color: isSelected ? '#003061' : '#374151',
                                      fontSize: '0.875rem'
                                    }}>
                                      {isSelected ? '✅' : '⚪'} {component.trartDesignation || component.trartArticle}
                                    </div>
                                    <div style={{
                                      fontSize: '0.75rem',
                                      color: '#6b7280'
                                    }}>
                                      ID: {component.trartArticle}
                                    </div>
                                  </div>
                                  <div style={{
                                    fontWeight: '600',
                                    color: '#059669',
                                    fontSize: '0.875rem'
                                  }}>
                                    {parseFloat(component.prix || 0).toLocaleString()} DT
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Résumé des composants sélectionnés */}
                        {selectedComponents.length > 0 && (
                          <div style={{
                            marginTop: '0.75rem',
                            padding: '0.75rem',
                            background: '#f0fdf4',
                            borderRadius: '8px',
                            border: '1px solid #bbf7d0'
                          }}>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#059669',
                              fontWeight: '600',
                              marginBottom: '0.5rem'
                            }}>
                              💰 Coût total estimé: {selectedComponents.reduce((sum, comp) => sum + (parseFloat(comp.prix) || 0), 0).toLocaleString()} DT
                            </div>
                            <div style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '0.25rem'
                            }}>
                              {selectedComponents.map((comp, idx) => (
                                <span key={idx} style={{
                                  fontSize: '0.75rem',
                                  background: '#dcfce7',
                                  padding: '0.125rem 0.375rem',
                                  borderRadius: '4px',
                                  color: '#166534'
                                }}>
                                  {comp.trartDesignation || comp.trartArticle} ({parseFloat(comp.prix || 0).toLocaleString()} DT)
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                          padding: '1rem 1.5rem',
                          background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isLoading ? 'Création...' : '✨ Créer le Sous-projet'}
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
                    <h4 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#003061', marginBottom: '1.5rem' }}>
                      📋 Sous-projets de "{selectedProject.projectName}"
                    </h4>

                    {loadingSousProjects ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          border: '4px solid #e5e7eb',
                          borderTop: '4px solid #003061',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          margin: '0 auto 1rem'
                        }} />
                        <p style={{ color: '#6b7280' }}>Chargement des sous-projets...</p>
                      </div>
                    ) : sousProjects.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '3rem 2rem',
                        background: '#f9fafb',
                        borderRadius: '12px',
                        border: '2px dashed #d1d5db'
                      }}>
                        <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>📂</span>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Aucun sous-projet</h4>
                        <p style={{ margin: 0, color: '#6b7280' }}>Créez le premier sous-projet pour ce projet !</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        {/* Résumé budgétaire global */}
                        {sousProjects.length > 0 && (
                          <div style={{
                            background: '#f8fafc',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            color: '#6b7280',
                            marginBottom: '1rem'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>📊 Résumé budgétaire du projet</span>
                              <div style={{ display: 'flex', gap: '1rem' }}>
                                <span>Budget alloué: <strong style={{ color: '#059669' }}>{sousProjects.reduce((sum, sp) => sum + (sp.totalPrice || 0), 0).toLocaleString()} DT</strong></span>
                                <span>Coût réel: <strong style={{ color: '#dc2626' }}>{sousProjects.reduce((sum, sp) => {
                                  const coutReel = sp.components ? sp.components.reduce((compSum, comp) => compSum + (parseFloat(comp.prix) || 0), 0) : 0;
                                  return sum + coutReel;
                                }, 0).toLocaleString()} DT</strong></span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {sousProjects.map((sousProjet) => {
                          // Calculer le coût réel basé sur les composants
                          const coutReel = sousProjet.components ? 
                            sousProjet.components.reduce((sum, comp) => sum + (parseFloat(comp.prix) || 0), 0) : 0;
                          const budgetAlloue = sousProjet.totalPrice || 0;
                          const depassement = coutReel > budgetAlloue;
                          const pourcentageUtilise = budgetAlloue > 0 ? (coutReel / budgetAlloue) * 100 : 0;
                          
                          return (
                            <div
                              key={sousProjet.id}
                              style={{
                                background: depassement ? '#fef2f2' : (sousProjet.confirmed === 1 ? '#f0fdf4' : '#fef3f2'),
                                border: `2px solid ${depassement ? '#fca5a5' : (sousProjet.confirmed === 1 ? '#bbf7d0' : '#fecaca')}`,
                                borderRadius: '12px',
                                padding: '1.5rem',
                                position: 'relative',
                                overflow: 'hidden'
                              }}
                            >
                              {/* Indicateur de dépassement */}
                              {depassement && (
                                <div style={{
                                  position: 'absolute',
                                  top: 0,
                                  right: 0,
                                  background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                                  color: 'white',
                                  padding: '0.25rem 0.75rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  borderBottomLeftRadius: '8px'
                                }}>
                                  ⚠️ DÉPASSEMENT
                                </div>
                              )}
                              
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ flex: 1, paddingRight: '1rem' }}>
                                  <h5 style={{
                                    margin: '0 0 0.5rem 0',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: depassement ? '#dc2626' : '#374151'
                                  }}>
                                    🔗 {sousProjet.sousProjetName}
                                  </h5>
                                  {sousProjet.description && (
                                    <p style={{
                                      margin: '0 0 1rem 0',
                                      fontSize: '0.875rem',
                                      color: '#6b7280',
                                      lineHeight: '1.4'
                                    }}>
                                      📝 {sousProjet.description}
                                    </p>
                                  )}
                                  
                                  {/* Informations budgétaires */}
                                  <div style={{
                                    background: 'rgba(255,255,255,0.7)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                  }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                                      <div>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>Budget Alloué</span>
                                        <span style={{ fontSize: '1rem', fontWeight: '600', color: '#059669' }}>
                                          💰 {budgetAlloue.toLocaleString()} DT
                                        </span>
                                      </div>
                                      <div>
                                        <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>Coût Réel</span>
                                        <span style={{ 
                                          fontSize: '1rem', 
                                          fontWeight: '600', 
                                          color: depassement ? '#dc2626' : '#059669' 
                                        }}>
                                          💵 {coutReel.toLocaleString()} DT
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {/* Barre de progression budgétaire */}
                                    <div style={{ marginBottom: '0.5rem' }}>
                                      <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        marginBottom: '0.25rem'
                                      }}>
                                        <span>Utilisation du budget</span>
                                        <span style={{ 
                                          fontWeight: '600',
                                          color: depassement ? '#dc2626' : '#374151'
                                        }}>
                                          {pourcentageUtilise.toFixed(1)}%
                                        </span>
                                      </div>
                                      <div style={{
                                        width: '100%',
                                        height: '8px',
                                        backgroundColor: '#e5e7eb',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                      }}>
                                        <div style={{
                                          width: `${Math.min(pourcentageUtilise, 100)}%`,
                                          height: '100%',
                                          background: depassement 
                                            ? 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)'
                                            : pourcentageUtilise > 80
                                            ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
                                            : 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                                          transition: 'width 0.5s ease-in-out'
                                        }} />
                                      </div>
                                    </div>
                                    
                                    {/* Économie ou dépassement */}
                                    <div style={{
                                      fontSize: '0.875rem',
                                      fontWeight: '600',
                                      color: depassement ? '#dc2626' : '#059669'
                                    }}>
                                      {depassement ? (
                                        <span>⚠️ Dépassement: +{(coutReel - budgetAlloue).toLocaleString()} DT</span>
                                      ) : (
                                        <span>✅ Économie: -{(budgetAlloue - coutReel).toLocaleString()} DT</span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Composants du sous-projet */}
                                  {sousProjet.components && sousProjet.components.length > 0 && (
                                    <div style={{
                                      background: 'rgba(255,255,255,0.5)',
                                      padding: '0.75rem',
                                      borderRadius: '6px',
                                      marginBottom: '0.75rem'
                                    }}>
                                      <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>
                                        🔧 Composants ({sousProjet.components.length})
                                      </span>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                        {sousProjet.components.slice(0, 3).map((comp, idx) => (
                                          <span key={idx} style={{
                                            fontSize: '0.75rem',
                                            background: '#e5e7eb',
                                            padding: '0.125rem 0.375rem',
                                            borderRadius: '4px',
                                            color: '#374151'
                                          }}>
                                            {comp.trartDesignation || comp.trartArticle} ({parseFloat(comp.prix || 0).toLocaleString()} DT)
                                          </span>
                                        ))}
                                        {sousProjet.components.length > 3 && (
                                          <span style={{
                                            fontSize: '0.75rem',
                                            color: '#6b7280',
                                            fontStyle: 'italic'
                                          }}>
                                            +{sousProjet.components.length - 3} autres...
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Statut de confirmation */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem'
                                  }}>
                                    <span style={{
                                      color: sousProjet.confirmed === 1 ? '#059669' : '#dc2626',
                                      fontWeight: '600'
                                    }}>
                                      {sousProjet.confirmed === 1 ? '✅ Confirmé' : '⏳ En attente'}
                                    </span>
                                  </div>
                                </div>
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
          </div>
        </div>
      </div>
    </>
  );
}
