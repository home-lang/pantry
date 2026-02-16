# TypeScript Integration

ts-pkgx provides seamless TypeScript integration with a pantry-based approach, making it easy to work with package data in a type-safe manner. The library includes extensive type safety features that provide compile-time validation, comprehensive JSDoc documentation, IntelliSense support, and type-safe package management operations.

## Fully Typed Interfaces

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

These interfaces ensure that you always know what properties are available and what their types are, helping to prevent runtime errors.

## Enhanced TypeScript Code Generation

ts-pkgx automatically generates TypeScript files for each package with comprehensive JSDoc documentation and intelligent naming conventions:

```typescript
// Generated file: bunsh.ts
import type { PkgxPackage } from '../types'

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
export const bunPackage: PkgxPackage = {
  name: 'Bun',
  domain: 'bun.sh',
  description: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one',
  /**

   * List of executable programs provided by this package
   * @see https://ts-pkgx.netlify.app/usage

   */
  programs: ['bun'] as const,
  /**

   * List of available versions of this package
   * From newest version to oldest.
   * @see https://ts-pkgx.netlify.app/usage

   */
  versions: ['1.2.15', '1.2.14',] as const,
  // ... other properties with comprehensive JSDoc
} as const

export type BunPackage = typeof bunPackage
```

### Alias-Based Variable Naming

ts-pkgx uses intelligent naming conventions:

```typescript
// Packages with aliases use the primary alias for naming
export const bunPackage = { ... }      // For bun.sh (alias: 'bun')
export const nodePackage = { ... }     // For nodejs.org (alias: 'node')
export const pythonPackage = { ... }   // For python.org (alias: 'python')

// Packages without aliases use domain-based naming
export const examplecomPackage = { ... } // For example.com (no alias)
```

## Type-Safe Access with Enhanced IntelliSense

When using ts-pkgx in your TypeScript projects, you get excellent IntelliSense with JSDoc hints:

```typescript
import { getPackage, pantry } from 'ts-pkgx'

// Hovering over 'bun' shows:
// "Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one"
// "Programs: bun"
// "Install: pkgx bun.sh"
const bunPackage = pantry.bun

// Hovering over 'versions' shows:
// "From newest version to oldest."
// Link to usage documentation
const versions = bunPackage.versions

// Both approaches work (alias and domain)
const nodeViaAlias = pantry.node // Alias access
const nodeViaDomain = pantry.nodejsorg // Domain access
console.log(nodeViaAlias === nodeViaDomain) // true
```

## Enhanced API Type Definitions

All API functions come with proper TypeScript types and comprehensive JSDoc:

```typescript
/**

 * Fetches package information using the pantry-based approach

 */
async function fetchPantryPackageWithMetadata(
  packageName: string,
  options?: {
    timeout?: number
    debug?: boolean
    outputJson?: boolean
    cacheDir?: string
    cache?: boolean
    cacheExpirationMinutes?: number
  }
): Promise<{ packageInfo: PkgxPackage } | null>

/**

 * Saves package information to both cache and output directories

 */
function saveToCacheAndOutput(
  packageName: string,
  packageInfo: PkgxPackage,
  options: {
    cacheDir?: string
    outputDir?: string
    cache?: boolean
  }
): { outputPath: string }
```

## Advanced Type Safety Features

ts-pkgx includes comprehensive type safety for all package operations:

### Package Name Types

```typescript
import type {
  InstallationPlan, // Complete installation planning interface
  PackageAlias, // All available package aliases (e.g., 'node', 'python')
  PackageDomain, // All available package domains (e.g., 'nodejs.org')
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

### Type-Safe Utility Functions

```typescript
import {
  getAllPackageAliases,
  isPackageAlias,
  isValidPackageName,
  resolvePackageName
} from 'ts-pkgx'

// Type guards and resolution
const isAlias = isPackageAlias('node') // Type guard: name is PackageAlias
const isValid = isValidPackageName('node') // Type guard: name is PackageName
const resolution = resolvePackageName('node') // Returns PackageResolution
const aliases = getAllPackageAliases() // PackageAlias[]
```

### Version Resolution with Types

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

### CLI Utilities with Error Handling

```typescript
import {
  createInstallPlan,
  searchPackagesCommand,
  showPackageInfo,
  validatePackage
} from 'ts-pkgx'

