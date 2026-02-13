# Usage

ts-pkgx provides both a TypeScript library and CLI tools for working with pkgx packages.

## CLI Usage

After installing the package, you can use the CLI tools to fetch and manage packages:

```bash
# Fetch a single package
ts-pkgx fetch nodejs.org

# Fetch multiple packages at once
ts-pkgx fetch --pkg nodejs.org,bun.sh,deno.land

# Fetch all available packages
ts-pkgx fetch --all

# Generate index file
ts-pkgx generate-index

# Generate TypeScript from cached JSON
ts-pkgx generate-ts

# Generate aliases file
ts-pkgx generate-aliases

# Generate documentation
ts-pkgx generate-docs

# Update local pantry
ts-pkgx update-pantry

# Generate constants file
ts-pkgx generate-consts

# Resolve dependency files
ts-pkgx resolve-deps deps.yaml

# Show version information
ts-pkgx version
```

You can also use the Bun scripts:

```bash
# Fetch a single package
bun run pkgx:fetch nodejs.org

# Fetch all packages
bun run pkgx:fetch-all

# Fetch multiple specific packages
bun bin/cli.ts fetch --pkg="nodejs.org,bun.sh,deno.land"

# Generate index file
bun bin/cli.ts generate-index

# Generate TypeScript from cached JSON
bun bin/cli.ts generate-ts

# Generate aliases file
bun bin/cli.ts generate-aliases

# Generate documentation
bun run pkgx:docs

# Update pantry
bun bin/cli.ts update-pantry

# Generate constants
bun bin/cli.ts generate-consts

# Resolve dependency files
bun bin/cli.ts resolve-deps deps.yaml

# Display version information
bun bin/cli.ts version
```

### Fetch Command Options

The fetch command supports several options:

- `--all`: Fetch all available packages
- `--pkg="pkg1,pkg2"`: Fetch multiple specific packages
- `--output-dir=<dir>`: Set custom output directory (default: `src/packages`)
- `--cache-dir=<dir>`: Set custom cache directory (default: `.cache/packages`)
- `--no-cache`: Disable caching
- `--cache-expiration=<minutes>`: Set cache expiration time (default: `1440` minutes)
- `--timeout=<ms>`: Set timeout in milliseconds (default: `20000`)
- `--max-retries=<n>`: Number of retries for failed fetches (default: `3`)
- `--limit=<n>`: Limit the number of packages to fetch
- `--concurrency=<n>`: Number of packages to fetch concurrently (default: `8`)
- `--json`: Output as JSON instead of TypeScript
- `--verbose`: Enable verbose logging
- `--debug`: Enable debug mode (saves screenshots)
- `--output-json`: Output results as JSON for CI integration

### Examples

```bash
# Fetch with custom settings
ts-pkgx fetch --all --concurrency 12 --timeout 60000 --cache-expiration 60

# Fetch specific packages with verbose output
ts-pkgx fetch --pkg "node,bun,python,go" --verbose

# Disable caching and save as JSON
ts-pkgx fetch --pkg "rust-lang.org,deno.land" --no-cache --json

# Fetch for CI integration
ts-pkgx fetch --pkg "nodejs.org,bun.sh" --output-json

# Debug mode for troubleshooting
ts-pkgx fetch agwa.name/git-crypt --debug --verbose
```

## Dependency Resolution

ts-pkgx includes a powerful dependency resolver that can analyze dependency files and resolve all transitive dependencies:

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
```

### Dependency File Formats

The resolver supports these dependency file formats:

```yaml
# deps.yaml, dependencies.yaml, pkgx.yaml
dependencies:
  bun.sh: ^1.2.16
  nodejs.org: ^20.0.0
  python.org: 3.9.0
  git-scm.com: latest
```

### Programmatic Dependency Resolution

```typescript
import { findDependencyFiles, resolveDependencyFile } from 'ts-pkgx'

// Resolve a single dependency file
const result = await resolveDependencyFile('./deps.yaml', {
  pantryDir: 'src/pantry',
  packagesDir: 'src/packages',
  maxDepth: 10,
  verbose: true,
})

console.log(`Found ${result.uniquePackages.length} unique packages`)
console.log(`Conflicts resolved: ${result.conflicts.length}`)

// Find all dependency files in a project
const depFiles = findDependencyFiles('./my-project')
for (const file of depFiles) {
  const deps = await resolveDependencyFile(file)
  console.log(`${file}: ${deps.uniquePackages.length} packages`)
}
```

## Library Usage

You can also use ts-pkgx as a library in your TypeScript/JavaScript projects:

```typescript
import { fetchAndSaveAllPackages, fetchPantryPackageWithMetadata } from 'ts-pkgx'

// Fetch a single package using the pantry-based approach
const result = await fetchPantryPackageWithMetadata('nodejs.org', {
  timeout: 60000,
  debug: false,
  outputJson: false,
  cacheDir: '.cache/packages',
  cache: true,
  cacheExpirationMinutes: 1440,
})

if (result) {
  console.log(result.packageInfo)
}

// Fetch all packages
const savedPackages = await fetchAndSaveAllPackages({
  outputDir: './packages',
  cacheDir: '.cache/packages',
  cache: true,
  cacheExpirationMinutes: 1440,
  timeout: 20000,
  concurrency: 8,
  debug: false,
  outputJson: false,
})

