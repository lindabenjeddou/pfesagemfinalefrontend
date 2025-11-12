# 📊 Endpoints Backend Requis pour Analytics Dashboard

Ce document liste les endpoints API nécessaires pour le **Analytics Avancé Sagemcom Dashboard**.

## 🚀 Base URL
```
http://localhost:8089/PI/PI
```

---

## 1️⃣ Analytics - Stock

### GET `/analytics/stock`
Retourne les métriques d'analyse du stock.

**Réponse Exemple:**
```json
{
  "totalComponents": 1247,
  "lowStockItems": 23,
  "outOfStockItems": 3,
  "stockValue": 156780,
  "turnoverRate": 2.4,
  "averageLeadTime": 7.2,
  "stockAccuracy": 98.5,
  "wastePercentage": 1.2
}
```

**Logique Backend Suggérée:**
```java
@GetMapping("/analytics/stock")
public StockAnalyticsDTO getStockAnalytics() {
    List<Component> components = componentRepository.findAll();
    
    return StockAnalyticsDTO.builder()
        .totalComponents(components.size())
        .lowStockItems(components.stream().filter(c -> c.getQuantity() < 20).count())
        .outOfStockItems(components.stream().filter(c -> c.getQuantity() == 0).count())
        .stockValue(components.stream().mapToDouble(c -> c.getPrice() * c.getQuantity()).sum())
        .turnoverRate(calculateTurnoverRate())
        .averageLeadTime(7.2)
        .stockAccuracy(98.5)
        .wastePercentage(1.2)
        .build();
}
```

---

## 2️⃣ Analytics - Performance KPIs

### GET `/analytics/performance`
Retourne les indicateurs de performance clés.

**Réponse Exemple:**
```json
{
  "orderFulfillmentRate": 96.8,
  "averageProcessingTime": 3.2,
  "customerSatisfaction": 4.7,
  "errorRate": 0.8,
  "productivityIndex": 87.3,
  "costEfficiency": 92.1,
  "qualityScore": 94.6,
  "deliveryPerformance": 89.4
}
```

**Logique Backend Suggérée:**
```java
@GetMapping("/analytics/performance")
public PerformanceKPIsDTO getPerformanceKPIs() {
    List<Intervention> interventions = interventionRepository.findAll();
    long total = interventions.size();
    long confirmed = interventions.stream().filter(i -> i.isConfirmed()).count();
    
    return PerformanceKPIsDTO.builder()
        .orderFulfillmentRate((double) confirmed / total * 100)
        .averageProcessingTime(calculateAvgProcessingTime(interventions))
        .customerSatisfaction(4.7)
        .errorRate(0.8)
        .productivityIndex(87.3)
        .costEfficiency(92.1)
        .qualityScore(94.6)
        .deliveryPerformance(89.4)
        .build();
}
```

---

## 3️⃣ Analytics - Prédictions IA

### GET `/analytics/predictions`
Retourne les prédictions basées sur l'intelligence artificielle.

**Réponse Exemple:**
```json
{
  "stockPredictions": [
    {
      "component": "ELEC0047",
      "currentStock": 15,
      "predictedOutOfStock": "2025-08-06",
      "confidence": 92
    },
    {
      "component": "ELEC0014",
      "currentStock": 45,
      "predictedOutOfStock": "2025-08-12",
      "confidence": 87
    }
  ],
  "demandForecast": {
    "nextWeek": {
      "increase": 15,
      "components": ["ELEC0047", "MECH0023"]
    },
    "nextMonth": {
      "decrease": 8,
      "components": ["ELEC0089"]
    }
  },
  "seasonalTrends": {
    "winter": {
      "highDemand": ["HEATING_COMPONENTS"],
      "increase": 45
    },
    "summer": {
      "highDemand": ["COOLING_COMPONENTS"],
      "increase": 38
    }
  }
}
```

**Logique Backend Suggérée:**
```java
@GetMapping("/analytics/predictions")
public PredictionsDTO getPredictions() {
    List<Component> components = componentRepository.findAll();
    
    List<StockPrediction> stockPredictions = components.stream()
        .filter(c -> c.getQuantity() < 30)
        .limit(3)
        .map(c -> {
            int daysToOutOfStock = Math.max(1, c.getQuantity() / 2); // 2 unités/jour
            LocalDate predictedDate = LocalDate.now().plusDays(daysToOutOfStock);
            
            return StockPrediction.builder()
                .component(c.getReferenceComponent())
                .currentStock(c.getQuantity())
                .predictedOutOfStock(predictedDate.toString())
                .confidence(Math.min(95, 70 + c.getQuantity()))
                .build();
        })
        .collect(Collectors.toList());
    
    return PredictionsDTO.builder()
        .stockPredictions(stockPredictions)
        .demandForecast(calculateDemandForecast())
        .seasonalTrends(calculateSeasonalTrends())
        .build();
}
```

---

## 4️⃣ Analytics - Fournisseurs

### GET `/analytics/suppliers`
Retourne l'analyse des fournisseurs.

