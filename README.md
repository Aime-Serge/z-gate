# Z-GATE Digital Products

"Where Business Meets Technology." Z-GATE LTD is a Rwandan company with four divisions: Advisory, Academy, Tech and Data. This repository holds its digital products as **independent sub-projects**: each has its own pnpm workspace, lockfile, database, deploy files and CI workflow, and nothing joins them at the root.

| Product                                                  | Folder                                                                  | Status                                                |
| -------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------- |
| **Corporate website** (Next.js site + Payload CMS)       | [`website/`](website/README.md): `frontend/`, `backend/`, `packages/`   | CMS, pages, forms and launch hardening done           |
| **E-learning platform**                                  | [`elearning/`](elearning/README.md): `frontend/`, `backend/`, `worker/` | API carried over from v1; UI and worker are skeletons |
| **Operations portal** (v1 client portal + staff console) | [`legacy/ops/`](legacy/ops/README.md)                                   | Feature-frozen; retired once its screens are rebuilt  |

The plan, assessment and decisions are in **`docs/platform-v2/`** (start with its `README.md`). The product split is ADR-007, the self-contained products ADR-008, and the independent workspaces ADR-009 (`docs/architecture/ADR/`). Both backends are planned to move to Django (Python); see ADR-008's last section. The final v1 state is preserved at the git tag `v1-final`.

## Repository structure

```text
website/       its own workspace: frontend/ backend/ packages/ config/ tests/contracts/ database/ deploy/ docs/ scripts/
elearning/     its own workspace: frontend/ backend/ worker/ packages/ config/ tests/contracts/ e2e/journeys/ database/ deploy/ docs/ scripts/
legacy/ops/    its own workspace: the frozen v1 portal
docs/          cross-product docs: platform-v2/ (current plan), architecture/ (ADRs), earlier phases, low-memory guide
.github/       one CI workflow per workspace, plus repository.yml (secrets scan), journey.yml and synthetic.yml
```

There is **no root `package.json` or lockfile**: run every command inside `website/`, `elearning/` or `legacy/ops/`. In VS Code, open **`z-gate.code-workspace`**: it shows `website` and `elearning` as separate projects (each with its own settings, terminal and TypeScript server), plus the frozen ops portal and the repository root (docs, CI). To work on one product only, open just its folder. Each product owns its Postgres (`database/`: roles, configs, backup scripts), its Compose files and env templates (`deploy/`), its Dockerfiles and its CI workflow. The website's production stack also runs the edge proxy for both products (`website/deploy/edge/`).

**Contracts between the products.** They never import each other's apps. Each provider owns a contract package, and the other product uses it only in its `tests/contracts`:

| Contract                              | Owned by   | Package                                     |
| ------------------------------------- | ---------- | ------------------------------------------- |
| Catalog API (`/api/v1`), enroll links | e-learning | `elearning/packages/elearning-contracts`    |
| Lead/waitlist webhook, lead form      | website    | `website/packages/website-contracts`        |
| Brand tokens and components           | website    | `website/packages/brand-ui`                 |

Breaking changes fail before they merge: schema-compatibility tests and `oasdiff breaking` on the provider side, the consumer's contract tests run in the provider's pull request, a customer-journey test that must pass on staging before any production deploy (`journey.yml`), and read-only production checks every 10 minutes once configured (`synthetic.yml`). Each workspace's `pnpm lint:boundaries` enforces the import rules.

## Quick start (one product at a time)

```bash
corepack enable                                   # once; each workspace pins its pnpm version

cd website
pnpm install
docker compose -f deploy/compose.yml up -d        # the website's Postgres (localhost:5432)
cp deploy/env/dev.env.example backend/.env
cp deploy/env/dev.env.example frontend/.env
pnpm db:migrate && pnpm --filter @zgate/website-backend seed
pnpm dev                                          # site http://localhost:3002, CMS http://localhost:3004/admin
```

E-learning works the same way inside `elearning/`: `deploy/compose.yml` (Postgres on 5433), `deploy/env/dev.env.example` to `backend/.env`, `pnpm db:migrate`, then `pnpm dev` (API :3000, frontend :3003, worker :3005).

On an 8 GB machine, read **`docs/DEVELOPMENT_LOW_MEMORY.md`** first. Full setup, containers for everything (`--profile full`) and all commands: `docs/DEVELOPER_GUIDE.md`.

Checks, inside a workspace: `pnpm lint:boundaries`, then `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`.

## Current status

v1 was never deployed to production, and its release blockers are still open. They are tracked in `docs/HANDOVER.md`, `docs/SECURITY_GUIDE.md` and `docs/platform-v2/05-SECURITY-COMPLIANCE.md`. Don't treat any part of this repository as production-ready without reading those first. The website's deploy procedure is `website/docs/WEBSITE_DEPLOY.md`.
