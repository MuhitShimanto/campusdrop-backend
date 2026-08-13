import Postgrator from 'postgrator';
import { Pool } from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import config from '../src/config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationDirectory = path.resolve(__dirname, '../database/migrations');

// Postgrator uses glob internally.
// Normalize Windows "\" separators to "/" for glob compatibility.
const migrationPattern = path.join(migrationDirectory, '*').replaceAll('\\', '/');

const pool = new Pool({
  connectionString: config.database.url,
});

const postgrator = new Postgrator({
  migrationPattern,
  driver: 'pg',
  database: config.database.name,
  schemaTable: 'public.schemaversion',
  currentSchema: 'public',

  execQuery: (query) => pool.query(query),

  execSqlScript: async (sqlScript) => {
    await pool.query(sqlScript);
  },
});

postgrator.on('migration-started', (migration) => {
  console.log(`Applying migration ${migration.version}: ${migration.name}`);
});

postgrator.on('migration-finished', (migration) => {
  console.log(`Applied migration ${migration.version}: ${migration.name}`);
});

async function migrate() {
  try {
    
    const maxVersion = await postgrator.getMaxVersion();
    const databaseVersion = await postgrator.getDatabaseVersion();

    console.log(`Database version: ${databaseVersion}`);
    console.log(`Latest migration: ${maxVersion}`);

    if (maxVersion <= databaseVersion) {
      console.log('Database is already up to date.');
      return;
    }

    const appliedMigrations = await postgrator.migrate(String(maxVersion));

    console.log(`Successfully applied ${appliedMigrations.length} migration(s).`);
  } catch (error) {
    console.error('Database migration failed.');

    if (error && typeof error === 'object' && 'appliedMigrations' in error) {
      console.error('Successfully applied before failure:', error.appliedMigrations);
    }

    console.error(error);

    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

await migrate();
