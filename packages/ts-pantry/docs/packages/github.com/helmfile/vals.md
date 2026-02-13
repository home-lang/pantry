# vals

> Helm-like configuration values loader with support for various sources

## Package Information

- **Domain**: `github.com/helmfile/vals`
- **Name**: `vals`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/helmfile/vals/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install github.com/helmfile/vals
```

## Programs

This package provides the following executable programs:

- `vals`

## Available Versions

<details>
<summary>Show all 42 versions</summary>

- `0.43.1`, `0.43.0`, `0.42.6`, `0.42.5`, `0.42.4`
- `0.42.3`, `0.42.2`, `0.42.1`, `0.42.0`, `0.41.3`
- `0.41.2`, `0.41.1`, `0.41.0`, `0.40.1`, `0.40.0`
- `0.39.4`, `0.39.3`, `0.39.2`, `0.39.1`, `0.39.0`
- `0.38.0`, `0.37.8`, `0.37.7`, `0.37.6`, `0.37.5`
- `0.37.4`, `0.37.3`, `0.37.2`, `0.37.1`, `0.37.0`
- `0.36.0`, `0.35.0`, `0.34.1`, `0.34.0`, `0.33.1`
- `0.33.0`, `0.32.0`, `0.31.0`, `0.30.0`, `0.29.0`
- `0.28.1`, `0.28.0`

</details>

**Latest Version**: `0.43.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +github.com/helmfile/vals@0.43.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.vals

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/github.com/helmfile/vals/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
