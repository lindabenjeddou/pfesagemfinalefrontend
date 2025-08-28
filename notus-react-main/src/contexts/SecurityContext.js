import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Constantes des rôles utilisateur (correspondant exactement au backend)
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MAGASINIER: 'MAGASINIER',
  CHEF_PROJET: 'CHEF_PROJET',
  TECHNICIEN_CURATIF: 'TECHNICIEN_CURATIF',
  TECHNICIEN_PREVENTIF: 'TECHNICIEN_PREVENTIF',
  CHEF_SECTEUR: 'CHEF_SECTEUR',
  SUPERVISEUR_PRODUCTION: 'SUPERVISEUR_PRODUCTION'
};

const PERMISSIONS = {
  // Gestion des projets
  CREATE_PROJECT: 'create_project',
  VIEW_PROJECT: 'view_project',
  EDIT_PROJECT: 'edit_project',
  DELETE_PROJECT: 'delete_project',
  CONFIRM_PROJECT: 'confirm_project',
  
  // Gestion des sous-projets
  CREATE_SUBPROJECT: 'create_subproject',
  VIEW_SUBPROJECT: 'view_subproject',
  EDIT_SUBPROJECT: 'edit_subproject',
  DELETE_SUBPROJECT: 'delete_subproject',
  CONFIRM_SUBPROJECT: 'confirm_subproject',
  
  // Gestion des utilisateurs
  CREATE_USER: 'create_user',
  VIEW_USER: 'view_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  CONFIRM_USER: 'confirm_user',
  
  // Analytics et rapports
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  VIEW_REPORTS: 'view_reports',
  
  // Gestion des stocks (PDR)
  MANAGE_STOCK: 'manage_stock',
  ORDER_PARTS: 'order_parts',
  VALIDATE_ORDERS: 'validate_orders',
  
  // Interventions
  CREATE_INTERVENTION: 'create_intervention',
  ASSIGN_INTERVENTION: 'assign_intervention',
  VALIDATE_INTERVENTION: 'validate_intervention',
  VIEW_INTERVENTIONS: 'view_interventions',
  EDIT_INTERVENTIONS: 'edit_interventions',
  
  // Advanced Modules Permissions
  VIEW_PREDICTIVE_KPI: 'view_predictive_kpi',
  VIEW_ENHANCED_ANALYTICS: 'view_enhanced_analytics',
  USE_INTELLIGENT_SCHEDULER: 'use_intelligent_scheduler',
  ACCESS_MOBILE_APP: 'access_mobile_app',
  VIEW_GAMIFICATION: 'view_gamification',
  MANAGE_GAMIFICATION: 'manage_gamification',
  USE_AI_ASSISTANT: 'use_ai_assistant'
};

