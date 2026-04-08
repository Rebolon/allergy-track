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

### 🎮 Système de Progression (Tiers)
L'application utilise une progression par paliers pour récompenser la régularité et la perfection, en évitant la lassitude :

1.  **🔥 Tier 1 : Flamme de Régularité**
    *   **Condition** : Moins de 7 jours de perfection consécutifs.
    *   **Affichage** : Nombre de jours avec au moins 1 dose prise. Encourager le début du traitement.

2.  **⭐ Tier 2 : Étoile Parfaite (Mode Semaines)**
    *   **Condition** : Dès 7 jours de perfection (100% des doses).
    *   **Evolution** : La Flamme est remplacée par l'Étoile.
    *   **Unité** : On compte en **Semaines Parfaites** (1 étoile = 7 jours). Le score n'évolue que tous les 7 jours.
    *   **Engagement** : Un compte à rebours ("J-X avant la prochaine étoile") incite à maintenir la perfection.

3.  **🏆 Tier 3 : Trophée d'Excellence**
    *   **Condition** : 4 semaines de perfection accumulées (28 jours).
    *   **Evolution** : L'Étoile est remplacée par le Trophée.
    *   **Récompense** : Marque le passage à un niveau d'expertise médicale et de maîtrise du protocole.

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

---

## 🔧 Résilience & Erreurs Distantes

L'application Allergy Track est conçue pour être résiliente face aux éventuelles coupures réseau ou indisponibilités du serveur PocketBase.

### Détection des Erreurs
Un **HTTP Interceptor** surveille toutes les communications avec l'API. Deux types d’erreurs critiques sont capturés :
1.  **Erreurs Réseau (Status 0)** : Le serveur est injoignable (problème de connexion internet ou serveur éteint).
2.  **Erreurs Critiques (Status >= 500)** : Le serveur rencontre une erreur interne majeure.

### Gestion du Blocage
Dès qu'une telle erreur survient lors du chargement initial ou d'une action utilisateur :
- Un **Service d'Erreur Global** (`ErrorService`) est notifié via un Signal.
- Une **Modale de Blocage** ("Oups il y a un problème !") s'affiche au-dessus de toute l'interface.
- L'utilisateur est empêché d'interagir avec des données potentiellement obsolètes ou de faire des saisies qui ne pourraient pas être sauvegardées.

### Récupération
La modale propose un bouton **"Réessayer"** qui force le rechargement complet de la page (`window.location.reload()`). Cela permet de réinitialiser l'application proprement dès que le lien avec le serveur est rétabli.
