# Feature: Système de Gamification - Points et Streaks

## Résumé
L'utilisateur souhaite un système de gamification avec:
- **Mode "Série en cours"**: accumule des points dès qu'on prend des doses lors de jours consécutifs
- **Mode "Parfait"**: accumule un point tous les 7 jours (avec parfait = toutes les doses prises)

## Bugs identifiés dans l'implémentation actuelle

### Bug 1: Celebration avec données obsolètes (grave)
**Fichier:** `frontend/src/app/components/daily-entry.component.ts:309-312`
```typescript
const currentState = this.gState();  // ← données AVANT le save
this.gamification.checkAndCelebrate(currentState);
```
Problème: Après `save()`, on lit l'état AVANT la sauvegarde, puis on rafraîchit ensuite. La celebration utilise des données "stale".

### Bug 2: Celebration se déclenche plusieurs fois
**Fichier:** `frontend/src/app/services/gamification.service.ts:116`
```typescript
if (state.perfectStreak > 0 && state.perfectStreak % 7 === 0)
```
Problème: Si l'utilisateur recharge la page avec streak=14, la celebration rejoue à chaque chargement.

### Bug 3: Confusion streak vs points
L'UI affiche "⭐ Parfait 14" qui peut signifier:
- 14 jours parfaits consécutifs, OU
- 14 points gagnés (2 paliers de 7)

### Bug 4: Streak parfait peut être inférieur à 7
Si `regularStreak = 5` et `perfectStreak = 5`, l'affichage montre `perfectStreak = 0` mais `currentPerfect = 5`. Cette valeur n'est pas utilisée.

## Solution recommandée: Hybrid

### Données à persister (nouvelle collection `user_gamification`)
```typescript
{
  userId: string;
  totalStreakPoints: number;      // Points série accumulés
  perfectPoints: number;          // Points parfaits accumulés
  longestStreak: number;          // Record de flamme
  lastCelebrationAt: timestamp;   // Anti-doublon confettis
}
```

### Pourquoi pas persister les streaks complets?
1. **Redondance**: `daily_logs` contient déjà les infos pour calculer un streak
2. **Migration complexe**: Risque d'incohérence si modification de logs
3. **Dette technique**: Sync complexe entre streak calculé et streak stocké

### Logique de calcul
- **À la sauvegarde d'un log**: recalculer le streak actuel, incrémenter les points si nouveau record ou palier atteint
- **Celebration**: uniquement si `lastCelebrationAt` < aujourd'hui ET palier atteint

## Questions en suspens

1. **Points rétroactifs?** Calculer les points pour les jours passés déjà en BDD, ou démarrer à partir de maintenant?

2. **Formule des points:**
   - Mode série: +1 point par jour consécutif, ou bien multiplier selon longueur du streak?
   - Mode parfait: 1 point tous les 7 jours parfaits?

3. **Structure de la collection:**
   - Un seul record par utilisateur? (plus simple)
   - Ou un record par période (semaine/mois) pour l'historique?

## Fichiers concernés
- `frontend/src/app/services/gamification.service.ts` - Calcul des streaks, celebration
- `frontend/src/app/components/daily-entry.component.ts` - Affichage, déclenchement celebration
- `frontend/src/app/app.ts` - Affichage gamification
- `pb_migrations/` - Nouvelle migration pour collection `user_gamification`
- `schema.json` - Schéma de la nouvelle collection
