# Features

ts-pkgx provides a comprehensive set of features for working with pkgx.dev packages. Here's a detailed look at the main features:

## Package Discovery

### Pantry-Based Package Fetching

ts-pkgx uses a pantry-based approach to fetch detailed information about packages, including:

- Basic metadata (name, domain, description)
- Available versions
- Programs provided by the package
- Dependencies and companion packages (including OS-specific dependencies)
- Installation commands
- Links to documentation, source code, and related resources

### Dependency Resolution

ts-pkgx includes a powerful dependency resolver that can analyze dependency files and resolve all transitive dependencies:

- Supports multiple dependency file formats: `deps.yaml`, `dependencies.yaml`, `pkgx.yaml`, `.yml` variants
- Resolves version constraints (`^1.2.3`, `~1.2.3`, `>=1.2.3`, `latest`, etc.) against actual available versions
- Handles transitive dependencies recursively
- Deduplicates packages and resolves version conflicts intelligently
- Provides install commands for all unique dependencies
- Supports OS-specific dependency filtering

ts-pkgx provides specialized **Integration APIs** designed for package managers and deployment tools:

- 🔍 **Deep transitive dependency resolution** - Automatically resolves all nested dependencies
- ⚡ **Version conflict resolution** - Intelligently handles conflicting version constraints
- 🎯 **OS-specific dependencies** - Platform-aware dependency resolution
- 📄 **Multiple input formats** - YAML files, strings, and individual packages
- 🔧 **Semantic versioning** - Full semver constraint support (^, ~, >=, etc.)
- 🚀 **Optimized for automation** - Ready-to-use install commands and structured data

See the [Launchpad Integration Guide](./launchpad-integration.md) for detailed documentation and examples.

### Bulk Fetching

You can fetch information about all available packages at once using the `fetchAndSaveAllPackages` function or the CLI command:

```bash
ts-pkgx fetch --all
```

This will retrieve information about all packages listed in the local pantry and save them to your specified output directory.

### Pantry Management

ts-pkgx includes comprehensive pantry management capabilities:

```bash
# Download and extract the latest pantry from pkgx distribution
ts-pkgx update-pantry

# Generate constants file from local pantry
ts-pkgx generate-consts --source pantry

# Generate constants file from S3 registry (alternative approach)
ts-pkgx generate-consts --source registry
```

## TypeScript Integration

### Comprehensive Type Safety

ts-pkgx provides extensive TypeScript type safety features that enable compile-time validation, IntelliSense support, and type-safe package management operations:

```typescript
import type {
  InstallationPlan, // Installation planning interface
  PackageAlias, // All available package aliases (e.g., 'node', 'python')
  PackageDomain, // All available package domains (e.g., 'nodejs.org')
  PackageInfo, // Comprehensive package information
  PackageName, // Union of all valid package identifiers
  PackageSpec, // Package specifications with versions (e.g., 'node@20.1.0')
  SupportedArchitecture, // 'x86_64' | 'aarch64' | 'armv7l' | 'i686'
  SupportedPlatform // 'darwin' | 'linux' | 'windows'
} from 'ts-pkgx'

// Type-safe package operations
function installPackage(packageName: PackageName, version?: string) {
  // TypeScript ensures only valid package names are accepted
}
```

### Fully Typed Interfaces

All package data is available through fully typed TypeScript interfaces, providing excellent IDE support and type safety:

```typescript
interface PkgxPackage {
  name: string
  domain: string
  description: string
  packageYmlUrl?: string
  homepageUrl?: string
  githubUrl?: string
  installCommand: string
  programs: string[]
  companions: string[]
  dependencies: string[]
  versions: string[]
  aliases?: string[]
  fullPath?: string
}
```

### TypeScript Code Generation

ts-pkgx automatically generates TypeScript files for each package with comprehensive JSDoc documentation, making it easy to import and use package data in your projects:

```typescript
// Generated file: bunsh.ts
import type { PkgxPackage } from '../types'

/**

 - Bun - Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one

 *

 - **Programs:** bun

 *

 - **Install:** `pkgx bun.sh`

 *

 - **Homepage:** https://bun.sh

 *

 - **GitHub:** https://github.com/oven-sh/bun

 _

 - @see https://ts-pkgx.netlify.app/packages/bunsh

 _/
export const bunPackage: PkgxPackage = {
  name: 'Bun',
  domain: 'bun.sh',
  description: 'JavaScript runtime, bundler, test runner, and package manager',
  // ...other properties with rich JSDoc
}
```

