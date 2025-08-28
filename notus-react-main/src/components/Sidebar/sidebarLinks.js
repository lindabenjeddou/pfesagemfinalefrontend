import { PERMISSIONS, USER_ROLES } from '../../contexts/SecurityContext';

// Fonction pour retourner tous les liens de la sidebar (pour les admins)
const getAllSidebarLinks = () => {
  return [
    {
      title: "🏠 Dashboard",
      items: [
        { to: "/admin/dashboard", icon: "fas fa-tv", label: "Dashboard" },
        { to: "/admin/profile", icon: "fas fa-user", label: "Mon Profil" },
      ],
    },
    {
      title: "📈 Gestion de Projets",
      items: [
        { to: "/admin/projet", icon: "fas fa-project-diagram", label: "Projets" },
        { to: "/admin/sousprojet", icon: "fas fa-sitemap", label: "Sous-projets" },
      ],
    },
    {
      title: "🔧 Gestion des Interventions",
      items: [
        { to: "/admin/interventions", icon: "fas fa-tools", label: "Interventions" },
        { to: "/admin/addintervention", icon: "fas fa-plus-circle", label: "Ajouter Intervention" },
        { to: "/admin/listebont", icon: "fas fa-list-alt", label: "Liste des Bons de Travail" },
        { to: "/admin/bont", icon: "fas fa-file-alt", label: "Bon de Travail" },
      ],
    },
    {
      title: "📦 Gestion des Composants",
      items: [
        { to: "/admin/component", icon: "fas fa-cogs", label: "Composants" },
        { to: "/admin/magasinier", icon: "fas fa-warehouse", label: "Dashboard Magasinier" },
      ],
    },
    {
      title: "📅 Planning & Calendrier",
      items: [
        { to: "/admin/maps", icon: "fas fa-map-marked", label: "Planning" },
        { to: "/admin/tables", icon: "fas fa-table", label: "Calendrier" },
      ],
    },
    {
      title: "📈 Analytics & Rapports",
      items: [
        { to: "/admin/analytics", icon: "fas fa-chart-line", label: "Analytics Dashboard" },
        { to: "/admin/predictive-kpi", icon: "fas fa-brain", label: "KPI Prédictif" },
        { to: "/admin/enhanced-analytics", icon: "fas fa-chart-pie", label: "Analytics Avancé" },
        { to: "/admin/advanced-analytics", icon: "fas fa-robot", label: "Analytics IA Avancé" },
      ],
    },
    {
      title: "🔔 Notifications",
      items: [
        { to: "/admin/notifications-center", icon: "fas fa-bell", label: "Centre Notifications" },
        { to: "/admin/magasinier", icon: "fas fa-warehouse", label: "Dashboard Magasinier" },
        { to: "/admin/test-notifications", icon: "fas fa-vial", label: "Test Système" },
      ],
    },
    {
      title: "📱 Modules Mobiles",
      items: [
        { to: "/admin/mobile-app", icon: "fas fa-mobile-alt", label: "App Mobile Techniciens" },
        { to: "/admin/intelligent-scheduler", icon: "fas fa-calendar-alt", label: "Planificateur Intelligent" },
      ],
    },
    {
      title: "🎮 Gamification & IA",
      items: [
        { to: "/admin/gamification", icon: "fas fa-trophy", label: "Gamification" },
        { to: "/admin/ai-assistant", icon: "fas fa-robot", label: "Assistant IA" },
      ],
    },
    {
      title: "⚙️ Administration",
      items: [
        { to: "/admin/settings", icon: "fas fa-tools", label: "Gestion des Utilisateurs" },
        { to: "/admin/integration-test", icon: "fas fa-vial", label: "Test d'Intégration" },
      ],
    },
  ];
};

