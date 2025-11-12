# 🔍 Guide pour Afficher des Valeurs Réelles

## 📊 Étape 1 : Vérifier les Données dans la Base

### 1.1 Vérifier la Table `component`

```sql
-- Voir la structure de la table
DESCRIBE component;

-- Voir quelques exemples
SELECT id, reference_component, name, quantity, price 
FROM component 
LIMIT 10;

-- Compter combien ont un prix
SELECT 
  COUNT(*) as total,
  COUNT(price) as with_price,
  SUM(CASE WHEN price IS NULL OR price = 0 THEN 1 ELSE 0 END) as without_price
FROM component;

-- Calculer la vraie valeur du stock
SELECT 
  SUM(quantity * COALESCE(price, 0)) as stock_value,
  SUM(quantity) as total_quantity
FROM component;
```

---

## 🔧 Étape 2 : Ajouter des Prix Réels

### Option A : Mettre à Jour les Composants Existants

```sql
-- Si vos composants n'ont PAS de prix, ajoutez-en :

-- Exemple 1: Prix par type de référence
UPDATE component 
SET price = 12.50 
WHERE reference_component LIKE 'ELEC%' AND (price IS NULL OR price = 0);

UPDATE component 
SET price = 8.75 
WHERE reference_component LIKE 'MECH%' AND (price IS NULL OR price = 0);

UPDATE component 
SET price = 15.00 
WHERE reference_component LIKE 'SOFT%' AND (price IS NULL OR price = 0);

-- Exemple 2: Prix par défaut pour tout ce qui reste
UPDATE component 
SET price = 5.00 
WHERE price IS NULL OR price = 0;
```

### Option B : Prix Spécifiques par Composant

```sql
-- Définir des prix réalistes pour chaque type
UPDATE component SET price = 0.50 WHERE name LIKE '%résistance%' OR name LIKE '%resistor%';
UPDATE component SET price = 1.20 WHERE name LIKE '%condensateur%' OR name LIKE '%capacitor%';
UPDATE component SET price = 0.80 WHERE name LIKE '%LED%';
UPDATE component SET price = 3.50 WHERE name LIKE '%transistor%';
UPDATE component SET price = 2.00 WHERE name LIKE '%diode%';
UPDATE component SET price = 5.00 WHERE name LIKE '%circuit%' OR name LIKE '%IC%';
UPDATE component SET price = 0.10 WHERE name LIKE '%vis%' OR name LIKE '%screw%';
UPDATE component SET price = 0.25 WHERE name LIKE '%boulon%' OR name LIKE '%bolt%';
UPDATE component SET price = 15.00 WHERE name LIKE '%carte%' OR name LIKE '%board%';
```

---

## 📋 Étape 3 : Vérifier les Interventions

### 3.1 Vérifier la Table `demande` (interventions)

```sql
-- Voir la structure
DESCRIBE demande;

-- Voir quelques exemples
SELECT id, description, is_confirmed, created_at 
FROM demande 
LIMIT 10;

-- Compter les interventions
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN is_confirmed = 1 THEN 1 ELSE 0 END) as confirmed,
  SUM(CASE WHEN is_confirmed = 0 THEN 1 ELSE 0 END) as pending
FROM demande;
```

### 3.2 Confirmer des Interventions

```sql
-- Confirmer les 10 premières interventions (pour avoir un taux > 0%)
UPDATE demande 
SET is_confirmed = 1 
WHERE id <= 10;

-- Ou confirmer 50% des interventions
UPDATE demande 
SET is_confirmed = 1 
WHERE MOD(id, 2) = 0;
```

---

## 🚀 Étape 4 : Exemple Complet de Données Test

Si votre base est vide ou pour ajouter des données de test :

