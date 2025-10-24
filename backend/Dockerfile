FROM node:22-alpine3.21

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (prod + dev)
RUN npm install && npm cache clean --force

# Copier le code source
COPY . .

# Créer le dossier pour les photos uploadées
RUN mkdir -p photos/tmp

EXPOSE 3000

# Lancer en mode hot reload permanent
CMD ["npm", "run", "reload"]
