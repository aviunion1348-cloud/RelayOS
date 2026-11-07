# Source traceability

The uploaded master directive is preserved verbatim in `MASTER_DIRECTIVE.md`. The Excalidraw export referenced by it was not included in the available attachments. Consequently, element IDs, ordinals and exact source text cannot be verified or reproduced. Element-level traceability is blocked pending the export; no interpretation is marked approved.

| Source | Requirement | Current location | Verification |
| --- | --- | --- | --- |
| Master directive, stage 1 | Prospect registration and duplicate prevention | API prospect endpoint and database uniqueness | Input normalization unit test only; DB behavior pending |
| Master directive, stages 7–8 | Project and task organization | Project/task API and workspace | Unit input tests only; integration pending |
| Master directive, audit requirement | Audit records | Transactional API writes | Database verification pending |
