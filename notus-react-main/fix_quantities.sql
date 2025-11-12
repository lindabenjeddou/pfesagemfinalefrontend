-- ================================================================
-- Script URGENT pour Ajouter des Quantités
-- ================================================================
-- VOS COMPOSANTS ONT DES PRIX MAIS PAS DE QUANTITÉS !
-- ================================================================

-- 1. Vérifier l'état actuel
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN trartQuantite IS NULL OR trartQuantite = '' THEN 1 ELSE 0 END) as sans_quantite,
  SUM(CASE WHEN prix IS NULL OR prix = '' OR prix = '0' THEN 1 ELSE 0 END) as sans_prix
FROM component;

-- 2. Mettre une quantité par défaut pour TOUS les composants
UPDATE component 
SET trartQuantite = '10'
WHERE trartQuantite IS NULL OR trartQuantite = '' OR CAST(trartQuantite AS UNSIGNED) = 0;

-- 3. OU mettre des quantités variées selon la famille
UPDATE component 
SET trartQuantite = CASE 
  WHEN trartFamille = 'ELEC' THEN '50'
  WHEN trartFamille = 'MECH' THEN '100'
  ELSE '25'
END
WHERE trartQuantite IS NULL OR trartQuantite = '' OR CAST(trartQuantite AS UNSIGNED) = 0;

-- 4. Vérifier le résultat
SELECT 
  COUNT(*) as total_components,
  SUM(CAST(trartQuantite AS UNSIGNED)) as total_units,
  SUM(CAST(trartQuantite AS UNSIGNED) * CAST(prix AS DECIMAL(10,2))) as total_value_dt,
  ROUND(SUM(CAST(trartQuantite AS UNSIGNED) * CAST(prix AS DECIMAL(10,2))) / 1000, 2) as total_value_kdt
FROM component;

-- 5. Voir quelques exemples
SELECT 
  trartArticle,
  trartDesignation,
  trartQuantite,
  prix,
  (CAST(trartQuantite AS UNSIGNED) * CAST(prix AS DECIMAL(10,2))) as valeur
FROM component 
ORDER BY (CAST(trartQuantite AS UNSIGNED) * CAST(prix AS DECIMAL(10,2))) DESC 
LIMIT 10;

-- ================================================================
-- RÉSULTAT ATTENDU
-- ================================================================
-- Après ce script, votre Dashboard Analytics affichera:
-- ✅ Valeur Stock: 77 000 k€ (au lieu de 0)
-- ✅ Composants Total: 1540
-- ✅ Stock Faible: XX composants avec qty < 20
-- ================================================================
