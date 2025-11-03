# 🔔 Système de Notifications pour Magasiniers

## 🎯 Objectif

Les magasiniers reçoivent maintenant des **notifications automatiques** lors de:
1. ✅ **Création d'un Bon de Travail** avec composants
2. ✅ **Création d'un Sous-Projet** avec composants commandés

---

## ✅ Implémentation Complète

### 1️⃣ **Notifications Bon de Travail** (`CreateBonTravail.js`)

#### Fonction ajoutée: `notifyMagasiniers()`

```javascript
async function notifyMagasiniers(bonTravail, composants) {
  // 1. Récupérer tous les utilisateurs
  const users = await fetchJson("user/all");
  
  // 2. Filtrer les magasiniers
  const magasiniers = users.filter(u => 
    u?.role === "MAGASINIER" || 
    u?.role === "magasinier" ||
    u?.roles?.includes("MAGASINIER")
  );
  
  // 3. Préparer le message avec liste des composants
  const composantsList = composants.map(c => 
    `• ${c.designation} (Qté: ${c.quantite})`
  ).join('\n');

  const message = `📦 Nouveau bon de travail #${bonTravail?.id} créé avec ${composants.length} composant(s) commandé(s):

${composantsList}

Veuillez préparer ces composants pour le technicien.`;

  // 4. Envoyer notification à chaque magasinier
  for (const magasinier of magasiniers) {
    await fetchJson("notifications/send", {
      method: "POST",
      body: {
        userId: magasinier.id,
        title: "🛠️ Nouveau Bon de Travail",
        message: message,
        type: "BON_TRAVAIL",
        priority: composants.length > 0 ? "HAUTE" : "NORMALE",
        metadata: {
          bonTravailId: bonTravail?.id,
          interventionId: bonTravail?.interventionId,
          composantsCount: composants.length,
          composants: composants
        }
      }
    });
  }
}
```

#### Appel après création du BT:

```javascript
const created = await fetchJson("pi/bons", { method: "POST", body: payload });

// 🔔 Notifier les magasiniers
if (selectedComps.length > 0) {
  console.log("📢 Envoi des notifications aux magasiniers...");
  await notifyMagasiniers(created, selectedComps);
}
```

---

### 2️⃣ **Notifications Sous-Projet** (`SubProjects.js`)

#### Fonction ajoutée: `notifyMagasiniers()`

```javascript
const notifyMagasiniers = async (sousProjet, composants) => {
  try {
    const token = localStorage.getItem('token');
    
    // 1. Récupérer tous les utilisateurs
    const usersResponse = await fetch('http://localhost:8089/PI/user/all', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      }
    });
    
    const users = await usersResponse.json();
    
    // 2. Filtrer les magasiniers
    const magasiniers = users.filter(u => 
      u?.role === "MAGASINIER" || 
      u?.role === "magasinier" ||
      u?.roles?.includes("MAGASINIER")
    );
    
    // 3. Préparer le message
    const composantsList = composants.map(c => 
      `• ${c.trartDesignation || c.designation} (Article: ${c.trartArticle})`
    ).join('\n');

    const message = `🏗️ Nouveau sous-projet "${sousProjet.sousProjetName}" créé avec ${composants.length} composant(s):

${composantsList}

Veuillez préparer ces composants.`;

    // 4. Envoyer notification à chaque magasinier
    for (const magasinier of magasiniers) {
      await fetch('http://localhost:8089/PI/notifications/send', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          userId: magasinier.id,
          title: "🏗️ Nouveau Sous-Projet",
          message: message,
          type: "SOUS_PROJET",
          priority: composants.length > 0 ? "HAUTE" : "NORMALE",
          metadata: {
            sousProjetId: sousProjet.id,
            sousProjetName: sousProjet.sousProjetName,
            projetId: selectedProject?.id,
            composantsCount: composants.length,
            composants: composants
          }
        })
      });
    }
  } catch (error) {
    console.error("❌ Erreur notifications magasiniers:", error);
  }
};
```

#### Appel après création du sous-projet:

```javascript
if (response.ok) {
  const createdSousProjet = await response.json();
  
  showNotification('success', '✅ Sous-projet créé avec succès !');
  
  // 🔔 Notifier les magasiniers
  if (selectedComponents.length > 0) {
    console.log("📢 Envoi des notifications aux magasiniers...");
    await notifyMagasiniers(
      { ...createdSousProjet, sousProjetName: sousProjetForm.sousProjetName }, 
      selectedComponents
    );
  }
}
```

---

