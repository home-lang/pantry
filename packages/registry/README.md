# @stacksjs/registry

Pantry package registry backend. A simple, fast package registry that works with the Pantry CLI.

The authoritative route, authentication, integrity, storage, failure, operations,
and test contract is [docs/registry.md](../../docs/registry.md). CI verifies its
critical claims directly against the route handlers.

## Features

- **npm-compatible API** - Works with the Pantry CLI out of the box
- **npm fallback** - Packages not in the registry fall back to npmjs automatically
- **Zig package support** - Host Zig packages with content-addressed hashing
- **S3 storage** - Tarball storage via S3 (or local filesystem for development)
- **Analytics** - Track download counts and package statistics
- **Portable metadata** - Local/in-memory stores for development and an object-storage snapshot for production
- **Publish-time malware scanning** - Fail-closed ClamAV scanning before any package becomes installable
- **Zero config** - Works out of the box for local development

## Quick Start

```bash
# Start the registry server
bun run start

# Or in development mode with hot reload
bun run dev
```

The server will start at `<http://localhost:3000>`.

## API Endpoints

### npm-compatible Packages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/packages/{name}` | Get latest package metadata |
| GET | `/packages/{name}/{version}` | Get specific version metadata |
| GET | `/packages/{name}/{version}/tarball` | Download package tarball |
| GET | `/packages/{name}/versions` | List all versions |
| GET | `/search?q={query}` | Search packages |
| POST | `/publish` | Publish a package |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/top` | Top downloaded packages |
| GET | `/analytics/{name}` | Package download stats |
| GET | `/analytics/{name}/timeline` | Download history (30 days) |

### Commit Packages (pkg-pr-new equivalent)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/publish/commit` | Publish packages from a git commit |
| GET | `/commits/{sha}` | List all packages for a commit |
| GET | `/commits/{sha}/{name}` | Get commit package metadata |
| GET | `/commits/{sha}/{name}/tarball` | Download commit package tarball |

### Zig Packages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/zig/packages/{name}` | Get Zig package metadata |
| GET | `/zig/packages/{name}/{version}` | Get specific version |
| GET | `/zig/packages/{name}/{version}/tarball` | Download tarball |
| GET | `/zig/packages/{name}/versions` | List all versions |
| GET | `/zig/hash/{hash}` | Lookup package by content hash |
| GET | `/zig/search?q={query}` | Search Zig packages |
| POST | `/zig/publish` | Publish a Zig package |

## Configuration

The registry can be configured via environment variables:

```bash
# Server port
PORT=3000

# Base URL for tarball URLs
BASE_URL=https://registry.example.com

# S3 configuration (for production)
S3_BUCKET=my-registry-bucket
S3_REGION=us-east-1

# DynamoDB configuration (for production)
DYNAMODB_TABLE=registry-packages
DYNAMODB_ANALYTICS_TABLE=registry-analytics

# AWS credentials
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1

# Required in production (defaults to required when NODE_ENV=production)
PANTRY_MALWARE_SCANNING=required
CLAMD_SOCKET=/run/clamav/clamd.ctl
CLAMD_HOST=127.0.0.1
CLAMD_PORT=3310
PANTRY_BINARY_STAGING_SECRET=replace-with-openssl-rand-hex-32
PANTRY_REQUIRE_BINARY_SCAN_ATTESTATION=true
```

See [publish-time malware scanning](../../docs/registry-malware-scanning.md) for
the verdict contract, dual-use `contentPolicy`/`DISCLOSURE` requirements, clamd
deployment, EICAR rehearsal, monitoring, and incident runbook.
`CLAMD_SOCKET` takes precedence over `CLAMD_HOST`/`CLAMD_PORT`; use the socket
for a local systemd-managed daemon and TCP for containers or remote scanners.

### Native binary publication

