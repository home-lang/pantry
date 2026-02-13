# Launchpad Integration

This guide covers the **Launchpad Dependency Resolution API**, a powerful feature of ts-pkgx that enables automatic resolution and installation of package dependencies with deep transitive dependency analysis.

## Overview

The Launchpad API provides comprehensive dependency resolution for package managers and deployment tools, allowing you to:

- 🔍 **Deep dependency resolution** - Automatically resolves all transitive dependencies
- ⚡ **Version conflict resolution** - Intelligently handles conflicting version constraints
- 🎯 **OS-specific dependencies** - Supports platform-specific packages
- 📄 **Multiple input formats** - Supports YAML files, strings, and individual packages
- 🔧 **Semantic versioning** - Proper semver constraint handling (^, ~, >=, etc.)
- 🚀 **Optimized deduplication** - Removes duplicate packages and resolves conflicts

## Quick Start

```typescript
import { resolveDependencies } from 'ts-pkgx'

// Resolve from dependency file
const result = await resolveDependencies('./deps.yaml', {
  targetOs: 'darwin',
  includeOsSpecific: true
})

console.log(`Installing ${result.totalCount} packages...`)

// Install each resolved package
for (const pkg of result.packages) {
  await launchpad.install(pkg.name, pkg.version)
}
```

## API Functions

### resolveDependencies()

Resolves all dependencies from a YAML dependency file with complete transitive dependency analysis.

```typescript
async function resolveDependencies(
  filePath: string,
  options?: LaunchpadResolverOptions
): Promise<LaunchpadInstallResult>
```

**Parameters:**
- `filePath` - Path to dependency file (deps.yaml, pkgx.yaml, etc.)
- `options` - Optional resolution configuration

**Example:**
```typescript
const result = await resolveDependencies('./project-deps.yaml', {
  targetOs: 'darwin',
  includeOsSpecific: true,
  maxDepth: 10,
  verbose: false
})

// result contains packages, conflicts, commands, etc.
```

### resolveDependenciesFromYaml()

Resolves dependencies directly from a YAML string without requiring a file.

```typescript
async function resolveDependenciesFromYaml(
  yamlContent: string,
  options?: LaunchpadResolverOptions
): Promise<LaunchpadInstallResult>
```

**Example:**
```typescript
const yamlContent = `
global: true
dependencies:
  bun.sh: ^1.2.16
  gnu.org/grep: ^3.12.0
  ffmpeg.org: ^7.1.1
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

**Example:**
```typescript
const deps = await resolvePackageDependencies('gnu.org/grep')
// Returns: ['gnu.org/grep', 'pcre.org/v2', 'zlib.net', ...]
```

## Response Format

All resolution functions return a `LaunchpadInstallResult`:

```typescript
interface LaunchpadInstallResult {
  packages: LaunchpadPackage[] // All packages to install
  directCount: number // Number of direct dependencies
  totalCount: number // Total packages including transitive
  conflicts: Array<{ // Version conflicts resolved
    package: string
    versions: string[]
    resolved: string
  }>
  pkgxCommand: string // Ready-to-use pkgx install command (direct deps only)
  launchpadCommand: string // Ready-to-use launchpad install command (direct deps only)
}

interface LaunchpadPackage {
  name: string // Package domain (e.g., 'bun.sh')
  version: string // Resolved version (e.g., '1.2.19')
  constraint: string // Original constraint (e.g., '^1.2.16')
  isOsSpecific: boolean // Whether OS-specific
  os?: 'linux' | 'darwin' | 'windows'
}
```

## Configuration Options

```typescript
interface LaunchpadResolverOptions {
  targetOs?: 'linux' | 'darwin' | 'windows' // Target platform
  includeOsSpecific?: boolean // Include OS-specific deps
  maxDepth?: number // Max recursion depth (default: 10)
  verbose?: boolean // Show detailed output
}
```

## Integration Examples

### Basic Launchpad Integration

