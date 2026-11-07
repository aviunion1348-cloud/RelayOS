import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
const url=process.env.TEST_DATABASE_URL;
if(!url || process.env.RELAYOS_DISPOSABLE_TEST_DB!=='yes') throw new Error('Set TEST_DATABASE_URL and RELAYOS_DISPOSABLE_TEST_DB=yes for an isolated test database');
test('additive migration upgrades a 001 database without altering existing records', {timeout:30000},async()=>{
 const pool=new Pool({connectionString:url});const schema='test_'+randomUUID().replaceAll('-','');const client=await pool.connect();
 try {
  await client.query(`CREATE SCHEMA "${schema}"`);await client.query(`SET search_path TO "${schema}"`);
  await client.query(readFileSync('db/migrations/001_init.sql','utf8'));
  await client.query('CREATE TABLE schema_migrations(name text PRIMARY KEY)');await client.query("INSERT INTO schema_migrations VALUES('001_init')");
  await client.query("INSERT INTO organizations(id,name) VALUES('original','Existing workspace')");
  const env={...process.env,DATABASE_URL:url,PGOPTIONS:`-c search_path=${schema}`};
  execFileSync('./node_modules/.bin/tsx',['db/migrate.ts'],{env,stdio:'pipe'});
  execFileSync('./node_modules/.bin/tsx',['db/migrate.ts'],{env,stdio:'pipe'});
  assert.equal((await client.query("SELECT name FROM organizations WHERE id='original'")).rows[0].name,'Existing workspace');
  assert.deepEqual((await client.query('SELECT name FROM schema_migrations ORDER BY name')).rows.map(r=>r.name),['001_init','002_sessions']);
  assert.equal((await client.query('SELECT count(*)::int AS count FROM user_sessions')).rows[0].count,0);
 } finally {client.release();await pool.end();}
});
