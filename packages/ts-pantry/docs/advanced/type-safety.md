# Advanced Type Safety

ts-pkgx provides comprehensive TypeScript type safety features that enable compile-time validation, IntelliSense support, and type-safe package management operations. This guide covers advanced usage patterns and best practices.

## Type System Overview

ts-pkgx's type system is built around the actual package data from pkgx.dev, providing:

- **Compile-time validation** of package names and versions
- **IntelliSense support** for all package operations
- **Type guards** for runtime validation
- **Generic utilities** for building type-safe applications

## Package Name Types

### Core Types

```typescript
import type {
  PackageName,      // Union of all valid package identifiers
  PackageAlias,     // All available package aliases (22 aliases)
  PackageDomain,    // All available package domains (872+ domains)
  PackageSpec       // Package specifications with versions
} from 'ts-pkgx'

// Examples of valid package names
const aliases: PackageAlias[] = ['node', 'python', 'go', 'rust', 'bun']
const domains: PackageDomain[] = ['nodejs.org', 'python.org', 'go.dev', 'rust-lang.org']
const specs: PackageSpec[] = ['node@20.1.0', 'python@latest', 'go@^1.21']
```

### Type Guards

```typescript
import {
  isPackageAlias,
  isPackageDomain,
  isValidPackageName
} from 'ts-pkgx'

function processPackage(input: string) {
  if (isPackageAlias(input)) {
    // TypeScript knows input is PackageAlias
    console.log(`Processing alias: ${input}`)
  } else if (isPackageDomain(input)) {
    // TypeScript knows input is PackageDomain
    console.log(`Processing domain: ${input}`)
  } else if (isValidPackageName(input)) {
    // TypeScript knows input is PackageName
    console.log(`Processing package: ${input}`)
  } else {
    throw new Error(`Invalid package name: ${input}`)
  }
}
```

## Version Resolution Types

### Version Specifications

```typescript
import type { VersionSpec } from 'ts-pkgx'

// Supported version specification formats
const versionSpecs: VersionSpec[] = [
  'latest',      // Latest version
  '^20.1.0',     // Caret range
  '~3.11.0',     // Tilde range
  '>=1.21.0',    // Greater than or equal
  '20.1.0',      // Exact version
  '20.x',        // Wildcard version
]
```

### Version Resolution Functions

```typescript
import {
  getLatestVersion,
  getAvailableVersions,
  resolveVersion,
  isVersionAvailable
} from 'ts-pkgx'

// Type-safe version operations
function managePackageVersions(packageName: PackageName) {
  const latest = getLatestVersion(packageName)           // string | null
  const versions = getAvailableVersions(packageName)    // string[]
  const resolved = resolveVersion(packageName, '^20')   // string | null
  const hasVersion = isVersionAvailable(packageName, '20.1.0') // boolean

  return { latest, versions, resolved, hasVersion }
}
```

## Platform and Architecture Types

### Platform Detection

```typescript
import type {
  SupportedPlatform,
  SupportedArchitecture,
  SupportedFormat,
  PlatformInfo
} from 'ts-pkgx'
import { detectPlatform } from 'ts-pkgx'

// Type-safe platform operations
const platformInfo: PlatformInfo = detectPlatform()

function createDownloadUrl(
  packageName: PackageName,
  version: string,
  platform: SupportedPlatform = platformInfo.platform,
  arch: SupportedArchitecture = platformInfo.architecture
): string {
  // TypeScript ensures only valid platforms and architectures
  return `https://pkgx.dev/${packageName}/${version}/${platform}/${arch}`
}
```

## Package Information Types

### Comprehensive Package Data

```typescript
import type { PackageInfo } from 'ts-pkgx'
import { getPackageInfo } from 'ts-pkgx'

// Get comprehensive package information
function analyzePackage(packageName: PackageName): PackageInfo | null {
  const info = getPackageInfo(packageName)

  if (info) {
    // All properties are fully typed
    console.log(`Package: ${info.name}`)
    console.log(`Domain: ${info.domain}`)
    console.log(`Latest: ${info.latestVersion}`)
    console.log(`Total versions: ${info.totalVersions}`)
    console.log(`Programs: ${info.programs.join(', ')}`)
    console.log(`Dependencies: ${info.dependencies.join(', ')}`)
    console.log(`Companions: ${info.companions.join(', ')}`)
  }

  return info
}
```

## CLI Result Types

### Error Handling with Types

```typescript
import type { CLIResult } from 'ts-pkgx'
import {
  showPackageInfo,
  createInstallPlan,
  searchPackagesCommand
} from 'ts-pkgx'

// Type-safe CLI operations with comprehensive error handling
function handleCLIOperation<T>(result: CLIResult<T>): T | null {
  if (result.success && result.data) {
    if (result.warnings && result.warnings.length > 0) {
      console.warn('Warnings:', result.warnings.join(', '))
    }
    return result.data
  } else {
    console.error('Operation failed:', result.error)
    return null
  }
}

