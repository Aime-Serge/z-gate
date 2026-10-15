# Z-GATE Digital Products

"Where Business Meets Technology." Z-GATE LTD is a Rwandan company with four divisions: Advisory, Academy, Tech and Data. This repository holds its digital products. It is moving from one all-in-one web app (v1) to **separate products with separate backends**:

| Product                                                   | Folder                                               | Status                                                |
| --------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| **Corporate website** (full-stack: Next.js + Payload CMS) | `website/app`                                        | CMS, pages, forms and launch hardening done           |
| **E-learning platform**                                   | `elearning/frontend` (UI), `elearning/backend` (API) | API carried over from v1; UI is a deployable skeleton |
| **Operations portal** (v1 client portal + staff console)  | `legacy/ops`                                         | Moved as-is, feature-frozen                           |

The plan, assessment and decisions are in **`docs/platform-v2/`** (start with its `README.md`). The product split is `docs/architecture/ADR/ADR-007-separate-product-backends.md`. The final v1 state is preserved at the git tag `v1-final`.

## Repository structure

```text
website/       Corporate website: app/, .env.example, README.md
elearning/     E-learning platform: frontend/, backend/, .env.example, README.md
shared/        The only code both products may use: config/, ui/, contracts/
legacy/        Frozen v1 operations portal: ops/
infra/         docker/ (dev image), compose/ (local stacks), proxy/ (Caddyfile, production stack)
docs/          platform-v2/ (current plan), runbooks/, and every earlier phase's output
```

pnpm workspace + Turborepo, one lockfile. Each product has its own database, environment template, Dockerfiles, Compose file and CI workflow (`.github/workflows/website.yml`, `elearning.yml`, `legacy.yml`), and deploys independently.

**Boundaries are enforced:** `website/` and `elearning/` never import each other, both import only from `shared/`, and nothing imports `legacy/`. `pnpm lint:boundaries` checks this in every CI workflow.

## Quick start

```bash
corepack enable                                    # once; pnpm version comes from package.json
cp elearning/.env.example elearning/backend/.env
docker compose up                                  # or see docs/DEVELOPER_GUIDE.md for host setup
```

- Website: http://localhost:3002 (CMS admin at `/admin`; load the approved copy once with `pnpm --filter @zgate/website seed`)
- E-learning: http://localhost:3003 (frontend), http://localhost:3000 (API: `GET /api/health`, `GET /api/ready`)
- Ops portal: http://localhost:3001 (only with `--profile legacy`)
- Postgres: `localhost:5432`, databases `zgate_website` and `zgate_elearning` (dev-only credentials)

One product only: `docker compose -f infra/compose/website.yml up` (or `elearning.yml`; add `--profile legacy` for the ops portal).

Checks: `pnpm lint:boundaries && pnpm lint && pnpm typecheck && pnpm test && pnpm build`. Full detail: `docs/DEVELOPER_GUIDE.md`.

## Current status

v1 was never deployed to production, and its release blockers are still open. They are tracked in `docs/HANDOVER.md`, `docs/SECURITY_GUIDE.md` and `docs/platform-v2/05-SECURITY-COMPLIANCE.md`. Don't treat any part of this repository as production-ready without reading those first. The website's deploy procedure is `docs/runbooks/WEBSITE_DEPLOY.md`.
