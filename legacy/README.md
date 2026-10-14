# Legacy

Frozen v1 code kept running until its replacement exists. Nothing in this repository may import from `legacy/` (`pnpm lint:boundaries`).

| Folder | Package      | What it is                                                                                      |
| ------ | ------------ | ----------------------------------------------------------------------------------------------- |
| `ops/` | `@zgate/ops` | The v1 web app: client portal and staff console, talking to `elearning/backend`. Feature-frozen |

Only security fixes and changes forced by the repository layout land here. Decision D2 in `docs/platform-v2/07-MIGRATION-PLAN.md` keeps it frozen until the first Advisory client needs portal access, then revisits it.

Run it with `docker compose -f infra/compose/base.yml -f infra/compose/elearning.yml -f infra/compose/legacy.yml up` (http://localhost:3001). CI: `.github/workflows/legacy.yml`.
