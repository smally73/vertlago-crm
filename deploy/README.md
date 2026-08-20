# Déploiement production (VPS Aruba)

Serveur : `root@212.237.9.233` (Ubuntu 24.04, Docker + fail2ban déjà en
place). Domaine cible : `admin.vertlago.com`.

## Premier déploiement

1. `./scripts/promote-to-production.sh` — merge `preprod` → `production`,
   pousse, se connecte en SSH, clone le repo dans `/opt/vertlago-crm`,
   génère `.env.production` avec des secrets aléatoires (première fois
   seulement), build les images, démarre `db`/`backend`/`frontend`/`nginx`
   (config **http-only**, pas de TLS), lance les migrations.
2. Vérifier que ça répond : `curl http://212.237.9.233/api/health`.
3. **Chez Aruba (zone DNS de vertlago.com)** : pointer l'enregistrement A
   `admin` vers `212.237.9.233`. Attendre la propagation
   (`dig +short admin.vertlago.com` doit renvoyer cette IP — peut prendre
   de quelques minutes à quelques heures selon le TTL).
4. Une fois le DNS confirmé, sur le serveur :
   ```bash
   cd /opt/vertlago-crm
   docker compose -f docker-compose.prod.yml run --rm certbot \
     certonly --webroot -w /var/www/certbot \
     -d admin.vertlago.com --email <ton-email> --agree-tos --no-eff-email
   cp deploy/nginx/ssl.conf /tmp/nginx-active.conf   # bascule de config
   docker compose -f docker-compose.prod.yml exec nginx \
     sh -c 'nginx -s reload'
   docker compose -f docker-compose.prod.yml up -d certbot   # renouvellement auto
   ```
5. Vérifier : `curl https://admin.vertlago.com/api/health`.
6. Créer le premier compte admin :
   ```bash
   docker compose -f docker-compose.prod.yml exec backend \
     node src/seed-admin.js "Ton Nom" toi@vertlago.com "mot-de-passe-fort"
   ```

## Redéploiements suivants

Relancer `./scripts/promote-to-production.sh` — `.env.production` et les
certificats existants ne sont jamais touchés, seul le code est mis à jour
et les images rebuildées.

## Renouvellement des certificats

Automatique : le service `certbot` du `docker-compose.prod.yml` tourne en
boucle et relance `certbot renew` toutes les 12h.
