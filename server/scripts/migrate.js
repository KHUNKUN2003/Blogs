import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDir = path.resolve(__dirname, '../db');

async function migrate() {
  const files = (await fs.readdir(dbDir))
    .filter((file) => /^\d{3}_(?!seed).*\.sql$/.test(file))
    .sort();

  if (files.length === 0) {
    throw new Error(`No numbered migration files found in ${dbDir}`);
  }

  for (const file of files) {
    const filePath = path.join(dbDir, file);
    const sql = await fs.readFile(filePath, 'utf8');
    console.log(`Running migration ${file}`);
    await pool.query(sql);
  }
}

migrate()
  .then(() => {
    console.log('Migrations complete');
  })
  .catch((error) => {
    console.error('Migration failed');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
