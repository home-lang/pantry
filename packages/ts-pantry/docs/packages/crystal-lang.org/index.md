# crystal

> Fast and statically typed, compiled language with Ruby-like syntax

## Package Information

- **Domain**: `crystal-lang.org`
- **Name**: `crystal`
- **Homepage**: https://crystal-lang.org/
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/crystal-lang.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install crystal-lang.org
```

## Programs

This package provides the following executable programs:

- `crystal`

## Available Versions

<details>
<summary>Show all 26 versions</summary>

- `1.19.1`, `1.19.0`, `1.18.2`, `1.18.1`, `1.18.0`
- `1.17.1`, `1.17.0`, `1.16.3`, `1.16.2`, `1.16.1`
- `1.16.0`, `1.15.1`, `1.15.0`, `1.14.1`, `1.14.0`
- `1.13.3`, `1.13.2`, `1.13.1`, `1.13.0`, `1.12.2`
- `1.12.1`, `1.12.0`, `1.11.2`, `1.11.1`, `1.11.0`
- `1.10.1`

</details>

**Latest Version**: `1.19.1`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +crystal-lang.org@1.19.1 -- $SHELL -i
```

## Dependencies

This package depends on:

- `hboehm.info/gc^8`
- `gnu.org/gmp^6`
- `libevent.org^2`
- `pyyaml.org/libyaml^0`
- `llvm.org<17`
- `openssl.org^1.1`
- `pcre.org/v2^10`
- `freedesktop.org/pkg-config^0`
- `sourceware.org/libffi^3`
- `invisible-island.net/ncurses^6`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.crystal

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/crystal-lang.org/package.yml)
- [Homepage](https://crystal-lang.org/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
