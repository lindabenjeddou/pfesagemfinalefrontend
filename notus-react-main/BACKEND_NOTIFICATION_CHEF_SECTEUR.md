# 📋 IMPLÉMENTATION BACKEND : Notification Chef Secteur

## 🎯 OBJECTIF
Envoyer une notification automatique au(x) Chef(s) de Secteur lorsqu'une nouvelle intervention est créée, pour qu'ils puissent assigner un technicien et un testeur.

---

## 🔧 MODIFICATIONS BACKEND REQUISES

### 1️⃣ **Ajouter le type de notification dans NotificationType.java**

**Fichier :** `src/main/java/tn/esprit/PI/entity/NotificationType.java`

```java
public enum NotificationType {
    COMPONENT_ORDER,
    STOCK_UPDATE,
    SOUS_PROJET_CREATED,
    INTERVENTION_ASSIGNED,      // ← Existant
    INTERVENTION_CREATED,       // ← NOUVEAU à ajouter
    GENERAL
}
```

---

### 2️⃣ **Créer la méthode dans NotificationService.java**

**Fichier :** `src/main/java/tn/esprit/PI/Service/NotificationService.java`

**Ajouter cette méthode :**

```java
@Transactional
public void notifyChefsSecteurForNewIntervention(Long interventionId, String interventionDescription) {
    System.out.println("🔍 === DÉBUT notifyChefsSecteurForNewIntervention ===");
    System.out.println("🔍 InterventionId: " + interventionId);
    System.out.println("🔍 Description: " + interventionDescription);
    
    try {
        // Récupérer tous les utilisateurs avec le rôle CHEF_SECTEUR
        List<User> chefsSecteur = userRepository.findByRole(Role.CHEF_SECTEUR);
        
        System.out.println("🔍 Nombre de chefs de secteur trouvés: " + chefsSecteur.size());
        
        if (chefsSecteur.isEmpty()) {
            System.out.println("⚠️ Aucun chef de secteur trouvé dans la base de données");
            return;
        }
        
        // Créer une notification pour chaque chef de secteur
        for (User chefSecteur : chefsSecteur) {
            Notification notification = new Notification();
            notification.setTitle("📋 Nouvelle Intervention à Assigner");
            notification.setMessage(
                "Une nouvelle intervention a été créée.\n\n" +
                "N° Intervention: #" + interventionId + "\n" +
                "Description: " + interventionDescription + "\n\n" +
                "Veuillez assigner un technicien et un testeur."
            );
            notification.setType(NotificationType.INTERVENTION_CREATED);
            notification.setRecipient(chefSecteur);
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setPriority("HIGH");  // Priorité élevée car action requise
            notification.setStatus("UNREAD");
            
            notificationRepository.save(notification);
            System.out.println("✅ Notification créée pour chef secteur ID: " + chefSecteur.getId());
        }
        
        System.out.println("✅ === FIN notifyChefsSecteurForNewIntervention ===");
        
    } catch (Exception e) {
        System.err.println("❌ Erreur lors de la création des notifications: " + e.getMessage());
        e.printStackTrace();
    }
}
```

---

### 3️⃣ **Ajouter la méthode dans UserRepository.java**

**Fichier :** `src/main/java/tn/esprit/PI/Repository/UserRepository.java`

**Ajouter cette méthode :**

```java
import tn.esprit.PI.entity.Role;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    
    // ... autres méthodes existantes ...
    
    // NOUVEAU : Trouver tous les utilisateurs par rôle
    List<User> findByRole(Role role);
}
```

---

### 4️⃣ **Créer l'endpoint dans NotificationController.java**

**Fichier :** `src/main/java/tn/esprit/PI/RestControlleur/NotificationController.java`

**Ajouter cet endpoint :**

