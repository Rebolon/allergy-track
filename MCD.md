# Modèle Conceptuel de Données (MCD)

Ce document décrit la structure de la base de données PocketBase. **Toute modification du modèle de données doit être reportée ici.**

```mermaid
erDiagram
    users ||--o{ accesses : "a des"
    profiles ||--o{ accesses : "est géré par"
    profiles ||--o{ daily_logs : "contient"
    profiles ||--o| gamification : "progression de"
    profiles ||--o| profiles_config : "configuration de"
    profiles ||--o{ invitations : "peut générer"
    users ||--o{ invitations : "utilise"

    users {
        string id PK
        string email
        string name
        string role "Supervision | Allergique"
        string themePreference
    }

    profiles {
        string id PK
        string name
        date birthDate
        string themePreference
        string onboardingStep "choice | protocol | completed"
    }

    accesses {
        string id PK
        string userId FK "Relation -> users.id (Cascade Delete)"
        string profileId FK "Relation -> profiles.id (Cascade Delete)"
        string role "owner | editor | reader"
    }

    daily_logs {
        string id PK
        string profileId FK "Relation -> profiles.id (Cascade Delete)"
        date date
        json intakes
        json symptoms
        json treatments
        string note
        string updatedBy "User ID"
    }

    profiles_config {
        string id PK
        string profileId FK "Relation -> profiles.id (Cascade Delete)"
        string startDate "Date format text"
        json protocols
        json symptoms
        json medicsShields
    }

    gamification {
        string id PK
        string profileId FK "Relation -> profiles.id (Unique, Cascade Delete)"
        number totalStreakPoints
        number perfectPoints
        number longestStreak
        date lastCelebrationAt
        string lastPointAt
    }

    invitations {
        string id PK
        string code "6 chars uppercase"
        string profileId FK "Relation -> profiles.id (Cascade Delete)"
        string permission "editor | reader"
        date expiresAt
        string usedBy FK "Relation -> users.id (Cascade Delete)"
    }
```

## Règles de Gestion (ACL)

- **Propriété** : Définie par une ligne dans `accesses` avec le rôle `owner`. Les propriétaires ont tous les droits sur le profil, ses logs et sa gamification.
- **Partage (Édition)** : Définie par le rôle `editor`. Permet la lecture et la modification des logs, du profil et de la gamification.
- **Partage (Lecture)** : Définie par le rôle `reader`. Permet uniquement la consultation.
- **Isolation** : Chaque `daily_log`, record `gamification` et `profiles_config` est rattaché à un unique `profileId`.
- **Suppression en cascade** : La suppression d'un `profile` entraîne automatiquement la suppression de ses `accesses`, `daily_logs`, `profiles_config`, `gamification` et `invitations`.
