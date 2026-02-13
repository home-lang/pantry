# TypeScript Types

ts-pkgx provides comprehensive TypeScript types that enable you to work in a fully typed environment with all packages from the pkgx.dev pantry. This page documents the available types and how to use them effectively.

## New Type Safety Features

ts-pkgx now includes extensive type safety features that provide compile-time validation, IntelliSense support, and type-safe package management operations:

### Package Name Types

```typescript
import type {
  PackageAlias, // All available package aliases (e.g., 'node', 'python')
  PackageDomain, // All available package domains (e.g., 'nodejs.org')
  PackageName, // Union of all valid package identifiers
  PackageSpec // Package specifications with versions (e.g., 'node@20.1.0')
} from 'ts-pkgx'

// Type-safe package names
const validPackages: PackageName[] = ['node', 'python', 'nodejs.org', 'python.org']
const packageSpecs: PackageSpec[] = ['node@20.1.0', 'python@latest']
```

### Platform & Architecture Types

```typescript
import type {
  SupportedArchitecture, // 'x86_64' | 'aarch64' | 'armv7l' | 'i686'
  SupportedFormat, // 'tar.xz' | 'tar.gz' | 'zip' | etc.
  SupportedPlatform // 'darwin' | 'linux' | 'windows'
} from 'ts-pkgx'
```

### Version Resolution Types

```typescript
import type {
  PackageInfo, // Comprehensive package information
  PackageResolution, // Package name resolution results
  VersionSpec // Version specifications like '^20', '~3.11', 'latest'
} from 'ts-pkgx'
```

## Core Types

### Pantry Interface

The `Pantry` interface is the main type that represents all available packages. It provides type-safe access to every package in the pkgx.dev ecosystem.

```typescript
import type { Pantry } from 'ts-pkgx'

// The Pantry interface maps domain names to package types
interface Pantry {
  nodejs_org: typeof nodePackage
  python_org: typeof pythonPackage
  go_dev: typeof goPackage
  rust_lang_org: typeof rustPackage
  // ... and hundreds more
}
```

### Packages Type Alias

The `Packages` type is an alias for `Pantry`, providing the same functionality with a more concise name:

```typescript
import type { Packages } from 'ts-pkgx'

// Packages is equivalent to Pantry
type Packages = Pantry
```

### Package Objects

Each package in the pantry has its own typed object with detailed metadata:

```typescript
import { nodePackage } from 'ts-pkgx'

// Each package object contains:
const packageInfo = {
  name: 'nodejs.org', // Primary domain name
  description: '...', // Package description
  aliases: ['node', 'npm'], // Alternative names
  programs: ['node', 'npm'], // Exported programs
  versions: ['18.0.0', '...'], // Available versions
  latestVersion: '20.10.0', // Latest stable version
  // ... additional metadata
}
```

## Working with Types

### Type-Safe Package Access

Access packages in a fully typed manner using the pantry object:

```typescript
import { pantry } from 'ts-pkgx'

// Fully typed access to any package
const nodeInfo = pantry.nodejs_org
const pythonInfo = pantry.python_org
const goInfo = pantry.go_dev

// TypeScript will provide autocomplete and type checking
console.log(nodeInfo.name) // ✅ Type-safe
console.log(nodeInfo.aliases) // ✅ Type-safe
console.log(nodeInfo.invalidProp) // ❌ TypeScript error
```

### Dynamic Package Lookup

For dynamic package access, use type assertions or the `Packages` type:

```typescript
import type { Packages } from 'ts-pkgx'
import { pantry } from 'ts-pkgx'

function getPackageInfo(packageKey: keyof Packages) {
  return pantry[packageKey]
}

// Usage with full type safety
const nodeInfo = getPackageInfo('nodejs_org')
const pythonInfo = getPackageInfo('python_org')
```

### Package Name Conversion

Domain names are converted to valid TypeScript property names by replacing dots with underscores and hyphens for sub-paths:

```typescript
// Domain -> TypeScript Property
'nodejs.org' // → nodejs_org
'python.org' // → python_org
'aws.amazon.com/cli' // → aws_amazon_com_cli
'agwa.name/git-crypt' // → agwa_name_git_crypt
```

## Practical Examples

### Package Discovery

Find packages by category or functionality:

```typescript
import type { Packages } from 'ts-pkgx'
import { pantry } from 'ts-pkgx'

// Type-safe package filtering
function findLanguagePackages(): Array<keyof Packages> {
  const languageKeys: Array<keyof Packages> = [
    'nodejs_org',
    'python_org',
    'go_dev',
    'rust_lang_org',
    'kotlin_lang_org'
  ]
  return languageKeys
}

// Get package information for each language
const languages = findLanguagePackages().map(key => ({
  key,
  info: pantry[key]
}))
```

### Version Management

Work with package versions in a type-safe way:

```typescript
import { pantry } from 'ts-pkgx'

function getLatestVersion(packageKey: keyof Packages): string {
  const pkg = pantry[packageKey]
  return pkg.latestVersion
}

function isVersionAvailable(
  packageKey: keyof Packages,
  version: string
): boolean {
  const pkg = pantry[packageKey]
  return pkg.versions.includes(version)
}

// Usage
const nodeLatest = getLatestVersion('nodejs_org')
const hasPython39 = isVersionAvailable('python_org', '3.9.0')
```

### Alias Resolution

Resolve package aliases to their canonical names:

```typescript
import type { Packages } from 'ts-pkgx'
import { aliases } from 'ts-pkgx'

function resolveAlias(alias: string): keyof Packages | null {
  // The aliases object maps short names to package keys
  return aliases[alias] || null
}

// Usage
const nodeKey = resolveAlias('node') // → 'nodejs_org'
const pythonKey = resolveAlias('python') // → 'python_org'
const goKey = resolveAlias('go') // → 'go_dev'
```