// Matrice des permissions par rôle selon les spécifications métier
const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    ...Object.values(PERMISSIONS) // Admin a accès à tout
  ],
  [USER_ROLES.CHEF_PROJET]: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.CREATE_PROJECTS,
    PERMISSIONS.EDIT_PROJECTS,
    PERMISSIONS.DELETE_PROJECTS,
    PERMISSIONS.VIEW_SUBPROJECTS,
    PERMISSIONS.CREATE_SUBPROJECTS,
    PERMISSIONS.CONFIRM_SUBPROJECTS,
    PERMISSIONS.VIEW_WORK_ORDERS,
    PERMISSIONS.CREATE_WORK_ORDERS,
    PERMISSIONS.EDIT_WORK_ORDERS,
    PERMISSIONS.VIEW_INTERVENTIONS,
    PERMISSIONS.CREATE_INTERVENTIONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.VIEW_PREDICTIVE_KPI,
    PERMISSIONS.VIEW_ENHANCED_ANALYTICS,
    PERMISSIONS.VIEW_INTELLIGENT_SCHEDULER,
    PERMISSIONS.VIEW_GAMIFICATION,
    PERMISSIONS.VIEW_AI_ASSISTANT
  ],
  [USER_ROLES.CHEF_SECTEUR]: [
    // Chef de secteur - gestion d'équipe et supervision
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.EDIT_PROJECTS,
    PERMISSIONS.VIEW_SUBPROJECTS,
    PERMISSIONS.VIEW_WORK_ORDERS,
    PERMISSIONS.CREATE_WORK_ORDERS,
    PERMISSIONS.EDIT_WORK_ORDERS,
    PERMISSIONS.VIEW_INTERVENTIONS,
    PERMISSIONS.CREATE_INTERVENTIONS,
    PERMISSIONS.EDIT_INTERVENTIONS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_PREDICTIVE_KPI,
    PERMISSIONS.VIEW_ENHANCED_ANALYTICS,
    PERMISSIONS.VIEW_INTELLIGENT_SCHEDULER,
    PERMISSIONS.VIEW_GAMIFICATION,
    PERMISSIONS.VIEW_AI_ASSISTANT
  ],
  [USER_ROLES.TECHNICIEN_CURATIF]: [
    // Interventions curatives - accès complet
    PERMISSIONS.CREATE_INTERVENTION,
    PERMISSIONS.VIEW_INTERVENTIONS,
    PERMISSIONS.EDIT_INTERVENTIONS,
    PERMISSIONS.ASSIGN_INTERVENTION,
    PERMISSIONS.VALIDATE_INTERVENTION,
    
    // Projets - lecture seule pour contexte
    PERMISSIONS.VIEW_PROJECT,
    PERMISSIONS.VIEW_SUBPROJECT,
    
    // Gestion des stocks et commandes PDR
    PERMISSIONS.ORDER_PARTS,
    PERMISSIONS.MANAGE_STOCK,
    
    // Analytics pour suivi des interventions
    PERMISSIONS.VIEW_ANALYTICS,
    
    // Modules avancés pour terrain
    PERMISSIONS.ACCESS_MOBILE_APP,
    PERMISSIONS.VIEW_GAMIFICATION,
    PERMISSIONS.USE_AI_ASSISTANT
  ],
  [USER_ROLES.TECHNICIEN_PREVENTIF]: [
    // Interventions préventives - accès complet
    PERMISSIONS.CREATE_INTERVENTION,
    PERMISSIONS.VIEW_INTERVENTIONS,
    PERMISSIONS.EDIT_INTERVENTIONS,
    PERMISSIONS.ASSIGN_INTERVENTION,
    PERMISSIONS.VALIDATE_INTERVENTION,
    
    // Projets - lecture seule pour contexte
    PERMISSIONS.VIEW_PROJECT,
    PERMISSIONS.VIEW_SUBPROJECT,
    
    // Gestion des stocks et commandes PDR pour maintenance préventive
    PERMISSIONS.ORDER_PARTS,
    PERMISSIONS.MANAGE_STOCK,
    
    // Analytics pour suivi maintenance préventive
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
    
    // Modules avancés pour terrain
    PERMISSIONS.ACCESS_MOBILE_APP,
    PERMISSIONS.VIEW_GAMIFICATION,
    PERMISSIONS.USE_AI_ASSISTANT,
    PERMISSIONS.VIEW_PREDICTIVE_KPI // Suivi prédictif maintenance
  ],
  [USER_ROLES.MAGASINIER]: [
    // Gestion des composants et stock - accès complet
    PERMISSIONS.MANAGE_STOCK,
    PERMISSIONS.ORDER_PARTS,
    PERMISSIONS.VALIDATE_ORDERS,
    
    // Accès aux sous-projets (pour composants associés)
    PERMISSIONS.VIEW_PROJECT, // Lecture seule pour contexte
    PERMISSIONS.VIEW_SUBPROJECT,
    PERMISSIONS.CREATE_SUBPROJECT, // Peut créer des sous-projets pour composants
    
    // Interventions - lecture et création pour PDR
    PERMISSIONS.VIEW_INTERVENTIONS,
    PERMISSIONS.CREATE_INTERVENTION, // Pour interventions liées aux composants
    
    // Bons de travail - accès pour gestion composants
    PERMISSIONS.VIEW_WORK_ORDERS,
    PERMISSIONS.CREATE_WORK_ORDERS,
    
    // Analytics stock et composants
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
    
    // Modules avancés pour suivi stock
    PERMISSIONS.VIEW_PREDICTIVE_KPI, // Suivi stock prédictif
    PERMISSIONS.VIEW_ENHANCED_ANALYTICS, // Analytics avancés stock
    PERMISSIONS.USE_AI_ASSISTANT // Assistant pour gestion stock
  ],
  [USER_ROLES.SUPERVISEUR_PRODUCTION]: [
    // Superviseur production - vue d'ensemble production
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_SUBPROJECTS,
    PERMISSIONS.VIEW_WORK_ORDERS,
    PERMISSIONS.VIEW_INTERVENTIONS,
    PERMISSIONS.VIEW_COMPONENTS,
    PERMISSIONS.CREATE_INTERVENTION, // Interventions préventives
    PERMISSIONS.ORDER_PARTS, // Commande PDR pour maintenance
    
    // Analytics pour suivi maintenance préventive
    PERMISSIONS.VIEW_ANALYTICS,
    
    // Modules avancés pour terrain
    PERMISSIONS.ACCESS_MOBILE_APP,
    PERMISSIONS.VIEW_GAMIFICATION,
    PERMISSIONS.USE_AI_ASSISTANT
  ]
};

