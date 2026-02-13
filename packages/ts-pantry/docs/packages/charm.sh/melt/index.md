# melt

> Author, manage, and run multitrack audio/video compositions

## Package Information

- **Domain**: `charm.sh/melt`
- **Name**: `melt`
- **Homepage**: https://www.mltframework.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/melt/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install charm.sh/melt
```

## Programs

This package provides the following executable programs:

- `melt`

## Available Versions

<details>
<summary>Show all 4 versions</summary>

- `0.6.2`, `0.6.1`, `0.6.0`, `0.5.0`

</details>

**Latest Version**: `0.6.2`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +charm.sh/melt@0.6.2 -- $SHELL -i
```

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.melt

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/charm.sh/melt/package.yml)
- [Homepage](https://www.mltframework.org/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
