# CLI Tools

ts-pkgx provides a comprehensive set of command-line tools for working with pkgx packages using a pantry-based approach.

## Command Overview

ts-pkgx offers several CLI commands:

```bash
# Fetch a single package
ts-pkgx fetch node

# Fetch multiple specific packages
ts-pkgx fetch --pkg node,bun,python

# Fetch all packages
ts-pkgx fetch --all

# Update local pantry
ts-pkgx update-pantry

# Generate constants file
ts-pkgx generate-consts

# Generate package index
ts-pkgx generate-index

# Generate TypeScript from cached JSON
ts-pkgx generate-ts

# Generate aliases file
ts-pkgx generate-aliases

# Generate package documentation
ts-pkgx generate-docs

# Show version information
ts-pkgx version
```

You can also use the Bun scripts:

```bash
# Bun script alternatives
bun run pkgx:fetch node
bun run pkgx:fetch-all
bun run pkgx:docs
```

## Single Package Fetching

Fetch information about a single package using the pantry-based approach:

```bash
# Basic usage
ts-pkgx fetch node

# With custom options
ts-pkgx fetch nodejs.org --output-dir ./custom-dir --timeout 60000

# Save as JSON instead of TypeScript
ts-pkgx fetch bun --json

# With debugging enabled
ts-pkgx fetch rust-lang.org --debug --verbose

# Nested packages
ts-pkgx fetch agwa.name/git-crypt
```

This command fetches information from the local pantry and generates comprehensive TypeScript files with JSDoc documentation.

## Multiple Package Fetching

Fetch multiple packages at once using the `--pkg` option:

```bash
# Fetch multiple packages
ts-pkgx fetch --pkg node,bun,python

# With custom options
ts-pkgx fetch --pkg "go.dev,rust-lang.org" --json --timeout 60000

# Include nested packages
ts-pkgx fetch --pkg "node,agwa.name/git-crypt,aws.amazon.com/cli"

# CI integration
ts-pkgx fetch --pkg "node,bun,python" --output-json
```

This allows you to fetch a specific set of packages in a single command with intelligent caching.

## Bulk Fetching

Fetch all available packages from the local pantry:

```bash
# Default settings
ts-pkgx fetch --all

# With custom options
ts-pkgx fetch --all --output-dir ./data/packages --timeout 60000

# Limit the number of packages (for testing)
ts-pkgx fetch --all --limit 50

# Control concurrency for performance
ts-pkgx fetch --all --concurrency 12

# Conservative settings for slow networks
ts-pkgx fetch --all --concurrency 4 --timeout 120000
```

## Pantry Management

Manage the local pantry for package information:

```bash
# Download and extract latest pantry
ts-pkgx update-pantry

# Use custom pantry directory
ts-pkgx update-pantry --pantry-dir ./my-pantry

# Generate constants file from pantry
ts-pkgx generate-consts --source pantry

# Generate constants from S3 registry (alternative)
ts-pkgx generate-consts --source registry --validate

# Use custom pantry location
ts-pkgx generate-consts --pantry-dir ./my-pantry
```

## Caching Options

ts-pkgx provides sophisticated caching capabilities:

```bash
# Use custom cache directory
ts-pkgx fetch --all --cache-dir ./my-cache

# Disable caching for fresh data
ts-pkgx fetch --all --no-cache

# Set custom cache expiration time (in minutes)
ts-pkgx fetch --all --cache-expiration 30

# Use longer cache for CI environments
ts-pkgx fetch --all --cache-expiration 1440  # 24 hours
```

## Index Generation

Generate the TypeScript index file for all packages with comprehensive JSDoc:

```bash
# Generate index with default settings
ts-pkgx generate-index

# With custom output directory
ts-pkgx generate-index --output-dir ./custom/packages
```

The generated index includes:

- Comprehensive JSDoc documentation for each package
- Alias properties for easy access
- Type-safe property names
- Links to package documentation

## TypeScript Generation

Convert cached JSON files to TypeScript with enhanced documentation:

```bash
# Convert cached JSON to TypeScript
ts-pkgx generate-ts

# With custom directories
ts-pkgx generate-ts --cache-dir ./custom-cache --output-dir ./ts-packages
```

