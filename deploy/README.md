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

## Sauvegardes

`scripts/backup-production-db.sh` (dans le repo, déployé automatiquement avec
le code) fait un `pg_dump` de la base, le compresse et le stocke dans
`/opt/vertlago-crm-backups/` — **en dehors** de `/opt/vertlago-crm`, pour
qu'un redéploiement ou un `git clean` ne puisse jamais toucher aux sauvegardes.

Rétention à deux niveaux :
- **Quotidien** : purge automatique des fichiers de plus de 14 jours
  (`RETENTION_DAYS` pour changer ce seuil) dans `/opt/vertlago-crm-backups/`.
- **Fin de mois** : le dernier jour de chaque mois, une copie est en plus
  conservée dans `/opt/vertlago-crm-backups/monthly/`, jamais purgée
  automatiquement (nom `vertlago_crm_AAAA-MM_fin-de-mois.sql.gz`).

### Mise en place (une seule fois)

Sur le serveur, en root :

```bash
crontab -e
```

Ajouter :

```cron
0 3 * * * /opt/vertlago-crm/scripts/backup-production-db.sh >> /var/log/vertlago-backup.log 2>&1
```

(03h du matin, heure creuse. Adapter le fuseau horaire du serveur si besoin —
vérifier avec `timedatectl`.)

### Vérifier que ça tourne

```bash
ls -lh /opt/vertlago-crm-backups/
tail -n 20 /var/log/vertlago-backup.log
```

### Tester une restauration

**Jamais sur la base de prod.** Sur un conteneur Postgres jetable :

```bash
docker run --rm -d --name pg-restore-test -e POSTGRES_PASSWORD=test postgres:16
sleep 3
gunzip -c /opt/vertlago-crm-backups/vertlago_crm_XXXX.sql.gz | \
  docker exec -i pg-restore-test psql -U postgres
docker exec -it pg-restore-test psql -U postgres -c '\dt'   # vérifier les tables
docker rm -f pg-restore-test
```

### Restaurer une sauvegarde sur préprod / développement

`scripts/restore-prod-backup.sh` (interactif, à lancer depuis la racine du
repo local) liste les sauvegardes disponibles sur le VPS, demande laquelle
utiliser puis sur quelle cible la copier (préprod, développement, ou les
deux). Il ne touche jamais à la prod (lecture seule côté serveur : liste +
téléchargement). Les identifiants de connexion existants de la cible
(table `users`) sont sauvegardés avant restauration et réappliqués après,
donc les comptes de test locaux gardent leur mot de passe habituel même
après avoir reçu les données de prod.

⚠️ Les fiches clients de prod contiennent de vraies données personnelles
(noms, emails, adresses). Les copier sur un poste de dev les expose en
dehors de l'environnement sécurisé de prod — à garder en tête (cf. point 10
de `SECURITY_TODO.md` sur le RGPD). Une anonymisation à la restauration
serait une amélioration possible, pas encore faite.

### Copie hors-site (recommandé, pas encore en place)

Des sauvegardes qui ne vivent que sur ce même VPS ne protègent pas contre une
perte ou une compromission de ce VPS (règle du 3-2-1 : au moins une copie hors
site). Une fois un fournisseur choisi (Backblaze B2, S3, autre serveur...), la
façon la plus simple de l'ajouter est une ligne `rclone copy` ou `rsync` à la
fin de `backup-production-db.sh`, après la création de `$DEST`. Nécessite de
configurer les identifiants du fournisseur sur le serveur (`rclone config`),
ce qui n'est pas encore fait.