## Package Management

### Package Index Generation

ts-pkgx automatically generates an index file that exports all packages and provides utility functions for working with them:

```typescript
import { getPackage, pantry } from 'ts-pkgx'

// Access a package by domain
const bunPackage = pantry['bun.sh']

// Or by alias
const alsoBundle = getPackage('bun')
```

### Alias Support

ts-pkgx supports package aliases, making it easy to find packages by their common names rather than their full domain names:

```typescript
// These both return the same package
const nodeByDomain = getPackage('nodejs.org')
const nodeByAlias = getPackage('node')
```

## Domain Handling

### Nested Path Support

ts-pkgx properly handles packages with nested paths, such as `agwa.name/git-crypt`:

```typescript
// Fetch a nested package
const result = await fetchPantryPackageWithMetadata('agwa.name/git-crypt')

// Access a nested package
const gitCryptPackage = getPackage('agwa.name/git-crypt')

// Or by subpath alias
const alsoGitCrypt = getPackage('git-crypt')
```

### Domain Utilities

ts-pkgx provides utility functions for converting between domain names, variable names, and file names:

```typescript
import { convertDomainToFileName, convertDomainToVarName } from 'ts-pkgx/tools/domainUtils'

// bun.sh -> bunsh
const varName = convertDomainToVarName('bun.sh')

// agwa.name/git-crypt -> agwaname-gitcrypt
const fileName = convertDomainToFileName('agwa.name/git-crypt')
```

## CLI Tools

### Single Package Fetching

Fetch information about a single package using the CLI:

```bash
ts-pkgx fetch node
```

### Multiple Package Fetching

Fetch information about multiple packages at once using the `--pkg` option:

```bash
# Fetch multiple packages in one command
ts-pkgx fetch --pkg node,bun,python

# With custom options
ts-pkgx fetch --pkg "go.dev,python.org,rust-lang.org" --json --timeout 60000
```

This allows you to fetch multiple specific packages without having to fetch the entire pantry.

### Bulk Fetching

Fetch information about all packages at once:

```bash
ts-pkgx fetch --all
```

### Advanced CLI Features

ts-pkgx includes several advanced CLI features:

```bash
# Dependency resolution
ts-pkgx resolve-deps deps.yaml --verbose --install-command
ts-pkgx resolve-deps pkgx.yaml --json
ts-pkgx resolve-deps --find-files ./project --target-os darwin

# Pantry management
ts-pkgx update-pantry --pantry-dir ./my-pantry
ts-pkgx generate-consts --source pantry

# Documentation generation
ts-pkgx generate-docs --output-dir ./custom-docs

# TypeScript generation from cache
ts-pkgx generate-ts --cache-dir ./cache --output-dir ./output

# Aliases file generation
ts-pkgx generate-aliases
```

### Batch Processing

ts-pkgx implements smart batch processing to optimize fetching multiple packages:

```bash
# Fetch all packages with optimized batch processing
ts-pkgx fetch --all

# Control concurrency for performance tuning
ts-pkgx fetch --all --concurrency 12

# Limit packages for testing
ts-pkgx fetch --all --limit 50
```

The batch processing system:

- Processes packages in configurable batches (default: 8 concurrent packages)
- Prevents memory issues when handling hundreds of packages
- Skips unchanged packages to minimize unnecessary updates
- Provides progress feedback during the update process

### Customization Options

Customize the behavior of the CLI with various options:

```bash
# Custom output directory
ts-pkgx fetch node --output-dir ./data/packages

# Custom cache settings
ts-pkgx fetch --all --cache-dir ./my-cache --cache-expiration 60

# Custom timeout for slow networks
ts-pkgx fetch --all --timeout 120000

# Debug mode for troubleshooting
ts-pkgx fetch node --debug --verbose

# CI integration with JSON output
ts-pkgx fetch --pkg "node,bun,python" --output-json
```

## Performance Optimizations

### Intelligent Caching

ts-pkgx implements comprehensive caching for optimal performance:

```bash
# Control cache behavior
ts-pkgx fetch --all --cache-expiration 30  # 30 minutes
ts-pkgx fetch --all --no-cache             # Disable cache
ts-pkgx fetch --all --cache-dir ./my-cache # Custom cache location
```

