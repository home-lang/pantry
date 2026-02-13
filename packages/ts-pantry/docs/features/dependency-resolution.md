# Dependency Resolution

ts-pkgx includes a sophisticated dependency resolution system that can analyze dependency files and resolve all transitive dependencies with intelligent version conflict resolution.

## Overview

The dependency resolver provides:

- Support for multiple dependency file formats
- Version constraint resolution against actual available versions
- Transitive dependency resolution
- Intelligent conflict resolution
- OS-specific dependency filtering
- Comprehensive output formats

## Supported File Formats

The resolver automatically detects and parses these dependency file formats:

- `deps.yaml` / `deps.yml`
- `dependencies.yaml` / `dependencies.yml`
- `pkgx.yaml` / `pkgx.yml`

### Example Dependency File

```yaml
# deps.yaml
global: true
dependencies:
  bun.sh: ^1.2.16
  nodejs.org: ^20.0.0
  python.org: 3.9.0
  git-scm.com: latest
  gnu.org/bash: ~5.2.0
```

## CLI Usage

### Basic Resolution

```bash
# Resolve a single dependency file
ts-pkgx resolve-deps deps.yaml

# Resolve with verbose output
ts-pkgx resolve-deps deps.yaml --verbose

# Show install commands for all unique packages
ts-pkgx resolve-deps deps.yaml --install-command
```

### Advanced Options

```bash
# Find and resolve all dependency files in a directory
ts-pkgx resolve-deps --find-files ./my-project

# Filter for specific operating system
ts-pkgx resolve-deps deps.yaml --target-os darwin --include-os-deps

# Custom pantry and packages directories
ts-pkgx resolve-deps deps.yaml --pantry-dir ./custom-pantry --packages-dir ./custom-packages

# Limit recursion depth for transitive dependencies
ts-pkgx resolve-deps deps.yaml --max-depth 5

# Output as JSON for automation
ts-pkgx resolve-deps deps.yaml --json
```

## Programmatic Usage

### Basic Resolution

```typescript
import { resolveDependencyFile } from 'ts-pkgx'

const result = await resolveDependencyFile('./deps.yaml', {
  pantryDir: 'src/pantry',
  packagesDir: 'src/packages',
  maxDepth: 10,
  verbose: true,
})

console.log(`Found ${result.uniquePackages.length} unique packages`)
console.log(`Resolved ${result.conflicts.length} version conflicts`)
```

### Finding All Dependency Files

```typescript
import { findDependencyFiles, resolveDependencyFile } from 'ts-pkgx'

// Find all dependency files in a project
const depFiles = findDependencyFiles('./my-project')
console.log(`Found ${depFiles.length} dependency files`)

// Resolve each file
const results = await Promise.all(
  depFiles.map(file => resolveDependencyFile(file, {
    includeOsSpecific: true,
    targetOs: 'darwin',
    maxDepth: 15,
  }))
)

// Combine and analyze results
const allPackages = new Set()
const allConflicts = []

results.forEach((result) => {
  result.uniquePackages.forEach(pkg => allPackages.add(pkg))
  allConflicts.push(...result.conflicts)
})

console.log(`Total unique packages: ${allPackages.size}`)
console.log(`Total conflicts: ${allConflicts.length}`)
```

## Version Constraint Resolution

The resolver supports various version constraint formats and resolves them against actual available versions from your generated package files.

### Supported Constraint Formats

- **Exact versions**: `1.2.3`
- **Caret ranges**: `^1.2.3` (compatible within major version)
- **Tilde ranges**: `~1.2.3` (compatible within minor version)
- **Comparison operators**: `>=1.2.3`, `<=1.2.3`, `>1.2.3`, `<1.2.3`
- **Wildcards**: `latest`, `*`

### Version Resolution Example

```typescript
import { getAvailableVersionsForPackage, resolveVersionConstraint } from 'ts-pkgx'

// Get available versions for a package
const versions = await getAvailableVersionsForPackage('bun.sh')
console.log(`Available versions: ${versions.join(', ')}`)

// Resolve different constraint types
const constraints = ['^1.2.0', '~1.1.0', '>=1.0.0', 'latest']
constraints.forEach((constraint) => {
  const resolved = resolveVersionConstraint(constraint, versions)
  console.log(`${constraint} → ${resolved}`)
})
```

## Conflict Resolution

When multiple packages require different versions of the same dependency, the resolver automatically handles conflicts using intelligent strategies:

1. **Specific versions over ranges**: Exact versions take precedence over range constraints
2. **Highest compatible version**: Among compatible versions, the highest is chosen
3. **Latest fallback**: When no specific constraints exist, the latest version is used

### Conflict Resolution Example

```yaml
# Input: Multiple packages requiring different Node.js versions
dependencies:
  package-a: # requires nodejs.org ^18.0.0
  package-b: # requires nodejs.org >=16.0.0
  package-c: # requires nodejs.org latest

# Output: Resolves to nodejs.org 18.x.x (highest compatible)
```

## OS-Specific Dependencies

The resolver can handle OS-specific dependencies and filter them based on your target platform.

```bash
# Include OS-specific dependencies for macOS
ts-pkgx resolve-deps deps.yaml --target-os darwin --include-os-deps

# Include OS-specific dependencies for Linux
ts-pkgx resolve-deps deps.yaml --target-os linux --include-os-deps
```

## Output Formats

### Human-Readable Output

```bash
ts-pkgx resolve-deps deps.yaml --verbose --install-command
```

