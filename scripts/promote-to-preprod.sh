#!/usr/bin/env bash
# Promeut la branche main vers preprod, rebuild le worktree préprod local et
# redémarre les process pm2 correspondants. Sûr à relancer plusieurs fois.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
source scripts/lib/common.sh

PREPROD_BRANCH="preprod"
WORKTREE_DIR="../vertlago-crm-preprod"
BACKEND_PORT=4100
FRONTEND_PORT=5273

log_info "Vérification de la branche main..."
require_clean_branch main
git fetch origin main --quiet
if [[ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]]; then
  log_error "main locale différente de origin/main. Push/pull d'abord."
  exit 1
fi

log_info "Merge main -> $PREPROD_BRANCH (via le worktree, jamais checkout ici)"
# La branche preprod vit exclusivement dans le worktree ($WORKTREE_DIR) : on ne
# la checkout jamais dans ce dossier (main), ce qui casserait le worktree
# ("branch already checked out"). "main" reste une ref locale partagée, donc
# `git merge main` depuis le worktree fonctionne sans le checkout ici.
if [[ ! -d "$WORKTREE_DIR" ]]; then
  log_info "Création du worktree"
  if git show-ref --verify --quiet "refs/heads/$PREPROD_BRANCH"; then
    git worktree add "$WORKTREE_DIR" "$PREPROD_BRANCH"
    (cd "$WORKTREE_DIR" && git merge main --ff-only)
  else
    git worktree add "$WORKTREE_DIR" -b "$PREPROD_BRANCH" main
  fi
else
  (cd "$WORKTREE_DIR" && git merge main --ff-only)
fi
(cd "$WORKTREE_DIR" && git push -u origin "$PREPROD_BRANCH")

# .env régénérés à chaque promotion depuis les .example (évite qu'un fichier
# généré avant un changement de template reste figé sur une config obsolète —
# c'est ce qui a cassé l'accès réseau après le passage à VITE_API_URL=/api).
# Le JWT_SECRET existant est préservé pour ne pas invalider les sessions en
# cours à chaque promotion.
log_info "Régénération de backend/.env depuis .env.preprod.example"
EXISTING_SECRET=""
if [[ -f "$WORKTREE_DIR/backend/.env" ]]; then
  EXISTING_SECRET=$(grep '^JWT_SECRET=' "$WORKTREE_DIR/backend/.env" | cut -d= -f2-)
fi
cp "$WORKTREE_DIR/backend/.env.preprod.example" "$WORKTREE_DIR/backend/.env"
if [[ -z "$EXISTING_SECRET" ]]; then
  EXISTING_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
fi
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$EXISTING_SECRET/" "$WORKTREE_DIR/backend/.env"

log_info "Régénération de frontend/.env.preprod depuis .env.preprod.example"
cp "$WORKTREE_DIR/frontend/.env.preprod.example" "$WORKTREE_DIR/frontend/.env.preprod"

log_info "Installation des dépendances..."
(cd "$WORKTREE_DIR/backend" && npm ci --silent)
(cd "$WORKTREE_DIR/frontend" && npm ci --silent)

log_info "Build du frontend (mode preprod)..."
(cd "$WORKTREE_DIR/frontend" && npm run build -- --mode preprod)

log_info "Démarrage de PostgreSQL préprod (Docker)..."
docker compose -f docker-compose.preprod.yml up -d

log_info "Attente de PostgreSQL préprod (port 5433)..."
for i in $(seq 1 30); do
  if (exec 3<>/dev/tcp/localhost/5433) 2>/dev/null; then exec 3>&-; break; fi
  sleep 1
done

log_info "Migrations préprod..."
(cd "$WORKTREE_DIR/backend" && npm run migrate)

log_info "(Re)démarrage pm2 (préprod)..."
npx pm2 startOrReload ecosystem.config.js --only vertlago-api-preprod,vertlago-frontend-preprod

log_info "Smoke test API préprod..."
sleep 2
if curl -sf "http://localhost:$BACKEND_PORT/api/health" > /dev/null; then
  log_ok "API préprod OK (port $BACKEND_PORT)"
else
  log_error "Échec du smoke test API préprod — voir 'npx pm2 logs vertlago-api-preprod'"
  exit 1
fi

log_ok "Préprod à jour :"
log_ok "  Frontend  http://localhost:$FRONTEND_PORT"
log_ok "  API       http://localhost:$BACKEND_PORT/api"