// Actions du reducer
const SECURITY_ACTIONS = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  SET_2FA_STATUS: 'SET_2FA_STATUS',
  ADD_AUDIT_LOG: 'ADD_AUDIT_LOG',
  SET_SESSION_TIMEOUT: 'SET_SESSION_TIMEOUT'
};

// État initial
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  permissions: [],
  twoFactorEnabled: false,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  lastActivity: Date.now(),
  auditLog: []
};

// Reducer
const securityReducer = (state, action) => {
  switch (action.type) {
    case SECURITY_ACTIONS.SET_USER:
      const userPermissions = ROLE_PERMISSIONS[action.payload.role] || [];
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        permissions: userPermissions,
        lastActivity: Date.now(),
        error: null
      };

    case SECURITY_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case SECURITY_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };

    case SECURITY_ACTIONS.LOGOUT:
      return {
        ...initialState,
        auditLog: [...state.auditLog, {
          action: 'LOGOUT',
          timestamp: new Date().toISOString(),
          userId: state.user?.id,
          details: 'User logged out'
        }]
      };

    case SECURITY_ACTIONS.SET_2FA_STATUS:
      return {
        ...state,
        twoFactorEnabled: action.payload
      };

    case SECURITY_ACTIONS.ADD_AUDIT_LOG:
      return {
        ...state,
        auditLog: [...state.auditLog, {
          ...action.payload,
          timestamp: new Date().toISOString(),
          userId: state.user?.id
        }].slice(-100) // Garder seulement les 100 dernières entrées
      };

    case SECURITY_ACTIONS.SET_SESSION_TIMEOUT:
      return {
        ...state,
        lastActivity: Date.now()
      };

    default:
      return state;
  }
};

// Context
const SecurityContext = createContext();

// Hook pour utiliser le context
export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

