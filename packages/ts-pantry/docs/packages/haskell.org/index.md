# haskell

> Mirror of the Glasgow Haskell Compiler. Please submit issues and patches to GHC's Gitlab instance (https://gitlab.haskell.org/ghc/ghc). First time contributors are encouraged to get started with the newcomers info (https://gitlab.haskell.org/ghc/ghc/wikis/contributing).

## Package Information

- **Domain**: `haskell.org`
- **Name**: `haskell`
- **Homepage**: http://www.haskell.org/ghc/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/haskell.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install haskell.org
```

## Programs

This package provides the following executable programs:

- `ghc`
- `ghc-9.14`
- `ghc-9.14.1`
- `ghc-pkg`
- `ghc-pkg-9.14`
- `ghc-pkg-9.14.1`
- `ghci`
- `ghci-9.14`
- `ghci-9.14.1`
- `ghcup`
- `haddock`
- `haddock-9.14`
- `haddock-9.14.1`
- `hp2ps`
- `hp2ps-9.14`
- `hp2ps-9.14.1`
- `hpc`
- `hpc-9.14`
- `hpc-9.14.1`
- `hsc2hs`
- `hsc2hs-9.14`
- `hsc2hs-9.14.1`
- `runghc`
- `runghc-9.14`
- `runghc-9.14.1`
- `runhaskell`
- `runhaskell-9.14`
- `runhaskell-9.14.1`

## Available Versions

<details>
<summary>Show all 21 versions</summary>

- `9.14.1`, `9.12.2`, `9.12.1`, `9.10.3`, `9.10.2`
- `9.10.1`, `9.8.4`, `9.8.2`, `9.8.1`, `9.6.7`
- `9.6.6`, `9.6.5`, `9.6.4`, `9.6.3`, `9.6.2`
- `9.4.8`, `9.4.7`, `9.4.4`, `9.2.8`, `9.0.2`
- `8.10.7`

</details>

**Latest Version**: `9.14.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +haskell.org@9.14.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `gnu.org/gmp@6`
- `invisible-island.net/ncurses@6`
- `sourceware.org/libffi@3`
- `linux:github.com/numactl/numactl^2`
- `linux:gnu.org/gcc`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.haskell

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/haskell.org/package.yml)
- [Homepage](http://www.haskell.org/ghc/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
