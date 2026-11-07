# Source traceability

The uploaded master directive is preserved verbatim in `MASTER_DIRECTIVE.md`. The Excalidraw export referenced by it was not included in the available attachments. Consequently, element IDs, ordinals and exact source text cannot be verified or reproduced. Element-level traceability is blocked pending the export; no interpretation is marked approved.

| Source | Requirement | Current location | Verification |
| --- | --- | --- | --- |
| Master directive, stage 1 | Prospect registration and duplicate prevention | API prospect endpoint and database uniqueness | Input normalization unit test only; DB behavior pending |
| Master directive, stages 7–8 | Project and task organization | Project/task API and workspace | Unit input tests only; integration pending |
| Master directive, audit requirement | Audit records | Transactional API writes | Database verification pending |
| Master directive, authentication | Secure sessions and revocation | `user_sessions`, login/logout/identity | Targeted logout and reuse integration test; full session management pending |
| Master directive, database | PostgreSQL persistence, migration safety, isolation | SQL migrations, migration runner and API | Isolated PostgreSQL tests; comprehensive isolation and production roles pending |
| Master directive, QA | 3,500 distinct edge cases, owner-defined scope | `EDGE_CASE_CATALOG_POLICY.md` | Taxonomy documented; catalogue and execution not implemented |
| Master directive stages 2 and 4 | Capture initial and technical consultation discussion | `consultations` PostgreSQL records, API, Consultations screen | API integration tests passed; UI browser verification pending |
| Master directive requirements | Draft requirements linked to consultation | `requirements` table, API, Consultations screen | API persistence and isolation tested; approvals/baselining not implemented |
| Master directive stages 7–8 | Break project scope into modules and milestones | `milestones`, `delivery_modules`, API, Planning screen | API and PostgreSQL relationship tests passed; UI verification and broader planning remain pending |
| Master directive task dependencies | Prevent circular links and block completion until prerequisites are done | `task_dependencies` and task API | PostgreSQL integration tests including concurrent inverse links passed; UI not browser tested |
| Master directive task accountability | Task owner and reviewer | `tasks.owner_id`, `reviewer_id`, assignment endpoint and Work board | Organization FK and API/audit tests passed; UI and project-level access pending |
| Master directive concurrent editing | Detect stale updates rather than overwrite | Task version and status/assignment endpoints | Stale and concurrent assignment PostgreSQL tests passed; other records/UI remain pending |
| Master directive QA and edge cases | Store meaningful test cases and historical test outcomes | `qa_cases`, `qa_results`, QA API and screen | Targeted API/PostgreSQL tests passed; UI, verified evidence, coverage and threshold unmet |
