# Task dependency checkpoint — 2026-11-08

## Implementation

Additive migration 005 introduces task dependencies with same-project, same-organization foreign keys and self-reference check. The API rejects duplicate, cross-project and cyclic links, serializes link creation and task status updates per project with a transaction-scoped PostgreSQL advisory lock, and records a transactional audit event. The API blocks completion while prerequisites remain incomplete and blocks reopening a prerequisite while a dependent remains completed. The latter is an interim consistency rule pending organizational policy review; it is not an approved company policy. The UI provides link creation and displays existing relationships, but it has not been tested in a browser.

## Evidence

PostgreSQL 18.6 `npm run test:integration` passed both integration tests. Tests include dependency creation, duplicate rejection, cycle rejection, cross-organization denial, completion blocked until prerequisite completion, reopening blocked for completed dependents, and competing inverse links: exactly one succeeds and the other is rejected. Migration test upgrades an existing 001 schema and preserves its original organization through 005. `npm run typecheck`, `npm test` (3 unit tests), and `npm run build` passed. The work board UI and accessibility/anti-slop gate are NOT TESTED in a browser due to missing NSS/NSPR libraries. Results do not prove complete concurrency safety or production readiness.

## Remaining

Dependency deletion, editing, richer graph visualization, pagination and project-level permissions are absent. Task status model is still an incomplete four-state approximation; this checkpoint does not implement the complete lifecycle, SLA, QA or handover. Direct database writes by privileged roles are outside API cycle enforcement; production least-privilege and RLS are not yet implemented.