Native artifacts use an authenticated scan-before-promote API:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/binaries/uploads` | Create a short-lived, untrusted staged upload |
| POST | `/api/v1/binaries/uploads/complete` | Seal, stream-scan, verify, and promote the artifact |
| POST | `/api/v1/binaries/rescan` | Stream-scan and attest or quarantine an existing artifact (operator only) |
| POST | `/api/v1/binaries/quarantine/rescan/prepare` | Prepare an exact private quarantine object for isolated review |
| POST | `/api/v1/binaries/quarantine/rescan/attest` | Retain a block or release only after a fresh clean verdict |

Use `packages/ts-pantry/scripts/upload-to-s3.ts` or
`pantry publish:binary`; both clients implement the protocol and never receive
an installable object key.

## Publishing npm Packages

To publish a package, send a `POST` request to `/publish` with:

**Multipart/form-data:**

```bash
curl -X POST http://localhost:3000/publish \
  -H "Authorization: Bearer your-token" \
  -F "metadata={\"name\":\"my-package\",\"version\":\"1.0.0\"}" \
  -F "tarball=@my-package-1.0.0.tgz"
```

**JSON with base64 tarball:**

```bash
curl -X POST http://localhost:3000/publish \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"metadata":{"name":"my-package","version":"1.0.0"},"tarball":"<base64-encoded-tarball>"}'
```

## Publishing Zig Packages

Zig package hashes come from the managed native compiler. They describe the
manifest-selected package contents; `artifactSha256` separately identifies the
complete compressed archive. The maintained deployment and
`bun scripts/provision-zig.ts` install the required Zig 0.17.0 through Pantry.
Both the object-storage snapshot and DynamoDB metadata backends retain the
archive digest across writes and fresh reads. Historical records that lack
`artifactSha256` remain readable; their native hash is never substituted for it.

The compiler cache defaults to `pantry/zig-cache` under the registry package. Set `PANTRY_ZIG_CACHE_DIR` to an absolute service-owned path to place it elsewhere. The maintained Linux service uses systemd to own `/var/cache/pantry-registry-zig` for its configured service user. Hashing does not require a user home. Each upload uses a separate temporary package directory that is removed after success or failure; reusable compiler tooling remains in the managed cache.

**Publish a Zig package:**

```bash
curl -X POST http://localhost:3000/zig/publish \
  -H "Authorization: Bearer your-token" \
  -F "tarball=@my-zig-lib-1.0.0.tar.gz" \
  -F "manifest=$(cat build.zig.zon)" \
  -F "description=My awesome Zig library"
```

**Response includes everything needed for dependencies:**

```json
{
  "success": true,
  "hash": "<native compiler package hash>",
  "tarballUrl": "http://localhost:3000/zig/packages/my-zig-lib/1.0.0/tarball",
  "fetchCommand": "zig fetch --save http://localhost:3000/zig/packages/my-zig-lib/1.0.0/tarball",
  "dependency": ".my_zig_lib = .{\n    .url = \"http://...\",\n    .hash = \"<native compiler hash>\",\n},"
}
```

**Using in build.zig.zon:**

```zig
.dependencies = .{
    .my_zig_lib = .{
        .url = "https://registry.example.com/zig/packages/my-zig-lib/1.0.0/tarball",
        .hash = "<native compiler package hash>",
    },
},
```

**Or fetch directly:**

```bash
zig fetch --save https://registry.example.com/zig/packages/my-zig-lib/1.0.0/tarball
```

## Publishing Commit Packages

Publish packages from a specific git commit — equivalent to `pkg-pr-new publish`. Packages are stored temporarily (90-day expiry) and can be installed directly by commit SHA.

**Multipart/form-data (multiple packages):**

```bash
curl -X POST http://localhost:3000/publish/commit \
  -H "Authorization: Bearer your-token" \
  -F "sha=abc1234def5678" \
  -F "repository=https://github.com/org/repo" \
  -F "package:my-package=@my-package.tgz" \
  -F "package:@scope/other=@other-package.tgz"
```

**JSON with base64 tarball:**

```bash
curl -X POST http://localhost:3000/publish/commit \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "sha": "abc1234def5678",
    "name": "my-package",
    "tarball": "<base64-encoded-tarball>",
    "repository": "https://github.com/org/repo"
  }'