// Usage examples
const packageInfo = handleCLIOperation(showPackageInfo('node'))
const installPlan = handleCLIOperation(createInstallPlan('node@20.1.0'))
const searchResults = handleCLIOperation(searchPackagesCommand('javascript'))
```

## Advanced Generic Patterns

### Building Type-Safe Package Managers

```typescript
import type {
  PackageName,
  PackageInfo,
  InstallationPlan,
  SupportedPlatform
} from 'ts-pkgx'
import {
  getPackageInfo,
  createInstallPlan,
  detectPlatform
} from 'ts-pkgx'

class TypeSafePackageManager {
  private installed = new Set<PackageName>()
  private platform = detectPlatform()

  async install<T extends PackageName>(
    packageName: T,
    version?: string
  ): Promise<InstallationPlan | null> {
    // TypeScript ensures only valid package names
    const planResult = createInstallPlan(
      version ? `${packageName}@${version}` : packageName
    )

    if (planResult.success && planResult.data) {
      this.installed.add(packageName)
      return planResult.data
    }

    return null
  }

  isInstalled(packageName: PackageName): boolean {
    return this.installed.has(packageName)
  }

  getInstalledPackages(): PackageInfo[] {
    return Array.from(this.installed)
      .map(name => getPackageInfo(name))
      .filter((info): info is PackageInfo => info !== null)
  }
}
```

### Type-Safe Package Categories

```typescript
import type { PackageName } from 'ts-pkgx'
import { PACKAGE_CATEGORIES, getPackagesByCategory } from 'ts-pkgx'

// Type-safe category operations
function getLanguagePackages(): readonly PackageName[] {
  return getPackagesByCategory('RUNTIME')
}

function getDatabasePackages(): readonly PackageName[] {
  return getPackagesByCategory('DATABASES')
}

// Generic category function
function getPackagesInCategory<K extends keyof typeof PACKAGE_CATEGORIES>(
  category: K
): readonly PackageName[] {
  return getPackagesByCategory(category)
}
```

## Best Practices

### 1. Use Type Imports

Always import types separately from runtime values:

```typescript
import type {
  PackageName,
  PackageInfo,
  InstallationPlan
} from 'ts-pkgx'
import {
  getPackageInfo,
  createInstallPlan
} from 'ts-pkgx'
```

### 2. Leverage Type Guards

Use type guards for runtime validation:

```typescript
import { isValidPackageName } from 'ts-pkgx'

function safeGetPackageInfo(input: string) {
  if (isValidPackageName(input)) {
    return getPackageInfo(input) // TypeScript knows this is safe
  }
  throw new Error(`Invalid package name: ${input}`)
}
```

### 3. Handle CLI Results Properly

Always check CLI result success before accessing data:

```typescript
function safeShowPackageInfo(packageName: string) {
  const result = showPackageInfo(packageName)

  if (result.success && result.data) {
    return result.data
  }

  throw new Error(result.error || 'Unknown error')
}
```

### 4. Use Generic Constraints

When building utilities, use generic constraints for type safety:

```typescript
function processPackages<T extends PackageName>(
  packages: T[]
): Array<{ name: T; info: PackageInfo | null }> {
  return packages.map(name => ({
    name,
    info: getPackageInfo(name)
  }))
}
```

## Integration Examples

### React Component with Type Safety

```tsx
import type { PackageName, PackageInfo } from 'ts-pkgx'
import { getPackageInfo } from 'ts-pkgx'
import { useState, useEffect } from 'react'

interface PackageCardProps {
  packageName: PackageName
}

function PackageCard({ packageName }: PackageCardProps) {
  const [info, setInfo] = useState<PackageInfo | null>(null)

  useEffect(() => {
    const packageInfo = getPackageInfo(packageName)
    setInfo(packageInfo)
  }, [packageName])

  if (!info) return <div>Loading...</div>

  return (
    <div className="package-card">
      <h3>{info.name}</h3>
      <p>{info.description}</p>
      <div>Latest: {info.latestVersion}</div>
      <div>Programs: {info.programs.join(', ')}</div>
    </div>
  )
}
```

### CLI Tool with Type Safety

```typescript
import type { PackageName } from 'ts-pkgx'
import {
  isValidPackageName,
  showPackageInfo,
  createInstallPlan
} from 'ts-pkgx'

function createTypeSafeCLI() {
  return {
    info(packageName: string) {
      if (!isValidPackageName(packageName)) {
        throw new Error(`Invalid package: ${packageName}`)
      }

      const result = showPackageInfo(packageName)
      if (!result.success) {
        throw new Error(result.error)
      }

      return result.data
    },

    install(packageSpec: string) {
      const result = createInstallPlan(packageSpec)
      if (!result.success) {
        throw new Error(result.error)
      }

      return result.data
    }
  }
}
```

## Related Documentation

- [TypeScript Integration](../features/typescript.md) - Basic TypeScript features
- [API Reference](../api-reference.md) - Complete API documentation
- [CLI Reference](../cli-reference.md) - Command-line interface
- [Package Management](../features/management.md) - Package management features
