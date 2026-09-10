# Z-GATE Digital Platform

"Where Business Meets Technology." Z-GATE LTD is a Rwandan company operating four integrated divisions — Advisory, Academy, Tech, and Data. This repository is the digital platform being built to support that business, developed through a sequence of documented phases before any implementation code.

## Start here

- **New to this repo?** Read `docs/devops/DEVELOPMENT_ENVIRONMENT.md` for setup, scripts, and the environment/secrets rules.
- **Want the full picture first?** The `docs/` tree is the project's real history, in order:

| Phase             | Docs                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------- |
| Discovery         | `docs/discovery/` — what existed before any of this (nothing but business documents)  |
| Business Analysis | `docs/business/` — requirements, workflows, domain model, role matrix, business rules |
| Product           | `docs/product/` — vision, personas, roadmap, backlog, user stories                    |
| UX Research       | `docs/ux/` — user journeys, experience requirements, information architecture         |
| Marketing         | `docs/marketing/` — positioning, messaging, conversion funnel                         |
| Design            | `docs/design/` — design system, components, accessibility, page specs                 |
| Architecture      | `docs/architecture/` — system context, domains, modules, data, ADRs                   |
| Security          | `docs/security/` — threat model, security requirements, RBAC, incident response       |
| DevOps            | `docs/devops/` — development environment (containerized — see Quick start)            |
| Database          | `docs/database/` — data model, entity relationships, lifecycles, migrations           |
| Frontend          | `docs/frontend/` — route map, component/state architecture, security, testing         |
| Backend           | `docs/backend/` — API conventions, authorization model, error handling                |

Every phase is grounded in the one before it — nothing here was invented ahead of an approved decision. `docs/architecture/ARCHITECTURE.md` and `docs/architecture/ADR/` are the fastest way to understand _why_ this repo looks the way it does technically.

## Repository structure

```
.                  Backend — Fastify + Kysely + PostgreSQL (docs/backend/)
apps/web/          Public website — Next.js (docs/frontend/)
db/migrations/     SQL schema, source of truth (docs/database/MIGRATION_STRATEGY.md)
docs/              Every phase's approved output, in the order above
```

Two independent packages, not an npm-workspaces monorepo — see `docs/frontend/FRONTEND_ARCHITECTURE.md` for why.

## Quick start (Docker Compose — the primary way to develop this project)

```bash
cp .env.example .env
docker compose up
```

- Website: http://localhost:3001
- API: http://localhost:3000
- Postgres: `localhost:5432` (dev-only throwaway credentials)

Full detail, including the host-level fallback if Docker isn't available to you: `docs/devops/DEVELOPMENT_ENVIRONMENT.md`.

## Current status

- **Backend:** a real, running Fastify application. `POST /api/public/contact` (lead capture, `docs/backend/API_CONVENTIONS.md`) is implemented and tested end-to-end, including in CI against a real Postgres instance running the actual `db/migrations/`.
- **Frontend:** the public website's global shell and all 7 MVP pages (Home, About, Advisory, Academy, Tech, Data, Contact) are implemented, statically generated, and tested — the Contact page's form is wired to the real backend endpoint above, not a mockup.
- **Not yet built:** authentication, the Client/Staff Portal, Academy, and everything else in `docs/product/PRODUCT_ROADMAP.md` beyond the current vertical slice — see that document and `docs/product/PRODUCT_BACKLOG.md` for what's next.
