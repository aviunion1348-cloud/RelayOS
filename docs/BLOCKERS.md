# Blockers and release risks

- The Markdown is actionable for implementation. The original 323-element Excalidraw export is not attached; element IDs and ordinals cannot be independently reconstructed.
- Docker and PostgreSQL executables are not installed globally. A disposable PostgreSQL 18.6 instance was obtained for targeted local tests; Compose/PostgreSQL 16 and actual GitHub CI runs remain unverified.
- No browser-backed end-to-end test or final demonstration recording has been produced. A full production release remains blocked by missing lifecycle functionality and release-gate evidence.
- The local Compose database user owns the database. Separate runtime/migration/backup roles, least privilege, backups and production configuration are not implemented.
- Authentication lacks rate limiting, granular permissions, MFA, Argon2id, password recovery, full session administration and production account lifecycle. Logout now revokes its current session, but that alone is not production identity management. Do not expose this application publicly or use sensitive data.
- CI is partial; full mandatory checks, protected branch configuration and production release approvals are not in place. No production deployment or repository permission change was made.
- An attempted browser test using an npm-supplied Chromium binary could not launch: `libnspr4.so`, `libnss3.so` and `libnssutil3.so` are missing. Browser tests and demo recording remain unverified; try a compatible browser/runtime or obtain these libraries before claiming UI validation.
