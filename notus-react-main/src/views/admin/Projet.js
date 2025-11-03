import React, { useState, useEffect, useMemo, useCallback } from "react";
import AnalyticsDashboard from "../../components/Analytics/AnalyticsDashboard";
import { NotificationProvider, useNotifications } from "../../components/Notifications/NotificationSystem";
import AdvancedPagination from "../../components/Pagination/AdvancedPagination";

function ProjectCardContent() {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    nomProjet: "",
    nomChefProjet: "",
    description: "",
    date: "",
    budget: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  // Removed old notification system - now using advanced NotificationSystem
  const [focusedField, setFocusedField] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
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
  
  // useEffect pour charger les données au démarrage - OPTIMISÉ
  useEffect(() => {
    console.log('🚀 useEffect exécuté - chargement des données...');
    fetchProjects();
    fetchUsers();
    fetchComponents();
  }, []); // Un seul useEffect au lieu de deux
  
  // OPTIMISÉ: Mémoriser les statistiques pour éviter les recalculs
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
  
  const { totalBudget, totalSousProjetsBudget, totalSpent, totalProjects, budgetPercentage } = statistics;

  // OPTIMISÉ: Précalculer les statistiques des sous-projets pour éviter calculs répétés dans le render
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction pour afficher les notifications avec le nouveau système
  const showNotification = (type, message) => {
    if (type === 'success') {
      addNotification('success', message);
    } else if (type === 'error') {
      addNotification('error', message);
    } else {
      addNotification('info', message);
    }
  };

  // Notifications avancées pour la gestion de projet
  const showProjectCreatedNotification = (projectName, budget) => {
    addNotification('success', `🎉 Projet "${projectName}" créé avec succès!`, {
      subtitle: `Budget alloué: ${budget} DT`,
      duration: 6000,
      sound: true
    });
  };

  const showBudgetAlertNotification = (projectName, budget) => {
    if (budget > 10000) {
      addNotification('warning', `⚠️ Budget élevé détecté!`, {
        subtitle: `Le projet "${projectName}" a un budget de ${budget} DT`,
        duration: 8000,
        sound: true
      });
    }
  };

  const showSousProjetConfirmationNotification = (sousProjetName) => {
    addNotification('success', `✅ Sous-projet confirmé!`, {
      subtitle: `"${sousProjetName}" est maintenant validé`,
      duration: 5000,
      sound: true
    });
  };

  // 🔔 Fonction pour notifier les magasiniers lors de la création d'un projet
  const notifyMagasiniersNewProject = async (projectData) => {
    try {
      console.log('🔔 Envoi de notification aux magasiniers pour nouveau projet:', projectData.projectName);
      
      const notificationData = {
        type: 'PROJECT_CREATED',
        title: 'Nouveau projet créé',
        message: `Le projet "${projectData.projectName}" a été créé avec un budget de ${projectData.budget} DT`,
        priority: 'NORMAL',
        projectName: projectData.projectName,
        budget: projectData.budget,
        description: projectData.description
      };

      const response = await fetch('http://localhost:8089/PI/PI/notifications/project-created', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        console.log('✅ Notifications envoyées aux magasiniers avec succès');
        showNotification('info', '📬 Magasiniers notifiés du nouveau projet');
      } else {
        console.warn('⚠️ Erreur lors de l\'envoi des notifications aux magasiniers:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications:', error);
    }
  };

  // 🔔 Fonction pour notifier les magasiniers lors de la création d'un sous-projet
  const notifyMagasiniersNewSousProjet = async (sousProjetData) => {
    try {
      console.log('🔔 Envoi de notification aux magasiniers pour nouveau sous-projet:', sousProjetData.sousProjetName);
      
      const notificationData = {
        type: 'SOUS_PROJET_CREATED',
        title: 'Nouveau sous-projet créé',
        message: `Le sous-projet "${sousProjetData.sousProjetName}" a été créé avec ${sousProjetData.componentCount} composant(s)`,
        priority: sousProjetData.componentCount > 0 ? 'HIGH' : 'NORMAL',
        projectName: sousProjetData.projectName,
        sousProjetName: sousProjetData.sousProjetName,
        componentCount: sousProjetData.componentCount,
        totalPrice: sousProjetData.totalPrice
      };

      const response = await fetch('http://localhost:8089/PI/PI/notifications/sous-projet-created', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      if (response.ok) {
        console.log('✅ Notifications sous-projet envoyées aux magasiniers avec succès');
        showNotification('info', '📬 Magasiniers notifiés du nouveau sous-projet');
      } else {
        console.warn('⚠️ Erreur lors de l\'envoi des notifications sous-projet aux magasiniers:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications sous-projet:', error);
    }
  };

  // OPTIMISÉ: Fonction pour récupérer tous les projets du backend avec useCallback
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
  }, []);

  // OPTIMISÉ: Fonction pour récupérer les utilisateurs disponibles avec useCallback
  const fetchUsers = useCallback(async () => {
    console.log('🔍 Début fetchUsers...');
    setLoadingUsers(true);
    try {
      console.log('📡 Appel API:', "http://localhost:8089/PI/user/all");
      const response = await fetch("http://localhost:8089/PI/user/all", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      console.log('📊 Statut réponse:', response.status, response.ok);
      if (response.ok) {
        const data = await response.json();
        console.log('👥 Données utilisateurs reçues:', data);
        console.log('📈 Nombre d\'utilisateurs:', data.length);
        setAvailableUsers(data);
        console.log('✅ availableUsers mis à jour');
      } else {
        console.error('❌ Erreur lors de la récupération des utilisateurs, statut:', response.status);
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('💥 Erreur fetchUsers:', error);
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
      console.log('🏁 Fin fetchUsers');
    }
  }, []);

  // OPTIMISÉ: Fonction pour récupérer les composants disponibles avec useCallback
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

  // OPTIMISÉ: Fonction pour récupérer les sous-projets d'un projet avec useCallback
  const fetchSousProjects = useCallback(async (projectId) => {
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

  // 🔔 Note: Les notifications aux magasiniers sont automatiquement gérées par le backend
  // lors de la création d'un sous-projet avec des composants. Aucune action manuelle nécessaire.

  // Fonction pour créer un sous-projet
  const handleSousProjetSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) {
      showNotification('error', '❌ Veuillez sélectionner un projet parent');
      return;
    }

    setIsLoading(true);
    // Vérifier qu'un utilisateur est sélectionné
    if (!selectedUser) {
      showNotification('error', '❌ Veuillez sélectionner un utilisateur responsable du sous-projet');
      setIsLoading(false);
      return;
    }

    const dataToSend = {
      sousProjetName: sousProjetForm.sousProjetName,
      description: sousProjetForm.description,
      totalPrice: parseFloat(sousProjetForm.totalPrice),
      components: selectedComponents.map(comp => comp.trartArticle), // IDs des composants sélectionnés
      users: [selectedUser.id] // Utiliser l'utilisateur sélectionné
    };

    try {
      console.log('🚀 CRÉATION SOUS-PROJET - URL appelée:', `http://localhost:8089/PI/sousprojets/create/${selectedProject.id}`);
      const response = await fetch(`http://localhost:8089/PI/PI/sousprojets/create/${selectedProject.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const createdSousProjet = await response.json();
        showNotification('success', '✅ Sous-projet créé avec succès !');
        
        // Calculer le prix total des composants sélectionnés
        const totalPrice = selectedComponents.reduce((total, comp) => {
          return total + (comp.prix * comp.quantite);
        }, 0);
        
        // Envoyer notification aux magasiniers
        await notifyMagasiniersNewSousProjet({
          sousProjetName: sousProjetForm.sousProjetName,
          projectName: selectedProject.nom,
          components: selectedComponents,
          demandeur: selectedUser?.nom || 'Utilisateur',
          totalPrice: totalPrice
        });
        
        // Sauvegarder dans le système de validation des commandes (données dynamiques)
        if (selectedComponents.length > 0) {
          const componentOrder = {
            id: `sp-${Date.now()}`, // ID unique basé sur timestamp
            sousProjetId: `SP-${Date.now()}`,
            sousProjetName: sousProjetForm.sousProjetName,
            projectName: selectedProject.nom,
            orderDate: new Date().toISOString(),
            status: 'PENDING',
            demandeur: selectedUser?.nom || 'Utilisateur',
            deliveryDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(), // +7 jours
            priority: 'NORMAL',
            totalPrice: totalPrice,
            components: selectedComponents.map((comp, index) => ({
              id: comp.id || index + 1,
              name: comp.nom,
              quantity: comp.quantite,
              unitPrice: comp.prix,
              totalPrice: comp.prix * comp.quantite,
              supplier: comp.fournisseur || 'Fournisseur Standard',
              reference: comp.reference || `REF-${comp.id || index}`,
              category: comp.categorie || 'Composants'
            }))
          };
          
          // Sauvegarder dans localStorage pour le système de validation
          const existingSousProjects = JSON.parse(localStorage.getItem('sousProjects') || '[]');
          const newSousProject = {
            id: componentOrder.sousProjetId,
            nom: sousProjetForm.sousProjetName,
            projectName: selectedProject.nom,
            dateCreation: new Date().toISOString(),
            statusCommande: 'PENDING',
            demandeur: selectedUser?.nom || 'Utilisateur',
            dateLivraison: componentOrder.deliveryDate,
            priorite: 'NORMAL',
            composants: selectedComponents.map(comp => ({
              id: comp.id,
              nom: comp.nom,
              quantite: comp.quantite,
              prix: comp.prix,
              fournisseur: comp.fournisseur || 'Fournisseur Standard',
              reference: comp.reference || `REF-${comp.id}`,
              categorie: comp.categorie || 'Composants'
            }))
          };
          
          existingSousProjects.push(newSousProject);
          localStorage.setItem('sousProjects', JSON.stringify(existingSousProjects));
          
          console.log('📦 Sous-projet sauvegardé pour validation magasinier:', newSousProject);
        }
        
        showNotification('success', '✅ Sous-projet créé avec succès !');
        if (selectedComponents.length > 0) {
          showNotification('info', `📦 ${selectedComponents.length} composant(s) commandé(s) - En attente de validation magasinier`);
        }
        
        setSousProjetForm({ sousProjetName: '', description: '', totalPrice: '' });
        setSelectedComponents([]); // Réinitialiser la sélection des composants
        setSelectedUser(null); // Réinitialiser la sélection d'utilisateur
        // Recharger les sous-projets et composants (pour voir le stock mis à jour)
        fetchSousProjects(selectedProject.id);
        fetchComponents(); // Recharger les composants pour voir le stock décrémenté
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

  // Fonction pour confirmer un sous-projet
  const confirmSousProjet = async (sousProjetId) => {
    try {
      const response = await fetch(`http://localhost:8089/PI/PI/sousprojets/confirm/${sousProjetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        showNotification('success', '✅ Sous-projet confirmé avec succès !');
        // Recharger les sous-projets
        if (selectedProject) {
          fetchSousProjects(selectedProject.id);
        }
      } else {
        showNotification('error', '❌ Erreur lors de la confirmation');
      }
    } catch (error) {
      showNotification('error', '❌ Erreur de connexion au serveur');
      console.error('Erreur:', error);
    }
  };

  // Fonction pour supprimer un sous-projet
  const deleteSousProjet = async (sousProjetId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce sous-projet ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8089/PI/PI/sousprojets/delete/${sousProjetId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        showNotification('success', '✅ Sous-projet supprimé avec succès !');
        // Recharger les sous-projets
        if (selectedProject) {
          fetchSousProjects(selectedProject.id);
        }
      } else {
        showNotification('error', '❌ Erreur lors de la suppression');
      }
    } catch (error) {
      showNotification('error', '❌ Erreur de connexion au serveur');
      console.error('Erreur:', error);
    }
  };

  // SUPPRIMÉ: useEffect dupliqué (déjà présent ligne 37)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const dataToSend = {
      projectName: formData.nomProjet,
      projectManagerName: formData.nomChefProjet,
      description: formData.description,
      budget: parseFloat(formData.budget),
      date: formData.date, // Envoyer comme string, le backend convertira
      components: []
    };
    
    console.log('📤 Données envoyées au backend:', dataToSend);

    try {
      const response = await fetch("http://localhost:8089/PI/PI/projects/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Projet créé avec succès:', result);
        
        // Utiliser les nouvelles notifications avancées
        showProjectCreatedNotification(formData.nomProjet, formData.budget);
        showBudgetAlertNotification(formData.nomProjet, parseFloat(formData.budget));
        
        // 🔔 Notifier les magasiniers du nouveau projet
        await notifyMagasiniersNewProject({
          projectName: formData.nomProjet,
          budget: parseFloat(formData.budget),
          description: formData.description,
          projectManagerName: formData.nomChefProjet
        });
        
        setFormData({
          nomProjet: "",
          nomChefProjet: "",
          description: "",
          date: "",
          budget: ""
        });
        fetchProjects(); // Recharger la liste des projets
      } else {
        // Obtenir plus de détails sur l'erreur
        const errorText = await response.text();
        console.error('❌ Erreur lors de la création du projet:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        showNotification('error', `❌ Erreur lors de la création du projet (${response.status}): ${response.statusText}`);
      }
    } catch (error) {
      showNotification('error', ' Erreur de connexion au serveur');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, fetchProjects]);

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(248,250,252,1) 100%)', padding: '2rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,48,97,0.1)', border: '1px solid rgba(0,48,97,0.1)', overflow: 'hidden', animation: 'fadeIn 0.5s ease-out' }}>
            
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)', padding: '1.5rem 2rem', color: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.8rem' }}>🚀</span>
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Gestion des Projets</h1>
                  <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>🏢 Plateforme Sagemcom</p>
                </div>
              </div>
            </div>

            {/* Navigation par onglets */}
            <div style={{
              display: 'flex',
              borderBottom: '2px solid #e5e7eb',
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
              <button
                onClick={() => setActiveTab('create')}
                style={{
                  padding: '1rem 2rem',
                  border: 'none',
                  background: activeTab === 'create' ? '#003061' : 'transparent',
                  color: activeTab === 'create' ? 'white' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '8px 8px 0 0',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem'
                }}
              >
                ➕ Créer un Projet
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                style={{
                  padding: '1rem 2rem',
                  border: 'none',
                  background: activeTab === 'manage' ? '#003061' : 'transparent',
                  color: activeTab === 'manage' ? 'white' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '8px 8px 0 0',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem'
                }}
              >
                📊 Gestion des Projets
              </button>
              <button
                onClick={() => setActiveTab('subprojects')}
                style={{
                  padding: '1rem 2rem',
                  border: 'none',
                  background: activeTab === 'subprojects' ? '#003061' : 'transparent',
                  color: activeTab === 'subprojects' ? 'white' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '8px 8px 0 0',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem'
                }}
              >
                🔗 Sous-projets
              </button>
              <button
                onClick={() => setActiveTab('confirmation')}
                style={{
                  padding: '1rem 2rem',
                  border: 'none',
                  background: activeTab === 'confirmation' ? '#003061' : 'transparent',
                  color: activeTab === 'confirmation' ? 'white' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '8px 8px 0 0',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem'
                }}
              >
                ✅ Confirmation des Sous-projets
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                style={{
                  padding: '1rem 2rem',
                  border: 'none',
                  background: activeTab === 'analytics' ? '#003061' : 'transparent',
                  color: activeTab === 'analytics' ? 'white' : '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '8px 8px 0 0',
                  transition: 'all 0.3s ease',
                  fontSize: '1rem'
                }}
              >
                📈 Analytics Dashboard
              </button>
            </div>

            {/* Notifications are now handled by the NotificationSystem component */}

            {/* Contenu des onglets */}
            <div style={{ padding: '2rem' }}>
              {activeTab === 'create' && (
                <div style={{ animation: 'slideDown 0.3s ease-out' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{
                      background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      margin: '0 0 0.5rem 0'
                    }}>
                      📋 Informations du Projet
                    </h2>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      Remplissez les détails de votre nouveau projet
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '1.5rem',
                      marginBottom: '2rem'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '0.5rem'
                        }}>
                          🏗️ Nom du Projet
                        </label>
                        <input
                          type="text"
                          name="nomProjet"
                          value={formData.nomProjet}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('nomProjet')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Entrez le nom du projet"
                          required
                          style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            border: focusedField === 'nomProjet' ? '2px solid #003061' : '2px solid rgba(0,48,97,0.1)',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            background: focusedField === 'nomProjet' ? 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(255,255,255,1) 100%)' : 'rgba(255,255,255,0.8)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: focusedField === 'nomProjet' ? 'translateY(-2px)' : 'translateY(0)',
                            boxShadow: focusedField === 'nomProjet' ? '0 10px 25px rgba(0,48,97,0.15)' : '0 4px 6px rgba(0,0,0,0.05)',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '0.5rem'
                        }}>
                          👨‍💼 Chef de Projet
                        </label>
                        <input
                          type="text"
                          name="nomChefProjet"
                          value={formData.nomChefProjet}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('nomChefProjet')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="Nom du chef de projet"
                          required
                          style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            border: focusedField === 'nomChefProjet' ? '2px solid #003061' : '2px solid rgba(0,48,97,0.1)',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            background: focusedField === 'nomChefProjet' ? 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(255,255,255,1) 100%)' : 'rgba(255,255,255,0.8)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: focusedField === 'nomChefProjet' ? 'translateY(-2px)' : 'translateY(0)',
                            boxShadow: focusedField === 'nomChefProjet' ? '0 10px 25px rgba(0,48,97,0.15)' : '0 4px 6px rgba(0,0,0,0.05)',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '0.5rem'
                        }}>
                          📅 Date de Début
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('date')}
                          onBlur={() => setFocusedField(null)}
                          required
                          style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            border: focusedField === 'date' ? '2px solid #003061' : '2px solid rgba(0,48,97,0.1)',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            background: focusedField === 'date' ? 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(255,255,255,1) 100%)' : 'rgba(255,255,255,0.8)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: focusedField === 'date' ? 'translateY(-2px)' : 'translateY(0)',
                            boxShadow: focusedField === 'date' ? '0 10px 25px rgba(0,48,97,0.15)' : '0 4px 6px rgba(0,0,0,0.05)',
                            outline: 'none'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: '#374151',
                          marginBottom: '0.5rem'
                        }}>
                          💰 Budget Estimé
                        </label>
                        <input
                          type="number"
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('budget')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="En Dinars"
                          min="0"
                          required
                          style={{
                            width: '100%',
                            padding: '0.875rem 1rem',
                            border: focusedField === 'budget' ? '2px solid #003061' : '2px solid rgba(0,48,97,0.1)',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            background: focusedField === 'budget' ? 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(255,255,255,1) 100%)' : 'rgba(255,255,255,0.8)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: focusedField === 'budget' ? 'translateY(-2px)' : 'translateY(0)',
                            boxShadow: focusedField === 'budget' ? '0 10px 25px rgba(0,48,97,0.15)' : '0 4px 6px rgba(0,0,0,0.05)',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        📝 Description du Projet
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('description')}
                        onBlur={() => setFocusedField(null)}
                        rows="4"
                        placeholder="Décrivez les objectifs et détails du projet"
                        required
                        style={{
                          width: '100%',
                          padding: '0.875rem 1rem',
                          border: focusedField === 'description' ? '2px solid #003061' : '2px solid rgba(0,48,97,0.1)',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          background: focusedField === 'description' ? 'linear-gradient(135deg, rgba(0,48,97,0.05) 0%, rgba(255,255,255,1) 100%)' : 'rgba(255,255,255,0.8)',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: focusedField === 'description' ? 'translateY(-2px)' : 'translateY(0)',
                          boxShadow: focusedField === 'description' ? '0 10px 25px rgba(0,48,97,0.15)' : '0 4px 6px rgba(0,0,0,0.05)',
                          outline: 'none',
                          resize: 'vertical',
                          minHeight: '100px'
                        }}
                      />
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                          background: isLoading ? 'linear-gradient(135deg, rgba(0,48,97,0.6) 0%, rgba(0,120,212,0.6) 100%)' : 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '1rem 2.5rem',
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isLoading ? 'scale(0.98)' : 'scale(1)',
                          boxShadow: isLoading ? '0 4px 15px rgba(0,48,97,0.2)' : '0 10px 25px rgba(0,48,97,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          margin: '0 auto',
                          minWidth: '200px'
                        }}
                      >
                        {isLoading ? (
                          <>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              border: '2px solid rgba(255,255,255,0.3)',
                              borderTop: '2px solid white',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }} />
                            Création en cours...
                          </>
                        ) : (
                          <>✨ Créer le Projet</>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'manage' && (
                <div style={{ animation: 'slideDown 0.3s ease-out' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{
                      background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      margin: '0 0 0.5rem 0'
                    }}>
                      💰 Suivi des Dépenses
                    </h2>
                    <p style={{ color: '#6b7280', margin: 0 }}>
                      Visualisez et suivez les dépenses de vos projets
                    </p>
                  </div>

                  {/* Cartes de statistiques */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
                      color: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>📊</span>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Projets Actifs</h3>
                      </div>
                      <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
                        {totalProjects}
                      </p>
                    </div>

                    <div style={{
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      color: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🎯</span>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Budget Total</h3>
                      </div>
                      <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
                        {totalBudget.toLocaleString()} DT
                      </p>
                    </div>

                    <div style={{
                      background: budgetPercentage > 80 
                        ? 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)'
                        : 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                      color: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>📈</span>
                        <h3 style={{ margin: 0, fontSize: '1rem' }}>Utilisation</h3>
                      </div>
                      <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>
                        {budgetPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Progression du budget</span>
                      <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                        {totalSpent.toLocaleString()} / {totalBudget.toLocaleString()} DT
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '12px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '6px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(budgetPercentage, 100)}%`,
                        height: '100%',
                        background: budgetPercentage > 90
                          ? 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)'
                          : budgetPercentage > 80
                          ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
                          : 'linear-gradient(90deg, #059669 0%, #10b981 100%)',
                        transition: 'width 0.5s ease-in-out'
                      }} />
                    </div>
                  </div>

                  {/* Liste des projets */}
                  <div>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '1rem'
                    }}>
                      📋 Liste des Projets ({totalProjects})
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
                    ) : projects.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '3rem 2rem',
                        background: '#f9fafb',
                        borderRadius: '12px',
                        border: '2px dashed #d1d5db'
                      }}>
                        <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>📁</span>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>Aucun projet trouvé</h4>
                        <p style={{ margin: 0, color: '#6b7280' }}>Créez votre premier projet pour commencer !</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        {projects.map((project) => (
                          <div
                            key={project.id}
                            style={{
                              background: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '1.5rem',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer'
                            }}
                            onClick={() => {
                              setSelectedProject(project);
                              setActiveTab('subprojects');
                              fetchSousProjects(project.id);
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{
                                  margin: '0 0 0.5rem 0',
                                  fontSize: '1.1rem',
                                  fontWeight: '600',
                                  color: '#003061'
                                }}>
                                  🚀 {project.projectName}
                                </h4>
                                <div style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '1rem',
                                  fontSize: '0.875rem',
                                  color: '#6b7280',
                                  marginBottom: '0.5rem'
                                }}>
                                  <span>👨‍💼 {project.projectManagerName}</span>
                                  <span>📅 {new Date(project.date).toLocaleDateString('fr-FR')}</span>
                                </div>
                                {project.description && (
                                  <p style={{
                                    margin: '0.5rem 0 0 0',
                                    fontSize: '0.9rem',
                                    color: '#4b5563',
                                    lineHeight: '1.4'
                                  }}>
                                    📝 {project.description}
                                  </p>
                                )}
                              </div>
                              <div style={{ textAlign: 'right', marginLeft: '1rem' }}>
                                <p style={{
                                  margin: 0,
                                  fontSize: '1.2rem',
                                  fontWeight: 'bold',
                                  color: '#059669'
                                }}>
                                  💰 {project.budget ? project.budget.toLocaleString() : '0'} DT
                                </p>
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: '#6b7280',
                                  background: '#f3f4f6',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  marginTop: '0.5rem',
                                  display: 'inline-block'
                                }}>
                                  ID: {project.id}
                                </span>
                                <div style={{
                                  marginTop: '0.5rem',
                                  fontSize: '0.75rem',
                                  color: '#0078d4',
                                  fontWeight: '600'
                                }}>
                                  🔗 Cliquer pour voir les sous-projets
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Onglet Sous-projets */}
              {activeTab === 'subprojects' && (
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
                          if (project) {
                            fetchSousProjects(project.id);
                          } else {
                            setSousProjects([]);
                          }
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
                      {/* Formulaire de création de sous-projet */}
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
                          
                          {/* Sélection de l'utilisateur responsable */}
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
                                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Chargement des utilisateurs...</span>
                              </div>
                            ) : availableUsers.length === 0 ? (
                              <div style={{
                                padding: '1rem',
                                textAlign: 'center',
                                background: '#fef3f2',
                                borderRadius: '8px',
                                border: '1px solid #fecaca',
                                color: '#dc2626'
                              }}>
                                ⚠️ Aucun utilisateur disponible
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
                                <option value="">-- Sélectionner un utilisateur --</option>
                                {availableUsers.map(user => (
                                  <option key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName} ({user.role || 'Utilisateur'})
                                  </option>
                                ))}
                              </select>
                            )}
                            
                            {/* Affichage de l'utilisateur sélectionné */}
                            {selectedUser && (
                              <div style={{
                                marginTop: '0.5rem',
                                padding: '0.75rem',
                                background: '#eff6ff',
                                borderRadius: '8px',
                                border: '1px solid #bfdbfe',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}>
                                <span style={{ fontSize: '1.25rem' }}>👤</span>
                                <div>
                                  <div style={{
                                    fontWeight: '600',
                                    color: '#003061',
                                    fontSize: '0.875rem'
                                  }}>
                                    {selectedUser.firstName} {selectedUser.lastName}
                                  </div>
                                  <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280'
                                  }}>
                                    Rôle: {selectedUser.role || 'Utilisateur'} | Email: {selectedUser.email || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Sélection des composants */}
                          <div>
                            <label style={{
                              display: 'block',
                              marginBottom: '0.5rem',
                              fontWeight: '600',
                              color: '#374151'
                            }}>
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
                              padding: '0.75rem 1.5rem',
                              background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '1rem',
                              fontWeight: '600',
                              cursor: isLoading ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s ease'
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
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{
                            fontSize: '1.2rem',
                            fontWeight: '600',
                            color: '#003061',
                            marginBottom: '0.5rem'
                          }}>
                            📋 Sous-projets de "{selectedProject.projectName}"
                          </h4>
                          {sousProjects.length > 0 && (
                            <div style={{
                              background: '#f8fafc',
                              padding: '0.75rem',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              color: '#6b7280'
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
                        </div>
                        
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
                            {sousProjectsWithStats.map((sousProjet) => {
                              // OPTIMISÉ: Utiliser les statistiques précalculées
                              const { budgetAlloue, coutReel, depassement, pourcentageUtilise } = sousProjet.stats;
                              
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
                                    
                                    {/* Actions */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '120px' }}>
                                      {sousProjet.confirmed === 0 && (
                                        <button
                                          onClick={() => confirmSousProjet(sousProjet.id)}
                                          style={{
                                            padding: '0.5rem 1rem',
                                            background: 'linear-gradient(135deg, #059669, #10b981)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                          }}
                                          title="Confirmer le sous-projet"
                                        >
                                          ✅ Confirmer
                                        </button>
                                      )}
                                      <button
                                        onClick={() => deleteSousProjet(sousProjet.id)}
                                        style={{
                                          padding: '0.5rem 1rem',
                                          background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '6px',
                                          fontSize: '0.875rem',
                                          fontWeight: '600',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s ease'
                                        }}
                                        title="Supprimer le sous-projet"
                                      >
                                        🗑️ Supprimer
                                      </button>
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
              )}

              {/* Onglet Confirmation des Sous-projets */}
              {activeTab === 'confirmation' && (
                <div style={{ padding: '2rem' }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #003061 0%, #0078d4 100%)',
                    padding: '2rem',
                    borderRadius: '16px',
                    marginBottom: '2rem',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Éléments décoratifs flottants */}
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '20px',
                      width: '60px',
                      height: '60px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      animation: 'float 3s ease-in-out infinite'
                    }} />
                    <div style={{
                      position: 'absolute',
                      bottom: '15px',
                      left: '30px',
                      width: '40px',
                      height: '40px',
                      background: 'rgba(255,255,255,0.08)',
                      borderRadius: '50%',
                      animation: 'float 4s ease-in-out infinite reverse'
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          fontSize: '2.5rem',
                          animation: 'pulse 2s infinite'
                        }}>✅</div>
                        <div>
                          <h2 style={{
                            margin: 0,
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            animation: 'slideInLeft 0.8s ease-out'
                          }}>
                            Confirmation des Sous-projets
                          </h2>
                          <p style={{
                            margin: '0.5rem 0 0 0',
                            fontSize: '1.1rem',
                            color: 'rgba(255,255,255,0.9)',
                            animation: 'slideInLeft 0.8s ease-out 0.2s both'
                          }}>
                            🏢 Interface Chef de Projet - Validation des Sous-projets
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sélection du projet pour confirmation */}
                  <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    marginBottom: '2rem',
                    border: '1px solid rgba(0,48,97,0.1)'
                  }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: '#003061',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      🎯 Sélectionner un Projet à Valider
                    </h3>
                    
                    <div style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <label style={{
                        display: 'block',
                        marginBottom: '0.75rem',
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '1rem'
                      }}>
                        🏗️ Projet Parent
                      </label>
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
                          border: '2px solid #d1d5db',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          background: 'white',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#003061';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0,48,97,0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                        }}
                      >
                        <option value="">-- Choisir un projet à valider --</option>
                        {projects.map(project => {
                          const sousProjectsCount = sousProjects.filter(sp => sp.project?.id === project.id).length;
                          const pendingCount = sousProjects.filter(sp => sp.project?.id === project.id && sp.confirmed === 0).length;
                          return (
                            <option key={project.id} value={project.id}>
                              {project.projectName} - Budget: {project.budget?.toLocaleString() || '0'} DT
                              {pendingCount > 0 && ` (${pendingCount} en attente)`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Liste des sous-projets à confirmer */}
                  {selectedProject && (
                    <div style={{
                      background: 'white',
                      padding: '2rem',
                      borderRadius: '16px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(0,48,97,0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2rem'
                      }}>
                        <h3 style={{
                          fontSize: '1.5rem',
                          fontWeight: '600',
                          color: '#003061',
                          margin: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          📋 Sous-projets de "{selectedProject.projectName}"
                        </h3>
                        <div style={{
                          display: 'flex',
                          gap: '1rem',
                          fontSize: '0.875rem'
                        }}>
                          <span style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontWeight: '600'
                          }}>
                            ✅ Confirmés: {sousProjects.filter(sp => sp.confirmed === 1).length}
                          </span>
                          <span style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontWeight: '600'
                          }}>
                            ⏳ En attente: {sousProjects.filter(sp => sp.confirmed === 0).length}
                          </span>
                        </div>
                      </div>

                      {loadingSousProjects ? (
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
                          <p style={{
                            color: '#6b7280',
                            fontSize: '1.1rem',
                            margin: 0
                          }}>Chargement des sous-projets...</p>
                        </div>
                      ) : sousProjects.length === 0 ? (
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
                            Ce projet ne contient pas encore de sous-projets à valider.
                          </p>
                        </div>
                      ) : (
                        <div style={{
                          display: 'grid',
                          gap: '1.5rem'
                        }}>
                          {sousProjectsWithStats.map((sousProjet, index) => {
                            // OPTIMISÉ: Utiliser les statistiques précalculées
                            const { budgetAlloue, coutReel, depassement, pourcentageUtilise } = sousProjet.stats;
                            
                            return (
                              <div
                                key={sousProjet.id}
                                style={{
                                  background: sousProjet.confirmed === 1 ? 
                                    'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(5,150,105,0.05) 100%)' :
                                    'linear-gradient(135deg, rgba(245,158,11,0.05) 0%, rgba(217,119,6,0.05) 100%)',
                                  border: sousProjet.confirmed === 1 ? 
                                    '2px solid rgba(16,185,129,0.2)' : 
                                    '2px solid rgba(245,158,11,0.2)',
                                  borderRadius: '16px',
                                  padding: '2rem',
                                  transition: 'all 0.3s ease',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                }}
                              >
                                {/* Badge de statut */}
                                <div style={{
                                  position: 'absolute',
                                  top: '1rem',
                                  right: '1rem',
                                  background: sousProjet.confirmed === 1 ? 
                                    'linear-gradient(135deg, #10b981, #059669)' :
                                    'linear-gradient(135deg, #f59e0b, #d97706)',
                                  color: 'white',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '20px',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}>
                                  {sousProjet.confirmed === 1 ? '✅ Confirmé' : '⏳ En attente'}
                                </div>

                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: '2fr 1fr',
                                  gap: '2rem',
                                  alignItems: 'start'
                                }}>
                                  {/* Informations du sous-projet */}
                                  <div>
                                    <h4 style={{
                                      fontSize: '1.3rem',
                                      fontWeight: '700',
                                      color: '#003061',
                                      marginBottom: '1rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem'
                                    }}>
                                      🎯 {sousProjet.sousProjetName}
                                    </h4>
                                    
                                    {sousProjet.description && (
                                      <p style={{
                                        color: '#4b5563',
                                        fontSize: '1rem',
                                        lineHeight: '1.6',
                                        marginBottom: '1.5rem',
                                        background: 'rgba(255,255,255,0.7)',
                                        padding: '1rem',
                                        borderRadius: '8px'
                                      }}>
                                        📝 {sousProjet.description}
                                      </p>
                                    )}

                                    {/* Informations budgétaires */}
                                    <div style={{
                                      background: 'rgba(255,255,255,0.8)',
                                      padding: '1.5rem',
                                      borderRadius: '12px',
                                      marginBottom: '1.5rem'
                                    }}>
                                      <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '1rem',
                                        marginBottom: '1rem'
                                      }}>
                                        <div>
                                          <span style={{
                                            fontSize: '0.875rem',
                                            color: '#6b7280',
                                            display: 'block',
                                            marginBottom: '0.25rem'
                                          }}>💰 Budget Alloué</span>
                                          <span style={{
                                            fontSize: '1.2rem',
                                            fontWeight: '700',
                                            color: '#003061'
                                          }}>
                                            {budgetAlloue.toLocaleString()} DT
                                          </span>
                                        </div>
                                        <div>
                                          <span style={{
                                            fontSize: '0.875rem',
                                            color: '#6b7280',
                                            display: 'block',
                                            marginBottom: '0.25rem'
                                          }}>💸 Coût Réel</span>
                                          <span style={{
                                            fontSize: '1.2rem',
                                            fontWeight: '700',
                                            color: depassement ? '#dc2626' : '#059669'
                                          }}>
                                            {coutReel.toLocaleString()} DT
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* Barre de progression budgétaire */}
                                      <div style={{
                                        background: '#e5e7eb',
                                        borderRadius: '10px',
                                        height: '12px',
                                        overflow: 'hidden',
                                        marginBottom: '0.5rem'
                                      }}>
                                        <div style={{
                                          background: depassement ? 
                                            'linear-gradient(90deg, #dc2626, #ef4444)' :
                                            'linear-gradient(90deg, #10b981, #059669)',
                                          height: '100%',
                                          width: `${Math.min(pourcentageUtilise, 100)}%`,
                                          transition: 'width 0.8s ease-in-out',
                                          borderRadius: '10px'
                                        }} />
                                      </div>
                                      
                                      <div style={{
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: depassement ? '#dc2626' : '#059669',
                                        textAlign: 'center'
                                      }}>
                                        {depassement ? (
                                          <span>⚠️ Dépassement: +{(coutReel - budgetAlloue).toLocaleString()} DT ({pourcentageUtilise.toFixed(1)}%)</span>
                                        ) : (
                                          <span>✅ Économie: -{(budgetAlloue - coutReel).toLocaleString()} DT ({pourcentageUtilise.toFixed(1)}%)</span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Composants */}
                                    {sousProjet.components && sousProjet.components.length > 0 && (
                                      <div style={{
                                        background: 'rgba(255,255,255,0.8)',
                                        padding: '1.5rem',
                                        borderRadius: '12px'
                                      }}>
                                        <h5 style={{
                                          fontSize: '1rem',
                                          fontWeight: '600',
                                          color: '#374151',
                                          marginBottom: '1rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem'
                                        }}>
                                          🔧 Composants Associés ({sousProjet.components.length})
                                        </h5>
                                        <div style={{
                                          display: 'grid',
                                          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                          gap: '0.75rem'
                                        }}>
                                          {sousProjet.components.map((comp, idx) => (
                                            <div key={idx} style={{
                                              background: 'white',
                                              padding: '0.75rem',
                                              borderRadius: '8px',
                                              border: '1px solid #e5e7eb',
                                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                                            }}>
                                              <div style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                color: '#374151',
                                                marginBottom: '0.25rem'
                                              }}>
                                                {comp.trartDesignation || comp.trartArticle}
                                              </div>
                                              <div style={{
                                                fontSize: '0.75rem',
                                                color: '#059669',
                                                fontWeight: '600'
                                              }}>
                                                💰 {parseFloat(comp.prix || 0).toLocaleString()} DT
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Actions de confirmation */}
                                  <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    alignItems: 'stretch'
                                  }}>
                                    {sousProjet.confirmed === 0 ? (
                                      <button
                                        onClick={() => confirmSousProjet(sousProjet.id)}
                                        style={{
                                          padding: '1rem 1.5rem',
                                          background: 'linear-gradient(135deg, #10b981, #059669)',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '12px',
                                          fontSize: '1rem',
                                          fontWeight: '600',
                                          cursor: 'pointer',
                                          transition: 'all 0.3s ease',
                                          boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          gap: '0.5rem'
                                        }}
                                        onMouseEnter={(e) => {
                                          e.target.style.transform = 'translateY(-2px)';
                                          e.target.style.boxShadow = '0 8px 20px rgba(16,185,129,0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.target.style.transform = 'translateY(0)';
                                          e.target.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
                                        }}
                                      >
                                        ✅ Confirmer le Sous-projet
                                      </button>
                                    ) : (
                                      <div style={{
                                        padding: '1rem 1.5rem',
                                        background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1))',
                                        border: '2px solid rgba(16,185,129,0.3)',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        color: '#059669',
                                        fontWeight: '600'
                                      }}>
                                        ✅ Déjà Confirmé
                                      </div>
                                    )}
                                    
                                    <button
                                      onClick={() => deleteSousProjet(sousProjet.id)}
                                      style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-1px)';
                                        e.target.style.boxShadow = '0 6px 16px rgba(220,38,38,0.4)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(220,38,38,0.3)';
                                      }}
                                    >
                                      🗑️ Supprimer
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Onglet Analytics Dashboard */}
              {activeTab === 'analytics' && (
                <div style={{ animation: 'fadeInUp 0.6s ease-out' }}>
                  <AnalyticsDashboard 
                    projects={projects} 
                    sousProjects={sousProjects} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Wrapper component avec NotificationProvider
export default function ProjectCard() {
  return (
    <NotificationProvider>
      <ProjectCardContent />
    </NotificationProvider>
  );
}
