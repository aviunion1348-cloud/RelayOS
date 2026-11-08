# Requirement ledger — work in progress

`DIRECTIVE_SOURCE_INVENTORY.csv` is a line-addressed inventory of the complete attached directive (SHA-256 `d5c0a3d2d3834d92d4571e603c159baff849924661f96c7518a918e3e196fe03`). Each nonempty source line is preserved verbatim with its line number and nearest section heading. It is **not yet a classified requirements ledger**: source lines include headings, examples and prose, and human/domain review is necessary to identify individual obligations, combine wrapped lines, resolve conflicts and attach evidence. All inventory rows remain `REVIEW REQUIRED`; no line is silently marked implemented or deferred by the script.

The requested final categories are IMPLEMENTED AND VERIFIED, IMPLEMENTED, NOT YET VERIFIED, ROADMAP / APPROVED LATER RELEASE, BLOCKED BY A SPECIFIC EXTERNAL DEPENDENCY, and PENDING ORGANIZATIONAL APPROVAL. Existing in-progress Release 1 work must not be mislabeled as a later-release approval or an external blocker. The ledger cannot be called complete until all requirements are reviewed, classified with reasons, and linked to code/tests or specific blockers.

Current partial traceability is in `docs/business/SOURCE_TRACEABILITY.md` and checkpoint reports in `docs/quality/`. See `docs/BUILD_STATE.md` for current work and `docs/BLOCKERS.md` for known blockers. The feature/control atlases and manager evidence pack remain incomplete; this source inventory is not a substitute for them.

## Classified, narrowly scoped obligations (partial review)

| Directive source | Obligation | Classification | Evidence / limitation |
|---|---|---|---|
| 6587 | A hidden UI component is not access control | IMPLEMENTED AND VERIFIED | Backend independently enforces the project-summary membership slice; `docs/quality/CHECKPOINT_PROJECT_VIEW.md` and `CHECKPOINT_VIEWER_ADMIN.md`. This does not claim every future resource is implemented or secured. |
| 6604 | Project membership changes take effect correctly for project-summary reads | IMPLEMENTED AND VERIFIED | Targeted API and Chromium grant/revoke tests in `docs/quality/CHECKPOINT_VIEWER_ADMIN.md`; already-rendered data requires refresh. Other membership types remain unimplemented and unclassified. |

This table is not the complete ledger. Unimplemented Release 1 obligations are not automatically organizational approvals, external blockers, or approved later releases; they remain explicitly unclassified until a truthful classification and evidence are available.
