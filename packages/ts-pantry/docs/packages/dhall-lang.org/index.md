# dhall

> Interpreter for the Dhall language

## Package Information

- **Domain**: `dhall-lang.org`
- **Name**: `dhall`
- **Homepage**: <https://dhall-lang.org/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/dhall-lang.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install dhall-lang.org
```

## Programs

This package provides the following executable programs:

- `dhall`

## Available Versions

<details>
<summary>Show all 3 versions</summary>

- `1.42.3`, `1.42.2`, `1.42.1`

</details>

**Latest Version**: `1.42.3`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +dhall-lang.org@1.42.3 -- $SHELL -i
```

## Dependencies

This package depends on:

- `invisible-island.net/ncurses^6.4`
- `zlib.net^1.3`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.dhall

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/dhall-lang.org/package.yml)
- [Homepage](https://dhall-lang.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

> Auto-generated from package data.
