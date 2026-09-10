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

# Runs as a non-root user, not the image default root — least privilege
# (docs/security/SECURITY_REQUIREMENTS.md V14) applies to the container
# process, not just application-level roles.
RUN groupadd --gid 1001 zgate && useradd --uid 1001 --gid zgate --shell /bin/false zgate
USER zgate

EXPOSE 3000
CMD ["node", "dist/server.js"]
