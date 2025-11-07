# Guide d'Installation et Déploiement Docker

## 📦 Fichiers Créés

Voici tous les fichiers Docker créés pour votre projet :

### Frontend (notus-react-main)
```
C:\Users\user\Downloads\notus-react-main\notus-react-main\
├── Dockerfile                      # Build multi-stage React + Nginx
├── .dockerignore                   # Fichiers à exclure du build
├── nginx.conf                      # Configuration Nginx avec proxy API
├── docker-compose.yml              # Orchestration complète (chemins relatifs)
├── docker-compose-absolute.yml     # Orchestration avec chemins absolus
├── .env.example                    # Variables d'environnement
├── start-docker.ps1                # Script PowerShell de démarrage
├── stop-docker.ps1                 # Script PowerShell d'arrêt
├── DOCKER_README.md                # Documentation Docker complète
└── INSTALLATION_GUIDE.md           # Ce fichier
```

### Backend (back-master)
```
C:\Users\user\OneDrive\Bureau\back-master\
├── Dockerfile                      # Déjà existant (Build Spring Boot)
└── .dockerignore                   # Déjà existant
```

## 🚀 Méthodes de Démarrage

### Méthode 1 : Script PowerShell (Recommandé pour Windows)

La méthode la plus simple :

```powershell
# Se placer dans le dossier frontend
cd C:\Users\user\Downloads\notus-react-main\notus-react-main

# Démarrer l'application
.\start-docker.ps1

# Pour arrêter
.\stop-docker.ps1
```

### Méthode 2 : Docker Compose (Chemin relatif)

```powershell
# Se placer dans le dossier frontend
cd C:\Users\user\Downloads\notus-react-main\notus-react-main

# Démarrer
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

### Méthode 3 : Docker Compose (Chemins absolus)

Peut être exécuté depuis n'importe quel dossier :

```powershell
cd C:\Users\user\Downloads\notus-react-main\notus-react-main

# Démarrer
docker-compose -f docker-compose-absolute.yml up -d --build

# Arrêter
docker-compose -f docker-compose-absolute.yml down
```

## 📋 Checklist Avant Démarrage

- [ ] Docker Desktop est installé et lancé
- [ ] Les ports 3000, 8089 et 3306 sont disponibles
- [ ] Les chemins suivants existent :
  - `C:\Users\user\OneDrive\Bureau\back-master\`
  - `C:\Users\user\Downloads\notus-react-main\notus-react-main\`

## 🌐 URLs d'Accès

Une fois démarré, accédez aux services :

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Application React |
| **Backend API** | http://localhost:8089/PI/swagger-ui/index.html | Documentation API Swagger |
| **Health Check** | http://localhost:8089/PI/actuator/health | État du backend |
| **MySQL** | localhost:3306 | Base de données (user: pidev, pass: pidev123) |

## 🔧 Configuration

### Modifier les ports

Éditez `docker-compose.yml` :

```yaml
services:
  frontend:
    ports:
      - "NOUVEAU_PORT:80"  # Ex: "8080:80"
  
  backend:
    ports:
      - "NOUVEAU_PORT:8080"  # Ex: "9090:8080"
```

### Variables d'environnement

1. Copiez le fichier d'exemple :
```powershell
copy .env.example .env
```

2. Modifiez `.env` selon vos besoins

3. Chargez-le dans docker-compose.yml :
```yaml
env_file:
  - .env
```

## 🏗️ Architecture des Services

```
┌────────────────────────────────────────────────────────────┐
│                     Docker Network (app-network)           │
│                                                            │
│  ┌──────────────┐      ┌──────────────┐    ┌──────────┐  │
│  │   Frontend   │      │   Backend    │    │  MySQL   │  │
│  │   (Nginx)    │─────▶│ Spring Boot  │───▶│   8.0    │  │
│  │  Port 3000   │      │  Port 8089   │    │ Port 3306│  │
│  └──────────────┘      └──────────────┘    └──────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
         │                      │                   │
         │                      │                   │
    localhost:3000        localhost:8089      localhost:3306
```

### Communication entre services

- Le frontend proxy les requêtes `/api` vers `http://backend:8089` (voir `nginx.conf`)
- Le backend se connecte à MySQL via `mysql:3306`
- Les healthchecks assurent l'ordre de démarrage

## 🐛 Dépannage Rapide

