# RelayOS

An early, **non-production** operational foundation for client delivery. This is not the complete product described in the directive. See [implementation status](docs/IMPLEMENTATION_STATUS.md) and [blockers](docs/BLOCKERS.md) before use.

## Local development

Requirements: Node.js 22+, npm, Docker Compose (or a separately provisioned PostgreSQL database).

1. `npm ci`
2. `cp .env.example .env` and replace the demo email and demo password. Never use the example values outside local development.
3. `docker compose up -d` (or set `DATABASE_URL` to a local PostgreSQL database).
4. `npm run db:migrate` then `npm run db:seed`.
5. `npm run dev`, then open http://localhost:3000 and sign in with the credentials in `.env`.

The API listens on loopback port 3001; the Next.js server proxies `/api` requests. The seed command is explicit and does not overwrite an existing account. The Compose database credentials and database role are **development only**; the database role owns its schema and is not suitable for production. No outbound messaging or real customer integrations are configured.

`npm run typecheck`, `npm test`, and `npm run build` check the current code. The tests do not establish production readiness or verify PostgreSQL integration or tenant isolation. Do not use real client data until the security and release gates in the status documents are met.

## Isolated PostgreSQL integration tests

Run these only against a disposable test database. Tests insert synthetic records and create a test schema; they do not clean them up. Never point them at a shared, staging or production database. Apply migrations first.

```sh
DATABASE_URL="$TEST_DATABASE_URL" npm run db:migrate
RELAYOS_DISPOSABLE_TEST_DB=yes npm run test:integration
```

Sessions now use opaque random tokens with only a hash stored in PostgreSQL, and logout revokes the presented session. Migration `002_sessions` invalidates old JWT sessions; existing users and records are preserved, and users must sign in again. This is a local-development improvement, not a complete production authentication system.
