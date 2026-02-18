# spacetime

> Multiplayer at the speed of light

## Package Information

- **Domain**: `spacetimedb.com`
- **Name**: `spacetime`
- **Homepage**: https://spacetimedb.com
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/spacetimedb.com/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install spacetimedb.com
```

## Programs

This package provides the following executable programs:

- `spacetime`

## Available Versions

<details>
<summary>Show all 2 versions</summary>

- `2023.12.8`
- `2023.8.12`

</details>

**Latest Version**: `2023.12.8`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +spacetimedb.com@2023.12.8 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.spacetime

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/spacetimedb.com/package.yml)
- [Homepage](https://spacetimedb.com)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
