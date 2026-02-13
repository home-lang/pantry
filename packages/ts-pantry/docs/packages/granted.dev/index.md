# granted

> The easiest way to access your cloud.

## Package Information

- **Domain**: `granted.dev`
- **Name**: `granted`
- **Homepage**: https://granted.dev
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/granted.dev/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install granted.dev
```

## Programs

This package provides the following executable programs:

- `granted`

## Available Versions

<details>
<summary>Show all 38 versions</summary>

- `0.38.0`, `0.37.0`, `0.36.3`, `0.36.2`, `0.36.1`
- `0.36.0`, `0.35.2`, `0.35.1`, `0.35.0`, `0.34.1`
- `0.34.0`, `0.33.0`, `0.32.0`, `0.31.2`, `0.31.1`
- `0.31.0`, `0.30.0`, `0.29.3`, `0.29.2`, `0.29.1`
- `0.29.0`, `0.28.0`, `0.27.5`, `0.27.4`, `0.27.3`
- `0.27.2`, `0.27.1`, `0.27.0`, `0.26.2`, `0.26.1`
- `0.26.0`, `0.25.0`, `0.24.0`, `0.23.2`, `0.23.1`
- `0.23.0`, `0.22.0`, `0.21.1`

</details>

**Latest Version**: `0.38.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +granted.dev@0.38.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.granted

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/granted.dev/package.yml)
- [Homepage](https://granted.dev)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
