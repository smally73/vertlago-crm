// Config pm2 partagée entre préprod (local, worktree) et production (Aruba, VPS).
// Chaque app pointe sur son propre dossier et charge son propre .env via dotenv
// (backend/src/index.js fait déjà `require('dotenv').config()` relatif au cwd).
// Chemins résolus depuis ce fichier (pas depuis le dossier d'où pm2 est lancé).
const path = require('path');
const preprodDir = path.join(__dirname, '..', 'vertlago-crm-preprod');

module.exports = {
  apps: [
    {
      name: 'vertlago-api-preprod',
      cwd: path.join(preprodDir, 'backend'),
      script: 'src/index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'vertlago-frontend-preprod',
      cwd: path.join(preprodDir, 'frontend'),
      script: 'node_modules/.bin/vite',
      args: 'preview --mode preprod --port 5273 --strictPort --host',
      interpreter: 'none',
    },
  ],
};