```typescript
import { resolveDependencies } from 'ts-pkgx'

export class LaunchpadInstaller {
  async installFromDepsFile(filePath: string) {
    const result = await resolveDependencies(filePath, {
      targetOs: process.platform === 'darwin' ? 'darwin' : 'linux',
      includeOsSpecific: true
    })

    // Install each package
    for (const pkg of result.packages) {
      console.log(`Installing ${pkg.name}@${pkg.version}...`)
      await this.install(pkg.name, pkg.version)
    }

    return {
      installed: result.totalCount,
      conflicts: result.conflicts.length,
      directDeps: result.directCount
    }
  }

  async installFromYaml(yamlContent: string) {
    const result = await resolveDependenciesFromYaml(yamlContent)
    return this.installFromPackageList(result.packages)
  }

  private async install(packageName: string, version: string) {
    // Your Launchpad installation logic here
    // Note: Launchpad should auto-resolve transitive dependencies
    console.log(`pkgx ${packageName}@${version}`)
  }
}
```

### Batch Installation

```typescript
export async function batchInstall(packages: string[]) {
  const allDeps = new Set<string>()

  // Resolve dependencies for each package
  for (const pkg of packages) {
    const deps = await resolvePackageDependencies(pkg)
    deps.forEach(dep => allDeps.add(`${dep.name}@${dep.version}`))
  }

  // Install all unique packages
  for (const pkgSpec of allDeps) {
    const [name, version] = pkgSpec.split('@')
    await launchpad.install(name, version)
  }
}
```

### Error Handling

```typescript
export async function safeInstall(depsFile: string) {
  try {
    const result = await resolveDependencies(depsFile, {
      verbose: true
    })

    if (result.conflicts.length > 0) {
      console.warn('Version conflicts resolved:')
      result.conflicts.forEach((conflict) => {
        console.warn(`  ${conflict.package}: [${conflict.versions.join(', ')}] → ${conflict.resolved}`)
      })
    }

    return await this.installPackages(result.packages)
  }
  catch (error) {
    console.error('Dependency resolution failed:', error.message)
    throw new Error(`Failed to resolve dependencies from ${depsFile}`)
  }
}
```

### CI/CD Integration

```typescript
// GitHub Actions / CI pipeline integration
export async function ciInstall() {
  const depsFile = process.env.DEPS_FILE || './deps.yaml'
  const targetOs = process.env.RUNNER_OS?.toLowerCase() || 'linux'

  const result = await resolveDependencies(depsFile, {
    targetOs: targetOs as 'linux' | 'darwin' | 'windows',
    includeOsSpecific: true,
    verbose: true
  })

  console.log(`::notice::Resolved ${result.totalCount} packages from ${result.directCount} direct dependencies`)

  if (result.conflicts.length > 0) {
    console.log(`::warning::Resolved ${result.conflicts.length} version conflicts`)
  }

  // Set output for next steps
  console.log(`::set-output name=packages::${result.packages.map(p => p.name).join(' ')}`)
  console.log(`::set-output name=install-command::${result.pkgxCommand}`)

  return result
}
```

## Supported Dependency File Formats

### Standard Format
```yaml
global: true
dependencies:
  bun.sh: ^1.2.16
  gnu.org/bash: ^5.2.37
  gnu.org/grep: ^3.12.0
```

### With Comments
```yaml
global: true
dependencies:
  # Runtime dependencies
  bun.sh: ^1.2.16 # JavaScript runtime
  gnu.org/grep: ^3.12.0 # Text search utility

  # Development tools
  cli.github.com: ^2.73.0 # GitHub CLI
```

### OS-Specific Dependencies
```yaml
dependencies:
  openssl.org: ^1.1
  linux:gnu.org/gcc: '*'
  darwin:apple.com/xcode: '*'
```

### Complex Version Constraints
```yaml
dependencies:
  # Caret ranges (compatible within major version)
  node.js: ^18.0.0

  # Tilde ranges (compatible within minor version)
  python.org: ~3.11.0

  # Comparison operators
  go.dev: '>=1.20.0'
  rust-lang.org: <1.75.0

  # Exact versions
  bun.sh: 1.2.19

  # Latest available
  deno.land: latest
  cli.github.com: '*'
```

## Version Conflict Resolution

The API automatically resolves version conflicts using semantic versioning rules:

1. **Caret constraints (^)**: Compatible within major version
2. **Tilde constraints (~)**: Compatible within minor version
3. **Range constraints**: Uses comparison operators (>=, <=, >, <)
4. **Exact versions**: Takes precedence over ranges
5. **Latest**: Falls back to newest available version

