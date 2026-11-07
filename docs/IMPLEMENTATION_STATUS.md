# Implementation status

## Release 1: in progress, not production-ready

The existing prospect/project/task slice has been retained. A new additive migration and revocable opaque cookie sessions have been implemented. The API development launch and duplicate-prospect conflict handling have been fixed. `docs/quality/CHECKPOINT_2026-11-08.md` records commands, passing targeted tests, failures found and remaining gaps.

### Verified in isolated local checks
- Fresh migration and repeat run; upgrade from 001 with an existing organization preserved.
- Two PostgreSQL 18.6 integration tests, three validation unit tests, typecheck, frontend/backend build, and dependency audit.
- Targeted organization isolation, foreign-key rejection, task persistence, audit insertion, logout revocation and wrong-origin rejection via API calls. These do not establish full security.
- `npm run dev` startup and HTTP checks for the page, unauthenticated proxied API, and `/db.json`.

### Incomplete or unverified
- Consultation and requirements pipeline, editable dashboard, full work hierarchy, dependencies, SLA, QA, evidence-based handover, approvals, comprehensive RBAC/RLS, rate limits, password recovery, production security, worker, private storage, backup/restore, E2E browser tests, accessibility, complete CI gates, and demo video.
- Targeted organization tests do not prove client, project, partner, search or AI isolation. The dashboard counts are based on capped lists, not complete aggregate metrics.
- No production deployment, branch protection changes or production data use. PostgreSQL 16 in CI has not been observed yet; local checks used a disposable PostgreSQL 18.6 instance. The existing Compose database owner role remains local-development only.

Release 2 and Release 3 remain unimplemented. The 3,500 edge-case catalogue requires distinct cases and owner-approved counting scope; no count or execution claim is made.

### Discovery checkpoint
- Consultation and draft requirement creation/listing are implemented. PostgreSQL-backed API persistence and targeted cross-organization denial tests passed. The UI builds but is **not browser verified**; browser launch failed due to missing NSS/NSPR libraries. Details and omissions: `docs/quality/CHECKPOINT_DISCOVERY.md`.
- Interim fail-closed guard: only `admin` users may use business endpoints; targeted integration tests verify non-admin denial. This is deliberately restrictive, **not** complete role-based or project-level authorization.
- Basic milestone and module creation/listing are implemented; PostgreSQL integration tests verify organization/project relationships and audit events. UI builds but is not browser verified. Planning, assignment, dates, task links, workflow and handover remain incomplete. See `docs/quality/CHECKPOINT_PLANNING.md`.
- Task dependencies are implemented in PostgreSQL/API, including cycle rejection and blocking incomplete prerequisites; targeted integration and concurrent inverse-link tests passed. UI is not browser-verified. Dependency editing/removal and the full task lifecycle are not implemented. See `docs/quality/CHECKPOINT_DEPENDENCIES.md`.
- GitHub Actions Foundation checks on commit `b43fc20` passed with PostgreSQL 16: https://github.com/aviunion1348-cloud/RelayOS/actions/runs/42413968546. This is partial CI, not the full mandatory release gate.
- Task owner/reviewer assignment is implemented and PostgreSQL-tested for organization integrity and audit, but UI is not browser-tested. It does not grant access; non-admin users remain denied pending proper RBAC/ABAC. Concurrent assignment edits are not yet protected. See `docs/quality/CHECKPOINT_TASK_ASSIGNMENT.md`.
- Task status and assignment updates now require an optimistic version and reject stale writes. Targeted sequential and concurrent PostgreSQL tests passed; other entities and UI recovery remain unverified. This supersedes the earlier note that task assignment has no concurrency protection; see `docs/quality/CHECKPOINT_TASK_CONCURRENCY.md`.
- Structured QA cases and recorded execution history are implemented and API/PostgreSQL-tested with basic duplicate-title and organization checks. UI is not browser tested; suites, defects, verified evidence, coverage, reporting and 3,500-case catalogue are incomplete. See `docs/quality/CHECKPOINT_QA.md`.
