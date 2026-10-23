# Build from the workspace root: docker build -f packages/registry/Dockerfile .
FROM oven/bun:1.4.3 AS base
WORKDIR /app

FROM base AS dependencies
COPY . .
RUN bun install --frozen-lockfile

FROM dependencies AS build
RUN bun run --cwd packages/registry build:server

FROM base AS production-dependencies
COPY . .
RUN bun install --production --frozen-lockfile

# Provision the native hashing backend through the maintained Pantry installer.
FROM base AS zig-toolchain
WORKDIR /app/packages/registry
RUN apt-get update && apt-get install -y --no-install-recommends curl unzip ca-certificates && rm -r /var/lib/apt/lists/*
COPY packages/registry/pantry.json ./
COPY packages/registry/scripts/provision-zig.ts ./scripts/
COPY packages/registry/src/zig-native-hash.ts ./src/
RUN bun scripts/provision-zig.ts

FROM base AS production
WORKDIR /app/packages/registry
COPY --from=production-dependencies /app/node_modules /app/node_modules
# Preserve the workspace paths used for runtime templates and catalog data.
COPY --from=build /app/packages/registry /app/packages/registry
COPY --from=build /app/packages/ts-pantry /app/packages/ts-pantry
COPY --from=build /app/docs /app/docs
COPY --from=zig-toolchain /app/packages/registry/pantry ./pantry

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e 'process.exit((await fetch("http://localhost:3000/ready")).ok ? 0 : 1)'

CMD ["bun", "run", "dist/server.js"]
