# Browser and accessibility checkpoint — 2026-11-08

## Implemented
- Repeatable Playwright suite starts isolated API and web ports and requires an explicitly flagged, already migrated disposable PostgreSQL database. Each test creates a synthetic organization/user and leaves its records behind; never use a shared or production database. Tests do not silently skip on missing prerequisites.
- Real Chromium exercised discovery, consultation, requirements, planning, dependency blocking, assignment and QA result persistence, including a reload and direct PostgreSQL assertion; a second two-tab test checked stale-write rejection. The QA evidence reference is **not verified evidence**.
- Fixed blocked development HMR origins, bundled fonts locally, mobile overflow and mobile sign-out. Dialogs support initial focus, Tab wrapping, Escape and focus restoration. Improved muted-text contrast.
- CI installs Playwright Chromium and system dependencies and runs the suite after migrations; CI execution on this commit is not yet verified.

## Local results
- PostgreSQL 18.6: integration **2 passed / 0 failed**; unit **3 passed / 0 failed**; typecheck, production build and `npm audit --omit=dev` passed.
- Real headless Chromium + PostgreSQL: **4 passed / 0 failed**. Tests include one mobile keyboard/focus/sign-out journey and automated axe WCAG 2/2.1 A/AA scans of login and mobile work board. Axe is not a complete accessibility audit. Initial suite failures exposed locator ambiguity and mobile overflow; fixed and rerun. The first focus test expected a disabled button to receive focus; corrected to the enabled Cancel button.
- The local browser needed Mozilla NSPR/NSS libraries built under `/tmp` and `LD_LIBRARY_PATH`; Chromium used `--no-sandbox --disable-dev-shm-usage`, so this does not validate browser sandboxing or NSS/FIPS. CI uses standard Playwright installation, not these temporary libraries.

## Reproduction
Install dependencies and Playwright Chromium with system libraries (`npx playwright install --with-deps chromium`), create a dedicated disposable PostgreSQL DB, migrate it using `DATABASE_URL=... npm run db:migrate`, then run `TEST_DATABASE_URL=... RELAYOS_DISPOSABLE_TEST_DB=yes npm run test:e2e`. Ports 3300 and 3301 and Next's dev build directory must be free; stop other `next dev apps/web` instances first. Optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` is for an already-installed compatible Chromium.

## Remaining
This is a narrow four-test suite, not all controls, browsers, responsive sizes or journeys. Complete accessibility, security, production and visual gates remain open. User-facing stale conflict recovery, full permissions, SLA, validated evidence and approvals, handover gates, editable dashboards, remaining lifecycle, catalogue and 3,500 meaningful cases are incomplete. See `docs/HANDOFF.md` and the source inventory; no production readiness is implied.
