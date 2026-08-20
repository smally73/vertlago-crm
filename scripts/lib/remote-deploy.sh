#!/usr/bin/env bash
# Exécuté SUR LE SERVEUR de prod (copié puis lancé via ssh par
# promote-to-production.sh). Idempotent : sûr à relancer.
set -euo pipefail

REPO_URL="https://github.com/smally73/vertlago-crm.git"
BRANCH="production"
APP_DIR="/opt/vertlago-crm"

echo "[remote] Code source ($BRANCH)..."
if [[ ! -d "$APP_DIR/.git" ]]; then
  git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  cd "$APP_DIR"
  git fetch origin
  git checkout "$BRANCH"
  git merge "origin/$BRANCH" --ff-only
fi
cd "$APP_DIR"

if [[ ! -f .env.production ]]; then
  echo "[remote] Génération de .env.production (première fois)..."
  cp .env.production.example .env.production
  PG_PASS=$(openssl rand -hex 24)
  JWT_SECRET=$(openssl rand -hex 32)
  sed -i "s#POSTGRES_PASSWORD=.*#POSTGRES_PASSWORD=${PG_PASS}#" .env.production
  sed -i "s#JWT_SECRET=.*#JWT_SECRET=${JWT_SECRET}#" .env.production
  sed -i "s#DATABASE_URL=.*#DATABASE_URL=postgres://vertlago:${PG_PASS}@db:5432/vertlago_crm#" .env.production
  echo "[remote] .env.production généré avec des secrets aléatoires."
fi

echo "[remote] Build des images..."
docker compose -f docker-compose.prod.yml --env-file .env.production build

echo "[remote] Démarrage (config Nginx http-only pour l'instant)..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d db backend frontend nginx

echo "[remote] Attente du backend..."
for i in $(seq 1 30); do
  if docker compose -f docker-compose.prod.yml --env-file .env.production exec -T backend \
      node -e "require('http').get('http://localhost:4000/api/health', r => process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))" 2>/dev/null; then
    break
  fi
  sleep 1
done

echo "[remote] Migrations..."
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T backend npm run migrate

echo "[remote] Ouverture des ports 80/443 (ufw)..."
ufw allow 80,443/tcp || true

echo "[remote] Statut des services :"
docker compose -f docker-compose.prod.yml --env-file .env.production ps

echo "[remote] OK. Vérifie : curl http://$(curl -s ifconfig.me 2>/dev/null || echo 212.237.9.233)/api/health"
