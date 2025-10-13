# ============================================================
# Stage 1 — Builder
# ============================================================
FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./

# Install all deps for build
RUN yarn install --frozen-lockfile --non-interactive --no-progress

# Copy source
COPY . .

# Build project
RUN yarn clean && yarn lint || true && yarn typecheck || true && yarn build

# Generate Prisma client only (no DB required)
COPY prisma ./prisma
RUN echo "⚙️ Generating Prisma client..." && npx prisma generate --no-engine

# ============================================================
# Stage 2 — Pruner (Dependency Slimming)
# ============================================================
FROM node:24-alpine AS pruner

WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules

RUN yarn install --frozen-lockfile --non-interactive --production=true --prefer-offline && \
    yarn cache clean

# ============================================================
# Stage 3 — Runner (Production)
# ============================================================
FROM node:24-alpine AS runner

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
USER nodejs

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=pruner /app/package.json ./
COPY --from=pruner /app/yarn.lock ./
COPY --from=pruner /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# ============================================================
# Safe Prisma Migration Handling
# ============================================================
# This script will:
# 1. Check DB connectivity
# 2. Run migrations only if DB is reachable
# 3. Always start the Node app regardless of DB status

COPY <<'EOF' ./entrypoint.sh
#!/bin/sh
set -e

echo "🔍 Checking database connectivity..."
if nc -z "${DATABASE_HOST:-postgres.database.svc.cluster.local}" "${DATABASE_PORT:-5432}"; then
  echo "✅ Database reachable — running Prisma migrations..."
  npx prisma migrate deploy --schema=./prisma/schema.prisma || echo "⚠️ Prisma migration failed, continuing startup..."
else
  echo "⚠️ Database not reachable — skipping migrations."
fi

echo "🚀 Starting application..."
exec yarn start
EOF

RUN chmod +x ./entrypoint.sh

# Cleanup (optional)
RUN find node_modules -type d \( -name "test" -o -name "tests" -o -name "example*" -o -name "docs" \) -exec rm -rf {} + || true

EXPOSE 5000


HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["./entrypoint.sh"]

# ============================================================
# Stage 4 — Dev Environment (Optional)
# ============================================================
FROM node:24-alpine AS dev

WORKDIR /app
COPY . .
RUN yarn install && yarn global add nodemon
EXPOSE 5000
CMD ["yarn", "run", "dev"]
