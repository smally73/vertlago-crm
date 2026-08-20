#!/usr/bin/env bash
# Promeut preprod -> production et déploie sur le VPS Aruba. Sûr à
# relancer (idempotent côté serveur, voir scripts/lib/remote-deploy.sh).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
source scripts/lib/common.sh

PREPROD_BRANCH="preprod"
PRODUCTION_BRANCH="production"
WORKTREE_DIR="../vertlago-crm-preprod"
PROD_HOST="212.237.9.233"
PROD_USER="root"

log_info "Vérification de la branche $PREPROD_BRANCH (worktree)..."
if [[ ! -d "$WORKTREE_DIR" ]]; then
  log_error "Worktree préprod introuvable. Lance d'abord ./scripts/promote-to-preprod.sh."
  exit 1
fi
(cd "$WORKTREE_DIR" && require_clean_branch "$PREPROD_BRANCH")
(cd "$WORKTREE_DIR" && git fetch origin "$PREPROD_BRANCH" --quiet)
if [[ "$(cd "$WORKTREE_DIR" && git rev-parse HEAD)" != "$(cd "$WORKTREE_DIR" && git rev-parse "origin/$PREPROD_BRANCH")" ]]; then
  log_error "$PREPROD_BRANCH locale différente de origin/$PREPROD_BRANCH. Repromeus d'abord vers préprod."
  exit 1
fi

log_info "Merge $PREPROD_BRANCH -> $PRODUCTION_BRANCH"
if git show-ref --verify --quiet "refs/heads/$PRODUCTION_BRANCH"; then
  git checkout "$PRODUCTION_BRANCH"
  git merge "$PREPROD_BRANCH" --ff-only
else
  git checkout -b "$PRODUCTION_BRANCH" "$PREPROD_BRANCH"
fi
git push -u origin "$PRODUCTION_BRANCH"
git checkout main

log_info "Déploiement sur $PROD_USER@$PROD_HOST..."
scp -q scripts/lib/remote-deploy.sh "$PROD_USER@$PROD_HOST:/tmp/vertlago-remote-deploy.sh"
ssh "$PROD_USER@$PROD_HOST" "bash /tmp/vertlago-remote-deploy.sh"

log_ok "Déploiement terminé."
log_ok "Vérifie : curl http://$PROD_HOST/api/health"
log_ok "Si ce n'est pas déjà fait : pointe le DNS admin.vertlago.com -> $PROD_HOST,"
log_ok "puis suis deploy/README.md pour activer HTTPS (certbot)."
