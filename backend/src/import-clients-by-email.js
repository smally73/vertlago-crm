// Importe une liste d'emails clients (un par ligne) avec un statut donné.
// Usage : node src/import-clients-by-email.js [fichier] [statut]
// - fichier : par défaut liste_clients_actifs.md à la racine du projet.
// - statut  : prospect | actif | inactif | archive (défaut : prospect).
// Idempotent : un email déjà présent dans la base (insensible à la casse)
// n'est pas réinséré, quel que soit son statut actuel.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const VALID_STATUSES = ['prospect', 'actif', 'inactif', 'archive'];

async function run() {
  const filePath = process.argv[2] || path.join(__dirname, '..', '..', 'liste_clients_actifs.md');
  const status = process.argv[3] || 'prospect';

  if (!VALID_STATUSES.includes(status)) {
    console.error(`Statut invalide : "${status}". Valeurs possibles : ${VALID_STATUSES.join(', ')}.`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');

  const seen = new Set();
  const emails = [];
  for (const rawLine of content.split('\n')) {
    const email = rawLine.trim();
    if (!email || !email.includes('@')) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    emails.push(email);
  }

  console.log(`${emails.length} email(s) unique(s) trouvé(s) dans ${filePath} (statut cible : ${status}).`);

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
      `INSERT INTO clients (email, status, created_by) VALUES ($1, $2, $3)`,
      [email, status, createdBy]
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
