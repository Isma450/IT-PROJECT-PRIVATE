# Documentation Frontend

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

### Authentification

L'authentification est gérée via le AuthContext qui fournit:

- Fonctions de connexion/déconnexion
- Stockage sécurisé des tokens
- Vérification de l'état d'authentification
- Protection des routes

Création d’un blog
Application React + backend Django + BDD + Documentation

L’essentiel du projet:

Documentation:
Conception Dev
Page de connexion utilisateur,
Page d’affichage des Post,
Page A propos de l’auteur,
Page de rédaction de post,

Un post une fois publié sera visible à tout le monde.

Si un utilisateur est enregistré, il pourra laisser un commentaire ainsi qu’un emoji sur le post
un compteur du nombre de clic sur l’émoji est présent

Si l’utilisateur connecté à déjà cliqué, re cliquer dessus retire du compteur l’emoji qu’il a mis.
Si l’utilisateur n’est pas connecté il ne peut que visionner les post et les emojis ainsi que leur compteur, mais ne peux pas cliquer sur les emojis

Si la personne connectée est un administrateur, un lien vers la page de rédaction de post est visible
la page de rédaction de post doit être protégée afin qu’aucun utilisateur de type user ne puisse y accéder
Les post affiche au maximum 5 lignes de texte
Pour afficher le post complet un bouton + ouvrira le post en entier (au choix dans une modale, ou dans un nouvel onglet)
Affichage de 5 commentaires max pour chaque post, avec une pagination s’il y a plus
Si on est dans l’affichage complet du post, affichage de tous les commentaire

Rendu du projet:

Toute la documentation doit être rendue au minimum une semaine avant la soutenance.
Le code doit être hébergé sur Github et partagé dans la documentation
La soutenance sera sous la forme d’une présentation en équipe le 13 mai 2025, il faudra partager le temps de parole, présenter chaque point de votre application sur une durée de 20 minutes.
La note sera collective au groupe.

Idées de features supplémentaires:
Système de tag des articles
Insertion de Gif dans le commentaires,
Réalisation de la partie mot de passe oublié avec un système de token
Edition de l'article/commentaire
Dark/Light mode
Ajout d’un système d’IA dans la création de contenu:
Possibilité de demander à une IA d’améliorer/corriger le texte qui a déjà été écrit

Ajout posts
-> postservice
->createpost.jsx
->app jsx
->navbar
->adminroute
