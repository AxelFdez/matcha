FROM node:22-alpine3.21

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY . .

# Créer le dossier pour les photos uploadées
RUN mkdir -p photos/tmp

# Exposer le port
EXPOSE 3000

# Démarrer l'application directement avec node
CMD ["node", "./bin/www"]