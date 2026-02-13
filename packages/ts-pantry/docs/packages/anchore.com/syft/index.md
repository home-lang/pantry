# syft

> CLI tool and library for generating a Software Bill of Materials from container images and filesystems

## Package Information

- **Domain**: `anchore.com/syft`
- **Name**: `syft`
- **Homepage**: Not specified
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/anchore.com/syft/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install anchore.com/syft
```

## Programs

This package provides the following executable programs:

- `syft`

## Available Versions

<details>
<summary>Show all 57 versions</summary>

- `1.40.1`, `1.40.0`, `1.39.0`, `1.38.2`, `1.38.0`
- `1.37.0`, `1.36.0`, `1.34.2`, `1.34.1`, `1.33.0`
- `1.32.0`, `1.31.0`, `1.30.0`, `1.29.1`, `1.29.0`
- `1.28.0`, `1.27.1`, `1.27.0`, `1.26.1`, `1.26.0`
- `1.25.1`, `1.25.0`, `1.24.0`, `1.23.1`, `1.23.0`
- `1.22.0`, `1.21.0`, `1.20.0`, `1.19.0`, `1.18.1`
- `1.18.0`, `1.17.0`, `1.16.0`, `1.15.0`, `1.14.2`
- `1.14.1`, `1.14.0`, `1.13.0`, `1.12.2`, `1.11.1`
- `1.11.0`, `1.10.0`, `1.9.0`, `1.8.0`, `1.7.0`
- `1.6.0`, `1.5.0`, `1.4.1`, `1.4.0`, `1.3.0`
- `1.2.0`, `1.1.1`, `1.1.0`, `1.0.1`, `1.0.0`
- `0.105.1`, `0.105.0`

</details>

**Latest Version**: `1.40.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +anchore.com/syft@1.40.1 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.syft

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/anchore.com/syft/package.yml)
- [Homepage](#)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
