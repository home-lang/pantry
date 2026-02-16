# nixpacks

> App source + Nix packages + Docker = Image

## Package Information

- **Domain**: `nixpacks.com`
- **Name**: `nixpacks`
- **Homepage**: https://nixpacks.com/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/nixpacks.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install nixpacks.com
```

## Programs

This package provides the following executable programs:

- `nixpacks`

## Available Versions

<details>
<summary>Show all 35 versions</summary>

- `1.41.0`, `1.40.0`, `1.39.0`, `1.38.0`, `1.37.0`
- `1.36.0`, `1.35.0`, `1.34.1`, `1.34.0`, `1.33.0`
- `1.32.0`, `1.31.0`, `1.30.0`, `1.29.1`, `1.29.0`
- `1.28.1`, `1.28.0`, `1.27.1`, `1.27.0`, `1.26.1`
- `1.26.0`, `1.25.0`, `1.24.6`, `1.24.5`, `1.24.4`
- `1.24.3`, `1.24.2`, `1.24.1`, `1.24.0`, `1.23.0`
- `1.22.0`, `1.21.3`, `1.21.2`, `1.21.1`, `1.21.0`

</details>

**Latest Version**: `1.41.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +nixpacks.com@1.41.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.nixpacks

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/nixpacks.com/package.yml)
- [Homepage](https://nixpacks.com/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
