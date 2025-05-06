# Documentation Frontend

## Aperçu

Ce projet est une application React moderne construite avec Vite. L'application fournit une interface utilisateur complète avec système d'authentification, gestion de profil utilisateur et design responsive utilisant Tailwind CSS.

## Technologies

- **React 19** - Bibliothèque UI
- **Vite** - Outil de build et serveur de développement
- **React Router 7** - Routage côté client
- **Axios** - Client HTTP pour les requêtes API
- **Tailwind CSS** - Framework CSS utilitaire
- **ESLint** - Linter pour maintenir la qualité du code

## Structure du projet

```
frontend/
├── src/
│   ├── assets/        # Ressources statiques (images, icônes)
│   ├── components/    # Composants réutilisables
│   │   └── auth/      # Composants liés à l'authentification
│   ├── contexts/      # Contextes React (gestion d'état global)
│   ├── pages/         # Composants de pages principales
│   ├── services/      # Services pour les appels API
│   ├── utils/         # Fonctions utilitaires
│   ├── App.jsx        # Composant racine avec configuration des routes
│   ├── main.jsx       # Point d'entrée de l'application
│   └── index.css      # Styles globaux
├── public/            # Fichiers statiques accessibles publiquement
├── index.html         # Template HTML principal
└── vite.config.js     # Configuration de Vite
```

## Fonctionnalités principales

- **Système d'authentification complet**

  - Inscription et connexion
  - Réinitialisation de mot de passe
  - Routes protégées pour les utilisateurs authentifiés
  - Gestion des tokens JWT

- **Navigation responsive**

  - Barre de navigation adaptative
  - Menu mobile

- **Profil utilisateur**
  - Visualisation et modification des informations utilisateur
  - Gestion des paramètres de compte

## Configuration et installation

### Prérequis

- Node.js (v16+)
- npm ou yarn

### Installation

```bash
# Cloner le dépôt (si ce n'est pas déjà fait)
git clone [URL_DU_REPO]

# Accéder au répertoire frontend
cd frontend

# Installer les dépendances
npm install
```

### Scripts disponibles

- `npm run dev` - Lance le serveur de développement avec Hot Module Replacement
- `npm run build` - Compile l'application pour la production
- `npm run lint` - Vérifie le code avec ESLint
- `npm run preview` - Prévisualise la version de production

## Développement

### Architecture

L'application utilise l'architecture basée sur les composants de React avec Context API pour la gestion d'état global. Les appels API sont centralisés dans les services pour maintenir une séparation claire des préoccupations.

### Authentification

L'authentification est gérée via le AuthContext qui fournit:

- Fonctions de connexion/déconnexion
- Stockage sécurisé des tokens
- Vérification de l'état d'authentification
- Protection des routes

### Stylisation

Tailwind CSS est utilisé pour un développement rapide et des designs responsifs. Les classes utilitaires permettent une personnalisation facile des composants.

## Déploiement

L'application peut être déployée sur n'importe quelle plateforme supportant des applications web statiques (Vercel, Netlify, etc.).

```bash
# Construire l'application
npm run build

# Les fichiers de production seront générés dans le dossier 'dist'
```
