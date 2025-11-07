# 🐳 Configuration Docker - Guide Complet

> Configuration Docker complète pour l'application React + Spring Boot + MySQL

## 🚀 Démarrage Ultra-Rapide

```powershell
# 1. Tester la configuration
.\test-docker.ps1

# 2. Démarrer l'application
.\start-docker.ps1

# 3. Accéder à l'application
# Frontend : http://localhost:3000
# Backend  : http://localhost:8089/PI/swagger-ui/index.html
```

## 📚 Documentation

Tous les fichiers de documentation créés :

| Document | Description | Quand l'utiliser |
|----------|-------------|------------------|
| **README_DOCKER.md** | 👉 **Commencez ici** | Point d'entrée principal |
| **INSTALLATION_GUIDE.md** | Guide installation détaillé | Installation pas à pas |
| **DOCKER_README.md** | Documentation complète | Référence technique |
| **DOCKER_FILES_SUMMARY.md** | Résumé tous fichiers | Vue d'ensemble |
| **API_CONFIG_NOTE.md** | Configuration API/CORS | Problèmes de connexion |

## 📦 Fichiers Créés

### Configuration Docker
- ✅ `Dockerfile` - Build React multi-stage
- ✅ `.dockerignore` - Optimisation build
- ✅ `nginx.conf` - Reverse proxy + config
- ✅ `docker-compose.yml` - Orchestration services
- ✅ `docker-compose-absolute.yml` - Chemins Windows absolus
- ✅ `.env.example` - Template variables

### Scripts PowerShell
- ✅ `start-docker.ps1` - Démarrage automatique
- ✅ `stop-docker.ps1` - Arrêt propre
- ✅ `test-docker.ps1` - Tests configuration

### Documentation
- ✅ `README_DOCKER.md` - Ce fichier
- ✅ `INSTALLATION_GUIDE.md` - Guide complet
- ✅ `DOCKER_README.md` - Référence Docker
- ✅ `DOCKER_FILES_SUMMARY.md` - Résumé
- ✅ `API_CONFIG_NOTE.md` - Config API

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   DOCKER COMPOSE                        │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌───────────┐  │
│  │  Frontend   │    │   Backend   │    │   MySQL   │  │
│  │  React +    │───▶│ Spring Boot │───▶│    8.0    │  │
│  │   Nginx     │    │   + JWT     │    │  pidevdb  │  │
│  │ Port 3000   │    │ Port 8089   │    │ Port 3306 │  │
│  └─────────────┘    └─────────────┘    └───────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Caractéristiques

- **Frontend** : React 18 + Nginx 1.25 (multi-stage build)
- **Backend** : Spring Boot 3.3.4 + Java 17 (multi-stage build)
- **Database** : MySQL 8.0 avec volume persistant
- **Network** : Bridge isolé (app-network)
- **Health** : Healthchecks sur tous les services
- **Proxy** : Nginx proxy `/api` vers backend
- **Logs** : Volume persistant pour logs backend

## ⚡ Commandes Essentielles

### Démarrage
```powershell
# Méthode 1 : Script (Recommandé)
.\start-docker.ps1

# Méthode 2 : Docker Compose
docker-compose up -d --build

# Méthode 3 : Voir les logs pendant le démarrage
docker-compose up --build
```

### Surveillance
```powershell
# Statut des services
docker-compose ps

# Logs en temps réel
docker-compose logs -f

# Logs d'un service
docker-compose logs -f backend

# Statistiques ressources
docker stats
```

### Arrêt
```powershell
# Arrêt simple
docker-compose down

# Arrêt + suppression données
docker-compose down -v

# Script PowerShell
.\stop-docker.ps1
```

### Maintenance
```powershell
# Redémarrer un service
docker-compose restart backend

# Reconstruire un service
docker-compose up -d --build --no-deps frontend

# Shell dans un conteneur
docker-compose exec backend sh
docker-compose exec mysql bash
```

## 🎯 URLs d'Accès

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Application React |
| **Backend** | http://localhost:8089/PI/swagger-ui/index.html | API Swagger |
| **Health** | http://localhost:8089/PI/actuator/health | Santé backend |
| **Metrics** | http://localhost:8089/PI/actuator/metrics | Métriques |
| **MySQL** | localhost:3306 | Base de données |

### Credentials

