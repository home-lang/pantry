# just

> Handy way to save and run project-specific commands

## Package Information

- **Domain**: `just.systems`
- **Name**: `just`
- **Homepage**: https://just.systems
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/just.systems/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install just.systems
```

## Programs

This package provides the following executable programs:

- `just`

## Available Versions

<details>
<summary>Show all 52 versions</summary>

- `1.46.0`, `1.45.0`, `1.44.1`, `1.44.0`, `1.43.1`
- `1.43.0`, `1.42.4`, `1.42.3`, `1.42.2`, `1.42.1`
- `1.42.0`, `1.41.0`, `1.40.0`, `1.39.0`, `1.38.0`
- `1.37.0`, `1.36.0`, `1.35.0`, `1.34.0`, `1.33.0`
- `1.32.0`, `1.31.0`, `1.30.1`, `1.30.0`, `1.29.1`
- `1.29.0`, `1.28.0`, `1.27.0`, `1.26.0`, `1.25.2`
- `1.25.1`, `1.25.0`, `1.24.0`, `1.23.0`, `1.22.1`
- `1.22.0`, `1.21.0`, `1.20.0`, `1.19.0`, `1.18.1`
- `1.18.0`, `1.17.0`, `1.16.0`, `1.15.0`, `1.14.0`
- `1.13.0`, `1.12.0`, `1.11.0`, `1.10.0`, `1.9.0`
- `1.8.0`, `1.6.0`

</details>

**Latest Version**: `1.46.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +just.systems@1.46.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.just

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/just.systems/package.yml)
- [Homepage](https://just.systems)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