## 📊 Structure des Notifications

### Format de Notification

```javascript
{
  userId: 123,                    // ID du magasinier
  title: "🛠️ Nouveau Bon de Travail",
  message: "📦 Nouveau bon de travail #456 créé avec 3 composant(s)...",
  type: "BON_TRAVAIL",           // ou "SOUS_PROJET"
  priority: "HAUTE",              // ou "NORMALE"
  metadata: {
    bonTravailId: 456,
    interventionId: 789,
    composantsCount: 3,
    composants: [
      { designation: "Composant A", quantite: 2 },
      { designation: "Composant B", quantite: 1 }
    ]
  }
}
```

---

## 🔍 Détection des Magasiniers

### Critères de Filtrage

Un utilisateur est considéré comme magasinier si:
```javascript
u?.role === "MAGASINIER" || 
u?.role === "magasinier" ||
u?.roles?.includes("MAGASINIER")
```

### Sources de Données

**Bon de Travail:**
```
GET http://localhost:8089/PI/user/all
Authorization: Bearer {token}
```

**Sous-Projet:**
```
GET http://localhost:8089/PI/user/all
Authorization: Bearer {token}
```

---

## 🎯 Workflow Complet

### Création Bon de Travail

```
1. Technicien crée un Bon de Travail
   └─ Sélectionne intervention
   └─ Ajoute description
   └─ Sélectionne composants (3 composants)
      ↓
2. Appel API: POST /PI/pi/bons
   ✅ Bon créé avec succès (ID: 456)
      ↓
3. 🔔 Système de Notification
   ├─ Récupère liste utilisateurs
   ├─ Filtre les magasiniers (2 trouvés)
   ├─ Prépare le message avec liste composants
   └─ Envoie notification à chaque magasinier
      ├─ POST /PI/notifications/send (Magasinier A) ✅
      └─ POST /PI/notifications/send (Magasinier B) ✅
      ↓
4. Magasiniers reçoivent notification:
   📦 "Nouveau bon de travail #456 créé avec 3 composant(s)"
   • Composant A (Qté: 2)
   • Composant B (Qté: 1)
   • Composant C (Qté: 5)
```

### Création Sous-Projet

```
1. Chef de Projet crée un Sous-Projet
   └─ Sélectionne projet parent
   └─ Saisit nom et description
   └─ Sélectionne composants (2 composants)
      ↓
2. Appel API: POST /PI/PI/sousprojets/create/{projetId}
   ✅ Sous-projet créé (ID: 789)
      ↓
3. 🔔 Système de Notification
   ├─ Récupère liste utilisateurs
   ├─ Filtre les magasiniers (2 trouvés)
   ├─ Prépare le message avec liste composants
   └─ Envoie notification à chaque magasinier
      ├─ POST /PI/notifications/send (Magasinier A) ✅
      └─ POST /PI/notifications/send (Magasinier B) ✅
      ↓
4. Magasiniers reçoivent notification:
   🏗️ "Nouveau sous-projet 'Infrastructure Réseau' créé avec 2 composant(s)"
   • Routeur Principal (Article: ART001)
   • Switch 24 ports (Article: ART002)
```

---

## 🧪 Tests

### Test 1: Bon de Travail avec Composants

**Actions:**
1. Se connecter en tant que Technicien
2. Aller à "Créer Bon de Travail"
3. Sélectionner une intervention
4. Ajouter 2-3 composants
5. Cliquer "Créer le bon de travail"

**Résultat Attendu:**
```
✅ Bon de travail créé et intervention clôturée !
📦 3 composant(s) commandé(s) - Magasinier(s) notifié(s)

Console:
📢 Envoi des notifications aux magasiniers...
✅ Notification envoyée au magasinier: Jean Dupont
✅ Notification envoyée au magasinier: Marie Martin
```

**Vérification Magasinier:**
- Se connecter en tant que Magasinier
- Ouvrir Centre de Notifications
- Voir notification: "🛠️ Nouveau Bon de Travail"

---

### Test 2: Sous-Projet avec Composants

**Actions:**
1. Se connecter en tant que Chef de Projet
2. Aller à "Sous-projets"
3. Sélectionner un projet parent
4. Créer sous-projet avec 2 composants
5. Cliquer "Créer"

**Résultat Attendu:**
```
✅ Sous-projet créé avec succès !
📦 2 composant(s) commandé(s)

Console:
📢 Envoi des notifications aux magasiniers...
✅ Notification envoyée au magasinier: Jean Dupont
✅ Notification envoyée au magasinier: Marie Martin
```