// Fonction pour générer les liens de la sidebar selon les permissions utilisateur
export const getSidebarLinks = (userRole, userPermissions) => {
  console.log('🔍 getSidebarLinks appelé avec:', { userRole, userPermissions });
  
  // Si l'utilisateur est Admin, il voit tout
  if (userRole === USER_ROLES.ADMIN || userRole === 'ADMIN') {
    console.log('👑 Utilisateur Admin détecté - accès complet');
    return getAllSidebarLinks();
  }

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (permission) => {
    // Si c'est un admin, donner accès à tout
    if (userRole === USER_ROLES.ADMIN || userRole === 'ADMIN') return true;
    // Vérifier que userPermissions existe et est un tableau
    if (!userPermissions || !Array.isArray(userPermissions)) {
      console.warn('⚠️ userPermissions est undefined ou invalide:', userPermissions);
      return false;
    }
    const hasAccess = userPermissions.includes(permission);
    console.log(`🔐 Permission check: ${permission} for role ${userRole} = ${hasAccess}`);
    console.log('📋 Available permissions:', userPermissions);
    return hasAccess;
  };

  // Définition complète de tous les liens avec leurs permissions requises
  const allLinks = [
    {
      title: "🏠 Dashboard",
      permission: null, // Accessible à tous les utilisateurs connectés
      items: [
        { to: "/admin/dashboard", icon: "fas fa-tv", label: "Dashboard", permission: null },
        { to: "/admin/profile", icon: "fas fa-user", label: "Mon Profil", permission: null },
      ],
    },
    {
      title: "📊 Gestion de Projets",
      permission: "view_project",
      items: [
        { to: "/admin/projet", icon: "fas fa-project-diagram", label: "Projets", permission: "view_project" },
        { to: "/admin/sousprojet", icon: "fas fa-sitemap", label: "Sous-projets", permission: "view_subproject" },
      ],
    },
    {
      title: "🔧 Composants & Stock",
      permission: "manage_stock",
      items: [
        { to: "/admin/component", icon: "fas fa-cubes", label: "Composants", permission: "manage_stock" },
        { to: "/admin/magasinier", icon: "fas fa-warehouse", label: "Dashboard Magasinier", permission: "manage_stock" },
      ],
    },
    {
      title: "🔔 Notifications",
      permission: null, // Accessible à tous les utilisateurs connectés
      items: [
        { to: "/admin/notifications-center", icon: "fas fa-bell", label: "Centre Notifications", permission: null },
        { to: "/admin/magasinier", icon: "fas fa-warehouse", label: "Dashboard Magasinier", permission: "manage_stock" },
        { to: "/admin/test-notifications", icon: "fas fa-vial", label: "Test Système", permission: null },
        { to: "/admin/component-orders", icon: "fas fa-check-circle", label: "Validation Commandes", permission: null },
      ],
    },
    {
      title: "📋 Bons de Travail",
      permission: "create_intervention",
      items: [
        { to: "/admin/listebont", icon: "fas fa-file-alt", label: "Liste des bons", permission: "create_intervention" },
        { to: "/admin/bont", icon: "fas fa-plus-square", label: "Nouveau bon", permission: "create_intervention" },
      ],
    },
    {
      title: "🛠️ Interventions",
      permission: "create_intervention",
      items: [
        { to: "/admin/interventions", icon: "fas fa-clipboard-list", label: "Liste des interventions", permission: "create_intervention" },
        { to: "/admin/AddIntervention", icon: "fas fa-plus-circle", label: "Ajouter intervention", permission: "create_intervention" },
      ],
    },
    {
      title: "📈 Analytics & Rapports",
      permission: "view_analytics",
      items: [
        { to: "/admin/enhanced-analytics", icon: "fas fa-chart-bar", label: "Analytics Avancés", permission: "view_enhanced_analytics" },
        { to: "/admin/predictive-kpi", icon: "fas fa-chart-line", label: "KPI Prédictifs", permission: "view_predictive_kpi" },
      ],
    },
    {
      title: "📱 Mobile & Terrain",
      permission: "access_mobile_app",
      items: [
        { to: "/admin/technician-mobile", icon: "fas fa-mobile-alt", label: "App Techniciens", permission: "access_mobile_app" },
      ],
    },
    {
      title: "🎮 Gamification",
      permission: "view_gamification",
      items: [
        { to: "/admin/gamification", icon: "fas fa-trophy", label: "Dashboard Gamification", permission: "view_gamification" },
      ],
    },
    {
      title: "🤖 Intelligence Artificielle",
      permission: "use_ai_assistant",
      items: [
        { to: "/admin/intelligent-scheduler", icon: "fas fa-brain", label: "Planificateur IA", permission: "use_intelligent_scheduler" },
      ],
    },
    {
      title: "⚙️ Administration",
      permission: "edit_user", // Réservé aux admins
      items: [
        { to: "/admin/settings", icon: "fas fa-tools", label: "Paramètres", permission: "edit_user" },
        { to: "/admin/tables", icon: "fas fa-table", label: "Tables", permission: "edit_user" },
        { to: "/admin/maps", icon: "fas fa-map-marked", label: "Cartes", permission: "edit_user" },
        { to: "/admin/integration-test", icon: "fas fa-flask", label: "Test d'Intégration", permission: "edit_user" },
      ],
    },
  ];

  // Filtrer les sections selon les permissions
  const filteredLinks = allLinks.filter(section => {
    // Si la section n'a pas de permission requise, elle est accessible à tous
    if (!section.permission) return true;
    
    // Vérifier si l'utilisateur a la permission pour cette section
    return hasPermission(section.permission);
  }).map(section => {
    // Filtrer les items de chaque section selon les permissions
    const filteredItems = section.items.filter(item => {
      // Si l'item n'a pas de permission requise, il est accessible
      if (!item.permission) return true;
      
      // Vérifier si l'utilisateur a la permission pour cet item
      return hasPermission(item.permission);
    });

    return {
      ...section,
      items: filteredItems
    };
  }).filter(section => section.items.length > 0); // Supprimer les sections vides

  return filteredLinks;
};

// Export par défaut pour compatibilité (liens vides si pas de permissions)
const links = [];

export default links;
