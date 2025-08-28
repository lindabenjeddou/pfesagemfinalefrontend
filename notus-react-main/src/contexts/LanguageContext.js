import React, { createContext, useContext, useState, useEffect } from 'react';
import { translationService } from '../services/translationService';

// Create Language Context
const LanguageContext = createContext();

// French translations (default)
const frenchTranslations = {
  // Navigation
  'nav.dashboard': 'Tableau de Bord',
  'nav.users': 'Utilisateurs',
  'nav.interventions': 'Interventions',
  'nav.workOrders': 'Bons de Travail',
  'nav.components': 'Composants',
  'nav.settings': 'Paramètres',
  'nav.profile': 'Profil',
  'nav.logout': 'Déconnexion',

  // Authentication
  'auth.login': 'Connexion',
  'auth.register': 'Inscription',
  'auth.email': 'Email',
  'auth.password': 'Mot de passe',
  'auth.firstName': 'Prénom',
  'auth.lastName': 'Nom',
  'auth.role': 'Rôle',
  'auth.phone': 'Téléphone',
  'auth.address': 'Adresse',
  'auth.login.title': 'Connexion Sécurisée',
  'auth.login.subtitle': '🏢 Plateforme Sagemcom',
  'auth.login.button': '🚀 Se Connecter',
  'auth.register.title': 'Créer un Compte',
  'auth.register.subtitle': '🏢 Rejoignez la Plateforme Sagemcom',
  'auth.register.button': '🚀 Créer mon compte',
  'auth.register.success': 'Compte créé avec succès !',
  'auth.register.hasAccount': 'Déjà un compte ?',
  'auth.ssl': '🔒 Connexion SSL Sécurisée',

  // Work Orders (Bons de Travail)
  'workOrder.title': 'Bon de Travail',
  'workOrder.subtitle': 'Gestion des Bons de Travail',
  'workOrder.description': '📝 Description',
  'workOrder.dateCreation': '📅 Date Création',
  'workOrder.dateDebut': '🚀 Date Début',
  'workOrder.dateFin': '🏁 Date Fin',
  'workOrder.status': '📊 Statut',
  'workOrder.technician': '👨‍🔧 Technicien',
  'workOrder.components': '🔧 Composants',
  'workOrder.generate': 'Générer BT',
  'workOrder.close': 'Clôturer BT',
  'workOrder.search': 'Rechercher des composants...',
  'workOrder.instruction': 'Tapez pour rechercher et sélectionner des composants',
  'workOrder.success': 'Opération réussie !',
  'workOrder.error': 'Une erreur est survenue',
  'workOrder.list.title': 'Liste des Bons de Travail',
  'workOrder.list.subtitle': 'Gestion et Suivi des BT',

  // Interventions
  'intervention.title': 'Interventions',
  'intervention.subtitle': 'Gestion des Demandes d\'Intervention',
  'intervention.add.title': 'Nouvelle Intervention',
  'intervention.add.subtitle': 'Créer une Demande d\'Intervention',
  'intervention.add.button': '✨ Créer l\'Intervention',
  'intervention.type': 'Type',
  'intervention.priority': 'Priorité',
  'intervention.demandeur': 'Demandeur',
  'intervention.description': 'Description',
  'intervention.dateCreation': 'Date Création',
  'intervention.status': 'Statut',
  'intervention.actions': 'Actions',
  'intervention.success': 'Intervention créée avec succès !',
  'intervention.error': 'Erreur lors de la création',

  // Settings
  'settings.title': 'Paramètres Utilisateurs',
  'settings.subtitle': 'Gestion des Comptes et Permissions',
  'settings.filters': 'Filtres et Recherche',
  'settings.role.filter': 'Filtrer par rôle',
  'settings.search': 'Rechercher un utilisateur...',
  'settings.sort': 'Trier par',
  'settings.confirmation': 'Afficher seulement les confirmés',
  'settings.users.count': 'utilisateurs trouvés',
  'settings.edit': 'Modifier',
  'settings.delete': 'Supprimer',
  'settings.confirm': 'Confirmer',
  'settings.edit.title': 'Modifier l\'Utilisateur',
  'settings.save': 'Enregistrer',
  'settings.cancel': 'Annuler',
  'settings.success': 'Utilisateur mis à jour avec succès !',
  'settings.error': 'Erreur lors de la mise à jour',

  // Common
  'common.loading': 'Chargement...',
  'common.error': 'Erreur',
  'common.success': 'Succès',
  'common.cancel': 'Annuler',
  'common.save': 'Enregistrer',
  'common.delete': 'Supprimer',
  'common.edit': 'Modifier',
  'common.add': 'Ajouter',
  'common.search': 'Rechercher',
  'common.filter': 'Filtrer',
  'common.sort': 'Trier',
  'common.actions': 'Actions',
  'common.status': 'Statut',
  'common.date': 'Date',
  'common.name': 'Nom',
  'common.email': 'Email',
  'common.role': 'Rôle',
  'common.phone': 'Téléphone',
  'common.address': 'Adresse',
  'common.description': 'Description',
  'common.type': 'Type',
  'common.priority': 'Priorité',
  'common.close': 'Fermer',
  'common.open': 'Ouvrir',
  'common.view': 'Voir',
  'common.download': 'Télécharger',
  'common.upload': 'Téléverser',
  'common.next': 'Suivant',
  'common.previous': 'Précédent',
  'common.page': 'Page',
  'common.of': 'sur',
  'common.items': 'éléments',
  'common.per.page': 'par page',

  // Roles
  'role.admin': 'Administrateur',
  'role.magasinier': 'Magasinier',
  'role.chef.secteur': 'Chef de Secteur',
  'role.technicien.curatif': 'Technicien Curatif',
  'role.technicien.preventif': 'Technicien Préventif',

  // Status
  'status.pending': 'En attente',
  'status.in.progress': 'En cours',
  'status.completed': 'Terminé',
  'status.cancelled': 'Annulé',
  'status.confirmed': 'Confirmé',
  'status.unconfirmed': 'Non confirmé',

  // Landing Page
  'landing.hero.title': 'Plateforme de Gestion de Maintenance Sagemcom',
  'landing.hero.description': 'Gérez efficacement les interventions curatives et préventives, le stock des pièces de rechange, le planning des techniciens et les indicateurs de performance. Optimisez la maintenance grâce à une interface intuitive.',
  'landing.hero.button': 'Commencer',
  'landing.features.title': 'Fonctionnalités principales',
  'landing.features.subtitle': 'Une solution complète pour la gestion de la maintenance industrielle.',
  'landing.features.access': 'Accéder',
  'landing.features.users.title': 'Gestion des utilisateurs',
  'landing.features.users.description': 'Connexion sécurisée, attribution de rôles, gestion des comptes.',
  'landing.features.interventions.title': 'Interventions',
  'landing.features.interventions.description': 'Création, planification et suivi des DI curatives/préventives.',
  'landing.features.workOrders.title': 'Bon de travail',
  'landing.features.workOrders.description': 'Génération automatique à partir des DI, suivi de l\'exécution.',
  'landing.features.stock.title': 'Stock & PDR',
  'landing.features.stock.description': 'Commandes, seuils critiques, validation par le magasinier.',
  'landing.features.kpi.title': 'Indicateurs & KPI',
  'landing.features.kpi.description': 'Taux d\'exécution, MTTR, MTBF, performance des techniciens.',
  'landing.features.planning.title': 'Planning Techniciens',
  'landing.features.planning.description': 'Disponibilités, affectations et conflits évités automatiquement.',
  'landing.kpi.title': 'Indicateurs de Performance',
  'landing.kpi.mttr': 'MTTR',
  'landing.kpi.mtbf': 'MTBF',
  'landing.kpi.execution': 'Taux d\'exécution',
  'landing.kpi.stock': 'Rupture Stock',
  'landing.why.title': 'Pourquoi choisir notre plateforme ?',
  'landing.why.feature1': 'Interface intuitive adaptée à tous les rôles',
  'landing.why.feature2': 'Suivi en temps réel des interventions',
  'landing.why.feature3': 'Automatisation des bons de travail',
  'landing.why.feature4': 'Calcul automatique des KPI',
  'landing.why.demo': 'Demander une démo',

  // Profile Page
  'profile.connect': 'Se connecter',
  'profile.friends': 'Amis',
  'profile.photos': 'Photos',
  'profile.comments': 'Commentaires',
  'profile.name': 'Jenna Stones',
  'profile.location': 'Los Angeles, Californie',
  'profile.job': 'Gestionnaire de Solutions - Responsable Creative Tim',
  'profile.education': 'Université d\'Informatique',
  'profile.bio': 'Artiste aux talents variés, Jenna, nom adopté par Nick Murphy, né à Melbourne et basé à Brooklyn, écrit, interprète et enregistre toute sa propre musique, lui donnant une sensation chaleureuse et intime avec une structure rythmique solide. Un artiste aux talents considérables.',
  'profile.show_more': 'Voir plus',

  // Index Page
  'index.hero.title': 'Gestion de',
  'index.hero.title2': 'maintenance',
  'index.hero.subtitle': 'Optimisez vos opérations efficacement',
  'index.hero.cta': 'VOIR LES SERVICES',
  'index.about.badge': 'OPTIMISEZ VOTRE MAINTENANCE',
  'index.about.title': 'Une solution complète pour votre gestion',
  'index.about.description': 'Simplifiez la gestion de vos opérations de maintenance avec Sagemcom. Notre plateforme intelligente vous permet d\'optimiser vos processus, réduire les temps d\'arrêt et améliorer l\'efficacité de vos équipes.',
  'index.about.contact': 'Nous contacter',
  'index.about.image_alt': 'Dashboard maintenance industrielle',

  // Languages
  'language.french': 'Français',
  'language.english': 'English',
  'language.arabic': 'العربية',
  'language.select': 'Choisir la langue'
};

