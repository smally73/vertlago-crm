FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Chemin relatif : en prod, le navigateur ne parle qu'à Nginx (même
# origine), qui route /api vers le backend. Vite lit les variables VITE_*
# depuis l'environnement du process au moment du build, pas besoin d'un
# fichier .env dans l'image.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