**MySQL:**
- Database: `pidevdb`
- User: `pidev`
- Password: `pidev123`

⚠️ **À changer en production !**

## 🧪 Tests

### Test automatique de configuration
```powershell
.\test-docker.ps1
```

Ce script teste :
- ✅ Docker installé et lancé
- ✅ Ports disponibles (3000, 8089, 3306)
- ✅ Fichiers configuration présents
- ✅ Backend accessible
- ✅ Services configurés correctement

### Tests manuels

```powershell
# 1. Backend répond
curl http://localhost:8089/PI/actuator/health
# Doit retourner : {"status":"UP"}

# 2. Frontend accessible
curl http://localhost:3000
# Doit retourner le HTML

# 3. Proxy nginx fonctionne
curl http://localhost:3000/api/PI/actuator/health
# Doit retourner : {"status":"UP"}

# 4. MySQL connecté
docker-compose exec mysql mysql -u pidev -ppidev123 -e "SELECT 1"
# Doit retourner : 1
```

## 🐛 Dépannage Rapide

### Docker Desktop n'est pas lancé
```powershell
# Vérifier
docker info

# Solution : Lancez Docker Desktop
```

### Port déjà utilisé
```powershell
# Trouver le processus
netstat -ano | findstr :3000

# Tuer le processus
taskkill /PID <PID> /F
```

### Backend ne démarre pas
```powershell
# Voir les logs
docker-compose logs backend

# Vérifier MySQL
docker-compose logs mysql

# Redémarrer
docker-compose restart backend
```

### Frontend ne se connecte pas
```powershell
# Vérifier proxy nginx
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Vérifier CORS backend
docker-compose logs backend | Select-String "CORS"

# Voir API_CONFIG_NOTE.md pour plus de détails
```

### Tout nettoyer et recommencer
```powershell
# Arrêter tout
docker-compose down -v

# Nettoyer Docker
docker system prune -a

# Redémarrer
.\start-docker.ps1
```

## 📊 Workflow Complet

### 1️⃣ Première Installation

```powershell
# Étape 1 : Vérifier prérequis
.\test-docker.ps1

# Étape 2 : Démarrer (peut prendre 5-10 min)
.\start-docker.ps1

# Étape 3 : Vérifier statut
docker-compose ps

# Étape 4 : Accéder
# Ouvrir http://localhost:3000
```

### 2️⃣ Développement Quotidien

```powershell
# Matin : Démarrer
docker-compose up -d

# Pendant dev : Surveiller logs
docker-compose logs -f

# Si changement backend : Redémarrer
docker-compose restart backend

# Si changement frontend : Reconstruire
docker-compose up -d --build --no-deps frontend

# Soir : Arrêter
docker-compose down
```

### 3️⃣ Debugging

```powershell
# 1. Voir tous les logs
docker-compose logs

# 2. Logs d'un service
docker-compose logs -f backend

# 3. Shell dans conteneur
docker-compose exec backend sh

# 4. Vérifier réseau
docker network inspect notus-react-main_app-network

# 5. Tester connectivité
docker-compose exec frontend ping backend
```

## 🔐 Sécurité Production

**Avant de déployer en production :**

1. **Changez tous les mots de passe**
   - MySQL root et user
   - JWT secret

2. **Configurez HTTPS**
   - Certificats SSL/TLS
   - Reverse proxy (Traefik, Nginx)

3. **Limitez l'exposition**
   ```yaml
   ports:
     - "127.0.0.1:3306:3306"  # Local uniquement
   ```

4. **Utilisez des secrets**
   ```yaml
   secrets:
     mysql_password:
       file: ./secrets/mysql_password.txt
   ```

5. **Mettez à jour régulièrement**
   ```powershell
   docker-compose pull
   docker-compose up -d
   ```

## 🚢 CI/CD avec Jenkins

Le pipeline Jenkins fourni (voir Jenkinsfile) :

1. ✅ Build Maven + tests unitaires
2. ✅ Couverture code JaCoCo
3. ✅ Analyse SonarQube
4. ✅ Quality Gate
5. ✅ Build Docker image
6. ✅ Push Docker Hub (linda296/backend:5.1.0)

### Ajouter le frontend au pipeline

Créez `frontend-Jenkinsfile` :

