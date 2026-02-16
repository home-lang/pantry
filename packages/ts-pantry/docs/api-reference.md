# API Reference

This page documents the API of ts-pkgx, including all the functions, interfaces, and types that are available for use.

## Core Types

### Type Safety Features

ts-pkgx provides comprehensive TypeScript type safety with the following types:

```typescript
// Package name types
type PackageName = PackageAlias | PackageDomain
type PackageAlias = keyof typeof aliases  // e.g., 'node', 'python', 'go'
type PackageDomain = keyof Packages       // e.g., 'nodejs.org', 'python.org'
type PackageSpec = `${PackageName}` | `${PackageName}@${string}`

// Platform types
type SupportedPlatform = 'darwin' | 'linux' | 'windows'
type SupportedArchitecture = 'x86_64' | 'aarch64' | 'armv7l' | 'i686'
type SupportedFormat = 'tar.xz' | 'tar.gz' | 'zip' | 'dmg' | 'pkg' | 'msi' | 'deb' | 'rpm'

// Version types
type VersionSpec = 'latest' | `^${string}` | `~${string}` | `>=${string}` | string

// Information interfaces
interface PackageInfo {
  name: string
  domain: string
  description: string
  latestVersion: string
  totalVersions: number
  programs: string[]
  dependencies: string[]
  companions: string[]
  versions: string[]
}

interface PackageResolution {
  originalName: string
  resolvedDomain: string
  isAlias: boolean
  version?: string
}

interface InstallationPlan {
  packageName: PackageName
  resolvedVersion: string
  platform: SupportedPlatform
  architecture: SupportedArchitecture
  dependencies: string[]
  companions: string[]
  installCommand: string
}
```

### PkgxPackage

The main interface that represents a pkgx package.

```typescript
interface PkgxPackage {
  /**

   _ The display name of the package

   _/
  name: string

  /**

   _ The domain name of the package (e.g., 'nodejs.org', 'bun.sh')

   _/
  domain: string

  /**

   _ A brief description of the package

   _/
  description: string

  /**

   _ URL to the package.yml file in the pkgx pantry repository

   _/
  packageYmlUrl?: string

  /**

   _ URL to the package's homepage

   _/
  homepageUrl?: string

  /**

   _ URL to the package's GitHub repository

   _/
  githubUrl?: string

  /**

   _ The command to install the package using pkgx

   _/
  installCommand: string

  /**

   _ List of executable programs provided by the package
   _ @see https://ts-pkgx.netlify.app/usage

   */
  programs: string[]

  /**

   _ List of companion packages that are often used with this package
   _ @see https://ts-pkgx.netlify.app/usage

   */
  companions: string[]

  /**

   _ List of dependencies required by this package
   _ @see https://ts-pkgx.netlify.app/usage

   */
  dependencies: string[]

  /**

   _ List of available versions of the package
   _ From newest version to oldest.
   _ @see https://ts-pkgx.netlify.app/usage

   _/
  versions: string[]

  /**

   _ List of alternative names or aliases for this package
   _ @see https://ts-pkgx.netlify.app/usage

   */
  aliases?: string[]

  /**

   _ The full path to the package, including any nested paths (e.g. 'agwa.name/git-crypt')

   _/
  fullPath?: string
}
```

### Pantry Interface

The main interface that provides access to all packages with comprehensive JSDoc documentation and alias support.

```typescript
interface Pantry {
  // Domain-based properties (e.g., bunsh, nodejsorg, pythonorg)
  [domain: string]: PkgxPackage

  // Alias properties for convenience (e.g., bun, node, python)
  // These provide the same package objects as their domain counterparts
  bun: PkgxPackage // Alias for bunsh (bun.sh)
  node: PkgxPackage // Alias for nodejsorg (nodejs.org)
  python: PkgxPackage // Alias for pythonorg (python.org)
  go: PkgxPackage // Alias for godev (go.dev)
  rust: PkgxPackage // Alias for rustlangorg (rust-lang.org)
  // ... and many more aliases
}
```

Each property in the Pantry interface includes comprehensive JSDoc documentation with:

_ Package description and purpose
_ List of programs provided
_ Installation command
_ Links to homepage, GitHub, and package documentation
_ Version information with "From newest version to oldest" description
_ Links to our usage documentation at <https://ts-pkgx.netlify.app/usage>

### PackageFetchOptions

