// Importe une liste d'emails clients (un par ligne) comme fiches "actif".
// Usage : node src/import-active-clients.js [chemin-du-fichier]
// Par défaut : liste_clients_actifs.md à la racine du projet.
// Idempotent : un email déjà présent dans la base (insensible à la casse)
// n'est pas réinséré.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function run() {
  const filePath = process.argv[2] || path.join(__dirname, '..', '..', 'liste_clients_actifs.md');
  const content = fs.readFileSync(filePath, 'utf8');

  const seen = new Set();
  const emails = [];
  for (const rawLine of content.split('\n')) {
    const email = rawLine.trim();
    if (!email || !email.includes('@')) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    emails.push(email);
  }

  console.log(`${emails.length} email(s) unique(s) trouvé(s) dans ${filePath}.`);

  const adminRes = await pool.query(
    "SELECT id FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1"
  );
  const createdBy = adminRes.rows[0]?.id || null;

  let inserted = 0;
  let skipped = 0;
  for (const email of emails) {
    const existing = await pool.query('SELECT 1 FROM clients WHERE LOWER(email) = LOWER($1)', [email]);
    if (existing.rows.length) {
      skipped += 1;
      continue;
    }
    await pool.query(
      `INSERT INTO clients (email, status, created_by) VALUES ($1, 'actif', $2)`,
      [email, createdBy]
    );
    inserted += 1;
  }

  console.log(`${inserted} fiche(s) créée(s), ${skipped} déjà existante(s) ignorée(s).`);
  await pool.end();
}

run().catch((err) => {
  console.error('Erreur pendant l\'import :', err);
  process.exit(1);
});
