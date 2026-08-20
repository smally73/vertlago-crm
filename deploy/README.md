# Déploiement production (VPS Aruba)

Serveur : `root@212.237.9.233` (Ubuntu 24.04, Docker + fail2ban déjà en
place). Domaine cible : `admin.vertlago.com`.

## Premier déploiement

1. `./scripts/promote-to-production.sh` — merge `preprod` → `production`,
   pousse, se connecte en SSH, clone le repo dans `/opt/vertlago-crm`,
   génère `.env.production` avec des secrets aléatoires (première fois
   seulement), crée `deploy/nginx/active.conf` à partir de `http-only.conf`
   si absent (première fois, pas encore de certificat), build les images,
   démarre `db`/`backend`/`frontend`/`nginx`/`certbot`, lance les
   migrations.
2. Vérifier que ça répond : `curl http://212.237.9.233/api/health`.
3. **Chez Aruba (zone DNS de vertlago.com)** : pointer l'enregistrement A
   `admin` vers `212.237.9.233`. Attendre la propagation
   (`dig +short admin.vertlago.com` doit renvoyer cette IP — peut prendre
   de quelques minutes à quelques heures selon le TTL).
4. Une fois le DNS confirmé, sur le serveur :
   ```bash
   cd /opt/vertlago-crm
   docker compose -f docker-compose.prod.yml --env-file .env.production \
     run --rm --entrypoint certbot certbot \
     certonly --webroot -w /var/www/certbot \
     -d admin.vertlago.com --email <ton-email> --agree-tos --no-eff-email
   # --entrypoint certbot est nécessaire : le service "certbot" a son propre
   # entrypoint (la boucle de renouvellement), qui ignorerait sinon la
   # commande "certonly" passée ici.
   cp deploy/nginx/ssl.conf deploy/nginx/active.conf   # bascule de config
   docker compose -f docker-compose.prod.yml --env-file .env.production \
     exec nginx nginx -s reload
   ```
5. Vérifier : `curl https://admin.vertlago.com/api/health`.
6. Créer le premier compte admin :
   ```bash
   docker compose -f docker-compose.prod.yml exec backend \
     node src/seed-admin.js "Ton Nom" toi@vertlago.com "mot-de-passe-fort"
   ```

## Redéploiements suivants

Relancer `./scripts/promote-to-production.sh` — `.env.production`,
`deploy/nginx/active.conf` et les certificats existants ne sont jamais
touchés, seul le code est mis à jour et les images rebuildées.

## Renouvellement des certificats

Automatique : le service `certbot` du `docker-compose.prod.yml` tourne en
boucle et relance `certbot renew` toutes les 12h.
