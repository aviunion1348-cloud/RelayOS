# Edge-case catalogue: source threshold and counting rules

The directive records “Edge cases before shipping: Minimum 3,500.” Scope and meaning are pending owner authorization. The source threshold is not a claim that 3,500 cases exist, have been executed, or are required for every project. No generated or duplicated cases count as executed evidence.

Each proposed case must have a stable ID, linked requirement and risk, a category, preconditions, input/event, expected behavior and rationale for distinctness. Execution is an independent, immutable result tied to build, environment, actual result, status, tester, time and evidence. Deduplication should compare requirement, preconditions, trigger and expected behavior; differing IDs, cosmetic values or titles alone do not make cases distinct.

Proposed taxonomy (not a claim of coverage): authorization and tenant boundaries; input validation and malformed data; workflow and policy state; concurrency and idempotency; deadlines, time zones and calendars; dependency and graph integrity; QA and handover evidence; storage and file exposure; integration outages and retries; recovery and migration; accessibility; privacy and AI retrieval. Cases should be risk-based, reproducible and independently reviewable.

Owner approval is required for the scope of the 3,500 threshold, eligibility rules, approved exceptions and whether generated suggestions can be accepted as distinct after human review. Automated test runs, manually executed cases, proposals and duplicates must remain distinguishable. Catalogue functionality and deduplication tooling are not yet implemented.