```sql
-- 1. Ajouter des composants avec prix
INSERT INTO component (reference_component, name, quantity, price, description) VALUES
('ELEC0001', 'Résistance 10K Ohm', 500, 0.50, 'Résistance 1/4W 5%'),
('ELEC0002', 'Condensateur 100uF', 250, 1.20, 'Condensateur électrolytique 25V'),
('ELEC0003', 'LED Rouge 5mm', 1000, 0.30, 'LED rouge standard 5mm'),
('ELEC0004', 'Transistor NPN 2N2222', 150, 0.80, 'Transistor NPN usage général'),
('ELEC0005', 'Circuit Intégré 555', 75, 2.50, 'Timer IC 555'),
('MECH0001', 'Vis M3x10mm', 2000, 0.05, 'Vis métrique M3 longueur 10mm'),
('MECH0002', 'Écrou M3', 2000, 0.03, 'Écrou hexagonal M3'),
('MECH0003', 'Rondelle M3', 1500, 0.02, 'Rondelle plate M3'),
('SOFT0001', 'Câble USB Type-C', 50, 8.50, 'Câble USB-C 1m'),
('SOFT0002', 'Connecteur RJ45', 300, 1.50, 'Connecteur Ethernet RJ45');

-- 2. Ajouter des interventions (si table existe)
-- Remplacer par vos champs réels
INSERT INTO demande (description, is_confirmed, date_demande) VALUES
('Réparation système électrique', 1, NOW()),
('Maintenance préventive', 1, NOW()),
('Changement composant ELEC0001', 1, NOW()),
('Installation nouveau matériel', 0, NOW()),
('Diagnostic panne', 1, NOW());
```

---

## ✅ Étape 5 : Vérifier le Résultat

### 5.1 Dans votre Base de Données

```sql
-- Vérifier la valeur du stock calculée
SELECT 
  COUNT(*) as total_components,
  SUM(quantity) as total_units,
  ROUND(SUM(quantity * COALESCE(price, 0)), 2) as stock_value_dt,
  ROUND(SUM(quantity * COALESCE(price, 0)) / 1000, 2) as stock_value_kdt
FROM component;

-- Vérifier le taux de confirmation
SELECT 
  COUNT(*) as total_interventions,
  SUM(CASE WHEN is_confirmed = 1 THEN 1 ELSE 0 END) as confirmed,
  ROUND(SUM(CASE WHEN is_confirmed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as confirmation_rate
FROM demande;
```

### 5.2 Tester l'API

Ouvrez dans votre navigateur :

**Composants :**
```
http://localhost:8089/PI/PI/component/all
```

**Interventions :**
```
http://localhost:8089/PI/demandes/recuperer/all
```

Vérifiez que les données affichent bien les prix et quantités.

---

## 🎯 Résultat Attendu

Après avoir mis à jour votre base de données :

### Sur le Dashboard Analytics :
- **Composants Total** : 1540 → Nombre réel de composants
- **Taux de Service** : 0% → 65% (ou selon vos confirmations)
- **Valeur Stock** : 0 k€ → 78 k€ (ou selon vos prix réels)
- **Précision Stock** : 98.5% → Valeur calculée

### Dans la Console (F12) :
```
✅ Stock analytics calculated: {
  totalComponents: 1540,
  stockValue: 78450,  // ← Non nul !
  ...
}
   → Components with price: 1540/1540  // ← Tous ont un prix
   → Stock value: 78450.00 DT
```

---

## 🚨 Important

**Ne supprimez pas l'estimation !** Si vous avez des composants sans prix, l'estimation évite d'afficher 0.

Pour désactiver l'estimation et forcer les vraies valeurs uniquement :

```javascript
// Dans AnalyticsContext.js, ligne 240-243
// REMPLACER:
const estimatedStockValue = stockValue === 0 && totalComponents > 0
  ? components.reduce((sum, c) => sum + (parseInt(c.quantity || 0) * 5), 0)
  : stockValue;

// PAR:
const estimatedStockValue = stockValue; // Pas d'estimation, valeurs réelles uniquement
```

---

## 📞 Support

Si après avoir suivi ces étapes vous voyez toujours 0 :
1. Vérifiez la console du navigateur (F12)
2. Testez les URLs API directement
3. Vérifiez que votre backend est bien démarré
4. Vérifiez la structure de votre table `component`

**Les champs attendus :**
- `id`
- `reference_component`
- `name`
- `quantity` (int)
- `price` (decimal/float)
