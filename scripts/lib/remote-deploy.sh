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

if [[ ! -f deploy/nginx/active.conf ]]; then
  echo "[remote] Premier déploiement : config Nginx http-only (pas encore de certificat)."
  cp deploy/nginx/http-only.conf deploy/nginx/active.conf
fi

echo "[remote] Build des images..."
docker compose -f docker-compose.prod.yml --env-file .env.production build

echo "[remote] Démarrage..."
docker compose -f docker-compose.prod.yml --env-file .env.production up -d db backend frontend nginx certbot

echo "[remote] Attente de PostgreSQL (pas juste le backend : /api/health ne touche pas la DB)..."
for i in $(seq 1 30); do
  if docker compose -f docker-compose.prod.yml --env-file .env.production exec -T db \
      pg_isready -U vertlago > /dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "[remote] Migrations..."
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T backend npm run migrate

# Nginx résout les noms "backend"/"frontend" une seule fois au démarrage :
# quand ces conteneurs sont recréés (nouvelle image = nouvelle IP Docker),
# Nginx garde l'ancienne IP en cache -> 502 jusqu'à son propre redémarrage.
echo "[remote] Redémarrage de Nginx (pour qu'il reprenne les IP à jour de backend/frontend)..."
docker compose -f docker-compose.prod.yml --env-file .env.production restart nginx

echo "[remote] Ouverture des ports 80/443 (ufw)..."
ufw allow 80,443/tcp || true

echo "[remote] Statut des services :"
docker compose -f docker-compose.prod.yml --env-file .env.production ps

echo "[remote] Smoke test (backend, en direct dans le conteneur)..."
sleep 2
if docker compose -f docker-compose.prod.yml --env-file .env.production exec -T backend \
    node -e "require('http').get('http://localhost:4000/api/health', r => process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"; then
  echo "[remote] OK — backend opérationnel."
else
  echo "[remote] ÉCHEC — le backend ne répond pas (voir 'docker compose logs backend')." >&2
  exit 1
fi
