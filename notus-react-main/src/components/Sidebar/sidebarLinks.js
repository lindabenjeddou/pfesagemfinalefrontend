import { PERMISSIONS, USER_ROLES } from '../../contexts/SecurityContext';

// Fonction pour retourner tous les liens de la sidebar (pour les admins)
const getAllSidebarLinks = (t) => {
  return [
    {
      title: t('sidebar.section.administration', 'Administration'),
      items: [
        { to: "/admin/profile", icon: "fas fa-user", label: t('sidebar.profile', 'Mon Profil') },
        { to: "/admin/settings", icon: "fas fa-tools", label: t('sidebar.user_management', 'Gestion des Utilisateurs') },
        { to: "/admin/component", icon: "fas fa-cogs", label: 'gestion des composants' },
        { to: "/admin/testeurs", icon: "fas fa-tasks", label: 'gestion des testeurs' },
      ],
    },
    {
      title: t('sidebar.section.dashboards', '📊 Tableaux de bord'),
      items: [
        { to: "/admin/predictive-kpi", icon: "fas fa-chart-area", label: t('sidebar.predictive_kpi', 'Tableau de Bord KPI (predictive kpi)') },
        { to: "/admin/analytics", icon: "fas fa-chart-line", label: t('sidebar.analytics', 'Analytics Dashboard') },
        { to: "/admin/enhanced-analytics", icon: "fas fa-chart-pie", label: t('sidebar.enhanced_analytics', 'Analytics Avancé') },
        { to: "/admin/advanced-analytics", icon: "fas fa-robot", label: t('sidebar.advanced_analytics', 'Analytics IA Avancé') },
        { to: "/admin/magasinier", icon: "fas fa-warehouse", label: t('sidebar.warehouse_dashboard', 'Dashboard Magasinier') },
      ],
    },
    {
      title: t('sidebar.section.projects', '📈 Projets & Sous-projets'),
      items: [
        { to: "/admin/projet/create", icon: "fas fa-plus-circle", label: t('sidebar.create_project', '➕ Créer un Projet') },
        { to: "/admin/projet/manage", icon: "fas fa-list-alt", label: t('sidebar.manage_projects', '📊 Gérer les Projets') },
        { to: "/admin/projet/subprojects", icon: "fas fa-sitemap", label: 'Sous-projets' },
        { to: "/admin/projet/confirm", icon: "fas fa-check-double", label: t('sidebar.confirm_subprojects', '✅ Confirmation') },
        { to: "/admin/projet/analytics", icon: "fas fa-chart-line", label: t('sidebar.project_analytics', '📈 Analytics') },
      ],
    },
    {
      title: t('sidebar.section.interventions_group', '🛠️ Interventions'),
      items: [
        { to: "/admin/interventions", icon: "fas fa-clipboard-list", label: 'Interventions' },
        { to: "/admin/AddIntervention", icon: "fas fa-plus-circle", label: 'Ajouter Intervention' },
        { to: "/admin/validation-interventions", icon: "fas fa-check-double", label: 'Validation Interventions' },
        { to: "/admin/assign-intervention", icon: "fas fa-user-plus", label: 'Assigner Intervention' },
        { to: "/admin/historique-testeur", icon: "fas fa-history", label: 'Historique Testeur' },
        { to: "/admin/technician-schedule", icon: "fas fa-calendar-check", label: 'Emploi du Temps' },
      ],
    },
    {
      title: t('sidebar.section.work_orders', '📋 Bons de Travail'),
      items: [
        { to: "/admin/listebont", icon: "fas fa-list-alt", label: 'Liste des Bons de Travail' },
        { to: "/admin/create-bon-travail", icon: "fas fa-plus-square", label: 'Créer Bon de Travail' },
      ],
    },
    {
      title: t('sidebar.section.planning', 'Planning & Calendrier'),
      items: [
        { to: "/admin/maps", icon: "fas fa-map-marked", label: 'Planning' },
      ],
    },
    {
      title: t('sidebar.section.notifications_system', 'Systéme de notification'),
      items: [
        { to: "/admin/notifications-center", icon: "fas fa-bell", label: 'Notifications' },
        { to: "/admin/test-notifications", icon: "fas fa-vial", label: 'Test Système' },
        { to: "/admin/integration-test", icon: "fas fa-flask", label: "Test d'Intégration" },
      ],
    },
  ];
};

