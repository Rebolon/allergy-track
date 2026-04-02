# Allergy Track - Règles Métiers 🏥

Ce document détaille les règles de gestion et de calcul au cœur de l'application Allergy Track.

## 👥 Profils Utilisateurs

L'application gère deux types d'utilisateurs via le système de **Personas** :

1.  **Enfant** : Interface ludique (« Flashy »), mise en avant de la gamification (flammes, confettis).
2.  **Adulte / Médical** : Interface sobre (« Classique »), accès aux outils de supervision et aux suivis détaillés.

---

## 💉 Suivi des Protocoles

Chaque jour, l'enfant doit enregistrer la prise de ses doses d'allergènes (ex: Cracotte, Noix de Cajou, Cacahuète).

- **Prise Complète** : Toutes les doses cochées.
- **Prise Partielle** : Au moins une dose cochée mais pas toutes.
- **Oubli** : Aucune dose cochée ou journée non saisie.

---

## 🎮 Gamification & Streaks

L'application utilise deux types de compteurs pour encourager la régularité :

### 🔥 Flamme de Régularité (Regular Streak)
- **Objectif** : Encourager la saisie quotidienne du journal.
- **Règle** : S'incrémente si **au moins 1 dose** est prise dans la journée.
- **Rupture** : La flamme tombe à zéro si une journée complète est manquée (0 dose prise ou pas de saisie).

### ⭐ Étoile Parfaite (Perfect Streak)
- **Objectif** : Récompenser le respect strict du protocole médical.
- **Règle** : S'incrémente uniquement si **100% des doses** prévues sont prises.
- **Condition d'affichage** : L'étoile ne devient visible qu'après **7 jours consécutifs** de flamme régulière.
- **Récompense** : Des confettis explosent tous les 7 jours de perfection (7, 14, 21...).

---

## 📊 Supervision (Tableau de Bord)

Le tableau de bord permet à l'adulte de visualiser l'état de santé du patient sur une période donnée (mois en cours par défaut).

### Règle de Détection des Oublis (Doses)
Le compteur d'oublis suit une logique de **"1 oubli par jour"** :
- **Journée avec oubli(s)** : Si au moins une dose est manquée dans la journée, cela compte pour **1 oubli**.
- **Journée non saisie** : Si aucune donnée n'est enregistrée pour une date passée, cela compte pour **1 oubli**.

### Feu Tricolore (Santé)
Le statut global de la période est calculé selon les priorités suivantes :

| Statut | Condition | Signification |
| :--- | :--- | :--- |
| 🚨 **ROUGE** | > 2 jours d'oublis **OU** symptômes sévères **OU** prise de traitements (Antihistaminique, etc.) | Situation critique nécessitant une attention immédiate. |
| 🤔 **ORANGE** | 1 à 2 jours d'oublis **OU** symptômes légers (Démangeaisons bouche) | Vigilance requise, protocole légèrement perturbé. |
| 😎 **VERT** | 0 oubli **ET** 0 symptôme | Protocole parfaitement suivi. |

---

## 🩺 Symptômes & Traitements

Les symptômes sont classés par gravité pour le calcul du statut :
- **Légers** : Démangeaisons bouche.
- **Sévères** : Respiratoire, Abdominal, Autres.

La prise de traitements (Antihistaminique, Aerius, Adrénaline) déclenche automatiquement un statut **ROUGE** dans la supervision car elle indique une réaction allergique traitée.
