# Z-GATE public website (Next.js) — docs/frontend/FRONTEND_ARCHITECTURE.md
#
# Two targets: dev (live-reload, used by docker-compose.yml) and prod
# (Next.js standalone output, minimal runtime image).

FROM node:22-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
# Source is volume-mounted by docker-compose.yml.
EXPOSE 3001
CMD ["npm", "run", "dev"]

FROM deps AS build
COPY . .
RUN npm run build

# Next.js standalone output — a minimal, self-contained server bundle,
# not the full node_modules tree.
FROM node:22-slim AS prod
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd --gid 1001 zgate && useradd --uid 1001 --gid zgate --shell /bin/false zgate
COPY --from=build --chown=zgate:zgate /app/.next/standalone ./
COPY --from=build --chown=zgate:zgate /app/.next/static ./.next/static
COPY --from=build --chown=zgate:zgate /app/public ./public
USER zgate
EXPOSE 3001
ENV PORT=3001

# Liveness probe (docs/devops/MONITORING.md) — the homepage is static,
# pre-rendered content (app/page.tsx's `export const dynamic = "error"`),
# so hitting "/" is a cheap, real check that the standalone server is
# actually serving, not just that the process is running. No dedicated
# health route exists on this package - the backend's /api/health is
# the one with a database behind it worth probing separately.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
