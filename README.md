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

## 🛠️ Stack Technique

- **Frontend** : [Angular v19](https://angular.dev/) (utilisation intensive des `Signals`, `RxJS`, `Standalone Components`).
- **Styles** : [TailwindCSS v4](https://tailwindcss.com/) pour une interface totalement customisée et responsive.
- **Backend / BDD** : [PocketBase](https://pocketbase.io/) servant à la fois d'API REST légère (SQLite) et de serveur statique pour héberger le bundle Angular en production.
- **Outillage** : Docker Compose (pour orchestrer l'environnement de développement) et Taskfile (pour automatiser les scripts communs).

## 📋 Prérequis

- [Node.js](https://nodejs.org/en/) & npm
- [Docker](https://www.docker.com/) & Docker Compose
- [Task](https://taskfile.dev/) (optionnel, mais fortement recommandé pour exécuter les commandes du projet)

## 🏗️ Installation & Lancement

Le projet s'appuie sur le `Taskfile.yml` pour faciliter le démarrage.

### 1. Initialiser le projet

Installez les dépendances du frontend :

```bash
task install
```

### 2. Construire l'application

Compilez le frontend Angular (`dist/app/browser`) pour le préparer au déploiement via PocketBase :

```bash
task build
```

### 3. Démarrer le Serveur et la Base de Données

Démarrez le container Docker PocketBase (qui hébergera automatiquement votre frontend localement) :

```bash
task start
```

L'application sera alors accessible localement sur le conteneur PocketBase. (Par défaut : `http://localhost:8090`). Vous pouvez la stopper plus tard avec `task stop`.

### 4. Réinitialisation de la BDD (Développement)

En cas de soucis pendant l'intégration en phase de développement, vous pouvez vider entièrement la base de données :

```bash
task reset-db
```

_(Attention : L'application effacera toutes ses données)._

## 🛠️ Architecture du Projet

Le projet suit une structure séparée pour le frontend et le backend, orchestrée par Docker :

```text
allergy-track/
├── backend/            # Configuration PocketBase (Hook, Migrations)
├── frontend/           # Application Angular 19+
│   ├── src/            # Code source Angular (Components, Services, etc.)
│   └── proxy.conf.json # Configuration proxy pour le développement local
├── var/pb_data/        # Dossier de persistence de la BDD (Volume Docker)
├── Dockerfile          # Construction de l'image de production multi-stage
├── docker-compose.yml  # Orchestration pour le déploiement
└── Taskfile.yml        # Automatisation des commandes fréquentes
```

## 💻 Développement Local

Pour travailler sur le frontend tout en bénéficiant de la base de données :

1.  **Démarrer PocketBase** : 
    ```bash
    task start
    ```
2.  **Lancer Angular (HMR)** :
    ```bash
    cd frontend
    npm start
    ```
    *Le frontend sera disponible sur `http://localhost:4200` et communiquera avec le backend `localhost:8090` via un proxy.*

## 🐳 Déploiement sur Synology

Allergy Track est optimisé pour un déploiement sur NAS Synology via Docker :

1.  **Image Docker** : Clonez le dépôt et construisez l'image via `task build-and-start` ou transférez vos fichiers.
2.  **Persistance** : Le dossier `./var/pb_data` sur votre NAS conservera toutes les données même après une mise à jour de l'image.
3.  **Reverse Proxy** :
    - Allez dans `Panneau de configuration > Portail de connexion > Avancé > Proxy inversé`.
    - Créez une règle : `https://allergy-track.votre-domaine.com` vers `http://localhost:8090`.
    - Activez les certificats SSL Let's Encrypt pour cet hôte.
4.  **Mises à jour** : Pour mettre à jour, faites un `git pull`, `task build` et `task restart`.

## 📜 Règles Métiers (Domain)

Pour plus de détails sur le calcul des scores, de la gamification et de la supervision, consultez [DOMAIN.md](./DOMAIN.md).

## TODO

- check notification on android & ios (maybe check service worker notification https://angular.dev/ecosystem/service-workers/push-notifications)
- add login / account creation (basic) : parent creation, and invite system based with email and link (then child will have to create his account that will be linked to parent)
