# Configuration API pour Docker

## 🔗 Configuration Actuelle

Le fichier `src/config/api.config.js` est déjà configuré pour détecter automatiquement l'environnement.

### En développement local
```javascript
URL API: http://localhost:8089/PI
```

### Depuis un appareil mobile/externe
```javascript
URL API: http://192.168.30.1:8089/PI
```

## 🐳 Configuration Docker

### Option 1 : Via nginx.conf (Recommandé)

Le fichier `nginx.conf` créé proxy automatiquement les requêtes `/api` vers le backend :

```nginx
location /api {
    proxy_pass http://backend:8089;
    # ... autres configurations
}
```

Pour utiliser ce proxy, modifiez `src/config/api.config.js` :

```javascript
export const getApiBaseURL = () => {
  // En production Docker, utiliser le proxy nginx
  if (process.env.NODE_ENV === 'production') {
    return '/api';  // Relatif, proxy par nginx
  }
  
  // En développement
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:8089/PI`;
  }
  
  return `http://192.168.30.1:8089/PI`;
};
```

### Option 2 : Variable d'environnement

Utilisez `REACT_APP_API_URL` définie dans `docker-compose.yml` :

```javascript
export const getApiBaseURL = () => {
  // Priorité à la variable d'environnement
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback sur la configuration actuelle
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:8089/PI`;
  }
  
  return `http://192.168.30.1:8089/PI`;
};
```

### Option 3 : Build-time configuration

Créez un fichier `.env.production` :

```env
REACT_APP_API_URL=http://localhost:8089/PI
```

Et utilisez-le dans la configuration :

```javascript
export const getApiBaseURL = () => {
  return process.env.REACT_APP_API_URL || 'http://localhost:8089/PI';
};
```

## 📝 Recommandation

**Pour Docker**, utilisez l'Option 1 (nginx proxy) :

### Avantages :
- ✅ Pas de problème CORS
- ✅ Même origine (same-origin)
- ✅ Plus sécurisé
- ✅ Pas besoin de reconfigurer le frontend

### Configuration recommandée :

1. **Gardez nginx.conf tel quel** avec le proxy `/api`

2. **Modifiez src/config/api.config.js** :

```javascript
/**
 * Configuration API pour Docker
 */
const NETWORK_IP = '192.168.30.1';
const BACKEND_PORT = '8089';
const BACKEND_PATH = '/PI';

export const getApiBaseURL = () => {
  if (typeof window === 'undefined') {
    return `http://localhost:${BACKEND_PORT}${BACKEND_PATH}`;
  }
  
  const hostname = window.location.hostname;
  
  // Production Docker : utiliser le proxy nginx
  if (process.env.NODE_ENV === 'production') {
    return `/api${BACKEND_PATH}`;
  }
  
  // Développement local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${BACKEND_PORT}${BACKEND_PATH}`;
  }
  
  // Accès réseau
  return `http://${NETWORK_IP}:${BACKEND_PORT}${BACKEND_PATH}`;
};

if (typeof window !== 'undefined') {
  console.log('🌐 API Configuration:', {
    env: process.env.NODE_ENV,
    hostname: window.location.hostname,
    apiURL: getApiBaseURL()
  });
}

export default getApiBaseURL;
```

3. **Mettez à jour nginx.conf si le context path change** :

```nginx
location /api/PI {
    proxy_pass http://backend:8089/PI;
    # ... reste de la config
}
```

## 🧪 Test de Configuration

### Test local (sans Docker)
```bash
# Backend doit être sur port 8089
curl http://localhost:8089/PI/actuator/health
```

### Test Docker
```bash
# Démarrer les services
docker-compose up -d

# Attendre le démarrage
sleep 10

# Tester le backend directement
curl http://localhost:8089/PI/actuator/health

# Tester via le proxy nginx
curl http://localhost:3000/api/PI/actuator/health
```

## 🔧 Dépannage CORS

Si vous rencontrez des erreurs CORS :

### 1. Vérifiez la configuration backend

Dans `application-docker.properties` :
```properties
spring.web.cors.allowed-origins=http://localhost:3000,http://frontend:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
```

### 2. Ajoutez une classe CORS Config (si nécessaire)

Créez `CorsConfig.java` dans le backend :

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000", "http://frontend:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### 3. Vérifiez nginx.conf

Assurez-vous que les headers sont bien transmis :
```nginx
location /api {
    proxy_pass http://backend:8089;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 🎯 URLs de Test

Après démarrage Docker :

| Type | URL |
|------|-----|
| Frontend | http://localhost:3000 |
| Backend Direct | http://localhost:8089/PI/swagger-ui/index.html |
| Via Proxy Nginx | http://localhost:3000/api/PI/swagger-ui/index.html |
| Health Check Direct | http://localhost:8089/PI/actuator/health |
| Health Check Proxy | http://localhost:3000/api/PI/actuator/health |

## 📱 Configuration Mobile

Pour tester depuis un appareil mobile :

1. Trouvez votre IP : `ipconfig` (Windows) ou `ifconfig` (Linux/Mac)
2. Mettez à jour `NETWORK_IP` dans `api.config.js`
3. Accédez depuis mobile : `http://VOTRE_IP:3000`

**Important** : Le backend doit aussi être accessible sur cette IP !

## 🚀 Configuration Production

Pour un déploiement réel :

```javascript
// Utilisez des variables d'environnement
export const getApiBaseURL = () => {
  return process.env.REACT_APP_API_URL || '/api/PI';
};
```

Et configurez dans votre environnement de déploiement :
```bash
REACT_APP_API_URL=https://votre-domaine.com/api/PI
```

## ✅ Checklist

- [ ] `nginx.conf` configure le proxy `/api`
- [ ] `api.config.js` utilise `/api` en production
- [ ] CORS configuré dans le backend
- [ ] Tests réussis en local
- [ ] Tests réussis avec Docker
- [ ] Tests réussis depuis mobile (si nécessaire)
