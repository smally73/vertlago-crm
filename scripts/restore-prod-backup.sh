#!/usr/bin/env bash
# Restaure une sauvegarde de production sur la base de préprod et/ou de
# développement (choisis interactivement), SANS écraser les identifiants de
# connexion déjà en place sur la cible : la table "users" de la cible est
# sauvegardée avant restauration puis réappliquée par-dessus (par email), donc
# les comptes locaux gardent leur mot de passe habituel.
#
# À lancer à la demande, jamais en cron. Ne touche jamais à la prod (lecture
# seule : liste + téléchargement de la sauvegarde).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
source scripts/lib/common.sh

PROD_HOST="212.237.9.233"
PROD_USER="root"
REMOTE_BACKUP_DIR="/opt/vertlago-crm-backups"

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

# ---------- 1. Choix de la sauvegarde ----------
log_info "Sauvegardes disponibles sur $PROD_HOST..."
mapfile -t BACKUPS < <(ssh "$PROD_USER@$PROD_HOST" \
  "ls -1t $REMOTE_BACKUP_DIR/vertlago_crm_*.sql.gz 2>/dev/null")

if [[ ${#BACKUPS[@]} -eq 0 ]]; then
  log_error "Aucune sauvegarde trouvée dans $REMOTE_BACKUP_DIR sur $PROD_HOST."
  exit 1
fi

echo "Sauvegardes disponibles (plus récente en premier) :"
select CHOSEN_BACKUP in "${BACKUPS[@]}"; do
  [[ -n "${CHOSEN_BACKUP:-}" ]] && break
  echo "Choix invalide."
done
log_ok "Sauvegarde choisie : $(basename "$CHOSEN_BACKUP")"

# ---------- 2. Choix de la/des cible(s) ----------
echo
echo "Copier cette sauvegarde sur :"
select TARGET_CHOICE in "Préprod" "Développement" "Les deux"; do
  [[ -n "${TARGET_CHOICE:-}" ]] && break
  echo "Choix invalide."
done

TARGETS=()
case "$TARGET_CHOICE" in
  "Préprod")       TARGETS=("preprod") ;;
  "Développement") TARGETS=("dev") ;;
  "Les deux")      TARGETS=("preprod" "dev") ;;
esac

# ---------- 3. Confirmation ----------
echo
log_info "Ceci va REMPLACER toutes les données de : ${TARGETS[*]}."
log_info "Les identifiants de connexion (table users) de chaque cible seront préservés."
read -rp "Confirmer ? (taper 'oui' pour continuer) " CONFIRM
if [[ "$CONFIRM" != "oui" ]]; then
  log_error "Annulé."
  exit 1
fi

# ---------- 4. Téléchargement de la sauvegarde ----------
log_info "Téléchargement de la sauvegarde..."
LOCAL_DUMP="$WORK_DIR/backup.sql.gz"
scp -q "$PROD_USER@$PROD_HOST:$CHOSEN_BACKUP" "$LOCAL_DUMP"
gunzip "$LOCAL_DUMP"
LOCAL_DUMP="${LOCAL_DUMP%.gz}"

# ---------- 5. Restauration d'une cible ----------
restore_target() {
  local name="$1" compose_file="$2" service="$3" db="$4" database_url="$5"

  log_info "[$name] Démarrage de la base si nécessaire..."
  docker compose -f "$compose_file" up -d "$service" > /dev/null

  log_info "[$name] Sauvegarde des identifiants existants (table users)..."
  local users_snapshot="$WORK_DIR/users_${name}.sql"
  docker compose -f "$compose_file" exec -T "$service" \
    pg_dump -U vertlago -d "$db" --table=users --data-only --column-inserts \
    > "$users_snapshot"
  # Rejoue chaque compte par email : si la restauration prod amène un compte
  # de même email (donc déjà référencé par les autres tables via son id),
  # on ne remplace que ses identifiants — sinon on insère le compte local tel
  # quel (nouvel id, aucune FK ne le référence encore donc aucun conflit).
  sed -i '/^INSERT INTO/s/;$/ ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role;/' "$users_snapshot"

  log_info "[$name] Remplacement du contenu de la base par la sauvegarde..."
  docker compose -f "$compose_file" exec -T "$service" \
    psql -U vertlago -d "$db" -v ON_ERROR_STOP=1 \
    -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
  docker compose -f "$compose_file" exec -T "$service" \
    psql -U vertlago -d "$db" -v ON_ERROR_STOP=1 < "$LOCAL_DUMP"

  log_info "[$name] Ré-application des identifiants existants..."
  docker compose -f "$compose_file" exec -T "$service" \
    psql -U vertlago -d "$db" -v ON_ERROR_STOP=1 < "$users_snapshot"

  log_info "[$name] Rejeu des migrations (si le code local est plus récent que la sauvegarde)..."
  DATABASE_URL="$database_url" node backend/src/migrate.js

  log_ok "[$name] Restauration terminée."
}

# ---------- 6. Exécution ----------
for t in "${TARGETS[@]}"; do
  case "$t" in
    preprod)
      restore_target "préprod" docker-compose.preprod.yml db-preprod vertlago_crm_preprod \
        "postgres://vertlago:vertlago@localhost:5433/vertlago_crm_preprod"
      ;;
    dev)
      restore_target "développement" docker-compose.yml db vertlago_crm \
        "postgres://vertlago:vertlago@localhost:5432/vertlago_crm"
      ;;
  esac
done

log_ok "Terminé."
