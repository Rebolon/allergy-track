# Liste des appels HTTP (Scope BDD 100%)

Ce document liste tous les points de terminaison API utilisés par l'application pour interagir avec le backend PocketBase.

## 1. Authentification & Utilisateur
| Méthode | URL | Description |
| :--- | :--- | :--- |
| POST | `/api/collections/users/auth-with-password` | Connexion utilisateur |
| PATCH | `/api/collections/users/records/:id` | Mise à jour profil utilisateur (nom, role, thème) |

## 2. Profils & Accès
| Méthode | URL | Description |
| :--- | :--- | :--- |
| GET | `/api/collections/profiles/records` | Liste les profils |
| POST | `/api/collections/profiles/records` | Création d'un profil |
| PATCH | `/api/collections/profiles/records/:id` | Mise à jour d'un profil (nom, avatar, étape onboarding) |
| DELETE | `/api/collections/profiles/records/:id` | Suppression d'un profil (avec suppression en cascade des accès/logs) |
| GET | `/api/collections/accesses/records` | Récupère les permissions pour un utilisateur |
| POST | `/api/collections/accesses/records` | Crée un lien d'accès (propriétaire/éditeur/lecteur) entre un utilisateur et un profil |

## 3. Configuration du Profil (Protocoles & Symptômes)
| Méthode | URL | Description |
| :--- | :--- | :--- |
| GET | `/api/collections/profiles_config/records` | Récupère la configuration (protocoles, symptômes, boucliers) |
| POST | `/api/collections/profiles_config/records` | Initialise la configuration d'un profil |
| PATCH | `/api/collections/profiles_config/records/:id` | Met à jour la configuration d'un profil |

## 4. Journaux Quotidiens (Daily Logs)
| Méthode | URL | Description |
| :--- | :--- | :--- |
| GET | `/api/collections/daily_logs/records` | Récupère les saisies (filtre par date ou profil) |
| POST | `/api/collections/daily_logs/records` | Enregistre une nouvelle saisie quotidienne |

## 5. Gamification
| Méthode | URL | Description |
| :--- | :--- | :--- |
| GET | `/api/collections/gamification/records` | Récupère les points et séries (streaks) |
| POST | `/api/collections/gamification/records` | Initialise les données de gamification |
| PATCH | `/api/collections/gamification/records/:id` | Met à jour les points ou la série |

## 6. Partage & Invitations
| Méthode | URL | Description |
| :--- | :--- | :--- |
| POST | `/api/collections/invitations/records` | Génère un code d'invitation |
| GET | `/api/collections/invitations/records` | Vérifie la validité d'un code |
| PATCH | `/api/collections/invitations/records/:id` | Marque un code comme utilisé |