Options for package fetching operations.

```typescript
interface PackageFetchOptions {
  /**

   _ Timeout in milliseconds for fetching operations
   _ @default 20000

   */
  timeout?: number

  /**

   _ Directory to save package data
   _ @default 'src/packages'

   */
  outputDir?: string

  /**

   _ Directory to cache package data
   _ @default '.cache/packages'

   */
  cacheDir?: string

  /**

   _ Enable or disable caching
   _ @default true

   */
  cache?: boolean

  /**

   _ Cache expiration time in minutes
   _ @default 1440

   */
  cacheExpirationMinutes?: number

  /**

   _ Enable debug mode to save screenshots and additional info
   _ @default false

   */
  debug?: boolean

  /**

   _ Limit the number of packages to fetch

   _/
  limit?: number

  /**

   _ Number of packages to fetch concurrently
   _ @default 8

   */
  concurrency?: number

  /**

   _ Output JSON for CI integration
   _ @default false

   */
  outputJson?: boolean
}
```

## Enhanced Package Generation

### Alias-Based Naming Convention

ts-pkgx uses intelligent alias-based naming for package variables and types:

1. **Packages with aliases use the primary alias for naming:**

   ```typescript
   // For bun.sh (alias: 'bun')
   export const bunPackage = { ... }
   export type BunPackage = typeof bunPackage

   // For nodejs.org (alias: 'node')
   export const nodePackage = { ... }
   export type NodePackage = typeof nodePackage

   // For python.org (alias: 'python')
   export const pythonPackage = { ... }
   export type PythonPackage = typeof pythonPackage
   ```

2. **Packages without aliases use domain-based naming:**

   ```typescript
   // For example.com (no alias)
   export const examplecomPackage = { ... }
   export type ExamplecomPackage = typeof examplecomPackage
   ```

### Comprehensive JSDoc Documentation

Every generated package includes rich JSDoc documentation:

```typescript
/**

 _ Bun - Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one

 _

 * **Programs:** bun

 _

 _ **Install:** `pkgx bun.sh`

 _

 _ **Homepage:** https://bun.sh

 _

 _ **GitHub:** https://github.com/oven-sh/bun

 _

 _ @see https://ts-pkgx.netlify.app/packages/bunsh

 */
export const bunPackage = {
  name: 'bun',
  domain: 'bun.sh',
  description: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one',
  /**

   _ List of executable programs provided by this package
   _ @see https://ts-pkgx.netlify.app/usage

   */
  programs: ['bun'] as const,
  /**

   _ List of available versions of this package
   _ From newest version to oldest.
   _ @see https://ts-pkgx.netlify.app/usage

   _/
  versions: ['1.2.15', '1.2.14',] as const,
  /**

   _ List of dependencies required by this package
   _ @see https://ts-pkgx.netlify.app/usage

   */
  dependencies: [] as const,
  /**

   _ List of companion packages that are often used with this package
   _ @see https://ts-pkgx.netlify.app/usage

   */
  companions: [] as const,
  // ... other properties with JSDoc
} as const
```

### Enhanced TypeScript Intellisense

The generated packages provide excellent TypeScript intellisense:

1. **Hovering over `pantry.bun`** shows:

   _ Package description
   _ Programs provided
   _ Installation command
   _ Links to documentation

2. **Hovering over `pantry.bun.versions`** shows:

   _ "From newest version to oldest."
   _ Link to usage documentation

3. **Hovering over `pantry.bun.programs`** shows:

   _ "List of executable programs provided by this package"
   _ Link to usage documentation

## Dependency Resolution

### Dependency Resolution Types

ts-pkgx provides comprehensive dependency resolution capabilities with the following types:

```typescript
interface Dependency {
  name: string
  version: string
  constraint: string
  isOsSpecific: boolean
  os?: string
}

interface DependencyResolutionResult {
  allDependencies: Dependency[]
  uniquePackages: string[]
  conflicts: Array<{
    package: string
    versions: string[]
  }>
  osSpecificDeps: Record<string, Dependency[]>
}

interface DependencyResolverOptions {
  pantryDir?: string
  packagesDir?: string
  includeOsSpecific?: boolean
  targetOs?: 'linux' | 'darwin' | 'windows'
  maxDepth?: number
  verbose?: boolean
}
```

### resolveDependencyFile

Resolves a dependency file and all its transitive dependencies.

