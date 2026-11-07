# Release 1 foundation checkpoint — 2026-11-08

## Scope and source

Security and persistence foundation for Release 1: session revocation, PostgreSQL migrations, organization isolation checks, safe audit writes and local startup. Source: master directive authentication, database, audit and testing requirements. See `docs/architecture/REPOSITORY_BASELINE.md` for the pre-change state and `docs/business/EDGE_CASE_CATALOG_POLICY.md` for the source threshold. This checkpoint does not implement the full lifecycle.

## Changes

- Additive `002_sessions` stores only SHA-256 hashes of random session tokens. Logout revokes the presented session, and identity lookups require an existing unexpired session joined to its user and organization. Existing JWT cookies no longer work; users must sign in again. No user or operational records are deleted.
- Ordered migration runner preserves 001, serializes concurrent runs with a transaction-scoped advisory lock, and applies pending SQL in a transaction. No destructive migration is included.
- Fix `npm run dev` API decorator configuration and map duplicate prospect unique-constraint errors to HTTP 409. Correct `nosniff` header.
- CI now provisions a disposable PostgreSQL 16 service, runs migrations twice and executes integration tests. Test code requires explicit opt-in and is not safe for shared databases: it inserts synthetic records and creates a schema without cleanup.

## Executed evidence

- A fresh, isolated PostgreSQL 18.6 instance was obtained from the npm `@embedded-postgres/linux-x64` package and started on loopback with trust authentication **only for disposable local testing**. No existing database or volume was touched. This does not verify PostgreSQL 16 or production configuration.
- `npm run db:migrate` on the fresh instance applied 001 and 002; a second run reported up to date. Migration integration test also constructed a 001-only schema with an existing organization, upgraded twice and verified the record survived.
- `npm run test:integration`: 2 tests passed on PostgreSQL 18.6. They cover unauthenticated denial, wrong-origin rejection, organization-scoped project/task access denial, composite foreign key rejection, database-persisted task status, audit rows, duplicate prospect conflict, hashed-session logout/reuse rejection, and migration upgrade. These are targeted checks, **not** a comprehensive authorization assessment.
- `npm run typecheck`: passed. `npm test`: 3 unit tests passed. `npm run build`: passed. `npm audit --omit=dev`: 0 reported vulnerabilities at execution time.
- Ran `npm run dev` with the isolated PostgreSQL service: both Next.js and NestJS reported ready; HTTP checks returned `/` 200, `/api/overview` 401 unauthenticated and `/db.json` 404. No browser interaction or video was tested.

## Failures found and fixed

- Initial integration run failed because `tsx` didn't use the API's experimental-decorator tsconfig. Fixed the dev/test launch command, then reran successfully.
- The next integration run found duplicate prospects returned 500 because Drizzle wraps the PostgreSQL error. Mapped the specific unique constraint to 409, then reran successfully.

## Remaining / not verified

- Release 1 business workflow, dashboard editing, SLA, QA and non-bypassable handover are not implemented. No demo or browser-backed E2E tests have been recorded.
- No project/client/partner granular access controls, RLS, password reset, rate limiting, Argon2id, MFA, full session management or admin provisioning/recovery. Current session revocation covers only logout of the presented cookie. Existing login uses synchronous scrypt and local bootstrap; this is not production authentication.
- Audit rows are not immutable or access-controlled at the database role level. No runtime/migration/backup role separation, restore testing, production hosting, private file storage or release approval. No comprehensive CSRF, exposure, security or isolation suite.
- CI configuration has been written but the GitHub Actions execution has not yet been observed. Local browser and PostgreSQL 16 compatibility remain unverified. The trust-authenticated local test instance is not a deployment template.
