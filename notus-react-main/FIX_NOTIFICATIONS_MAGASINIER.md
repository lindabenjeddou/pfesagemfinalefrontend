# 🔧 Corrections - Système de Notifications Magasinier

## 📋 Problèmes Identifiés et Résolus

### 1. **Endpoint inexistant dans SousProjet.js**
**Problème:** Le frontend tentait d'envoyer une notification à `/PI/PI/notifications/sous-projet-created` qui n'existe pas dans le backend.

**Solution:** ✅ Supprimé l'appel redondant car le backend envoie déjà automatiquement les notifications lors de la création d'un sous-projet (voir `SousProjetService.java` lignes 85-86).

**Fichiers modifiés:**
- `src/views/admin/SousProjet.js`
  - Suppression de la fonction `notifyMagasiniersNewSousProjet`
  - Suppression de l'appel à cette fonction dans `handleSousProjetSubmit`
  - Ajout d'un message de confirmation indiquant que les notifications sont envoyées automatiquement
  
- `src/views/admin/projet/SubProjects.js` ⭐ **FICHIER PRINCIPAL**
  - Suppression de la fonction `notifyMagasiniers`
  - Suppression de l'appel à cette fonction dans `handleSousProjetSubmit`
  - Message de succès mis à jour : "✅ Sous-projet créé avec succès ! Les magasiniers ont été notifiés automatiquement."
  - Message informatif pour les composants : "📦 X composant(s) commandé(s) - Stock mis à jour"

---

### 2. **URL incorrecte dans MagasinierNotifications.js**
**Problème:** L'endpoint utilisait un double préfixe `/PI/PI/notifications/user/` au lieu de `/PI/notifications/user/`

**Solution:** ✅ Correction de l'URL pour correspondre à l'endpoint backend correct

**Fichier modifié:**
- `src/components/Notifications/MagasinierNotifications.js`
  - Ligne 85: `http://localhost:8089/PI/notifications/user/${userId}` (au lieu de `/PI/PI/notifications/`)
  - Ajout de logs de débogage pour faciliter le diagnostic

---

### 3. **UserID hardcodé dans MagasinierDashboard.js**
**Problème:** Le dashboard utilisait un utilisateur fictif avec ID hardcodé (id: 2) au lieu de l'utilisateur réellement connecté

**Solution:** ✅ Intégration du SecurityContext pour récupérer l'utilisateur connecté

**Fichier modifié:**
- `src/views/admin/MagasinierDashboard.js`
  - Import de `useSecurity` depuis SecurityContext
  - Récupération dynamique de l'utilisateur connecté
  - Fallback vers localStorage si le contexte n'est pas disponible
  - Ajout de logs détaillés pour le débogage

---

## 🔄 Flux de Notification (Fonctionnement Final)

### Création d'un Sous-Projet
```
1. Utilisateur crée un sous-projet
   ↓
2. Frontend appelle: POST /PI/sousprojets/create/{projectId}
   ↓
3. Backend (SousProjetService.java):
   - Sauvegarde le sous-projet
   - Appelle automatiquement notificationService.notifyMagasiniersForSousProjetCreation()
   - Trouve tous les utilisateurs avec role = MAGASINIER
   - Crée une notification pour chaque magasinier
   - Sauvegarde les notifications en base de données
   ↓
4. Frontend affiche: "✅ Sous-projet créé avec succès ! Les magasiniers ont été notifiés automatiquement."
```

### Récupération des Notifications
```
1. Magasinier ouvre son dashboard
   ↓
2. MagasinierDashboard charge avec l'utilisateur connecté
   ↓
3. MagasinierNotifications appelle: GET /PI/notifications/user/{userId}
   ↓
4. Backend retourne toutes les notifications pour cet utilisateur
   ↓
5. Affichage dans le centre de notifications avec:
   - Filtrage par priorité et statut
   - Pagination
   - Marquage comme lu
   - Actualisation automatique toutes les 30 secondes
```

---

## 🧪 Tests à Effectuer

### Test 1: Création de Sous-Projet
1. Se connecter en tant qu'administrateur ou chef de projet
2. Naviguer vers "Gestion des Sous-Projets"
3. Créer un nouveau sous-projet avec des composants
4. Vérifier le message de succès: "✅ Sous-projet créé avec succès ! Les magasiniers ont été notifiés automatiquement."
5. **Vérifier dans les logs backend** la présence de:
   ```
   🔍 === DÉBUT ENVOI NOTIFICATIONS ===
   🔔 Appel notifyMagasiniersForSousProjetCreation...
   ✅ Notification sauvegardée avec ID: X
   ```

