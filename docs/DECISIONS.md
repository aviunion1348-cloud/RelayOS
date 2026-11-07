# Decisions

- 2026-11-07: Use Next.js for presentation, NestJS for the authoritative API, PostgreSQL and Drizzle for persistence. Prisma's native engine could not be fetched from the permitted network; Drizzle avoids that dependency. The API is not exposed directly to the browser; the web server proxies `/api`.
- Use a local bootstrap account solely to facilitate development. It does not represent the requested production identity, role or security architecture.
- Preserve the directive verbatim in `business/MASTER_DIRECTIVE.md`; do not invent the unavailable Excalidraw source.
- The database schema uses a composite task-to-project foreign key so a task cannot refer to another organization's project.

## Release 1 checkpoint decisions — 2026-11-08
- Preserve Next.js/NestJS/Drizzle/PostgreSQL rather than introduce a competing backend or database. PostgreSQL is the only operational source of truth.
- Implement additive versioned migrations; never edit the previously applied 001 migration or erase existing records. Check migrations on an isolated PostgreSQL instance, not an unknown database.
- Use the supplied Markdown as the actionable source for workflow; missing original Excalidraw IDs do not block implementation. Do not invent IDs.
- Treat the 3,500 edge-case threshold as a source requirement and distinct traceable catalogue target, not proof of executed tests; scope and counting require owner approval.
- This branch is the dedicated session branch. Protect existing data; no production deployment or permission change.
- Use opaque, cryptographically random session tokens with hashes stored in PostgreSQL instead of signed self-contained JWTs for new local sessions; logout can revoke the current session. Existing JWT cookies become invalid and users must sign in again. Full session management is still pending.
- For local integration checks, use a disposable loopback PostgreSQL instance rather than substituting SQLite or a file. PostgreSQL 18.6 was available from an npm binary package; Compose/CI still specify PostgreSQL 16.
- 2026-11-08: Deny non-admin roles access to current business endpoints until resource-level RBAC/ABAC is implemented; do not give all organization members full visibility by default. This is an interim restriction, not an approved organizational policy.
