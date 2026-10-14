# Z-GATE Digital Products

"Where Business Meets Technology." Z-GATE LTD is a Rwandan company with four divisions: Advisory, Academy, Tech and Data. This repository holds its digital products. It is moving from one all-in-one web app (v1) to **separate products with separate backends**:

| Product                                                   | App(s)                                               | Status                                          |
| --------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| **Corporate website** (full-stack: Next.js + Payload CMS) | `website/app`                                        | CMS, pages, forms done; launch hardening next   |
| **E-learning platform**                                   | `elearning/frontend` (UI), `elearning/backend` (API) | API carried over from v1; UI scaffold to follow |
| **Operations portal** (v1 client portal + staff console)  | `legacy/ops`                                         | Moved as-is, feature-frozen                     |

The plan, assessment and decisions are in **`docs/platform-v2/`** (start with its `README.md`). The separate-backends decision is `docs/architecture/ADR/ADR-007-separate-product-backends.md`. The final v1 state is preserved at the git tag `v1-final`.

## Repository structure

```text
website/       Corporate website (website/app)
elearning/     E-learning platform (frontend, backend)
legacy/        Frozen v1 operations portal (legacy/ops)
shared/        Shared code: ui, contracts, config
infra/         Development image; deployment config to follow
docs/          platform-v2/ (current) + every earlier phase's output
```

pnpm workspace + Turborepo. One lockfile; each app deploys independently.

## Quick start

```bash
corepack enable                                    # once; pnpm version comes from package.json
cp elearning/backend/.env.example elearning/backend/.env
docker compose up                                  # or see docs/DEVELOPER_GUIDE.md for host setup
```

- Website: http://localhost:3002 (CMS admin at `/admin`; load the approved copy once with `pnpm --filter @zgate/website seed`)
- Ops portal: http://localhost:3001
- API: http://localhost:3000 (`GET /api/health`, `GET /api/ready`)
- Postgres: `localhost:5432` (dev-only credentials)

Checks: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`. Full detail: `docs/DEVELOPER_GUIDE.md`.

## Current status

v1 was never deployed to production, and its release blockers are still open. They are tracked in `docs/HANDOVER.md`, `docs/SECURITY_GUIDE.md` and `docs/platform-v2/05-SECURITY-COMPLIANCE.md`. Don't treat any part of this repository as production-ready without reading those first.
