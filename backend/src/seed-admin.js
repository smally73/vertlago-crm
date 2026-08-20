// Crée (ou met à jour) le premier compte administrateur.
// Utilisation : node src/seed-admin.js "Nom Prénom" email@exemple.com motdepasse
require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('./db');

async function run() {
  const [full_name, email, password] = process.argv.slice(2);
  if (!full_name || !email || !password) {
    console.error('Usage: node src/seed-admin.js "Nom Prénom" email@exemple.com motdepasse');
    process.exit(1);
  }

  const password_hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'`,
    [full_name, email, password_hash]
  );

  console.log(`Compte admin prêt pour ${email}.`);
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
