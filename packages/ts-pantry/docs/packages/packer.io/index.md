# packer

> Packer is a tool for creating identical machine images for multiple platforms from a single source configuration.

## Package Information

- **Domain**: `packer.io`
- **Name**: `packer`
- **Homepage**: <https://packer.io>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/packer.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install packer.io
```

## Programs

This package provides the following executable programs:

- `packer`

## Available Versions

<details>
<summary>Show all 18 versions</summary>

- `1.15.0`
- `1.14.3`, `1.14.2`, `1.14.1`, `1.14.0`
- `1.13.1`, `1.13.0`
- `1.12.0`
- `1.11.2`, `1.11.1`, `1.11.0`
- `1.10.3`, `1.10.2`, `1.10.1`
- `1.9.5`, `1.9.4`, `1.9.3`, `1.9.2`

</details>

**Latest Version**: `1.15.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +packer.io@1.15.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.packer

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/packer.io/package.yml)
- [Homepage](https://packer.io)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