```typescript
async function resolveDependencyFile(
  filePath: string,
  options: DependencyResolverOptions = {}
): Promise<DependencyResolutionResult>
```

#### Parameters

_ `filePath`: Path to the dependency file (deps.yaml, pkgx.yaml, etc.)
_ `options`: Configuration options for resolution

#### Returns

_ `DependencyResolutionResult` with all resolved dependencies, conflicts, and install information

#### Example

```typescript
const result = await resolveDependencyFile('./deps.yaml', {
  pantryDir: 'src/pantry',
  packagesDir: 'src/packages',
  maxDepth: 10,
  verbose: true,
})

console.log(`Found ${result.uniquePackages.length} unique packages`)
if (result.conflicts.length > 0) {
  console.log(`Resolved ${result.conflicts.length} version conflicts`)
}
```

### findDependencyFiles

Finds all dependency files in a directory.

```typescript
function findDependencyFiles(directory: string): string[]
```

#### Parameters

_ `directory`: Directory to search for dependency files

#### Returns

_ Array of paths to found dependency files

#### Example

```typescript
const depFiles = findDependencyFiles('./my-project')
console.log(`Found dependency files: ${depFiles.join(', ')}`)
```

### getAvailableVersionsForPackage

Gets available versions for a package from generated package files.

```typescript
async function getAvailableVersionsForPackage(
  packageName: string,
  packagesDir: string = 'src/packages'
): Promise<string[]>
```

#### Parameters

_ `packageName`: Name of the package
_ `packagesDir`: Directory containing generated package files

#### Returns

_ Array of available versions for the package

#### Example

```typescript
const versions = await getAvailableVersionsForPackage('bun.sh')
console.log(`Available versions: ${versions.join(', ')}`)
```

### resolveVersionConstraint

Resolves a version constraint against available versions.

```typescript
function resolveVersionConstraint(
  constraint: string,
  availableVersions: string[]
): string | null
```

#### Parameters

_ `constraint`: Version constraint (e.g., '^1.2.3', '~1.0.0', 'latest')
_ `availableVersions`: Array of available versions

#### Returns

_ Best matching version or null if no match found

#### Example

```typescript
const resolved = resolveVersionConstraint('^1.2.0', ['1.2.5', '1.1.0', '2.0.0'])
console.log(resolved) // '1.2.5'
```

## Core Functions

### fetchPantryPackageWithMetadata

Fetches package information using the pantry-based approach with enhanced metadata.

```typescript
async function fetchPantryPackageWithMetadata(
  packageName: string,
  options: {
    timeout?: number
    debug?: boolean
    outputJson?: boolean
    cacheDir?: string
    cache?: boolean
    cacheExpirationMinutes?: number
  } = {},
): Promise<{ packageInfo: PkgxPackage } | null>
```

#### Parameters

_ `packageName`: The name of the package to fetch (e.g., 'node', 'bun', 'agwa.name/git-crypt')
_ `options`: Optional configuration object

#### Returns

_ Object with `packageInfo` property containing the fetched package information, or `null` if not found

#### Example

```typescript
const result = await fetchPantryPackageWithMetadata('node', {
  timeout: 60000,
  debug: true,
  cache: true,
  cacheExpirationMinutes: 60,
})

if (result) {
  console.log(`Fetched ${result.packageInfo.name}`)
}
```

### saveToCacheAndOutput

Saves package information to both cache and output directories.

```typescript
function saveToCacheAndOutput(
  packageName: string,
  packageInfo: PkgxPackage,
  options: {
    cacheDir?: string
    outputDir?: string
    cache?: boolean
  },
): { outputPath: string }
```

#### Parameters

_ `packageName`: The name of the package
_ `packageInfo`: The package information to save
_ `options`: Configuration for cache and output directories

#### Returns

_ Object with `outputPath` property containing the path to the saved TypeScript file

#### Example

```typescript
const { outputPath } = saveToCacheAndOutput('node', packageInfo, {
  cacheDir: '.cache/packages',
  outputDir: 'src/packages',
  cache: true,
})

console.log(`Saved to ${outputPath}`)
```

### fetchAndSaveAllPackages

Fetches and saves all packages from the local pantry with enhanced documentation generation.

```typescript
async function fetchAndSaveAllPackages(
  options: PackageFetchOptions = {},
): Promise<string[]>
```

#### Parameters

