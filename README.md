# Vertlago — Back-office interne (V1 : CRM)

Application interne réservée aux employés Vertlago. V1 = gestion des fiches
clients (CRM basique). La base de données est conçue pour accueillir ensuite
les modules Commandes, Stocks et Contrôle de gestion sans tout refondre.

## Stack

- **Backend** : Node.js + Express + PostgreSQL, auth JWT avec rôles (admin/employé)
- **Frontend** : React (Vite), sans framework CSS externe
- **Local** : PostgreSQL via Docker

## Démarrage en local

### 1. Base de données

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run migrate      # crée les tables
node src/seed-admin.js "Ton Nom" toi@vertlago.com motdepasse   # crée le 1er admin
npm run dev           # démarre l'API sur http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # démarre l'interface sur http://localhost:5173
```

Connecte-toi avec l'email/mot de passe créés à l'étape `seed-admin.js`.

## Déploiement sur Aruba (admin.vertlago.com)

Points à vérifier auprès de ton offre Aruba avant de déployer :

1. **Support Node.js** : les hébergements mutualisés Aruba classiques ne
   supportent souvent pas Node.js en exécution continue (contrairement à PHP).
   Si c'est le cas, il faudra soit :
   - un plan Aruba Cloud VPS/Server (Node.js tourne alors comme sur ta machine),
   - ou héberger le backend ailleurs (ex: Railway, Render, Fly.io) et ne
     garder que le sous-domaine `admin.vertlago.com` chez Aruba en simple
     redirection/pointeur DNS vers ce service.
2. **PostgreSQL** : vérifie si ton plan Aruba propose une base PostgreSQL
   managée, ou si tu dois passer par un service externe (ex: Aruba Cloud
   Database, ou Neon/Supabase en gratuit pour démarrer).
3. **Sous-domaine** : une fois l'hébergement choisi, il suffit de pointer un
   enregistrement DNS `admin.vertlago.com` (type A ou CNAME selon l'hébergeur)
   vers le serveur qui fait tourner l'application.
4. **HTTPS** : indispensable ici puisque des identifiants employés circulent.
   La plupart des solutions ci-dessus proposent un certificat gratuit (Let's
   Encrypt) automatique.

Dis-moi le type de plan Aruba exact que tu as (mutualisé, VPS, Cloud Server)
et je pourrai te donner les étapes de déploiement précises.

## Prochaines étapes suggérées

- Module Commandes (la table `orders` existe déjà en base, à relier au CRM)
- Module Stocks/Produits
- Contrôle de gestion / reporting
- Gestion des rôles plus fine si l'équipe grandit
