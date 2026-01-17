# Pantry Registry - Production Dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS install
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production

# Build
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production
FROM base AS production
COPY --from=install /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

# Set environment defaults
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["bun", "run", "dist/server.js"]
