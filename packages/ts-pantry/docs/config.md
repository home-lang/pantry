# Configuration

ts-pkgx provides various configuration options for both the CLI and the library API.

## CLI Configuration

When using the CLI tool, you can specify the following options:

```bash
# Fetch a single package
bun run pkgx:fetch node

# Fetch multiple packages with a comma-separated list
bun run pkgx:fetch --pkg node,bun,python

# With custom output directory
bun run pkgx:fetch node --output-dir ./data/packages

# Fetch all packages
bun run pkgx:fetch --all

# Fetch with a limit on the number of packages
bun run pkgx:fetch --all --limit 50

# Set a custom timeout (milliseconds)
bun run pkgx:fetch --all --timeout 180000 --output-dir ./data/pkgx-packages

# Enable debug mode (saves screenshots and additional logs)
bun run pkgx:fetch node --debug

# Save as JSON instead of TypeScript
bun run pkgx:fetch --pkg nodejs.org,bun.sh --json

# Control concurrency level
bun run pkgx:fetch --all --concurrency 20

# Use or disable caching
bun run pkgx:fetch --all --cache-dir ./custom-cache
bun run pkgx:fetch --all --no-cache

# Resolve dependency files
bun run resolve-deps deps.yaml --verbose --install-command
```

## Cache Configuration

ts-pkgx implements caching to improve performance and avoid unnecessary network requests:

```bash
# Specify a custom cache directory
bun run pkgx:fetch --all --cache-dir ./my-cache-dir

# Disable caching completely
bun run pkgx:fetch node --no-cache

# Set a custom cache expiration time (in minutes)
bun run pkgx:fetch --all --cache-expiration 60
```

The default cache expiration is 24 hours (1440 minutes).

## Concurrency Options

Control how many packages are processed in parallel:

```bash
# Higher concurrency for faster processing (if your system can handle it)
bun run pkgx:fetch --all --concurrency 20

# Lower concurrency for more stability or on systems with limited resources
bun run pkgx:fetch --all --concurrency 5
```

The default concurrency is 10 packages at a time.

## Retry and Timeout Settings

Configure how ts-pkgx handles network issues and timeouts:

```bash
# Set a longer timeout for each package (in milliseconds)
bun run pkgx:fetch node --timeout 60000

# Configure the maximum number of retry attempts
bun run pkgx:fetch --all --max-retries 5
```

By default, each package has a 30-second timeout and will retry up to 3 times.

## Batch Processing Configuration

For batch processing of large numbers of packages, you can configure:

```bash
# Limit the number of packages to process (useful for testing)
bun run pkgx:fetch --all --limit 20

# Set verbose output to see more details
bun run pkgx:fetch --all --verbose
```

## Package Fetch Options

The `fetchPantryPackage` and `fetchAndSaveAllPackages` functions accept an options object with the following properties:

```typescript
interface PackageFetchOptions {
  /**
   * Timeout in milliseconds for fetching operations
   * @default 30000
   */
  timeout?: number

  /**
   * Directory to save package data
   * @default 'packages'
   */
  outputDir?: string

  /**
   * Directory to cache package data
   * @default '.cache/packages'
   */
  cacheDir?: string

  /**
   * Enable debug mode to save screenshots and additional info
   * @default false
   */
  debug?: boolean

  /**
   * Whether to use cached data if available and not expired
   * @default true
   */
  cache?: boolean

  /**
   * Cache expiration time in minutes
   * @default 1440 (24 hours)
   */
  cacheExpirationMinutes?: number

  /**
   * Limit the number of packages to fetch
   */
  limit?: number

  /**
   * Number of packages to fetch concurrently
   * @default 10
   */
  concurrency?: number
}
```

## Package Aliases

ts-pkgx maintains a map of common package aliases in the `PACKAGE_ALIASES` object. This is used to resolve package names to their full domain names.

```typescript
// Example aliases
const PACKAGE_ALIASES: Record<string, string> = {
  node: 'nodejs.org',
  python: 'python.org',
  go: 'go.dev',
  rust: 'rust-lang.org',
  // ...
}
```

You can extend this map with your own aliases or use it to resolve package names in your code.

## Output Format

By default, ts-pkgx generates TypeScript files for each package. You can also configure it to output JSON files instead:

```bash
# CLI option
bun run pkgx:fetch node --json

# API option
const result = await fetchAndSavePackage('node', outputDir, timeout, true); // true = save as JSON
```

## GitHub Authentication

When using GitHub API for fetching package information, you can use authentication to get higher rate limits:

```bash
# Set environment variable before running commands
export GITHUB_TOKEN=your_github_personal_access_token
bun run pkgx:fetch --all
```

## Dependency Resolution Configuration

The dependency resolver supports extensive configuration options:

```bash
# Basic dependency resolution
ts-pkgx resolve-deps deps.yaml

# With custom directories
ts-pkgx resolve-deps deps.yaml --pantry-dir ./my-pantry --packages-dir ./my-packages

# OS-specific filtering
ts-pkgx resolve-deps deps.yaml --target-os darwin --include-os-deps

# Custom recursion depth and verbose output
ts-pkgx resolve-deps deps.yaml --max-depth 5 --verbose

# JSON output for automation
ts-pkgx resolve-deps deps.yaml --json
```

### Dependency Resolver Options

```typescript
interface DependencyResolverOptions {
  pantryDir?: string // Directory containing pantry files
  packagesDir?: string // Directory containing generated package files
  includeOsSpecific?: boolean // Include OS-specific dependencies
  targetOs?: 'linux' | 'darwin' | 'windows' // Target operating system
  maxDepth?: number // Maximum recursion depth for transitive deps
  verbose?: boolean // Enable verbose output
}
```

This increases your GitHub API rate limit from 60 requests/hour to 5,000 requests/hour.

## Type Safety Configuration

ts-pkgx provides comprehensive TypeScript type safety features that work automatically with your configuration:

```typescript
import type {
  PackageFetchOptions,
  PackageName,
  PackageSpec,
  SupportedPlatform
} from 'ts-pkgx'
import {
  detectPlatform,
  fetchAndSavePackage,
  isValidPackageName
} from 'ts-pkgx'

// Type-safe configuration
const options: PackageFetchOptions = {
  timeout: 30000,
  outputDir: 'packages',
  debug: false,
  cache: true,
  concurrency: 10
}

// Type-safe package operations
async function safeFetchPackage(packageName: string, version?: string) {
  if (!isValidPackageName(packageName)) {
    throw new Error(`Invalid package name: ${packageName}`)
  }

  const packageSpec: PackageSpec = version
    ? `${packageName}@${version}`
    : packageName

  return await fetchAndSavePackage(packageSpec, options.outputDir!, options.timeout)
}

// Platform-aware configuration
const platform = detectPlatform()
console.log(`Running on ${platform.platform} ${platform.architecture}`)
```

## Advanced Configuration

For more advanced configuration options and examples, see the [Advanced](./advanced.md) section and [Type Safety](./advanced/type-safety.md) documentation.