### Test 2: Réception des Notifications (Magasinier)
1. Se connecter avec un compte MAGASINIER
2. Naviguer vers le Dashboard Magasinier
3. **Vérifier dans la console du navigateur** la présence de:
   ```
   🔍 Utilisateur connecté: {id: X, role: "MAGASINIER", ...}
   ✅ UserInfo pour dashboard: {id: X, name: "...", ...}
   🔍 Récupération des notifications pour userId: X
   📡 Réponse API notifications: 200
   ✅ Notifications récupérées depuis l'API: [...]
   ```
4. Les notifications devraient s'afficher dans le centre de notifications
5. Cliquer sur une notification pour la marquer comme lue

### Test 3: Vérification Backend
1. **Vérifier qu'il existe au moins un utilisateur avec role = MAGASINIER** dans la base de données
   ```sql
   SELECT * FROM user WHERE role = 'MAGASINIER';
   ```
2. **Vérifier la table des notifications** après création d'un sous-projet
   ```sql
   SELECT * FROM notifications WHERE type = 'SOUS_PROJET_CREATED' ORDER BY created_at DESC LIMIT 5;
   ```

---

## 🐛 Diagnostic des Problèmes

### Si les notifications ne s'affichent pas:

#### Étape 1: Vérifier l'utilisateur connecté
Ouvrir la console du navigateur et chercher:
```
🔍 Utilisateur connecté: ...
✅ UserInfo pour dashboard: ...
```
- **Si userId est undefined ou null**: Problème d'authentification
- **Solution**: Se déconnecter puis se reconnecter

#### Étape 2: Vérifier l'appel API
Chercher dans la console:
```
🔍 Récupération des notifications pour userId: X
📡 Réponse API notifications: ...
```
- **Si 404**: L'endpoint n'est pas accessible (vérifier que le backend est démarré)
- **Si 500**: Erreur côté backend (vérifier les logs Spring Boot)
- **Si "API backend non disponible"**: Le backend n'est pas accessible

#### Étape 3: Vérifier les magasiniers en base
```sql
SELECT id, firstname, lastname, email, role FROM user WHERE role = 'MAGASINIER';
```
- **Si aucun résultat**: Créer un utilisateur MAGASINIER dans la base
- **Si le role est différent** (ex: MAGASINER): Corriger le rôle dans la base

#### Étape 4: Vérifier les logs backend
Lors de la création d'un sous-projet, chercher:
```
🔍 === DÉBUT ENVOI NOTIFICATIONS ===
🔍 Magasiniers trouvés: X
🔔 Création notification pour: NOM Prénom (ID: Y)
✅ Notification sauvegardée avec ID: Z
```
- **Si "Magasiniers trouvés: 0"**: Aucun magasinier en base ou problème de requête
- **Si erreur de sauvegarde**: Problème avec la base de données

---

## 📊 Endpoints Backend Utilisés

| Endpoint | Méthode | Description | Status |
|----------|---------|-------------|--------|
| `/PI/sousprojets/create/{projectId}` | POST | Crée un sous-projet et envoie les notifications automatiquement | ✅ Fonctionnel |
| `/PI/notifications/user/{userId}` | GET | Récupère toutes les notifications d'un utilisateur | ✅ Corrigé |
| `/PI/notifications/user/{userId}/unread` | GET | Récupère les notifications non lues | ⚠️ Non utilisé actuellement |
| `/PI/notifications/{notificationId}/read` | PUT | Marque une notification comme lue | ⚠️ À implémenter dans le frontend |

---

## ✅ Checklist de Vérification

- [x] Suppression de l'appel à l'endpoint inexistant dans SousProjet.js
- [x] Correction de l'URL dans MagasinierNotifications.js
- [x] Intégration du SecurityContext dans MagasinierDashboard.js
- [x] Ajout de logs de débogage dans les composants clés
- [ ] **Test avec un compte MAGASINIER réel**
- [ ] **Vérification des notifications dans la base de données**
- [ ] **Test de bout en bout**: Création → Notification → Affichage

---

## 🚀 Améliorations Futures

1. **Marquer comme lu côté backend**: Appeler l'endpoint PUT `/PI/notifications/{id}/read` lors du clic sur une notification
2. **Compteur en temps réel**: Utiliser WebSockets pour mettre à jour le compteur de notifications sans polling
3. **Notifications push**: Intégrer des notifications navigateur avec l'API Notifications
4. **Filtres avancés**: Ajouter des filtres par date, projet, type
5. **Actions rapides**: Permettre des actions directes depuis la notification (valider, rejeter, etc.)

---

## 📞 Support

Si le problème persiste après ces corrections:
1. Vérifier que le backend Spring Boot est démarré sur `http://localhost:8089`
2. Vérifier qu'il existe au moins un utilisateur avec `role = 'MAGASINIER'` en base de données
3. Consulter les logs backend pour identifier l'erreur exacte
4. Vider le cache du navigateur et localStorage: `localStorage.clear()`

**Date de correction**: 26 Janvier 2025
**Statut**: ✅ Corrections appliquées - Tests en attente
