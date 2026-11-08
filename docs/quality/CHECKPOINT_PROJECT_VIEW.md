# Project-view authorization slice — 2026-11-08

## Implemented, deliberately limited

Additive migrations 009–010 add tenant-bound project-view memberships and a permission-audit target user. An organization admin can grant/revoke a same-organization `viewer` access to one project's summary through API endpoints. Authorization is evaluated against the current session role and current membership on every project-view read; no membership is granted by migration. Grant/revoke and their actor, project and target audit records commit atomically. Duplicate grant fails. Other existing business endpoints remain admin-only; a project-view grant does not authorize them. This is **not** the complete role/resource authorization model, client portal or RLS. These endpoints do not yet have management or viewer screens.

Local tests: PostgreSQL integration **2 passed / 0 failed** (including additive upgrade, repeat migration, tenant-FK denial, cross-tenant grant denial, viewer grant/revoke denial, duplicate grant, immediate revoke and audit targets); unit **3/3**; Chromium/PostgreSQL **6/6** including browser-session login and browser-origin API requests for unauthorized read/grant, successful grant and revocation. The latter is not a viewer UI journey. Typecheck, build and production dependency audit passed. No production data used. Prior CI for exact `3d05976` passed: https://github.com/aviunion1348-cloud/RelayOS/actions/runs/42416268366; CI for this slice must be checked separately.

## Remaining

Project/client/workspace/partner roles, operational permissions, user lifecycle, fine-grained dashboard filtering, RLS and runtime privilege separation, policy administration/UI, and complete negative/race/security tests remain incomplete. Admins retain organization-wide access to existing endpoints. The system is not production-ready. Evidence verification, approval workflows, enforced handover, SLA engine, requirement ledger, feature atlas and 3,500 case catalogue remain incomplete. Do not treat stored QA reference text as verified evidence.
