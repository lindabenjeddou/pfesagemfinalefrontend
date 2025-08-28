import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Types d'actions pour le reducer
const PROJECT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_PROJECTS: 'SET_PROJECTS',
  ADD_PROJECT: 'ADD_PROJECT',
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  SET_SOUS_PROJECTS: 'SET_SOUS_PROJECTS',
  ADD_SOUS_PROJECT: 'ADD_SOUS_PROJECT',
  UPDATE_SOUS_PROJECT: 'UPDATE_SOUS_PROJECT',
  DELETE_SOUS_PROJECT: 'DELETE_SOUS_PROJECT',
  SET_USERS: 'SET_USERS',
  SET_COMPONENTS: 'SET_COMPONENTS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// État initial
const initialState = {
  projects: [],
  sousProjects: [],
  users: [],
  components: [],
  loading: {
    projects: false,
    sousProjects: false,
    users: false,
    components: false
  },
  error: null,
  lastUpdated: null
};

// Reducer pour gérer les états
const projectReducer = (state, action) => {
  switch (action.type) {
    case PROJECT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.type]: action.payload.value
        }
      };

    case PROJECT_ACTIONS.SET_PROJECTS:
      return {
        ...state,
        projects: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null
      };

    case PROJECT_ACTIONS.ADD_PROJECT:
      return {
        ...state,
        projects: [...state.projects, action.payload],
        lastUpdated: new Date().toISOString()
      };

    case PROJECT_ACTIONS.UPDATE_PROJECT:
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.id ? { ...project, ...action.payload } : project
        ),
        lastUpdated: new Date().toISOString()
      };

    case PROJECT_ACTIONS.DELETE_PROJECT:
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        lastUpdated: new Date().toISOString()
      };

    case PROJECT_ACTIONS.SET_SOUS_PROJECTS:
      return {
        ...state,
        sousProjects: action.payload,
        lastUpdated: new Date().toISOString(),
        error: null
      };

    case PROJECT_ACTIONS.ADD_SOUS_PROJECT:
      return {
        ...state,
        sousProjects: [...state.sousProjects, action.payload],
        lastUpdated: new Date().toISOString()
      };

    case PROJECT_ACTIONS.UPDATE_SOUS_PROJECT:
      return {
        ...state,
        sousProjects: state.sousProjects.map(sp =>
          sp.id === action.payload.id ? { ...sp, ...action.payload } : sp
        ),
        lastUpdated: new Date().toISOString()
      };

    case PROJECT_ACTIONS.DELETE_SOUS_PROJECT:
      return {
        ...state,
        sousProjects: state.sousProjects.filter(sp => sp.id !== action.payload),
        lastUpdated: new Date().toISOString()
      };

    case PROJECT_ACTIONS.SET_USERS:
      return {
        ...state,
        users: action.payload,
        error: null
      };

    case PROJECT_ACTIONS.SET_COMPONENTS:
      return {
        ...state,
        components: action.payload,
        error: null
      };

    case PROJECT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case PROJECT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Context
const ProjectContext = createContext();

// Hook pour utiliser le context
export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};

// Provider avec API intégrée
export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // API Base URL
  const API_BASE = 'http://localhost:8089/PI/PI';

  // Actions pour les projets
  const fetchProjects = async () => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: { type: 'projects', value: true } });
    try {
      const response = await fetch(`${API_BASE}/PI/PI/projects/all`);
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: PROJECT_ACTIONS.SET_PROJECTS, payload: data });
      } else {
        throw new Error('Erreur lors de la récupération des projets');
      }
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: { type: 'projects', value: false } });
    }
  };

  const createProject = async (projectData) => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: { type: 'projects', value: true } });
    try {
      const response = await fetch(`${API_BASE}/PI/PI/projects/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (response.ok) {
        const newProject = await response.json();
        dispatch({ type: PROJECT_ACTIONS.ADD_PROJECT, payload: newProject });
        return { success: true, data: newProject };
      } else {
        throw new Error('Erreur lors de la création du projet');
      }
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: { type: 'projects', value: false } });
    }
  };

  // Actions pour les sous-projets
  const fetchSousProjects = async (projectId = null) => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: { type: 'sousProjects', value: true } });
    try {
      const url = projectId 
        ? `${API_BASE}/sousprojets/project/${projectId}`
        : `${API_BASE}/sousprojets/all`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: PROJECT_ACTIONS.SET_SOUS_PROJECTS, payload: data });
      } else {
        throw new Error('Erreur lors de la récupération des sous-projets');
      }
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: { type: 'sousProjects', value: false } });
    }
  };

  const confirmSousProject = async (sousProjectId) => {
    try {
      const response = await fetch(`${API_BASE}/sousprojets/confirm/${sousProjectId}`, {
        method: 'PUT'
      });
      if (response.ok) {
        const updatedSousProject = await response.json();
        dispatch({ type: PROJECT_ACTIONS.UPDATE_SOUS_PROJECT, payload: updatedSousProject });
        return { success: true, data: updatedSousProject };
      } else {
        throw new Error('Erreur lors de la confirmation du sous-projet');
      }
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  // Actions pour les utilisateurs
  const fetchUsers = async () => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: { type: 'users', value: true } });
    try {
      const response = await fetch(`${API_BASE}/user/all`);
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: PROJECT_ACTIONS.SET_USERS, payload: data });
      } else {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: { type: 'users', value: false } });
    }
  };

  // Actions pour les composants
  const fetchComponents = async () => {
    dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: { type: 'components', value: true } });
    try {
      const response = await fetch(`${API_BASE}/component/all`);
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: PROJECT_ACTIONS.SET_COMPONENTS, payload: data });
      } else {
        throw new Error('Erreur lors de la récupération des composants');
      }
    } catch (error) {
      dispatch({ type: PROJECT_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: PROJECT_ACTIONS.SET_LOADING, payload: { type: 'components', value: false } });
    }
  };

  // Calculer les statistiques
  const getStatistics = () => {
    const totalProjects = state.projects.length;
    const totalBudget = state.projects.reduce((sum, project) => 
      sum + (parseFloat(project.budget) || 0), 0
    );
    const confirmedSousProjects = state.sousProjects.filter(sp => 
      sp.confirmed === 1 || sp.confirmed === true
    ).length;
    const pendingSousProjects = state.sousProjects.filter(sp => 
      sp.confirmed === 0 || sp.confirmed === false
    ).length;

    return {
      totalProjects,
      totalBudget,
      totalSousProjects: state.sousProjects.length,
      confirmedSousProjects,
      pendingSousProjects,
      confirmationRate: state.sousProjects.length > 0 
        ? (confirmedSousProjects / state.sousProjects.length) * 100 
        : 0
    };
  };

  // Charger les données initiales
  useEffect(() => {
    fetchProjects();
    fetchUsers();
    fetchComponents();
  }, []);

  const value = {
    // État
    ...state,
    
    // Actions
    fetchProjects,
    createProject,
    fetchSousProjects,
    confirmSousProject,
    fetchUsers,
    fetchComponents,
    
    // Utilitaires
    getStatistics,
    clearError: () => dispatch({ type: PROJECT_ACTIONS.CLEAR_ERROR }),
    
    // Actions directes du reducer
    dispatch
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectProvider;
