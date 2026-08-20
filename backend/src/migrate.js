require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`→ Exécution de ${file}...`);
    await pool.query(sql);
  }

  console.log('Migrations terminées.');
  await pool.end();
}

run().catch((err) => {
  console.error('Erreur pendant la migration :', err);
  process.exit(1);
});
