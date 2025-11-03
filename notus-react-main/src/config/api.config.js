/**
 * Configuration API centralisée
 * Détecte automatiquement si on accède depuis localhost ou depuis un appareil distant
 */

// Votre IP réseau (modifiez si nécessaire)
const NETWORK_IP = '192.168.30.1';

// Port du backend Spring Boot
const BACKEND_PORT = '8089';

/**
 * Obtient l'URL de base de l'API selon l'environnement
 * @returns {string} URL de base de l'API
 */
export const getApiBaseURL = () => {
  // Vérifier si window existe (côté client uniquement)
  if (typeof window === 'undefined') {
    return `http://localhost:${BACKEND_PORT}/PI`;
  }
  
  const hostname = window.location.hostname;
  
  // Si on accède via localhost ou 127.0.0.1, utiliser localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${BACKEND_PORT}/PI`;
  }
  
  // Sinon (depuis mobile ou autre appareil), utiliser l'IP réseau
  return `http://${NETWORK_IP}:${BACKEND_PORT}/PI`;
};

/**
 * Configuration pour déboguer (seulement côté client)
 */
if (typeof window !== 'undefined') {
  console.log('🌐 API Configuration:', {
    hostname: window.location.hostname,
    apiURL: getApiBaseURL()
  });
}

export default getApiBaseURL;