// English translations
const englishTranslations = {
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.users': 'Users',
  'nav.interventions': 'Interventions',
  'nav.workOrders': 'Work Orders',
  'nav.components': 'Components',
  'nav.settings': 'Settings',
  'nav.profile': 'Profile',
  'nav.logout': 'Logout',

  // Authentication
  'auth.login': 'Login',
  'auth.register': 'Register',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.firstName': 'First Name',
  'auth.lastName': 'Last Name',
  'auth.role': 'Role',
  'auth.phone': 'Phone',
  'auth.address': 'Address',
  'auth.login.title': 'Secure Login',
  'auth.login.subtitle': '🏢 Sagemcom Platform',
  'auth.login.button': '🚀 Sign In',
  'auth.register.title': 'Create Account',
  'auth.register.subtitle': '🏢 Join Sagemcom Platform',
  'auth.register.button': '🚀 Create Account',
  'auth.register.success': 'Account created successfully!',
  'auth.register.hasAccount': 'Already have an account?',
  'auth.ssl': '🔒 Secure SSL Connection',

  // Work Orders
  'workOrder.title': 'Work Order',
  'workOrder.subtitle': 'Work Order Management',
  'workOrder.description': '📝 Description',
  'workOrder.dateCreation': '📅 Creation Date',
  'workOrder.dateDebut': '🚀 Start Date',
  'workOrder.dateFin': '🏁 End Date',
  'workOrder.status': '📊 Status',
  'workOrder.technician': '👨‍🔧 Technician',
  'workOrder.components': '🔧 Components',
  'workOrder.generate': 'Generate WO',
  'workOrder.close': 'Close WO',
  'workOrder.search': 'Search components...',
  'workOrder.instruction': 'Type to search and select components',
  'workOrder.success': 'Operation successful!',
  'workOrder.error': 'An error occurred',
  'workOrder.list.title': 'Work Orders List',
  'workOrder.list.subtitle': 'WO Management and Tracking',

  // Interventions
  'intervention.title': 'Interventions',
  'intervention.subtitle': 'Intervention Request Management',
  'intervention.add.title': 'New Intervention',
  'intervention.add.subtitle': 'Create Intervention Request',
  'intervention.add.button': '✨ Create Intervention',
  'intervention.type': 'Type',
  'intervention.priority': 'Priority',
  'intervention.demandeur': 'Requester',
  'intervention.description': 'Description',
  'intervention.dateCreation': 'Creation Date',
  'intervention.status': 'Status',
  'intervention.actions': 'Actions',
  'intervention.success': 'Intervention created successfully!',
  'intervention.error': 'Error creating intervention',

  // Settings
  'settings.title': 'User Settings',
  'settings.subtitle': 'Account and Permission Management',
  'settings.filters': 'Filters and Search',
  'settings.role.filter': 'Filter by role',
  'settings.search': 'Search user...',
  'settings.sort': 'Sort by',
  'settings.confirmation': 'Show only confirmed',
  'settings.users.count': 'users found',
  'settings.edit': 'Edit',
  'settings.delete': 'Delete',
  'settings.confirm': 'Confirm',
  'settings.edit.title': 'Edit User',
  'settings.save': 'Save',
  'settings.cancel': 'Cancel',
  'settings.success': 'User updated successfully!',
  'settings.error': 'Error updating user',

  // Common
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.add': 'Add',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.sort': 'Sort',
  'common.actions': 'Actions',
  'common.status': 'Status',
  'common.date': 'Date',
  'common.name': 'Name',
  'common.email': 'Email',
  'common.role': 'Role',
  'common.phone': 'Phone',
  'common.address': 'Address',
  'common.description': 'Description',
  'common.type': 'Type',
  'common.priority': 'Priority',
  'common.close': 'Close',
  'common.open': 'Open',
  'common.view': 'View',
  'common.download': 'Download',
  'common.upload': 'Upload',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.page': 'Page',
  'common.of': 'of',
  'common.items': 'items',
  'common.per.page': 'per page',

  // Roles
  'role.admin': 'Administrator',
  'role.magasinier': 'Warehouse Manager',
  'role.chef.secteur': 'Sector Chief',
  'role.technicien.curatif': 'Curative Technician',
  'role.technicien.preventif': 'Preventive Technician',

  // Status
  'status.pending': 'Pending',
  'status.in.progress': 'In Progress',
  'status.completed': 'Completed',
  'status.cancelled': 'Cancelled',
  'status.confirmed': 'Confirmed',
  'status.unconfirmed': 'Unconfirmed',

  // Landing Page
  'landing.hero.title': 'Sagemcom Maintenance Management Platform',
  'landing.hero.description': 'Efficiently manage curative and preventive interventions, spare parts inventory, technician scheduling and performance indicators. Optimize maintenance through an intuitive interface.',
  'landing.hero.button': 'Get Started',
  'landing.features.title': 'Key Features',
  'landing.features.subtitle': 'A complete solution for industrial maintenance management.',
  'landing.features.access': 'Access',
  'landing.features.users.title': 'User Management',
  'landing.features.users.description': 'Secure login, role assignment, account management.',
  'landing.features.interventions.title': 'Interventions',
  'landing.features.interventions.description': 'Creation, planning and tracking of curative/preventive interventions.',
  'landing.features.workOrders.title': 'Work Orders',
  'landing.features.workOrders.description': 'Automatic generation from interventions, execution tracking.',
  'landing.features.stock.title': 'Stock & Spare Parts',
  'landing.features.stock.description': 'Orders, critical thresholds, warehouse manager validation.',
  'landing.features.kpi.title': 'Indicators & KPI',
  'landing.features.kpi.description': 'Execution rate, MTTR, MTBF, technician performance.',
  'landing.features.planning.title': 'Technician Planning',
  'landing.features.planning.description': 'Availability, assignments and conflicts automatically avoided.',
  'landing.kpi.title': 'Performance Indicators',
  'landing.kpi.mttr': 'MTTR',
  'landing.kpi.mtbf': 'MTBF',
  'landing.kpi.execution': 'Execution Rate',
  'landing.kpi.stock': 'Stock Shortage',
  'landing.why.title': 'Why choose our platform?',
  'landing.why.feature1': 'Intuitive interface adapted to all roles',
  'landing.why.feature2': 'Real-time intervention tracking',
  'landing.why.feature3': 'Work order automation',
  'landing.why.feature4': 'Automatic KPI calculation',
  'landing.why.demo': 'Request a Demo',

  // Profile Page
  'profile.connect': 'Connect',
  'profile.friends': 'Friends',
  'profile.photos': 'Photos',
  'profile.comments': 'Comments',
  'profile.name': 'Jenna Stones',
  'profile.location': 'Los Angeles, California',
  'profile.job': 'Solution Manager - Creative Tim Officer',
  'profile.education': 'University of Computer Science',
  'profile.bio': 'An artist of considerable range, Jenna the name taken by Melbourne-raised, Brooklyn-based Nick Murphy writes, performs and records all of his own music, giving it a warm, intimate feel with a solid groove structure. An artist of considerable range.',
  'profile.show_more': 'Show more',

  // Index Page
  'index.hero.title': 'Management of',
  'index.hero.title2': 'maintenance',
  'index.hero.subtitle': 'Optimize your operations efficiently',
  'index.hero.cta': 'VIEW SERVICES',
  'index.about.badge': 'OPTIMIZE YOUR MAINTENANCE',
  'index.about.title': 'A complete solution for your management',
  'index.about.description': 'Simplify the management of your maintenance operations with Sagemcom. Our intelligent platform allows you to optimize your processes, reduce downtime and improve the efficiency of your teams.',
  'index.about.contact': 'Get in touch',
  'index.about.image_alt': 'Industrial maintenance dashboard',

  // Languages
  'language.french': 'Français',
  'language.english': 'English',
  'language.arabic': 'العربية',
  'language.select': 'Select Language'
};

