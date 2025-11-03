import React from 'react';
import { NotificationProvider } from '../../../components/Notifications/NotificationSystem';
import { useProjectData } from './hooks/useProjectData';
import SubProjects from './SubProjects';

/**
 * Page dédiée aux sous-projets - Sans onglets
 */
function SubProjectsPageContent() {
  const projectData = useProjectData();

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(248,250,252,1) 100%)', 
      padding: '2rem 0' 
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          boxShadow: '0 4px 20px rgba(0,48,97,0.1)', 
          border: '1px solid rgba(0,48,97,0.1)', 
          overflow: 'hidden'
        }}>
          
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)', 
            padding: '1.5rem 2rem', 
            color: 'white' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.8rem' }}>🔗</span>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                  Gestion des Sous-projets
                </h1>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>
                  ⚙️ Créer et gérer les sous-projets
                </p>
              </div>
            </div>
          </div>

          {/* Contenu */}
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
        </div>
      </div>
    </div>
  );
}

export default function SubProjectsPage() {
  return (
    <NotificationProvider>
      <SubProjectsPageContent />
    </NotificationProvider>
  );
}
