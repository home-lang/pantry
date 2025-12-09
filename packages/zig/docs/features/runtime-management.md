# Runtime Management

Pantry automatically manages runtime versions (bun, node, deno, python) per project, making it a universal environment manager.

## Overview

Pin specific runtime versions in your project configuration, and Pantry will:
1. Auto-install the exact version
2. Activate it when you `cd` into the project
3. Update when you change versions in config
4. Cache aggressively for instant subsequent activations

## Supported Runtimes

- **Bun** - JavaScript/TypeScript runtime
- **Node.js** - JavaScript runtime
- **Deno** - Secure JavaScript/TypeScript runtime
- **Python** - Python interpreter

## Quick Start

### Pin a runtime version

```json
{
  "name": "my-project",
  "dependencies": {
    "bun": "1.3.0",
    "react": "18.2.0"
  }
}
```

### Automatic activation

```bash
cd my-project
# 🔧 Setting up environment...
# 📦 Installing bun@1.3.0...
# ✅ Environment ready: my-project

which bun
# /Users/you/.pantry/runtimes/bun/1.3.0/bin/bun

bun --version
# 1.3.0
```

## Multiple Runtimes

Run multiple runtimes simultaneously:

```json
{
  "dependencies": {
    "node": "20.10.0",
    "bun": "1.3.0",
    "python": "3.11.0",
    "deno": "1.40.0"
  }
}
```

All four runtimes are available in PATH with correct precedence.

## Version Changes

### Auto-update on version change

```bash
# Day 1
cd my-project  # bun 1.3.0 activated

# Day 2 - Update pantry.json
vim pantry.json  # Change bun: "1.3.0" → "1.3.1"

cd my-project
# 🔄 Dependencies changed, updating environment...
# 📦 Installing bun@1.3.1...
# ✅ Environment updated

bun --version
# 1.3.1
```

## Installation Directory

Runtimes are installed in `~/.pantry/runtimes/`:

```
~/.pantry/runtimes/
├── bun/
│   ├── 1.3.0/
│   │   └── bin/bun
│   └── 1.3.1/
│       └── bin/bun
├── node/
│   ├── 20.10.0/
│   │   └── bin/node
│   └── 20.11.0/
│       └── bin/node
├── deno/
│   └── 1.40.0/
│       └── bin/deno
└── python/
    └── 3.11.0/
        └── bin/python
```

## PATH Precedence

Pantry manages PATH with the following priority (highest to lowest):

1. **Runtime binaries** - `~/.pantry/runtimes/{runtime}/{version}/bin`
2. **Project binaries** - `{project}/pantry/.bin`
3. **Environment binaries** - `~/.pantry/envs/{hash}/bin`
4. **System PATH** - Your existing PATH

This ensures project-specific runtimes always take precedence.

## Examples

### Bun project

```json
{
  "name": "bun-app",
  "dependencies": {
    "bun": "1.3.0"
  },
  "scripts": {
    "dev": "bun run src/index.ts",
    "build": "bun build src/index.ts"
  }
}
```

```bash
cd bun-app
pantry install
pantry run dev
```

### Node.js project

```json
{
  "name": "node-app",
  "dependencies": {
    "node": "20.10.0",
    "express": "4.18.2"
  }
}
```

```bash
cd node-app
node --version  # 20.10.0
npm --version   # Uses Node's bundled npm
```

### Python project

```json
{
  "name": "python-app",
  "dependencies": {
    "python": "3.11.0"
  }
}
```

```bash
cd python-app
python --version  # 3.11.0
pip --version     # Uses Python's bundled pip
```

### Multi-runtime project

```json
{
  "name": "full-stack-app",
  "dependencies": {
    "node": "20.10.0",
    "python": "3.11.0",
    "bun": "1.3.0"
  }
}
```

```bash
cd full-stack-app
node --version   # 20.10.0
python --version # 3.11.0
bun --version    # 1.3.0
```

## Platform Support

Pantry automatically detects your platform and architecture:

- **macOS**: darwin (x64, arm64)
- **Linux**: linux (x64, arm64)
- **Windows**: Not yet supported (coming soon)

Download URLs are constructed automatically:

```
Bun:    https://github.com/oven-sh/bun/releases/download/bun-v{version}/bun-{platform}-{arch}.zip
Node:   https://nodejs.org/dist/v{version}/node-v{version}-{platform}-{arch}.tar.gz
Deno:   https://github.com/denoland/deno/releases/download/v{version}/deno-{platform}-{arch}.zip
Python: https://www.python.org/ftp/python/{version}/Python-{version}.tgz
```

## Caching

Runtime installations are cached aggressively:

- **1-hour TTL** - No re-check within 1 hour
- **mtime tracking** - Instant invalidation on config change
- **MD5 hashing** - Unique environment per project+versions combo

```bash
cd my-project        # First time: 250ms (download + install)
cd ..
cd my-project        # Cached: <50μs (instant!)

# 1 hour later...
cd my-project        # Still cached: <50μs

# Change version
vim pantry.json      # bun: 1.3.0 → 1.3.1

cd my-project        # Cache invalidated: 180ms (install new version)
cd ..
cd my-project        # Cached again: <50μs
```

## Best Practices

### 1. Pin exact versions

For reproducible builds, always use exact versions:

```json
{
  "dependencies": {
    "bun": "1.3.0",
    "node": "20.10.0"
  }
}
```

### 2. Document runtime requirements

Add a README section explaining runtime requirements:

```markdown
## Requirements

This project requires:
- Bun 1.3.0 (auto-installed by Pantry)
- Node 20.10.0 (auto-installed by Pantry)
```

### 3. Use runtime-specific features

Take advantage of runtime-specific features:

```json
{
  "dependencies": {
    "bun": "1.3.0"
  },
  "scripts": {
    "dev": "bun --hot run src/index.ts",
    "test": "bun test"
  }
}
```

### 4. Test across versions

Test your app across multiple runtime versions:

```bash
# Test with Bun 1.3.0
vim pantry.json  # Set "bun": "1.3.0"
cd .
pantry test

# Test with Bun 1.3.1
vim pantry.json  # Set "bun": "1.3.1"
cd .
pantry test
```

## Limitations

### Current limitations

1. **Exact versions only** - No SemVer ranges yet
   - Can't use `"bun": "^1.3.0"` or `"node": "~20.10.0"`
   - Coming soon: Version range resolver

2. **No version aliases** - No `lts`, `latest` aliases yet
   - Can't use `"node": "lts"` or `"bun": "latest"`
   - Coming soon: Version alias support

3. **Unix-only** - Windows support coming soon

## Performance

Runtime activation is **extremely fast**:

| Operation | Time | Notes |
|-----------|------|-------|
| Runtime detection | <1ms | Regex match on dependency names |
| Cache hit | <50μs | PATH string concatenation |
| First-time install | 100-500ms | Network download + extraction |
| Cached activation | <100μs | File existence check + PATH build |
| Version change | <1ms | mtime comparison |

## Next Steps

- [Shell Integration](./shell-integration.md) - Configure shell hooks
- [Environment Management](./environments.md) - Understand environment lifecycle
- [Performance](../advanced/performance.md) - Deep dive into caching
