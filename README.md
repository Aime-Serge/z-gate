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
| DevOps            | `docs/devops/` — this development foundation                                          |

Every phase is grounded in the one before it — nothing here was invented ahead of an approved decision. `docs/architecture/ARCHITECTURE.md` and `docs/architecture/ADR/` are the fastest way to understand _why_ this repo looks the way it does technically.

## Quick start

```bash
npm ci
cp .env.example .env   # fill in local values; never commit .env
npm run lint
npm run typecheck
npm test
npm run build
```

Full detail: `docs/devops/DEVELOPMENT_ENVIRONMENT.md`.

## Current status

This is a tooling foundation, not a running application yet. `src/health.ts` exists only to prove the lint/typecheck/test/build pipeline works end-to-end — real modules (`identity`, `clients`, `advisory`, etc., per `docs/architecture/MODULE_ARCHITECTURE.md`) land in the dedicated backend/frontend phases that follow this one.