### Le backend ne démarre pas

```powershell
# Vérifier les logs
docker-compose logs backend

# Vérifier MySQL
docker-compose exec mysql mysqladmin ping

# Redémarrer proprement
docker-compose restart backend
```

### Ports déjà utilisés

```powershell
# Trouver le processus utilisant le port 3000
netstat -ano | findstr :3000

# Tuer le processus (remplacez PID)
taskkill /PID <PID> /F
```

### Tout reconstruire

```powershell
# Nettoyer complètement
docker-compose down -v
docker system prune -a

# Reconstruire
docker-compose up -d --build
```

## 📊 Commandes Utiles

### Surveillance

```powershell
# Voir tous les conteneurs
docker-compose ps

# Logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend

# Statistiques d'utilisation
docker stats
```

### Maintenance

```powershell
# Redémarrer un service
docker-compose restart frontend

# Reconstruire un service
docker-compose up -d --build --no-deps backend

# Accéder au shell d'un conteneur
docker-compose exec backend sh
docker-compose exec mysql bash
```

### Nettoyage

```powershell
# Arrêter sans supprimer les données
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v

# Nettoyer tout Docker
docker system prune -a --volumes
```

## 🔒 Sécurité Production

Pour un déploiement en production :

1. **Changez tous les mots de passe**
```yaml
MYSQL_ROOT_PASSWORD: <mot_de_passe_fort>
MYSQL_PASSWORD: <mot_de_passe_fort>
JWT_SECRET: <secret_jwt_unique>
```

2. **Utilisez HTTPS**
   - Configurez un reverse proxy (Nginx, Traefik)
   - Obtenez des certificats SSL (Let's Encrypt)

3. **Limitez l'exposition des ports**
```yaml
# N'exposez que ce qui est nécessaire
ports:
  - "127.0.0.1:3306:3306"  # MySQL local uniquement
```

4. **Utilisez des secrets Docker**
```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
```

## 🚢 Déploiement avec Jenkins

Le pipeline Jenkins fourni automatise :
1. ✅ Checkout du code
2. ✅ Build Maven avec tests
3. ✅ Analyse SonarQube + Quality Gate
4. ✅ Build image Docker
5. ✅ Push vers Docker Hub (linda296/backend:5.1.0)

### Adapter le pipeline pour le frontend

Ajoutez ces stages au Jenkinsfile :

```groovy
stage('Build Frontend Docker') {
    steps {
        dir('frontend') {
            sh """
                docker build -t linda296/frontend:1.0.0 .
                docker tag linda296/frontend:1.0.0 linda296/frontend:latest
            """
        }
    }
}

stage('Push Frontend Docker') {
    environment {
        DOCKERHUB = credentials('dockerhub')
    }
    steps {
        sh """
            docker push linda296/frontend:1.0.0
            docker push linda296/frontend:latest
        """
    }
}
```

## 📱 Accès depuis d'autres appareils

Pour accéder depuis un autre appareil sur le même réseau :

1. Trouvez votre IP locale :
```powershell
ipconfig
```

2. Accédez via : `http://VOTRE_IP:3000`

3. Modifiez nginx.conf pour autoriser les connexions externes si nécessaire

## 🎯 Prochaines Étapes

1. **Testez l'application** : http://localhost:3000
2. **Vérifiez les logs** : `docker-compose logs -f`
3. **Testez l'API** : http://localhost:8089/PI/swagger-ui/index.html
4. **Sauvegardez vos données** : Voir DOCKER_README.md
5. **Configurez CI/CD** : Intégrez le Jenkinsfile

## 📚 Documentation Complémentaire

- `DOCKER_README.md` : Documentation Docker complète
- `nginx.conf` : Configuration du reverse proxy
- `.env.example` : Variables d'environnement disponibles

## 💡 Astuces

- **Build plus rapide** : Décommentez les layers de cache dans les Dockerfiles
- **Développement** : Utilisez des volumes pour le hot-reload
- **Production** : Utilisez toujours des tags de version spécifiques
- **Monitoring** : Ajoutez Prometheus + Grafana pour surveiller les services

## 🆘 Support

En cas de problème :
1. Consultez `DOCKER_README.md` pour le dépannage détaillé
2. Vérifiez les logs : `docker-compose logs`
3. Testez les healthchecks : `docker-compose ps`

Bonne chance avec votre déploiement ! 🚀
