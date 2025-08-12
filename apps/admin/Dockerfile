# Dockerfile for admin app
FROM node:20-alpine AS base
WORKDIR /app

# Install turbo
RUN npm install -g turbo

# Prune dependencies
FROM base AS pruner
WORKDIR /app

COPY . .
RUN turbo prune --scope=admin --docker

# Builder
FROM base AS builder
WORKDIR /app

# Copy pruned package.json files and lockfile
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json .

# Install dependencies
RUN npm install --frozen-lockfile

# Copy pruned source code
COPY --from=pruner /app/out/full/ .
COPY turbo.json .

# Build the app
RUN turbo run build --filter=admin

# Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/apps/admin/.next/standalone ./
# Copy static assets
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static

USER nextjs

EXPOSE 3002

CMD ["node", "apps/admin/server.js"]
