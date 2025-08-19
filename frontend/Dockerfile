FROM node:22-alpine3.21 as build-stage

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (dev et production)
RUN npm ci && npm cache clean --force

# Copier le code source
COPY . .

# Construire l'application pour la production
RUN npm run build

# Stage de production avec Nginx
FROM nginx:1.25.3-alpine

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés depuis le stage précédent
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Exposer le port 8080
EXPOSE 8080

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]