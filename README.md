# Allergy Track 📝🍎

Allergy Track est une application web PWA moderne conçue pour accompagner les patients (enfants et adultes) dans leur protocole de désensibilisation aux allergies alimentaires.

L'application permet d'enregistrer quotidiennement les prises d'allergènes, l'apparition de potentiels symptômes, ainsi que l'administration des traitements prescrits. Son architecture s'adapte à l'âge et au profil de l'utilisateur avec un système de **thèmes dynamiques** et une riche dimension de **gamification**.

## 🚀 Fonctionnalités Clés

- **Suivi Quotidien** : Saisie rapide des doses (Cacahuètes, Noix de Cajou, etc.), des traitements (Antihistaminique, Adrénaline) et des symptômes observés.
- **Thèmes Personnalisés** : Un design adaptatif proposant un look « Flashy 🌈 » très coloré pour stimuler les enfants, ou un look « Classique 🕶️ » plus sobre pour le profil médical ou adolescent.
- **Gamification & Récompenses** :
  - 🔥 **Flamme de Régularité** : Récompense simplement le fait de maintenir le rythme et de remplir le journal, même partiellement.
  - ⭐ **L'Étoile Parfaite** : Récompense les parcours sans-fautes (100% des doses prévues cochées). Des **Confettis** explosent à des intervalles précis (7, 14, 21 jours parfaits consécutifs) !
- **Tableau de Bord Sprint** : Visualisation en mode feu tricolore (VERT, ORANGE, ROUGE) de l'état de santé sur le mois en cours.
- **Résilience & Gestion d'Erreurs** : Système de détection automatique des pertes de connexion avec le serveur distant. En cas de coupure (réseau ou serveur), une modale de blocage sécurise l'application et propose une reconnexion par rafraîchissement.

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

## 📜 Règles Métiers (Domain)
Consultez [DOMAIN.md](./DOMAIN.md) pour les détails sur la gamification.

## TODO
- Check push notifications (Service Worker)
- Système d'invitation parent/enfant par email
