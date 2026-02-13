# CLI Reference

ts-pkgx provides a powerful command-line interface for working with pkgx.dev packages. This page documents all the available commands and their options.

## Installation

The CLI commands are available when you install ts-pkgx:

```bash
bun install ts-pkgx
```

## Commands Overview

| Command | Description |
|---------|-------------|
| `ts-pkgx fetch [packageName]` | Fetch a single package, multiple packages, or all packages |
| `ts-pkgx resolve-deps [file]` | Resolve dependency files and find all transitive dependencies |
| `ts-pkgx generate-index` | Generate TypeScript index file for packages |
| `ts-pkgx generate-ts` | Generate TypeScript files from cached JSON |
| `ts-pkgx generate-aliases` | Generate TypeScript aliases file for packages |
| `ts-pkgx generate-docs` | Generate comprehensive VitePress documentation for all packages |
| `ts-pkgx update-pantry` | Download and extract the latest pantry.tgz file |
| `ts-pkgx generate-consts` | Generate or update the consts.ts file with all known packages |
| `ts-pkgx version` | Display version information |

## fetch Command

The `fetch` command retrieves package information from pkgx.dev for one or more packages using the pantry-based approach.

### Usage

```bash
# Fetch a single package
ts-pkgx fetch [packageName] [options]

# Fetch multiple specific packages
ts-pkgx fetch --pkg <packageNames> [options]

# Fetch all packages
ts-pkgx fetch --all [options]
```

### Arguments

- `packageName`: Optional name of a single package to fetch (e.g., 'node', 'bun.sh', 'agwa.name/git-crypt')

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-a, --all` | Fetch all packages | `false` |
| `-p, --pkg <packageNames>` | Comma-separated list of package names to fetch | - |
| `-o, --output-dir <dir>` | Directory to save package data | `src/packages` |
| `-c, --cache-dir <dir>` | Directory to cache package data | `.cache/packages` |
| `-n, --no-cache` | Disable caching | `false` |
| `-e, --cache-expiration <minutes>` | Cache expiration time in minutes | `1440` (24 hours) |
| `-l, --limit <count>` | Limit the number of packages to fetch (use with --all) | - |
| `-t, --timeout <ms>` | Timeout for network requests in milliseconds | `20000` |
| `-r, --max-retries <count>` | Maximum retry attempts for failed requests | `3` |
| `-j, --json` | Save as JSON instead of TypeScript | `false` |
| `-d, --debug` | Enable debug mode (save screenshots) | `false` |
| `-v, --verbose` | Enable verbose output | `false` |
| `-y, --concurrency <count>` | Number of packages to fetch concurrently | `8` |
| `--output-json` | Output results as JSON (for CI integration) | `false` |

### Examples

```bash
# Fetch a single package
ts-pkgx fetch node

# Fetch a package with specific path
ts-pkgx fetch agwa.name/git-crypt

# Fetch multiple packages
ts-pkgx fetch --pkg node,bun,python

# Fetch packages with custom output directory and timeout
ts-pkgx fetch --pkg "nodejs.org,python.org" --output-dir ./custom-packages --timeout 60000

# Save as JSON instead of TypeScript
ts-pkgx fetch --pkg "go.dev,rust-lang.org" --json

# Fetch all packages with a limit
ts-pkgx fetch --all --limit 50

# Fetch with increased concurrency and verbose output
ts-pkgx fetch --all --concurrency 12 --verbose

# Fetch with custom cache settings
ts-pkgx fetch --all --cache-expiration 120 --no-cache

# Output JSON for CI integration
ts-pkgx fetch --pkg "node,bun,python" --output-json
```

## resolve-deps Command

The `resolve-deps` command analyzes dependency files and resolves all transitive dependencies with version conflict resolution.

### Usage

```bash
# Resolve a specific dependency file
ts-pkgx resolve-deps [file] [options]

# Find and resolve all dependency files in a directory
ts-pkgx resolve-deps --find-files [directory] [options]
```

### Arguments

- `file`: Optional path to a dependency file (e.g., 'deps.yaml', 'pkgx.yaml', 'dependencies.yml')

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-d, --dir <directory>` | Directory to search for dependency files | `.` |
| `--find-files` | Find and resolve all dependency files in the directory | `false` |
| `--pantry-dir <dir>` | Directory containing pantry files | `src/pantry` |
| `--packages-dir <dir>` | Directory containing generated package files | `src/packages` |
| `--target-os <os>` | Target OS for OS-specific dependencies (linux, darwin, windows) | - |
| `--include-os-deps` | Include OS-specific dependencies | `false` |
| `--max-depth <depth>` | Maximum recursion depth for transitive dependencies | `10` |
| `-v, --verbose` | Enable verbose output | `false` |
| `-j, --json` | Output results as JSON | `false` |
| `--install-command` | Show install command for all unique packages | `false` |

### Examples

```bash
# Resolve a single dependency file
ts-pkgx resolve-deps deps.yaml

# Resolve with verbose output and install command
ts-pkgx resolve-deps pkgx.yaml --verbose --install-command

# Find all dependency files in a project
ts-pkgx resolve-deps --find-files ./my-project

# Output as JSON for automation
ts-pkgx resolve-deps deps.yaml --json

# Filter for specific OS
ts-pkgx resolve-deps deps.yaml --target-os darwin --include-os-deps

# Custom configuration
ts-pkgx resolve-deps deps.yaml --pantry-dir ./custom-pantry --max-depth 5
```

### Supported File Formats

The resolver supports these dependency file formats:
- `deps.yaml` / `deps.yml`
- `dependencies.yaml` / `dependencies.yml`
- `pkgx.yaml` / `pkgx.yml`