```
🔍 Resolving dependencies from deps.yaml...

📋 All unique packages to install:
  1. bun.sh (1.2.16)
  2. nodejs.org (20.0.0)
  3. python.org (3.12.0)
  4. git-scm.com (2.43.0)

⚠️  Conflicts found:
  nodejs.org: 20.0.0, 18.0.0 → resolved to 20.0.0

💾 Install command:
sh <(curl https://pkgx.sh) +bun.sh +nodejs.org +python.org +git-scm.com -- $SHELL -i
```

### JSON Output

```bash
ts-pkgx resolve-deps deps.yaml --json
```

```json
{
  "allDependencies": [
    {
      "name": "bun.sh",
      "version": "1.2.16",
      "constraint": "^1.2.16",
      "isOsSpecific": false
    }
  ],
  "uniquePackages": ["bun.sh", "nodejs.org", "python.org"],
  "conflicts": [
    {
      "package": "nodejs.org",
      "versions": ["20.0.0", "18.0.0"]
    }
  ],
  "osSpecificDeps": {}
}
```

## Advanced Usage

### Custom Dependency Analysis

```typescript
async function analyzeDependencyComplexity(projectDir: string) {
  const depFiles = findDependencyFiles(projectDir)
  const analysis = {
    totalFiles: depFiles.length,
    totalPackages: new Set(),
    conflicts: [],
    osSpecific: new Map(),
  }

  for (const file of depFiles) {
    const result = await resolveDependencyFile(file, {
      includeOsSpecific: true,
      maxDepth: 20,
    })

    result.uniquePackages.forEach(pkg => analysis.totalPackages.add(pkg))
    analysis.conflicts.push(...result.conflicts)

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
console.log('Dependency Complexity Analysis:', complexity)
```

### Batch Resolution

```typescript
async function batchResolveDependencies(projectDirs: string[]) {
  const allResults = []

  for (const dir of projectDirs) {
    const depFiles = findDependencyFiles(dir)

    for (const file of depFiles) {
      const result = await resolveDependencyFile(file, {
        maxDepth: 15,
        includeOsSpecific: true,
      })

      allResults.push({
        directory: dir,
        file,
        packages: result.uniquePackages.length,
        conflicts: result.conflicts.length,
      })
    }
  }

  return allResults
}

// Analyze multiple projects
const results = await batchResolveDependencies([
  './project-a',
  './project-b',
  './project-c'
])

console.table(results)
```

## Configuration Options

The dependency resolver supports extensive configuration through the `DependencyResolverOptions` interface:

```typescript
interface DependencyResolverOptions {
  pantryDir?: string // Directory containing pantry files
  packagesDir?: string // Directory containing generated package files
  includeOsSpecific?: boolean // Include OS-specific dependencies
  targetOs?: 'linux' | 'darwin' | 'windows' // Target operating system
  maxDepth?: number // Maximum recursion depth for transitive dependencies
  verbose?: boolean // Enable verbose output
}
```

### Default Values

```typescript
const defaultOptions: DependencyResolverOptions = {
  pantryDir: 'src/pantry',
  packagesDir: 'src/packages',
  includeOsSpecific: false,
  targetOs: undefined,
  maxDepth: 10,
  verbose: false,
}
```

## Error Handling

The dependency resolver includes comprehensive error handling:

```typescript
try {
  const result = await resolveDependencyFile('./deps.yaml')
  console.log(`Successfully resolved ${result.uniquePackages.length} packages`)
}
catch (error) {
  if (error.message.includes('File not found')) {
    console.error('Dependency file not found')
  }
  else if (error.message.includes('Invalid format')) {
    console.error('Invalid dependency file format')
  }
  else if (error.message.includes('Circular dependency')) {
    console.error('Circular dependency detected')
  }
  else {
    console.error('Unknown error:', error.message)
  }
}
```

## Performance Considerations

- **Caching**: The resolver leverages existing package caches for optimal performance
- **Parallel processing**: Multiple dependency files are processed concurrently when possible
- **Depth limiting**: Configure `maxDepth` to prevent excessive recursion in complex dependency trees
- **Selective resolution**: Use OS filtering to reduce unnecessary dependency resolution

## Integration Examples

### CI/CD Pipeline

```bash
#!/bin/bash
# ci-resolve-deps.sh

# Resolve all dependencies and output JSON for further processing
result=$(ts-pkgx resolve-deps --find-files . --json)

# Extract package count
package_count=$(echo "$result" | jq '.uniquePackages | length')

# Check for conflicts
conflicts=$(echo "$result" | jq '.conflicts | length')

echo "Found $package_count unique packages"
if [ "$conflicts" -gt 0 ]; then
  echo "Warning: $conflicts version conflicts resolved"
fi

# Export install command for later use
install_cmd=$(echo "$result" | jq -r '.installCommand // empty')
echo "PKGX_INSTALL_CMD=$install_cmd" >> $GITHUB_ENV
```

### Docker Integration

```dockerfile
# Dockerfile
FROM ubuntu:latest

# Copy dependency files
COPY deps.yaml .

# Install ts-pkgx and resolve dependencies
RUN npm install -g ts-pkgx && \
    deps=$(ts-pkgx resolve-deps deps.yaml --json) && \
    packages=$(echo "$deps" | jq -r '.uniquePackages[]' | tr '\n' ' ') && \
    echo "Installing packages: $packages"

# Use resolved packages in subsequent build steps
```
