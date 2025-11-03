/**
 * Index des exports du module Gestion de Projet
 * Architecture modulaire avec pages séparées
 */

// Pages séparées - Chaque page est indépendante
export { default as CreateProjectPage } from './CreateProjectPage';
export { default as ManageProjectsPage } from './ManageProjectsPage';
export { default as SubProjectsPage } from './SubProjectsPage';
export { default as ConfirmSubProjectsPage } from './ConfirmSubProjectsPage';
export { default as AnalyticsProjectPage } from './AnalyticsProjectPage';

// Export par défaut - Page de création
export { default } from './CreateProjectPage';

// Composants individuels (pour réutilisation si besoin)
export { default as CreateProject } from './CreateProject';
export { default as ManageProjects } from './ManageProjects';
export { default as SubProjects } from './SubProjects';
export { default as ConfirmSubProjects } from './ConfirmSubProjects';

// Hook personnalisé
export { useProjectData } from './hooks/useProjectData';

/**
 * Exemples d'utilisation:
 * 
 * // Import des pages complètes
 * import { CreateProjectPage, ManageProjectsPage } from 'views/admin/projet';
 * 
 * // Import de composants individuels
 * import { CreateProject, ManageProjects } from 'views/admin/projet';
 * 
 * // Import du hook
 * import { useProjectData } from 'views/admin/projet';
 */