**Example conflict resolution:**
```yaml
# Input dependencies
packageA_deps: somelib ^2.1.0
packageB_deps: somelib ~2.2.0
packageC_deps: somelib >=2.0.0

# Resolved to: somelib@2.2.1 (satisfies all constraints)
```

## Performance Considerations

- **Parallel Resolution**: Dependencies are resolved concurrently for speed
- **Caching**: Package metadata is cached to avoid repeated API calls
- **Deduplication**: Duplicate packages are automatically removed
- **Depth Limiting**: Configurable recursion depth to prevent infinite loops
- **Optimized Parsing**: YAML parsing is optimized for large dependency files

## Real-World Example

Given this dependency file:
```yaml
global: true
dependencies:
  bun.sh: ^1.2.16
  gnu.org/bash: ^5.2.37
  gnu.org/grep: ^3.12.0
  crates.io/eza: ^0.21.3
  ffmpeg.org: ^7.1.1
  cli.github.com: ^2.73.0
  starship.rs: ^1.23.0
```

The resolver will:
1. Parse **7 direct dependencies**
2. Resolve **~60 total packages** (including all transitive dependencies)
3. Handle **9 version conflicts** automatically
4. Generate platform-specific install commands
5. Provide complete dependency graph ready for installation

**Output includes:**
- All resolved packages with exact versions
- Version conflict resolutions
- Ready-to-use install commands:
  - `pkgxCommand`: Installs only 7 direct dependencies (transitive deps auto-resolved)
  - `launchpadCommand`: Installs only 7 direct dependencies (transitive deps auto-resolved)
- OS-specific dependency handling
- Comprehensive error reporting

## Install Commands

Both install commands are optimized for modern package managers that auto-resolve transitive dependencies:

### `pkgxCommand` - pkgx Installation
```bash
pkgx install bun.sh gnu.org/bash gnu.org/grep crates.io/eza ffmpeg.org cli.github.com starship.rs
```
- Includes **only the 7 direct dependencies** from your deps file
- pkgx auto-resolves and installs all transitive dependencies
- Fast and efficient installation

### `launchpadCommand` - Launchpad Installation
```bash
launchpad install bun.sh gnu.org/bash gnu.org/grep crates.io/eza ffmpeg.org cli.github.com starship.rs
```
- Includes **only the 7 direct dependencies** from your deps file
- Launchpad auto-resolves and installs all transitive dependencies
- **Recommended for Launchpad integrations**

### Benefits of Direct Dependencies Only

- **Faster installations**: Only install what you explicitly need
- **Automatic resolution**: Package managers handle transitive dependencies
- **Clean dependency files**: Focus on direct requirements
- **Less network overhead**: Fewer explicit package downloads

### Access to Full Dependency Tree

While the install commands only include direct dependencies, the full resolved dependency tree is still available in the `packages` array for analysis, conflict resolution, or custom installation logic:

```typescript
const result = await resolveDependencies('./deps.yaml')

// Install commands use direct deps only
console.log(result.pkgxCommand) // "pkgx install bun.sh gnu.org/bash gnu.org/grep"

// But full dependency tree is available for analysis
console.log(`Resolved ${result.totalCount} total packages:`)
result.packages.forEach((pkg) => {
  console.log(`${pkg.name}@${pkg.version}`)
})
```

## Troubleshooting

### Common Issues

**Missing packages:**
```typescript
// Check if package exists
const deps = await resolvePackageDependencies('nonexistent.package')
// Returns empty array if package not found
```

**Version conflicts:**
```typescript
// Monitor conflicts
const result = await resolveDependencies('./deps.yaml', { verbose: true })
console.log(`Conflicts: ${result.conflicts.length}`)
result.conflicts.forEach((conflict) => {
  console.log(`${conflict.package}: ${conflict.versions.join(', ')} → ${conflict.resolved}`)
})
```

**OS compatibility:**
```typescript
// Platform-specific resolution
const result = await resolveDependencies('./deps.yaml', {
  targetOs: 'linux',
  includeOsSpecific: false // Skip OS-specific deps
})
```

## Next Steps

- See [API Reference](./api-reference.md) for complete type definitions
- Check [CLI Reference](./cli-reference.md) for command-line usage
- View [Examples](./usage.md) for more integration patterns
- Read [Advanced Usage](./advanced.md) for complex scenarios
