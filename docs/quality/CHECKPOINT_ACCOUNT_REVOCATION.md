# Account revocation and safe default — 2026-11-08

## Implemented

Migration 011 preserves existing accounts and roles, adds an active flag, and changes new database-user defaults from admin to viewer. The local demo bootstrap explicitly creates an admin; this is not production identity provisioning. Admin API can disable/re-enable same-organization users, excluding self-disable; disabling deletes all target sessions and subsequent requests check current account state. Login and disable serialize on the target user row so a concurrent login cannot leave a live session that revives when the account is re-enabled. Serialized, re-authorized admin lifecycle operations prevent two concurrent admins disabling each other. Target-aware audit records are transactional. Disabled users cannot receive new viewer grants or task assignments. Membership and existing task references remain in place on disable; re-enabling does not restore old sessions but existing memberships again apply after a new login.

## Verification

- Local PostgreSQL 18.6 migration/integration **2 passed / 0 failed**, including preservation of an existing admin during upgrade; least-privilege default, role and cross-tenant denials, multiple-session invalidation, failed disabled login, no old-session revival, audited enable/disable, concurrent login/disable and mutual-admin-disable race.
- Real PostgreSQL-backed Chromium **7 passed / 0 failed**, including sign-in, disable through a browser-origin API call, session denial, rejected login, re-enable and new login. There is no account administration UI yet; the disable call is not a UI workflow.
- Unit **3/3**, typecheck, production build and production dependency audit passed. The first integration run had a TypeScript SQL-string quoting error; fixed and rerun. Exact-commit CI must be checked after push.

## Security limitations

This is not a complete authentication/authorization solution. No admin UI, MFA, account recovery, rate limits, production identity integration, scoped permission model for most resources, RLS or database role separation. Admin authorization is ordinarily checked before business transactions: in-flight requests that already passed authorization may complete while a user is disabled. The lifecycle operations themselves serialize and recheck the actor. Existing sessions created outside the API or direct privileged SQL are outside these guarantees. Password hashing is scrypt, not the specified production Argon2id. The browser and PostgreSQL tests use disposable synthetic data only. No verified evidence, handover gate or SLA engine is claimed.
