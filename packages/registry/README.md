# @stacksjs/registry

Pantry package registry backend. A simple, fast package registry that works with the Pantry CLI.

## Features

- **npm-compatible API** - Works with the Pantry CLI out of the box
- **npm fallback** - Packages not in the registry fall back to npmjs automatically
- **Zig package support** - Host Zig packages with content-addressed hashing
- **S3 storage** - Tarball storage via S3 (or local filesystem for development)
- **Analytics** - Track download counts and package statistics
- **Simple metadata** - JSON file or DynamoDB for package metadata
- **Zero config** - Works out of the box for local development

## Quick Start

```bash
# Start the registry server
bun run start

# Or in development mode with hot reload
bun run dev
```

The server will start at `http://localhost:3000`.

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
```

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

Zig packages are content-addressed - they're identified by their hash, not URL.

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
  "hash": "12209f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  "tarballUrl": "http://localhost:3000/zig/packages/my-zig-lib/1.0.0/tarball",
  "fetchCommand": "zig fetch --save http://localhost:3000/zig/packages/my-zig-lib/1.0.0/tarball",
  "dependency": ".my_zig_lib = .{\n    .url = \"http://...\",\n    .hash = \"1220...\",\n},"
}
```

**Using in build.zig.zon:**
```zig
.dependencies = .{
    .my_zig_lib = .{
        .url = "https://registry.example.com/zig/packages/my-zig-lib/1.0.0/tarball",
        .hash = "12209f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    },
},
```

**Or fetch directly:**
```bash
zig fetch --save https://registry.example.com/zig/packages/my-zig-lib/1.0.0/tarball
```

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

## License

MIT
