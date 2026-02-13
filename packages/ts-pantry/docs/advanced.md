# Advanced

This section covers advanced usage scenarios and customization options for ts-pkgx.

## Dependency Resolution System

ts-pkgx includes a sophisticated dependency resolution system that can analyze dependency files and resolve all transitive dependencies with intelligent version conflict resolution.

### Advanced Dependency Resolution

The dependency resolver provides powerful features for managing complex dependency trees:

```typescript
import {
  resolveDependencyFile,
  findDependencyFiles,
  type DependencyResolverOptions
} from 'ts-pkgx'

// Advanced dependency resolution with custom options
const resolverOptions: DependencyResolverOptions = {
  pantryDir: 'src/pantry',
  packagesDir: 'src/packages',
  includeOsSpecific: true,
  targetOs: 'darwin',
  maxDepth: 15,
  verbose: true,
}

// Resolve multiple dependency files
const depFiles = findDependencyFiles('./project')
const results = await Promise.all(
  depFiles.map(file => resolveDependencyFile(file, resolverOptions))
)

// Combine results and analyze conflicts
const allPackages = new Set()
const allConflicts = []

results.forEach(result => {
  result.uniquePackages.forEach(pkg => allPackages.add(pkg))
  allConflicts.push(...result.conflicts)
})

console.log(`Total unique packages: ${allPackages.size}`)
console.log(`Total conflicts resolved: ${allConflicts.length}`)
```

### Version Constraint Resolution

The system intelligently resolves version constraints against actual available versions:

```typescript
import {
  getAvailableVersionsForPackage,
  resolveVersionConstraint
} from 'ts-pkgx'

// Get available versions for a package
const versions = await getAvailableVersionsForPackage('bun.sh')
console.log(`Available versions: ${versions.join(', ')}`)

// Resolve different types of constraints
const constraints = ['^1.2.0', '~1.1.0', '>=1.0.0', 'latest']
constraints.forEach(constraint => {
  const resolved = resolveVersionConstraint(constraint, versions)
  console.log(`${constraint} → ${resolved}`)
})
```

### Custom Dependency Analysis

Implement custom dependency analysis workflows:

```typescript
async function analyzeDependencyComplexity(projectDir: string) {
  const depFiles = findDependencyFiles(projectDir)
  const analysis = {
    totalFiles: depFiles.length,
    totalPackages: new Set(),
    maxDepth: 0,
    conflicts: [],
    osSpecific: new Map(),
  }

  for (const file of depFiles) {
    const result = await resolveDependencyFile(file, {
      includeOsSpecific: true,
      maxDepth: 20,
      verbose: false,
    })

    // Track unique packages
    result.uniquePackages.forEach(pkg => analysis.totalPackages.add(pkg))

    // Track conflicts
    analysis.conflicts.push(...result.conflicts)

    // Track OS-specific dependencies
    Object.entries(result.osSpecificDeps).forEach(([os, deps]) => {
      if (!analysis.osSpecific.has(os)) {
        analysis.osSpecific.set(os, new Set())
      }
      deps.forEach(dep => analysis.osSpecific.get(os).add(dep.name))
    })
  }

  return {
    ...analysis,
    totalPackages: analysis.totalPackages.size,
    osSpecific: Object.fromEntries(
      Array.from(analysis.osSpecific.entries()).map(([os, deps]) => [
        os,
        deps.size,
      ])
    ),
  }
}

// Usage
const complexity = await analyzeDependencyComplexity('./my-project')
console.log('Dependency Analysis:', complexity)
```

## Pantry-Based Package Fetching

ts-pkgx uses a pantry-based approach for fetching package information. This provides more reliable and comprehensive metadata than traditional web scraping.

### Pantry Management

```bash
# Download and extract the latest pantry
ts-pkgx update-pantry --pantry-dir ./custom-pantry

# Generate constants from local pantry
ts-pkgx generate-consts --source pantry --pantry-dir ./custom-pantry

# Generate constants from S3 registry (alternative)
ts-pkgx generate-consts --source registry --validate
```

### Advanced Fetching Options

```typescript
import { fetchPantryPackageWithMetadata } from 'ts-pkgx'

// Custom configuration for complex packages
const result = await fetchPantryPackageWithMetadata('rust-lang.org', {
  timeout: 120000, // 2 minutes
  debug: true, // Save screenshots for debugging
  cache: true,
  cacheExpirationMinutes: 30, // 30 minutes cache
})

if (result) {
  console.log(result.packageInfo)
}
```

### Debug Mode