_ `options`: Optional configuration

#### Returns

_ Array of domain names of the packages that were successfully fetched and saved

#### Example

```typescript
const savedPackages = await fetchAndSaveAllPackages({
  timeout: 60000,
  outputDir: './packages',
  concurrency: 12,
  limit: 100,
  debug: false,
})
console.log(`Saved ${savedPackages.length} packages`)
```

### savePackageAsTypeScript

Saves a package as a TypeScript file with enhanced JSDoc documentation.

```typescript
function savePackageAsTypeScript(
  outputDir: string,
  packageName: string,
  packageInfo: PkgxPackage,
): string
```

#### Parameters

_ `outputDir`: Directory to save the TypeScript file
_ `packageName`: Name of the package
_ `packageInfo`: Package information

#### Returns

_ Path to the saved TypeScript file

#### Example

```typescript
const filePath = savePackageAsTypeScript(
  'src/packages',
  'nodejs.org',
  packageInfo,
)
console.log(`Saved TypeScript file: ${filePath}`)
```

## Domain Utilities

### convertDomainToVarName

Converts a domain name to a safe TypeScript variable name.

```typescript
function convertDomainToVarName(domain: string): string
```

#### Parameters

_ `domain`: Domain name (e.g., 'bun.sh', 'agwa.name/git-crypt')

#### Returns

_ Safe TypeScript variable name (e.g., 'bunsh', 'agwanamegitcrypt')

#### Example

```typescript
const varName = convertDomainToVarName('bun.sh') // "bunsh"
const nestedVarName = convertDomainToVarName('agwa.name/git-crypt') // "agwanamegitcrypt"
```

### convertDomainToFileName

Converts a domain name to a standard format for file names.

```typescript
function convertDomainToFileName(domain: string): string
```

#### Parameters

_ `domain`: Domain name or path

#### Returns

_ Filename-safe version (e.g., 'bun.sh' -> 'bunsh', 'agwa.name/git-crypt' -> 'agwaname-gitcrypt')

#### Example

```typescript
const fileName = convertDomainToFileName('bun.sh') // "bunsh"
const nestedFileName = convertDomainToFileName('agwa.name/git-crypt') // "agwaname-gitcrypt"
```

### guessOriginalDomain

Attempts to guess a domain name from a filename.

```typescript
function guessOriginalDomain(fileName: string): string
```

#### Parameters

_ `fileName`: The filename (without extension)

#### Returns

_ Best guess at the original domain

#### Example

```typescript
const domain = guessOriginalDomain('bunsh') // "bun.sh"
const nestedDomain = guessOriginalDomain('agwaname-gitcrypt') // "agwa.name/gitcrypt"
```

## Package Index Utilities

### generateIndex

Generates an index.ts file for all packages in the packages directory with comprehensive JSDoc documentation and alias support.

```typescript
async function generateIndex(): Promise<string>
```

The generated index includes:

_ Comprehensive JSDoc documentation for each package property
_ Alias properties that point to the same package objects
_ Type-safe property names (quoted when necessary)
_ Links to package documentation pages

#### Returns

_ Path to the generated index file

#### Example

```typescript
const indexPath = await generateIndex()
console.log(`Generated index: ${indexPath}`)
```

### generateAliases

Generates a TypeScript aliases file for all packages.

```typescript
async function generateAliases(): Promise<string>
```

#### Returns

_ Path to the generated aliases file

#### Example

```typescript
const aliasesPath = await generateAliases()
console.log(`Generated aliases: ${aliasesPath}`)
```

### generateDocs

Generates comprehensive VitePress documentation for all packages.

```typescript
async function generateDocs(outputDir: string = 'docs'): Promise<void>
```

#### Parameters

_ `outputDir`: Directory to save documentation files

#### Example

```typescript
await generateDocs('./documentation')
console.log('Documentation generated successfully')
```

### getPackage

Gets a package by name, supporting both full domain and aliases.

```typescript
function getPackage(name: string): PkgxPackage | undefined
```

#### Parameters

_ `name`: The name of the package to lookup (can be a domain or an alias)

#### Returns

_ The package if found, or undefined if not found

#### Example

```typescript
const nodePackage = getPackage('node') // Using alias
const bunPackage = getPackage('bun.sh') // Using domain
const gitCrypt = getPackage('git-crypt') // Using alias
```

### pantry

