# Guide de Déploiement Docker

Ce guide explique comment déployer l'application complète (Frontend React + Backend Spring Boot + MySQL) avec Docker.

## 📋 Prérequis

- Docker Desktop installé et lancé
- Docker Compose v3.8 ou supérieur
- Ports disponibles : 3000 (frontend), 8089 (backend), 3306 (MySQL)

## 🏗️ Architecture

```
┌─────────────────┐
│  Frontend React │  Port 3000
│   (Nginx)       │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
┌────────▼────────┐  ┌────▼──────┐
│ Backend Spring  │  │  MySQL    │
│ Boot (Java 17)  │  │  8.0      │
│ Port 8089       │  │ Port 3306 │
└─────────────────┘  └───────────┘
```

## 🚀 Démarrage Rapide

### 1. Vérifier la structure des dossiers

Assurez-vous que les chemins suivants existent :
```
C:\Users\user\OneDrive\Bureau\back-master\      (Backend)
C:\Users\user\Downloads\notus-react-main\       (Frontend)
```

### 2. Lancer l'application

```bash
# Depuis le dossier frontend
cd C:\Users\user\Downloads\notus-react-main\notus-react-main

# Construire et démarrer tous les services
docker-compose up -d --build

# Voir les logs en temps réel
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### 3. Vérifier le statut

```bash
# Voir tous les conteneurs
docker-compose ps

# Vérifier la santé des services
docker-compose ps --services
```

### 4. Accéder à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8089/PI/swagger-ui/index.html
- **MySQL** : localhost:3306

## 🛠️ Commandes Utiles

### Gestion des services

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ données supprimées)
docker-compose down -v

# Redémarrer un service spécifique
docker-compose restart backend

# Reconstruire un service
docker-compose up -d --build --no-deps backend
```

### Logs et débogage

```bash
# Logs de tous les services
docker-compose logs

# Logs en temps réel
docker-compose logs -f

# Dernières 100 lignes
docker-compose logs --tail=100

# Logs d'un service spécifique
docker-compose logs -f mysql
```

### Accès aux conteneurs

```bash
# Shell dans le backend
docker-compose exec backend sh

# Shell dans MySQL
docker-compose exec mysql mysql -u pidev -ppidev123 pidevdb

# Shell dans le frontend
docker-compose exec frontend sh
```

## 🔧 Configuration

### Variables d'environnement

Copiez `.env.example` vers `.env` et modifiez selon vos besoins :

```bash
cp .env.example .env
```

### Ports personnalisés

Modifiez dans `docker-compose.yml` :
```yaml
ports:
  - "VOTRE_PORT:PORT_INTERNE"
```

## 🐛 Résolution de problèmes

### Le backend ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier que MySQL est prêt
docker-compose exec mysql mysqladmin ping -h localhost

# Redémarrer le backend
docker-compose restart backend
```

### Problème de connexion à MySQL

```bash
# Vérifier le healthcheck
docker inspect mysql-db | grep -A 10 Health

# Tester la connexion
docker-compose exec mysql mysql -u pidev -ppidev123 -e "SELECT 1"
```

### Le frontend ne se connecte pas au backend

1. Vérifier le proxy nginx dans `nginx.conf`
2. Vérifier les CORS dans le backend (application-docker.properties)
3. Vérifier que le backend répond :
   ```bash
   curl http://localhost:8089/PI/actuator/health
   ```

### Erreurs de build

```bash
# Nettoyer tout et reconstruire
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## 📦 Volumes et Données

Les données sont persistées dans des volumes Docker :

- `mysql-data` : Base de données MySQL
- `backend-logs` : Logs du backend

Pour sauvegarder les données :
```bash
# Backup MySQL
docker-compose exec mysql mysqldump -u pidev -ppidev123 pidevdb > backup.sql

# Restore MySQL
docker-compose exec -T mysql mysql -u pidev -ppidev123 pidevdb < backup.sql
```

## 🔒 Sécurité

⚠️ **Pour la production** :
1. Changez tous les mots de passe par défaut
2. Utilisez des variables d'environnement pour les secrets
3. Configurez HTTPS avec des certificats SSL
4. Limitez l'exposition des ports
5. Utilisez des secrets Docker ou un gestionnaire de secrets

## 📊 Monitoring

### Healthchecks

Les healthchecks sont configurés pour :
- MySQL : `mysqladmin ping`
- Backend : endpoint `/actuator/health`

### Métriques

Le backend expose des métriques Prometheus sur :
```
http://localhost:8089/PI/actuator/prometheus
```

## 🚢 Déploiement en Production

### Avec Docker Hub

```bash
# Build et tag
docker build -t linda296/backend:5.1.0 ../../OneDrive/Bureau/back-master
docker build -t linda296/frontend:1.0.0 .

# Push vers Docker Hub
docker push linda296/backend:5.1.0
docker push linda296/frontend:1.0.0
```

### Avec Jenkins Pipeline

Le fichier Jenkinsfile fourni automatise :
1. Build Maven avec tests
2. Analyse SonarQube
3. Build Docker
4. Push vers Docker Hub

## 📝 Notes

- Le backend utilise le profil `docker` automatiquement
- Les logs du backend sont dans `/app/logs` du conteneur
- La base de données est créée automatiquement au premier démarrage
- Le frontend proxy les requêtes `/api` vers le backend

## 🆘 Support

En cas de problème :
1. Consultez les logs : `docker-compose logs`
2. Vérifiez les healthchecks : `docker-compose ps`
3. Testez la connectivité réseau entre services
4. Vérifiez que tous les ports sont disponibles
