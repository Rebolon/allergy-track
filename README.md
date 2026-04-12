# Allergy Track 📝🍎

Allergy Track est une application web PWA moderne conçue pour accompagner les patients dans leur protocole de désensibilisation aux allergies alimentaires ou autres.

L'application permet d'enregistrer quotidiennement les prises d'allergènes, l'apparition de potentiels symptômes, ainsi que l'administration des traitements prescrits. Son architecture s'adapte aux préférences de l'utilisateur avec un système de **Personas** dynamiques et une riche dimension de **gamification**.

## 🚀 Fonctionnalités Clés

- **Multi-Profils & Famille** : Gérez plusieurs dossiers (enfants, proches) depuis un compte unique. Basculez instantanément entre les profils via un système d'onglets intelligents.
- **Dossiers Locaux & Invités** : Créez des dossiers locaux pour les enfants sans compte, ou invitez d'autres utilisateurs à superviser vos données via un système de codes sécurisés.
- **Suivi Quotidien Isolé** : Chaque profil possède son propre protocole, son historique de doses (Cacahuètes, Noix de Cajou, etc.), ses traitements et ses symptômes.
- **Authentification Hybride** : Connexion sécurisée via le SSO Synology ou par Email/Mot de passe pour une installation flexible.
- **Themes & Personas** : Un design adaptatif proposant un look « Flashy 🌈 » ludique, ou un look « Classique 🕶️ » plus médical, configurable par profil.
- **Gamification Individualisée** : Calcul des flammes, étoiles et trophées spécifique à chaque profil pour une motivation maximale.
- **Bilan Santé (Supervision)** : Dashboard complet en mode feu tricolore (VERT, ORANGE, ROUGE) pour surveiller en un coup d'œil l'état de santé de tous vos proches.

## 🛠️ Stack Technique

- **Frontend** : [Angular v19](https://angular.dev/) (utilisation intensive des `Signals`, `RxJS`, `Standalone Components`).
- **Styles** : [TailwindCSS v4](https://tailwindcss.com/) pour une interface totalement customisée et responsive.
- **Backend / BDD** : [PocketBase](https://pocketbase.io/) servant à la fois d'API REST légère (SQLite) et de serveur statique pour héberger le bundle Angular en production.
- **Outillage** : Docker Compose (orchestration) et Taskfile (automatisation).

## 📋 Prérequis

- [Node.js](https://nodejs.org/en/) & npm
- [Docker](https://www.docker.com/) & Docker Compose
- [Task](https://taskfile.dev/) (fortement recommandé pour exécuter les commandes du projet)

## 🏗️ Installation & Lancement

Le projet s'appuie sur le `Taskfile.yml` pour faciliter le démarrage.

### 1. Initialiser le projet
```bash
task install
```

### 2. Construire et Lancer (Développement)
```bash
task build
task start
```
L'application sera accessible sur `http://localhost:8090`.

### 3. Administration (Super-utilisateur)
Pour configurer l'interface d'admin PocketBase (`/admin/`) :
```bash
task upsert-admin
```
*(Défaut : `admin@allergy-track.local` / `admin123456`)*

### 4. Réinitialisation de la BDD
Pour vider entièrement la base de données (Volume Docker) :
```bash
task reset-db
```

## 🏷️ Versioning & Suivi de Build
Une étiquette de version est injectée dans le footer lors du build :
- **v.YYYY-MM-DD_HH:MM (hash)**
Cela permet de confirmer visuellement que le déploiement sur le Synology est bien à jour.

## 🛠️ Architecture du Projet

```text
allergy-track/
├── backend/            # Config PocketBase (Hook, Migrations, Schema)
├── frontend/           # Application Angular 19+
│   ├── src/app/        # Code source Angular
│   └── src/environments/version.ts # Auto-généré au build
├── Dockerfile          # Image multi-stage (Build + Prod)
├── docker-compose.yml  # Orchestration des services
└── Taskfile.yml        # Automatisation (SUDO, Update, Build)
```

> [!IMPORTANT]
> **Persistance des données** : Les données sont stockées dans un **Volume Nommé Docker** (`pb_data`). Elles sont persistantes mais invisibles sur votre système de fichiers hôte pour garder le projet propre.

## 💻 Développement Local (HMR)

Pour travailler sur le frontend avec rechargement à chaud :
1. Démarrer PocketBase : `task start`
2. Lancer Angular : `cd frontend && npm start` (disponible sur `http://localhost:4200`)

## 🐳 Déploiement sur Synology

1.  **Configuration** : Dans `Taskfile.yml`, réglez `SUDO: 'sudo'` si nécessaire.
2.  **Mise à jour rapide** : Pour mettre à jour l'application en une commande :
    ```bash
    task update
    ```
    *(Effectue un git pull, reconstruit l'image et redémarre le conteneur).*
3.  **Reverse Proxy** :
    - `Panneau de configuration > Portail de connexion > Avancé > Proxy inversé`.
    - `https://votre-domaine.com` (443) -> `http://localhost:8090` (8090).

## 📜 Règles Métiers & Sécurité
- Consultez [DOMAIN.md](./DOMAIN.md) pour les détails sur la gamification et les rôles.
- Consultez [AUTH.md](./AUTH.md) pour configurer le SSO Synology ou l'accès Email.

## TODO
- Check push notifications (Service Worker)
- Optimization for multi-device real-time sync
- Advanced charts for long-term health trends