Example dependency file:
```yaml
dependencies:
  bun.sh: ^1.2.16
  nodejs.org: ^20.0.0
  python.org: 3.9.0
  git-scm.com: latest
```

### Output Format

The command provides detailed output including:
- All unique packages to install with resolved versions
- Version conflicts detected and resolved
- OS-specific dependencies (when enabled)
- Install commands for package managers
- Statistics about dependency resolution

## generate-index Command

Generate a TypeScript index file for packages with comprehensive JSDoc documentation and alias support.

### Usage

```bash
ts-pkgx generate-index [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output-dir <dir>` | Directory containing package files | `src/packages` |

### Examples

```bash
# Generate index with default settings
ts-pkgx generate-index

# With custom output directory
ts-pkgx generate-index --output-dir ./custom/packages
```

## generate-ts Command

Generate TypeScript files from cached JSON files.

### Usage

```bash
ts-pkgx generate-ts [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--cache-dir <dir>` | Directory with cached JSON files | `.cache/packages` |
| `--output-dir <dir>` | Output directory for TypeScript files | `packages` |

### Examples

```bash
# Generate TypeScript from cached JSON
ts-pkgx generate-ts

# With custom directories
ts-pkgx generate-ts --cache-dir ./custom-cache --output-dir ./custom-output
```

## generate-aliases Command

Generate a TypeScript aliases file for packages.

### Usage

```bash
ts-pkgx generate-aliases
```

### Examples

```bash
# Generate aliases file
ts-pkgx generate-aliases
```

## generate-docs Command

Generate comprehensive VitePress documentation for all packages.

### Usage

```bash
ts-pkgx generate-docs [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output-dir <dir>` | Output directory for documentation | `docs` |

### Examples

```bash
# Generate documentation with default settings
ts-pkgx generate-docs

# Generate documentation with custom output directory
ts-pkgx generate-docs --output-dir ./custom-docs
```

## update-pantry Command

Download and extract the latest pantry.tgz file from the pkgx distribution.

### Usage

```bash
ts-pkgx update-pantry [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-d, --pantry-dir <dir>` | Directory to extract pantry files | `src/pantry` |

### Examples

```bash
# Update pantry with default settings
ts-pkgx update-pantry

# Update pantry to custom directory
ts-pkgx update-pantry --pantry-dir ./my-pantry
```

## generate-consts Command

Generate or update the consts.ts file with all known packages from either the local pantry or S3 registry.

### Usage

```bash
ts-pkgx generate-consts [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-s, --source <source>` | Source for packages: "pantry" or "registry" | `pantry` |
| `--pantry-dir <dir>` | Directory containing pantry files | `src/pantry` |
| `--validate` | Validate a sample of packages (slower but more accurate) | `false` |

### Examples

```bash
# Generate consts from local pantry
ts-pkgx generate-consts

# Generate consts from S3 registry
ts-pkgx generate-consts --source registry

# Generate with validation
ts-pkgx generate-consts --source registry --validate

# Use custom pantry directory
ts-pkgx generate-consts --pantry-dir ./my-pantry
```

## Using with Bun Scripts

You can also use the pre-configured Bun scripts:

```bash
# Fetch commands
bun run pkgx:fetch node
bun run pkgx:fetch-all

# Generate documentation
bun run pkgx:docs
```

## Using Compiled Binaries

For faster execution, you can use the compiled binaries that are distributed with the package:

```bash
# Run directly from bin directory
./bin/ts-pkgx fetch node

# Create a symlink in your path
ln -s $(pwd)/bin/ts-pkgx /usr/local/bin/ts-pkgx
ts-pkgx fetch node
```

## Type Safety Features

The CLI commands work seamlessly with ts-pkgx's comprehensive type safety features:

```bash
# Type-safe package names are validated at runtime
ts-pkgx fetch node          # ✅ Valid alias
ts-pkgx fetch nodejs.org    # ✅ Valid domain
ts-pkgx fetch invalid-pkg   # ❌ Will show error for invalid package

# Nested package paths are supported
ts-pkgx fetch agwa.name/git-crypt  # ✅ Valid nested package
```

## CI Integration

Use the `--output-json` flag for CI integration:

```bash
# Output structured JSON for CI systems
ts-pkgx fetch --pkg "node,bun,python" --output-json
```

This outputs structured JSON with information about processed packages, friendly names, and success status.

## Environment Variables

ts-pkgx respects the following environment variables:

- `DEBUG`: Set to `true` to enable debug mode
- `NODE_ENV`: Affects logging behavior

## Advanced Usage

### Cache Management

Control caching behavior for better performance:

```bash
# Use fresh data (disable cache)
ts-pkgx fetch --all --no-cache

# Custom cache expiration (in minutes)
ts-pkgx fetch --all --cache-expiration 60

# Custom cache directory
ts-pkgx fetch --all --cache-dir ./my-cache
```

### Performance Tuning

Optimize performance for large operations:

```bash
# Increase concurrency for faster fetching
ts-pkgx fetch --all --concurrency 20

# Set longer timeout for slow networks
ts-pkgx fetch --all --timeout 60000

# Limit packages for testing
ts-pkgx fetch --all --limit 10
```

### Development and Debugging

Enable debugging and verbose output:

```bash
# Enable debug mode (saves screenshots)
ts-pkgx fetch node --debug

# Verbose output for detailed logging
ts-pkgx fetch --pkg "node,bun" --verbose

# Both debug and verbose
ts-pkgx fetch --all --debug --verbose --limit 5
```
