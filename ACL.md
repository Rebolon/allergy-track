 # 🔐 Access Control List (ACL)
Ce document définit les droits d'accès et les permissions pour chaque ressource de l'application Allergy Track, basés sur les rôles
utilisateur et les relations de partage.

## 👥 Rôles & Niveaux d'Accès

Il existe deux types de segmentation des droits :
1.  **Rôle Utilisateur (`users.role`)** : Définit le type de compte global.
    - `Supervision` : Peut voir les journaux d'audit et gérer plusieurs profils (ex: parents).
    - `Allergique` : Interface centrée sur son propre suivi.
2.  **Rôle d'Accès au Profil (`accesses.role`)** : Définit les droits sur un dossier (Profil) spécifique.
    - `owner` (Propriétaire) : Contrôle total du profil (Paramètres, Suppression, Partage).
    - `editor` (Éditeur) : Peut saisir des données quotidiennes et modifier la configuration technique.
    - `reader` (Lecteur) : Consultation uniquement (Tableaux de bord).

## 📋 Matrice des Droits par Use Case
| Use Case | Profil Associé (`owner`) | Profil Associé (`editor`) | Profil Associé (`reader`) | Profil Non Associé |
| :--- | :---: | :---: | :---: | :---: |
| **Profils** | | | | |
| Voir les infos du profil | ✅ | ✅ | ✅ | ❌ (404) |
| Modifier le nom / avatar | ✅ | ❌ | ❌ | ❌ |
| Supprimer le profil | ✅ | ❌ | ❌ | ❌ |
| **Protocoles & Config** | | | | |
| Voir le protocole / seuils | ✅ | ✅ | ✅ | ❌ |
| Modifier le protocole | ✅ | ✅ | ❌ | ❌ |
| **Saisies Quotidiennes** | | | | |
| Voir l'historique (Agenda) | ✅ | ✅ | ✅ | ❌ |
| Créer / Modifier une dose | ✅ | ✅ | ❌ | ❌ |
| Supprimer une saisie | ✅ | ✅ | ❌ | ❌ |
| **Gamification** | | | | |
| Voir les scores / badges | ✅ | ✅ | ✅ | ❌ |
| Réinitialiser les scores | ✅ | ✅ | ❌ | ❌ |
| **Partage & Invitations** | | | | |
| Créer un code d'invitation | ✅ | ❌ | ❌ | ❌ |
| Révoquer un accès existant | ✅ | ❌ | ❌ | ❌ |
| **Administration** | | | | |
| Voir les logs d'audit | ⚠️ (1) | ❌ | ❌ | ❌ |

*(1) Uniquement si l'utilisateur a le rôle global `Supervision`.*

## 🛠️ Implémentation Technique (PocketBase)

Les règles sont appliquées au niveau de la base de données (Row Level Security) via les API Rules des collections :

### Collection `profiles`
- **View/List** : `@collection.accesses.profileId ?= id && @collection.accesses.userId ?= @request.auth.id`
- **Update/Delete** : `@collection.accesses.role ?= 'owner'`

### Collection `daily_logs` / `profiles_config`
- **View/List** : `@collection.accesses.profileId ?= profileId && @collection.accesses.userId ?= @request.auth.id`
- **Create/Update/Delete** : `(@collection.accesses.role ?= 'owner' || @collection.accesses.role ?= 'editor')`

### Collection `audit_logs`
- **View/List** : `@request.auth.role = 'Supervision'`