The object containing all packages, indexed by domain name and including alias properties.

```typescript
const pantry: Pantry = {
  // Domain-based properties
  bunsh: bunPackage,
  nodejsorg: nodePackage,
  pythonorg: pythonPackage,

  // Alias properties (point to the same objects)
  bun: bunPackage, // Same as bunsh
  node: nodePackage, // Same as nodejsorg
  python: pythonPackage, // Same as pythonorg

  // ... all other packages
}
```

#### Example

```typescript
// Both approaches work and return the same object
const nodeViaAlias = pantry.node
const nodeViaDomain = pantry.nodejsorg
console.log(nodeViaAlias === nodeViaDomain) // true

// Access with excellent TypeScript intellisense
console.log(pantry.bun.versions) // Shows JSDoc: "From newest version to oldest."
```

## Constants

### PACKAGE_ALIASES

Map of common package aliases to their full domain names.

```typescript
const PACKAGE_ALIASES: Record<string, string> = {
  node: 'nodejs.org',
  python: 'python.org',
  go: 'go.dev',
  rust: 'rust-lang.org',
  ruby: 'ruby-lang.org',
  php: 'php.net',
  perl: 'perl.org',
  deno: 'deno.land',
  bun: 'bun.sh',
  // ... and more
}
```

### DEFAULT_CACHE_DIR

Default directory for caching package data.

```typescript
const DEFAULT_CACHE_DIR = '.cache/packages'
```

### DEFAULT_CACHE_EXPIRATION_MINUTES

Default cache expiration time in minutes (24 hours).

```typescript
const DEFAULT_CACHE_EXPIRATION_MINUTES = 1440
```

### DEFAULT_TIMEOUT_MS

Default timeout for network requests in milliseconds (20 seconds).

```typescript
const DEFAULT_TIMEOUT_MS = 20000
```

## Type-Safe Utility Functions

### Package Resolution Functions

```typescript
// Resolve package names to domains
function resolvePackageName(name: string): PackageResolution

// Type guards for package validation
function isPackageAlias(name: string): name is PackageAlias
function isPackageDomain(name: string): name is PackageDomain
function isValidPackageName(name: string): name is PackageName

// Get all available aliases and domains
function getAllPackageAliases(): PackageAlias[]
function getAllPackageDomains(): PackageDomain[]
```

### Version Resolution Functions

```typescript
// Get version information
function getLatestVersion(packageName: PackageName): string | null
function getAvailableVersions(packageName: PackageName): string[]
function isVersionAvailable(packageName: PackageName, version: string): boolean

// Resolve version specifications
function resolveVersion(packageName: PackageName, versionSpec: VersionSpec): string | null

// Get comprehensive package information
function getPackageInfo(packageName: PackageName): PackageInfo | null
```

### CLI Utility Functions

```typescript
// CLI command results with error handling
interface CLIResult<T = any> {
  success: boolean
  data?: T
  error?: string
  warnings?: string[]
}

// Package information commands
function showPackageInfo(packageName: string): CLIResult<PackageInfo>
function searchPackagesCommand(searchTerm: string): CLIResult<PackageInfo[]>
function listPopularPackages(limit?: number): CLIResult<PackageInfo[]>
function listActivePackages(limit?: number): CLIResult<PackageInfo[]>

// Installation planning
function createInstallPlan(packageSpec: string): CLIResult<InstallationPlan>
function validatePackage(packageSpec: string): CLIResult<{...}>

// Version information
function getVersionInfo(packageName: string): CLIResult<{
  latest: string
  total: number
  versions: string[]
}>
```

### Platform Detection Functions

```typescript
// Platform information
interface PlatformInfo {
  platform: SupportedPlatform
  architecture: SupportedArchitecture
  isSupported: boolean
}

// Platform detection and context creation
function detectPlatform(): PlatformInfo
function createInstallationContext(
  packageName: PackageName,
  version?: string,
  platformInfo?: PlatformInfo
): InstallationContext
```

### Package Categories