// Arabic translations
const arabicTranslations = {
  // Navigation
  'nav.dashboard': 'لوحة التحكم',
  'nav.users': 'المستخدمون',
  'nav.interventions': 'التدخلات',
  'nav.workOrders': 'أوامر العمل',
  'nav.components': 'المكونات',
  'nav.settings': 'الإعدادات',
  'nav.profile': 'الملف الشخصي',
  'nav.logout': 'تسجيل الخروج',

  // Authentication
  'auth.login': 'تسجيل الدخول',
  'auth.register': 'التسجيل',
  'auth.email': 'البريد الإلكتروني',
  'auth.password': 'كلمة المرور',
  'auth.firstName': 'الاسم الأول',
  'auth.lastName': 'اسم العائلة',
  'auth.role': 'الدور',
  'auth.phone': 'الهاتف',
  'auth.address': 'العنوان',
  'auth.login.title': 'تسجيل دخول آمن',
  'auth.login.subtitle': '🏢 منصة ساجيمكوم',
  'auth.login.button': '🚀 تسجيل الدخول',
  'auth.register.title': 'إنشاء حساب',
  'auth.register.subtitle': '🏢 انضم إلى منصة ساجيمكوم',
  'auth.register.button': '🚀 إنشاء حساب',
  'auth.register.success': 'تم إنشاء الحساب بنجاح!',
  'auth.register.hasAccount': 'لديك حساب بالفعل؟',
  'auth.ssl': '🔒 اتصال SSL آمن',

  // Work Orders
  'workOrder.title': 'أمر العمل',
  'workOrder.subtitle': 'إدارة أوامر العمل',
  'workOrder.description': '📝 الوصف',
  'workOrder.dateCreation': '📅 تاريخ الإنشاء',
  'workOrder.dateDebut': '🚀 تاريخ البداية',
  'workOrder.dateFin': '🏁 تاريخ الانتهاء',
  'workOrder.status': '📊 الحالة',
  'workOrder.technician': '👨‍🔧 الفني',
  'workOrder.components': '🔧 المكونات',
  'workOrder.generate': 'إنشاء أمر عمل',
  'workOrder.close': 'إغلاق أمر العمل',
  'workOrder.search': 'البحث عن المكونات...',
  'workOrder.instruction': 'اكتب للبحث واختيار المكونات',
  'workOrder.success': 'تمت العملية بنجاح!',
  'workOrder.error': 'حدث خطأ',
  'workOrder.list.title': 'قائمة أوامر العمل',
  'workOrder.list.subtitle': 'إدارة ومتابعة أوامر العمل',

  // Common
  'common.loading': 'جاري التحميل...',
  'common.error': 'خطأ',
  'common.success': 'نجح',
  'common.cancel': 'إلغاء',
  'common.save': 'حفظ',
  'common.delete': 'حذف',
  'common.edit': 'تعديل',
  'common.add': 'إضافة',
  'common.search': 'بحث',
  'common.filter': 'تصفية',
  'common.sort': 'ترتيب',
  'common.actions': 'الإجراءات',
  'common.status': 'الحالة',
  'common.date': 'التاريخ',
  'common.name': 'الاسم',
  'common.email': 'البريد الإلكتروني',
  'common.role': 'الدور',
  'common.phone': 'الهاتف',
  'common.address': 'العنوان',
  'common.description': 'الوصف',
  'common.type': 'النوع',
  'common.priority': 'الأولوية',

  // Languages
  'language.french': 'Français',
  'language.english': 'English',
  'language.arabic': 'العربية',
  'language.select': 'اختر اللغة'
};