// Type-safe CLI operations with structured error handling
const infoResult = showPackageInfo('node') // CLIResult<PackageInfo>
if (infoResult.success && infoResult.data) {
  console.log(infoResult.data.description)
}
else {
  console.error(infoResult.error)
}

const searchResult = searchPackagesCommand('js') // CLIResult<PackageInfo[]>
const planResult = createInstallPlan('node@20.1.0') // CLIResult<InstallationPlan>
```

### Platform Detection

```typescript
import { createInstallationContext, detectPlatform } from 'ts-pkgx'

// Type-safe platform operations
const platform = detectPlatform() // PlatformInfo
const context = createInstallationContext('node') // InstallationContext
```

## Automatic Index Generation with JSDoc

ts-pkgx generates a comprehensive index file with rich JSDoc documentation:

```typescript
// Generated index.ts
import type { PkgxPackage } from '../types'

/**

 * Access all packages with comprehensive JSDoc documentation and alias support.

 *

 * This pantry object provides both domain-based and alias-based access to packages.
 * Alias properties point to the same objects as their domain counterparts.

 */
export interface Pantry {
  // Domain-based properties
  bunsh: PkgxPackage
  nodejsorg: PkgxPackage

  // Alias properties (same objects as domains)
  /**

   * Bun - Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one

   *

   * **Programs:** bun
   * **Install:** `pkgx bun.sh`
   * @see https://ts-pkgx.netlify.app/packages/bunsh

   */
  bun: PkgxPackage // Same as bunsh

  /**

   * Node.js - JavaScript runtime built on Chrome's V8 JavaScript engine

   *

   * **Programs:** node, npm, npx
   * **Install:** `pkgx nodejs.org`
   * @see https://ts-pkgx.netlify.app/packages/nodejsorg

   */
  node: PkgxPackage // Same as nodejsorg
}
```

## TypeScript Intellisense Features

The generated packages provide excellent TypeScript intellisense:

1. **Hovering over `pantry.bun`** shows:
   * Complete package description
   * Programs provided
   * Installation command
   * Links to documentation

2. **Hovering over `pantry.bun.versions`** shows:
   * "From newest version to oldest."
   * Link to usage documentation

3. **Hovering over `pantry.bun.programs`** shows:
   * "List of executable programs provided by this package"
   * Link to usage documentation

## Domain Utilities with Type Safety

```typescript
import { convertDomainToFileName, convertDomainToVarName } from 'ts-pkgx/tools/domainUtils'

// Type-safe conversion functions with proper handling of nested paths
const varName: string = convertDomainToVarName('bun.sh') // "bunsh"
const fileName: string = convertDomainToFileName('agwa.name/git-crypt') // "agwaname-gitcrypt"
const nestedVar: string = convertDomainToVarName('aws.amazon.com/cli') // "awsamazoncomcli"
```

## Error Handling Types

ts-pkgx provides structured error handling with TypeScript:

```typescript
interface CLIResult<T = any> {
  success: boolean
  data?: T
  error?: string
  warnings?: string[]
}

// Usage with type safety
async function handlePackageOperation(packageName: string) {
  const result = showPackageInfo(packageName)

  if (result.success) {
    // TypeScript knows result.data is PackageInfo
    console.log(result.data.description)
  }
  else {
    // TypeScript knows result.error is string
    console.error(`Error: ${result.error}`)
  }
}
```

## Integration Best Practices

For optimal TypeScript integration:

```typescript
import type { PackageName, PkgxPackage } from 'ts-pkgx'
import { getPackage, pantry } from 'ts-pkgx'

// Type-safe package lookup function
function getPackageByName(name: PackageName): PkgxPackage | undefined {
  return getPackage(name)
}

// Type-safe package validation
function isPackageInstalled(packageName: PackageName): boolean {
  const pkg = getPackage(packageName)
  return pkg !== undefined
}

// Working with package collections
function getJavaScriptRuntimes(): PkgxPackage[] {
  return [
    pantry.node, // nodejs.org
    pantry.bun, // bun.sh
    pantry.deno, // deno.land
  ]
}
```

## Related Documentation

For comprehensive information about working with TypeScript types in ts-pkgx, including advanced usage patterns and examples, see the [TypeScript Types](../typescript-types.md) documentation.
