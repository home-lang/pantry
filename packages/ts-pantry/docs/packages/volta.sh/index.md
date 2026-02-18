# volta

> JavaScript toolchain manager for reproducible environments

## Package Information

- **Domain**: `volta.sh`
- **Name**: `volta`
- **Homepage**: https://volta.sh
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/volta.sh/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install volta.sh
```

## Programs

This package provides the following executable programs:

- `volta`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `2.0.2`, `2.0.1`, `2.0.0`
- `1.1.1`

</details>

**Latest Version**: `2.0.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +volta.sh@2.0.2 -- $SHELL -i
```

## Dependencies

This package depends on:

- `linux:curl.se/ca-certs`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.volta

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/volta.sh/package.yml)
- [Homepage](https://volta.sh)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