When enabled, debug mode saves screenshots and additional debugging information:

```bash
# CLI debug mode
ts-pkgx fetch rust-lang.org --debug --verbose

# API debug mode
const result = await fetchPantryPackageWithMetadata('rust-lang.org', { debug: true })
```

Screenshots and debug information are saved in the `debug` directory.

## Enhanced Package Generation

ts-pkgx generates packages with comprehensive JSDoc documentation and intelligent naming conventions. Each package includes rich type hints and documentation links.

### JSDoc Documentation Features

Every generated package includes detailed JSDoc comments:

```typescript
/**
 * Bun - Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one
 *
 * **Programs:** bun
 *
 * **Install:** `pkgx bun.sh`
 *
 * **Homepage:** https://bun.sh
 *
 * **GitHub:** https://github.com/oven-sh/bun
 *
 * @see https://ts-pkgx.netlify.app/packages/bunsh
 */
export const bunPackage = {
  /**
   * List of available versions of this package
   * From newest version to oldest.
   * @see https://ts-pkgx.netlify.app/usage
   */
  versions: ['1.2.15', '1.2.14',] as const,
  // ... other properties with comprehensive JSDoc
}
```

### Alias-Based Variable Naming

Packages with aliases use the primary alias for variable naming:

```typescript
// Packages with aliases use alias-based naming
export const bunPackage = { ... }      // For bun.sh (alias: 'bun')
export const nodePackage = { ... }     // For nodejs.org (alias: 'node')
export const pythonPackage = { ... }   // For python.org (alias: 'python')

// Packages without aliases use domain-based naming
export const examplecomPackage = { ... } // For example.com (no alias)
```

## Custom Package Transformation

You can implement custom transformation logic when processing packages:

```typescript
import type { PkgxPackage } from 'ts-pkgx'
import { fetchPantryPackageWithMetadata } from 'ts-pkgx'

async function fetchAndTransform(packageName: string): Promise<PkgxPackage | null> {
  const result = await fetchPantryPackageWithMetadata(packageName)

  if (!result) return null

  // Add custom metadata
  const enhancedPackage: PkgxPackage = {
    ...result.packageInfo,
    description: `${result.packageInfo.description} [Enhanced]`,
    // Add custom fields or modify existing ones
    customCategory: determineCategory(result.packageInfo),
  }

  return enhancedPackage
}

function determineCategory(pkg: PkgxPackage): string {
  if (pkg.domain.includes('lang'))
    return 'programming-language'
  if (pkg.programs.some(p => p.includes('server')))
    return 'server'
  return 'utility'
}
```

## Custom Output Formats

ts-pkgx generates TypeScript or JSON files by default, but you can customize the output format:

```typescript
import type { PkgxPackage } from 'ts-pkgx'
import fs from 'node:fs'
import path from 'node:path'
import { fetchPantryPackageWithMetadata } from 'ts-pkgx'

async function saveAsMarkdown(packageName: string, outputDir: string): Promise<void> {
  const result = await fetchPantryPackageWithMetadata(packageName)

  if (!result) {
    throw new Error(`Package ${packageName} not found`)
  }

  const mdContent = generateMarkdown(result.packageInfo)
  const fileName = `${result.packageInfo.domain.replace(/\./g, '-')}.md`
  const filePath = path.join(outputDir, fileName)

  fs.writeFileSync(filePath, mdContent)
  console.log(`Saved markdown to ${filePath}`)
}

function generateMarkdown(pkg: PkgxPackage): string {
  return `# ${pkg.name} (${pkg.domain})

${pkg.description}

## Installation

\`\`\`bash
${pkg.installCommand}
\`\`\`

## Programs

${pkg.programs.map(p => `- ${p}`).join('\n')}

## Dependencies

${pkg.dependencies.length ? pkg.dependencies.map(d => `- ${d}`).join('\n') : 'No dependencies'}

## Links

- [Homepage](${pkg.homepageUrl || 'N/A'})
- [GitHub](${pkg.githubUrl || 'N/A'})
- [Package YAML](${pkg.packageYmlUrl || 'N/A'})
`
}
```

## Extending the Aliases System

You can extend the built-in package aliases system:

```typescript
import { aliases as PACKAGE_ALIASES } from 'ts-pkgx'

// Add custom aliases
function extendAliases(customAliases: Record<string, string>): void {
  Object.entries(customAliases).forEach(([alias, domain]) => {
    if (!PACKAGE_ALIASES[alias]) {
      PACKAGE_ALIASES[alias] = domain
      console.log(`Added alias: ${alias} -> ${domain}`)
    }
  })
}

