# Helpers partagés par les scripts de promotion. À sourcer, pas à exécuter directement.

log_info()  { echo -e "\033[1;34m[info]\033[0m $*"; }
log_ok()    { echo -e "\033[1;32m[ok]\033[0m $*"; }
log_error() { echo -e "\033[1;31m[erreur]\033[0m $*" >&2; }

# Échoue si la branche donnée a des changements non commités sur des fichiers
# suivis (les fichiers non suivis, ex: listes de données non commitées, ne
# bloquent pas une promotion — ils ne sont de toute façon jamais touchés par
# un git merge --ff-only).
require_clean_branch() {
  local branch="$1"
  if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
    log_error "Working tree non propre (fichiers suivis modifiés). Commite ou stash avant de promouvoir."
    exit 1
  fi
  local current
  current="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "$current" != "$branch" ]]; then
    log_error "Tu es sur la branche '$current', pas '$branch'. Vérifie avant de relancer."
    exit 1
  fi
}
