# cabal

> Official upstream development repository for Cabal and cabal-install

## Package Information

- **Domain**: `haskell.org/cabal`
- **Name**: `cabal`
- **Homepage**: https://www.haskell.org/cabal/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/haskell.org/cabal/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install haskell.org/cabal
```

## Programs

This package provides the following executable programs:

- `cabal`

## Available Versions

<details>
<summary>Show all 7 versions</summary>

- `3.8.1`, `3.14.2.0`, `3.14.1.1`, `3.14.1.0`, `3.12.1.0`
- `3.10.3.0`, `3.10.1`

</details>

**Latest Version**: `3.8.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +haskell.org/cabal@3.8.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `haskell.org@9`
- `gnu.org/gmp@6`
- `zlib.net@1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.cabal

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/haskell.org/cabal/package.yml)
- [Homepage](https://www.haskell.org/cabal/)
- [Back to Package Catalog](../../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
