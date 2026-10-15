# Z-GATE Digital Products

"Where Business Meets Technology." Z-GATE LTD is a Rwandan company with four divisions: Advisory, Academy, Tech and Data. This repository holds its digital products: **two self-contained products** that share only a small code layer and the edge proxy.

| Product                                                  | Folder                                                        | Status                                                |
| -------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| **Corporate website** (Next.js site + Payload CMS)       | `website/`: `frontend/` (site), `backend/` (CMS)              | CMS, pages, forms and launch hardening done           |
| **E-learning platform**                                  | `elearning/`: `frontend/`, `backend/` (API), `worker/` (jobs) | API carried over from v1; UI and worker are skeletons |
| **Operations portal** (v1 client portal + staff console) | `legacy/ops`                                                  | Feature-frozen; retired once its screens are rebuilt  |

The plan, assessment and decisions are in **`docs/platform-v2/`** (start with its `README.md`). The product split is ADR-007 and the self-contained layout ADR-008 (`docs/architecture/ADR/`). Both backends are planned to move to Django (Python); see ADR-008's last section. The final v1 state is preserved at the git tag `v1-final`.

## Repository structure

```text
website/      frontend/  backend/  database/  deploy/  docs/  README.md
elearning/    frontend/  backend/  worker/  database/  deploy/  docs/  README.md
shared/       the only code both products may use: config/, ui/, contracts/
platform/     the only shared runtime: edge/ (Caddyfile), observability/, scripts/
legacy/ops/   frozen v1 portal
docs/         cross-product docs: platform-v2/ (current plan), architecture/, earlier phases
```

Each product owns its Postgres (`database/`: roles, configs, backup scripts), its Compose files and env templates (`deploy/`), its Dockerfiles and its CI workflow. A product never imports from the other, both may import from `shared/`, and nothing imports from `legacy/`. `pnpm lint:boundaries` enforces this in CI. Workflows: `.github/workflows/website.yml`, `elearning.yml`, `shared.yml`, `legacy.yml`.

## Quick start (one product at a time)

```bash
corepack enable                                   # once; the pnpm version comes from package.json
pnpm install

docker compose -f website/deploy/compose.yml up -d        # the website's Postgres (localhost:5432)
cp website/deploy/env/dev.env.example website/backend/.env
cp website/deploy/env/dev.env.example website/frontend/.env
pnpm db:migrate:website && pnpm --filter @zgate/website-backend seed
pnpm dev:website                                  # site http://localhost:3002, CMS http://localhost:3004/admin
```

E-learning works the same way: `elearning/deploy/compose.yml` (Postgres on 5433), `elearning/deploy/env/dev.env.example` → `elearning/backend/.env`, `pnpm db:migrate:elearning`, then `pnpm dev:elearning` (API :3000, frontend :3003, worker :3005).

On an 8 GB machine, read **`docs/DEVELOPMENT_LOW_MEMORY.md`** first. Full setup, containers-for-everything (`--profile full`) and all commands: `docs/DEVELOPER_GUIDE.md`.

Checks: `pnpm lint:boundaries`, then `pnpm -r --workspace-concurrency=1 run <lint|typecheck|test|build>` locally (`pnpm lint` etc. use Turborepo, which CI runs).

## Current status

v1 was never deployed to production, and its release blockers are still open. They are tracked in `docs/HANDOVER.md`, `docs/SECURITY_GUIDE.md` and `docs/platform-v2/05-SECURITY-COMPLIANCE.md`. Don't treat any part of this repository as production-ready without reading those first. The website's deploy procedure is `website/docs/WEBSITE_DEPLOY.md`.
