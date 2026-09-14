# Z-GATE Digital Platform

"Where Business Meets Technology." Z-GATE LTD is a Rwandan company operating four integrated divisions — Advisory, Academy, Tech, and Data. This repository is the digital platform built to support that business: a public marketing website, lead-capture/CRM, a staff operations platform, a client portal, and a full Academy course/enrollment workflow.

## Start here

- **New to this repo?** Read `docs/SYSTEM_OVERVIEW.md` first, then `docs/DEVELOPER_GUIDE.md` for setup.
- **Taking this over, or auditing it?** `docs/HANDOVER.md` is the accurate, current state — what's built, what's not, and what's still blocking a real production launch. Read it before trusting any status claim elsewhere in this repo, including in this file.
- **Want the full history?** The `docs/` tree is the project's real history, phase by phase — `docs/discovery/` through `docs/backend/` for how this system was designed before it was built, plus `docs/qa/`, `docs/security/`, `docs/performance/`, `docs/devops/`, and `docs/release/` for how it was verified afterward.

## Repository structure

```
backend/           Fastify + Kysely + PostgreSQL API (docs/backend/, docs/ARCHITECTURE.md)
frontend/          Public website + portal + staff platform — Next.js (docs/frontend/)
docs/              Every phase's approved output, plus the top-level handover docs below
```

Two independent packages, each with its own `package.json`/lockfile — deliberately not an npm-workspaces monorepo (`docs/frontend/FRONTEND_ARCHITECTURE.md`).

## Quick start (Docker Compose — the primary way to develop this project)

```bash
cp backend/.env.example backend/.env
docker compose up
```

- Website: http://localhost:3001
- API: http://localhost:3000 (health check: `GET /api/health`, readiness: `GET /api/ready`)
- Postgres: `localhost:5432` (dev-only throwaway credentials)

Full detail, including the host-level fallback if Docker isn't available to you: `docs/DEVELOPER_GUIDE.md` and `docs/devops/DEVELOPMENT_ENVIRONMENT.md`.

## Current status

See `docs/HANDOVER.md` for the complete, current picture — code quality is strong (lint/typecheck/tests/build clean on both packages, real CI running on GitHub Actions), but this platform is **not yet cleared for production deployment**: an independent security audit and a commercial-readiness review both found real, unresolved issues after the initial release-candidate phase. Do not treat this repository as "done" without reading that document first.