This generates TypeScript files with:

- Rich JSDoc documentation
- Alias-based variable naming
- Comprehensive type information
- Links to documentation

## Aliases Generation

Generate a TypeScript file with package aliases:

```bash
# Generate aliases file
ts-pkgx generate-aliases
```

## Documentation Generation

Generate comprehensive VitePress documentation of all packages:

```bash
# Generate package documentation with default settings
ts-pkgx generate-docs

# Custom output directory
ts-pkgx generate-docs --output-dir ./custom-docs
```

This creates well-organized documentation with:

- Package categorization
- Complete package information
- Installation instructions
- Links to source code and homepages

## Advanced CLI Options

The CLI commands support various advanced options:

```bash
# Performance tuning
ts-pkgx fetch --all --concurrency 15 --timeout 30000

# Debug mode with verbose output
ts-pkgx fetch node --debug --verbose

# CI integration with structured JSON output
ts-pkgx fetch --pkg "node,bun,python" --output-json

# Conservative settings for unreliable networks
ts-pkgx fetch --all --timeout 180000 --max-retries 5
```

## Compiled Binaries

For faster execution, ts-pkgx can be compiled to binaries for different platforms:

```bash
# Compile for the current platform
bun run compile

# Compile for all supported platforms
bun run compile:all

# Available platforms
# - Linux x64/ARM64
# - Windows x64
# - macOS x64/ARM64
```

The resulting binaries can be distributed and used without requiring Bun or Node.js to be installed.

## Environment Configuration

Configure CLI behavior through environment variables:

```bash
# Enable debug mode
DEBUG=true ts-pkgx fetch node

# Set NODE_ENV for different behaviors
NODE_ENV=production ts-pkgx fetch --all
```

## CI/CD Integration

The CLI commands are designed for CI/CD environments:

```bash
# Get structured JSON output for parsing
result=$(ts-pkgx fetch --pkg "node,bun,python" --output-json)

# Parse results in CI scripts
echo "$result" | jq '.success'
echo "$result" | jq -r '.updatedPackages[]'

# Fail CI if packages couldn't be fetched
ts-pkgx fetch --pkg "required-packages" --output-json | jq -e '.success'
```

## Integration with Build Systems

The CLI commands can be integrated into build systems:

```json
// package.json
{
  "scripts": {
    "update:pantry": "ts-pkgx update-pantry",
    "update:packages": "ts-pkgx fetch --all",
    "update:specific": "ts-pkgx fetch --pkg node,bun,python",
    "generate:docs": "ts-pkgx generate-docs",
    "generate:consts": "ts-pkgx generate-consts",
    "build": "npm run update:packages && npm run generate:docs"
  }
}
```

## Performance Optimization

Optimize CLI performance for different scenarios:

```bash
# High-performance setup (good network, powerful machine)
ts-pkgx fetch --all --concurrency 15 --timeout 30000 --cache-expiration 60

# Conservative setup (slower network or machine)
ts-pkgx fetch --all --concurrency 4 --timeout 120000 --cache-expiration 1440

# Testing setup (quick validation)
ts-pkgx fetch --all --limit 20 --concurrency 8 --verbose

# Development setup (frequent updates)
ts-pkgx fetch --all --cache-expiration 10 --debug
```

## Error Handling and Debugging

Troubleshoot issues with enhanced debugging:

```bash
# Enable verbose output for troubleshooting
ts-pkgx fetch problematic-package --verbose

# Full debug mode with screenshots
ts-pkgx fetch problematic-package --debug --verbose

# Increase timeout for slow packages
ts-pkgx fetch slow-package --timeout 180000

# Disable cache to get fresh data
ts-pkgx fetch problematic-package --no-cache
```

## Resource Management

The CLI automatically manages browser resources and includes safety mechanisms:

- **Automatic cleanup**: Browser resources are cleaned up after operations
- **Force exit timeout**: Prevents hung processes (25-minute maximum runtime)
- **Signal handling**: Graceful shutdown on SIGINT/SIGTERM
- **Memory management**: Optimized for handling large numbers of packages
