import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotifications } from '../../../../components/Notifications/NotificationSystem';

/**
 * Hook personnalisé pour gérer les données et opérations des projets
 * Partagé entre tous les composants de gestion de projet
 */
export const useProjectData = () => {
  const { addNotification } = useNotifications();
  
  // États
  const [projects, setProjects] = useState([]);
  const [sousProjects, setSousProjects] = useState([]);
  const [availableComponents, setAvailableComponents] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  
  // États de chargement
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingSousProjects, setLoadingSousProjects] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [selectedProject, setSelectedProject] = useState(null);

  // Fonction de notification
  const showNotification = useCallback((type, message, options = {}) => {
    if (type === 'success') {
      addNotification('success', message, options);
    } else if (type === 'error') {
      addNotification('error', message, options);
    } else {
      addNotification('info', message, options);
    }
  }, [addNotification]);

  // Récupérer tous les projets
  const fetchProjects = useCallback(async () => {
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
        showNotification('error', '❌ Erreur lors de la récupération des projets');
      }
    } catch (error) {
      showNotification('error', '❌ Erreur de connexion au serveur');
      console.error('Erreur:', error);
    } finally {
      setLoadingProjects(false);
    }
  }, [showNotification]);

  // Récupérer les utilisateurs
  const fetchUsers = useCallback(async () => {
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
      console.error('Erreur fetchUsers:', error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Récupérer les composants
  const fetchComponents = useCallback(async () => {
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
  }, []);

  // Récupérer les sous-projets d'un projet
  const fetchSousProjects = useCallback(async (projectId) => {
    if (!projectId) {
      setSousProjects([]);
      return;
    }
    
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
  }, []);

  // Confirmer un sous-projet
  const confirmSousProjet = useCallback(async (sousProjetId) => {
    try {
      const response = await fetch(`http://localhost:8089/PI/PI/sousprojets/confirm/${sousProjetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        showNotification('success', '✅ Sous-projet confirmé avec succès !');
        if (selectedProject) {
          fetchSousProjects(selectedProject.id);
        }
        return true;
      } else {
        showNotification('error', '❌ Erreur lors de la confirmation');
        return false;
      }
    } catch (error) {
      showNotification('error', '❌ Erreur de connexion au serveur');
      console.error('Erreur:', error);
      return false;
    }
  }, [selectedProject, fetchSousProjects, showNotification]);

  // Supprimer un sous-projet
  const deleteSousProjet = useCallback(async (sousProjetId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce sous-projet ?')) {
      return false;
    }

    try {
      const response = await fetch(`http://localhost:8089/PI/PI/sousprojets/delete/${sousProjetId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        showNotification('success', '✅ Sous-projet supprimé avec succès !');
        if (selectedProject) {
          fetchSousProjects(selectedProject.id);
        }
        return true;
      } else {
        showNotification('error', '❌ Erreur lors de la suppression');
        return false;
      }
    } catch (error) {
      showNotification('error', '❌ Erreur de connexion au serveur');
      console.error('Erreur:', error);
      return false;
    }
  }, [selectedProject, fetchSousProjects, showNotification]);

  // Statistiques précalculées
  const statistics = useMemo(() => {
    const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
    const totalSousProjetsBudget = sousProjects.reduce((sum, sp) => sum + (sp.totalPrice || 0), 0);
    const totalSpent = sousProjects.reduce((sum, sp) => {
      const coutReel = sp.components ? 
        sp.components.reduce((compSum, comp) => compSum + (parseFloat(comp.prix) || 0), 0) : 0;
      return sum + coutReel;
    }, 0);
    const totalProjects = projects.length;
    const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    
    return { totalBudget, totalSousProjetsBudget, totalSpent, totalProjects, budgetPercentage };
  }, [projects, sousProjects]);

  // Sous-projets avec statistiques précalculées
  const sousProjectsWithStats = useMemo(() => {
    return sousProjects.map(sp => {
      const budgetAlloue = sp.totalPrice || 0;
      const coutReel = sp.components ? 
        sp.components.reduce((sum, comp) => sum + (parseFloat(comp.prix) || 0), 0) : 0;
      const depassement = coutReel > budgetAlloue;
      const pourcentageUtilise = budgetAlloue > 0 ? (coutReel / budgetAlloue) * 100 : 0;
      
      return {
        ...sp,
        stats: { budgetAlloue, coutReel, depassement, pourcentageUtilise }
      };
    });
  }, [sousProjects]);

  // Charger les données au montage
  useEffect(() => {
    fetchProjects();
    fetchUsers();
    fetchComponents();
  }, [fetchProjects, fetchUsers, fetchComponents]);

  return {
    // États
    projects,
    sousProjects,
    availableComponents,
    availableUsers,
    selectedProject,
    
    // États de chargement
    loadingProjects,
    loadingSousProjects,
    loadingComponents,
    loadingUsers,
    
    // Setters
    setSelectedProject,
    
    // Actions
    fetchProjects,
    fetchUsers,
    fetchComponents,
    fetchSousProjects,
    confirmSousProjet,
    deleteSousProjet,
    showNotification,
    
    // Données calculées
    statistics,
    sousProjectsWithStats
  };
};
