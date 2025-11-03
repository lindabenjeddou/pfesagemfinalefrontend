# 🔍 DIAGNOSTIC SYSTÈME DE NOTIFICATIONS

## ✅ ÉTAPES DE VÉRIFICATION

### 1️⃣ VÉRIFIER QUE LE BACKEND EST REDÉMARRÉ
Le backend Spring Boot DOIT être redémarré pour prendre en compte le nouveau type `INTERVENTION_ASSIGNED`.

**Actions :**
- Arrêtez le serveur (Ctrl+C)
- Redémarrez-le
- Attendez le message "Started PIApplication"

---

### 2️⃣ TESTER L'ASSIGNATION D'UNE INTERVENTION

**Se connecter comme Chef Secteur ou Admin :**
```
Email: admin@sagemcom.com (ou votre compte admin)
```

**Assigner une intervention :**
1. Aller dans "Assigner Intervention"
2. Sélectionner une intervention
3. Sélectionner un technicien (ID 2 par exemple)
4. Cliquer "Assigner Technicien"

**Vérifier le message :**
- ✅ Si vous voyez : "Technicien assigné avec succès ✅ Notification envoyée !"
- ❌ Si erreur : Voir section "Problèmes courants"

---

### 3️⃣ VÉRIFIER LES LOGS BACKEND

Après l'assignation, cherchez dans les logs backend :

**✅ SUCCÈS - Vous devriez voir :**
```
🔍 === DÉBUT notifyTechnicianForAssignment ===
🔍 TechnicienId: 2
🔍 InterventionId: 10
🔍 Technicien trouvé: [Nom]
✅ Notification créée avec succès - ID: [X]
✅ === FIN notifyTechnicianForAssignment ===
```

**❌ ÉCHEC - Si vous voyez :**
```
Secured POST /error?technicienId=...
status=403
```
→ Problème d'authentification (voir section 4)

---

### 4️⃣ VÉRIFIER LA CONSOLE NAVIGATEUR (F12)

**Ouvrir la console navigateur :**
- Appuyez sur F12
- Onglet "Console"

**Lors de l'assignation, vous devriez voir :**
```
✅ Notification envoyée au technicien
```

**Si vous voyez une erreur :**
```
⚠️ Erreur notification (non bloquant): [détails]
```
→ Copier l'erreur complète

---

### 5️⃣ SE CONNECTER COMME TECHNICIEN

**Compte technicien :**
```
Email: technicienc@sagemcom.com
Password: [votre mot de passe]
```

**Vérifier :**
1. Badge 🔔 en haut à droite → Devrait montrer un chiffre rouge
2. Cliquer sur 🔔 → Devrait afficher la notification

**Console navigateur (F12) :**
```
✅ Notifications chargées: 1
```

---

## 🐛 PROBLÈMES COURANTS

### ❌ Erreur 403 Forbidden
**Cause :** Backend pas redémarré ou problème de sécurité

**Solution :**
1. Redémarrer le serveur backend Spring Boot
2. Vérifier que vous êtes bien connecté
3. Vider le cache navigateur (Ctrl+Shift+Del)

---

### ❌ "Aucune notification" malgré l'assignation
**Cause :** ID utilisateur incorrect ou problème de base de données

**Solution :**
1. Ouvrir la console navigateur (F12)
2. Regarder les appels API dans l'onglet "Network"
3. Chercher `/PI/notifications/user/[ID]`
4. Vérifier que l'ID correspond à votre technicien

**Test SQL direct :**
```sql
-- Vérifier les notifications en base
SELECT * FROM notification WHERE recipient_id = 2;

-- Vérifier l'ID du technicien
SELECT id, email, role FROM users WHERE email = 'technicienc@sagemcom.com';
```

---

### ❌ Le backend ne démarre pas
**Erreur possible :** Enum `INTERVENTION_ASSIGNED` non reconnu

**Solution :**
1. Vérifier que `NotificationType.java` contient :
```java
public enum NotificationType {
    COMPONENT_ORDER,
    STOCK_UPDATE,
    SOUS_PROJET_CREATED,
    INTERVENTION_ASSIGNED,  // ← Cette ligne doit être présente
    GENERAL
}
```

2. Rebuild le projet :
```bash
mvn clean install
```

---

## 🧪 TEST MANUEL AVEC POSTMAN

**1. Créer une notification manuellement :**
```
POST http://localhost:8089/PI/notifications/assignation-technicien
Query Params:
- technicienId: 2
- interventionId: 10
- interventionDescription: Test manuel
```

**2. Récupérer les notifications :**
```
GET http://localhost:8089/PI/notifications/user/2
```

**3. Vérifier le compteur :**
```
GET http://localhost:8089/PI/notifications/user/2/unread/count
```

---

## 📋 CHECKLIST COMPLÈTE

- [ ] Backend redémarré après modification de `NotificationType.java`
- [ ] Aucune erreur dans les logs backend au démarrage
- [ ] Assignation d'intervention réussie (message de succès affiché)
- [ ] Logs backend montrent "Notification créée avec succès"
- [ ] Console navigateur montre "✅ Notification envoyée au technicien"
- [ ] Connexion avec compte technicien (ID correct)
- [ ] Badge 🔔 visible avec chiffre rouge
- [ ] Clic sur 🔔 affiche la notification

---

## 🆘 SI RIEN NE FONCTIONNE

**Partagez ces informations :**

1. **Logs backend** (copier les 20 dernières lignes après assignation)
2. **Console navigateur** (copier les erreurs en rouge)
3. **Onglet Network** (F12 → Network → Filtrer "notification")
4. **Résultat de cette requête SQL :**
```sql
SELECT * FROM notification ORDER BY created_at DESC LIMIT 5;
```

---

## ✅ SUCCÈS - CE QUE VOUS DEVRIEZ VOIR

**1. Après assignation (Admin) :**
```
Message: "Technicien assigné avec succès ✅ Notification envoyée !"
```

**2. Logs backend :**
```
✅ Notification créée avec succès - ID: 42
```

**3. Connexion technicien :**
```
Badge 🔔 1   ← Chiffre rouge
```

**4. Clic sur 🔔 :**
```
🔧 Nouvelle Intervention Assignée

Une nouvelle intervention vous a été assignée.

N° Intervention: #10
Description: Test

02/11/2025 12:20:15
```

---

**Suivez ces étapes dans l'ordre et partagez à quelle étape cela bloque !**
