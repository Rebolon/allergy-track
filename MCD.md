# Modèle Conceptuel de Données (MCD)

Ce document décrit la structure de la base de données PocketBase. **Toute modification du modèle de données doit être reportée ici.**

```mermaid
erDiagram
    users ||--o{ accesses : "a des"
    profiles ||--o{ accesses : "est géré par"
    profiles ||--o{ daily_logs : "contient"

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
    }

    accesses {
        string id PK
        string userId FK "Relation -> users.id"
        string profileId FK "Relation -> profiles.id"
        string role "owner | editor | reader"
    }

    daily_logs {
        string id PK
        string profileId FK "Relation -> profiles.id"
        date date
        json intakes
        json symptoms
        json treatments
        string note
        string updatedBy "User ID"
    }
```

## Règles de Gestion (ACL)

- **Propriété** : Définie par une ligne dans `accesses` avec le rôle `owner`. Les propriétaires ont tous les droits sur le profil et ses logs.
- **Partage (Édition)** : Définie par le rôle `editor`. Permet la lecture et la modification des logs et du profil.
- **Partage (Lecture)** : Définie par le rôle `reader`. Permet uniquement la consultation.
- **Isolation** : Chaque `daily_log` est rattaché à un unique `profileId`.