// Usage
extendAliases({
  js: 'nodejs.org',
  py: 'python.org',
  rs: 'rust-lang.org',
  bunjs: 'bun.sh',
})
```

## Custom Error Handling

Implement custom error handling for package fetching:

```typescript
import { fetchPantryPackageWithMetadata } from 'ts-pkgx'

async function fetchWithRetry(packageName: string, maxRetries = 3): Promise<any> {
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries} for ${packageName}`)
      return await fetchPantryPackageWithMetadata(packageName, {
        timeout: 30000 * attempt, // Increase timeout with each retry
      })
    }
    catch (error) {
      lastError = error
      console.error(`Attempt ${attempt} failed for ${packageName}:`, error.message)

      // Don't retry for certain errors
      if (error.message.includes('not found') || error.message.includes('Not Found')) {
        throw new Error(`Package ${packageName} not found`)
      }

      // Wait before retrying
      if (attempt < maxRetries) {
        const delay = 2000 * attempt // Increasing delay
        console.log(`Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(`Failed to fetch ${packageName} after ${maxRetries} attempts: ${lastError.message}`)
}
```

## Custom Package Index Generation

Customize the generated index.ts file:

```typescript
import fs from 'node:fs'
import path from 'node:path'
import { convertDomainToVarName } from 'ts-pkgx/tools/domainUtils'

function generateCustomIndex(packagesDir: string, outputFile: string): void {
  const files = fs.readdirSync(packagesDir)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts' && file !== 'fetch.ts')

  const imports = files.map((file) => {
    const moduleName = file.replace(/\.ts$/, '')
    const packageVarName = `${moduleName}Package`
    return `import { ${packageVarName} } from './${moduleName}'`
  })

  const categoryMap: Record<string, string[]> = {
    languages: ['nodejs.org', 'python.org', 'rust-lang.org', 'ruby-lang.org'],
    runtimes: ['bun.sh', 'deno.land'],
    tools: ['git-crypt', 'example.com'],
  }

  let content = `${imports.join('\n')}\n\n`
  content += `export * from './fetch'\n\n`
  content += `// Package collections by category\n`

  Object.entries(categoryMap).forEach(([category, domains]) => {
    content += `export const ${category}Packages = {\n`
    domains.forEach((domain) => {
      const varName = convertDomainToVarName(domain)
      content += `  '${domain}': ${varName}Package,\n`
    })
    content += `}\n\n`
  })

  // Add the regular pantry export
  content += `export const pantry: Record<string, PkgxPackage> = {}\n\n`

  // Add standard getPackage function
  content += `/**
 * Get a package by name, supporting both full domain and aliases
 */
export function getPackage(name: string): PkgxPackage | undefined {
  // Direct lookup
  if (pantry[name]) {
    return pantry[name]
  }

  // Check aliases - loop through all packages
  for (const pkg of Object.values(pantry)) {
    // Check if this package has the name as an alias
    if (pkg.aliases && pkg.aliases.includes(name)) {
      return pkg
    }
  }

  return undefined
}\n`

  fs.writeFileSync(outputFile, content)
  console.log(`Generated custom index at ${outputFile}`)
}
```

## Advanced Caching Strategies

ts-pkgx provides sophisticated caching capabilities for optimal performance:

```typescript
import fs from 'node:fs'
import path from 'node:path'

interface CacheEntry {
  timestamp: number
  expiresAt: number
  data: any
}

// Custom cache implementation
class AdvancedCache {
  constructor(private cacheDir: string, private defaultTTL: number = 3600000) {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true })
    }
  }

  save(key: string, data: any, ttl?: number): void {
    const cacheDuration = ttl || this.defaultTTL
    const cacheEntry: CacheEntry = {
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheDuration,
      data,
    }

    const cacheFile = path.join(this.cacheDir, `${key}.json`)
    fs.writeFileSync(cacheFile, JSON.stringify(cacheEntry, null, 2))
  }

  load(key: string): any | null {
    const cacheFile = path.join(this.cacheDir, `${key}.json`)

    if (!fs.existsSync(cacheFile)) {
      return null
    }

    try {
      const cacheEntry: CacheEntry = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))

      if (Date.now() > cacheEntry.expiresAt) {
        // Cache expired, remove file
        fs.unlinkSync(cacheFile)
        return null
      }

      return cacheEntry.data
    } catch (error) {
      // Corrupted cache file, remove it
      fs.unlinkSync(cacheFile)
      return null
    }
  }

  clear(): void {
    const files = fs.readdirSync(this.cacheDir)
    files.forEach(file => {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(this.cacheDir, file))
      }
    })
  }
}