```

**Installing a commit package:**

```bash
npm install https://registry.example.com/commits/abc1234def5678/my-package/tarball
```

**Listing packages for a commit:**

```bash
curl http://localhost:3000/commits/abc1234def5678
```

**Infrastructure note:** Commit packages are stored under the `commits/` S3 prefix and automatically expire after 90 days via an S3 lifecycle rule.

## npm Fallback

When a package is not found in the registry, it automatically falls back to npmjs.org. This allows you to:

1. Use your own packages from your registry
2. Use any npm package without mirroring

## Programmatic Usage

```typescript
import { Registry, createLocalRegistry, createServer } from '@stacksjs/registry'

// Create a local development registry
const registry = createLocalRegistry('http://localhost:3000')

// Or configure for production
const registry = new Registry({
  s3Bucket: 'my-bucket',
  s3Region: 'us-east-1',
  dynamoTable: 'registry-packages',
  baseUrl: 'https://registry.example.com',
  npmFallback: true,
})

// Start the server
const { start, stop } = createServer(registry, 3000)
start()
```

## Storage Backends

### Local Storage (Development)

By default, the registry uses local file storage:

- Tarballs: `./.registry/tarballs/`
- Metadata: `./.registry/metadata.json`

### S3 Storage (Production)

Configure S3 for production tarball storage:

```typescript
import { S3Storage } from '@stacksjs/registry'

const storage = new S3Storage('my-bucket', 'us-east-1')
```

## Deployment

### AWS Infrastructure

Deploy the required AWS resources using CloudFormation:

```bash
aws cloudformation deploy \
  --template-file infrastructure/cloudformation.yml \
  --stack-name pantry-registry \
  --parameter-overrides \
    Environment=production \
    RegistryDomain=registry.yourdomain.com \
  --capabilities CAPABILITY_NAMED_IAM
```

This creates:

- S3 bucket for package tarballs
- DynamoDB table for metadata
- DynamoDB table for analytics
- IAM role with required permissions

### Docker Deployment

```bash
# Build
docker build -f packages/registry/Dockerfile -t pantry-registry .

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e S3_BUCKET=pantry-registry-production-packages \
  -e DYNAMODB_TABLE=pantry-registry-production-metadata \
  -e DYNAMODB_ANALYTICS_TABLE=pantry-registry-production-analytics \
  -e BASE_URL=https://registry.yourdomain.com \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=your-key \
  -e AWS_SECRET_ACCESS_KEY=your-secret \
  pantry-registry
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `BASE_URL` | Public URL for the registry | `<http://localhost:3000>` |
| `S3_BUCKET` | S3 bucket for tarballs | `local` (file storage) |
| `DYNAMODB_TABLE` | DynamoDB table for metadata | `local` (file storage) |
| `DYNAMODB_ANALYTICS_TABLE` | DynamoDB table for analytics | (in-memory) |
| `AWS_REGION` | AWS region | `us-east-1` |
| `NPM_FALLBACK` | Enable npm fallback | `true` |

### Local Development

```bash
# Start with file-based storage (default)
bun run dev

# Or with specific config
S3_BUCKET=local DYNAMODB_TABLE=local bun run start
```

## License

MIT

### Shutdown and deployment

The server entrypoint owns SIGTERM and SIGINT. Shutdown fences new write
admission, keeps metadata reads serving while admitted requests and detached
binary completions settle, then closes the listener and flushes package, Zig,
PHP, auth, analytics, build-status and egress snapshots. Repeated shutdown
requests share the same drain. A persistence failure is reported with a nonzero
exit after every owned store has had a flush attempt.

The finite shutdown backstop derives from the maintained maximum scan and
configured scan-queue limits, with worker disposal and persistence allowances.
Both systemd setup and the deployment drop-in evaluate that same policy using
the service environment file, adding 15 seconds for termination reporting.
Active request, scan, proxy and client deadlines retain their existing values.

This protects accepted state during a normal service stop. Deployment still
restarts the live service and scanner. Continuous read availability, an immutable
ready candidate and safe traffic handover remain tracked in
[issue 249](https://github.com/pantry-pm/pantry/issues/249).
