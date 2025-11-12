-- ================================================================
-- Script pour Confirmer des Interventions
-- ================================================================
-- Actuellement: 14 interventions, 0 confirmées (0%)
-- Objectif: Avoir un taux de confirmation réaliste (60-70%)
-- ================================================================

-- 1. Vérifier l'état actuel
SELECT 
  COUNT(*) as total_interventions,
  SUM(CASE WHEN confirmation = 1 THEN 1 ELSE 0 END) as confirmed,
  SUM(CASE WHEN confirmation = 0 THEN 1 ELSE 0 END) as pending,
  ROUND(SUM(CASE WHEN confirmation = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as taux_confirmation
FROM demande;

-- 2. Confirmer 60% des interventions (environ 8 sur 14)
UPDATE demande 
SET confirmation = 1
WHERE id <= 8;

-- 3. OU confirmer par statut (les terminées)
UPDATE demande 
SET confirmation = 1
WHERE statut = 'TERMINEE';

-- 4. OU confirmer aléatoirement 60%
UPDATE demande 
SET confirmation = 1
WHERE id IN (
  SELECT id FROM (
    SELECT id FROM demande 
    ORDER BY RAND() 
    LIMIT 8
  ) as random_sample
);

-- 5. Vérifier le nouveau taux
SELECT 
  COUNT(*) as total,
  SUM(confirmation) as confirmed,
  ROUND(SUM(confirmation) * 100.0 / COUNT(*), 1) as taux_confirmation_percent
FROM demande;

-- 6. Voir le détail
SELECT 
  id,
  description,
  statut,
  confirmation,
  CASE WHEN confirmation = 1 THEN '✅ Confirmée' ELSE '⏳ En attente' END as status
FROM demande
ORDER BY id;

-- ================================================================
-- RÉSULTAT ATTENDU
-- ================================================================
-- Taux de Service: 0% → 57% (8 confirmées sur 14)
-- ================================================================
