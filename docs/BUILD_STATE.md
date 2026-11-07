# Build state

Release 1 is in progress. The initial repository assessment is in `docs/architecture/REPOSITORY_BASELINE.md`. The first security and database validation checkpoint is described in `docs/quality/CHECKPOINT_2026-11-08.md`.

Next: build and test client/consultation pipeline, requirements, milestones, configurable workflows and dashboards, QA and non-bypassable handover; implement production-grade identity, permissions and database isolation; expand release gates and create the actual demo only after relevant features work. Preserve existing data and use additive migrations.

Discovery checkpoint: consultations and draft requirements were added with API/DB tests. See `docs/quality/CHECKPOINT_DISCOVERY.md`; UI testing remains blocked by missing browser shared libraries. Continue immediately with granular authorization, the client lifecycle, workflow/QA/handover and remaining Release 1 requirements.
