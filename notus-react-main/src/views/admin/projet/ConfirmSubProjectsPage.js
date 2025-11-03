import React from 'react';
import { NotificationProvider } from '../../../components/Notifications/NotificationSystem';
import { useProjectData } from './hooks/useProjectData';
import ConfirmSubProjects from './ConfirmSubProjects';

/**
 * Page dédiée à la confirmation des sous-projets - Sans onglets
 */
function ConfirmSubProjectsPageContent() {
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
          
          {/* Contenu */}
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
        </div>
      </div>
    </div>
  );
}

export default function ConfirmSubProjectsPage() {
  return (
    <NotificationProvider>
      <ConfirmSubProjectsPageContent />
    </NotificationProvider>
  );
}
