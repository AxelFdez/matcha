# Matcha

Application de rencontres développée avec Vue.js, Node.js/Express et PostgreSQL.

## Architecture

### Stack Technologique
- **Frontend**: Vue 3 + Vue Router + Vuex + Tailwind CSS
- **Backend**: Node.js + Express + JWT Authentication
- **Base de données**: PostgreSQL
- **Containerisation**: Docker + Docker Compose
- **Real-time**: WebSockets

### Structure du projet
```
matcha/
├── frontend/           # Application Vue.js
├── backend/            # API Node.js/Express
├── docker-compose.yml  # Configuration Docker
└── package.json        # Scripts Docker
```

## Installation et démarrage

### Prérequis
- Docker et Docker Compose
- Node.js (optionnel pour développement local)

### Démarrage rapide avec Docker
```bash
# Installation complète (build + démarrage + initialisation BDD)
npm run setup

# Ou étape par étape :
npm run docker:build     # Construire les images
npm run docker:up        # Démarrer les services
npm run docker:db:init   # Créer les tables
npm run docker:db:seed   # Insérer des données de test
```

### Mode développement
```bash
npm run dev              # Démarrage avec logs en temps réel
```

## Services disponibles

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:8080 | Interface utilisateur Vue.js |
| Backend API | http://localhost:3000 | API REST + WebSockets |
| PostgreSQL | localhost:5435 | Base de données |
| Adminer | http://localhost:8081 | Interface de gestion BDD |

## Scripts disponibles

### Gestion Docker
```bash
npm run docker:up        # Démarrer les services
npm run docker:down      # Arrêter les services
npm run docker:restart   # Redémarrer
npm run docker:clean     # Nettoyage complet
npm run stop             # Arrêt simple
```

### Base de données
```bash
npm run docker:db:init   # Créer les tables PostgreSQL
npm run docker:db:seed   # Remplir avec données de test
```

### Logs
```bash
npm run docker:logs              # Tous les logs
npm run docker:backend:logs      # Logs backend
npm run docker:frontend:logs     # Logs frontend
npm run docker:postgres:logs     # Logs PostgreSQL
```

## Configuration

Copiez `.env.example` vers `.env` et ajustez les variables :

```bash
# PostgreSQL (conteneur)
PGUSER=postgres
PGHOST=postgres  
PGDATABASE=matcha
PGPASSWORD=matcha_password
PGPORT=5435

# Application
FRONT_URL=http://localhost:8080
JWT_SECRET=your_secret_key
```

## Fonctionnalités

- ✅ Inscription/Connexion utilisateur
- ✅ Profils utilisateur avec photos
- ✅ Géolocalisation
- ✅ Système de likes/matches
- ✅ Chat en temps réel
- ✅ Notifications
- ✅ Système de blocage/signalement

## Base de données

### Connexion via Adminer
1. Aller sur http://localhost:8081
2. Serveur: `postgres`
3. Utilisateur: `postgres`
4. Mot de passe: `matcha_password`
5. Base: `matcha`

### Connexion directe
```bash
# Depuis le conteneur
docker-compose exec postgres psql -U postgres -d matcha

# Depuis l'host (si psql installé)
psql -h localhost -p 5435 -U postgres -d matcha
```

## Développement

### Architecture Backend
- `routes/` - Points d'entrée API
- `utils/` - Logique métier
- `models/` - Modèles de données
- `middlewares/` - JWT, CORS, etc.
- `scripts/` - Initialisation BDD

### Architecture Frontend
- `pages/` - Composants de pages
- `components/` - Composants réutilisables
- `store/` - État global Vuex
- `router/` - Configuration des routes
- `config/` - Configuration API

## Troubleshooting

### Erreurs courantes
- **Port déjà utilisé**: Modifier les ports dans `docker-compose.yml`
- **Erreur CORS**: Vérifier `FRONT_URL` dans les variables d'environnement
- **BDD non initialisée**: Lancer `npm run docker:db:init`

### Reset complet
```bash
npm run docker:clean    # Supprime tout (containers, volumes, images)
npm run setup           # Réinstallation complète
```