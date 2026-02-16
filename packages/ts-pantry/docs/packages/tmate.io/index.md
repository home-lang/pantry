# tmate

> Instant Terminal Sharing

## Package Information

- **Domain**: `tmate.io`
- **Name**: `tmate`
- **Homepage**: <https://tmate.io/>
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/tmate.io/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install tmate.io
```

## Programs

This package provides the following executable programs:

- `tmate`

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.4.0`

</details>

**Latest Version**: `2.4.0`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +tmate.io@2.4.0 -- $SHELL -i
```

## Dependencies

This package depends on:

- `libevent.org^2.0`
- `invisible-island.net/ncurses@6`
- `msgpack.org@6`
- `libssh.org@0`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.tmate

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/tmate.io/package.yml)
- [Homepage](https://tmate.io/)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
