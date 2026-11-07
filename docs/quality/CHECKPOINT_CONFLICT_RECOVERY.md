# Task conflict recovery checkpoint — 2026-11-08

Task status and assignment conflicts now offer an explicit refresh. A stale assignment cannot be resubmitted until refresh; the user is warned that selections will be cleared, and must reselect the task and review current owner/reviewer before retrying. Refresh does not silently submit an edit. The API continues to reject stale versions transactionally.

Local evidence: Chromium against disposable PostgreSQL 18.6 **5 passed / 0 failed** including two-tab status conflict, refresh and successful retry, and a two-tab assignment conflict with mandatory refresh, review and retry. Typecheck passed; build passed before the final small refresh-error handling change. Previous checkpoint's PostgreSQL API integration **2/2** and unit **3/3** passed; those suites were not rerun for this UI-only change. CI was in progress at the time of writing.

These checks do not cover all entities, offline editing, accessibility or all failure modes. Network failure during refresh returns to the existing API-unavailable view. The larger directive, permissions, SLA, verified evidence, approvals and handover remain incomplete; see `docs/HANDOFF.md`.