### Building Package Managers

Create type-safe package management utilities:

```typescript
import type { Packages } from 'ts-pkgx'
import { pantry } from 'ts-pkgx'

class PackageManager {
  private installed: Set<keyof Packages> = new Set()

  install(packageKey: keyof Packages): void {
    const pkg = pantry[packageKey]
    console.log(`Installing ${pkg.name} v${pkg.latestVersion}`)
    this.installed.add(packageKey)
  }

  isInstalled(packageKey: keyof Packages): boolean {
    return this.installed.has(packageKey)
  }

  getInstalledPackages() {
    return Array.from(this.installed).map(key => ({
      key,
      info: pantry[key]
    }))
  }
}

// Usage
const pm = new PackageManager()
pm.install('nodejs_org')
pm.install('python_org')
```

## Advanced Type Patterns

### Generic Package Operations

Create reusable functions that work with any package:

```typescript
import type { Packages } from 'ts-pkgx'
import { pantry } from 'ts-pkgx'

function analyzePackage<K extends keyof Packages>(
  packageKey: K
): {
    key: K
    name: string
    aliasCount: number
    programCount: number
    versionCount: number
  } {
  const pkg = pantry[packageKey]

  return {
    key: packageKey,
    name: pkg.name,
    aliasCount: pkg.aliases.length,
    programCount: pkg.programs.length,
    versionCount: pkg.versions.length
  }
}

// Usage with full type inference
const nodeAnalysis = analyzePackage('nodejs_org')
const pythonAnalysis = analyzePackage('python_org')
```

### Type Guards

Create type guards for runtime package validation:

```typescript
import type { Packages } from 'ts-pkgx'
import { pantry } from 'ts-pkgx'

function isValidPackageKey(key: string): key is keyof Packages {
  return key in pantry
}

function getPackageSafely(key: string) {
  if (isValidPackageKey(key)) {
    return pantry[key] // TypeScript knows this is safe
  }
  return null
}

// Usage
const userInput = 'nodejs_org'
const pkg = getPackageSafely(userInput) // Safely typed
```

## Integration Examples

### With React Components

```tsx
import type { Packages } from 'ts-pkgx'
import { pantry } from 'ts-pkgx'

interface PackageCardProps {
  packageKey: keyof Packages
}

function PackageCard({ packageKey }: PackageCardProps) {
  const pkg = pantry[packageKey]

  return (
    <div className="package-card">
      <h3>{pkg.name}</h3>
      <p>{pkg.description}</p>
      <div>
        <strong>Latest:</strong>
        {' '}
        {pkg.latestVersion}
      </div>
      <div>
        <strong>Aliases:</strong>
        {' '}
        {pkg.aliases.join(', ')}
      </div>
    </div>
  )
}

// Usage
<PackageCard packageKey="nodejs_org" />
```

### With CLI Tools

```typescript
import type { Packages } from 'ts-pkgx'
import { aliases, pantry } from 'ts-pkgx'

function createInstallCommand(input: string): string {
  // Try to resolve as alias first, then as direct package key
  let packageKey: keyof Packages | null = aliases[input] || null

  if (!packageKey && input in pantry) {
    packageKey = input as keyof Packages
  }

  if (!packageKey) {
    throw new Error(`Package '${input}' not found`)
  }

  const pkg = pantry[packageKey]
  return `pkgx install ${pkg.name}`
}

// Usage
console.log(createInstallCommand('node')) // pkgx install nodejs.org
console.log(createInstallCommand('python')) // pkgx install python.org
```

## Best Practices

### 1. Use Type Imports

Always import types separately from runtime values:

```typescript
import type { Packages, Pantry } from 'ts-pkgx'
import { aliases, pantry } from 'ts-pkgx'
```

### 2. Leverage Autocomplete

Take advantage of TypeScript's autocomplete for package discovery:

```typescript
import { pantry } from 'ts-pkgx'

// TypeScript will suggest all available packages
// const pkg = pantry. // Autocomplete shows all options
```

### 3. Use Keyof for Dynamic Access

When building dynamic functionality, use `keyof Packages`:

```typescript
function processPackages(keys: Array<keyof Packages>) {
  return keys.map(key => pantry[key])
}
```

### 4. Create Type-Safe Utilities

Build reusable utilities that maintain type safety:

```typescript
import type { Packages } from 'ts-pkgx'

interface PackageInfo<K extends keyof Packages> {
  key: K
  package: Packages[K]
}

function createPackageInfo<K extends keyof Packages>(
  key: K
): PackageInfo<K> {
  return {
    key,
    package: pantry[key]
  }
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

// Type-safe CLI operations
const infoResult = showPackageInfo('node') // CLIResult<PackageInfo>
const searchResult = searchPackagesCommand('js') // CLIResult<PackageInfo[]>
const planResult = createInstallPlan('node@20.1.0') // CLIResult<InstallationPlan>
const validation = validatePackage('node@latest') // CLIResult<{...}>
```

### Platform Detection

```typescript
import {
  createInstallationContext,
  detectPlatform
} from 'ts-pkgx'

// Type-safe platform operations
const platform = detectPlatform() // PlatformInfo
const context = createInstallationContext('node') // InstallationContext
```

## Related Documentation

- [TypeScript Integration](./features/typescript.md) - Using ts-pkgx with TypeScript
- [Package Management](./features/management.md) - Managing packages programmatically
- [API Reference](./api-reference.md) - Complete API documentation
- [CLI Reference](./cli-reference.md) - Command-line interface