// Fonction pour générer les liens de la sidebar selon les permissions utilisateur
export const getSidebarLinks = (userRole, userPermissions, t = (key, fallback) => fallback || key) => {
  console.log('🔍 getSidebarLinks appelé avec:', { userRole, userPermissions });
  
  // Si l'utilisateur est Admin, il voit tout
  if (userRole === USER_ROLES.ADMIN || userRole === 'ADMIN') {
    console.log('👑 Utilisateur Admin détecté - accès complet');
    const allLinks = getAllSidebarLinks(t);
    console.log('📋 Liens retournés pour Admin:', allLinks);
    return allLinks;
  }
  
  // MODE DEBUG DÉSACTIVÉ - Filtrage par permissions activé ✅
  console.log('✅ FILTRAGE PAR PERMISSIONS ACTIVÉ pour le rôle:', userRole);

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

  // Configuration spécifique pour le rôle MAGASINIER
  if (userRole === USER_ROLES.MAGASINIER || userRole === 'MAGASINIER') {
    return [
      {
        title: t('sidebar.section.dashboard', '🏠 Dashboard'),
        items: [
          { to: '/admin/magasinier', icon: 'fas fa-warehouse', label: t('sidebar.warehouse_dashboard', 'Dashboard Magasinier') },
          { to: '/admin/profile', icon: 'fas fa-user', label: t('sidebar.profile', 'Mon Profil') },
        ],
      },
      {
        title: t('sidebar.section.components', '📦 Composants'),
        items: [
          { to: '/admin/component', icon: 'fas fa-cogs', label: t('sidebar.components', 'Composants') },
          { to: '/admin/testeurs', icon: 'fas fa-tasks', label: t('sidebar.testers', 'Testeurs') },
          { to: '/admin/validation-commandes', icon: 'fas fa-check-circle', label: t('sidebar.validation_orders', 'Validation Commandes Moderne') },
        ],
      },
      {
        title: t('sidebar.section.work_orders', '📋 Bons de Travail'),
        items: [
          { to: '/admin/listebont', icon: 'fas fa-list-alt', label: t('sidebar.work_orders', 'Liste des Bons de Travail') },
        ],
      },
      {
        title: t('sidebar.section.interventions', '🛠️ Interventions'),
        items: [
          { to: '/admin/interventions', icon: 'fas fa-clipboard-list', label: t('sidebar.interventions', 'Liste des interventions') },
        ],
      },
      {
        title: t('sidebar.section.notifications', '🔔 Notifications'),
        items: [
          { to: '/admin/notifications-center', icon: 'fas fa-bell', label: t('sidebar.notifications_center', 'Centre Notifications') },
        ],
      },
    ];
  }

  // Configuration spécifique pour les rôles Technicien (Curatif / Préventif)
  if (
    userRole === USER_ROLES.TECHNICIEN || userRole === 'TECHNICIEN' ||
    userRole === USER_ROLES.TECHNICIEN_CURATIF || userRole === 'TECHNICIEN_CURATIF' ||
    userRole === USER_ROLES.TECHNICIEN_PREVENTIF || userRole === 'TECHNICIEN_PREVENTIF'
  ) {
    return [
      {
        title: t('sidebar.section.dashboards', '📊 Tableaux de bord'),
        items: [
          { to: '/admin/profile', icon: 'fas fa-user', label: t('sidebar.profile', 'Mon Profil') },
          { to: '/admin/predictive-kpi', icon: 'fas fa-chart-area', label: t('sidebar.predictive_kpi', 'Tableau de Bord KPI (predictive kpi)') },
          { to: '/admin/analytics', icon: 'fas fa-chart-line', label: t('sidebar.analytics', 'Analytics Dashboard') },
        ],
      },
      {
        title: t('sidebar.section.interventions_group', '🛠️ Interventions'),
        items: [
          { to: '/admin/interventions', icon: 'fas fa-clipboard-list', label: t('sidebar.interventions', 'Liste des interventions') },
          { to: '/admin/AddIntervention', icon: 'fas fa-plus-circle', label: t('sidebar.add_intervention', 'Ajouter intervention') },
          { to: '/admin/technician-schedule', icon: 'fas fa-calendar-check', label: t('sidebar.technician_schedule', 'Emploi du Temps') },
        ],
      },
      {
        title: t('sidebar.section.work_orders', '📋 Bons de Travail'),
        items: [
          { to: '/admin/listebont', icon: 'fas fa-file-alt', label: t('sidebar.work_orders', 'Liste des bons') },
          { to: '/admin/create-bon-travail', icon: 'fas fa-plus-square', label: t('sidebar.create_work_order', 'Créer Bon de Travail') },
        ],
      },
      {
        title: t('sidebar.section.planning', '📅 Planning & Calendrier'),
        items: [
          { to: '/admin/maps', icon: 'fas fa-map-marked', label: t('sidebar.planning', 'Planning') },
        ],
      },
    ];
  }

  // Définition complète de tous les liens avec leurs permissions requises
  const allLinks = [
    {
      title: '📊 Tableaux de bord',
      permission: null,
      items: [
        { to: "/admin/profile", icon: "fas fa-user", label: "Mon Profil", permission: null },
        { to: "/admin/predictive-kpi", icon: "fas fa-chart-area", label: "Tableau de Bord KPI (predictive kpi)", permission: "view_predictive_kpi" },
        { to: "/admin/analytics", icon: "fas fa-chart-line", label: "Analytics Dashboard", permission: null },
        { to: "/admin/enhanced-analytics", icon: "fas fa-chart-pie", label: "Analytics Avancés", permission: null },
        { to: "/admin/advanced-analytics", icon: "fas fa-robot", label: "Analytics IA Avancé", permission: null },
        { to: "/admin/magasinier", icon: "fas fa-warehouse", label: "Dashboard Magasinier", permission: null },
      ],
    },
    {
      title: '📈 Projets & Sous-projets',
      permission: "view_project",
      items: [
        { to: "/admin/projet/create", icon: "fas fa-plus-circle", label: "➕ Créer un Projet", permission: "create_project" },
        { to: "/admin/projet/manage", icon: "fas fa-list-alt", label: "📊 Gérer les Projets", permission: "view_project" },
        { to: "/admin/projet/subprojects", icon: "fas fa-sitemap", label: "🔗 Sous-projets", permission: "create_subproject" },
        { to: "/admin/projet/confirm", icon: "fas fa-check-double", label: "✅ Confirmation", permission: "confirm_subproject" },
        { to: "/admin/projet/analytics", icon: "fas fa-chart-line", label: "📈 Analytics", permission: "view_analytics" },
      ],
    },
    {
      title: '🛠️ Interventions',
      permission: null,
      items: [
        { to: "/admin/interventions", icon: "fas fa-clipboard-list", label: "Liste des interventions", permission: null },
        { to: "/admin/AddIntervention", icon: "fas fa-plus-circle", label: "Ajouter intervention", permission: null },
        { to: "/admin/validation-interventions", icon: "fas fa-check-double", label: "Validation Interventions", permission: "validate_intervention" },
        { to: "/admin/assign-intervention", icon: "fas fa-user-plus", label: "Assigner Intervention", permission: "assign_intervention" },
        { to: "/admin/historique-testeur", icon: "fas fa-history", label: "Historique Testeur", permission: null },
        { to: "/admin/technician-schedule", icon: "fas fa-calendar-check", label: "Emploi du Temps", permission: null },
      ],
    },
    {
      title: '📋 Bons de Travail',
      permission: null,
      items: [
        { to: "/admin/listebont", icon: "fas fa-file-alt", label: "Liste des bons", permission: null },
        { to: "/admin/create-bon-travail", icon: "fas fa-plus-square", label: "Créer Bon de Travail", permission: null },
        { to: "/admin/technicien-bons-travail", icon: "fas fa-clipboard-check", label: "Mes Bons de Travail", permission: null },
      ],
    },
    {
      title: '📅 Planning & Calendrier',
      permission: null,
      items: [
        { to: "/admin/maps", icon: "fas fa-map-marked", label: "Planning", permission: null },
        { to: "/admin/tables", icon: "fas fa-table", label: "Calendrier", permission: null },
      ],
    },
  ];

  // Filtrer les sections selon les permissions
  let filteredLinks = allLinks.filter(section => {
    // Si la section n'a pas de permission requise, elle est accessible à tous
    if (!section.permission) {
      console.log(`✅ Section "${section.title}" accessible à tous`);
      return true;
    }
    
    // Vérifier si l'utilisateur a la permission pour cette section
    const hasAccess = hasPermission(section.permission);
    console.log(`${hasAccess ? '✅' : '❌'} Section "${section.title}" - Permission: ${section.permission} - Accès: ${hasAccess}`);
    return hasAccess;
  }).map(section => {
    // Filtrer les items de chaque section selon les permissions
    const filteredItems = section.items.filter(item => {
      // Si l'item n'a pas de permission requise, il est accessible
      if (!item.permission) return true;
      
      // Vérifier si l'utilisateur a la permission pour cet item
      const hasItemAccess = hasPermission(item.permission);
      console.log(`  ${hasItemAccess ? '✅' : '❌'} Item "${item.label}" - Permission: ${item.permission}`);
      return hasItemAccess;
    });

    // Règle spécifique: masquer certains éléments Notifications pour CHEF_SECTEUR
    let adjustedItems = filteredItems;
    if (userRole === USER_ROLES.CHEF_SECTEUR || userRole === 'CHEF_SECTEUR') {
      const blockedForChefSecteur = new Set([
        '/admin/notifications-center',
        '/admin/test-notifications',
        '/admin/validation-commandes',
        // Planning - Calendrier
        '/admin/tables',
        // Gamification & IA
        '/admin/gamification',
        '/admin/intelligent-scheduler',
        '/admin/ai-assistant',
      ]);
      adjustedItems = filteredItems.filter(it => !blockedForChefSecteur.has(it.to));
    }

    // Règle spécifique: masquer Notifications + Gamification + IA pour CHEF_PROJET
    if (userRole === USER_ROLES.CHEF_PROJET || userRole === 'CHEF_PROJET') {
      const blockedForChefProjet = new Set([
        '/admin/dashboard',
        '/admin/notifications-center',
        '/admin/test-notifications',
        '/admin/validation-commandes',
        // Planning - Calendrier
        '/admin/tables',
        // Mes Bons de Travail
        '/admin/technicien-bons-travail',
        // Gamification & IA
        '/admin/gamification',
        '/admin/intelligent-scheduler',
        '/admin/ai-assistant',
        // Emploi du Temps (technician schedule)
        '/admin/technician-schedule',
      ]);
      adjustedItems = adjustedItems.filter(it => !blockedForChefProjet.has(it.to));
    }

    return {
      ...section,
      items: adjustedItems
    };
  }).filter(section => section.items.length > 0); // Supprimer les sections vides

  // CHEF_PROJET et CHEF_SECTEUR: Administration d'abord (Mon Profil, Settings, Composants, Testeurs), puis Dashboards sans ces items
  if (userRole === USER_ROLES.CHEF_PROJET || userRole === 'CHEF_PROJET' ||
      userRole === USER_ROLES.CHEF_SECTEUR || userRole === 'CHEF_SECTEUR') {
    // Nettoyer la section Tableaux de bord des items à déplacer
    const dashboardsIndex = filteredLinks.findIndex(sec => sec.title && sec.title.includes('📊'));
    if (dashboardsIndex !== -1) {
      const cleanedItems = (filteredLinks[dashboardsIndex].items || []).filter(i => !['/admin/profile','/admin/component','/admin/testeurs'].includes(i.to));
      filteredLinks[dashboardsIndex] = { ...filteredLinks[dashboardsIndex], items: cleanedItems };
    }

    // Préfixer une section Administration personnalisée
    const adminSection = {
      title: 'Administration',
      items: [
        { to: '/admin/profile', icon: 'fas fa-user', label: 'Mon Profil' },
        { to: '/admin/settings', icon: 'fas fa-tools', label: 'Gestion des Utilisateurs' },
        { to: '/admin/component', icon: 'fas fa-cogs', label: 'gestion des Composants' },
        { to: '/admin/testeurs', icon: 'fas fa-tasks', label: 'gestion des Testeurs' },
      ],
    };
    filteredLinks = [adminSection, ...filteredLinks];
  }

  console.log('📋 Liens finaux après filtrage:', filteredLinks);
  return filteredLinks;
};

// Export par défaut pour compatibilité (liens vides si pas de permissions)
const links = [];

export default links;
