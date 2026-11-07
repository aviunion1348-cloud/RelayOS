# Decisions

- 2026-11-07: Use Next.js for presentation, NestJS for the authoritative API, PostgreSQL and Drizzle for persistence. Prisma's native engine could not be fetched from the permitted network; Drizzle avoids that dependency. The API is not exposed directly to the browser; the web server proxies `/api`.
- Use a local bootstrap account solely to facilitate development. It does not represent the requested production identity, role or security architecture.
- Preserve the directive verbatim in `business/MASTER_DIRECTIVE.md`; do not invent the unavailable Excalidraw source.
- The database schema uses a composite task-to-project foreign key so a task cannot refer to another organization's project.
