import { database } from './connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  try {
    logger.info('Starting database migration...');

    const sqlPath = path.join(__dirname, '..', '..', 'database', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await database.query(sql);
    
    logger.info('Database migration completed successfully');
  } catch (error) {
    logger.error('Error running migrations:', error);
    throw error;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

export { runMigrations };