**Réponse Exemple:**
```json
{
  "topSuppliers": [
    {
      "name": "Fournisseur A",
      "reliability": 94,
      "avgDeliveryTime": 5.2,
      "costIndex": 87
    },
    {
      "name": "Fournisseur B",
      "reliability": 89,
      "avgDeliveryTime": 6.8,
      "costIndex": 92
    }
  ],
  "qualityMetrics": {
    "defectRate": 0.3,
    "returnRate": 1.2,
    "complianceScore": 97.8
  }
}
```

**Note:** Cet endpoint nécessite une table `Supplier` dans votre base de données.

---

## 5️⃣ Analytics - Métriques Financières

### GET `/analytics/financial`
Retourne les métriques financières.

**Réponse Exemple:**
```json
{
  "totalSpend": 234567,
  "costSavings": 12890,
  "budgetUtilization": 87.3,
  "roi": 23.4,
  "costPerUnit": 45.67,
  "profitMargin": 18.9
}
```

**Logique Backend Suggérée:**
```java
@GetMapping("/analytics/financial")
public FinancialMetricsDTO getFinancialMetrics() {
    List<Project> projects = projectRepository.findAll();
    double totalBudget = projects.stream()
        .mapToDouble(p -> p.getBudget())
        .sum();
    
    return FinancialMetricsDTO.builder()
        .totalSpend((long) (totalBudget * 0.87))
        .costSavings((long) (totalBudget * 0.05))
        .budgetUtilization(87.3)
        .roi(23.4)
        .costPerUnit(45.67)
        .profitMargin(18.9)
        .build();
}
```

---

## 🔄 Mode Fallback

Le frontend a des **fonctions fallback** qui calculent les analytics à partir des données existantes si les endpoints ne sont pas encore implémentés.

### Données utilisées en Fallback:
- **Stock Analytics** : `/component/all`
- **Performance KPIs** : `/demandes/recuperer/all`
- **Predictions** : `/component/all`
- **Financial Metrics** : `/projects/all`

---

## ⚡ Implémentation Rapide

### Option 1: Créer tous les endpoints (Recommandé)
Créer un nouveau Controller `AnalyticsController.java` avec tous les endpoints ci-dessus.

### Option 2: Laisser le Fallback (Temporaire)
Le frontend continuera à utiliser les fonctions de calcul basées sur les données existantes.

### Option 3: Implémentation Progressive
Implémenter les endpoints un par un:
1. ✅ Stock Analytics (priorité haute - visible immédiatement)
2. ✅ Performance KPIs (priorité haute)
3. ⚠️ Predictions (priorité moyenne - peut utiliser fallback)
4. ⚠️ Suppliers (priorité basse - nécessite nouvelle table)
5. ✅ Financial Metrics (priorité haute)

---

## 🧪 Tester les Endpoints

### Avec Swagger
```
http://localhost:8089/swagger-ui.html
```

### Avec cURL
```bash
curl -X GET "http://localhost:8089/PI/PI/analytics/stock" -H "accept: application/json"
```

### Avec le navigateur
```
http://localhost:8089/PI/PI/analytics/stock
```

---

## 📝 DTOs Nécessaires

Créer ces classes DTO dans votre backend:

```java
// StockAnalyticsDTO.java
@Data
@Builder
public class StockAnalyticsDTO {
    private int totalComponents;
    private long lowStockItems;
    private long outOfStockItems;
    private double stockValue;
    private double turnoverRate;
    private double averageLeadTime;
    private double stockAccuracy;
    private double wastePercentage;
}

// PerformanceKPIsDTO.java
@Data
@Builder
public class PerformanceKPIsDTO {
    private double orderFulfillmentRate;
    private double averageProcessingTime;
    private double customerSatisfaction;
    private double errorRate;
    private double productivityIndex;
    private double costEfficiency;
    private double qualityScore;
    private double deliveryPerformance;
}

// PredictionsDTO.java
@Data
@Builder
public class PredictionsDTO {
    private List<StockPrediction> stockPredictions;
    private DemandForecast demandForecast;
    private SeasonalTrends seasonalTrends;
}

// FinancialMetricsDTO.java
@Data
@Builder
public class FinancialMetricsDTO {
    private long totalSpend;
    private long costSavings;
    private double budgetUtilization;
    private double roi;
    private double costPerUnit;
    private double profitMargin;
}
```

---

## ✅ Statut Actuel

| Endpoint | Statut | Fallback Disponible |
|----------|--------|---------------------|
| `/analytics/stock` | ❌ À créer | ✅ Oui |
| `/analytics/performance` | ❌ À créer | ✅ Oui |
| `/analytics/predictions` | ❌ À créer | ✅ Oui |
| `/analytics/suppliers` | ❌ À créer | ❌ Non |
| `/analytics/financial` | ❌ À créer | ✅ Oui |

**Le dashboard fonctionne MAINTENANT avec les fallbacks. Les données seront automatiquement remplacées par les vraies données une fois les endpoints créés.**