console.log(`Saved ${savedPackages.length} packages`)
```

### Accessing Package Information

After fetching packages, you can import them from your packages directory:

```typescript
import { getPackage, pantry } from 'ts-pkgx'

// Get a package by domain name
const nodePackage = pantry['nodejs.org']

// Get a package by alias
const nodeByAlias = getPackage('node')

// Access package properties
console.log(nodePackage.name) // 'node'
console.log(nodePackage.versions) // ['20.0.0', '18.0.0', ...]
console.log(nodePackage.domain) // 'nodejs.org'
```

### Understanding Package Variable Names

ts-pkgx uses intelligent alias-based naming for better developer experience:

1. **Packages with aliases use the primary alias for naming:**
   ```typescript
   import {
     bunPackage, // For bun.sh (alias: 'bun') - NOT bunshPackage
     nodePackage, // For nodejs.org (alias: 'node') - NOT nodejsorgPackage
     pythonPackage // For python.org (alias: 'python') - NOT pythonorgPackage
   } from 'ts-pkgx'
   ```

2. **Packages without aliases use domain-based naming:**
   ```typescript
   import {
     astgrepgithubioPackage, // For ast-grep.github.io (no alias)
     examplecomPackage // For example.com (no alias)
   } from 'ts-pkgx'
   ```

3. **Nested paths are concatenated:**
   ```typescript
   import { agwanamegitcryptPackage } from 'ts-pkgx' // For 'agwa.name/git-crypt'
   ```

### Enhanced TypeScript Intellisense

All generated packages include comprehensive JSDoc documentation:

```typescript
import { pantry } from 'ts-pkgx'

// Hovering over pantry.bun shows:
// - Package description
// - Programs provided
// - Installation command
// - Links to documentation

// Hovering over pantry.bun.versions shows:
// - "From newest version to oldest."
// - Link to usage documentation

console.log(pantry.bun.versions) // Excellent intellisense support
```

### Alias Support in Pantry

The pantry object supports both domain names and aliases:

```typescript
import { pantry } from 'ts-pkgx'

// Both approaches work and return the same object
const bunViaAlias = pantry.bun // Using alias
const bunViaDomain = pantry.bunsh // Using domain
console.log(bunViaAlias === bunViaDomain) // true

// Same for Node.js
const nodeViaAlias = pantry.node // Using alias
const nodeViaDomain = pantry.nodejsorg // Using domain
console.log(nodeViaAlias === nodeViaDomain) // true
```

### Using the API with Custom Options

You can customize how packages are fetched using the options object:

```typescript
// Fetch with custom options using the pantry-based approach
const result = await fetchPantryPackageWithMetadata('nodejs.org', {
  timeout: 60000,
  debug: true,
  outputJson: false,
  cacheDir: '.cache/packages',
  cache: true,
  cacheExpirationMinutes: 60,
})

// Fetch all packages with custom options
const packages = await fetchAndSaveAllPackages({
  outputDir: './custom/packages',
  cacheDir: './custom/cache',
  cache: true,
  cacheExpirationMinutes: 60,
  timeout: 60000,
  limit: 50,
  concurrency: 15,
  debug: false,
  outputJson: false,
})
```

## Advanced CLI Usage

### Pantry Management

ts-pkgx now includes powerful pantry management features:

```bash
# Update local pantry from pkgx distribution
ts-pkgx update-pantry

# Generate constants file from local pantry
ts-pkgx generate-consts --source pantry

# Generate constants file from S3 registry
ts-pkgx generate-consts --source registry --validate

# Use custom pantry directory
ts-pkgx update-pantry --pantry-dir ./my-pantry
ts-pkgx generate-consts --pantry-dir ./my-pantry
```

### Cache Management

Control caching behavior for optimal performance:

```bash
# Use fresh data (disable cache)
ts-pkgx fetch --all --no-cache

# Custom cache expiration (30 minutes)
ts-pkgx fetch --all --cache-expiration 30

# Custom cache directory
ts-pkgx fetch --all --cache-dir ./my-cache

# Generate TypeScript from cached JSON files
ts-pkgx generate-ts --cache-dir ./my-cache --output-dir ./output
```

### Performance Optimization

Optimize for different scenarios:

```bash
# High-performance bulk fetching
ts-pkgx fetch --all --concurrency 12 --timeout 60000

# Conservative fetching for slow networks
ts-pkgx fetch --all --concurrency 4 --timeout 120000

# Quick testing with limited packages
ts-pkgx fetch --all --limit 10 --verbose
```

### CI/CD Integration

Use output-json for automation:

```bash
# Get structured JSON output for CI systems
result=$(ts-pkgx fetch --pkg "node,bun,python" --output-json)
echo "$result" | jq '.updatedPackages[]'

# Batch process specific packages
ts-pkgx fetch --pkg "$(cat package-list.txt | tr '\n' ',')" --output-json
```

## Advanced Usage

For more advanced usage scenarios, see:

- [Package Management](./features/management.md)
- [TypeScript Integration](./features/typescript.md)
- [Batch Processing](./features/batch-processing.md)
- [Multiple Package Fetching](./features/multiple-fetching.md)
- [Custom Transformations](./advanced/transformations.md)
- [Custom Output Formats](./advanced/output-formats.md)
- [Error Handling](./advanced/error-handling.md)
- [Optimized Batch Processing](./advanced/batch-processing.md)
- [Rate Limits](./advanced/rate-limits.md)
- [Aliases System](./advanced/aliases.md)
