# libevent

> Event notification library

## Package Information

- **Domain**: `libevent.org`
- **Name**: `libevent`
- **Homepage**: https://libevent.org
- **Source**: [View on GitHub](https://github.com/pkgxdev/pantry/tree/main/projects/libevent.org/package.yml)

## Installation

```bash
# Install with launchpad
launchpad install libevent.org
```

## Programs

This package provides the following executable programs:

*No programs specified*

## Available Versions

<details>
<summary>Show all 1 versions</summary>

- `2.1.12`

</details>

**Latest Version**: `2.1.12`

### Install Specific Version

```bash
# Install specific version
sh <(curl https://pkgx.sh) +libevent.org@2.1.12 -- $SHELL -i
```

## Dependencies

This package depends on:

- `openssl.org^1.1`

## Usage Examples

```typescript
import { pantry } from 'ts-pkgx'

// Access this package
const pkg = pantry.libevent

console.log(`Package: ${pkg.name}`)
console.log(`Description: ${pkg.description}`)
console.log(`Programs: ${pkg.programs.join(', ')}`)
```

## Links

- [Package Source](https://github.com/pkgxdev/pantry/tree/main/projects/libevent.org/package.yml)
- [Homepage](https://libevent.org)
- [Back to Package Catalog](../../package-catalog.md)

---

*This documentation was auto-generated from package data.*
