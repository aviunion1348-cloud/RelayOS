# Release 1 discovery checkpoint — 2026-11-08

## Implementation

Additive migration 003 introduces structured consultation records tied to prospects and draft requirements tied to consultations, with composite organization foreign keys and audit events. Backend endpoints validate input and scope all reads and writes to the session organization. The UI provides creation and listing of consultations and draft requirements. Requirement approval, modification, baselining, meeting scheduling and the broader client pipeline remain unimplemented. Both endpoints currently rely on organization membership, not the required fine-grained project/client authorization.

## Evidence

- On isolated PostgreSQL 18.6, `npm run db:migrate` applied 003; `npm run test:integration` passed 2 tests, including migration from 001 with preserved record, API creation/read, persisted consultation and requirement, organization boundary denials, and foreign-key denial. `npm run typecheck`, `npm test` (3 tests), and `npm run build` passed.
- UI was built but not verified in a browser. A real browser test was attempted with npm-supplied `@sparticuz/chromium` and `playwright-core`. Chromium could not start because the environment lacks `libnspr4.so`, `libnss3.so` and `libnssutil3.so`. No browser test, accessibility audit, demo or anti-slop Delivery Gate is claimed as passed.
- The actual upstream Anti-Slop files were inspected at commit 9504989f162a92b1996853eccbb3d8a86e73df68; project-local rules and selected skills copied with license. See `docs/quality/antislop/SETUP.md`.

The previous API integration test remains limited and does not establish production tenant security. Error responses, editing, long-form navigation, keyboard/focus behavior, and external rendering have not received browser-level verification.

## Follow-on authorization hardening

An interim fail-closed rule now denies all protected business endpoints to non-`admin` roles. PostgreSQL integration tests exercised a viewer's denied overview, project creation and consultation access, alongside normal admin behavior. This deliberately restricts non-admin users until real role and resource policies exist; it is not the requested RBAC/ABAC system and does not provide project-level or RLS isolation. Login itself remains available, and logout remains available to revoke a session.

An additional local HTTP smoke check through the actual Next.js proxy logged in with an isolated synthetic account, created a prospect and consultation, and retrieved the persisted consultation (201/201/200). This did not run a browser or verify the interface.
