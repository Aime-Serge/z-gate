# Z-GATE backend (Fastify + Kysely + PostgreSQL) — docs/backend/BACKEND_ARCHITECTURE.md
#
# Two targets:
#   dev  — used by docker-compose.yml for local development (source
#          volume-mounted, tsx watch for live reload)
#   prod — standalone image for deployment (docs/architecture/
#          DEPLOYMENT_ARCHITECTURE.md), builds with tsc, runs compiled JS

FROM node:22-slim AS base
WORKDIR /app

# ---- deps: install once, shared by both targets ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- dev: live-reload target used by docker-compose.yml ----
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
# Source is volume-mounted by docker-compose.yml, not copied here — a
# rebuild isn't needed to pick up a source change.
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- build: compiles TypeScript for the production image ----
FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- prod: minimal runtime image, no dev dependencies, no source ----
FROM node:22-slim AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
# scripts/migrate.mjs (docs/devops/DEPLOYMENT_RUNBOOK.md's migration
# step) and the SQL it applies — bundled into the same image that runs
# the app, not a separately-built migration image, so "what ran the
# migration" and "what's actually deployed" can never drift apart. Its
# only runtime dependency is `pg`, already installed above.
COPY scripts ./scripts
COPY db/migrations ./db/migrations

# Runs as a non-root user, not the image default root — least privilege
# (docs/security/SECURITY_REQUIREMENTS.md V14) applies to the container
# process, not just application-level roles.
RUN groupadd --gid 1001 zgate && useradd --uid 1001 --gid zgate --shell /bin/false zgate
USER zgate

# Matches lib/config.ts's own PORT default — explicit here so the
# HEALTHCHECK below and this image's documented port can never drift
# from what the app actually binds to.
ENV PORT=3000
EXPOSE 3000

# Liveness probe (docs/devops/MONITORING.md) — hits the same /api/health
# a load balancer/orchestrator would, from inside the container itself.
# Plain `node`/global fetch, not curl/wget — neither is installed on the
# `-slim` base, and adding one just for this would widen the image's
# attack surface for a check this small.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/server.js"]