// Usage
const cache = new AdvancedCache('.cache/advanced', 7200000) // 2 hours TTL

async function fetchWithAdvancedCache(packageName: string) {
  // Try cache first
  const cached = cache.load(packageName)
  if (cached) {
    console.log(`Cache hit for ${packageName}`)
    return cached
  }

  // Fetch fresh data
  const result = await fetchPantryPackageWithMetadata(packageName)
  if (result) {
    cache.save(packageName, result.packageInfo)
  }

  return result?.packageInfo
}
```

## Optimized Batch Processing

ts-pkgx implements optimized batch processing to efficiently handle large numbers of packages:

```typescript
import { fetchAndSaveAllPackages } from 'ts-pkgx'

async function optimizedBatchProcessing() {
  // Process packages with fine-tuned settings
  const packages = await fetchAndSaveAllPackages({
    concurrency: 12,        // Higher concurrency for faster processing
    timeout: 60000,         // Longer timeout for complex packages
    cacheExpirationMinutes: 30, // Shorter cache for fresher data
    limit: 100,             // Process first 100 packages for testing
    debug: false,           // Disable debug for performance
    outputJson: false,      // Generate TypeScript files
  })

  console.log(`Successfully processed ${packages.length} packages`)
  return packages
}
```

### Batch Size Considerations

The optimal settings depend on several factors:

```bash
# High-performance setup (good network, powerful machine)
ts-pkgx fetch --all --concurrency 15 --timeout 30000

# Conservative setup (slower network or machine)
ts-pkgx fetch --all --concurrency 4 --timeout 120000

# Testing setup (quick validation)
ts-pkgx fetch --all --limit 20 --concurrency 8 --verbose
```

### Resource Management

Control memory usage and prevent resource leaks:

```typescript
import { cleanupBrowserResources } from 'ts-pkgx'

async function processPackagesWithCleanup() {
  try {
    // Your package processing operations
    const result = await fetchAndSaveAllPackages({
      concurrency: 8,
      timeout: 60000,
    })

    return result
  } finally {
    // Always cleanup browser resources
    await cleanupBrowserResources()
  }
}
```

## Custom CLI Integration

Create custom CLI tools that integrate with ts-pkgx:

```typescript
#!/usr/bin/env node
import { CAC } from 'cac'
import { fetchPantryPackageWithMetadata, generateDocs } from 'ts-pkgx'

const cli = new CAC('my-custom-tool')

cli
  .command('sync <packages...>', 'Sync specific packages')
  .option('--output <dir>', 'Output directory', { default: './synced-packages' })
  .action(async (packages: string[], options) => {
    console.log(`Syncing ${packages.length} packages to ${options.output}`)

    for (const pkg of packages) {
      try {
        const result = await fetchPantryPackageWithMetadata(pkg, {
          timeout: 60000,
          cache: true,
          cacheExpirationMinutes: 60,
        })

        if (result) {
          console.log(`✅ Synced ${pkg}`)
        } else {
          console.log(`❌ Failed to sync ${pkg}`)
        }
      } catch (error) {
        console.error(`Error syncing ${pkg}:`, error.message)
      }
    }
  })

cli
  .command('docs', 'Generate documentation')
  .option('--output <dir>', 'Output directory', { default: './docs' })
  .action(async (options) => {
    await generateDocs(options.output)
    console.log(`Documentation generated in ${options.output}`)
  })

cli.parse()
```

## Environment-Specific Configuration

Configure ts-pkgx for different environments:

```typescript
interface EnvironmentConfig {
  timeout: number
  concurrency: number
  cacheExpiration: number
  debug: boolean
}

const configs: Record<string, EnvironmentConfig> = {
  development: {
    timeout: 120000,
    concurrency: 4,
    cacheExpiration: 30, // 30 minutes
    debug: true,
  },
  production: {
    timeout: 60000,
    concurrency: 12,
    cacheExpiration: 1440, // 24 hours
    debug: false,
  },
  ci: {
    timeout: 180000,
    concurrency: 8,
    cacheExpiration: 0, // No cache in CI
    debug: false,
  },
}

function getConfig(): EnvironmentConfig {
  const env = process.env.NODE_ENV || 'development'
  return configs[env] || configs.development
}

// Usage
const config = getConfig()
const result = await fetchPantryPackageWithMetadata('node', {
  timeout: config.timeout,
  debug: config.debug,
  cacheExpirationMinutes: config.cacheExpiration,
})
```
