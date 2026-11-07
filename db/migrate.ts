import 'dotenv/config';
import { Pool } from 'pg';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    // Serializes migration runners without making assumptions about existing data.
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('relayos_schema_migrations'))");
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY)');
    const files = readdirSync('db/migrations').filter(name => /^\d+_[a-z0-9_]+\.sql$/.test(name)).sort();
    for (const file of files) {
      const name = file.slice(0, -4);
      const existing = await client.query('SELECT name FROM schema_migrations WHERE name = $1', [name]);
      if (!existing.rowCount) {
        await client.query(readFileSync(join('db/migrations', file), 'utf8'));
        await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [name]);
        console.log(`Applied ${name}`);
      }
    }
    await client.query('COMMIT');
    console.log('Migrations up to date');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch(() => { console.error('Migration failed; changes rolled back. Check database access and migration logs securely.'); process.exitCode = 1; });