```typescript
// Predefined package categories
const PACKAGE_CATEGORIES = {
  RUNTIME: ['nodejs.org', 'python.org', 'go.dev', 'rust-lang.org'],
  BUILD_TOOLS: ['cmake.org', 'ninja-build.org', 'gradle.org', 'maven.apache.org'],
  DATABASES: ['postgresql.org', 'mysql.com', 'redis.io', 'mongodb.com'],
  EDITORS: ['neovim.io', 'vim.org', 'code.visualstudio.com'],
  CLI_TOOLS: ['cli.github.com', 'curl.se', 'wget.gnu.org', 'jq.dev'],
}

// Category utility functions
function getPackagesByCategory(category: keyof typeof PACKAGE_CATEGORIES): readonly string[]
function isPackageInCategory(packageName: string, category: keyof typeof PACKAGE_CATEGORIES): boolean
```

## Browser Resource Management

### cleanupBrowserResources

Cleans up Playwright browser resources to prevent hanging processes.

```typescript
async function cleanupBrowserResources(): Promise<void>
```

This function is automatically called by the CLI but can be used manually when using the library programmatically.

#### Example

```typescript
try {
  // Your package fetching operations
  await fetchPantryPackageWithMetadata('node')
} finally {
  // Ensure cleanup
  await cleanupBrowserResources()
}
```

## Launchpad Dependency Resolution API

The Launchpad API provides comprehensive dependency resolution for package managers and deployment tools.

### resolveDependencies()

Resolves all dependencies from a YAML dependency file with complete transitive dependency analysis.

```typescript
async function resolveDependencies(
  filePath: string,
  options?: LaunchpadResolverOptions
): Promise<LaunchpadInstallResult>
```

#### Parameters

_ `filePath`: Path to dependency file (deps.yaml, pkgx.yaml, etc.)

* `options`: Optional resolution configuration

#### Example

```typescript
import { resolveDependencies } from 'ts-pkgx'

const result = await resolveDependencies('./deps.yaml', {
  targetOs: 'darwin',
  includeOsSpecific: true,
  maxDepth: 10,
  verbose: false
})

console.log(`Installing ${result.totalCount} packages...`)
for (const pkg of result.packages) {
  await launchpad.install(pkg.name, pkg.version)
}
```

### resolveDependenciesFromYaml()

Resolves dependencies directly from a YAML string without requiring a file.

```typescript
async function resolveDependenciesFromYaml(
  yamlContent: string,
  options?: LaunchpadResolverOptions
): Promise<LaunchpadInstallResult>
```

#### Example

```typescript
const yamlContent = `
global: true
dependencies:
  bun.sh: ^1.2.16
  gnu.org/grep: ^3.12.0
`

const result = await resolveDependenciesFromYaml(yamlContent, {
  targetOs: 'darwin'
})
```

### resolvePackageDependencies()

Resolves all transitive dependencies for a single package.

```typescript
async function resolvePackageDependencies(
  packageName: string,
  options?: LaunchpadResolverOptions
): Promise<LaunchpadPackage[]>
```

#### Example

```typescript
const deps = await resolvePackageDependencies('gnu.org/grep')
console.log(deps) // ['gnu.org/grep', 'pcre.org/v2', 'zlib.net', ...]
```

### LaunchpadInstallResult

Response format for all Launchpad resolution functions.

```typescript
interface LaunchpadInstallResult {
  packages: LaunchpadPackage[]     // All packages to install
  directCount: number              // Number of direct dependencies
  totalCount: number               // Total packages including transitive
  conflicts: Array<{               // Version conflicts resolved
    package: string
    versions: string[]
    resolved: string
  }>
  pkgxCommand: string             // Ready-to-use pkgx install command (direct deps only)
  launchpadCommand: string        // Ready-to-use launchpad install command (direct deps only)
}
```

### LaunchpadPackage

Individual package information in the resolution result.

```typescript
interface LaunchpadPackage {
  name: string                    // Package domain (e.g., 'bun.sh')
  version: string                 // Resolved version (e.g., '1.2.19')
  constraint: string              // Original constraint (e.g., '^1.2.16')
  isOsSpecific: boolean           // Whether OS-specific
  os?: 'linux' | 'darwin' | 'windows'
}
```

### LaunchpadResolverOptions

Configuration options for dependency resolution.

```typescript
interface LaunchpadResolverOptions {
  targetOs?: 'linux' | 'darwin' | 'windows'  // Target platform
  includeOsSpecific?: boolean                 // Include OS-specific deps
  maxDepth?: number                          // Max recursion depth (default: 10)
  verbose?: boolean                          // Show detailed output
}
```

For comprehensive integration examples and usage patterns, see the [Launchpad Integration Guide](./launchpad-integration.md).
