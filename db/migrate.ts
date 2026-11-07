import 'dotenv/config';
import {Pool} from 'pg';
import {readFileSync} from 'node:fs';
async function main(){if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL required');const pool=new Pool({connectionString:process.env.DATABASE_URL});const c=await pool.connect();try{await c.query('BEGIN');await c.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY)');const name='001_init';const exists=await c.query('SELECT name FROM schema_migrations WHERE name=$1',[name]);if(!exists.rowCount){await c.query(readFileSync('db/migrations/001_init.sql','utf8'));await c.query('INSERT INTO schema_migrations(name) VALUES($1)',[name]);}await c.query('COMMIT');console.log('Migrations applied');}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();await pool.end();}}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