// Available languages
const AVAILABLE_LANGUAGES = {
  fr: { name: 'Français', flag: '🇫🇷', translations: frenchTranslations },
  en: { name: 'English', flag: '🇺🇸', translations: englishTranslations },
  ar: { name: 'العربية', flag: '🇸🇦', translations: arabicTranslations }
};

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('fr'); // Default to French
  const [translations, setTranslations] = useState(frenchTranslations);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('sagemcom_language');
    if (savedLanguage && AVAILABLE_LANGUAGES[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
      setTranslations(AVAILABLE_LANGUAGES[savedLanguage].translations);
    }
  }, []);

  // Translation function
  const t = (key, defaultValue = key) => {
    return translations[key] || defaultValue;
  };

  // Change language function
  const changeLanguage = async (languageCode) => {
    if (!AVAILABLE_LANGUAGES[languageCode]) {
      console.warn(`Language ${languageCode} not supported`);
      return;
    }

    setIsLoading(true);
    
    try {
      // For external API translations (if needed)
      // const apiTranslations = await translationService.getTranslations(languageCode);
      
      // Use local translations
      const newTranslations = AVAILABLE_LANGUAGES[languageCode].translations;
      
      setCurrentLanguage(languageCode);
      setTranslations(newTranslations);
      
      // Save to localStorage
      localStorage.setItem('sagemcom_language', languageCode);
      
      // Update document direction for Arabic
      document.documentElement.dir = languageCode === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = languageCode;
      
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current language info
  const getCurrentLanguageInfo = () => {
    return AVAILABLE_LANGUAGES[currentLanguage] || AVAILABLE_LANGUAGES.fr;
  };

  // Get available languages list
  const getAvailableLanguages = () => {
    return Object.entries(AVAILABLE_LANGUAGES).map(([code, info]) => ({
      code,
      name: info.name,
      flag: info.flag
    }));
  };

  const contextValue = {
    currentLanguage,
    translations,
    isLoading,
    t,
    changeLanguage,
    getCurrentLanguageInfo,
    getAvailableLanguages,
    availableLanguages: AVAILABLE_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;