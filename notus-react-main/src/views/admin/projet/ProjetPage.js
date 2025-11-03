import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { NotificationProvider } from '../../../components/Notifications/NotificationSystem';
import AnalyticsDashboard from '../../../components/Analytics/AnalyticsDashboard';
import { useProjectData } from './hooks/useProjectData';
import CreateProject from './CreateProject';
import ManageProjects from './ManageProjects';
import SubProjects from './SubProjects';
import ConfirmSubProjects from './ConfirmSubProjects';

/**
 * Page principale de gestion des projets - Architecture modulaire
 * Séparation en composants distincts pour meilleure maintenabilité
 */
function ProjetPageContent() {
  const location = useLocation();
  const history = useHistory();
  
  // Déterminer l'onglet actif depuis l'URL
  const getTabFromUrl = () => {
    const path = location.pathname;
    if (path.includes('/create')) return 'create';
    if (path.includes('/manage')) return 'manage';
    if (path.includes('/subprojects')) return 'subprojects';
    if (path.includes('/confirm')) return 'confirmation';
    if (path.includes('/analytics')) return 'analytics';
    return 'create'; // Par défaut
  };
  
  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  
  // Synchroniser l'onglet avec l'URL au changement de route
  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [location.pathname]);
  
  // Fonction pour changer d'onglet et mettre à jour l'URL
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const tabRoutes = {
      'create': '/admin/projet/create',
      'manage': '/admin/projet/manage',
      'subprojects': '/admin/projet/subprojects',
      'confirmation': '/admin/projet/confirm',
      'analytics': '/admin/projet/analytics'
    };
    history.push(tabRoutes[newTab] || '/admin/projet/create');
  };
  
  // Hook personnalisé pour toutes les données et opérations
  const projectData = useProjectData();

  const tabs = [
    { id: 'create', label: '➕ Créer un Projet', icon: '➕' },
    { id: 'manage', label: '📊 Gestion des Projets', icon: '📊' },
    { id: 'subprojects', label: '🔗 Sous-projets', icon: '🔗' },
    { id: 'confirmation', label: '✅ Confirmation', icon: '✅' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' }
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(248,250,252,1) 100%)', 
        padding: '2rem 0' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '16px', 
            boxShadow: '0 4px 20px rgba(0,48,97,0.1)', 
            border: '1px solid rgba(0,48,97,0.1)', 
            overflow: 'hidden', 
            animation: 'fadeIn 0.5s ease-out' 
          }}>
            
            {/* Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)', 
              padding: '1.5rem 2rem', 
              color: 'white' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🚀</span>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                    Gestion des Projets
                  </h1>
                  <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>
                    🏢 Plateforme Sagemcom - Architecture Modulaire
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation par onglets */}
            <div style={{
              display: 'flex',
              borderBottom: '2px solid #e5e7eb',
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              overflowX: 'auto'
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    padding: '1rem 2rem',
                    border: 'none',
                    background: activeTab === tab.id ? '#003061' : 'transparent',
                    color: activeTab === tab.id ? 'white' : '#6b7280',
                    fontWeight: '600',
                    cursor: 'pointer',
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.3s ease',
                    fontSize: '1rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenu des onglets */}
            <div style={{ padding: '2rem' }}>
              {activeTab === 'create' && (
                <CreateProject 
                  fetchProjects={projectData.fetchProjects}
                  showNotification={projectData.showNotification}
                />
              )}

              {activeTab === 'manage' && (
                <ManageProjects 
                  projects={projectData.projects}
                  loadingProjects={projectData.loadingProjects}
                  statistics={projectData.statistics}
                  onSelectProject={(project) => {
                    projectData.setSelectedProject(project);
                    projectData.fetchSousProjects(project.id);
                  }}
                  onChangeTab={handleTabChange}
                />
              )}

              {activeTab === 'subprojects' && (
                <SubProjects 
                  projects={projectData.projects}
                  selectedProject={projectData.selectedProject}
                  setSelectedProject={projectData.setSelectedProject}
                  sousProjectsWithStats={projectData.sousProjectsWithStats}
                  loadingSousProjects={projectData.loadingSousProjects}
                  availableUsers={projectData.availableUsers}
                  loadingUsers={projectData.loadingUsers}
                  availableComponents={projectData.availableComponents}
                  loadingComponents={projectData.loadingComponents}
                  fetchSousProjects={projectData.fetchSousProjects}
                  confirmSousProjet={projectData.confirmSousProjet}
                  deleteSousProjet={projectData.deleteSousProjet}
                  showNotification={projectData.showNotification}
                />
              )}

              {activeTab === 'confirmation' && (
                <ConfirmSubProjects 
                  projects={projectData.projects}
                  selectedProject={projectData.selectedProject}
                  setSelectedProject={projectData.setSelectedProject}
                  sousProjectsWithStats={projectData.sousProjectsWithStats}
                  loadingSousProjects={projectData.loadingSousProjects}
                  fetchSousProjects={projectData.fetchSousProjects}
                  confirmSousProjet={projectData.confirmSousProjet}
                  deleteSousProjet={projectData.deleteSousProjet}
                />
              )}

              {activeTab === 'analytics' && (
                <div style={{ animation: 'slideDown 0.3s ease-out' }}>
                  <AnalyticsDashboard />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Wrapper avec NotificationProvider
 */
export default function ProjetPage() {
  return (
    <NotificationProvider>
      <ProjetPageContent />
    </NotificationProvider>
  );
}