// Provider
export const SecurityProvider = ({ children }) => {
  const [state, dispatch] = useReducer(securityReducer, initialState);

  // Vérifier les permissions
  const hasPermission = (permission) => {
    return state.permissions.includes(permission);
  };

  // Vérifier plusieurs permissions (ET logique)
  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => state.permissions.includes(permission));
  };

  // Vérifier au moins une permission (OU logique)
  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => state.permissions.includes(permission));
  };

  // Login avec audit
  const login = async (credentials) => {
    dispatch({ type: SECURITY_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const response = await fetch('http://localhost:8089/PI/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Stocker dans localStorage pour persistance
        localStorage.setItem('sagemcom_user', JSON.stringify(userData));
        localStorage.setItem('sagemcom_login_time', Date.now().toString());
        
        dispatch({ type: SECURITY_ACTIONS.SET_USER, payload: userData });
        dispatch({ 
          type: SECURITY_ACTIONS.ADD_AUDIT_LOG, 
          payload: {
            action: 'LOGIN_SUCCESS',
            details: `Successful login for ${userData.email}`,
            ipAddress: await getClientIP()
          }
        });
        
        return { success: true, user: userData };
      } else {
        const error = 'Identifiants invalides';
        dispatch({ 
          type: SECURITY_ACTIONS.ADD_AUDIT_LOG, 
          payload: {
            action: 'LOGIN_FAILED',
            details: `Failed login attempt for ${credentials.email}`,
            ipAddress: await getClientIP()
          }
        });
        dispatch({ type: SECURITY_ACTIONS.SET_ERROR, payload: error });
        return { success: false, error };
      }
    } catch (error) {
      dispatch({ type: SECURITY_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Logout avec audit
  const logout = () => {
    localStorage.removeItem('sagemcom_user');
    localStorage.removeItem('sagemcom_login_time');
    dispatch({ type: SECURITY_ACTIONS.LOGOUT });
  };

  // Audit d'action
  const auditAction = (action, details = '') => {
    dispatch({
      type: SECURITY_ACTIONS.ADD_AUDIT_LOG,
      payload: {
        action,
        details,
        ipAddress: 'localhost' // En production, obtenir la vraie IP
      }
    });
  };

  // Vérification de session
  const checkSession = () => {
    const loginTime = localStorage.getItem('sagemcom_login_time');
    if (loginTime) {
      const elapsed = Date.now() - parseInt(loginTime);
      if (elapsed > state.sessionTimeout) {
        logout();
        return false;
      }
      dispatch({ type: SECURITY_ACTIONS.SET_SESSION_TIMEOUT });
      return true;
    }
    return false;
  };

  // Obtenir l'IP du client (simulation)
  const getClientIP = async () => {
    try {
      // En production, utiliser un service comme ipapi.co
      return 'localhost';
    } catch {
      return 'unknown';
    }
  };

  // Générer un code 2FA (simulation)
  const generate2FACode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Activer 2FA
  const enable2FA = async () => {
    const code = generate2FACode();
    // En production, envoyer le code par SMS/Email
    console.log('Code 2FA:', code);
    
    dispatch({ type: SECURITY_ACTIONS.SET_2FA_STATUS, payload: true });
    auditAction('2FA_ENABLED', 'Two-factor authentication enabled');
    
    return { success: true, code };
  };

  // Vérifier le code 2FA
  const verify2FA = (code) => {
    // En production, vérifier contre le code stocké
    const isValid = code.length === 6 && /^\d+$/.test(code);
    
    if (isValid) {
      auditAction('2FA_VERIFIED', 'Two-factor authentication verified');
      return { success: true };
    } else {
      auditAction('2FA_FAILED', 'Two-factor authentication failed');
      return { success: false, error: 'Code invalide' };
    }
  };

  // Restaurer la session au chargement
  useEffect(() => {
    const savedUser = localStorage.getItem('sagemcom_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (checkSession()) {
          dispatch({ type: SECURITY_ACTIONS.SET_USER, payload: userData });
        }
      } catch (error) {
        localStorage.removeItem('sagemcom_user');
        localStorage.removeItem('sagemcom_login_time');
      }
    }
  }, []);

  // Vérification périodique de session
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isAuthenticated) {
        checkSession();
      }
    }, 60000); // Vérifier chaque minute

    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  // Composant de protection des routes
  const ProtectedRoute = ({ children, requiredPermissions = [], fallback = null }) => {
    if (!state.isAuthenticated) {
      return fallback || <div>Accès non autorisé - Veuillez vous connecter</div>;
    }

    if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
      return fallback || <div>Permissions insuffisantes pour accéder à cette ressource</div>;
    }

    return children;
  };

  // Composant de protection par rôle
  const RoleProtected = ({ children, allowedRoles = [], fallback = null }) => {
    if (!state.isAuthenticated || !allowedRoles.includes(state.user?.role)) {
      return fallback || <div>Accès restreint à votre rôle</div>;
    }

    return children;
  };

  const value = {
    // État
    ...state,
    
    // Actions d'authentification
    login,
    logout,
    
    // Vérifications de permissions
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    
    // 2FA
    enable2FA,
    verify2FA,
    
    // Audit
    auditAction,
    
    // Session
    checkSession,
    
    // Composants
    ProtectedRoute,
    RoleProtected,
    
    // Constantes
    USER_ROLES,
    PERMISSIONS
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export default SecurityProvider;