### Parallel Processing

When fetching multiple packages, ts-pkgx processes them in parallel to speed up the operation:

```bash
# Increase concurrency for faster processing
ts-pkgx fetch --all --concurrency 12

# Conservative settings for slower systems
ts-pkgx fetch --all --concurrency 4 --timeout 120000
```

### Resource Management

ts-pkgx includes automatic browser resource cleanup to prevent hanging processes:

```typescript
import { cleanupBrowserResources } from 'ts-pkgx'

try {
  // Your package operations
}
finally {
  await cleanupBrowserResources()
}
```

## Type-Safe Utilities

ts-pkgx provides numerous utility functions that work with the type system:

### Package Resolution

```typescript
import {
  getAllPackageAliases,
  isPackageAlias,
  isValidPackageName,
  resolvePackageName
} from 'ts-pkgx'

// Type-safe package resolution
const resolution = resolvePackageName('node') // Returns PackageResolution
const isAlias = isPackageAlias('node') // Type guard
const isValid = isValidPackageName('node') // Type guard
const aliases = getAllPackageAliases() // PackageAlias[]
```

### Version Resolution

```typescript
import {
  getAvailableVersions,
  getLatestVersion,
  getPackageInfo,
  resolveVersion
} from 'ts-pkgx'

// Type-safe version operations
const latest = getLatestVersion('node') // string | null
const versions = getAvailableVersions('node') // string[]
const resolved = resolveVersion('node', '^20') // string | null
const info = getPackageInfo('node') // PackageInfo | null
```

### CLI Utilities

```typescript
import {
  createInstallPlan,
  searchPackagesCommand,
  showPackageInfo,
  validatePackage
} from 'ts-pkgx'

// Type-safe CLI operations with error handling
const infoResult = showPackageInfo('node') // CLIResult<PackageInfo>
const searchResult = searchPackagesCommand('js') // CLIResult<PackageInfo[]>
const planResult = createInstallPlan('node@20.1.0') // CLIResult<InstallationPlan>
const validation = validatePackage('node@latest') // CLIResult<{...}>
```

## Integration Options

### JSON Output

You can choose to output package information as JSON instead of TypeScript files:

```bash
# CLI option
ts-pkgx fetch node --json

# API option
const result = await fetchPantryPackageWithMetadata('node', { outputJson: true })
```

### Custom Output Directory

Specify where you want to save package information:

```bash
# CLI option
ts-pkgx fetch node --output-dir ./my-packages

# API option
const packages = await fetchAndSaveAllPackages({ outputDir: './my-packages' })
```

### CI/CD Integration

Use structured JSON output for automation:

```bash
# Get structured output for CI systems
ts-pkgx fetch --pkg "node,bun,python" --output-json
```

This outputs structured JSON with:

- List of successfully processed packages
- Friendly names and mixed name formats
- Success status and error information
- Timestamp information

### Environment Variables

ts-pkgx respects environment variables for configuration:

- `DEBUG`: Enable debug mode
- `NODE_ENV`: Affects logging behavior

## Library Usage Examples

### Basic Package Fetching

```typescript
import { fetchPantryPackageWithMetadata } from 'ts-pkgx'

// Fetch a single package
const result = await fetchPantryPackageWithMetadata('nodejs.org', {
  timeout: 60000,
  cache: true,
  cacheExpirationMinutes: 60,
})

if (result) {
  console.log(`Fetched ${result.packageInfo.name}`)
}
```

### Bulk Operations

```typescript
import { fetchAndSaveAllPackages } from 'ts-pkgx'

// Fetch all packages with custom settings
const packages = await fetchAndSaveAllPackages({
  outputDir: './packages',
  cacheDir: '.cache/packages',
  concurrency: 12,
  timeout: 60000,
  limit: 100,
})

console.log(`Processed ${packages.length} packages`)
```

### Package Access

```typescript
import { getPackage, pantry } from 'ts-pkgx'

// Access packages with excellent TypeScript support
const nodePackage = pantry.node // Alias access
const bunPackage = pantry.bunsh // Domain access
const gitCrypt = getPackage('git-crypt') // Utility function

// Both alias and domain reference the same object
console.log(pantry.node === pantry.nodejsorg) // true
```
