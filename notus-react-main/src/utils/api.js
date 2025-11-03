import axios from 'axios';

// Création d'une instance Axios avec une configuration de base
const api = axios.create({
  baseURL: 'http://localhost:8089/PI',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important pour les cookies de session
});

/**
 * Fonction utilitaire pour obtenir le token JWT depuis le stockage local
 */
const getAuthToken = () => {
  // Essayer de récupérer le token depuis différents emplacements
  return (
    localStorage.getItem('sagemcom_token') ||
    localStorage.getItem('token') ||
    ''
  );
};

/**
 * Intercepteur de requête pour ajouter le token JWT
 */
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token JWT ajouté aux en-têtes');
    } else {
      console.warn('⚠️ Aucun token JWT trouvé dans le stockage local');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponse pour gérer les erreurs globales
 */
api.interceptors.response.use(
  (response) => {
    // Vous pouvez ajouter un traitement supplémentaire ici si nécessaire
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401: // Non autorisé
          console.error('🔒 Session expirée ou non authentifié');
          // Redirection vers la page de connexion
          if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login?session_expired=true';
          }
          break;
          
        case 403: // Accès refusé
          console.error('🚫 Accès refusé. Vérifiez vos permissions.');
          // Vous pourriez vouloir afficher une notification à l'utilisateur ici
          break;
          
        case 500: // Erreur serveur
          console.error('🔥 Erreur serveur:', data?.message || 'Erreur inconnue');
          break;
          
        default:
          console.error(`❌ Erreur HTTP ${status}:`, data?.message || 'Erreur inconnue');
      }
      
      // Journalisation détaillée en mode développement
      if (process.env.NODE_ENV === 'development') {
        console.error('Détails de l\'erreur:', {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
          config: {
            url: error.config.url,
            method: error.config.method,
            data: error.config.data
          }
        });
      }
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('🌐 Pas de réponse du serveur. Vérifiez votre connexion internet.');
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('⚙️ Erreur de configuration de la requête:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Exporter l'instance configurée
export default api;