```java
@PostMapping("/nouvelle-intervention")
public ResponseEntity<String> notifyChefsSecteurForNewIntervention(
        @RequestParam Long interventionId,
        @RequestParam String interventionDescription) {
    
    System.out.println("📬 Endpoint /nouvelle-intervention appelé");
    System.out.println("📬 InterventionId: " + interventionId);
    System.out.println("📬 Description: " + interventionDescription);
    
    try {
        notificationService.notifyChefsSecteurForNewIntervention(
            interventionId, 
            interventionDescription
        );
        return ResponseEntity.ok("Notifications envoyées aux chefs de secteur");
    } catch (Exception e) {
        System.err.println("❌ Erreur endpoint notification: " + e.getMessage());
        return ResponseEntity.status(500).body("Erreur lors de l'envoi des notifications");
    }
}
```

---

### 5️⃣ **Vérifier SecurityConfiguration.java**

**Fichier :** `src/main/java/tn/esprit/PI/config/SecurityConfiguration.java`

**Vérifier que cette ligne existe déjà :**

```java
.requestMatchers("/PI/notifications/**").permitAll()
```

✅ **Cette ligne existe déjà** (ligne 79), donc l'endpoint `/PI/PI/notifications/nouvelle-intervention` sera autorisé.

---

## 🧪 TESTS

### **Test 1 : Créer une intervention depuis le frontend**

1. Connectez-vous comme utilisateur normal
2. Créez une nouvelle intervention
3. Vérifiez les logs backend :

```
🔍 === DÉBUT notifyChefsSecteurForNewIntervention ===
🔍 InterventionId: 15
🔍 Description: Test notification
🔍 Nombre de chefs de secteur trouvés: 1
✅ Notification créée pour chef secteur ID: 3
✅ === FIN notifyChefsSecteurForNewIntervention ===
```

### **Test 2 : Se connecter comme Chef Secteur**

1. Connectez-vous avec un compte CHEF_SECTEUR
2. Badge 🔔 avec chiffre rouge devrait apparaître
3. Cliquez pour voir la notification :

```
📋 Nouvelle Intervention à Assigner

Une nouvelle intervention a été créée.

N° Intervention: #15
Description: Test notification

Veuillez assigner un technicien et un testeur.

02/11/2025 12:45:30
```

---

## 📊 VÉRIFICATION SQL

**Vérifier les chefs de secteur dans la base :**

```sql
SELECT id, email, firstname, lastname, role 
FROM users 
WHERE role = 'CHEF_SECTEUR';
```

**Vérifier les notifications créées :**

```sql
SELECT n.id, n.title, n.message, n.type, n.recipient_id, u.email, u.role
FROM notifications n
JOIN users u ON n.recipient_id = u.id
WHERE n.type = 'INTERVENTION_CREATED'
ORDER BY n.created_at DESC
LIMIT 10;
```

---

## ✅ CHECKLIST IMPLÉMENTATION

- [ ] Ajouter `INTERVENTION_CREATED` dans enum `NotificationType`
- [ ] Créer méthode `notifyChefsSecteurForNewIntervention()` dans `NotificationService`
- [ ] Ajouter méthode `findByRole()` dans `UserRepository`
- [ ] Créer endpoint POST `/nouvelle-intervention` dans `NotificationController`
- [ ] Vérifier que `/PI/notifications/**` est autorisé dans `SecurityConfiguration`
- [ ] Redémarrer le backend Spring Boot
- [ ] Tester la création d'une intervention
- [ ] Vérifier la réception de notification par le chef de secteur

---

## 🎯 RÉSULTAT ATTENDU

**Workflow complet :**

1. **Utilisateur crée intervention** → Frontend appelle `/demandes/create`
2. **Backend crée intervention** → Retourne l'intervention avec son ID
3. **Frontend appelle notification** → POST `/PI/PI/notifications/nouvelle-intervention`
4. **Backend crée notifications** → Pour tous les CHEF_SECTEUR
5. **Chef Secteur se connecte** → Voit badge 🔔 avec chiffre rouge
6. **Chef Secteur clique** → Voit la notification avec détails
7. **Chef Secteur assigne** → Technicien et testeur

---

## 🚀 PRÊT POUR L'IMPLÉMENTATION !

Une fois ces modifications appliquées dans le backend, le système de notifications sera complet :
- ✅ Notifications aux techniciens lors de l'assignation
- ✅ Notifications aux chefs de secteur lors de la création d'intervention

**Le frontend est déjà prêt et appelle automatiquement l'endpoint !** 🎉