```groovy
pipeline {
    agent any
    
    stages {
        stage('Install') {
            steps {
                sh 'npm ci --legacy-peer-deps'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Docker Build') {
            steps {
                sh '''
                    docker build -t linda296/frontend:1.0.0 .
                    docker tag linda296/frontend:1.0.0 linda296/frontend:latest
                '''
            }
        }
        
        stage('Docker Push') {
            environment {
                DOCKERHUB = credentials('dockerhub')
            }
            steps {
                sh '''
                    echo "$DOCKERHUB_PSW" | docker login -u "$DOCKERHUB_USR" --password-stdin
                    docker push linda296/frontend:1.0.0
                    docker push linda296/frontend:latest
                    docker logout
                '''
            }
        }
    }
}
```

## 📱 Accès Mobile

Pour tester depuis mobile/tablette :

1. **Trouvez votre IP réseau**
   ```powershell
   ipconfig
   # Cherchez "IPv4 Address"
   ```

2. **Modifiez `src/config/api.config.js`**
   ```javascript
   const NETWORK_IP = '192.168.X.X'; // Votre IP
   ```

3. **Accédez depuis mobile**
   ```
   http://192.168.X.X:3000
   ```

## 📈 Monitoring

### Healthchecks intégrés

Les services incluent des healthchecks :
- **MySQL** : `mysqladmin ping`
- **Backend** : `/actuator/health`

### Métriques Prometheus

Le backend expose :
```
http://localhost:8089/PI/actuator/prometheus
```

### Ajouter Prometheus + Grafana (optionnel)

Ajoutez dans `docker-compose.yml` :

```yaml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  depends_on:
    - prometheus
```

## 🎓 Ressources

### Documentation officielle
- [Docker Docs](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Nginx](https://nginx.org/en/docs/)
- [Spring Boot Docker](https://spring.io/guides/gs/spring-boot-docker/)

### Tutoriels
- [Docker pour débutants](https://docs.docker.com/get-started/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Compose networking](https://docs.docker.com/compose/networking/)

## ❓ FAQ

### Q : Combien de temps pour démarrer ?
**R :** Première fois : 5-10 minutes (build images). Après : 30-60 secondes.

### Q : Puis-je développer sans rebuild ?
**R :** Oui, utilisez des volumes pour le hot-reload (voir DOCKER_README.md)

### Q : Comment sauvegarder les données ?
**R :** `docker-compose exec mysql mysqldump -u pidev -ppidev123 pidevdb > backup.sql`

### Q : Comment restaurer ?
**R :** `docker-compose exec -T mysql mysql -u pidev -ppidev123 pidevdb < backup.sql`

### Q : Les ports peuvent être changés ?
**R :** Oui, éditez `docker-compose.yml` section `ports`

### Q : Puis-je utiliser PostgreSQL au lieu de MySQL ?
**R :** Oui, modifiez docker-compose.yml et application-docker.properties

## ✅ Checklist

Avant de démarrer :

- [ ] Docker Desktop installé
- [ ] Docker Desktop lancé
- [ ] Ports 3000, 8089, 3306 libres
- [ ] Backend existe dans `..\..\OneDrive\Bureau\back-master`
- [ ] Tests passés (`.\test-docker.ps1`)

Après démarrage :

- [ ] Tous services "Up" (`docker-compose ps`)
- [ ] Frontend accessible (http://localhost:3000)
- [ ] Backend accessible (http://localhost:8089)
- [ ] API répond (Swagger)
- [ ] Logs normaux (pas d'erreurs)

## 🎯 Prochaines Étapes

1. **Testez** : `.\test-docker.ps1`
2. **Démarrez** : `.\start-docker.ps1`
3. **Vérifiez** : http://localhost:3000
4. **Explorez** : Swagger API
5. **Développez** : Consultez les logs
6. **Déployez** : Intégrez CI/CD

## 📞 Support

**Problème ?** Consultez dans cet ordre :

1. **test-docker.ps1** - Tests automatiques
2. **INSTALLATION_GUIDE.md** - Guide pas à pas
3. **DOCKER_README.md** - Documentation complète
4. **API_CONFIG_NOTE.md** - Problèmes API/CORS
5. **DOCKER_FILES_SUMMARY.md** - Vue d'ensemble

---

**🚀 Prêt à démarrer ? Lancez `.\start-docker.ps1` !**
