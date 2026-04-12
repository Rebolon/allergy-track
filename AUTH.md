# Configuration de l'Authentification 🔐

Allergy Track utilise un système d'authentification hybride basé sur **PocketBase**. Vous pouvez vous connecter soit via un compte Email/Mot de passe classique, soit via le SSO de votre NAS Synology (OpenID Connect).

## 1. Authentification par Email
C'est le mode par défaut. Les utilisateurs sont créés directement dans la collection `users` de PocketBase.
- **Admin UI** : Accessible sur `http://votre-nas:8090/_/`
- **Configuration** : Assurez-vous que l'option "Password auth" est activée dans `Settings > Auth providers > Password`.

## 2. Authentification Synology SSO (OIDC)
Pour utiliser le bouton "Se connecter avec Synology" sur l'écran d'accueil :

### Étape A : Configurer Synology NAS
1. Ouvrez **SSO Server** sur votre Synology.
2. Allez dans **Application Service**.
3. Cliquez sur **Ajouter** :
   - **Nom** : `Allergy Track`
   - **URI de redirection** : `https://votre-domaine.com` (Doit être en HTTPS pour OIDC).
4. Notez l'**ID client** et le **Secret client**.

### Étape B : Configurer PocketBase
1. Allez dans l'interface d'administration PocketBase.
2. `Settings > Auth providers > OIDC`.
3. Activez le fournisseur et remplissez :
   - **Name** : `synology`
   - **Client ID** : (celui de l'étape A)
   - **Client Secret** : (celui de l'étape A)
   - **Issuer URL** : `https://NAS_IP_OR_DOMAIN:5001/realms/synology` (Vérifiez l'URL exacte dans votre config Synology).
   - **Auth URL** : `https://NAS_IP_OR_DOMAIN:5001/as/authorization`
   - **Token URL** : `https://NAS_IP_OR_DOMAIN:5001/as/token`
   - **User Info URL** : `https://NAS_IP_OR_DOMAIN:5001/as/userinfo`

## 3. Comportement du Frontend
L'application Angular détecte automatiquement le mode de fonctionnement :
- **Mode Développement (`ng serve`)** : Utilise le `MockAuthAdapter`. 
    - **Non connecté par défaut** pour permettre de tester le formulaire.
    - **Comptes Mocks** : Utilisez `parent@example.com` ou `patient@example.com` avec le mot de passe **`demo`**.
- **Mode Production (Docker)** : Utilise le `PocketbaseAuthAdapter`. Communique avec l'instance PocketBase locale.

## 4. Sécurité & HTTPS
Le SSO OIDC nécessite généralement une connexion sécurisée. 
- Si vous utilisez le **Proxy Inversé** de Synology, assurez-vous de générer un certificat **Let's Encrypt** pour votre domaine.
- L'URI de redirection configurée dans Synology doit exactement correspondre à l'URL de base de votre application.