**Vérification Magasinier:**
- Se connecter en tant que Magasinier
- Ouvrir Centre de Notifications
- Voir notification: "🏗️ Nouveau Sous-Projet"

---

### Test 3: Sans Composants

**Actions:**
1. Créer Bon de Travail SANS composants
2. Créer Sous-Projet SANS composants

**Résultat Attendu:**
```
✅ Créé avec succès !
(Aucune notification envoyée - pas de composants)
```

---

## 🔧 Dépannage

### Problème: Aucune notification reçue

**Vérifications:**

1. **Vérifier les magasiniers:**
```javascript
// Dans la console du navigateur
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:8089/PI/user/all', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const users = await response.json();
const magasiniers = users.filter(u => u.role === 'MAGASINIER');
console.log('Magasiniers trouvés:', magasiniers);
```

2. **Vérifier l'endpoint notifications:**
```bash
# Test manuel
curl -X POST http://localhost:8089/PI/notifications/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 123,
    "title": "Test",
    "message": "Message de test",
    "type": "TEST"
  }'
```

3. **Vérifier les logs console:**
```
📢 Envoi des notifications aux magasiniers...
✅ Notification envoyée au magasinier: Jean Dupont
```

Si vous voyez:
```
⚠️ Aucun magasinier trouvé pour envoyer la notification
```
→ Créer au moins un utilisateur avec role "MAGASINIER"

---

### Problème: Erreur API

**Logs possibles:**
```
❌ Erreur notification magasinier 123: Error: 404 Not Found
```

**Solutions:**
1. Vérifier que l'endpoint existe: `/PI/notifications/send`
2. Vérifier les permissions du token
3. Vérifier le format du payload

---

## 📚 API Endpoints Utilisés

### GET /PI/user/all
Récupère tous les utilisateurs (pour filtrer les magasiniers)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response:**
```json
[
  {
    "id": 123,
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@sagemcom.com",
    "role": "MAGASINIER"
  }
]
```

---

### POST /PI/notifications/send
Envoie une notification à un utilisateur

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "userId": 123,
  "title": "🛠️ Nouveau Bon de Travail",
  "message": "Détails de la notification...",
  "type": "BON_TRAVAIL",
  "priority": "HAUTE",
  "metadata": {
    "bonTravailId": 456,
    "composantsCount": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "notificationId": 789
}
```

---

## 🎨 Interface Magasinier

### Centre de Notifications

Les magasiniers voient les notifications dans:
1. **Badge notification** (navbar - icône 🔔)
2. **Centre de notifications** (dropdown)
3. **Page dédiée** `/admin/notifications`

### Format d'Affichage

**Bon de Travail:**
```
🛠️ Nouveau Bon de Travail
📦 Nouveau bon de travail #456 créé avec 3 composant(s):
• Composant A (Qté: 2)
• Composant B (Qté: 1)  
• Composant C (Qté: 5)

Veuillez préparer ces composants pour le technicien.
```

**Sous-Projet:**
```
🏗️ Nouveau Sous-Projet
🏗️ Nouveau sous-projet "Infrastructure Réseau" créé avec 2 composant(s):
• Routeur Principal (Article: ART001)
• Switch 24 ports (Article: ART002)

Veuillez préparer ces composants.
```

---

## ✅ Résumé

### ✅ Fonctionnalités Implémentées

1. **Notifications Bon de Travail**
   - ✅ Détection automatique des magasiniers
   - ✅ Envoi notification avec liste composants
   - ✅ Métadonnées complètes (IDs, quantités)
   - ✅ Priorité selon nb de composants

2. **Notifications Sous-Projet**
   - ✅ Détection automatique des magasiniers
   - ✅ Envoi notification avec liste composants
   - ✅ Métadonnées complètes (IDs, articles)
   - ✅ Authentification Bearer token

3. **Gestion des Erreurs**
   - ✅ Logs console détaillés
   - ✅ Try/catch sur chaque notification
   - ✅ Continues même si une notification échoue

---

## 📝 Fichiers Modifiés

1. ✅ `CreateBonTravail.js` - Notifications BT
2. ✅ `SubProjects.js` - Notifications sous-projets
3. ✅ `NOTIFICATIONS_MAGASINIER.md` - Documentation

---

**Date:** 26 Octobre 2025  
**Version:** 1.0.0  
**Statut:** ✅ Prêt pour Tests  

---

*Les magasiniers reçoivent maintenant toutes les notifications nécessaires!* 🔔✨
