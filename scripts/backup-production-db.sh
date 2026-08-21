#!/usr/bin/env bash
# Sauvegarde quotidienne de la base de production (pg_dump + gzip).
# Exécuté SUR LE SERVEUR de prod, typiquement via cron (voir deploy/README.md,
# section "Sauvegardes"). Sûr à relancer plusieurs fois par jour si besoin.
set -euo pipefail

APP_DIR="/opt/vertlago-crm"
BACKUP_DIR="/opt/vertlago-crm-backups"
MONTHLY_DIR="$BACKUP_DIR/monthly"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

cd "$APP_DIR"
source scripts/lib/common.sh

mkdir -p "$BACKUP_DIR" "$MONTHLY_DIR"

TIMESTAMP="$(date +%F_%H%M%S)"
DEST="$BACKUP_DIR/vertlago_crm_${TIMESTAMP}.sql.gz"
TMP_DEST="${DEST}.tmp"
trap 'rm -f "$TMP_DEST"' ERR

log_info "Dump de la base vertlago_crm..."
docker compose -f docker-compose.prod.yml --env-file .env.production \
  exec -T db pg_dump -U vertlago vertlago_crm | gzip > "$TMP_DEST"

if [[ ! -s "$TMP_DEST" ]]; then
  log_error "Dump vide — abandon."
  rm -f "$TMP_DEST"
  exit 1
fi
mv "$TMP_DEST" "$DEST"
log_ok "Sauvegarde créée : $DEST ($(du -h "$DEST" | cut -f1))"

# Dernier jour du mois : on garde une copie permanente dans monthly/, jamais
# purgée (voir plus bas, "-maxdepth 1" protège ce sous-dossier de la purge).
if [[ "$(date -d tomorrow +%d)" == "01" ]]; then
  MONTHLY_DEST="$MONTHLY_DIR/vertlago_crm_$(date +%Y-%m)_fin-de-mois.sql.gz"
  cp "$DEST" "$MONTHLY_DEST"
  log_ok "Copie de fin de mois conservée : $MONTHLY_DEST"
fi

# BACKUP_DIR est en dehors du repo ($APP_DIR) : un redéploiement (git
# fetch/checkout) ou un "git clean" sur le repo ne peut jamais l'effacer.
# -maxdepth 1 : ne descend pas dans monthly/, ces sauvegardes de fin de mois
# sont conservées indéfiniment (pas de purge automatique).
log_info "Purge des sauvegardes quotidiennes de plus de $RETENTION_DAYS jours..."
find "$BACKUP_DIR" -maxdepth 1 -name 'vertlago_crm_*.sql.gz' -mtime "+${RETENTION_DAYS}" -print -delete

log_ok "Sauvegarde du jour terminée."
