# pkgx

> Standalone binary that can run anything

## Package Information

- **Domain**: `pkgx.sh`
- **Name**: `pkgx`
- **Homepage**: https://pkgx.sh
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/pkgx.sh/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install pkgx.sh
```

## Programs

This package provides the following executable programs:

- `pkgx`

## Available Versions

<details>
<summary>Show all 36 versions</summary>

- `2.9.0`, `2.7.0`, `2.6.0`, `2.5.0`, `2.4.0`
- `2.3.2`, `2.3.1`, `2.3.0`, `2.2.1`, `2.2.0`
- `2.1.4`, `2.1.3`, `2.1.2`, `2.1.1`, `2.1.0`
- `2.0.0`, `1.5.0`, `1.4.1`, `1.4.0`, `1.3.1`
- `1.3.0`, `1.2.2`, `1.2.1`, `1.2.0`, `1.1.6`
- `1.1.5`, `1.1.4`, `1.1.3`, `1.1.2`, `1.1.1`
- `1.1.0`, `1.0.4`, `1.0.3`, `1.0.2`, `1.0.1`
- `1.0.0`

</details>

**Latest Version**: `2.9.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +pkgx.sh@2.9.0 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.pkgx

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/pkgx.sh/package.yml)
- [Homepage](https://pkgx.sh)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
